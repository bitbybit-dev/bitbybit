import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import type * as Resolved from "../../api/resolved-inputs";
import { occtDtoRegistry } from "../../api/dto-registry";
import type { OCCTService } from "../../occ-service";
import type { BaseBitByBit } from "../../base";
import { DesignCache, release } from "./cache";
import { hintedDocument } from "./hints";
import { featuresReached, runAssembly } from "./assembly";
import { DesignProgress } from "./progress";
import { assemblyIssues } from "./assembly-check";
import { versionOf } from "./identity";
import { libraryOf } from "./library";
import { documentIssues } from "./document-check";
import { probeRounding } from "./probe";
import { clashesOf } from "./clashes";
import type { DesignPicked } from "./reference-for";
import { referenceFor } from "./reference-for";
import { DesignProblem, isKernelTrap } from "./problems";
import { runDesign, runFeatures } from "./runner";
import { partStructureOf } from "./export-structure";
import type { DesignTrace } from "./state";
import { typescriptOf } from "./typescript-export";
import type { ParameterChoice } from "./values";

const CACHE_CAPACITY = 256;

const MAX_PROBE_ATTEMPTS = 64;

const PROBLEMS_LISTED = 5;

function pickedOf(faces: number[] | undefined, edges: number[] | undefined): DesignPicked {
    const [kind, indexes] = faces !== undefined && edges === undefined ? ["faces", faces] as const : edges !== undefined && faces === undefined ? ["edges", edges] as const : [undefined, []] as const;
    if (kind === undefined) {
        throw new InputError("Give the picked faces or the picked edges: one of the two, not both.", faces === undefined ? "faces" : "edges");
    }
    const wrong = indexes.find(index => !Number.isInteger(index) || index < 0);
    if (indexes.length === 0 || wrong !== undefined) {
        throw new InputError(`The picked ${kind} are indexes, whole numbers from 0, and at least one${wrong === undefined ? "" : `; ${wrong} is not one`}.`, kind);
    }
    return { kind, indexes };
}

/**
 * Builds parametric parts and assemblies kept as data: a part document holds typed parameters,
 * configurations, an ordered list of features and the parts they make, with materials, appearance,
 * properties such as part numbers and connectors; an assembly document places parts and other
 * assemblies, fastened by their connectors.
 *
 * Features find faces and edges by the feature that made them and the role it made them in, so a
 * reference keeps pointing at the same face when the parameters change. Sketches come from `sketch`,
 * the operations from `operations`, `booleans`, `fillets` and `features`.
 *
 * Experimental: the document format may still change before its first stable version, and
 * documents written before then are not migrated.
 * @beta
 */
