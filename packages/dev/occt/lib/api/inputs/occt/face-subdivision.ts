// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.

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
     * Brep OpenCascade geometry
     * @default undefined
     */
    shape!: T;
    /**
     * Number of points that will be added on U direction
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrDivisionsU = 10;
    /**
     * Number  of points that will be added on V direction
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrDivisionsV = 10;
    /**
     * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
     * @default false
     */
    shiftHalfStepU = false;
    /**
     * Removes start edge points on U
     * @default false
     */
    removeStartEdgeU = false;
    /**
     * Removes end edge points on U 
     * @default false
     */
    removeEndEdgeU = false;
    /**
     * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
     * @default false
     */
    shiftHalfStepV = false;
    /**
     * Removes start edge points on V
     * @default false
     */
    removeStartEdgeV = false;
    /**
     * Removes end edge points on V 
     * @default false
     */
    removeEndEdgeV = false;
}

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
     * Openascade Face
     * @default undefined
     */
    shape!: T;
    /**
     * Number of points that will be added on U direction
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrDivisions = 10;
    /**
    * Linear subdivision direction true - U, false - V
    * @default true
    */
    isU = true;
    /**
     * Sometimes you want to shift your wires half way the step distance, especially on periodic surfaces
     * @default false
     */
    shiftHalfStep = false;
    /**
     * Removes start wire
     * @default false
     */
    removeStart = false;
    /**
     * Removes end wire
     * @default false
     */
    removeEnd = false;
}
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
     * Openascade Face
     * @default undefined
     */
    shape!: T;
    /**
     * Number of rectangles on U direction
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrRectanglesU = 10;
    /**
     * Number of rectangles on V direction
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrRectanglesV = 10;
    /**
     * Rectangle scale pattern on u direction - numbers between 0 and 1, if 1 or undefined is used, no scaling is applied
     * @default undefined
     * @optional true
     */
    scalePatternU!: number[];
    /**
     * Rectangle scale pattern on v direction - numbers between 0 and 1, if 1 or undefined is used, no scaling is applied
     * @default undefined
     * @optional true
     */
    scalePatternV!: number[];
    /**
     * Rectangle fillet scale pattern - numbers between 0 and 1, if 0 is used, no fillet is applied, 
     * if 1 is used, the fillet will be exactly half of the length of the shorter side of the rectangle
     * @default undefined
     * @optional true
     */
    filletPattern!: number[];
    /**
     * Rectangle inclusion pattern - true means that the rectangle will be included, 
     * false means that the rectangle will be removed from the face
     * @default undefined
     * @optional true
     */
    inclusionPattern!: boolean[];
    /**
     * If offset on U is bigger then 0 we will use a smaller space for rectangles to be placed. This means that even rectangle of U param 1 will be offset from the face border
     * That is often required to create a pattern that is not too close to the face border
     * It should not be bigger then half of the total width of the face as that will create problems
     * @default 0
     * @minimum 0
     * @maximum 0.5
     * @step 0.01
     */
    offsetFromBorderU = 0;
    /**
     * If offset on V is bigger then 0 we will use a smaller space for rectangles to be placed. This means that even rectangle of V param 1 will be offset from the face border
     * That is often required to create a pattern that is not too close to the face border
     * It should not be bigger then half of the total width of the face as that will create problems
     * @default 0
     * @minimum 0
     * @maximum 0.5
     * @step 0.01
     */
    offsetFromBorderV = 0;
}
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
     * Openascade Face
     * @default undefined
     */
    shape!: T;
    /**
     * Number of hexagons on U direction
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrHexagonsU?: number | undefined = 10;
    /**
     * Number of hexagons on V direction
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
    flatU = false;
    /**
     * Hexagon scale pattern on u direction - numbers between 0 and 1, if 1 or undefined is used, no scaling is applied
     * @default undefined
     * @optional true
     */
    scalePatternU?: number[] | undefined;
    /**
     * Hexagon scale pattern on v direction - numbers between 0 and 1, if 1 or undefined is used, no scaling is applied
     * @default undefined
     * @optional true
     */
    scalePatternV?: number[] | undefined;
    /**
     * Hexagon fillet scale pattern - numbers between 0 and 1, if 0 is used, no fillet is applied, 
     * if 1 is used, the fillet will be exactly half of the length of the shortest segment of the hexagon
     * @default undefined
     * @optional true
     */
    filletPattern?: number[] | undefined;
    /**
     * Hexagon inclusion pattern - true means that the hexagon will be included, 
     * false means that the hexagon will be removed from the face
     * @default undefined
     * @optional true
     */
    inclusionPattern?: boolean[] | undefined;
    /**
     * If offset on U is bigger then 0 we will use a smaller space for hexagons to be placed. This means that even hexagon of U param 1 will be offset from the face border
     * That is often required to create a pattern that is not too close to the face border
     * It should not be bigger then half of the total width of the face as that will create problems
     * @default 0
     * @minimum 0
     * @maximum 0.5
     * @step 0.01
     */
    offsetFromBorderU?: number | undefined = 0;
    /**
     * If offset on V is bigger then 0 we will use a smaller space for hexagons to be placed. This means that even hexagon of V param 1 will be offset from the face border
     * That is often required to create a pattern that is not too close to the face border
     * It should not be bigger then half of the total width of the face as that will create problems
     * @default 0
     * @minimum 0
     * @maximum 0.5
     * @step 0.01
     */
    offsetFromBorderV?: number | undefined = 0;
    /**
     * If true, we will extend the hexagons beyond the face u up border by their pointy tops
     * @default false
     */
    extendUUp?: boolean | undefined = false;
    /**
     * If true, we will extend the hexagons beyond the face u bottom border by their pointy tops
     * @default false
     */
    extendUBottom?: boolean | undefined = false;
    /**
     * If true, we will extend the hexagons beyond the face v upper border by their half width
     * @default false
     */
    extendVUp?: boolean | undefined = false;
    /**
     * If true, we will extend the hexagons beyond the face v bottom border by their half width
     * @default false
     */
    extendVBottom?: boolean | undefined = false;
}

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
     * Openascade Face
     * @default undefined
     */
    shape!: T;
    /**
     * Number of hexagons on U direction
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrHexagonsU?: number | undefined = 10;
    /**
     * Number of hexagons on V direction
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
    flatU = false;
    /**
     * If true, we will also create holes as faces
     * @default false
     */
    holesToFaces?: boolean | undefined = false;
    /**
     * Hexagon scale pattern on u direction - numbers between 0 and 1, if 1 or undefined is used, no scaling is applied
     * @default undefined
     * @optional true
     */
    scalePatternU?: number[] | undefined;
    /**
     * Hexagon scale pattern on v direction - numbers between 0 and 1, if 1 or undefined is used, no scaling is applied
     * @default undefined
     * @optional true
     */
    scalePatternV?: number[] | undefined;
    /**
     * Hexagon fillet scale pattern - numbers between 0 and 1, if 0 is used, no fillet is applied, 
     * if 1 is used, the fillet will be exactly half of the length of the shortest segment of the hexagon
     * @default undefined
     * @optional true
     */
    filletPattern?: number[] | undefined;
    /**
     * Hexagon inclusion pattern - true means that the hexagon will be included, 
     * false means that the hexagon will be removed from the face
     * @default undefined
     * @optional true
     */
    inclusionPattern?: boolean[] | undefined;
    /**
     * If offset on U is bigger then 0 we will use a smaller space for hexagons to be placed. This means that even hexagon of U param 1 will be offset from the face border
     * That is often required to create a pattern that is not too close to the face border
     * It should not be bigger then half of the total width of the face as that will create problems
     * @default 0
     * @minimum 0
     * @maximum 0.5
     * @step 0.01
     */
    offsetFromBorderU?: number | undefined = 0;
    /**
     * If offset on V is bigger then 0 we will use a smaller space for hexagons to be placed. This means that even hexagon of V param 1 will be offset from the face border
     * That is often required to create a pattern that is not too close to the face border
     * It should not be bigger then half of the total width of the face as that will create problems
     * @default 0
     * @minimum 0
     * @maximum 0.5
     * @step 0.01
     */
    offsetFromBorderV?: number | undefined = 0;
}

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
     * Openascade Face
     * @default undefined
     */
    shape!: T;
    /**
     * Number of rectangles on U direction
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrRectanglesU = 10;
    /**
     * Number of rectangles on V direction
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrRectanglesV = 10;
    /**
     * Rectangle scale pattern on u direction - numbers between 0 and 1, if 1 or undefined is used, no scaling is applied
     * @default undefined
     * @optional true
     */
    scalePatternU!: number[];
    /**
     * Rectangle scale pattern on v direction - numbers between 0 and 1, if 1 or undefined is used, no scaling is applied
     * @default undefined
     * @optional true
     */
    scalePatternV!: number[];
    /**
     * Rectangle fillet scale pattern - numbers between 0 and 1, if 0 is used, no fillet is applied, 
     * if 1 is used, the fillet will be exactly half of the length of the shorter side of the rectangle
     * @default undefined
     * @optional true
     */
    filletPattern!: number[];
    /**
     * Rectangle inclusion pattern - true means that the rectangle will be included, 
     * false means that the rectangle will be removed from the face
     * @default undefined
     * @optional true
     */
    inclusionPattern!: boolean[];
    /**
     * If true, we will also output the faces for all the rectangles. The first face in the result will be the original face with holes punched, while the rest will be the rectangles
     * @default false
     */
    holesToFaces = false;
    /**
     * If offset on U is bigger then 0 we will use a smaller space for rectangles to be placed. This means that even rectangle of U param 1 will be offset from the face border
     * That is often required to create a pattern that is not too close to the face border
     * It should not be bigger then half of the total width of the face as that will create problems
     * @default 0
     * @minimum 0
     * @maximum 0.5
     * @step 0.01
     */
    offsetFromBorderU = 0;
    /**
     * If offset on V is bigger then 0 we will use a smaller space for rectangles to be placed. This means that even rectangle of V param 1 will be offset from the face border
     * That is often required to create a pattern that is not too close to the face border
     * It should not be bigger then half of the total width of the face as that will create problems
     * @default 0
     * @minimum 0
     * @maximum 0.5
     * @step 0.01
     */
    offsetFromBorderV = 0;
}
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
     * Brep OpenCascade geometry
     * @default undefined
     */
    shape!: T;
    /**
     * Number of subdivisions on U direction
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrDivisionsU = 10;
    /**
     * Number of subdivisions on V direction
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrDivisionsV = 10;
    /**
     * Shift half step every nth U row
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    shiftHalfStepNthU = 0;
    /**
     * Offset for shift half step every nth U row
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    shiftHalfStepUOffsetN = 0;
    /**
     * Removes start edge points on U
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    removeStartEdgeNthU = 0;
    /**
     * Offset for remove start edge points on U
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    removeStartEdgeUOffsetN = 0;
    /**
     * Removes end edge points on U 
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    removeEndEdgeNthU = 0;
    /**
     * Offset for remove end edge points on U
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    removeEndEdgeUOffsetN = 0;
    /**
     * Shift half step every nth V row
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    shiftHalfStepNthV = 0;
    /**
     * Offset for shift half step every nth V row
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    shiftHalfStepVOffsetN = 0;
    /**
     * Removes start edge points on V
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    removeStartEdgeNthV = 0;
    /**
     * Offset for remove start edge points on V
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    removeStartEdgeVOffsetN = 0;
    /**
     * Removes end edge points on V 
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    removeEndEdgeNthV = 0;
    /**
     * Offset for remove end edge points on V
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    removeEndEdgeVOffsetN = 0;
}
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
     * Brep OpenCascade geometry
     * @default undefined
     */
    shape!: T;
    /**
     * Linear subdivision direction true - U, false - V
     * @default true
     */
    isU = true;
    /**
     * Param on direction 0 - 1
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    param = 0.5;
    /**
     * Number of subdivisions on opposite direction
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrPoints = 10;
    /**
     * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
     * @default false
     */
    shiftHalfStep = false;
    /**
     * Removes first point
     * @default false
     */
    removeStartPoint = false;
    /**
     * Removes last point
     * @default false
     */
    removeEndPoint = false;
}
