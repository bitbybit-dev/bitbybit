import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ApiIndex } from "./index-types.js";

import { IndexNotPublishedError, indexUrl } from "./index-url.js";

export { INDEX_HOST, IndexNotPublishedError, indexUrl, isExactVersion } from "./index-url.js";

const NOT_FOUND = 404;

/** The cache directory: `$XDG_CACHE_HOME/bitbybit-mcp`, or `~/.cache/bitbybit-mcp`. An empty variable counts as unset, as the XDG specification says. */
export function defaultCacheDir(env: Record<string, string | undefined> = process.env): string {
    const base = env["XDG_CACHE_HOME"] || join(homedir(), ".cache");
    return join(base, "bitbybit-mcp");
}

export interface LoadIndexOptions {
    version: string;
    /** Replaces the global fetch, for tests and for hosts that route requests themselves. */
    fetch?: typeof fetch;
    /** Where downloaded indexes are kept; `null` disables the cache. */
    cacheDir?: string | null;
}

function isMemberLike(value: unknown): boolean {
    if (typeof value !== "object" || value === null) return false;
    const candidate = value as { path?: unknown; name?: unknown; engines?: unknown; examples?: unknown };
    return typeof candidate.path === "string" && typeof candidate.name === "string" && Array.isArray(candidate.engines) && Array.isArray(candidate.examples);
}

/** The shape the reader relies on: the version asked for, and members that carry a path, a name, engines and examples. */
export function isApiIndex(value: unknown, version: string): value is ApiIndex {
    if (typeof value !== "object" || value === null) return false;
    const candidate = value as { version?: unknown; members?: unknown; examples?: unknown };
    return candidate.version === version
        && Array.isArray(candidate.members)
        && candidate.members.every(isMemberLike)
        && typeof candidate.examples === "object"
        && candidate.examples !== null;
}

/**
 * Loads one version's index: from the cache when it is there, else from the CDN, then into the
 * cache. An index is immutable once published, so a cached copy is never revalidated.
 */
export async function loadIndex(options: LoadIndexOptions): Promise<ApiIndex> {
    const url = indexUrl(options.version);
    const cacheDir = options.cacheDir === undefined ? defaultCacheDir() : options.cacheDir;
    const cacheFile = cacheDir === null ? null : join(cacheDir, `index-v${options.version}.json`);
    if (cacheFile !== null) {
        const cached = await readCached(cacheFile, options.version);
        if (cached) return cached;
    }
    const doFetch = options.fetch ?? fetch;
    const response = await doFetch(url);
    if (response.status === NOT_FOUND) throw new IndexNotPublishedError(options.version, url);
    if (!response.ok) throw new Error(`Fetching ${url} failed with HTTP ${response.status}`);
    const text = await response.text();
    const parsed: unknown = JSON.parse(text);
    if (!isApiIndex(parsed, options.version)) throw new Error(`${url} is not an API index for version ${options.version}`);
    if (cacheFile !== null && cacheDir !== null) await writeCached(cacheDir, cacheFile, text);
    return parsed;
}

async function readCached(file: string, version: string): Promise<ApiIndex | undefined> {
    try {
        const parsed: unknown = JSON.parse(await readFile(file, "utf8"));
        return isApiIndex(parsed, version) ? parsed : undefined;
    } catch {
        return undefined;
    }
}

async function writeCached(dir: string, file: string, text: string): Promise<void> {
    const partial = `${file}.${process.pid}.partial`;
    try {
        await mkdir(dir, { recursive: true });
        await writeFile(partial, text, "utf8");
        await rename(partial, file);
    } catch {
        /* the cache is a convenience; a read-only home directory must not stop the server */
    }
}
