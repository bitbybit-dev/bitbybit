#!/usr/bin/env node
/**
 * Generate the JSON Schema of the design document from its TypeScript types.
 *
 * The types in packages/dev/occt/lib/api/models/design/document.ts are the source of the format:
 * the runner is written against them, and this schema is what editors, agents and other languages
 * check a document with before any kernel runs. It is read through the compiler's type checker, so
 * a mapped type such as the pen commands (every number of a sketch command allowed to be an
 * expression) resolves to the plain objects it stands for.
 *
 * Every interface and type alias whose name starts with Design or Sketch becomes a definition under
 * `$defs`, described by its JSDoc; everything else is written in place. An object without an index
 * signature allows no other properties, because the format's core is strict (an unknown property is
 * an error, which catches typos and invented fields) and its open places are named: `extras`,
 * `extensions` and a filter's selector inputs.
 *
 * The schema ships in the occt package (`schemas/design-document/`, in its tarball too) and is
 * published on the release CDN, whose files never change once a release is cut. While the format is
 * experimental its address names the release it ships with
 * (`https://git-cdn.bitbybit.dev/v<version>/schemas/design-document/experimental.json`), since each
 * release's experimental schema is its own and documents written against it are not migrated; a
 * released format version has one address for good
 * (`https://git-cdn.bitbybit.dev/latest/schemas/design-document/v<major>.<minor>.json`), which every
 * later release carries unchanged. Editors register the schema under that address from a copy
 * rather than fetch it. `validate` stays the authority: references, expressions and the order of
 * features are beyond what a schema can say.
 *
 * It is also the release gate. Whether the format is released is declared once, in `DESIGN_FORMAT`
 * (format.ts), and three things must agree with it: the `@beta` tag on `OCCTDesign` (on while
 * experimental, off once released), the file the schema is published under (`experimental.json`, then
 * `v<major>.<minor>.json`), and the files already published: a released schema never changes, which
 * `published.json` holds by SHA-256, so a change to the format after a release needs a new minor.
 *
 *   node scripts/gen-design-schema.mjs           write the schema
 *   node scripts/gen-design-schema.mjs --check   write nothing; fail if it would change or the release is not consistent
 */
import ts from "typescript";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = "packages/dev/occt/lib/api/models/design/document.ts";
const TSCONFIG = "packages/dev/occt/tsconfig.json";
const ROOT_TYPE = "DesignDocument";
const FORMAT_SOURCE = "packages/dev/occt/lib/services/design/format.ts";
const DESIGN_SOURCE = "packages/dev/occt/lib/services/design/design.ts";
const SCHEMA_DIR = "packages/dev/occt/schemas/design-document";
const PACKAGE = "packages/dev/occt/package.json";
const CDN = "https://git-cdn.bitbybit.dev";
const PUBLISHED = `${SCHEMA_DIR}/published.json`;
const VERSIONED = /^v\d+\.\d+\.json$/;

/** The format a runner reads, as `DESIGN_FORMAT` in format.ts declares it. */
export function formatOf(text) {
    const match = /DESIGN_FORMAT: DesignFormat = \{ released: (true|false), major: (\d+), minor: (\d+) \}/.exec(text);
    if (!match) {
        throw new Error(`${FORMAT_SOURCE} no longer declares DESIGN_FORMAT as { released, major, minor }`);
    }
    return { released: match[1] === "true", major: Number(match[2]), minor: Number(match[3]) };
}

/** Whether the JSDoc of the class `OCCTDesign` carries `@beta`. */
export function isBeta(text) {
    const match = /\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*export class OCCTDesign\b/.exec(text);
    if (!match) {
        throw new Error(`${DESIGN_SOURCE} no longer documents a class OCCTDesign`);
    }
    return /@beta\b/.test(match[1]);
}

/** The file a format's schema is published under. */
export function schemaFileOf(format) {
    return format.released ? `v${format.major}.${format.minor}.json` : "experimental.json";
}

