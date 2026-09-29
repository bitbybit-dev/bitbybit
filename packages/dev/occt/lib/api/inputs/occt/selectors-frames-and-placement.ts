// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { curveFrameEnum, curveTypeEnum, surfaceTypeEnum } from "./enums";

/**
 * A shape, a surface type and the faces to choose among for `select.faces.ofType`.
 */
export class SelectFacesOfTypeDto<T> {
    constructor(shape?: T, type?: surfaceTypeEnum, indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (type !== undefined) { this.type = type; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The shape whose faces are chosen from.
     * @default undefined
     */
    shape!: T;
    /**
     * The kind of surface the chosen faces lie on.
     * @default plane
     */
    type?: surfaceTypeEnum | undefined = surfaceTypeEnum.plane;
    /**
     * The faces to choose among, counted from 0 as `shapes.face.getFaces` lists them; left out, all
     * are candidates, and an empty list chooses none.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
/**
 * A shape, a curve type and the edges to choose among for `select.edges.ofType`.
 */
export class SelectEdgesOfTypeDto<T> {
    constructor(shape?: T, type?: curveTypeEnum, indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (type !== undefined) { this.type = type; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The shape whose edges are chosen from.
     * @default undefined
     */
    shape!: T;
    /**
     * The kind of curve the chosen edges run along.
     * @default line
     */
    type?: curveTypeEnum | undefined = curveTypeEnum.line;
    /**
     * The edges to choose among, counted from 0 as `shapes.edge.getEdges` lists them; left out, all
     * are candidates, and an empty list chooses none.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
/**
 * A shape, a direction and an angle for `select.faces.facing` and `select.edges.along`.
 */
export class SelectByDirectionDto<T> {
    constructor(shape?: T, direction?: Base.Vector3, angle?: number, indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
        if (angle !== undefined) { this.angle = angle; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The shape whose faces or edges are chosen from.
     * @default undefined
     */
    shape!: T;
    /**
     * The direction a face should face, or a straight edge run along; only its direction matters.
     * @default [0, 0, 1]
     */
    direction?: Base.Vector3 | undefined = [0, 0, 1];
    /**
     * How far in degrees a face's normal, or an edge's line, may turn from `direction`.
     * @default 0
     * @minimum 0
     * @maximum 180
     * @step 1
     */
    angle?: number | undefined = 0;
    /**
     * The faces or edges to choose among, counted from 0 as the getters list them; left out, all are
     * candidates, and an empty list chooses none.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
/**
 * A shape, a direction and a tolerance for `select.faces.extreme` and `select.edges.extreme`.
 */
export class SelectExtremeDto<T> {
    constructor(shape?: T, direction?: Base.Vector3, tolerance?: number, indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The shape whose faces or edges are chosen from.
     * @default undefined
     */
    shape!: T;
    /**
     * The direction to look furthest along; `[0, 0, -1]` finds the lowest.
     * @default [0, 0, 1]
     */
    direction?: Base.Vector3 | undefined = [0, 0, 1];
    /**
     * How far short of the furthest centre another may lie and still be chosen, in model units.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    tolerance?: number | undefined = 1e-7;
    /**
     * The faces or edges to choose among, counted from 0 as the getters list them; left out, all are
     * candidates, and an empty list chooses none.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
/**
 * A shape and two opposite corners of a box for `select.faces.inBox` and `select.edges.inBox`.
 */
export class SelectInBoxDto<T> {
    constructor(shape?: T, corner?: Base.Point3, oppositeCorner?: Base.Point3, indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (corner !== undefined) { this.corner = corner; }
        if (oppositeCorner !== undefined) { this.oppositeCorner = oppositeCorner; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The shape whose faces or edges are chosen from.
     * @default undefined
     */
    shape!: T;
    /**
     * One corner of the box, which lines up with the axes.
     * @default [0, 0, 0]
     */
    corner?: Base.Point3 | undefined = [0, 0, 0];
    /**
     * The corner across from `corner`; the two may be given either way round.
     * @default [1, 1, 1]
     */
    oppositeCorner?: Base.Point3 | undefined = [1, 1, 1];
    /**
     * The faces or edges to choose among, counted from 0 as the getters list them; left out, all are
     * candidates, and an empty list chooses none.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
/**
 * A shape, a center and a radius for `select.faces.inSphere` and `select.edges.inSphere`.
 */
export class SelectInSphereDto<T> {
    constructor(shape?: T, center?: Base.Point3, radius?: number, indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (center !== undefined) { this.center = center; }
        if (radius !== undefined) { this.radius = radius; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The shape whose faces or edges are chosen from.
     * @default undefined
     */
    shape!: T;
    /**
     * The point the chosen centres lie within `radius` of.
     * @default [0, 0, 0]
     */
    center?: Base.Point3 | undefined = [0, 0, 0];
    /**
     * The radius of the sphere in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius?: number | undefined = 1;
    /**
     * The faces or edges to choose among, counted from 0 as the getters list them; left out, all are
     * candidates, and an empty list chooses none.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
/**
 * A shape, a point and a count for `select.faces.nearest` and `select.edges.nearest`.
 */
export class SelectNearestDto<T> {
    constructor(shape?: T, point?: Base.Point3, count?: number, indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (point !== undefined) { this.point = point; }
        if (count !== undefined) { this.count = count; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The shape whose faces or edges are chosen from.
     * @default undefined
     */
    shape!: T;
    /**
     * The point the chosen faces or edges lie nearest.
     * @default [0, 0, 0]
     */
    point?: Base.Point3 | undefined = [0, 0, 0];
    /**
     * How many to choose, nearest first; Infinity orders them all.
     * @default 1
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    count?: number | undefined = 1;
    /**
     * The faces or edges to choose among, counted from 0 as the getters list them; left out, all are
     * candidates, and an empty list chooses none.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
/**
 * A shape, a plane and a tolerance for `select.faces.onPlane` and `select.edges.onPlane`.
 */
export class SelectOnPlaneDto<T> {
    constructor(shape?: T, origin?: Base.Point3, normal?: Base.Vector3, tolerance?: number, indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (origin !== undefined) { this.origin = origin; }
        if (normal !== undefined) { this.normal = normal; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The shape whose faces or edges are chosen from.
     * @default undefined
     */
    shape!: T;
    /**
     * A point the plane passes through.
     * @default [0, 0, 0]
     */
    origin?: Base.Point3 | undefined = [0, 0, 0];
    /**
     * The direction across the plane; either way round gives the same plane.
     * @default [0, 0, 1]
     */
    normal?: Base.Vector3 | undefined = [0, 0, 1];
    /**
     * How far from the plane a face or an edge may lie and still be on it, in model units.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    tolerance?: number | undefined = 1e-7;
    /**
     * The faces or edges to choose among, counted from 0 as the getters list them; left out, all are
     * candidates, and an empty list chooses none.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
/**
 * A shape and a range for `select.faces.bySize`, `select.faces.byRadius`, `select.edges.byLength`
 * and `select.edges.byRadius`.
 */
export class SelectInRangeDto<T> {
    constructor(shape?: T, min?: number, max?: number, indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (min !== undefined) { this.min = min; }
        if (max !== undefined) { this.max = max; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The shape whose faces or edges are chosen from.
     * @default undefined
     */
    shape!: T;
    /**
     * The smallest area, length or radius chosen.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    min?: number | undefined = 0;
    /**
     * The largest area, length or radius chosen.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    max?: number | undefined = 1;
    /**
     * The faces or edges to choose among, counted from 0 as the getters list them; left out, all are
     * candidates, and an empty list chooses none.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
/**
 * A shape and the faces or edges to start from, for `select.faces.adjacentTo`,
 * `select.faces.ofEdges` and `select.edges.ofFaces`.
 */
export class SelectFromIndexesDto<T> {
    constructor(shape?: T, indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The shape whose faces or edges are chosen from.
     * @default undefined
     */
    shape!: T;
    /**
     * The faces or edges to start from, counted from 0 as the getters list them.
     * @default undefined
     */
    indexes!: number[];
}
/**
 * A shape and two sets of faces for `select.edges.between`, which finds where they meet.
 */
export class SelectBetweenDto<T> {
    constructor(shape?: T, indexes?: number[], otherIndexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (indexes !== undefined) { this.indexes = indexes; }
        if (otherIndexes !== undefined) { this.otherIndexes = otherIndexes; }
    }
    /**
     * The shape whose edges are chosen from.
     * @default undefined
     */
    shape!: T;
    /**
     * One set of faces, counted from 0 as `shapes.face.getFaces` lists them.
     * @default undefined
     */
    indexes!: number[];
    /**
     * The other set of faces, counted the same way.
     * @default undefined
     */
    otherIndexes!: number[];
}
/**
 * A shape, the edges to start from and an angle for `select.edges.tangentChain`.
 */
export class SelectTangentChainDto<T> {
    constructor(shape?: T, indexes?: number[], angle?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (indexes !== undefined) { this.indexes = indexes; }
        if (angle !== undefined) { this.angle = angle; }
    }
    /**
     * The shape whose edges are chosen from.
     * @default undefined
     */
    shape!: T;
    /**
     * The edges the chain starts from, counted from 0 as `shapes.edge.getEdges` lists them.
     * @default undefined
     */
    indexes!: number[];
    /**
     * How far in degrees two edges may turn where they meet and still continue each other.
     * @default 1
     * @minimum 0
     * @maximum 180
     * @step 1
     */
    angle?: number | undefined = 1;
}
/**
 * A shape and an angle for `select.edges.convex` and `select.edges.concave`.
 */
export class SelectConvexityDto<T> {
    constructor(shape?: T, tangentAngle?: number, indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (tangentAngle !== undefined) { this.tangentAngle = tangentAngle; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The shape whose edges are chosen from.
     * @default undefined
     */
    shape!: T;
    /**
     * How far in degrees, up to a right angle, two faces may turn at an edge and still count as
     * smooth, neither convex nor concave.
     * @default 1
     * @minimum 0
     * @maximum 90
     * @step 1
     */
    tangentAngle?: number | undefined = 1;
    /**
     * The edges to choose among, counted from 0 as `shapes.edge.getEdges` lists them; left out, all
     * are candidates, and an empty list chooses none.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
/**
 * A shape and a direction for `select.faces.sortAlong` and `select.edges.sortAlong`.
 */
export class SelectSortAlongDto<T> {
    constructor(shape?: T, direction?: Base.Vector3, indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The shape whose faces or edges are sorted.
     * @default undefined
     */
    shape!: T;
    /**
     * The direction to sort along, from the lowest centre to the highest.
     * @default [0, 0, 1]
     */
    direction?: Base.Vector3 | undefined = [0, 0, 1];
    /**
     * The faces or edges to sort, counted from 0 as the getters list them; left out, all are sorted,
     * and an empty list sorts none.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
/**
 * A shape, a direction and a tolerance for `select.faces.groupAlong` and `select.edges.groupAlong`.
 */
export class SelectGroupAlongDto<T> {
    constructor(shape?: T, direction?: Base.Vector3, tolerance?: number, indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The shape whose faces or edges are grouped.
     * @default undefined
     */
    shape!: T;
    /**
     * The direction to sort and group along.
     * @default [0, 0, 1]
     */
    direction?: Base.Vector3 | undefined = [0, 0, 1];
    /**
     * How far past a group's first centre another may lie and still join the group, in model units.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    tolerance?: number | undefined = 1e-7;
    /**
     * The faces or edges to group, counted from 0 as the getters list them; left out, all are grouped,
     * and an empty list groups none.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
/**
 * A face and a point for `shapes.face.frameNearestPoint`.
 */
export class FrameNearestPointDto<T> {
    constructor(shape?: T, point?: Base.Point3) {
        if (shape !== undefined) { this.shape = shape; }
        if (point !== undefined) { this.point = point; }
    }
    /**
     * The face the frame sits on.
     * @default undefined
     */
    shape!: T;
    /**
     * The point whose nearest place on the face gets the frame; beyond the face's edge it comes to the edge.
     * @default [0, 0, 0]
     */
    point?: Base.Point3 | undefined = [0, 0, 0];
}
/**
 * A face and the points to find frames nearest to, for `shapes.face.framesNearestPoints`.
 */
export class FramesNearestPointsDto<T> {
    constructor(shape?: T, points?: Base.Point3[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (points !== undefined) { this.points = points; }
    }
    /**
     * The face the frames sit on.
     * @default undefined
     */
    shape!: T;
    /**
     * The points whose nearest places on the face get a frame each.
     * @default undefined
     */
    points!: Base.Point3[];
}
/**
 * How the frames along an edge or a wire follow it, shared by the methods that make one frame and
 * those that make many: the kind of frame and the up vector.
 */
export abstract class FrameOnCurveSharedDto {
    /**
     * How the frames follow the curve.
     * @default rotationMinimizing
     */
    kind?: curveFrameEnum | undefined = curveFrameEnum.rotationMinimizing;
    /**
     * The way perpendicular frames keep level with, and the first rotation-minimizing frame starts
     * from; ignored by Frenet frames.
     * @default [0, 0, 1]
     */
    up?: Base.Vector3 | undefined = [0, 0, 1];
}
/**
 * An edge or a wire, a parameter and the kind of frame for `shapes.edge.frameOnEdgeAtParam` and
 * `shapes.wire.frameOnWireAtParam`.
 */
export class FrameOnCurveAtParamDto<T> extends FrameOnCurveSharedDto {
    constructor(shape?: T, param?: number, kind?: curveFrameEnum, up?: Base.Vector3) {
        super();
        if (shape !== undefined) { this.shape = shape; }
        if (param !== undefined) { this.param = param; }
        if (kind !== undefined) { this.kind = kind; }
        if (up !== undefined) { this.up = up; }
    }
    /**
     * The edge or wire the frame sits on.
     * @default undefined
     */
    shape!: T;
    /**
     * Where the frame sits, as a fraction from 0 at the start to 1 at the end.
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    param?: number | undefined = 0.5;
}
/**
 * An edge or a wire, a length and the kind of frame for `shapes.edge.frameOnEdgeAtLength` and
 * `shapes.wire.frameOnWireAtLength`.
 */
export class FrameOnCurveAtLengthDto<T> extends FrameOnCurveSharedDto {
    constructor(shape?: T, length?: number, kind?: curveFrameEnum, up?: Base.Vector3) {
        super();
        if (shape !== undefined) { this.shape = shape; }
        if (length !== undefined) { this.length = length; }
        if (kind !== undefined) { this.kind = kind; }
        if (up !== undefined) { this.up = up; }
    }
    /**
     * The edge or wire the frame sits on.
     * @default undefined
     */
    shape!: T;
    /**
     * How far along the curve from its start the frame sits, in model units, up to its length.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    length?: number | undefined = 1;
}
/**
 * An edge or a wire, parameters and the kind of frame for `shapes.edge.framesOnEdgeAtParams` and
 * `shapes.wire.framesOnWireAtParams`.
 */
export class FramesOnCurveAtParamsDto<T> extends FrameOnCurveSharedDto {
    constructor(shape?: T, params?: number[], kind?: curveFrameEnum, up?: Base.Vector3) {
        super();
        if (shape !== undefined) { this.shape = shape; }
        if (params !== undefined) { this.params = params; }
        if (kind !== undefined) { this.kind = kind; }
        if (up !== undefined) { this.up = up; }
    }
    /**
     * The edge or wire the frames sit on.
     * @default undefined
     */
    shape!: T;
    /**
     * Where the frames sit, each a fraction from 0 at the start to 1 at the end.
     * @default undefined
     */
    params!: number[];
}
/**
 * An edge or a wire, lengths and the kind of frame for `shapes.edge.framesOnEdgeAtLengths` and
 * `shapes.wire.framesOnWireAtLengths`.
 */
export class FramesOnCurveAtLengthsDto<T> extends FrameOnCurveSharedDto {
    constructor(shape?: T, lengths?: number[], kind?: curveFrameEnum, up?: Base.Vector3) {
        super();
        if (shape !== undefined) { this.shape = shape; }
        if (lengths !== undefined) { this.lengths = lengths; }
        if (kind !== undefined) { this.kind = kind; }
        if (up !== undefined) { this.up = up; }
    }
    /**
     * The edge or wire the frames sit on.
     * @default undefined
     */
    shape!: T;
    /**
     * How far along the curve from its start each frame sits, in model units, up to its length.
     * @default undefined
     */
    lengths!: number[];
}
/**
 * A wire, a count and the kind of frame for `shapes.wire.framesAlongWire`, frames spread evenly
 * by length, and whether a closed wire repeats its first frame at the end.
 */
export class FramesAlongWireDto<T> extends FrameOnCurveSharedDto {
    constructor(shape?: T, count?: number, kind?: curveFrameEnum, up?: Base.Vector3, skipEndOnClosed?: boolean) {
        super();
        if (shape !== undefined) { this.shape = shape; }
        if (count !== undefined) { this.count = count; }
        if (kind !== undefined) { this.kind = kind; }
        if (up !== undefined) { this.up = up; }
        if (skipEndOnClosed !== undefined) { this.skipEndOnClosed = skipEndOnClosed; }
    }
    /**
     * The wire the frames sit on.
     * @default undefined
     */
    shape!: T;
    /**
     * How many frames, the first at the start; `skipEndOnClosed` decides where the last goes on a
     * closed wire.
     * @default 10
     * @minimum 2
     * @maximum Infinity
     * @step 1
     */
    count?: number | undefined = 10;
    /**
     * On a closed wire, leaves out the end frame, which would sit on the first, and spaces the
     * frames evenly around the loop; open wires are unaffected.
     * @default true
     */
    skipEndOnClosed?: boolean | undefined = true;
}
/**
 * A shape and two frames for `transforms.orient`, which moves the shape from one onto the other.
 */
export class OrientDto<T> {
    constructor(shape?: T, to?: Base.Frame, from?: Base.Frame) {
        if (shape !== undefined) { this.shape = shape; }
        if (to !== undefined) { this.to = to; }
        if (from !== undefined) { this.from = from; }
    }
    /**
     * The shape to move.
     * @default undefined
     */
    shape!: T;
    /**
     * The frame the shape lands on.
     * @default undefined
     */
    to!: Base.Frame;
    /**
     * The frame the shape is moved from; leave it out for the world frame at the origin, normal
     * along z and direction along x.
     * @default undefined
     * @optional true
     */
    from?: Base.Frame | undefined;
}
/**
 * A shape and frames for `transforms.placeOnFrames`, one copy on each.
 */
export class PlaceOnFramesDto<T> {
    constructor(shape?: T, frames?: Base.Frame[], from?: Base.Frame) {
        if (shape !== undefined) { this.shape = shape; }
        if (frames !== undefined) { this.frames = frames; }
        if (from !== undefined) { this.from = from; }
    }
    /**
     * The shape a copy of which lands on every frame.
     * @default undefined
     */
    shape!: T;
    /**
     * The frames a copy lands on, one copy each.
     * @default undefined
     */
    frames!: Base.Frame[];
    /**
     * The frame the copies are moved from; leave it out for the world frame at the origin, normal
     * along z and direction along x.
     * @default undefined
     * @optional true
     */
    from?: Base.Frame | undefined;
}
/**
 * A shape and matrices for `transforms.placeByMatrices`, one copy placed by each.
 */
export class PlaceByMatricesDto<T> {
    constructor(shape?: T, matrices?: Base.TransformMatrixes[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (matrices !== undefined) { this.matrices = matrices; }
    }
    /**
     * The shape a copy of which each placement places.
     * @default undefined
     */
    shape!: T;
    /**
     * One placement per entry: a list of column-major 4 x 4 matrices applied first to last, as
     * `frame.toMatrix` gives them, or a single matrix; each a turn and a move.
     * @default undefined
     */
    matrices!: Base.TransformMatrixes[];
}
