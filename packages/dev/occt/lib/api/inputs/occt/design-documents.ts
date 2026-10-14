import type { Base } from "@bitbybit-dev/base";
import type * as Models from "../../models";
import type { designRebindEnum } from "./enums";

/**
 * A design document, with the documents an assembly places, for `design.validate`, which checks them
 * without building anything.
 */
export class DesignDocumentDto {
    constructor(document?: Models.OCCT.DesignDocument, documents?: Models.OCCT.DesignDocument[]) {
        if (document !== undefined) { this.document = document; }
        if (documents !== undefined) { this.documents = documents; }
    }
    /**
     * The document: a part document with its `parameters`, `features` and `parts`, or an assembly
     * document with its `components`.
     * @default undefined
     */
    document!: Models.OCCT.DesignDocument;
    /**
     * The documents an assembly's components place, each with the `id` they name it by; their
     * problems are listed under their position, such as `/documents/2`.
     * @default undefined
     * @optional true
     */
    documents?: Models.OCCT.DesignDocument[] | undefined;
}

/**
 * A design document with the configuration, parameter values, asset contents and the documents an
 * assembly places, for `design.build`, which builds it, and `design.toTypeScript`, which writes a part
 * document as code.
 */
export class DesignBuildDto<T> {
    constructor(document?: Models.OCCT.DesignDocument, configuration?: string, parameters?: Record<string, number | string | boolean>, assets?: Record<string, string | Uint8Array | ArrayBuffer>, documents?: Models.OCCT.DesignDocument[], rebind?: designRebindEnum, outcomes?: Models.OCCT.DesignSuppliedOutcome<T>[], sketches?: boolean) {
        if (document !== undefined) { this.document = document; }
        if (configuration !== undefined) { this.configuration = configuration; }
        if (parameters !== undefined) { this.parameters = parameters; }
        if (assets !== undefined) { this.assets = assets; }
        if (documents !== undefined) { this.documents = documents; }
        if (rebind !== undefined) { this.rebind = rebind; }
        if (outcomes !== undefined) { this.outcomes = outcomes; }
        if (sketches !== undefined) { this.sketches = sketches; }
    }
    /**
     * The document: a part document with its `parameters`, `features` and `parts`, or an assembly
     * document with its `components`.
     * @default undefined
     */
    document!: Models.OCCT.DesignDocument;
    /**
     * The id of one of the document's `configurations`, whose values replace the parameters' own;
     * left out or empty, none is used.
     * @default undefined
     * @optional true
     */
    configuration?: string | undefined;
    /**
     * Values that replace the parameters of the same names after the configuration's, each read as
     * the parameter's own value is, such as `{ width: 40 }`.
     * @default undefined
     * @optional true
     */
    parameters?: Record<string, number | string | boolean> | undefined;
    /**
     * The contents of the document's `assets` by asset id, as text or bytes, for the features that
     * import them; each is checked against the SHA-256 the document records.
     * @default undefined
     * @optional true
     */
    assets?: Record<string, string | Uint8Array | ArrayBuffer> | undefined;
    /**
     * The documents an assembly's components place, each with the `id` they name it by.
     * @default undefined
     * @optional true
     */
    documents?: Models.OCCT.DesignDocument[] | undefined;
    /**
     * When a hinted reference loses its faces: `never` fails and offers the faces most like its hint
     * as repairs; `report` takes them, if they stand clear, and reports `rebound`.
     * @default undefined
     * @optional true
     */
    rebind?: designRebindEnum | undefined;
    /**
     * Outcomes the caller made for features the build lists as `pending`, such as scripts, or kept from an
     * earlier build, each under the hash of the feature it is for; the build takes them instead of
     * making those features.
     * @default undefined
     * @optional true
     * @ignore true
     */
    outcomes?: Models.OCCT.DesignSuppliedOutcome<T>[] | undefined;
    /**
     * Whether a part document's build also lists its `sketches`: each one's outline, the frame it was
     * drawn in and the command that drew each edge, for editors that draw and edit sketches.
     * @default undefined
     * @optional true
     * @ignore true
     */
    sketches?: boolean | undefined;
}

/**
 * A part document with the configuration, parameter values and asset contents to build it with, the
 * fillet or chamfer feature to probe and how many values to try, for `design.probeFillet`.
 */
