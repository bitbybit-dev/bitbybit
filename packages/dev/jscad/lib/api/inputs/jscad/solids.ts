// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

/**
 * Feeds `shapes.cube`: a cube with faces parallel to the axes, given by its center point and edge
 * length.
 */
export class CubeDto {
    constructor(center?: Base.Point3, size?: number) {
        if (center !== undefined) { this.center = center; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * The point the cube is centered on, so half the edge length lies on each side of it
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Length of every edge, in model units
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    size = 1;
}
/**
 * Feeds `shapes.cubesOnCenterPoints`: one cube of the same edge length on every center point,
 * coming back in the same order.
 */
export class CubeCentersDto {
    constructor(centers?: Base.Point3[], size?: number) {
        if (centers !== undefined) { this.centers = centers; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * The points the cubes are centered on, one cube each, in the order the results come back
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * Length of every edge of every cube, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    size = 1;
}
/**
 * Feeds `shapes.cuboid`: a box with faces parallel to the axes, given by its center point and its
 * sizes along X, Y and Z.
 */
export class CuboidDto {
    constructor(center?: Base.Point3, width?: number, length?: number, height?: number) {
        if (center !== undefined) { this.center = center; }
        if (width !== undefined) { this.width = width; }
        if (length !== undefined) { this.length = length; }
        if (height !== undefined) { this.height = height; }
    }
    /**
     * The point the box is centered on, so half of each size lies on each side of it
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Full size along X, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 1;
    /**
     * Full size along Z, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    length = 1;
    /**
     * Full size along Y, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
}
/**
 * Feeds `shapes.cuboidsOnCenterPoints`: one box of the same sizes on every center point, coming
 * back in the same order.
 */
export class CuboidCentersDto {
    constructor(centers?: Base.Point3[], width?: number, length?: number, height?: number) {
        if (centers !== undefined) { this.centers = centers; }
        if (width !== undefined) { this.width = width; }
        if (length !== undefined) { this.length = length; }
        if (height !== undefined) { this.height = height; }
    }
    /**
     * The points the boxes are centered on, one box each, in the order the results come back
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * Full size of every box along X, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 1;
    /**
     * Full size of every box along Z, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    length = 1;
    /**
     * Full size of every box along Y, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
}
/**
 * Feeds `shapes.roundedCuboid`: a box with every edge and corner rounded, given by its center, its
 * sizes along X, Y and Z, the rounding radius and how finely the rounding is faceted.
 */
export class RoundedCuboidDto {
    constructor(center?: Base.Point3, roundRadius?: number, width?: number, length?: number, height?: number, segments?: number) {
        if (center !== undefined) { this.center = center; }
        if (roundRadius !== undefined) { this.roundRadius = roundRadius; }
        if (width !== undefined) { this.width = width; }
        if (length !== undefined) { this.length = length; }
        if (height !== undefined) { this.height = height; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The point the box is centered on, so half of each size lies on each side of it
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Radius of the rounding on every edge, in model units; it must be less than half of the
     * smallest side or an error is thrown
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    roundRadius = 1;
    /**
     * Full size along X, in model units, rounding included
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 1;
    /**
     * Full size along Z, in model units, rounding included
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    length = 1;
    /**
     * Full size along Y, in model units, rounding included
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Number of straight pieces a full circle of rounding is made of; more makes the edges smoother
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
/**
 * Feeds `shapes.roundedCuboidsOnCenterPoints`: one rounded box of the same sizes and rounding on
 * every center point, coming back in the same order.
 */
export class RoundedCuboidCentersDto {
    constructor(centers?: Base.Point3[], roundRadius?: number, width?: number, length?: number, height?: number, segments?: number) {
        if (centers !== undefined) { this.centers = centers; }
        if (roundRadius !== undefined) { this.roundRadius = roundRadius; }
        if (width !== undefined) { this.width = width; }
        if (length !== undefined) { this.length = length; }
        if (height !== undefined) { this.height = height; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The points the boxes are centered on, one box each, in the order the results come back
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * Radius of the rounding on every edge, in model units; it must be less than half of the
     * smallest side or an error is thrown
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    roundRadius = 0.1;
    /**
     * Full size of every box along X, in model units, rounding included
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 1;
    /**
     * Full size of every box along Z, in model units, rounding included
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    length = 1;
    /**
     * Full size of every box along Y, in model units, rounding included
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Number of straight pieces a full circle of rounding is made of; more makes the edges smoother
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
/**
 * Feeds `shapes.cylinderElliptic`: a cylinder standing along Z with an elliptical cross-section
 * that can differ between its two ends, so it also makes cones and tapers.
 */
export class CylidnerEllipticDto {
    constructor(center?: Base.Point3, height?: number, startRadius?: Base.Point2, endRadius?: Base.Point2, segments?: number) {
        if (center !== undefined) { this.center = center; }
        if (height !== undefined) { this.height = height; }
        if (startRadius !== undefined) { this.startRadius = startRadius; }
        if (endRadius !== undefined) { this.endRadius = endRadius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The point halfway up the axis; half the height lies above it along Z and half below
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Full length along Z, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * The X and Y radii of the bottom end, in model units, as `[x, y]`
     * @default [1, 2]
     */
    startRadius: Base.Vector2 = [1, 2];
    /**
     * The X and Y radii of the top end, in model units, as `[x, y]`; `[0, 0]` closes it to a point
     * @default [2, 3]
     */
    endRadius: Base.Vector2 = [2, 3];
    /**
     * Number of flat sides around the cylinder; more makes it rounder
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
/**
 * Feeds `shapes.cylinderEllipticOnCenterPoints`: one elliptic cylinder of the same size on every
 * center point, coming back in the same order.
 */
export class CylidnerCentersEllipticDto {
    constructor(centers?: Base.Point3[], height?: number, startRadius?: Base.Point2, endRadius?: Base.Point2, segments?: number) {
        if (centers !== undefined) { this.centers = centers; }
        if (height !== undefined) { this.height = height; }
        if (startRadius !== undefined) { this.startRadius = startRadius; }
        if (endRadius !== undefined) { this.endRadius = endRadius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The points halfway up each axis, one cylinder each, in the order the results come back
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * Full length of every cylinder along Z, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * The X and Y radii of every bottom end, in model units, as `[x, y]`
     * @default [1, 2]
     */
    startRadius: Base.Point2 = [1, 2];
    /**
     * The X and Y radii of every top end, in model units, as `[x, y]`; `[0, 0]` closes them to a
     * point
     * @default [2, 3]
     */
    endRadius: Base.Point2 = [2, 3];
    /**
     * Number of flat sides around each cylinder; more makes them rounder
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
/**
 * Feeds `shapes.cylinder`: a round cylinder standing along Z, given by the point halfway up its
 * axis, its height, its radius and how many flat sides approximate it.
 */
export class CylidnerDto {
    constructor(center?: Base.Point3, height?: number, radius?: number, segments?: number) {
        if (center !== undefined) { this.center = center; }
        if (height !== undefined) { this.height = height; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The point halfway up the axis; half the height lies above it along Z and half below
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Full length along Z, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Distance from the axis to the side, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Number of flat sides around the cylinder; more makes it rounder
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
/**
 * Feeds `shapes.roundedCylinder`: a cylinder standing along Z whose two rims are rounded, given by
 * the point halfway up its axis, the rounding radius, its height and radius and how finely it is
 * faceted.
 */
export class RoundedCylidnerDto {
    constructor(center?: Base.Point3, roundRadius?: number, height?: number, radius?: number, segments?: number) {
        if (center !== undefined) { this.center = center; }
        if (roundRadius !== undefined) { this.roundRadius = roundRadius; }
        if (height !== undefined) { this.height = height; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The point halfway up the axis; half the height lies above it along Z and half below
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Radius of the rounding on both rims, in model units; the height must be more than twice it or
     * an error is thrown
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    roundRadius = 0.1;
    /**
     * Full length along Z, in model units, rounding included
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Distance from the axis to the side, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Number of flat sides around the cylinder and pieces in the rounding; more makes it smoother
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
/**
 * Feeds `shapes.ellipsoid`: a sphere stretched separately along X, Y and Z, given by its center,
 * its three radii and how finely it is faceted.
 */
export class EllipsoidDto {
    constructor(center?: Base.Point3, radius?: Base.Point3, segments?: number) {
        if (center !== undefined) { this.center = center; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The point the ellipsoid is centered on
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The half sizes along X, Y and Z, in model units, as `[x, y, z]`; equal values make a sphere
     * @default [1, 2, 3]
     */
    radius: Base.Point3 = [1, 2, 3];
    /**
     * Number of facets around the ellipsoid; more makes it smoother
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
/**
 * Feeds `shapes.ellipsoidsOnCenterPoints`: one ellipsoid of the same radii on every center point,
 * coming back in the same order.
 */
export class EllipsoidCentersDto {
    constructor(centers?: Base.Point3[], radius?: Base.Point3, segments?: number) {
        if (centers !== undefined) { this.centers = centers; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The points the ellipsoids are centered on, one each, in the order the results come back
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * The half sizes of every ellipsoid along X, Y and Z, in model units, as `[x, y, z]`
     * @default [1, 2, 3]
     */
    radius: Base.Point3 = [1, 2, 3];
    /**
     * Number of facets around each ellipsoid; more makes them smoother
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
/**
 * Feeds `shapes.geodesicSphere`: a sphere made of evenly sized triangles, given by its center, its
 * radius and how finely the twenty starting faces are subdivided.
 */
export class GeodesicSphereDto {
    constructor(center?: Base.Point3, radius?: number, frequency?: number) {
        if (center !== undefined) { this.center = center; }
        if (radius !== undefined) { this.radius = radius; }
        if (frequency !== undefined) { this.frequency = frequency; }
    }
    /**
     * The point the sphere is centered on
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Distance from the center to the surface, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * How finely each of the twenty starting faces is subdivided; used in whole multiples of 6, at
     * least 6, and higher is rounder
     * @default 12
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    frequency = 12;
}
/**
 * Feeds `shapes.geodesicSpheresOnCenterPoints`: one geodesic sphere of the same radius on every
 * center point, coming back in the same order.
 */
export class GeodesicSphereCentersDto {
    constructor(centers?: Base.Point3[], radius?: number, frequency?: number) {
        if (centers !== undefined) { this.centers = centers; }
        if (radius !== undefined) { this.radius = radius; }
        if (frequency !== undefined) { this.frequency = frequency; }
    }
    /**
     * The points the spheres are centered on, one each, in the order the results come back
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * Distance from each center to its surface, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * How finely each of the twenty starting faces is subdivided; used in whole multiples of 6, at
     * least 6, and higher is rounder
     * @default 12
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    frequency = 12;
}
/**
 * Feeds `shapes.cylindersOnCenterPoints`: one round cylinder of the same size standing along Z on
 * every center point, coming back in the same order.
 */
export class CylidnerCentersDto {
    constructor(centers?: Base.Point3[], height?: number, radius?: number, segments?: number) {
        if (centers !== undefined) { this.centers = centers; }
        if (height !== undefined) { this.height = height; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The points halfway up each axis, one cylinder each, in the order the results come back
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * Full length of every cylinder along Z, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Distance from the axis to the side of every cylinder, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Number of flat sides around each cylinder; more makes them rounder
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
/**
 * Feeds `shapes.roundedCylindersOnCenterPoints`: one rounded cylinder of the same size on every
 * center point, coming back in the same order.
 */
export class RoundedCylidnerCentersDto {
    constructor(centers?: Base.Point3[], roundRadius?: number, height?: number, radius?: number, segments?: number) {
        if (centers !== undefined) { this.centers = centers; }
        if (roundRadius !== undefined) { this.roundRadius = roundRadius; }
        if (height !== undefined) { this.height = height; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The points halfway up each axis, one cylinder each, in the order the results come back
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * Radius of the rounding on both rims of every cylinder, in model units; the height must be
     * more than twice it or an error is thrown
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    roundRadius = 0.1;
    /**
     * Full length of every cylinder along Z, in model units, rounding included
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Distance from the axis to the side of every cylinder, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Number of flat sides around each cylinder and pieces in the rounding; more makes them
     * smoother
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
/**
 * Feeds `shapes.sphere`: a sphere given by its center point, its radius and how many facets
 * approximate it.
 */
export class SphereDto {
    constructor(center?: Base.Point3, radius?: number, segments?: number) {
        if (center !== undefined) { this.center = center; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The point the sphere is centered on
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Distance from the center to the surface, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Number of facets around the sphere; more makes it rounder
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
/**
 * Feeds `shapes.spheresOnCenterPoints`: one sphere of the same radius on every center point, coming
 * back in the same order.
 */
export class SphereCentersDto {
    constructor(centers?: Base.Point3[], radius?: number, segments?: number) {
        if (centers !== undefined) { this.centers = centers; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The points the spheres are centered on, one each, in the order the results come back
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * Distance from each center to its surface, in model units
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Number of facets around each sphere; more makes them rounder
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
/**
 * Feeds `shapes.torus`: a ring with a round cross-section lying flat in the XY plane around the
 * origin, given by the ring and tube radii, the facet counts of each and the angles that can leave
 * the ring partly open.
 */
export class TorusDto {
    constructor(center?: Base.Point3, innerRadius?: number, outerRadius?: number, innerSegments?: number, outerSegments?: number, innerRotation?: number, outerRotation?: number, startAngle?: number) {
        if (center !== undefined) { this.center = center; }
        if (innerRadius !== undefined) { this.innerRadius = innerRadius; }
        if (outerRadius !== undefined) { this.outerRadius = outerRadius; }
        if (innerSegments !== undefined) { this.innerSegments = innerSegments; }
        if (outerSegments !== undefined) { this.outerSegments = outerSegments; }
        if (innerRotation !== undefined) { this.innerRotation = innerRotation; }
        if (outerRotation !== undefined) { this.outerRotation = outerRotation; }
        if (startAngle !== undefined) { this.startAngle = startAngle; }
    }
    /**
     * Meant to be the ring's center; it is not applied at present, the torus is built around the
     * origin, so move it with `transformSolid`
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Radius of the tube itself, in model units; it must be less than `outerRadius`
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    innerRadius = 1;
    /**
     * Distance from the ring's center to the middle of the tube, in model units, so the ring spans
     * twice the sum of both radii
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    outerRadius = 2;
    /**
     * Number of flat pieces around the tube's cross-section; more makes the tube rounder
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    innerSegments = 24;
    /**
     * Number of flat pieces around the ring; more makes the ring rounder
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    outerSegments = 24;
    /**
     * Turn of the tube's cross-section about its own center, in degrees; it shows when
     * `innerSegments` is low enough for the facets to be visible
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    innerRotation = 0;
    /**
     * How far the tube is swept around the ring, in degrees; 360 closes the ring and less leaves it
     * open
     * @default 360
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    outerRotation = 360;
    /**
     * Where the sweep around the ring starts, in degrees from the X axis
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    startAngle = 0;
}
