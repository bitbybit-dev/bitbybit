import type { BitbybitSettings } from "@bitbybit-dev/base";
import type { Handle_TDocStd_Document } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import type { DocumentReference, DocumentReferences, EntityReference, ShapeReference } from "./constants";
import { DOCUMENT_LABEL_SETTING_FUNCTIONS, MAX_DOCUMENT_VERSIONS_KEPT, MAX_DOCUMENT_VERSION_LABELS, isDocumentReference, isEntityReference, isShapeReference } from "./constants";
import { isDocumentHandle, releaseMadeObjects } from "./kernel-objects";

const WEBASSEMBLY_TRAP = "RuntimeError";

const INPUT_REFUSAL = "InputError";

/**
 * How a version of an assembly document is made again: the change that made it, applied to the
 * version it was made from.
 */
export interface VersionRecipe {
    /** The key of the version the change applied to, or of the document as its creating call made it */
    readonly parent: string;
    /** The key of the document as its creating call made it, the first of the line of versions */
    readonly original: string;
    /** The dotted path of the change */
    readonly functionName: string;
    /** The input that names the document the change applies to */
    readonly property: string;
    /** The change's inputs as the call was keyed, every document reference naming the version it read */
    readonly inputs: Record<string, unknown>;
    /** The settings the change ran under */
    readonly settings: BitbybitSettings;
    /** False when the inputs name kernel objects besides the document, which making the version again needs cached */
    readonly replayable: boolean;
}

/**
 * A change about to make a version: its key, the key of the call that makes it, and what makes it
 * again.
 */
export interface VersionToMake {
    /** The version's key, which the call answers a reference to */
    readonly version: string | number;
    /** The key of the call, whose cached answer names the version */
    readonly call: string | number;
    /** The key of the version the change applies to, or of the document as made */
    readonly parent: string | number;
    /** The dotted path of the change */
    readonly functionName: string;
    /** The input that names the document the change applies to */
    readonly property: string;
    /** The change's inputs as the call was keyed */
    readonly inputs: Record<string, unknown>;
    /** The settings the change runs under */
    readonly settings: BitbybitSettings;
    /** How the call reads document references */
    readonly references: DocumentReferences;
}

/** What making versions needs from the kernel. */
export interface DocumentKernel {
    /** A copy of a document: every label at its entry, the geometry shared */
    copy(document: Handle_TDocStd_Document): Handle_TDocStd_Document;
    /** Runs the change of `recipe` on `document`, with the settings it ran under, and answers what the change answered */
    replay(recipe: VersionRecipe, document: Handle_TDocStd_Document): unknown;
    /** How many labels a document holds, counted towards `MAX_DOCUMENT_VERSION_LABELS` in every version kept */
    weigh(document: Handle_TDocStd_Document): number;
}

/** What the versions need from the cache that answers the calls. */
export interface VersionHost {
    /** The document a creating call made, cached under `hash`, or nothing once it is gone */
    original(hash: string): unknown;
    /** Forgets the cached answer of the call keyed `hash`, which named a version that is gone */
    forgetCall(hash: string | number): void;
    /** True while the cache holds the shape or other kernel object a reference with `hash` names */
    holds(hash: string | number): boolean;
}

interface VersionEntry {
    readonly recipe: VersionRecipe;
    readonly call: string | number;
    readonly labels: number;
}

interface KeptVersion {
    readonly object: Handle_TDocStd_Document;
    readonly entry: VersionEntry;
}

interface AnsweredUndo {
    readonly kind: "answered";
    readonly original: string;
    readonly latest: string | number | undefined;
}

interface MadeUndo {
    readonly kind: "made";
    readonly version: string;
    readonly entry: VersionEntry;
}

interface RebuiltUndo {
    readonly kind: "rebuilt";
    readonly version: string;
    readonly object: Handle_TDocStd_Document;
}

type Undo = AnsweredUndo | MadeUndo | RebuiltUndo;

interface Ancestry {
    readonly base: Handle_TDocStd_Document;
    readonly chain: readonly VersionRecipe[];
}

