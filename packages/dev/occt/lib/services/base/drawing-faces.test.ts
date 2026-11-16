import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTSVG } from "../svg";
import * as Inputs from "../../api/inputs";

describe("SVG faces", () => {
    let occt: BitbybitOcctModule;
    let och: OccHelper;
    let svg: OCCTSVG;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        och = new OccHelper(occt);
        svg = new OCCTSVG(occt, och);
    });

    const load = (text: string, faceStrategy: Inputs.OCCT.svgFaceStrategyEnum, extra: Partial<Inputs.OCCT.LoadSVGDto> = {}): Inputs.OCCT.SVGResult<TopoDS_Shape> =>
        svg.loadSVGStructured({ svg: text, faceStrategy, ...extra });
    const facesOf = (shape: TopoDS_Shape): TopoDS_Shape[] => och.shapeGettersService.getFaces({ shape });
    const areaOf = (shape: TopoDS_Shape): number => {
        const faces = facesOf(shape);
        const area = faces.reduce((sum, f) => sum + och.facesService.getFaceArea({ shape: f }), 0);
        faces.forEach((f) => f.delete());
        return area;
    };
    const countOf = (shape: TopoDS_Shape, type: "faces" | "wires"): number => {
        const found = type === "faces" ? facesOf(shape) : och.shapeGettersService.getWires({ shape });
        found.forEach((s) => s.delete());
        return found.length;
    };
    const release = (result: Inputs.OCCT.SVGResult<TopoDS_Shape>): void => result.shapes.forEach((s) => s.shape.delete());
    const U_OUTER = "M0 0 H10 V20 H20 V0 H30 V30 H0 Z";
    const NZ = Inputs.OCCT.svgFaceStrategyEnum.nonzero;
    const EO = Inputs.OCCT.svgFaceStrategyEnum.evenOdd;
    const AUTO = Inputs.OCCT.svgFaceStrategyEnum.auto;
    const OVERLAPPING = "Subpaths of a filled SVG element overlap one another so much that nesting them would take too long; it is returned as its outline wires.";

    it("should cut a U-shaped hole from a U-shaped outline under even-odd", () => {
        // Act
        const result = load(`<svg><path fill-rule="evenodd" d="${U_OUTER} M3 3 H7 V23 H23 V3 H27 V27 H3 Z"/></svg>`, EO);

        // Assert
        expect(result.shapes[0]!.isFace).toBe(true);
        expect(areaOf(result.shapes[0]!.shape)).toBeCloseTo(444, 6);
        expect(countOf(result.shapes[0]!.shape, "faces")).toBe(1);
        release(result);
    });

    it("should cut a U-shaped hole wound the other way under nonzero", () => {
        // Act
        const result = load(`<svg><path d="${U_OUTER} M3 3 V27 H27 V3 H23 V23 H7 V3 Z"/></svg>`, NZ);

        // Assert
        expect(areaOf(result.shapes[0]!.shape)).toBeCloseTo(444, 6);
        release(result);
    });

    it("should cut a nonzero hole that sits under two filled levels", () => {
        // Act
        const result = load("<svg><path d=\"M0 0 H40 V40 H0 Z M5 5 H35 V35 H5 Z M10 10 V30 H30 V10 Z M15 15 V25 H25 V15 Z\"/></svg>", NZ);

        // Assert
        expect(areaOf(result.shapes[0]!.shape)).toBeCloseTo(1500, 6);
        expect(countOf(result.shapes[0]!.shape, "faces")).toBe(1);
        release(result);
    });

    it("should return a self-crossing outline as its wire with a warning rather than an invalid face", () => {
        // Act
        const result = load("<svg><path d=\"M50 0 L79 90 L2 35 L98 35 L21 90 Z\"/></svg>", NZ);

        // Assert
        expect(result.shapes[0]!.isFace).toBe(false);
        expect(och.enumService.getShapeTypeEnum(result.shapes[0]!.shape)).toBe(Inputs.OCCT.shapeTypeEnum.wire);
        expect(result.warnings).toStrictEqual(["A filled region of an SVG element could not become a valid face, often because its outline crosses itself; it is returned as its outline wires."]);
        release(result);
    });

    it("should build only valid faces", () => {
        // Act
        const result = load(`<svg><path fill-rule="evenodd" d="${U_OUTER} M3 3 H7 V23 H23 V3 H27 V27 H3 Z"/><circle r="5" transform="skewX(30)"/></svg>`, AUTO);

        // Assert
        expect(result.shapes.map((s) => occt.ShapeIsValid(s.shape))).toEqual([true, true]);
        release(result);
    });

    it("should warn when subpaths of one filled element cross one another", () => {
        // Act
        const result = load("<svg><path d=\"M0 0 H20 V20 H0 Z M15 5 H35 V15 H15 Z\"/></svg>", NZ);

        // Assert
        expect(result.warnings).toStrictEqual(["Subpaths of a filled element cross one another; its faces follow how the subpaths nest, which can differ from the SVG fill where they overlap."]);
        release(result);
    });

    it("should keep a filled element whose subpaths overlap too often to nest as its outline wires, with a warning", { timeout: 30000 }, () => {
        // Arrange
        const rings = Array.from({ length: 3000 }, (_, i) => `M${String(-i - 1)} ${String(-i - 1)} H${String(i + 1)} V${String(i + 1)} H${String(-i - 1)} Z`).join(" ");

        // Act
        const result = load(`<svg><path d="${rings}"/></svg>`, NZ);

        // Assert
        expect(result.warnings).toContain(OVERLAPPING);
        expect(result.shapes.map((s) => [countOf(s.shape, "faces"), countOf(s.shape, "wires")])).toEqual([[0, 3000]]);
        release(result);
    });

    it("should keep two long subpaths lying on one another as their outline wires, with a warning, without testing every pair of their edges", { timeout: 10000 }, () => {
        // Arrange
        const wavy = `M0 0 ${"c3 6 6 6 9 0 ".repeat(1000)}v-20 H0 z`;
        const started = performance.now();

        // Act
        const result = load(`<svg><path d="${wavy} ${wavy}"/></svg>`, NZ);

        // Assert
        expect(performance.now() - started).toBeLessThan(5000);
        expect(result.warnings).toStrictEqual([OVERLAPPING]);
        expect(result.shapes.map((s) => [countOf(s.shape, "faces"), countOf(s.shape, "wires")])).toEqual([[0, 2]]);
        release(result);
    });

    it("should keep a long outline holding thousands of small subpaths as its outline wires, with a warning, without walking the long outline for each of them", { timeout: 20000 }, () => {
        // Arrange
        const frame = `M0 0 ${"c0.075 0.15 0.15 0.15 0.225 0 ".repeat(4000)}v900 H0 z`;
        const holes = Array.from({ length: 3000 }, (_, k) => `M${100 + (k % 60) * 10} ${100 + Math.floor(k / 60) * 10} h5 v5 h-5 z`).join(" ");
        const started = performance.now();

        // Act
        const result = load(`<svg><path d="${frame} ${holes}"/></svg>`, NZ);

        // Assert
        expect(performance.now() - started).toBeLessThan(10000);
        expect(result.warnings).toStrictEqual([OVERLAPPING]);
        expect(result.shapes.map((s) => [countOf(s.shape, "faces"), countOf(s.shape, "wires")])).toEqual([[0, 3001]]);
        release(result);
    });

    it("should warn about a closed subpath that encloses no area and keep it as a wire", () => {
        // Act
        const result = load("<svg><path d=\"M0 0 L10 10 L10 0 L0 10 Z\"/></svg>", NZ);

        // Assert
        expect(result.shapes[0]!.isFace).toBe(false);
        expect(result.warnings[0]).toContain("encloses no area");
        release(result);
    });

    it("should face the closed subpaths of an element and keep its open ones as wires", () => {
        // Act
        const result = load("<svg><path d=\"M0 0 H10 V10 H0 Z M20 0 L30 0\" fill=\"black\"/></svg>", AUTO);

        // Assert
        const shape = result.shapes[0]!.shape;
        expect(result.shapes[0]!.isFace).toBe(true);
        expect(result.shapes[0]!.closed).toBe(false);
        expect(areaOf(shape)).toBeCloseTo(100, 6);
        expect(countOf(shape, "faces")).toBe(1);
        expect(countOf(shape, "wires")).toBe(2);
        release(result);
    });

    it("should count a subpath that returns to its start without a close command as closed", () => {
        // Act
        const result = load("<svg><path d=\"M0 0 L10 0 L10 10 L0 10 L0 0\"/></svg>", AUTO);

        // Assert
        expect(result.shapes[0]!.closed).toBe(true);
        expect(result.shapes[0]!.isFace).toBe(true);
        expect(areaOf(result.shapes[0]!.shape)).toBeCloseTo(100, 6);
        release(result);
    });

    it("should close a subpath that ends within the tolerance of its start, and only then", () => {
        // Arrange
        const text = "<svg><path d=\"M0 0 L10 0 L10 10 L0 10 L0 0.001\"/></svg>";

        // Act
        const loose = load(text, AUTO, { tolerance: 0.01 });
        const strict = load(text, AUTO);

        // Assert
        expect(loose.shapes[0]!.isFace).toBe(true);
        expect(areaOf(loose.shapes[0]!.shape)).toBeCloseTo(100, 6);
        expect(strict.shapes[0]!.isFace).toBe(false);
        expect(strict.shapes[0]!.closed).toBe(false);
        release(loose);
        release(strict);
    });

    it("should paint nothing where two subpaths lie on one another wound opposite ways under nonzero", () => {
        // Act
        const result = load("<svg><path d=\"M0 0 H10 V10 H0 Z M0 0 V10 H10 V0 Z M20 0 H30 V10 H20 Z\"/></svg>", NZ);

        // Assert
        expect(areaOf(result.shapes[0]!.shape)).toBeCloseTo(100, 6);
        expect(countOf(result.shapes[0]!.shape, "faces")).toBe(1);
        release(result);
    });

    it("should paint nothing where two subpaths lie on one another under even-odd", () => {
        // Act
        const result = load("<svg><path d=\"M0 0 H10 V10 H0 Z M0 0 H10 V10 H0 Z M20 0 H30 V10 H20 Z\"/></svg>", EO);

        // Assert
        expect(areaOf(result.shapes[0]!.shape)).toBeCloseTo(100, 6);
        expect(countOf(result.shapes[0]!.shape, "faces")).toBe(1);
        release(result);
    });

    it("should make one face of two subpaths lying on one another wound the same way under nonzero", () => {
        // Act
        const result = load("<svg><path d=\"M0 0 H10 V10 H0 Z M10 10 H0 V0 H10 Z\"/></svg>", NZ);

        // Assert
        expect(areaOf(result.shapes[0]!.shape)).toBeCloseTo(100, 6);
        expect(countOf(result.shapes[0]!.shape, "faces")).toBe(1);
        release(result);
    });

    it("should keep the exact edges of an outline closed within the tolerance as an outline closed with a command keeps them", () => {
        // Arrange
        const edgesOf = (d: string): number => {
            const result = load(`<svg><path d="${d}"/></svg>`, AUTO);
            const edges = och.shapeGettersService.getEdges({ shape: result.shapes[0]!.shape });
            edges.forEach((e) => e.delete());
            release(result);
            return edges.length;
        };

        // Act
        const counts = ["M0 0 L10 0 L10 10 L0 10 Z", "M0 0 L10 0 L10 10 L0 10 L0 0", "M0 0 L10 0 L10 10 L0 10 L0 1e-9"].map(edgesOf);

        // Assert
        expect(counts).toEqual([4, 4, 4]);
    });

    it("should keep the exact edges of a polygon and a polyline whose last point is their first", () => {
        // Act
        const result = load("<svg><polygon points=\"0,0 10,0 10,10 0,10 0,0\" fill=\"none\" stroke=\"#000\"/><polyline points=\"20,0 30,0 30,10 20,0\" fill=\"none\" stroke=\"#000\"/></svg>", AUTO);

        // Assert
        const counts = result.shapes.map((s) => {
            const edges = och.shapeGettersService.getEdges({ shape: s.shape });
            edges.forEach((e) => e.delete());
            return edges.length;
        });
        expect(counts).toEqual([4, 3]);
        expect(result.shapes.map((s) => s.closed)).toEqual([true, true]);
        release(result);
    });

    it("should make no faces of an element painted with no fill", () => {
        // Act
        const result = load("<svg><rect width=\"10\" height=\"10\" fill-opacity=\"0\" stroke=\"#000\"/><g opacity=\"0\"><rect width=\"10\" height=\"10\"/></g><rect width=\"10\" height=\"10\" fill=\"transparent\"/></svg>", AUTO);

        // Assert
        expect(result.shapes.map((s) => s.isFace)).toEqual([false, false, false]);
        release(result);
    });

    it("should face an element whose degenerate subpath the kernel drops", () => {
        // Act
        const result = load("<svg><path d=\"M0 0 H10 V10 H0 Z M50 50 h0 M20 0 H30 V10 H20 Z\"/></svg>", NZ);

        // Assert
        expect(result.shapes[0]!.isFace).toBe(true);
        expect(areaOf(result.shapes[0]!.shape)).toBeCloseTo(200, 6);
        release(result);
    });

    it("should face a path of several thousand subpaths in well under the time the pairwise kernel test took", () => {
        // Arrange
        const d = Array.from({ length: 3000 }, (_, k) => `M${(k % 60) * 10} ${Math.floor(k / 60) * 10} h5 v5 h-5 z`).join(" ");
        const started = performance.now();

        // Act
        const result = load(`<svg><path d="${d}"/></svg>`, AUTO);

        // Assert
        expect(performance.now() - started).toBeLessThan(5000);
        expect(countOf(result.shapes[0]!.shape, "faces")).toBe(3000);
        expect(areaOf(result.shapes[0]!.shape)).toBeCloseTo(75000, 3);
        release(result);
    });
});
