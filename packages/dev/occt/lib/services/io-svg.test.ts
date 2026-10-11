import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { OCCTSolid } from "./shapes";
import { OCCTIO } from "./io";
import { svgOfDrawing } from "./base/svg-drawing";
import type * as Inputs from "../api/inputs";

const MISSING: unknown = undefined;
const FROM_ABOVE: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] };
const ISOMETRIC: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [1, 1, 1], direction: [1, -1, 0] };

type Drawn = { visible: number[][][]; hidden: number[][][]; viewBox: number[]; dashed: boolean };

const pointsOf = (path: string): number[][] => [...path.matchAll(/[ML](-?[\d.e+-]+) (-?[\d.e+-]+)/g)].map(match => [Number(match[1]), Number(match[2])]);

const groupOf = (svg: string, id: string): string => {
    const start = svg.indexOf(`<g id="${id}"`);
    return start === -1 ? "" : svg.slice(start, svg.indexOf("</g>", start));
};

const linesOf = (group: string): number[][][] => [...group.matchAll(/<path d="([^"]*)"\/>/g)].map(match => pointsOf(match[1]!));

const drawnOf = (svg: string): Drawn => ({
    visible: linesOf(groupOf(svg, "visible")),
    hidden: linesOf(groupOf(svg, "hidden")),
    viewBox: (/viewBox="([^"]*)"/.exec(svg)?.[1] ?? "").split(" ").map(Number),
    dashed: /<g id="hidden"[^>]*stroke-dasharray=/.test(svg),
});

const lengthOf = (line: number[][]): number => line.slice(1).reduce((sum, point, at) => sum + Math.hypot(point[0]! - line[at]![0]!, point[1]! - line[at]![1]!), 0);

const spanOf = (lines: number[][][]): number[][] => [0, 1].map(axis => {
    const values = lines.flat().map(point => point[axis]!);
    return [Math.min(...values) + 0, Math.max(...values) + 0];
});

