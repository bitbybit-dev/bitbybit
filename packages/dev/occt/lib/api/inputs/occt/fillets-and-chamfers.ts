// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";

export class FilletDto<T> {
    constructor(shape?: T, radius?: number, radiusList?: number[], indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (radius !== undefined) { this.radius = radius; }
        if (radiusList !== undefined) { this.radiusList = radiusList; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * Shape to apply the fillets
     * @default undefined
     */
    shape!: T;
    /**
     * Radius of the fillets
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     * @optional true
     */
    radius?: number | undefined = 0.1;
    /**
     * Radius list
     * @default undefined
     * @optional true
     */
    radiusList?: number[] | undefined;
    /**
     * List of edge indexes to which apply the fillet, if left empty all edges will be rounded
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
export class FilletShapesDto<T> {
    constructor(shapes?: T[], radius?: number, radiusList?: number[], indexes?: number[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (radius !== undefined) { this.radius = radius; }
        if (radiusList !== undefined) { this.radiusList = radiusList; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * Shapes to apply the fillets
     * @default undefined
     */
    shapes!: T[];
    /**
     * Radius of the fillets
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     * @optional true
     */
    radius?: number | undefined = 0.1;
    /**
     * Radius list
     * @default undefined
     * @optional true
     */
    radiusList?: number[] | undefined;
    /**
     * List of edge indexes to which apply the fillet, if left empty all edges will be rounded
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
export class FilletEdgesListDto<T, U> {
    constructor(shape?: T, edges?: U[], radiusList?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (radiusList !== undefined) { this.radiusList = radiusList; }
    }
    /**
     * Shape to apply the fillet
     * @default undefined
     */
    shape!: T;
    /**
     * Edges to use for the fillet
     * @default undefined
     */
    edges!: U[];
    /**
     * Radius list for the fillets. The length of this array must match the length of the edges array. Each index corresponds to fillet on the edge at the same index.
     * @default undefined
     */
    radiusList!: number[];
}
export class FilletEdgesListOneRadiusDto<T, U> {
    constructor(shape?: T, edges?: U[], radius?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (radius !== undefined) { this.radius = radius; }
    }
    /**
     * Shape to apply the fillet
     * @default undefined
     */
    shape!: T;
    /**
     * Edges to use for the fillet
     * @default undefined
     */
    edges!: U[];
    /**
     * Radius of the fillets
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     * @optional true
     */
    radius = 0.1;
}
export class FilletEdgeVariableRadiusDto<T, U> {
    constructor(shape?: T, edge?: U, radiusList?: number[], paramsU?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (edge !== undefined) { this.edge = edge; }
        if (radiusList !== undefined) { this.radiusList = radiusList; }
        if (paramsU !== undefined) { this.paramsU = paramsU; }
    }
    /**
     * Shape to apply the fillet
     * @default undefined
     */
    shape!: T;
    /**
     * Edge to use for the fillet
     * @default undefined
     */
    edge!: U;
    /**
     * Radius list for the fillets that has to match the paramsU list
     * @default undefined
     */
    radiusList!: number[];
    /**
     * List of parameters on the edge to which apply the fillet. Each param must be between 0 and 1.
     * @default undefined
     */
    paramsU!: number[];
}
export class FilletEdgesVariableRadiusDto<T, U> {
    constructor(shape?: T, edges?: U[], radiusLists?: number[][], paramsULists?: number[][]) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (radiusLists !== undefined) { this.radiusLists = radiusLists; }
        if (paramsULists !== undefined) { this.paramsULists = paramsULists; }
    }
    /**
     * Shape to apply the fillet
     * @default undefined
     */
    shape!: T;
    /**
     * Edges to use for the fillet
     * @default undefined
     */
    edges!: U[];
    /**
     * Lists of radius lists for the fillets. Top level array length needs to match the nr of edges used and each second level array needs to match paramsU length array at the same index.
     * @default undefined
     */
    radiusLists!: number[][];
    /**
     * Lists of parameter lists on the edges to which apply the fillet. Each param must be between 0 and 1. Top level array length needs to match the nr of edges used and each second level array needs to match radius length array at the same index.
     * @default undefined
     */
    paramsULists!: number[][];
}
export class FilletEdgesSameVariableRadiusDto<T, U> {
    constructor(shape?: T, edges?: U[], radiusList?: number[], paramsU?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (radiusList !== undefined) { this.radiusList = radiusList; }
        if (paramsU !== undefined) { this.paramsU = paramsU; }
    }
    /**
     * Shape to apply the fillet
     * @default undefined
     */
    shape!: T;
    /**
     * Edges to use for the fillet
     * @default undefined
     */
    edges!: U[];

