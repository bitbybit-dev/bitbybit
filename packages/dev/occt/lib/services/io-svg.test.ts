import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { OccHelper } from "../occ-helper";
import { OCCTSolid } from "./shapes";
import { OCCTIO } from "./io";
import * as Inputs from "../api/inputs";

const MISSING: unknown = undefined;
const FROM_ABOVE: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] };
const ISOMETRIC: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [1, 1, 1], direction: [1, -1, 0] };

interface Stroke {
    readonly commands: string[];
    readonly points: number[][];
    readonly straightLength: number;
    readonly straightCount: number;
}

const strokeOf = (data: string): Stroke => {
    const tokens = data.match(/[MLACZ]|-?[\d.]+(?:e[-+]?\d+)?/g) ?? [];
    const commands: string[] = [];
    const points: number[][] = [];
    let start: number[] = [0, 0];
    let current: number[] = [0, 0];
    let straightLength = 0;
    let straightCount = 0;
    for (let at = 0; at < tokens.length;) {
        const command = tokens[at++]!;
        commands.push(command);
        const take = (count: number): number[] => tokens.slice(at, (at += count)).map(Number);
        if (command === "M") {
            start = current = take(2);
        } else if (command === "L" || command === "Z") {
            const to = command === "L" ? take(2) : start;
            straightLength += Math.hypot(to[0]! - current[0]!, to[1]! - current[1]!);
            straightCount++;
            current = to;
        } else if (command === "A") {
            const values = take(7);
            current = values.slice(5);
            commands.push(`r${values[0]} ${values[1]}`);
        } else {
            current = take(6).slice(4);
        }
        points.push(current);
    }
    return { commands, points, straightLength, straightCount };
};

const layerOf = (svg: string, name: string): Stroke[] => {
    const start = svg.indexOf(`<g id="layer-${name}"`);
    if (start === -1) {
        return [];
    }
    const group = svg.slice(start, svg.indexOf("  </g>", start));
    return [...group.matchAll(/<path d="([^"]*)"\/>/g)].map(match => strokeOf(match[1]!));
};

const spanOf = (strokes: Stroke[]): number[][] => [0, 1].map(axis => {
    const values = strokes.flatMap(stroke => stroke.points).map(point => point[axis]!);
    return [Math.min(...values) + 0, Math.max(...values) + 0];
});

const viewBoxOf = (svg: string): number[] => (/viewBox="([^"]*)"/.exec(svg)?.[1] ?? "").split(" ").map(Number);