export class DesignProbeFilletDto {
    constructor(document?: Models.OCCT.DesignDocument, feature?: string, configuration?: string, parameters?: Record<string, number | string | boolean>, assets?: Record<string, string | Uint8Array | ArrayBuffer>, maxAttempts?: number) {
        if (document !== undefined) { this.document = document; }
        if (feature !== undefined) { this.feature = feature; }
        if (configuration !== undefined) { this.configuration = configuration; }
        if (parameters !== undefined) { this.parameters = parameters; }
        if (assets !== undefined) { this.assets = assets; }
        if (maxAttempts !== undefined) { this.maxAttempts = maxAttempts; }
    }
    /**
     * The part document with its `parameters`, `features` and `parts`.
     * @default undefined
     */
    document!: Models.OCCT.DesignDocument;
    /**
     * The id of the fillet or chamfer feature to probe.
     * @default undefined
     */
    feature!: string;
    /**
     * The id of one of the document's `configurations`, whose values replace the parameters' own;
     * left out or empty, none is used.
     * @default undefined
     * @optional true
     */
    configuration?: string | undefined;
    /**
     * Values that replace the parameters of the same names after the configuration's, each read as
     * the parameter's own value is, such as `{ width: 40 }`.
     * @default undefined
     * @optional true
     */
    parameters?: Record<string, number | string | boolean> | undefined;
    /**
     * The contents of the document's `assets` by asset id, as text or bytes, for the features that
     * import them.
     * @default undefined
     * @optional true
     */
    assets?: Record<string, string | Uint8Array | ArrayBuffer> | undefined;
    /**
     * How many radii or distances to try at most, from 1 to 64, starting with the document's own;
     * each try makes the fillet or chamfer once.
     * @default 16
     * @minimum 1
     * @maximum 64
     * @step 1
     */
    maxAttempts?: number | undefined = 16;
}

/**
 * A part document with the configuration, parameter values and asset contents to build it with, a
 * body of it and faces or edges picked on that body, for `design.referenceFor`, which names them.
 */
export class DesignReferenceForDto {
    constructor(document?: Models.OCCT.DesignDocument, body?: string, faces?: number[], edges?: number[], configuration?: string, parameters?: Record<string, number | string | boolean>, assets?: Record<string, string | Uint8Array | ArrayBuffer>, nudge?: boolean) {
        if (document !== undefined) { this.document = document; }
        if (body !== undefined) { this.body = body; }
        if (faces !== undefined) { this.faces = faces; }
        if (edges !== undefined) { this.edges = edges; }
        if (configuration !== undefined) { this.configuration = configuration; }
        if (parameters !== undefined) { this.parameters = parameters; }
        if (assets !== undefined) { this.assets = assets; }
        if (nudge !== undefined) { this.nudge = nudge; }
    }
    /**
     * The part document with its `parameters`, `features` and `parts`.
     * @default undefined
     */
    document!: Models.OCCT.DesignDocument;
    /**
     * The body the elements were picked on, by the id of the feature that started it, as a part's
     * `body` names it.
     * @default undefined
     */
    body!: string;
    /**
     * The picked faces of the body, as indexes from 0; give these or `edges`.
     * @default undefined
     * @optional true
     */
    faces?: number[] | undefined;
    /**
     * The picked edges of the body, as indexes from 0; give these or `faces`.
     * @default undefined
     * @optional true
     */
    edges?: number[] | undefined;
    /**
     * The id of one of the document's `configurations`, whose values replace the parameters' own;
     * left out or empty, none is used.
     * @default undefined
     * @optional true
     */
    configuration?: string | undefined;
    /**
     * Values that replace the parameters of the same names after the configuration's, each read as
     * the parameter's own value is, such as `{ width: 40 }`.
     * @default undefined
     * @optional true
     */
    parameters?: Record<string, number | string | boolean> | undefined;
    /**
     * The contents of the document's `assets` by asset id, as text or bytes, for the features that
     * import them.
     * @default undefined
     * @optional true
     */
    assets?: Record<string, string | Uint8Array | ArrayBuffer> | undefined;
    /**
     * Whether to check the reference by building again with each number parameter the body depends
     * on moved a little, one at a time.
     * @default true
     */
    nudge?: boolean | undefined = true;
}

/**
 * A design document with the configuration, parameter values, asset contents and the documents an
 * assembly places, and the clearance to keep, for `design.clashes`, which finds the placed parts that
 * overlap or come too close.
 */
