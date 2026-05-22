import { Base } from "../../inputs";

/**
 * Imported part definition for cross-document reuse.
 * 
 * Copies a label (or the full free-shapes root) from a source document into the new
 * assembly document, preserving sub-assembly hierarchy, names and colors. The copied
 * root becomes a part referenceable by `partId` from instance nodes, letting a STEP-loaded
 * assembly be placed multiple times in a new assembly.
 */
export interface AssemblyLoadedPartDef {
    /** Unique identifier for referencing this part from instance nodes (via partId) */
    id: string;
    /** Index into the sourceDocuments array passed to buildAssemblyDocument */
    sourceDocumentIndex: number;
    /**
     * OCAF entry string of the label to copy from the source document
     * (e.g. "0:1:1:1"). If omitted, all free shapes of the source document
     * are imported (wrapped in a new assembly compound when there are multiple).
     */
    sourceLabel?: string;
    /** Optional name override applied to the imported root label */
    name?: string;
    /** Optional color override applied to the imported root label */
    colorRgba?: Base.ColorRGBA;
}