describe("OCCT io writing drawings of views", () => {
    let occt: BitbybitOcctModule;
    let io: OCCTIO;
    let solid: OCCTSolid;

    const cube = (): TopoDS_Shape => solid.createBox({ width: 10, height: 10, length: 10, center: [5, 5, 5] });

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const occHelper = new OccHelper(occt);
        io = new OCCTIO(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
    });

    describe("saveShapeSvg", () => {
        it("should draw a box seen from above as the closed rectangle the eye sees, x along the frame's direction and up drawn up", () => {
            // Arrange
            const offBox = solid.createBox({ width: 10, height: 20, length: 30, center: [5, 15, 15] });

            // Act
            const svg = io.saveShapeSvg({ shape: offBox, frame: FROM_ABOVE });

            // Assert
            const visible = layerOf(svg, "visible");
            expect(visible).toHaveLength(1);
            expect(visible[0]!.commands).toEqual(["M", "L", "L", "L", "L", "Z"].slice(0, visible[0]!.commands.length));
            expect(visible[0]!.commands.at(-1)).toBe("Z");
            expect(spanOf(visible)).toEqual([[0, 10], [-25, -5]]);
            expect(layerOf(svg, "hidden")).toEqual([]);
        });

        it("should frame the drawing with a fortieth of its larger side on every side", () => {
            // Act
            const svg = io.saveShapeSvg({ shape: cube(), frame: FROM_ABOVE });

            // Assert
            expect(viewBoxOf(svg)).toEqual([-0.25, -10.25, 10.5, 10.5]);
        });

        it("should draw an isometric cube with nine edges seen and three hidden ones dashed beneath them, each as long as a cube edge seen at that angle", () => {
            // Arrange
            const seenLength = 10 * Math.sqrt(2 / 3);

            // Act
            const svg = io.saveShapeSvg({ shape: cube(), frame: ISOMETRIC, drawHidden: true, precision: 0.01 });

            // Assert
            const visible = layerOf(svg, "visible");
            const hidden = layerOf(svg, "hidden");
            expect(visible.reduce((sum, stroke) => sum + stroke.straightCount, 0)).toBe(9);
            expect(hidden.reduce((sum, stroke) => sum + stroke.straightCount, 0)).toBe(3);
            expect(visible.reduce((sum, stroke) => sum + stroke.straightLength, 0)).toBeCloseTo(9 * seenLength, 5);
            expect(hidden.reduce((sum, stroke) => sum + stroke.straightLength, 0)).toBeCloseTo(3 * seenLength, 5);
            expect(svg.indexOf("<g id=\"layer-hidden\"")).toBeLessThan(svg.indexOf("<g id=\"layer-visible\""));
            expect(/<g id="layer-hidden"[^>]*>\s*<g stroke="#000000" stroke-dasharray="[\d.]+ [\d.]+">/.test(svg)).toBe(true);
        });

        it("should draw a circle seen face on exactly, as arcs of its own radius that close", () => {
            // Arrange
            const cylinder = solid.createCylinder({ radius: 2, height: 5, center: [0, 0, 0], direction: [0, 0, 1] });

            // Act
            const svg = io.saveShapeSvg({ shape: cylinder, frame: FROM_ABOVE, precision: 0.1 });

            // Assert
            const circle = layerOf(svg, "visible");
            expect(circle).toHaveLength(1);
            expect(circle[0]!.commands.filter(command => command.startsWith("r"))).toEqual(["r2 2", "r2 2", "r2 2", "r2 2"]);
            expect(circle[0]!.points.every(point => Math.abs(Math.hypot(point[0]!, point[1]!) - 2) < 1e-6)).toBe(true);
            expect(circle[0]!.commands.at(-1)).toBe("Z");
        });

        it("should state the drawing's true size in its unit", () => {
            // Act
            const svg = io.saveShapeSvg({ shape: cube(), frame: FROM_ABOVE, unit: Inputs.Base.unitOfLengthEnum.centimetre });

            // Assert
            expect(svg).toContain("width=\"10.5cm\" height=\"10.5cm\"");
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

    describe("saveShapeDxf", () => {
        it("should put the edges seen on the layer visible and the hidden ones on the layer hidden, in the HIDDEN line type", () => {
            // Act
            const dxf = io.saveShapeDxf({ shape: cube(), frame: ISOMETRIC, drawHidden: true, unit: Inputs.Base.unitOfLengthEnum.millimetre });

            // Assert
            expect(dxf).toContain("$ACADVER\n1\nAC1015\n");
            expect(dxf).toContain("$INSUNITS\n70\n4\n");
            expect(dxf).toMatch(/\n0\nLAYER\n(?:[^\n]*\n[^\n]*\n)*?2\nhidden\n70\n0\n62\n7\n6\nHIDDEN\n/);
            expect(dxf).toMatch(/\n8\nhidden\n6\nHIDDEN\n/);
            expect(dxf).toMatch(/\n8\nvisible\n62\n7\n/);
        });

        it("should keep a circle seen face on as a circle, and write R12 when asked", () => {
            // Arrange
            const cylinder = solid.createCylinder({ radius: 2, height: 5, center: [3, 4, 0], direction: [0, 0, 1] });

            // Act
            const dxf = io.saveShapeDxf({ shape: cylinder, frame: FROM_ABOVE });
            const r12 = io.saveShapeDxf({ shape: cylinder, frame: FROM_ABOVE, acadVersion: Inputs.OCCT.dxfAcadVersionEnum.AC1009 });

            // Assert
            expect(dxf).toMatch(/\n0\nCIRCLE\n(?:[^\n]*\n[^\n]*\n)*?10\n3\.?0*\n20\n4\.?0*\n30\n0\.0\n40\n2\.?0*\n/);
            expect(r12).toContain("$ACADVER\n1\nAC1009\n");
            expect(r12).not.toContain("AcDbEntity");
        });

        it("should refuse a unit in R12, which has no place for it", () => {
            // Act
            const act = (): unknown => io.saveShapeDxf({ shape: cube(), frame: FROM_ABOVE, unit: Inputs.Base.unitOfLengthEnum.millimetre, acadVersion: Inputs.OCCT.dxfAcadVersionEnum.AC1009 });

            // Assert
            expect(act).toThrow("an AC1009 (R12) file has no place for a drawing's unit");
        });
    });
});
