import type * as Inputs from "../../../../inputs";
import { bulgeOfSweep, conicArcSamples, ellipseFramePoint } from "../../curves/conic-arcs";
import type { WorkBudget } from "../work-budget";
import { circleArcOf, meetsReversed, pointsMeet, polylineSpans, segmentSamples } from "./drawing-geometry";
import type { DrawingArc, DrawingCircle, DrawingLoop, DrawingPath, DrawingSegment } from "./drawing-types";
import { JOIN_DISTANCE } from "./drawing.constants";

type Point2 = Inputs.Base.Point2;
type Point3 = Inputs.Base.Point3;

interface Run {
    readonly points: Point2[];
    readonly bulges: number[];
}

const flat = (point: Point3): Point2 => [point[0], point[1]];

const straightRun = (points: readonly Point3[]): Run => ({ points: points.map(flat), bulges: points.slice(1).map(() => 0) });

const circularRun = (segment: DrawingCircle | DrawingArc, tolerance: number, budget: WorkBudget | undefined): Run => {
    const arc = circleArcOf(segment);
    if (segment.normal[0] !== 0 || segment.normal[1] !== 0) {
        return straightRun(conicArcSamples(arc, tolerance, budget));
    }
    const spans = Math.max(1, Math.ceil(arc.sweep / Math.PI - JOIN_DISTANCE));
    const step = arc.sweep / spans;
    const bulge = Math.sign(segment.normal[2]) * bulgeOfSweep(step);
    return {
        points: Array.from({ length: spans + 1 }, (_, at) => flat(ellipseFramePoint(arc.frame, arc.start + at * step))),
        bulges: Array.from({ length: spans }, () => bulge),
    };
};

const runOf = (segment: DrawingSegment, tolerance: number, budget: WorkBudget | undefined): Run => {
    switch (segment.kind) {
        case "line":
            return straightRun([segment.start, segment.end]);
        case "polyline": {
            const spans = polylineSpans(segment);
            return {
                points: Array.from({ length: spans + 1 }, (_, at) => flat(segment.points[at % segment.points.length]!)),
                bulges: Array.from({ length: spans }, (_, span) => segment.planar ? segment.bulges[span] ?? 0 : 0),
            };
        }
        case "circle":
        case "arc":
            return circularRun(segment, tolerance, budget);
        default:
            return straightRun(segmentSamples(segment, tolerance, budget));
    }
};

const reversed = (run: Run): Run => ({ points: [...run.points].reverse(), bulges: [...run.bulges].reverse().map(bulge => -bulge) });

const appended = (open: Run, run: Run): void => {
    for (let at = 1; at < run.points.length; at++) {
        open.points.push(run.points[at]!);
    }
    for (const bulge of run.bulges) {
        open.bulges.push(bulge);
    }
};

export const drawingLoopsOf = (paths: readonly DrawingPath[], tolerance: number, budget?: WorkBudget): DrawingLoop[] => {
    const loops: DrawingLoop[] = [];
    let open: Run | undefined;
    const close = (): void => {
        if (open !== undefined && open.points.length > 1) {
            if (pointsMeet(open.points[0], open.points[open.points.length - 1]!)) {
                open.points.pop();
            } else {
                open.bulges.push(0);
            }
            if (open.points.length > 2 || open.bulges.some(bulge => bulge !== 0)) {
                loops.push(open);
            }
        }
        open = undefined;
    };
    for (const path of paths) {
        for (const segment of path.segments) {
            let run = runOf(segment, tolerance, budget);
            if (run.points.length < 2) {
                continue;
            }
            if (open !== undefined) {
                const end = open.points[open.points.length - 1]!;
                if (meetsReversed(end, run.points[0]!, run.points[run.points.length - 1]!)) {
                    run = reversed(run);
                }
                if (pointsMeet(end, run.points[0]!)) {
                    appended(open, run);
                    if (pointsMeet(open.points[0], open.points[open.points.length - 1]!)) {
                        close();
                    }
                    continue;
                }
                close();
            }
            open = { points: [...run.points], bulges: [...run.bulges] };
            if (pointsMeet(open.points[0], open.points[open.points.length - 1]!)) {
                close();
            }
        }
        close();
    }
    return loops;
};
