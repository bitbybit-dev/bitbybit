#!/usr/bin/env node
/**
 * docusaurus-plugin-openapi-docs renders the parameter, request-body and response panes
 * client-side, so every endpoint page ships 13-73 words of server-rendered text and a
 * row of empty skeleton divs. Googlebot eventually renders them; GPTBot, ClaudeBot,
 * PerplexityBot and Bingbot's text pass do not, so the paid API product's only reference
 * documentation is invisible to exactly the crawlers that most need it.
 *
 * This appends a plain-markdown mirror of the same data to each generated .api.mdx,
 * built from static/openapi.json. Runs after `generate-api-docs`, before the build.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SPEC = path.join(ROOT, "static", "openapi.json");
const DOCS = path.join(ROOT, "api", "openapi-docs");
const MARKER = "{/* static-reference:generated */}";
const MAX_DEPTH = 3;

function loadSpec() {
    return JSON.parse(fs.readFileSync(SPEC, "utf8"));
}

function resolveRef(spec, node, seen) {
    let current = node;
    while (current && current.$ref) {
        const ref = current.$ref;
        if (seen.has(ref)) return {};
        seen.add(ref);
        const parts = ref.replace(/^#\//, "").split("/");
        current = parts.reduce((acc, key) => (acc ? acc[key] : undefined), spec);
    }
    return current || {};
}

function typeOf(schema) {
    if (!schema) return "";
    if (schema.enum) return schema.enum.map((v) => `\`${v}\``).join(" | ");
    if (schema.type === "array") {
        const item = schema.items || {};
        return `array of ${item.type || "object"}`;
    }
    if (schema.oneOf || schema.anyOf) {
        const list = schema.oneOf || schema.anyOf;
        return list.map((s) => s.type || "object").join(" | ");
    }
    return schema.type || "object";
}

function escapeCell(value) {
    return String(value == null ? "" : value)
        .replace(/\r?\n/g, " ")
        .replace(/\|/g, "\\|")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\{/g, "&#123;")
        .replace(/\}/g, "&#125;")
        .trim();
}

function flatten(spec, schema, prefix, depth, seen, rows) {
    const resolved = resolveRef(spec, schema, seen);
    const properties = resolved.properties || {};
    const required = new Set(resolved.required || []);
    for (const [name, raw] of Object.entries(properties)) {
        const value = resolveRef(spec, raw, new Set(seen));
        const full = prefix ? `${prefix}.${name}` : name;
        rows.push({
            name: full,
            type: typeOf(value),
            required: required.has(name) ? "yes" : "no",
            description: value.description || raw.description || "",
            fallback: value.default
        });
        if (depth < MAX_DEPTH && (value.type === "object" || value.properties)) {
            flatten(spec, value, full, depth + 1, new Set(seen), rows);
        }
        if (depth < MAX_DEPTH && value.type === "array" && value.items) {
            flatten(spec, value.items, `${full}[]`, depth + 1, new Set(seen), rows);
        }
    }
    return rows;
}

function parameterTable(spec, parameters) {
    if (!parameters || parameters.length === 0) return [];
    const lines = ["| Parameter | In | Type | Required | Description |", "|---|---|---|---|---|"];
    for (const raw of parameters) {
        const p = resolveRef(spec, raw, new Set());
        const schema = resolveRef(spec, p.schema, new Set());
        lines.push(`| \`${escapeCell(p.name)}\` | ${escapeCell(p.in)} | ${escapeCell(typeOf(schema))} `
            + `| ${p.required ? "yes" : "no"} | ${escapeCell(p.description || schema.description || "")} |`);
    }
    return ["### Parameters", "", ...lines, ""];
}

function bodyTable(spec, requestBody) {
    if (!requestBody) return [];
    const body = resolveRef(spec, requestBody, new Set());
    const content = body.content || {};
    const mediaType = Object.keys(content)[0];
    if (!mediaType) return [];
    const rows = flatten(spec, content[mediaType].schema, "", 0, new Set(), []);
    const out = ["### Request body", "", `Content type: \`${mediaType}\`${body.required ? " (required)" : ""}`, ""];
    if (rows.length === 0) return out;
    out.push("| Field | Type | Required | Description |", "|---|---|---|---|");
    for (const row of rows) {
        const suffix = row.fallback === undefined ? "" : ` Default: \`${escapeCell(row.fallback)}\`.`;
        out.push(`| \`${escapeCell(row.name)}\` | ${escapeCell(row.type)} | ${row.required} `
            + `| ${escapeCell(row.description)}${escapeCell(suffix)} |`);
    }
    out.push("");
    return out;
}

function responseTable(spec, responses) {
    if (!responses) return [];
    const lines = ["| Status | Description |", "|---|---|"];
    for (const [code, raw] of Object.entries(responses)) {
        const response = resolveRef(spec, raw, new Set());
        lines.push(`| \`${escapeCell(code)}\` | ${escapeCell(response.description || "")} |`);
    }
    return ["### Responses", "", ...lines, ""];
}

function curlExample(spec, method, route, operation) {
    const base = (spec.servers && spec.servers[0] && spec.servers[0].url) || "https://api.bitbybit.dev";
    const lines = [`curl -X ${method.toUpperCase()} "${base}${route}" \\`];
    lines.push(`  -H "x-api-key: YOUR_API_KEY"`);
    if (operation.requestBody) {
        lines[lines.length - 1] += " \\";
        lines.push(`  -H "Content-Type: application/json" \\`);
        lines.push(`  -d '{ ... }'`);
    }
    return ["### Example request", "", "```bash", ...lines, "```", ""];
}

function sectionFor(spec, method, route) {
    const operation = ((spec.paths || {})[route] || {})[method];
    if (!operation) return null;
    const out = [MARKER, "", "## Reference", "",
        `\`${method.toUpperCase()} ${route}\``, ""];
    if (operation.description) out.push(escapeCell(operation.description), "");
    out.push(...parameterTable(spec, operation.parameters));
    out.push(...bodyTable(spec, operation.requestBody));
    out.push(...responseTable(spec, operation.responses));
    out.push(...curlExample(spec, method, route, operation));
    out.push("Authentication: send your key in the `x-api-key` header. "
        + "The full machine-readable specification is at "
        + "[openapi.json](https://learn.bitbybit.dev/openapi.json).", "");
    return out.join("\n");
}

function main() {
    if (!fs.existsSync(SPEC)) {
        console.error(`[openapi-static] no spec at ${SPEC}`);
        process.exit(1);
    }
    const spec = loadSpec();
    let injected = 0;
    let skipped = 0;
    for (const file of fs.readdirSync(DOCS)) {
        if (!file.endsWith(".api.mdx")) continue;
        const full = path.join(DOCS, file);
        let mdx = fs.readFileSync(full, "utf8");
        if (mdx.includes(MARKER)) { skipped++; continue; }
        const m = /<MethodEndpoint\s+method=\{"([^"]+)"\}\s+path=\{"([^"]+)"\}/.exec(mdx);
        if (!m) { skipped++; continue; }
        const section = sectionFor(spec, m[1], m[2]);
        if (!section) { skipped++; continue; }
        fs.writeFileSync(full, `${mdx.trimEnd()}\n\n${section}`, "utf8");
        injected++;
    }
    console.log(`[openapi-static] injected static reference into ${injected} pages, skipped ${skipped}`);
}

main();
