import { describe, it, expect, beforeAll } from "vitest";
import { BaseBitByBit } from "@bitbybit-dev/base";
import type { TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../occ-service";
import * as Inputs from "../api/inputs";

const dxf = (sections: string[][]): string => [...sections.flatMap(([name, ...body]) => ["0", "SECTION", "2", name!, ...body, "0", "ENDSEC"]), "0", "EOF"].join("\n");

const entities = (...body: string[][]): string => dxf([["ENTITIES", ...body.flat()]]);

const line = (x1: number, y1: number, x2: number, y2: number, extra: string[] = [], layer = "0"): string[] =>
    ["0", "LINE", "8", layer, ...extra, "10", String(x1), "20", String(y1), "30", "0", "11", String(x2), "21", String(y2), "31", "0"];

const square = (from: number, to: number, elevation = 0): string[] =>
    ["0", "LWPOLYLINE", "8", "0", "90", "4", "70", "1", "38", String(elevation), ...[[from, from], [to, from], [to, to], [from, to]].flatMap(([x, y]) => ["10", String(x), "20", String(y)])];

const outline = (points: [number, number][]): string[] =>
    ["0", "LWPOLYLINE", "8", "0", "90", String(points.length), "70", "1", ...points.flatMap(([x, y]) => ["10", String(x), "20", String(y)])];

const singleByteText = (text: string, codes: Record<string, number> = {}): Uint8Array => Uint8Array.from(text, character => codes[character] ?? character.charCodeAt(0));

const layeredFile = (header: string[], layer: string): string => dxf([["HEADER", ...header], ["ENTITIES", ...line(0, 0, 1, 0, [], layer)]]);

const loose = <T>(value: unknown): T => value as T;

describe("OCCT io reading DXF drawings", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        occt = new OCCTService(await createBitbybitOcct());
    }, 120_000);

    const facesOf = (shape: TopoDS_Shape): number[] => occt.shapes.face.getFaces({ shape }).map(face => occt.shapes.face.getFaceArea({ shape: face }));
    const edgeLengthsOf = (shape: TopoDS_Shape): number[] => occt.shapes.edge.getEdges({ shape }).map(edge => occt.shapes.edge.getEdgeLength({ shape: edge })).sort((a, b) => a - b);

    it("should read back a flat outline that dxfCreate wrote from shapeToDxfPaths, exactly and where it lay", () => {
        // Arrange
        const curve = occt.shapes.wire.interpolatePoints({ points: [[0, 0, 0], [5, 0, 5], [10, 0, 2], [15, 0, 8]], periodic: false, tolerance: 1e-7 });
        const ring = occt.shapes.wire.createCircleWire({ radius: 3, center: [20, 0, 4], direction: [0, 1, 0] });
        const original = occt.shapes.compound.makeCompound({ shapes: [curve, ring] });
        const paths = occt.io.shapeToDxfPaths({ shape: original });
        const text = occt.io.dxfCreate({ pathsParts: [occt.io.dxfPathsWithLayer({ paths, layer: "cut", color: "#ff0000" })] });

        // Act
        const loaded = occt.io.loadDxf({ dxf: text });

        // Assert
        const lengths = edgeLengthsOf(loaded);
        edgeLengthsOf(original).forEach((length, at) => expect(lengths[at]).toBeCloseTo(length, 9));
        const box = occt.operations.boundingBoxOfShape({ shape: loaded });
        const truth = occt.operations.boundingBoxOfShape({ shape: original });
        [...box.min, ...box.max].forEach((value, at) => expect(value).toBeCloseTo([...truth.min, ...truth.max][at]!, 6));
        const samples = occt.shapes.wire.divideWireByEqualDistanceToPoints({ shape: occt.shapes.wire.getWires({ shape: original })[0]!, nrOfDivisions: 40, removeStartPoint: false, removeEndPoint: false });
        occt.operations.distancesToShapeFromPoints({ shape: loaded, points: samples }).forEach(distance => expect(distance).toBeLessThan(1e-9));
    });

    it("should build closed outlines into faces with their holes, an island inside a hole a face of its own, lying on the ground", () => {
        // Act
        const loaded = occt.io.loadDxf({ dxf: entities(square(0, 100), square(20, 80), ["0", "CIRCLE", "8", "0", "10", "50", "20", "50", "30", "0", "40", "10"]), makeFaces: true });

        // Assert
        const areas = facesOf(loaded).sort((a, b) => a - b);
        expect(areas).toHaveLength(2);
        expect(areas[0]).toBeCloseTo(100 * Math.PI, 6);
        expect(areas[1]).toBeCloseTo(100 * 100 - 60 * 60, 6);
        const box = occt.operations.boundingBoxOfShape({ shape: loaded });
        expect([box.min[0], box.max[0], box.max[1] - box.min[1], box.min[2], box.max[2]].map(value => Math.round(value * 1e5) / 1e5 + 0)).toEqual([0, 100, 0, 0, 100]);
    });

    it("should join entities whose ends meet within the join tolerance, in any order and direction, and leave a wider gap open", () => {
        // Arrange
        const text = entities(line(10, 10, 0, 10), line(0, 0, 10, 0), line(0, 10, 0, 0.0005), line(10, 10, 10, 0));

        // Act
        const joined = occt.io.loadDxf({ dxf: text, makeFaces: true, joinTolerance: 0.001 });
        const apart = occt.io.loadDxfStructured({ dxf: text, makeFaces: true, joinTolerance: 0.0001 });

        // Assert
        const areas = facesOf(joined);
        expect(areas).toHaveLength(1);
        expect(areas[0]).toBeCloseTo(100, 2);
        expect(facesOf(apart.parts[0]!.shape)).toEqual([]);
        expect(occt.shapes.wire.getWires({ shape: apart.parts[0]!.shape })).toHaveLength(1);
        expect(apart.warnings).toEqual([]);
    });

    it("should make faces at each height apart, an outline above another no hole in it", () => {
        // Act
        const loaded = occt.io.loadDxf({ dxf: entities(square(0, 10), square(2, 8, 5)), makeFaces: true });

        // Assert
        const areas = facesOf(loaded).sort((a, b) => a - b);
        expect(areas).toHaveLength(2);
        expect(areas[0]).toBeCloseTo(36, 9);
        expect(areas[1]).toBeCloseTo(100, 9);
    });

    it("should measure the join tolerance in the file's units when it scales the drawing", () => {
        // Arrange
        const text = dxf([["HEADER", "9", "$INSUNITS", "70", "1"], ["ENTITIES", ...line(0, 0, 10, 0), ...line(10, 0, 10, 10), ...line(10, 10, 0, 10), ...line(0, 10, 0, 0.0005)]]);

        // Act
        const loaded = occt.io.loadDxf({ dxf: text, makeFaces: true, joinTolerance: 0.001, unit: Inputs.Base.unitOfLengthEnum.millimetre });

        // Assert
        const areas = facesOf(loaded);
        expect(areas).toHaveLength(1);
        expect(areas[0]).toBeCloseTo(254 * 254, 0);
    });

    it("should interpolate a spline given only by fit points through every one of them, which base's dxfRead leaves out", () => {
        // Arrange
        const fits: [number, number][] = [[0, 0], [10, 5], [20, 0], [30, 5]];
        const text = entities(["0", "SPLINE", "8", "0", "70", "8", "71", "3", "74", String(fits.length), ...fits.flatMap(([x, y]) => ["11", String(x), "21", String(y), "31", "0"])]);

        // Act
        const loaded = occt.io.loadDxf({ dxf: text });

        // Assert
        const distances = occt.operations.distancesToShapeFromPoints({ shape: loaded, points: fits.map(([x, y]): Inputs.Base.Point3 => [x, 0, y]) });
        distances.forEach(distance => expect(distance).toBeLessThan(1e-7));
        expect(occt.shapes.edge.getEdges({ shape: loaded })).toHaveLength(1);
        expect(edgeLengthsOf(loaded)[0]).toBeGreaterThan(30);
    });

    it("should pass once through a fit point given twice in a row, and close a closed spline that repeats its first point at its end", () => {
        // Arrange
        const fitSpline = (points: [number, number][], flags: number): string[] =>
            ["0", "SPLINE", "8", "0", "70", String(flags), "71", "3", "74", String(points.length), ...points.flatMap(([x, y]) => ["11", String(x), "21", String(y), "31", "0"])];
        const open: [number, number][] = [[0, 0], [10, 5], [20, 0], [30, 5]];
        const ring: [number, number][] = [[40, 0], [50, 5], [60, 0], [50, -5]];

        // Act
        const result = occt.io.loadDxfStructured({ dxf: entities(fitSpline([open[0]!, open[1]!, open[1]!, open[2]!, open[3]!], 8), fitSpline([...ring, ring[0]!], 9)) });

        // Assert
        const shape = result.parts[0]!.shape;
        const distances = occt.operations.distancesToShapeFromPoints({ shape, points: [...open, ...ring].map(([x, y]): Inputs.Base.Point3 => [x, 0, y]) });
        distances.forEach(distance => expect(distance).toBeLessThan(1e-7));
        const edges = occt.shapes.edge.getEdges({ shape });
        expect(edges).toHaveLength(2);
        const gaps = edges.map(edge => new BaseBitByBit().point.distance({ startPoint: occt.shapes.edge.startPointOnEdge({ shape: edge }), endPoint: occt.shapes.edge.endPointOnEdge({ shape: edge }) }));
        expect(gaps.filter(gap => gap < 1e-9)).toHaveLength(1);
        expect(result.warnings).toEqual([]);
    });

    it("should warn by layer about a spline the kernel cannot make and draw the rest of the layer", () => {
        // Arrange
        const controls: [number, number][] = [[0, 0], [1, 1], [2, 0], [3, 1], [4, 0], [5, 1]];
        const knots = [0, 0, 0, 0.5, 0.5, 0.5, 1, 1, 1];
        const spline = ["0", "SPLINE", "8", "cut", "70", "8", "71", "2", "72", String(knots.length), "73", String(controls.length), ...knots.flatMap(knot => ["40", String(knot)]), ...controls.flatMap(([x, y]) => ["10", String(x), "20", String(y), "30", "0"])];

        // Act
        const result = occt.io.loadDxfStructured({ dxf: entities(spline, line(0, -5, 5, -5, [], "cut")) });

        // Assert
        expect(result.warnings).toEqual(["1 spline on layer \"cut\" could not be drawn: the kernel refuses the degree, knots or weights given."]);
        expect(result.parts.map(part => part.layer)).toEqual(["cut"]);
        expect(edgeLengthsOf(result.parts[0]!.shape)).toEqual([5]);
    });

    it("should give each layer, color and line type its own shape, scale from the unit the file states and pass on what it left out", () => {
        // Arrange
        const text = dxf([
            ["HEADER", "9", "$ACADVER", "1", "AC1015", "9", "$INSUNITS", "70", "1"],
            ["ENTITIES", ...line(0, 0, 1, 0, ["62", "1"]), ...line(0, 1, 2, 1, ["62", "5", "6", "DASHED"], "engrave"), "0", "TEXT", "8", "0", "1", "note"],
        ]);

        // Act
        const result = occt.io.loadDxfStructured({ dxf: text, unit: Inputs.Base.unitOfLengthEnum.millimetre });
        const asDrawn = occt.io.loadDxfStructured({ dxf: entities(line(0, 0, 1, 0)), unit: Inputs.Base.unitOfLengthEnum.millimetre });

        // Assert
        expect(result.parts.map(part => [part.layer, part.color, part.lineType])).toEqual([["0", "#ff0000", "continuous"], ["engrave", "#0000ff", "dashed"]]);
        expect(edgeLengthsOf(result.parts[0]!.shape)[0]).toBeCloseTo(25.4, 9);
        expect(edgeLengthsOf(result.parts[1]!.shape)[0]).toBeCloseTo(50.8, 9);
        expect([result.unit, result.version]).toEqual(["mm", "AC1015"]);
        expect(result.warnings).toEqual(["1 TEXT entity was left out: only lines, arcs, circles, ellipses, polylines, splines and block inserts are drawn."]);
        expect(asDrawn.unit).toBeUndefined();
        expect(asDrawn.warnings).toEqual(["The file states no unit, so it was read as drawn and not scaled to mm."]);
        expect(edgeLengthsOf(asDrawn.parts[0]!.shape)[0]).toBeCloseTo(1, 12);
    });

    it("should keep an outline that does not lie flat as a wire when faces are asked, a tilted circle in its own plane", () => {
        // Act
        const loaded = occt.io.loadDxf({ dxf: entities(["0", "CIRCLE", "8", "0", "10", "0", "20", "0", "30", "5", "40", "2", "210", "0", "220", "-1", "230", "1"]), makeFaces: true });

        // Assert
        expect(facesOf(loaded)).toEqual([]);
        const [edge] = occt.shapes.edge.getEdges({ shape: loaded });
        expect(occt.shapes.edge.isEdgeCircular({ shape: edge! })).toBe(true);
        expect(occt.shapes.edge.getEdgeLength({ shape: edge! })).toBeCloseTo(4 * Math.PI, 9);
    });

    it.each([
        ["folds back on itself", [outline([[0, 0], [10, 0]])], "A closed outline in the DXF file encloses no area, because it folds back on itself or crosses itself into equal and opposite parts; it is returned as its wire.", 1],
        ["crosses itself", [outline([[50, 0], [79, 90], [2, 35], [98, 35], [21, 90]])], "A region bounded by closed outlines in the DXF file could not become a valid face, often because an outline crosses itself; it is returned as its outline wires.", 1],
        ["is one of too many overlapping outlines to nest", Array.from({ length: 450 }, (_, at) => square(-at - 1, at + 1)), "So many closed outlines on one layer of the DXF file overlap one another that nesting them into faces would take too long; they are returned as their wires.", 450],
    ])("should keep a closed outline that %s as a wire when faces are asked, with a warning worded for a DXF file", (_name, body, warning, wires) => {
        // Act
        const result = occt.io.loadDxfStructured({ dxf: entities(...body), makeFaces: true });

        // Assert
        expect(result.warnings).toEqual([warning]);
        expect(facesOf(result.parts[0]!.shape)).toEqual([]);
        expect(occt.shapes.wire.getWires({ shape: result.parts[0]!.shape })).toHaveLength(wires);
    });

    it("should face closed outlines on one layer that cross one another as they nest, with a warning worded for a DXF file", () => {
        // Act
        const result = occt.io.loadDxfStructured({ dxf: entities(outline([[0, 0], [20, 0], [20, 20], [0, 20]]), outline([[15, 4], [35, 4], [35, 14], [15, 14]])), makeFaces: true });

        // Assert
        expect(result.warnings).toEqual(["Closed outlines on one layer of the DXF file cross one another; its faces follow how the outlines nest, which can differ from what was meant where they overlap."]);
        expect(facesOf(result.parts[0]!.shape).map(area => Math.round(area)).sort((a, b) => a - b)).toEqual([200, 400]);
    });

    it("should count a circle too small to draw with the ones the kernel refuses, by layer, and give a layer with nothing drawn no part", () => {
        // Arrange
        const circle = (radius: number): string[] => ["0", "CIRCLE", "8", "z", "10", "0", "20", "0", "30", "0", "40", String(radius)];

        // Act
        const result = occt.io.loadDxfStructured({ dxf: entities(circle(0), line(0, 0, 1, 0, [], "c"), circle(1e-9)) });

        // Assert
        expect(result.warnings).toEqual(["2 arcs on layer \"z\" could not be drawn: a radius, a plane or a sweep is missing."]);
        expect(result.parts.map(part => part.layer)).toEqual(["c"]);
    });

    it.each([
        ["in the code page its header names", ["9", "$ACADVER", "1", "AC1015", "9", "$DWGCODEPAGE", "3", "ANSI_1251"], "Слой", { С: 0xd1, л: 0xeb, о: 0xee, й: 0xe9 }],
        ["as Windows-1252 when its header names neither a version nor a code page", [], "Maße", {}],
        ["as Windows-1252 when its header names a code page it does not know", ["9", "$ACADVER", "1", "AC1015", "9", "$DWGCODEPAGE", "3", "DOS437"], "Maße", {}],
    ])("should read the layer names of an older DXF file given as bytes that are not UTF-8 %s", (_name, header, layer, codes) => {
        // Arrange
        const bytes = singleByteText(layeredFile(header, layer), codes);

        // Act
        const result = occt.io.loadDxfStructured({ dxf: loose<Blob>(bytes) });

        // Assert
        expect(result.parts.map(part => part.layer)).toEqual([layer]);
    });

    it.each([
        ["an older one that is valid UTF-8", new TextEncoder().encode(layeredFile(["9", "$ACADVER", "1", "AC1015", "9", "$DWGCODEPAGE", "3", "ANSI_1252"], "Maße")), "Maße"],
        ["one from AutoCAD 2007 on that is not", singleByteText(layeredFile(["9", "$ACADVER", "1", "AC1021"], "Maße")), "Ma�e"],
    ])("should read a DXF file given as bytes as UTF-8 when it is %s", (_name, bytes, layer) => {
        // Act
        const result = occt.io.loadDxfStructured({ dxf: loose<Blob>(bytes) });

        // Assert
        expect(result.parts.map(part => part.layer)).toEqual([layer]);
    });

    it.each([
        ["no number", Number.NaN],
        ["endless", Number.POSITIVE_INFINITY],
        ["below zero", -0.001],
    ])("should refuse a join tolerance that is %s before the kernel runs", (_name, joinTolerance) => {
        // Act
        const load = (): unknown => occt.io.loadDxf({ dxf: entities(square(0, 10)), makeFaces: true, joinTolerance });

        // Assert
        expect(load).toThrow(`\`joinTolerance\` must be a finite number 0 or more; it is ${String(joinTolerance)}.`);
    });

    it("should refuse a damaged file, saying where, before the kernel runs", () => {
        // Act
        const damaged = (): unknown => occt.io.loadDxf({ dxf: entities(["0", "LINE", "8", "0", "10", "one", "20", "0"]) });

        // Assert
        expect(damaged).toThrow("`dxf` is damaged: line 10 should hold a number for group code 10 and holds \"one\".");
    });
});
