import { describe, expect, it, vi, afterEach } from "vitest";
import { GeometryHelper, MathBitByBit, Vector } from "@bitbybit-dev/base";
import { DrawHelperCore, type SurfaceAnalysisMesh } from "./draw-helper-core";

class ColourReader extends DrawHelperCore {
    readColour(colour: number[] | string | undefined, fallback: string): string {
        return this.normalizeColor(colour, fallback);
    }
}

const reader = (): ColourReader =>
    new ColourReader(new Vector(new MathBitByBit(), new GeometryHelper()));

class AnalysisPainter extends DrawHelperCore {
    paint(mesh: SurfaceAnalysisMesh, fallback: string, min?: number, max?: number, components: 3 | 4 = 3): number[][] | undefined {
        return this.surfaceAnalysisColors(mesh, fallback, min, max, components);
    }
}

const painter = (): AnalysisPainter =>
    new AnalysisPainter(new Vector(new MathBitByBit(), new GeometryHelper()));

const face = (analysisValues?: number[], vertices = analysisValues?.length ?? 1): { vertexCoord: number[]; analysisValues?: number[] } =>
    analysisValues === undefined
        ? { vertexCoord: new Array<number>(vertices * 3).fill(0) }
        : { vertexCoord: new Array<number>(vertices * 3).fill(0), analysisValues };

const triples = (colors: number[]): number[][] => colors.reduce<number[][]>((all, value, index) => index % 3 === 0 ? [...all, [value]] : [...all.slice(0, -1), [...all[all.length - 1]!, value]], []);

const loose = <T>(value: unknown): T => value as T;

const BLUE = [0, 0, 1];
const CYAN = [0, 1, 1];
const GREEN = [0, 1, 0];
const YELLOW = [1, 1, 0];
const RED = [1, 0, 0];
const MAGENTA = [1, 0, 1];

describe("DrawHelperCore colour normalization", () => {

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should read a normalized triple as the hex the engines take", () => {
        // Act
        const hex = reader().readColour([1, 0, 0], "#000000");

        // Assert
        expect(hex).toBe("#ff0000");
    });

    it("should fall back when the array is too short to be a colour", () => {
        // Arrange
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

        // Act
        const hex = reader().readColour([1, 0], "#123456");

        // Assert
        expect(hex).toBe("#123456");
        expect(warn).toHaveBeenCalledOnce();
    });

    it("should say so when handed byte values rather than normalized ones", () => {
        // Arrange
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

        // Act
        const hex = reader().readColour([255, 128, 0], "#000000");

        // Assert
        expect(warn.mock.calls[0]![0]).toContain("normalized to 0-1");
        expect(hex).toBe("#ffff00");
    });

    it("should clamp rather than emit a hex string of the wrong length", () => {
        // Arrange
        vi.spyOn(console, "warn").mockImplementation(() => undefined);

        // Act
        const tooHigh = reader().readColour([2, 1, 1], "#000000");
        const belowZero = reader().readColour([-1, 0, 0], "#000000");

        // Assert
        expect(tooHigh).toBe("#ffffff");
        expect(belowZero).toBe("#000000");
        expect(tooHigh).toHaveLength(7);
        expect(belowZero).toHaveLength(7);
    });

    it("should take a hex string unchanged", () => {
        // Act & Assert
        expect(reader().readColour("#00ff00", "#000000")).toBe("#00ff00");
    });
});

