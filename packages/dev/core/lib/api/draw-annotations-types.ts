import type * as Inputs from "./inputs";

/**
 * The meshing settings of the drawing options that mesh an assembly document, as
 * `documentDrawOptionsOf` lays them out from every renderer's `DrawOcctDocumentOptions`.
 * @beta
 */
export interface DocumentMeshing {
    readonly precision: number;
    readonly angularDeflection: number;
    readonly relativeDeflection: boolean;
    readonly keepMeshData: boolean;
    readonly allowQualityDecrease: boolean;
    readonly forceFaceDeflection: boolean;
    readonly upAxis: Inputs.Base.upAxisConversionEnum;
}

/**
 * What a renderer draws of a document's annotations, worked out once for all three: the polylines
 * to draw as lines, and the letters filled as one triangle mesh, `positions` holding three numbers
 * a corner and `indices` three corners a triangle. Without letters to fill the two lists are empty.
 * @beta
 */
export interface AnnotationsDrawing {
    /** The lines of every annotation, and in outline mode the loops of its letters, closed. */
    readonly lines: Inputs.Base.Point3[][];
    /** The corners of the filled letters, three numbers each. */
    readonly positions: number[];
    /** Three indexes into `positions`, counted in corners, for each triangle of the letters. */
    readonly indices: number[];
}
