// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

export class CubeDto {
    constructor(center?: Base.Point3, size?: number) {
        if (center !== undefined) { this.center = center; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * Center coordinates of the cube
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Size of the cube
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    size = 1;
}
export class CubeCentersDto {
    constructor(centers?: Base.Point3[], size?: number) {
        if (centers !== undefined) { this.centers = centers; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * Center coordinates of the cubes
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * Size of the cube
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    size = 1;
}
export class CuboidDto {
    constructor(center?: Base.Point3, width?: number, length?: number, height?: number) {
        if (center !== undefined) { this.center = center; }
        if (width !== undefined) { this.width = width; }
        if (length !== undefined) { this.length = length; }
        if (height !== undefined) { this.height = height; }
    }
    /**
     * Center coordinates of the cubod
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Width of the cuboid
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 1;
    /**
     * Length of the cuboid
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    length = 1;
    /**
     * Height of the cuboid
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
}
export class CuboidCentersDto {
    constructor(centers?: Base.Point3[], width?: number, length?: number, height?: number) {
        if (centers !== undefined) { this.centers = centers; }
        if (width !== undefined) { this.width = width; }
        if (length !== undefined) { this.length = length; }
        if (height !== undefined) { this.height = height; }
    }
    /**
     * Center coordinates of the cuboids
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * Width of the cuboids
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 1;
    /**
     * Length of the cuboids
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    length = 1;
    /**
     * Height of the cuboids
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
}
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
     * Center coordinates of the cubod
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Radius for rounding edges
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    roundRadius = 1;
    /**
     * Width of the cuboid
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 1;
    /**
     * Length of the cuboid
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    length = 1;
    /**
     * Height of the cuboid
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Segments of rounded edges
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
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
     * Center coordinates of the cuboids
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * Radius for rounding edges
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    roundRadius = 0.1;
    /**
     * Width of the cuboids
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 1;
    /**
     * Length of the cuboids
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    length = 1;
    /**
     * Height of the cuboids
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Segments of rounded edges
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
export class CylidnerEllipticDto {
    constructor(center?: Base.Point3, height?: number, startRadius?: Base.Point2, endRadius?: Base.Point2, segments?: number) {
        if (center !== undefined) { this.center = center; }
        if (height !== undefined) { this.height = height; }
        if (startRadius !== undefined) { this.startRadius = startRadius; }
        if (endRadius !== undefined) { this.endRadius = endRadius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * Center of the cylinder
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Height of the cylinder
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Start radius on X and Y directions
     * @default [1, 2]
     */
    startRadius: Base.Vector2 = [1, 2];
    /**
     * End radius on X and Y directions
     * @default [2, 3]
     */
    endRadius: Base.Vector2 = [2, 3];
    /**
     * Subdivision segments
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
export class CylidnerCentersEllipticDto {
    constructor(centers?: Base.Point3[], height?: number, startRadius?: Base.Point2, endRadius?: Base.Point2, segments?: number) {
        if (centers !== undefined) { this.centers = centers; }
        if (height !== undefined) { this.height = height; }
        if (startRadius !== undefined) { this.startRadius = startRadius; }
        if (endRadius !== undefined) { this.endRadius = endRadius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * Centers of the cylinders
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * Height of the cylinders
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Start radius on X and Y directions
     * @default [1, 2]
     */
    startRadius: Base.Point2 = [1, 2];
    /**
     * End radius on X and Y directions
     * @default [2, 3]
     */
    endRadius: Base.Point2 = [2, 3];
    /**
     * Subdivision segments
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
export class CylidnerDto {
    constructor(center?: Base.Point3, height?: number, radius?: number, segments?: number) {
        if (center !== undefined) { this.center = center; }
        if (height !== undefined) { this.height = height; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * Center of the cylinder
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Height of the cylinder
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Radius of the cylinder
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Subdivision segments
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
export class RoundedCylidnerDto {
    constructor(center?: Base.Point3, roundRadius?: number, height?: number, radius?: number, segments?: number) {
        if (center !== undefined) { this.center = center; }
        if (roundRadius !== undefined) { this.roundRadius = roundRadius; }
        if (height !== undefined) { this.height = height; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * Center of the cylinder
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Rounding radius
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    roundRadius = 0.1;
    /**
     * Height of the cylinder
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Radius of the cylinder
     * @default 1
     * @minimum 0
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
export class EllipsoidDto {
    constructor(center?: Base.Point3, radius?: Base.Point3, segments?: number) {
        if (center !== undefined) { this.center = center; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * Center coordinates
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Radius of the ellipsoid in [x, y, z] form
     * @default [1, 2, 3]
     */
    radius: Base.Point3 = [1, 2, 3];
    /**
     * Segment count for ellipsoid
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
export class EllipsoidCentersDto {
    constructor(centers?: Base.Point3[], radius?: Base.Point3, segments?: number) {
        if (centers !== undefined) { this.centers = centers; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * Center coordinates
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * Radius of the ellipsoid in [x, y, z] form
     * @default [1, 2, 3]
     */
    radius: Base.Point3 = [1, 2, 3];
    /**
     * Segment count for ellipsoid
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
export class GeodesicSphereDto {
    constructor(center?: Base.Point3, radius?: number, frequency?: number) {
        if (center !== undefined) { this.center = center; }
        if (radius !== undefined) { this.radius = radius; }
        if (frequency !== undefined) { this.frequency = frequency; }
    }
    /**
     * Center coordinate of the geodesic sphere
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Radius of the sphere
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Subdivision count
     * @default 12
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    frequency = 12;
}
export class GeodesicSphereCentersDto {
    constructor(centers?: Base.Point3[], radius?: number, frequency?: number) {
        if (centers !== undefined) { this.centers = centers; }
        if (radius !== undefined) { this.radius = radius; }
        if (frequency !== undefined) { this.frequency = frequency; }
    }
    /**
     * Center coordinates of the geodesic spheres
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * Radius of the sphere
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Subdivision count
     * @default 12
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    frequency = 12;
}
export class CylidnerCentersDto {
    constructor(centers?: Base.Point3[], height?: number, radius?: number, segments?: number) {
        if (centers !== undefined) { this.centers = centers; }
        if (height !== undefined) { this.height = height; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * Centers of the cylinders
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * Height of the cylinders
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Radius of the cylinders
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Subdivision segments
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
export class RoundedCylidnerCentersDto {
    constructor(centers?: Base.Point3[], roundRadius?: number, height?: number, radius?: number, segments?: number) {
        if (centers !== undefined) { this.centers = centers; }
        if (roundRadius !== undefined) { this.roundRadius = roundRadius; }
        if (height !== undefined) { this.height = height; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * Centers of the cylinders
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * Rounding radius
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    roundRadius = 0.1;
    /**
     * Height of the cylinders
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Radius of the cylinders
     * @default 1
     * @minimum 0
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
export class SphereDto {
    constructor(center?: Base.Point3, radius?: number, segments?: number) {
        if (center !== undefined) { this.center = center; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * Center point of the sphere
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Radius of the sphere
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Segment count
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
export class SphereCentersDto {
    constructor(centers?: Base.Point3[], radius?: number, segments?: number) {
        if (centers !== undefined) { this.centers = centers; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * Center points of the spheres
     * @default undefined
     */
    centers!: Base.Point3[];
    /**
     * Radius of the spheres
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Segment count
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
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
     * Center coordinate
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Inner radius
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    innerRadius = 1;
    /**
     * Outer radius
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    outerRadius = 2;
    /**
     * Number of inner segments
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    innerSegments = 24;
    /**
     * Number of outer segments
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    outerSegments = 24;
    /**
     * Inner rotation in degrees
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    innerRotation = 0;
    /**
     * Outer rotation in degrees
     * @default 360
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    outerRotation = 360;
    /**
     * Start angle in degrees
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    startAngle = 0;
}