const isOpaque = (value: object): boolean => ArrayBuffer.isView(value) || value instanceof ArrayBuffer || "$$" in value;

const isNumberList = (value: readonly unknown[]): boolean => {
    const first = value[0];
    return typeof first === "number" || (Array.isArray(first) && isNumberList(first));
};

type KernelObjectReference = ShapeReference | DocumentReference | EntityReference;

const referencesIn = (value: unknown): KernelObjectReference[] => {
    if (value === null || typeof value !== "object" || isOpaque(value)) {
        return [];
    }
    if (isShapeReference(value) || isDocumentReference(value) || isEntityReference(value)) {
        return [value];
    }
    if (Array.isArray(value)) {
        return isNumberList(value) ? [] : value.flatMap(referencesIn);
    }
    return Object.values(value).flatMap(referencesIn);
};

const othersOf = (inputs: Record<string, unknown>, property: string): Record<string, unknown> => Object.fromEntries(Object.entries(inputs).filter(([name]) => name !== property));

const isTrap = (failure: unknown): boolean => failure instanceof Error && failure.name === WEBASSEMBLY_TRAP;

const isRefusal = (failure: unknown): boolean => failure instanceof Error && failure.name === INPUT_REFUSAL;

const unmakeable = (recipe: VersionRecipe): Error => new Error(`A version of an assembly document was made by '${recipe.functionName}' from shapes or other kernel objects the worker no longer keeps, and the worker freed its copy of that version, so it cannot be made again. Run '${recipe.functionName}' again with shapes that are kept.`);

const free = (object: Handle_TDocStd_Document): void => {
    try {
        object.delete();
    } catch {
    }
};

const freeUnlessTrapped = (object: Handle_TDocStd_Document, failure: unknown): void => {
    if (!isTrap(failure)) {
        free(object);
    }
};

/**
 * The versions of assembly documents the worker's changes made. A version is a recipe: the change
 * that made it, applied to the version it was made from, back to the document as its creating call
 * made it. Some versions are also kept as kernel objects, at most `MAX_DOCUMENT_VERSIONS_KEPT` of one
 * document and `MAX_DOCUMENT_VERSION_LABELS` labels of all, each version weighed by the labels it
 * holds, the least recently used freed first once a call has been answered; a version read while it
 * is not kept is made again from the nearest one that is, or from the document as made. A version
 * whose change names kernel objects besides its document needs them cached to be made again: the
 * bounds free it only while the cache holds every one of them, and a read of it once one is gone is
 * refused, saying so. A change sent under `latest` that applies to the version a reference to the
 * document reads in this run takes that version's kept object over instead of copying it, so a
 * script that changes a document again and again keeps one copy; the version it read stays a recipe.
 * A change refuses its inputs (an `InputError`) before it changes anything, so a refused change
 * hands the object it took over back to the version it read.
 */
export class DocumentVersions {
    private readonly versions = new Map<string, VersionEntry>();
    private readonly families = new Map<string, Map<string, VersionEntry>>();
    private readonly objects = new Map<string, KeptVersion>();
    private readonly weights = new Map<string, number>();
    private readonly latest = new Map<string, string | number>();
    private readonly usedInCall = new Set<string>();
    private journal: Undo[] = [];
    private kernel: DocumentKernel | undefined;

    /**
     * @param host - The cache that answers the calls, which holds the documents as made
     */
    constructor(private readonly host: VersionHost) { }

    /** Gives the versions the kernel they copy documents with and make versions again on. */
    useKernel(kernel: DocumentKernel): void {
        this.kernel = kernel;
    }

    /** True when `hash` is the key of a version a change made, kept as an object or not. */
    has(hash: string | number): boolean {
        return this.versions.has(String(hash));
    }

    /** How many versions are kept as kernel objects now. */
    get kept(): number {
        return this.objects.size;
    }

    /** The key of the document as its creating call made it, of which `hash` is a version, or `hash` itself. */
    originalOf(hash: string | number): string {
        return this.versions.get(String(hash))?.recipe.original ?? String(hash);
    }

