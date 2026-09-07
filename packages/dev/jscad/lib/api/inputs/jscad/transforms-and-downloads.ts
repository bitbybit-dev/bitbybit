// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";
import { JSCADEntity } from "./entities-and-enums";

export class TransformSolidsDto {
    constructor(meshes?: JSCADEntity[], transformation?: Base.TransformMatrixes) {
        if (meshes !== undefined) { this.meshes = meshes; }
        if (transformation !== undefined) { this.transformation = transformation; }
    }
    /**
     * Solids to be transformed
     * @default undefined
     */
    meshes!: JSCADEntity[];
    /**
     * Transformation matrix or a list of transformation matrixes
     * @default undefined
     */
    transformation!: Base.TransformMatrixes;
}
export class TransformSolidDto {
    constructor(mesh?: JSCADEntity, transformation?: Base.TransformMatrixes) {
        if (mesh !== undefined) { this.mesh = mesh; }
        if (transformation !== undefined) { this.transformation = transformation; }
    }
    /**
     * Solid to be transformed
     * @default undefined
     */
    mesh!: JSCADEntity;
    /**
     * Transformation matrix or a list of transformation matrixes
     * @default undefined
     */
    transformation!: Base.TransformMatrixes;
}
export class DownloadSolidDto {
    constructor(mesh?: JSCADEntity, fileName?: string) {
        if (mesh !== undefined) { this.mesh = mesh; }
        if (fileName !== undefined) { this.fileName = fileName; }
    }
    /**
     * Solid to be downloaded
     * @default undefined
     */
    mesh!: JSCADEntity;
    /**
     * File name
     * @default undefined
     */
    fileName!: string;
}
export class DownloadGeometryDto {
    constructor(geometry?: JSCADEntity | JSCADEntity[], fileName?: string, options?: any) {
        if (geometry !== undefined) { this.geometry = geometry; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (options !== undefined) { this.options = options; }
    }
    /**
     * Solid or path to be downloaded, also supports multiple geometries in array
     * @default undefined
     */
    geometry!: JSCADEntity | JSCADEntity[];
    /**
     * File name
     * @default jscad-geometry
     */
    fileName = "jscad-geometry";
    /**
     * Options
     * @default undefined
     * @optional true
     */
    options;
}
export class DownloadSolidsDto {
    constructor(meshes?: JSCADEntity[], fileName?: string) {
        if (meshes !== undefined) { this.meshes = meshes; }
        if (fileName !== undefined) { this.fileName = fileName; }
    }
    /**
     * Solids to be downloaded
     * @default undefined
     */
    meshes!: JSCADEntity[];
    /**
     * File name
     * @default undefined
     */
    fileName!: string;
}
export class ColorizeDto {
    constructor(geometry?: JSCADEntity, color?: string) {
        if (geometry !== undefined) { this.geometry = geometry; }
        if (color !== undefined) { this.color = color; }
    }
    /**
     * Solid to be colorized
     * @default undefined
     */
    geometry!: JSCADEntity | JSCADEntity[];
    /**
     * Hex color string
     * @default #0000ff
     */
    color = "#0000ff";
}
