import React from "react";
import MDXComponents from "@theme-original/MDXComponents";
import Version, { useBitbybitVersion } from "@site/src/components/Version";
import Ui from "@site/src/components/Ui";
import Shot from "@site/src/components/Shot";
import Download from "@site/src/components/Download";
import OpenInDesigner from "@site/src/components/OpenInDesigner";

/**
 * VersionLink - A component for creating links with version numbers.
 * This allows dynamic version insertion in markdown links.
 * 
 * Usage: <VersionLink href="https://git-cdn.bitbybit.dev/v{version}/ai-context/file.md">Link Text</VersionLink>
 */
function VersionLink({ href, children }: { href: string; children: React.ReactNode }): React.JSX.Element {
    const version = useBitbybitVersion();
    const processedHref = href.replace(/\{version\}/g, version);
    return <a href={processedHref}>{children}</a>;
}

export default {
    // Re-use the default mapping
    ...MDXComponents,
    // Add custom components available in all MDX files
    Version,
    VersionLink,
    Ui,
    Shot,
    Download,
    OpenInDesigner,
};
