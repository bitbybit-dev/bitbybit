import { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";
import { callByPath, resolveInputs, validateInputs } from "@bitbybit-dev/base";
import { occtDtoRegistry } from "../../api/dto-registry";
import { occtDtoRules } from "../../api/validation";
import { isShape } from "../base/input-checks";
import { DesignOutcome, release, releasedOnError } from "./cache";
import { FaceNames, NamedSource, carryNames, copyNames, give, nameOf } from "./names";
import { resolveEdges } from "./references";
import { BodyState, DesignPlan, DesignRun, SketchState, bodyKey, sketchKey } from "./state";
import { operationPathOf } from "./format";
import { DesignProblem, pointer } from "./problems";
import { DesignValues, MAX_PATTERN_COUNT, countOf, directionOf, numberOf, pointOf } from "./values";
import { ProfileHistory, Vector, bodyOf, contextOf, cross, faceCount, faceFrame, inPlane, ownerOf, profileNames, scaled, unit } from "./helpers";
import { isRecord } from "./structure";
import { rigidMotion } from "./motion";

type Join = Models.OCCT.DesignJoin;

function evaluatedIn(value: unknown, path: string, parameters: DesignValues): unknown {
    if (typeof value === "number" || typeof value === "string") {
        return numberOf(value, parameters, path);
    }
    if (Array.isArray(value)) {
        return value.map((inner, index) => evaluatedIn(inner, pointer(path, index), parameters));
    }
    if (isRecord(value)) {
        return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, evaluatedIn(inner, pointer(path, key), parameters)]));
    }
    return value;
}

function commandOf(command: Models.OCCT.DesignPenCommand, path: string, parameters: DesignValues): Models.OCCT.SketchCommand {
    const { type, id, ...rest } = command;
    return { type, ...(id === undefined ? {} : { id }), ...(evaluatedIn(rest, path, parameters) as Record<string, unknown>) } as Models.OCCT.SketchCommand;
}

const PLANES: Record<"XY" | "XZ" | "YZ", { normal: Vector; direction: Vector }> = {
    XY: { normal: [0, 0, 1], direction: [1, 0, 0] },
    XZ: { normal: [0, 1, 0], direction: [1, 0, 0] },
    YZ: { normal: [1, 0, 0], direction: [0, 1, 0] },
};

function frameOf(on: Models.OCCT.DesignSketchPlacement, host: string | undefined, path: string, run: DesignRun): Inputs.Base.Frame {
    if ("plane" in on) {
        const offset = on.offset === undefined ? 0 : numberOf(on.offset, run.parameters, pointer(path, "offset"));
        const plane = PLANES[on.plane];
        return { origin: scaled(plane.normal, offset), normal: plane.normal, direction: plane.direction };
    }
    if ("frame" in on) {
        const framePath = pointer(path, "frame");
        return {
            origin: pointOf(on.frame.origin, run.parameters, pointer(framePath, "origin")),
            normal: directionOf(on.frame.normal, run.parameters, pointer(framePath, "normal")),
            direction: directionOf(on.frame.direction, run.parameters, pointer(framePath, "direction")),
        };
    }
    return faceFrame(on.face, on.origin, on.direction, bodyOf(host!, run), path, "face", run);
}

type Loop = Models.OCCT.DesignLoop;

function isCircle(command: Models.OCCT.DesignPenCommand): command is Models.OCCT.DesignCircleCommand {
    return command.type === "circle";
}

