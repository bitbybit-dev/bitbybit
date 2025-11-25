import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */

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
        start: Base.Point2;
        /**
         * End point of the line
         * @default undefined
         */
        end: Base.Point2;
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
        center: Base.Point2;
        /**
         * Radius of the arc
         * @default undefined
         */
        radius: number;
        /**
         * Start angle in degrees
         * @default undefined
         */
        startAngle: number;
        /**
         * End angle in degrees (counter-clockwise from start angle)
         * @default undefined
         */
        endAngle: number;
    }

    /**
     * Circle defined by center and radius
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
        center: Base.Point2;
        /**
         * Radius of the circle
         * @default undefined
         */
        radius: number;
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
        points: Base.Point2[];
        /**
         * Whether the polyline is closed
         * @default false
         */
        closed? = false;
        /**
         * Bulge values for each vertex (optional)
         * Bulge = tan(angle/4) where angle is the arc angle in radians
         * Positive = counterclockwise, Negative = clockwise
         * 0 = straight line segment
         * Array length should match points length (or be undefined for all straight segments)
         * @default undefined
         */
        bulges?: number[];
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
        controlPoints: Base.Point2[];
        /**
         * Degree of the spline (typically 2 or 3)
         * @default 3
         */
        degree? = 3;
        /**
         * Whether the spline is closed
         * @default false
         */
        closed? = false;
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
        segments: (DxfLineSegmentDto | DxfArcSegmentDto | DxfCircleSegmentDto | DxfPolylineSegmentDto | DxfSplineSegmentDto)[];
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
        paths: DxfPathDto[];
    }

    /**
     * Main DXF model containing all path parts
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
        dxfPathsParts: DxfPathsPartDto[];
        /**
         * Color format to use in the DXF file
         * - "aci": AutoCAD Color Index (1-255) - Better compatibility with older CAD software like Design CAD 3D Max
         * - "truecolor": 24-bit RGB true color - Full color spectrum, requires newer CAD software
         * @default aci
         */
        colorFormat?: "aci" | "truecolor" = "aci";
        /**
         * AutoCAD version format for DXF file
         * - "AC1009": AutoCAD R12/R11 - Maximum compatibility with older CAD software (e.g., Design CAD 3D Max)
         * - "AC1015": AutoCAD 2000 - Modern format with extended features
         * @default AC1009
         */
        acadVersion?: "AC1009" | "AC1015" = "AC1009";
    }

}


