import { Base } from "../../inputs";

/**
 * What kind of corner was found at a point: planar, where the meeting faces are flat;
 * developable, where the surface can be flattened without stretching; solid3d, a genuine
 * three-dimensional corner; or one of the three failures - tooFar, noVertex and notFound - meaning
 * no corner was located near the point given.
 */
export type CornerClassification =
    "planar" | "developable" | "solid3d" | "tooFar" | "noVertex" | "notFound";

/**
 * One corner found by a point query: where it is, how far it was from the point you asked about,
 * how many edges and faces meet there, how it was classified, what was done to it, and whether
 * that succeeded. Read classification and applied together - a corner can be found and still be
 * left untouched if its kind does not support the operation.
 */
export interface CornerResult {
    index: number;
    point: Base.Point3;
    snapDistance: number;
    valence: number;
    incidentFaces: number;
    classification: CornerClassification;
    action: string;
    taperFactor: number;
    applied: boolean;
    message: string;
}

/**
 * The result of a corner-by-point operation across several points: whether it succeeded, whether
 * the shape was actually modified, and one CornerResult per point. modified is false when every
 * corner was found but none could be treated.
 */
export interface CornerByPointReport {
    ok: boolean;
    modified: boolean;
    results: CornerResult[];
    error?: string;
}
