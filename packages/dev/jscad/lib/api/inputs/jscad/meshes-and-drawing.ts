// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { JSCADEntity } from "./entities-and-enums";

/**
 * Feeds `toPolygonPoints` and `shapeToMesh` on the JSCAD service with the one entity to turn into
 * triangles or mesh data; a 2D shape is given a tiny thickness on the way.
 */
export class MeshDto {
    constructor(mesh?: JSCADEntity) {
        if (mesh !== undefined) { this.mesh = mesh; }
    }
    /**
     * The solid to convert; a flat 2D shape works too and is given a tiny thickness first
     */
    mesh!: JSCADEntity;
}

/**
 * Feeds `shapesToMeshes` on the JSCAD service with the entities to turn into mesh data, one result
 * per entry in the same order.
 */
export class MeshesDto {
    constructor(meshes?: JSCADEntity[]) {
        if (meshes !== undefined) { this.meshes = meshes; }
    }
    /**
     * The solids to convert, in the order the results should come back; flat 2D shapes work too
     */
    meshes!: JSCADEntity[];
}
/**
 * The options `draw.drawAnyAsync` passes on when the entity is one JSCAD solid or 2D shape: color,
 * opacity, visibility, the two-sided rendering and the mesh to reuse when redrawing.
 */
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
     * The solid or flat 2D shape to draw; it is converted to mesh data on the way
     */
    mesh!: JSCADEntity;
    /**
     * How opaque the faces are, from 0 for invisible to 1 for solid
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    opacity = 1;
    /**
     * Hex color of the faces; a list uses its first entry. An entity colored with `colors.colorize`
     * keeps its own color instead
     * @default #444444
     */
    colours: string | string[] = "#444444";
    /**
     * When true, the drawn mesh can be refreshed in place on later draws by passing it back as
     * `jscadMesh`
     * @default false
     */
    updatable = false;
    /**
     * When true, the mesh is created but not shown until it is made visible
     * @default false
     */
    hidden = false;
    /**
     * A mesh from an earlier draw to refresh instead of creating a new one; used only when
     * `updatable` is true
     * @default undefined
     * @optional true
     * @ignore true
     */
    jscadMesh?: T | undefined;
    /**
     * When true, the back of every face is drawn as well, in `backFaceColour`, which helps to see
     * face orientation
     * @default true
     */
    drawTwoSided = true;
    /**
     * Hex color of the back faces, the side the face normal points away from; used only when
     * `drawTwoSided` is true
     * @default #0000ff
     */
    backFaceColour = "#0000ff";
    /**
     * How opaque the back faces are, from 0 to 1; used only when `drawTwoSided` is true
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    backFaceOpacity = 1;
}
/**
 * The options `draw.drawAnyAsync` passes on when the entity is a list of JSCAD solids or 2D shapes:
 * colors, opacity, visibility, the two-sided rendering and the parent mesh to reuse when redrawing.
 */
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
     * The solids or flat 2D shapes to draw, each becoming a child of one parent mesh
     * @default undefined
     * @optional true
     */
    meshes!: JSCADEntity[];
    /**
     * How opaque the faces are, from 0 for invisible to 1 for solid
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    opacity = 1;
    /**
     * Hex color of the faces; a list with one entry per entity colors each in turn, any other list
     * uses its first entry. Colorized entities keep their own color
     * @default #444444
     */
    colours: string | string[] = "#444444";
    /**
     * When true, the drawn meshes can be refreshed in place on later draws by passing the parent
     * back as `jscadMesh`
     * @default false
     */
    updatable = false;
    /**
     * When true, the meshes are created but not shown until they are made visible
     * @default false
     */
    hidden = false;
    /**
     * The parent mesh from an earlier draw to refresh instead of creating a new one; used only when
     * `updatable` is true
     * @default undefined
     * @optional true
     * @ignore true
     */
    jscadMesh?: T | undefined;
    /**
     * When true, the back of every face is drawn as well, in `backFaceColour`, which helps to see
     * face orientation
     * @default true
     */
    drawTwoSided = true;
    /**
     * Hex color of the back faces, the side the face normal points away from; used only when
     * `drawTwoSided` is true
     * @default #0000ff
     */
    backFaceColour = "#0000ff";
    /**
     * How opaque the back faces are, from 0 to 1; used only when `drawTwoSided` is true
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    backFaceOpacity = 1;
}
/**
 * The options `draw.drawAnyAsync` passes on when the entity is a JSCAD 2D path, drawn as a line
 * through its points: color, opacity, line width and the line to reuse when redrawing.
 */
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
     * The 2D path to draw as a line; a closed path is drawn back to its first point
     * @default undefined
     */
    path!: JSCADEntity;
    /**
     * Hex color of the line; a path colored with `colors.colorize` keeps its own color instead
     * @default #444444
     */
    colour = "#444444";
    /**
     * How opaque the line is, from 0 for invisible to 1 for solid
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    opacity = 1;
    /**
     * Thickness of the drawn line
     * @default 10
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    width = 10;
    /**
     * When true, the drawn line can be refreshed in place on later draws by passing it back as
     * `pathMesh`
     * @default false
     */
    updatable = false;
    /**
     * A line from an earlier draw to refresh instead of creating a new one; used only when
     * `updatable` is true
     * @default undefined
     * @optional true
     * @ignore true
     */
    pathMesh?: T | undefined;
}
