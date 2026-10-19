import { InputError } from "@bitbybit-dev/base";
import type { MetricThread } from "@bitbybit-dev/base";
import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import type { DesignOutcome } from "./cache";
import { release } from "../base/release";
import { bodyOf, contextOf, faceCount, faceSignatures } from "./helpers";
import { tripleOf, unitVector } from "./placement";
import { carryNames, give, nameOf } from "./names";
import { cleanedUp, cleanedUpOnError, DesignProblem, pointer } from "./problems";
import { resolveFaces } from "./references";
import type { FittingThread, MachiningCut, MachiningCylinder, MachiningFeature } from "./machining-types";
import type { BodyState, DesignPlan, DesignRun } from "./state";
import { bodyKey } from "./state";
import { numberOf, textOf } from "./values";

type Vector3 = Inputs.Base.Vector3;

const ROLES: Readonly<Record<MachiningFeature["type"], string>> = { keyway: "keyway", flat: "flat", ringGroove: "groove", knurl: "knurl", spline: "spline", thread: "thread" };
const ALONG_X = 0.9;
const UV_MIDDLE = 0.5;
const KEPT_DECIMALS = 9;
const ONE_THIRD = 0.3333333333333333;
const TWO_THIRDS = 0.6666666666666666;
const SHAFT_FIT = 0.1;
const BORE_FIT = 0.25;
const NEAREST_SIZES = 3;
const SPLINE_FIT = 0.05;
const NOMINAL_FIT = 0.01;
const AT_THE_END = 1e-6;

function toolProblemsAt<T>(path: string, fields: Readonly<Record<string, string>>, make: () => T): T {
    try {
        return make();
    } catch (error) {
        if (error instanceof InputError) {
            const field = error.property === undefined ? undefined : fields[error.property] ?? "on";
            throw new DesignProblem(field === undefined ? path : pointer(path, field), error.message);
        }
        throw error;
    }
}

function referenceOnBore(bore: number, module: number, path: string, run: DesignRun): number {
    const tips = toolProblemsAt(path, { module: "module" }, () => run.base.engineering.mechanical.splines.involuteSplineSizes({ referenceDiameter: bore, module })).hubTipDiameter;
    return bore + (bore - tips);
}

function cylinderOf(feature: MachiningFeature, body: BodyState, path: string, run: DesignRun): MachiningCylinder {
    const at = pointer(path, "on");
    const found = resolveFaces(feature.on, contextOf(body, run), at);
    const signatures = faceSignatures(body.shape, run);
    const cylinders = found.filter(each => signatures[each]?.type === Inputs.OCCT.surfaceTypeEnum.cylinder);
    const index = cylinders[0];
    if (index === undefined) {
        throw new DesignProblem(at, found.length === 1 ? `a cylindrical face is needed here, and this one is a ${signatures[found[0]!]!.type}` : "a cylindrical face is needed here, and the reference finds none");
    }
    if (cylinders.length > 1) {
        throw new DesignProblem(at, `the reference finds ${cylinders.length} cylindrical faces, and one is machined: narrow it to one, with a count of 1 or a filter`);
    }
    const face = run.occt.shapes.face.getFace({ shape: body.shape, index });
    return cleanedUp(() => {
        const vector = run.base.vector;
        const surface = (paramU: number, paramV: number): Inputs.Base.Point3 => run.occt.shapes.face.pointOnUV({ shape: face, paramU, paramV });
        const arc = run.occt.shapes.edge.arcThroughThreePoints({ start: surface(0, UV_MIDDLE), middle: surface(ONE_THIRD, UV_MIDDLE), end: surface(TWO_THIRDS, UV_MIDDLE) });
        const kept = (value: number): number => run.base.math.roundToDecimals({ number: value, decimalPlaces: KEPT_DECIMALS }) + 0;
        const circle = cleanedUp(() => ({ centre: tripleOf(run.occt.shapes.edge.getCircularEdgeCenterPoint({ shape: arc }).map(kept)), radius: kept(run.occt.shapes.edge.getCircularEdgeRadius({ shape: arc })) }), () => release(arc));
        const low = surface(UV_MIDDLE, 0);
        const high = surface(UV_MIDDLE, 1);
        const raw = unitVector(vector.sub({ first: high, second: low }), at, run.base);
        const largest = raw.reduce((most, value) => Math.abs(value) > Math.abs(most) ? value : most, 0);
        const axis = largest < 0 ? tripleOf(vector.neg({ vector: raw })) : raw;
        const along = [low, high].map(point => vector.dot({ first: vector.sub({ first: point, second: circle.centre }), second: axis }));
        const least = Math.min(...along);
        const start = tripleOf(vector.add({ first: circle.centre, second: vector.mul({ vector: axis, scalar: least }) }));
        const point = surface(UV_MIDDLE, UV_MIDDLE);
        const normal = run.occt.shapes.face.normalOnUV({ shape: face, paramU: UV_MIDDLE, paramV: UV_MIDDLE });
        const onAxis = vector.add({ first: start, second: vector.mul({ vector: axis, scalar: vector.dot({ first: vector.sub({ first: point, second: start }), second: axis }) }) });
        const outward = vector.dot({ first: normal, second: vector.sub({ first: point, second: onAxis }) }) > 0;
        return { start, axis, length: Math.max(...along) - least, diameter: 2 * circle.radius, bore: !outward };
    }, () => release(face));
}