describe("DrawHelperCore surface analysis colors", () => {

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should color the lowest value blue, the highest red, and cyan, green and yellow evenly between", () => {
        // Act
        const colors = painter().paint({ faceList: [face([0, 1, 2, 3, 4])] }, "#ff00ff");

        // Assert
        expect(triples(colors![0]!)).toEqual([BLUE, CYAN, GREEN, YELLOW, RED]);
    });

    it("should give a value between two stops its color in linear light", () => {
        // Arrange
        const halfway = Math.pow((0.5 + 0.055) / 1.055, 2.4);

        // Act
        const colors = painter().paint({ faceList: [face([0, 0.5, 4])] }, "#ff00ff");

        // Assert
        expect(colors![0]!.slice(3, 6).map(channel => Number(channel.toFixed(12)))).toEqual([0, Number(halfway.toFixed(12)), 1]);
    });

    it("should clamp values past the range it is given, infinite ones included", () => {
        // Act
        const colors = painter().paint({ faceList: [face([-5, 15, Infinity, -Infinity, 5])] }, "#ff00ff", 0, 10);

        // Assert
        expect(triples(colors![0]!)).toEqual([BLUE, RED, RED, BLUE, GREEN]);
    });

    it("should keep the fallback color for NaN, for a value that is not a number and for a face without values", () => {
        // Act
        const colors = painter().paint({ faceList: [face([0, NaN, 4, loose<number>(null)]), face(undefined, 2)] }, "#ff00ff");

        // Assert
        expect(colors!.map(triples)).toEqual([[BLUE, MAGENTA, RED, MAGENTA], [MAGENTA, MAGENTA]]);
    });

    it("should take the lowest and highest finite values of every face when no range is given", () => {
        // Act
        const colors = painter().paint({ faceList: [face([2, NaN]), face([6, Infinity, 4])] }, "#ff00ff");

        // Assert
        expect(colors!.map(triples)).toEqual([[BLUE, MAGENTA], [RED, RED, GREEN]]);
    });

    it("should fill in only the end of the range that is left out", () => {
        // Act
        const colors = painter().paint({ faceList: [face([0, 5, 10])] }, "#ff00ff", undefined, 20);

        // Assert
        expect(triples(colors![0]!)).toEqual([BLUE, CYAN, GREEN]);
    });

    it("should color values that are all the same green, and any other value by the side it lies on", () => {
        // Act
        const same = painter().paint({ faceList: [face([3, 3, 3])] }, "#ff00ff");
        const around = painter().paint({ faceList: [face([1, 2, 3])] }, "#ff00ff", 2, 2);

        // Assert
        expect(triples(same![0]!)).toEqual([GREEN, GREEN, GREEN]);
        expect(triples(around![0]!)).toEqual([BLUE, GREEN, RED]);
    });

    it("should run the ramp backwards when the value drawn blue is above the one drawn red", () => {
        // Act
        const colors = painter().paint({ faceList: [face([10, 5, 0])] }, "#ff00ff", 10, 0);

        // Assert
        expect(triples(colors![0]!)).toEqual([BLUE, GREEN, RED]);
    });

    it("should color a mesh of infinite values only at the ends of the ramp", () => {
        // Act
        const colors = painter().paint({ faceList: [face([Infinity, -Infinity])] }, "#ff00ff");

        // Assert
        expect(triples(colors![0]!)).toEqual([RED, BLUE]);
    });

    it("should add an alpha of 1 to every vertex when asked for four numbers each", () => {
        // Act
        const colors = painter().paint({ faceList: [face([0, 4])] }, "#ff00ff", undefined, undefined, 4);

        // Assert
        expect(colors).toEqual([[0, 0, 1, 1, 1, 0, 0, 1]]);
    });

    it("should give each face as many colors as it has vertices, however many values it carries", () => {
        // Act
        const colors = painter().paint({ faceList: [face([0, 1], 3), face([0, 1, 2], 2)] }, "#ff00ff");

        // Assert
        expect(colors!.map(each => each.length)).toEqual([9, 6]);
        expect(triples(colors![0]!)[2]).toEqual(MAGENTA);
    });

    it("should give nothing when no face carries values, so the faces keep their plain color", () => {
        // Act
        const plain = painter().paint({ faceList: [face(undefined, 3)] }, "#ff00ff");
        const empty = painter().paint({}, "#ff00ff");

        // Assert
        expect(plain).toBeUndefined();
        expect(empty).toBeUndefined();
    });

    it("should fall back to the default face color when the fallback is not a hex color", () => {
        // Arrange
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

        // Act
        const colors = painter().paint({ faceList: [face([NaN])] }, "not a colour");

        // Assert
        expect(colors).toEqual([RED]);
        expect(warn).toHaveBeenCalledOnce();
    });

    it("should set the range of a list of meshes from the values of all of them", () => {
        // Arrange
        const options: { faceColour: string; analysisMin?: number; analysisMax?: number } = { faceColour: "#ff0000" };
        const meshes = [{ faceList: [face([3, NaN])] }, { faceList: [face([-2, Infinity])] }, {}];

        // Act
        const pooled = painter().withSurfaceAnalysisRange(options, meshes);

        // Assert
        expect(pooled).toEqual({ faceColour: "#ff0000", analysisMin: -2, analysisMax: 3 });
        expect(options).toEqual({ faceColour: "#ff0000" });
    });

    it("should keep the ends of the range that are given as finite numbers", () => {
        // Act
        const pooled = painter().withSurfaceAnalysisRange({ analysisMin: 0, analysisMax: NaN }, [{ faceList: [face([3, 7])] }]);

        // Assert
        expect(pooled).toEqual({ analysisMin: 0, analysisMax: 7 });
    });

    it("should hand the options back as they are when no mesh carries a finite value", () => {
        // Arrange
        const options = { analysisMax: 1 };

        // Act
        const pooled = painter().withSurfaceAnalysisRange(options, [{ faceList: [face([NaN]), face(undefined, 2)] }]);

        // Assert
        expect(pooled).toBe(options);
    });
});
