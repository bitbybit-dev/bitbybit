#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { createDocsRegistry } from "./tools/index.js";
import { createMcpServer } from "./server.js";
import { guarded } from "./registry.js";
import { contextForIndex } from "./context.js";
import { defaultCacheDir, IndexNotPublishedError, loadIndex } from "./index-loader.js";
import { detectVersion, flagValue } from "./installed-version.js";
import type { DetectedVersion } from "./installed-version.js";
import type { ApiIndex } from "./index-types.js";
import { GUIDE_PAGE_URL, GUIDES } from "./guides.generated.js";
import { SERVER_INSTRUCTIONS } from "./descriptions.js";

const HELP = `bitbybit-mcp: an MCP server (stdio) documenting the Bitbybit 3D CAD API for one exact version.

  npx -y @bitbybit-dev/mcp                     serve the version installed around the working directory, else this package's version
  npx -y @bitbybit-dev/mcp --version <version> serve that exact version
  BITBYBIT_VERSION=<version> npx -y @bitbybit-dev/mcp
  npx -y @bitbybit-dev/mcp --version           print this package's version and exit
  --no-cache                                   do not read or write ~/.cache/bitbybit-mcp

When the installed version predates the published index, this package's own version is served
instead and a note says so. Everything this program prints goes to stderr; stdout is the MCP transport.`;

function ownVersion(): string {
    const manifest: unknown = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    if (typeof manifest === "object" && manifest !== null && "version" in manifest && typeof manifest.version === "string") return manifest.version;
    throw new Error("The package manifest carries no version");
}

async function loadServed(detected: DetectedVersion, own: string, cacheDir: string | null): Promise<{ index: ApiIndex; served: DetectedVersion }> {
    try {
        return { index: await loadIndex({ version: detected.version, cacheDir }), served: detected };
    } catch (error) {
        if (!(error instanceof IndexNotPublishedError) || detected.source !== "installed" || detected.version === own) throw error;
        console.error(`bitbybit-mcp: ${error.message}`);
        console.error(`bitbybit-mcp: serving this package's version ${own} instead; answers describe ${own}, not the installed ${detected.version}`);
        const served: DetectedVersion = { version: own, source: "own" };
        return { index: await loadIndex({ version: own, cacheDir }), served };
    }
}

async function main(): Promise<void> {
    const argv = process.argv.slice(2);
    if (argv.includes("--help") || argv.includes("-h")) {
        console.error(HELP);
        return;
    }
    const own = ownVersion();
    if (argv.includes("--version") && flagValue(argv, "--version") === undefined) {
        console.log(own);
        return;
    }
    const detected = detectVersion({ ownVersion: own, cwd: process.cwd(), env: process.env, argv, warn: (message) => console.error(`bitbybit-mcp: ${message}`) });
    const { index, served } = await loadServed(detected, own, argv.includes("--no-cache") ? null : defaultCacheDir());
    const context = contextForIndex(index, GUIDES, GUIDE_PAGE_URL);
    const registry = guarded(createDocsRegistry(), (error, tool) => console.error(`bitbybit-mcp: ${tool} failed: ${error instanceof Error ? error.message : String(error)}`));
    const server = createMcpServer(registry, context, { name: "bitbybit", version: own, instructions: SERVER_INSTRUCTIONS });
    await server.connect(new StdioServerTransport());
    console.error(`bitbybit-mcp: serving the Bitbybit API index for version ${served.version} (from ${served.source})`);
}

main().catch((error: unknown) => {
    console.error(`bitbybit-mcp: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
});
