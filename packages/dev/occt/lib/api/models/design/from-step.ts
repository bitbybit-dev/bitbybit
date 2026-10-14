import type { DesignDocument } from "./document";

/**
 * A file the documents `design.fromStep` writes import, to be stored at `uri`, relative to where the
 * documents are kept: its `id` in the documents' `assets`, its SHA-256, its media type and its bytes.
 */
export interface DesignFromStepAsset {
    id: string;
    uri: string;
    sha256: string;
    mediaType: string;
    data: Uint8Array;
}

/**
 * What `design.fromStep` made of a STEP file: how many part and assembly documents, how many
 * components the assemblies place, and `notes`, one sentence for each thing it changed or left out,
 * such as a mirrored placement built into a part of its own or a part that holds no shape.
 */
export interface DesignFromStepReport {
    parts: number;
    assemblies: number;
    components: number;
    notes: string[];
}

/**
 * Design documents made of a STEP file: `documents`, with the id of the one that places everything,
 * `root` (a part document when the file holds one part alone), the `assets` they import, and a
 * `report`.
 */
export interface DesignFromStep {
    root: string;
    documents: DesignDocument[];
    assets: DesignFromStepAsset[];
    report: DesignFromStepReport;
}
