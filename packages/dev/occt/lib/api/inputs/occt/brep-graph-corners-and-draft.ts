// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { cornerModeEnum } from "./enums";

/**
 * The kind of node in a boundary-representation graph. Walking a shape produces a graph of
 * vertices, edges, wires, faces, shells and solids, and this says which one a given node is - the
 * discriminator you switch on when traversing the result.
 */
export enum brepGraphNodeKindEnum {
    solid = "solid",
    shell = "shell",
    face = "face",
    wire = "wire",
    edge = "edge",
    vertex = "vertex",
    compound = "compound",
    compsolid = "compsolid",
}
/**
 * A shape and a graph node, by kind and index, for `brepGraph.reconstruct`, which turns the node
 * back into a real sub-shape.
 */
export class BRepGraphReconstructDto<T> {
    constructor(shape?: T, kind?: brepGraphNodeKindEnum, index?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (kind !== undefined) { this.kind = kind; }
        if (index !== undefined) { this.index = index; }
    }
    /**
     * The shape the graph was built from.
     * @default undefined
     */
    shape!: T;
    /**
     * What kind of part the node is: solid, shell, face, wire, edge, vertex, compound or compsolid.
     * @default solid
     */
    kind: brepGraphNodeKindEnum = brepGraphNodeKindEnum.solid;
    /**
     * The position of the node among the parts of its kind, counting from 0, as the graph queries
     * report it.
     * @default 0
     * @step 1
     */
    index = 0;
}
/**
 * A shape and one of its sub-shapes for `brepGraph.nodeOfShape`, which finds the graph node
 * standing for the sub-shape.
 */
export class BRepGraphNodeOfShapeDto<T> {
    constructor(shape?: T, subShape?: T) {
        if (shape !== undefined) { this.shape = shape; }
        if (subShape !== undefined) { this.subShape = subShape; }
    }
    /**
     * The shape the graph was built from.
     * @default undefined
     */
    shape!: T;
    /**
     * The face, edge or other part of the shape to look up.
     * @default undefined
     */
    subShape!: T;
}
/**
 * A shell or solid, points near its corners and rounding settings for
 * `corners.filletCornerByPoint`, which rounds only the corners picked by the points.
 */
export class FilletCornerByPointDto<T> {
    constructor(shape?: T, points?: Base.Point3[], radius?: number, taperFactor?: number, snapTolerance?: number, mode?: cornerModeEnum) {
        if (shape !== undefined) { this.shape = shape; }
        if (points !== undefined) { this.points = points; }
        if (radius !== undefined) { this.radius = radius; }
        if (taperFactor !== undefined) { this.taperFactor = taperFactor; }
        if (snapTolerance !== undefined) { this.snapTolerance = snapTolerance; }
        if (mode !== undefined) { this.mode = mode; }
    }
    /**
     * The shell or solid whose corners are rounded.
     * @default undefined
     */
    shape!: T;
    /**
     * Points near the corners to round; the vertex nearest each point is the one treated.
     * @default []
     */
    points: Base.Point3[] = [];
    /**
     * The rounding radius, in model units.
     * @default 1
     * @step 0.1
     */
    radius = 1;
    /**
     * For 3D corners, how far the rounding reaches along the meeting edges: 0 for the tightest,
     * almost spherical corner, 1 for the full reach.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    taperFactor = 1;
    /**
     * How far a point may be from a vertex and still pick it, in model units; 0 or less accepts the
     * nearest vertex whatever the distance.
     * @default 0
     * @step 0.1
     */
    snapTolerance = 0;
    /**
     * `auto` rounds planar corners in place and 3D corners with a taper; `planarOnly` skips 3D
     * corners.
     * @default auto
     */
    mode: cornerModeEnum = cornerModeEnum.auto;
}
/**
 * A shell or solid, points near its corners and bevel settings for `corners.chamferCornerByPoint`,
 * which bevels only the corners picked by the points.
 */
export class ChamferCornerByPointDto<T> {
    constructor(shape?: T, points?: Base.Point3[], distance?: number, angle?: number, snapTolerance?: number, mode?: cornerModeEnum) {
        if (shape !== undefined) { this.shape = shape; }
        if (points !== undefined) { this.points = points; }
        if (distance !== undefined) { this.distance = distance; }
        if (angle !== undefined) { this.angle = angle; }
        if (snapTolerance !== undefined) { this.snapTolerance = snapTolerance; }
        if (mode !== undefined) { this.mode = mode; }
    }
    /**
     * The shell or solid whose corners are beveled.
     * @default undefined
     */
    shape!: T;
    /**
     * Points near the corners to bevel; the vertex nearest each point is the one treated.
     * @default []
     */
    points: Base.Point3[] = [];
    /**
     * How far the bevel reaches back from the corner along its edges, in model units.
     * @default 1
     * @step 0.1
     */
    distance = 1;
    /**
     * The slope of the bevel in degrees, used for planar corners.
     * @default 45
     * @step 1
     */
    angle = 45;
    /**
     * How far a point may be from a vertex and still pick it, in model units; 0 or less accepts the
     * nearest vertex whatever the distance.
     * @default 0
     * @step 0.1
     */
    snapTolerance = 0;
    /**
     * `auto` bevels planar corners in place and 3D corners with a local plane cut; `planarOnly`
     * skips 3D corners.
     * @default auto
     */
    mode: cornerModeEnum = cornerModeEnum.auto;
}
/**
 * A shell or solid and points near its corners for `corners.classifyCornerByPoint`, which reports
 * what kind of corner each point picks.
 */
