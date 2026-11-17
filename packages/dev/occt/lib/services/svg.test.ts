import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { OCCTSVG } from "./svg";
import { OCCTPath } from "./path";
import * as Inputs from "../api/inputs";
import { InputError } from "@bitbybit-dev/base";
import { ledgerRun, namesOf } from "../__test__/kernel-ledger";

describe("OCCTSVG + OCCTPath integration", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let svg: OCCTSVG;
    let path: OCCTPath;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(occt);
        svg = new OCCTSVG(occt, occHelper);
        path = new OCCTPath(occt, occHelper);
    });

    const faceArea = (shape: TopoDS_Shape): number => occHelper.facesService.getFaceArea({ shape });
    const wireLength = (shape: TopoDS_Shape): number => occHelper.wiresService.getWireLength({ shape });
    const shapeType = (shape: TopoDS_Shape): string => occHelper.enumService.getShapeTypeEnum(shape);

    const squareSubpaths = (): Inputs.OCCT.PathSubpath[] => [{
        start: [0, 0],
        closed: true,
        segments: [
            { type: "line", to: [10, 0] },
            { type: "line", to: [10, 10] },
            { type: "line", to: [0, 10] },
        ],
    }];

    describe("generic shapeFromPath", () => {
        it("builds a closed square wire (length 40, type wire)", () => {
            const dto = new Inputs.OCCT.ShapeFromPathDto();
            dto.subpaths = squareSubpaths();
            const shape = path.shapeFromPath(dto)!;
            expect(shape.IsNull()).toBe(false);
            expect(shapeType(shape)).toBe(Inputs.OCCT.shapeTypeEnum.wire);
            expect(wireLength(shape)).toBeCloseTo(40, 4);
            shape.delete();
        });

        it("builds a square face (area 100) when makeFaces is set", () => {
            const dto = new Inputs.OCCT.ShapeFromPathDto();
            dto.subpaths = squareSubpaths();
            dto.makeFaces = true;
            const shape = path.shapeFromPath(dto)!;
            expect(shapeType(shape)).toBe(Inputs.OCCT.shapeTypeEnum.face);
            expect(faceArea(shape)).toBeCloseTo(100, 3);
            shape.delete();
        });

        it("scales coordinates (length doubles at scale 2)", () => {
            const dto = new Inputs.OCCT.ShapeFromPathDto();
            dto.subpaths = squareSubpaths();
            dto.scale = 2;
            const shape = path.shapeFromPath(dto)!;
            expect(wireLength(shape)).toBeCloseTo(80, 3);
            shape.delete();
        });

        it("leaves an open subpath open (no closing edge)", () => {
            const dto = new Inputs.OCCT.ShapeFromPathDto();
            dto.subpaths = [{ start: [0, 0], closed: false, segments: [{ type: "line", to: [10, 0] }, { type: "line", to: [10, 10] }] }];
            const shape = path.shapeFromPath(dto)!;
            expect(wireLength(shape)).toBeCloseTo(20, 4);
            shape.delete();
        });

        it("builds a circle face from arcs (area ~ pi r^2)", () => {
            const dto = new Inputs.OCCT.ShapeFromPathDto();
            dto.subpaths = [{
                start: [10, 0],
                closed: true,
                segments: [
                    { type: "arc", to: [-10, 0], center: [0, 0], rx: 10, ry: 10, xAxisRotation: 0, startAngle: 0, deltaAngle: Math.PI },
                    { type: "arc", to: [10, 0], center: [0, 0], rx: 10, ry: 10, xAxisRotation: 0, startAngle: Math.PI, deltaAngle: Math.PI },
                ],
            }];
            dto.makeFaces = true;
            const shape = path.shapeFromPath(dto)!;
            expect(faceArea(shape)).toBeCloseTo(Math.PI * 100, 0);
            shape.delete();
        });

        it("builds a wire from a quadratic bezier", () => {
            const dto = new Inputs.OCCT.ShapeFromPathDto();
            dto.subpaths = [{ start: [0, 0], closed: false, segments: [{ type: "quadratic", c: [5, 10], to: [10, 0] }] }];
            const shape = path.shapeFromPath(dto)!;
            expect(shape.IsNull()).toBe(false);
            expect(wireLength(shape)).toBeGreaterThan(10);
            shape.delete();
        });

        it("returns a compound for multiple disjoint subpaths (wire mode)", () => {
            const dto = new Inputs.OCCT.ShapeFromPathDto();
            dto.subpaths = [
                { start: [0, 0], closed: true, segments: [{ type: "line", to: [5, 0] }, { type: "line", to: [5, 5] }, { type: "line", to: [0, 5] }] },
                { start: [10, 10], closed: true, segments: [{ type: "line", to: [12, 10] }, { type: "line", to: [12, 12] }, { type: "line", to: [10, 12] }] },
            ];
            const shape = path.shapeFromPath(dto)!;
            expect(shapeType(shape)).toBe(Inputs.OCCT.shapeTypeEnum.compound);
            shape.delete();
        });
    });

    describe("shapeFromPath with defaults left to the DTOs", () => {
        it("should build the wire the spelled out DTO builds when the path leaves its own defaults out", () => {
            // Act
            const leftOut = path.shapeFromPath({ subpaths: squareSubpaths() })!;
            const spelled = path.shapeFromPath(Object.assign(new Inputs.OCCT.ShapeFromPathDto(), { subpaths: squareSubpaths() }))!;

            // Assert
            expect(shapeType(leftOut)).toBe(Inputs.OCCT.shapeTypeEnum.wire);
            expect(wireLength(leftOut)).toBeCloseTo(40, 4);
            expect(wireLength(leftOut)).toBe(wireLength(spelled));
            leftOut.delete();
            spelled.delete();
        });

        it("should build a circle face from arcs that leave their rotation and start angle to the segment's defaults", () => {
            // Act
            const shape = path.shapeFromPath({
                makeFaces: true,
                subpaths: [{
                    start: [10, 0],
                    closed: true,
                    segments: [
                        { type: "arc", to: [-10, 0], center: [0, 0], rx: 10, ry: 10, deltaAngle: Math.PI },
                        { type: "arc", to: [10, 0], center: [0, 0], rx: 10, ry: 10, xAxisRotation: undefined, startAngle: Math.PI, deltaAngle: Math.PI },
                    ],
                }],
            })!;

            // Assert
            expect(faceArea(shape)).toBeCloseTo(Math.PI * 100, 0);
            shape.delete();
        });
    });

    describe("loadSVGStructured", () => {
        it("builds a wire per element with metadata, by default (no faces)", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg viewBox="0 0 100 100">
                <rect x="0" y="0" width="10" height="10" fill="red" stroke="#111" stroke-width="2" opacity="0.5" id="r1" class="box"/>
                <circle cx="50" cy="50" r="5" fill="#00ff00"/>
            </svg>`;
            const res = svg.loadSVGStructured(dto);
            expect(res.viewBox).toEqual([0, 0, 100, 100]);
            expect(res.shapes).toHaveLength(2);
            const rect = res.shapes[0]!;
            expect(rect.elementType).toBe("rect");
            expect(rect.fill).toBe("red");
            expect(rect.stroke).toBe("#111");
            expect(rect.strokeWidth).toBe(2);
            expect(rect.opacity).toBe(0.5);
            expect(rect.id).toBe("r1");
            expect(rect.className).toBe("box");
            expect(rect.isFace).toBe(false);
            expect(rect.closed).toBe(true);
            expect(shapeType(rect.shape)).toBe(Inputs.OCCT.shapeTypeEnum.wire);
            expect(wireLength(rect.shape)).toBeCloseTo(40, 3);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("builds faces for filled closed shapes when makeFaces is set", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><rect x="0" y="0" width="20" height="10" fill="blue"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.nonzero;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0]!.isFace).toBe(true);
            expect(faceArea(res.shapes[0]!.shape)).toBeCloseTo(200, 3);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("builds a circle face (~pi r^2) when makeFaces is set", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><circle cx="0" cy="0" r="10" fill="black"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.nonzero;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0]!.isFace).toBe(true);
            expect(faceArea(res.shapes[0]!.shape)).toBeCloseTo(Math.PI * 100, 0);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("keeps fill:none closed shapes as wires even with makeFaces", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><rect x="0" y="0" width="10" height="10" fill="none" stroke="black"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.nonzero;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0]!.isFace).toBe(false);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("keeps an open polyline as a wire even with makeFaces", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><polyline points="0,0 10,0 10,10" fill="red"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.nonzero;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0]!.isFace).toBe(false);
            expect(res.shapes[0]!.closed).toBe(false);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("builds a polygon face when makeFaces is set", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><polygon points="0,0 10,0 10,10 0,10" fill="red"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.nonzero;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0]!.isFace).toBe(true);
            expect(faceArea(res.shapes[0]!.shape)).toBeCloseTo(100, 3);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("makes a face with a hole for an evenodd donut path (area 300)", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><path fill-rule="evenodd" fill="black" d="M0 0 H20 V20 H0 Z M5 5 H15 V15 H5 Z"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.evenOdd;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes).toHaveLength(1);
            expect(res.shapes[0]!.isFace).toBe(true);
            expect(faceArea(res.shapes[0]!.shape)).toBeCloseTo(300, 0);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("auto strategy honors the element's evenodd fill-rule (donut hole, area 300)", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><path fill-rule="evenodd" fill="black" d="M0 0 H20 V20 H0 Z M5 5 H15 V15 H5 Z"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.auto;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0]!.isFace).toBe(true);
            expect(faceArea(res.shapes[0]!.shape)).toBeCloseTo(300, 0);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("nonzero keeps same-wound nested subpaths solid (no hole, area 400)", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><path fill="black" d="M0 0 H20 V20 H0 Z M5 5 H15 V15 H5 Z"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.nonzero;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0]!.isFace).toBe(true);
            expect(faceArea(res.shapes[0]!.shape)).toBeCloseTo(400, 0);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("builds one face per disjoint region of a single element (two squares, area 200)", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><path fill="black" d="M0 0 H10 V10 H0 Z M20 0 H30 V10 H20 Z"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.nonzero;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0]!.isFace).toBe(true);
            expect(faceArea(res.shapes[0]!.shape)).toBeCloseTo(200, 0);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("treats depth-2 nesting as solid-in-hole (evenOdd: ring 300 + inner 4x4 = 316)", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><path fill-rule="evenodd" fill="black" d="M0 0 H20 V20 H0 Z M5 5 H15 V15 H5 Z M8 8 H12 V12 H8 Z"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.evenOdd;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0]!.isFace).toBe(true);
            expect(faceArea(res.shapes[0]!.shape)).toBeCloseTo(316, 0);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("perSubpath ignores holes and faces every closed subpath (area 400+100=500)", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><path fill="black" d="M0 0 H20 V20 H0 Z M5 5 H15 V15 H5 Z"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.perSubpath;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0]!.isFace).toBe(true);
            expect(faceArea(res.shapes[0]!.shape)).toBeCloseTo(500, 0);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("builds a hole even when the inner subpath is wound the same way as the outer (evenOdd, area 300)", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><path fill-rule="evenodd" fill="black" d="M0 0 H20 V20 H0 Z M5 5 H15 V15 H5 Z"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.evenOdd;
            const res = svg.loadSVGStructured(dto);
            expect(faceArea(res.shapes[0]!.shape)).toBeCloseTo(300, 0);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("builds a wire from a path mixing cubic, arc and line", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><path d="M0 0 C10 0 10 10 20 10 A5 5 0 0 1 30 10 L40 0"/></svg>`;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes).toHaveLength(1);
            expect(res.shapes[0]!.shape.IsNull()).toBe(false);
            expect(res.shapes[0]!.isFace).toBe(false);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("places a translated group's geometry at the transformed location", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.flipY = false;
            dto.svg = `<svg><g transform="translate(100 0)"><rect x="0" y="0" width="10" height="10"/></g></svg>`;
            const res = svg.loadSVGStructured(dto);
            expect(wireLength(res.shapes[0]!.shape)).toBeCloseTo(40, 3);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("skips invisible elements unless includeInvisible is set", () => {
            const svgText = `<svg><rect width="5" height="5" style="display:none"/><circle r="2"/></svg>`;
            const a = new Inputs.OCCT.LoadSVGDto(); a.svg = svgText;
            const b = new Inputs.OCCT.LoadSVGDto(); b.svg = svgText; b.includeInvisible = true;
            const resA = svg.loadSVGStructured(a);
            const resB = svg.loadSVGStructured(b);
            expect(resA.shapes).toHaveLength(1);
            expect(resB.shapes).toHaveLength(2);
            resA.shapes.forEach((sh) => sh.shape.delete());
            resB.shapes.forEach((sh) => sh.shape.delete());
        });

        it("warns that ribbons are not yet available in TS", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><path d="M0 0 L10 0" stroke="black" stroke-width="2"/></svg>`;
            dto.makeRibbons = true;
            const res = svg.loadSVGStructured(dto);
            expect(res.warnings.some((w) => w.toLowerCase().includes("ribbon"))).toBe(true);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("returns warnings and no shapes for a document without an svg root", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<html><body>nope</body></html>`;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes).toHaveLength(0);
            expect(res.warnings.length).toBeGreaterThan(0);
        });

        it("preserves element order in the result", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><rect width="1" height="1"/><circle r="1"/><line x1="0" y1="0" x2="1" y2="1"/></svg>`;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes.map((s) => s.elementType)).toEqual(["rect", "circle", "line"]);
            res.shapes.forEach((sh) => sh.shape.delete());
        });
    });

    describe("loadSVGStructured element alignment", () => {
        const fills = (text: string): (string | undefined)[] => {
            const res = svg.loadSVGStructured({ svg: text, faceStrategy: Inputs.OCCT.svgFaceStrategyEnum.nonzero });
            const found = res.shapes.map((s) => s.fill);
            res.shapes.forEach((s) => s.shape.delete());
            return found;
        };

        it("should keep styles with their shapes after a circle of radius 0", () => {
            // Act
            const found = fills("<svg><circle r=\"0\" fill=\"red\"/><rect width=\"10\" height=\"10\" fill=\"blue\"/><polyline points=\"0,0 50,0 50,50\" fill=\"green\"/></svg>");

            // Assert
            expect(found).toEqual(["blue", "green"]);
        });

        it("should keep styles with their shapes after a line of length 0", () => {
            // Act
            const res = svg.loadSVGStructured({ svg: "<svg><rect id=\"a\" width=\"10\" height=\"10\"/><line id=\"z\" x1=\"3\" y1=\"3\" x2=\"3\" y2=\"3\"/><rect id=\"b\" x=\"100\" width=\"20\" height=\"20\"/></svg>" });

            // Assert
            expect(res.shapes.map((s) => s.id)).toEqual(["a", "b"]);
            expect(res.shapes.map((s) => wireLength(s.shape))).toEqual([40, 80].map((l) => expect.closeTo(l, 9)));
            res.shapes.forEach((s) => s.shape.delete());
        });

        it("should keep styles with their shapes after a path that only marks a dot", () => {
            // Act
            const found = fills("<svg><path d=\"M5 5 h0\" stroke=\"black\" fill=\"black\"/><rect width=\"10\" height=\"10\" fill=\"blue\"/><circle cx=\"100\" r=\"5\" fill=\"green\"/></svg>");

            // Assert
            expect(found).toEqual(["blue", "green"]);
        });
    });

    describe("loadSVGStructured size and placement", () => {
        const bboxOf = (shape: TopoDS_Shape) => occHelper.operationsService.boundingBoxOfShape({ shape });
        const CORELDRAW = "<svg width=\"210mm\" height=\"297mm\" viewBox=\"0 0 21000 29700\"><rect width=\"10000\" height=\"5000\" fill=\"black\"/></svg>";

        it("should report the page size in millimetres and the millimetres a user unit stands for", () => {
            // Act
            const res = svg.loadSVGStructured({ svg: CORELDRAW });

            // Assert
            expect(res.documentWidth).toBeCloseTo(210, 9);
            expect(res.documentHeight).toBeCloseTo(297, 9);
            expect(res.millimetresPerUserUnit).toBeCloseTo(0.01, 12);
            res.shapes.forEach((s) => s.shape.delete());
        });

        it("should keep user units when no unit is asked for", () => {
            // Act
            const res = svg.loadSVGStructured({ svg: CORELDRAW, faceStrategy: Inputs.OCCT.svgFaceStrategyEnum.auto });

            // Assert
            expect(faceArea(res.shapes[0]!.shape)).toBeCloseTo(50000000, 0);
            res.shapes.forEach((s) => s.shape.delete());
        });

        it("should import at true size in the unit asked for", () => {
            // Act
            const mm = svg.loadSVGStructured({ svg: CORELDRAW, faceStrategy: Inputs.OCCT.svgFaceStrategyEnum.auto, unit: Inputs.Base.unitOfLengthEnum.millimetre });
            const cm = svg.loadSVGStructured({ svg: CORELDRAW, faceStrategy: Inputs.OCCT.svgFaceStrategyEnum.auto, unit: Inputs.Base.unitOfLengthEnum.centimetre });

            // Assert
            expect(faceArea(mm.shapes[0]!.shape)).toBeCloseTo(5000, 6);
            expect(faceArea(cm.shapes[0]!.shape)).toBeCloseTo(50, 8);
            mm.shapes.forEach((s) => s.shape.delete());
            cm.shapes.forEach((s) => s.shape.delete());
        });

        it("should scale a stroke width at true size into the unit", () => {
            // Act
            const res = svg.loadSVGStructured({ svg: "<svg width=\"100mm\" height=\"100mm\" viewBox=\"0 0 1000 1000\"><path d=\"M0 0 L10 0\" stroke-width=\"5\"/></svg>", unit: Inputs.Base.unitOfLengthEnum.millimetre });

            // Assert
            expect(res.shapes[0]!.strokeWidth).toBeCloseTo(0.5, 12);
            res.shapes.forEach((s) => s.shape.delete());
        });

        it("should place the drawing's own origin on the center when asked to keep it", () => {
            // Act
            const res = svg.loadSVGStructured({ svg: "<svg><rect x=\"100\" y=\"200\" width=\"40\" height=\"20\"/></svg>", keepOrigin: true, center: [1, 2, 3] });

            // Assert
            const b = bboxOf(res.shapes[0]!.shape);
            expect(b.min).toEqual([101, 2, -217].map((v) => expect.closeTo(v, 5)));
            expect(b.max).toEqual([141, 2, -197].map((v) => expect.closeTo(v, 5)));
            res.shapes.forEach((s) => s.shape.delete());
        });

        it("should place the page's top left corner on the center when keeping the origin at true size", () => {
            // Act
            const shape = svg.loadSVG({ svg: "<svg width=\"100mm\" height=\"50mm\" viewBox=\"10 10 100 50\"><rect x=\"10\" y=\"10\" width=\"10\" height=\"10\"/></svg>", keepOrigin: true, unit: Inputs.Base.unitOfLengthEnum.millimetre });

            // Assert
            const b = bboxOf(shape);
            expect(b.min).toEqual([0, 0, -10].map((v) => expect.closeTo(v, 5)));
            expect(b.max).toEqual([10, 0, 0].map((v) => expect.closeTo(v, 5)));
            shape.delete();
        });
    });

    describe("loadSVGStructured arcs under transforms", () => {
        const onEllipseUnder = (transform: [number, number, number, number, number, number]): number => {
            const [a, b, c, d, e, f] = transform;
            const res = svg.loadSVGStructured({
                svg: `<svg><ellipse cx="3" cy="4" rx="10" ry="5" transform="matrix(${transform.join(" ")})"/></svg>`,
                flipY: false,
                keepOrigin: true,
            });
            const points = occHelper.wiresService.divideWireByParamsToPoints({ shape: res.shapes[0]!.shape, nrOfDivisions: 24, removeStartPoint: false, removeEndPoint: false });
            res.shapes.forEach((s) => s.shape.delete());
            const det = a * d - b * c;
            return Math.max(...points.map(([x, , z]) => {
                const px = x - e;
                const py = z - f;
                const u = (d * px - c * py) / det;
                const v = (-b * px + a * py) / det;
                return Math.abs(((u - 3) / 10) ** 2 + ((v - 4) / 5) ** 2 - 1);
            }));
        };

        it("should build a rotated ellipse on the analytically rotated ellipse", () => {
            // Act
            const deviation = onEllipseUnder([Math.cos(Math.PI / 6), Math.sin(Math.PI / 6), -Math.sin(Math.PI / 6), Math.cos(Math.PI / 6), 7, -2]);

            // Assert
            expect(deviation).toBeLessThan(1e-7);
        });

        it("should build a skewed ellipse on the analytically skewed ellipse", () => {
            // Act
            const deviation = onEllipseUnder([1, 0, Math.tan(Math.PI / 6), 1, 0, 0]);

            // Assert
            expect(deviation).toBeLessThan(1e-7);
        });

        it("should build an ellipse under a general matrix on its analytic image", () => {
            // Act
            const deviation = onEllipseUnder([1, 0.5, 0.2, 1, 3, 2]);

            // Assert
            expect(deviation).toBeLessThan(1e-7);
        });

        it("should build an ellipse under a mirroring matrix on its analytic image", () => {
            // Act
            const deviation = onEllipseUnder([-0.3, 1.1, 0.9, 0.4, 3, 2]);

            // Assert
            expect(deviation).toBeLessThan(1e-7);
        });
    });

    describe("placement checked before anything is built", () => {
        const DRAWING = "<svg><rect width=\"10\" height=\"10\" fill=\"red\"/><circle cx=\"50\" r=\"5\" fill=\"blue\"/></svg>";

        it("should refuse a direction of [0, 0, 0] and keep nothing it built", () => {
            // Act
            const whole = ledgerRun(occt, () => svg.loadSVG({ svg: DRAWING, faceStrategy: Inputs.OCCT.svgFaceStrategyEnum.auto, direction: [0, 0, 0] }));
            const each = ledgerRun(occt, () => svg.loadSVGStructured({ svg: DRAWING, keepOrigin: true, direction: [0, 0, 0] }));

            // Assert
            expect(whole.thrown).toEqual(new InputError("`direction` is [0, 0, 0], which points nowhere.", "direction"));
            expect(each.thrown).toEqual(new InputError("`direction` is [0, 0, 0], which points nowhere.", "direction"));
            expect(namesOf(whole.leaked)).toEqual([]);
            expect(namesOf(each.leaked)).toEqual([]);
            expect(whole.made + each.made).toBe(0);
        });

        it("should refuse a center that is not a point and keep nothing it built", () => {
            // Act
            const whole = ledgerRun(occt, () => svg.loadSVG({ svg: DRAWING, center: [0, Number.NaN, 0] }));
            const each = ledgerRun(occt, () => svg.loadSVGStructured({ svg: DRAWING, faceStrategy: Inputs.OCCT.svgFaceStrategyEnum.auto, center: [Number.POSITIVE_INFINITY, 0, 0] }));

            // Assert
            expect(whole.thrown).toEqual(new InputError("`center` is not a point: it needs three finite numbers.", "center"));
            expect(each.thrown).toEqual(new InputError("`center` is not a point: it needs three finite numbers.", "center"));
            expect(namesOf(whole.leaked)).toEqual([]);
            expect(namesOf(each.leaked)).toEqual([]);
            expect(whole.made + each.made).toBe(0);
        });
    });

    describe("drawings of many elements", () => {
        const placedTimes = (fan: number): string => `<svg><defs><line id="r" x2="1" y2="1"/><g id="g">${"<use href=\"#r\" x=\"2\"/>".repeat(fan)}</g></defs>${"<use href=\"#g\" y=\"2\"/>".repeat(fan)}</svg>`;

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("should build no more than 20000 elements of a drawing that holds more, and say so", () => {
            // Act
            const res = svg.loadSVGStructured({ svg: placedTimes(150) });

            // Assert
            expect(res.shapes).toHaveLength(20_000);
            expect(res.warnings).toStrictEqual(["The SVG draws more than 20000 elements; the first 20000 are imported and the rest are left out."]);
            res.shapes.forEach((s) => s.shape.delete());
        });

        it("should place a drawing with as many kernel transforms however many elements it holds", () => {
            // Arrange
            const transforms = occHelper.transformsService;
            const spies = [vi.spyOn(transforms, "rotate"), vi.spyOn(transforms, "translate"), vi.spyOn(transforms, "alignAndTranslate"), vi.spyOn(transforms, "align")];
            const callsFor = (load: () => void): number => {
                spies.forEach((spy) => spy.mockClear());
                load();
                return spies.reduce((sum, spy) => sum + spy.mock.calls.length, 0);
            };

            // Act
            const one = callsFor(() => svg.loadSVGStructured({ svg: placedTimes(1) }).shapes.forEach((s) => s.shape.delete()));
            const many = callsFor(() => svg.loadSVGStructured({ svg: placedTimes(20) }).shapes.forEach((s) => s.shape.delete()));
            const whole = callsFor(() => svg.loadSVG({ svg: placedTimes(20), keepOrigin: true }).delete());

            // Assert
            expect(many).toBe(one);
            expect(whole).toBeLessThan(one);
        });

        it("should give each element its own placed shape, in order, when the drawing is placed as a whole", () => {
            // Act
            const res = svg.loadSVGStructured({ svg: "<svg><rect id=\"a\" width=\"10\" height=\"10\" fill=\"none\"/><path id=\"b\" d=\"M100 0 h20 v20 z\" fill=\"blue\"/><circle id=\"c\" cx=\"300\" r=\"5\" fill=\"none\"/></svg>", faceStrategy: Inputs.OCCT.svgFaceStrategyEnum.auto, alignment: Inputs.Base.basicAlignmentEnum.bottomLeft });

            // Assert
            expect(res.shapes.map((s) => [s.id, shapeType(s.shape)])).toEqual([["a", "wire"], ["b", "face"], ["c", "wire"]]);
            expect(res.shapes.map((s) => occHelper.operationsService.boundingBoxOfShape({ shape: s.shape }).min[0])).toEqual([0, 100, 295].map((x) => expect.closeTo(x, 6)));
            res.shapes.forEach((s) => s.shape.delete());
        });
    });

    describe("loadSVG", () => {
        const bbox = (shape: TopoDS_Shape) => occHelper.operationsService.boundingBoxOfShape({ shape });

        it("returns a single compound for the whole drawing", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><rect width="10" height="10"/><circle cx="50" cy="50" r="5"/></svg>`;
            const shape = svg.loadSVG(dto);
            expect(shapeType(shape)).toBe(Inputs.OCCT.shapeTypeEnum.compound);
            shape.delete();
        });

        it("lays the drawing flat on the ground (zero thickness on Y)", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><rect width="40" height="20"/></svg>`;
            const shape = svg.loadSVG(dto);
            expect(bbox(shape).size[1]).toBeCloseTo(0, 6);
            shape.delete();
        });

        it("centers the drawing on the origin by default (midMid)", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><rect x="100" y="200" width="40" height="20"/></svg>`;
            const shape = svg.loadSVG(dto);
            const b = bbox(shape);
            expect(b.center[0]).toBeCloseTo(0, 5);
            expect(b.center[1]).toBeCloseTo(0, 5);
            expect(b.center[2]).toBeCloseTo(0, 5);
            shape.delete();
        });

        it("anchors the min corner at the origin for bottomLeft alignment", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><rect x="100" y="200" width="40" height="20"/></svg>`;
            dto.alignment = Inputs.Base.basicAlignmentEnum.bottomLeft;
            const shape = svg.loadSVG(dto);
            const b = bbox(shape);
            expect(b.min[0]).toBeCloseTo(0, 5);
            expect(b.min[2]).toBeCloseTo(0, 5);
            shape.delete();
        });

        it("moves the centered drawing to a custom center", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><rect width="40" height="20"/></svg>`;
            dto.center = [5, 7, 9];
            const shape = svg.loadSVG(dto);
            const b = bbox(shape);
            expect(b.center[0]).toBeCloseTo(5, 5);
            expect(b.center[1]).toBeCloseTo(7, 5);
            expect(b.center[2]).toBeCloseTo(9, 5);
            shape.delete();
        });

        it("returns an empty compound for a document without an svg root", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<html><body>nope</body></html>`;
            const shape = svg.loadSVG(dto);
            expect(shapeType(shape)).toBe(Inputs.OCCT.shapeTypeEnum.compound);
            shape.delete();
        });
    });
});