function frameOf(feature: MachiningFeature, cylinder: MachiningCylinder, path: string, run: DesignRun): Inputs.Base.Frame {
    const vector = run.base.vector;
    const axis = feature.flip === true ? tripleOf(vector.neg({ vector: cylinder.axis })) : cylinder.axis;
    const start = feature.flip === true ? tripleOf(vector.add({ first: cylinder.start, second: vector.mul({ vector: cylinder.axis, scalar: cylinder.length }) })) : cylinder.start;
    const at = feature.at === undefined ? 0 : numberOf(feature.at, run.parameters, pointer(path, "at"));
    const reference: Vector3 = Math.abs(cylinder.axis[0]) >= ALONG_X ? [0, 1, 0] : [1, 0, 0];
    const square = unitVector(vector.sub({ first: reference, second: vector.mul({ vector: cylinder.axis, scalar: vector.dot({ first: reference, second: cylinder.axis }) }) }), path, run.base);
    const angle = "angle" in feature && feature.angle !== undefined ? numberOf(feature.angle, run.parameters, pointer(path, "angle")) : 0;
    const direction = angle === 0 ? square : unitVector(run.base.point.rotatePointsCenterAxis({ points: [square], center: [0, 0, 0], axis: cylinder.axis, angle })[0]!, path, run.base);
    return { origin: tripleOf(vector.add({ first: start, second: vector.mul({ vector: axis, scalar: at }) })), normal: axis, direction };
}

function shaftOnly(cylinder: MachiningCylinder, what: string, path: string): void {
    if (cylinder.bore) {
        throw new DesignProblem(pointer(path, "on"), `${what} is made on a shaft, and this face is a bore's wall`);
    }
}

function threadOf(size: Inputs.Engineering.metricSizeEnum, pitch: number | undefined, path: string, run: DesignRun): MetricThread {
    return toolProblemsAt(path, { pitch: "pitch", size: "size" }, () => run.base.engineering.mechanical.threads.metricThread({ size, ...(pitch === undefined ? {} : { pitch }) }));
}

function threadsFitting(pitch: number | undefined, run: DesignRun): FittingThread[] {
    const threads = run.base.engineering.mechanical.threads;
    return Object.values(Inputs.Engineering.metricSizeEnum).flatMap(size => {
        const coarse = threads.metricThread({ size });
        return pitch === undefined || pitch <= coarse.pitch ? [{ size, thread: pitch === undefined ? coarse : threads.metricThread({ size, pitch }) }] : [];
    });
}

function namedThread(size: Models.OCCT.DesignText, cylinder: MachiningCylinder, pitch: number | undefined, path: string, run: DesignRun): Inputs.Engineering.metricSizeEnum {
    const sizes = Object.values(Inputs.Engineering.metricSizeEnum);
    const given = textOf(size, run.parameters, pointer(path, "size"));
    const named = sizes.find(each => String(each) === given);
    if (named === undefined) {
        throw new DesignProblem(pointer(path, "size"), `${JSON.stringify(given)} is not a metric size: ${sizes.join(", ")}`);
    }
    const thread = threadOf(named, pitch, path, run);
    if (cylinder.bore && cylinder.diameter > thread.tapDrill + BORE_FIT) {
        throw new DesignProblem(pointer(path, "on"), `the bore is ${cylinder.diameter} across, wider than ${named}'s tap drill, ${thread.tapDrill}, so the thread would have little or nothing to cut: drill it to ${thread.tapDrill}`);
    }
    if (!cylinder.bore && (cylinder.diameter > thread.diameter + SHAFT_FIT || cylinder.diameter < thread.minorDiameter)) {
        throw new DesignProblem(pointer(path, "on"), `the shaft is ${cylinder.diameter} across, and an ${named} thread is cut on a shaft ${thread.diameter} across: turn it to ${thread.diameter}`);
    }
    return named;
}

