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
export class BRepGraphReconstructDto<T> {
    constructor(shape?: T, kind?: brepGraphNodeKindEnum, index?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (kind !== undefined) { this.kind = kind; }
        if (index !== undefined) { this.index = index; }
    }
    /**
     * Shape the graph is rebuilt from
     * @default undefined
     */
    shape!: T;
    /**
     * Kind of graph node to reconstruct into a sub-shape
     * @default solid
     */
    kind: brepGraphNodeKindEnum = brepGraphNodeKindEnum.solid;
    /**
     * 0-based index of the node within its kind
     * @default 0
     * @step 1
     */
    index = 0;
}
export class BRepGraphNodeOfShapeDto<T> {
    constructor(shape?: T, subShape?: T) {
        if (shape !== undefined) { this.shape = shape; }
        if (subShape !== undefined) { this.subShape = subShape; }
    }
    /**
     * Shape the graph is rebuilt from
     * @default undefined
     */
    shape!: T;
    /**
     * Sub-shape of the shape to locate in the graph
     * @default undefined
     */
    subShape!: T;
}
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
     * Shell or solid whose corner(s) will be rounded
     * @default undefined
     */
    shape!: T;
    /**
     * Points near the corners to round (the nearest vertex to each is used)
     * @default []
     */
    points: Base.Point3[] = [];
    /**
     * Fillet radius
     * @default 1
     * @step 0.1
     */
    radius = 1;
    /**
     * 3D corners only: taper reach along the incident edges, 0 = tightest (near spherical corner), 1 = up to the edge neutral point
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    taperFactor = 1;
    /**
     * Maximum point-to-vertex distance to accept; 0 or less snaps to the nearest vertex unconditionally
     * @default 0
     * @step 0.1
     */
    snapTolerance = 0;
    /**
     * auto: planar corners are corner-only, 3D corners are taper-filleted; planarOnly: 3D corners are skipped
     * @default auto
     */
    mode: cornerModeEnum = cornerModeEnum.auto;
}
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
     * Shell or solid whose corner(s) will be beveled
     * @default undefined
     */
    shape!: T;
    /**
     * Points near the corners to chamfer (the nearest vertex to each is used)
     * @default []
     */
    points: Base.Point3[] = [];
    /**
     * Chamfer setback distance
     * @default 1
     * @step 0.1
     */
    distance = 1;
    /**
     * Chamfer angle in degrees (used by the planar 2D chamfer)
     * @default 45
     * @step 1
     */
    angle = 45;
    /**
     * Maximum point-to-vertex distance to accept; 0 or less snaps to the nearest vertex unconditionally
     * @default 0
     * @step 0.1
     */
    snapTolerance = 0;
    /**
     * auto: planar corners are corner-only, 3D corners use a local plane cut; planarOnly: 3D corners are skipped
     * @default auto
     */
    mode: cornerModeEnum = cornerModeEnum.auto;
}
export class ClassifyCornerByPointDto<T> {
    constructor(shape?: T, points?: Base.Point3[], snapTolerance?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (points !== undefined) { this.points = points; }
        if (snapTolerance !== undefined) { this.snapTolerance = snapTolerance; }
    }
    /**
     * Shell or solid whose corner(s) will be classified
     * @default undefined
     */
    shape!: T;
    /**
     * Points near the corners to classify (the nearest vertex to each is used)
     * @default []
     */
    points: Base.Point3[] = [];
    /**
     * Maximum point-to-vertex distance to accept; 0 or less snaps to the nearest vertex unconditionally
     * @default 0
     * @step 0.1
     */
    snapTolerance = 0;
}
export class Chamfer2dVertexDto<T> {
    constructor(shape?: T, distance?: number, angle?: number, indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (distance !== undefined) { this.distance = distance; }
        if (angle !== undefined) { this.angle = angle; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * 2D wire or planar face whose corners will be chamfered
     * @default undefined
     */
    shape!: T;
    /**
     * Chamfer setback distance along the corner edge
     * @default 1
     * @step 0.1
     */
    distance = 1;
    /**
     * Chamfer angle in degrees
     * @default 45
     * @step 1
     */
    angle = 45;
    /**
     * Optional 1-based corner indexes to chamfer; chamfers all corners when omitted
     * @default undefined
     */
    indexes?: number[] | undefined;
}
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
     * Shape to draft
     * @default undefined
     */
    shape!: T;
    /**
     * Faces of the shape to taper
     * @default undefined
     */
    faces!: U[];
    /**
     * Pull direction the draft is applied along
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * Draft angle in degrees
     * @default 5
     * @step 1
     */
    angle = 5;
    /**
     * Origin of the neutral plane (kept fixed during drafting)
     * @default [0, 0, 0]
     */
    neutralPlaneOrigin: Base.Point3 = [0, 0, 0];
    /**
     * Normal of the neutral plane
     * @default [0, 0, 1]
     */
    neutralPlaneDirection: Base.Vector3 = [0, 0, 1];
    /**
     * Direction flag passed to OCCT (true keeps the standard draft side)
     * @default true
     */
    flag = true;
}
export class MakeDraftDto<T> {
    constructor(shape?: T, direction?: Base.Vector3, angle?: number, lengthMax?: number, internal?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
        if (angle !== undefined) { this.angle = angle; }
        if (lengthMax !== undefined) { this.lengthMax = lengthMax; }
        if (internal !== undefined) { this.internal = internal; }
    }
    /**
     * Shape (or face/wire) to draft from
     * @default undefined
     */
    shape!: T;
    /**
     * Draft direction
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * Draft angle in degrees
     * @default 5
     * @step 1
     */
    angle = 5;
    /**
     * Maximum length of the corner edge between two draft faces
     * @default 10
     * @step 0.1
     */
    lengthMax = 10;
    /**
     * Whether the draft is internal
     * @default false
     */
    internal = false;
}
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
     * Shape (or face/wire) to draft from
     * @default undefined
     */
    shape!: T;
    /**
     * Draft direction
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * Draft angle in degrees
     * @default 5
     * @step 1
     */
    angle = 5;
    /**
     * Shape the draft is performed up to
     * @default undefined
     */
    stopShape!: T;
    /**
     * Keep the part of the stop shape outside the draft
     * @default false
     */
    keepOut = false;
    /**
     * Whether the draft is internal
     * @default false
     */
    internal = false;
}