/** One loop drawn as a wire, with the edges each of its commands drew, numbered on the wire. */
function drawnLoop(loop: Loop, frame: Inputs.Base.Frame, path: string, run: DesignRun): { wire: TopoDS_Shape; segments: { command: number; edges: number[] }[] } {
    const first = loop.pen[0]!;
    if (isCircle(first)) {
        const at = pointer(path, "pen", 0);
        const radius = numberOf(first.radius, run.parameters, pointer(at, "radius"));
        if (!(radius > 0)) {
            throw new DesignProblem(pointer(at, "radius"), "a circle's radius is more than 0");
        }
        const normal = unit(frame.normal);
        const across = inPlane(unit(frame.direction), normal);
        if (across === undefined) {
            throw new DesignProblem(path, "the sketch's direction runs along its normal");
        }
        const up = cross(normal, across);
        const x = numberOf(first.centre[0], run.parameters, pointer(at, "centre", 0));
        const y = numberOf(first.centre[1], run.parameters, pointer(at, "centre", 1));
        const center: Vector = [0, 1, 2].map(axis => frame.origin[axis]! + x * across[axis]! + y * up[axis]!) as Vector;
        return { wire: run.occt.shapes.wire.createCircleWire({ radius, center, direction: normal }), segments: [{ command: 0, edges: [0] }] };
    }
    const commands = loop.pen.map((command, index) => commandOf(command, pointer(path, "pen", index), run.parameters));
    const start: Inputs.Base.Point2 | undefined = loop.start === undefined ? undefined : [numberOf(loop.start[0], run.parameters, pointer(path, "start", 0)), numberOf(loop.start[1], run.parameters, pointer(path, "start", 1))];
    const drawn = run.occt.sketch.penWithSegments({ commands, start, frame, makeFace: false });
    return { wire: drawn.shape, segments: drawn.segments };
}

/** Whether a wire, made into a face, faces along `normal`: it runs anticlockwise seen from the normal's tip. */
function anticlockwise(wire: TopoDS_Shape, normal: Vector, run: DesignRun): boolean {
    const face = run.occt.shapes.face.createFaceFromWire({ shape: wire, planar: true });
    try {
        const facing = run.occt.analysis.signatures({ shape: face }).faces[0]!.normal;
        return facing[0] * normal[0] + facing[1] * normal[1] + facing[2] * normal[2] > 0;
    } finally {
        release(face);
    }
}

/**
 * Draws a sketch of loops, or of a circle, as one face: the first loop turned anticlockwise about the
 * sketch's normal and the others clockwise, so they are its holes; each face edge remembers the
 * command that drew it. A sketch left open is its one loop's wire.
 */
function loopsSketch(feature: Models.OCCT.DesignSketchFeature, loops: readonly Loop[], frame: Inputs.Base.Frame, path: string, run: DesignRun): DesignOutcome {
    const normal = unit(frame.normal);
    const pathOf = (index: number): string => feature.loops === undefined ? path : pointer(path, "loops", index);
    const drawn: ReturnType<typeof drawnLoop>[] = [];
    const owned: TopoDS_Shape[] = [];
    try {
        loops.forEach((loop, index) => {
            const made = drawnLoop(loop, frame, pathOf(index), run);
            drawn.push(made);
            owned.push(made.wire);
        });
        const nameOfCommand = (loop: number, command: number): string | undefined => {
            const id = loops[loop]!.pen[command]?.id;
            return id === undefined || id === "" ? undefined : `${feature.id}.${id}`;
        };
        if (feature.face === false) {
            const wire = drawn[0]!.wire;
            owned.splice(0, 1);
            const commands: (string | undefined)[] = [];
            drawn[0]!.segments.forEach(segment => segment.edges.forEach(edge => {
                commands[edge] = nameOfCommand(0, segment.command);
            }));
            return { kind: "sketch", shape: wire, commands, normal, frame };
        }
        const oriented = drawn.map((loop, index) => {
            if (anticlockwise(loop.wire, normal, run) === (index === 0)) {
                return loop.wire;
            }
            const reversed = run.occt.shapes.wire.reversedWire({ shape: loop.wire });
            owned.push(reversed);
            return reversed;
        });
        const face = run.occt.shapes.face.createFaceFromWires({ shapes: oriented, planar: true });
        if (!run.occt.shapeFix.isValid({ shape: face })) {
            release(face);
            throw new DesignProblem(pointer(path, "loops"), "the loops make no valid face: they cross, or a hole lies outside the first loop");
        }
        const faceEdges = run.occt.shapes.edge.getEdges({ shape: face });
        owned.push(...faceEdges);
        const commands: (string | undefined)[] = faceEdges.map(() => undefined);
        drawn.forEach((loop, index) => {
            const wireEdges = run.occt.shapes.edge.getEdges({ shape: loop.wire });
            owned.push(...wireEdges);
            loop.segments.forEach(segment => segment.edges.forEach(edge => {
                const found = faceEdges.findIndex(faceEdge => faceEdge.IsSame(wireEdges[edge]!));
                if (found >= 0) {
                    commands[found] = nameOfCommand(index, segment.command);
                }
            }));
        });
        return { kind: "sketch", shape: face, commands, normal, frame };
    } finally {
        owned.forEach(release);
    }
}

