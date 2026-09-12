// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { JSCADEntity } from "./entities-and-enums";

/**
 * Feeds `booleans.union`, `booleans.intersect` and `booleans.subtract` with any number of inputs;
 * for `subtract` the first entry is the one being cut. All entries must be of one kind, solids or
 * 2D shapes.
 */
export class BooleanObjectsDto {
    constructor(meshes?: JSCADEntity[]) {
        if (meshes !== undefined) { this.meshes = meshes; }
    }
    /**
     * The solids, or the 2D shapes, to combine; the inputs stay as they are and a new entity comes
     * back
     * @default undefined
     */
    meshes!: JSCADEntity[];
}
/**
 * Feeds `booleans.unionTwo`, `booleans.intersectTwo` and `booleans.subtractTwo` with exactly two
 * inputs of one kind, solids or 2D shapes; for `subtractTwo`, `second` is cut out of `first`.
 */
export class BooleanTwoObjectsDto {
    constructor(first?: JSCADEntity, second?: JSCADEntity) {
        if (first !== undefined) { this.first = first; }
        if (second !== undefined) { this.second = second; }
    }
    /**
     * The first solid or 2D shape, the one that is kept and cut in a subtraction
     * @default undefined
     */
    first!: JSCADEntity;
    /**
     * The second solid or 2D shape, of the same kind as `first`
     * @default undefined
     */
    second!: JSCADEntity;
}
/**
 * Feeds `booleans.subtractFrom`: `from` is the base and every entry of `meshes` is cut out of it.
 * All must be of one kind, solids or 2D shapes.
 */
export class BooleanObjectsFromDto {
    constructor(from?: JSCADEntity, meshes?: JSCADEntity[]) {
        if (from !== undefined) { this.from = from; }
        if (meshes !== undefined) { this.meshes = meshes; }
    }
    /**
     * The solid or 2D shape to cut from; it stays as it is and a cut copy comes back
     * @default undefined
     */
    from!: JSCADEntity;
    /**
     * The solids or 2D shapes to cut out of `from`, of the same kind as it
     * @default undefined
     */
    meshes!: JSCADEntity[];
}
