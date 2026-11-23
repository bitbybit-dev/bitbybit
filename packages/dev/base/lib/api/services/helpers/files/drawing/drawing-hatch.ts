import * as Inputs from "../../../../inputs";
import { InputError } from "../../../../kernel-calls";
import { bulgeArcOf, conicArcSamples } from "../../curves/conic-arcs";
import { radiansOf } from "../../geometry/scalars";
import { add2, between2, dot2, leftOf2, polar2, scale2 } from "../../geometry/vectors";
import type { WorkBudget } from "../work-budget";
import { drawingBounds } from "./drawing-geometry";
import { drawingLoopsOf } from "./drawing-loops";
import type { DrawingHatch, DrawingHatchFamily, DrawingLoop, DrawingPart } from "./drawing-types";
import { DEFAULT_LAYER, HATCH_FAMILIES, LEAST_LOOP_CORNERS, MOST_HATCH_LINES, SAME_POINT } from "./drawing.constants";

type Point2 = Inputs.Base.Point2;
type Segment2 = Inputs.Base.Segment2;

interface LineSteps {
    readonly first: number;
    readonly last: number;
}

const flatLoopOf = (loop: DrawingLoop, tolerance: number, budget: WorkBudget | undefined): Point2[] => {
    const points: Point2[] = [];
    const count = loop.points.length;
    for (let at = 0; at < count; at++) {
        const start = loop.points[at]!;
        const bulge = loop.bulges[at] ?? 0;
        points.push([start[0], start[1]]);
        if (bulge === 0) {
            continue;
        }
        const end = loop.points[(at + 1) % count]!;
        const samples = conicArcSamples(bulgeArcOf([start[0], start[1], 0], [end[0], end[1], 0], bulge), tolerance, budget);
        for (let sample = 1; sample < samples.length - 1; sample++) {
            points.push([samples[sample]![0], samples[sample]![1]]);
        }
    }
    return points;
};

export const hatchOutlinesOf = (hatch: DrawingHatch, tolerance: number, budget?: WorkBudget): Point2[][] =>
    drawingLoopsOf(hatch.boundaries, tolerance, budget)
        .map(loop => flatLoopOf(loop, tolerance, budget))
        .filter(loop => loop.length >= LEAST_LOOP_CORNERS);

const stepsAcross = (outlines: readonly (readonly Point2[])[], family: DrawingHatchFamily, spacing: number): LineSteps => {
    let lowest = Infinity;
    let highest = -Infinity;
    for (const outline of outlines) {
        for (const point of outline) {
            const offset = dot2(point, family.across);
            lowest = Math.min(lowest, offset);
            highest = Math.max(highest, offset);
        }
    }
    return { first: Math.ceil((lowest - family.phase) / spacing), last: Math.floor((highest - family.phase) / spacing) };
};

const crossingsOf = (outlines: readonly (readonly Point2[])[], family: DrawingHatchFamily, spacing: number, steps: LineSteps): number[][] => {
    const crossings: number[][] = Array.from({ length: steps.last - steps.first + 1 }, () => []);
    const offsetOf = (step: number): number => family.phase + step * spacing;
    for (const outline of outlines) {
        for (let at = 0; at < outline.length; at++) {
            const start = outline[at]!;
            const end = outline[(at + 1) % outline.length]!;
            const from = dot2(start, family.across);
            const to = dot2(end, family.across);
            if (from === to) {
                continue;
            }
            const lowest = Math.max(steps.first, Math.floor((Math.min(from, to) - family.phase) / spacing));
            const highest = Math.min(steps.last, Math.ceil((Math.max(from, to) - family.phase) / spacing));
            for (let step = lowest; step <= highest; step++) {
                const offset = offsetOf(step);
                if ((from > offset) !== (to > offset)) {
                    crossings[step - steps.first]!.push(dot2(between2(start, end, (offset - from) / (to - from)), family.direction));
                }
            }
        }
    }
    return crossings;
};

export const clippedHatchLinesOf = (hatch: DrawingHatch, tolerance: number, property: string, budget?: WorkBudget): Segment2[] => {
    const outlines = hatchOutlinesOf(hatch, tolerance, budget);
    if (outlines.length === 0) {
        return [];
    }
    const lines: Segment2[] = [];
    let counted = 0;
    for (const family of hatchFamiliesOf(hatch)) {
        const steps = stepsAcross(outlines, family, hatch.spacing);
        counted += Math.max(0, steps.last - steps.first + 1);
        if (counted > MOST_HATCH_LINES) {
            throw new InputError(`\`${property}\` is ${hatch.spacing} for a region that would take more than ${MOST_HATCH_LINES} lines: widen the spacing.`, property);
        }
        crossingsOf(outlines, family, hatch.spacing, steps).forEach((crossing, at) => {
            const base = scale2(family.across, family.phase + (steps.first + at) * hatch.spacing);
            const sorted = [...crossing].sort((a, b) => a - b);
            for (let pair = 0; pair + 1 < sorted.length; pair += 2) {
                const enter = sorted[pair]!;
                const leave = sorted[pair + 1]!;
                if (leave - enter > SAME_POINT) {
                    lines.push([add2(base, scale2(family.direction, enter)), add2(base, scale2(family.direction, leave))]);
                }
            }
        });
    }
    return lines;
};

export const hatchFamiliesOf = (hatch: DrawingHatch): DrawingHatchFamily[] => HATCH_FAMILIES[hatch.pattern]!.map(([turn, share]) => {
    const angle = hatch.angle + turn;
    const direction = polar2(1, radiansOf(angle));
    return { turn, angle, direction, across: leftOf2(direction), phase: (1 - share) * hatch.spacing };
});

export const hatchLinesOf = (hatch: DrawingHatch, tolerance: number, property: string, budget?: WorkBudget): Segment2[] => {
    const region: DrawingPart = { layer: DEFAULT_LAYER, color: "#000000", lineType: Inputs.IO.lineTypeEnum.continuous, lineWeight: undefined, paths: hatch.boundaries, texts: [], hatches: [] };
    const bounds = drawingBounds([region], tolerance, budget);
    if (bounds === undefined) {
        return [];
    }
    const corners: Point2[] = [[bounds.min[0], bounds.min[1]], [bounds.max[0], bounds.min[1]], [bounds.max[0], bounds.max[1]], [bounds.min[0], bounds.max[1]]];
    const lines: Segment2[] = [];
    for (const family of hatchFamiliesOf(hatch)) {
        const reaches = corners.map(corner => dot2(corner, family.direction));
        const offsets = corners.map(corner => dot2(corner, family.across));
        const from = Math.min(...reaches);
        const to = Math.max(...reaches);
        const first = Math.ceil((Math.min(...offsets) - family.phase) / hatch.spacing);
        const last = Math.floor((Math.max(...offsets) - family.phase) / hatch.spacing);
        if (lines.length + Math.max(0, last - first + 1) > MOST_HATCH_LINES) {
            throw new InputError(`\`${property}\` is ${hatch.spacing} for a region that would take more than ${MOST_HATCH_LINES} lines: widen the spacing.`, property);
        }
        for (let step = first; step <= last; step++) {
            const base = scale2(family.across, family.phase + step * hatch.spacing);
            lines.push([add2(base, scale2(family.direction, from)), add2(base, scale2(family.direction, to))]);
        }
    }
    return lines;
};
