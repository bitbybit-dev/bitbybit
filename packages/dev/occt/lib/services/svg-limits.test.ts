import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { OccHelper } from "../occ-helper";
import { OCCTSVG } from "./svg";
import { OCCTPath } from "./path";
import * as Inputs from "../api/inputs";
import { DrawingFaceBuilder } from "./base/drawing-faces";
import { ledgerRun, namesOf } from "../__test__/kernel-ledger";

const LARGE_INPUT_TIMEOUT = 5_000;
const CALLS = 40;
const MOST_BYTES_PER_CALL = 16;
const NS = "xmlns=\"http://www.w3.org/2000/svg\"";
const AUTO = Inputs.OCCT.svgFaceStrategyEnum.auto;
const svgOf = (body: string, rootAttributes = ""): string => `<svg ${NS}${rootAttributes}>${body}</svg>`;
const doubled = (levels: number, leaf: string): string => {
    const groups = Array.from({ length: levels }, (_, k) => `<g id="l${k + 1}"><use href="#l${k}"/><use href="#l${k}" x="1"/></g>`);
    return svgOf(`<defs><g id="l0">${leaf}</g>${groups.join("")}</defs><use href="#l${levels}"/>`);
};
const LEFT_OUT_ONE = "1 subpath reaches a coordinate that is not a number, or is 1e+15 or more in size, once scaled and placed; it is left out.";

