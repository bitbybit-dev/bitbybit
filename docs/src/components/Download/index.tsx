import React from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import media from "@site/src/data/learn-media.json";

interface LearnFile {
    id: string;
    url: string;
    alt: string;
    kind?: string;
    bytes?: number;
}

const entries = media as LearnFile[];
const KIB = 1024;

function sizeOf(bytes: number | undefined): string {
    if (bytes === undefined) {
        return "";
    }
    return bytes >= KIB * KIB ? `${(bytes / KIB / KIB).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / KIB))} KB`;
}

/**
 * A file from the learn media manifest, such as a showcase project, offered as a download by its id. An id the
 * manifest does not hold fails the build. On a local start with LEARN_MEDIA_LOCAL=1, a local candidate of the
 * same id is offered instead of the published file.
 *
 * Usage in MDX files: <Download id="designer.showcases/robot-arm-project" /> or with label="..."
 */
export default function Download({ id, label }: { id: string; label?: string }): React.JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    const local = (siteConfig.customFields?.learnMediaLocal ?? []) as LearnFile[];
    const entry = local.find((each) => each.id === id) ?? entries.find((each) => each.id === id);
    if (entry === undefined) {
        throw new Error(`the learn media manifest has no file "${id}"`);
    }
    const size = sizeOf(entry.bytes);
    return (
        <a className="button button--secondary button--md margin-bottom--sm" href={entry.url} download>
            {label ?? entry.alt}{size === "" ? "" : ` (${size})`}
        </a>
    );
}
