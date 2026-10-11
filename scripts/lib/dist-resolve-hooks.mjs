import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DEV = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../packages/dev");
const WORKSPACE_PACKAGE = /^@bitbybit-dev\/([a-z0-9-]+)(?:\/(.*))?$/;

const isFile = (candidate) => existsSync(candidate) && statSync(candidate).isFile();

function packageFile(name, rest) {
    const dist = path.join(DEV, name, "dist");
    const candidates = rest === undefined ? [path.join(dist, "index.js")] : [path.join(dist, `${rest}.js`), path.join(dist, rest, "index.js"), path.join(dist, rest)];
    return candidates.find(isFile);
}

function relativeFile(specifier, parentURL) {
    const base = fileURLToPath(new URL(specifier, parentURL));
    return [base, `${base}.js`, path.join(base, "index.js")].find(isFile);
}

export async function resolve(specifier, context, next) {
    const named = WORKSPACE_PACKAGE.exec(specifier);
    const found = named
        ? packageFile(named[1], named[2])
        : (specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:") ? relativeFile(specifier, context.parentURL) : undefined;
    return next(found === undefined ? specifier : pathToFileURL(found).href, context);
}
