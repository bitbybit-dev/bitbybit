// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { JSCADEntity } from "./entities-and-enums";

export class MeshDto {
    constructor(mesh?: JSCADEntity) {
        if (mesh !== undefined) { this.mesh = mesh; }
    }
    /**
    * Solid Jscad mesh
    */
    mesh: JSCADEntity;
}

export class MeshesDto {
    constructor(meshes?: JSCADEntity[]) {
        if (meshes !== undefined) { this.meshes = meshes; }
    }
    /**
    * Solid Jscad mesh
    */
    meshes!: JSCADEntity[];
}
export class DrawSolidMeshDto<T> {
    /**
     * Provide options without default values
     */
    constructor(mesh?: JSCADEntity, opacity?: number, colours?: string | string[], updatable?: boolean, hidden?: boolean, jscadMesh?: T, drawTwoSided?: boolean, backFaceColour?: string, backFaceOpacity?: number) {
        if (mesh !== undefined) { this.mesh = mesh; }
        if (opacity !== undefined) { this.opacity = opacity; }
        if (colours !== undefined) { this.colours = colours; }
        if (updatable !== undefined) { this.updatable = updatable; }
        if (hidden !== undefined) { this.hidden = hidden; }
        if (jscadMesh !== undefined) { this.jscadMesh = jscadMesh; }
        if (drawTwoSided !== undefined) { this.drawTwoSided = drawTwoSided; }
        if (backFaceColour !== undefined) { this.backFaceColour = backFaceColour; }
        if (backFaceOpacity !== undefined) { this.backFaceOpacity = backFaceOpacity; }
    }
    /**
     * Solid Jscad mesh
     */
    mesh: JSCADEntity;
    /**
     * Value between 0 and 1
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    opacity = 1;
    /**
     * Hex colour string
     * @default #444444
     */
    colours: string | string[] = "#444444";
    /**
     * Indicates wether this solid will be transformed in time
     * @default false
     */
    updatable = false;
    /**
     * Hidden
     * @default false
     */
    hidden = false;
    /**
     * Solid mesh variable in case it already exists and needs updating
     * @default undefined
     * @optional true
     * @ignore true
     */
    jscadMesh?: T | undefined;
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
export class DrawSolidMeshesDto<T> {
    /**
     * Provide options without default values
     */
    constructor(meshes?: JSCADEntity[], opacity?: number, colours?: string | string[], updatable?: boolean, hidden?: boolean, jscadMesh?: T, drawTwoSided?: boolean, backFaceColour?: string, backFaceOpacity?: number) {
        if (meshes !== undefined) { this.meshes = meshes; }
        if (opacity !== undefined) { this.opacity = opacity; }
        if (colours !== undefined) { this.colours = colours; }
        if (updatable !== undefined) { this.updatable = updatable; }
        if (hidden !== undefined) { this.hidden = hidden; }
        if (jscadMesh !== undefined) { this.jscadMesh = jscadMesh; }
        if (drawTwoSided !== undefined) { this.drawTwoSided = drawTwoSided; }
        if (backFaceColour !== undefined) { this.backFaceColour = backFaceColour; }
        if (backFaceOpacity !== undefined) { this.backFaceOpacity = backFaceOpacity; }
    }
    /**
     * Solid Jscad meshes
     * @default undefined
     * @optional true
     */
    meshes!: JSCADEntity[];
    /**
     * Value between 0 and 1
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    opacity = 1;
    /**
     * Hex colour string
     * @default #444444
     */
    colours: string | string[] = "#444444";
    /**
     * Indicates wether this solid will be transformed in time
     * @default false
     */
    updatable = false;
    /**
     * Should be hidden
     * @default false
     */
    hidden = false;
    /**
     * Solid mesh variable in case it already exists and needs updating
     * @default undefined
     * @optional true
     * @ignore true
     */
    jscadMesh?: T | undefined;
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
export class DrawPathDto<T> {
    /**
     * Provide options without default values
     */
    constructor(path?: JSCADEntity, colour?: string, opacity?: number, width?: number, updatable?: boolean, pathMesh?: T) {
        if (path !== undefined) { this.path = path; }
        if (colour !== undefined) { this.colour = colour; }
        if (opacity !== undefined) { this.opacity = opacity; }
        if (width !== undefined) { this.width = width; }
        if (updatable !== undefined) { this.updatable = updatable; }
        if (pathMesh !== undefined) { this.pathMesh = pathMesh; }
    }
    /**
     * 2D Path to draw         
     * @default undefined
     */
    path: JSCADEntity;
    /**
     * Colour of the path
     * @default #444444
     */
    colour = "#444444";
    /**
     * Opacity of the path
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    opacity = 1;
    /**
     * Width of the path
     * @default 10
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    width = 10;
    /**
     * Indicates wether the path will change in time
     * @default false
     */
    updatable = false;
    /**
     * Path mesh variable that will be updated if updatable property is set to true
     * @default undefined
     * @optional true
     * @ignore true
     */
    pathMesh?: T | undefined;
}
