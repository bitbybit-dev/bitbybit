import type { PagefindModule, PagefindResult, SearchHit } from "./search-types";
import { sectionOf, servedUrl } from "./sections";

const EXCERPT_WORDS = 24;
const HEADINGS_PER_HIT = 3;

let loading: Promise<PagefindModule | null> | undefined;

/**
 * The Pagefind index the build wrote to /pagefind, loaded once; null where there is none, as on `npm start`,
 * which serves the sources without building the index.
 */
export function loadPagefind(scriptUrl: string): Promise<PagefindModule | null> {
    loading ??= fetch(scriptUrl, { method: "HEAD" })
        .then((response) => {
            if (!response.ok || !(response.headers.get("content-type") ?? "").includes("javascript")) {
                throw new Error("no search index");
            }
            return import(/* webpackIgnore: true */ scriptUrl) as Promise<PagefindModule>;
        })
        .then(async (pagefind) => {
            await pagefind.options({ excerptLength: EXCERPT_WORDS });
            await pagefind.init();
            return pagefind;
        })
        .catch(() => null);
    return loading;
}

/** A result as the dialog shows it: the page, its section, its excerpt and the headings under it that matched. */
export async function hitOf(result: PagefindResult): Promise<SearchHit> {
    const data = await result.data();
    const url = servedUrl(data.url);
    const pageUrl = url.split("#")[0];
    return {
        id: result.id,
        title: data.meta.title ?? pageUrl,
        url,
        section: data.filters.section?.[0] ?? sectionOf(pageUrl),
        excerpt: data.excerpt,
        headings: data.sub_results
            .map((sub) => ({ ...sub, url: servedUrl(sub.url) }))
            .filter((sub) => sub.url !== url && sub.url.includes("#"))
            .slice(0, HEADINGS_PER_HIT),
    };
}
