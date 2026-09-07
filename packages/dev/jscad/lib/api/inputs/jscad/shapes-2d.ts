// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

export class CircleDto {
    constructor(center?: Base.Point2, radius?: number, segments?: number) {
        if (center !== undefined) { this.center = center; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * Center of the circle
     * @default [0, 0]
     */
    center: Base.Point2 = [0, 0];
    /**
     * Radius of the circle
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Segment number
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
export class EllipseDto {
    constructor(center?: Base.Point2, radius?: Base.Point2, segments?: number) {
        if (center !== undefined) { this.center = center; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * Center of the circle
     * @default [0, 0]
     */
    center: Base.Point2 = [0, 0];
    /**
     * Radius of the circle in [x, y] form
     * @default [1, 2]
     */
    radius: Base.Point2 = [1, 2];
    /**
     * Segment number
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
export class SquareDto {
    constructor(center?: Base.Point2, size?: number) {
        if (center !== undefined) { this.center = center; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * Center of the 2D square
     * @default [0, 0]
     */
    center: Base.Point2 = [0, 0];
    /**
     * Size of the square
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    size = 1;

}
export class RectangleDto {
    constructor(center?: Base.Point2, width?: number, length?: number) {
        if (center !== undefined) { this.center = center; }
        if (width !== undefined) { this.width = width; }
        if (length !== undefined) { this.length = length; }
    }
    /**
     * Center of the 2D rectangle
     * @default [0, 0]
     */
    center: Base.Point2 = [0, 0];
    /**
     * Width of the rectangle
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    width = 1;
    /**
     * Length of the rectangle
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    length = 1;
}
export class RoundedRectangleDto {
    constructor(center?: Base.Point2, roundRadius?: number, segments?: number, width?: number, length?: number) {
        if (center !== undefined) { this.center = center; }
        if (roundRadius !== undefined) { this.roundRadius = roundRadius; }
        if (segments !== undefined) { this.segments = segments; }
        if (width !== undefined) { this.width = width; }
        if (length !== undefined) { this.length = length; }
    }
    /**
     * Center of the 2D rectangle
     * @default [0, 0]
     */
    center: Base.Point2 = [0, 0];
    /**
     * The radius to round the rectangle edge
     * @default 0.2
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    roundRadius = 0.2;
    /**
     * Number of segments for corners
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
    /**
     * Width of the rectangle
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    width = 1;
    /**
     * Length of the rectangle
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    length = 1;
}
export class StarDto {
    constructor(center?: Base.Point2, vertices?: number, density?: number, outerRadius?: number, innerRadius?: number, startAngle?: number) {
        if (center !== undefined) { this.center = center; }
        if (vertices !== undefined) { this.vertices = vertices; }
        if (density !== undefined) { this.density = density; }
        if (outerRadius !== undefined) { this.outerRadius = outerRadius; }
        if (innerRadius !== undefined) { this.innerRadius = innerRadius; }
        if (startAngle !== undefined) { this.startAngle = startAngle; }
    }
    /**
     * Center of the 2D star
     * @default [0, 0]
     */
    center: Base.Point2 = [0, 0];
    /**
     * Number of vertices on the star
     * @default 10
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    vertices = 10;
    /**
     * Density of the star
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    density = 1;
    /**
     * Outer radius of the star
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    outerRadius = 2;
    /**
     * Inner radius of the star
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    innerRadius = 1;
    /**
     * Starting angle for first vertice, in degrees
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    startAngle = 0;
}
