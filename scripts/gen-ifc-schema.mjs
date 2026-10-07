#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const SCHEMAS = [
    { source: "packages/dev/ifc/schema/IFC4_ADD2_TC1.exp", out: "packages/dev/ifc/lib/schema/generated/ifc4.ts", constant: "IFC4_SCHEMA", release: "IFC4 ADD2 TC1" },
];

const AGGREGATE = /^(LIST|SET|ARRAY|BAG)\s*\[\s*(\S+?)\s*:\s*(\S+?)\s*\]\s*OF\s+(UNIQUE\s+)?([\s\S]*)$/;
const TEXT_OR_BINARY = /^(STRING|BINARY)(\s*\(\s*\d+\s*\))?(\s+FIXED)?$/;
const SIMPLE = new Set(["REAL", "INTEGER", "NUMBER", "STRING", "BOOLEAN", "LOGICAL", "BINARY"]);

export function stripComments(text) {
    return text.replace(/\(\*[\s\S]*?\*\)/g, " ").replace(/\r\n?/g, "\n");
}

export function typeSpecOf(text) {
    const spec = text.trim().replace(/\s+/g, " ");
    const aggregate = AGGREGATE.exec(spec);
    if (aggregate) {
        const lower = Number(aggregate[2]);
        const upper = aggregate[3] === "?" ? null : Number(aggregate[3]);
        if (!Number.isInteger(lower) || (upper !== null && !Number.isInteger(upper))) {
            throw new Error(`aggregate bounds that are not whole numbers: ${spec}`);
        }
        return [aggregate[1], lower, upper, typeSpecOf(aggregate[5])];
    }
    const textOrBinary = TEXT_OR_BINARY.exec(spec);
    if (textOrBinary) {
        return textOrBinary[1];
    }
    if (!/^\w+$/.test(spec)) {
        throw new Error(`a type the generator cannot read: ${spec}`);
    }
    return spec;
}

function splitStatements(text) {
    return text.split(";").map((s) => s.trim()).filter((s) => s.length > 0);
}

function listOf(text) {
    return text.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
}

export function readTypes(source) {
    const types = {};
    for (const match of source.matchAll(/^\s*TYPE\s+(\w+)\s*=\s*([\s\S]*?);\s*(?:WHERE[\s\S]*?)?END_TYPE;/gm)) {
        const [, name, rawBody] = match;
        const body = rawBody.trim();
        const enumeration = /^ENUMERATION OF\s*\(([\s\S]*)\)$/.exec(body);
        const select = /^SELECT\s*\(([\s\S]*)\)$/.exec(body);
        if (enumeration) {
            types[name] = { e: listOf(enumeration[1]) };
        } else if (select) {
            types[name] = { s: listOf(select[1]) };
        } else {
            types[name] = { t: typeSpecOf(body) };
        }
    }
    return types;
}

function explicitAttributes(name, text) {
    const attributes = [];
    for (const statement of splitStatements(text)) {
        if (/^SELF\\/.test(statement)) {
            throw new Error(`${name}: redeclares an inherited attribute in its explicit section, which the generator does not apply: ${statement}`);
        }
        const match = /^([\w\s,]+?)\s*:\s*(OPTIONAL\s+)?([\s\S]+)$/.exec(statement);
        if (!match) {
            throw new Error(`${name}: an attribute the generator cannot read: ${statement}`);
        }
        for (const attribute of listOf(match[1])) {
            const spec = typeSpecOf(match[3]);
            attributes.push(match[2] ? [attribute, spec, 1] : [attribute, spec]);
        }
    }
    return attributes;
}

function derivedRedeclarations(text) {
    const derived = [];
    for (const statement of splitStatements(text)) {
        const match = /^SELF\\\w+\.(\w+)\s*:/.exec(statement);
        if (match) {
            derived.push(match[1]);
        }
    }
    return derived;
}

function inverseAttributes(name, text) {
    const inverse = [];
    for (const statement of splitStatements(text)) {
        const match = /^(\w+)\s*:\s*([\s\S]+?)\s+FOR\s+(\w+)$/.exec(statement);
        if (!match) {
            throw new Error(`${name}: an inverse attribute the generator cannot read: ${statement}`);
        }
        inverse.push([match[1], typeSpecOf(match[2]), match[3]]);
    }
    return inverse;
}

