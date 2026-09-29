import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI = path.join(ROOT, "dist/index.js");
const RELEASE_VERSION = (JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")) as { version: string }).version;

const AGENT_FILES = ["AGENTS.md", "CLAUDE.md", ".mcp.json", ".cursor/mcp.json", ".vscode/mcp.json"];
const BRAND_FILES = ["public/favicon.ico", "public/logo.png"];
const TOOLCHAIN_FILES = ["tsconfig.json", "eslint.config.js"];
const FRONTEND_FILES = ["package.json", ...TOOLCHAIN_FILES, "index.html", "src/main.ts", "src/model.ts", "src/style.css", "scripts/smoke.ts", ...BRAND_FILES, ...AGENT_FILES];
const ENGINES = ["threejs", "babylonjs", "playcanvas"] as const;
const CLOUD_BACKENDS = ["hono-sdk", "hono-rest", "nodejs-sdk", "nodejs-rest", "dotnet-rest"] as const;
const BACKEND_MANIFEST: Record<(typeof CLOUD_BACKENDS)[number], string> = {
    "hono-sdk": "package.json", "hono-rest": "package.json", "nodejs-sdk": "package.json", "nodejs-rest": "package.json", "dotnet-rest": "dotnet-rest.csproj",
};
const BACKEND_SECRET: Record<(typeof CLOUD_BACKENDS)[number], string> = {
    "hono-sdk": ".dev.vars", "hono-rest": ".dev.vars", "nodejs-sdk": ".env", "nodejs-rest": ".env", "dotnet-rest": "appsettings.Development.json",
};
const APP_TEMPLATES = ["product-configurator", "laser-cut-box", "sheet-metal-unfold", "step-to-gltf-cli", "drone-assembly"] as const;
const SINGLE_APP_FILES = ["package.json", ...TOOLCHAIN_FILES, "index.html", "README.md", "src/main.ts", "src/model.ts", "src/style.css", "scripts/smoke.ts", ".gitignore", ...BRAND_FILES, ...AGENT_FILES];
const APP_FILES: Record<(typeof APP_TEMPLATES)[number], string[]> = {
    "product-configurator": SINGLE_APP_FILES,
    "laser-cut-box": SINGLE_APP_FILES,
    "sheet-metal-unfold": [
        "package.json", "README.md", ".gitignore", ...AGENT_FILES,
        "frontend/package.json", "frontend/tsconfig.json", "frontend/eslint.config.js", "frontend/vite.config.ts", "frontend/index.html", "frontend/src/main.ts", "frontend/src/model.ts", "frontend/src/cloud-access.ts", "frontend/scripts/smoke.ts", "frontend/public/favicon.ico", "frontend/public/logo.png",
        "backend/package.json", "backend/tsconfig.json", "backend/tsconfig.build.json", "backend/eslint.config.js", "backend/src/app.ts", "backend/src/cloud.ts", "backend/src/index.ts", "backend/scripts/smoke.ts", "backend/.env.example", "backend/.env",
    ],
    "step-to-gltf-cli": ["package.json", ...TOOLCHAIN_FILES, "README.md", ".gitignore", "src/cli.ts", "src/convert.ts", "src/cloud.ts", "src/kernel.ts", "samples/bracket.step", "scripts/smoke.ts", ...AGENT_FILES],
    "drone-assembly": [...SINGLE_APP_FILES, "src/parts.ts", "src/assembly.ts", "src/materials.ts", "src/kernel.ts", "src/ui.ts"],
};
const CLOUD_APP_TEMPLATES = ["sheet-metal-unfold"] as const;
const MCP_URL = "https://mcp.bitbybit.dev/mcp";
const TEMPLATES_DIR = path.join(ROOT, "templates");
const PLACEHOLDER = /\{\{[A-Z][A-Z0-9_]*\}\}/;
const TEXT_FILE = /\.(md|json|jsonc|ts|tsx|mjs|js|html|css|toml|cs|csproj|yml|yaml|env|example|vars)$/;
const OCCT_BITNESS = "32";
const FAILURE_EXIT = 1;
const WORKSPACE_MANIFEST = path.join(ROOT, "..", "..", "..", "package.json");
const REACT_TEMPLATE = path.join(TEMPLATES_DIR, "cloud", "frontend");
const REFERENCE_LINT_CONFIG = path.join(TEMPLATES_DIR, "vite", "threejs", "typescript", "eslint.config.js");
const STRICT_FLAGS = [
    "strict", "noUncheckedIndexedAccess", "exactOptionalPropertyTypes", "noImplicitReturns", "noImplicitOverride",
    "noPropertyAccessFromIndexSignature", "noFallthroughCasesInSwitch", "noUnusedLocals", "noUnusedParameters",
    "useUnknownInCatchVariables", "forceConsistentCasingInFileNames", "isolatedModules", "verbatimModuleSyntax",
    "erasableSyntaxOnly", "noUncheckedSideEffectImports", "skipLibCheck",
] as const;

const ENGINE_TEMPLATES_DIR = path.join(ROOT, "templates", "vite");
const TEMPLATE_LANGUAGE = "typescript";
const CLI_SOURCE = path.join(ROOT, "src", "index.ts");
const OPTIONS_PATTERN_DECLARATION = /const\s+optionsPattern\s*=\s*\/(.+)\/([dgimsuvy]*);/;
const LAST_TWO_OPTION_PROPERTIES = /(^[ \t]*\w+:\s*true,\n)(^[ \t]*enableManifold:\s*true,\n)/m;

type EngineTemplate = { engine: string; mainTs: string };

const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        if (entry.name === "node_modules") return [];
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? [full, ...walk(full)] : [full];
    });

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

