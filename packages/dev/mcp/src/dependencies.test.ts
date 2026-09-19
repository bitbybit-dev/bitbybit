import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageDirectory = fileURLToPath(new URL("..", import.meta.url));
const manifest = JSON.parse(readFileSync(join(packageDirectory, "package.json"), "utf8")) as { dependencies: Record<string, string>; devDependencies: Record<string, string>; mcpName: string; name: string };
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
        expect(manifest.mcpName).toBe("dev.bitbybit/mcp");
        expect((JSON.parse(readFileSync(join(packageDirectory, "server.json"), "utf8")) as { name: string }).name).toBe(manifest.mcpName);
    });
});
