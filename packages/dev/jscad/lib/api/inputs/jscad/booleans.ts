// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { JSCADEntity } from "./entities-and-enums";

export class BooleanObjectsDto {
    constructor(meshes?: JSCADEntity[]) {
        if (meshes !== undefined) { this.meshes = meshes; }
    }
    /**
     * Contains solid Jscad mesh objects that will be used to perform boolean operation
     * @default undefined
     */
    meshes!: JSCADEntity[];
}
export class BooleanTwoObjectsDto {
    constructor(first?: JSCADEntity, second?: JSCADEntity) {
        if (first !== undefined) { this.first = first; }
        if (second !== undefined) { this.second = second; }
    }
    /**
     * Contains Jscad Solid
     * @default undefined
     */
    first!: JSCADEntity;
    /**
     * Contains Jscad Solid
     * @default undefined
     */
    second!: JSCADEntity;
}
export class BooleanObjectsFromDto {
    constructor(from?: JSCADEntity, meshes?: JSCADEntity[]) {
        if (from !== undefined) { this.from = from; }
        if (meshes !== undefined) { this.meshes = meshes; }
    }
    /**
     * Contains Jscad Solid
     * @default undefined
     */
    from!: JSCADEntity;
    /**
     * Contains Jscad Solid
     * @default undefined
     */
    meshes!: JSCADEntity[];
}
