// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { approxParametrizationTypeEnum, geomFillTrihedronEnum, joinTypeEnum } from "./enums";

/**
 * Section wires and a solid flag for `operations.loft`, which stretches a surface through the
 * sections in list order.
 */
export class LoftDto<T> {
    constructor(shapes?: T[], makeSolid?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (makeSolid !== undefined) { this.makeSolid = makeSolid; }
    }
    /**
     * The section wires, or edges, in the order the surface passes through them.
     * @default undefined
     */
    shapes!: T[];
    /**
     * When true, the loft is capped into a solid; the sections must be closed for that.
     * @default false
     */
    makeSolid = false;
}
/**
 * Section wires and fitting options for `operations.loftAdvanced`: ruled or smooth patches, a
 * closed or periodic loop, end points and the approximation settings.
 */
export class LoftAdvancedDto<T> {
    constructor(shapes?: T[], makeSolid?: boolean, closed?: boolean, periodic?: boolean, straight?: boolean, nrPeriodicSections?: number, useSmoothing?: boolean, maxUDegree?: number, tolerance?: number, parType?: approxParametrizationTypeEnum, startVertex?: Base.Point3, endVertex?: Base.Point3) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (makeSolid !== undefined) { this.makeSolid = makeSolid; }
        if (closed !== undefined) { this.closed = closed; }
        if (periodic !== undefined) { this.periodic = periodic; }
        if (straight !== undefined) { this.straight = straight; }
        if (nrPeriodicSections !== undefined) { this.nrPeriodicSections = nrPeriodicSections; }
        if (useSmoothing !== undefined) { this.useSmoothing = useSmoothing; }
        if (maxUDegree !== undefined) { this.maxUDegree = maxUDegree; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (parType !== undefined) { this.parType = parType; }
        if (startVertex !== undefined) { this.startVertex = startVertex; }
        if (endVertex !== undefined) { this.endVertex = endVertex; }
    }
    /**
     * The section wires, or edges, in the order the surface passes through them.
     * @default undefined
     */
    shapes!: T[];
    /**
     * When true, the loft is capped into a solid; the sections must be closed for that.
     * @default false
     */
    makeSolid = false;
    /**
     * When true, the surface loops from the last section back to the first.
     * @default false
     */
    closed = false;
    /**
     * When true, the closed loop is made smooth across the seam by resampling the sections; needs
     * `closed`.
     * @default false
     */
    periodic = false;
    /**
     * When true, the patches between sections are ruled surfaces with straight lines instead of a
     * smooth blend.
     * @default false
     */
    straight = false;
    /**
     * How many points each section is resampled into for a periodic loft.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrPeriodicSections = 10;
    /**
     * When true, the kernel smooths the fitted surface.
     * @default false
     */
    useSmoothing = false;
    /**
     * The highest polynomial degree the surface may use across the sections.
     * @default 3
     */
    maxUDegree = 3;
    /**
     * How far the fitted surface may stray from the sections, in model units.
     * @default 1.0e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.000001
     */
    tolerance = 1.0e-7;
    /**
     * How the sections are parametrized before fitting: by chord length, centripetal, or
     * isoparametric; centripetal handles uneven sections best.
     * @default approxCentripetal
     */
    parType: approxParametrizationTypeEnum = approxParametrizationTypeEnum.approxCentripetal;
    /**
     * A point the loft closes to before the first section, making a pointed end; leave it out for
     * an open end.
     * @default undefined
     * @optional true
     */
    startVertex?: Base.Point3 | undefined;
    /**
     * A point the loft closes to after the last section, making a pointed end; leave it out for an
     * open end.
     * @default undefined
     * @optional true
     */
    endVertex?: Base.Point3 | undefined;
}
/**
 * A shape and a distance for `operations.offset`, which moves the shape's boundary outward or
 * inward with rounded corners.
 */