describe("OCCT io writing SVG drawings of views", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let io: OCCTIO;
    let solid: OCCTSolid;

    const cube = (): TopoDS_Shape => solid.createBox({ width: 10, height: 10, length: 10, center: [5, 5, 5] });

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt);
        io = new OCCTIO(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
    });

    describe("saveShapeSvg", () => {
        it("should draw a box seen from above as the rectangle the eye sees, x along the frame's direction and up drawn up", () => {
            // Arrange
            const offBox = solid.createBox({ width: 10, height: 20, length: 30, center: [5, 15, 15] });

            // Act
            const drawn = drawnOf(io.saveShapeSvg({ shape: offBox, frame: FROM_ABOVE }));

            // Assert
            expect(drawn.visible).toHaveLength(4);
            expect(spanOf(drawn.visible)).toEqual([[0, 10], [-25, -5]]);
            expect(drawn.hidden).toEqual([]);
        });

        it("should frame the drawing with a fortieth of its larger side on every side", () => {
            // Act
            const drawn = drawnOf(io.saveShapeSvg({ shape: cube(), frame: FROM_ABOVE }));

            // Assert
            expect(drawn.viewBox).toEqual([-0.25, -10.25, 10.5, 10.5]);
        });

        it("should draw an isometric cube with nine edges seen and three hidden, dashed, each as long as a cube edge seen at that angle", () => {
            // Arrange
            const seenLength = 10 * Math.sqrt(2 / 3);

            // Act
            const drawn = drawnOf(io.saveShapeSvg({ shape: cube(), frame: ISOMETRIC, drawHidden: true, precision: 0.01 }));

            // Assert
            expect(drawn.visible.map(lengthOf).map(length => length.toFixed(6))).toEqual(Array(9).fill(seenLength.toFixed(6)));
            expect(drawn.hidden.map(lengthOf).map(length => length.toFixed(6))).toEqual(Array(3).fill(seenLength.toFixed(6)));
            expect(drawn.dashed).toBe(true);
        });

        it("should trace a circle seen face on with points on it, no chord straying further than the precision", () => {
            // Arrange
            const cylinder = solid.createCylinder({ radius: 2, height: 5, center: [0, 0, 0], direction: [0, 0, 1] });

            // Act
            const coarse = drawnOf(io.saveShapeSvg({ shape: cylinder, frame: FROM_ABOVE, precision: 0.1 }));
            const fine = drawnOf(io.saveShapeSvg({ shape: cylinder, frame: FROM_ABOVE, precision: 0.001 }));

            // Assert
            const circle = fine.visible[0]!;
            expect(fine.visible).toHaveLength(1);
            expect(circle.every(point => Math.abs(Math.hypot(point[0]!, point[1]!) - 2) < 1e-6)).toBe(true);
            expect(circle.slice(1).every((point, at) => 2 - Math.hypot((point[0]! + circle[at]![0]!) / 2, (point[1]! + circle[at]![1]!) / 2) <= 0.001 + 1e-9)).toBe(true);
            expect(coarse.visible[0]!.length).toBeLessThan(circle.length);
        });

        it("should refuse a precision of 0", () => {
            // Act
            const act = (): unknown => io.saveShapeSvg({ shape: cube(), frame: FROM_ABOVE, precision: 0 });

            // Assert
            expect(act).toThrow(new InputError("`precision` must be above 0; it is 0.", "precision"));
        });

        it("should refuse a view whose normal has no length", () => {
            // Act
            const act = (): unknown => io.saveShapeSvg({ shape: cube(), frame: { origin: [0, 0, 0], normal: [0, 0, 0], direction: [1, 0, 0] } });

            // Assert
            expect(act).toThrow(new InputError("`frame` is not a frame: its `normal` has no length.", "frame"));
        });

        it("should refuse a shape that is missing", () => {
            // Act
            const act = (): unknown => io.saveShapeSvg({ shape: MISSING as TopoDS_Shape, frame: FROM_ABOVE });

            // Assert
            expect(act).toThrow(new InputError("`shape` is missing or empty, as an operation that failed can leave it.", "shape"));
        });
    });

    describe("the SVG text a drawing becomes", () => {
        it("should write y negated, so the drawing's up is the page's up", () => {
            // Act
            const svg = svgOfDrawing([[[0, 0], [4, 2]]], []);

            // Assert
            expect(svg).toContain("<path d=\"M0 0 L4 -2\"/>");
        });

        it("should write a solid black stroke a four-hundredth of the drawing's larger side wide", () => {
            // Act
            const svg = svgOfDrawing([[[0, 0], [40, 0]]], []);

            // Assert
            expect(svg).toContain("<g id=\"visible\" fill=\"none\" stroke=\"#000000\" stroke-width=\"0.1\" stroke-linecap=\"round\" stroke-linejoin=\"round\">");
        });

        it("should dash the hidden lines six strokes on and three off, beneath the visible ones", () => {
            // Act
            const svg = svgOfDrawing([[[0, 0], [40, 0]]], [[[0, 1], [40, 1]]]);

            // Assert
            expect(svg).toContain("stroke-dasharray=\"0.6 0.3\"");
            expect(svg.indexOf("<g id=\"hidden\"")).toBeLessThan(svg.indexOf("<g id=\"visible\""));
        });

        it("should leave out a line of fewer than two points and frame an empty drawing as if it were one unit across", () => {
            // Act
            const svg = svgOfDrawing([[[3, 3]]], []);

            // Assert
            expect(svg).toBe("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-0.025 -0.025 0.05 0.05\">\n</svg>\n");
        });

        it("should round away the noise far below the drawing's size, and never write minus zero", () => {
            // Act
            const svg = svgOfDrawing([[[3.3306690738754696e-15, -0], [10.000000000000002, 5]]], []);

            // Assert
            expect(svg).toContain("<path d=\"M0 0 L10 -5\"/>");
        });
    });
});
