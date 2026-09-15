// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

/**
 * Feeds `polygon.circle`: a filled circle in the XY plane, given by its 2D center, radius and the
 * number of straight sides that approximate it.
 */
export class CircleDto {
    constructor(center?: Base.Point2, radius?: number, segments?: number) {
        if (center !== undefined) { this.center = center; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The 2D center point, as X and Y in the plane
     * @default [0, 0]
     */
    center: Base.Point2 = [0, 0];
    /**
     * Distance from the center to the rim, in model units
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Number of straight sides around the circle; more makes it rounder
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
/**
 * Feeds `polygon.ellipse`: a filled ellipse in the XY plane, given by its 2D center, its two
 * half-sizes and the number of straight sides that approximate it.
 */
export class EllipseDto {
    constructor(center?: Base.Point2, radius?: Base.Point2, segments?: number) {
        if (center !== undefined) { this.center = center; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The 2D center point, as X and Y in the plane
     * @default [0, 0]
     */
    center: Base.Point2 = [0, 0];
    /**
     * The half width along X and the half height along Y, in model units, as `[x, y]`
     * @default [1, 2]
     */
    radius: Base.Point2 = [1, 2];
    /**
     * Number of straight sides around the ellipse; more makes it rounder
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
/**
 * Feeds `polygon.square`: a filled square in the XY plane with sides parallel to the axes, given by
 * its 2D center and side length.
 */
export class SquareDto {
    constructor(center?: Base.Point2, size?: number) {
        if (center !== undefined) { this.center = center; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * The 2D center point, as X and Y in the plane
     * @default [0, 0]
     */
    center: Base.Point2 = [0, 0];
    /**
     * Length of each side, in model units
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    size = 1;

}
/**
 * Feeds `polygon.rectangle`: a filled rectangle in the XY plane with sides parallel to the axes,
 * given by its 2D center, width along X and length along Y.
 */
export class RectangleDto {
    constructor(center?: Base.Point2, width?: number, length?: number) {
        if (center !== undefined) { this.center = center; }
        if (width !== undefined) { this.width = width; }
        if (length !== undefined) { this.length = length; }
    }
    /**
     * The 2D center point, as X and Y in the plane
     * @default [0, 0]
     */
    center: Base.Point2 = [0, 0];
    /**
     * Full size along X, in model units
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    width = 1;
    /**
     * Full size along Y, in model units
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    length = 1;
}
/**
 * Feeds `polygon.roundedRectangle`: a filled rectangle in the XY plane whose four corners are
 * rounded, given by its 2D center, its sizes, the corner radius and how finely the corners are
 * faceted.
 */
export class RoundedRectangleDto {
    constructor(center?: Base.Point2, roundRadius?: number, segments?: number, width?: number, length?: number) {
        if (center !== undefined) { this.center = center; }
        if (roundRadius !== undefined) { this.roundRadius = roundRadius; }
        if (segments !== undefined) { this.segments = segments; }
        if (width !== undefined) { this.width = width; }
        if (length !== undefined) { this.length = length; }
    }
    /**
     * The 2D center point, as X and Y in the plane
     * @default [0, 0]
     */
    center: Base.Point2 = [0, 0];
    /**
     * Radius of each rounded corner, in model units; it must be less than half of the smaller side
     * or an error is thrown
     * @default 0.2
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    roundRadius = 0.2;
    /**
     * Number of straight pieces a full circle of rounding is made of, so each corner gets a
     * quarter; more makes it smoother
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
    /**
     * Full size along X, in model units
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    width = 1;
    /**
     * Full size along Y, in model units
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    length = 1;
}
/**
 * Feeds `polygon.star`: a filled star in the XY plane, given by its 2D center, how many tips it
 * has, how far the tips and the notches between them reach and where the first tip points.
 */
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
     * The 2D center point, as X and Y in the plane
     * @default [0, 0]
     */
    center: Base.Point2 = [0, 0];
    /**
     * Number of tips; the star has as many notches between them
     * @default 10
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    vertices = 10;
    /**
     * Read only when `innerRadius` is 0: how many tips apart the edges connect, 2 for a pentagram,
     * from which the notch radius is derived
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    density = 1;
    /**
     * Distance from the center to each tip, in model units
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    outerRadius = 2;
    /**
     * Distance from the center to each notch, in model units; 0 lets `density` decide it
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    innerRadius = 1;
    /**
     * Direction of the first tip, in degrees counter-clockwise from the X axis
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    startAngle = 0;
}
