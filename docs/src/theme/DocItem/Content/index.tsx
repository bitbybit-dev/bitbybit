import React, { type ReactNode } from "react";
import Content from "@theme-original/DocItem/Content";
import type ContentType from "@theme/DocItem/Content";
import type { WrapperProps } from "@docusaurus/types";
import { useLocation } from "@docusaurus/router";
import { sectionOf } from "@site/src/components/Search/sections";

type Props = WrapperProps<typeof ContentType>;

/**
 * A page's own content, marked for the search index that `npm run build` makes with Pagefind: only what is
 * inside this element is indexed (not the sidebar, the table of contents or the related links), and the page's
 * section becomes the filter the search dialog narrows by.
 */
export default function ContentWrapper(props: Props): ReactNode {
    const { pathname } = useLocation();
    return (
        <div data-pagefind-body="" data-pagefind-filter={`section:${sectionOf(pathname)}`}>
            <Content {...props} />
        </div>
    );
}
