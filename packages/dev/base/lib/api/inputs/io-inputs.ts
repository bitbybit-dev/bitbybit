import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */

/**
 * Parameters for reading and writing files: the data or shape to export, the target format and its
 * options, the file name, and the settings that control how imported content is interpreted.
 */
export namespace IO {

    /**
     * Line segment defined by start and end points
     */
    export class DxfLineSegmentDto {
        constructor(start?: Base.Point2, end?: Base.Point2) {
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
        }
        /**
         * Start point of the line
         * @default undefined
         */
        start!: Base.Point2;
        /**
         * End point of the line
         * @default undefined
         */
        end!: Base.Point2;
    }

    /**
     * Arc segment defined by center, radius, and start/end angles in degrees
     */
    export class DxfArcSegmentDto {
        constructor(center?: Base.Point2, radius?: number, startAngle?: number, endAngle?: number) {
            if (center !== undefined) { this.center = center; }
            if (radius !== undefined) { this.radius = radius; }
            if (startAngle !== undefined) { this.startAngle = startAngle; }
            if (endAngle !== undefined) { this.endAngle = endAngle; }
        }
        /**
         * Center point of the arc
         * @default undefined
         */
        center!: Base.Point2;
        /**
         * Distance from the center to the arc, in drawing units.
         * @default undefined
         */
        radius!: number;
        /**
         * Start angle in degrees
         * @default undefined
         */
        startAngle!: number;
        /**
         * End angle in degrees (counter-clockwise from start angle)
         * @default undefined
         */
        endAngle!: number;
    }

    /**
     * A full circle in a DXF path, given by its center and radius.
     */
    export class DxfCircleSegmentDto {
        constructor(center?: Base.Point2, radius?: number) {
            if (center !== undefined) { this.center = center; }
            if (radius !== undefined) { this.radius = radius; }
        }
        /**
         * Center point of the circle
         * @default undefined
         */
        center!: Base.Point2;
        /**
         * Distance from the center to the circle, in drawing units.
         * @default undefined
         */
        radius!: number;
    }

    /**
     * Polyline segment defined by multiple points
     * Can include bulge values to create arc segments between vertices
     */
    export class DxfPolylineSegmentDto {
        constructor(points?: Base.Point2[], closed?: boolean, bulges?: number[]) {
            if (points !== undefined) { this.points = points; }
            if (closed !== undefined) { this.closed = closed; }
            if (bulges !== undefined) { this.bulges = bulges; }
        }
        /**
         * Points defining the polyline vertices
         * @default undefined
         */
        points!: Base.Point2[];
        /**
         * Whether the polyline is closed
         * @default false
         */
        closed?: boolean | undefined = false;
        /**
         * One bulge per vertex to bend the segment after it into an arc: 0 keeps it straight,
         * positive bends counter-clockwise, negative clockwise. Leave it out for straight segments
         * only.
         * @default undefined
         */
        bulges?: number[] | undefined;
    }

    /**
     * Spline/B-spline segment defined by control points and degree
     */
    export class DxfSplineSegmentDto {
        constructor(controlPoints?: Base.Point2[], degree?: number, closed?: boolean) {
            if (controlPoints !== undefined) { this.controlPoints = controlPoints; }
            if (degree !== undefined) { this.degree = degree; }
            if (closed !== undefined) { this.closed = closed; }
        }
        /**
         * Control points defining the spline
         * @default undefined
         */
        controlPoints!: Base.Point2[];
        /**
         * Degree of the spline (typically 2 or 3)
         * @default 3
         */
        degree?: number | undefined = 3;
        /**
         * Whether the spline is closed
         * @default false
         */
        closed?: boolean | undefined = false;
    }

    /**
     * A path can contain multiple segments of different types (lines, arcs, polylines, circles, splines)
     * Similar to OCCT wires that can combine different edge types
     */
    export class DxfPathDto {
        constructor(segments?: (DxfLineSegmentDto | DxfArcSegmentDto | DxfCircleSegmentDto | DxfPolylineSegmentDto | DxfSplineSegmentDto)[]) {
            if (segments !== undefined) { this.segments = segments; }
        }
        /**
         * Array of segments that make up this path
         * Can include lines, arcs, circles, polylines, and splines
         * @default undefined
         */
        segments!: (DxfLineSegmentDto | DxfArcSegmentDto | DxfCircleSegmentDto | DxfPolylineSegmentDto | DxfSplineSegmentDto)[];
    }

    /**
     * A part containing multiple paths on the same layer with the same color
     */
    export class DxfPathsPartDto {
        constructor(layer?: string, color?: Base.Color, paths?: DxfPathDto[]) {
            if (layer !== undefined) { this.layer = layer; }
            if (color !== undefined) { this.color = color; }
            if (paths !== undefined) { this.paths = paths; }
        }
        /**
         * Layer name for all paths in this part
         * @default Default
         */
        layer = "Default";
        /**
         * Color for all paths in this part
         * @default #000000
         */
        color: Base.Color = "#000000";
        /**
         * Array of paths, each containing multiple segments
         * @default undefined
         */
        paths!: DxfPathDto[];
    }

    /**
     * A whole DXF drawing: its path parts by layer and color, and the color and version format to
     * write.
     */
    export class DxfModelDto {
        constructor(dxfPathsParts?: DxfPathsPartDto[], colorFormat?: "aci" | "truecolor", acadVersion?: "AC1009" | "AC1015") {
            if (dxfPathsParts !== undefined) { this.dxfPathsParts = dxfPathsParts; }
            if (colorFormat !== undefined) { this.colorFormat = colorFormat; }
            if (acadVersion !== undefined) { this.acadVersion = acadVersion; }
        }
        /**
         * Array of path parts, each containing paths with segments
         * @default undefined
         */
        dxfPathsParts!: DxfPathsPartDto[];
        /**
         * How colors are written: `aci`, the AutoCAD color index from 1 to 255 that older
         * software reads, or `truecolor`, full 24-bit RGB for newer software.
         * @default aci
         */
        colorFormat?: "aci" | "truecolor" | undefined = "aci";
        /**
         * The DXF version to write: `AC1009` (AutoCAD R12) for the widest compatibility, or
         * `AC1015` (AutoCAD 2000) for the newer features.
         * @default AC1009
         */
        acadVersion?: "AC1009" | "AC1015" | undefined = "AC1009";
    }

}


