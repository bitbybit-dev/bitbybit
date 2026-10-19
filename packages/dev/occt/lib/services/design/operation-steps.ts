import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Models from "../../api/models";
import { callByPath, InputError, isRecord, resolveInputs, validateInputs } from "@bitbybit-dev/base";
import { occtDtoRegistry } from "../../api/dto-registry";
import { occtDtoRules } from "../../api/validation";
import { isShape } from "../base/input-checks";
import type { DesignOutcome } from "./cache";
import { release, releasedOnError } from "../base/release";
import type { FaceNames, NamedSource } from "./names";
import { carryNames, give, nameOf } from "./names";
import type { DesignPlan, DesignRun } from "./state";
import { bodyKey } from "./state";
import { operationPathOf } from "./format";
import { DesignProblem, pointer, problemsAt } from "./problems";
import { hasOnlyKey, valueOf } from "./values";
import { bodyOf, faceCount } from "./helpers";
import type { BodyValue, UncheckedExpression } from "./steps-types";

function isBodyValue(value: unknown): value is BodyValue {
    return hasOnlyKey(value, "body") && typeof value["body"] === "string";
}

function isExpressionValue(value: unknown): value is UncheckedExpression {
    return hasOnlyKey(value, "expr");
}

function bodiesIn(value: unknown): string[] {
    if (isBodyValue(value)) {
        return [value.body];
    }
    if (Array.isArray(value)) {
        return value.flatMap(bodiesIn);
    }
    return isRecord(value) ? Object.values(value).flatMap(bodiesIn) : [];
}

function substituted(value: unknown, path: string, run: DesignRun, shapes: TopoDS_Shape[]): unknown {
    if (isBodyValue(value)) {
        const shape = bodyOf(value.body, run).shape;
        shapes.push(shape);
        return shape;
    }
    if (isExpressionValue(value)) {
        return valueOf(value.expr, run.parameters, pointer(path, "expr"));
    }
    if (Array.isArray(value)) {
        return value.map((inner, index) => substituted(inner, pointer(path, index), run, shapes));
    }
    if (isRecord(value)) {
        return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, substituted(inner, pointer(path, key), run, shapes)]));
    }
    return value;
}

function releaseShapesIn(value: unknown, keep: readonly TopoDS_Shape[]): void {
    if (isShape(value)) {
        if (!keep.includes(value)) {
            release(value);
        }
    } else if (Array.isArray(value)) {
        value.forEach(inner => releaseShapesIn(inner, keep));
    } else if (isRecord(value)) {
        Object.values(value).forEach(inner => releaseShapesIn(inner, keep));
    }
}

function madeShape(result: unknown, inputs: readonly TopoDS_Shape[], run: DesignRun): TopoDS_Shape | undefined {
    if (isShape(result)) {
        return inputs.includes(result) ? result.clone() : result;
    }
    if (!Array.isArray(result) || result.length === 0 || !result.every(isShape)) {
        return undefined;
    }
    const compound = run.occt.shapes.compound.makeCompound({ shapes: result });
    result.forEach(item => {
        if (!inputs.includes(item)) {
            release(item);
        }
    });
    return compound;
}

const EDGE_FACE_ROLES: readonly (readonly [string, string])[] = [["fillets.fillet", "round"], ["fillets.chamfer", "bevel"]];

function edgeFaceRoleOf(operation: string): string {
    return EDGE_FACE_ROLES.find(([prefix]) => operation.startsWith(prefix))?.[1] ?? "side";
}

const ANSWERS_WITH_ITS_INPUT: ReadonlySet<string> = new Set([
    "operations.offset", "operations.offsetAdv",
    "shapeFix.basicShapeRepair", "shapeFix.orientClosedSolid",
    "shapes.shape.purgeInternalEdges", "shapes.edge.removeInternalEdges",
    "shapes.face.reversedFace", "shapes.face.getFace",
    "parts.mechanical.machining.flat", "parts.mechanical.machining.keyway", "parts.mechanical.machining.knurl", "parts.mechanical.machining.ringGroove",
]);

const FACE_KEEPING: ReadonlySet<string> = new Set([
    "transforms.transform", "transforms.rotate", "transforms.rotateAroundCenter", "transforms.rotateByQuaternion",
    "transforms.align", "transforms.alignNormAndAxis", "transforms.alignAndTranslate", "transforms.orient",
    "transforms.translate", "transforms.scale", "transforms.scale3d", "transforms.scaleFromCenter",
    "transforms.mirror", "transforms.mirrorAlongNormal", "transforms.mirrorAboutPoint", "transforms.transformByMatrix",
]);

function namesOfBody(given: unknown, shape: TopoDS_Shape, run: DesignRun): FaceNames | undefined {
    if (!isShape(given)) {
        return undefined;
    }
    const names = [...run.bodies.values()].find(body => body.shape === given)?.names;
    return names !== undefined && names.length === faceCount(shape, run) ? names.map(list => [...list]) : undefined;
}

function keptNames(operation: string, inputs: unknown, shape: TopoDS_Shape, run: DesignRun): FaceNames | undefined {
    return FACE_KEEPING.has(operation) && isRecord(inputs) ? namesOfBody(inputs["shape"], shape, run) : undefined;
}

function returnedNames(operation: string, result: unknown, inputs: readonly TopoDS_Shape[], shape: TopoDS_Shape, run: DesignRun): FaceNames | undefined {
    const answersWithItsInput = ANSWERS_WITH_ITS_INPUT.has(operation);
    const given = isShape(result) ? inputs.find(input => input === result || (answersWithItsInput && input.IsSame(result))) : undefined;
    return given === undefined ? undefined : namesOfBody(given, shape, run);
}