    /**
     * The key of the version a reference to `hash` reads with `references`: a version is read
     * exactly, and so is a document as made with `exact`; with `latest` a document as made reads as
     * the version the last change under `latest` made of it in this run, if any.
     */
    versionRead(hash: string | number, references: DocumentReferences): string | number {
        if (references === "exact" || this.has(hash)) {
            return hash;
        }
        return this.latest.get(String(hash)) ?? hash;
    }

    /**
     * `value` with every document reference in it, at any depth, naming the version it reads
     * (`versionRead`). Objects are copied only along the way to a reference that changes, and bytes,
     * buffers and lists of numbers are passed over, so a value that names no changed document comes
     * back as it was, and with `exact`, or before any change under `latest`, nothing is walked.
     */
    atVersionsRead<T>(value: T, references: DocumentReferences): T {
        return references === "exact" || this.latest.size === 0 ? value : this.withVersionsRead(value) as T;
    }

    /** The kept object of version `hash`, without making it again, or nothing. */
    objectAt(hash: string | number): Handle_TDocStd_Document | undefined {
        return this.objects.get(String(hash))?.object;
    }

    /**
     * The object of version `hash`: the kept one, or one made again from its recipes on a copy of the
     * nearest version kept, or of the document as made, and then kept. Nothing when `hash` is no
     * version, or when the version it would be made from is gone.
     * @throws Error when a change it would be made again from named kernel objects the cache no longer holds
     */
    documentAt(hash: string | number): Handle_TDocStd_Document | undefined {
        const key = String(hash);
        const kept = this.objects.get(key);
        if (kept !== undefined) {
            this.keep(key, kept);
            return kept.object;
        }
        const entry = this.versions.get(key);
        return entry === undefined ? undefined : this.madeAgain(key, entry);
    }

    /**
     * Makes the version `made` names by running its change on `parent`, the object of the version it
     * applies to: on that object itself when the change takes it over, otherwise on a copy. The
     * change must answer a document; a failure frees what it made, a copy or the object taken over.
     * @param made - The version to make
     * @param parent - The object of the version or document the change applies to
     * @param run - Runs the change on a document and answers what it answered
     */
    make(made: VersionToMake, parent: Handle_TDocStd_Document, run: (document: Handle_TDocStd_Document) => unknown): void {
        const kernel = this.requiredKernel();
        const parentKey = String(made.parent);
        const original = this.originalOf(parentKey);
        const recipe: VersionRecipe = { parent: parentKey, original, functionName: made.functionName, property: made.property, inputs: made.inputs, settings: made.settings, replayable: referencesIn(othersOf(made.inputs, made.property)).length === 0 };
        const keepsLabels = DOCUMENT_LABEL_SETTING_FUNCTIONS.has(made.functionName);
        const parentLabels = keepsLabels ? this.weightOf(parentKey, parent) : 0;
        const parentKept = this.objects.get(parentKey);
        const takenOver = recipe.replayable
            && made.references === "latest"
            && parentKept !== undefined
            && parentKept.entry.recipe.replayable
            && String(this.latest.get(original)) === parentKey;
        if (takenOver) {
            this.objects.delete(parentKey);
        }
        let document: Handle_TDocStd_Document;
        try {
            document = this.applied(made.functionName, takenOver ? parent : kernel.copy(parent), run, takenOver);
        } catch (failure) {
            if (takenOver && parentKept !== undefined && isRefusal(failure)) {
                this.objects.set(parentKey, parentKept);
            }
            throw failure;
        }
        const key = String(made.version);
        const entry: VersionEntry = { recipe, call: made.call, labels: keepsLabels ? parentLabels : kernel.weigh(document) };
        this.versions.set(key, entry);
        this.familyOf(original).set(key, entry);
        this.journal.push({ kind: "made", version: key, entry });
        Reflect.set(document, "hash", made.version);
        this.keep(key, { object: document, entry });
    }

