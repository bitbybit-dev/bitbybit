// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.

/**
 * A face and a grid of divisions for `shapes.face.subdivideToPoints`, `subdivideToNormals` and
 * `subdivideToUV`; the U and V counts set the grid, the shift and removal flags adjust its rows.
 */
export class FaceSubdivisionDto<T> {
    /**
      * Provide options without default values
      */
    constructor(shape?: T, nrDivisionsU?: number, nrDivisionsV?: number, shiftHalfStepU?: boolean, removeStartEdgeU?: boolean, removeEndEdgeU?: boolean, shiftHalfStepV?: boolean, removeStartEdgeV?: boolean, removeEndEdgeV?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (nrDivisionsU !== undefined) { this.nrDivisionsU = nrDivisionsU; }
        if (nrDivisionsV !== undefined) { this.nrDivisionsV = nrDivisionsV; }
        if (shiftHalfStepU !== undefined) { this.shiftHalfStepU = shiftHalfStepU; }
        if (removeStartEdgeU !== undefined) { this.removeStartEdgeU = removeStartEdgeU; }
        if (removeEndEdgeU !== undefined) { this.removeEndEdgeU = removeEndEdgeU; }
        if (shiftHalfStepV !== undefined) { this.shiftHalfStepV = shiftHalfStepV; }
        if (removeStartEdgeV !== undefined) { this.removeStartEdgeV = removeStartEdgeV; }
        if (removeEndEdgeV !== undefined) { this.removeEndEdgeV = removeEndEdgeV; }
    }

    /**
     * The face to lay the grid over.
     * @default undefined
     */
    shape!: T;
    /**
     * How many rows of points across the U range, edge to edge.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrDivisionsU = 10;
    /**
     * How many points along each row across the V range, edge to edge.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrDivisionsV = 10;
    /**
     * When true, every point moves half a step in U; on a closed face such as a cylinder this keeps
     * points off the seam.
     * @default false
     */
    shiftHalfStepU = false;
    /**
     * When true, the row at the start of the U range is left out.
     * @default false
     */
    removeStartEdgeU = false;
    /**
     * When true, the row at the end of the U range is left out.
     * @default false
     */
    removeEndEdgeU = false;
    /**
     * When true, every point moves half a step in V; on a closed face such as a cylinder this keeps
     * points off the seam.
     * @default false
     */
    shiftHalfStepV = false;
    /**
     * When true, the points at the start of the V range are left out of every row.
     * @default false
     */
    removeStartEdgeV = false;
    /**
     * When true, the points at the end of the V range are left out of every row.
     * @default false
     */
    removeEndEdgeV = false;
}

/**
 * A face and a number of divisions for `shapes.face.subdivideToWires`, which draws evenly spaced
 * wires across the face in one parameter direction.
 */
export class FaceSubdivisionToWiresDto<T> {
    /**
      * Provide options without default values
      */
    constructor(shape?: T, nrDivisions?: number, isU?: boolean, shiftHalfStep?: boolean, removeStart?: boolean, removeEnd?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (nrDivisions !== undefined) { this.nrDivisions = nrDivisions; }
        if (isU !== undefined) { this.isU = isU; }
        if (shiftHalfStep !== undefined) { this.shiftHalfStep = shiftHalfStep; }
        if (removeStart !== undefined) { this.removeStart = removeStart; }
        if (removeEnd !== undefined) { this.removeEnd = removeEnd; }
    }

    /**
     * The face to draw the wires on.
     * @default undefined
     */
    shape!: T;
    /**
     * How many steps to divide the range into; one more wire than that is drawn, the two boundary
     * lines included.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrDivisions = 10;
    /**
     * When true each wire sits at a fixed U and runs across the V range; when false the roles swap.
     * @default true
     */
    isU = true;
    /**
     * When true, every wire moves half a step along the divided direction.
     * @default false
     */
    shiftHalfStep = false;
    /**
     * When true, the wire on the start boundary is left out.
     * @default false
     */
    removeStart = false;
    /**
     * When true, the wire on the end boundary is left out.
     * @default false
     */
    removeEnd = false;
}
/**
 * A face, a grid of cells and optional patterns for `shapes.face.subdivideToRectangleWires`, which
 * draws one rectangle wire per cell of the face's UV range. The patterns are read cell by cell and
 * repeat when they run out.
 */
