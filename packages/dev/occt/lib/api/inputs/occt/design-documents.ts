// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import * as Models from "../../models";
import { designRebindEnum } from "./enums";

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