    /**
     * Notes that a change answered version `hash`, made now or before: with `latest`, it is the
     * version a reference to the document as made reads from now on in this run.
     */
    answered(hash: string | number, references: DocumentReferences): void {
        if (references === "exact") {
            return;
        }
        const original = this.originalOf(hash);
        this.journal.push({ kind: "answered", original, latest: this.latest.get(original) });
        this.latest.set(original, hash);
    }

    /** Frees the kept object of version `hash`; the version stays, made again when read. */
    release(hash: string | number): void {
        const key = String(hash);
        const kept = this.objects.get(key);
        if (kept !== undefined) {
            this.objects.delete(key);
            free(kept.object);
        }
    }

    /**
     * Forgets every version of the document as made under `original`: frees what is kept, forgets
     * the recipes and the cached answers of the calls that made them.
     */
    forgetFamily(original: string | number): void {
        const key = String(original);
        this.families.get(key)?.forEach((entry, version) => this.forget(version, entry));
        this.families.delete(key);
        this.weights.delete(key);
        this.latest.delete(key);
    }

    /** Begins a run: no document as made reads a version, and no change takes one over, until a change of the run under `latest` answers one. */
    beginRun(): void {
        this.latest.clear();
    }

    /** Begins a call, whose changes `abandonCall` undoes. */
    beginCall(): void {
        this.journal = [];
        this.usedInCall.clear();
    }

    /** Keeps what the call that ended made, and frees kept versions beyond the bounds, never one the call used. */
    settleCall(): void {
        this.journal = [];
        this.trim();
        this.usedInCall.clear();
    }

    /**
     * Undoes what the call made of versions: a version it made is forgotten, one it made again is
     * freed, and the document a change of it answered under `latest` reads as it did before.
     */
    abandonCall(): void {
        [...this.journal].reverse().forEach(undo => this.undo(undo));
        this.journal = [];
        this.usedInCall.clear();
    }

    /** Frees every kept version and forgets every version. */
    clear(): void {
        this.objects.forEach(kept => free(kept.object));
        this.objects.clear();
        this.versions.clear();
        this.families.clear();
        this.weights.clear();
        this.latest.clear();
        this.journal = [];
        this.usedInCall.clear();
    }

    private requiredKernel(): DocumentKernel {
        if (this.kernel === undefined) {
            throw new Error("No kernel was given to make assembly document versions with.");
        }
        return this.kernel;
    }

    private familyOf(original: string): Map<string, VersionEntry> {
        const family = this.families.get(original) ?? new Map<string, VersionEntry>();
        this.families.set(original, family);
        return family;
    }

    private keep(key: string, kept: KeptVersion): void {
        this.objects.delete(key);
        this.objects.set(key, kept);
        this.usedInCall.add(key);
    }

    private weightOf(key: string, object: Handle_TDocStd_Document): number {
        const labels = this.versions.get(key)?.labels ?? this.weights.get(key) ?? this.requiredKernel().weigh(object);
        if (!this.has(key)) {
            this.weights.set(key, labels);
        }
        return labels;
    }

    private applied(functionName: string, working: Handle_TDocStd_Document, run: (document: Handle_TDocStd_Document) => unknown, keptOnRefusal = false): Handle_TDocStd_Document {
        let answered: unknown;
        try {
            answered = run(working);
        } catch (failure) {
            if (!(keptOnRefusal && isRefusal(failure))) {
                freeUnlessTrapped(working, failure);
            }
            throw failure;
        }
        if (!isDocumentHandle(answered)) {
            releaseMadeObjects(answered, working);
            free(working);
            throw new Error(`OCCT '${functionName}' changes a document but answered something else, so nothing it made was kept.`);
        }
        if (answered !== working) {
            free(working);
        }
        return answered as Handle_TDocStd_Document;
    }

    private madeAgain(key: string, entry: VersionEntry): Handle_TDocStd_Document | undefined {
        const ancestry = this.ancestryOf(entry.recipe);
        if (ancestry === undefined) {
            return undefined;
        }
        const lost = ancestry.chain.find(recipe => !recipe.replayable && !this.objectsHeld(recipe));
        if (lost !== undefined) {
            throw unmakeable(lost);
        }
        const kernel = this.requiredKernel();
        let document = kernel.copy(ancestry.base);
        for (const recipe of ancestry.chain) {
            document = this.applied(recipe.functionName, document, made => kernel.replay(recipe, made));
        }
        this.journal.push({ kind: "rebuilt", version: key, object: document });
        Reflect.set(document, "hash", key);
        this.keep(key, { object: document, entry });
        return document;
    }