export class ClassifyCornerByPointDto<T> {
    constructor(shape?: T, points?: Base.Point3[], snapTolerance?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (points !== undefined) { this.points = points; }
        if (snapTolerance !== undefined) { this.snapTolerance = snapTolerance; }
    }
    /**
     * The shell or solid whose corners are looked up.
     * @default undefined
     */
    shape!: T;
    /**
     * Points near the corners to classify; the vertex nearest each point is the one reported.
     * @default []
     */
    points: Base.Point3[] = [];
    /**
     * How far a point may be from a vertex and still pick it, in model units; 0 or less accepts the
     * nearest vertex whatever the distance.
     * @default 0
     * @step 0.1
     */
    snapTolerance = 0;
}
/**
 * A flat wire or face, a distance, an angle and optional corner indexes for
 * `fillets.chamfer2dVertices`, which bevels the corners.
 */
export class Chamfer2dVertexDto<T> {
    constructor(shape?: T, distance?: number, angle?: number, indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (distance !== undefined) { this.distance = distance; }
        if (angle !== undefined) { this.angle = angle; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The flat wire or face whose corners are beveled.
     * @default undefined
     */
    shape!: T;
    /**
     * How far the bevel cuts back from each corner along one edge, in model units.
     * @default 1
     * @step 0.1
     */
    distance = 1;
    /**
     * The angle of the bevel to that edge, in degrees; 45 gives an even chamfer.
     * @default 45
     * @step 1
     */
    angle = 45;
    /**
     * Which corners to bevel, counted from 1 along the outline; leave it out to bevel them all.
     * @default undefined
     */
    indexes?: number[] | undefined;
}
/**
 * A shape, the faces to tilt and the draft settings for `draft.draftAngle`, which tapers the faces
 * about a neutral plane.
 */
export class DraftAngleDto<T, U> {
    constructor(shape?: T, faces?: U[], direction?: Base.Vector3, angle?: number, neutralPlaneOrigin?: Base.Point3, neutralPlaneDirection?: Base.Vector3, flag?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (faces !== undefined) { this.faces = faces; }
        if (direction !== undefined) { this.direction = direction; }
        if (angle !== undefined) { this.angle = angle; }
        if (neutralPlaneOrigin !== undefined) { this.neutralPlaneOrigin = neutralPlaneOrigin; }
        if (neutralPlaneDirection !== undefined) { this.neutralPlaneDirection = neutralPlaneDirection; }
        if (flag !== undefined) { this.flag = flag; }
    }
    /**
     * The solid whose faces are tilted.
     * @default undefined
     */
    shape!: T;
    /**
     * The faces of the shape that get the taper.
     * @default undefined
     */
    faces!: U[];
    /**
     * The pull direction, the way the part leaves the mold; the taper is measured against it.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * The draft angle, in degrees.
     * @default 5
     * @step 1
     */
    angle = 5;
    /**
     * A point on the neutral plane, the plane that stays where it is while the faces pivot about
     * it.
     * @default [0, 0, 0]
     */
    neutralPlaneOrigin: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the neutral plane.
     * @default [0, 0, 1]
     */
    neutralPlaneDirection: Base.Vector3 = [0, 0, 1];
    /**
     * When true, the faces taper on the standard side; false tapers them the other way.
     * @default true
     */
    flag = true;
}
/**
 * A wire or shape, a direction, an angle and a length for `draft.makeDraft`, which grows a tapered
 * skirt from the edges.
 */
export class MakeDraftDto<T> {
    constructor(shape?: T, direction?: Base.Vector3, angle?: number, lengthMax?: number, internal?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
        if (angle !== undefined) { this.angle = angle; }
        if (lengthMax !== undefined) { this.lengthMax = lengthMax; }
        if (internal !== undefined) { this.internal = internal; }
    }
    /**
     * The wire, face or shape whose edges the skirt grows from.
     * @default undefined
     */
    shape!: T;
    /**
     * The direction the skirt grows along, the pull direction of the mold.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * How far the skirt leans from the direction, in degrees.
     * @default 5
     * @step 1
     */
    angle = 5;
    /**
     * How long the skirt may grow, in model units, measured along the corner edges between its
     * faces.
     * @default 10
     * @step 0.1
     */
    lengthMax = 10;
    /**
     * When true, the skirt leans inward instead of outward.
     * @default false
     */
    internal = false;
}
/**
 * A wire or shape, a direction, an angle and a stop shape for `draft.makeDraftToShape`, which grows
 * a tapered skirt from the edges until it meets the stop shape.
 */
export class MakeDraftToShapeDto<T> {
    constructor(shape?: T, direction?: Base.Vector3, angle?: number, stopShape?: T, keepOut?: boolean, internal?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
        if (angle !== undefined) { this.angle = angle; }
        if (stopShape !== undefined) { this.stopShape = stopShape; }
        if (keepOut !== undefined) { this.keepOut = keepOut; }
        if (internal !== undefined) { this.internal = internal; }
    }
    /**
     * The wire, face or shape whose edges the skirt grows from.
     * @default undefined
     */
    shape!: T;
    /**
     * The direction the skirt grows along, the pull direction of the mold.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * How far the skirt leans from the direction, in degrees.
     * @default 5
     * @step 1
     */
    angle = 5;
    /**
     * The shape the skirt grows up to and stops at.
     * @default undefined
     */
    stopShape!: T;
    /**
     * When true, the part of the stop shape outside the skirt is kept in the result.
     * @default false
     */
    keepOut = false;
    /**
     * When true, the skirt leans inward instead of outward.
     * @default false
     */
    internal = false;
}
