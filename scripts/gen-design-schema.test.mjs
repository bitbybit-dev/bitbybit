import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { ID, OUT, PATTERNS, constraintsOf, designSchema, formatOf, isBeta, releaseProblems, schemaFileOf, schemaIdOf, schemaOf } from "./gen-design-schema.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const FILE = "/virtual/fixture.ts";

const schemaFor = (text, rootName = "DesignRoot") => {
    const options = { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, lib: ["lib.es2022.d.ts"] };
    const host = ts.createCompilerHost(options);
    const original = host.getSourceFile.bind(host);
    host.getSourceFile = (name, language) => (name === FILE ? ts.createSourceFile(name, text, language, true) : original(name, language));
    host.fileExists = (name) => name === FILE || ts.sys.fileExists(name);
    host.readFile = (name) => (name === FILE ? text : ts.sys.readFile(name));
    return schemaOf(ts.createProgram([FILE], options, host), FILE, rootName);
};

describe("schemaOf", () => {
    it("should write a Design interface as a strict object definition with its description, inherited properties included", () => {
        // Act
        const { root, defs } = schemaFor(`
            export interface DesignBase { id: string; extras?: unknown }
            /** A root. */
            export interface DesignRoot extends DesignBase { size?: number; on: boolean }
        `);

        // Assert
        assert.deepEqual(root, { $ref: "#/$defs/DesignRoot" });
        assert.deepEqual(defs.DesignRoot, {
            description: "A root.",
            type: "object",
            properties: { size: { type: "number" }, on: { type: "boolean" }, id: { type: "string", pattern: PATTERNS.name }, extras: {} },
            required: ["on", "id"],
            additionalProperties: false,
        });
    });

    it("should state the patterns and least values validate holds ids, colours, hashes and counts to", () => {
        // Act
        const constraints = [
            constraintsOf("DesignPartDocument", "id"),
            constraintsOf("DesignPart", "id"),
            constraintsOf("SketchHLine", "id"),
            constraintsOf("DesignCircleCommand", "id"),
            constraintsOf("DesignFaceAppearance", "color"),
            constraintsOf("DesignAsset", "sha256"),
            constraintsOf("DesignEdgeReference", "count"),
            constraintsOf("DesignCopy", "index"),
            constraintsOf("DesignPart", "color"),
        ];

        // Assert
        assert.deepEqual(constraints, [
            { pattern: PATTERNS.uuid },
            { pattern: PATTERNS.name },
            { pattern: PATTERNS.optionalName },
            { pattern: PATTERNS.optionalName },
            { pattern: PATTERNS.color },
            { pattern: PATTERNS.sha256 },
            { minimum: 1, multipleOf: 1 },
            { minimum: 1, multipleOf: 1 },
            {},
        ]);
    });

    it("should write literal unions as sorted enums, tuples with their length, lists, records and open index signatures", () => {
        // Act
        const { defs } = schemaFor(`
            export interface DesignRoot {
                kind: "b" | "a";
                pair: [number, string];
                list: string[];
                table: Record<string, number>;
                open: { select: string; [input: string]: unknown };
                one: 1;
                yes: true;
            }
        `);

        // Assert
        assert.deepEqual(defs.DesignRoot.properties, {
            kind: { type: "string", enum: ["a", "b"] },
            pair: { type: "array", prefixItems: [{ type: "number" }, { type: "string" }], minItems: 2, maxItems: 2 },
            list: { type: "array", items: { type: "string" } },
            table: { type: "object", additionalProperties: { type: "number" } },
            open: { type: "object", properties: { select: { type: "string" } }, required: ["select"], additionalProperties: {} },
            one: { const: 1 },
            yes: { const: true },
        });
    });

    it("should refer to named types through definitions, write other names in place and resolve mapped types to the objects they stand for", () => {
        // Act
        const { defs } = schemaFor(`
            export type DesignNumber = number | string;
            interface Point { x: number }
            type Expressions<T> = { [K in keyof T]: T[K] extends number ? DesignNumber : T[K] };
            export interface DesignRoot { value: DesignNumber; point: Point; mapped: Expressions<Point>; either?: DesignNumber | boolean }
        `);

        // Assert
        assert.deepEqual(defs.DesignNumber, { anyOf: [{ type: "number" }, { type: "string" }] });
        assert.deepEqual(defs.DesignRoot.properties.value, { $ref: "#/$defs/DesignNumber" });
        assert.deepEqual(defs.DesignRoot.properties.point, { type: "object", properties: { x: { type: "number" } }, required: ["x"], additionalProperties: false });
        assert.deepEqual(defs.DesignRoot.properties.mapped, { type: "object", properties: { x: { $ref: "#/$defs/DesignNumber" } }, required: ["x"], additionalProperties: false });
        assert.deepEqual(defs.DesignRoot.properties.either, { anyOf: [{ type: "boolean" }, { type: "number" }, { type: "string" }] });
    });

    it("should refuse a root it cannot find and a type JSON cannot hold", () => {
        // Act & Assert
        assert.throws(() => schemaFor("export interface DesignOther { a: string }"), /DesignRoot is not declared/);
        assert.throws(() => schemaFor("export interface DesignRoot { big: bigint }"), /cannot write bigint as a JSON Schema/);
    });
});

