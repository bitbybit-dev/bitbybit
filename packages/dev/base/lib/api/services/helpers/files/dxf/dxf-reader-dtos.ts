import type * as Inputs from "../../../../inputs";
import { unitOf } from "../../geometry/frame-axes";
import { degreesOf } from "../../geometry/scalars";
import { dot3, length3 } from "../../geometry/vectors";
import { ocsAxesOf } from "../drawing/drawing-geometry";
import { polylineSegments, principalConicOf } from "./dxf-reader-geometry";
import type { ReadConic, ReadDrawing, ReadPolyline, ReadSegment } from "./dxf-reader-types";
import { DXF_TURN_SLACK } from "./dxf.constants";

type DxfSegment = Inputs.IO.DrawingPathDto["segments"][number];
type Vec3 = Inputs.Base.Vector3;

const AXIS_SLACK = 1e-12;
const ROUND_SHARE = 1e-12;

const alongZ = (normal: Vec3): number => (Math.abs(normal[0]) <= AXIS_SLACK && Math.abs(normal[1]) <= AXIS_SLACK ? Math.sign(normal[2]) : 0);

export const conicSegmentDto = (conic: ReadConic): DxfSegment | undefined => {
    const principal = principalConicOf(conic);
    if (principal === undefined) {
        return undefined;
    }
    const majorLength = length3(principal.major);
    const normal = alongZ(principal.normal) > 0 ? {} : { normal: principal.normal };
    if (Math.abs(principal.minor - majorLength) <= ROUND_SHARE * majorLength) {
        if (principal.end - principal.start >= 2 * Math.PI - DXF_TURN_SLACK) {
            return { center: principal.center, radius: majorLength, ...normal };
        }
        const axes = ocsAxesOf(principal.normal);
        const direction = unitOf(principal.major)!;
        const offset = Math.atan2(dot3(direction, axes.y), dot3(direction, axes.x));
        return { center: principal.center, radius: majorLength, startAngle: degreesOf(offset + principal.start), endAngle: degreesOf(offset + principal.end), ...normal };
    }
    return { center: principal.center, majorAxis: principal.major, ratio: principal.minor / majorLength, startParameter: principal.start, endParameter: principal.end, ...normal };
};

const polylineDtos = (polyline: ReadPolyline): (DxfSegment | undefined)[] => {
    const facing = alongZ(polyline.normal);
    if (polyline.bulges.every(bulge => bulge === 0)) {
        return [{ points: [...polyline.points], bulges: [...polyline.bulges], closed: polyline.closed }];
    }
    if (facing !== 0) {
        const height = polyline.points[0]![2];
        return [{ points: polyline.points.map((point): Inputs.Base.Point3 => [point[0], point[1], height]), bulges: polyline.bulges.map(bulge => (bulge === 0 ? 0 : facing * bulge)), closed: polyline.closed }];
    }
    return polylineSegments(polyline).flatMap(segmentDtos);
};

const segmentDtos = (segment: ReadSegment): (DxfSegment | undefined)[] => {
    switch (segment.kind) {
        case "line":
            return [{ start: segment.start, end: segment.end }];
        case "conic":
            return [conicSegmentDto(segment)];
        case "polyline":
            return polylineDtos(segment);
        case "spline": {
            const rational = segment.curve.weights.some(weight => weight !== 1);
            const spline = { controlPoints: [...segment.curve.points], degree: segment.curve.degree, knots: [...segment.curve.knots] };
            return [rational ? { ...spline, weights: [...segment.curve.weights] } : spline];
        }
        case "fit":
            return [];
    }
};

export const drawingDtoOf = (drawing: ReadDrawing): Inputs.IO.DxfDrawingDto => {
    const parts = new Map<string, Inputs.IO.DrawingPartDto>();
    let fitSplines = 0;
    let flatArcs = 0;
    let simplified = 0;
    for (const entity of drawing.entities) {
        const key = `${entity.style.layer}\n${entity.style.color}\n${entity.style.lineType}`;
        const part = parts.get(key) ?? { layer: entity.style.layer, color: entity.style.color, lineType: entity.style.lineType, paths: [] };
        parts.set(key, part);
        fitSplines += entity.segments.filter(segment => segment.kind === "fit").length;
        const dtos = entity.segments.flatMap(segmentDtos);
        const segments = dtos.filter((dto): dto is DxfSegment => dto !== undefined);
        flatArcs += dtos.length - segments.length;
        if (segments.length > 0) {
            part.paths.push({ segments });
        }
        if (entity.text !== undefined) {
            const { value, ...placed } = entity.text;
            const texts = part.texts ?? [];
            part.texts = texts;
            texts.push({ text: value, ...placed });
        }
        if (entity.hatch !== undefined) {
            const { boundaries, pattern, angle, spacing } = entity.hatch;
            const paths = boundaries.map(loop => {
                const read = loop.flatMap(segmentDtos);
                const kept = read.filter((dto): dto is DxfSegment => dto !== undefined);
                flatArcs += read.length - kept.length;
                return { segments: kept };
            }).filter(path => path.segments.length > 0);
            simplified += entity.hatch.simplified ? 1 : 0;
            if (paths.length > 0) {
                const hatches = part.hatches ?? [];
                part.hatches = hatches;
                hatches.push({ boundaries: paths, pattern, angle, spacing });
            }
        }
    }
    const simplifiedWarning = `${simplified} ${simplified === 1 ? "hatch has" : "hatches have"} a pattern other than single, paired or crossed lines; ${simplified === 1 ? "it is" : "they are"} read as single lines.`;
    const fitWarning = `${fitSplines} ${fitSplines === 1 ? "spline is" : "splines are"} given only by fit points, which need a kernel to interpolate; they were left out here, and occt.io.loadDxf reads them.`;
    const flatWarning = `${flatArcs} ${flatArcs === 1 ? "arc" : "arcs"} could not be drawn: a radius, a plane or a sweep is missing.`;
    return {
        parts: [...parts.values()].filter(part => part.paths.length > 0 || part.texts !== undefined || part.hatches !== undefined),
        unit: drawing.unit,
        version: drawing.version,
        warnings: [...drawing.warnings, ...(fitSplines === 0 ? [] : [fitWarning]), ...(flatArcs === 0 ? [] : [flatWarning]), ...(simplified === 0 ? [] : [simplifiedWarning])],
    };
};
