import type { Base } from "../base-inputs";

/**
 * Terrain to add for `site.addTerrain`: the ground of the site as an outline in the site's plan, with
 * holes where a building or paving meets it, its top at `elevation` and reaching `depth` down.
 */
export class AddTerrainDto<T> {
    constructor(model?: T, id?: string, name?: string, outline?: Base.Point2[], holes?: Base.Point2[][], depth?: number, elevation?: number, material?: string) {
        if (model !== undefined) { this.model = model; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (outline !== undefined) { this.outline = outline; }
        if (holes !== undefined) { this.holes = holes; }
        if (depth !== undefined) { this.depth = depth; }
        if (elevation !== undefined) { this.elevation = elevation; }
        if (material !== undefined) { this.material = material; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * An id of your own for the terrain. Leave it out for a generated one.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
    /**
     * A name for the terrain, which other tools show.
     * @default Terrain
     */
    name?: string | undefined = "Terrain";
    /**
     * The outline, as `[x, y]` points in the site's plan, without the first repeated at the end;
     * either winding works.
     * @default undefined
     */
    outline!: Base.Point2[];
    /**
     * Holes in the ground, each an outline like `outline`, inside it, such as a building's footprint
     * or paving that lies flush with the ground.
     * @default undefined
     * @optional true
     */
    holes?: Base.Point2[][] | undefined;
    /**
     * How far the ground reaches down from its top. Left out, 1 m, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    depth?: number | undefined;
    /**
     * How high the ground's top is above the site's origin.
     * @default 0
     */
    elevation?: number | undefined = 0;
    /**
     * The material of the ground, added before with `materials.add`, such as lawn or soil.
     * @default undefined
     * @optional true
     */
    material?: string | undefined;
}

/**
 * A tree to add for `site.addTree`: a trunk and a rounded crown standing on the site at `position`,
 * `height` tall overall, written as a geographic element of the site.
 */
export class AddTreeDto<T> {
    constructor(model?: T, id?: string, name?: string, species?: string, position?: Base.Point2, elevation?: number, height?: number, crownRadius?: number, trunkRadius?: number, crownMaterial?: string, trunkMaterial?: string) {
        if (model !== undefined) { this.model = model; }
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (species !== undefined) { this.species = species; }
        if (position !== undefined) { this.position = position; }
        if (elevation !== undefined) { this.elevation = elevation; }
        if (height !== undefined) { this.height = height; }
        if (crownRadius !== undefined) { this.crownRadius = crownRadius; }
        if (trunkRadius !== undefined) { this.trunkRadius = trunkRadius; }
        if (crownMaterial !== undefined) { this.crownMaterial = crownMaterial; }
        if (trunkMaterial !== undefined) { this.trunkMaterial = trunkMaterial; }
    }
    /**
     * The model to change; it stays as it was, and the call returns the changed model.
     * @default undefined
     */
    model!: T;
    /**
     * An id of your own for the tree. Leave it out for a generated one.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
    /**
     * A name for the tree, which other tools show.
     * @default Tree
     */
    name?: string | undefined = "Tree";
    /**
     * What kind of tree it is, such as `Silver birch`, written as the element's object type.
     * @default Tree
     */
    species?: string | undefined = "Tree";
    /**
     * Where the trunk stands, as `[x, y]` in the site's plan.
     * @default [0, 0]
     */
    position?: Base.Point2 | undefined = [0, 0];
    /**
     * How high above the site's origin the trunk stands.
     * @default 0
     */
    elevation?: number | undefined = 0;
    /**
     * The tree's height from the ground to the top of its crown. Left out, 8 m, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    height?: number | undefined;
    /**
     * How far the crown spreads from the trunk. Left out, 2.5 m, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    crownRadius?: number | undefined;
    /**
     * The trunk's radius at the ground; it narrows towards the crown. Left out, 150 mm, in the model's length unit.
     * @default undefined
     * @optional true
     * @minimum 0
     * @maximum Infinity
     * @exclusiveMinimum true
     */
    trunkRadius?: number | undefined;
    /**
     * The material of the crown, added before with `materials.add`.
     * @default undefined
     * @optional true
     */
    crownMaterial?: string | undefined;
    /**
     * The material of the trunk, added before with `materials.add`.
     * @default undefined
     * @optional true
     */
    trunkMaterial?: string | undefined;
}
