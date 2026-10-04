import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { occtDtoRegistry } from "../../api/dto-registry";
import { DOCUMENT_KEYS, FEATURE_KEYS, PATTERNS, SELECTORS, documentIssues } from "./document-check";

const OPERATIONS = occtDtoRegistry;

const sketch = { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", id: "bottom", length: 4 }, { type: "vLine", length: 4 }, { type: "close" }] };
const block = { id: "block", type: "extrude", profile: "base", distance: 2 };
const sideOfBlock = { of: "block", role: "side" };
const endOfBlock = { of: "block", role: "end" };

const issuesOf = (...features: unknown[]): { path: string; message: string }[] => documentIssues({ schemaVersion: 1, parameters: { size: 2 }, features: [sketch, block, ...features] }, OPERATIONS);
const pathsOf = (...features: unknown[]): string[] => issuesOf(...features).map(issue => issue.path);
const messageOf = (...features: unknown[]): string => issuesOf(...features)[0]?.message ?? "";

describe("design document check", () => {
    it("should accept a document whose every reference names something made before it", () => {
        // Act
        const issues = issuesOf(
            { id: "frame", type: "sketch", on: { frame: { origin: [0, 0, "size"], normal: [0, 0, 1], direction: [1, 0, 0] } }, start: [1, "size"], pen: [{ type: "line", to: [1, "size * 2"] }], closed: false },
            { id: "top", type: "sketch", on: { face: { ...endOfBlock, count: 1, filter: { select: "facing", direction: [0, 0, 1] } }, origin: [1, 1, 2], direction: [1, 0, 0] }, pen: [{ type: "hLine", length: 1 }, { type: "vLine", length: 1 }, { type: "close" }] },
            { id: "boss", type: "extrude", profile: "top", distance: "size", direction: [0, 0, 1], body: "block", join: "add" },
            { id: "spin", type: "revolve", profile: "base", axis: { origin: [0, 0, 0], direction: [0, 1, 0] }, angle: 90 },
            { id: "both", type: "boolean", operation: "union", body: "block", tools: ["spin"] },
            { id: "round", type: "fillet", body: "block", radius: 0.2, edges: { between: [{ ...sideOfBlock, from: "base.bottom" }, endOfBlock], filter: { select: "along", direction: [1, 0, 0] }, count: 1 } },
            { id: "bevel", type: "chamfer", body: "block", distance: 0.1, edges: { between: [{ of: "round", role: "round" }, sideOfBlock], count: 1 } },
            { id: "row", type: "linearPattern", body: "block", direction: [1, 0, 0], spacing: 10, count: 2 },
            { id: "ring", type: "polarPattern", body: "block", axis: { origin: [0, 0, 0], direction: [0, 0, 1] }, count: "size", angle: 180 },
            { id: "flip", type: "mirror", body: "block", plane: { origin: [0, 0, 0], normal: [1, 0, 0] }, keepOriginal: false },
            { id: "lift", type: "operation", operation: "occt.transforms.translate", params: { shape: { body: "block" }, translation: [0, 0, { expr: "size" }] } },
            { id: "fuse", type: "operation", operation: "occt.booleans.union", params: { shapes: [{ body: "block" }, { body: "lift" }] } },
            { id: "pick", type: "chamfer", body: "block", distance: 0.1, edges: { between: [{ ...endOfBlock, copy: { of: "row", index: 1 } }, sideOfBlock], count: 1 } },
        );

        // Assert
        expect(issues).toEqual([]);
    });

    it("should refuse what is not a document of this version", () => {
        // Act
        const notObject = documentIssues([], OPERATIONS);
        const versionAndFeatures = documentIssues({ schemaVersion: "1", features: {} }, OPERATIONS);
        const newer = documentIssues({ schemaVersion: 3, features: [] }, OPERATIONS);

        // Assert
        expect(notObject).toEqual([{ path: "", message: "a design document is an object" }]);
        expect(versionAndFeatures).toEqual([{ path: "/schemaVersion", message: "this runner reads schemaVersion 1" }, { path: "/features", message: "features is a list" }]);
        expect(newer).toEqual([{ path: "/schemaVersion", message: "schemaVersion 3 is newer than this runner reads: it reads schemaVersion 1" }]);
    });

    it("should refuse a feature without a usable id or type", () => {
        // Act
        const paths = pathsOf("feature", { id: "1st", type: "extrude" }, { id: "block", type: "sketch" }, { id: "x", type: "melt" });
        const message = messageOf({ id: "x", type: "melt" });

        // Assert
        expect(paths).toEqual(["/features/2", "/features/3/id", "/features/4/id", "/features/5/type"]);
        expect(message).toBe("\"melt\" is not a feature type: sketch, extrude, revolve, boolean, fillet, chamfer, linearPattern, polarPattern, mirror, sweep, loft, shell, hole, boss, pocket, import, operation, script");
    });

    it("should refuse numbers and points that cannot be read", () => {
        // Act
        const issues = issuesOf(
            { id: "a", type: "extrude", profile: "base", distance: Number.NaN },
            { id: "b", type: "extrude", profile: "base", distance: true },
            { id: "c", type: "extrude", profile: "base", distance: "depth" },
            { id: "d", type: "extrude", profile: "base", distance: 1, direction: [0, 1] },
            { id: "e", type: "revolve", profile: "base", axis: [0, 1, 0] },
            { id: "f", type: "extrude", profile: "base", distance: "1 +" },
        );

        // Assert
        expect(issues).toEqual([
            { path: "/features/2/distance", message: "the value is not a finite number" },
            { path: "/features/3/distance", message: "a number or an expression is expected" },
            { path: "/features/4/distance", message: "\"depth\" is not a parameter of this document" },
            { path: "/features/5/direction", message: "a point or vector is three numbers or expressions" },
            { path: "/features/6/axis", message: "an axis { origin, direction } is an object" },
            { path: "/features/7/distance", message: "the expression ends too soon (at character 4 of \"1 +\")" },
        ]);
    });

    it("should refuse sketch placements and pens it cannot read", () => {
        // Act
        const paths = pathsOf(
            { id: "a", type: "sketch", on: "XY", pen: [] },
            { id: "b", type: "sketch", on: { plane: "XW" }, pen: [] },
            { id: "c", type: "sketch", on: { plane: "XY", offset: "nope" }, pen: [] },
            { id: "d", type: "sketch", on: { frame: [0, 0, 0] }, pen: [] },
            { id: "e", type: "sketch", on: { frame: { origin: [0, 0, 0], normal: [0, 0, 1] } }, pen: [] },
            { id: "f", type: "sketch", on: { face: endOfBlock, origin: [0, 0] }, pen: [] },
            { id: "g", type: "sketch", on: { face: endOfBlock, direction: [0, 0] }, pen: [] },
            { id: "h", type: "sketch", on: { axis: "Z" }, pen: [] },
            { id: "i", type: "sketch", on: { plane: "XY" }, pen: [] },
            { id: "j", type: "sketch", on: { plane: "XY" }, pen: ["hLine"] },
            { id: "k", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", id: "a.b", length: 1 }] },
            { id: "l", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", id: "x", length: 1 }, { type: "vLine", id: "x", length: 1 }] },
            { id: "m", type: "sketch", on: { plane: "XY" }, pen: [{ type: "line", to: [1, "nope"] }] },
            { id: "n", type: "sketch", on: { plane: "XY" }, start: ["nope", 0], pen: [{ type: "hLine", length: 1 }] },
        );

        // Assert
        expect(paths).toEqual([
            "/features/2/on",
            "/features/3/on/plane",
            "/features/4/on/offset",
            "/features/5/on/frame",
            "/features/6/on/frame/direction",
            "/features/7/on/origin",
            "/features/8/on/direction",
            "/features/9/on",
            "/features/10/pen",
            "/features/11/pen/0",
            "/features/12/pen/0/id",
            "/features/13/pen/1/id",
            "/features/14/pen/0/to/1",
            "/features/15/start/0",
        ]);
    });

    it("should refuse face and edge references that name nothing made before them", () => {
        // Act
        const issues = issuesOf(
            { id: "a", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock], count: 1 } },
            { id: "b", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, "end"], count: 1 } },
            { id: "c", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, { of: "later", role: "end" }], count: 1 } },
            { id: "d", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, { of: "block", role: "" }], count: 1 } },
            { id: "e", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, { ...endOfBlock, from: "base.nothing" }], count: 1 } },
            { id: "f", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, { ...endOfBlock, from: 3 }], count: 1 } },
            { id: "g", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, { ...endOfBlock, copy: { of: "block", index: 0 } }], count: 1 } },
            { id: "h", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, { ...endOfBlock, filter: { select: "melt" } }], count: 1 } },
            { id: "i", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, { ...endOfBlock, count: 0 }], count: 1 } },
            { id: "j", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, endOfBlock], filter: { select: "facing" }, count: 1 } },
            { id: "k", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, endOfBlock] } },
            { id: "l", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, endOfBlock], count: 1.5 } },
        );

        // Assert
        expect(issues.map(issue => issue.path)).toEqual([
            "/features/2/edges",
            "/features/3/edges/between/1",
            "/features/4/edges/between/1/of",
            "/features/5/edges/between/1/role",
            "/features/6/edges/between/1/from",
            "/features/7/edges/between/1/from",
            "/features/8/edges/between/1/copy",
            "/features/9/edges/between/1/filter",
            "/features/10/edges/between/1/count",
            "/features/11/edges/filter",
            "/features/12/edges/count",
            "/features/13/edges/count",
        ]);
        expect(issues[7]!.message).toBe(`a filter is { select, ...inputs } with select one of ${SELECTORS.faces.join(", ")}`);
        expect(issues[9]!.message).toBe(`a filter is { select, ...inputs } with select one of ${SELECTORS.edges.join(", ")}`);
    });

    it("should refuse bodies that are not there, tools used twice and joins and operations it does not know", () => {
        // Act
        const issues = issuesOf(
            { id: "a", type: "extrude", profile: "block", distance: 1 },
            { id: "b", type: "extrude", profile: "base", distance: 1, body: "base" },
            { id: "c", type: "extrude", profile: "base", distance: 1, body: "block", join: "merge" },
            { id: "d", type: "boolean", operation: "xor", body: "block", tools: [] },
            { id: "e", type: "boolean", operation: "union", body: "block", tools: [] },
            { id: "f", type: "boolean", operation: "union", body: "block", tools: ["block"] },
            { id: "g", type: "extrude", profile: "base", distance: 1 },
            { id: "h", type: "boolean", operation: "union", body: "block", tools: ["g", "g"] },
            { id: "i", type: "operation", operation: "design.build", params: {} },
            { id: "j", type: "operation", operation: "occt.shapes.solid.createBox", params: [] },
            { id: "k", type: "operation", operation: "occt.transforms.translate", params: { shape: { body: "nothing" } } },
            { id: "l", type: "operation", operation: "occt.transforms.translate", params: { translation: [0, 0, { expr: "nope" }] } },
        );

        // Assert
        expect(issues).toEqual([
            { path: "/features/2/profile", message: "\"block\" is not a sketch made by an earlier feature" },
            { path: "/features/3/body", message: "\"base\" is not a body made by an earlier feature, or it was used up" },
            { path: "/features/4/join", message: "one of add, cut, intersect is expected" },
            { path: "/features/5/operation", message: "one of union, difference, intersection is expected" },
            { path: "/features/6/tools", message: "tools is a list of bodies" },
            { path: "/features/7/tools/0", message: "a tool is another body, named once" },
            { path: "/features/9/tools/1", message: "a tool is another body, named once" },
            { path: "/features/10/operation", message: "\"design.build\" is not an operation of this package" },
            { path: "/features/11/params", message: "params is an object of the operation's inputs" },
            { path: "/features/12/params/shape/body", message: "\"nothing\" is not a body made by an earlier feature, or it was used up" },
            { path: "/features/13/params/translation/2/expr", message: "\"nope\" is not a parameter of this document" },
        ]);
    });

    it("should take a feature with a problem as made, so what reads it is still checked against it", () => {
        // Act
        const paths = pathsOf(
            { id: "broken", type: "sketch", on: { plane: "XW" }, pen: [{ type: "hLine", id: "edge", length: 1 }, { type: "vLine", id: "rise", length: 1 }] },
            { id: "solid", type: "extrude", profile: "broken", distance: "nope" },
            { id: "round", type: "fillet", body: "solid", radius: 1, edges: { between: [{ of: "solid", role: "side", from: "broken.edge" }, { of: "solid", role: "side", from: "broken.rise" }], count: 1 } },
            { id: "cut", type: "boolean", operation: "xor", body: "block", tools: ["solid", "block"] },
            { id: "again", type: "fillet", body: "solid", radius: 1, edges: { between: [sideOfBlock, endOfBlock], count: 1 } },
            { id: "box", type: "operation", operation: "melt", params: {} },
            { id: "lift", type: "operation", operation: "occt.transforms.translate", params: { shape: { body: "box" } } },
            { id: "kept", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, endOfBlock], count: 1 } },
        );

        // Assert
        expect(paths).toEqual(["/features/2/on/plane", "/features/3/distance", "/features/5/operation", "/features/6/body", "/features/7/operation"]);
    });

    it("should check parts against the bodies left at the end and the materials the document has", () => {
        // Act
        const issues = documentIssues({ schemaVersion: 1, features: [sketch, block], materials: [{ id: "steel" }], parts: [{ id: "a", body: "block", material: "steel" }, { id: "b", body: "base" }, { id: "c", body: "block", material: "gold" }] }, OPERATIONS);

        // Assert
        expect(issues).toEqual([
            { path: "/parts/1/body", message: "\"base\" is not a body made by an earlier feature, or it was used up" },
            { path: "/parts/2/material", message: "\"gold\" is not a material of this document" },
        ]);
    });

    it("should accept a full header, configurations, materials, parts and assets", () => {
        // Act
        const issues = documentIssues({
            $schema: "https://example.test/schemas/design-document.json",
            schemaVersion: 1,
            kind: "part",
            id: "3f2c9a1e-5b7d-4e8f-9a0b-1c2d3e4f5a6b",
            units: { length: "in", angle: "deg" },
            up: "z",
            meta: { name: "Bracket", description: "A bracket", authors: ["A. Maker"], license: "MIT", generator: "hand" },
            requires: [],
            apis: { occt: 1 },
            extras: { anything: [1, 2] },
            extensions: { "acme.plm": { item: "42" } },
            parameters: { size: { value: 2, min: 1 }, finish: { type: "choice", value: "raw", options: [{ value: "raw" }, { value: "black" }] } },
            configurations: [{ id: "big", name: { en: "Big" }, values: { size: 3, finish: "black" }, extras: 1 }],
            features: [{ ...sketch, name: "Base sketch", suppressed: false, extras: {} }, { ...block, suppressed: "size > 5", extensions: { "acme.notes": {} } }],
            materials: [{ id: "steel", name: "Steel", density: "7850", standard: "S235", appearance: { color: "#808080", metallic: 1, roughness: "0.4", emissive: "#101010", emissiveStrength: "0.5", edgeColor: "#303030" }, properties: { finish: "{finish}" } }],
            parts: [{
                id: "plate", name: "Plate", body: "block", material: "steel",
                appearance: { color: "#ff0000", opacity: 1, edgeColor: "#202020", faces: [{ faces: endOfBlock, color: "#00ff00", roughness: 0.2 }], edges: [{ edges: { between: [endOfBlock, { of: "block", role: "side" }], count: 4 }, color: "#ffffff" }] },
                properties: { partNumber: "PL-{size}-{configuration}", weightClass: 2, stocked: true, area: { expr: "size * size" } },
            }],
            assets: [{ id: "drawing", uri: "files/plate.step", sha256: "a".repeat(64), mediaType: "model/step" }],
        }, OPERATIONS);

        // Assert
        expect(issues).toEqual([]);
    });

    it("should refuse header values it does not know", () => {
        // Act
        const issues = documentIssues({
            schemaVersion: 1, kind: "assembly", id: "not-a-uuid", units: { length: "ft" }, up: "x", meta: { title: "x" }, requires: ["acme.plm"], colour: "red",
            features: [sketch],
        }, OPERATIONS);
        const more = documentIssues({ schemaVersion: 1, units: { angle: "rad" }, meta: { authors: "me" }, requires: "acme.plm", features: [] }, OPERATIONS);
        const metaText = documentIssues({ schemaVersion: 1, units: [], meta: { name: 3 }, extensions: { plm: {} }, features: [] }, OPERATIONS);

        // Assert
        expect(issues).toEqual([
            { path: "/colour", message: `"colour" is not a property here: use ${[...DOCUMENT_KEYS.document, "extras", "extensions"].join(", ")}` },
            { path: "/kind", message: "one of part is expected" },
            { path: "/id", message: "a document id is a UUID, such as 3f2c9a1e-5b7d-4e8f-9a0b-1c2d3e4f5a6b" },
            { path: "/units/length", message: "one of mm, cm, m, in is expected" },
            { path: "/up", message: "one of y, z is expected" },
            { path: "/meta/title", message: "\"title\" is not a property here: use name, description, authors, license, generator, revision" },
            { path: "/requires/0", message: "this runner supports no extensions, so it cannot build a document that requires \"acme.plm\"" },
        ]);
        expect(more).toEqual([
            { path: "/units/angle", message: "one of deg is expected" },
            { path: "/meta/authors", message: "authors is a list of names" },
            { path: "/requires", message: "requires is a list of extension names" },
        ]);
        expect(metaText).toEqual([
            { path: "/extensions/plm", message: "\"plm\" is not a namespaced name such as \"acme.costing\"" },
            { path: "/units", message: "units is an object" },
            { path: "/meta/name", message: "name is text" },
        ]);
    });

    it("should refuse properties a feature, a pen command, a filter or an operation does not have", () => {
        // Act
        const paths = pathsOf(
            { ...block, id: "a", radius: 3 },
            { ...block, id: "b", name: 3 },
            { ...block, id: "c", suppressed: "nope" },
            { ...block, id: "d", extensions: { notes: {} } },
            { id: "e", type: "sketch", on: { plane: "XY" }, pen: [{ type: "spiral", turns: 3 }] },
            { id: "f", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", length: 1, width: 2 }] },
            { id: "g", type: "sketch", on: { plane: "XY", origin: [0, 0, 0] }, pen: [{ type: "hLine", length: 1 }] },
            { id: "h", type: "sketch", on: { frame: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0], up: [0, 1, 0] } }, pen: [{ type: "hLine", length: 1 }] },
            { id: "i", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", length: 1 }], closed: "yes" },
            { id: "j", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, endOfBlock], filter: { select: "along", direction: [1, 0, 0], angle: 5, bend: 2 }, count: 1 } },
            { id: "k", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, { ...endOfBlock, colour: "red" }], count: 1 } },
            { id: "l", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, endOfBlock], count: 1, extra: 1 } },
            { id: "m", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, { ...endOfBlock, copy: { of: "block", index: 1, which: 2 } }], count: 1 } },
            { id: "n", type: "operation", operation: "occt.shapes.solid.createBox", params: { width: 1, colour: "red" } },
            { id: "o", type: "mirror", body: "block", plane: { origin: [0, 0, 0], normal: [1, 0, 0] }, keepOriginal: "no" },
            { id: "p", type: "sketch", on: { face: endOfBlock, offset: 2 }, pen: [{ type: "hLine", length: 1 }] },
        );

        // Assert
        expect(paths).toEqual([
            "/features/2/radius",
            "/features/3/name",
            "/features/4/suppressed",
            "/features/5/extensions/notes",
            "/features/6/pen/0/type",
            "/features/7/pen/0/width",
            "/features/8/on/origin",
            "/features/9/on/frame/up",
            "/features/10/closed",
            "/features/11/edges/filter/bend",
            "/features/12/edges/between/1/colour",
            "/features/13/edges/extra",
            "/features/14/edges/between/1/copy/which",
            "/features/15/params/colour",
            "/features/16/keepOriginal",
            "/features/17/on/offset",
        ]);
    });

    it("should refuse configurations, materials, parts and assets it cannot read", () => {
        // Act
        const issues = documentIssues({
            schemaVersion: 1,
            parameters: { size: { value: 2, max: 4 } },
            configurations: [{ id: "big", values: { size: 9 } }],
            features: [sketch, block],
            materials: [
                { id: "steel", density: "weight", appearance: { faces: [] } },
                { id: "brass", appearance: { color: "gold" } },
                { id: "tin", appearance: { roughness: "nope" }, properties: { code: "{nope}" } },
                { id: "lead", hardness: 3 },
                { id: "zinc", name: 3, properties: [] },
                { id: "copper", appearance: { edges: [] } },
            ],
            parts: [
                { id: "a", body: "block", appearance: { faces: [{ faces: { of: "later", role: "end" } }] } },
                { id: "b", body: "block", appearance: { faces: {} } },
                { id: "c", body: "block", properties: { number: "{size", sizes: { expr: "nope" }, list: [1] } },
                { id: "d", body: "block", name: 4 },
                { id: "e", body: "block", colour: "red" },
                { id: "f", body: "block", appearance: { faces: [{ faces: endOfBlock, shine: 1 }] } },
                { id: "g", body: "block", appearance: { edgeColor: "grey" } },
                { id: "h", body: "block", appearance: { edges: { between: [] } } },
                { id: "i", body: "block", appearance: { edges: [{ edges: { between: [endOfBlock] }, color: "#ffffff" }] } },
                { id: "j", body: "block", appearance: { edges: [{ edges: { between: [endOfBlock, endOfBlock], count: 1 }, color: "#fff" }] } },
                { id: "k", body: "block", appearance: { edges: [{ edges: { between: [endOfBlock, endOfBlock], count: 1 }, width: 2 }] } },
                { id: "l", body: "block", appearance: { emissive: "glow" } },
                { id: "m", body: "block", appearance: { faces: [{ faces: endOfBlock, emissive: "#3cf2ff", emissiveStrength: "brightness" }] } },
            ],
            assets: [{ id: "file", uri: 3 }],
        }, OPERATIONS);
        const more = documentIssues({ schemaVersion: 1, configurations: [{ id: "c", values: {} }, { id: "c", values: {} }], features: [], materials: [{}], parts: "all", assets: [{ id: "a", uri: "x", sha256: "ABC", mediaType: 1, colour: 1 }] }, OPERATIONS);
        const media = documentIssues({ schemaVersion: 1, features: [], assets: [{ id: "a", uri: "x", mediaType: 1 }], configurations: [{ id: "c", values: {}, name: 1 }] }, OPERATIONS);
        const hash = documentIssues({ schemaVersion: 1, features: [], assets: [{ id: "a", uri: "x", sha256: "ABC" }], configurations: {} }, OPERATIONS);

        // Assert
        expect(issues.map(issue => issue.path)).toEqual([
            "/configurations/0/values/size",
            "/assets/0/uri",
            "/materials/0/density",
            "/materials/1/appearance/color",
            "/materials/2/appearance/roughness",
            "/materials/3/hardness",
            "/materials/4/name",
            "/materials/5/appearance/edges",
            "/parts/0/appearance/faces/0/faces/of",
            "/parts/1/appearance/faces",
            "/parts/2/properties/number",
            "/parts/3/name",
            "/parts/4/colour",
            "/parts/5/appearance/faces/0/shine",
            "/parts/6/appearance/edgeColor",
            "/parts/7/appearance/edges",
            "/parts/8/appearance/edges/0/edges",
            "/parts/9/appearance/edges/0/color",
            "/parts/10/appearance/edges/0/width",
            "/parts/11/appearance/emissive",
            "/parts/12/appearance/faces/0/emissiveStrength",
        ]);
        expect(issues[0]!.message).toBe("\"size\" is 9, above its maximum 4");
        expect(more.map(issue => issue.path)).toEqual(["/configurations/1/id", "/assets/0/colour", "/materials/0/id", "/parts"]);
        expect(media.map(issue => issue.path)).toEqual(["/configurations/0/name", "/assets/0/mediaType"]);
        expect(hash.map(issue => issue.path)).toEqual(["/configurations", "/assets/0/sha256"]);
    });

    it("should take a number parameter's unit as the document's length unit, deg or none", () => {
        // Act
        const issues = documentIssues({
            schemaVersion: 1,
            units: { length: "cm" },
            parameters: { width: { value: 4, unit: "cm" }, turn: { value: 30, unit: "deg" }, count: { value: 3, unit: "none" }, depth: { value: 2, unit: "mm" }, open: { value: true, unit: "deg" } },
            features: [],
        }, OPERATIONS);

        // Assert
        expect(issues).toEqual([
            { path: "/parameters/depth/unit", message: "a parameter's unit is cm, the document's length unit, deg or none" },
            { path: "/parameters/open/unit", message: "a unit is for number parameters" },
        ]);
    });

    it("should refuse a $schema that is not text", () => {
        // Act
        const issues = documentIssues({ $schema: 3, schemaVersion: 1, features: [] }, OPERATIONS);

        // Assert
        expect(issues).toEqual([{ path: "/$schema", message: "$schema, the address of the schema the document follows, is text" }]);
    });

    it("should state in the published schema the patterns the checker holds ids, document ids, colours and hashes to", () => {
        // Arrange
        const schema = JSON.parse(readFileSync(new URL("../../../schemas/design-document/experimental.json", import.meta.url), "utf8")) as { $defs: Record<string, { properties: Record<string, { pattern?: string; minimum?: number }> }> };
        const of = (name: string, property: string): { pattern?: string; minimum?: number } => schema.$defs[name]!.properties[property]!;

        // Act
        const patterns = [of("DesignExtrudeFeature", "id"), of("DesignPart", "id"), of("DesignHolePosition", "id"), of("DesignPartDocument", "id"), of("DesignAssemblyDocument", "id"), of("DesignAppearance", "color"), of("DesignFaceAppearance", "emissive"), of("DesignAsset", "sha256")].map(entry => entry.pattern);

        // Assert
        expect(patterns).toEqual([PATTERNS.name, PATTERNS.name, PATTERNS.name, PATTERNS.uuid, PATTERNS.uuid, PATTERNS.color, PATTERNS.color, PATTERNS.sha256]);
        expect([of("DesignFaceReference", "count").minimum, of("DesignCopy", "index").minimum]).toEqual([1, 1]);
    });

    it("should refuse operation APIs this runner does not run", () => {
        // Act
        const issues = [{ occt: 2 }, { occt: 1.5 }, { manifold: 1 }, [1]].map(apis => documentIssues({ schemaVersion: 1, apis, features: [] }, OPERATIONS));

        // Assert
        expect(issues).toEqual([
            [{ path: "/apis/occt", message: "the operations were written against occt API 2; this runner runs occt API 1" }],
            [{ path: "/apis/occt", message: "an API version is a whole number, such as 1" }],
            [{ path: "/apis/manifold", message: "this runner runs occt operations, not manifold ones" }],
            [{ path: "/apis", message: "apis names the API version each kernel's operations were written against, such as { \"occt\": 1 }" }],
        ]);
    });

    it("should name the same properties the published schema allows", () => {
        // Arrange
        const schema = JSON.parse(readFileSync(new URL("../../../schemas/design-document/experimental.json", import.meta.url), "utf8")) as { $defs: Record<string, { properties: Record<string, unknown> }> };
        const keysOf = (name: string): string[] => Object.keys(schema.$defs[name]!.properties).sort();
        const extensible = (keys: readonly string[]): string[] => [...keys, "extras", "extensions"].sort();
        const featureNames: Record<string, string> = { sketch: "DesignSketchFeature", extrude: "DesignExtrudeFeature", revolve: "DesignRevolveFeature", boolean: "DesignBooleanFeature", fillet: "DesignFilletFeature", chamfer: "DesignChamferFeature", linearPattern: "DesignLinearPatternFeature", polarPattern: "DesignPolarPatternFeature", mirror: "DesignMirrorFeature", operation: "DesignOperationFeature", sweep: "DesignSweepFeature", loft: "DesignLoftFeature", shell: "DesignShellFeature", hole: "DesignHoleFeature", boss: "DesignBossFeature", pocket: "DesignPocketFeature", import: "DesignImportFeature", script: "DesignScriptFeature" };

        // Act
        const features = Object.entries(FEATURE_KEYS).map(([type, keys]) => [keysOf(featureNames[type]!), extensible([...DOCUMENT_KEYS.feature, ...keys])]);

        // Assert
        expect(schema.$defs["DesignDocument"]).toMatchObject({ anyOf: [{ $ref: "#/$defs/DesignAssemblyDocument" }, { $ref: "#/$defs/DesignPartDocument" }] });
        expect(keysOf("DesignPartDocument")).toEqual(extensible(DOCUMENT_KEYS.document));
        expect(keysOf("DesignAssemblyDocument")).toEqual(extensible(DOCUMENT_KEYS.assembly));
        expect(keysOf("DesignComponent")).toEqual(extensible(DOCUMENT_KEYS.component));
        expect(keysOf("DesignComponentSource")).toEqual([...DOCUMENT_KEYS.source].sort());
        expect(keysOf("DesignJoint")).toEqual(extensible(DOCUMENT_KEYS.joint));
        expect(keysOf("DesignJointLimits")).toEqual([...DOCUMENT_KEYS.jointLimits].sort());
        expect(keysOf("DesignConnector")).toEqual(extensible(DOCUMENT_KEYS.connector));
        expect(keysOf("DesignAssemblyConnector")).toEqual(extensible(DOCUMENT_KEYS.assemblyConnector));
        expect(keysOf("DesignUnits")).toEqual([...DOCUMENT_KEYS.units].sort());
        expect(keysOf("DesignMeta")).toEqual([...DOCUMENT_KEYS.meta].sort());
        expect(keysOf("DesignConfiguration")).toEqual(extensible(DOCUMENT_KEYS.configuration));
        expect(keysOf("DesignFaceReference")).toEqual([...DOCUMENT_KEYS.faceReference].sort());
        expect(keysOf("DesignEdgeReference")).toEqual([...DOCUMENT_KEYS.edgeReference].sort());
        expect(keysOf("DesignFrame")).toEqual([...DOCUMENT_KEYS.frame].sort());
        expect(keysOf("DesignPart")).toEqual(extensible(DOCUMENT_KEYS.part));
        expect(keysOf("DesignMaterial")).toEqual(extensible(DOCUMENT_KEYS.material));
        expect(keysOf("DesignAppearance")).toEqual([...DOCUMENT_KEYS.appearance].sort());
        expect(keysOf("DesignFaceAppearance")).toEqual([...DOCUMENT_KEYS.faceAppearance].sort());
        expect(keysOf("DesignEdgeAppearance")).toEqual([...DOCUMENT_KEYS.edgeAppearance].sort());
        expect(keysOf("DesignAsset")).toEqual(extensible(DOCUMENT_KEYS.asset));
        features.forEach(([fromSchema, fromCheck]) => expect(fromSchema).toEqual(fromCheck));
    });

    it("should report a parameter problem and still read the features against the declared names", () => {
        // Act
        const issues = documentIssues({ schemaVersion: 1, parameters: { size: "size * 2" }, features: [sketch, { ...block, distance: "size" }] }, OPERATIONS);

        // Assert
        expect(issues).toEqual([{ path: "/parameters/size", message: "\"size\" depends on itself" }]);
    });

    it("should refuse a copy of a feature that makes none, a `from` with a second dot, an inherited name and an expression nested too deeply, and read a parameter named constructor", () => {
        // Act
        const copyOfExtrude = pathsOf({ id: "g", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, { ...endOfBlock, copy: { of: "block", index: 1 } }], count: 1 } });
        const twoDots = pathsOf({ id: "e", type: "fillet", body: "block", radius: 1, edges: { between: [sideOfBlock, { ...endOfBlock, from: "base.bottom.extra" }], count: 1 } });
        const inherited = issuesOf({ id: "lift", type: "extrude", profile: "base", distance: "toString * 2" });
        const deep = issuesOf({ id: "lift", type: "extrude", profile: "base", distance: `${"(".repeat(70)}1${")".repeat(70)}` });
        const named = documentIssues({ schemaVersion: 1, parameters: { constructor: 3 }, features: [sketch, { ...block, distance: "constructor" }] }, OPERATIONS);

        // Assert
        expect(copyOfExtrude).toEqual(["/features/2/edges/between/1/copy"]);
        expect(twoDots).toEqual(["/features/2/edges/between/1/from"]);
        expect(inherited.map(issue => issue.path)).toEqual(["/features/2/distance"]);
        expect(deep.map(issue => issue.path)).toEqual(["/features/2/distance"]);
        expect(deep[0]!.message).toContain("nest at most 64 deep");
        expect(named).toEqual([]);
    });

    describe("names, never positions", () => {
        it("should refuse a reference to a sketch command by its position, and take one by its id", () => {
            // Act
            const byPosition = issuesOf({ id: "round", type: "fillet", body: "block", radius: 0.2, edges: { between: [{ ...sideOfBlock, from: "base.1" }, endOfBlock], count: 1 } });
            const byId = issuesOf({ id: "round", type: "fillet", body: "block", radius: 0.2, edges: { between: [{ ...sideOfBlock, from: "base.bottom" }, endOfBlock], count: 1 } });

            // Assert
            expect(byPosition).toEqual([{ path: "/features/2/edges/between/0/from", message: "commands are named by their id, not by their position: give command 1 of \"base\" an id" }]);
            expect(byId).toEqual([]);
        });

        it("should name a hole's walls by the ids of its positions, never by where they come in at", () => {
            // Arrange
            const holes = { id: "holes", type: "hole", body: "block", on: { ...endOfBlock, count: 1 }, at: [{ id: "left", x: 1, y: 1 }, [3, 3]], diameter: 0.5 };
            const round = (from: string): unknown => ({ id: "round", type: "fillet", body: "block", radius: 0.1, edges: { between: [{ of: "holes", role: "wall", from }, endOfBlock], count: 1 } });

            // Act
            const named = issuesOf(holes, round("left"));
            const placed = issuesOf(holes, round("1"));
            const unknown = issuesOf(holes, round("right"));
            const repeated = issuesOf({ ...holes, at: [{ id: "a", x: 1, y: 1 }, { id: "a", x: 2, y: 2 }] });

            // Assert
            expect(named).toEqual([]);
            expect(placed).toEqual([{ path: "/features/3/edges/between/0/from", message: "a hole is named by the id of its position, not by where it comes in \"at\": give it one, as { \"id\": \"left\", \"x\": ..., \"y\": ... }" }]);
            expect(unknown).toEqual([{ path: "/features/3/edges/between/0/from", message: "\"right\" is not the id of a position of \"holes\"" }]);
            expect(repeated).toEqual([{ path: "/features/2/at/1/id", message: "a position's id is distinct, starts with a letter or _ and holds letters, digits, _ and -" }]);
        });

        it("should refuse an import whose asset has no SHA-256, and name a face of a pinned one by its index", () => {
            // Arrange
            const document = (sha256?: string): unknown => ({
                schemaVersion: 1,
                assets: [{ id: "file", uri: "part.step", ...(sha256 === undefined ? {} : { sha256 }) }],
                features: [
                    { id: "part", type: "import", asset: "file" },
                    { id: "round", type: "fillet", body: "part", radius: 0.1, edges: { between: [{ of: "part", role: "face", from: "2" }, { of: "part", role: "face", from: "3" }], count: 1 } },
                ],
            });

            // Act
            const loose = documentIssues(document(), OPERATIONS);
            const pinned = documentIssues(document("a".repeat(64)), OPERATIONS);

            // Assert
            expect(loose).toEqual([{ path: "/features/0/asset", message: "the asset \"file\" an import reads needs its sha256, so the document's version pins the geometry it reads" }]);
            expect(pinned).toEqual([]);
        });

        it("should want the count of the faces a shell opens", () => {
            // Act
            const issues = issuesOf({ id: "hollow", type: "shell", body: "block", thickness: 0.1, open: endOfBlock });

            // Assert
            expect(issues).toEqual([{ path: "/features/2/open/count", message: "a count is a whole number of at least 1" }]);
        });
    });
});
