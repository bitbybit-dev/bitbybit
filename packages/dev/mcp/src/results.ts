import type { ToolResult } from "./registry.js";
import { VersionNotLoadedError } from "./context.js";
import { IndexNotPublishedError } from "./index-url.js";

export function ok(text: string, structured?: Record<string, unknown>): ToolResult {
    return structured ? { text, structured } : { text };
}

export function fail(text: string, structured?: Record<string, unknown>): ToolResult {
    return structured ? { text, structured, isError: true } : { text, isError: true };
}

export function failFor(error: unknown): ToolResult {
    if (error instanceof VersionNotLoadedError) {
        return fail(error.message, { code: "VERSION_NOT_LOADED", requested: error.requested, loaded: error.loaded });
    }
    if (error instanceof IndexNotPublishedError) {
        return fail(error.message, { code: "VERSION_NOT_PUBLISHED", version: error.version, ...(error.latest === undefined ? {} : { latest: error.latest }) });
    }
    throw error;
}
