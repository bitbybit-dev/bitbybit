import { readdirSync, readFileSync } from "node:fs";
import { SERVER_IDENTITY } from "./identity.js";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as root from "./index.js";
import * as jsonSchema from "./json-schema.js";
import * as server from "./server.js";

const packageDirectory = fileURLToPath(new URL("..", import.meta.url));
const manifest = JSON.parse(readFileSync(join(packageDirectory, "package.json"), "utf8")) as { dependencies: Record<string, string>; devDependencies: Record<string, string>; exports: Record<string, { types: string; default: string }>; mcpName: string; name: string };
const sourceFiles = (): string[] =>
    readdirSync(join(packageDirectory, "src"), { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") && !entry.parentPath.includes("__fixtures__"))
        .map((entry) => join(entry.parentPath, entry.name));

describe("the package boundary", () => {
    it("depends at runtime on the MCP server SDK and zod alone", () => {
        // Assert
        expect(Object.keys(manifest.dependencies).sort()).toEqual(["@modelcontextprotocol/server", "zod"]);
    });

    it("depends on no other @bitbybit-dev package and on nothing hosting-specific", () => {
        // Arrange
        const names = [...Object.keys(manifest.dependencies), ...Object.keys(manifest.devDependencies)];

        // Assert
        expect(names.filter((name) => name.startsWith("@bitbybit-dev/"))).toEqual([]);
        expect(names.filter((name) => /cloudflare|wrangler|^agents$|^hono$/.test(name))).toEqual([]);
    });

    it("imports the MCP SDK only in the server binding and the stdio entry", () => {
        // Act
        const importing = sourceFiles().filter((file) => readFileSync(file, "utf8").includes("@modelcontextprotocol/")).map((file) => file.slice(packageDirectory.length));

        // Assert
        expect(importing.sort()).toEqual(["src/server.ts", "src/stdio.ts"]);
    });

    it("keeps the package root free of Node built-ins, so a Worker can bundle it", () => {
        // Act
        const nodeImporting = sourceFiles().filter((file) => /from "node:/.test(readFileSync(file, "utf8"))).map((file) => file.slice(packageDirectory.length));

        // Assert
        expect(nodeImporting.sort()).toEqual(["src/index-loader.ts", "src/installed-version.ts", "src/stdio.ts"]);
        expect(readFileSync(join(packageDirectory, "src/index.ts"), "utf8")).not.toMatch(/index-loader|installed-version|stdio/);
    });

    it("names itself the same way for npm and for the MCP registry", () => {
        // Assert
        expect(manifest.name).toBe("@bitbybit-dev/mcp");
        expect(manifest.mcpName).toBe("dev.bitbybit/cad");
        expect((JSON.parse(readFileSync(join(packageDirectory, "server.json"), "utf8")) as { name: string }).name).toBe(manifest.mcpName);
    });

    it("tells the registry the same title, page and icon it tells a client on initialize", () => {
        // Act
        const registryManifest = JSON.parse(readFileSync(join(packageDirectory, "server.json"), "utf8")) as { title: string; websiteUrl: string; icons: unknown; packages: { runtimeHint?: string }[] };

        // Assert
        expect(registryManifest.title).toBe(SERVER_IDENTITY.title);
        expect(registryManifest.websiteUrl).toBe(SERVER_IDENTITY.websiteUrl);
        expect(registryManifest.icons).toEqual(SERVER_IDENTITY.icons);
        expect(registryManifest.packages[0]?.runtimeHint).toBe("npx");
    });
});

describe("the public surface a host builds on", () => {
    it("exports from the root the pieces a host needs to guard a registry, validate an index and wrap a cloud tool set", () => {
        // Assert
        for (const name of ["guarded", "isApiIndex", "inlineJsonSchemaReferences", "inputJsonSchema", "toHttp", "Registry", "INTERNAL_ERROR_CODE", "INTERNAL_ERROR_TEXT", "TOOL_CEILING", "contextForIndex", "createDocsRegistry", "renderMember", "renderLine", "IndexReader", "IndexNotPublishedError", "INDEX_HOST", "indexUrl", "isExactVersion", "GUIDES", "GUIDE_PAGE_URL"]) {
            expect(root, name).toHaveProperty(name);
        }
    });

    it("publishes the $ref inliner and the request handler under their own subpaths, so a generator script and a server bind to them without the root", () => {
        // Assert
        expect(Object.keys(manifest.exports)).toEqual([".", "./server", "./index-loader", "./installed-version", "./json-schema", "./package.json"]);
        expect(manifest.exports["./json-schema"]).toEqual({ types: "./dist/json-schema.d.ts", default: "./dist/json-schema.js" });
        expect(typeof jsonSchema.inlineJsonSchemaReferences).toBe("function");
        expect(jsonSchema.inlineJsonSchemaReferences).toBe(root.inlineJsonSchemaReferences);
        expect(typeof server.createRequestHandler).toBe("function");
    });
});
