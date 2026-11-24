import * as Inputs from "../../../../inputs";
import { scale2, scale3 } from "../../geometry/vectors";
import { drawingPartsOf, positiveNumber, segmentKindOf } from "./drawing-model";

type Point = Inputs.Base.Point2 | Inputs.Base.Point3;
type SegmentInput = Inputs.IO.DrawingPathDto["segments"][number];

const TEXT_DEFAULTS = new Inputs.IO.DrawingTextDto();
const HATCH_DEFAULTS = new Inputs.IO.DrawingHatchDto();

const scaledPoint = (point: Point, factor: number): Point => point.length === 2 ? scale2(point, factor) : scale3(point, factor);

const scaledPoints = (points: readonly Point[], factor: number): Point[] => points.map(point => scaledPoint(point, factor));

const copiedNormal = (normal: Inputs.Base.Vector3 | undefined): Pick<Inputs.IO.DrawingCircleSegmentDto, "normal"> => normal === undefined ? {} : { normal: [...normal] };

const scaledSegment = (segment: SegmentInput, factor: number): SegmentInput => {
    switch (segmentKindOf(segment)) {
        case "ellipse": {
            const ellipse = segment as Inputs.IO.DrawingEllipseSegmentDto;
            return { ...ellipse, center: scaledPoint(ellipse.center, factor), majorAxis: scaledPoint(ellipse.majorAxis, factor), ...copiedNormal(ellipse.normal) };
        }
        case "arc":
        case "circle": {
            const round = segment as Inputs.IO.DrawingCircleSegmentDto;
            return { ...round, center: scaledPoint(round.center, factor), radius: round.radius * factor, ...copiedNormal(round.normal) };
        }
        case "line": {
            const line = segment as Inputs.IO.DrawingLineSegmentDto;
            return { ...line, start: scaledPoint(line.start, factor), end: scaledPoint(line.end, factor) };
        }
        case "polyline": {
            const polyline = segment as Inputs.IO.DrawingPolylineSegmentDto;
            return { ...polyline, points: scaledPoints(polyline.points, factor), ...(polyline.bulges === undefined ? {} : { bulges: [...polyline.bulges] }) };
        }
        default: {
            const spline = segment as Inputs.IO.DrawingSplineSegmentDto;
            return {
                ...spline,
                controlPoints: scaledPoints(spline.controlPoints, factor),
                ...(spline.knots === undefined ? {} : { knots: [...spline.knots] }),
                ...(spline.weights === undefined ? {} : { weights: [...spline.weights] }),
            };
        }
    }
};

const scaledPath = (path: Inputs.IO.DrawingPathDto, factor: number): Inputs.IO.DrawingPathDto =>
    ({ ...path, segments: path.segments.map(segment => scaledSegment(segment, factor)) });

const scaledText = (text: Inputs.IO.DrawingTextDto, factor: number): Inputs.IO.DrawingTextDto =>
    ({ ...text, position: scaledPoint(text.position, factor), height: (text.height ?? TEXT_DEFAULTS.height!) * factor });

const scaledHatch = (hatch: Inputs.IO.DrawingHatchDto, factor: number): Inputs.IO.DrawingHatchDto =>
    ({ ...hatch, boundaries: hatch.boundaries.map(path => scaledPath(path, factor)), spacing: (hatch.spacing ?? HATCH_DEFAULTS.spacing!) * factor });

const scaledPart = (part: Inputs.IO.DrawingPartDto, factor: number): Inputs.IO.DrawingPartDto => {
    const texts = part.texts?.map(text => scaledText(text, factor));
    const hatches = part.hatches?.map(hatch => scaledHatch(hatch, factor));
    return {
        ...part,
        paths: part.paths.map(path => scaledPath(path, factor)),
        ...(texts === undefined ? {} : { texts }),
        ...(hatches === undefined ? {} : { hatches }),
        ...(typeof part.lineWeight === "number" ? { lineWeight: part.lineWeight * factor } : {}),
    };
};

export const scaledDrawingParts = (parts: readonly unknown[] | undefined, factor: unknown, property: string): Inputs.IO.DrawingPartDto[] => {
    const checkedFactor = positiveNumber(factor, "factor");
    drawingPartsOf(parts, property);
    return (parts as readonly Inputs.IO.DrawingPartDto[]).map(part => scaledPart(part, checkedFactor));
};
