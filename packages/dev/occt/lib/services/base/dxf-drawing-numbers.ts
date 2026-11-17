import type { Base } from "@bitbybit-dev/base";
import { WorkBudget } from "@bitbybit-dev/base/lib/api/services/helpers/files/work-budget";
import { clampedForm, isRationalPiece } from "@bitbybit-dev/base/lib/api/services/helpers/curves/nurbs-forms";
import { polylineSegments, principalConicOf } from "@bitbybit-dev/base/lib/api/services/helpers/files/dxf/dxf-reader-geometry";
import type {
    ReadConic, ReadEntity, ReadFitSpline, ReadLine, ReadSegment, ReadSpline, ReadStyle,
} from "@bitbybit-dev/base/lib/api/services/helpers/files/dxf/dxf-reader-types";
import { length3, scale3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import {
    CLOSED_FIT_POINT_PAIRS_PER_KERNEL_EDGE, FIT_POINTS_PER_KERNEL_EDGE, KERNEL_EDGE_CEILING, KERNEL_EDGE_FLOOR, KERNEL_EDGES_PER_DXF_CHARACTER,
    KERNEL_INFINITE_MAGNITUDE, KERNEL_MAX_SPLINE_DEGREE, MAX_FIT_POINTS_PER_CLOSED_SPLINE, MAX_FIT_POINTS_PER_SPLINE, MAX_LISTED_LEFT_OUT,
    SPLINE_POLES_PER_KERNEL_EDGE,
} from "./dxf-loader.constants";

export interface DrawingGroup {
    readonly style: ReadStyle;
    readonly segments: ReadSegment[];
}

export interface DrawingNumbers {
    readonly numbers: Float64Array;
    readonly leftOut: readonly number[];
    readonly refused: readonly number[];
    readonly extent: number;
    readonly drawn: number;
}

export const DRAWING_SEGMENT = { line: 0, conic: 1, spline: 2, fit: 3 } as const;

export const REFUSAL = { kernel: 0, outOfRange: 1, degree: 2, fitPoints: 3, closedFitPoints: 4, edges: 5 } as const;

const SEGMENT_KINDS = 4;

const AXES = 3;

export const refusalCode = (kind: number, refusal: number): number => refusal * SEGMENT_KINDS + kind;

export const kernelEdgeBudgetFor = (textLength: number): WorkBudget =>
    WorkBudget.forInput(textLength, KERNEL_EDGES_PER_DXF_CHARACTER, KERNEL_EDGE_FLOOR, KERNEL_EDGE_CEILING);

interface Written {
    readonly kind: number;
    readonly values: readonly number[];
    readonly edges: number;
    readonly corners: readonly Base.Point3[];
    readonly reach: number;
}

interface Refused {
    readonly kind: number;
    readonly refusal: number;
}

type Outcome = Written | Refused;

const isRefused = (outcome: Outcome): outcome is Refused => "refusal" in outcome;

const scaled = (point: Base.Point3, scale: number): Base.Point3 => scale3(point, scale);

const flag = (value: boolean): number => (value ? 1 : 0);

const plural = (count: number): string => (count === 1 ? "" : "s");

const lineOf = (segment: ReadLine, scale: number): Outcome => {
    const start = scaled(segment.start, scale);
    const end = scaled(segment.end, scale);
    return { kind: DRAWING_SEGMENT.line, values: [DRAWING_SEGMENT.line, ...start, ...end], edges: 1, corners: [start, end], reach: 0 };
};

const conicOf = (segment: ReadConic, scale: number): Outcome => {
    const conic = principalConicOf(segment);
    if (conic === undefined) {
        return { kind: DRAWING_SEGMENT.conic, refusal: REFUSAL.kernel };
    }
    const center = scaled(conic.center, scale);
    const major = scaled(conic.major, scale);
    const values = [DRAWING_SEGMENT.conic, ...center, ...conic.normal, ...major, conic.minor * scale, conic.start, conic.end];
    return { kind: DRAWING_SEGMENT.conic, values, edges: 1, corners: [center], reach: length3(major) };
};

const splineOf = (segment: ReadSpline, scale: number): Outcome => {
    if (!(segment.curve.degree <= KERNEL_MAX_SPLINE_DEGREE)) {
        return { kind: DRAWING_SEGMENT.spline, refusal: REFUSAL.degree };
    }
    const curve = clampedForm(segment.curve);
    const poles = curve.points.map(point => scaled(point, scale));
    const values: number[] = [DRAWING_SEGMENT.spline, curve.degree, flag(isRationalPiece(curve)), poles.length, curve.knots.length];
    for (const knot of curve.knots) {
        values.push(knot);
    }
    poles.forEach((pole, at) => {
        values.push(...pole, curve.weights[at]!);
    });
    return { kind: DRAWING_SEGMENT.spline, values, edges: 1 + Math.floor(poles.length / SPLINE_POLES_PER_KERNEL_EDGE), corners: poles, reach: 0 };
};

const fitOf = (segment: ReadFitSpline, scale: number): Outcome => {
    const count = segment.points.length;
    if (count > MAX_FIT_POINTS_PER_SPLINE) {
        return { kind: DRAWING_SEGMENT.fit, refusal: REFUSAL.fitPoints };
    }
    if (segment.closed && count > MAX_FIT_POINTS_PER_CLOSED_SPLINE) {
        return { kind: DRAWING_SEGMENT.fit, refusal: REFUSAL.closedFitPoints };
    }
    const { startTangent, endTangent } = segment;
    const points = segment.points.map(point => scaled(point, scale));
    const values: number[] = [DRAWING_SEGMENT.fit, count, flag(segment.closed)];
    if (startTangent !== undefined && endTangent !== undefined && !segment.closed) {
        values.push(1, ...startTangent, ...endTangent);
    } else {
        values.push(0);
    }
    for (const point of points) {
        values.push(...point);
    }
    const work = segment.closed ? count * count / CLOSED_FIT_POINT_PAIRS_PER_KERNEL_EDGE : count / FIT_POINTS_PER_KERNEL_EDGE;
    return { kind: DRAWING_SEGMENT.fit, values, edges: 1 + Math.floor(work), corners: points, reach: 0 };
};

const outcomesOf = (segment: ReadSegment, scale: number): Outcome[] => {
    switch (segment.kind) {
        case "line":
            return [lineOf(segment, scale)];
        case "conic":
            return [conicOf(segment, scale)];
        case "polyline":
            return polylineSegments(segment).flatMap(part => outcomesOf(part, scale));
        case "spline":
            return [splineOf(segment, scale)];
        case "fit":
            return [fitOf(segment, scale)];
    }
};

const kindsOf = (segment: ReadSegment): number[] => {
    switch (segment.kind) {
        case "polyline":
            return polylineSegments(segment).flatMap(kindsOf);
        default:
            return [DRAWING_SEGMENT[segment.kind]];
    }
};

const inKernelRange = (values: readonly number[]): boolean => values.every(value => Math.abs(value) < KERNEL_INFINITE_MAGNITUDE);

interface ExtentTracker {
    readonly add: (written: Written) => void;
    readonly size: () => number;
}

const extentTracker = (): ExtentTracker => {
    const low = [Infinity, Infinity, Infinity];
    const high = [-Infinity, -Infinity, -Infinity];
    return {
        add: (written) => {
            for (const corner of written.corners) {
                for (let axis = 0; axis < AXES; axis++) {
                    low[axis] = Math.min(low[axis]!, corner[axis]! - written.reach);
                    high[axis] = Math.max(high[axis]!, corner[axis]! + written.reach);
                }
            }
        },
        size: () => Math.max(0, ...high.map((top, axis) => top - low[axis]!)),
    };
};

export const drawingGroupsOf = (entities: readonly ReadEntity[]): DrawingGroup[] => {
    const groups = new Map<string, DrawingGroup>();
    for (const entity of entities) {
        const key = `${entity.style.layer}\n${entity.style.color}\n${entity.style.lineType}`;
        const group = groups.get(key) ?? { style: entity.style, segments: [] };
        groups.set(key, group);
        for (const segment of entity.segments) {
            group.segments.push(segment);
        }
    }
    return [...groups.values()];
};

export const drawingNumbersOf = (groups: readonly DrawingGroup[], scale: number, budget: WorkBudget): DrawingNumbers => {
    const numbers: number[] = [groups.length];
    const leftOut: number[] = [];
    const refused: number[] = [];
    const extent = extentTracker();
    let drawn = 0;
    groups.forEach((group, index) => {
        const countAt = numbers.length;
        numbers.push(0);
        let inGroup = 0;
        for (const segment of group.segments) {
            if (budget.exhausted) {
                for (const kind of kindsOf(segment)) {
                    refused.push(index, refusalCode(kind, REFUSAL.edges));
                }
                continue;
            }
            for (const outcome of outcomesOf(segment, scale)) {
                if (isRefused(outcome)) {
                    if (outcome.refusal === REFUSAL.kernel) {
                        leftOut.push(index, outcome.kind);
                    } else {
                        refused.push(index, refusalCode(outcome.kind, outcome.refusal));
                    }
                } else if (!inKernelRange(outcome.values)) {
                    refused.push(index, refusalCode(outcome.kind, REFUSAL.outOfRange));
                } else if (!budget.spend(outcome.edges)) {
                    refused.push(index, refusalCode(outcome.kind, REFUSAL.edges));
                } else {
                    for (const value of outcome.values) {
                        numbers.push(value);
                    }
                    extent.add(outcome);
                    inGroup++;
                }
            }
        }
        numbers[countAt] = inGroup;
        drawn += inGroup;
    });
    return { numbers: Float64Array.from(numbers), leftOut, refused, extent: extent.size(), drawn };
};

const leftOutWords = (kind: number): readonly [noun: string, reason: string] => {
    switch (kind) {
        case DRAWING_SEGMENT.conic:
            return ["arc", "a radius, a plane or a sweep is missing"];
        case DRAWING_SEGMENT.spline:
            return ["spline", "the kernel refuses the degree, knots or weights given"];
        case DRAWING_SEGMENT.fit:
            return ["fit-point spline", "the fit points given cannot be interpolated"];
        default:
            return ["segment", "the kernel could not make a curve"];
    }
};

const refusalWords = (code: number): readonly [noun: string, reason: string] => {
    const [noun] = leftOutWords(code % SEGMENT_KINDS);
    switch (Math.floor(code / SEGMENT_KINDS)) {
        case REFUSAL.outOfRange:
            return [noun, `a number in it is not finite or is ${KERNEL_INFINITE_MAGNITUDE.toExponential()} or more in size`];
        case REFUSAL.degree:
            return [noun, `its degree is above ${KERNEL_MAX_SPLINE_DEGREE}, the highest the kernel draws`];
        case REFUSAL.fitPoints:
            return [noun, `it has more than ${MAX_FIT_POINTS_PER_SPLINE} fit points, more than one spline is interpolated through`];
        case REFUSAL.closedFitPoints:
            return [noun, `it is closed through more than ${MAX_FIT_POINTS_PER_CLOSED_SPLINE} fit points, more than one closed spline is interpolated through`];
        default:
            return [noun, "the file asks for more edges than one load of a file its size builds"];
    }
};

interface Tally {
    readonly noun: string;
    readonly reason: string;
    count: number;
}

export const leftOutWarnings = (groups: readonly DrawingGroup[], leftOut: ArrayLike<number>, refused: ArrayLike<number> = []): string[] => {
    const byLayer = new Map<string, Map<string, Tally>>();
    const tally = (pairs: ArrayLike<number>, wordsOf: (code: number) => readonly [string, string]): void => {
        for (let at = 0; at + 1 < pairs.length; at += 2) {
            const layer = groups[pairs[at]!]!.style.layer;
            const [noun, reason] = wordsOf(pairs[at + 1]!);
            const phrases = byLayer.get(layer) ?? new Map<string, Tally>();
            byLayer.set(layer, phrases);
            const key = `${noun}\n${reason}`;
            const known = phrases.get(key);
            if (known === undefined) {
                phrases.set(key, { noun, reason, count: 1 });
            } else {
                known.count++;
            }
        }
    };
    tally(leftOut, leftOutWords);
    tally(refused, refusalWords);
    const warnings: string[] = [];
    const unlisted = { count: 0, layers: new Set<string>() };
    byLayer.forEach((phrases, layer) => phrases.forEach(({ noun, reason, count }) => {
        if (warnings.length < MAX_LISTED_LEFT_OUT) {
            warnings.push(`${count} ${noun}${plural(count)} on layer "${layer}" could not be drawn: ${reason}.`);
        } else {
            unlisted.count += count;
            unlisted.layers.add(layer);
        }
    }));
    if (unlisted.count > 0) {
        const layers = unlisted.layers.size;
        warnings.push(`${unlisted.count} more segment${plural(unlisted.count)} on ${layers} layer${plural(layers)} could not be drawn, for reasons like those above.`);
    }
    return warnings;
};
