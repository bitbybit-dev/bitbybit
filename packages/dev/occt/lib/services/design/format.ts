/**
 * Which design document format a runner reads. While `released` is false the format is experimental:
 * documents carry `schemaVersion: 1` and are not migrated. Once released, documents carry the version
 * as "major.minor" text; a minor only adds, so a runner reads every minor of its own major up to its
 * own, and refuses a newer one by name rather than build it with a meaning it does not know.
 */
export interface DesignFormat {
    released: boolean;
    major: number;
    minor: number;
}

/** The format this runner reads. Releasing it is one change here, the `@beta` tag off `OCCTDesign` and the schema written as `v1.0.json`, which the schema check holds together. */
export const DESIGN_FORMAT: DesignFormat = { released: false, major: 1, minor: 0 };

const RELEASED_VERSION = /^(0|[1-9]\d{0,3})\.(0|[1-9]\d{0,3})$/;

/**
 * What is wrong with a document's `schemaVersion` for a runner of `format`, or undefined when the
 * runner reads it.
 */
export function versionProblem(value: unknown, format: DesignFormat = DESIGN_FORMAT): string | undefined {
    const released = typeof value === "string" ? RELEASED_VERSION.exec(value) : null;
    if (!format.released) {
        if (value === 1) {
            return undefined;
        }
        if (released !== null) {
            return `schemaVersion "${String(value)}" is a released format; this runner reads the experimental format, schemaVersion 1`;
        }
        return typeof value === "number" && value > 1 ? `schemaVersion ${value} is newer than this runner reads: it reads schemaVersion 1` : "this runner reads schemaVersion 1";
    }
    const current = `${format.major}.${format.minor}`;
    if (value === 1) {
        return `schemaVersion 1 is the experimental format, which is not migrated: write the document again in format "${current}"`;
    }
    if (released === null) {
        return `schemaVersion is the format version as "major.minor" text, such as "${current}"`;
    }
    const major = Number(released[1]);
    const minor = Number(released[2]);
    if (major !== format.major) {
        return `schemaVersion "${String(value)}" is format ${major}; this runner reads format ${format.major}`;
    }
    if (minor > format.minor) {
        return `schemaVersion "${String(value)}" is newer than this runner reads: it reads up to "${current}"; a newer package reads it`;
    }
    return undefined;
}

/**
 * The lowest minor a document needs: the newest minor among the additions it uses, by `additions`,
 * which names for each minor after the first what it added, as a test on the document. A writer
 * stamps this, so a document that uses nothing new stays readable by older runners of the major.
 */
export function lowestMinor(document: Readonly<Record<string, unknown>>, additions: readonly { minor: number; uses: (document: Readonly<Record<string, unknown>>) => boolean }[]): number {
    return additions.reduce((lowest, addition) => addition.minor > lowest && addition.uses(document) ? addition.minor : lowest, 0);
}

/** The kernel this runner runs operations on, which an operation path names first. */
export const OPERATION_KERNEL = "occt";

/**
 * The major version of the kernel API whose operation paths and input defaults this runner keeps. A
 * document's `apis` records the major its operations were written against, so a later major, which
 * may rename a path or change a default, knows which meaning the document has.
 */
export const OPERATION_API_MAJOR = 1;

/** The registry path of a kernel-qualified operation, such as `operations.extrude` for `occt.operations.extrude`, or undefined. */
export function operationPathOf(operation: unknown): string | undefined {
    return typeof operation === "string" && operation.startsWith(`${OPERATION_KERNEL}.`) ? operation.slice(OPERATION_KERNEL.length + 1) : undefined;
}
