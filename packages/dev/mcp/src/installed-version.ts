import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** The packages whose installed version says which API version a project uses, most authoritative first. */
export const VERSION_PACKAGES = ["core", "babylonjs", "threejs", "playcanvas", "occt"] as const;

export type VersionSource = "flag" | "env" | "installed" | "own";

export interface DetectedVersion {
    version: string;
    source: VersionSource;
}

export interface DetectVersionOptions {
    /** The version of this package, which is also the newest API version it was released with. */
    ownVersion: string;
    cwd?: string;
    env?: Record<string, string | undefined>;
    argv?: readonly string[];
    warn?: (message: string) => void;
    /** Reads a file's text, or nothing when it does not exist. Injected by tests. */
    readFile?: (path: string) => string | undefined;
}

function readTextIfPresent(path: string): string | undefined {
    return existsSync(path) ? readFileSync(path, "utf8") : undefined;
}

function versionOf(text: string | undefined): string | undefined {
    if (text === undefined) return undefined;
    try {
        const manifest: unknown = JSON.parse(text);
        if (typeof manifest === "object" && manifest !== null && "version" in manifest && typeof manifest.version === "string") return manifest.version;
    } catch {
        return undefined;
    }
    return undefined;
}

/** The value after a flag, or of its `--flag=value` spelling; a following flag is not a value. */
export function flagValue(argv: readonly string[], flag: string): string | undefined {
    const index = argv.indexOf(flag);
    if (index !== -1) {
        const value = argv[index + 1];
        return value !== undefined && !value.startsWith("-") ? value : undefined;
    }
    const inline = argv.find((argument) => argument.startsWith(`${flag}=`));
    return inline?.slice(flag.length + 1);
}

/** The installed `@bitbybit-dev/*` versions found walking up from a directory, keyed by package. */
export function installedVersions(cwd: string, readFile: (path: string) => string | undefined = readTextIfPresent): Map<string, string> {
    const found = new Map<string, string>();
    let directory = cwd;
    for (;;) {
        for (const name of VERSION_PACKAGES) {
            if (found.has(name)) continue;
            const version = versionOf(readFile(join(directory, "node_modules", "@bitbybit-dev", name, "package.json")));
            if (version !== undefined) found.set(name, version);
        }
        const parent = dirname(directory);
        if (parent === directory) break;
        directory = parent;
    }
    return found;
}

/**
 * Which API version to serve: `--version` on the command line, then `BITBYBIT_VERSION`, then the
 * version of the `@bitbybit-dev` packages installed around the working directory, then this
 * package's own version. Installed packages that disagree are reported and the first wins.
 */
export function detectVersion(options: DetectVersionOptions): DetectedVersion {
    const flag = flagValue(options.argv ?? [], "--version");
    if (flag !== undefined && flag !== "") return { version: flag, source: "flag" };
    const fromEnv = options.env?.["BITBYBIT_VERSION"];
    if (fromEnv !== undefined && fromEnv !== "") return { version: fromEnv, source: "env" };
    if (options.cwd !== undefined) {
        const installed = installedVersions(options.cwd, options.readFile);
        const first = VERSION_PACKAGES.map((name) => installed.get(name)).find((version) => version !== undefined);
        if (first !== undefined) {
            const others = [...installed.entries()].filter(([, version]) => version !== first);
            if (others.length > 0 && options.warn) {
                options.warn(`Installed @bitbybit-dev packages disagree on their version (${[...installed.entries()].map(([name, version]) => `${name} ${version}`).join(", ")}); serving ${first}`);
            }
            return { version: first, source: "installed" };
        }
    }
    return { version: options.ownVersion, source: "own" };
}