/** Draws a sketch on its plane, frame or face; its edges remember the command that drew each. */
export function sketchPlan(feature: Models.OCCT.DesignSketchFeature, path: string, run: DesignRun): DesignPlan {
    const on = feature.on;
    const host = "face" in on ? ownerOf(on.face.of, pointer(path, "on", "face", "of"), run) : undefined;
    const pen = feature.pen ?? [];
    return {
        reads: host === undefined ? [] : [bodyKey(host)],
        make: () => {
            const frame = frameOf(on, host, pointer(path, "on"), run);
            run.trace?.set(path, { frame });
            if (feature.loops === undefined && pen.length === 0) {
                run.trace?.set(path, { frame, face: false });
                return { kind: "sketch", shape: run.occt.shapes.compound.makeCompound({ shapes: [] }), commands: [], normal: unit(frame.normal), frame };
            }
            if (feature.loops !== undefined || pen.some(isCircle)) {
                run.trace?.set(path, { frame, face: feature.face !== false });
                return loopsSketch(feature, feature.loops ?? [{ ...(feature.start === undefined ? {} : { start: feature.start }), pen }], frame, path, run);
            }
            const commands = pen.map((command, index) => commandOf(command, pointer(path, "pen", index), run.parameters));
            const start: Inputs.Base.Point2 | undefined = feature.start === undefined
                ? undefined
                : [numberOf(feature.start[0], run.parameters, pointer(path, "start", 0)), numberOf(feature.start[1], run.parameters, pointer(path, "start", 1))];
            const outline = run.occt.sketch.penWithSegments({ commands, start, frame, makeFace: false });
            const face = feature.face !== false && run.occt.shapes.wire.isWireClosed({ shape: outline.shape });
            const drawn = face ? run.occt.sketch.penWithSegments({ commands, start, frame, makeFace: true }) : outline;
            if (face) {
                release(outline.shape);
            }
            run.trace?.set(path, { frame, face });
            const byEdge: (string | undefined)[] = Array.from({ length: Math.max(0, ...drawn.segments.flatMap(segment => segment.edges.map(edge => edge + 1))) }, () => undefined);
            drawn.segments.forEach(segment => {
                const id = pen[segment.command]?.id;
                segment.edges.forEach(edge => {
                    byEdge[edge] = id === undefined || id === "" ? undefined : `${feature.id}.${id}`;
                });
            });
            return { kind: "sketch", shape: drawn.shape, commands: byEdge, normal: unit(frame.normal), frame };
        },
    };
}

function sweptNames(feature: string, shape: TopoDS_Shape, history: Models.OCCT.ShapeHistory, commands: readonly (string | undefined)[], run: DesignRun): FaceNames {
    return carryNames(faceCount(shape, run), [], profileNames(feature, [{ history, commands }]));
}