    /**
     * Radius list for the fillets that has to match the paramsU list
     * @default undefined
     */
    radiusList!: number[];
    /**
     * List of parameters on the edges to which apply the fillet. Each param must be between 0 and 1.
     * @default undefined
     */
    paramsU!: number[];
}

export class Fillet3DWiresDto<T> {
    constructor(shapes?: T[], radius?: number, direction?: Base.Vector3, radiusList?: number[], indexes?: number[],) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (radius !== undefined) { this.radius = radius; }
        if (direction !== undefined) { this.direction = direction; }
        if (radiusList !== undefined) { this.radiusList = radiusList; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * Shapes to apply the fillets on
     * @default undefined
     */
    shapes!: T[];
    /**
     * Radius of the fillets
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     * @optional true
     */
    radius?: number | undefined = 0.1;
    /**
     * Radius list
     * @default undefined
     * @optional true
     */
    radiusList?: number[] | undefined;
    /**
     * List of edge indexes to which apply the fillet, if left empty all edges will be rounded
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
    /**
     * Orientation direction for the fillet
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
export class Fillet3DWireDto<T> {
    constructor(shape?: T, radius?: number, direction?: Base.Vector3, radiusList?: number[], indexes?: number[],) {
        if (shape !== undefined) { this.shape = shape; }
        if (radius !== undefined) { this.radius = radius; }
        if (direction !== undefined) { this.direction = direction; }
        if (radiusList !== undefined) { this.radiusList = radiusList; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * Shape to apply the fillets
     * @default undefined
     */
    shape!: T;
    /**
     * Radius of the fillets
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     * @optional true
     */
    radius?: number | undefined = 0.1;
    /**
     * Radius list
     * @default undefined
     * @optional true
     */
    radiusList?: number[] | undefined;
    /**
     * List of edge indexes to which apply the fillet, if left empty all edges will be rounded
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
    /**
     * Orientation direction for the fillet
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
export class ChamferDto<T> {
    constructor(shape?: T, distance?: number, distanceList?: number[], indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (distance !== undefined) { this.distance = distance; }
        if (distanceList !== undefined) { this.distanceList = distanceList; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * Shape to apply the chamfer
     * @default undefined
     */
    shape!: T;
    /**
     * Distance for the chamfer
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @optional true
     * @step 0.1
     */
    distance?: number | undefined = 0.1;
    /**
     * Distance for the chamfer
     * @default undefined
     * @optional true
     */
    distanceList?: number[] | undefined;
    /**
     * List of edge indexes to which apply the chamfer, if left empty all edges will be chamfered
     * @default undefined
     * @optional true
     */
    indexes?: number[] | undefined;
}
export class ChamferEdgesListDto<T, U> {
    constructor(shape?: T, edges?: U[], distanceList?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (distanceList !== undefined) { this.distanceList = distanceList; }
    }
    /**
     * Shape to apply the chamfer
     * @default undefined
     */
    shape!: T;
    /**
     * Edges to apply the chamfer to
     * @default undefined
     */
    edges!: U[];
    /**
     * Distance for the chamfer
     * @default undefined
     */
    distanceList!: number[];
}
export class ChamferEdgeDistAngleDto<T, U, F> {
    constructor(shape?: T, edge?: U, face?: F, distance?: number, angle?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (edge !== undefined) { this.edge = edge; }
        if (face !== undefined) { this.face = face; }
        if (distance !== undefined) { this.distance = distance; }
        if (angle !== undefined) { this.angle = angle; }
    }
    /**
     * Shape to apply the chamfer
     * @default undefined
     */
    shape!: T;
    /**
     * Edge to apply the chamfer to
     * @default undefined
     */
    edge!: U;
    /**
     * Face from which to apply the angle
     * @default undefined
     */
    face!: F;
    /**
     * Distance for the chamfer
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    distance = 0.1;
    /**
     * Angle for the chamfer
     * @default 45
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    angle = 45;
}

export class ChamferEdgeTwoDistancesDto<T, U, F> {
    constructor(shape?: T, edge?: U, face?: F, distance1?: number, distance2?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (edge !== undefined) { this.edge = edge; }
        if (face !== undefined) { this.face = face; }
        if (distance1 !== undefined) { this.distance1 = distance1; }
        if (distance2 !== undefined) { this.distance2 = distance2; }
    }
    /**
     * Shape to apply the chamfer
     * @default undefined
     */
    shape!: T;
    /**
     * Edge to apply the chamfer to
     * @default undefined
     */
    edge!: U;
    /**
     * Face from which to apply the first distance
     * @default undefined
     */
    face!: F;
    /**
     * First distance from the face for the chamfer
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    distance1 = 0.1;
    /**
     * Second distance for the chamfer
     * @default 0.2
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    distance2 = 0.2;
}
export class ChamferEdgesTwoDistancesListsDto<T, U, F> {
    constructor(shape?: T, edges?: U[], faces?: F[], distances1?: number[], distances2?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (faces !== undefined) { this.faces = faces; }
        if (distances1 !== undefined) { this.distances1 = distances1; }
        if (distances2 !== undefined) { this.distances2 = distances2; }
    }
    /**
     * Shape to apply the chamfer
     * @default undefined
     */
    shape!: T;
    /**
     * Edges to apply the chamfers to
     * @default undefined
     */
    edges!: U[];
    /**
     * Faces from which to apply the angle of the chamfers
     * @default undefined
     */
    faces!: F[];
    /**
     * Distance 1 list for the chamfers
     * @default undefined
     */
    distances1!: number[];
    /**
     * Distance 2 list for the chamfers
     * @default undefined
     */
    distances2!: number[];
}
export class ChamferEdgesTwoDistancesDto<T, U, F> {
    constructor(shape?: T, edges?: U[], faces?: F[], distance1?: number, distance2?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (faces !== undefined) { this.faces = faces; }
        if (distance1 !== undefined) { this.distance1 = distance1; }
        if (distance2 !== undefined) { this.distance2 = distance2; }
    }
    /**
     * Shape to apply the chamfer
     * @default undefined
     */
    shape!: T;
    /**
     * Edges to apply the chamfers to
     * @default undefined
     */
    edges!: U[];
    /**
     * Faces from which to apply the angle of the chamfers
     * @default undefined
     */
    faces!: F[];
    /**
     * First distance from the face for the chamfer
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    distance1 = 0.1;
    /**
     * Second distance for the chamfer
     * @default 0.2
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    distance2 = 0.2;
}
export class ChamferEdgesDistsAnglesDto<T, U, F> {
    constructor(shape?: T, edges?: U[], faces?: F[], distances?: number[], angles?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (faces !== undefined) { this.faces = faces; }
        if (distances !== undefined) { this.distances = distances; }
        if (angles !== undefined) { this.angles = angles; }
    }
    /**
     * Shape to apply the chamfer
     * @default undefined
     */
    shape!: T;
    /**
     * Edges to apply the chamfers to
     * @default undefined
     */
    edges!: U[];
    /**
     * Faces from which to apply the angle of the chamfers
     * @default undefined
     */
    faces!: F[];
    /**
     * Distance list for the chamfers
     * @default undefined
     */
    distances!: number[];
    /**
     * Angles for the chamfers
     * @default undefined
     */
    angles!: number[];
}

export class ChamferEdgesDistAngleDto<T, U, F> {
    constructor(shape?: T, edges?: U[], faces?: F[], distance?: number, angle?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (edges !== undefined) { this.edges = edges; }
        if (faces !== undefined) { this.faces = faces; }
        if (distance !== undefined) { this.distance = distance; }
        if (angle !== undefined) { this.angle = angle; }
    }
    /**
     * Shape to apply the chamfer
     * @default undefined
     */
    shape!: T;
    /**
     * Edges to apply the chamfers to
     * @default undefined
     */
    edges!: U[];
    /**
     * Faces from which to apply the angle of the chamfers
     * @default undefined
     */
    faces!: F[];
    /**
     * Distance from the face
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    distance = 0.1;
    /**
     * Angle for the chamfers
     * @default 45
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    angle = 45;
}