    private ancestryOf(recipe: VersionRecipe): Ancestry | undefined {
        const chain: VersionRecipe[] = [];
        for (let at: VersionRecipe | undefined = recipe; at !== undefined; at = this.versions.get(at.parent)?.recipe) {
            chain.unshift(at);
            const base = this.objects.get(at.parent)?.object ?? (this.has(at.parent) ? undefined : this.originalObject(at.parent));
            if (base !== undefined) {
                return { base, chain };
            }
        }
        return undefined;
    }

    private originalObject(hash: string): Handle_TDocStd_Document | undefined {
        const object = this.host.original(hash);
        return object == null ? undefined : object as Handle_TDocStd_Document;
    }

    private objectsHeld(recipe: VersionRecipe): boolean {
        return referencesIn(othersOf(recipe.inputs, recipe.property)).every(reference => isDocumentReference(reference)
            ? this.has(reference.hash) || this.originalObject(String(reference.hash)) !== undefined
            : this.host.holds(reference.hash));
    }

    private evictable(key: string, kept: KeptVersion): boolean {
        return !this.usedInCall.has(key) && (kept.entry.recipe.replayable || this.objectsHeld(kept.entry.recipe));
    }

    private trim(): void {
        const lineages = new Map<string, [string, KeptVersion][]>();
        this.objects.forEach((kept, key) => lineages.set(kept.entry.recipe.original, [...(lineages.get(kept.entry.recipe.original) ?? []), [key, kept]]));
        lineages.forEach(lineage => {
            let excess = lineage.length - MAX_DOCUMENT_VERSIONS_KEPT;
            lineage.forEach(([key, kept]) => {
                if (excess > 0 && this.evictable(key, kept)) {
                    this.release(key);
                    excess -= 1;
                }
            });
        });
        let labels = 0;
        this.objects.forEach(kept => {
            labels += kept.entry.labels;
        });
        [...this.objects].forEach(([key, kept]) => {
            if (labels > MAX_DOCUMENT_VERSION_LABELS && this.evictable(key, kept)) {
                this.release(key);
                labels -= kept.entry.labels;
            }
        });
    }

    private forget(version: string, entry: VersionEntry): void {
        this.release(version);
        this.host.forgetCall(entry.call);
        this.versions.delete(version);
    }

    private undo(undo: Undo): void {
        if (undo.kind === "answered") {
            if (undo.latest === undefined) {
                this.latest.delete(undo.original);
            } else {
                this.latest.set(undo.original, undo.latest);
            }
        } else if (undo.kind === "made") {
            this.forget(undo.version, undo.entry);
            this.familyOf(undo.entry.recipe.original).delete(undo.version);
        } else if (this.objects.get(undo.version)?.object === undo.object) {
            this.release(undo.version);
        }
    }

    private withVersionsRead(value: unknown): unknown {
        if (value === null || typeof value !== "object" || isOpaque(value)) {
            return value;
        }
        if (isDocumentReference(value)) {
            const read = this.versionRead(value.hash, "latest");
            return read === value.hash ? value : { ...value, hash: read };
        }
        if (Array.isArray(value) && isNumberList(value)) {
            return value;
        }
        const entries: [string | number, unknown][] = Array.isArray(value) ? value.map((item: unknown, index) => [index, item]) : Object.entries(value);
        let copy: Record<string | number, unknown> | unknown[] | undefined;
        for (const [key, item] of entries) {
            const read = this.withVersionsRead(item);
            if (read !== item) {
                copy ??= Array.isArray(value) ? [...value] as unknown[] : { ...value };
                (copy as Record<string | number, unknown>)[key] = read;
            }
        }
        return copy ?? value;
    }
}
