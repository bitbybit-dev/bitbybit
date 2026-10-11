import { isRecord } from "@bitbybit-dev/base";
import type * as Models from "../../api/models";
import { versionOf } from "./identity";
import { DesignProblem, pointer } from "./problems";

/** A document given beside the one checked or built: the document and its position in the list it came in. */
export interface LibraryEntry<D extends object = Record<string, unknown>> {
    document: D;
    index: number;
    /** The document's version, worked out once, when a component pins it or two versions share an id. */
    version?: string | undefined;
}

/** The documents given beside the one checked or built, by id, with every version given of each. */
export type DesignLibrary<D extends object = Record<string, unknown>> = ReadonlyMap<string, readonly LibraryEntry<D>[]>;

/** The version of a document given, worked out once. */
export function versionIn(entry: LibraryEntry<object>): string {
    return entry.version ??= versionOf(entry.document);
}

function revisionOf(document: object): string | undefined {
    const meta = isRecord(document) ? document["meta"] : undefined;
    return isRecord(meta) && typeof meta["revision"] === "string" ? meta["revision"] : undefined;
}

/** The documents of a library by id, each id's versions together, and what was wrong with the list given. */
export interface LibraryOutcome<D extends object> {
    library: Map<string, LibraryEntry<D>[]>;
    issues: Models.OCCT.DesignIssue[];
}

/**
 * The documents given beside the one checked, by id, and the problems of the list itself. Several
 * versions of one document may be given, so that two components place two revisions of it; the same
 * version twice is a problem.
 */
export function libraryOf<D extends object = Record<string, unknown>>(documents: readonly D[] | unknown): LibraryOutcome<D> {
    const library = new Map<string, LibraryEntry<D>[]>();
    const issues: Models.OCCT.DesignIssue[] = [];
    if (documents === undefined) {
        return { library, issues };
    }
    if (!Array.isArray(documents)) {
        return { library, issues: [{ path: "/documents", message: "documents is a list of design documents" }] };
    }
    documents.forEach((document: unknown, index) => {
        const id = isRecord(document) ? document["id"] : undefined;
        if (typeof id !== "string" || !isRecord(document)) {
            issues.push({ path: pointer("/documents", index, "id"), message: "a document given beside another needs the id components find it by" });
            return;
        }
        const entry: LibraryEntry<D> = { document: document as D, index };
        const versions = library.get(id);
        if (versions === undefined) {
            library.set(id, [entry]);
        } else if (versions.some(other => versionIn(other) === versionIn(entry))) {
            issues.push({ path: pointer("/documents", index, "id"), message: `this version of "${id}" is given twice` });
        } else {
            versions.push(entry);
        }
    });
    return { library, issues };
}

/**
 * The document a component's source places: the one version given of its document, or the one its
 * `version` pins, by the document's version or by the revision id a store stamped into its `meta`.
 * Throws a problem under `path`, the source's, when no document given fits.
 */
export function sourceEntry<D extends object>(library: DesignLibrary<D>, id: string, version: string | undefined, path: string): LibraryEntry<D> {
    const entries = library.get(id);
    if (entries === undefined) {
        throw new DesignProblem(pointer(path, "document"), `"${id}" is not among the documents given`);
    }
    if (version === undefined) {
        if (entries.length > 1) {
            throw new DesignProblem(pointer(path, "document"), `${entries.length} versions of "${id}" are given: pin one with version`);
        }
        return entries[0]!;
    }
    const pinned = entries.find(entry => versionIn(entry) === version || revisionOf(entry.document) === version);
    if (pinned !== undefined) {
        return pinned;
    }
    throw new DesignProblem(pointer(path, "version"), entries.length === 1
        ? `the document "${id}" has changed since this version: its version is now ${versionIn(entries[0]!)}`
        : `no version of "${id}" given is ${version}: the versions given are ${entries.map(versionIn).join(", ")}`);
}

/** The document a source placed by a checked document names, or undefined when none given fits. */
export function sourceOf(library: DesignLibrary, source: unknown): LibraryEntry | undefined {
    if (!isRecord(source) || typeof source["document"] !== "string") {
        return undefined;
    }
    try {
        return sourceEntry(library, source["document"], typeof source["version"] === "string" ? source["version"] : undefined, "");
    } catch (error) {
        if (error instanceof DesignProblem) {
            return undefined;
        }
        throw error;
    }
}
