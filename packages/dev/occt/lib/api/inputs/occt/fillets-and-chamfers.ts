// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";

/**
 * A shape, a radius and optional edge or corner indexes for `fillets.filletEdges` and
 * `fillets.fillet2d`; `radiusList` pairs with `indexes` when both are given.
 */
export class FilletDto<T> {
    constructor(shape?: T, radius?: number, radiusList?: number[], indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (radius !== undefined) { this.radius = radius; }
        if (radiusList !== undefined) { this.radiusList = radiusList; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The shape whose edges, or whose corners for a flat wire or face, are rounded.
     * @default undefined
     */
    shape!: T;
    /**
     * The rounding radius in model units, used for every selected edge unless `radiusList` is
     * given.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     * @optional true
     */
    radius?: number | undefined = 0.1;
    /**
     * One radius per entry of `indexes`, in the same order; needs `indexes`.
     * @default undefined
     * @optional true
     */
    radiusList?: number[] | undefined;
    /**
     * Which edges to round, counted from 0 for `filletEdges`, or which corners, counted from 1 for
     * `fillet2d`; leave it out to round them all.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
/**
 * Shapes, a radius and optional corner indexes for `fillets.fillet2dShapes`, which rounds each flat
 * wire or face the same way.
 */
export class FilletShapesDto<T> {
    constructor(shapes?: T[], radius?: number, radiusList?: number[], indexes?: number[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (radius !== undefined) { this.radius = radius; }
        if (radiusList !== undefined) { this.radiusList = radiusList; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The flat wires or faces whose corners are rounded.
     * @default undefined
     */
    shapes!: T[];
    /**
     * The rounding radius in model units, used for every selected corner unless `radiusList` is
     * given.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     * @optional true
     */
    radius?: number | undefined = 0.1;
    /**
     * One radius per entry of `indexes`, in the same order; needs `indexes`.
     * @default undefined
     * @optional true
     */
    radiusList?: number[] | undefined;
    /**
     * Which corners to round, counted from 1 along each outline; leave it out to round them all.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
/**
 * A shape, some of its edges and one radius per edge for `fillets.filletEdgesList`.
 */
export class FilletEdgesListDto<T, U> {
    constructor(shape?: T, edges?: U[], radiusList?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (radiusList !== undefined) { this.radiusList = radiusList; }
    }
    /**
     * The shape the edges belong to.
     * @default undefined
     */
    shape!: T;
    /**
     * The edges of the shape to round.
     * @default undefined
     */
    edges!: U[];
    /**
     * One rounding radius per edge in model units, in the same order as `edges`; the lists must
     * have the same length.
     * @default undefined
     */
    radiusList!: number[];
}
/**
 * A shape, some of its edges and one radius for `fillets.filletEdgesListOneRadius`.
 */
export class FilletEdgesListOneRadiusDto<T, U> {
    constructor(shape?: T, edges?: U[], radius?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (radius !== undefined) { this.radius = radius; }
    }
    /**
     * The shape the edges belong to.
     * @default undefined
     */
    shape!: T;
    /**
     * The edges of the shape to round.
     * @default undefined
     */
    edges!: U[];
    /**
     * The rounding radius for every edge, in model units.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     * @optional true
     */
    radius = 0.1;
}
/**
 * A shape, one of its edges and a radius profile for `fillets.filletEdgeVariableRadius`;
 * `radiusList` and `paramsU` pair up by position.
 */
export class FilletEdgeVariableRadiusDto<T, U> {
    constructor(shape?: T, edge?: U, radiusList?: number[], paramsU?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (edge !== undefined) { this.edge = edge; }
        if (radiusList !== undefined) { this.radiusList = radiusList; }
        if (paramsU !== undefined) { this.paramsU = paramsU; }
    }
    /**
     * The shape the edge belongs to.
     * @default undefined
     */
    shape!: T;
    /**
     * The edge to round with a changing radius.
     * @default undefined
     */
    edge!: U;
    /**
     * The radius in model units at each position in `paramsU`; the lists must have the same length.
     * @default undefined
     */
    radiusList!: number[];
    /**
     * Positions along the edge as fractions from 0 at its start to 1 at its end, one per radius.
     * @default undefined
     */
    paramsU!: number[];
}
/**
 * A shape, some of its edges and a radius profile per edge for `fillets.filletEdgesVariableRadius`;
 * the three lists pair up by position.
 */
export class FilletEdgesVariableRadiusDto<T, U> {
    constructor(shape?: T, edges?: U[], radiusLists?: number[][], paramsULists?: number[][]) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (radiusLists !== undefined) { this.radiusLists = radiusLists; }
        if (paramsULists !== undefined) { this.paramsULists = paramsULists; }
    }
    /**
     * The shape the edges belong to.
     * @default undefined
     */
    shape!: T;
    /**
     * The edges to round, each with its own radius profile.
     * @default undefined
     */
    edges!: U[];
    /**
     * One list per edge of radii in model units, each pairing with the matching list in
     * `paramsULists`.
     * @default undefined
     */
    radiusLists!: number[][];
    /**
     * One list per edge of positions as fractions from 0 to 1 along it, each pairing with the
     * matching list in `radiusLists`.
     * @default undefined
     */
    paramsULists!: number[][];
}
/**
 * A shape, some of its edges and one radius profile shared by all of them for
 * `fillets.filletEdgesSameVariableRadius`.
 */
export class FilletEdgesSameVariableRadiusDto<T, U> {
    constructor(shape?: T, edges?: U[], radiusList?: number[], paramsU?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (radiusList !== undefined) { this.radiusList = radiusList; }
        if (paramsU !== undefined) { this.paramsU = paramsU; }
    }
    /**
     * The shape the edges belong to.
     * @default undefined
     */
    shape!: T;
    /**
     * The edges to round, all with the same radius profile.
     * @default undefined
     */
    edges!: U[];

    /**
     * The radius in model units at each position in `paramsU`; the lists must have the same length.
     * @default undefined
     */
    radiusList!: number[];
    /**
     * Positions along each edge as fractions from 0 at its start to 1 at its end, one per radius.
     * @default undefined
     */
    paramsU!: number[];
}

/**
 * Wires, a radius, optional corner indexes and an extrusion direction for `fillets.fillet3DWires`,
 * which rounds the corners of wires that do not lie in a plane.
 */
export class Fillet3DWiresDto<T> {
    constructor(shapes?: T[], radius?: number, direction?: Base.Vector3, radiusList?: number[], indexes?: number[],) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (radius !== undefined) { this.radius = radius; }
        if (direction !== undefined) { this.direction = direction; }
        if (radiusList !== undefined) { this.radiusList = radiusList; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The wires whose corners are rounded.
     * @default undefined
     */
    shapes!: T[];
    /**
     * The rounding radius in model units, used for every selected corner unless `radiusList` is
     * given.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     * @optional true
     */
    radius?: number | undefined = 0.1;
    /**
     * One radius per entry of `indexes`, in the same order; needs `indexes`.
     * @default undefined
     * @optional true
     */
    radiusList?: number[] | undefined;
    /**
     * Which corners to round, counted from 0 along each wire; leave it out to round them all.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
    /**
     * The direction each wire is extruded along to build the fillets; it must not be parallel to
     * the wire and must leave room for the radius.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
/**
 * A wire, a radius, optional corner indexes and an extrusion direction for `fillets.fillet3DWire`,
 * which rounds the corners of a wire that does not lie in a plane.
 */
export class Fillet3DWireDto<T> {
    constructor(shape?: T, radius?: number, direction?: Base.Vector3, radiusList?: number[], indexes?: number[],) {
        if (shape !== undefined) { this.shape = shape; }
        if (radius !== undefined) { this.radius = radius; }
        if (direction !== undefined) { this.direction = direction; }
        if (radiusList !== undefined) { this.radiusList = radiusList; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The wire whose corners are rounded.
     * @default undefined
     */
    shape!: T;
    /**
     * The rounding radius in model units, used for every selected corner unless `radiusList` is
     * given.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     * @optional true
     */
    radius?: number | undefined = 0.1;
    /**
     * One radius per entry of `indexes`, in the same order; needs `indexes`.
     * @default undefined
     * @optional true
     */
    radiusList?: number[] | undefined;
    /**
     * Which corners to round, counted from 0 along the wire; leave it out to round them all.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
    /**
     * The direction the wire is extruded along to build the fillets; it must not be parallel to the
     * wire and must leave room for the radius.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
/**
 * A shape, a distance and optional edge indexes for `fillets.chamferEdges`; `distanceList` pairs
 * with `indexes` when both are given.
 */
export class ChamferDto<T> {
    constructor(shape?: T, distance?: number, distanceList?: number[], indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (distance !== undefined) { this.distance = distance; }
        if (distanceList !== undefined) { this.distanceList = distanceList; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The shape whose edges are beveled.
     * @default undefined
     */
    shape!: T;
    /**
     * How far the bevel cuts back from the edge in model units, used for every selected edge unless
     * `distanceList` is given.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @optional true
     * @step 0.1
     */
    distance?: number | undefined = 0.1;
    /**
     * One distance per entry of `indexes`, in the same order; needs `indexes`.
     * @default undefined
     * @optional true
     */
    distanceList?: number[] | undefined;
    /**
     * Which edges to bevel, counted from 0 in the order `shapes.edge.getEdges` lists them; leave it
     * out to bevel them all.
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
/**
 * A shape, some of its edges and one distance per edge for `fillets.chamferEdgesList`.
 */
export class ChamferEdgesListDto<T, U> {
    constructor(shape?: T, edges?: U[], distanceList?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (distanceList !== undefined) { this.distanceList = distanceList; }
    }
    /**
     * The shape the edges belong to.
     * @default undefined
     */
    shape!: T;
    /**
     * The edges of the shape to bevel.
     * @default undefined
     */
    edges!: U[];
    /**
     * One bevel distance per edge in model units, in the same order as `edges`; the lists must have
     * the same length.
     * @default undefined
     */
    distanceList!: number[];
}
/**
 * A shape, one of its edges, a face at that edge, a distance and an angle for
 * `fillets.chamferEdgeDistAngle`.
 */
export class ChamferEdgeDistAngleDto<T, U, F> {
    constructor(shape?: T, edge?: U, face?: F, distance?: number, angle?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (edge !== undefined) { this.edge = edge; }
        if (face !== undefined) { this.face = face; }
        if (distance !== undefined) { this.distance = distance; }
        if (angle !== undefined) { this.angle = angle; }
    }
    /**
     * The shape the edge belongs to.
     * @default undefined
     */
    shape!: T;
    /**
     * The edge to bevel.
     * @default undefined
     */
    edge!: U;
    /**
     * One of the two faces meeting at the edge; the distance is measured on it and the angle from
     * it.
     * @default undefined
     */
    face!: F;
    /**
     * How far from the edge the bevel starts on the face, in model units.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    distance = 0.1;
    /**
     * The slope of the bevel away from the face, in degrees; 45 gives an even chamfer.
     * @default 45
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    angle = 45;
}

/**
 * A shape, one of its edges, a face at that edge and two distances for
 * `fillets.chamferEdgeTwoDistances`, an uneven bevel.
 */
export class ChamferEdgeTwoDistancesDto<T, U, F> {
    constructor(shape?: T, edge?: U, face?: F, distance1?: number, distance2?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (edge !== undefined) { this.edge = edge; }
        if (face !== undefined) { this.face = face; }
        if (distance1 !== undefined) { this.distance1 = distance1; }
        if (distance2 !== undefined) { this.distance2 = distance2; }
    }
    /**
     * The shape the edge belongs to.
     * @default undefined
     */
    shape!: T;
    /**
     * The edge to bevel.
     * @default undefined
     */
    edge!: U;
    /**
     * One of the two faces meeting at the edge; `distance1` is measured on it.
     * @default undefined
     */
    face!: F;
    /**
     * How far the bevel reaches from the edge on `face`, in model units.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    distance1 = 0.1;
    /**
     * How far the bevel reaches from the edge on the other face, in model units.
     * @default 0.2
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    distance2 = 0.2;
}
/**
 * A shape, some of its edges, one face per edge and two distances per edge for
 * `fillets.chamferEdgesTwoDistancesLists`; all the lists pair up by position.
 */
export class ChamferEdgesTwoDistancesListsDto<T, U, F> {
    constructor(shape?: T, edges?: U[], faces?: F[], distances1?: number[], distances2?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (faces !== undefined) { this.faces = faces; }
        if (distances1 !== undefined) { this.distances1 = distances1; }
        if (distances2 !== undefined) { this.distances2 = distances2; }
    }
    /**
     * The shape the edges belong to.
     * @default undefined
     */
    shape!: T;
    /**
     * The edges to bevel.
     * @default undefined
     */
    edges!: U[];
    /**
     * One face per edge, meeting it; the first distance is measured on that face.
     * @default undefined
     */
    faces!: F[];
    /**
     * One distance per edge, in model units, measured on the paired face.
     * @default undefined
     */
    distances1!: number[];
    /**
     * One distance per edge, in model units, measured on the other face.
     * @default undefined
     */
    distances2!: number[];
}
/**
 * A shape, some of its edges, one face per edge and two shared distances for
 * `fillets.chamferEdgesTwoDistances`; `faces` pairs with `edges` by position.
 */
export class ChamferEdgesTwoDistancesDto<T, U, F> {
    constructor(shape?: T, edges?: U[], faces?: F[], distance1?: number, distance2?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (faces !== undefined) { this.faces = faces; }
        if (distance1 !== undefined) { this.distance1 = distance1; }
        if (distance2 !== undefined) { this.distance2 = distance2; }
    }
    /**
     * The shape the edges belong to.
     * @default undefined
     */
    shape!: T;
    /**
     * The edges to bevel.
     * @default undefined
     */
    edges!: U[];
    /**
     * One face per edge, meeting it; `distance1` is measured on that face.
     * @default undefined
     */
    faces!: F[];
    /**
     * How far the bevel reaches from each edge on its paired face, in model units.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    distance1 = 0.1;
    /**
     * How far the bevel reaches from each edge on the other face, in model units.
     * @default 0.2
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    distance2 = 0.2;
}
/**
 * A shape, some of its edges, one face, distance and angle per edge for
 * `fillets.chamferEdgesDistsAngles`; all the lists pair up by position.
 */
export class ChamferEdgesDistsAnglesDto<T, U, F> {
    constructor(shape?: T, edges?: U[], faces?: F[], distances?: number[], angles?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (faces !== undefined) { this.faces = faces; }
        if (distances !== undefined) { this.distances = distances; }
        if (angles !== undefined) { this.angles = angles; }
    }
    /**
     * The shape the edges belong to.
     * @default undefined
     */
    shape!: T;
    /**
     * The edges to bevel.
     * @default undefined
     */
    edges!: U[];
    /**
     * One face per edge, meeting it; the distance is measured on that face and the angle from it.
     * @default undefined
     */
    faces!: F[];
    /**
     * One distance per edge, in model units, measured on the paired face.
     * @default undefined
     */
    distances!: number[];
    /**
     * One bevel angle per edge, in degrees, measured from the paired face.
     * @default undefined
     */
    angles!: number[];
}

/**
 * A shape, some of its edges, one face per edge and a shared distance and angle for
 * `fillets.chamferEdgesDistAngle`; `faces` pairs with `edges` by position.
 */
export class ChamferEdgesDistAngleDto<T, U, F> {
    constructor(shape?: T, edges?: U[], faces?: F[], distance?: number, angle?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (faces !== undefined) { this.faces = faces; }
        if (distance !== undefined) { this.distance = distance; }
        if (angle !== undefined) { this.angle = angle; }
    }
    /**
     * The shape the edges belong to.
     * @default undefined
     */
    shape!: T;
    /**
     * The edges to bevel.
     * @default undefined
     */
    edges!: U[];
    /**
     * One face per edge, meeting it; the distance is measured on that face and the angle from it.
     * @default undefined
     */
    faces!: F[];
    /**
     * How far from each edge the bevel starts on its paired face, in model units.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    distance = 0.1;
    /**
     * The slope of the bevels away from the paired faces, in degrees; 45 gives an even chamfer.
     * @default 45
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    angle = 45;
}
