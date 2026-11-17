import { WorkBudget } from "../work-budget";
import type { DrawingPart, DrawingSegment } from "./drawing-types";
import { NUMBERS_PER_CURVE, NUMBERS_PER_PART, NUMBERS_PER_VERTEX, WRITER_WORK_CEILING, WRITER_WORK_FLOOR, WRITER_WORK_PER_NUMBER } from "./drawing.constants";

const segmentNumbers = (segment: DrawingSegment): number => {
    switch (segment.kind) {
        case "polyline":
            return segment.points.length * NUMBERS_PER_VERTEX;
        case "spline":
            return segment.curve.points.length * NUMBERS_PER_VERTEX + segment.curve.knots.length;
        default:
            return NUMBERS_PER_CURVE[segment.kind];
    }
};

export const writerBudgetOf = (parts: readonly DrawingPart[]): WorkBudget => {
    let numbers = 0;
    for (const part of parts) {
        numbers += NUMBERS_PER_PART;
        for (const path of part.paths) {
            for (const segment of path.segments) {
                numbers += segmentNumbers(segment);
            }
        }
    }
    return WorkBudget.forInput(numbers, WRITER_WORK_PER_NUMBER, WRITER_WORK_FLOOR, WRITER_WORK_CEILING);
};