function outlineOf(sketch: SketchState, run: DesignRun): { wire: TopoDS_Shape; owned: boolean } {
    if (run.occ.CountSubShapes(sketch.shape, run.occ.TopAbs_ShapeEnum.FACE, false) === 0) {
        return { wire: sketch.shape, owned: false };
    }
    return { wire: run.occt.shapes.wire.getWire({ shape: sketch.shape, index: 0 }), owned: true };
}

export function withOutlines<T>(sketches: SketchState[], run: DesignRun, use: (wires: TopoDS_Shape[]) => T): T {
    const outlines = sketches.map(sketch => outlineOf(sketch, run));
    try {
        return use(outlines.map(outline => outline.wire));
    } finally {
        outlines.filter(outline => outline.owned).forEach(outline => release(outline.wire));
    }
}

export function combined(join: Join, shape: TopoDS_Shape, tools: TopoDS_Shape[], run: DesignRun): Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
    switch (join) {
        case "cut":
            return run.occt.booleans.differenceWithHistory({ shape, shapes: tools });
        case "intersect":
            return run.occt.booleans.intersectionWithHistory({ shapes: [shape, ...tools] });
        default:
            return run.occt.booleans.unionWithHistory({ shapes: [shape, ...tools] });
    }
}

type Sweeping = Models.OCCT.DesignExtrudeFeature | Models.OCCT.DesignRevolveFeature | Models.OCCT.DesignSweepFeature | Models.OCCT.DesignLoftFeature;

function joined(feature: Sweeping, tool: TopoDS_Shape, toolNames: FaceNames, run: DesignRun): DesignOutcome {
    if (feature.body === undefined) {
        return { kind: "body", shape: tool, names: toolNames };
    }
    const body = bodyOf(feature.body, run);
    try {
        const result = combined(feature.join ?? "add", body.shape, [tool], run);
        const sources: NamedSource[] = [{ names: body.names, history: result.histories[0]! }, { names: toolNames, history: result.histories[1]! }];
        return releasedOnError(result.shape, () => ({ kind: "body", shape: result.shape, names: carryNames(faceCount(result.shape, run), sources, new Map()) }));
    } finally {
        release(tool);
    }
}

function extruded(feature: Models.OCCT.DesignExtrudeFeature, path: string, run: DesignRun): DesignOutcome {
    const sketch = run.sketches.get(feature.profile)!;
    const distance = numberOf(feature.distance, run.parameters, pointer(path, "distance"));
    if (distance === 0) {
        throw new DesignProblem(pointer(path, "distance"), "the distance is 0");
    }
    const along = feature.direction === undefined ? sketch.normal : unit(directionOf(feature.direction, run.parameters, pointer(path, "direction")));
    const made = run.occt.operations.extrudeWithHistory({ shape: sketch.shape, direction: scaled(along, distance) });
    const names = releasedOnError(made.shape, () => sweptNames(feature.id, made.shape, made.history, sketch.commands, run));
    return joined(feature, made.shape, names, run);
}

function revolved(feature: Models.OCCT.DesignRevolveFeature, path: string, run: DesignRun): DesignOutcome {
    const sketch = run.sketches.get(feature.profile)!;
    const origin = pointOf(feature.axis.origin, run.parameters, pointer(path, "axis", "origin"));
    const direction = directionOf(feature.axis.direction, run.parameters, pointer(path, "axis", "direction"));
    const angle = feature.angle === undefined ? 360 : numberOf(feature.angle, run.parameters, pointer(path, "angle"));
    if (angle === 0 || Math.abs(angle) > 360) {
        throw new DesignProblem(pointer(path, "angle"), `the angle is not 0 and at most 360 either way, not ${angle}`);
    }
    const atOrigin = origin.every(coordinate => coordinate === 0);
    const moved = atOrigin ? sketch.shape : run.occt.transforms.translate({ shape: sketch.shape, translation: scaled(origin, -1) });
    try {
        const made = run.occt.operations.revolveWithHistory({ shape: moved, angle, direction, copy: false });
        let shape = made.shape;
        if (!atOrigin) {
            try {
                shape = run.occt.transforms.translate({ shape: made.shape, translation: origin });
            } finally {
                release(made.shape);
            }
        }
        const names = releasedOnError(shape, () => sweptNames(feature.id, shape, made.history, sketch.commands, run));
        return joined(feature, shape, names, run);
    } finally {
        if (!atOrigin) {
            release(moved);
        }
    }
}

