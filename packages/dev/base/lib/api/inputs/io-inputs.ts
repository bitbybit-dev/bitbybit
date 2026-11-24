import type { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */

/**
 * Parameters for reading and writing files: the data or shape to export, the target format and its
 * options, the file name, and the settings that control how imported content is interpreted.
 */
export namespace IO {

    /**
     * How the lines of a drawing part are drawn: whole, or broken into dashes, the dashes scaled to
     * the drawing's size. DXF writes the matching line type, SVG a dash pattern.
     */
    export enum lineTypeEnum {
        continuous = "continuous",
        dashed = "dashed",
        hidden = "hidden",
        center = "center",
        dotted = "dotted",
    }

    /**
     * What a hatch fills its region with: `solid` ink, or lines `spacing` apart - `ansi31` one run
     * of lines, `ansi32` lines in pairs a third of the spacing apart, `ansi37` two runs crossing at
     * right angles.
     *
     * The second line of each `ansi32` pair is drawn whole, where the ANSI32 of CAD programs dashes
     * it; a DXF file names the pattern ANSI32 at its standard scale.
     * @beta
     */
    export enum hatchPatternEnum {
        solid = "solid",
        ansi31 = "ansi31",
        ansi32 = "ansi32",
        ansi37 = "ansi37",
    }

    /**
     * What a dimension measures: a `linear` distance between two points, the `diameter` or the
     * `radius` of a circle, or the `angle` between two arms that meet at a point.
     * @beta
     */
    export enum dimensionKindEnum {
        linear = "linear",
        diameter = "diameter",
        radius = "radius",
        angular = "angular",
    }

    /**
     * A straight line in a drawing path, from `start` to `end`. Points may carry a Z coordinate; one
     * without it lies at Z 0.
     */
    export class DrawingLineSegmentDto {
        constructor(start?: Base.Point2 | Base.Point3, end?: Base.Point2 | Base.Point3) {
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
        }
        /**
         * Where the line starts.
         * @default undefined
         */
        start!: Base.Point2 | Base.Point3;
        /**
         * Where the line ends.
         * @default undefined
         */
        end!: Base.Point2 | Base.Point3;
    }

    /**
     * A circular arc in a drawing path, running counterclockwise from `startAngle` to `endAngle`
     * about its `center`, in the XY plane unless a `normal` tilts it.
     */
    export class DrawingArcSegmentDto {
        constructor(center?: Base.Point2 | Base.Point3, radius?: number, startAngle?: number, endAngle?: number, normal?: Base.Vector3) {
            if (center !== undefined) { this.center = center; }
            if (radius !== undefined) { this.radius = radius; }
            if (startAngle !== undefined) { this.startAngle = startAngle; }
            if (endAngle !== undefined) { this.endAngle = endAngle; }
            if (normal !== undefined) { this.normal = normal; }
        }
        /**
         * The center of the arc's circle.
         * @default undefined
         */
        center!: Base.Point2 | Base.Point3;
        /**
         * Distance from the center to the arc, in drawing units.
         * @default undefined
         * @minimum 0
         * @exclusiveMinimum true
         */
        radius!: number;
        /**
         * Where the arc starts, in degrees counterclockwise from the X axis (the X axis CAD programs
         * derive from the `normal` when one is given).
         * @default undefined
         */
        startAngle!: number;
        /**
         * Where the arc ends, in degrees; the arc runs counterclockwise from the start, through 0
         * when the end is below the start.
         * @default undefined
         */
        endAngle!: number;
        /**
         * The direction the arc's plane faces, counterclockwise seen from its tip. Leave it out for an
         * arc in the XY plane facing +Z.
         * @default undefined
         * @optional true
         */
        normal?: Base.Vector3 | undefined;
    }

    /**
     * A full circle in a drawing path, given by its center and radius, in the XY plane unless a
     * `normal` tilts it.
     */
    export class DrawingCircleSegmentDto {
        constructor(center?: Base.Point2 | Base.Point3, radius?: number, normal?: Base.Vector3) {
            if (center !== undefined) { this.center = center; }
            if (radius !== undefined) { this.radius = radius; }
            if (normal !== undefined) { this.normal = normal; }
        }
        /**
         * Where the circle's center lies; without a Z it lies at Z 0.
         * @default undefined
         */
        center!: Base.Point2 | Base.Point3;
        /**
         * Distance from the center to the circle, in drawing units.
         * @default undefined
         * @minimum 0
         * @exclusiveMinimum true
         */
        radius!: number;
        /**
         * The direction the circle's plane faces. Leave it out for a circle in the XY plane.
         * @default undefined
         * @optional true
         */
        normal?: Base.Vector3 | undefined;
    }

    /**
     * Connected straight segments through `points`, each of which a bulge can bend into an arc. A
     * polyline whose points do not all share one Z is written as a 3D polyline, which takes no bulges.
     */
    export class DrawingPolylineSegmentDto {
        constructor(points?: (Base.Point2 | Base.Point3)[], closed?: boolean, bulges?: number[]) {
            if (points !== undefined) { this.points = points; }
            if (closed !== undefined) { this.closed = closed; }
            if (bulges !== undefined) { this.bulges = bulges; }
        }
        /**
         * The vertices, in order. A last point equal to the first closes the polyline as `closed`
         * does.
         * @default undefined
         */
        points!: (Base.Point2 | Base.Point3)[];
        /**
         * Whether a segment joins the last vertex back to the first.
         * @default false
         */
        closed?: boolean | undefined = false;
        /**
         * One per vertex, bending the segment after it into an arc: the tangent of a quarter of its
         * turn, 0 for straight, positive counterclockwise. Left out, every segment is straight.
         * @default undefined
         * @optional true
         */
        bulges?: number[] | undefined;
    }

    /**
     * A B-spline or NURBS curve in a drawing path, given by its control points, degree and
     * optionally its knots and weights. Without knots the curve starts and ends at its end points.
     */
    export class DrawingSplineSegmentDto {
        constructor(controlPoints?: (Base.Point2 | Base.Point3)[], degree?: number, closed?: boolean, knots?: number[], weights?: number[]) {
            if (controlPoints !== undefined) { this.controlPoints = controlPoints; }
            if (degree !== undefined) { this.degree = degree; }
            if (closed !== undefined) { this.closed = closed; }
            if (knots !== undefined) { this.knots = knots; }
            if (weights !== undefined) { this.weights = weights; }
        }
        /**
         * The control points the curve is pulled towards; there must be more of them than the
         * degree.
         * @default undefined
         */
        controlPoints!: (Base.Point2 | Base.Point3)[];
        /**
         * The degree of the curve: 1 draws the control polygon, 2 and 3 smooth curves.
         * @default 3
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        degree?: number | undefined = 3;
        /**
         * Without `knots`, whether the curve wraps around its control points into a smooth closed
         * loop. With `knots`, the knots decide, and this is ignored.
         * @default false
         */
        closed?: boolean | undefined = false;
        /**
         * The full knot vector: never decreasing, one more value than the control points and the
         * degree together. Left out, the curve starts and ends at its end points.
         * @default undefined
         * @optional true
         */
        knots?: number[] | undefined;
        /**
         * One positive weight per control point, which makes the curve rational (a NURBS curve). Leave
         * it out for a weight of 1 everywhere.
         * @default undefined
         * @optional true
         */
        weights?: number[] | undefined;
    }

    /**
     * An ellipse or an arc of one in a drawing path: its center, the vector to the end of its major
     * axis and the minor to major ratio, in the XY plane unless `normal` tilts it.
     */
    export class DrawingEllipseSegmentDto {
        constructor(center?: Base.Point2 | Base.Point3, majorAxis?: Base.Vector2 | Base.Vector3, ratio?: number, startParameter?: number, endParameter?: number, normal?: Base.Vector3) {
            if (center !== undefined) { this.center = center; }
            if (majorAxis !== undefined) { this.majorAxis = majorAxis; }
            if (ratio !== undefined) { this.ratio = ratio; }
            if (startParameter !== undefined) { this.startParameter = startParameter; }
            if (endParameter !== undefined) { this.endParameter = endParameter; }
            if (normal !== undefined) { this.normal = normal; }
        }
        /**
         * Where the ellipse's center lies; without a Z it lies at Z 0.
         * @default undefined
         */
        center!: Base.Point2 | Base.Point3;
        /**
         * The vector from the center to one end of the major axis; its length is the major radius,
         * in drawing units.
         * @default undefined
         */
        majorAxis!: Base.Vector2 | Base.Vector3;
        /**
         * The minor radius divided by the major radius.
         * @default undefined
         * @minimum 0
         * @maximum 1
         * @exclusiveMinimum true
         */
        ratio!: number;
        /**
         * Where the arc starts, as the ellipse's parameter t in radians (the point center +
         * cos(t) `majorAxis` + sin(t) minor axis), the angle only when `ratio` is 1.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         */
        startParameter?: number | undefined = 0;
        /**
         * Where the arc ends, as the same parameter in radians; the arc runs counterclockwise from the
         * start, through 0 when the end is below the start.
         * @default 6.283185307179586
         * @minimum -Infinity
         * @maximum Infinity
         */
        endParameter?: number | undefined = 6.283185307179586;
        /**
         * The direction the ellipse's plane faces, perpendicular to `majorAxis`. Leave it out for an
         * ellipse in the XY plane facing +Z.
         * @default undefined
         * @optional true
         */
        normal?: Base.Vector3 | undefined;
    }

    /**
     * A path of a drawing: segments of any kind (lines, arcs, circles, polylines, splines and
     * ellipses), in the order they are drawn, like the edges of a wire.
     */
    export class DrawingPathDto {
        constructor(segments?: (DrawingLineSegmentDto | DrawingArcSegmentDto | DrawingCircleSegmentDto | DrawingPolylineSegmentDto | DrawingSplineSegmentDto | DrawingEllipseSegmentDto)[]) {
            if (segments !== undefined) { this.segments = segments; }
        }
        /**
         * The segments of the path, in order; where one ends at the next one's start, SVG draws them
         * as one stroke.
         * @default undefined
         */
        segments!: (DrawingLineSegmentDto | DrawingArcSegmentDto | DrawingCircleSegmentDto | DrawingPolylineSegmentDto | DrawingSplineSegmentDto | DrawingEllipseSegmentDto)[];
    }

    /**
     * A line of text, in the stroke font `text.vectorText` draws.
     *
     * SVG draws its strokes; DXF writes a text fitted to their width. Accented Latin letters are
     * drawn; a character the font lacks is a question mark, an emoji two.
     * @beta
     */
    export class DrawingTextDto {
        constructor(text?: string, position?: Base.Point2 | Base.Point3, height?: number, anchor?: "start" | "middle" | "end", rotation?: number, widthFactor?: number) {
            if (text !== undefined) { this.text = text; }
            if (position !== undefined) { this.position = position; }
            if (height !== undefined) { this.height = height; }
            if (anchor !== undefined) { this.anchor = anchor; }
            if (rotation !== undefined) { this.rotation = rotation; }
            if (widthFactor !== undefined) { this.widthFactor = widthFactor; }
        }
        /**
         * The text, one line of it: a control character, such as a line break, a tab or U+0085, is
         * refused; a line separator is drawn as a question mark.
         * @default undefined
         */
        text!: string;
        /**
         * The point on the baseline the text is placed by; `anchor` says which point of the line it is.
         * @default undefined
         */
        position!: Base.Point2 | Base.Point3;
        /**
         * The height of a capital letter, in drawing units.
         * @default 3.5
         * @minimum 0
         * @exclusiveMinimum true
         */
        height?: number | undefined = 3.5;
        /**
         * Which point of the baseline `position` is: where the text starts, its middle or its end.
         * @default start
         */
        anchor?: "start" | "middle" | "end" | undefined = "start";
        /**
         * The angle of the baseline in degrees, counterclockwise from the X axis.
         * @default 0
         */
        rotation?: number | undefined = 0;
        /**
         * How wide the letters are drawn against their natural width: below 1 narrows a text to fit a
         * cell, above 1 widens it.
         * @default 1
         * @minimum 0
         * @exclusiveMinimum true
         */
        widthFactor?: number | undefined = 1;
    }

    /**
     * The room a drawing text takes, as `io.drawing.textSize` measures it.
     * @beta
     */
    export class DrawingTextSizeDto {
        /**
         * The length of the text along its baseline, in drawing units.
         * @default undefined
         */
        width!: number;
        /**
         * How far the font's highest ink rises above the baseline: a little more than `height`, which
         * marks over capitals and tall signs use.
         * @default undefined
         */
        above!: number;
        /**
         * How far the font's lowest ink drops below the baseline, where the tail of a `g` or a `y` ends.
         * @default undefined
         */
        below!: number;
    }

    /**
     * A hatched region of a drawing part: what its boundaries enclose, filled with a pattern.
     *
     * A boundary inside another cuts a hole, and one whose ends do not meet is closed by a
     * straight line.
     * @beta
     */
    export class DrawingHatchDto {
        constructor(boundaries?: DrawingPathDto[], pattern?: hatchPatternEnum, angle?: number, spacing?: number) {
            if (boundaries !== undefined) { this.boundaries = boundaries; }
            if (pattern !== undefined) { this.pattern = pattern; }
            if (angle !== undefined) { this.angle = angle; }
            if (spacing !== undefined) { this.spacing = spacing; }
        }
        /**
         * The closed paths that bound the region, in the drawing's XY plane.
         * @default undefined
         */
        boundaries!: DrawingPathDto[];
        /**
         * What the region is filled with.
         * @default ansi31
         */
        pattern?: hatchPatternEnum | undefined = hatchPatternEnum.ansi31;
        /**
         * The angle of the pattern's lines in degrees, counterclockwise from the X axis; `solid`
         * ignores it.
         * @default 45
         */
        angle?: number | undefined = 45;
        /**
         * The distance between the pattern's lines, in drawing units; `solid` ignores it. DXF writes
         * it as a scale of the pattern in `acad.pat` for an inch drawing, in `acadiso.pat` otherwise.
         * @default 3
         * @minimum 0
         * @exclusiveMinimum true
         */
        spacing?: number | undefined = 3;
    }

    /**
     * A hatch and how closely its curved boundaries are followed, for `io.drawing.clippedHatchLines`,
     * which clips the pattern's lines to the region, and `io.drawing.hatchOutlines`, which gives the
     * region's outlines as points.
     * @beta
     */
    export class DrawingHatchRegionDto {
        constructor(boundaries?: DrawingPathDto[], pattern?: hatchPatternEnum, angle?: number, spacing?: number, tolerance?: number) {
            if (boundaries !== undefined) { this.boundaries = boundaries; }
            if (pattern !== undefined) { this.pattern = pattern; }
            if (angle !== undefined) { this.angle = angle; }
            if (spacing !== undefined) { this.spacing = spacing; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * The closed paths that bound the region, in the drawing's XY plane; a boundary inside another
         * cuts a hole, and one inside that hole is filled again.
         * @default undefined
         */
        boundaries!: DrawingPathDto[];
        /**
         * What the region is filled with; `solid` has no lines.
         * @default ansi31
         */
        pattern?: hatchPatternEnum | undefined = hatchPatternEnum.ansi31;
        /**
         * The angle of the pattern's lines in degrees, counterclockwise from the X axis.
         * @default 45
         */
        angle?: number | undefined = 45;
        /**
         * The distance between the pattern's lines, in drawing units.
         * @default 3
         * @minimum 0
         * @exclusiveMinimum true
         */
        spacing?: number | undefined = 3;
        /**
         * How far, in drawing units, the outline may stray from a curved boundary: arcs, circles,
         * ellipses and splines become straight pieces this close to the curve.
         * @default 0.01
         * @minimum 0
         * @exclusiveMinimum true
         * @maximum Infinity
         * @step 0.001
         */
        tolerance?: number | undefined = 0.01;
    }

    /**
     * A part of a drawing: paths, texts and hatches on one layer, in one color, line type and line
     * weight, which `io.dxf.dxfCreate` writes as DXF and `io.svg.svgCreate` as SVG.
     */
    export class DrawingPartDto {
        constructor(layer?: string, color?: Base.Color, paths?: DrawingPathDto[], lineType?: lineTypeEnum, lineWeight?: number, texts?: DrawingTextDto[], hatches?: DrawingHatchDto[]) {
            if (layer !== undefined) { this.layer = layer; }
            if (color !== undefined) { this.color = color; }
            if (paths !== undefined) { this.paths = paths; }
            if (lineType !== undefined) { this.lineType = lineType; }
            if (lineWeight !== undefined) { this.lineWeight = lineWeight; }
            if (texts !== undefined) { this.texts = texts; }
            if (hatches !== undefined) { this.hatches = hatches; }
        }
        /**
         * The layer the paths go on. Parts may share a layer, which takes the first part's color and
         * line type; every part's paths keep their own.
         * @default Default
         */
        layer?: string | undefined = "Default";
        /**
         * The color of every path in the part, as a hex string such as `#000000`.
         * @default #000000
         */
        color?: Base.Color | undefined = "#000000";
        /**
         * The paths of the part, each a run of segments.
         * @default undefined
         */
        paths!: DrawingPathDto[];
        /**
         * Whether the lines are whole or dashed, such as `hidden` for edges a view cannot see.
         * @default continuous
         */
        lineType?: lineTypeEnum | undefined = lineTypeEnum.continuous;
        /**
         * How wide the part's lines and text strokes are, in drawing units. Left out, the writer's own
         * width is used: the drawing's `strokeWidth` in SVG, the layer's in DXF.
         * @default undefined
         * @optional true
         * @minimum 0
         * @exclusiveMinimum true
         * @beta
         */
        lineWeight?: number | undefined;
        /**
         * Lines of text on the part's layer, in its color.
         * @default undefined
         * @optional true
         * @beta
         */
        texts?: DrawingTextDto[] | undefined;
        /**
         * Hatched regions on the part's layer, in its color.
         * @default undefined
         * @optional true
         * @beta
         */
        hatches?: DrawingHatchDto[] | undefined;
    }

    /**
     * Drawing parts and the one factor `io.drawing.scaleParts` scales them by about the origin, such
     * as 1/25.4 to turn a drawing in millimetres into inches before writing it.
     * @beta
     */
    export class DrawingScalePartsDto {
        constructor(parts?: DrawingPartDto[], factor?: number) {
            if (parts !== undefined) { this.parts = parts; }
            if (factor !== undefined) { this.factor = factor; }
        }
        /**
         * The parts to scale; they stay as they are and scaled copies come back.
         * @default undefined
         */
        parts!: DrawingPartDto[];
        /**
         * What every length is multiplied by: 2 doubles the drawing, 25.4 turns inches into
         * millimetres.
         * @default 1
         * @minimum 0
         * @exclusiveMinimum true
         */
        factor?: number | undefined = 1;
    }

    /**
     * A dimension in the drawing's plane for `io.drawing.dimensionPicture`, which draws it, and
     * `io.drawing.dimensionExtent`, which measures the box it fills: what it measures, between which
     * points, and the size of its text and arrows.
     * @beta
     */
    export class DrawingDimensionDto {
        constructor(kind?: dimensionKindEnum, start?: Base.Point2, end?: Base.Point2, direction?: Base.Vector2, offset?: number, angle?: number, value?: number, decimalPlaces?: number, upperTolerance?: number, lowerTolerance?: number, textHeight?: number, arrowLength?: number) {
            if (kind !== undefined) { this.kind = kind; }
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
            if (direction !== undefined) { this.direction = direction; }
            if (offset !== undefined) { this.offset = offset; }
            if (angle !== undefined) { this.angle = angle; }
            if (value !== undefined) { this.value = value; }
            if (decimalPlaces !== undefined) { this.decimalPlaces = decimalPlaces; }
            if (upperTolerance !== undefined) { this.upperTolerance = upperTolerance; }
            if (lowerTolerance !== undefined) { this.lowerTolerance = lowerTolerance; }
            if (textHeight !== undefined) { this.textHeight = textHeight; }
            if (arrowLength !== undefined) { this.arrowLength = arrowLength; }
        }
        /**
         * What the dimension measures; it decides what `start`, `end`, `offset` and `angle` mean.
         * @default linear
         */
        kind?: dimensionKindEnum | undefined = dimensionKindEnum.linear;
        /**
         * For `linear`, the first point measured; for `diameter`, `radius` and `angular`, the center of
         * the circle or the point where the two arms of the angle meet.
         * @default undefined
         */
        start!: Base.Point2;
        /**
         * For `linear`, the second point measured; for `diameter` and `radius`, a point on the circle; for
         * `angular`, a point on the first arm, where the arc passes.
         * @default undefined
         */
        end!: Base.Point2;
        /**
         * For `linear`, the direction measured along, such as [1, 0] for a horizontal dimension; left
         * out, from `start` to `end`. Other kinds ignore it.
         * @default undefined
         * @optional true
         */
        direction?: Base.Vector2 | undefined;
        /**
         * For `linear`, how far the dimension line stands from `start`, in drawing units, to the left of
         * `direction`; negative puts it right. Other kinds ignore it.
         * @default 10
         * @minimum -Infinity
         * @maximum Infinity
         */
        offset?: number | undefined = 10;
        /**
         * For `angular`, the angle in degrees from the first arm, the one through `end`,
         * counterclockwise to the second arm. Other kinds ignore it.
         * @default 90
         * @minimum 0
         * @maximum 360
         * @exclusiveMinimum true
         * @exclusiveMaximum true
         */
        angle?: number | undefined = 90;
        /**
         * The number written; left out, the one measured. A diameter is written after the diameter
         * sign, a radius after R, an angle before the degree sign.
         * @default undefined
         * @optional true
         */
        value?: number | undefined;
        /**
         * How many decimals the value keeps; trailing zeros are dropped, so 15.50 shows as 15.5.
         * @default 2
         * @minimum 0
         * @maximum 15
         * @step 1
         */
        decimalPlaces?: number | undefined = 2;
        /**
         * How far above the value the measure may lie, written `+0.1`, or `±0.1` when equal to
         * `lowerTolerance`; 0 when only `lowerTolerance` is given.
         * @default undefined
         * @optional true
         * @minimum 0
         */
        upperTolerance?: number | undefined;
        /**
         * How far below the value the measure may lie, as an amount, written `-0.05`; 0 when only
         * `upperTolerance` is given. Without either, no tolerance is written.
         * @default undefined
         * @optional true
         * @minimum 0
         */
        lowerTolerance?: number | undefined;
        /**
         * The height of the text's digits, in drawing units; the gaps around the lines are sized from it.
         * @default 3.5
         * @minimum 0
         * @exclusiveMinimum true
         */
        textHeight?: number | undefined = 3.5;
        /**
         * The length of each arrowhead, in drawing units; each is a third as wide as it is long. Left
         * out, it is `textHeight`.
         * @default undefined
         * @optional true
         * @minimum 0
         * @exclusiveMinimum true
         */
        arrowLength?: number | undefined;
    }

    /**
     * The box a dimension's picture fills, as `io.drawing.dimensionExtent` and
     * `io.drawing.dimensionPicture` measure it, by its lowest and highest corner.
     * @beta
     */
    export class DrawingExtentDto {
        /**
         * The corner with the least X and the least Y.
         * @default undefined
         */
        min!: Base.Point2;
        /**
         * The corner with the greatest X and the greatest Y.
         * @default undefined
         */
        max!: Base.Point2;
    }

    /**
     * A dimension drawn by `io.drawing.dimensionPicture`: its lines, its arrowheads as loops to
     * fill, its text as strokes and as a drawing text, and the box all of it fills.
     * @beta
     */
    export class DrawingDimensionPictureDto {
        /**
         * The dimension line, or its arc, and the extension lines, each a polyline of two or more
         * points without two neighbours in one place.
         * @default undefined
         */
        lines!: Base.Point2[][];
        /**
         * The arrowheads, each a closed triangle running counterclockwise, its first point not repeated;
         * the first point of each is its tip.
         * @default undefined
         */
        fills!: Base.Point2[][];
        /**
         * The text's letters as strokes, each a polyline of two or more points, as
         * `io.drawing.textStrokes` draws `text`.
         * @default undefined
         */
        textStrokes!: Base.Point2[][];
        /**
         * The text as a drawing text, placed and turned so it reads from left to right or from bottom
         * to top, for a drawing part's `texts`.
         * @default undefined
         */
        text!: DrawingTextDto;
        /**
         * The middle of the box the text fills.
         * @default undefined
         */
        textPoint!: Base.Point2;
        /**
         * The box the lines, the arrowheads and the text fill together.
         * @default undefined
         */
        extent!: DrawingExtentDto;
    }

    /**
     * A straight line in a drawing path, under its former DXF name.
     *
     * @deprecated Use `DrawingLineSegmentDto`, the same DTO under the drawing's own name; this one is removed
     * in the next major version.
     */
    export class DxfLineSegmentDto extends DrawingLineSegmentDto { }

    /**
     * A circular arc in a drawing path, under its former DXF name.
     *
     * @deprecated Use `DrawingArcSegmentDto`, the same DTO under the drawing's own name; this one is removed
     * in the next major version.
     */
    export class DxfArcSegmentDto extends DrawingArcSegmentDto { }

    /**
     * A full circle in a drawing path, under its former DXF name.
     *
     * @deprecated Use `DrawingCircleSegmentDto`, the same DTO under the drawing's own name; this one is removed
     * in the next major version.
     */
    export class DxfCircleSegmentDto extends DrawingCircleSegmentDto { }

    /**
     * Connected straight segments in a drawing path, under its former DXF name.
     *
     * @deprecated Use `DrawingPolylineSegmentDto`, the same DTO under the drawing's own name; this one is removed
     * in the next major version.
     */
    export class DxfPolylineSegmentDto extends DrawingPolylineSegmentDto { }

    /**
     * A B-spline or NURBS curve in a drawing path, under its former DXF name.
     *
     * @deprecated Use `DrawingSplineSegmentDto`, the same DTO under the drawing's own name; this one is removed
     * in the next major version.
     */
    export class DxfSplineSegmentDto extends DrawingSplineSegmentDto { }

    /**
     * An ellipse or an arc of one in a drawing path, under its former DXF name.
     *
     * @deprecated Use `DrawingEllipseSegmentDto`, the same DTO under the drawing's own name; this one is removed
     * in the next major version.
     */
    export class DxfEllipseSegmentDto extends DrawingEllipseSegmentDto { }

    /**
     * A path of a drawing, under its former DXF name.
     *
     * @deprecated Use `DrawingPathDto`, the same DTO under the drawing's own name; this one is removed
     * in the next major version.
     */
    export class DxfPathDto extends DrawingPathDto { }

    /**
     * A part of a drawing: paths on one layer with one color and one line type, under its former DXF name.
     *
     * @deprecated Use `DrawingPartDto`, the same DTO under the drawing's own name; this one is removed
     * in the next major version.
     */
    export class DxfPathsPartDto extends DrawingPartDto { }

    /**
     * A whole DXF drawing for `io.dxf.dxfCreate`: its path parts by layer and color, and the color
     * format, the version and the unit to write. In inches it is marked imperial, so hatch scales
     * count from inch patterns.
     */
    export class DxfModelDto {
        constructor(dxfPathsParts?: DrawingPartDto[], colorFormat?: "aci" | "truecolor", acadVersion?: "AC1009" | "AC1015", unit?: Base.unitOfLengthEnum, curveTolerance?: number, lineTypeScale?: number) {
            if (dxfPathsParts !== undefined) { this.dxfPathsParts = dxfPathsParts; }
            if (colorFormat !== undefined) { this.colorFormat = colorFormat; }
            if (acadVersion !== undefined) { this.acadVersion = acadVersion; }
            if (unit !== undefined) { this.unit = unit; }
            if (curveTolerance !== undefined) { this.curveTolerance = curveTolerance; }
            if (lineTypeScale !== undefined) { this.lineTypeScale = lineTypeScale; }
        }
        /**
         * Array of path parts, each containing paths with segments
         * @default undefined
         */
        dxfPathsParts!: DrawingPartDto[];
        /**
         * How colors are written: `aci`, the nearest of AutoCAD's 255 index colors, or `truecolor`,
         * the exact color beside that index (`AC1015` only; `AC1009` writes the index).
         * @default aci
         */
        colorFormat?: "aci" | "truecolor" | undefined = "aci";
        /**
         * The DXF version: `AC1015` (AutoCAD 2000), which keeps splines and ellipses exact, or `AC1009`
         * (AutoCAD R12) for old software, where they become polylines within `curveTolerance`.
         * @default AC1015
         */
        acadVersion?: "AC1009" | "AC1015" | undefined = "AC1015";
        /**
         * The unit the drawing is in, written into its header so CAD programs open it at true size;
         * `AC1015` only. Left out, no unit is stated.
         * @default undefined
         * @optional true
         */
        unit?: Base.unitOfLengthEnum | undefined;
        /**
         * The largest distance, in drawing units, between a curve and the polyline that stands in for
         * it where the version cannot hold the curve exactly.
         * @default 0.01
         * @minimum 0
         * @exclusiveMinimum true
         */
        curveTolerance?: number | undefined = 0.01;
        /**
         * The length of one unit of a dash pattern, in drawing units: `hidden` is 2 units of dash
         * and 1 of gap. Left out, a two-hundredth of the drawing's size.
         * @default undefined
         * @optional true
         * @minimum 0
         * @exclusiveMinimum true
         * @beta
         */
        lineTypeScale?: number | undefined;
    }

    /**
     * The text of a DXF file for `io.dxf.dxfRead`, which reads its drawing into path parts, and
     * whether layers that are switched off or frozen are read too.
     */
    export class DxfReadDto {
        constructor(dxf?: string | Uint8Array, includeHiddenLayers?: boolean) {
            if (dxf !== undefined) { this.dxf = dxf; }
            if (includeHiddenLayers !== undefined) { this.includeHiddenLayers = includeHiddenLayers; }
        }
        /**
         * An ASCII DXF file from R12 on, as text or bytes; older bytes not in UTF-8 are read in the
         * header's code page, or as Windows-1252.
         * @default undefined
         */
        dxf!: string | Uint8Array;
        /**
         * When true, layers the file has switched off or frozen are read as well.
         * @default false
         */
        includeHiddenLayers?: boolean | undefined = false;
    }

    /**
     * A drawing read from a DXF file by `io.dxf.dxfRead`: its parts by layer, color and line type, in
     * the shape `io.dxf.dxfCreate` and `io.svg.svgCreate` write, with the unit and what was left out.
     */
    export class DxfDrawingDto {
        /**
         * The parts, one for each layer, color and line type that holds anything: each entity one path,
         * each text and hatch in its part's `texts` and `hatches`.
         * @default undefined
         */
        parts!: DrawingPartDto[];
        /**
         * The unit the file states, when it is one of millimetres, centimetres, metres or inches.
         * @default undefined
         * @optional true
         */
        unit?: Base.unitOfLengthEnum | undefined;
        /**
         * The DXF version the file states, such as `AC1015`, or an empty text when it states none.
         * @default undefined
         */
        version!: string;
        /**
         * What was left out and why, each kind once with its count.
         * @default undefined
         */
        warnings!: string[];
    }

    /**
     * A whole SVG drawing for `io.svg.svgCreate`: its path parts by layer, color and line type, the
     * unit that gives it its true size, and how wide the lines and the border are.
     */
    export class SvgModelDto {
        constructor(parts?: DrawingPartDto[], unit?: Base.unitOfLengthEnum, strokeWidth?: number, margin?: number, tolerance?: number, lineTypeScale?: number) {
            if (parts !== undefined) { this.parts = parts; }
            if (unit !== undefined) { this.unit = unit; }
            if (strokeWidth !== undefined) { this.strokeWidth = strokeWidth; }
            if (margin !== undefined) { this.margin = margin; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
            if (lineTypeScale !== undefined) { this.lineTypeScale = lineTypeScale; }
        }
        /**
         * The parts of the drawing; each layer becomes a group that Inkscape reads as a layer.
         * @default undefined
         */
        parts!: DrawingPartDto[];
        /**
         * The unit the drawing is in, which gives the file its true width and height. Left out, the
         * file states no size and viewers fit it to the window.
         * @default undefined
         * @optional true
         */
        unit?: Base.unitOfLengthEnum | undefined;
        /**
         * How wide the lines are, in drawing units. Left out, a five-hundredth of the drawing's larger
         * side.
         * @default undefined
         * @optional true
         * @minimum 0
         * @exclusiveMinimum true
         */
        strokeWidth?: number | undefined;
        /**
         * The empty border around the drawing, in drawing units. Left out, a fortieth of the
         * drawing's larger side.
         * @default undefined
         * @optional true
         * @minimum 0
         */
        margin?: number | undefined;
        /**
         * The largest distance, in drawing units, between a curve SVG cannot draw exactly (a rational
         * or higher degree spline) and the cubic curves that stand in for it.
         * @default 0.01
         * @minimum 0
         * @exclusiveMinimum true
         */
        tolerance?: number | undefined = 0.01;
        /**
         * The length of one unit of a dash pattern, in drawing units: `hidden` is 2 units of dash
         * and 1 of gap. Left out, a two-hundredth of the drawing's size.
         * @default undefined
         * @optional true
         * @minimum 0
         * @exclusiveMinimum true
         * @beta
         */
        lineTypeScale?: number | undefined;
    }

    /**
     * One drawing path for `io.svg.pathData`, and how its coordinates are written.
     */
    export class SvgPathDataDto {
        constructor(path?: DrawingPathDto, flipY?: boolean, tolerance?: number, cubicsOnly?: boolean) {
            if (path !== undefined) { this.path = path; }
            if (flipY !== undefined) { this.flipY = flipY; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
            if (cubicsOnly !== undefined) { this.cubicsOnly = cubicsOnly; }
        }
        /**
         * The path to write as SVG path data.
         * @default undefined
         */
        path!: DrawingPathDto;
        /**
         * Whether Y is negated, as an SVG file needs (its Y runs down); leave it off for data drawn
         * inside a group that flips Y itself.
         * @default true
         */
        flipY?: boolean | undefined = true;
        /**
         * The largest distance, in drawing units, between a curve SVG cannot draw exactly and the
         * cubic curves that stand in for it.
         * @default 0.01
         * @minimum 0
         * @exclusiveMinimum true
         */
        tolerance?: number | undefined = 0.01;
        /**
         * When true, every curve is written as cubic Beziers (`C`), arcs within `tolerance`, for
         * renderers that draw only lines and cubics.
         * @default false
         * @beta
         */
        cubicsOnly?: boolean | undefined = false;
    }

    /**
     * The text of an SVG file for `io.svg.svgRead`, which reads its drawing into path parts, with the
     * unit that brings it in at true size and whether hidden elements are read too.
     */
    export class SvgReadDto {
        constructor(svg?: string, unit?: Base.unitOfLengthEnum, includeInvisible?: boolean) {
            if (svg !== undefined) { this.svg = svg; }
            if (unit !== undefined) { this.unit = unit; }
            if (includeInvisible !== undefined) { this.includeInvisible = includeInvisible; }
        }
        /**
         * The whole text of an SVG file.
         * @default undefined
         */
        svg!: string;
        /**
         * The unit to read the drawing in at its true size, with the page's top left corner at the
         * origin. Left out, coordinates stay in the file's own user units.
         * @default undefined
         * @optional true
         */
        unit?: Base.unitOfLengthEnum | undefined;
        /**
         * When true, elements hidden by `display` or `visibility` are read as well.
         * @default false
         */
        includeInvisible?: boolean | undefined = false;
    }

    /**
     * A drawing read from an SVG file by `io.svg.svgRead`: its parts by layer, color and line type, in
     * the shape `io.dxf.dxfCreate` and `io.svg.svgCreate` write, with the unit, the view box and what
     * was left out.
     */
    export class SvgDrawingDto {
        /**
         * The parts, one for each layer, color and line type that holds anything, each subpath one path.
         * @default undefined
         */
        parts!: DrawingPartDto[];
        /**
         * The unit the drawing was read in, when one was asked for.
         * @default undefined
         * @optional true
         */
        unit?: Base.unitOfLengthEnum | undefined;
        /**
         * The view box the file gives its root, as x, y, width and height in the file's own
         * coordinates, where Y runs down.
         * @default undefined
         * @optional true
         */
        viewBox?: number[] | undefined;
        /**
         * What was left out or read differently and why, each kind once with its count.
         * @default undefined
         */
        warnings!: string[];
    }

    /**
     * An SVG file for `io.drawing.svgToDxf`, which reads it as `io.svg.svgRead` does and writes it as
     * `io.dxf.dxfCreate` does, with the options of both.
     */
    export class SvgToDxfDto {
        constructor(svg?: string, unit?: Base.unitOfLengthEnum, includeInvisible?: boolean, colorFormat?: "aci" | "truecolor", acadVersion?: "AC1009" | "AC1015", curveTolerance?: number) {
            if (svg !== undefined) { this.svg = svg; }
            if (unit !== undefined) { this.unit = unit; }
            if (includeInvisible !== undefined) { this.includeInvisible = includeInvisible; }
            if (colorFormat !== undefined) { this.colorFormat = colorFormat; }
            if (acadVersion !== undefined) { this.acadVersion = acadVersion; }
            if (curveTolerance !== undefined) { this.curveTolerance = curveTolerance; }
        }
        /**
         * The whole text of an SVG file.
         * @default undefined
         */
        svg!: string;
        /**
         * The unit to read the drawing in at true size, also stated in the DXF (`AC1015` only). Left
         * out, user units are written and no unit is stated.
         * @default undefined
         * @optional true
         */
        unit?: Base.unitOfLengthEnum | undefined;
        /**
         * When true, elements hidden by `display` or `visibility` are written as well.
         * @default false
         */
        includeInvisible?: boolean | undefined = false;
        /**
         * How colors are written: `aci`, the nearest of AutoCAD's 255 index colors, or `truecolor`,
         * the exact color beside that index (`AC1015` only; `AC1009` writes the index).
         * @default aci
         */
        colorFormat?: "aci" | "truecolor" | undefined = "aci";
        /**
         * The DXF version: `AC1015` (AutoCAD 2000), which keeps splines and ellipses exact, or `AC1009`
         * (AutoCAD R12) for old software, where they become polylines within `curveTolerance`.
         * @default AC1015
         */
        acadVersion?: "AC1009" | "AC1015" | undefined = "AC1015";
        /**
         * The largest distance, in drawing units, between a curve and the polyline that stands in for
         * it where the version cannot hold the curve exactly.
         * @default 0.01
         * @minimum 0
         * @exclusiveMinimum true
         */
        curveTolerance?: number | undefined = 0.01;
    }

    /**
     * What `io.drawing.svgToDxf` returns: the DXF file it wrote from an SVG file, and what the
     * reading left out or read differently.
     */
    export class SvgToDxfResultDto {
        /**
         * The DXF file as text.
         * @default undefined
         */
        dxf!: string;
        /**
         * What was left out or read differently and why, each kind once with its count.
         * @default undefined
         */
        warnings!: string[];
    }

    /**
     * A DXF file for `io.drawing.dxfToSvg`, which reads it as `io.dxf.dxfRead` does and writes it as
     * `io.svg.svgCreate` does, with the options of both.
     */
    export class DxfToSvgDto {
        constructor(dxf?: string | Uint8Array, includeHiddenLayers?: boolean, strokeWidth?: number, margin?: number, tolerance?: number) {
            if (dxf !== undefined) { this.dxf = dxf; }
            if (includeHiddenLayers !== undefined) { this.includeHiddenLayers = includeHiddenLayers; }
            if (strokeWidth !== undefined) { this.strokeWidth = strokeWidth; }
            if (margin !== undefined) { this.margin = margin; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * An ASCII DXF file from R12 on, as text or bytes; older bytes not in UTF-8 are read in the
         * header's code page, or as Windows-1252.
         * @default undefined
         */
        dxf!: string | Uint8Array;
        /**
         * When true, layers the file has switched off or frozen are written as well.
         * @default false
         */
        includeHiddenLayers?: boolean | undefined = false;
        /**
         * How wide the lines are, in drawing units. Left out, a five-hundredth of the drawing's larger
         * side.
         * @default undefined
         * @optional true
         * @minimum 0
         * @exclusiveMinimum true
         */
        strokeWidth?: number | undefined;
        /**
         * The empty border around the drawing, in drawing units. Left out, a fortieth of the
         * drawing's larger side.
         * @default undefined
         * @optional true
         * @minimum 0
         */
        margin?: number | undefined;
        /**
         * The largest distance, in drawing units, between a curve SVG cannot draw exactly (a rational
         * or higher degree spline) and the cubic curves that stand in for it.
         * @default 0.01
         * @minimum 0
         * @exclusiveMinimum true
         */
        tolerance?: number | undefined = 0.01;
    }

    /**
     * What `io.drawing.dxfToSvg` returns: the SVG file it wrote from a DXF file, and what the reading
     * left out.
     */
    export class DxfToSvgResultDto {
        /**
         * The SVG file as text.
         * @default undefined
         */
        svg!: string;
        /**
         * What was left out and why, each kind once with its count.
         * @default undefined
         */
        warnings!: string[];
    }

}