function threadSizeOf(feature: Models.OCCT.DesignThreadFeature, cylinder: MachiningCylinder, pitch: number | undefined, path: string, run: DesignRun): Inputs.Engineering.metricSizeEnum {
    if (feature.size !== undefined) {
        return namedThread(feature.size, cylinder, pitch, path, run);
    }
    const fitting = threadsFitting(pitch, run);
    const nominal = fitting.find(each => Math.abs(each.thread.diameter - cylinder.diameter) <= NOMINAL_FIT);
    if (cylinder.bore && nominal !== undefined) {
        throw new DesignProblem(pointer(path, "on"), `a bore ${cylinder.diameter} across is ${nominal.size}'s nominal diameter, the size a tapped hole is drawn at, which leaves a modelled thread nothing to cut: drill it to ${nominal.size}'s tap drill, ${nominal.thread.tapDrill}, or name the size the bore is drilled for`);
    }
    const measured = fitting.map(each => ({ size: each.size, gap: Math.abs((cylinder.bore ? each.thread.tapDrill : each.thread.diameter) - cylinder.diameter) })).sort((a, b) => a.gap - b.gap);
    const best = measured[0];
    if (best === undefined || best.gap > (cylinder.bore ? BORE_FIT : SHAFT_FIT)) {
        const nearest = measured.slice(0, NEAREST_SIZES).map(each => each.size).join(", ");
        throw new DesignProblem(pointer(path, "on"), cylinder.bore
            ? `a bore ${cylinder.diameter} across is drilled for no metric tap${pitch === undefined ? "" : ` of pitch ${pitch}`}; the nearest are ${nearest}: name a size, or drill the bore for one`
            : `a shaft ${cylinder.diameter} across is no metric size; the nearest are ${nearest}: name a size, or size the shaft to one`);
    }
    return best.size;
}

function trimmedToSpan(tool: TopoDS_Shape, cylinder: MachiningCylinder, frame: Inputs.Base.Frame, at: number, length: number, run: DesignRun): TopoDS_Shape {
    const fromStart = at > AT_THE_END;
    const toEnd = at + length < cylinder.length - AT_THE_END;
    if (!fromStart && !toEnd) {
        return tool;
    }
    const over = cylinder.diameter;
    const first = fromStart ? 0 : -over;
    const last = toEnd ? length : length + over;
    const vector = run.base.vector;
    return cleanedUp(() => {
        const span = run.occt.shapes.solid.createCylinder({ radius: cylinder.diameter, height: last - first, center: tripleOf(vector.add({ first: frame.origin, second: vector.mul({ vector: frame.normal, scalar: first }) })), direction: frame.normal });
        return cleanedUp(() => run.occt.booleans.intersection({ shapes: [tool, span], keepEdges: false }), () => release(span));
    }, () => release(tool));
}

