import React, { type ReactNode } from "react";
import Footer from "@theme-original/DocItem/Footer";
import Link from "@docusaurus/Link";
import { useDocsSidebar } from "@docusaurus/plugin-content-docs/client";
import { useLocation } from "@docusaurus/router";

// 164 of the 344 hand-written pages carried no in-content internal link at all, and the
// median page had exactly one inbound link - a card on its auto-generated parent index.
// The tree was held together by the sidebar alone, which crawlers discount as template
// boilerplate. This renders a real, per-page set of links to the siblings and parent of
// the page being read, built from the same sidebar data, into the document body.

const MAX_RELATED = 6;

type SidebarItem = {
    type: string;
    label?: string;
    href?: string;
    items?: SidebarItem[];
    link?: { type: string; id?: string };
};

export interface RelatedLink {
    label: string;
    href: string;
}

function normalize(pathname: string): string {
    return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

function hrefOf(item: SidebarItem): string | undefined {
    return item.href;
}

/** Ancestor chain from the sidebar root down to the item matching `pathname`. */
function trail(items: SidebarItem[], pathname: string, path: SidebarItem[] = []): SidebarItem[] | null {
    for (const item of items) {
        const here = [...path, item];
        if (hrefOf(item) && normalize(hrefOf(item)!) === pathname) {
            return here;
        }
        if (item.items) {
            const found = trail(item.items, pathname, here);
            if (found) return found;
        }
    }
    return null;
}

export function relatedFor(items: SidebarItem[], pathname: string): RelatedLink[] {
    const chain = trail(items, normalize(pathname), []);
    if (!chain) return [];

    const self = chain[chain.length - 1];
    const parent = chain.length >= 2 ? chain[chain.length - 2] : undefined;
    const pool: SidebarItem[] = parent?.items ?? items;

    const related: RelatedLink[] = [];
    const seen = new Set<string>([normalize(pathname)]);

    const push = (item?: SidebarItem) => {
        const href = item && hrefOf(item);
        if (!href || !item?.label) return;
        const key = normalize(href);
        if (seen.has(key)) return;
        seen.add(key);
        related.push({ label: item.label, href });
    };

    const index = pool.indexOf(self);
    if (index >= 0) {
        for (let offset = 1; offset < pool.length && related.length < MAX_RELATED; offset++) {
            push(pool[index - offset]);
            push(pool[index + offset]);
        }
    }
    for (const item of pool) {
        if (related.length >= MAX_RELATED) break;
        push(item);
    }
    if (parent) push(parent);
    return related.slice(0, MAX_RELATED + 1);
}

export default function FooterWrapper(props: Record<string, unknown>): ReactNode {
    const sidebar = useDocsSidebar();
    const { pathname } = useLocation();
    const related = sidebar ? relatedFor(sidebar.items as SidebarItem[], pathname) : [];

    return (
        <>
            {related.length > 0 && (
                <nav className="related-pages" aria-label="Related pages">
                    <h2>Related pages</h2>
                    <ul>
                        {related.map((item) => (
                            <li key={item.href}>
                                <Link to={item.href}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
            <Footer {...props} />
        </>
    );
}
