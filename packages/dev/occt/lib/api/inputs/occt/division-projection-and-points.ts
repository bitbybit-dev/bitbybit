// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { pointProjectionTypeEnum } from "./enums";

export class DivideDto<T> {
    constructor(shape?: T, nrOfDivisions?: number, removeStartPoint?: boolean, removeEndPoint?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (nrOfDivisions !== undefined) { this.nrOfDivisions = nrOfDivisions; }
        if (removeStartPoint !== undefined) { this.removeStartPoint = removeStartPoint; }
        if (removeEndPoint !== undefined) { this.removeEndPoint = removeEndPoint; }
    }
    /**
     * Shape representing a wire
     * @default undefined
     */
    shape!: T;
    /**
     * The number of divisions that will be performed on the curve
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrOfDivisions?: number | undefined = 10;
    /**
     * Indicates if algorithm should remove start point
     * @default false
     */
    removeStartPoint?: boolean | undefined = false;
    /**
     * Indicates if algorithm should remove end point
     * @default false
     */
    removeEndPoint?: boolean | undefined = false;
}

export class ProjectWireDto<T, U> {
    constructor(wire?: T, shape?: U, direction?: Base.Vector3) {
        if (wire !== undefined) { this.wire = wire; }
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * Wire to project
     * @default undefined
     */
    wire!: T;
    /**
     * Shape to use for projection
     * @default undefined
     */
    shape!: U;
    /**
     * Direction vector for projection
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
export class ProjectPointsOnShapeDto<T> {
    constructor(points?: Base.Point3[], shape?: T, direction?: Base.Vector3, projectionType?: pointProjectionTypeEnum) {
        if (points !== undefined) { this.points = points; }
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
        if (projectionType !== undefined) { this.projectionType = projectionType; }
    }
    /**
     * Points to project
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * Shape to use for projection
     * @default undefined
     */
    shape!: T;
    /**
     * Direction vector for projection - this must take the length into account as well, because algorithm looks for intresections with the shape in this direction. It will not find solutions outside the given length of this vector.
     * @default [0, 10, 0]
     */
    direction: Base.Vector3 = [0, 10, 0];
    /**
     * Allows user to choose what solutions are being returned by this operation.
     * @default all
     */
    projectionType: pointProjectionTypeEnum = pointProjectionTypeEnum.all;
}
export class WiresToPointsDto<T> {
    constructor(shape?: T, angularDeflection?: number, curvatureDeflection?: number, minimumOfPoints?: number, uTolerance?: number, minimumLength?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (angularDeflection !== undefined) { this.angularDeflection = angularDeflection; }
        if (curvatureDeflection !== undefined) { this.curvatureDeflection = curvatureDeflection; }
        if (minimumOfPoints !== undefined) { this.minimumOfPoints = minimumOfPoints; }
        if (uTolerance !== undefined) { this.uTolerance = uTolerance; }
        if (minimumLength !== undefined) { this.minimumLength = minimumLength; }
    }
    /**
     * Shape to use for parsing edges
     * @default undefined
     */
    shape!: T;
    /**
     * The angular deflection
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    angularDeflection = 0.1;
    /**
     * The curvature deflection
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    curvatureDeflection = 0.1;
    /**
     * Minimum of points
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    minimumOfPoints = 2;
    /**
     * U tolerance
     * @default 1.0e-9
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-9
     */
    uTolerance = 1.0e-9;
    /**
     * Minimum length
     * @default 1.0e-7
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-7
     */
    minimumLength = 1.0e-7;
}
export class EdgesToPointsDto<T> {
    constructor(shape?: T, angularDeflection?: number, curvatureDeflection?: number, minimumOfPoints?: number, uTolerance?: number, minimumLength?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (angularDeflection !== undefined) { this.angularDeflection = angularDeflection; }
        if (curvatureDeflection !== undefined) { this.curvatureDeflection = curvatureDeflection; }
        if (minimumOfPoints !== undefined) { this.minimumOfPoints = minimumOfPoints; }
        if (uTolerance !== undefined) { this.uTolerance = uTolerance; }
        if (minimumLength !== undefined) { this.minimumLength = minimumLength; }
    }
    /**
     * Shape to use for parsing edges
     * @default undefined
     */
    shape!: T;
    /**
     * The angular deflection
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    angularDeflection = 0.1;
    /**
     * The curvature deflection
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    curvatureDeflection = 0.1;
    /**
     * Minimum of points
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    minimumOfPoints = 2;
    /**
     * U tolerance
     * @default 1.0e-9
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-9
     */
    uTolerance = 1.0e-9;
    /**
     * Minimum length
     * @default 1.0e-7
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-7
     */
    minimumLength = 1.0e-7;
}
export class ProjectWiresDto<T, U> {
    constructor(wires?: T[], shape?: U, direction?: Base.Vector3) {
        if (wires !== undefined) { this.wires = wires; }
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * Wire to project
     * @default undefined
     */
    wires!: T[];
    /**
     * Shape to use for projection
     * @default undefined
     */
    shape!: U;
    /**
     * Direction vector for projection
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
export class DivideShapesDto<T> {
    constructor(shapes: T[], nrOfDivisions?: number, removeStartPoint?: boolean, removeEndPoint?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (nrOfDivisions !== undefined) { this.nrOfDivisions = nrOfDivisions; }
        if (removeStartPoint !== undefined) { this.removeStartPoint = removeStartPoint; }
        if (removeEndPoint !== undefined) { this.removeEndPoint = removeEndPoint; }
    }
    /**
     * Shapes
     * @default undefined
     */
    shapes!: T[];
    /**
     * The number of divisions that will be performed on the curve
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrOfDivisions = 10;
    /**
     * Indicates if algorithm should remove start point
     * @default false
     */
    removeStartPoint = false;
    /**
     * Indicates if algorithm should remove end point
     * @default false
     */
    removeEndPoint = false;
}
export class DataOnGeometryAtParamDto<T> {
    constructor(shape: T, param?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (param !== undefined) { this.param = param; }
    }
    /**
     * Shape representing a geometry
     * @default undefined
     */
    shape!: T;
    /**
     * 0 - 1 value
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    param = 0.5;
}
export class DataOnGeometryesAtParamDto<T> {
    constructor(shapes: T[], param?: number) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (param !== undefined) { this.param = param; }
    }
    /**
     * Shapes representing a geometry
     * @default undefined
     */
    shapes!: T[];
    /**
     * 0 - 1 value
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    param = 0.5;
}
export class PointInFaceDto<T> {
    constructor(face: T, edge: T, tEdgeParam?: number, distance2DParam?: number) {
        if (face !== undefined) { this.face = face; }
        if (edge !== undefined) { this.edge = edge; }
        if (tEdgeParam !== undefined) { this.tEdgeParam = tEdgeParam; }
        if (distance2DParam !== undefined) { this.distance2DParam = distance2DParam; }
    }
    /** 
     * OCCT face to be used for calculation 
     * @default undefined
     */
    face!: T;
    /**
     * OCCT edge to be used for calculation
     * @default undefined
     */
    edge!: T;
    /**
     * 0 - 1 value
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    tEdgeParam = 0.5;
    /**
     * The point will be distanced on <distance2DParam> from the 2d curve.
     * @default 0.5
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    distance2DParam = 0.5;
}

export class PointsOnWireAtEqualLengthDto<T> {
    constructor(shape: T, length?: number, tryNext?: boolean, includeFirst?: boolean, includeLast?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (length !== undefined) { this.length = length; }
        if (tryNext !== undefined) { this.tryNext = tryNext; }
        if (includeFirst !== undefined) { this.includeFirst = includeFirst; }
        if (includeLast !== undefined) { this.includeLast = includeLast; }
    }
    /**
     * Shape representing a wire
     * @default undefined
     */
    shape!: T;
    /**
     * length at which to evaluate the point
     * @default 0.5
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    length = 0.5;
    /**
     * Try next point if the point is not found
     * @default false
     */
    tryNext = false;
    /**
     * Include first point
     * @default false
     */
    includeFirst = false;
    /**
     * Include last point
     * @default false
     */
    includeLast = false;
}


export class PointsOnWireAtPatternOfLengthsDto<T> {
    constructor(shape: T, lengths?: number[], tryNext?: boolean, includeFirst?: boolean, includeLast?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (lengths !== undefined) { this.lengths = lengths; }
        if (tryNext !== undefined) { this.tryNext = tryNext; }
        if (includeFirst !== undefined) { this.includeLast = includeFirst; }
        if (includeLast !== undefined) { this.includeLast = includeLast; }
    }
    /**
     * Shape representing a wire
     * @default undefined
     */
    shape!: T;
    /**
     * length at which to evaluate the point
     * @default undefined
     */
    lengths!: number[];
    /**
     * Try next point if the point is not found
     * @default false
     */
    tryNext = false;
    /**
     * Include first point
     * @default false
     */
    includeFirst = false;
    /**
     * Include last point
     * @default false
     */
    includeLast = false;
}
export class DataOnGeometryAtLengthDto<T> {
    constructor(shape: T, length?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (length !== undefined) { this.length = length; }
    }
    /**
     * Shape
     * @default undefined
     */
    shape!: T;
    /**
     * length at which to evaluate the point
     * @default 0.5
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    length = 0.5;
}

export class DataOnGeometryesAtLengthDto<T> {
    constructor(shapes: T[], length?: number) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (length !== undefined) { this.length = length; }
    }
    /**
     * Shapes
     * @default undefined
     */
    shapes!: T[];
    /**
     * length at which to evaluate the point
     * @default 0.5
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    length = 0.5;
}

export class DataOnGeometryAtLengthsDto<T> {
    constructor(shape: T, lengths?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (lengths !== undefined) { this.lengths = lengths; }
    }
    /**
     * Shape representing a wire
     * @default undefined
     */
    shape!: T;
    /**
     * lengths at which to evaluate the points
     * @default undefined
     */
    lengths!: number[];
}
export class CircleDto {
    constructor(radius?: number, center?: Base.Point3, direction?: Base.Vector3) {
        if (radius !== undefined) { this.radius = radius; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * Radius of the circle
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Center of the circle
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction vector for circle
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
export class HexagonsInGridDto {
    constructor(wdith?: number, height?: number, nrHexagonsInHeight?: number, nrHexagonsInWidth?: number, flatTop?: boolean, extendTop?: boolean, extendBottom?: boolean, extendLeft?: boolean, extendRight?: boolean, scalePatternWidth?: number[], scalePatternHeight?: number[], filletPattern?: number[], inclusionPattern?: boolean[]) {
        if (wdith !== undefined) { this.width = wdith; }
        if (height !== undefined) { this.height = height; }
        if (nrHexagonsInHeight !== undefined) { this.nrHexagonsInHeight = nrHexagonsInHeight; }
        if (nrHexagonsInWidth !== undefined) { this.nrHexagonsInWidth = nrHexagonsInWidth; }
        if (flatTop !== undefined) { this.flatTop = flatTop; }
        if (extendTop !== undefined) { this.extendTop = extendTop; }
        if (extendBottom !== undefined) { this.extendBottom = extendBottom; }
        if (extendLeft !== undefined) { this.extendLeft = extendLeft; }
        if (extendRight !== undefined) { this.extendRight = extendRight; }
        if (scalePatternWidth !== undefined) { this.scalePatternWidth = scalePatternWidth; }
        if (scalePatternHeight !== undefined) { this.scalePatternHeight = scalePatternHeight; }
        if (filletPattern !== undefined) { this.filletPattern = filletPattern; }
        if (inclusionPattern !== undefined) { this.inclusionPattern = inclusionPattern; }
    }
    /** Total desired width for the grid area. The hexagon size will be derived from this and nrHexagonsU.
     * @default 10
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width?: number | undefined = 10;
    /** Total desired height for the grid area. Note: due to hexagon geometry, the actual grid height might differ slightly if maintaining regular hexagons based on width.
     * @default 10
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
    */
    height?: number | undefined = 10;
    /** Number of hexagons desired in width.
     * @default 10
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    nrHexagonsInWidth?: number | undefined = 10;
    /** Number of hexagons desired in height.
     * @default 10
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    nrHexagonsInHeight?: number | undefined = 10;
    /** If true, the hexagons will be oriented with their flat sides facing up and down. 
     * @default false
     */
    flatTop?: boolean | undefined = false;
    /** If true, shift the entire grid up by half hex height. 
     * @default false
    */
    extendTop?: boolean | undefined = false;
    /** If true, shift the entire grid down by half hex height. 
     * @default false
    */
    extendBottom?: boolean | undefined = false;
    /** If true, shift the entire grid left by half hex width. 
     * @default false
    */
    extendLeft?: boolean | undefined = false;
    /** If true, shift the entire grid right by half hex width. 
     * @default false
    */
    extendRight?: boolean | undefined = false;
    /**
     * Hex scale pattern on width direction - numbers between 0 and 1, if 1 or undefined is used, no scaling is applied
     * @default undefined
     * @optional true
     */
    scalePatternWidth?: number[] | undefined;
    /**
     * Hex scale pattern on height direction - numbers between 0 and 1, if 1 or undefined is used, no scaling is applied
     * @default undefined
     * @optional true
     */
    scalePatternHeight?: number[] | undefined;
    /**
     * Hex fillet scale pattern - numbers between 0 and 1, if 0 is used, no fillet is applied, 
     * if 1 is used, the fillet will be exactly half of the length of the shorter side of the hex
     * @default undefined
     * @optional true
     */
    filletPattern?: number[] | undefined;
    /**
     * Inclusion pattern - true means that the hex will be included, 
     * false means that the hex will be removed
     * @default undefined
     * @optional true
     */
    inclusionPattern?: boolean[] | undefined;
}