function machinedOf(feature: MachiningFeature, cylinder: MachiningCylinder, frame: Inputs.Base.Frame, path: string, run: DesignRun): MachiningCut {
    const machining = run.occt.parts.mechanical.machining;
    const length = (value: Models.OCCT.DesignNumber): number => numberOf(value, run.parameters, pointer(path, "length"));
    const at = feature.at === undefined ? 0 : numberOf(feature.at, run.parameters, pointer(path, "at"));
    const fields = (...own: string[]): Readonly<Record<string, string>> => Object.fromEntries(own.map(field => [field, field]));
    switch (feature.type) {
        case "keyway": {
            const inputs = { diameter: cylinder.diameter, length: length(feature.length), inHub: cylinder.bore, frame };
            const cut = (): TopoDS_Shape => toolProblemsAt(path, fields("length"), () => machining.keywayTool(inputs));
            return { operation: "keyway", inputs, frame, tool: () => cylinder.bore ? trimmedToSpan(cut(), cylinder, frame, at, inputs.length, run) : cut() };
        }
        case "flat": {
            shaftOnly(cylinder, "a flat", path);
            const inputs = { diameter: cylinder.diameter, length: length(feature.length), depth: numberOf(feature.depth, run.parameters, pointer(path, "depth")), frame };
            return { operation: "flat", inputs, frame, tool: () => toolProblemsAt(path, fields("length", "depth"), () => machining.flatTool(inputs)) };
        }
        case "ringGroove": {
            const inputs = { kind: cylinder.bore ? Inputs.Engineering.retainingRingKindEnum.bore : Inputs.Engineering.retainingRingKindEnum.shaft, diameter: cylinder.diameter, frame };
            return { operation: "ringGroove", inputs, frame, tool: () => toolProblemsAt(path, {}, () => machining.ringGrooveTool(inputs)) };
        }
        case "knurl": {
            shaftOnly(cylinder, "a knurl", path);
            const pattern = feature.pattern ?? Inputs.Engineering.knurlPatternEnum.straight;
            const inputs = { diameter: cylinder.diameter, length: length(feature.length), ...(feature.pitch === undefined ? {} : { pitch: numberOf(feature.pitch, run.parameters, pointer(path, "pitch")) }), pattern: pattern as Inputs.Engineering.knurlPatternEnum, frame };
            return { operation: "knurl", inputs, frame, tool: () => toolProblemsAt(path, fields("length", "pitch", "pattern"), () => machining.knurlTool(inputs)) };
        }
        case "spline": {
            if (!cylinder.bore) {
                throw new DesignProblem(pointer(path, "on"), "spline teeth are cut into a bore; a splined shaft is made whole by parts.mechanical.machining.splinedShaft");
            }
            const module = numberOf(feature.module, run.parameters, pointer(path, "module"));
            const referenceDiameter = feature.diameter === undefined ? referenceOnBore(cylinder.diameter, module, path, run) : numberOf(feature.diameter, run.parameters, pointer(path, "diameter"));
            const given = feature.diameter === undefined ? {} : { referenceDiameter: "diameter" };
            const tips = toolProblemsAt(path, { module: "module", ...given }, () => run.base.engineering.mechanical.splines.involuteSplineSizes({ referenceDiameter, module })).hubTipDiameter;
            if (cylinder.diameter > tips + SPLINE_FIT) {
                throw new DesignProblem(pointer(path, "on"), `the bore is ${cylinder.diameter} across, wider than the ${tips} the hub's teeth end on, so they would be lost: drill the bore to ${tips}`);
            }
            const inputs = { referenceDiameter, module, length: length(feature.length), frame };
            return { operation: "splinedHub", inputs, frame, tool: () => trimmedToSpan(toolProblemsAt(path, { module: "module", length: "length", ...given }, () => machining.splinedHubTool(inputs)), cylinder, frame, at, inputs.length, run) };
        }
        case "thread": {
            const pitch = feature.pitch === undefined ? undefined : numberOf(feature.pitch, run.parameters, pointer(path, "pitch"));
            const size = threadSizeOf(feature, cylinder, pitch, path, run);
            const along = length(feature.length);
            const end = { ...frame, origin: tripleOf(run.base.vector.add({ first: frame.origin, second: run.base.vector.mul({ vector: frame.normal, scalar: along }) })) };
            const inputs = { size, ...(pitch === undefined ? {} : { pitch }), length: along, internal: cylinder.bore, frame: end };
            return { operation: "thread", inputs, frame: end, tool: () => toolProblemsAt(path, fields("length", "pitch", "size"), () => machining.threadTool(inputs)) };
        }
    }
}

function machined(feature: MachiningFeature, path: string, run: DesignRun): DesignOutcome {
    const body = bodyOf(feature.body, run);
    const cylinder = cylinderOf(feature, body, path, run);
    const frame = frameOf(feature, cylinder, path, run);
    const plan = machinedOf(feature, cylinder, frame, path, run);
    run.trace?.set(path, { frame: plan.frame, machining: { operation: plan.operation, inputs: plan.inputs } });
    const tool = plan.tool();
    const made = cleanedUp(() => run.occt.booleans.differenceWithHistory({ shape: body.shape, shapes: [tool], keepEdges: false }), () => release(tool));
    return cleanedUpOnError(() => {
        const given = new Map<number, string[]>();
        made.histories.slice(1).forEach(history => give(given, history.faces.flat(), nameOf(feature.id, ROLES[feature.type])));
        return { kind: "body", shape: made.shape, names: carryNames(faceCount(made.shape, run), [{ names: body.names, history: made.histories[0]! }], given) };
    }, () => release(made.shape));
}

export function machiningPlan(feature: MachiningFeature, path: string, run: DesignRun): DesignPlan {
    return { reads: [bodyKey(feature.body)], make: () => machined(feature, path, run) };
}
