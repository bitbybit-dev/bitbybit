// Finds the examples, and says what each one is. Both lanes over this directory read it: the
// verification lane (examples.mjs), which installs every example from the registry the way a user
// does, and the local lane (local.mjs), which points them at this repository's own packages
// instead. One walker means the two lanes can never disagree about what an example is.
//
// An example is any directory here with a package.json, generated output and node_modules aside.
// verify.config.json names the ones to skip, each with a reason, and the frameworks whose builds
// are too heavy to run every time.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const REPO = path.resolve(ROOT, "..");
export const SKIP_DIRS = new Set(["node_modules", "dist", "build", ".next", ".nuxt", ".output", ".angular", ".verify-logs", ".local", "scripts", "bin", "obj"]);
export const config = JSON.parse(readFileSync(path.join(ROOT, "verify.config.json"), "utf8"));

export function discover(dir = ROOT, out = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (existsSync(path.join(full, "package.json"))) out.push(path.relative(ROOT, full));
        else discover(full, out);
    }
    return out;
}

export function manifestOf(rel) {
    return JSON.parse(readFileSync(path.join(ROOT, rel, "package.json"), "utf8"));
}

export function describe(rel) {
    const manifest = manifestOf(rel);
    const skip = config.skip.find((s) => s.path === rel);
    const framework = rel.split("/")[0];
    return {
        path: rel,
        lockfile: existsSync(path.join(ROOT, rel, "package-lock.json")),
        build: Boolean(manifest.scripts && manifest.scripts.build),
        heavy: config.buildOnlyWithHeavy.includes(framework),
        skip: skip ? skip.reason : null,
    };
}

// The command-line shape both lanes share: `--only <part>` keeps the examples whose path contains
// that text, so `--only vite/threejs` is a directory and `--only cup` is every example named one.
export function selected(args, map = describe) {
    const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
    return discover().map(map).filter((e) => !only || e.path.includes(only));
}
