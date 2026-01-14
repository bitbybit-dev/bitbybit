import React from "react";
import MDXComponents from "@theme-original/MDXComponents";
import Version, { useBitbybitVersion } from "@site/src/components/Version";

/**
 * VersionLink - A component for creating links with version numbers.
 * This allows dynamic version insertion in markdown links.
 * 
 * Usage: <VersionLink href="https://app.bitbybit.dev/assets/ai-prompt-context/v{version}/file-v{version}.md">Link Text</VersionLink>
 */
function VersionLink({ href, children }: { href: string; children: React.ReactNode }): JSX.Element {
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
};