export class FaceSubdivideToRectangleWiresDto<T> {
    /**
      * Provide options without default values
      */
    constructor(shape?: T, nrRectanglesU?: number, nrRectanglesV?: number, scalePatternU?: number[], scalePatternV?: number[], filletPattern?: number[], inclusionPattern?: boolean[], offsetFromBorderU?: number, offsetFromBorderV?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (nrRectanglesU !== undefined) { this.nrRectanglesU = nrRectanglesU; }
        if (nrRectanglesV !== undefined) { this.nrRectanglesU = nrRectanglesV; }
        if (scalePatternU !== undefined) { this.scalePatternU = scalePatternU; }
        if (scalePatternV !== undefined) { this.scalePatternV = scalePatternV; }
        if (filletPattern !== undefined) { this.filletPattern = filletPattern; }
        if (inclusionPattern !== undefined) { this.inclusionPattern = inclusionPattern; }
        if (offsetFromBorderU !== undefined) { this.offsetFromBorderU = offsetFromBorderU; }
        if (offsetFromBorderV !== undefined) { this.offsetFromBorderV = offsetFromBorderV; }
    }
    /**
     * The face to draw the rectangles on.
     * @default undefined
     */
    shape!: T;
    /**
     * How many cells across the U range.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrRectanglesU = 10;
    /**
     * How many cells across the V range.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrRectanglesV = 10;
    /**
     * Sizes of the rectangles along U as fractions of their cell, from 0 to 1, applied in turn; 1
     * fills the cell, and leaving the list out means no scaling.
     * @default undefined
     * @optional true
     */
    scalePatternU!: number[];
    /**
     * Sizes of the rectangles along V as fractions of their cell, from 0 to 1, applied in turn; 1
     * fills the cell, and leaving the list out means no scaling.
     * @default undefined
     * @optional true
     */
    scalePatternV!: number[];
    /**
     * Corner rounding of the rectangles as fractions from 0 to 1 of half the shorter side, applied
     * in turn; 0 leaves sharp corners.
     * @default undefined
     * @optional true
     */
    filletPattern!: number[];
    /**
     * Which cells get a rectangle, applied in turn: true draws one, false skips the cell.
     * @default undefined
     * @optional true
     */
    inclusionPattern!: boolean[];
    /**
     * A fraction of the U range trimmed at each end before dividing into cells, so the pattern
     * keeps clear of the border; keep it below 0.5.
     * @default 0
     * @minimum 0
     * @maximum 0.5
     * @step 0.01
     */
    offsetFromBorderU = 0;
    /**
     * A fraction of the V range trimmed at each end before dividing into cells, so the pattern
     * keeps clear of the border; keep it below 0.5.
     * @default 0
     * @minimum 0
     * @maximum 0.5
     * @step 0.01
     */
    offsetFromBorderV = 0;
}
/**
 * A face, hexagon counts and optional patterns for `shapes.face.subdivideToHexagonWires`, which
 * lays a honeycomb of hexagon wires over the face's UV range. The patterns are read hexagon by
 * hexagon and repeat when they run out.
 */
