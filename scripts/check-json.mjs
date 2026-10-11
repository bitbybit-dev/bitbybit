#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const EXCLUDED_TREES = ["docs/", "examples/"];

export function isChecked(file) {
    if (!file.endsWith(".json")) {
        return false;
    }
    if (EXCLUDED_TREES.some((tree) => file.startsWith(tree))) {
        return false;
    }
    return !file.split("/").includes("node_modules");
}

export function jsonProblem(text) {
    try {
        JSON.parse(text);
        return null;
    } catch (error) {
        return error instanceof Error ? error.message : String(error);
    }
}

export function invalidJson(files, read) {
    return files.filter(isChecked).map((file) => ({ file, problem: jsonProblem(read(file)) })).filter((entry) => entry.problem !== null);
}

function trackedFiles() {
    return execFileSync("git", ["ls-files", "-z", "--", "*.json"], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).split("\0").filter(Boolean);
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const checked = trackedFiles().filter(isChecked).filter((file) => existsSync(path.join(ROOT, file)));
    const invalid = invalidJson(checked, (file) => readFileSync(path.join(ROOT, file), "utf8"));
    if (invalid.length) {
        console.error(`${invalid.length} tracked JSON file(s) are not plain JSON - no comments, no trailing commas:\n${invalid.map((entry) => `  ${entry.file}: ${entry.problem}`).join("\n")}`);
        process.exit(1);
    }
    console.log(`every tracked JSON file outside docs/ and examples/ is plain JSON (${checked.length} files)`);
}
