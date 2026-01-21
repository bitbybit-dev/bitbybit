import React, { type ReactNode } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

interface VersionProps {
    /** Optional prefix to add before the version (e.g., "v" for "v1.0.0-rc.0") */
    prefix?: string;
    /** Optional suffix to add after the version */
    suffix?: string;
}

/**
 * A component that displays the current Bitbybit version from package.json.
 * 
 * Usage in MDX files:
 * - Just the version: <Version />  → "1.0.0-rc.0"
 * - With v prefix: <Version prefix="v" />  → "v1.0.0-rc.0"
 * - In a link: [Download](https://example.com/<Version prefix="v" />/file.md)
 */
export default function Version({ prefix = "", suffix = "" }: VersionProps): ReactNode {
    const { siteConfig } = useDocusaurusContext();
    const version = siteConfig.customFields?.bitbybitVersion as string;
    
    return <>{prefix}{version}{suffix}</>;
}

/**
 * Hook to get the current Bitbybit version.
 * Useful when you need the version as a string value in code.
 */
export function useBitbybitVersion(): string {
    const { siteConfig } = useDocusaurusContext();
    return siteConfig.customFields?.bitbybitVersion as string;
}