export class FaceSubdivideToHexagonWiresDto<T> {
    /**
      * Provide options without default values
      */
    constructor(shape?: T, nrHexagonsU?: number, nrHexagonsV?: number, flatU?: boolean, scalePatternU?: number[], scalePatternV?: number[], filletPattern?: number[], inclusionPattern?: boolean[], offsetFromBorderU?: number, offsetFromBorderV?: number, extendUUp?: boolean, extendUBottom?: boolean, extendVUp?: boolean, extendVBottom?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (nrHexagonsU !== undefined) { this.nrHexagonsU = nrHexagonsU; }
        if (nrHexagonsV !== undefined) { this.nrHexagonsU = nrHexagonsV; }
        if (flatU !== undefined) { this.flatU = flatU; }
        if (scalePatternU !== undefined) { this.scalePatternU = scalePatternU; }
        if (scalePatternV !== undefined) { this.scalePatternV = scalePatternV; }
        if (filletPattern !== undefined) { this.filletPattern = filletPattern; }
        if (inclusionPattern !== undefined) { this.inclusionPattern = inclusionPattern; }
        if (offsetFromBorderU !== undefined) { this.offsetFromBorderU = offsetFromBorderU; }
        if (offsetFromBorderV !== undefined) { this.offsetFromBorderV = offsetFromBorderV; }
        if (extendUUp !== undefined) { this.extendUUp = extendUUp; }
        if (extendUBottom !== undefined) { this.extendUBottom = extendUBottom; }
        if (extendVUp !== undefined) { this.extendVUp = extendVUp; }
        if (extendVBottom !== undefined) { this.extendVBottom = extendVBottom; }
    }
    /**
     * The face to draw the hexagons on.
     * @default undefined
     */
    shape!: T;
    /**
     * How many hexagons across the U range.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrHexagonsU?: number | undefined = 10;
    /**
     * How many hexagons across the V range.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrHexagonsV?: number | undefined = 10;
    // /**
    //  * If true, we will create hexagons with flat tops on U direction
    //  * @default false
    //  */
    /**
     * When true, the hexagons turn a flat side toward the U direction; when false a corner points
     * that way.
     */
    flatU = false;
    /**
     * Sizes of the hexagons along U as fractions of their full size, applied in turn about each
     * hexagon's center; 1 or no list means no scaling.
     * @default undefined
     * @optional true
     */
    scalePatternU?: number[] | undefined;
    /**
     * Sizes of the hexagons along V as fractions of their full size, applied in turn about each
     * hexagon's center; 1 or no list means no scaling.
     * @default undefined
     * @optional true
     */
    scalePatternV?: number[] | undefined;
    /**
     * Corner rounding of the hexagons as fractions from 0 to 1 of the largest radius that fits,
     * applied in turn; 0 leaves sharp corners.
     * @default undefined
     * @optional true
     */
    filletPattern?: number[] | undefined;
    /**
     * Which hexagons are drawn, applied in turn: true draws one, false skips it.
     * @default undefined
     * @optional true
     */
    inclusionPattern?: boolean[] | undefined;
    /**
     * A fraction of the U range trimmed at each end before laying the grid, so the pattern keeps
     * clear of the border; keep it below 0.5.
     * @default 0
     * @minimum 0
     * @maximum 0.5
     * @step 0.01
     */
    offsetFromBorderU?: number | undefined = 0;
    /**
     * A fraction of the V range trimmed at each end before laying the grid, so the pattern keeps
     * clear of the border; keep it below 0.5.
     * @default 0
     * @minimum 0
     * @maximum 0.5
     * @step 0.01
     */
    offsetFromBorderV?: number | undefined = 0;
    /**
     * When true, the grid is stretched so the hexagons at the high end of U reach past that border,
     * covering it without a jagged edge.
     * @default false
     */
    extendUUp?: boolean | undefined = false;
    /**
     * When true, the grid is stretched so the hexagons at the low end of U reach past that border,
     * covering it without a jagged edge.
     * @default false
     */
    extendUBottom?: boolean | undefined = false;
    /**
     * When true, the grid is stretched so the hexagons at the high end of V reach past that border,
     * covering it without a jagged edge.
     * @default false
     */
    extendVUp?: boolean | undefined = false;
    /**
     * When true, the grid is stretched so the hexagons at the low end of V reach past that border,
     * covering it without a jagged edge.
     * @default false
     */
    extendVBottom?: boolean | undefined = false;
}

/**
 * A face, hexagon counts and optional patterns for `shapes.face.subdivideToHexagonHoles`, which
 * cuts a honeycomb of hexagonal holes into the face. Without a scale pattern each hole is half the
 * size of its hexagon.
 */
