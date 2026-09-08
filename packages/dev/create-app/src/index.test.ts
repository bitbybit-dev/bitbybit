import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI = path.join(ROOT, "dist/index.js");
const RELEASE_VERSION = (JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")) as { version: string }).version;

const FRONTEND_FILES = ["package.json", "tsconfig.json", "index.html", "src/main.ts", "src/style.css"];
const ENGINES = ["threejs", "babylonjs", "playcanvas"] as const;
const CLOUD_BACKENDS = ["hono-sdk", "hono-rest", "nodejs-sdk", "nodejs-rest"] as const;
const OCCT_BITNESS = "32";
const FAILURE_EXIT = 1;

const ENGINE_TEMPLATES_DIR = path.join(ROOT, "templates", "vite");
const TEMPLATE_LANGUAGE = "typescript";
const CLI_SOURCE = path.join(ROOT, "src", "index.ts");
const OPTIONS_PATTERN_DECLARATION = /const\s+optionsPattern\s*=\s*\/(.+)\/([dgimsuvy]*);/;
const LAST_TWO_OPTION_PROPERTIES = /(^[ \t]*\w+:\s*true,\n)(^[ \t]*enableManifold:\s*true,\n)/m;

type EngineTemplate = { engine: string; mainTs: string };

const templateMainTs = (engine: string): string =>
    path.join(ENGINE_TEMPLATES_DIR, engine, TEMPLATE_LANGUAGE, "src", "main.ts");

const engineTemplates = (): EngineTemplate[] =>
    readdirSync(ENGINE_TEMPLATES_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => ({ engine: entry.name, mainTs: templateMainTs(entry.name) }))
        .filter((template) => existsSync(template.mainTs))
        .sort((left, right) => left.engine.localeCompare(right.engine));

const cliOptionsPattern = (): RegExp => {
    const source = readFileSync(CLI_SOURCE, "utf8");
    const declaration = OPTIONS_PATTERN_DECLARATION.exec(source);
    const body = declaration?.[1];
    if (!body) {
        throw new Error(
            `could not read "const optionsPattern = /.../;" out of ${CLI_SOURCE}. That regex is what rewrites a ` +
            "scaffolded project's src/main.ts when 64-bit OCCT is chosen; if it was renamed or moved, point this " +
            "test at it again rather than deleting the test. Check src/index.ts.");
    }
    return new RegExp(body, (declaration?.[2] ?? "").replace(/[gy]/g, ""));
};

type Manifest = { name: string; dependencies?: Record<string, string>; devDependencies?: Record<string, string> };

let work: string;

const scaffold = (args: string[]): { status: number | null; output: string } => {
    const result = spawnSync("node", [CLI, ...args], {
        cwd: work, encoding: "utf8", env: { ...process.env, CI: "1", NO_COLOR: "1" },
    });
    return { status: result.status, output: result.stdout + result.stderr };
};

const manifestOf = (...segments: string[]): Manifest =>
    JSON.parse(readFileSync(path.join(work, ...segments, "package.json"), "utf8")) as Manifest;

describe("create-app", () => {
    beforeAll(() => {
        if (!existsSync(CLI)) {
            const built = spawnSync("npm", ["run", "build"], { cwd: ROOT, encoding: "utf8" });
            expect(built.status, `building the CLI failed:\n${built.stdout}${built.stderr}`).toBe(0);
        }
        work = mkdtempSync(path.join(tmpdir(), "create-app-test-"));
    }, 120_000);

    afterAll(() => {
        if (work) rmSync(work, { recursive: true, force: true });
    });

    describe("a frontend project", () => {
        it.each(ENGINES)("should scaffold a runnable %s project", (engine) => {
            // Arrange
            const name = `frontend-${engine}`;

            // Act
            const { status } = scaffold([name, "-t", "frontend", "-e", engine, "-o", OCCT_BITNESS]);

            // Assert
            expect(status).toBe(0);
            for (const file of FRONTEND_FILES) {
                expect(existsSync(path.join(work, name, file)), `${name}/${file} is missing`).toBe(true);
            }
            const manifest = manifestOf(name);
            expect(manifest.name).toBe(name);
            expect(manifest.dependencies?.[`@bitbybit-dev/${engine}`]).toBe(RELEASE_VERSION);
        });

        it("should pin the engine package at the version this release publishes", () => {
            // Arrange
            const name = "pinned";

            // Act
            scaffold([name, "-t", "frontend", "-e", "threejs", "-o", OCCT_BITNESS]);

            // Assert
            const pins = Object.entries(manifestOf(name).dependencies ?? {})
                .filter(([dependency]) => dependency.startsWith("@bitbybit-dev/"));
            expect(pins.length).toBeGreaterThan(0);
            for (const [, pinned] of pins) expect(pinned).toBe(RELEASE_VERSION);
        });
    });

    describe("a cloud project", () => {
        it.each(CLOUD_BACKENDS)("should scaffold a frontend and a backend for %s", (backend) => {
            // Arrange
            const name = `cloud-${backend}`;

            // Act
            const { status } = scaffold([name, "-t", "cloud", "-b", backend]);

            // Assert
            expect(status).toBe(0);
            expect(existsSync(path.join(work, name, "frontend", "package.json"))).toBe(true);
            expect(existsSync(path.join(work, name, "backend", "package.json"))).toBe(true);
            expect(existsSync(path.join(work, name, "README.md"))).toBe(true);
        });
    });

    describe("when the arguments are wrong", () => {
        it("should refuse an engine it does not have a template for", () => {
            // Act
            const { status, output } = scaffold(["bad-engine", "-t", "frontend", "-e", "unrealengine", "-o", OCCT_BITNESS]);

            // Assert
            expect(status).toBe(FAILURE_EXIT);
            expect(output).toMatch(/unrealengine/);
            expect(existsSync(path.join(work, "bad-engine"))).toBe(false);
        });

        it("should refuse a backend it does not have a template for", () => {
            // Act
            const { status } = scaffold(["bad-backend", "-t", "cloud", "-b", "cobol"]);

            // Assert
            expect(status).toBe(FAILURE_EXIT);
            expect(existsSync(path.join(work, "bad-backend"))).toBe(false);
        });
    });

    describe("when the target directory is already there", () => {
        it("should refuse to write into a directory that has files in it", () => {
            // Arrange
            const name = "occupied";
            mkdirSync(path.join(work, name), { recursive: true });
            writeFileSync(path.join(work, name, "mine.txt"), "do not overwrite me");

            // Act
            const { status } = scaffold([name, "-t", "frontend", "-e", "threejs", "-o", OCCT_BITNESS]);

            // Assert
            expect(status).toBe(FAILURE_EXIT);
            expect(readFileSync(path.join(work, name, "mine.txt"), "utf8")).toBe("do not overwrite me");
        });
    });

    describe("the OCCT architecture patch", () => {
        const mismatchHint = (engine: string): string =>
            `templates/vite/${engine}/typescript/src/main.ts no longer matches the regex the CLI rewrites it with. ` +
            "\"enableManifold: true,\" has to stay the last property of the InitBitByBitOptions object literal, " +
            "or whoever picks 64-bit OCCT silently gets 32-bit. Check optionsPattern in src/index.ts.";

        it("should ship a patchable template for every engine the CLI offers", () => {
            // Act
            const engines = engineTemplates().map((template) => template.engine);

            // Assert
            expect(engines).toEqual([...ENGINES].sort());
        });

        it.each(engineTemplates())("should match the options object $engine's main.ts declares", ({ engine, mainTs }) => {
            // Arrange
            const template = readFileSync(mainTs, "utf8");

            // Act
            const matched = cliOptionsPattern().test(template);

            // Assert
            expect(matched, mismatchHint(engine)).toBe(true);
        });

        it("should stop matching once that options object is reordered", () => {
            const [first] = engineTemplates();
            if (!first) throw new Error(`no engine templates under ${ENGINE_TEMPLATES_DIR} - there is nothing left to patch`);
            const template = readFileSync(first.mainTs, "utf8");
            const reordered = template.replace(LAST_TWO_OPTION_PROPERTIES, "$2$1");

            // Act
            const matched = cliOptionsPattern().test(reordered);

            expect(reordered, "the swap changed nothing, so this case proves nothing").not.toBe(template);
            expect(matched).toBe(false);
        });

        it.each(ENGINES)("should write the chosen 64-bit architecture into a scaffolded %s project", (engine) => {
            // Arrange
            const name = `arch-64-${engine}`;

            // Act
            const { status } = scaffold([name, "-t", "frontend", "-e", engine, "-o", "64"]);

            // Assert
            expect(status).toBe(0);
            const generated = readFileSync(path.join(work, name, "src", "main.ts"), "utf8");
            expect(generated, mismatchHint(engine)).toMatch(/const options: InitBitByBitOptions = \{[\s\S]*?occtArchitecture: "64"\s*\};/);
        });

        it("should write the multi-threaded architecture the same way", () => {
            // Arrange
            const name = "arch-64-mt";

            // Act
            const { status } = scaffold([name, "-t", "frontend", "-e", "threejs", "-o", "64-mt"]);

            // Assert
            expect(status).toBe(0);
            const generated = readFileSync(path.join(work, name, "src", "main.ts"), "utf8");
            expect(generated, mismatchHint("threejs")).toMatch(/const options: InitBitByBitOptions = \{[\s\S]*?occtArchitecture: "64-mt"\s*\};/);
        });

        it("should leave main.ts exactly as the template has it for the default 32-bit choice", () => {
            // Arrange
            const name = "arch-32";

            // Act
            const { status } = scaffold([name, "-t", "frontend", "-e", "threejs", "-o", OCCT_BITNESS]);

            // Assert
            expect(status).toBe(0);
            const generated = readFileSync(path.join(work, name, "src", "main.ts"), "utf8");
            expect(generated).toBe(readFileSync(templateMainTs("threejs"), "utf8"));
        });
    });
});
