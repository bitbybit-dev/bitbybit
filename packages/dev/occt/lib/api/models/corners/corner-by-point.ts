import { Base } from "../../inputs";

export type CornerClassification =
    "planar" | "developable" | "solid3d" | "tooFar" | "noVertex" | "notFound";

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

export interface CornerByPointReport {
    ok: boolean;
    modified: boolean;
    results: CornerResult[];
    error?: string;
}
