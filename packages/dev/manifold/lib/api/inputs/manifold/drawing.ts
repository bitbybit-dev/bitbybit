import type { Base } from "../base-inputs";

/**
 * A solid or cross-section and how to draw it, for the renderer packages: face color, opacity and
 * material for a solid, line color and width for a cross-section.
 */
export class DrawManifoldOrCrossSectionDto<T, M> {
    /**
     * Provide options without default values
     */
    constructor(manifoldOrCrossSection?: T, faceOpacity?: number, faceMaterial?: M, faceColour?: Base.Color, crossSectionColour?: Base.Color, crossSectionWidth?: number, crossSectionOpacity?: number, computeNormals?: boolean, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number, minSharpAngle?: number) {
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
        if (minSharpAngle !== undefined) { this.minSharpAngle = minSharpAngle; }
    }
    /**
     * The solid or cross-section to draw.
     * @default undefined
     * @optional true
     */
    manifoldOrCrossSection?: T | undefined;
    /**
     * How opaque the faces are, from 0 for invisible to 1 for solid.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    faceOpacity?: number | undefined = 1;
    /**
     * A material for the faces from the rendering engine; when given it replaces the face color.
     * @default undefined
     * @optional true
     */
    faceMaterial?: M | undefined;
    /**
     * The color of the faces as a hex string such as `#ff0000`.
     * @default #ff0000
     */
    faceColour?: Base.Color | undefined = "#ff0000";
    /**
     * The color of a cross-section's lines as a hex string.
     * @default #ff00ff
     */
    crossSectionColour?: Base.Color | undefined = "#ff00ff";
    /**
     * How thick a cross-section's lines are drawn.
     * @default 2
     */
    crossSectionWidth?: number | undefined = 2;
    /**
     * How opaque a cross-section's lines are, from 0 to 1.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    crossSectionOpacity?: number | undefined = 1;
    /**
     * When true, solids shade smoothly across edges flatter than `minSharpAngle` and keep sharper
     * ones crisp; when false, every face is shaded flat.
     * @default true
     */
    computeNormals?: boolean | undefined = true;
    /**
     * The angle between two faces, in degrees, above which their shared edge is drawn sharp when
     * `computeNormals` is true.
     * @default 40
     * @minimum 0
     * @maximum 180
     * @step 5
     */
    minSharpAngle?: number | undefined = 40;
    /**
     * When true, the back of each face is drawn in its own color, which shows which way faces
     * point.
     * @default true
     */
    drawTwoSided?: boolean | undefined = true;
    /**
     * The color of the back of the faces as a hex string; used only with `drawTwoSided`.
     * @default #0000ff
     */
    backFaceColour?: Base.Color | undefined = "#0000ff";
    /**
     * How opaque the back of the faces is, from 0 to 1; used only with `drawTwoSided`.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    backFaceOpacity?: number | undefined = 1;
}
/**
 * Solids or cross-sections and how to draw them, for the renderer packages: the same options as
 * `DrawManifoldOrCrossSectionDto`, applied to every shape in the list.
 */
export class DrawManifoldsOrCrossSectionsDto<T, M> {
    /**
     * Provide options without default values
     */
    constructor(manifoldsOrCrossSections?: T[], faceOpacity?: number, faceMaterial?: M, faceColour?: Base.Color, crossSectionColour?: Base.Color, crossSectionWidth?: number, crossSectionOpacity?: number, computeNormals?: boolean, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number, minSharpAngle?: number) {
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
        if (minSharpAngle !== undefined) { this.minSharpAngle = minSharpAngle; }
    }
    /**
     * The solids or cross-sections to draw with the same options.
     * @default undefined
     * @optional true
     */
    manifoldsOrCrossSections?: T[] | undefined;
    /**
     * A material for the faces from the rendering engine; when given it replaces the face color.
     * @default undefined
     * @optional true
     */
    faceMaterial?: M | undefined;
    /**
     * The color of the faces as a hex string such as `#ff0000`.
     * @default #ff0000
     */
    faceColour?: Base.Color | undefined = "#ff0000";
    /**
     * How opaque the faces are, from 0 for invisible to 1 for solid.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    faceOpacity?: number | undefined = 1;
    /**
     * The color of a cross-section's lines as a hex string.
     * @default #ff00ff
     */
    crossSectionColour?: Base.Color | undefined = "#ff00ff";
    /**
     * How thick a cross-section's lines are drawn.
     * @default 2
     */
    crossSectionWidth?: number | undefined = 2;
    /**
     * How opaque a cross-section's lines are, from 0 to 1.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    crossSectionOpacity?: number | undefined = 1;
    /**
     * When true, solids shade smoothly across edges flatter than `minSharpAngle` and keep sharper
     * ones crisp; when false, every face is shaded flat.
     * @default true
     */
    computeNormals?: boolean | undefined = true;
    /**
     * The angle between two faces, in degrees, above which their shared edge is drawn sharp when
     * `computeNormals` is true.
     * @default 40
     * @minimum 0
     * @maximum 180
     * @step 5
     */
    minSharpAngle?: number | undefined = 40;
    /**
     * When true, the back of each face is drawn in its own color, which shows which way faces
     * point.
     * @default true
     */
    drawTwoSided?: boolean | undefined = true;
    /**
     * The color of the back of the faces as a hex string; used only with `drawTwoSided`.
     * @default #0000ff
     */
    backFaceColour?: Base.Color | undefined = "#0000ff";
    /**
     * How opaque the back of the faces is, from 0 to 1; used only with `drawTwoSided`.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    backFaceOpacity?: number | undefined = 1;
}