type Manifest = { name: string; scripts?: Record<string, string>; dependencies?: Record<string, string>; devDependencies?: Record<string, string> };

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
            const manifest = manifestOf(name);
            const pins = Object.entries({ ...manifest.dependencies, ...manifest.devDependencies })
                .filter(([dependency]) => dependency.startsWith("@bitbybit-dev/"));
            expect(pins.map(([dependency]) => dependency).sort()).toEqual(["@bitbybit-dev/occt", "@bitbybit-dev/threejs"]);
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
            expect(existsSync(path.join(work, name, "frontend", "eslint.config.js"))).toBe(true);
            expect(existsSync(path.join(work, name, "backend", BACKEND_MANIFEST[backend]))).toBe(true);
            expect(existsSync(path.join(work, name, "backend", "eslint.config.js"))).toBe(backend !== "dotnet-rest");
            expect(existsSync(path.join(work, name, "README.md"))).toBe(true);
            for (const file of AGENT_FILES) {
                expect(existsSync(path.join(work, name, file)), `${name}/${file} is missing`).toBe(true);
            }
        });

        it.each(CLOUD_BACKENDS)("should tell the agent what needs CAD Cloud in a %s project, in AGENTS.md and the README", (backend) => {
            // Arrange
            const name = `cloud-explained-${backend}`;

            // Act
            scaffold([name, "-t", "cloud", "-b", backend]);

            // Assert
            const agents = readFileSync(path.join(work, name, "AGENTS.md"), "utf8");
            const readme = readFileSync(path.join(work, name, "README.md"), "utf8");
            for (const text of [agents, readme]) {
                expect(text).toMatch(/What needs CAD Cloud and where to get it/i);
                expect(text).toContain("https://bitbybit.dev/cad-cloud");
                expect(text).toContain("https://studio.bitbybit.dev/keys/billing");
                expect(text).toContain(`backend/${BACKEND_SECRET[backend]}`);
            }
            expect(agents).toContain(`cloud-${backend}`);
            expect(agents).toContain(backend === "dotnet-rest" ? "dotnet build" : "npm run smoke");
        });

        it.each(CLOUD_BACKENDS)("should give the %s backend a .gitignore that covers the secret file the CLI writes beside it", (backend) => {
            // Arrange
            const name = `ignored-${backend}`;
            const secret = BACKEND_SECRET[backend];

            // Act
            const { status } = scaffold([name, "-t", "cloud", "-b", backend]);

            // Assert
            expect(status).toBe(0);
            const backendDir = path.join(work, name, "backend");
            expect(existsSync(path.join(backendDir, secret))).toBe(true);
            expect(walk(path.join(work, name)).some((file) => path.basename(file).startsWith("_dot-"))).toBe(false);
            expect(readFileSync(path.join(backendDir, ".gitignore"), "utf8")).toContain(secret);
        });

        it.each(["nodejs-sdk", "nodejs-rest"] as const)("should restore the .env.example the %s backend's .env is copied from", (backend) => {
            // Arrange
            const name = `env-example-${backend}`;

            // Act
            const { status } = scaffold([name, "-t", "cloud", "-b", backend]);

            // Assert
            expect(status).toBe(0);
            const backendDir = path.join(work, name, "backend");
            expect(existsSync(path.join(backendDir, ".env.example"))).toBe(true);
            expect(readFileSync(path.join(backendDir, ".env"), "utf8")).toBe(readFileSync(path.join(backendDir, ".env.example"), "utf8"));
        });
    });

    describe("the agent layer", () => {
        const scaffolds = [
            { name: "agent-frontend", args: ["-t", "frontend", "-e", "threejs", "-o", OCCT_BITNESS], templateId: "vite-threejs" },
            { name: "agent-cloud", args: ["-t", "cloud", "-b", "hono-sdk"], templateId: "cloud-hono-sdk" },
        ];

        it.each(scaffolds)("should configure the Bitbybit CAD MCP for Claude Code, Cursor and VS Code in $name", ({ name: base, args }) => {
            // Arrange
            const name = `${base}-mcp`;

            // Act
            const { status } = scaffold([name, ...args]);

            // Assert
            expect(status).toBe(0);
            const json = (file: string): Record<string, Record<string, Record<string, string>>> =>
                JSON.parse(readFileSync(path.join(work, name, file), "utf8")) as Record<string, Record<string, Record<string, string>>>;
            expect(json(".mcp.json")["mcpServers"]?.["bitbybit"]).toEqual({ type: "http", url: MCP_URL });
            expect(json(".cursor/mcp.json")["mcpServers"]?.["bitbybit"]).toEqual({ url: MCP_URL });
            expect(json(".vscode/mcp.json")["servers"]?.["bitbybit"]).toEqual({ type: "http", url: MCP_URL });
        });

        it.each(scaffolds)("should write one AGENTS.md for $name, rendered, with the template's section after the shared text, and point CLAUDE.md at it", ({ name: base, args, templateId }) => {
            // Arrange
            const name = `${base}-agents`;

            // Act
            const { status } = scaffold([name, ...args]);

            // Assert
            expect(status).toBe(0);
            const agents = readFileSync(path.join(work, name, "AGENTS.md"), "utf8");
            expect(agents.startsWith(`# ${name}\n`)).toBe(true);
            expect(agents).toContain(`\`@bitbybit-dev/create-app\` ${RELEASE_VERSION}`);
            expect(agents).toContain(`\`${templateId}\` template`);
            expect(agents).toContain(MCP_URL);
            expect(agents).toMatch(/npm run smoke/);
            expect(agents.indexOf("## This template")).toBeGreaterThan(agents.indexOf("## The loop"));
            expect(readFileSync(path.join(work, name, "CLAUDE.md"), "utf8")).toBe("@AGENTS.md\n");
            expect(existsSync(path.join(work, name, "AGENTS.section.md"))).toBe(false);
        });

        it.each(scaffolds)("should leave no placeholder in any text file of $name", ({ name: base, args }) => {
            // Arrange
            const name = `${base}-rendered`;

            // Act
            scaffold([name, ...args]);

            // Assert
            const unrendered = walk(path.join(work, name))
                .filter((file) => TEXT_FILE.test(file) && PLACEHOLDER.test(readFileSync(file, "utf8")))
                .map((file) => path.relative(work, file));
            expect(unrendered).toEqual([]);
        });

        it("should keep every dotfile of every template staged under the _dot- prefix, because npm drops some of them from the tarball", () => {
            // Act
            const dotted = walk(TEMPLATES_DIR)
                .map((file) => path.relative(TEMPLATES_DIR, file))
                .filter((relative) => relative.split(path.sep).some((segment) => segment.startsWith(".") || segment === "_gitignore"));

            // Assert
            expect(dotted).toEqual([]);
        });

        it("should give every frontend template the same smoke runner and a smoke script that runs it", () => {
            // Arrange
            const smokes = ENGINES.map((engine) => path.join(TEMPLATES_DIR, "vite", engine, "typescript", "scripts", "smoke.ts"));

            // Act
            const runners = smokes.map((file) => readFileSync(file, "utf8").replace(/vite-(threejs|babylonjs|playcanvas)/g, "vite-<engine>"));
            const scripts = ENGINES.map((engine) => (JSON.parse(readFileSync(path.join(TEMPLATES_DIR, "vite", engine, "typescript", "package.json"), "utf8")) as { scripts: Record<string, string> }).scripts["smoke"]);

            // Assert
            expect(new Set(runners).size).toBe(1);
            expect(scripts).toEqual(ENGINES.map(() => "npm run typecheck && npm run lint && tsx scripts/smoke.ts"));
        });
    });

    describe("an app template project", () => {
        it.each(APP_TEMPLATES)("should scaffold %s with its files, the agent layer and one lockstep pin", (template) => {
            // Arrange
            const name = `app-${template}`;

            // Act
            const { status, output } = scaffold([name, "-t", "app", "-T", template]);

            // Assert
            expect(status).toBe(0);
            for (const file of APP_FILES[template]) {
                expect(existsSync(path.join(work, name, file)), `${name}/${file} is missing`).toBe(true);
            }
            const manifest = manifestOf(name);
            expect(manifest.name).toBe(name);
            const manifests = walk(path.join(work, name)).filter((file) => path.basename(file) === "package.json").map((file) => JSON.parse(readFileSync(file, "utf8")) as Manifest);
            const pins = manifests.flatMap((m) => Object.entries({ ...m.dependencies, ...m.devDependencies })).filter(([dependency]) => dependency.startsWith("@bitbybit-dev/"));
            expect(pins.length).toBeGreaterThan(0);
            for (const [, pinned] of pins) expect(pinned).toBe(RELEASE_VERSION);
            expect(pins.map(([dependency]) => dependency)).toContain("@bitbybit-dev/occt");
            const agents = readFileSync(path.join(work, name, "AGENTS.md"), "utf8");
            expect(agents).toContain(`\`${template}\` template`);
            expect(agents.indexOf("## This template")).toBeGreaterThan(agents.indexOf("## The loop"));
            expect(readFileSync(path.join(work, name, "README.md"), "utf8")).toContain(`# ${name}`);
            expect(output).toMatch(/npm run smoke/);
        });

        it.each(CLOUD_APP_TEMPLATES)("should tell the agent and the user what needs CAD Cloud in %s, and say so when scaffolding", (template) => {
            // Arrange
            const name = `app-cloud-${template}`;

            // Act
            const { status, output } = scaffold([name, "-t", "app", "-T", template]);

            // Assert
            expect(status).toBe(0);
            for (const file of ["AGENTS.md", "README.md"]) {
                const text = readFileSync(path.join(work, name, file), "utf8");
                expect(text).toMatch(/What needs CAD Cloud and where to get it/i);
                expect(text).toContain("https://bitbybit.dev/cad-cloud");
                expect(text).toContain("https://studio.bitbybit.dev/keys/billing");
            }
            expect(output).toMatch(/needs an API key/);
            expect(readFileSync(path.join(work, name, "backend", ".env"), "utf8")).toMatch(/^BITBYBIT_API_KEY=$/m);
            expect(readFileSync(path.join(work, name, ".gitignore"), "utf8")).toMatch(/^\.env$/m);
        });

        it("should take --template alone as the app type", () => {
            // Act
            const { status } = scaffold(["app-implicit", "-T", "product-configurator"]);

            // Assert
            expect(status).toBe(0);
            expect(existsSync(path.join(work, "app-implicit", "src", "model.ts"))).toBe(true);
        });

        it("should ignore an engine and an architecture for an app template and say so", () => {
            // Act
            const { status, output } = scaffold(["app-engine-ignored", "-t", "app", "-T", "product-configurator", "-e", "babylonjs", "-o", "64"]);

            // Assert
            expect(status).toBe(0);
            expect(output).toMatch(/--engine and --occt-architecture .* ignored/);
            expect(readFileSync(path.join(work, "app-engine-ignored", "package.json"), "utf8")).toContain("@bitbybit-dev/threejs");
            expect(existsSync(path.join(work, "app-engine-ignored", "vite.config.ts"))).toBe(false);
        });

        it("should refuse a template it does not have, list the ones it has, and write nothing", () => {
            // Act
            const { status, output } = scaffold(["bad-template", "-t", "app", "-T", "space-elevator"]);

            // Assert
            expect(status).toBe(FAILURE_EXIT);
            expect(output).toMatch(/space-elevator/);
            for (const template of APP_TEMPLATES) expect(output).toContain(template);
            expect(existsSync(path.join(work, "bad-template"))).toBe(false);
        });

        it("should offer exactly the templates that have a directory under templates/apps", () => {
            // Arrange
            const shipped = readdirSync(path.join(TEMPLATES_DIR, "apps"), { withFileTypes: true })
                .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

            // Act
            const { output } = scaffold(["list-probe", "-t", "app", "-T", "not-a-template"]);
            const listed = /Valid options: (.+)/.exec(output)?.[1]?.split(",").map((id) => id.trim()).sort();

            // Assert
            expect(listed).toEqual(shipped);
            expect(shipped).toEqual([...APP_TEMPLATES].sort());
        });
    });

    describe("the toolchain every template ships", () => {
        const manifests = walk(TEMPLATES_DIR).filter((file) => path.basename(file) === "package.json");
        const projects = manifests.map((file) => path.dirname(file)).filter((dir) => existsSync(path.join(dir, "tsconfig.json")));
        const readManifest = (file: string): Manifest => JSON.parse(readFileSync(file, "utf8")) as Manifest;

        it("should pin TypeScript at the version the workspace pins, in every template and in this package", () => {
            // Arrange
            const workspacePin = readManifest(WORKSPACE_MANIFEST).devDependencies?.["typescript"];

            // Assert
            expect(workspacePin).toMatch(/^\d+\.\d+\.\d+$/);
            expect(readManifest(path.join(ROOT, "package.json")).devDependencies?.["typescript"]).toBe(workspacePin);
            for (const dir of projects) {
                expect(readManifest(path.join(dir, "package.json")).devDependencies?.["typescript"], path.relative(TEMPLATES_DIR, dir)).toBe(workspacePin);
            }
        });

        it("should give every TypeScript project the strict compiler flags, a lint script and a typecheck script the smoke runs first", () => {
            for (const dir of projects) {
                // Arrange
                const relative = path.relative(TEMPLATES_DIR, dir);
                const tsconfig = JSON.parse(readFileSync(path.join(dir, "tsconfig.json"), "utf8")) as { compilerOptions: Record<string, unknown> };
                const scripts = readManifest(path.join(dir, "package.json")).scripts ?? {};

                // Assert
                for (const flag of STRICT_FLAGS) expect(tsconfig.compilerOptions[flag], `${relative}: ${flag}`).toBe(true);
                expect(scripts["typecheck"], relative).toBe("tsc --noEmit");
                expect(scripts["lint"], relative).toBe("eslint . --max-warnings 0");
                expect(scripts["smoke"], relative).toMatch(/^npm run typecheck && npm run lint/);
                expect(existsSync(path.join(dir, "eslint.config.js")), relative).toBe(true);
            }
        });

        it("should hold every template but the React one to the one ESLint configuration, and give the React one the hooks rules on top", () => {
            // Arrange
            const reference = readFileSync(REFERENCE_LINT_CONFIG, "utf8");

            // Assert
            for (const dir of projects.filter((candidate) => candidate !== REACT_TEMPLATE)) {
                expect(readFileSync(path.join(dir, "eslint.config.js"), "utf8"), path.relative(TEMPLATES_DIR, dir)).toBe(reference);
            }
            expect(readFileSync(path.join(REACT_TEMPLATE, "eslint.config.js"), "utf8")).toContain("reactHooks.configs.flat.recommended");
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