export class FaceSubdivideToHexagonHolesDto<T> {
    /**
      * Provide options without default values
      */
    constructor(shape?: T, nrHexagonsU?: number, nrHexagonsV?: number, flatU?: boolean, holesToFaces?: boolean, scalePatternU?: number[], scalePatternV?: number[], filletPattern?: number[], inclusionPattern?: boolean[], offsetFromBorderU?: number, offsetFromBorderV?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (nrHexagonsU !== undefined) { this.nrHexagonsU = nrHexagonsU; }
        if (nrHexagonsV !== undefined) { this.nrHexagonsU = nrHexagonsV; }
        if (flatU !== undefined) { this.flatU = flatU; }
        if (holesToFaces !== undefined) { this.holesToFaces = holesToFaces; }
        if (scalePatternU !== undefined) { this.scalePatternU = scalePatternU; }
        if (scalePatternV !== undefined) { this.scalePatternV = scalePatternV; }
        if (filletPattern !== undefined) { this.filletPattern = filletPattern; }
        if (inclusionPattern !== undefined) { this.inclusionPattern = inclusionPattern; }
        if (offsetFromBorderU !== undefined) { this.offsetFromBorderU = offsetFromBorderU; }
        if (offsetFromBorderV !== undefined) { this.offsetFromBorderV = offsetFromBorderV; }
    }
    /**
     * The face to cut the holes into.
     * @default undefined
     */
    shape!: T;
    /**
     * How many hexagons across the U range.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrHexagonsU?: number | undefined = 10;
    /**
     * How many hexagons across the V range.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrHexagonsV?: number | undefined = 10;
    // /**
    //  * If true, we will create hexagons with flat tops on U direction
    //  * @default false
    //  */
    /**
     * When true, the hexagons turn a flat side toward the U direction; when false a corner points
     * that way.
     */
    flatU = false;
    /**
     * When true, the result also carries one face per hole after the perforated face.
     * @default false
     */
    holesToFaces?: boolean | undefined = false;
    /**
     * Sizes of the holes along U as fractions of their hexagon, applied in turn; leaving the list
     * out uses 0.5.
     * @default undefined
     * @optional true
     */
    scalePatternU?: number[] | undefined;
    /**
     * Sizes of the holes along V as fractions of their hexagon, applied in turn; leaving the list
     * out uses 0.5.
     * @default undefined
     * @optional true
     */
    scalePatternV?: number[] | undefined;
    /**
     * Corner rounding of the holes as fractions from 0 to 1 of the largest radius that fits,
     * applied in turn; 0 leaves sharp corners.
     * @default undefined
     * @optional true
     */
    filletPattern?: number[] | undefined;
    /**
     * Which hexagons become holes, applied in turn: true cuts one, false leaves the face whole
     * there.
     * @default undefined
     * @optional true
     */
    inclusionPattern?: boolean[] | undefined;
    /**
     * A fraction of the U range trimmed at each end before laying the grid, so the holes keep clear
     * of the border; keep it below 0.5.
     * @default 0
     * @minimum 0
     * @maximum 0.5
     * @step 0.01
     */
    offsetFromBorderU?: number | undefined = 0;
    /**
     * A fraction of the V range trimmed at each end before laying the grid, so the holes keep clear
     * of the border; keep it below 0.5.
     * @default 0
     * @minimum 0
     * @maximum 0.5
     * @step 0.01
     */
    offsetFromBorderV?: number | undefined = 0;
}

/**
 * A face, a grid of cells and optional patterns for `shapes.face.subdivideToRectangleHoles`, which
 * cuts a grid of rectangular holes into the face. Without a scale pattern each hole covers half its
 * cell.
 */
