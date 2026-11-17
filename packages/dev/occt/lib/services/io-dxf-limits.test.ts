import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { InputError } from "@bitbybit-dev/base";
import type { BitbybitOcctModule } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../occ-service";
import type * as Inputs from "../api/inputs";
import { ledgerRun, namesOf } from "../__test__/kernel-ledger";
import type { FaceBuild } from "./base/drawing-faces";
import { DrawingFaceBuilder } from "./base/drawing-faces";
import { KERNEL_EDGE_FLOOR, KERNEL_EDGES_PER_DXF_CHARACTER } from "./base/dxf-loader.constants";

const dxf = (sections: string[][]): string => [...sections.flatMap(([name, ...body]) => ["0", "SECTION", "2", name!, ...body, "0", "ENDSEC"]), "0", "EOF"].join("\n");

const line = (x1: number, y1: number, x2: number, y2: number, layer = "0"): string[] =>
    ["0", "LINE", "8", layer, "10", String(x1), "20", String(y1), "30", "0", "11", String(x2), "21", String(y2), "31", "0"];

const circle = (x: number, y: number, radius: number): string[] => ["0", "CIRCLE", "8", "0", "10", String(x), "20", String(y), "30", "0", "40", String(radius)];

const square = (from: number, to: number, elevation = 0): string[] =>
    ["0", "LWPOLYLINE", "8", "0", "90", "4", "70", "1", "38", String(elevation), ...[[from, from], [to, from], [to, to], [from, to]].flatMap(([x, y]) => ["10", String(x), "20", String(y)])];

const block = (name: string, body: string[]): string[] => ["0", "BLOCK", "2", name, "70", "0", "10", "0", "20", "0", "30", "0", ...body, "0", "ENDBLK"];

interface Placement { x?: number; z?: number; columns?: number; rows?: number; step?: number; scale?: number }

const insert = (name: string, { x = 0, z = 0, columns = 1, rows = 1, step = 0, scale = 1 }: Placement = {}): string[] =>
    ["0", "INSERT", "8", "0", "2", name, "10", String(x), "20", "0", "30", String(z), "41", String(scale), "42", String(scale), "70", String(columns), "71", String(rows), "44", String(step), "45", String(step)];

const facesBudgetWarning = "Building faces took all the work one load of a DXF file its size may do; the closed outlines left are returned as their wires.";

const edgesWarning = (count: number, noun: string): string => `${count} ${noun} on layer "0" could not be drawn: the file asks for more edges than one load of a file its size builds.`;

