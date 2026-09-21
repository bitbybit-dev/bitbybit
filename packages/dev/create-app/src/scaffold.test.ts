import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { AGENTS_FILE, AGENT_SECTION_FILE, applyAgentLayer, listFiles, renderPlaceholders, restoreTemplateDotfiles } from "./scaffold.js";

let work: string;

const write = (relative: string, content: string): string => {
    const file = path.join(work, relative);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, content);
    return file;
};

const read = (relative: string): string => readFileSync(path.join(work, relative), "utf8");

const fakeTemplatesRoot = (): string => {
    const root = path.join(work, "templates");
    mkdirSync(path.join(root, "_agent", "_dot-vscode"), { recursive: true });
    writeFileSync(path.join(root, "_agent", AGENTS_FILE), "# {{PROJECT_NAME}}\n\nshared text for {{TEMPLATE_ID}}\n");
    writeFileSync(path.join(root, "_agent", "CLAUDE.md"), "@AGENTS.md\n");
    writeFileSync(path.join(root, "_agent", "_dot-mcp.json"), "{}\n");
    writeFileSync(path.join(root, "_agent", "_dot-vscode", "mcp.json"), "{}\n");
    return root;
};

describe("scaffold helpers", () => {
    beforeEach(() => {
        work = mkdtempSync(path.join(tmpdir(), "create-app-scaffold-"));
    });

    afterEach(() => {
        rmSync(work, { recursive: true, force: true });
    });

    describe("restoreTemplateDotfiles", () => {
        it("should rename every _dot- file and directory to its dotted name, however deep, and leave the rest alone", async () => {
            // Arrange
            write("project/_dot-gitignore", "node_modules\n");
            write("project/_dot-vscode/mcp.json", "{}");
            write("project/backend/_dot-env.example", "KEY=\n");
            write("project/backend/src/index.ts", "export {};\n");

            // Act
            const restored = await restoreTemplateDotfiles(path.join(work, "project"));

            // Assert
            expect(restored.map((file) => path.relative(work, file)).sort()).toEqual([
                "project/.gitignore", "project/.vscode", "project/backend/.env.example",
            ]);
            expect(read("project/.gitignore")).toBe("node_modules\n");
            expect(read("project/.vscode/mcp.json")).toBe("{}");
            expect(read("project/backend/.env.example")).toBe("KEY=\n");
            expect(read("project/backend/src/index.ts")).toBe("export {};\n");
            expect((await listFiles(path.join(work, "project"))).some((file) => file.includes("_dot-"))).toBe(false);
        });

        it("should not descend into node_modules", async () => {
            // Arrange
            write("project/node_modules/dep/_dot-npmrc", "registry=\n");

            // Act
            const restored = await restoreTemplateDotfiles(path.join(work, "project"));

            // Assert
            expect(restored).toEqual([]);
            expect(existsSync(path.join(work, "project/node_modules/dep/_dot-npmrc"))).toBe(true);
        });
    });

    describe("renderPlaceholders", () => {
        it("should replace every known placeholder in every text file", async () => {
            // Arrange
            write("project/AGENTS.md", "# {{PROJECT_NAME}} ({{TEMPLATE_ID}}) by {{CLI_VERSION}}\n");
            write("project/nested/notes.md", "again {{PROJECT_NAME}} and {{PROJECT_NAME}}\n");

            // Act
            await renderPlaceholders(path.join(work, "project"), { PROJECT_NAME: "demo", TEMPLATE_ID: "vite-threejs", CLI_VERSION: "9.9.9" });

            // Assert
            expect(read("project/AGENTS.md")).toBe("# demo (vite-threejs) by 9.9.9\n");
            expect(read("project/nested/notes.md")).toBe("again demo and demo\n");
        });

        it("should treat a value with replacement patterns as literal text", async () => {
            // Arrange
            write("project/AGENTS.md", "{{PROJECT_NAME}}\n");

            // Act
            await renderPlaceholders(path.join(work, "project"), { PROJECT_NAME: "price $& $1 $$" });

            // Assert
            expect(read("project/AGENTS.md")).toBe("price $& $1 $$\n");
        });

        it("should leave braces that are not a placeholder alone, such as a JSX style object", async () => {
            // Arrange
            const jsx = "<div style={{ color: \"red\" }}>{{lower}} {{ SPACED }}</div>\n";
            write("project/App.tsx", jsx);

            // Act
            await renderPlaceholders(path.join(work, "project"), { PROJECT_NAME: "demo" });

            // Assert
            expect(read("project/App.tsx")).toBe(jsx);
        });

        it("should fail naming the file and the placeholder when one has no value", async () => {
            // Arrange
            write("project/AGENTS.md", "{{PROJECT_NAME}} {{NOT_A_VALUE}}\n");

            // Act
            const attempt = renderPlaceholders(path.join(work, "project"), { PROJECT_NAME: "demo" });

            // Assert
            await expect(attempt).rejects.toThrow(/AGENTS\.md: \{\{NOT_A_VALUE\}\}/);
        });

        it("should not read a binary file", async () => {
            // Arrange
            write("project/logo.png", "{{PROJECT_NAME}}");

            // Act
            await renderPlaceholders(path.join(work, "project"), {});

            // Assert
            expect(read("project/logo.png")).toBe("{{PROJECT_NAME}}");
        });
    });

    describe("applyAgentLayer", () => {
        it("should copy the layer, append the template's section after the shared text, remove the section file, restore the dotfiles and render", async () => {
            // Arrange
            const templates = fakeTemplatesRoot();
            write("project/src/main.ts", "export {};\n");
            write(`project/${AGENT_SECTION_FILE}`, "## This template\n\nsection for {{PROJECT_NAME}}\n");

            // Act
            await applyAgentLayer(templates, path.join(work, "project"), { PROJECT_NAME: "demo", TEMPLATE_ID: "vite-threejs" });

            // Assert
            expect(read(`project/${AGENTS_FILE}`)).toBe("# demo\n\nshared text for vite-threejs\n\n## This template\n\nsection for demo\n");
            expect(read("project/CLAUDE.md")).toBe("@AGENTS.md\n");
            expect(existsSync(path.join(work, `project/${AGENT_SECTION_FILE}`))).toBe(false);
            expect(existsSync(path.join(work, "project/.mcp.json"))).toBe(true);
            expect(existsSync(path.join(work, "project/.vscode/mcp.json"))).toBe(true);
            expect(existsSync(path.join(work, "project/_dot-mcp.json"))).toBe(false);
        });

        it("should take a section kept outside the scaffold and leave that file where it is", async () => {
            // Arrange
            const templates = fakeTemplatesRoot();
            const shared = write("templates/cloud/AGENTS.section.md", "## Cloud\n\n{{BACKEND_NAME}}\n");
            mkdirSync(path.join(work, "project"), { recursive: true });

            // Act
            await applyAgentLayer(templates, path.join(work, "project"), { PROJECT_NAME: "demo", TEMPLATE_ID: "cloud-hono-sdk", BACKEND_NAME: "Hono" }, shared);

            // Assert
            expect(read(`project/${AGENTS_FILE}`)).toContain("## Cloud\n\nHono\n");
            expect(existsSync(shared)).toBe(true);
        });

        it("should write nothing over a file the template already has", async () => {
            // Arrange
            const templates = fakeTemplatesRoot();
            write("project/CLAUDE.md", "the template's own\n");

            // Act
            await applyAgentLayer(templates, path.join(work, "project"), { PROJECT_NAME: "demo", TEMPLATE_ID: "x" });

            // Assert
            expect(read("project/CLAUDE.md")).toBe("the template's own\n");
        });
    });
});
