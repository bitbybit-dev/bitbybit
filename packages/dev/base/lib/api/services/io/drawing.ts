import * as Inputs from "../../inputs";
import type * as Resolved from "../../resolved-inputs";
import { resolveDto } from "../../kernel-calls";
import type { Dxf } from "./dxf";
import type { Svg } from "./svg";

/**
 * Builds drawings as data, for any file format: segments of every kind, paths joined from segments,
 * and parts that put paths on a layer with a color and a line type. `io.dxf.dxfCreate` writes the
 * parts as DXF and `io.svg.svgCreate` as SVG; `svgToDxf` and `dxfToSvg` convert one file into the
 * other through these parts.
 */
export class Drawing {

    constructor(private readonly dxfOf: () => Dxf, private readonly svgOf: () => Svg) { }

    /**
     * Makes a straight segment of a drawing path, from `start` to `end`.
     * @param inputs - The start and the end point
     * @returns The line segment
     * @group drawing
     * @shortname line segment
     * @drawable false
     * @example
     * ```typescript
     * const edge = bitbybit.io.drawing.lineSegment({ start: [0, 0], end: [40, 0] });
     * ```
     */
    lineSegment(inputs: Inputs.IO.DrawingLineSegmentDto): Inputs.IO.DrawingLineSegmentDto {
        return inputs;
    }

    /**
     * Makes a circular arc of a drawing path, running counterclockwise about its `center` from
     * `startAngle` to `endAngle`, in degrees, in the XY plane unless a `normal` tilts it.
     * @param inputs - The center, the radius, the start and end angles and the plane's normal
     * @returns The arc segment
     * @group drawing
     * @shortname arc segment
     * @drawable false
     * @example
     * ```typescript
     * const corner = bitbybit.io.drawing.arcSegment({ center: [0, 0], radius: 10, startAngle: 0, endAngle: 90 });
     * ```
     */
    arcSegment(inputs: Inputs.IO.DrawingArcSegmentDto): Inputs.IO.DrawingArcSegmentDto {
        return inputs;
    }

    /**
     * Makes a whole circle of a drawing path from its `center` and `radius`, in the XY plane unless a
     * `normal` tilts it.
     * @param inputs - The center, the radius and the plane's normal
     * @returns The circle segment
     * @group drawing
     * @shortname circle segment
     * @drawable false
     * @example
     * ```typescript
     * const hole = bitbybit.io.drawing.circleSegment({ center: [20, 15], radius: 6 });
     * ```
     */
    circleSegment(inputs: Inputs.IO.DrawingCircleSegmentDto): Inputs.IO.DrawingCircleSegmentDto {
        return inputs;
    }

    /**
     * Makes connected straight segments through `points`, which `bulges` can bend into arcs;
     * `closed` joins the last point back to the first.
     * @param inputs - The points, whether the polyline is closed, and the bulges
     * @returns The polyline segment
     * @group drawing
     * @shortname polyline segment
     * @drawable false
     * @example
     * ```typescript
     * const slot = bitbybit.io.drawing.polylineSegment({ points: [[0, 0], [30, 0], [30, 10], [0, 10]], closed: true, bulges: [0, 1, 0, 1] });
     * ```
     */
    polylineSegment(inputs: Inputs.IO.DrawingPolylineSegmentDto): Inputs.IO.DrawingPolylineSegmentDto {
        const resolved = resolveDto(Inputs.IO.DrawingPolylineSegmentDto, inputs) as Resolved.IO.DrawingPolylineSegmentDto;
        return resolved;
    }

    /**
     * Makes a B-spline or NURBS curve of a drawing path from its control points and degree, with
     * its knots and weights when they are given.
     * @param inputs - The control points, the degree, whether it is closed, the knots and the weights
     * @returns The spline segment
     * @group drawing
     * @shortname spline segment
     * @drawable false
     * @example
     * ```typescript
     * const wave = bitbybit.io.drawing.splineSegment({ controlPoints: [[0, 0], [10, 8], [20, -8], [30, 0]], degree: 3 });
     * ```
     */
    splineSegment(inputs: Inputs.IO.DrawingSplineSegmentDto): Inputs.IO.DrawingSplineSegmentDto {
        const resolved = resolveDto(Inputs.IO.DrawingSplineSegmentDto, inputs) as Resolved.IO.DrawingSplineSegmentDto;
        return resolved;
    }

    /**
     * Makes an ellipse, or an arc of one, for a drawing path.
     *
     * The ellipse is given by its center, the vector to the end of its major axis and the minor to
     * major ratio; parameters in radians pick the arc, running counterclockwise about the normal.
     * @param inputs - The center, the major axis, the ratio, the start and end parameters and the plane's normal
     * @returns The ellipse segment
     * @group drawing
     * @shortname ellipse segment
     * @drawable false
     * @example
     * ```typescript
     * const lens = bitbybit.io.drawing.ellipseSegment({ center: [0, 0], majorAxis: [20, 0], ratio: 0.5, startParameter: 0, endParameter: Math.PI });
     * ```
     */
    ellipseSegment(inputs: Inputs.IO.DrawingEllipseSegmentDto): Inputs.IO.DrawingEllipseSegmentDto {
        const resolved = resolveDto(Inputs.IO.DrawingEllipseSegmentDto, inputs) as Resolved.IO.DrawingEllipseSegmentDto;
        return resolved;
    }

