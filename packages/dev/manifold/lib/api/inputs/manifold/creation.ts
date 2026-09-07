// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";
import { DecomposedManifoldMeshDto, fillRuleEnum } from "./pointers-and-enums";

export class CreateFromMeshDto {
    constructor(mesh?: DecomposedManifoldMeshDto) {
        if (mesh !== undefined) { this.mesh = mesh; }
    }
    /**
     * Mesh definition
     */
    mesh!: DecomposedManifoldMeshDto;
}
export class FromPolygonPointsDto {
    constructor(polygonPoints?: Base.Point3[][]) {
        if (polygonPoints !== undefined) { this.polygonPoints = polygonPoints; }
    }
    /**
     * Points describing polygons
     */
    polygonPoints!: Base.Point3[][];
}
export class CrossSectionFromPolygonPointsDto {
    constructor(points?: Base.Point3[], fillRule?: fillRuleEnum, removeDuplicates?: boolean, tolerance?: number) {
        if (points !== undefined) { this.points = points; }
        if (fillRule !== undefined) { this.fillRule = fillRule; }
        if (removeDuplicates !== undefined) { this.removeDuplicates = removeDuplicates; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * Points describing a single polygon
     */
    points!: Base.Point3[];
    /**
     * Fill rule for polygon interpretation
     * @default positive
     */
    fillRule?: fillRuleEnum | undefined = fillRuleEnum.positive;
    /**
     * Remove consecutive duplicate points before creating polygon
     * @default false
     */
    removeDuplicates?: boolean | undefined = false;
    /**
     * Tolerance for duplicate removal
     * @default 1e-7
     */
    tolerance?: number | undefined = 1e-7;
}
export class CrossSectionFromPolygonsPointsDto {
    constructor(polygonPoints?: Base.Point3[][], fillRule?: fillRuleEnum, removeDuplicates?: boolean, tolerance?: number) {
        if (polygonPoints !== undefined) { this.polygonPoints = polygonPoints; }
        if (fillRule !== undefined) { this.fillRule = fillRule; }
        if (removeDuplicates !== undefined) { this.removeDuplicates = removeDuplicates; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * Points describing multiple polygons
     */
    polygonPoints!: Base.Point3[][];
    /**
     * Fill rule for polygon interpretation
     * @default positive
     */
    fillRule?: fillRuleEnum | undefined = fillRuleEnum.positive;
    /**
     * Remove consecutive duplicate points before creating polygons
     * @default false
     */
    removeDuplicates?: boolean | undefined = false;
    /**
     * Tolerance for duplicate removal
     * @default 1e-7
     */
    tolerance?: number | undefined = 1e-7;
}
export class CubeDto {
    constructor(center?: boolean, size?: number) {
        if (center !== undefined) { this.center = center; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * Place cube on the center
     * @default true
     */
    center = true;
    /**
     * Size of the cube
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    size = 1;
}
export class CreateContourSectionDto {
    constructor(polygons?: Base.Vector2[][], fillRule?: fillRuleEnum) {
        if (polygons !== undefined) { this.polygons = polygons; }
        if (fillRule !== undefined) { this.fillRule = fillRule; }
    }
    /**
     * Polygons to use for the contour section
     * @default undefined
     */
    polygons!: Base.Vector2[][];
    /**
     * Fill rule for the contour section
     * @default EvenOdd
     */
    fillRule: fillRuleEnum = fillRuleEnum.evenOdd;
}
export class SquareDto {
    constructor(center?: boolean, size?: number) {
        if (center !== undefined) { this.center = center; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * Place cube on the center
     * @default false
     */
    center = false;
    /**
     * Size of the cube
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    size = 1;
}
export class SphereDto {
    constructor(radius?: number, circularSegments?: number) {
        if (radius !== undefined) { this.radius = radius; }
        if (circularSegments !== undefined) { this.circularSegments = circularSegments; }
    }
    /**
     * Radius of the sphere
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
      * Circular segments of the sphere
      * @default 32
      * @minimum 0
      * @maximum Infinity
      * @step 1
      */
    circularSegments: number = 32;
}
export class CylinderDto {
    constructor(height?: number, radiusLow?: number, radiusHigh?: number, circularSegments?: number, center?: boolean) {
        if (height !== undefined) { this.height = height; }
        if (radiusLow !== undefined) { this.radiusLow = radiusLow; }
        if (radiusHigh !== undefined) { this.radiusHigh = radiusHigh; }
        if (circularSegments !== undefined) { this.circularSegments = circularSegments; }
        if (center !== undefined) { this.center = center; }
    }
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
    radiusLow = 1;
    /**
     * Radius of the cylinder
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radiusHigh = 1;
    /**
     * Circular segments of the cylinder
     * @default 32
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    circularSegments = 32;
    /**
     * Place cylinder on the center
     * @default true
     */
    center = true;
}
export class CircleDto {
    constructor(radius?: number, circularSegments?: number) {
        if (radius !== undefined) { this.radius = radius; }
        if (circularSegments !== undefined) { this.circularSegments = circularSegments; }
    }
    /**
     * Radius of the cylinder
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Circular segments of the cylinder
     * @default 32
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    circularSegments = 32;
}
export class RectangleDto {
    constructor(length?: number, height?: number, center?: boolean) {
        if (length !== undefined) { this.length = length; }
        if (height !== undefined) { this.height = height; }
        if (center !== undefined) { this.center = center; }
    }
    /**
     * Length of the rectangle
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    length = 1;
    /**
     * Height of the rectangle
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Place rectangle on the center
     * @default false
     */
    center = false;
}