export function readEntities(source) {
    const entities = {};
    for (const match of source.matchAll(/^\s*ENTITY\s+(\w+)([\s\S]*?)END_ENTITY;/gm)) {
        const [, name, body] = match;
        const headerEnd = body.indexOf(";");
        const header = body.slice(0, headerEnd);
        const supertypes = /SUBTYPE OF\s*\(([^)]*)\)/.exec(header);
        const parents = supertypes ? listOf(supertypes[1]) : [];
        if (parents.length > 1) {
            throw new Error(`${name}: more than one supertype, which no IFC schema has`);
        }
        const sections = body.slice(headerEnd + 1).split(/^\s*(DERIVE|INVERSE|UNIQUE|WHERE)\b/m);
        const entity = { p: parents[0] ?? null, a: explicitAttributes(name, sections[0]) };
        if (/\bABSTRACT\b/.test(header)) {
            entity.abs = 1;
        }
        for (let index = 1; index < sections.length; index += 2) {
            if (sections[index] === "DERIVE") {
                const derived = derivedRedeclarations(sections[index + 1]);
                if (derived.length) {
                    entity.d = derived;
                }
            } else if (sections[index] === "INVERSE") {
                entity.i = inverseAttributes(name, sections[index + 1]);
            }
        }
        entities[name] = entity;
    }
    return entities;
}

function namesIn(spec) {
    return typeof spec === "string" ? [spec] : namesIn(spec[3]);
}

export function checkReferences(schema) {
    const known = (name) => SIMPLE.has(name) || name in schema.types || name in schema.entities;
    const problems = [];
    for (const [name, type] of Object.entries(schema.types)) {
        const used = type.t ? namesIn(type.t) : type.s ?? [];
        problems.push(...used.filter((n) => !known(n)).map((n) => `type ${name} names ${n}, which the schema does not define`));
    }
    for (const [name, entity] of Object.entries(schema.entities)) {
        if (entity.p && !(entity.p in schema.entities)) {
            problems.push(`entity ${name} is a subtype of ${entity.p}, which the schema does not define`);
        }
        for (const [attribute, spec] of entity.a) {
            problems.push(...namesIn(spec).filter((n) => !known(n)).map((n) => `${name}.${attribute} names ${n}, which the schema does not define`));
        }
        const inherited = new Set();
        for (let parent = entity.p; parent; parent = schema.entities[parent]?.p) {
            schema.entities[parent]?.a.forEach(([attribute]) => inherited.add(attribute));
        }
        problems.push(...(entity.d ?? []).filter((d) => !inherited.has(d)).map((d) => `${name} derives ${d}, which none of its supertypes declares`));
    }
    return problems;
}

export function readSchema(text) {
    const source = stripComments(text);
    const name = /\bSCHEMA\s+(\w+)\s*;/.exec(source)?.[1];
    if (!name) {
        throw new Error("no SCHEMA declaration");
    }
    const schema = { name, types: readTypes(source), entities: readEntities(source) };
    const problems = checkReferences(schema);
    if (problems.length) {
        throw new Error(`the schema does not hold together:\n  ${problems.join("\n  ")}`);
    }
    return schema;
}

export function noticeOf(text) {
    const notice = /^\s*\(\*([\s\S]*?)\*\)/.exec(text.replace(/\r\n?/g, "\n"));
    if (!notice || !/buildingSMART International Limited/.test(notice[1])) {
        throw new Error("the schema file no longer opens with buildingSMART's copyright notice");
    }
    return notice[1].trim().split("\n").map((line) => line.trimEnd());
}

export function emit(schema, notice, target) {
    const row = (name, value) => `        ${name}: ${JSON.stringify(value)},`;
    return [
        `// GENERATED by scripts/gen-ifc-schema.mjs from ${target.source} - do not edit; regenerate with \`npm run gen:ifc-schema\`.`,
        `// The ${target.release} schema of buildingSMART International, translated into a table; its notice follows.`,
        ...notice.map((line) => `// ${line}`.trimEnd()),
        "import type { CompactSchema } from \"../schema-types\";",
        "",
        `export const ${target.constant}: CompactSchema = {`,
        `    name: ${JSON.stringify(schema.name)},`,
        `    release: ${JSON.stringify(target.release)},`,
        "    types: {",
        ...Object.entries(schema.types).map(([name, value]) => row(name, value)),
        "    },",
        "    entities: {",
        ...Object.entries(schema.entities).map(([name, value]) => row(name, value)),
        "    },",
        "};",
        "",
    ].join("\n");
}

function main() {
    const check = process.argv.includes("--check");
    const stale = [];
    for (const target of SCHEMAS) {
        const text = readFileSync(path.join(ROOT, target.source), "latin1");
        const schema = readSchema(text);
        const output = emit(schema, noticeOf(text), target);
        const file = path.join(ROOT, target.out);
        if (existsSync(file) && readFileSync(file, "utf8") === output) {
            continue;
        }
        stale.push(target.out);
        if (!check) {
            writeFileSync(file, output);
        }
        console.log(`${schema.name}: ${Object.keys(schema.entities).length} entities, ${Object.keys(schema.types).length} types`);
    }
    if (check && stale.length) {
        console.error(`the IFC schema tables are out of date:\n  ${stale.join("\n  ")}\nrun \`npm run gen:ifc-schema\` and commit the result`);
        process.exit(1);
    }
    console.log(check ? `the IFC schema tables are up to date (${SCHEMAS.length})` : `${stale.length} IFC schema table(s) written`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main();
}