function swept(feature: Models.OCCT.DesignSweepFeature, run: DesignRun): DesignOutcome {
    const profile = run.sketches.get(feature.profile)!;
    const path = run.sketches.get(feature.path)!;
    const made = withOutlines([path, profile], run, ([spine, outline]) => run.occt.operations.pipeWithHistory({ shape: spine!, shapes: [outline!] }));
    const names = carryNames(faceCount(made.shape, run), [], profileNames(feature.id, [{ history: made.histories[0]!, commands: profile.commands }]));
    return joined(feature, made.shape, names, run);
}

function lofted(feature: Models.OCCT.DesignLoftFeature, run: DesignRun): DesignOutcome {
    const profiles = feature.profiles.map(id => run.sketches.get(id)!);
    const made = withOutlines(profiles, run, wires => run.occt.operations.loftWithHistory({ shapes: wires, makeSolid: feature.solid !== false }));
    const histories = profiles.map((profile, index): ProfileHistory => ({ history: made.histories[index]!, commands: profile.commands }));
    return joined(feature, made.shape, carryNames(faceCount(made.shape, run), [], profileNames(feature.id, histories)), run);
}

function sweepReads(feature: Sweeping): string[] {
    const sketches = feature.type === "loft" ? feature.profiles : feature.type === "sweep" ? [feature.profile, feature.path] : [feature.profile];
    return [...new Set(sketches)].map(sketchKey).concat(feature.body === undefined ? [] : [bodyKey(feature.body)]);
}

/** Extrudes, revolves, sweeps or lofts sketches into a new body, or into the body it names. */
export function sweepPlan(feature: Sweeping, path: string, run: DesignRun): DesignPlan {
    return {
        reads: sweepReads(feature),
        make: () => {
            switch (feature.type) {
                case "extrude":
                    return extruded(feature, path, run);
                case "revolve":
                    return revolved(feature, path, run);
                case "sweep":
                    return swept(feature, run);
                default:
                    return lofted(feature, run);
            }
        },
    };
}

function booleaned(feature: Models.OCCT.DesignBooleanFeature, run: DesignRun): DesignOutcome {
    const items = [feature.body, ...feature.tools].map(name => bodyOf(name, run));
    const join: Join = feature.operation === "difference" ? "cut" : feature.operation === "intersection" ? "intersect" : "add";
    const result = combined(join, items[0]!.shape, items.slice(1).map(item => item.shape), run);
    const sources = items.map((item, index): NamedSource => ({ names: item.names, history: result.histories[index]! }));
    return { kind: "body", shape: result.shape, names: carryNames(faceCount(result.shape, run), sources, new Map(), nameOf(feature.id, "new")) };
}

function rounded(feature: Models.OCCT.DesignFilletFeature | Models.OCCT.DesignChamferFeature, path: string, run: DesignRun): DesignOutcome {
    const body = bodyOf(feature.body, run);
    const indexes = resolveEdges(feature.edges, contextOf(body, run), pointer(path, "edges"));
    run.trace?.set(path, { indexes });
    const made = feature.type === "fillet"
        ? run.occt.fillets.filletEdgesWithHistory({ shape: body.shape, radius: numberOf(feature.radius, run.parameters, pointer(path, "radius")), indexes })
        : run.occt.fillets.chamferEdgesWithHistory({ shape: body.shape, distance: numberOf(feature.distance, run.parameters, pointer(path, "distance")), indexes });
    const given = new Map<number, string[]>();
    const role = feature.type === "fillet" ? "round" : "bevel";
    [...made.history.facesFromEdges, ...made.history.facesFromVertices].forEach(faces => give(given, faces, nameOf(feature.id, role)));
    return { kind: "body", shape: made.shape, names: carryNames(faceCount(made.shape, run), [{ names: body.names, history: made.history }], given) };
}