export class OCCTDesign {
    private readonly cache = new DesignCache(CACHE_CAPACITY);

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly service: () => OCCTService,
        private readonly base: BaseBitByBit,
    ) {}

    /**
     * Checks a design document without building it and lists every problem found.
     *
     * Each problem carries the JSON pointer of the value it is about, such as `/features/2/radius`,
     * and a message. An assembly is checked with the `documents` it places, whose problems come
     * under their position, such as `/documents/2`. Undefined properties and bad expressions count.
     * @param inputs - The document to check
     * @returns The problems, empty when there are none
     * @group document
     * @shortname validate design
     * @drawable false
     * @example
     * ```typescript
     * const issues = await bitbybit.occt.design.validate({
     *     document: { schemaVersion: 1, parameters: { size: 10 }, features: [{ id: "block", type: "extrude", profile: "base", distance: "size" }] },
     * });
     * console.log(issues[0]?.path, issues[0]?.message);
     * ```
     */
    validate(inputs: Inputs.OCCT.DesignDocumentDto): Models.OCCT.DesignIssue[] {
        const { library, issues } = libraryOf(inputs.documents);
        const found = isAssembly(inputs.document) ? assemblyIssues(inputs.document, occtDtoRegistry, library) : documentIssues(inputs.document, occtDtoRegistry);
        const seen = new Set<string>();
        return [...issues, ...found].filter(issue => {
            const key = `${issue.path}\n${issue.message}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    /**
     * Works out the version of a design document, the value a component's `version` pins its source
     * with.
     *
     * The version is the SHA-256 of the document's canonical JSON (RFC 8785) without what only
     * editors and tools read, such as `meta` but its name, `extras`, labels, descriptions and
     * reference hints, so editing those keeps it.
     * @param inputs - The document; `documents` is not read
     * @returns The version, 64 lower-case hexadecimal digits
     * @group document
     * @shortname design version
     * @drawable false
     * @example
     * ```typescript
     * const version = await bitbybit.occt.design.versionOf({
     *     document: { schemaVersion: 1, id: "3f2c9a1e-5b7d-4e8f-9a0b-1c2d3e4f5a6b", features: [] },
     * });
     * console.log(version);
     * ```
     */
    versionOf(inputs: Inputs.OCCT.DesignDocumentDto): string {
        return versionOf(inputs.document);
    }

    /**
     * Builds the parts of a design document, with a configuration's values and then `parameters`
     * replacing the document's own.
     *
     * A document `validate` faults is refused. A failed feature is reported and what uses it
     * skipped; unchanged features are reused. `structure` exports the parts to STEP and glTF through
     * `assembly.manager.buildAssemblyDocument`; an assembly adds components and a bill of materials.
     * @param inputs - The document, the configuration and the parameter values to build it with
     * @returns The parts, a report per feature, the problems found after the features ran, and the parameter values used
     * @group document
     * @shortname build design
     * @drawable true
     * @example
     * ```typescript
     * const { parts, report } = await bitbybit.occt.design.build({
     *     document: { schemaVersion: 1, parameters: { width: 40, height: 10 }, features: [
     *         { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", length: "width" }, { type: "vLine", length: 20 }, { type: "hLine", length: "-width" }, { type: "close" }] },
     *         { id: "plate", type: "extrude", profile: "base", distance: "height" },
     *     ], parts: [{ id: "plate", body: "plate", properties: { partNumber: "PL-{width}x{height}" } }] },
     *     parameters: { width: 60 },
     * });
     * console.log(parts[0]?.properties.partNumber);
     * ```
     */
    build(inputs: Inputs.OCCT.DesignBuildDto<TopoDS_Shape>): Models.OCCT.DesignBuildResult<TopoDS_Shape> {
        this.refuseProblems(inputs.document, inputs.documents);
        const context = { occt: this.service(), occ: this.occ, base: this.base, cache: this.cache, assets: inputs.assets, rebind: inputs.rebind === Inputs.OCCT.designRebindEnum.report ? "report" as const : "never" as const, outcomes: inputs.outcomes, sketches: inputs.sketches === true };
        const document = inputs.document;
        if (document.kind === "assembly") {
            const { library } = libraryOf<Models.OCCT.DesignDocument>(inputs.documents);
            return this.inputProblems(() => runAssembly(document, this.choiceOf(inputs), library, { ...context, progress: new DesignProgress(featuresReached(document, library)) }));
        }
        return this.inputProblems(() => {
            const built = runDesign(document, this.choiceOf(inputs), { ...context, progress: new DesignProgress(document.features.length) });
            return { ...built, structure: partStructureOf(document, built.parts) };
        });
    }

    /**
     * Writes a hint onto every face reference of a part document: what the faces it resolves to are
     * like in a build with the configuration and values given, so a later build can find them again
     * by likeness if an edit loses their names.
     *
     * Hints record the body's box and, for each face, its surface type, its area and centre relative
     * to the body, its normal and the names of the faces next to it. They are left out of the
     * document's version, and a build reads them only for a reference whose faces are lost (see
     * `rebind`). A reference that resolves to different faces in different places, such as a connector
     * set's axis, gets no hint. Write them when a document is saved.
     * @param inputs - The part document, and the configuration, values and asset contents to build it with
     * @returns The document with a hint on every face reference the build resolved
     * @group document
     * @shortname design hints
     * @drawable false
     * @ignore true
     * @example
     * ```typescript
     * const hinted = await bitbybit.occt.design.withHints({
     *     document: { schemaVersion: 1, features: [
     *         { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", length: 4 }, { type: "vLine", length: 4 }, { type: "hLine", length: -4 }, { type: "close" }] },
     *         { id: "block", type: "extrude", profile: "base", distance: 2 },
     *     ], parts: [{ id: "block", body: "block", appearance: { faces: [{ faces: { of: "block", role: "end", count: 1 }, color: "#ff0000" }] } }] },
     * });
     * console.log(hinted.parts?.[0]?.appearance?.faces?.[0]?.faces.hint);
     * ```
     */
    withHints(inputs: Inputs.OCCT.DesignBuildDto<TopoDS_Shape>): Models.OCCT.DesignPartDocument {
        this.refuseProblems(inputs.document, inputs.documents);
        const document = inputs.document;
        if (document.kind === "assembly") {
            throw new InputError("Hints are written into part documents: write them into each document the assembly places.", "document");
        }
        const hints = new Map<string, Models.OCCT.DesignReferenceHint | null>();
        const cache = new DesignCache(0);
        try {
            const built = this.inputProblems(() => runDesign(document, this.choiceOf(inputs), { occt: this.service(), occ: this.occ, base: this.base, cache, assets: inputs.assets, hints, outcomes: inputs.outcomes }));
            built.parts.forEach(part => release(part.shape));
        } finally {
            cache.clear();
        }
        return hintedDocument(document, hints);
    }

    /**
     * Writes a design document as TypeScript that builds the same parts with this package's own
     * calls, for the configuration and parameter values given.
     *
     * Parameters become constants and expressions TypeScript over them, so dimensions stay editable.
     * The faces and edges features pick are written as the indexes this build finds. A document that
     * does not build with these values is refused.
     * @param inputs - The document, the configuration and the parameter values to write it for
     * @returns The TypeScript, ending with the parts drawn
     * @group document
     * @shortname design to typescript
     * @drawable false
     * @ignore true
     * @example
     * ```typescript
     * const code = await bitbybit.occt.design.toTypeScript({
     *     document: { schemaVersion: 1, parameters: { width: 40 }, features: [
     *         { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", length: "width" }, { type: "vLine", length: 20 }, { type: "hLine", length: "-width" }, { type: "close" }] },
     *         { id: "plate", type: "extrude", profile: "base", distance: 10 },
     *     ] },
     * });
     * console.log(code);
     * ```
     */
    toTypeScript(inputs: Inputs.OCCT.DesignBuildDto<TopoDS_Shape>): string {
        this.refuseProblems(inputs.document, inputs.documents);
        const document = inputs.document;
        if (document.kind === "assembly") {
            throw new InputError("An assembly document is not written as TypeScript yet: write the documents of its parts one by one.", "document");
        }
        const drawnApart = document.features.findIndex(feature => feature.type === "sketch" && (feature.loops !== undefined || (feature.pen ?? []).some(command => command.type === "circle")));
        if (drawnApart >= 0) {
            throw new InputError(`/features/${drawnApart}: a sketch with loops or a circle is not written as TypeScript yet`, "document");
        }
        const scripted = document.features.findIndex(feature => feature.type === "script");
        if (scripted >= 0) {
            throw new InputError(`/features/${scripted}: a script feature is not written as TypeScript: its code runs outside the kernel`, "document");
        }
        const choice = this.choiceOf(inputs);
        const cache = new DesignCache(0);
        const trace = new Map<string, DesignTrace>();
        try {
            return this.inputProblems(() => {
                const { run, report } = runFeatures(document, choice, { occt: this.service(), occ: this.occ, base: this.base, cache, assets: inputs.assets }, trace);
                const broken = report.filter(entry => entry.status === "failed" || entry.status === "skipped");
                if (broken.length > 0) {
                    const listed = broken.slice(0, PROBLEMS_LISTED).map(entry => `"${entry.id}": ${entry.messages.join("; ")}`).join("; ");
                    throw new InputError(`The design document does not build with these values, so it has no code: ${listed}${broken.length > PROBLEMS_LISTED ? "; and more" : ""}.`, "document");
                }
                return typescriptOf(document, run, trace, choice);
            });
        } finally {
            cache.clear();
        }
    }

    /**
     * Finds the placed parts of a design build that overlap, touch or come within `clearance` of each
     * other, such as a sleeve that runs into the arm it slides on.
     *
     * The document is built as `build` builds it and every part placement is checked against every
     * other in place. Two components a joint holds together are expected to touch, so a touch between
     * them is left out and an overlap is listed with `joined` true. A part document's parts are checked
     * where they were built.
     * @param inputs - The document, the documents an assembly places, the values to build with and the clearance
     * @returns The clashing pairs, with their distance, the volume they share and their nearest points
     * @group document
     * @shortname design clashes
     * @drawable false
     * @ignore true
     * @example
     * ```typescript
     * const clashes = await bitbybit.occt.design.clashes({ document: assembly, documents: [bracket, pin], clearance: 0.2 });
     * const overlaps = clashes.filter(clash => clash.volume > 0);
     * ```
     */
    clashes(inputs: Inputs.OCCT.DesignClashesDto): Models.OCCT.DesignClash[] {
        const resolved = resolveDto(Inputs.OCCT.DesignClashesDto, inputs) as Resolved.OCCT.DesignClashesDto;
        if (!Number.isFinite(resolved.clearance) || resolved.clearance < 0) {
            throw new InputError(`The clearance is a number from 0, not ${resolved.clearance}.`, "clearance");
        }
        const built = this.build({ document: resolved.document, documents: resolved.documents, configuration: resolved.configuration, parameters: resolved.parameters, assets: resolved.assets });
        try {
            return clashesOf(built, resolved.clearance, this.service());
        } finally {
            built.parts.forEach(part => release(part.shape));
        }
    }

    /**
     * Probes a fillet or chamfer feature of a part document: the faces and edges its reference
     * finds, and the largest radius or distance that builds a valid solid.
     *
     * The features before it are built with the values given, its reference is resolved without
     * checking counts, and values are tried, the document's own first, up to `maxAttempts`.
     * @param inputs - The document, the feature's id, the values to build with and how many values to try
     * @returns The faces and edges found, whether the document's value builds, and the range the largest value that builds lies in
     * @group document
     * @shortname probe design fillet
     * @drawable false
     * @ignore true
     * @example
     * ```typescript
     * const probe = await bitbybit.occt.design.probeFillet({
     *     document: { schemaVersion: 1, features: [
     *         { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", length: 40 }, { type: "vLine", length: 20 }, { type: "hLine", length: -40 }, { type: "close" }] },
     *         { id: "plate", type: "extrude", profile: "base", distance: 10 },
     *         { id: "round", type: "fillet", body: "plate", radius: 2, edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 } },
     *     ] },
     *     feature: "round",
     * });
     * console.log(probe.edges.length, probe.builds, probe.largest, probe.smallestFailing);
     * ```
     */
    probeFillet(inputs: Inputs.OCCT.DesignProbeFilletDto): Models.OCCT.DesignFilletProbe {
        const resolved = resolveDto(Inputs.OCCT.DesignProbeFilletDto, inputs) as Resolved.OCCT.DesignProbeFilletDto;
        this.refuseProblems(resolved.document, undefined);
        const document = resolved.document;
        if (document.kind === "assembly") {
            throw new InputError("A fillet is probed in a part document; an assembly document has no features.", "document");
        }
        if (!Number.isInteger(resolved.maxAttempts) || resolved.maxAttempts < 1 || resolved.maxAttempts > MAX_PROBE_ATTEMPTS) {
            throw new InputError(`maxAttempts is a whole number from 1 to ${MAX_PROBE_ATTEMPTS}, not ${resolved.maxAttempts}.`, "maxAttempts");
        }
        const context = { occt: this.service(), occ: this.occ, base: this.base, cache: this.cache, assets: resolved.assets };
        return this.inputProblems(() => probeRounding(document, this.choiceOf(resolved), context, resolved.feature, resolved.maxAttempts));
    }

    /**
     * Names faces or edges picked on a built body the way a document stores them: a reference by the
     * names of the features that made them, narrowed by an axis filter when names alone do not single
     * them out, with their count and a hint of what the faces are like, so a build can find them again
     * by likeness if their names are lost.
     *
     * With `nudge`, the default, the document is built again with each number the body depends on
     * moved a little, at most eight of them; `lost` lists those after which the reference no longer
     * finds elements like the picked ones. `refused` says why no reference names the picks.
     * @param inputs - The document, the body, the picked faces or edges and the values to build it with
     * @returns The reference or why there is none, the numbers it was checked against and those it lost its elements to
     * @group document
     * @shortname design reference for
     * @drawable false
     * @ignore true
     * @example
     * ```typescript
     * const found = await bitbybit.occt.design.referenceFor({
     *     document: { schemaVersion: 1, parameters: { height: 10 }, features: [
     *         { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", length: 40 }, { type: "vLine", length: 20 }, { type: "hLine", length: -40 }, { type: "close" }] },
     *         { id: "plate", type: "extrude", profile: "base", distance: "height" },
     *     ] },
     *     body: "plate",
     *     faces: [1],
     * });
     * console.log(found.reference, found.lost);
     * ```
     */
    referenceFor(inputs: Inputs.OCCT.DesignReferenceForDto): Models.OCCT.DesignReferenceFound {
        const resolved = resolveDto(Inputs.OCCT.DesignReferenceForDto, inputs) as Resolved.OCCT.DesignReferenceForDto;
        this.refuseProblems(resolved.document, undefined);
        const document = resolved.document;
        if (document.kind === "assembly") {
            throw new InputError("Faces and edges are named in part documents; an assembly document has no bodies.", "document");
        }
        const picked = pickedOf(resolved.faces, resolved.edges);
        const context = { occt: this.service(), occ: this.occ, base: this.base, cache: this.cache, assets: resolved.assets };
        return this.inputProblems(() => referenceFor(document, this.choiceOf(resolved), context, resolved.body, picked, resolved.nudge));
    }

    private choiceOf(inputs: Pick<Inputs.OCCT.DesignBuildDto<unknown>, "configuration" | "parameters">): ParameterChoice {
        return { configuration: inputs.configuration === "" ? undefined : inputs.configuration, overrides: inputs.parameters };
    }

    private refuseProblems(document: Models.OCCT.DesignDocument, documents: Models.OCCT.DesignDocument[] | undefined): void {
        const issues = this.validate({ document, documents });
        if (issues.length > 0) {
            const listed = issues.slice(0, PROBLEMS_LISTED).map(issue => `${issue.path === "" ? "/" : issue.path}: ${issue.message}`).join("; ");
            throw new InputError(`The design document has ${issues.length === 1 ? "a problem" : `${issues.length} problems`}: ${listed}${issues.length > PROBLEMS_LISTED ? "; and more" : ""}.`, "document");
        }
    }

    private inputProblems<T>(run: () => T): T {
        try {
            return run();
        } catch (error) {
            if (isKernelTrap(error)) {
                this.cache.forget();
            }
            if (error instanceof DesignProblem) {
                throw new InputError(`${error.path}: ${error.message}.`, error.path.startsWith("/configurations") ? "configuration" : "parameters");
            }
            throw error;
        }
    }
}

function isAssembly(document: unknown): document is Record<string, unknown> {
    return typeof document === "object" && document !== null && (document as Record<string, unknown>)["kind"] === "assembly";
}
