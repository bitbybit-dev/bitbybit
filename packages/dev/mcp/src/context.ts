import type { ApiIndex } from "./index-types.js";
import { IndexReader } from "./index-reader.js";
import type { GuideSection } from "./guides-split.js";
import { isExactVersion } from "./index-url.js";

export interface ResolvedIndex {
    version: string;
    reader: IndexReader;
}

export interface DocsContext {
    resolve(version?: string): Promise<ResolvedIndex>;
    guides: readonly GuideSection[];
    guideUrl: string;
}

export class VersionNotLoadedError extends Error {
    constructor(readonly requested: string, readonly loaded: string) {
        super(
            isExactVersion(requested)
                ? `This server holds the API index for version ${loaded}; version ${requested} was asked for. Run it with --version ${requested} or BITBYBIT_VERSION=${requested} to serve that one.`
                : `This server holds the API index for version ${loaded}; "${requested}" is not an exact release version. Ask for one such as ${loaded}, or omit the version.`,
        );
        this.name = "VersionNotLoadedError";
    }
}

export function contextForIndex(index: ApiIndex, guides: readonly GuideSection[], guideUrl: string): DocsContext {
    const resolved: ResolvedIndex = { version: index.version, reader: new IndexReader(index) };
    return {
        guides,
        guideUrl,
        resolve: (version?: string): Promise<ResolvedIndex> => {
            if (version !== undefined && version !== resolved.version) {
                return Promise.reject(new VersionNotLoadedError(version, resolved.version));
            }
            return Promise.resolve(resolved);
        },
    };
}