function copiesOf(count: number, copy: (index: number) => TopoDS_Shape): TopoDS_Shape[] {
    const copies: TopoDS_Shape[] = [];
    try {
        for (let index = 1; index < count; index++) {
            copies.push(copy(index));
        }
        return copies;
    } catch (error) {
        copies.forEach(release);
        throw error;
    }
}

function fusedWithCopies(feature: string, body: BodyState, copies: TopoDS_Shape[], run: DesignRun): DesignOutcome {
    try {
        const result = run.occt.booleans.unionWithHistory({ shapes: [body.shape, ...copies] });
        const sources: NamedSource[] = [
            { names: body.names, history: result.histories[0]! },
            ...copies.map((_, index): NamedSource => ({ names: copyNames(body.names, feature, index + 1), history: result.histories[index + 1]! })),
        ];
        return releasedOnError(result.shape, () => ({ kind: "body", shape: result.shape, names: carryNames(faceCount(result.shape, run), sources, new Map()) }));
    } finally {
        copies.forEach(release);
    }
}

function linearPattern(feature: Models.OCCT.DesignLinearPatternFeature, path: string, run: DesignRun): DesignOutcome {
    const body = bodyOf(feature.body, run);
    const count = countOf(feature.count, run.parameters, pointer(path, "count"), 2, MAX_PATTERN_COUNT);
    const spacing = numberOf(feature.spacing, run.parameters, pointer(path, "spacing"));
    const along = unit(directionOf(feature.direction, run.parameters, pointer(path, "direction")));
    const copies = copiesOf(count, index => run.occt.transforms.translate({ shape: body.shape, translation: scaled(along, spacing * index) }));
    return fusedWithCopies(feature.id, body, copies, run);
}

function polarPattern(feature: Models.OCCT.DesignPolarPatternFeature, path: string, run: DesignRun): DesignOutcome {
    const body = bodyOf(feature.body, run);
    const count = countOf(feature.count, run.parameters, pointer(path, "count"), 2, MAX_PATTERN_COUNT);
    const center = pointOf(feature.axis.origin, run.parameters, pointer(path, "axis", "origin"));
    const axis = directionOf(feature.axis.direction, run.parameters, pointer(path, "axis", "direction"));
    const angle = feature.angle === undefined ? 360 : numberOf(feature.angle, run.parameters, pointer(path, "angle"));
    if (angle === 0 || Math.abs(angle) > 360) {
        throw new DesignProblem(pointer(path, "angle"), `the angle is not 0 and at most 360 either way, not ${angle}`);
    }
    const step = Math.abs(angle) === 360 ? angle / count : angle / (count - 1);
    const copies = copiesOf(count, index => run.occt.transforms.rotateAroundCenter({ shape: body.shape, angle: step * index, center, axis }));
    return fusedWithCopies(feature.id, body, copies, run);
}

function mirrored(feature: Models.OCCT.DesignMirrorFeature, path: string, run: DesignRun): DesignOutcome {
    const body = bodyOf(feature.body, run);
    const origin = pointOf(feature.plane.origin, run.parameters, pointer(path, "plane", "origin"));
    const normal = directionOf(feature.plane.normal, run.parameters, pointer(path, "plane", "normal"));
    const image = run.occt.transforms.mirrorAlongNormal({ shape: body.shape, origin, normal });
    if (feature.keepOriginal === false) {
        return { kind: "body", shape: image, names: copyNames(body.names, feature.id, 1) };
    }
    return fusedWithCopies(feature.id, body, [image], run);
}