describe("OCCT svg import of large and malformed drawings", () => {
    let occt: BitbybitOcctModule;
    let och: OccHelper;
    let svg: OCCTSVG;
    let path: OCCTPath;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        och = new OccHelper(occt);
        svg = new OCCTSVG(occt, och);
        path = new OCCTPath(occt, och);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const edgesOf = (shape: TopoDS_Shape): number => {
        const edges = och.shapeGettersService.getEdges({ shape });
        edges.forEach((edge) => edge.delete());
        return edges.length;
    };
    const deleteAll = (result: Inputs.OCCT.SVGResult<TopoDS_Shape> | undefined): void => {
        result?.shapes.forEach((s) => s.shape.delete());
    };

    describe("coordinates past what the kernel builds", () => {
        it.each([
            ["path data of 1e200", "<path d=\"M0 0L1e200 1e200L0 1e200z\"/>"],
            ["a scale transform that overflows", "<g transform=\"scale(1e200)\"><path d=\"M0 0L1e200 1 0 1z\"/></g>"],
            ["matrices whose product is not a number", "<g transform=\"matrix(1e308 0 0 1e308 0 0) matrix(10 0 0 10 0 0) matrix(0 0 0 0 0 0)\"><path d=\"M0 0L1 1 0 1z\"/></g>"],
            ["a circle of radius 1e300", "<circle r=\"1e300\"/>"],
            ["a rectangle and corner radius of 1e308", "<rect width=\"1e308\" height=\"1e308\" rx=\"1e308\"/>"],
            ["a path at 1e15", "<path d=\"M0 0L1e15 0L1e15 1z\"/>"],
        ])("should leave out %s with a warning and build the rest", (_name, body) => {
            // Act
            const run = ledgerRun(occt, () => svg.loadSVGStructured({ svg: svgOf(`${body}<rect x="5" width="10" height="10"/>`), faceStrategy: AUTO }));

            // Assert
            expect(run.thrown).toBeUndefined();
            expect(run.result!.shapes.map((s) => [s.elementType, s.isFace])).toEqual([["rect", true]]);
            expect(run.result!.warnings).toStrictEqual([LEFT_OUT_ONE]);
            expect(namesOf(run.leaked)).toEqual([]);
            deleteAll(run.result);
        });

        it("should leave out what a scale of 1e300 places past the kernel", () => {
            // Act
            const run = ledgerRun(occt, () => svg.loadSVGStructured({ svg: svgOf("<path d=\"M0 0L1 1\"/><path d=\"M0 0L0 1e-290\"/>"), scale: 1e300 }));

            // Assert
            expect(run.thrown).toBeUndefined();
            expect(run.result!.shapes).toHaveLength(1);
            expect(run.result!.warnings).toStrictEqual([LEFT_OUT_ONE]);
            deleteAll(run.result);
        });

        it("should build a drawing a trillion units across", () => {
            // Act
            const res = svg.loadSVGStructured({ svg: svgOf("<path d=\"M0 0L1e12 0L1e12 1e12z\"/>"), faceStrategy: AUTO });

            // Assert
            expect(res.warnings).toStrictEqual([]);
            expect(och.facesService.getFaceArea({ shape: res.shapes[0]!.shape })).toBeCloseTo(5e23, -18);
            deleteAll(res);
        });

        it.each([
            ["an arc of radius 1e300", "<path d=\"M0 0A1e300 1e300 0 0 1 1 0z\"/>", {}],
            ["an arc of radius 1e-300", "<path d=\"M0 0A1e-300 1e-300 0 0 1 1 0z\"/>", {}],
            ["an arc turned by 1e300 degrees", "<path d=\"M0 0A1 2 1e300 1 1 1 0z\"/>", {}],
            ["a circle of radius 1e-300", "<circle r=\"1e-300\"/>", {}],
            ["a view box of 1e-320 on a page of 1e300", "<path d=\"M0 0L1 1 0 1z\"/>", { root: " viewBox=\"0 0 1e-320 1e-320\" width=\"1e300\" height=\"1e300\"", unit: Inputs.Base.unitOfLengthEnum.millimetre }],
            ["a view box of 1e300 on a page of 1e-300", "<path d=\"M0 0L1 1 0 1z\"/>", { root: " viewBox=\"0 0 1e300 1e300\" width=\"1e-300\" height=\"1e-300\"", unit: Inputs.Base.unitOfLengthEnum.millimetre }],
        ])("should build or leave out %s without an error", (_name, body, options: { root?: string; unit?: Inputs.Base.unitOfLengthEnum }) => {
            // Act
            const run = ledgerRun(occt, () => svg.loadSVGStructured({ svg: svgOf(body, options.root), faceStrategy: AUTO, ...(options.unit === undefined ? {} : { unit: options.unit }) }));

            // Assert
            expect(run.thrown).toBeUndefined();
            expect(run.result!.warnings.every((w) => w === LEFT_OUT_ONE || !w.includes("could not"))).toBe(true);
            expect(namesOf(run.leaked)).toEqual([]);
            deleteAll(run.result);
        });
    });

    describe("paths the kernel cannot build", () => {
        const failing = svgOf("<path d=\"M0 0L1e12 0a1e-5 1e-5 0 0 1 0 2e-5\"/>");
        const KNOTS_TOO_CLOSE = "The path could not be built: Standard_ConstructionError: BSpline curve: Knots interval values too close.";

        it("should refuse a path the kernel cannot build with an input error, freeing its C++ exception and everything it made", () => {
            // Arrange
            const freed = vi.spyOn(occt, "decrementExceptionRefcount");
            const load = (): ReturnType<typeof ledgerRun> => ledgerRun(occt, () => svg.loadSVG({ svg: failing }));
            load();
            const before = occt.HeapBytesInUse();

            // Act
            const runs = Array.from({ length: CALLS }, load);

            // Assert
            expect(runs[0]!.thrown).toEqual(new InputError(KNOTS_TOO_CLOSE, "svg"));
            expect(runs.every((run) => run.thrown instanceof InputError)).toBe(true);
            expect(runs.flatMap((run) => namesOf(run.leaked))).toEqual([]);
            expect(freed.mock.calls.length).toBeGreaterThan(CALLS);
            expect((occt.HeapBytesInUse() - before) / CALLS).toBeLessThan(MOST_BYTES_PER_CALL);
        });

        it("should name the subpaths when a generic path cannot be built", () => {
            // Act
            const run = ledgerRun(occt, () => path.shapeFromPath({
                subpaths: [{ start: [0, 0], closed: false, segments: [{ type: "line", to: [1e12, 0] }, { type: "arc", to: [1e12, 2e-5], center: [1e12, 1e-5], rx: 1e-5, ry: 1e-5, xAxisRotation: 0, startAngle: -Math.PI / 2, deltaAngle: Math.PI }] }],
            }));

            // Assert
            expect(run.thrown).toEqual(new InputError(KNOTS_TOO_CLOSE, "subpaths"));
            expect(namesOf(run.leaked)).toEqual([]);
        });
    });

    describe("options checked before anything is built", () => {
        const DRAWING = svgOf("<rect width=\"10\" height=\"10\"/>");

        it.each([
            ["alignment", 5],
            ["alignment", "nowhere"],
            ["faceStrategy", "weird"],
            ["unit", "parsec"],
            ["svg", 12345],
            ["scale", Number.NaN],
            ["scale", Number.POSITIVE_INFINITY],
            ["tolerance", Number.NaN],
            ["tolerance", Number.POSITIVE_INFINITY],
            ["tolerance", -1],
            ["tolerance", 1e300],
            ["direction", [0, 0, 0]],
            ["center", [Number.NaN, 0, 0]],
        ])("should refuse %s of %s with an input error naming it", (property, value) => {
            // Act
            const whole = ledgerRun(occt, () => svg.loadSVG({ svg: DRAWING, [property]: value }));
            const each = ledgerRun(occt, () => svg.loadSVGStructured({ svg: DRAWING, [property]: value }));

            // Assert
            expect(whole.thrown).toBeInstanceOf(InputError);
            expect((whole.thrown as InputError).property).toBe(property);
            expect(each.thrown).toEqual(whole.thrown);
            expect(whole.made + each.made).toBe(0);
        });

        it("should collapse a drawing at a scale of 0 and mirror it at a scale of -1", () => {
            // Act
            const collapsed = svg.loadSVGStructured({ svg: DRAWING, scale: 0 });
            const mirrored = svg.loadSVGStructured({ svg: DRAWING, scale: -1, keepOrigin: true });

            // Assert
            expect(collapsed.shapes).toHaveLength(0);
            expect(och.operationsService.boundingBoxOfShape({ shape: mirrored.shapes[0]!.shape }).min[0]).toBeCloseTo(-10, 6);
            deleteAll(mirrored);
        });
    });

    describe("work an import multiplies through <use>", () => {
        it("should build no more segments than a small file's budget however its <use> references multiply them", () => {
            // Arrange
            const drawing = doubled(10, `<path d="M0 0${" l1 0".repeat(1_000)}"/>`);

            // Act
            const res = svg.loadSVGStructured({ svg: drawing, joinSegments: false });

            // Assert
            expect(drawing.length).toBeLessThan(7_000);
            expect(res.shapes.reduce((sum, s) => sum + edgesOf(s.shape), 0)).toBeLessThanOrEqual(25_000);
            expect(res.warnings).toStrictEqual(["The SVG holds more than 25000 path segments once its <use> references are expanded, more than the importer builds from a file of its size; the rest is not imported."]);
            deleteAll(res);
        }, LARGE_INPUT_TIMEOUT);

        it("should hand every face build of one import the same budget, and each import its own", () => {
            // Arrange
            const build = vi.spyOn(DrawingFaceBuilder.prototype, "build");
            const drawing = doubled(2, "<rect width=\"1\" height=\"1\"/>");

            // Act
            svg.loadSVG({ svg: drawing, faceStrategy: AUTO }).delete();
            svg.loadSVG({ svg: drawing, faceStrategy: AUTO }).delete();

            // Assert
            const budgets = build.mock.calls.map((call) => call[3]);
            expect(budgets).toHaveLength(8);
            expect(new Set(budgets.slice(0, 4)).size).toBe(1);
            expect(new Set(budgets.slice(4)).size).toBe(1);
            expect(budgets[0]).not.toBe(budgets[4]);
        });

        it("should sample the outlines of filled elements within a budget and return the rest as their wires", () => {
            // Arrange
            const circles = Array.from({ length: 2_000 }, () => " A50 50 0 1 1 0.001 0 A50 50 0 1 1 0 0").join("");
            const drawing = svgOf(`<path d="M0 0${circles}z"/><rect x="200" width="10" height="10"/>`);

            // Act
            const res = svg.loadSVGStructured({ svg: drawing, faceStrategy: AUTO });

            // Assert
            expect(res.shapes.map((s) => s.isFace)).toEqual([false, false]);
            expect(res.warnings).toStrictEqual([`The filled elements of the SVG take more than ${4 * drawing.length} outline points to sort into faces, more than the importer samples from a file of its size; the rest are returned as their outline wires.`]);
            deleteAll(res);
        }, LARGE_INPUT_TIMEOUT);
    });
});
