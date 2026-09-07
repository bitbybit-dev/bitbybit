// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

export class DrawManifoldOrCrossSectionDto<T, M> {
    /**
     * Provide options without default values
     */
    constructor(manifoldOrCrossSection?: T, faceOpacity?: number, faceMaterial?: M, faceColour?: Base.Color, crossSectionColour?: Base.Color, crossSectionWidth?: number, crossSectionOpacity?: number, computeNormals?: boolean, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number) {
        if (manifoldOrCrossSection !== undefined) { this.manifoldOrCrossSection = manifoldOrCrossSection; }
        if (faceOpacity !== undefined) { this.faceOpacity = faceOpacity; }
        if (faceMaterial !== undefined) { this.faceMaterial = faceMaterial; }
        if (faceColour !== undefined) { this.faceColour = faceColour; }
        if (crossSectionColour !== undefined) { this.crossSectionColour = crossSectionColour; }
        if (crossSectionWidth !== undefined) { this.crossSectionWidth = crossSectionWidth; }
        if (crossSectionOpacity !== undefined) { this.crossSectionOpacity = crossSectionOpacity; }
        if (computeNormals !== undefined) { this.computeNormals = computeNormals; }
        if (drawTwoSided !== undefined) { this.drawTwoSided = drawTwoSided; }
        if (backFaceColour !== undefined) { this.backFaceColour = backFaceColour; }
        if (backFaceOpacity !== undefined) { this.backFaceOpacity = backFaceOpacity; }
    }
    /**
     * Manifold geometry
     * @default undefined
     */
    manifoldOrCrossSection?: T | undefined;
    /**
     * Face opacity value between 0 and 1
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    faceOpacity = 1;
    /**
     * Face material
     * @default undefined
     * @optional true
     */
    faceMaterial?: M | undefined;
    /**
     * Hex colour string for face colour
     * @default #ff0000
     */
    faceColour: Base.Color = "#ff0000";
    /**
     * Hex colour string for cross section drawing
     * @default #ff00ff
     */
    crossSectionColour: Base.Color = "#ff00ff";
    /**
     * Width of cross section lines
     * @default 2
     */
    crossSectionWidth = 2;
    /**
     * Cross section opacity value between 0 and 1
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    crossSectionOpacity = 1;
    /**
     * Compute normals for the shape
     * @default false
     */
    computeNormals = false;
    /**
     * Draw two-sided faces with different colors for front and back. This helps visualize face orientation.
     * @default true
     */
    drawTwoSided = true;
    /**
     * Hex colour string for back face colour (negative side of the face). Only used when drawTwoSided is true.
     * @default #0000ff
     */
    backFaceColour: Base.Color = "#0000ff";
    /**
     * Back face opacity value between 0 and 1. Only used when drawTwoSided is true.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    backFaceOpacity = 1;
}
export class DrawManifoldsOrCrossSectionsDto<T, M> {
    /**
     * Provide options without default values
     */
    constructor(manifoldsOrCrossSections?: T[], faceOpacity?: number, faceMaterial?: M, faceColour?: Base.Color, crossSectionColour?: Base.Color, crossSectionWidth?: number, crossSectionOpacity?: number, computeNormals?: boolean, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number) {
        if (manifoldsOrCrossSections !== undefined) { this.manifoldsOrCrossSections = manifoldsOrCrossSections; }
        if (faceOpacity !== undefined) { this.faceOpacity = faceOpacity; }
        if (faceMaterial !== undefined) { this.faceMaterial = faceMaterial; }
        if (faceColour !== undefined) { this.faceColour = faceColour; }
        if (crossSectionColour !== undefined) { this.crossSectionColour = crossSectionColour; }
        if (crossSectionWidth !== undefined) { this.crossSectionWidth = crossSectionWidth; }
        if (crossSectionOpacity !== undefined) { this.crossSectionOpacity = crossSectionOpacity; }
        if (computeNormals !== undefined) { this.computeNormals = computeNormals; }
        if (drawTwoSided !== undefined) { this.drawTwoSided = drawTwoSided; }
        if (backFaceColour !== undefined) { this.backFaceColour = backFaceColour; }
        if (backFaceOpacity !== undefined) { this.backFaceOpacity = backFaceOpacity; }
    }
    /**
     * Manifold geometry
     * @default undefined
     */
    manifoldsOrCrossSections?: T[] | undefined;
    /**
     * Face material
     * @default undefined
     * @optional true
     */
    faceMaterial?: M | undefined;
    /**
     * Hex colour string for face colour
     * @default #ff0000
     */
    faceColour: Base.Color = "#ff0000";
    /**
     * Face opacity value between 0 and 1
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    faceOpacity = 1;
    /**
     * Hex colour string for cross section drawing
     * @default #ff00ff
     */
    crossSectionColour: Base.Color = "#ff00ff";
    /**
     * Width of cross section lines
     * @default 2
     */
    crossSectionWidth = 2;
    /**
     * Cross section opacity value between 0 and 1
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    crossSectionOpacity = 1;
    /**
     * Compute normals for the shape
     * @default false
     */
    computeNormals = false;
    /**
     * Draw two-sided faces with different colors for front and back. This helps visualize face orientation.
     * @default true
     */
    drawTwoSided = true;
    /**
     * Hex colour string for back face colour (negative side of the face). Only used when drawTwoSided is true.
     * @default #0000ff
     */
    backFaceColour: Base.Color = "#0000ff";
    /**
     * Back face opacity value between 0 and 1. Only used when drawTwoSided is true.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    backFaceOpacity = 1;
}
