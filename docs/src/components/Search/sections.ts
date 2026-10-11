import type { SearchSection } from "./search-types";

/** The parts of the site a search can be narrowed to, by route, the longest prefix first. */
export const SEARCH_SECTIONS: SearchSection[] = [
    { prefix: "/learn/getting-started", label: "Getting Started" },
    { prefix: "/learn/designer", label: "Designer" },
    { prefix: "/learn/code", label: "Code" },
    { prefix: "/learn/3d-bits", label: "3D Bits" },
    { prefix: "/learn/using-ai-with-bitbybit", label: "AI" },
    { prefix: "/learn/npm-packages", label: "NPM Packages" },
    { prefix: "/learn/runners", label: "Runners" },
    { prefix: "/learn/tools", label: "Tools" },
    { prefix: "/learn/github", label: "GitHub" },
    { prefix: "/learn/paths", label: "Paths" },
    { prefix: "/learn", label: "Platform" },
    { prefix: "/blog", label: "Blog" },
    { prefix: "/api", label: "CAD Cloud API" },
];

/** The section a page belongs to, by its route. */
export function sectionOf(pathname: string): string {
    const found = SEARCH_SECTIONS.find((section) => pathname === section.prefix || pathname.startsWith(`${section.prefix}/`));
    return found?.label ?? "Platform";
}

/** A result's address as the site serves it: Pagefind names the built file, the site serves it without `.html`. */
export function servedUrl(url: string): string {
    return url.replace(/\/index\.html(?=$|#)/, "/").replace(/\.html(?=$|#)/, "");
}

/** The parts of a Pagefind excerpt, each marked when it matched the query, with its HTML entities decoded. */
export function excerptParts(excerpt: string): { text: string; marked: boolean }[] {
    const decode = (text: string): string => text
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
    return excerpt.split(/(<mark>[^]*?<\/mark>)/).filter((part) => part.length > 0).map((part) => {
        const marked = part.startsWith("<mark>");
        return { text: decode(marked ? part.slice(6, -7) : part), marked };
    });
}
