import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OCCTService } from "../../occ-service";
import { DesignCache, DesignOutcome } from "./cache";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";
import { FaceNames } from "./names";
import { DesignValues } from "./values";
import type { Rebinding } from "./hints";

/** A body as the build holds it: its face names, the hash of the feature that made it as it is, and the parameters what made it read. */
export interface BodyState {
    shape: TopoDS_Shape;
    names: FaceNames;
    hash: string;
    reads: Set<string>;
}

/** A sketch as the build holds it: per edge the command that drew it, and the way it faces. */
export interface SketchState {
    shape: TopoDS_Shape;
    commands: (string | undefined)[];
    normal: [number, number, number];
    frame: Inputs.Base.Frame;
    hash: string;
    reads: Set<string>;
    face?: Models.OCCT.DesignFaceReference | undefined;
}

/** What a feature resolved while it was made, kept for code that has to repeat it without the names. */
export interface DesignTrace {
    frame?: Inputs.Base.Frame;
    face?: boolean;
    indexes?: number[];
    sketchFace?: number;
    untilFace?: number;
    format?: string;
    join?: string;
    pull?: boolean;
}

/** The bytes or text of a document's assets, by asset id, as a build is given them. */
export type DesignAssetData = Readonly<Record<string, string | Uint8Array | ArrayBuffer>>;

/** What a build knows while it runs the features in order. */
export interface DesignRun {
    occt: OCCTService;
    occ: BitbybitOcctModule;
    cache: DesignCache;
    parameters: DesignValues;
    derived: ReadonlyMap<string, readonly string[]>;
    bodies: Map<string, BodyState>;
    sketches: Map<string, SketchState>;
    failed: Map<string, "failed" | "suppressed" | "pending">;
    suppressed: Set<string>;
    owners: Map<string, string>;
    declaredAssets: readonly Models.OCCT.DesignAsset[];
    assets?: DesignAssetData | undefined;
    order: string[];
    used: Set<string>;
    trace?: Map<string, DesignTrace> | undefined;
    rebinding: Rebinding;
    supplied: ReadonlyMap<string, Models.OCCT.DesignSuppliedOutcome<TopoDS_Shape>>;
    pending: Models.OCCT.DesignPendingScript<TopoDS_Shape>[];
}

/** What a feature reads, by key, and how it makes what it makes from them. */
export interface DesignPlan {
    reads: string[];
    make: () => DesignOutcome;
    salt?: string;
}

/** What a build is given besides the document: the package, the kernel and the cache it shares between builds. */
export interface DesignRunContext {
    occt: OCCTService;
    occ: BitbybitOcctModule;
    cache: DesignCache;
    assets?: DesignAssetData | undefined;
    /** The outcomes a larger build has used so far, when a run is one part of it: the run adds to them, and the larger build trims the cache once, at its end. */
    used?: Set<string> | undefined;
    /** Whether lost references with hints take the faces most like them (`report`) or only offer them (`never`, the default). */
    rebind?: "never" | "report" | undefined;
    /** When given, receives a hint for every face reference the run resolves, by its JSON pointer. */
    hints?: Map<string, Models.OCCT.DesignReferenceHint | null> | undefined;
    /** Outcomes the caller made or kept, taken instead of making the features whose hashes they carry. */
    outcomes?: readonly Models.OCCT.DesignSuppliedOutcome<TopoDS_Shape>[] | undefined;
    /** Whether the result lists the sketches the run drew. */
    sketches?: boolean | undefined;
}

/** The key a body is read and written by. */
export function bodyKey(name: string): string {
    return `body:${name}`;
}

/** The key a sketch is read and written by. */
export function sketchKey(id: string): string {
    return `sketch:${id}`;
}
