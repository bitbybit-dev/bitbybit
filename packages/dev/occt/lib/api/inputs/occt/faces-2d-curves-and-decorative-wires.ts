// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";

/**
 * Shapes for `shapes.compound.makeCompound`, which packs them into one compound without joining
 * their geometry.
 */
export class CompoundShapesDto<T> {
    constructor(shapes?: T[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
    }
    /**
     * The shapes to pack together; any kinds may be mixed.
     * @default undefined
     */
    shapes!: T[];
}
/**
 * A face or shell and a thickness for `operations.makeThickSolidSimple`, which turns it into a
 * solid slab.
 */
export class ThisckSolidSimpleDto<T> {
    constructor(shape?: T, offset?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (offset !== undefined) { this.offset = offset; }
    }
    /**
     * The face or shell to give a thickness to.
     * @default undefined
     */
    shape!: T;
    /**
     * The thickness in model units, along the surface normal for a positive value and the other way
     * for a negative one.
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    offset = 1;
}
/**
 * A wire, an offset and an extrusion direction for `operations.offset3DWire`, which offsets a wire
 * that does not lie in one plane.
 */
export class Offset3DWireDto<T> {
    constructor(shape?: T, offset?: number, direction?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (offset !== undefined) { this.offset = offset; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * The wire to offset; smooth wires work best, so fillet sharp corners first.
     * @default undefined
     */
    shape!: T;
    /**
     * The offset distance in model units.
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    offset = 1;
    /**
     * The direction the wire is extruded along to build the offset; it must not be parallel to the
     * wire.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
/**
 * A closed wire and a planar flag for `shapes.face.createFaceFromWire`.
 */
export class FaceFromWireDto<T> {
    constructor(shape?: T, planar?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (planar !== undefined) { this.planar = planar; }
    }
    /**
     * The closed wire that becomes the face's boundary.
     * @default undefined
     */
    shape!: T;
    /**
     * When true the wire must lie in a plane and the face is flat; when false a smooth surface is
     * fitted through the wire's edges.
     * @default false
     */
    planar = false;
}
/**
 * A wire, a guiding face and a side for `shapes.face.createFaceFromWireOnFace`, which cuts a face
 * out of the guiding face's surface.
 */
export class FaceFromWireOnFaceDto<T, U> {
    constructor(wire?: T, face?: U, inside?: boolean) {
        if (wire !== undefined) { this.wire = wire; }
        if (face !== undefined) { this.face = face; }
        if (inside !== undefined) { this.inside = inside; }
    }
    /**
     * The wire lying on the guiding face's surface that bounds the new face.
     * @default undefined
     */
    wire!: T;
    /**
     * The face whose surface the new face is cut from.
     * @default undefined
     */
    face!: U;
    /**
     * When true, the wire is turned so the face is the region it encloses; when false the wire's
     * own direction decides.
     * @default true
     */
    inside = true;
}
/**
 * Wires, a guiding face and a side for `shapes.face.createFacesFromWiresOnFace`, which cuts one
 * face per wire out of the guiding face's surface.
 */
export class FacesFromWiresOnFaceDto<T, U> {
    constructor(wires?: T[], face?: U, inside?: boolean) {
        if (wires !== undefined) { this.wires = wires; }
        if (face !== undefined) { this.face = face; }
        if (inside !== undefined) { this.inside = inside; }
    }
    /**
     * The wires lying on the guiding face's surface, one face per wire.
     * @default undefined
     */
    wires!: T[];
    /**
     * The face whose surface the new faces are cut from.
     * @default undefined
     */
    face!: U;
    /**
     * When true, each wire is turned so its face is the region it encloses; when false the wire's
     * own direction decides.
     * @default true
     */
    inside = true;
}
/**
 * Wires and a planar flag for `shapes.face.createFaceFromWires`, which makes one face with the
 * first wire as its boundary and the others as holes.
 */
export class FaceFromWiresDto<T> {
    constructor(shapes?: T[], planar?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (planar !== undefined) { this.planar = planar; }
    }
    /**
     * The wires: the first is the outer boundary, every further one cuts a hole.
     * @default undefined
     */
    shapes!: T[];
    /**
     * When true the wires must lie in one plane and the face is flat.
     * @default false
     */
    planar = false;
}
/**
 * Wires and a planar flag for `shapes.face.createFacesFromWires`, which makes one face per wire.
 */
export class FacesFromWiresDto<T> {
    constructor(shapes?: T[], planar?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (planar !== undefined) { this.planar = planar; }
    }
    /**
     * The closed wires, one face per wire.
     * @default undefined
     */
    shapes!: T[];
    /**
     * When true each wire must lie in a plane and its face is flat; when false a smooth surface is
     * fitted through each.
     * @default false
     */
    planar = false;
}
/**
 * Wires, a guiding face and a side for `shapes.face.createFaceFromWiresOnFace`, which makes one
 * face on the guiding surface with holes.
 */
export class FaceFromWiresOnFaceDto<T, U> {
    constructor(wires?: T[], face?: U, inside?: boolean) {
        if (wires !== undefined) { this.wires = wires; }
        if (face !== undefined) { this.face = face; }
        if (inside !== undefined) { this.inside = inside; }
    }
    /**
     * The wires on the guiding surface: the first is the outer boundary, every further one cuts a
     * hole.
     * @default undefined
     */
    wires!: T[];
    /**
     * The face whose surface the new face is cut from.
     * @default undefined
     */
    face!: U;
    /**
     * Applies to the first wire: when true it is turned so the face is the region it encloses; when
     * false its own direction decides.
     * @default true
     */
    inside = true;
}
/**
 * Faces and a tolerance for `shapes.shell.sewFaces`, which stitches faces that share edges into one
 * shell.
 */
export class SewDto<T> {
    constructor(shapes?: T[], tolerance?: number) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The faces to stitch together; their shared edges must line up within the tolerance.
     * @default undefined
     */
    shapes!: T[];
    /**
     * How far apart two edges may be and still be sewn together, in model units.
     * @default 1.0e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1.0e-7;
}

/**
 * A face, a parameter and a direction for an isocurve; currently unused by the library.
 */
export class FaceIsoCurveAtParamDto<T> {
    constructor(shape?: T, param?: number, dir?: "u" | "v") {
        if (shape !== undefined) { this.shape = shape; }
        if (param !== undefined) { this.param = param; }
        if (dir !== undefined) { this.dir = dir; }
    }
    /**
     * The face to read the curve from.
     * @default undefined
     */
    shape!: T;
    /**
     * Where the curve sits, as a fraction from 0 to 1 of the chosen direction's range.
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    param: number = 0.5;
    /**
     * Which parameter is held fixed, `u` or `v`.
     * @default u
     */
    dir: "u" | "v" = "u";
}

/**
 * A face and a grid size for dividing it into UV points; currently unused by the library.
 */
export class DivideFaceToUVPointsDto<T> {
    constructor(shape?: T, nrOfPointsU?: number, nrOfPointsV?: number, flat?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (nrOfPointsU !== undefined) { this.nrOfPointsU = nrOfPointsU; }
        if (nrOfPointsV !== undefined) { this.nrOfPointsV = nrOfPointsV; }
        if (flat !== undefined) { this.flat = flat; }
    }
    /**
     * The face whose UV range is divided.
     * @default undefined
     */
    shape!: T;
    /**
     * How many points across the U range.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrOfPointsU = 10;
    /**
     * How many points across the V range.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrOfPointsV = 10;
    /**
     * When true, the rows are joined into one flat list of points.
     * @default false
     */
    flat = false;
}

/**
 * A center, a major axis direction and two radii for `geom.curves.geom2dEllipse`, a 2D construction
 * curve.
 */
export class Geom2dEllipseDto {
    constructor(center?: Base.Point2, direction?: Base.Vector2, radiusMinor?: number, radiusMajor?: number, sense?: boolean) {
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (radiusMinor !== undefined) { this.radiusMinor = radiusMinor; }
        if (radiusMajor !== undefined) { this.radiusMajor = radiusMajor; }
        if (sense !== undefined) { this.sense = sense; }
    }
    /**
     * The center of the ellipse as a 2D point.
     * @default [0,0]
     */
    center: Base.Point2 = [0, 0];
    /**
     * The direction of the major axis in the plane.
     * @default [1,0]
     */
    direction: Base.Vector2 = [1, 0];
    /**
     * The half-width across the ellipse's short axis; must not exceed `radiusMajor`.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radiusMinor = 1;
    /**
     * The half-width along the ellipse's long axis.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radiusMajor = 2;
    /**
     * When true, the curve runs the other way round.
     * @default false
     */
    sense = false;
}
/**
 * A center, a start direction and a radius for `geom.curves.geom2dCircle`, a 2D construction curve.
 */
export class Geom2dCircleDto {
    constructor(center?: Base.Point2, direction?: Base.Vector2, radius?: number, sense?: boolean) {
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (radius !== undefined) { this.radius = radius; }
        if (sense !== undefined) { this.sense = sense; }
    }
    /**
     * The center of the circle as a 2D point.
     * @default [0,0]
     */
    center: Base.Point2 = [0, 0];
    /**
     * The direction in the plane where the curve's parameter starts.
     * @default [1,0]
     */
    direction: Base.Vector2 = [1, 0];
    /**
     * The distance from the center to the curve.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * When true, the curve runs the other way round.
     * @default false
     */
    sense = false;
}
/**
 * The proportions of a stylized Christmas tree for `shapes.wire.createChristmasTreeWire` and
 * `shapes.face.createChristmasTreeFace`, which stand it in the XY plane by default.
 */
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
     * The height of the tree without the trunk, in model units.
     * @default 6
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 6;
    /**
     * How far the branches reach from the trunk line at the notches of the lowest skirt, in model
     * units.
     * @default 1.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    innerDist = 1.5;
    /**
     * How far the branches reach from the trunk line at the tips of the lowest skirt, in model
     * units.
     * @default 3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    outerDist = 3;
    /**
     * How many layers of branches, the triangle-like skirts, the tree has.
     * @default 5
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrSkirts = 5;
    /**
     * The height of the trunk below the branches, in model units; 0 leaves the trunk out.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    trunkHeight = 1;
    /**
     * The width of the trunk, in model units; used only when the trunk height is above 0.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    trunkWidth = 1;
    /**
     * When true, only one side of the tree is built, as an open wire.
     * @default false
     */
    half = false;
    /**
     * How far the tree is spun about its trunk-to-tip axis, in degrees.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 15
     */
    rotation = 0;
    /**
     * The point at the base of the trunk.
     * @default [0, 0, 0]
     */
    origin: Base.Point3 = [0, 0, 0];
    /**
     * The direction from the trunk to the tip; the default stands the tree up along Y.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
/**
 * The proportions of a star for `shapes.wire.createStarWire` and `shapes.face.createStarFace`,
 * which lay it flat on the ground unless `direction` says otherwise.
 */
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
     * The point the star is centered on.
     * @default [0,0,0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the plane the star lies in; the default lays it flat on the ground.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * How many points the star has.
     * @default 7
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    numRays = 7;
    /**
     * The distance from the center to the tip of each ray, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    outerRadius: number = 2;
    /**
     * The distance from the center to the notch between two rays, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    innerRadius: number = 1;
    /**
     * Lifts the ray tips out of the plane along the normal, in model units, making a 3D star; keep
     * it 0 for a face.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    offsetOuterEdges?: number | undefined;
    /**
     * When true, only the first half of the rays are built, as an open wire.
     * @default false
     */
    half = false;
}
/**
 * The size, lean and placement of a parallelogram for `shapes.wire.createParallelogramWire` and
 * `shapes.face.createParallelogramFace`.
 */
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
     * The point the shape is centered on, or starts from when `aroundCenter` is false.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the plane the shape lies in; the default lays it flat on the ground.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * When true the shape is centered on `center`; when false it starts there and extends in the
     * positive directions.
     * @default true
     */
    aroundCenter = true;
    /**
     * The width of the shape's bounding rectangle, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 2;
    /**
     * The height of the shape's bounding rectangle, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * How far the sides lean over from a rectangle, in degrees; 0 gives a rectangle.
     * @default 15
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    angle = 15;
}
/**
 * The size and placement of a heart outline for `shapes.wire.createHeartWire` and
 * `shapes.face.createHeartFace`.
 */
export class Heart2DDto {
    constructor(center?: Base.Point3, direction?: Base.Vector3, rotation?: number, sizeApprox?: number) {
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (sizeApprox !== undefined) { this.sizeApprox = sizeApprox; }
    }
    /**
     * The point the heart is centered on.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the plane the heart lies in; the default lays it flat on the ground.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * How far the heart is turned in its plane, in degrees.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 15
     */
    rotation = 0;
    /**
     * The side of the square the heart roughly fits into, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    sizeApprox = 2;
}
/**
 * A corner count, a radius and a placement for `shapes.wire.createNGonWire` and
 * `shapes.face.createNGonFace`, a regular polygon.
 */
export class NGonWireDto {
    constructor(center?: Base.Point3, direction?: Base.Vector3, nrCorners?: number, radius?: number) {
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (nrCorners !== undefined) { this.nrCorners = nrCorners; }
        if (radius !== undefined) { this.radius = radius; }
    }
    /**
     * The point the polygon is centered on.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the plane the polygon lies in; the default lays it flat on the ground.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * How many corners, and so how many equal sides, the polygon has.
     * @default 6
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    nrCorners = 6;
    /**
     * The distance from the center to each corner, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
}
/**
 * A center, a plane normal and two radii for the ellipse edge, wire and face methods of `shapes`
 * and `geom.curves.geomEllipseCurve`.
 */
export class EllipseDto {
    constructor(center?: Base.Point3, direction?: Base.Vector3, radiusMinor?: number, radiusMajor?: number) {
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (radiusMinor !== undefined) { this.radiusMinor = radiusMinor; }
        if (radiusMajor !== undefined) { this.radiusMajor = radiusMajor; }
    }
    /**
     * The point the ellipse is centered on.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the plane the ellipse lies in; the default lays it flat on the ground.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * The half-width across the ellipse's short axis, in model units; must not exceed
     * `radiusMajor`.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radiusMinor = 1;
    /**
     * The half-width along the ellipse's long axis, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radiusMajor = 2;
}
/**
 * The size of a coil for `shapes.wire.createHelixWire`: its radius, how much it climbs per turn and
 * its total height.
 */
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
     * The distance from the axis to the coil, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * How far the coil climbs along the axis in one full turn, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    pitch = 1;
    /**
     * The total climb of the coil along the axis, in model units.
     * @default 5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 5;
    /**
     * The point on the axis where the coil starts climbing from.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The direction of the axis the coil climbs along.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * When true, the coil winds clockwise seen from the tip of the axis.
     * @default false
     */
    clockwise = false;
    /**
     * How far the fitted curve may stray from the exact helix, in model units.
     * @default 0.0001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0001
     */
    tolerance = 0.0001;
}
/**
 * The size of a coil for `shapes.wire.createHelixWireByTurns`: its radius, how much it climbs per
 * turn and how many turns it makes.
 */
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
     * The distance from the axis to the coil, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * How far the coil climbs along the axis in one full turn, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    pitch = 1;
    /**
     * How many full turns the coil makes; fractions are allowed.
     * @default 5
     * @minimum 0
     * @maximum Infinity
     * @step 0.5
     */
    numTurns = 5;
    /**
     * The point on the axis where the coil starts climbing from.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The direction of the axis the coil climbs along.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * When true, the coil winds clockwise seen from the tip of the axis.
     * @default false
     */
    clockwise = false;
    /**
     * How far the fitted curve may stray from the exact helix, in model units.
     * @default 0.0001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0001
     */
    tolerance = 0.0001;
}
/**
 * The size of a conical coil for `shapes.wire.createTaperedHelixWire`: the radius at each end, the
 * climb per turn and the total height.
 */
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
     * The distance from the axis to the coil at its base, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    startRadius = 2;
    /**
     * The distance from the axis to the coil at its top, in model units.
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    endRadius = 0.5;
    /**
     * How far the coil climbs along the axis in one full turn, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    pitch = 1;
    /**
     * The total climb of the coil along the axis, in model units.
     * @default 5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 5;
    /**
     * The point on the axis where the coil starts climbing from.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The direction of the axis the coil climbs along.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * When true, the coil winds clockwise seen from the tip of the axis.
     * @default false
     */
    clockwise = false;
    /**
     * How far the fitted curve may stray from the exact helix, in model units.
     * @default 0.0001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0001
     */
    tolerance = 0.0001;
}
/**
 * The size of a flat spiral for `shapes.wire.createFlatSpiralWire`: the radius at each end and the
 * number of turns between them.
 */
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
     * The distance from the center where the spiral starts, in model units.
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    startRadius = 0.5;
    /**
     * The distance from the center where the spiral ends, in model units.
     * @default 5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    endRadius = 5;
    /**
     * How many full turns the spiral makes between the two radii; fractions are allowed.
     * @default 5
     * @minimum 0
     * @maximum Infinity
     * @step 0.5
     */
    numTurns = 5;
    /**
     * The point the spiral winds around.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the plane the spiral lies in; the default lays it flat on the ground.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * When true, the spiral winds clockwise seen from the tip of the normal.
     * @default false
     */
    clockwise = false;
    /**
     * How far the fitted curve may stray from the exact spiral, in model units.
     * @default 0.0001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0001
     */
    tolerance = 0.0001;
}
/**
 * Text and its layout for `shapes.wire.textWires` and `textWiresWithData`, which write it as stroke
 * wires on the ground plane in the single-line Hershey font.
 */
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
     * The text to write; a line break starts a new line.
     * @default Hello World
     */
    text?: string | undefined = "Hello World";
    /**
     * How far the whole block is shifted along X, in model units.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    xOffset?: number | undefined = 0;
    /**
     * How far the whole block is shifted along the second axis of the text plane, in model units.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    yOffset?: number | undefined = 0;
    /**
     * The height of a capital letter, in model units.
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    height?: number | undefined = 1;
    /**
     * The distance between lines as a multiple of the height.
     * @default 2
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    lineSpacing?: number | undefined = 2;
    /**
     * Extra space between characters as a multiple of the height; 0 uses the font's own spacing.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    letterSpacing?: number | undefined = 0;
    /**
     * How lines of different length line up: at their left edge, their center or their right edge.
     * @default left
     */
    align?: Base.horizontalAlignEnum | undefined;
    /**
     * A margin in model units taken off the height and split above and below each character, so
     * extruded text keeps its full size.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    extrudeOffset?: number | undefined = 0;
    /**
     * When true, the middle of the whole text block is moved to the origin.
     * @default false
     */
    centerOnOrigin = false;
}
/**
 * A radius and an axis for `geom.surfaces.cylindricalSurface`, an infinite construction surface.
 */
export class GeomCylindricalSurfaceDto {
    constructor(radius?: number, center?: Base.Point3, direction?: Base.Vector3) {
        if (radius !== undefined) { this.radius = radius; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * The distance from the axis to the surface, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * A point on the axis of the cylinder.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The direction of the axis of the cylinder.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
/**
 * A 2D curve and two parameters for `geom.curves.geom2dTrimmedCurve`, which keeps the piece between
 * them.
 */
export class Geom2dTrimmedCurveDto<T> {
    constructor(shape?: T, u1?: number, u2?: number, sense?: boolean, adjustPeriodic?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (u1 !== undefined) { this.u1 = u1; }
        if (u2 !== undefined) { this.u2 = u2; }
        if (sense !== undefined) { this.sense = sense; }
        if (adjustPeriodic !== undefined) { this.adjustPeriodic = adjustPeriodic; }
    }
    /**
     * The 2D curve to cut a piece out of.
     * @default undefined
     */
    shape!: T;
    /**
     * The parameter where the piece starts; the piece runs from `u1` to `u2`, whichever is larger.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    u1 = 0;
    /**
     * The parameter where the piece ends.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    u2 = 1;
    /**
     * On a closed curve, which of the two possible pieces is kept: true keeps the one running the
     * curve's own way.
     * @default true
     */
    sense = true;
    /**
     * When true, the parameters of a periodic curve are brought into its period first.
     * @default true
     */
    adjustPeriodic = true;
}
/**
 * Two 2D points for `geom.curves.geom2dSegment`, a straight construction curve between them.
 */
export class Geom2dSegmentDto {
    constructor(start?: Base.Point2, end?: Base.Point2) {
        if (start !== undefined) { this.start = start; }
        if (end !== undefined) { this.end = end; }
    }
    /**
     * The 2D point the segment starts at.
     * @default [0, 0]
     */
    start: Base.Point2 = [0, 0];
    /**
     * The 2D point the segment ends at.
     * @default [1, 0]
     */
    end: Base.Point2 = [1, 0];
}
/**
 * A solid, a spacing and a direction for `operations.slice`, which cuts it into parallel slices.
 */
export class SliceDto<T> {
    constructor(shape?: T, step?: number, direction?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (step !== undefined) { this.step = step; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * The solid, or shape holding solids, to slice.
     * @default undefined
     */
    shape!: T;
    /**
     * The distance between slices, in model units; must be above 0.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    step = 0.1;
    /**
     * The direction the slices are stacked along; each cutting plane is perpendicular to it.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
/**
 * A solid, a pattern of spacings and a direction for `operations.sliceInStepPattern`, which cuts it
 * into parallel slices with repeating gaps.
 */
export class SliceInStepPatternDto<T> {
    constructor(shape?: T, steps?: number[], direction?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (steps !== undefined) { this.steps = steps; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * The solid, or shape holding solids, to slice.
     * @default undefined
     */
    shape!: T;
    /**
     * The gaps between slices in model units, applied in turn from the bottom and repeated until
     * the top is reached.
     * @default [0.1, 0.2]
     */
    steps = [0.1, 0.2];
    /**
     * The direction the slices are stacked along; each cutting plane is perpendicular to it.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