/**
 * The address a format's schema is published at: under the release that ships it while the format
 * is experimental, under `latest` once released, since every later release carries it unchanged.
 */
export function schemaIdOf(format, version) {
    return `${CDN}/${format.released ? "latest" : `v${version}`}/schemas/design-document/${schemaFileOf(format)}`;
}

/**
 * What keeps a release from being consistent: the `@beta` tag against the format's state, a versioned
 * schema published while the format is experimental or the experimental one left after a release, and
 * a published schema that is missing, changed or not recorded in `published.json`.
 */
export function releaseProblems({ format, beta, files, published, hashes }) {
    const problems = [];
    if (beta && format.released) {
        problems.push("OCCTDesign is still @beta while format.ts says the format is released: take the tag off with the release");
    }
    if (!beta && !format.released) {
        problems.push("OCCTDesign is no longer @beta while format.ts says the format is experimental: release the format in format.ts, or keep the tag");
    }
    if (!format.released) {
        files.filter((file) => VERSIONED.test(file)).forEach((file) => problems.push(`${file} is published while the format is experimental`));
    } else if (files.includes("experimental.json")) {
        problems.push("experimental.json is still published after the release");
    }
    for (const [file, sha] of Object.entries(published)) {
        if (!files.includes(file)) {
            problems.push(`${file} was published and is gone`);
        } else if (hashes[file] !== sha) {
            problems.push(`${file} was published and has changed: a published schema never changes, so a change to the format needs a new minor`);
        }
    }
    files.filter((file) => VERSIONED.test(file) && published[file] === undefined).forEach((file) => problems.push(`${file} is not recorded in published.json`));
    return problems;
}

const FORMAT = formatOf(readFileSync(path.join(ROOT, FORMAT_SOURCE), "utf8"));

/** Where the schema is written, and the address it is published at: experimental until the format is released. */
export const OUT = `${SCHEMA_DIR}/${schemaFileOf(FORMAT)}`;
export const ID = schemaIdOf(FORMAT, JSON.parse(readFileSync(path.join(ROOT, PACKAGE), "utf8")).version);

const NAMED = /^(Design|Sketch)[A-Z]/;

/** The patterns `validate` holds strings to, which the schema states too; a test keeps them equal to the checker's. */
export const PATTERNS = {
    name: "^[A-Za-z_][A-Za-z0-9_-]*$",
    optionalName: "^([A-Za-z_][A-Za-z0-9_-]*)?$",
    uuid: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    color: "^#[0-9a-fA-F]{6}$",
    sha256: "^[0-9a-f]{64}$",
};

const DOCUMENTS = new Set(["DesignPartDocument", "DesignAssemblyDocument"]);
const COLOURS = new Set(["color", "edgeColor", "emissive"]);

/**
 * What the schema adds to a property beyond its type, as `validate` checks it: a pattern for ids,
 * colours and hashes and a least value for counts. A pattern constrains only the string a union may
 * hold and a bound only the number, so both sit beside a reference to a union safely.
 */
export function constraintsOf(owner, name) {
    if (name === "id") {
        return { pattern: DOCUMENTS.has(owner) ? PATTERNS.uuid : owner.startsWith("Sketch") || owner === "DesignCircleCommand" ? PATTERNS.optionalName : PATTERNS.name };
    }
    if (COLOURS.has(name) && owner.endsWith("Appearance")) {
        return { pattern: PATTERNS.color };
    }
    if (name === "sha256") {
        return { pattern: PATTERNS.sha256 };
    }
    if (name === "count" && (owner === "DesignFaceReference" || owner === "DesignEdgeReference")) {
        return { minimum: 1, multipleOf: 1 };
    }
    if (name === "index" && owner === "DesignCopy") {
        return { minimum: 1, multipleOf: 1 };
    }
    return {};
}