describe("OCCT io reading large DXF drawings", () => {
    let occ: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        occ = await createBitbybitOcct();
        occt = new OCCTService(occ);
    }, 120_000);

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const loaded = (text: string, options: Partial<Inputs.OCCT.LoadDxfDto> = {}): { warnings: string[]; edges: number; faces: number; layers: string[] } => {
        const result = occt.io.loadDxfStructured({ dxf: text, ...options });
        const summary = {
            warnings: result.warnings,
            edges: result.parts.reduce((sum, part) => sum + occ.CountEdges(part.shape), 0),
            faces: result.parts.reduce((sum, part) => sum + occ.CountFaces(part.shape), 0),
            layers: result.parts.map(part => part.layer),
        };
        result.parts.forEach(part => part.shape.delete());
        return summary;
    };

    it("should share one face budget across the heights an insert places a block at, rather than nest each height afresh", { timeout: 120_000 }, () => {
        // Arrange
        const rings = Array.from({ length: 440 }, (_, k) => circle(0, 0, 10 + k * 0.01)).flat();
        const levels = Array.from({ length: 64 }, (_, z) => insert("C", { z })).flat();

        // Act
        const result = loaded(dxf([["BLOCKS", ...block("C", rings)], ["ENTITIES", ...levels]]), { makeFaces: true });

        // Assert
        expect(result.warnings).toEqual([
            "So many closed outlines on one layer of the DXF file overlap one another that nesting them into faces would take too long; they are returned as their wires.",
            facesBudgetWarning,
        ]);
        expect(result.faces).toBe(0);
        expect(result.edges).toBe(440 * 64);
    });

    it("should face the closed outlines of a small file at one height only when its face budget covers them all, and return them as wires when it does not", () => {
        // Arrange
        const grid = (side: number): string => dxf([["BLOCKS", ...block("C", circle(0, 0, 1))], ["ENTITIES", ...insert("C", { columns: side, rows: side, step: 3 })]]);

        // Act
        const results = [40, 150].map(side => loaded(grid(side), { makeFaces: true }));

        // Assert
        expect(results.map(result => [result.faces, result.edges, result.warnings])).toEqual([[40 * 40, 40 * 40, []], [0, 150 * 150, [facesBudgetWarning]]]);
    });

    it("should return more closed wires than a call can spread as its arguments without overflowing the stack (needs the kernel's linear edge joining)", { timeout: 60_000 }, () => {
        // Arrange
        const copies = [0, 1, 2, 3].flatMap(k => insert("C", { x: 700 * k, columns: 200, rows: 200, step: 3 }));
        const text = dxf([["HEADER", "999", "x".repeat(1_400_000)], ["BLOCKS", ...block("C", circle(0, 0, 1))], ["ENTITIES", ...copies]]);

        // Act
        const result = loaded(text, { makeFaces: true });

        // Assert
        const edges = Math.floor(text.length * KERNEL_EDGES_PER_DXF_CHARACTER);
        expect(result.edges).toBe(edges);
        expect(result.warnings).toEqual([edgesWarning(160_000 - edges, "arcs"), facesBudgetWarning]);
    });

    it("should release the faces of the heights it built when a later height fails, and throw what failed", () => {
        // Arrange
        const build = Object.getOwnPropertyDescriptor(DrawingFaceBuilder.prototype, "build")?.value as (this: DrawingFaceBuilder, ...args: Parameters<DrawingFaceBuilder["build"]>) => FaceBuild;
        let calls = 0;
        vi.spyOn(DrawingFaceBuilder.prototype, "build").mockImplementation(function (this: DrawingFaceBuilder, ...args: Parameters<DrawingFaceBuilder["build"]>) {
            calls++;
            if (calls === 2) {
                throw new Error("the second height failed");
            }
            return build.apply(this, args);
        });

        // Act
        const run = ledgerRun(occ, () => occt.io.loadDxfStructured({ dxf: dxf([["ENTITIES", ...square(0, 10), ...square(0, 10, 5)]]), makeFaces: true }));

        // Assert
        expect(run.thrown).toEqual(new Error("the second height failed"));
        expect(namesOf(run.leaked)).toEqual([]);
    });

    it("should send the kernel no more edges than one load of a file its size builds, leaving the rest out with a warning", () => {
        // Act
        const result = loaded(dxf([["BLOCKS", ...block("L", line(0, 0, 1, 0))], ["ENTITIES", ...insert("L", { columns: 200, rows: 200, step: 2 }), ...insert("L", { x: 500, columns: 200, rows: 200, step: 2 })]]));

        // Assert
        expect(result.edges).toBe(KERNEL_EDGE_FLOOR);
        expect(result.warnings).toEqual([edgesWarning(80_000 - KERNEL_EDGE_FLOOR, "segments")]);
    });

    it.each([
        ["lying on one another", 1],
        ["meeting at one point", 2],
    ])("should join edges %s in about linear time (needs the kernel's linear edge joining)", { timeout: 120_000 }, (_name, lastScale) => {
        // Arrange
        const copies = [1, lastScale].flatMap(scale => insert("L", { columns: 141, rows: 141, scale }));
        const started = performance.now();

        // Act
        const result = loaded(dxf([["BLOCKS", ...block("L", line(0, 0, 1, 1))], ["ENTITIES", ...copies]]));

        // Assert
        expect(performance.now() - started).toBeLessThan(5000);
        expect(result.edges).toBe(2 * 141 * 141);
        expect(result.warnings).toEqual([]);
    });

    it.each([1e9, 1e300, 0.07])("should refuse a join tolerance of %s, more than a hundredth of what the drawing spans, before the kernel runs", (joinTolerance) => {
        // Act
        const run = ledgerRun(occ, () => occt.io.loadDxf({ dxf: dxf([["ENTITIES", ...line(0, 0, 1, 1), ...line(5, 5, 6, 6)]]), joinTolerance }));

        // Assert
        expect(run.thrown).toEqual(new InputError(`\`joinTolerance\` may be at most 0.06, a hundredth of the 6 units the drawing spans; it is ${String(joinTolerance)}.`, "joinTolerance"));
        expect(run.made).toBe(0);
    });

    it("should take a join tolerance of a hundredth of what the drawing spans, and the default one on a drawing too small for it to be a hundredth", () => {
        // Act
        const wide = loaded(dxf([["ENTITIES", ...line(0, 0, 3, 0), ...line(3, 0.06, 6, 6)]]), { joinTolerance: 0.06 });
        const small = loaded(dxf([["ENTITIES", ...line(0, 0, 0.01, 0), ...line(0.01, 0, 0.01, 0.01)]]), { joinTolerance: 0.001 });

        // Assert
        expect([wide.edges, wide.warnings, small.edges, small.warnings]).toEqual([2, [], 2, []]);
    });

    it.each([
        ["a coordinate of 1e100", dxf([["ENTITIES", ...line(0, 0, 1e100, 1), ...line(0, 0, 1, 0)]]), "segment"],
        ["an insert scaled past every finite number", dxf([["BLOCKS", ...block("B", line(0, 0, 1, 1))], ["ENTITIES", ...insert("B", { scale: 1e300 }), ...line(0, 0, 1, 0)]]), "segment"],
    ])("should leave out an entity reaching %s with a warning, rather than throw what the kernel says of it", (_name, text, noun) => {
        // Act
        const result = loaded(text);

        // Assert
        expect(result.warnings).toEqual([`1 ${noun} on layer "0" could not be drawn: a number in it is not finite or is 1e+100 or more in size.`]);
        expect(result.edges).toBe(1);
    });

    it("should leave out a spline of degree 4000 quickly, with a warning", { timeout: 5000 }, () => {
        // Arrange
        const degree = 4000;
        const poles = Array.from({ length: 2 * degree + 1 }, (_, k) => ["10", String(k), "20", String(k % 7), "30", "0"]).flat();
        const knots = Array.from({ length: 3 * degree + 2 }, (_, k) => ["40", String(k)]).flat();

        // Act
        const result = loaded(dxf([["ENTITIES", "0", "SPLINE", "8", "0", "70", "0", "71", String(degree), ...knots, ...poles, ...line(0, 0, 1, 0)]]));

        // Assert
        expect(result.warnings).toEqual([expect.stringMatching(/degree is above 25/)]);
        expect(result.edges).toBe(1);
    });

    it.each([
        ["40000 fit points", 40_000, /more than 10000 fit points/],
        ["6000 fit points, closed", 6_000, /closed through more than 5000 fit points/],
    ])("should leave out a closed spline through %s quickly, with a warning", { timeout: 5000 }, (_name, count, warning) => {
        // Arrange
        const fits = Array.from({ length: count }, (_, k) => ["11", String(count * Math.cos((2 * Math.PI * k) / count)), "21", String(count * Math.sin((2 * Math.PI * k) / count)), "31", "0"]).flat();

        // Act
        const result = loaded(dxf([["ENTITIES", "0", "SPLINE", "8", "0", "70", "9", "71", "3", ...fits, ...line(0, 0, 1, 0)]]));

        // Assert
        expect(result.warnings).toEqual([expect.stringMatching(warning)]);
        expect(result.edges).toBe(1);
    });

    it("should still face a closed spline of 8000 poles", () => {
        // Arrange
        const count = 8000;
        const knots = Array.from({ length: count + 4 }, (_, k) => ["40", String(Math.min(Math.max(k - 3, 0), count - 3))]).flat();
        const poles = Array.from({ length: count }, (_, k) => {
            const angle = ((k === count - 1 ? 0 : k) * 2 * Math.PI) / (count - 1);
            const radius = k === count - 1 ? 1000 : 1000 * (1 + (k % 2) * 0.01);
            return ["10", String(radius * Math.cos(angle)), "20", String(radius * Math.sin(angle))];
        }).flat();

        // Act
        const result = loaded(dxf([["ENTITIES", "0", "SPLINE", "8", "0", "70", "0", "71", "3", ...knots, ...poles]]), { makeFaces: true });

        // Assert
        expect([result.faces, result.warnings]).toEqual([1, []]);
    });
});