function transformed(feature: Models.OCCT.DesignTransformFeature, path: string, run: DesignRun): DesignOutcome {
    const body = bodyOf(feature.body, run);
    const point = (value: Models.OCCT.DesignPoint | undefined, key: string): Vector => value === undefined ? [0, 0, 0] : pointOf(value, run.parameters, pointer(path, key));
    const motion = rigidMotion(point(feature.rotate, "rotate"), point(feature.pivot, "pivot"), point(feature.translate, "translate"));
    const shape = run.occt.transforms.transform({ shape: body.shape, rotationAxis: motion.turn.axis, rotationAngle: motion.turn.angle, translation: motion.shift, scaleFactor: 1 });
    return { kind: "body", shape, names: body.names.map(list => [...list]) };
}

type BodyChange = Models.OCCT.DesignBooleanFeature | Models.OCCT.DesignFilletFeature | Models.OCCT.DesignChamferFeature
    | Models.OCCT.DesignLinearPatternFeature | Models.OCCT.DesignPolarPatternFeature | Models.OCCT.DesignMirrorFeature
    | Models.OCCT.DesignTransformFeature;

/** Changes the body a boolean, fillet, chamfer, pattern, mirror or transform names. */
export function bodyPlan(feature: BodyChange, path: string, run: DesignRun): DesignPlan {
    switch (feature.type) {
        case "boolean":
            return { reads: [feature.body, ...feature.tools].map(bodyKey), make: () => booleaned(feature, run) };
        case "fillet":
        case "chamfer":
            return { reads: [bodyKey(feature.body)], make: () => rounded(feature, path, run) };
        case "linearPattern":
            return { reads: [bodyKey(feature.body)], make: () => linearPattern(feature, path, run) };
        case "polarPattern":
            return { reads: [bodyKey(feature.body)], make: () => polarPattern(feature, path, run) };
        case "mirror":
            return { reads: [bodyKey(feature.body)], make: () => mirrored(feature, path, run) };
        case "transform":
            return { reads: [bodyKey(feature.body)], make: () => transformed(feature, path, run) };
    }
}

function isBodyValue(value: unknown): value is { body: string } {
    return isRecord(value) && Object.keys(value).length === 1 && typeof value["body"] === "string";
}

function isExpressionValue(value: unknown): value is { expr: unknown } {
    return isRecord(value) && Object.keys(value).length === 1 && "expr" in value;
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
        return numberOf(value.expr, run.parameters, pointer(path, "expr"));
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

/**
 * The shape an operation made, owned by the feature: the shape itself, a compound of a list of
 * shapes, or undefined when the result is neither. An input handed back gets its own handle, and the
 * items of a list are freed once their compound holds them.
 */
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

/** The roles new faces take from what an operation made them of, by the operation: a fillet's rounds, a chamfer's bevels, a sweep's sides. */
const EDGE_FACE_ROLES: Readonly<Record<string, string>> = { "fillets.filletEdges": "round", "fillets.chamferEdges": "bevel" };

/**
 * Operations that move, turn, mirror or scale one shape and keep its topology as it was, so face
 * `i` of the result is face `i` of the shape and keeps its names.
 */
const FACE_KEEPING: ReadonlySet<string> = new Set([
    "transforms.transform", "transforms.rotate", "transforms.rotateAroundCenter", "transforms.rotateByQuaternion",
    "transforms.align", "transforms.alignNormAndAxis", "transforms.alignAndTranslate", "transforms.orient",
    "transforms.translate", "transforms.scale", "transforms.scale3d", "transforms.scaleFromCenter",
    "transforms.mirror", "transforms.mirrorAlongNormal", "transforms.mirrorAboutPoint", "transforms.transformByMatrix",
]);

/** The names of the body an operation that keeps faces was given, when the shape it made has as many faces. */
function keptNames(operation: string, inputs: unknown, shape: TopoDS_Shape, run: DesignRun): FaceNames | undefined {
    const given = isRecord(inputs) ? inputs["shape"] : undefined;
    if (!FACE_KEEPING.has(operation) || !isShape(given)) {
        return undefined;
    }
    const names = [...run.bodies.values()].find(body => body.shape === given)?.names;
    return names !== undefined && names.length === faceCount(shape, run) ? names.map(list => [...list]) : undefined;
}

function isHistoried(result: unknown): result is Models.OCCT.ShapeWithHistory<TopoDS_Shape> | Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
    return isRecord(result) && isShape(result["shape"]) && (isRecord(result["history"]) || Array.isArray(result["histories"]));
}

