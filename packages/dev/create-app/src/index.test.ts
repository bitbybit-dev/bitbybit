import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
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
        // The suite runs the CLI as a user does, so it needs the build the package publishes.
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
});
