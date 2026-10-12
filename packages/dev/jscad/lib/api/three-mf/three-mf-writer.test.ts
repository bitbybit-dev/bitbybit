import { describe, it, expect, beforeAll } from "vitest";
import type * as Modeling from "@jscad/modeling";
import { zipEntries, zipEntryData } from "@bitbybit-dev/base/lib/api/services/helpers/zip";
import { getJscad } from "../__test__/kernel";
import { escapeXml, hexColorOf, threeMfMeshOf, threeMfModelXml, threeMfSettingsOf, threeMfSolidsOf, writeThreeMf } from "./three-mf-writer";
import type { ThreeMfSolid } from "./three-mf-types";

const CREATED = new Date("2026-10-12T08:30:00.000Z");
const CUBE_TRIANGLES = 12;
const CUBE_CORNERS = 8;
const PLAIN = { metadata: false, compress: false };

const xmlOf = (parts: BlobPart[]): string => {
    const [part] = parts;
    if (typeof part !== "string") {
        throw new Error("expected the model's XML text");
    }
    return part;
};

const count = (text: string, pattern: RegExp): number => text.match(pattern)?.length ?? 0;

describe("the 3MF writer", () => {
    let kernel: typeof Modeling;

    beforeAll(async () => {
        ({ kernel } = await getJscad());
    });

    describe("hexColorOf", () => {
        it("should round each channel on its own, so a half does not spill into the next channel", () => {
            // Act
            const hex = hexColorOf([0, 0.5, 1, 1]);

            // Assert
            expect(hex).toBe("#0080FFFF");
        });

        it("should write six digits for a color without alpha", () => {
            // Act
            const hex = hexColorOf([1, 160 / 255, 0]);

            // Assert
            expect(hex).toBe("#FFA000");
        });

        it("should hold channels outside 0 to 1 at the nearest end", () => {
            // Act
            const hex = hexColorOf([-1, 2, 0.2, 0.5]);

            // Assert
            expect(hex).toBe("#00FF3380");
        });

        it("should refuse a color with fewer than three channels or one that is not finite", () => {
            // Act & Assert
            expect(() => hexColorOf([1, 0])).toThrow("A 3MF color needs red, green and blue as finite numbers from 0 to 1, got [1, 0]");
            expect(() => hexColorOf([1, Number.NaN, 0])).toThrow("got [1, NaN, 0]");
        });
    });

    describe("escapeXml", () => {
        it("should escape the five characters XML reserves", () => {
            // Act
            const escaped = escapeXml("<a & \"b\" 'c'>");

            // Assert
            expect(escaped).toBe("&lt;a &amp; &quot;b&quot; &apos;c&apos;&gt;");
        });
    });

    describe("threeMfSettingsOf", () => {
        it("should give millimetres, metadata, compression and the JSCAD orange when no options are given", () => {
            // Act
            const settings = threeMfSettingsOf(undefined);

            // Assert
            expect(settings).toEqual({ unit: "millimeter", metadata: true, defaultColor: [1, 160 / 255, 0, 1], compress: true });
        });

        it("should take the options it is given", () => {
            // Act
            const settings = threeMfSettingsOf({ unit: "inch", metadata: false, defaultcolor: [0, 0, 1, 1], compress: false });

            // Assert
            expect(settings).toEqual({ unit: "inch", metadata: false, defaultColor: [0, 0, 1, 1], compress: false });
        });

        it("should refuse a unit 3MF does not define, naming those it does", () => {
            // Act & Assert
            expect(() => threeMfSettingsOf({ unit: "feet" }))
                .toThrow("A 3MF unit is one of micron, millimeter, centimeter, inch, foot, meter, got \"feet\"");
        });

        it("should refuse a default color that is not a list of numbers", () => {
            // Act & Assert
            expect(() => threeMfSettingsOf({ defaultcolor: "#ff0000" }))
                .toThrow("The 3MF option defaultcolor is a list of red, green, blue and an optional alpha, each from 0 to 1");
        });
    });

    describe("threeMfSolidsOf", () => {
        it("should keep the solids of a nested list in order, with their names and colors, and leave flat shapes out", () => {
            // Arrange
            const cube = kernel.primitives.cube({ size: 2 });
            const red = kernel.colors.colorize([1, 0, 0, 1], kernel.primitives.sphere({ radius: 1, segments: 8 }));
            const named = Object.assign(kernel.primitives.cuboid({ size: [1, 2, 3] }), { name: "Shaft" });

            // Act
            const solids = threeMfSolidsOf(kernel, [[cube, kernel.primitives.circle({ radius: 1 })], [red, named]], [0, 0, 1, 1]);

            // Assert
            expect(solids.map((solid) => solid.name)).toEqual(["Part 0", "Part 1", "Shaft"]);
            expect(solids.map((solid) => solid.color)).toEqual([[0, 0, 1, 1], [1, 0, 0, 1], [0, 0, 1, 1]]);
            expect(solids[0]!.polygons.every((polygon) => polygon.length === 3)).toBe(true);
        });

        it("should leave out a solid without faces, so every object it writes is one the build places", () => {
            // Arrange
            const empty = kernel.geometries.geom3.create();
            const cube = kernel.primitives.cube({ size: 2 });

            // Act
            const solids = threeMfSolidsOf(kernel, [empty, cube], [1, 1, 1, 1]);

            // Assert
            expect(solids).toHaveLength(1);
            expect(solids[0]!.name).toBe("Part 0");
        });

        it("should refuse geometry that holds no solid", () => {
            // Act & Assert
            expect(() => threeMfSolidsOf(kernel, [kernel.primitives.circle({ radius: 1 })], [1, 1, 1, 1]))
                .toThrow("Only 3D solids can be written to 3MF, and the geometry holds none");
        });
    });

    describe("threeMfMeshOf", () => {
        it("should share the corners polygons have in common, so every edge belongs to two triangles of a closed solid", () => {
            // Arrange
            const tetrahedron: ThreeMfSolid = { name: "Part 0", color: [1, 1, 1, 1], polygons: [
                [[0, 0, 0], [0, 1, 0], [1, 0, 0]],
                [[0, 0, 0], [1, 0, 0], [0, 0, 1]],
                [[0, 0, 0], [0, 0, 1], [0, 1, 0]],
                [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
            ] };

            // Act
            const mesh = threeMfMeshOf(tetrahedron);

            // Assert
            expect(mesh.vertices).toEqual([[0, 0, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]]);
            expect(mesh.triangles).toEqual([[0, 1, 2], [0, 2, 3], [0, 3, 1], [2, 1, 3]]);
            const edges = new Map<string, number>();
            for (const [a, b, c] of mesh.triangles) {
                for (const [from, to] of [[a!, b!], [b!, c!], [c!, a!]]) {
                    const key = `${Math.min(from!, to!)}-${Math.max(from!, to!)}`;
                    edges.set(key, (edges.get(key) ?? 0) + 1);
                }
            }
            expect([...edges.values()].every((uses) => uses === 2)).toBe(true);
        });

        it("should fan a polygon of more corners into triangles and drop a triangle whose corners meet", () => {
            // Arrange
            const solid: ThreeMfSolid = { name: "Part 0", color: [1, 1, 1, 1], polygons: [
                [[0, 0, 0], [1, 0, 0]],
                [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]],
                [[0, 0, 0], [1, 0, 0], [0, 0, 0]],
            ] };

            // Act
            const mesh = threeMfMeshOf(solid);

            // Assert
            expect(mesh.vertices).toHaveLength(4);
            expect(mesh.triangles).toEqual([[0, 1, 2], [0, 2, 3]]);
        });

        it("should take minus zero and zero as one corner", () => {
            // Arrange
            const solid: ThreeMfSolid = { name: "Part 0", color: [1, 1, 1, 1], polygons: [[[-0, 0, 0], [1, 0, 0], [0, 1, 0]], [[0, 0, 0], [0, 1, 0], [1, 0, 0]]] };

            // Act
            const mesh = threeMfMeshOf(solid);

            // Assert
            expect(mesh.vertices).toHaveLength(3);
        });
    });

    describe("threeMfModelXml", () => {
        it("should place the materials after the objects' ids and point every object at its own material", () => {
            // Arrange
            const triangle = [[[0, 0, 0], [1, 0, 0], [0, 1, 0]]];
            const solids: ThreeMfSolid[] = [{ name: "A", color: [1, 0, 0, 1], polygons: triangle }, { name: "B", color: [0, 0, 1, 1], polygons: triangle }];

            // Act
            const xml = threeMfModelXml(solids, threeMfSettingsOf(PLAIN), CREATED);

            // Assert
            expect(xml).toContain("    <basematerials id=\"3\">\n      <base name=\"mat0\" displaycolor=\"#FF0000FF\"/>\n      <base name=\"mat1\" displaycolor=\"#0000FFFF\"/>\n");
            expect(xml).toContain("<object id=\"1\" type=\"model\" pid=\"3\" pindex=\"0\" name=\"A\">");
            expect(xml).toContain("<object id=\"2\" type=\"model\" pid=\"3\" pindex=\"1\" name=\"B\">");
            expect(xml).toContain("  <build>\n    <item objectid=\"1\"/>\n    <item objectid=\"2\"/>\n  </build>\n");
        });

        it("should escape a solid's name", () => {
            // Arrange
            const solid: ThreeMfSolid = { name: "Bolt \"M8\" & nut", color: [1, 1, 1, 1], polygons: [[[0, 0, 0], [1, 0, 0], [0, 1, 0]]] };

            // Act
            const xml = threeMfModelXml([solid], threeMfSettingsOf(PLAIN), CREATED);

            // Assert
            expect(xml).toContain("name=\"Bolt &quot;M8&quot; &amp; nut\"");
        });

        it("should write the empty lists of a model without solids in their short form", () => {
            // Act
            const xml = threeMfModelXml([], threeMfSettingsOf(PLAIN), CREATED);

            // Assert
            expect(xml).toContain("    <basematerials id=\"1\"/>\n");
            expect(xml).toContain("  <build/>\n");
        });

        it("should record the creation date only when metadata is asked for", () => {
            // Act
            const withDate = threeMfModelXml([], threeMfSettingsOf({ compress: false }), CREATED);
            const without = threeMfModelXml([], threeMfSettingsOf(PLAIN), CREATED);

            // Assert
            expect(withDate).toContain("<metadata name=\"CreationDate\">2026-10-12T08:30:00.000Z</metadata>");
            expect(without).not.toContain("CreationDate");
        });
    });

    describe("writeThreeMf", () => {
        it("should write a cube as one object of eight shared corners and twelve triangles, its material and its build item, in the unit asked for", () => {
            // Arrange
            const cube = kernel.primitives.cube({ size: 2 });

            // Act
            const xml = xmlOf(writeThreeMf(kernel, { ...PLAIN, unit: "centimeter" }, cube));

            // Assert
            expect(xml.startsWith("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<model unit=\"centimeter\" xml:lang=\"und\" xmlns=\"http://schemas.microsoft.com/3dmanufacturing/core/2015/02\">\n")).toBe(true);
            expect(xml).toContain("      <base name=\"mat0\" displaycolor=\"#FFA000FF\"/>\n");
            expect(xml).toContain("    <object id=\"1\" type=\"model\" pid=\"2\" pindex=\"0\" name=\"Part 0\">\n");
            expect(count(xml, /<vertex /g)).toBe(CUBE_CORNERS);
            expect(count(xml, /<triangle /g)).toBe(CUBE_TRIANGLES);
            expect(xml.endsWith("  <build>\n    <item objectid=\"1\"/>\n  </build>\n</model>\n")).toBe(true);
        });

        it("should package the model as a 3MF archive whose model part is the same XML", () => {
            // Arrange
            const cube = kernel.primitives.cube({ size: 2 });
            const xml = xmlOf(writeThreeMf(kernel, PLAIN, cube));

            // Act
            const [archive] = writeThreeMf(kernel, { metadata: false }, cube);

            // Assert
            const bytes = new Uint8Array(archive as ArrayBuffer);
            const entries = zipEntries(bytes);
            expect(entries.map((entry) => entry.name).sort()).toEqual(["3D/3dmodel.model", "[Content_Types].xml", "_rels/.rels"]);
            const model = entries.find((entry) => entry.name === "3D/3dmodel.model")!;
            expect(new TextDecoder().decode(zipEntryData(bytes, model))).toBe(xml);
            const relationships = new TextDecoder().decode(zipEntryData(bytes, entries.find((entry) => entry.name === "_rels/.rels")!));
            expect(relationships).toContain("Target=\"/3D/3dmodel.model\"");
        });
    });
});
