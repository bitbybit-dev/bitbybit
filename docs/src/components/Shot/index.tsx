import React from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import ImageGallery from "@site/src/components/ImageGallery";
import media from "@site/src/data/learn-media.json";

interface LearnMedia {
    id: string;
    url: string;
    width: number;
    height: number;
    alt: string;
}

const entries = media as LearnMedia[];

/**
 * A screenshot or render from the learn media manifest, by its id, shown at its own size and opened
 * full size on a click. An id the manifest does not hold fails the build. On a local start with
 * LEARN_MEDIA_LOCAL=1, a local candidate of the same id is shown instead of the published image.
 *
 * Usage in MDX files: <Shot id="designer.tour/window" /> or <Shot ids={["a/one", "a/two"]} columns={2} />
 */
export default function Shot({ id, ids, columns = 1 }: { id?: string; ids?: string[]; columns?: number }): React.JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    const local = (siteConfig.customFields?.learnMediaLocal ?? []) as LearnMedia[];
    const wanted = ids ?? (id === undefined ? [] : [id]);
    const found = wanted.map((key) => {
        const entry = local.find((each) => each.id === key) ?? entries.find((each) => each.id === key);
        if (entry === undefined) {
            throw new Error(`the learn media manifest has no image "${key}"`);
        }
        return entry;
    });
    return <ImageGallery images={found.map((entry) => entry.url)} alts={found.map((entry) => entry.alt)} sizes={found.map((entry) => ({ width: entry.width, height: entry.height }))} columns={columns} />;
}