export class DesignClashesDto {
    constructor(document?: Models.OCCT.DesignDocument, documents?: Models.OCCT.DesignDocument[], configuration?: string, parameters?: Record<string, number | string | boolean>, assets?: Record<string, string | Uint8Array | ArrayBuffer>, clearance?: number) {
        if (document !== undefined) { this.document = document; }
        if (documents !== undefined) { this.documents = documents; }
        if (configuration !== undefined) { this.configuration = configuration; }
        if (parameters !== undefined) { this.parameters = parameters; }
        if (assets !== undefined) { this.assets = assets; }
        if (clearance !== undefined) { this.clearance = clearance; }
    }
    /**
     * The document: an assembly document with its `components`, or a part document whose parts are
     * checked where they were built.
     * @default undefined
     */
    document!: Models.OCCT.DesignDocument;
    /**
     * The documents an assembly's components place, each with the `id` they name it by.
     * @default undefined
     * @optional true
     */
    documents?: Models.OCCT.DesignDocument[] | undefined;
    /**
     * The id of one of the document's `configurations`, whose values replace the parameters' own;
     * left out or empty, none is used.
     * @default undefined
     * @optional true
     */
    configuration?: string | undefined;
    /**
     * Values that replace the parameters of the same names after the configuration's, each read as
     * the parameter's own value is, such as `{ width: 40 }`.
     * @default undefined
     * @optional true
     */
    parameters?: Record<string, number | string | boolean> | undefined;
    /**
     * The contents of the document's `assets` by asset id, as text or bytes, for the features that
     * import them.
     * @default undefined
     * @optional true
     */
    assets?: Record<string, string | Uint8Array | ArrayBuffer> | undefined;
    /**
     * How close two placed parts may come before they clash; 0 reports only parts that touch or
     * overlap.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    clearance?: number | undefined = 0;
}


/**
 * A STEP file, its name, the seed of the ids and the folder of the shapes file, for
 * `design.fromStep`, which turns the file into design documents.
 */
export class DesignFromStepDto {
    constructor(step?: string | Uint8Array | ArrayBuffer, name?: string, seed?: string, folder?: string) {
        if (step !== undefined) { this.step = step; }
        if (name !== undefined) { this.name = name; }
        if (seed !== undefined) { this.seed = seed; }
        if (folder !== undefined) { this.folder = folder; }
    }
    /**
     * The STEP file, as text or bytes.
     * @default undefined
     */
    step!: string | Uint8Array | ArrayBuffer;
    /**
     * The file's name, which names the shapes file, a lone part or assembly the file leaves unnamed,
     * and the assembly that places shapes the file holds side by side.
     * @default model.step
     */
    name?: string | undefined = "model.step";
    /**
     * Text mixed into the documents' ids: the same file and seed give the same ids, so a second
     * import replaces the first; another seed makes a copy.
     * @default
     */
    seed?: string | undefined = "";
    /**
     * The folder of the shapes file's `uri`, relative to the documents, such as `assets`; empty
     * keeps the file beside them.
     * @default
     */
    folder?: string | undefined = "";
}

/**
 * A design build and the frame whose plane cuts it, for `design.section`, which gives the faces where
 * the plane passes through the parts and, when asked, what is left of the parts behind it.
 */
export class DesignSectionDto<T> {
    constructor(build?: Models.OCCT.DesignSectionSource<T>, frame?: Base.Frame, cut?: boolean, tolerance?: number) {
        if (build !== undefined) { this.build = build; }
        if (frame !== undefined) { this.frame = frame; }
        if (cut !== undefined) { this.cut = cut; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The build to cut, as `design.build` returns it: its `parts` and, for an assembly, the
     * `components` that place them.
     * @default undefined
     */
    build!: Models.OCCT.DesignSectionSource<T>;
    /**
     * The plane to cut along, through the frame's origin: what lies on the side its normal points to
     * is taken away.
     * @default undefined
     */
    frame!: Base.Frame;
    /**
     * Whether to give, besides the caps, the pieces of the parts the plane cuts and the parts that
     * lie wholly behind it, for a view of the cut model.
     * @default false
     */
    cut?: boolean | undefined = false;
    /**
     * How close the ends of two section edges must lie to be joined, in model units.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance?: number | undefined = 1e-7;
}
