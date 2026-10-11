import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const REPO = path.resolve(ROOT, "..");
export const SKIP_DIRS = new Set(["node_modules", "dist", "build", ".next", ".nuxt", ".output", ".angular", ".verify-logs", ".local", "scripts", "bin", "obj"]);
export const config = JSON.parse(readFileSync(path.join(ROOT, "verify.config.json"), "utf8"));

export function discover(dir = ROOT, out = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) {
            continue;
        }
        const full = path.join(dir, entry.name);
        if (existsSync(path.join(full, "package.json"))) {
            out.push(path.relative(ROOT, full));
        } else {
            discover(full, out);
        }
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

export function selected(args, map = describe) {
    const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
    return discover().map(map).filter((e) => !only || e.path.includes(only));
}
