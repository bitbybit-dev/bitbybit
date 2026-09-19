import type { ApiIndex } from "./index-types.js";

function isMemberLike(value: unknown): boolean {
    if (typeof value !== "object" || value === null) return false;
    const candidate = value as { path?: unknown; name?: unknown; engines?: unknown; examples?: unknown };
    return typeof candidate.path === "string" && typeof candidate.name === "string" && Array.isArray(candidate.engines) && Array.isArray(candidate.examples);
}

export function isApiIndex(value: unknown, version: string): value is ApiIndex {
    if (typeof value !== "object" || value === null) return false;
    const candidate = value as { version?: unknown; members?: unknown; examples?: unknown };
    return candidate.version === version
        && Array.isArray(candidate.members)
        && candidate.members.every(isMemberLike)
        && typeof candidate.examples === "object"
        && candidate.examples !== null;
}
