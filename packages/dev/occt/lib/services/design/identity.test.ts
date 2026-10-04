import { describe, it, expect } from "vitest";
import { stableJson } from "./cache";
import { buildKeyOf, itemKeyOf, versionOf, versionProjection } from "./identity";
import { libraryOf, sourceEntry } from "./library";

const DOCUMENT_ID = "3f2c9a1e-5b7d-4e8f-9a0b-1c2d3e4f5a6b";

const bracket = {
    schemaVersion: 1,
    id: DOCUMENT_ID,
    parameters: { width: { value: 40, label: "Width", description: "Across", group: "Size", step: 5, unit: "mm" }, finish: { type: "choice", value: "raw", options: [{ value: "raw", label: "Raw" }] } },
    configurations: [{ id: "wide", name: "Wide", values: { width: 60 } }],
    features: [
        { id: "base", name: "Base sketch", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", length: "width" }, { type: "vLine", length: 20 }, { type: "close" }] },
        { id: "plate", type: "extrude", profile: "base", distance: 10 },
    ],
    parts: [{ id: "plate", name: "Plate", body: "plate", properties: { hint: "a property, kept" }, connectors: [{ id: "top", on: { of: "plate", role: "end" } }] }],
};

describe("design identity", () => {
    describe("canonical JSON", () => {
        it("should write the numbers, strings and literals of RFC 8785's example as JCS does", () => {
            // Arrange
            const value: unknown = JSON.parse(String.raw`{"numbers": [333333333.33333329, 1E30, 4.50, 2e-3, 0.000000000000000000000000001], "string": "\u20ac$\u000F\u000aA'\u0042\u0022\u005c\\\"\/", "literals": [null, true, false]}`);

            // Act
            const written = stableJson(value);

            // Assert
            expect(written).toBe(String.raw`{"literals":[null,true,false],"numbers":[333333333.3333333,1e+30,4.5,0.002,1e-27],"string":"€$\u000f\nA'B\"\\\\\"/"}`);
        });

        it("should sort keys by their UTF-16 code units, as RFC 8785's sorting example does", () => {
            // Arrange
            const value = { "\u20ac": "Euro Sign", "\r": "Carriage Return", "\ufb33": "Hebrew Letter Dalet With Dagesh", "1": "One", "\ud83d\ude00": "Emoji: Grinning Face", "\u0080": "Control", "\u00f6": "Latin Small Letter O With Diaeresis" };

            // Act
            const written = stableJson(value);

            // Assert
            expect(written).toBe("{\"\\r\":\"Carriage Return\",\"1\":\"One\",\"\u0080\":\"Control\",\"\u00f6\":\"Latin Small Letter O With Diaeresis\",\"\u20ac\":\"Euro Sign\",\"\ud83d\ude00\":\"Emoji: Grinning Face\",\"\ufb33\":\"Hebrew Letter Dalet With Dagesh\"}");
        });
    });

    describe("versions", () => {
        it("should keep a version through edits to what only editors and tools read", () => {
            // Arrange
            const edited = {
                ...bracket,
                $schema: "https://example.test/schemas/design-document.json",
                meta: { description: "A bracket", authors: ["A. Maker"], revision: "r12" },
                extras: { view: [1, 2, 3] },
                extensions: { "acme.plm": { item: 7 } },
                parameters: { width: { value: 40, label: "Breite", description: "Quer", group: "Maße", step: 1, unit: "mm", extras: {} }, finish: { type: "choice", value: "raw", options: [{ value: "raw", label: "Roh" }] } },
                configurations: [{ id: "wide", name: "Breit", values: { width: 60 } }],
                features: bracket.features.map(feature => ({ ...feature, name: "Renamed", extras: { collapsed: true } })),
                parts: [{ ...bracket.parts[0]!, extras: { pinned: true }, connectors: [{ id: "top", on: { of: "plate", role: "end", hint: { v: 1 } }, hint: { v: 1 }, extras: {} }] }],
            };

            // Act
            const before = versionOf(bracket);
            const after = versionOf(edited);

            // Assert
            expect(after).toBe(before);
            expect(before).toMatch(/^[0-9a-f]{64}$/);
        });

        it("should change a version with what reaches geometry, the bill of materials or an export", () => {
            // Arrange
            const before = versionOf(bracket);
            const changes = [
                { ...bracket, parameters: { ...bracket.parameters, width: { value: 41 } } },
                { ...bracket, parts: [{ ...bracket.parts[0]!, name: "Plate B" }] },
                { ...bracket, parts: [{ ...bracket.parts[0]!, properties: { hint: "a property, changed" } }] },
                { ...bracket, features: [bracket.features[0]!, { ...bracket.features[1]!, distance: 11 }] },
                { ...bracket, requires: ["acme.plm"], extensions: { "acme.plm": { item: 7 } } },
                { ...bracket, meta: { name: "Bracket B" } },
            ];

            // Act
            const versions = changes.map(versionOf);

            // Assert
            versions.forEach(version => expect(version).not.toBe(before));
        });

        it("should keep an extension the document requires and leave out the others", () => {
            // Arrange
            const document = { ...bracket, requires: ["acme.plm"], extensions: { "acme.plm": { item: 7 }, "acme.notes": { text: "x" } } };

            // Act
            const projected = versionProjection(document);

            // Assert
            expect(projected["extensions"]).toEqual({ "acme.plm": { item: 7 } });
            expect(projected["meta"]).toBeUndefined();
            expect(versionProjection({ ...bracket, meta: { name: "Bracket", license: "MIT" } })["meta"]).toEqual({ name: "Bracket" });
        });
    });

    describe("item and build keys", () => {
        it("should key an item by its document, part and values as 16 hexadecimal digits of their canonical JSON's SHA-256", () => {
            // Act
            const keyed = itemKeyOf(DOCUMENT_ID, "bracket", { width: 40, height: 12 });
            const anonymous = itemKeyOf(undefined, "bracket", {});
            const built = buildKeyOf("0123456789abcdef", "v");

            // Assert
            expect([keyed, anonymous, built]).toEqual(["8f1063ba05afb282", "f75ee53f13eee50b", "601926f21220c8ba"]);
        });
    });

    describe("libraries", () => {
        it("should hold two versions of one document and give each component the one it pins", () => {
            // Arrange
            const revised = { ...bracket, meta: { revision: "r2" }, features: [bracket.features[0]!, { ...bracket.features[1]!, distance: 12 }] };
            const { library, issues } = libraryOf([bracket, revised]);

            // Act
            const byVersion = sourceEntry(library, DOCUMENT_ID, versionOf(bracket), "/components/0/source");
            const byRevision = sourceEntry(library, DOCUMENT_ID, "r2", "/components/1/source");
            const unpinned = (): unknown => sourceEntry(library, DOCUMENT_ID, undefined, "/components/2/source");
            const unknown = (): unknown => sourceEntry(library, DOCUMENT_ID, "r9", "/components/3/source");

            // Assert
            expect(issues).toEqual([]);
            expect([byVersion.index, byRevision.index]).toEqual([0, 1]);
            expect(unpinned).toThrow(`2 versions of "${DOCUMENT_ID}" are given: pin one with version`);
            expect(unknown).toThrow(`no version of "${DOCUMENT_ID}" given is r9: the versions given are ${versionOf(bracket)}, ${versionOf(revised)}`);
        });

        it("should refuse the same version of a document given twice", () => {
            // Arrange
            const relabelled = { ...bracket, meta: { description: "Same content" } };

            // Act
            const { issues } = libraryOf([bracket, relabelled]);

            // Assert
            expect(issues).toEqual([{ path: "/documents/1/id", message: `this version of "${DOCUMENT_ID}" is given twice` }]);
        });
    });
});
