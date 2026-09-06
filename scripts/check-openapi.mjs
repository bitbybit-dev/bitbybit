#!/usr/bin/env node
// The committed OpenAPI document (docs/static/openapi.json) describes the CAD Cloud API the SDK
// package targets, and both carry the version: the document's info.version must equal
// @bitbybit-dev/cad-cloud-sdk's package version. A version bump that forgot to regenerate the
// document, or a regenerated document under an unbumped package, fails here - before the
// documentation site publishes the one and the registry the other.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => JSON.parse(readFileSync(path.join(ROOT, rel), "utf8"));

const document = read("docs/static/openapi.json");
const sdk = read("packages/dev/cad-cloud-sdk/package.json");
const documented = document?.info?.version;

if (!documented) {
    console.error("check-openapi: docs/static/openapi.json has no info.version");
    process.exit(1);
}
if (documented !== sdk.version) {
    console.error(`check-openapi: docs/static/openapi.json describes version ${documented} but @bitbybit-dev/cad-cloud-sdk is ${sdk.version} - regenerate the document from the API schemas and commit it with the SDK types`);
    process.exit(1);
}
console.log(`check-openapi: the OpenAPI document and @bitbybit-dev/cad-cloud-sdk agree on ${sdk.version} (${Object.keys(document.paths ?? {}).length} paths)`);