function programOf() {
    const config = ts.getParsedCommandLineOfConfigFile(path.join(ROOT, TSCONFIG), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: (diagnostic) => { throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")); } });
    return ts.createProgram([path.join(ROOT, SOURCE)], { ...config.options, noEmit: true });
}

function describe(symbol, checker) {
    const text = ts.displayPartsToString(symbol?.getDocumentationComment(checker) ?? []).trim();
    return text === "" ? {} : { description: text };
}

const byJson = (a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), "en-US");

/**
 * The schema of the type named `rootName` in `file`, with every Design or Sketch type it reaches as
 * a definition.
 */
export function schemaOf(program, file, rootName) {
    const checker = program.getTypeChecker();
    const source = program.getSourceFile(file);
    const module = source === undefined ? undefined : checker.getSymbolAtLocation(source);
    const rootSymbol = module === undefined ? undefined : checker.getExportsOfModule(module).find((symbol) => symbol.name === rootName);
    if (rootSymbol === undefined) {
        throw new Error(`${rootName} is not declared in ${file}`);
    }
    const defs = new Map();

    const nameOf = (type) => {
        if (type.aliasSymbol !== undefined) {
            return type.aliasTypeArguments === undefined && NAMED.test(type.aliasSymbol.name) ? type.aliasSymbol : undefined;
        }
        const symbol = type.getSymbol();
        return symbol !== undefined && (symbol.flags & ts.SymbolFlags.Interface) !== 0 && NAMED.test(symbol.name) ? symbol : undefined;
    };

    const reference = (type) => {
        const named = nameOf(type);
        if (named === undefined) {
            return inline(type);
        }
        if (!defs.has(named.name)) {
            defs.set(named.name, null);
            defs.set(named.name, { ...describe(named, checker), ...inline(type) });
        }
        return { $ref: `#/$defs/${named.name}` };
    };

    const union = (members) => {
        const kept = members.filter((member) => (member.flags & ts.TypeFlags.Undefined) === 0);
        const booleans = kept.filter((member) => (member.flags & ts.TypeFlags.BooleanLiteral) !== 0);
        const rest = kept.filter((member) => (member.flags & ts.TypeFlags.BooleanLiteral) === 0);
        const schemas = rest.map(reference);
        if (booleans.length === 2) {
            schemas.push({ type: "boolean" });
        } else {
            schemas.push(...booleans.map((member) => ({ const: member.intrinsicName === "true" })));
        }
        if (schemas.length === 1) {
            return schemas[0];
        }
        if (schemas.every((schema) => typeof schema.const === "string")) {
            return { type: "string", enum: schemas.map((schema) => schema.const).sort() };
        }
        return { anyOf: schemas.sort(byJson) };
    };

    const object = (type) => {
        const properties = {};
        const required = [];
        for (const property of checker.getPropertiesOfType(type)) {
            const declaration = property.valueDeclaration ?? property.declarations?.[0];
            const propertyType = declaration === undefined ? checker.getTypeOfSymbol(property) : checker.getTypeOfSymbolAtLocation(property, declaration);
            const owner = declaration?.parent?.name?.text ?? "";
            properties[property.name] = { ...describe(property, checker), ...reference(propertyType), ...constraintsOf(owner, property.name) };
            if ((property.flags & ts.SymbolFlags.Optional) === 0) {
                required.push(property.name);
            }
        }
        const index = checker.getIndexInfosOfType(type).find((info) => (info.keyType.flags & ts.TypeFlags.String) !== 0);
        const schema = { type: "object" };
        if (Object.keys(properties).length > 0) {
            schema.properties = properties;
        }
        if (required.length > 0) {
            schema.required = required;
        }
        schema.additionalProperties = index === undefined ? false : reference(index.type);
        return schema;
    };

    const inline = (type) => {
        const flags = type.flags;
        if ((flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) !== 0) {
            return {};
        }
        if ((flags & ts.TypeFlags.Boolean) !== 0) {
            return { type: "boolean" };
        }
        if (type.isUnion()) {
            return union(type.types);
        }
        if ((flags & ts.TypeFlags.String) !== 0) {
            return { type: "string" };
        }
        if ((flags & ts.TypeFlags.Number) !== 0) {
            return { type: "number" };
        }
        if (type.isStringLiteral() || type.isNumberLiteral()) {
            return { const: type.value };
        }
        if ((flags & ts.TypeFlags.BooleanLiteral) !== 0) {
            return { const: type.intrinsicName === "true" };
        }
        if (checker.isTupleType(type)) {
            const items = checker.getTypeArguments(type).map(reference);
            return { type: "array", prefixItems: items, minItems: items.length, maxItems: items.length };
        }
        if (checker.isArrayType(type)) {
            return { type: "array", items: reference(checker.getTypeArguments(type)[0]) };
        }
        if ((flags & ts.TypeFlags.Object) !== 0) {
            return object(type);
        }
        throw new Error(`cannot write ${checker.typeToString(type)} as a JSON Schema`);
    };

    const root = reference(checker.getDeclaredTypeOfSymbol(rootSymbol));
    const sortedDefs = Object.fromEntries([...defs].sort(([a], [b]) => a.localeCompare(b, "en-US")));
    return { root, defs: sortedDefs };
}

/** The design document's schema, as it is published. */
export function designSchema() {
    const program = programOf();
    const { root, defs } = schemaOf(program, path.join(ROOT, SOURCE), ROOT_TYPE);
    return {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        $id: ID,
        title: FORMAT.released ? `Design document, format ${FORMAT.major}.${FORMAT.minor}` : "Design document (experimental: the format may change before its first stable version)",
        ...root,
        $defs: defs,
    };
}

const sha256 = (text) => createHash("sha256").update(text).digest("hex");

/** The schema files published now, their SHA-256 and the record of those released. */
function publishedState() {
    const dir = path.join(ROOT, SCHEMA_DIR);
    const files = existsSync(dir) ? readdirSync(dir).filter((file) => file.endsWith(".json") && file !== "published.json") : [];
    const hashes = Object.fromEntries(files.map((file) => [file, sha256(readFileSync(path.join(dir, file), "utf8"))]));
    const record = path.join(ROOT, PUBLISHED);
    const published = existsSync(record) ? JSON.parse(readFileSync(record, "utf8")) : {};
    return { files, hashes, published };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const text = `${JSON.stringify(designSchema(), null, 4)}\n`;
    const out = path.join(ROOT, OUT);
    const current = existsSync(out) ? readFileSync(out, "utf8") : undefined;
    const beta = isBeta(readFileSync(path.join(ROOT, DESIGN_SOURCE), "utf8"));
    const file = schemaFileOf(FORMAT);
    if (process.argv.includes("--check")) {
        const problems = releaseProblems({ format: FORMAT, beta, ...publishedState() });
        if (current !== text) {
            problems.unshift(`${OUT} is not what ${SOURCE} generates: run npm run gen:design-schema`);
        }
        if (problems.length > 0) {
            problems.forEach((problem) => console.error(problem));
            process.exit(1);
        }
        console.log(`${OUT} is what ${SOURCE} generates, and the release is consistent`);
    } else {
        const { published } = publishedState();
        if (FORMAT.released && published[file] !== undefined && published[file] !== sha256(text)) {
            console.error(`${file} is published and never changes: a change to the format needs a new minor in ${FORMAT_SOURCE}`);
            process.exit(1);
        }
        mkdirSync(path.dirname(out), { recursive: true });
        writeFileSync(out, text);
        if (FORMAT.released) {
            rmSync(path.join(ROOT, SCHEMA_DIR, "experimental.json"), { force: true });
            writeFileSync(path.join(ROOT, PUBLISHED), `${JSON.stringify({ ...published, [file]: sha256(text) }, null, 4)}\n`);
        }
        console.log(`wrote ${OUT}`);
    }
}
