// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";
import { JSCADEntity } from "./entities-and-enums";

/**
 * Feeds `transformSolids` on the JSCAD service: the solids to move and the matrix, or matrices,
 * applied to each of them.
 */
export class TransformSolidsDto {
    constructor(meshes?: JSCADEntity[], transformation?: Base.TransformMatrixes) {
        if (meshes !== undefined) { this.meshes = meshes; }
        if (transformation !== undefined) { this.transformation = transformation; }
    }
    /**
     * The solids to transform; they stay as they are and transformed copies come back in the same
     * order
     * @default undefined
     */
    meshes!: JSCADEntity[];
    /**
     * One 4x4 matrix, a list of matrices applied in order, or a list of such lists, as the
     * `transforms` methods produce
     * @default undefined
     */
    transformation!: Base.TransformMatrixes;
}
/**
 * Feeds `transformSolid` on the JSCAD service: the solid to move and the matrix, or matrices,
 * applied to it.
 */
export class TransformSolidDto {
    constructor(mesh?: JSCADEntity, transformation?: Base.TransformMatrixes) {
        if (mesh !== undefined) { this.mesh = mesh; }
        if (transformation !== undefined) { this.transformation = transformation; }
    }
    /**
     * The solid to transform; it stays as it is and a transformed copy comes back. A 2D shape or a
     * path throws an error
     * @default undefined
     */
    mesh!: JSCADEntity;
    /**
     * One 4x4 matrix, a list of matrices applied in order, or a list of such lists, as the
     * `transforms` methods produce
     * @default undefined
     */
    transformation!: Base.TransformMatrixes;
}
/**
 * Feeds `downloadSolidSTL` on the JSCAD service: the solid to write and the name of the STL file.
 */
export class DownloadSolidDto {
    constructor(mesh?: JSCADEntity, fileName?: string) {
        if (mesh !== undefined) { this.mesh = mesh; }
        if (fileName !== undefined) { this.fileName = fileName; }
    }
    /**
     * The solid to write to the file
     * @default undefined
     */
    mesh!: JSCADEntity;
    /**
     * Name of the downloaded file without the extension, which is added
     * @default undefined
     */
    fileName!: string;
}
/**
 * Feeds `downloadGeometryDxf` and `downloadGeometry3MF` on the JSCAD service: the geometry to
 * write, the file name and optional options for the file writer.
 */
export class DownloadGeometryDto {
    constructor(geometry?: JSCADEntity | JSCADEntity[], fileName?: string, options?: any) {
        if (geometry !== undefined) { this.geometry = geometry; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (options !== undefined) { this.options = options; }
    }
    /**
     * A solid, a 2D shape, a path, or a list of them, all written into one file
     * @default undefined
     */
    geometry!: JSCADEntity | JSCADEntity[];
    /**
     * Name of the downloaded file without the extension, which is added
     * @default jscad-geometry
     */
    fileName = "jscad-geometry";
    /**
     * Options handed to the DXF or 3MF writer as they are; leave it out for the defaults
     * @default undefined
     * @optional true
     */
    options;
}
/**
 * Feeds `downloadSolidsSTL` on the JSCAD service: the solids to write into one STL file and the
 * file's name.
 */
export class DownloadSolidsDto {
    constructor(meshes?: JSCADEntity[], fileName?: string) {
        if (meshes !== undefined) { this.meshes = meshes; }
        if (fileName !== undefined) { this.fileName = fileName; }
    }
    /**
     * The solids to write, all into the same file
     * @default undefined
     */
    meshes!: JSCADEntity[];
    /**
     * Name of the downloaded file without the extension, which is added
     * @default undefined
     */
    fileName!: string;
}
/**
 * Feeds `colors.colorize`: the geometry to tint, one entity or a list, and the color it is drawn in
 * from then on.
 */
export class ColorizeDto {
    constructor(geometry?: JSCADEntity, color?: string) {
        if (geometry !== undefined) { this.geometry = geometry; }
        if (color !== undefined) { this.color = color; }
    }
    /**
     * A solid, a 2D shape, a path, or a list of them; colored copies come back in the same shape as
     * the input
     * @default undefined
     */
    geometry!: JSCADEntity | JSCADEntity[];
    /**
     * Hex color string the geometry is always drawn in, ahead of the drawing options
     * @default #0000ff
     */
    color = "#0000ff";
}
