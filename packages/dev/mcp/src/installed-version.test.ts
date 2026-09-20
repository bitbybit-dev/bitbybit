import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { detectVersion, flagValue, installedVersions } from "./installed-version.js";

const manifest = (version: string): string => JSON.stringify({ version });

function filesystem(files: Record<string, string>): (path: string) => string | undefined {
    return (path) => files[path];
}

describe("installedVersions", () => {
    const temporaryDirectories: string[] = [];

    afterEach(() => {
        for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
    });

    it("reads the manifests from disk when no reader is given, and skips a package that is not installed", () => {
        // Arrange
        const project = mkdtempSync(join(tmpdir(), "bitbybit-mcp-test-"));
        temporaryDirectories.push(project);
        const core = join(project, "node_modules", "@bitbybit-dev", "core");
        mkdirSync(core, { recursive: true });
        writeFileSync(join(core, "package.json"), manifest("1.2.0"));

        // Act
        const found = installedVersions(project);

        // Assert
        expect([...found.entries()]).toEqual([["core", "1.2.0"]]);
    });

    it("walks up from the working directory and reads each package once", () => {
        // Arrange
        const project = join("/", "work", "app", "packages", "web");
        const readFile = filesystem({
            [join("/", "work", "app", "node_modules", "@bitbybit-dev", "core", "package.json")]: manifest("1.2.0"),
            [join("/", "work", "app", "packages", "web", "node_modules", "@bitbybit-dev", "threejs", "package.json")]: manifest("1.2.5"),
            [join("/", "node_modules", "@bitbybit-dev", "core", "package.json")]: manifest("0.1.0"),
        });

        // Act
        const found = installedVersions(project, readFile);

        // Assert
        expect([...found.entries()]).toEqual([["threejs", "1.2.5"], ["core", "1.2.0"]]);
    });
});

describe("detectVersion", () => {
    it("takes the command-line flag first, in both spellings", () => {
        // Act & Assert
        expect(detectVersion({ ownVersion: "1.2.5", argv: ["--version", "1.2.0"], env: { BITBYBIT_VERSION: "1.1.0" } })).toEqual({ version: "1.2.0", source: "flag" });
        expect(detectVersion({ ownVersion: "1.2.5", argv: ["--version=1.2.0"] })).toEqual({ version: "1.2.0", source: "flag" });
    });

    it("does not read a following flag as the version", () => {
        // Act & Assert
        expect(flagValue(["--version", "--no-cache"], "--version")).toBeUndefined();
        expect(flagValue(["--version"], "--version")).toBeUndefined();
        expect(flagValue(["--no-cache", "--version", "1.2.0"], "--version")).toBe("1.2.0");
        expect(detectVersion({ ownVersion: "1.2.5", argv: ["--version", "--no-cache"], env: { BITBYBIT_VERSION: "1.1.0" } })).toEqual({ version: "1.1.0", source: "env" });
    });

    it("takes the environment variable before the installed packages", () => {
        // Arrange
        const readFile = filesystem({ [join("/", "p", "node_modules", "@bitbybit-dev", "core", "package.json")]: manifest("1.2.0") });

        // Act
        const detected = detectVersion({ ownVersion: "1.2.5", cwd: "/p", env: { BITBYBIT_VERSION: "1.1.0" }, readFile });

        // Assert
        expect(detected).toEqual({ version: "1.1.0", source: "env" });
    });

    it("prefers the core package and reports installed packages that disagree", () => {
        // Arrange
        const warnings: string[] = [];
        const readFile = filesystem({
            [join("/", "p", "node_modules", "@bitbybit-dev", "core", "package.json")]: manifest("1.2.0"),
            [join("/", "p", "node_modules", "@bitbybit-dev", "occt", "package.json")]: manifest("1.1.0"),
        });

        // Act
        const detected = detectVersion({ ownVersion: "1.2.5", cwd: "/p", readFile, warn: (message) => warnings.push(message) });

        // Assert
        expect(detected).toEqual({ version: "1.2.0", source: "installed" });
        expect(warnings[0]).toContain("disagree");
        expect(warnings[0]).toContain("occt 1.1.0");
    });

    it("falls back to its own version when nothing is installed", () => {
        // Act
        const detected = detectVersion({ ownVersion: "1.2.5", cwd: "/nowhere", readFile: filesystem({}) });

        // Assert
        expect(detected).toEqual({ version: "1.2.5", source: "own" });
    });
});
