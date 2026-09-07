// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";

export class CompoundShapesDto<T> {
    constructor(shapes?: T[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
    }
    /**
     * Shapes to add to compound
     * @default undefined
     */
    shapes!: T[];
}
export class ThisckSolidSimpleDto<T> {
    constructor(shape?: T, offset?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (offset !== undefined) { this.offset = offset; }
    }
    /**
     * Shape to make thick
     * @default undefined
     */
    shape!: T;
    /**
     * Offset distance
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    offset = 1;
}
export class Offset3DWireDto<T> {
    constructor(shape?: T, offset?: number, direction?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (offset !== undefined) { this.offset = offset; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * Shape to make thick
     * @default undefined
     */
    shape!: T;
    /**
     * Offset distance
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    offset = 1;
    /**
     * Direction normal of the plane for the offset
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
export class FaceFromWireDto<T> {
    constructor(shape?: T, planar?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (planar !== undefined) { this.planar = planar; }
    }
    /**
     * Wire shape to convert into a face
     * @default undefined
     */
    shape!: T;
    /**
     * Should plane be planar
     * @default false
     */
    planar = false;
}
export class FaceFromWireOnFaceDto<T, U> {
    constructor(wire?: T, face?: U, inside?: boolean) {
        if (wire !== undefined) { this.wire = wire; }
        if (face !== undefined) { this.face = face; }
        if (inside !== undefined) { this.inside = inside; }
    }
    /**
     * Wire shape to convert into a face
     * @default undefined
     */
    wire!: T;
    /**
     * Face to attach the wire to
     * @default undefined
     */
    face!: U;
    /**
     * Indication if wire is inside the surface or outside
     * @default true
     */
    inside = true;
}
export class FacesFromWiresOnFaceDto<T, U> {
    constructor(wires?: T[], face?: U, inside?: boolean) {
        if (wires !== undefined) { this.wires = wires; }
        if (face !== undefined) { this.face = face; }
        if (inside !== undefined) { this.inside = inside; }
    }
    /**
     * Wire shape to convert into a face
     * @default undefined
     */
    wires!: T[];
    /**
     * Face to attach the wires to
     * @default undefined
     */
    face!: U;
    /**
     * Indication if wire is inside the surface or outside
     * @default true
     */
    inside = true;
}
export class FaceFromWiresDto<T> {
    constructor(shapes?: T[], planar?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (planar !== undefined) { this.planar = planar; }
    }
    /**
     * Wire shapes to convert into a faces
     * @default undefined
     */
    shapes!: T[];
    /**
     * Should plane be planar
     * @default false
     */
    planar = false;
}
export class FacesFromWiresDto<T> {
    constructor(shapes?: T[], planar?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (planar !== undefined) { this.planar = planar; }
    }
    /**
     * Wire shapes to convert into a faces
     * @default undefined
     */
    shapes!: T[];
    /**
     * Should plane be planar
     * @default false
     */
    planar = false;
}
export class FaceFromWiresOnFaceDto<T, U> {
    constructor(wires?: T[], face?: U, inside?: boolean) {
        if (wires !== undefined) { this.wires = wires; }
        if (face !== undefined) { this.face = face; }
        if (inside !== undefined) { this.inside = inside; }
    }
    /**
     * Wire shapes to convert into a faces
     * @default undefined
     */
    wires!: T[];
    /**
     * Guide face to use as a base
     * @default undefined
     */
    face!: U;
    /**
     * Indication if wire is inside the surface or outside
     * @default true
     */
    inside = true;
}
export class SewDto<T> {
    constructor(shapes?: T[], tolerance?: number) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * Faces to construct a shell from
     * @default undefined
     */
    shapes!: T[];
    /**
     * Tolerance of sewing
     * @default 1.0e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1.0e-7;
}

export class FaceIsoCurveAtParamDto<T> {
    constructor(shape?: T, param?: number, dir?: "u" | "v") {
        if (shape !== undefined) { this.shape = shape; }
        if (param !== undefined) { this.param = param; }
        if (dir !== undefined) { this.dir = dir; }
    }
    /**
     * Face shape
     * @default undefined
     */
    shape!: T;
    /**
     * Param at which to find isocurve
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    param: number = 0.5;
    /**
     * Direction to find the isocurve
     * @default u
     */
    dir: "u" | "v" = "u";
}

export class DivideFaceToUVPointsDto<T> {
    constructor(shape?: T, nrOfPointsU?: number, nrOfPointsV?: number, flat?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (nrOfPointsU !== undefined) { this.nrOfPointsU = nrOfPointsU; }
        if (nrOfPointsV !== undefined) { this.nrOfPointsV = nrOfPointsV; }
        if (flat !== undefined) { this.flat = flat; }
    }
    /**
     * Face shape
     * @default undefined
     */
    shape!: T;
    /**
     * Number of points on U direction
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrOfPointsU = 10;
    /**
     * Number of points on V direction
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrOfPointsV = 10;
    /**
     * Flatten the output
     * @default false
     */
    flat = false;
}

export class Geom2dEllipseDto {
    constructor(center?: Base.Point2, direction?: Base.Vector2, radiusMinor?: number, radiusMajor?: number, sense?: boolean) {
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (radiusMinor !== undefined) { this.radiusMinor = radiusMinor; }
        if (radiusMajor !== undefined) { this.radiusMajor = radiusMajor; }
        if (sense !== undefined) { this.sense = sense; }
    }
    /**
     * Center of the ellipse
     * @default [0,0]
     */
    center: Base.Point2 = [0, 0];
    /**
     * Direction of the vector
     * @default [1,0]
     */
    direction: Base.Vector2 = [1, 0];
    /**
     * Minor radius of an ellipse
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radiusMinor = 1;
    /**
     * Major radius of an ellipse
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radiusMajor = 2;
    /**
     * If true will sense the direction
     * @default false
     */
    sense = false;
}
export class Geom2dCircleDto {
    constructor(center?: Base.Point2, direction?: Base.Vector2, radius?: number, sense?: boolean) {
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (radius !== undefined) { this.radius = radius; }
        if (sense !== undefined) { this.sense = sense; }
    }
    /**
     * Center of the circle
     * @default [0,0]
     */
    center: Base.Point2 = [0, 0];
    /**
     * Direction of the vector
     * @default [1,0]
     */
    direction: Base.Vector2 = [1, 0];
    /**
     * Radius of the circle
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * If true will sense the direction
     * @default false
     */
    sense = false;
}
export class ChristmasTreeDto {
    constructor(height?: number, innerDist?: number, outerDist?: number, nrSkirts?: number, trunkHeight?: number, trunkWidth?: number, half?: boolean, rotation?: number, origin?: Base.Point3, direction?: Base.Vector3) {
        if (height !== undefined) { this.height = height; }
        if (innerDist !== undefined) { this.innerDist = innerDist; }
        if (outerDist !== undefined) { this.outerDist = outerDist; }
        if (nrSkirts !== undefined) { this.nrSkirts = nrSkirts; }
        if (trunkHeight !== undefined) { this.trunkHeight = trunkHeight; }
        if (trunkWidth !== undefined) { this.trunkWidth = trunkWidth; }
        if (half !== undefined) { this.half = half; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (origin !== undefined) { this.origin = origin; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * Height of the tree
     * @default 6
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 6;
    /**
     * Inner distance of the branches on the bottom of the tree
     * @default 1.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    innerDist = 1.5;
    /**
     * Outer distance of the branches on the bottom of the tree
     * @default 3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    outerDist = 3;
    /**
     * Number of skirts on the tree (triangle like shapes)
     * @default 5
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrSkirts = 5;
    /**
     * Trunk height
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    trunkHeight = 1;
    /**
     * Trunk width only applies if trunk height is more than 0
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    trunkWidth = 1;
    /**
     * Indicates wether only a half of the tree should be created
     * @default false
     */
    half = false;
    /**
     * Rotation of the tree
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 15
     */
    rotation = 0;
    /**
     * Origin of the tree
     * @default [0, 0, 0]
     */
    origin: Base.Point3 = [0, 0, 0];
    /**
     * Direction of the tree
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
export class StarDto {
    constructor(outerRadius?: number, innerRadius?: number, numRays?: number, center?: Base.Point3, direction?: Base.Vector3, offsetOuterEdges?: number, half?: boolean) {
        if (outerRadius !== undefined) { this.outerRadius = outerRadius; }
        if (innerRadius !== undefined) { this.innerRadius = innerRadius; }
        if (numRays !== undefined) { this.numRays = numRays; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (offsetOuterEdges !== undefined) { this.offsetOuterEdges = offsetOuterEdges; }
        if (half !== undefined) { this.half = half; }
    }
    /**
     * Center of the circle
     * @default [0,0,0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * Direction of the vector
     * @default 7
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    numRays = 7;
    /**
     * Angle of the rays
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    outerRadius: number = 2;
    /**
     * Angle of the rays
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    innerRadius: number = 1;
    /**
     * Offsets outer edge cornerners along the direction vector
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    offsetOuterEdges?: number | undefined;
    /**
     * Construct half of the star
     * @default false
     */
    half = false;
}
export class ParallelogramDto {
    constructor(center?: Base.Point3, direction?: Base.Vector3, aroundCenter?: boolean, width?: number, height?: number, angle?: number) {
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (aroundCenter !== undefined) { this.aroundCenter = aroundCenter; }
        if (width !== undefined) { this.width = width; }
        if (height !== undefined) { this.height = height; }
        if (angle !== undefined) { this.angle = angle; }
    }
    /**
     * Center of the circle
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * Indicates whether to draw the parallelogram around the center point or start from corner.
     * @default true
     */
    aroundCenter = true;
    /**
     * Width of bounding rectangle
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 2;
    /**
     * Height of bounding rectangle
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Sharp angle of the parallelogram
     * @default 15
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    angle = 15;
}
export class Heart2DDto {
    constructor(center?: Base.Point3, direction?: Base.Vector3, rotation?: number, sizeApprox?: number) {
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (sizeApprox !== undefined) { this.sizeApprox = sizeApprox; }
    }
    /**
     * Center of the circle
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * Rotation of the hear
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 15
     */
    rotation = 0;
    /**
     * Size of the bounding box within which the heart gets drawn
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    sizeApprox = 2;
}
export class NGonWireDto {
    constructor(center?: Base.Point3, direction?: Base.Vector3, nrCorners?: number, radius?: number) {
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (nrCorners !== undefined) { this.nrCorners = nrCorners; }
        if (radius !== undefined) { this.radius = radius; }
    }
    /**
     * Center of the circle
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * How many corners to create.
     * @default 6
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    nrCorners = 6;
    /**
     * Radius of nGon
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
}
export class EllipseDto {
    constructor(center?: Base.Point3, direction?: Base.Vector3, radiusMinor?: number, radiusMajor?: number) {
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (radiusMinor !== undefined) { this.radiusMinor = radiusMinor; }
        if (radiusMajor !== undefined) { this.radiusMajor = radiusMajor; }
    }
    /**
     * Center of the ellipse
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction of the vector
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * Minor radius of an ellipse
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radiusMinor = 1;
    /**
     * Major radius of an ellipse
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radiusMajor = 2;
}
export class HelixWireDto {
    constructor(radius?: number, pitch?: number, height?: number, center?: Base.Point3, direction?: Base.Vector3, clockwise?: boolean, tolerance?: number) {
        if (radius !== undefined) { this.radius = radius; }
        if (pitch !== undefined) { this.pitch = pitch; }
        if (height !== undefined) { this.height = height; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (clockwise !== undefined) { this.clockwise = clockwise; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * Radius of the helix
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Height per complete turn (vertical distance per 360°)
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    pitch = 1;
    /**
     * Total height of the helix
     * @default 5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 5;
    /**
     * Center of the helix
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction of the helix axis
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * If true, helix winds clockwise when viewed from above
     * @default false
     */
    clockwise = false;
    /**
     * Approximation tolerance
     * @default 0.0001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0001
     */
    tolerance = 0.0001;
}
export class HelixWireByTurnsDto {
    constructor(radius?: number, pitch?: number, numTurns?: number, center?: Base.Point3, direction?: Base.Vector3, clockwise?: boolean, tolerance?: number) {
        if (radius !== undefined) { this.radius = radius; }
        if (pitch !== undefined) { this.pitch = pitch; }
        if (numTurns !== undefined) { this.numTurns = numTurns; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (clockwise !== undefined) { this.clockwise = clockwise; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * Radius of the helix
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Height per complete turn
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    pitch = 1;
    /**
     * Number of complete turns
     * @default 5
     * @minimum 0
     * @maximum Infinity
     * @step 0.5
     */
    numTurns = 5;
    /**
     * Center of the helix
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction of the helix axis
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * If true, helix winds clockwise when viewed from above
     * @default false
     */
    clockwise = false;
    /**
     * Approximation tolerance
     * @default 0.0001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0001
     */
    tolerance = 0.0001;
}
export class TaperedHelixWireDto {
    constructor(startRadius?: number, endRadius?: number, pitch?: number, height?: number, center?: Base.Point3, direction?: Base.Vector3, clockwise?: boolean, tolerance?: number) {
        if (startRadius !== undefined) { this.startRadius = startRadius; }
        if (endRadius !== undefined) { this.endRadius = endRadius; }
        if (pitch !== undefined) { this.pitch = pitch; }
        if (height !== undefined) { this.height = height; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (clockwise !== undefined) { this.clockwise = clockwise; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * Starting radius of the tapered helix
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    startRadius = 2;
    /**
     * Ending radius of the tapered helix
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    endRadius = 0.5;
    /**
     * Height per complete turn
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    pitch = 1;
    /**
     * Total height of the helix
     * @default 5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 5;
    /**
     * Center of the helix
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction of the helix axis
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * If true, helix winds clockwise when viewed from above
     * @default false
     */
    clockwise = false;
    /**
     * Approximation tolerance
     * @default 0.0001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0001
     */
    tolerance = 0.0001;
}
export class FlatSpiralWireDto {
    constructor(startRadius?: number, endRadius?: number, numTurns?: number, center?: Base.Point3, direction?: Base.Vector3, clockwise?: boolean, tolerance?: number) {
        if (startRadius !== undefined) { this.startRadius = startRadius; }
        if (endRadius !== undefined) { this.endRadius = endRadius; }
        if (numTurns !== undefined) { this.numTurns = numTurns; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (clockwise !== undefined) { this.clockwise = clockwise; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * Starting radius from center
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    startRadius = 0.5;
    /**
     * Ending radius from center
     * @default 5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    endRadius = 5;
    /**
     * Number of complete turns
     * @default 5
     * @minimum 0
     * @maximum Infinity
     * @step 0.5
     */
    numTurns = 5;
    /**
     * Center of the spiral
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Normal direction of the spiral plane
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * If true, spiral winds clockwise when viewed from above
     * @default false
     */
    clockwise = false;
    /**
     * Approximation tolerance
     * @default 0.0001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0001
     */
    tolerance = 0.0001;
}
export class TextWiresDto {
    constructor(text?: string, xOffset?: number, yOffset?: number, height?: number, lineSpacing?: number, letterSpacing?: number, align?: Base.horizontalAlignEnum, extrudeOffset?: number, _origin?: Base.Point3, _rotation?: number, _direction?: Base.Vector3, centerOnOrigin?: boolean) {
        if (text !== undefined) { this.text = text; }
        if (xOffset !== undefined) { this.xOffset = xOffset; }
        if (yOffset !== undefined) { this.yOffset = yOffset; }
        if (height !== undefined) { this.height = height; }
        if (lineSpacing !== undefined) { this.lineSpacing = lineSpacing; }
        if (letterSpacing !== undefined) { this.letterSpacing = letterSpacing; }
        if (align !== undefined) { this.align = align; }
        if (extrudeOffset !== undefined) { this.extrudeOffset = extrudeOffset; }
        if (centerOnOrigin !== undefined) { this.centerOnOrigin = centerOnOrigin; }
    }
    /**
     * The text
     * @default Hello World
     */
    text?: string | undefined = "Hello World";
    /**
     * The x offset
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    xOffset?: number | undefined = 0;
    /**
     * The y offset
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    yOffset?: number | undefined = 0;
    /**
     * The height of the text
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    height?: number | undefined = 1;
    /**
     * The line spacing
     * @default 2
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    lineSpacing?: number | undefined = 2;
    /**
     * The letter spacing offset
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    letterSpacing?: number | undefined = 0;
    /**
     * The extrude offset
     * @default left
     */
    align?: Base.horizontalAlignEnum | undefined;
    /**
     * The extrude offset
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    extrudeOffset?: number | undefined = 0;
    /**
     * Indicates whether to center text on origin
     * @default false
     */
    centerOnOrigin = false;
}
export class GeomCylindricalSurfaceDto {
    constructor(radius?: number, center?: Base.Point3, direction?: Base.Vector3) {
        if (radius !== undefined) { this.radius = radius; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * Radius of the cylindrical surface
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Center of the cylindrical surface
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Axis of direction for cylindrical surface
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
export class Geom2dTrimmedCurveDto<T> {
    constructor(shape?: T, u1?: number, u2?: number, sense?: boolean, adjustPeriodic?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (u1 !== undefined) { this.u1 = u1; }
        if (u2 !== undefined) { this.u2 = u2; }
        if (sense !== undefined) { this.sense = sense; }
        if (adjustPeriodic !== undefined) { this.adjustPeriodic = adjustPeriodic; }
    }
    /**
     * 2D Curve to trim
     * @default undefined
     */
    shape!: T;
    /**
     * First param on the curve for trimming. U1 can be greater or lower than U2. The returned curve is oriented from U1 to U2.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    u1 = 0;
    /**
     * Second parameter on the curve for trimming
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    u2 = 1;
    /**
     *  If the basis curve C is periodic there is an ambiguity because two parts are available. 
     *  In this case by default the trimmed curve has the same orientation as the basis curve (Sense = True). 
     * If Sense = False then the orientation of the trimmed curve is opposite to the orientation of the basis curve C.
     * @default true
     */
    sense = true;
    /**
     * If the curve is closed but not periodic it is not possible to keep the part of the curve including the
     * junction point (except if the junction point is at the beginning or at the end of the trimmed curve)
     * because you could lose the fundamental characteristics of the basis curve which are used for example
     * to compute the derivatives of the trimmed curve. So for a closed curve the rules are the same as for a open curve.
     * @default true
     */
    adjustPeriodic = true;
}
export class Geom2dSegmentDto {
    constructor(start?: Base.Point2, end?: Base.Point2) {
        if (start !== undefined) { this.start = start; }
        if (end !== undefined) { this.end = end; }
    }
    /**
     * Start 2d point for segment
     * @default [0, 0]
     */
    start: Base.Point2 = [0, 0];
    /**
     * End 2d point for segment
     * @default [1, 0]
     */
    end: Base.Point2 = [1, 0];
}
export class SliceDto<T> {
    constructor(shape?: T, step?: number, direction?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (step !== undefined) { this.step = step; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * The shape to slice
     * @default undefined
     */
    shape!: T;
    /**
     * Step at which to divide the shape
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    step = 0.1;
    /**
     * Direction vector
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
export class SliceInStepPatternDto<T> {
    constructor(shape?: T, steps?: number[], direction?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (steps !== undefined) { this.steps = steps; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * The shape to slice
     * @default undefined
     */
    shape!: T;
    /**
     * Steps that should be used for slicing. This array is going to be treated as a pattern - 
     * this menas that if the actual number of steps is lower than the number of steps in the pattern, the pattern will be repeated.
     * @default [0.1, 0.2]
     */
    steps = [0.1, 0.2];
    /**
     * Direction vector
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