/**
 * Runs an operation's history twin, when it has one and is given bodies, and names the faces it made:
 * each face a body's face became keeps that face's names, faces made of a body's edges take the
 * operation's role for them (`round`, `bevel`, or `side`), its first and last faces `start` and `end`,
 * and any other face `face`. The histories follow the inputs in the order given: `shape`, then `shapes`.
 */
function operatedWithHistory(feature: Models.OCCT.DesignOperationFeature, operation: string, inputs: unknown, shapes: readonly TopoDS_Shape[], run: DesignRun): DesignOutcome | undefined {
    const twin = `${operation}WithHistory`;
    if (shapes.length === 0 || occtDtoRegistry[twin] === undefined || !isRecord(inputs)) {
        return undefined;
    }
    const result: unknown = callByPath(run.occt, twin, inputs);
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
    const made = new Map<number, string[]>();
    given.forEach((shape, index) => {
        const history = histories[index];
        const names = named.get(shape);
        if (history === undefined) {
            return;
        }
        if (names !== undefined) {
            sources.push({ names, history });
        }
        history.facesFromEdges.forEach(faces => give(made, faces, nameOf(feature.id, EDGE_FACE_ROLES[operation] ?? "side")));
        give(made, history.firstFaces, nameOf(feature.id, "start"));
        give(made, history.lastFaces, nameOf(feature.id, "end"));
    });
    const shape = shapes.includes(result.shape) ? result.shape.clone() : result.shape;
    return { kind: "body", shape, names: carryNames(faceCount(shape, run), sources, made, nameOf(feature.id, "face")) };
}

function operated(feature: Models.OCCT.DesignOperationFeature, path: string, run: DesignRun): DesignOutcome {
    const shapes: TopoDS_Shape[] = [];
    const inputs = substituted(feature.params, pointer(path, "params"), run, shapes);
    const operation = operationPathOf(feature.operation)!;
    const issue = validateInputs(occtDtoRegistry, operation, resolveInputs(occtDtoRegistry, operation, inputs), occtDtoRules)[0];
    if (issue !== undefined) {
        throw new DesignProblem(pointer(path, "params", issue.property), issue.message);
    }
    const historied = operatedWithHistory(feature, operation, inputs, shapes, run);
    if (historied !== undefined) {
        return historied;
    }
    const result = callByPath(run.occt, operation, inputs);
    const shape = madeShape(result, shapes, run);
    if (shape === undefined) {
        releaseShapesIn(result, shapes);
        throw new DesignProblem(pointer(path, "operation"), `${feature.operation} makes neither a shape nor a list of shapes`);
    }
    const names = releasedOnError(shape, () => keptNames(operation, inputs, shape, run) ?? Array.from({ length: faceCount(shape, run) }, () => [nameOf(feature.id, "face")]));
    return { kind: "body", shape, names };
}

/** Runs an operation of the package by its dotted path, with bodies and expressions in its inputs. */
export function operationPlan(feature: Models.OCCT.DesignOperationFeature, path: string, run: DesignRun): DesignPlan {
    return {
        reads: [...new Set(bodiesIn(feature.params))].map(bodyKey),
        make: () => operated(feature, path, run),
    };
}