describe("the published design schema", () => {
    it("should be what the types generate, under its address", () => {
        // Act
        const published = JSON.parse(readFileSync(path.join(ROOT, OUT), "utf8"));
        const check = spawnSync(process.execPath, [path.join(ROOT, "scripts/gen-design-schema.mjs"), "--check"], { encoding: "utf8" });

        // Assert
        assert.deepEqual(published, designSchema());
        assert.equal(published.$id, ID);
        assert.equal(check.status, 0, check.stderr);
        assert.deepEqual(published.$defs.DesignDocument.anyOf, [{ $ref: "#/$defs/DesignAssemblyDocument" }, { $ref: "#/$defs/DesignPartDocument" }]);
        assert.deepEqual(published.$defs.DesignPartDocument.required, ["schemaVersion", "features"]);
        assert.deepEqual(published.$defs.DesignAssemblyDocument.required, ["schemaVersion", "kind", "components"]);
        assert.deepEqual(published.$defs.DesignAssemblyDocument.properties.kind, { const: "assembly" });
        assert.equal(published.$defs.DesignPartDocument.additionalProperties, false);
        assert.equal(published.$defs.DesignAssemblyDocument.additionalProperties, false);
    });
});

describe("the release gate", () => {
    const experimental = { released: false, major: 1, minor: 0 };
    const released = { released: true, major: 1, minor: 1 };

    it("should read the format and the @beta tag from their sources", () => {
        // Act
        const format = formatOf("export const DESIGN_FORMAT: DesignFormat = { released: true, major: 2, minor: 3 };");
        const beta = isBeta("/**\n * Builds things.\n * @beta\n */\nexport class OCCTDesign {");
        const notBeta = isBeta("/**\n * Builds things. @betamax\n */\nexport class OCCTDesign {");

        // Assert
        assert.deepEqual(format, { released: true, major: 2, minor: 3 });
        assert.equal(beta, true);
        assert.equal(notBeta, false);
        assert.throws(() => formatOf("export const DESIGN_FORMAT = {};"), /no longer declares DESIGN_FORMAT/);
        assert.throws(() => isBeta("export class Other {}"), /no longer documents a class OCCTDesign/);
    });

    it("should publish under experimental.json, then one file per released minor", () => {
        // Assert
        assert.equal(schemaFileOf(experimental), "experimental.json");
        assert.equal(schemaFileOf(released), "v1.1.json");
    });

    it("should address an experimental schema under the release that ships it, and a released one under latest", () => {
        // Assert
        assert.equal(schemaIdOf(experimental, "1.5.0"), "https://git-cdn.bitbybit.dev/v1.5.0/schemas/design-document/experimental.json");
        assert.equal(schemaIdOf(released, "1.7.2"), "https://git-cdn.bitbybit.dev/latest/schemas/design-document/v1.1.json");
    });

    it("should address the schema it writes under the occt package's own version", () => {
        // Arrange
        const version = JSON.parse(readFileSync(path.join(ROOT, "packages/dev/occt/package.json"), "utf8")).version;

        // Assert
        assert.equal(ID, schemaIdOf(formatOf(readFileSync(path.join(ROOT, "packages/dev/occt/lib/services/design/format.ts"), "utf8")), version));
    });

    it("should pass an experimental format with its tag and only the experimental schema", () => {
        // Act
        const problems = releaseProblems({ format: experimental, beta: true, files: ["experimental.json"], published: {}, hashes: { "experimental.json": "a" } });

        // Assert
        assert.deepEqual(problems, []);
    });

    it("should refuse a tag that disagrees with the format, and a schema published at the wrong stage", () => {
        // Act
        const early = releaseProblems({ format: experimental, beta: false, files: ["experimental.json", "v1.0.json"], published: { "v1.0.json": "b" }, hashes: { "v1.0.json": "b" } });
        const late = releaseProblems({ format: released, beta: true, files: ["experimental.json", "v1.1.json"], published: { "v1.1.json": "c" }, hashes: { "v1.1.json": "c" } });

        // Assert
        assert.deepEqual(early, [
            "OCCTDesign is no longer @beta while format.ts says the format is experimental: release the format in format.ts, or keep the tag",
            "v1.0.json is published while the format is experimental",
        ]);
        assert.deepEqual(late, [
            "OCCTDesign is still @beta while format.ts says the format is released: take the tag off with the release",
            "experimental.json is still published after the release",
        ]);
    });

    it("should hold every released schema to the SHA-256 recorded when it was published", () => {
        // Act
        const problems = releaseProblems({
            format: released,
            beta: false,
            files: ["v1.0.json", "v1.1.json", "v1.2.json"],
            published: { "v1.0.json": "old", "v1.1.json": "kept", "v0.9.json": "gone" },
            hashes: { "v1.0.json": "edited", "v1.1.json": "kept", "v1.2.json": "new" },
        });

        // Assert
        assert.deepEqual(problems, [
            "v1.0.json was published and has changed: a published schema never changes, so a change to the format needs a new minor",
            "v0.9.json was published and is gone",
            "v1.2.json is not recorded in published.json",
        ]);
    });
});