export class FaceSubdivideToRectangleHolesDto<T> {
    /**
      * Provide options without default values
      */
    constructor(shape?: T, nrRectanglesU?: number, nrRectanglesV?: number, scalePatternU?: number[], scalePatternV?: number[], filletPattern?: number[], inclusionPattern?: boolean[], holesToFaces?: boolean, offsetFromBorderU?: number, offsetFromBorderV?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (nrRectanglesU !== undefined) { this.nrRectanglesU = nrRectanglesU; }
        if (nrRectanglesV !== undefined) { this.nrRectanglesU = nrRectanglesV; }
        if (scalePatternU !== undefined) { this.scalePatternU = scalePatternU; }
        if (scalePatternV !== undefined) { this.scalePatternV = scalePatternV; }
        if (filletPattern !== undefined) { this.filletPattern = filletPattern; }
        if (inclusionPattern !== undefined) { this.inclusionPattern = inclusionPattern; }
        if (holesToFaces !== undefined) { this.holesToFaces = holesToFaces; }
        if (offsetFromBorderU !== undefined) { this.offsetFromBorderU = offsetFromBorderU; }
        if (offsetFromBorderV !== undefined) { this.offsetFromBorderV = offsetFromBorderV; }
    }
    /**
     * The face to cut the holes into.
     * @default undefined
     */
    shape!: T;
    /**
     * How many cells across the U range.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrRectanglesU = 10;
    /**
     * How many cells across the V range.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrRectanglesV = 10;
    /**
     * Sizes of the holes along U as fractions of their cell, applied in turn; leaving the list out
     * uses 0.5.
     * @default undefined
     * @optional true
     */
    scalePatternU!: number[];
    /**
     * Sizes of the holes along V as fractions of their cell, applied in turn; leaving the list out
     * uses 0.5.
     * @default undefined
     * @optional true
     */
    scalePatternV!: number[];
    /**
     * Corner rounding of the holes as fractions from 0 to 1 of half the shorter side, applied in
     * turn; 0 leaves sharp corners.
     * @default undefined
     * @optional true
     */
    filletPattern!: number[];
    /**
     * Which cells become holes, applied in turn: true cuts one, false leaves the face whole there.
     * @default undefined
     * @optional true
     */
    inclusionPattern!: boolean[];
    /**
     * When true, the result also carries one face per hole after the perforated face.
     * @default false
     */
    holesToFaces = false;
    /**
     * A fraction of the U range trimmed at each end before dividing into cells, so the holes keep
     * clear of the border; keep it below 0.5.
     * @default 0
     * @minimum 0
     * @maximum 0.5
     * @step 0.01
     */
    offsetFromBorderU = 0;
    /**
     * A fraction of the V range trimmed at each end before dividing into cells, so the holes keep
     * clear of the border; keep it below 0.5.
     * @default 0
     * @minimum 0
     * @maximum 0.5
     * @step 0.01
     */
    offsetFromBorderV = 0;
}
/**
 * A face, a grid of divisions and nth-row rules for `shapes.face.subdivideToPointsControlled`,
 * which shifts or removes points on every nth row instead of all of them. Each rule pairs an `Nth`
 * count with an `OffsetN` start; 0 switches it off.
 */