function isRoled(result: unknown): result is Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
    return isRecord(result) && isShape(result["shape"]) && isRecord(result["roles"]);
}

function operatedWithRoles(feature: Models.OCCT.DesignOperationFeature, operation: string, inputs: unknown, shapes: readonly TopoDS_Shape[], at: string, run: DesignRun): DesignOutcome | undefined {
    const twin = `${operation}WithRoles`;
    if (occtDtoRegistry[twin] === undefined) {
        return undefined;
    }
    const result: unknown = problemsAt(at, () => callByPath(run.occt, twin, inputs));
    if (!isRoled(result)) {
        releaseShapesIn(result, shapes);
        return undefined;
    }
    const shape = shapes.includes(result.shape) ? result.shape.clone() : result.shape;
    const names: FaceNames = releasedOnError([shape], () => Array.from({ length: faceCount(shape, run) }, () => [nameOf(feature.id, "face")]));
    Object.entries(result.roles).forEach(([role, faces]) => faces.filter(face => face >= 0 && face < names.length).forEach(face => {
        names[face] = [nameOf(feature.id, role)];
    }));
    return { kind: "body", shape, names };
}

function isHistoried(result: unknown): result is Models.OCCT.ShapeWithHistory<TopoDS_Shape> | Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
    return isRecord(result) && isShape(result["shape"]) && (isRecord(result["history"]) || Array.isArray(result["histories"]));
}

function operatedWithHistory(feature: Models.OCCT.DesignOperationFeature, operation: string, inputs: unknown, shapes: readonly TopoDS_Shape[], run: DesignRun): DesignOutcome | undefined {
    const twin = `${operation}WithHistory`;
    if (shapes.length === 0 || occtDtoRegistry[twin] === undefined || !isRecord(inputs)) {
        return undefined;
    }
    const result = refusedOrResult(() => callByPath(run.occt, twin, inputs));
    if (result === undefined) {
        return undefined;
    }
    if (!isHistoried(result)) {
        releaseShapesIn(result, shapes);
        return undefined;
    }
    const histories = "histories" in result ? result.histories : [result.history];
    const single = [inputs["shape"]].filter(isShape);
    const listed = (Array.isArray(inputs["shapes"]) ? inputs["shapes"] : []).filter(isShape);
    const given = histories.length === single.length + listed.length ? [...single, ...listed] : histories.length === listed.length ? listed : single;
    const named = new Map([...run.bodies.values()].map(body => [body.shape, body.names] as const));
    const sources: NamedSource[] = [];
    given.forEach((shape, index) => {
        const history = histories[index];
        const names = named.get(shape);
        if (history !== undefined && names !== undefined) {
            sources.push({ names, history });
        }
    });
    const made = new Map<number, string[]>();
    const edgeFaceRole = edgeFaceRoleOf(operation);
    histories.forEach(history => {
        history.facesFromEdges.forEach(faces => give(made, faces, nameOf(feature.id, edgeFaceRole)));
        give(made, history.firstFaces, nameOf(feature.id, "start"));
        give(made, history.lastFaces, nameOf(feature.id, "end"));
    });
    const shape = shapes.includes(result.shape) ? result.shape.clone() : result.shape;
    return { kind: "body", shape, names: releasedOnError([shape], () => carryNames(faceCount(shape, run), sources, made, nameOf(feature.id, "face"))) };
}

function refusedOrResult(call: () => unknown): unknown {
    try {
        return call();
    } catch (thrown) {
        if (thrown instanceof InputError) {
            return undefined;
        }
        throw thrown;
    }
}

function withBooleanInputs(params: Readonly<Record<string, unknown>>, inputs: unknown, operation: string): unknown {
    const constraints = occtDtoRegistry[operation]?.constraints;
    if (constraints === undefined || !isRecord(inputs)) {
        return inputs;
    }
    return Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key, constraints[key]?.kind === "boolean" && isExpressionValue(params[key]) && typeof value === "number" ? value !== 0 : value]));
}

function operated(feature: Models.OCCT.DesignOperationFeature, path: string, run: DesignRun): DesignOutcome {
    const shapes: TopoDS_Shape[] = [];
    const at = pointer(path, "params");
    const operation = operationPathOf(feature.operation)!;
    const inputs = withBooleanInputs(feature.params, substituted(feature.params, at, run, shapes), operation);
    const issue = validateInputs(occtDtoRegistry, operation, resolveInputs(occtDtoRegistry, operation, inputs), occtDtoRules)[0];
    if (issue !== undefined) {
        throw new DesignProblem(pointer(at, issue.property), issue.message);
    }
    const roled = operatedWithRoles(feature, operation, inputs, shapes, at, run);
    if (roled !== undefined) {
        return roled;
    }
    const historied = operatedWithHistory(feature, operation, inputs, shapes, run);
    if (historied !== undefined) {
        return historied;
    }
    const result = problemsAt(at, () => callByPath(run.occt, operation, inputs));
    const shape = madeShape(result, shapes, run);
    if (shape === undefined) {
        releaseShapesIn(result, shapes);
        throw new DesignProblem(pointer(path, "operation"), `${feature.operation} makes neither a shape nor a list of shapes`);
    }
    const names = releasedOnError([shape], () => keptNames(operation, inputs, shape, run) ?? returnedNames(operation, result, shapes, shape, run) ?? Array.from({ length: faceCount(shape, run) }, () => [nameOf(feature.id, "face")]));
    return { kind: "body", shape, names };
}

/** Runs an operation of the package by its dotted path, with bodies and expressions in its inputs. */
export function operationPlan(feature: Models.OCCT.DesignOperationFeature, path: string, run: DesignRun): DesignPlan {
    return {
        reads: [...new Set(bodiesIn(feature.params))].map(bodyKey),
        make: () => operated(feature, path, run),
    };
}
