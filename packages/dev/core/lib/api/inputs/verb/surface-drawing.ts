// A fragment of the Verb inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../verb-inputs.ts. Edit here, then regenerate.

export class DrawSurfaceDto<T> {
    /**
     * Provide options without default values
     */
    constructor(surface?: any, opacity?: number, colours?: string | string[], updatable?: boolean, hidden?: boolean, surfaceMesh?: T, drawTwoSided?: boolean, backFaceColour?: string, backFaceOpacity?: number) {
        if (surface !== undefined) { this.surface = surface; }
        if (opacity !== undefined) { this.opacity = opacity; }
        if (colours !== undefined) { this.colours = colours; }
        if (updatable !== undefined) { this.updatable = updatable; }
        if (hidden !== undefined) { this.hidden = hidden; }
        if (surfaceMesh !== undefined) { this.surfaceMesh = surfaceMesh; }
        if (drawTwoSided !== undefined) { this.drawTwoSided = drawTwoSided; }
        if (backFaceColour !== undefined) { this.backFaceColour = backFaceColour; }
        if (backFaceOpacity !== undefined) { this.backFaceOpacity = backFaceOpacity; }
    }
    /**
     * Nurbs surface
     */
    surface: any;
    /**
     * Value between 0 and 1
     */
    opacity = 1;
    /**
     * Hex colour string
     */
    colours: string | string[] = "#444444";
    /**
     * Indicates wether the position of this surface will change in time
     */
    updatable = false;
    /**
     * Should be hidden
     */
    hidden = false;
    /**
     * Surface mesh variable in case it already exists and needs updating
     */
    surfaceMesh?: T | undefined;
    /**
     * Draw two-sided faces with different colors for front and back. This helps visualize face orientation.
     * @default true
     */
    drawTwoSided = true;
    /**
     * Hex colour string for back face colour (negative side of the face). Only used when drawTwoSided is true.
     * @default #0000ff
     */
    backFaceColour = "#0000ff";
    /**
     * Back face opacity value between 0 and 1. Only used when drawTwoSided is true.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    backFaceOpacity = 1;
}
export class DrawSurfacesDto<T> {
    /**
     * Provide options without default values
     */
    constructor(surfaces?: any[], opacity?: number, colours?: string | string[], updatable?: boolean, hidden?: boolean, surfacesMesh?: T, drawTwoSided?: boolean, backFaceColour?: string, backFaceOpacity?: number) {
        if (surfaces !== undefined) { this.surfaces = surfaces; }
        if (opacity !== undefined) { this.opacity = opacity; }
        if (colours !== undefined) { this.colours = colours; }
        if (updatable !== undefined) { this.updatable = updatable; }
        if (hidden !== undefined) { this.hidden = hidden; }
        if (surfacesMesh !== undefined) { this.surfacesMesh = surfacesMesh; }
        if (drawTwoSided !== undefined) { this.drawTwoSided = drawTwoSided; }
        if (backFaceColour !== undefined) { this.backFaceColour = backFaceColour; }
        if (backFaceOpacity !== undefined) { this.backFaceOpacity = backFaceOpacity; }
    }
    /**
     * Nurbs surfaces
     */
    surfaces!: any[];
    /**
     * Value between 0 and 1
     */
    opacity = 1;
    /**
     * Hex colour string
     */
    colours: string | string[] = "#444444";
    /**
     * Indicates wether the position of these surfaces will change in time
     */
    updatable = false;
    /**
     * Should be hidden
     */
    hidden = false;
    /**
     * Surfaces mesh variable in case it already exists and needs updating
     */
    surfacesMesh?: T | undefined;
    /**
     * Draw two-sided faces with different colors for front and back. This helps visualize face orientation.
     * @default true
     */
    drawTwoSided = true;
    /**
     * Hex colour string for back face colour (negative side of the face). Only used when drawTwoSided is true.
     * @default #0000ff
     */
    backFaceColour = "#0000ff";
    /**
     * Back face opacity value between 0 and 1. Only used when drawTwoSided is true.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    backFaceOpacity = 1;
}
export class DrawSurfacesColoursDto<T> {
    /**
     * Provide options without default values
     */
    constructor(surfaces?: any[], colours?: string[], opacity?: number, updatable?: boolean, hidden?: boolean, surfacesMesh?: T, drawTwoSided?: boolean, backFaceColour?: string, backFaceOpacity?: number) {
        if (surfaces !== undefined) { this.surfaces = surfaces; }
        if (colours !== undefined) { this.colours = colours; }
        if (opacity !== undefined) { this.opacity = opacity; }
        if (updatable !== undefined) { this.updatable = updatable; }
        if (hidden !== undefined) { this.hidden = hidden; }
        if (surfacesMesh !== undefined) { this.surfacesMesh = surfacesMesh; }
        if (drawTwoSided !== undefined) { this.drawTwoSided = drawTwoSided; }
        if (backFaceColour !== undefined) { this.backFaceColour = backFaceColour; }
        if (backFaceOpacity !== undefined) { this.backFaceOpacity = backFaceOpacity; }
    }
    /**
     * Nurbs surfaces
     */
    surfaces!: any[];
    /**
     * Value between 0 and 1
     */
    opacity = 1;
    /**
     * Hex colour strings, there has to be a colour for every single surface and lengths of arrays need
     * to match
     */
    colours!: string | string[];
    /**
     * Indicates wether the position of these surfaces will change in time
     */
    updatable = false;
    /**
     * Indicates if surface should be hidden
     */
    hidden = false;
    /**
     * Surfaces mesh variable in case it already exists and needs updating
     */
    surfacesMesh?: T | undefined;
    /**
     * Draw two-sided faces with different colors for front and back. This helps visualize face orientation.
     * @default true
     */
    drawTwoSided = true;
    /**
     * Hex colour string for back face colour (negative side of the face). Only used when drawTwoSided is true.
     * @default #0000ff
     */
    backFaceColour = "#0000ff";
    /**
     * Back face opacity value between 0 and 1. Only used when drawTwoSided is true.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    backFaceOpacity = 1;
}
