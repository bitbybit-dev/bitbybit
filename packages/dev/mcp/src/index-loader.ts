import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ApiIndex } from "./index-types.js";

import { IndexNotPublishedError, indexUrl } from "./index-url.js";
import { isApiIndex } from "./index-shape.js";

export { INDEX_HOST, IndexNotPublishedError, indexPath, indexUrl, isExactVersion } from "./index-url.js";
export { isApiIndex } from "./index-shape.js";

const NOT_FOUND = 404;

export function defaultCacheDir(env: Record<string, string | undefined> = process.env): string {
    const base = env["XDG_CACHE_HOME"] || join(homedir(), ".cache");
    return join(base, "bitbybit-mcp");
}

export interface LoadIndexOptions {
    version: string;
    fetch?: typeof fetch;
    cacheDir?: string | null;
}

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

const ignoreCacheWriteFailure = (): undefined => undefined;

async function writeCached(dir: string, file: string, text: string): Promise<void> {
    const partial = `${file}.${process.pid}.partial`;
    await mkdir(dir, { recursive: true })
        .then(() => writeFile(partial, text, "utf8"))
        .then(() => rename(partial, file))
        .catch(ignoreCacheWriteFailure);
}
