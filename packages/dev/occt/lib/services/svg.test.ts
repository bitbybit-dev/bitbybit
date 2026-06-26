import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { OCCTSVG } from "./svg";
import { OCCTPath } from "./path";
import * as Inputs from "../api/inputs";

describe("OCCTSVG + OCCTPath integration", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let svg: OCCTSVG;
    let path: OCCTPath;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
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
            const rect = res.shapes[0];
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
            expect(res.shapes[0].isFace).toBe(true);
            expect(faceArea(res.shapes[0].shape)).toBeCloseTo(200, 3);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("builds a circle face (~pi r^2) when makeFaces is set", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><circle cx="0" cy="0" r="10" fill="black"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.nonzero;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0].isFace).toBe(true);
            expect(faceArea(res.shapes[0].shape)).toBeCloseTo(Math.PI * 100, 0);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("keeps fill:none closed shapes as wires even with makeFaces", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><rect x="0" y="0" width="10" height="10" fill="none" stroke="black"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.nonzero;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0].isFace).toBe(false);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("keeps an open polyline as a wire even with makeFaces", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><polyline points="0,0 10,0 10,10" fill="red"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.nonzero;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0].isFace).toBe(false);
            expect(res.shapes[0].closed).toBe(false);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("builds a polygon face when makeFaces is set", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><polygon points="0,0 10,0 10,10 0,10" fill="red"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.nonzero;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0].isFace).toBe(true);
            expect(faceArea(res.shapes[0].shape)).toBeCloseTo(100, 3);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("makes a face with a hole for an evenodd donut path (area 300)", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><path fill-rule="evenodd" fill="black" d="M0 0 H20 V20 H0 Z M5 5 H15 V15 H5 Z"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.evenOdd;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes).toHaveLength(1);
            expect(res.shapes[0].isFace).toBe(true);
            expect(faceArea(res.shapes[0].shape)).toBeCloseTo(300, 0);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("auto strategy honors the element's evenodd fill-rule (donut hole, area 300)", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><path fill-rule="evenodd" fill="black" d="M0 0 H20 V20 H0 Z M5 5 H15 V15 H5 Z"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.auto;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0].isFace).toBe(true);
            expect(faceArea(res.shapes[0].shape)).toBeCloseTo(300, 0);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("nonzero keeps same-wound nested subpaths solid (no hole, area 400)", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><path fill="black" d="M0 0 H20 V20 H0 Z M5 5 H15 V15 H5 Z"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.nonzero;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0].isFace).toBe(true);
            expect(faceArea(res.shapes[0].shape)).toBeCloseTo(400, 0);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("builds one face per disjoint region of a single element (two squares, area 200)", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><path fill="black" d="M0 0 H10 V10 H0 Z M20 0 H30 V10 H20 Z"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.nonzero;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0].isFace).toBe(true);
            expect(faceArea(res.shapes[0].shape)).toBeCloseTo(200, 0);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("treats depth-2 nesting as solid-in-hole (evenOdd: ring 300 + inner 4x4 = 316)", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><path fill-rule="evenodd" fill="black" d="M0 0 H20 V20 H0 Z M5 5 H15 V15 H5 Z M8 8 H12 V12 H8 Z"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.evenOdd;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0].isFace).toBe(true);
            expect(faceArea(res.shapes[0].shape)).toBeCloseTo(316, 0);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("perSubpath ignores holes and faces every closed subpath (area 400+100=500)", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><path fill="black" d="M0 0 H20 V20 H0 Z M5 5 H15 V15 H5 Z"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.perSubpath;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes[0].isFace).toBe(true);
            expect(faceArea(res.shapes[0].shape)).toBeCloseTo(500, 0);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("builds a hole even when the inner subpath is wound the same way as the outer (evenOdd, area 300)", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><path fill-rule="evenodd" fill="black" d="M0 0 H20 V20 H0 Z M5 5 H15 V15 H5 Z"/></svg>`;
            dto.faceStrategy = Inputs.OCCT.svgFaceStrategyEnum.evenOdd;
            const res = svg.loadSVGStructured(dto);
            expect(faceArea(res.shapes[0].shape)).toBeCloseTo(300, 0);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("builds a wire from a path mixing cubic, arc and line", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.svg = `<svg><path d="M0 0 C10 0 10 10 20 10 A5 5 0 0 1 30 10 L40 0"/></svg>`;
            const res = svg.loadSVGStructured(dto);
            expect(res.shapes).toHaveLength(1);
            expect(res.shapes[0].shape.IsNull()).toBe(false);
            expect(res.shapes[0].isFace).toBe(false);
            res.shapes.forEach((sh) => sh.shape.delete());
        });

        it("places a translated group's geometry at the transformed location", () => {
            const dto = new Inputs.OCCT.LoadSVGDto();
            dto.flipY = false;
            dto.svg = `<svg><g transform="translate(100 0)"><rect x="0" y="0" width="10" height="10"/></g></svg>`;
            const res = svg.loadSVGStructured(dto);
            expect(wireLength(res.shapes[0].shape)).toBeCloseTo(40, 3);
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
