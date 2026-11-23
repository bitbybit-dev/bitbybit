import * as Inputs from "../../inputs";
import type * as Resolved from "../../resolved-inputs";
import { resolveDto } from "../../kernel-calls";
import { simplex } from "../../models/simplex";
import { clippedHatchLinesOf, hatchLinesOf, hatchOutlinesOf } from "../helpers/files/drawing/drawing-hatch";
import { drawingHatchOf, drawingTextOf, positiveNumber } from "../helpers/files/drawing/drawing-model";
import { scaledDrawingParts } from "../helpers/files/drawing/drawing-scale";
import { textStrokesOf } from "../helpers/files/drawing/drawing-text";
import { dimensionExtentOf, dimensionPictureOf } from "../helpers/files/drawing/drawing-dimension";
import { strokeFontInk } from "../helpers/text/stroke-font";
import type { Dxf } from "./dxf";
import type { Svg } from "./svg";

const HATCH_BOUNDS_TOLERANCE = 0.01;
const MEASURED_AT: Inputs.Base.Point2 = [0, 0];

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
     * Scales drawing parts about the origin, returning new parts and leaving the given ones unchanged.
     *
     * Points, radii, axes, text heights, hatch spacings and line weights are multiplied by `factor`;
     * angles, bulges, knots and weights stay. Scale before writing with `io.dxf.dxfCreate` or
     * `io.svg.svgCreate`: their `unit` labels the drawing and never scales it. A factor not above 0
     * throws.
     * @param inputs - The parts and the factor
     * @returns New parts, scaled
     * @group drawing
     * @shortname scale parts
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const plate = bitbybit.io.drawing.part({ layer: "cut", paths: [{ segments: [{ center: [0, 0], radius: 25.4 }] }], lineWeight: 0.5 });
     * const inches = bitbybit.io.drawing.scaleParts({ parts: [plate], factor: 1 / 25.4 });
     * const dxf = bitbybit.io.dxf.dxfCreate({ dxfPathsParts: inches, unit: Bit.Inputs.Base.unitOfLengthEnum.inch });
     * ```
     */
    scaleParts(inputs: Inputs.IO.DrawingScalePartsDto): Inputs.IO.DrawingPartDto[] {
        const resolved = resolveDto(Inputs.IO.DrawingScalePartsDto, inputs) as Resolved.IO.DrawingScalePartsDto;
        return scaledDrawingParts(resolved.parts, resolved.factor, "parts");
    }

    /**
     * Makes a line of text for a drawing part's `texts`, in the single-line stroke font.
     *
     * The text is placed by a point on its baseline; `anchor` says whether that point is its start,
     * middle or end, `rotation` turns it and `widthFactor` narrows or widens its letters.
     * @param inputs - The text, its position and height, its anchor, its angle and its width factor
     * @returns The text
     * @group drawing
     * @shortname text
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const title = bitbybit.io.drawing.text({ text: "BRACKET", position: [20, 10], height: 5 });
     * const notes = bitbybit.io.drawing.part({ layer: "text", paths: [], texts: [title], lineWeight: 0.35 });
     * ```
     */
    text(inputs: Inputs.IO.DrawingTextDto): Inputs.IO.DrawingTextDto {
        const resolved = resolveDto(Inputs.IO.DrawingTextDto, inputs) as Resolved.IO.DrawingTextDto;
        return resolved;
    }

    /**
     * Makes a hatched region for a drawing part's `hatches`: what the boundaries enclose, filled with
     * a pattern of lines or with solid ink.
     *
     * A boundary inside another cuts a hole, and a boundary whose ends do not meet is closed by a
     * straight line.
     * @param inputs - The boundary paths, the pattern, and the angle and spacing of its lines
     * @returns The hatch
     * @group drawing
     * @shortname hatch
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const outline = bitbybit.io.drawing.polylineSegment({ points: [[0, 0], [40, 0], [40, 30], [0, 30]], closed: true });
     * const bore = bitbybit.io.drawing.circleSegment({ center: [20, 15], radius: 6 });
     * const cut = bitbybit.io.drawing.hatch({ boundaries: [{ segments: [outline] }, { segments: [bore] }], angle: 45, spacing: 3 });
     * const section = bitbybit.io.drawing.part({ layer: "hatch", paths: [], hatches: [cut], lineWeight: 0.18 });
     * ```
     */
    hatch(inputs: Inputs.IO.DrawingHatchDto): Inputs.IO.DrawingHatchDto {
        const resolved = resolveDto(Inputs.IO.DrawingHatchDto, inputs) as Resolved.IO.DrawingHatchDto;
        return resolved;
    }

    /**
     * Gives the lines of a hatch's pattern, each from side to side of the box around its
     * boundaries, for a renderer that draws them itself and clips them to the region.
     *
     * The lines stand where `io.svg.svgCreate` and `io.dxf.dxfCreate` put them, each whole. `solid`
     * gives none, and a spacing too fine for the region throws.
     * @param inputs - The boundary paths, the pattern, and the angle and spacing of its lines
     * @returns The lines, each a start and an end point
     * @group drawing
     * @shortname hatch lines
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const outline = bitbybit.io.drawing.polylineSegment({ points: [[0, 0], [40, 0], [40, 30], [0, 30]], closed: true });
     * const lines = bitbybit.io.drawing.hatchLines({ boundaries: [{ segments: [outline] }], angle: 45, spacing: 3 });
     * ```
     */
    hatchLines(inputs: Inputs.IO.DrawingHatchDto): Inputs.Base.Segment2[] {
        const resolved = resolveDto(Inputs.IO.DrawingHatchDto, inputs) as Resolved.IO.DrawingHatchDto;
        return hatchLinesOf(drawingHatchOf(resolved, ""), HATCH_BOUNDS_TOLERANCE, "spacing");
    }

    /**
     * Gives the lines of a hatch's pattern clipped to its region, for a renderer that draws them
     * itself.
     *
     * Inside follows the even-odd rule over every boundary, as `io.svg.svgCreate` fills a hatch, and
     * curves are followed within `tolerance`. The lines stand where `hatchLines` puts them. `solid`
     * gives none; a spacing too fine for the region throws.
     * @param inputs - The boundary paths, the pattern, the angle and spacing of its lines, and the tolerance for curves
     * @returns The pieces of the lines inside the region, each a start and an end point
     * @group drawing
     * @shortname clipped hatch lines
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const outline = bitbybit.io.drawing.polylineSegment({ points: [[0, 0], [40, 0], [40, 30], [0, 30]], closed: true });
     * const bore = bitbybit.io.drawing.circleSegment({ center: [20, 15], radius: 6 });
     * const lines = bitbybit.io.drawing.clippedHatchLines({ boundaries: [{ segments: [outline] }, { segments: [bore] }], angle: 45, spacing: 3, tolerance: 0.01 });
     * ```
     */
    clippedHatchLines(inputs: Inputs.IO.DrawingHatchRegionDto): Inputs.Base.Segment2[] {
        const resolved = resolveDto(Inputs.IO.DrawingHatchRegionDto, inputs) as Resolved.IO.DrawingHatchRegionDto;
        const tolerance = positiveNumber(resolved.tolerance, "tolerance");
        return clippedHatchLinesOf(drawingHatchOf(resolved, ""), tolerance, "spacing");
    }

    /**
     * Gives the outlines of a hatch's region as closed loops of points, curves followed within
     * `tolerance`, for a renderer that fills the region itself.
     *
     * Each loop lists every corner once. Fill them under the even-odd rule, as
     * `mesh.triangulateLoops` does, to keep the holes open.
     * Example: a circle of radius 5 at tolerance 0.01 -> one loop of 50 points
     * @param inputs - The boundary paths and the tolerance for curves; the pattern, angle and spacing play no part
     * @returns The loops, each a list of points
     * @group drawing
     * @shortname hatch outlines
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const outline = bitbybit.io.drawing.polylineSegment({ points: [[0, 0], [40, 0], [40, 30], [0, 30]], closed: true });
     * const bore = bitbybit.io.drawing.circleSegment({ center: [20, 15], radius: 6 });
     * const loops = bitbybit.io.drawing.hatchOutlines({ boundaries: [{ segments: [outline] }, { segments: [bore] }], tolerance: 0.01 });
     * ```
     */
    hatchOutlines(inputs: Inputs.IO.DrawingHatchRegionDto): Inputs.Base.Point2[][] {
        const resolved = resolveDto(Inputs.IO.DrawingHatchRegionDto, inputs) as Resolved.IO.DrawingHatchRegionDto;
        const tolerance = positiveNumber(resolved.tolerance, "tolerance");
        return hatchOutlinesOf(drawingHatchOf(resolved, ""), tolerance);
    }

    /**
     * Measures a drawing text: its length along the baseline, and how far the font's ink reaches
     * above and below it.
     *
     * The width is what `io.svg.svgCreate` draws and `io.dxf.dxfCreate` fits the text to; the
     * position is not needed to measure it. A text that is not one line throws.
     * Example: 'I' at height 21 -> width 8, above 25, below 7
     * @param inputs - The text with its height and width factor
     * @returns The width, and the reach of the font's ink above and below the baseline
     * @group drawing
     * @shortname text size
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const size = bitbybit.io.drawing.textSize({ text: "SECTION A-A", position: [0, 0], height: 3.5 });
     * const cellWidth = size.width + 2;
     * ```
     */
    textSize(inputs: Inputs.IO.DrawingTextDto): Inputs.IO.DrawingTextSizeDto {
        const resolved = resolveDto(Inputs.IO.DrawingTextDto, inputs) as Resolved.IO.DrawingTextDto;
        const text = drawingTextOf({ ...resolved, position: resolved.position ?? MEASURED_AT }, "");
        const ink = strokeFontInk(simplex);
        return { width: text.width, above: ink.highest * text.height, below: -ink.lowest * text.height };
    }

    /**
     * Draws a drawing text as the strokes of its letters, each a list of points in the drawing's
     * coordinates, placed, turned and narrowed as the text says.
     *
     * These are the strokes `io.svg.svgCreate` writes. A text that is not one line throws.
     * Example: 'I' at height 21 from [10, 20] -> one stroke, [[14, 41, 0], [14, 20, 0]]
     * @param inputs - The text, its position and height, its anchor, its angle and its width factor
     * @returns The strokes, each a list of points
     * @group drawing
     * @shortname text strokes
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const strokes = bitbybit.io.drawing.textStrokes({ text: "A-A", position: [0, 0], height: 5, anchor: "middle" });
     * ```
     */
    textStrokes(inputs: Inputs.IO.DrawingTextDto): Inputs.Base.Point3[][] {
        const resolved = resolveDto(Inputs.IO.DrawingTextDto, inputs) as Resolved.IO.DrawingTextDto;
        return textStrokesOf(drawingTextOf(resolved, ""));
    }

    /**
     * Draws a dimension in the drawing's plane: its dimension line or arc, its extension lines, filled
     * arrowheads touching them, and its value in the stroke font.
     *
     * The text reads from left to right or from bottom to top, past the line's end when the line is
     * too short for it; arrows go outside a span too short for them.
     * @param inputs - What the dimension measures, its points, its tolerance and the size of its text and arrows
     * @returns The lines, the arrowheads to fill, the text as strokes and as a drawing text, and the box they fill
     * @group drawing
     * @shortname dimension picture
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const picture = bitbybit.io.drawing.dimensionPicture({ kind: Bit.Inputs.IO.dimensionKindEnum.linear, start: [0, 0], end: [60, 0], offset: 12, upperTolerance: 0.1, lowerTolerance: 0.1 });
     * const edges = bitbybit.io.drawing.part({ layer: "dimensions", paths: [...picture.lines, ...picture.textStrokes].map(points => ({ segments: [{ points }] })) });
     * ```
     */
    dimensionPicture(inputs: Inputs.IO.DrawingDimensionDto): Inputs.IO.DrawingDimensionPictureDto {
        const resolved = resolveDto(Inputs.IO.DrawingDimensionDto, inputs) as Resolved.IO.DrawingDimensionDto;
        return dimensionPictureOf(resolved);
    }

    /**
     * Measures the box a dimension's picture fills, the box `dimensionPicture` gives, without drawing
     * the letters.
     *
     * The box holds the whole height the stroke font's letters may reach, so a layout can make room
     * before drawing.
     * Example: a linear dimension from [0, 0] to [60, 0] at offset 12 -> min [0, 0.875], max [60, 17.04]
     * @param inputs - What the dimension measures, its points, its tolerance and the size of its text and arrows
     * @returns The lowest and highest corners of the box
     * @group drawing
     * @shortname dimension extent
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const box = bitbybit.io.drawing.dimensionExtent({ kind: Bit.Inputs.IO.dimensionKindEnum.diameter, start: [0, 0], end: [5, 0] });
     * const width = box.max[0] - box.min[0];
     * ```
     */
    dimensionExtent(inputs: Inputs.IO.DrawingDimensionDto): Inputs.IO.DrawingExtentDto {
        const resolved = resolveDto(Inputs.IO.DrawingDimensionDto, inputs) as Resolved.IO.DrawingDimensionDto;
        return dimensionExtentOf(resolved);
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