export class OffsetDto<T, U> {
    constructor(shape?: T, face?: U, distance?: number, tolerance?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (face !== undefined) { this.face = face; }
        if (distance !== undefined) { this.distance = distance; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The shape to offset: a wire, edge, face, shell or solid.
     * @default undefined
     */
    shape!: T;
    /**
     * For a wire or edge, a face whose surface the offset is drawn on; leave it out to offset in
     * the wire's own plane.
     * @default undefined
     * @optional true
     */
    face?: U | undefined;
    /**
     * How far the boundary moves, in model units; negative moves it inward, 0 returns the shape as
     * it is.
     * @default 0.2
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    distance = 0.2;
    /**
     * How close two points must be to count as the same when the offset is built, in model units.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    tolerance = 0.1;
}
/**
 * A shape, a distance and corner options for `operations.offsetAdv`, which moves the shape's
 * boundary outward or inward.
 */
export class OffsetAdvancedDto<T, U> {
    constructor(shape?: T, face?: U, distance?: number, tolerance?: number, joinType?: joinTypeEnum, removeIntEdges?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (face !== undefined) { this.face = face; }
        if (distance !== undefined) { this.distance = distance; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (joinType !== undefined) { this.joinType = joinType; }
        if (removeIntEdges !== undefined) { this.removeIntEdges = removeIntEdges; }
    }
    /**
     * The shape to offset: a wire, edge, face, shell or solid.
     * @default undefined
     */
    shape!: T;
    /**
     * For a wire or edge, a face whose surface the offset is drawn on; leave it out to offset in
     * the wire's own plane.
     * @default undefined
     * @optional true
     */
    face?: U | undefined;
    /**
     * How far the boundary moves, in model units; negative moves it inward, 0 returns the shape as
     * it is.
     * @default 0.2
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    distance = 0.2;
    /**
     * How close two points must be to count as the same when the offset is built, in model units.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    tolerance = 0.1;
    /**
     * How the offset pieces meet at corners: `arc` rounds them, `intersection` extends them to a
     * sharp corner, `tangent` keeps them tangent.
     * @default arc
     */
    joinType = joinTypeEnum.arc;
    /**
     * When true, the internal edges the offset can leave behind are removed from the result.
     * @default false
     */
    removeIntEdges = false;
}
/**
 * A profile, an angle and an axis for `operations.revolve`, which spins the profile about the axis
 * through the origin.
 */
export class RevolveDto<T> {
    constructor(shape?: T, angle?: number, direction?: Base.Vector3, copy?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (angle !== undefined) { this.angle = angle; }
        if (direction !== undefined) { this.direction = direction; }
        if (copy !== undefined) { this.copy = copy; }
    }
    /**
     * The profile to spin: a wire gives a shell, a face a solid; it must not cross the axis.
     * @default undefined
     */
    shape!: T;
    /**
     * How far to spin, in degrees; 360 or more gives a full turn.
     * @default 360
     * @minimum 0
     * @maximum 360
     * @step 1
     */
    angle = 360;
    /**
     * The direction of the axis, which passes through the origin.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * When true, the profile's geometry is copied instead of shared with the result.
     * @default false
     */
    copy = false;
}
/**
 * A path wire and profile shapes for `operations.pipe`, and generally one shape with a list of
 * others, as in `shapes.wire.addEdgesAndWiresToWire`.
 */
export class ShapeShapesDto<T, U> {
    constructor(shape?: T, shapes?: U[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (shapes !== undefined) { this.shapes = shapes; }
    }
    /**
     * The main shape: the path wire for a pipe, the wire to extend when adding edges.
     * @default undefined
     */
    shape!: T;
    /**
     * The other shapes: the profiles placed on the path, or the edges and wires to add.
     * @default undefined
     */
    shapes!: U[];
}
/**
 * Flat wires and a face for `shapes.wire.placeWiresOnFace`, which maps the wires onto the face's
 * surface.
 */
export class WiresOnFaceDto<T, U> {
    constructor(wires?: T[], face?: U) {
        if (wires !== undefined) { this.wires = wires; }
        if (face !== undefined) { this.face = face; }
    }
    /**
     * The wires drawn on the ground plane; their Z coordinate becomes U and their X coordinate V.
     * @default undefined
     */
    wires!: T[];
    /**
     * The face whose surface the wires are mapped onto.
     * @default undefined
     */
    face!: U;
}
/**
 * Path wires, a radius and sweep options for `operations.pipeWiresCylindrical`, which makes a round
 * tube along each wire.
 */
export class PipeWiresCylindricalDto<T> {
    constructor(shapes?: T[], radius?: number, makeSolid?: boolean, trihedronEnum?: geomFillTrihedronEnum, forceApproxC1?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (radius !== undefined) { this.radius = radius; }
        if (makeSolid !== undefined) { this.makeSolid = makeSolid; }
        if (trihedronEnum !== undefined) { this.trihedronEnum = trihedronEnum; }
        if (forceApproxC1 !== undefined) { this.forceApproxC1 = forceApproxC1; }
    }
    /**
     * The path wires, one tube per wire.
     * @default undefined
     */
    shapes!: T[];
    /**
     * The radius of the tubes, in model units.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    radius = 0.1;
    /**
     * When true, the tubes are solids; when false they are open shells.
     * @default true
     */
    makeSolid = true;
    /**
     * How the profile turns as it follows the path; `isConstantNormal` keeps it steady, the Frenet
     * modes follow the curve's bending.
     * @default isConstantNormal
     */
    trihedronEnum = geomFillTrihedronEnum.isConstantNormal;
    /**
     * When true, a swept surface that came out with kinks is refitted to be smooth.
     * @default false
     */
    forceApproxC1 = false;
}
/**
 * A path wire, a radius and sweep options for `operations.pipeWireCylindrical`, which makes a round
 * tube along the wire.
 */
export class PipeWireCylindricalDto<T> {
    constructor(shape?: T, radius?: number, makeSolid?: boolean, trihedronEnum?: geomFillTrihedronEnum, forceApproxC1?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (radius !== undefined) { this.radius = radius; }
        if (makeSolid !== undefined) { this.makeSolid = makeSolid; }
        if (trihedronEnum !== undefined) { this.trihedronEnum = trihedronEnum; }
        if (forceApproxC1 !== undefined) { this.forceApproxC1 = forceApproxC1; }
    }
    /**
     * The path wire the tube follows.
     * @default undefined
     */
    shape!: T;
    /**
     * The radius of the tube, in model units.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    radius = 0.1;
    /**
     * When true, the tube is a solid; when false it is an open shell.
     * @default true
     */
    makeSolid = true;
    /**
     * How the profile turns as it follows the path; `isConstantNormal` keeps it steady, the Frenet
     * modes follow the curve's bending.
     * @default isConstantNormal
     */
    trihedronEnum = geomFillTrihedronEnum.isConstantNormal;
    /**
     * When true, a swept surface that came out with kinks is refitted to be smooth.
     * @default false
     */
    forceApproxC1 = false;
}
/**
 * A path wire, a polygon size and sweep options for `operations.pipePolylineWireNGon`, which makes
 * a tube with flat sides along the wire.
 */
export class PipePolygonWireNGonDto<T> {
    constructor(shapes?: T, radius?: number, nrCorners?: number, makeSolid?: boolean, trihedronEnum?: geomFillTrihedronEnum, forceApproxC1?: boolean) {
        if (shapes !== undefined) { this.shape = shapes; }
        if (radius !== undefined) { this.radius = radius; }
        if (nrCorners !== undefined) { this.nrCorners = nrCorners; }
        if (makeSolid !== undefined) { this.makeSolid = makeSolid; }
        if (trihedronEnum !== undefined) { this.trihedronEnum = trihedronEnum; }
        if (forceApproxC1 !== undefined) { this.forceApproxC1 = forceApproxC1; }
    }
    /**
     * The path wire the tube follows.
     * @default undefined
     */
    shape!: T;
    /**
     * The distance from the path to each corner of the polygon, in model units.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    radius = 0.1;
    /**
     * How many corners, and so flat sides, the tube has.
     * @default 6
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    nrCorners = 6;
    /**
     * When true, the tube is a solid; when false it is an open shell.
     * @default true
     */
    makeSolid = true;
    /**
     * How the profile turns as it follows the path; `isConstantNormal` keeps it steady, the Frenet
     * modes follow the curve's bending.
     * @default isConstantNormal
     */
    trihedronEnum = geomFillTrihedronEnum.isConstantNormal;
    /**
     * When true, a swept surface that came out with kinks is refitted to be smooth.
     * @default false
     */
    forceApproxC1 = false;
}
/**
 * A shape and a vector for `operations.extrude`, which sweeps the shape in a straight line.
 */
export class ExtrudeDto<T> {
    constructor(shape?: T, direction?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * The shape to sweep: a face gives a solid, a wire a shell, an edge a face.
     * @default undefined
     */
    shape!: T;
    /**
     * The direction and distance of the sweep as one vector, in model units.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}

/**
 * Shapes and a vector for `operations.extrudeShapes`, which sweeps every shape in the same straight
 * line.
 */
export class ExtrudeShapesDto<T> {
    constructor(shapes?: T[], direction?: Base.Vector3) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * The shapes to sweep, one result per shape.
     * @default undefined
     */
    shapes!: T[];
    /**
     * The direction and distance of the sweep as one vector, in model units.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}

/**
 * A shape and the shapes to cut it with for `operations.splitShapeWithShapes`.
 */
export class SplitDto<T> {
    constructor(shape?: T, shapes?: T[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (shapes !== undefined) { this.shapes = shapes; }
    }
    /**
     * The shape to cut into pieces.
     * @default undefined
     */
    shape!: T;
    /**
     * The shapes that do the cutting, such as faces or solids passing through the shape.
     * @default undefined
     */
    shapes!: T[];
    /**
     * How far apart geometry may be and still count as touching, in model units; helps when faces
     * nearly coincide.
     * @default 1.0e-4
     * @minimum 0
     * @maximum Infinity
     * @step 0.000001
     */
    localFuzzyTolerance = 1.0e-4;
    /**
     * When true, the inputs stay untouched and the result holds the pieces of every shape involved;
     * when false only the pieces of `shape` come back.
     * @default true
     */
    nonDestructive = true;
}
/**
 * Shapes and an edge flag for `booleans.union`, which fuses them into one.
 */
export class UnionDto<T> {
    constructor(shapes?: T[], keepEdges?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (keepEdges !== undefined) { this.keepEdges = keepEdges; }
    }
    /**
     * The shapes to fuse, joined one after another in this order.
     * @default undefined
     */
    shapes!: T[];
    /**
     * When false, faces that end up on one surface are merged and their seams removed; when true
     * every edge of the inputs stays.
     * @default false
     */
    keepEdges = false;
}
/**
 * A main shape and the shapes to cut away from it for `booleans.difference`.
 */
export class DifferenceDto<T> {
    constructor(shape?: T, shapes?: T[], keepEdges?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (shapes !== undefined) { this.shapes = shapes; }
        if (keepEdges !== undefined) { this.keepEdges = keepEdges; }
    }
    /**
     * The shape material is removed from.
     * @default undefined
     */
    shape!: T;
    /**
     * The shapes whose volume is cut away, one after another.
     * @default undefined
     */
    shapes!: T[];
    /**
     * When false, faces left on one surface are merged and their seams removed; when true every
     * edge stays.
     * @default false
     */
    keepEdges = false;
}

/**
 * Shapes and an edge flag for `booleans.intersection`, which keeps what the first shape shares with
 * each of the others.
 */
export class IntersectionDto<T> {
    constructor(shapes?: T[], keepEdges?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (keepEdges !== undefined) { this.keepEdges = keepEdges; }
    }
    /**
     * The shapes; the first is intersected with every other one in turn.
     * @default undefined
     */
    shapes!: T[];
    /**
     * When false, faces on one surface are merged and their seams removed; when true every edge
     * stays.
     * @default false
     */
    keepEdges = false;
}
/**
 * One shape for the many methods that take nothing else, such as `shapes.shape.isValid`,
 * `shapes.face.getFaceArea` or `operations.boundingBoxOfShape`.
 */
export class ShapeDto<T> {
    constructor(shape?: T) {
        if (shape !== undefined) { this.shape = shape; }
    }
    /**
     * The shape to work on; it is not changed.
     * @default undefined
     */
    shape!: T;
}
/**
 * Two shapes and their meshing precisions for `booleans.meshMeshIntersectionWires` and
 * `meshMeshIntersectionPoints`.
 */
export class MeshMeshIntersectionTwoShapesDto<T> {
    constructor(shape1?: T, shape2?: T, precision1?: number, precision2?: number) {
        if (shape1 !== undefined) { this.shape1 = shape1; }
        if (shape2 !== undefined) { this.shape2 = shape2; }
        if (precision1 !== undefined) { this.precision1 = precision1; }
        if (precision2 !== undefined) { this.precision2 = precision2; }
    }
    /**
     * The first shape to intersect.
     * @default undefined
     */
    shape1!: T;
    /**
     * The meshing tolerance of the first shape in model units; smaller follows curves more closely
     * and costs more triangles.
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    precision1?: number | undefined = 0.01;
    /**
     * The second shape to intersect.
     * @default undefined
     */
    shape2!: T;
    /**
     * The meshing tolerance of the second shape in model units; smaller follows curves more closely
     * and costs more triangles.
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    precision2?: number | undefined = 0.01;
}
/**
 * A main shape, other shapes and their meshing precisions for
 * `booleans.meshMeshIntersectionOfShapesWires` and `meshMeshIntersectionOfShapesPoints`.
 */
export class MeshMeshesIntersectionOfShapesDto<T> {
    constructor(shape?: T, shapes?: T[], precision?: number, precisionShapes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (shapes !== undefined) { this.shapes = shapes; }
        if (precision !== undefined) { this.precision = precision; }
        if (precisionShapes !== undefined) { this.precisionShapes = precisionShapes; }
    }
    /**
     * The main shape every other shape is intersected with.
     * @default undefined
     */
    shape!: T;
    /**
     * The meshing tolerance of the main shape in model units; smaller follows curves more closely
     * and costs more triangles.
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    precision?: number | undefined = 0.01;
    /**
     * The other shapes, each intersected with the main one.
     * @default undefined
     */
    shapes!: T[];
    /**
     * One meshing tolerance per other shape; leave it out to mesh them all at `precision`.
     * @default undefined
     * @optional true
     */
    precisionShapes?: number[] | undefined;
}
/**
 * Two shapes for `shapes.shape.isEqual`, `isNotEqual`, `isSame` and `isPartner`.
 */
export class CompareShapesDto<T> {
    constructor(shape?: T, otherShape?: T) {
        if (shape !== undefined) { this.shape = shape; }
        if (otherShape !== undefined) { this.otherShape = otherShape; }
    }
    /**
     * The first shape of the comparison.
     * @default undefined
     */
    shape!: T;
    /**
     * The second shape of the comparison.
     * @default undefined
     */
    otherShape!: T;
}
/**
 * A wire and a length for `shapeFix.fixSmallEdgeOnWire`, which removes edges shorter than that.
 */
export class FixSmallEdgesInWireDto<T> {
    constructor(shape?: T, lockvtx?: boolean, precsmall?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (lockvtx !== undefined) { this.lockvtx = lockvtx; }
        if (precsmall !== undefined) { this.precsmall = precsmall; }
    }
    /**
     * The wire to clean up.
     * @default undefined
     */
    shape!: T;
    /**
     * When true, the existing vertices are kept in place; when false they may move to close the
     * gaps.
     * @default false
     */
    lockvtx = false;
    /**
     * Edges shorter than this, in model units, are removed; 0 uses the wire's own tolerance.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.0000000001
     */
    precsmall = 0.0;
}
/**
 * A shape and tolerance bounds for `shapeFix.basicShapeRepair`, the kernel's general repair.
 */
export class BasicShapeRepairDto<T> {
    constructor(shape?: T, precision?: number, maxTolerance?: number, minTolerance?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (precision !== undefined) { this.precision = precision; }
        if (maxTolerance !== undefined) { this.maxTolerance = maxTolerance; }
        if (minTolerance !== undefined) { this.minTolerance = minTolerance; }
    }
    /**
     * The shape to repair; it stays as it is and a repaired copy comes back.
     * @default undefined
     */
    shape!: T;
    /**
     * The size of defect the repair looks for, in model units.
     * @default 0.001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0000000001
     */
    precision = 0.001;
    /**
     * The largest tolerance the repair may give a part of the shape while closing gaps, in model
     * units; a gap needing more stays open.
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.0000000001
     */
    maxTolerance = 0.01;
    /**
     * The smallest tolerance the repair may use, in model units; edges shorter than this are
     * removed.
     * @default 0.0001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0000000001
     */
    minTolerance = 0.0001;
}
/**
 * A shape and a precision for closing wires; currently unused by the library.
 */
export class FixClosedDto<T> {
    constructor(shape?: T, precision?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (precision !== undefined) { this.precision = precision; }
    }
    /**
     * The shape to close.
     * @default undefined
     */
    shape!: T;
    /**
     * The precision for the closing, in model units.
     * @default -0.1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.0000000001
     */
    precision = -0.1;
}
/**
 * Shapes and a tolerance; currently unused by the library.
 */
export class ShapesWithToleranceDto<T> {
    constructor(shapes?: T[], tolerance?: number) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The shapes to work on.
     * @default undefined
     */
    shapes!: T[];
    /**
     * The tolerance for the operation, in model units.
     * @default 1.0e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.000001
     */
    tolerance = 1.0e-7;
}
/**
 * A shape and a tolerance for `shapes.face.faceFromSurface`, `shapes.shell.sewFaces` and the other
 * methods that build within a tolerance.
 */
export class ShapeWithToleranceDto<T> {
    constructor(shape?: T, tolerance?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The shape or surface to work on.
     * @default undefined
     */
    shape!: T;
    /**
     * How close geometry must be to count as touching, in model units.
     * @default 1.0e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.000001
     */
    tolerance = 1.0e-7;
}

/**
 * A shape and a position for `shapes.face.getFace`, `shapes.wire.getWire`, `shapes.solid.getSolid`
 * and the like.
 */
export class ShapeIndexDto<T> {
    constructor(shape?: T, index?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (index !== undefined) { this.index = index; }
    }
    /**
     * The shape to pick from.
     * @default undefined
     */
    shape!: T;
    /**
     * The position of the wanted part, counting from 0 in the order the kernel walks the shape;
     * beyond the last one throws.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    index = 0;
}
/**
 * A shape and a position for `shapes.edge.getEdge`.
 */
export class EdgeIndexDto<T> {
    constructor(shape?: T, index?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (index !== undefined) { this.index = index; }
    }
    /**
     * The shape to pick the edge from.
     * @default undefined
     */
    shape!: T;
    /**
     * The position of the wanted edge, counting from 0 in the order the kernel walks the shape;
     * beyond the last one throws.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    index = 0;
}
/**
 * A flat profile, a height and a twist for `operations.rotatedExtrude`, which extrudes the profile
 * up along Y while turning it.
 */
export class RotationExtrudeDto<T> {
    constructor(shape?: T, height?: number, angle?: number, makeSolid?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (height !== undefined) { this.height = height; }
        if (angle !== undefined) { this.angle = angle; }
        if (makeSolid !== undefined) { this.makeSolid = makeSolid; }
    }
    /**
     * The flat profile to extrude, a wire or a face lying on the ground.
     * @default undefined
     */
    shape!: T;
    /**
     * How far the profile is extruded along Y, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * How far the profile turns about the Y axis over the height, in degrees.
     * @default 360
     * @minimum 0
     * @maximum 360
     * @step 1
     */
    angle = 360;
    /**
     * When true, a face profile gives a closed solid; when false the result is a shell.
     * @default true
     */
    makeSolid = true;
}

