export interface SearchSection {
    prefix: string;
    label: string;
}

export interface PagefindSubResult {
    title: string;
    url: string;
    excerpt: string;
}

export interface PagefindResultData {
    url: string;
    excerpt: string;
    meta: { title?: string };
    filters: Record<string, string[]>;
    sub_results: PagefindSubResult[];
}

export interface PagefindResult {
    id: string;
    data: () => Promise<PagefindResultData>;
}

export interface PagefindSearch {
    results: PagefindResult[];
}

export interface PagefindModule {
    options: (options: { excerptLength?: number; baseUrl?: string }) => Promise<void>;
    init: () => Promise<void>;
    filters: () => Promise<Record<string, Record<string, number>>>;
    debouncedSearch: (query: string, options?: { filters?: Record<string, string> }, timeout?: number) => Promise<PagefindSearch | null>;
}

export interface SearchHit {
    id: string;
    title: string;
    url: string;
    section: string;
    excerpt: string;
    headings: PagefindSubResult[];
}
