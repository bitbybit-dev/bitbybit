// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";
import { DecomposedManifoldMeshDto, fillRuleEnum } from "./pointers-and-enums";

/**
 * Mesh data for `manifold.shapes.manifoldFromMesh`, which builds a solid from it.
 */
export class CreateFromMeshDto {
    constructor(mesh?: DecomposedManifoldMeshDto) {
        if (mesh !== undefined) { this.mesh = mesh; }
    }
    /**
     * The mesh data, in the form `manifoldToMesh` hands out; it must describe a closed,
     * consistently oriented surface.
     */
    mesh!: DecomposedManifoldMeshDto;
}
/**
 * Triangles as points for `manifold.shapes.fromPolygonPoints`, which builds a solid from them.
 */
export class FromPolygonPointsDto {
    constructor(polygonPoints?: Base.Point3[][]) {
        if (polygonPoints !== undefined) { this.polygonPoints = polygonPoints; }
    }
    /**
     * The triangles, each three points, together forming a closed surface.
     */
    polygonPoints!: Base.Point3[][];
}
/**
 * One polygon as points and the fill options for `crossSection.crossSectionFromPoints`.
 */
export class CrossSectionFromPolygonPointsDto {
    constructor(points?: Base.Point3[], fillRule?: fillRuleEnum, removeDuplicates?: boolean, tolerance?: number) {
        if (points !== undefined) { this.points = points; }
        if (fillRule !== undefined) { this.fillRule = fillRule; }
        if (removeDuplicates !== undefined) { this.removeDuplicates = removeDuplicates; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The polygon's points in order; only X and Y are used.
     */
    points!: Base.Point3[];
    /**
     * Which regions of a self-crossing polygon count as inside: even-odd, non-zero, positive or
     * negative winding.
     * @default positive
     */
    fillRule?: fillRuleEnum | undefined = fillRuleEnum.positive;
    /**
     * When true, consecutive repeated points, the last and first included, are dropped before
     * building.
     * @default false
     */
    removeDuplicates?: boolean | undefined = false;
    /**
     * How close two points must be to count as repeated, in model units.
     * @default 1e-7
     */
    tolerance?: number | undefined = 1e-7;
}
/**
 * Several polygons as points and the fill options for `crossSection.crossSectionFromPolygons`, for
 * outlines with holes.
 */
export class CrossSectionFromPolygonsPointsDto {
    constructor(polygonPoints?: Base.Point3[][], fillRule?: fillRuleEnum, removeDuplicates?: boolean, tolerance?: number) {
        if (polygonPoints !== undefined) { this.polygonPoints = polygonPoints; }
        if (fillRule !== undefined) { this.fillRule = fillRule; }
        if (removeDuplicates !== undefined) { this.removeDuplicates = removeDuplicates; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * One list of points per polygon; only X and Y are used.
     */
    polygonPoints!: Base.Point3[][];
    /**
     * Which regions count as inside where polygons overlap: even-odd, non-zero, positive or
     * negative winding.
     * @default positive
     */
    fillRule?: fillRuleEnum | undefined = fillRuleEnum.positive;
    /**
     * When true, consecutive repeated points in each polygon, the last and first included, are
     * dropped before building.
     * @default false
     */
    removeDuplicates?: boolean | undefined = false;
    /**
     * How close two points must be to count as repeated, in model units.
     * @default 1e-7
     */
    tolerance?: number | undefined = 1e-7;
}
/**
 * A size and a placement for `manifold.shapes.cube`.
 */
export class CubeDto {
    constructor(center?: boolean, size?: number) {
        if (center !== undefined) { this.center = center; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * When true, the box is centered on the origin; when false its corner sits there and it extends
     * along the positive axes.
     * @default true
     */
    center = true;
    /**
     * The side length, one number for a cube or three for a box along X, Y and Z, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    size = 1;
}
/**
 * Polygons as 2D points and a fill rule for `crossSection.shapes.create`.
 */
export class CreateContourSectionDto {
    constructor(polygons?: Base.Vector2[][], fillRule?: fillRuleEnum) {
        if (polygons !== undefined) { this.polygons = polygons; }
        if (fillRule !== undefined) { this.fillRule = fillRule; }
    }
    /**
     * The polygons, each a list of 2D points; overlapping ones are fused.
     * @default undefined
     */
    polygons!: Base.Vector2[][];
    /**
     * Which regions count as inside where polygons overlap: even-odd, non-zero, positive or
     * negative winding.
     * @default EvenOdd
     */
    fillRule: fillRuleEnum = fillRuleEnum.evenOdd;
}
/**
 * A side length and a placement for `crossSection.shapes.square`.
 */
export class SquareDto {
    constructor(center?: boolean, size?: number) {
        if (center !== undefined) { this.center = center; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * When true, the square is centered on the origin; when false its corner sits there.
     * @default false
     */
    center = false;
    /**
     * The side length, one number for a square or two for a rectangle along X and Y, in model
     * units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    size = 1;
}
/**
 * A radius and a segment count for `manifold.shapes.sphere`.
 */
export class SphereDto {
    constructor(radius?: number, circularSegments?: number) {
        if (radius !== undefined) { this.radius = radius; }
        if (circularSegments !== undefined) { this.circularSegments = circularSegments; }
    }
    /**
     * The distance from the center to the surface, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * How many segments go around the sphere; rounded up to a multiple of four.
     * @default 32
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    circularSegments: number = 32;
}
/**
 * The size and placement of a cylinder or cone for `manifold.shapes.cylinder`, which stands it
 * along Z.
 */
export class CylinderDto {
    constructor(height?: number, radiusLow?: number, radiusHigh?: number, circularSegments?: number, center?: boolean) {
        if (height !== undefined) { this.height = height; }
        if (radiusLow !== undefined) { this.radiusLow = radiusLow; }
        if (radiusHigh !== undefined) { this.radiusHigh = radiusHigh; }
        if (circularSegments !== undefined) { this.circularSegments = circularSegments; }
        if (center !== undefined) { this.center = center; }
    }
    /**
     * The height along Z, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * The radius of the bottom circle, in model units; must be above 0.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radiusLow = 1;
    /**
     * The radius of the top circle, in model units: equal to `radiusLow` for a cylinder, smaller
     * for a truncated cone, 0 for a pointed cone.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radiusHigh = 1;
    /**
     * How many flat sides go around the cylinder; more is rounder.
     * @default 32
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    circularSegments = 32;
    /**
     * When true, the cylinder is centered on the origin; when false it stands on the XY plane.
     * @default true
     */
    center = true;
}
/**
 * A radius and a segment count for `crossSection.shapes.circle`.
 */
export class CircleDto {
    constructor(radius?: number, circularSegments?: number) {
        if (radius !== undefined) { this.radius = radius; }
        if (circularSegments !== undefined) { this.circularSegments = circularSegments; }
    }
    /**
     * The distance from the center to the outline, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * How many straight sides the circle is drawn with; more is rounder.
     * @default 32
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    circularSegments = 32;
}
/**
 * Two sides and a placement for `crossSection.shapes.rectangle`.
 */
export class RectangleDto {
    constructor(length?: number, height?: number, center?: boolean) {
        if (length !== undefined) { this.length = length; }
        if (height !== undefined) { this.height = height; }
        if (center !== undefined) { this.center = center; }
    }
    /**
     * The side along X, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    length = 1;
    /**
     * The side along Y, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * When true, the rectangle is centered on the origin; when false its corner sits there.
     * @default false
     */
    center = false;
}