    /**
     * Joins segments into one path, drawn in order like the edges of a wire; segments that meet
     * are drawn as one stroke in SVG.
     * @param inputs - The segments, in order
     * @returns The path
     * @group drawing
     * @shortname path
     * @drawable false
     * @example
     * ```typescript
     * const edge = bitbybit.io.drawing.lineSegment({ start: [0, 0], end: [40, 0] });
     * const corner = bitbybit.io.drawing.arcSegment({ center: [40, 10], radius: 10, startAngle: 270, endAngle: 360 });
     * const outline = bitbybit.io.drawing.path({ segments: [edge, corner] });
     * ```
     */
    path(inputs: Inputs.IO.DrawingPathDto): Inputs.IO.DrawingPathDto {
        return inputs;
    }

    /**
     * Puts paths on a named layer with a color and a line type, making one part of a drawing.
     *
     * A drawing may hold several parts; `io.dxf.dxfCreate` writes them as DXF and `io.svg.svgCreate`
     * as SVG.
     * @param inputs - The layer name, the color, the paths and the line type
     * @returns The part
     * @group drawing
     * @shortname part
     * @drawable false
     * @example
     * ```typescript
     * const square = bitbybit.io.drawing.polylineSegment({ points: [[0, 0], [40, 0], [40, 30], [0, 30]], closed: true });
     * const cut = bitbybit.io.drawing.part({ layer: "cut", color: "#ff0000", paths: [{ segments: [square] }] });
     * ```
     */
    part(inputs: Inputs.IO.DrawingPartDto): Inputs.IO.DrawingPartDto {
        const resolved = resolveDto(Inputs.IO.DrawingPartDto, inputs) as Resolved.IO.DrawingPartDto;
        return resolved;
    }

    /**
     * Converts an SVG file into a DXF file, reading it as `io.svg.svgRead` does and writing it as
     * `io.dxf.dxfCreate` does.
     *
     * Inkscape layers, stroke colors and dash patterns become DXF layers, colors and line types, and
     * curves stay exact. With `unit` the drawing is read at true size and the DXF states that unit. A
     * drawing too large to write throws.
     * @param inputs - The SVG text, the unit, whether hidden elements are written, and the DXF's color format, version and curve tolerance
     * @returns The DXF text and the reading's warnings
     * @group convert
     * @shortname svg to dxf
     * @drawable false
     * @example
     * ```typescript
     * const converted = bitbybit.io.drawing.svgToDxf({ svg: svgText, unit: Bit.Inputs.Base.unitOfLengthEnum.millimetre });
     * const drawing = bitbybit.io.dxf.dxfRead({ dxf: converted.dxf });
     * ```
     */
    svgToDxf(inputs: Inputs.IO.SvgToDxfDto): Inputs.IO.SvgToDxfResultDto {
        const resolved = resolveDto(Inputs.IO.SvgToDxfDto, inputs) as Resolved.IO.SvgToDxfDto;
        const drawing = this.svgOf().svgRead({ svg: resolved.svg, unit: resolved.unit, includeInvisible: resolved.includeInvisible });
        const dxf = this.dxfOf().dxfCreate({
            dxfPathsParts: drawing.parts,
            colorFormat: resolved.colorFormat,
            acadVersion: resolved.acadVersion,
            unit: resolved.unit,
            curveTolerance: resolved.curveTolerance,
        });
        return { dxf, warnings: drawing.warnings };
    }

    /**
     * Converts a DXF file into an SVG file, reading it as `io.dxf.dxfRead` does and writing it as
     * `io.svg.svgCreate` does.
     *
     * Layers become Inkscape layers and the SVG takes its true size from the unit the DXF states.
     * Splines given only by fit points are left out and named in `warnings`; a drawing too large to
     * write throws.
     * @param inputs - The DXF file as text or bytes, whether hidden layers are written, and the SVG's line width, border and curve tolerance
     * @returns The SVG text and the reading's warnings
     * @group convert
     * @shortname dxf to svg
     * @drawable false
     * @example
     * ```typescript
     * const converted = bitbybit.io.drawing.dxfToSvg({ dxf: dxfText, includeHiddenLayers: true });
     * const drawing = bitbybit.io.svg.svgRead({ svg: converted.svg });
     * ```
     */
    dxfToSvg(inputs: Inputs.IO.DxfToSvgDto): Inputs.IO.DxfToSvgResultDto {
        const resolved = resolveDto(Inputs.IO.DxfToSvgDto, inputs) as Resolved.IO.DxfToSvgDto;
        const drawing = this.dxfOf().dxfRead({ dxf: resolved.dxf, includeHiddenLayers: resolved.includeHiddenLayers });
        const svg = this.svgOf().svgCreate({
            parts: drawing.parts,
            unit: drawing.unit,
            strokeWidth: resolved.strokeWidth,
            margin: resolved.margin,
            tolerance: resolved.tolerance,
        });
        return { svg, warnings: drawing.warnings };
    }

}