export class FaceSubdivisionControlledDto<T> {
    /**
     * Provide options without default values
     */
    constructor(shape?: T, nrDivisionsU?: number, nrDivisionsV?: number, shiftHalfStepNthU?: number, shiftHalfStepUOffsetN?: number, removeStartEdgeNthU?: number, removeStartEdgeUOffsetN?: number, removeEndEdgeNthU?: number, removeEndEdgeUOffsetN?: number, shiftHalfStepNthV?: number, shiftHalfStepVOffsetN?: number, removeStartEdgeNthV?: number, removeStartEdgeVOffsetN?: number, removeEndEdgeNthV?: number, removeEndEdgeVOffsetN?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (nrDivisionsU !== undefined) { this.nrDivisionsU = nrDivisionsU; }
        if (nrDivisionsV !== undefined) { this.nrDivisionsV = nrDivisionsV; }
        if (shiftHalfStepNthU !== undefined) { this.shiftHalfStepNthU = shiftHalfStepNthU; }
        if (shiftHalfStepUOffsetN !== undefined) { this.shiftHalfStepUOffsetN = shiftHalfStepUOffsetN; }
        if (removeStartEdgeNthU !== undefined) { this.removeStartEdgeNthU = removeStartEdgeNthU; }
        if (removeStartEdgeUOffsetN !== undefined) { this.removeStartEdgeUOffsetN = removeStartEdgeUOffsetN; }
        if (removeEndEdgeNthU !== undefined) { this.removeEndEdgeNthU = removeEndEdgeNthU; }
        if (removeEndEdgeUOffsetN !== undefined) { this.removeEndEdgeUOffsetN = removeEndEdgeUOffsetN; }
        if (shiftHalfStepNthV !== undefined) { this.shiftHalfStepNthV = shiftHalfStepNthV; }
        if (shiftHalfStepVOffsetN !== undefined) { this.shiftHalfStepVOffsetN = shiftHalfStepVOffsetN; }
        if (removeStartEdgeNthV !== undefined) { this.removeStartEdgeNthV = removeStartEdgeNthV; }
        if (removeStartEdgeVOffsetN !== undefined) { this.removeStartEdgeVOffsetN = removeStartEdgeVOffsetN; }
        if (removeEndEdgeNthV !== undefined) { this.removeEndEdgeNthV = removeEndEdgeNthV; }
        if (removeEndEdgeVOffsetN !== undefined) { this.removeEndEdgeVOffsetN = removeEndEdgeVOffsetN; }
    }
    /**
     * The face to lay the grid over.
     * @default undefined
     */
    shape!: T;
    /**
     * How many rows of points across the U range, edge to edge.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrDivisionsU = 10;
    /**
     * How many points along each row across the V range, edge to edge.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrDivisionsV = 10;
    /**
     * Every how-manyth V row is pushed half a step in U; 0 shifts none.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    shiftHalfStepNthU = 0;
    /**
     * Which V row the counting for the U shift starts at.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    shiftHalfStepUOffsetN = 0;
    /**
     * Every how-manyth point is dropped from the first U row; 0 keeps them all.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    removeStartEdgeNthU = 0;
    /**
     * Which point the counting for the first U row removal starts at.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    removeStartEdgeUOffsetN = 0;
    /**
     * Every how-manyth point is dropped from the last U row; 0 keeps them all.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    removeEndEdgeNthU = 0;
    /**
     * Which point the counting for the last U row removal starts at.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    removeEndEdgeUOffsetN = 0;
    /**
     * Every how-manyth U row is pushed half a step in V; 0 shifts none.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    shiftHalfStepNthV = 0;
    /**
     * Which U row the counting for the V shift starts at.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    shiftHalfStepVOffsetN = 0;
    /**
     * Every how-manyth point is dropped from the first V row; 0 keeps them all.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    removeStartEdgeNthV = 0;
    /**
     * Which point the counting for the first V row removal starts at.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    removeStartEdgeVOffsetN = 0;
    /**
     * Every how-manyth point is dropped from the last V row; 0 keeps them all.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    removeEndEdgeNthV = 0;
    /**
     * Which point the counting for the last V row removal starts at.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    removeEndEdgeVOffsetN = 0;
}
/**
 * A face and one line across its UV range for `shapes.face.subdivideToPointsOnParam` and
 * `subdivideToUVOnParam`: the line sits at `param` in one direction and `nrPoints` points spread
 * over the other.
 */
export class FaceLinearSubdivisionDto<T> {
    /**
     * Provide options without default values
     */
    constructor(shape?: T, isU?: boolean, param?: number, nrPoints?: number, shiftHalfStep?: boolean, removeStartPoint?: boolean, removeEndPoint?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (isU !== undefined) { this.isU = isU; }
        if (param !== undefined) { this.param = param; }
        if (nrPoints !== undefined) { this.nrPoints = nrPoints; }
        if (shiftHalfStep !== undefined) { this.shiftHalfStep = shiftHalfStep; }
        if (removeStartPoint !== undefined) { this.removeStartPoint = removeStartPoint; }
        if (removeEndPoint !== undefined) { this.removeEndPoint = removeEndPoint; }
    }
    /**
     * The face to place the points on.
     * @default undefined
     */
    shape!: T;
    /**
     * When true the line sits at a fixed U and the points spread across the V range; when false the
     * roles swap.
     * @default true
     */
    isU = true;
    /**
     * Where the line sits, as a fraction from 0 to 1 of the fixed direction's range.
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    param = 0.5;
    /**
     * How many points along the line, edge to edge.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrPoints = 10;
    /**
     * When true, every point moves half a step along the line; on a closed face this keeps points
     * off the seam.
     * @default false
     */
    shiftHalfStep = false;
    /**
     * When true, the first point is left out.
     * @default false
     */
    removeStartPoint = false;
    /**
     * When true, the last point is left out.
     * @default false
     */
    removeEndPoint = false;
}
