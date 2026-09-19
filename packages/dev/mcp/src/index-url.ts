export const INDEX_HOST = "https://git-cdn.bitbybit.dev";

const VERSION = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

export function isExactVersion(version: string): boolean {
    return VERSION.test(version);
}

export function indexUrl(version: string, host: string = INDEX_HOST): string {
    if (!isExactVersion(version)) throw new Error(`"${version}" is not an exact version; the index is published per release and never under a moving name`);
    return `${host}/v${version}/ai-context/index.json`;
}

export class IndexNotPublishedError extends Error {
    constructor(readonly version: string, readonly url: string, readonly latest?: string) {
        super(
            `No API index is published for Bitbybit ${version} (${url}): the version was never released, or predates the index` +
            (latest === undefined ? "" : `; the newest published is ${latest}`) +
            ". Check the version, or ask for a released one.",
        );
        this.name = "IndexNotPublishedError";
    }
}
