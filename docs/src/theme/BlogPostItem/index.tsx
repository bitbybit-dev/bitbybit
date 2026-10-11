import React, { type ReactNode } from "react";
import BlogPostItem from "@theme-original/BlogPostItem";
import type BlogPostItemType from "@theme/BlogPostItem";
import type { WrapperProps } from "@docusaurus/types";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";

type Props = WrapperProps<typeof BlogPostItemType>;

/**
 * A blog post marked for the search index on its own page; the list pages, which repeat the start of every post,
 * are left out of it.
 */
export default function BlogPostItemWrapper(props: Props): ReactNode {
    const { isBlogPostPage } = useBlogPost();
    if (!isBlogPostPage) {
        return <BlogPostItem {...props} />;
    }
    return (
        <div data-pagefind-body="" data-pagefind-filter="section:Blog">
            <BlogPostItem {...props} />
        </div>
    );
}
