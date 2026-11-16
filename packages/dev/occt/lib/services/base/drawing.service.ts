import type { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { Base } from "../../api/inputs";
import type { IO } from "@bitbybit-dev/base/lib/api/inputs/io-inputs";
import type { CurveTracing, ShapeTracing } from "./drawing-types";

type DrawingSegment = IO.DrawingPathDto["segments"][number];

const CIRCLE_SEGMENT = 0;
const POLYLINE_SEGMENT = 1;
const ELLIPSE_SEGMENT = 2;
const EXACT_ANGULAR_DEFLECTION = 0.1;
const EXACT_MINIMUM_OF_POINTS = 2;
const EXACT_PARAMETER_TOLERANCE = 1e-9;
const EXACT_SHORTEST_EDGE = 1e-7;

export const exactTracing = (precision: number): CurveTracing => ({
    angularDeflection: EXACT_ANGULAR_DEFLECTION,
    curvatureDeflection: precision,
    minimumOfPoints: EXACT_MINIMUM_OF_POINTS,
    uTolerance: EXACT_PARAMETER_TOLERANCE,
    minimumLength: EXACT_SHORTEST_EDGE,
    exactCurves: true,
});

export class DrawingService {

    constructor(private readonly occ: BitbybitOcctModule) { }

    pathsOfShape(inputs: ShapeTracing): IO.DrawingPathDto[] {
        const values = this.occ.DrawingPathsOf(inputs.shape, inputs.angularDeflection, inputs.curvatureDeflection,
            inputs.minimumOfPoints, inputs.uTolerance, inputs.minimumLength, inputs.exactCurves);
        let at = 0;
        const next = (): number => values[at++]!;
        const point = (): Base.Point2 => [next(), next()];
        const segment = (): DrawingSegment => {
            const kind = next();
            if (kind === CIRCLE_SEGMENT) {
                return { center: point(), radius: next() };
            }
            if (kind === POLYLINE_SEGMENT) {
                const closed = next() === 1;
                const points: Base.Point2[] = [];
                const bulges: number[] = [];
                const count = next();
                for (let vertex = 0; vertex < count; vertex++) {
                    points.push(point());
                    bulges.push(next());
                }
                return { points, closed, bulges };
            }
            if (kind === ELLIPSE_SEGMENT) {
                const center = point();
                const majorAxis = point();
                const ratio = next();
                const start = next();
                const end = next();
                return { center, majorAxis, ratio, startParameter: Math.min(start, end), endParameter: Math.max(start, end) };
            }
            const degree = next();
            const rational = next() === 1;
            const poleCount = next();
            const knots = Array.from({ length: next() }, next);
            const controlPoints: Base.Point2[] = [];
            const weights: number[] = [];
            for (let pole = 0; pole < poleCount; pole++) {
                controlPoints.push(point());
                weights.push(next());
            }
            return rational ? { controlPoints, degree, knots, weights } : { controlPoints, degree, knots };
        };
        return Array.from({ length: next() }, () => ({ segments: Array.from({ length: next() }, segment) }));
    }

}
