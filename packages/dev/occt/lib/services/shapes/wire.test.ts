import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, CurvePointResult, TopoDS_Compound, TopoDS_Edge, TopoDS_Shape, TopoDS_Wire, gp_Pnt } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTEdge } from "./edge";
import { OccHelper } from "../../occ-helper";
import { OCCTWire } from "./wire";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import * as Inputs from "../../api/inputs";
import { OCCTFace } from "./face";
import { OCCTShape } from "./shape";
import { OCCTBooleans } from "../booleans";
import { OCCTFillets } from "../fillets";

describe("OCCT wire unit tests", () => {
    let occt: BitbybitOcctModule;
    let wire: OCCTWire;
    let edge: OCCTEdge;
    let face: OCCTFace;
    let booleans: OCCTBooleans;
    let fillets: OCCTFillets;
    let shape: OCCTShape;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        edge = new OCCTEdge(occt, occHelper);
        wire = new OCCTWire(occt, occHelper);
        face = new OCCTFace(occt, occHelper);
        shape = new OCCTShape(occt, occHelper);
        booleans = new OCCTBooleans(occt, occHelper);
        fillets = new OCCTFillets(occt, occHelper);
    });

    const within = (expected: unknown): unknown => {
        if (Array.isArray(expected)) {
            return (expected as unknown[]).map(within);
        }
        return typeof expected === "number" ? expect.closeTo(expected, 6 - Math.log10(Math.max(1, Math.abs(expected)))) : expected;
    };

    it("should create a circle edge of the right radius and it will mach the length", async () => {
        const w = wire.createCircleWire({ radius: 3, center: [1, 0, 0], direction: [0, 1, 0] });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(18.84955592153876);
        w.delete();
    });

    it("should create a square wire", async () => {
        const w = wire.createSquareWire({ size: 4, center: [1, 0, 0], direction: [0, 1, 0] });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(16);
        w.delete();
    });

    it("should create an open bezier wire", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBeCloseTo(5.724195959771836, 11);
        w.delete();
    });

    it("should create a closed bezier wire", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: true });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBeCloseTo(5.336651961649212, 11);
        w.delete();
    });

    it("should create a bezier wire from points and weights", async () => {
        const w = wire.createBezierWeights({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], weights: [1, 0.1, 1], closed: false });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBeCloseTo(5.40171302347143, 11);
        w.delete();
    });

    it("should create bsplines", async () => {
        const bezierWires: Inputs.OCCT.BezierWiresDto = {
            bezierWires: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[], closed: false },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[], closed: true }
            ],
            returnCompound: false,
        };

        const wires = wire.createBezierWires(bezierWires) as TopoDS_Wire[];

        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([5.724195959771836, 6.228425136503153].map(length => expect.closeTo(length, 11)));
        wires.forEach(w => w.delete());
    });

    it("should return compound bsplines", async () => {
        const bezierWires: Inputs.OCCT.BezierWiresDto = {
            bezierWires: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[], closed: false },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[], closed: true }
            ],
            returnCompound: true,
        };

        const resCompound = wire.createBezierWires(bezierWires) as TopoDS_Compound;

        const wires = wire.getWires({ shape: resCompound });
        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([5.724195959771836, 6.228425136503153].map(length => expect.closeTo(length, 11)));
        wires.forEach(w => w.delete());
    });

    it("should interpolate points", async () => {
        const w = wire.interpolatePoints({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], periodic: false, tolerance: 1e-7 });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBeCloseTo(7.253889764838339, 11);
        w.delete();
    });

    it("should interpolate wires", async () => {
        const interpolations = {
            interpolations: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[], periodic: false, tolerance: 1e-7 },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[], periodic: true, tolerance: 1e-7 }
            ],
            returnCompound: false,
        };
        const wires = wire.interpolateWires(interpolations) as TopoDS_Wire[];

        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([7.253889764838339, 11.692896245003144].map(length => expect.closeTo(length, 11)));
        wires.forEach(w => w.delete());
    });

    it("should return compound when interpolating wires", async () => {
        const interpolations = {
            interpolations: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[], periodic: false, tolerance: 1e-7 },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[], periodic: true, tolerance: 1e-7 }
            ],
            returnCompound: true,
        };
        const resCompound = wire.interpolateWires(interpolations) as TopoDS_Compound;

        const wires = wire.getWires({ shape: resCompound });
        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([7.253889764838339, 11.692896245003144].map(length => expect.closeTo(length, 11)));
        wires.forEach(w => w.delete());
    });

    it("should interpolate points into periodic bspline", async () => {
        const w = wire.interpolatePoints({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], periodic: true, tolerance: 1e-7 });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBeCloseTo(13.783010662282262, 11);
        w.delete();
    });

    it("should create open bspline through points", async () => {
        const w = wire.createBSpline({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBeCloseTo(7.0645305827446485, 11);
        w.delete();
    });

    it("should create bsplines", async () => {
        const bsplines: Inputs.OCCT.BSplinesDto = {
            bSplines: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[], closed: false },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[], closed: true }
            ],
            returnCompound: false,
        };

        const wires = wire.createBSplines(bsplines) as TopoDS_Wire[];

        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([7.0645305827446485, 12.086304857932344].map(length => expect.closeTo(length, 11)));
        wires.forEach(w => w.delete());
    });

    it("should return compound when creating bsplines", async () => {
        const bsplines: Inputs.OCCT.BSplinesDto = {
            bSplines: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[], closed: false },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[], closed: true }
            ],
            returnCompound: true,
        };

        const resCompound = wire.createBSplines(bsplines) as TopoDS_Compound;

        const wires = wire.getWires({ shape: resCompound });
        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([7.0645305827446485, 12.086304857932344].map(length => expect.closeTo(length, 11)));
        wires.forEach(w => w.delete());
    });

    it("should create closed bspline through points", async () => {
        const w = wire.createBSpline({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: true });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBeCloseTo(14.253491884113998, 11);
        w.delete();
    });

    it("should create a polygon wire", async () => {
        const w = wire.createPolygonWire({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(11.99553079221423);
        w.delete();
    });

    it("should create polygons", async () => {
        const polygons: Inputs.OCCT.PolygonsDto = {
            polygons: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[] },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[] }
            ],
            returnCompound: false,
        };

        const wires = wire.createPolygons(polygons) as TopoDS_Wire[];

        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            11.99553079221423,
            10.39834563766817
        ]);
        wires.forEach(w => w.delete());
    });

    it("should return compound when creating polygons", async () => {
        const polygons: Inputs.OCCT.PolygonsDto = {
            polygons: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[] },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[] }
            ],
            returnCompound: true,
        };

        const resCompound = wire.createPolygons(polygons) as TopoDS_Compound;

        const wires = wire.getWires({ shape: resCompound });
        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            11.99553079221423,
            10.39834563766817
        ]);
        wires.forEach(w => w.delete());
    });

    it("should create a polyline wire", async () => {
        const w = wire.createPolylineWire({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(6.610365985079727);
        w.delete();
    });

    it("should create polylines", async () => {
        const polylines: Inputs.OCCT.PolylinesDto = {
            polylines: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[] },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[] }
            ],
            returnCompound: false,
        };

        const wires = wire.createPolylines(polylines) as TopoDS_Wire[];

        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            6.610365985079727,
            5.39834563766817
        ]);
        wires.forEach(w => w.delete());
    });

    it("should create a line wire", async () => {
        const w = wire.createLineWire({
            start: [0, 0, 0],
            end: [0, 1, 1]
        });
        const length = wire.getWireLength({ shape: w });
        expect(length).toEqual(1.4142135623730951);
        w.delete();
    });

    it("should create lines", async () => {
        const lines: Inputs.OCCT.LinesDto = {
            lines: [
                { start: [0, 0, 0], end: [0, 1, 1] },
                { start: [3, 3, 0], end: [0, 1, 1] },
                { start: [0, 2, 0], end: [0, 1, 1] },
            ],
            returnCompound: false,
        };

        const wires = wire.createLines(lines) as TopoDS_Wire[];

        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            1.4142135623730951,
            3.7416573867739413,
            1.4142135623730951,
        ]);
        wires.forEach(w => w.delete());
    });


    it("should create lines compound", async () => {
        const lines: Inputs.OCCT.LinesDto = {
            lines: [
                { start: [0, 0, 0], end: [0, 1, 1] },
                { start: [3, 3, 0], end: [0, 1, 1] },
                { start: [0, 2, 0], end: [0, 1, 1] },
            ],
            returnCompound: true,
        };

        const resCompound = wire.createLines(lines) as TopoDS_Compound;

        const wires = wire.getWires({ shape: resCompound });
        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            1.4142135623730951,
            3.7416573867739413,
            1.4142135623730951,
        ]);
        wires.forEach(w => w.delete());
    });

    it("should return compound when creating polylines", async () => {
        const polylines: Inputs.OCCT.PolylinesDto = {
            polylines: [
                { points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] as Inputs.Base.Point3[] },
                { points: [[0, 2, 0], [1, 2, 3], [0, 2, 5]] as Inputs.Base.Point3[] }
            ],
            returnCompound: true,
        };

        const resCompound = wire.createPolylines(polylines) as TopoDS_Compound;
        const wires = wire.getWires({ shape: resCompound });
        const lengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(lengths).toEqual([
            6.610365985079727,
            5.39834563766817
        ]);
        wires.forEach(w => w.delete());
    });

    it("should create L polygon wire and align outside", async () => {
        const inp = new Inputs.OCCT.LPolygonDto();
        inp.lengthFirst = 10;
        inp.lengthSecond = 6;
        inp.widthFirst = 3;
        inp.widthSecond = 5;
        const res = wire.createLPolygonWire(inp);
        const length = wire.getWireLength({ shape: res });
        const corners = edge.getCornerPointsOfEdgesForShape({ shape: res });
        expect(length).toBe(48);
        expect(corners).toEqual([[0, 0, 0], [10, 0, 0], [10, 0, -3], [-5, 0, -3], [-5, 0, 6], [0, 0, 6]]);
        res.delete();
    });

    it("should create L polygon wire and align outside if alignmend is undefined", async () => {
        const inp = new Inputs.OCCT.LPolygonDto();
        inp.lengthFirst = 10;
        inp.lengthSecond = 6;
        inp.widthFirst = 3;
        inp.widthSecond = 5;
        delete (inp as Partial<Inputs.OCCT.LPolygonDto>).align;
        const res = wire.createLPolygonWire(inp);
        const length = wire.getWireLength({ shape: res });
        const corners = edge.getCornerPointsOfEdgesForShape({ shape: res });
        expect(length).toBe(48);
        expect(corners).toEqual([[0, 0, 0], [10, 0, 0], [10, 0, -3], [-5, 0, -3], [-5, 0, 6], [0, 0, 6]]);
        res.delete();
    });

    it("should create L polygon wire and align inside", async () => {
        const inp = new Inputs.OCCT.LPolygonDto();
        inp.align = Inputs.OCCT.directionEnum.inside;
        inp.lengthFirst = 10;
        inp.lengthSecond = 6;
        inp.widthFirst = 3;
        inp.widthSecond = 5;
        const res = wire.createLPolygonWire(inp);
        const length = wire.getWireLength({ shape: res });
        const corners = edge.getCornerPointsOfEdgesForShape({ shape: res });
        expect(length).toBe(32);
        expect(corners).toEqual([[0, 0, 0], [10, 0, 0], [10, 0, 3], [5, 0, 3], [5, 0, 6], [0, 0, 6]]);
        res.delete();
    });

    it("should create L polygon wire and align middle", async () => {
        const inp = new Inputs.OCCT.LPolygonDto();
        inp.align = Inputs.OCCT.directionEnum.middle;
        inp.lengthFirst = 10;
        inp.lengthSecond = 6;
        inp.widthFirst = 3;
        inp.widthSecond = 5;
        const res = wire.createLPolygonWire(inp);
        const length = wire.getWireLength({ shape: res });
        const corners = edge.getCornerPointsOfEdgesForShape({ shape: res });
        expect(length).toBe(40);
        expect(corners).toEqual([[2.5, 0, 1.5], [2.5, 0, 6], [-2.5, 0, 6], [-2.5, 0, -1.5], [10, 0, -1.5], [10, 0, 1.5]]);
        res.delete();
    });

    it("should create L polygon wire, align middle and use center shift, rotation and different direction", async () => {
        const inp = new Inputs.OCCT.LPolygonDto();
        inp.align = Inputs.OCCT.directionEnum.middle;
        inp.lengthFirst = 10;
        inp.lengthSecond = 6;
        inp.widthFirst = 3;
        inp.widthSecond = 5;
        inp.center = [0, 1, 3];
        inp.rotation = 45;
        inp.direction = [1, 0, 0];
        const res = wire.createLPolygonWire(inp);
        const length = wire.getWireLength({ shape: res });
        const corners = edge.getCornerPointsOfEdgesForShape({ shape: res });
        expect(length).toBeCloseTo(40);
        expect(corners).toEqual(
            [
                [0, -1.8284271247461898, 2.292893218813453],
                [0, -5.010407640085654, 5.474873734152917],
                [0, -1.474873734152916, 9.010407640085655],
                [0, 3.82842712474619, 3.707106781186548],
                [0, -5.0104076400856545, -5.131727983645296],
                [0, -7.1317279836452965, -3.0104076400856536]
            ].map(point => point.map(value => expect.closeTo(value, 12)))
        );
        res.delete();
    });

    it("should create a heart wire", async () => {
        const inputs = new Inputs.OCCT.Heart2DDto();
        const w = wire.createHeartWire(inputs);
        const length = wire.getWireLength({ shape: w });
        const cornerPoints = edge.getCornerPointsOfEdgesForShape({ shape: w });
        expect(cornerPoints.length).toBe(2);
        expect(length).toBeCloseTo(6.490970890684744, 11);
        w.delete();
    });

    it("should create a star wire", async () => {
        const w = wire.createStarWire({ numRays: 9, outerRadius: 5, innerRadius: 2, center: [0, 0, 0], direction: [0, 0, 1], half: false, offsetOuterEdges: 0 });
        const length = wire.getWireLength({ shape: w });
        const cornerPoints = edge.getCornerPointsOfEdgesForShape({ shape: w });
        expect(cornerPoints.length).toBe(18);
        expect(length).toBe(57.50471126183759);
        w.delete();
    });

    it("should create a christmas tree wire with default values", async () => {
        const options = new Inputs.OCCT.ChristmasTreeDto();
        const w = wire.createChristmasTreeWire(options);
        const length = wire.getWireLength({ shape: w });
        const cornerPoints = edge.getCornerPointsOfEdgesForShape({ shape: w });
        expect(cornerPoints.length).toBe(24);
        expect(length).toBe(32.00472491530124);
        w.delete();
    });

    it("should create ellipse wire", async () => {
        const w = wire.createEllipseWire({ radiusMajor: 5, radiusMinor: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBeCloseTo(23.013112595664843, 11);
        w.delete();
    });

    it("should create rectangle wire", async () => {
        const w = wire.createRectangleWire({ width: 5, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(14);
        w.delete();
    });

    it("should create a parallelogram wire", async () => {
        const w = wire.createParallelogramWire({ width: 5, height: 2, center: [0, 0, 0], direction: [0, 1, 0], angle: 15, aroundCenter: true });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(14.141104721640332);
        w.delete();
    });

    it("should create a parallelogram wire of 0 angle", async () => {
        const w = wire.createParallelogramWire({ width: 5, height: 2, center: [0, 0, 0], direction: [0, 1, 0], angle: 0, aroundCenter: true });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(14);
        w.delete();
    });

    it("should create a parallelogram wire of 0 angle not aroudn the center", async () => {
        const w = wire.createParallelogramWire({ width: 5, height: 2, center: [0, 0, 0], direction: [0, 1, 0], angle: 0, aroundCenter: false });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(14);
        w.delete();
    });

    it("should get wires of a box", async () => {
        const b = occHelper.entitiesService.bRepPrimAPIMakeBox(3, 4, 5, [0, 0, 0]);
        const wires = wire.getWires({ shape: b });
        expect(wires.length).toBe(6);
        b.delete();
        wires.forEach(w => w.delete());
    });

    it("should get lengths of wires", async () => {
        const b = occHelper.entitiesService.bRepPrimAPIMakeBox(3, 4, 5, [0, 0, 0]);
        const wires = wire.getWires({ shape: b });
        const lengths = wire.getWiresLengths({ shapes: wires });
        expect(lengths).toEqual([18, 18, 14, 14, 16, 16]);
        b.delete();
        wires.forEach(w => w.delete());
    });

    it("should reverse wire", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const w2 = wire.reversedWire({ shape: w });
        const ptOnEnd = wire.pointOnWireAtParam({ shape: w2, param: 1 });
        expect(ptOnEnd).toEqual([0, 0, 0]);
        w.delete();
        w2.delete();
    });

    it("should reverse closed polygon wire and have same start point using reversedWireFromReversedEdges", async () => {
        const points = [[0, 0, 0], [10, 0, 0], [10, 0, 5], [0, 0, 5]] as Inputs.Base.Point3[];
        const w = wire.createPolygonWire({ points });

        const startPt = wire.startPointOnWire({ shape: w });
        const endPt = wire.endPointOnWire({ shape: w });

        expect(startPt[0]).toBeCloseTo(endPt[0], 5);
        expect(startPt[1]).toBeCloseTo(endPt[1], 5);
        expect(startPt[2]).toBeCloseTo(endPt[2], 5);

        const w2 = wire.reversedWireFromReversedEdges({ shape: w });

        const startPtRev = wire.startPointOnWire({ shape: w2 });

        expect(startPtRev[0]).toBeCloseTo(startPt[0], 5);
        expect(startPtRev[1]).toBeCloseTo(startPt[1], 5);
        expect(startPtRev[2]).toBeCloseTo(startPt[2], 5);

        w.delete();
        w2.delete();
    });

    it("should reverse closed polygon wire edges and have correct edge directions using reversedWireFromReversedEdges", async () => {
        const points = [[0, 0, 0], [10, 0, 0], [10, 0, 5], [0, 0, 5]] as Inputs.Base.Point3[];
        const w = wire.createPolygonWire({ points });

        const allEdges = edge.getEdgesAlongWire({ shape: w });
        const firstEdgeStart = edge.startPointOnEdge({ shape: allEdges[0]! });

        const w2 = wire.reversedWireFromReversedEdges({ shape: w });

        const allEdgesRev = edge.getEdgesAlongWire({ shape: w2 });
        const firstEdgeRevStart = edge.startPointOnEdge({ shape: allEdgesRev[0]! });

        expect(firstEdgeRevStart[0]).toBeCloseTo(firstEdgeStart[0], 5);
        expect(firstEdgeRevStart[1]).toBeCloseTo(firstEdgeStart[1], 5);
        expect(firstEdgeRevStart[2]).toBeCloseTo(firstEdgeStart[2], 5);

        allEdges.forEach(e => e.delete());
        allEdgesRev.forEach(e => e.delete());
        w.delete();
        w2.delete();
    });

    it("should reverse closed rectangle wire and maintain start point using reversedWireFromReversedEdges", async () => {
        const w = wire.createRectangleWire({ width: 10, length: 5, center: [5, 0, 2.5], direction: [0, 1, 0] });

        const startPt = wire.startPointOnWire({ shape: w });

        const w2 = wire.reversedWireFromReversedEdges({ shape: w });

        const startPtRev = wire.startPointOnWire({ shape: w2 });

        expect(startPtRev[0]).toBeCloseTo(startPt[0], 5);
        expect(startPtRev[1]).toBeCloseTo(startPt[1], 5);
        expect(startPtRev[2]).toBeCloseTo(startPt[2], 5);

        w.delete();
        w2.delete();
    });

    it("should get wire of a box at specific index", async () => {
        const b = occHelper.entitiesService.bRepPrimAPIMakeBox(3, 4, 5, [0, 0, 0]);
        const w = wire.getWire({ shape: b, index: 2 });
        const length = wire.getWireLength({ shape: w });
        expect(length).toEqual(14);
        b.delete();
        w.delete();
    });

    it("should get wire of a box at 0 index if index is undefined", async () => {
        const b = occHelper.entitiesService.bRepPrimAPIMakeBox(3, 4, 5, [0, 0, 0]);
        const w = wire.getWire({ shape: b, index: undefined });
        const length = wire.getWireLength({ shape: w });
        expect(length).toEqual(18);
        b.delete();
        w.delete();
    });

    it("should throw error if shape is undefined", async () => {
        expect(() => wire.getWire({ shape: undefined as unknown as TopoDS_Shape, index: 0 })).toThrow("Shape is not provided or is null");
    });

    it("should throw error if shape is of incorrect type", async () => {
        const b = edge.createCircleEdge({ radius: 5, center: [0, 0, 0], direction: [0, 0, 1] });
        expect(() => wire.getWire({ shape: b, index: 0 })).toThrow("Shape is of incorrect type");
        b.delete();
    });

    it("should throw error if innerWire not found", async () => {
        const rect = wire.createRectangleWire({ width: 10, length: 10, center: [0, 0, 0], direction: [0, 1, 0] });
        expect(() => wire.getWire({ shape: rect, index: 10 })).toThrow("Shape is of incorrect type");
    });

    it("should get start point on a wire", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const ptOnEnd = wire.startPointOnWire({ shape: w });
        expect(ptOnEnd).toEqual([0, 0, 0]);
        w.delete();
    });

    it("should get end point on a wire", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const ptOnEnd = wire.endPointOnWire({ shape: w });
        expect(ptOnEnd).toEqual([0, 2, 5]);
        w.delete();
    });

    it("should get derivatives of a wire on param", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const der = wire.derivativesOnWireAtParam({ shape: w, param: 0 });
        expect(der).toEqual([[2, 2, 0], [-4, 0, 10], [0, 0, 0]]);
        w.delete();
    });

    it("should get derivatives of a wire on length", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const der = wire.derivativesOnWireAtLength({ shape: w, length: 1 });
        expect(der).toEqual([
            [0.6943276223832977, 2, 3.2641809440417555],
            [-4, 0, 10],
            [0, 0, 0]
        ]);
        w.delete();
    });

    it("should get point on a wire on param", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const pt = wire.pointOnWireAtParam({ shape: w, param: 0.5 });
        expect(pt).toEqual([0.5, 1, 1.25]);
        w.delete();
    });

    it("should get point on a wire on length", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const pt = wire.pointOnWireAtLength({ shape: w, length: 0.5 });
        expect(pt).toEqual(within([0.2939162221922262, 0.3579972308349849, 0.16020252160689685]));
        w.delete();
    });

    it("should get tangent on a wire on param", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const t = wire.tangentOnWireAtParam({ shape: w, param: 0.5 });
        expect(t).toEqual([0, 2, 5]);
        w.delete();
    });

    it("should get tangent on a wire on length", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const t = wire.tangentOnWireAtLength({ shape: w, length: 0.5 });
        expect(t).toEqual([1.2840055383300302, 2, 1.7899861541749247]);
        w.delete();
    });

    it("should divide wire to points by params", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const pts = wire.divideWireByParamsToPoints({ shape: w, nrOfDivisions: 12, removeEndPoint: false, removeStartPoint: false });
        expect(pts.length).toEqual(13);
        expect(pts).toEqual(
            [
                [0, 0, 0],
                [0.15277777777777776, 0.16666666666666666, 0.03472222222222222],
                [0.2777777777777778, 0.3333333333333333, 0.13888888888888887],
                [0.375, 0.5, 0.3125],
                [0.4444444444444445, 0.6666666666666666, 0.5555555555555555],
                [0.48611111111111105, 0.8333333333333334, 0.8680555555555557],
                [0.5, 1, 1.25],
                [0.4861111111111111, 1.1666666666666667, 1.701388888888889],
                [0.4444444444444445, 1.3333333333333333, 2.222222222222222],
                [0.375, 1.5, 2.8125],
                [0.27777777777777773, 1.6666666666666667, 3.4722222222222228],
                [0.15277777777777785, 1.8333333333333333, 4.201388888888888],
                [0, 2, 5]
            ]
        );
        w.delete();
    });

    it("should get points on wire at equal length and include first and last", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [100, 100, 0], [0, 200, 500]], closed: false });
        const pts = wire.pointsOnWireAtEqualLength({ shape: w, length: 43, tryNext: false, includeFirst: true, includeLast: true });
        expect(pts.length).toEqual(15);
        expect(pts).toEqual([
                [0.0, 0.0, 0.0],
                [26.206800361546, 31.017104093183, 12.025759329092],
                [41.103775615798, 57.81890379755, 41.787820454379],
                [47.836379188025, 79.197976963887, 78.403994439655],
                [49.953440765825, 96.948468116676, 117.48756837713],
                [49.24368430408, 112.29890804844, 157.63805936089],
                [46.63057260094, 125.95930430139, 198.32182925111],
                [42.642047884369, 138.36131414754, 239.29816565792],
                [37.607256443273, 149.78502497082, 280.44442131888],
                [31.745581991265, 160.42254216554, 321.6924004357],
                [25.210990429379, 170.41166035625, 363.00167481718],
                [18.116012465679, 179.85485274462, 404.34710069734],
                [10.545618880541, 188.83060409505, 445.71246303627],
                [2.5657035998487, 197.40050964975, 487.08701512474],
                [0.0, 200.0, 500.0]
            ].map(point => point.map(value => expect.closeTo(value, 8))));
        w.delete();
    });

    it("should get points on wire at equal length and include and try next", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [100, 100, 0], [0, 200, 500]], closed: false });
        const pts = wire.pointsOnWireAtEqualLength({ shape: w, length: 43, tryNext: true, includeFirst: false, includeLast: false });
        expect(pts.length).toEqual(14);
        expect(pts).toEqual([
                [26.206800361546, 31.017104093183, 12.025759329092],
                [41.103775615798, 57.81890379755, 41.787820454379],
                [47.836379188025, 79.197976963887, 78.403994439655],
                [49.953440765825, 96.948468116676, 117.48756837713],
                [49.24368430408, 112.29890804844, 157.63805936089],
                [46.63057260094, 125.95930430139, 198.32182925111],
                [42.642047884369, 138.36131414754, 239.29816565792],
                [37.607256443273, 149.78502497082, 280.44442131888],
                [31.745581991265, 160.42254216554, 321.6924004357],
                [25.210990429379, 170.41166035625, 363.00167481718],
                [18.116012465679, 179.85485274462, 404.34710069734],
                [10.545618880541, 188.83060409505, 445.71246303627],
                [2.5657035998487, 197.40050964975, 487.08701512474],
                [-5.7714878340213, 205.61390801786, 528.46348962969]
            ].map(point => point.map(value => expect.closeTo(value, 8))));
        w.delete();
    });

    it("should ask for one step past the last point that fits when trying the next one, not two", () => {
        // Arrange
        const line = wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0]] });

        // Act
        const points = wire.pointsOnWireAtEqualLength({ shape: line, length: 3, tryNext: true, includeFirst: true, includeLast: false });

        // Assert
        expect(points).toEqual([[0, 0, 0], [3, 0, 0], [6, 0, 0], [9, 0, 0], [12, 0, 0]].map(point => point.map(value => expect.closeTo(value, 12))));
    });

    it("should refuse a spacing of 0, which would never move along the wire", () => {
        // Arrange
        const line = wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0]] });
        let refusal: unknown;

        // Act
        try {
            wire.pointsOnWireAtEqualLength({ shape: line, length: 0, tryNext: false, includeFirst: true, includeLast: false });
        } catch (failure) {
            refusal = failure;
        }

        // Assert
        expect(refusal).toMatchObject({ name: "InputError", property: "length", message: "`length` must be more than 0, or the points never move along the wire, and is 0." });
    });

    it("should get points on wire at equal length and include first point", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [100, 100, 0], [0, 200, 500]], closed: false });
        const pts = wire.pointsOnWireAtEqualLength({ shape: w, length: 13, tryNext: false, includeFirst: true, includeLast: false });
        expect(pts.length).toEqual(45);
        expect(pts).toEqual([
                [0.0, 0.0, 0.0],
                [8.9255374768257, 9.3639558198017, 1.09604585744],
                [17.094951671227, 18.876577576173, 4.4540647623661],
                [24.237676927882, 28.219329799565, 9.9541321792079],
                [30.241556482596, 37.137541382151, 17.239962248887],
                [35.150607687064, 45.503408706716, 25.882002549131],
                [39.093277595573, 53.295134291111, 35.504641738844],
                [42.217792922257, 60.548239385945, 45.826116159222],
                [44.65985061962, 67.319273629919, 56.648557525749],
                [46.532916308431, 73.667192737693, 67.835691073156],
                [47.92854778407, 79.645874050062, 79.293315664979],
                [48.91984346363, 85.301996486804, 90.955382557933],
                [49.565233521378, 90.675124894973, 102.77472843399],
                [49.911739029053, 95.79854856158, 114.71702383132],
                [49.997548089402, 100.7002728894, 126.756812],
                [49.853987109273, 105.40394098278, 138.87488468377],
                [49.507013293683, 109.92961939167, 151.05651524497],
                [48.978344414161, 114.29444357671, 163.29024790637],
                [48.28631830702, 118.51313962017, 175.56705328288],
                [47.446551764756, 122.59844346518, 187.87972925105],
                [46.472450132389, 126.56143771565, 200.22246895814],
                [45.375605121076, 130.41182296057, 212.59054459872],
                [44.16610826997, 134.15813733221, 224.9800726556],
                [42.852800203855, 137.80793513575, 237.38783732973],
                [41.443470583368, 141.36793303183, 249.81115612116],
                [39.945019848918, 144.84413038756, 262.2477763466],
                [38.363591100599, 148.24190895767, 274.69579464268],
                [36.704678437112, 151.56611593457, 287.15359374365],
                [34.973216587241, 154.82113353946, 299.61979238056],
                [33.173655559851, 158.0109376586, 312.09320524687],
                [31.310023207833, 161.1391475115, 324.57281075917],
                [29.385977973713, 164.20906793637, 337.05772490664],
                [27.404853606205, 167.22372556441, 349.54717989551],
                [25.369697269716, 170.18589990915, 362.04050659858],
                [23.283302184554, 173.09815020292, 374.53712004593],
                [21.148235714123, 175.96283865928, 387.03650736289],
                [18.966863641622, 178.7821507175, 399.5382176897],
                [16.741371241446, 181.55811272774, 412.04185371574],
                [14.473781641397, 184.29260745594, 424.54706453635],
                [12.16597188453, 186.98738772428, 437.05353959937],
                [9.8196870292531, 189.64408845066, 449.56100355351],
                [7.4365525695239, 192.26423730837, 462.06921184712],
                [5.01808541083, 194.84926419237, 474.57794695385],
                [2.5657035998487, 197.40050964975, 487.08701512474],
                [0.080734974786633, 199.91923240819, 499.59624358352]
            ].map(point => point.map(value => expect.closeTo(value, 8))));
        w.delete();
    });

    it("should get points on wire at lengths", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [100, 100, 0], [0, 200, 500]], closed: false });
        const pts = wire.pointsOnWireAtLengths({ shape: w, lengths: [0, 12, 33, 66, 88] });
        expect(pts.length).toEqual(5);
        expect(pts).toEqual(within(
            [
                [0, 0, 0],
                [8.261627213281036, 8.634390729641643, 0.9319087909015193],
                [21.079970747732684, 23.947348169485483, 7.168443554381996],
                [35.48631058836566, 46.122937326475686, 26.591566845275047],
                [41.561928462999006, 58.9194169053043, 43.39372110576323]
            ]
        ));
        w.delete();
    });

    it("should not get points on wire at empty lengths", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [100, 100, 0], [0, 200, 500]], closed: false });
        const pts = wire.pointsOnWireAtLengths({ shape: w, lengths: [] });
        expect(pts.length).toEqual(0);
        expect(pts).toEqual(
            []
        );
        w.delete();
    });

    it("should get points on wire at pattern of lengths and include first and last points", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [100, 100, 0], [0, 200, 500]], closed: false });
        const pts = wire.pointsOnWireAtPatternOfLengths({ shape: w, lengths: [10, 40, 70, 5], includeFirst: true, includeLast: true, tryNext: false });
        expect(pts.length).toEqual(20);
        expect(pts).toEqual(within(
            [
                [0, 0, 0],
                [6.920912132565033, 7.178571582381942, 0.6441486245422696],
                [29.39162221922262, 35.79972308349849, 16.020252160689683],
                [46.89443013500558, 75.07784172671067, 70.45852897926272],
                [47.443247626588004, 77.38694017426216, 74.8592313691854],
                [48.354188179430544, 81.85716769316623, 83.75744878433922],
                [49.98170039814621, 98.08690816457786, 120.26301941607916],
                [47.58480320429754, 121.97815640904605, 185.9833830118713],
                [47.23323351136921, 123.52346270696893, 190.72557298899926],
                [46.47245013928169, 126.5614376896971, 200.2224688760385],
                [42.747706290351644, 138.08488862960834, 238.34295584814177],
                [34.15085904617084, 156.30122725807877, 305.37592052976976],
                [33.45477782274016, 157.52429430642297, 310.17379120920697],
                [32.03414662600377, 159.94306194047186, 319.7722882861702],
                [26.00148157307996, 169.27989380320966, 358.1960305753243],
                [14.297662122514987, 184.50128741916896, 425.5090632416349],
                [13.413527209151667, 185.54118632664424, 430.3191477937315],
                [11.627874639508573, 187.60379599137406, 439.93980337966366],
                [4.267053787788835, 195.63780237145892, 478.4268714591752],
                [0, 200, 500]
            ]
        ));
        w.delete();
    });

    it.each<[string, number[]]>([
        ["no lengths", []],
        ["a single length of 0", [0]],
        ["lengths that move back as far as they move forward", [1, -1]],
        ["lengths that move back further than they move forward", [1, -2]],
    ])("should refuse a pattern of %s instead of looping forever", (_what, lengths) => {
        // Arrange
        const w = wire.createLineWire({ start: [0, 0, 0], end: [10, 0, 0] });

        // Act
        const place = (): Inputs.Base.Point3[] => wire.pointsOnWireAtPatternOfLengths({ shape: w, lengths });

        // Assert
        expect(place).toThrow("Lengths must add up to more than 0, or the points never move along the wire.");
        w.delete();
    });

    it("should place points along a pattern that moves back less than it moves forward", () => {
        // Arrange
        const w = wire.createLineWire({ start: [0, 0, 0], end: [10, 0, 0] });

        // Act
        const pts = wire.pointsOnWireAtPatternOfLengths({ shape: w, lengths: [3, -1] });

        // Assert
        expect(pts.map((pt) => pt[0])).toEqual(within([3, 2, 5, 4, 7, 6, 9, 8]));
        w.delete();
    });

    it("should get points on wire at pattern of lengths and exclude first and last points but try to find next point", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [100, 100, 0], [0, 200, 500]], closed: false });
        const pts = wire.pointsOnWireAtPatternOfLengths({ shape: w, lengths: [10, 40, 70, 5], includeFirst: false, includeLast: false, tryNext: true });
        expect(pts.length).toEqual(19);
        expect(pts).toEqual(within(
            [
                [6.920912132565033, 7.178571582381942, 0.6441486245422696],
                [29.39162221922262, 35.79972308349849, 16.020252160689683],
                [46.89443013500558, 75.07784172671067, 70.45852897926272],
                [47.443247626588004, 77.38694017426216, 74.8592313691854],
                [48.354188179430544, 81.85716769316623, 83.75744878433922],
                [49.98170039814621, 98.08690816457786, 120.26301941607916],
                [47.58480320429754, 121.97815640904605, 185.9833830118713],
                [47.23323351136921, 123.52346270696893, 190.72557298899926],
                [46.47245013928169, 126.5614376896971, 200.2224688760385],
                [42.747706290351644, 138.08488862960834, 238.34295584814177],
                [34.15085904617084, 156.30122725807877, 305.37592052976976],
                [33.45477782274016, 157.52429430642297, 310.17379120920697],
                [32.03414662600377, 159.94306194047186, 319.7722882861702],
                [26.00148157307996, 169.27989380320966, 358.1960305753243],
                [14.297662122514987, 184.50128741916896, 425.5090632416349],
                [13.413527209151667, 185.54118632664424, 430.3191477937315],
                [11.627874639508573, 187.60379599137406, 439.93980337966366],
                [4.267053787788835, 195.63780237145892, 478.4268714591752],
                [-9.357171096580775, 208.956111436285, 545.7832063321646]
            ]
        ));
        w.delete();
    });

    it("should divide wires to points by params", async () => {
        const w1 = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const w2 = wire.createBezier({ points: [[0, 1, 0], [1, 1, 2], [3, 2, 5]], closed: true });

        const pts = wire.divideWiresByParamsToPoints({ shapes: [w1, w2], nrOfDivisions: 12, removeEndPoint: false, removeStartPoint: false });
        expect(pts.length).toEqual(2);
        expect(pts[0]!.length).toEqual(13);
        expect(pts[1]!.length).toEqual(13);

        expect(pts).toEqual(within(
            [
                [[0, 0, 0], [0.15277777777777776, 0.16666666666666666, 0.03472222222222222], [0.2777777777777778, 0.3333333333333333, 0.13888888888888887], [0.375, 0.5, 0.3125], [0.4444444444444445, 0.6666666666666666, 0.5555555555555555], [0.48611111111111105, 0.8333333333333334, 0.8680555555555557], [0.5, 1, 1.25], [0.4861111111111111, 1.1666666666666667, 1.701388888888889], [0.4444444444444445, 1.3333333333333333, 2.222222222222222], [0.375, 1.5, 2.8125], [0.27777777777777773, 1.6666666666666667, 3.4722222222222228], [0.15277777777777785, 1.8333333333333333, 4.201388888888888], [0, 2, 5]],
                [[0, 1, 0], [0.2673611111111111, 1.0190972222222223, 0.515625], [0.5555555555555556, 1.0694444444444444, 1.0416666666666665], [0.84375, 1.140625, 1.546875], [1.1111111111111112, 1.2222222222222223, 2], [1.3368055555555556, 1.3038194444444444, 2.369791666666667], [1.5, 1.375, 2.625], [1.5798611111111114, 1.4253472222222223, 2.734375], [1.5555555555555556, 1.4444444444444444, 2.6666666666666665], [1.40625, 1.421875, 2.390625], [1.1111111111111112, 1.3472222222222223, 1.875], [0.6493055555555557, 1.2100694444444444, 1.0885416666666665], [0, 1, 0]]
            ]
        ));
        w1.delete();
        w2.delete();
    });

    it("should divide wires to points by equal distance, each point on its true arc length", async () => {
        const w1 = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const w2 = wire.createBezier({ points: [[0, 1, 0], [1, 1, 2], [3, 2, 5]], closed: true });

        const pts = wire.divideWiresByEqualDistanceToPoints({ shapes: [w1, w2], nrOfDivisions: 12, removeEndPoint: false, removeStartPoint: false });

        expect(pts).toEqual([
            [[0.0, 0.0, 0.0], [0.283822286539835, 0.342462604165869, 0.146600794065086], [0.431152270909511, 0.628926613483291, 0.494435856434452], [0.489263654466456, 0.853464369291667, 0.910501787063029], [0.499236764888507, 1.03907006812109, 1.34958325808146], [0.480111121027397, 1.19944362096895, 1.79833124985387], [0.441457155994631, 1.34217786019954, 2.25180176051228], [0.388695588934054, 1.47181439373115, 2.70779701199274], [0.325194810998958, 1.59127859592758, 3.16520946232154], [0.253197853296764, 1.70256977831848, 3.62342981255428], [0.174279067241315, 1.80711948651818, 4.08210104819216], [0.0895897740976585, 1.90599141927762, 4.54100411294991], [0.0, 2.0, 5.0]].map(point => point.map(value => expect.closeTo(value, 9))),
            [[0.0, 1.0, 0.0], [0.245105004403993, 1.01630274449189, 0.473907264316101], [0.49958905098331, 1.0578425179163, 0.941335584050324], [0.760656615027867, 1.11825638194057, 1.40305684811516], [1.02711677227555, 1.19498939478945, 1.85924414976166], [1.29902145653413, 1.28915247318498, 2.30889043988328], [1.5822092240803, 1.42843920824026, 2.73597923992033], [1.33959967150232, 1.40676346641035, 2.27243587659429], [1.07548822310738, 1.33725618678674, 1.81372025942802], [0.808524474183623, 1.25898436363557, 1.35806458473167], [0.539987839449393, 1.17576465042953, 0.904211028469259], [0.270389369377413, 1.08915696745819, 0.451621771296639], [0.0, 1.0, 0.0]].map(point => point.map(value => expect.closeTo(value, 9))),
        ]);
        w1.delete();
        w2.delete();
    });

    it("should measure a closed Bezier whose speed nearly stops along its curve, not by one fixed rule", () => {
        // Arrange
        const w = wire.createBezier({ points: [[0, 1, 0], [1, 1, 2], [3, 2, 5]], closed: true });

        // Act
        const length = wire.getWireLength({ shape: w });

        // Assert
        expect(length).toBeCloseTo(6.406495600884583, 12);
    });

    it("should divide wire to points by params and remove start and end points", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const pts = wire.divideWireByParamsToPoints({ shape: w, nrOfDivisions: 12, removeEndPoint: true, removeStartPoint: true });
        expect(pts.length).toEqual(11);
        expect(pts).toEqual(
            [
                [0.15277777777777776, 0.16666666666666666, 0.03472222222222222],
                [0.2777777777777778, 0.3333333333333333, 0.13888888888888887],
                [0.375, 0.5, 0.3125],
                [0.4444444444444445, 0.6666666666666666, 0.5555555555555555],
                [0.48611111111111105, 0.8333333333333334, 0.8680555555555557],
                [0.5, 1, 1.25],
                [0.4861111111111111, 1.1666666666666667, 1.701388888888889],
                [0.4444444444444445, 1.3333333333333333, 2.222222222222222],
                [0.375, 1.5, 2.8125],
                [0.27777777777777773, 1.6666666666666667, 3.4722222222222228],
                [0.15277777777777785, 1.8333333333333333, 4.201388888888888],
            ]
        );
        w.delete();
    });

    it("should divide wire to points by equal distance", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const pts = wire.divideWireByEqualDistanceToPoints({ shape: w, nrOfDivisions: 12, removeEndPoint: false, removeStartPoint: false });
        expect(pts.length).toEqual(13);
        expect(pts).toEqual(within(
            [
                [0, 0, 0],
                [0.2838222828590555, 0.3424625985680442, 0.14660078927247172],
                [0.43115226769191084, 0.6289266048122308, 0.4944358428008],
                [0.4892636529329303, 0.8534643588264631, 0.9105017647338322],
                [0.49923676534972294, 1.039070056316239, 1.34958322741629],
                [0.480111123635674, 1.1994436078911832, 1.798331210638773],
                [0.4414571610105028, 1.3421778455408742, 2.2518017113259283],
                [0.38869559662499154, 1.4718143774303798, 2.7077969520134704],
                [0.32519482109496023, 1.5912785788527093, 3.1652093943943727],
                [0.25319786452105564, 1.702569762342423, 3.6234297445534183],
                [0.17427907733231243, 1.8071194740156968, 4.082100991708461],
                [0.08958978033353904, 1.9059914123946882, 4.541004080152873],
                [2.2204460492503128e-16, 1.9999999999999998, 4.999999999999998]
            ]
        ));
        w.delete();
    });

    it("should divide wire to points by equal distance and remove start and end points", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const pts = wire.divideWireByEqualDistanceToPoints({ shape: w, nrOfDivisions: 12, removeEndPoint: true, removeStartPoint: true });
        expect(pts.length).toEqual(11);
        expect(pts).toEqual(within(
            [
                [0.2838222828590555, 0.3424625985680442, 0.14660078927247172],
                [0.43115226769191084, 0.6289266048122308, 0.4944358428008],
                [0.4892636529329303, 0.8534643588264631, 0.9105017647338322],
                [0.49923676534972294, 1.039070056316239, 1.34958322741629],
                [0.480111123635674, 1.1994436078911832, 1.798331210638773],
                [0.4414571610105028, 1.3421778455408742, 2.2518017113259283],
                [0.38869559662499154, 1.4718143774303798, 2.7077969520134704],
                [0.32519482109496023, 1.5912785788527093, 3.1652093943943727],
                [0.25319786452105564, 1.702569762342423, 3.6234297445534183],
                [0.17427907733231243, 1.8071194740156968, 4.082100991708461],
                [0.08958978033353904, 1.9059914123946882, 4.541004080152873],
            ]
        ));
        w.delete();
    });

    it("should combine edges and wires into a wire", async () => {
        const e1 = edge.line({ start: [0, 0, 0], end: [1, 0, 0] });
        const e2 = edge.line({ start: [1, 0, 0], end: [3, 4, 0] });
        const w1 = wire.createBezier({ points: [[3, 4, 0], [4, 4, 0], [5, 5, 0]], closed: false });
        const w2 = wire.createBezier({ points: [[5, 5, 0], [6, 6, 0], [7, 7, 0]], closed: false });
        const combined = wire.combineEdgesAndWiresIntoAWire({ shapes: [e1, e2, w1, w2] });
        const length = wire.getWireLength({ shape: combined });
        expect(length).toBeCloseTo(10.596150241589982);
        e1.delete();
        e2.delete();
        w1.delete();
        w2.delete();
        combined.delete();
    });

    it("should add edges and wires into a wire", async () => {
        const wBase = wire.createBezier({ points: [[-1, 0, 0], [1, 1, 0], [0, 0, 0]], closed: false });
        const e1 = edge.line({ start: [0, 0, 0], end: [1, 0, 0] });
        const e2 = edge.line({ start: [1, 0, 0], end: [3, 4, 0] });
        const w1 = wire.createBezier({ points: [[3, 4, 0], [4, 4, 0], [5, 5, 0]], closed: false });
        const w2 = wire.createBezier({ points: [[5, 5, 0], [6, 6, 0], [7, 7, 0]], closed: false });
        const combined = wire.addEdgesAndWiresToWire({ shape: wBase, shapes: [e1, e2, w1, w2] });
        const length = wire.getWireLength({ shape: combined });
        expect(length).toBeCloseTo(12.624769666129064);
        wBase.delete();
        e1.delete();
        e2.delete();
        w1.delete();
        w2.delete();
        combined.delete();
    });

    it("should not add disconnected edges and wires into a wire", async () => {
        const wBase = wire.createBezier({ points: [[-1, 0, 0], [1, 1, 0], [0, 2, 3]], closed: false });
        const e1 = edge.line({ start: [0, 0, 0], end: [1, 0, 0] });
        const e2 = edge.line({ start: [1, 0, 0], end: [3, 4, 0] });
        const w1 = wire.createBezier({ points: [[3, 4, 0], [4, 4, 0], [5, 5, 0]], closed: false });
        const w2 = wire.createBezier({ points: [[5, 5, 0], [6, 6, 0], [7, 7, 0]], closed: false });
        expect(() => wire.addEdgesAndWiresToWire({ shape: wBase, shapes: [e1, e2, w1, w2] }))
            .toThrow("Wire could not be constructed. Check if edges and wires do not have disconnected elements.");
        wBase.delete();
        e1.delete();
        e2.delete();
        w1.delete();
        w2.delete();
    });

    it("should be able to construct wire even if there are weird shapes in the list if the rest is correct", async () => {
        const wBase = wire.createBezier({ points: [[-1, 0, 0], [1, 1, 0], [0, 0, 0]], closed: false });
        const e1 = edge.line({ start: [0, 0, 0], end: [1, 0, 0] });
        const e2 = edge.line({ start: [1, 0, 0], end: [3, 4, 0] });
        const w1 = wire.createBezier({ points: [[3, 4, 0], [4, 4, 0], [5, 5, 0]], closed: false });
        const w2 = wire.createBezier({ points: [[5, 5, 0], [6, 6, 0], [7, 7, 0]], closed: false });
        const box = occHelper.entitiesService.bRepPrimAPIMakeBox(1, 1, 1, [0, 0, 0]);
        const combined = wire.addEdgesAndWiresToWire({ shape: wBase, shapes: [e1, e2, w1, w2, box] });
        const length = wire.getWireLength({ shape: combined });
        expect(length).toBeCloseTo(12.624769666129064);
        wBase.delete();
        e1.delete();
        e2.delete();
        w1.delete();
        w2.delete();
        box.delete();
        combined.delete();
    });

    it("should place wire on a face", async () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        const f = face.getFace({ shape: sph, index: 0 });
        const w = wire.createEllipseWire({ radiusMajor: 0.5, radiusMinor: 0.3, center: [0, 0, 0], direction: [0, 1, 0] });
        const placed = wire.placeWireOnFace({ wire: w, face: f });
        const length = wire.getWireLength({ shape: placed });
        expect(length).toBeCloseTo(7.489657680597562);
        sph.delete();
        f.delete();
        w.delete();
        placed.delete();
    });

    it("should place wires on a face", async () => {
        const sph1 = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        const f = face.getFace({ shape: sph1, index: 0 });
        const w1 = wire.createEllipseWire({ radiusMajor: 0.5, radiusMinor: 0.3, center: [0, 0, 0], direction: [0, 1, 0] });
        const w2 = wire.createEllipseWire({ radiusMajor: 0.3, radiusMinor: 0.1, center: [0, 0, 0], direction: [0, 1, 0] });

        const placed = wire.placeWiresOnFace({ face: f, wires: [w1, w2] });
        const length1 = wire.getWireLength({ shape: placed[0]! });
        const length2 = wire.getWireLength({ shape: placed[1]! });

        expect(length1).toBeCloseTo(7.489657680597562);
        expect(length2).toBeCloseTo(3.997689022384506);
        sph1.delete();
        f.delete();
        w1.delete();
        w2.delete();
        placed.forEach((w) => w.delete());
    });

    it("should create a ngon wire", () => {
        const w = wire.createNGonWire({ nrCorners: 6, radius: 1, center: [0, 0, 0], direction: [0, 0, 1] });
        const length = wire.getWireLength({ shape: w });
        const cornerPoints = edge.getCornerPointsOfEdgesForShape({ shape: w });
        expect(cornerPoints.length).toBe(6);
        expect(length).toBeCloseTo(6);
        expect(cornerPoints).toEqual(
            [
                [0, 1, 0],
                [0.8660254037844386, 0.5000000000000001, 0],
                [0.8660254037844387, -0.4999999999999998, 0],
                [1.1102230246251565e-16, -1, 0],
                [-0.8660254037844385, -0.5000000000000004, 0],
                [-0.866025403784439, 0.49999999999999933, 0]
            ]
        );
        w.delete();
    });

    it("should split circle wire by points", () => {
        const circle = wire.createCircleWire({
            radius: 1,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: circle,
            removeEndPoint: false,
            removeStartPoint: false,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: circle, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        segmentLengths.forEach(l => {
            expect(l).toBeCloseTo(0.6283185307179586, 10);
        });
    });

    it("should split circle wire by points", () => {
        const circle = wire.createCircleWire({
            radius: 1,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: circle,
            removeEndPoint: true,
            removeStartPoint: true,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: circle, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        expect(segmentLengths).toEqual(within([0.6283185307179586, 0.6283185307179586, 0.6283185307179588, 0.6283185307179584, 0.6283185307179586, 0.6283185307179586, 0.6283185307179595, 0.6283185307179577, 0.6283185307179586, 0.6283185307179586]));
    });

    it("should split filleted triangle by points", () => {
        const triangle = wire.createPolygonWire({
            points: [
                [-0.5, 0, -0.28867513459],
                [0.5, 0, -0.28867513459],
                [0, 0, 0.57735026919]
            ],
        });
        const filletTriangle = fillets.fillet2d({ shape: triangle, radius: 0.1 });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: filletTriangle,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 6
        });
        const split = wire.splitOnPoints({ shape: filletTriangle, points: pts });
        expect(split.length).toBe(6);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        segmentLengths.forEach(len => {
            expect(len).toBeCloseTo(0.431514);
        });
    });

    it("should split filleted square by points", () => {
        const square = wire.createSquareWire({
            size: 2,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const filletedSquare = fillets.fillet2d({ shape: square, radius: 0.2 });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: filletedSquare,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 8
        });
        const split = wire.splitOnPoints({ shape: filletedSquare, points: pts });
        expect(split.length).toBe(8);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        const totalLength = segmentLengths.reduce((a, b) => a + b, 0);
        const expectedTotalLength = wire.getWireLength({ shape: filletedSquare });
        expect(totalLength).toBeCloseTo(expectedTotalLength, 2);
    });

    it("should split filleted rectangle by points with many divisions", () => {
        const rectangle = wire.createRectangleWire({
            width: 3,
            length: 2,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const filletedRect = fillets.fillet2d({ shape: rectangle, radius: 0.3 });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: filletedRect,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 20
        });
        const split = wire.splitOnPoints({ shape: filletedRect, points: pts });
        expect(split.length).toBe(20);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        const totalLength = segmentLengths.reduce((a, b) => a + b, 0);
        const expectedTotalLength = wire.getWireLength({ shape: filletedRect });
        expect(totalLength).toBeCloseTo(expectedTotalLength, 2);
    });

    it("should split ellipse wire by points", () => {
        const ellipse = wire.createEllipseWire({
            radiusMajor: 2,
            radiusMinor: 1,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: ellipse,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 12
        });
        const split = wire.splitOnPoints({ shape: ellipse, points: pts });
        expect(split.length).toBe(12);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        const totalLength = segmentLengths.reduce((a, b) => a + b, 0);
        const expectedTotalLength = wire.getWireLength({ shape: ellipse });
        expect(totalLength).toBeCloseTo(expectedTotalLength, 1);
    });

    it("should split bspline wire by points", () => {
        const bspline = wire.createBSpline({
            points: [[0, 0, 0], [1, 2, 0], [2, 0, 0], [3, 2, 0], [4, 0, 0]],
            closed: false
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: bspline,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 15
        });
        const split = wire.splitOnPoints({ shape: bspline, points: pts });
        expect(split.length).toBe(15);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        const totalLength = segmentLengths.reduce((a, b) => a + b, 0);
        const expectedTotalLength = wire.getWireLength({ shape: bspline });
        expect(totalLength).toBeCloseTo(expectedTotalLength, 0);
    });

    it("should split closed bspline wire by points", () => {
        const bspline = wire.createBSpline({
            points: [[0, 0, 0], [1, 2, 0], [2, 0, 0], [3, 2, 0], [2, 3, 0], [0, 2, 0]],
            closed: true
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: bspline,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: bspline, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        const totalLength = segmentLengths.reduce((a, b) => a + b, 0);
        const expectedTotalLength = wire.getWireLength({ shape: bspline });
        expect(totalLength).toBeCloseTo(expectedTotalLength, 0);
    });

    it("should split bezier wire by points", () => {
        const bezier = wire.createBezier({
            points: [[0, 0, 0], [1, 3, 0], [2, -1, 0], [3, 2, 0]],
            closed: false
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: bezier,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 8
        });
        const split = wire.splitOnPoints({ shape: bezier, points: pts });
        expect(split.length).toBe(8);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        const expectedLength = wire.getWireLength({ shape: bezier }) / 8;
        segmentLengths.forEach(len => {
            expect(len).toBeCloseTo(expectedLength, 3);
        });
    });

    it("should split filleted pentagon (ngon) by points", () => {
        const pentagon = wire.createNGonWire({
            nrCorners: 5,
            radius: 2,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const filletedPentagon = fillets.fillet2d({ shape: pentagon, radius: 0.2 });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: filletedPentagon,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: filletedPentagon, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        const totalLength = segmentLengths.reduce((a, b) => a + b, 0);
        const expectedTotalLength = wire.getWireLength({ shape: filletedPentagon });
        expect(totalLength).toBeCloseTo(expectedTotalLength, 2);
    });

    describe("splitting at a vertex", () => {
        const recordingEvaluations = (act: () => void): { isDeleted(): boolean }[][] => {
            const results: { isDeleted(): boolean }[] = [];
            const points: { isDeleted(): boolean }[] = [];
            const original: unknown = Reflect.get(occt, "EvaluateEdgeCurve");
            const evaluate = occt.EvaluateEdgeCurve.bind(occt);
            Reflect.set(occt, "EvaluateEdgeCurve", (shape: TopoDS_Edge, param: number): CurvePointResult => {
                const result = evaluate(shape, param);
                results.push(result);
                return new Proxy(result, {
                    get(target, property): unknown {
                        const value: unknown = Reflect.get(target, property);
                        if (property === "Point") {
                            points.push(value as gp_Pnt);
                        }
                        return typeof value === "function" ? value.bind(target) as unknown : value;
                    },
                });
            });
            try {
                act();
            } finally {
                Reflect.set(occt, "EvaluateEdgeCurve", original);
            }
            return [results, points];
        };

        it("should take a split point within 1e-7 after a vertex as the vertex, leaving no sliver of the next edge", () => {
            // Arrange
            const polyline = wire.createPolylineWire({ points: [[0, 0, 0], [2, 0, 0], [2, 2, 0]] });

            // Act
            const pieces = wire.splitOnPoints({ shape: polyline, points: [[2, 5e-8, 0]] });

            // Assert
            expect(pieces.map(piece => [edge.getEdges({ shape: piece }).length, wire.getWireLength({ shape: piece })])).toEqual([[1, expect.closeTo(2, 12)], [1, expect.closeTo(2, 12)]]);
        });

        it("should take a split point within 1e-7 of the end as the end, cutting off nothing", () => {
            // Arrange
            const polyline = wire.createPolylineWire({ points: [[0, 0, 0], [2, 0, 0], [2, 2, 0]] });

            // Act
            const pieces = wire.splitOnPoints({ shape: polyline, points: [[2, 2 - 5e-8, 0]] });

            // Assert
            expect(pieces.map(piece => wire.getWireLength({ shape: piece }))).toEqual([expect.closeTo(4, 12)]);
        });

        it("should delete every evaluation it makes while matching split points to vertices", () => {
            // Arrange
            const pentagon = wire.createNGonWire({ nrCorners: 5, radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
            const filleted = fillets.fillet2d({ shape: pentagon, radius: 0.2 });
            const points = wire.divideWireByEqualDistanceToPoints({ shape: filleted, removeEndPoint: true, removeStartPoint: false, nrOfDivisions: 10 });
            let pieces = 0;

            // Act
            const [results, reads] = recordingEvaluations(() => {
                pieces = wire.splitOnPoints({ shape: filleted, points }).length;
            });

            // Assert
            expect(pieces).toBe(10);
            expect(results!.length).toBeGreaterThan(0);
            expect(reads!.length).toBe(results!.length);
            expect([...results!, ...reads!].filter(made => !made.isDeleted())).toEqual([]);
        });
    });

    it("should split filleted hexagon by points with odd number of divisions", () => {
        const hexagon = wire.createNGonWire({
            nrCorners: 6,
            radius: 1.5,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const filletedHexagon = fillets.fillet2d({ shape: hexagon, radius: 0.15 });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: filletedHexagon,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 7
        });
        const split = wire.splitOnPoints({ shape: filletedHexagon, points: pts });
        expect(split.length).toBe(7);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        const expectedLength = wire.getWireLength({ shape: filletedHexagon }) / 7;
        segmentLengths.forEach(len => {
            expect(len).toBeCloseTo(expectedLength, 4);
        });
    });

    it("should split L-polygon wire by points", () => {
        const lPolygon = wire.createLPolygonWire({
            widthFirst: 2,
            lengthFirst: 3,
            widthSecond: 1,
            lengthSecond: 1.5,
            align: Inputs.OCCT.directionEnum.outside,
            rotation: 0,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: lPolygon,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 12
        });
        const split = wire.splitOnPoints({ shape: lPolygon, points: pts });
        expect(split.length).toBe(12);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        const expectedLength = wire.getWireLength({ shape: lPolygon }) / 12;
        segmentLengths.forEach(len => {
            expect(len).toBeCloseTo(expectedLength, 4);
        });
    });

    it("should split parallelogram wire by points", () => {
        const parallelogram = wire.createParallelogramWire({
            width: 3,
            height: 2,
            angle: 30,
            aroundCenter: true,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: parallelogram,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 8
        });
        const split = wire.splitOnPoints({ shape: parallelogram, points: pts });
        expect(split.length).toBe(8);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        const expectedLength = wire.getWireLength({ shape: parallelogram }) / 8;
        segmentLengths.forEach(len => {
            expect(len).toBeCloseTo(expectedLength, 4);
        });
    });

    it("should split combined wire with mixed edge types by points", () => {
        const line1 = wire.createLineWire({ start: [0, 0, 0], end: [2, 0, 0] });
        const arc = edge.arcThroughThreePoints({ start: [2, 0, 0], middle: [2.5, 0, 0.5], end: [2, 0, 1] });
        const arcWire = wire.createWireFromEdge({ shape: arc });
        const line2 = wire.createLineWire({ start: [2, 0, 1], end: [0, 0, 1] });
        const combinedWire = wire.combineEdgesAndWiresIntoAWire({ shapes: [line1, arcWire, line2] });

        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: combinedWire,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: combinedWire, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        const expectedLength = wire.getWireLength({ shape: combinedWire }) / 10;
        segmentLengths.forEach(len => {
            expect(len).toBeCloseTo(expectedLength, 4);
        });
    });

    it("should split filleted L-polygon wire by points", () => {
        const lPolygon = wire.createLPolygonWire({
            widthFirst: 2,
            lengthFirst: 3,
            widthSecond: 1,
            lengthSecond: 1.5,
            align: Inputs.OCCT.directionEnum.middle,
            rotation: 0,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const filletedL = fillets.fillet2d({ shape: lPolygon, radius: 0.15 });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: filletedL,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 16
        });
        const split = wire.splitOnPoints({ shape: filletedL, points: pts });
        expect(split.length).toBe(16);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        const expectedLength = wire.getWireLength({ shape: filletedL }) / 16;
        segmentLengths.forEach(len => {
            expect(len).toBeCloseTo(expectedLength, 4);
        });
    });

    it("should split periodic interpolated wire by points", () => {
        const periodicWire = wire.interpolatePoints({
            points: [[0, 0, 0], [2, 1, 0], [3, 0, 0], [2, -1, 0]],
            periodic: true,
            tolerance: 1e-7
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: periodicWire,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 12
        });
        const split = wire.splitOnPoints({ shape: periodicWire, points: pts });
        expect(split.length).toBe(12);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        const expectedLength = wire.getWireLength({ shape: periodicWire }) / 12;
        segmentLengths.forEach(len => {
            expect(len).toBeCloseTo(expectedLength, 4);
        });
    });

    it("should split square wire by points", () => {
        const square = wire.createSquareWire({
            size: 1,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: square,
            removeEndPoint: false,
            removeStartPoint: false,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: square, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        segmentLengths.forEach(l => {
            expect(l).toBeCloseTo(0.4, 10);
        });
    });


    it("should split square wire by points", () => {
        const square = wire.createSquareWire({
            size: 1,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: square,
            removeEndPoint: true,
            removeStartPoint: true,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: square, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        expect(segmentLengths).toEqual(within([0.4, 0.4, 0.40000000000000013, 0.3999999999999999, 0.3999999999999999, 0.3999999999999999, 0.3999999999999999, 0.39999999999999986, 0.3999999999999999, 0.4000000000000003]));
    });

    it("should split heart wire by points", () => {
        const heart = wire.createHeartWire({
            sizeApprox: 2,
            rotation: 0,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: heart,
            removeEndPoint: false,
            removeStartPoint: false,
            nrOfDivisions: 20
        });
        const split = wire.splitOnPoints({ shape: heart, points: pts });
        expect(split.length).toBe(20);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        segmentLengths.forEach(l => {
            expect(l).toBeCloseTo(0.324548544534, 10);
        });
    });

    it("should split rectangle wire by points", () => {
        const rectangle = wire.createRectangleWire({
            width: 2,
            length: 2,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: rectangle,
            removeEndPoint: false,
            removeStartPoint: false,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: rectangle, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        segmentLengths.forEach(l => {
            expect(l).toBeCloseTo(0.8, 10);
        });
    });

    it("should split non closed interpolated wire by points when start and end points are removed", () => {
        const interpolatedWire = wire.interpolatePoints({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], periodic: false, tolerance: 1e-7 });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: interpolatedWire,
            removeEndPoint: true,
            removeStartPoint: true,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: interpolatedWire, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        segmentLengths.forEach(l => {
            expect(l).toBeCloseTo(0.725389, 4);
        });
    });

    it("should split non closed interpolated wire by points when start point is removed", () => {
        const interpolatedWire = wire.interpolatePoints({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], periodic: false, tolerance: 1e-7 });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: interpolatedWire,
            removeEndPoint: false,
            removeStartPoint: true,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: interpolatedWire, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        segmentLengths.forEach(l => {
            expect(l).toBeCloseTo(0.72538, 4);
        });
    });

    it("should split non closed interpolated wire by points when end point is removed", () => {
        const interpolatedWire = wire.interpolatePoints({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], periodic: false, tolerance: 1e-7 });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: interpolatedWire,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: interpolatedWire, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        segmentLengths.forEach(l => {
            expect(l).toBeCloseTo(0.72538, 4);
        });
    });

    it("should split non periodic closed interpolated wire by points when end point is removed and when wire is quite strange", () => {
        const interpolatedWire = wire.interpolatePoints({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5], [1, 1, 0], [1, 3, 0], [-3, -5, -10], [-2, -1, 0], [0, 0, 0]], periodic: false, tolerance: 1e-7 });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: interpolatedWire,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: interpolatedWire, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        segmentLengths.forEach(l => {
            expect(l).toBeCloseTo(4.4, 1);
        });
    });

    it("should create less wires than there are edges on the wire and group edges correctly", () => {
        const rectangle = wire.createRectangleWire({
            width: 2,
            length: 2,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: rectangle,
            removeEndPoint: false,
            removeStartPoint: false,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: rectangle, points: pts });
        expect(split.length).toBe(10);
        const edges: TopoDS_Edge[][] = [];
        split.forEach(s => {
            edges.push(edge.getEdges({ shape: s }));
        });
        expect(edges.length).toBe(10);
        const lengths = edges.map(e => e.length);
        expect(lengths).toEqual([1, 1, 2, 1, 1, 1, 1, 2, 1, 1]);
    });

    it("should create wires that contain few edges on the wire and group edges correctly even if end point is not added to the wire", () => {
        const rectangle = wire.createRectangleWire({
            width: 2,
            length: 2,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: rectangle,
            removeEndPoint: true,
            removeStartPoint: false,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: rectangle, points: pts });
        expect(split.length).toBe(10);
        const edges: TopoDS_Edge[][] = [];
        split.forEach(s => {
            edges.push(edge.getEdges({ shape: s }));
        });
        expect(edges.length).toBe(10);
        const lengths = edges.map(e => e.length);
        expect(lengths).toEqual([1, 1, 2, 1, 1, 1, 1, 2, 1, 1]);
    });

    it("should create wires that contain few edges on the wire and group edges correctly even if start and end point is not added to the wire", () => {
        const rectangle = wire.createRectangleWire({
            width: 2,
            length: 2,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: rectangle,
            removeEndPoint: true,
            removeStartPoint: true,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: rectangle, points: pts });
        expect(split.length).toBe(10);
        const edges: TopoDS_Edge[][] = [];
        split.forEach(s => {
            edges.push(edge.getEdges({ shape: s }));
        });
        expect(edges.length).toBe(10);
        const lengths = edges.map(e => e.length);
        expect(lengths).toEqual([1, 1, 2, 1, 1, 1, 1, 2, 1, 1]);

    });

    it("should split star wire by points", () => {
        const star = wire.createStarWire({
            numRays: 23,
            outerRadius: 2,
            innerRadius: 1,
            half: false,
            center: [0, 0, 0],
            direction: [0, 1, 0]
        });
        const pts = wire.divideWireByEqualDistanceToPoints({
            shape: star,
            removeEndPoint: true,
            removeStartPoint: true,
            nrOfDivisions: 10
        });
        const split = wire.splitOnPoints({ shape: star, points: pts });
        expect(split.length).toBe(10);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        expect(segmentLengths).toEqual([4.684905711696341, 4.684905711696342, 4.684905711696341, 4.684905711696342, 4.68490571169632, 4.684905711696367, 4.684905711696346, 4.6849057116963175, 4.684905711696324, 4.684905711696332].map(value => expect.closeTo(value, 12)));
    });

    it("should close open wire", () => {
        const pln = wire.createPolylineWire({
            points: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]]
        });
        const closed = wire.closeOpenWire({ shape: pln });
        const lengthPln = wire.getWireLength({ shape: pln });
        const length = wire.getWireLength({ shape: closed });
        expect(lengthPln).toBeCloseTo(3);
        expect(length).toBeCloseTo(4);
        const startPt = wire.startPointOnWire({ shape: closed });
        const endPt = wire.endPointOnWire({ shape: closed });
        expect(startPt).toEqual(endPt);
        pln.delete();
        closed.delete();
    });

    it("should not close closed wire", () => {
        const pln = wire.createPolylineWire({
            points: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]]
        });
        const closed = wire.closeOpenWire({ shape: pln });
        const closed2 = wire.closeOpenWire({ shape: closed });
        const length = wire.getWireLength({ shape: closed2 });
        expect(length).toBeCloseTo(4);
        const startPt = wire.startPointOnWire({ shape: closed2 });
        const endPt = wire.endPointOnWire({ shape: closed2 });
        expect(startPt).toEqual(endPt);
        pln.delete();
        closed.delete();
    });

    it("should project wire on the shape", () => {
        const star = wire.createStarWire({
            numRays: 23,
            outerRadius: 2,
            innerRadius: 1,
            half: false,
            center: [0, 4, 0],
            direction: [0, 1, 0]
        });
        const sphere = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        const projected = wire.project({ wire: star, shape: sphere, direction: [0, -1, 0] });
        const wires = wire.getWires({ shape: projected });
        expect(wires.length).toBe(2);
        const wireLengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(wireLengths).toEqual([54.5543899385554, 54.55438993855537].map(value => expect.closeTo(value, 12)));

        star.delete();
        sphere.delete();
        projected.delete();
        wires.forEach(w => w.delete());
    });

    it("should project wires on the shape", () => {
        const star1 = wire.createStarWire({
            numRays: 15,
            outerRadius: 2,
            innerRadius: 1,
            half: false,
            center: [0, 4, 0],
            direction: [0, 1, 0]
        });
        const star2 = wire.createStarWire({
            numRays: 15,
            outerRadius: 1,
            innerRadius: 0.5,
            half: false,
            center: [0, 4, 0],
            direction: [0, 1, 0]
        });
        const sphere = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        const projected = wire.projectWires({ wires: [star1, star2], shape: sphere, direction: [0, -1, 0] });
        expect(projected.length).toBe(2);
        const wires = projected.map(p => {
            return wire.getWires({ shape: p });
        }).flat();
        expect(wires.length).toBe(4);
        const wireLengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(wireLengths.length).toEqual(4);
        wireLengths.forEach((len, i) => expect(len).toBeCloseTo([36.22718914885955, 36.22718914885927, 16.139612940402895, 16.139612940402888][i]!, 10));

        star1.delete();
        star2.delete();
        sphere.delete();
        projected.forEach(p => p.delete());
        wires.forEach(w => w.delete());
    });

    it("should create wire from edge", () => {
        const e = edge.createCircleEdge({
            radius: 1,
            center: [0, 0, 0],
            direction: [0, 1, 0],
        });
        const w = wire.createWireFromEdge({
            shape: e
        });
        const type = shape.getShapeType({ shape: w });
        expect(type).toBe(Inputs.OCCT.shapeTypeEnum.wire);
    });

    it("should get a center of mass from a circular wire", () => {
        const w = wire.createCircleWire({
            radius: 1,
            center: [0, 1, 0.5],
            direction: [0, 1, 0]
        });
        const center = wire.getWireCenterOfMass({
            shape: w
        });
        expect(center[0]).toBeCloseTo(0);
        expect(center[1]).toBeCloseTo(1);
        expect(center[2]).toBeCloseTo(0.5);
    });

    it("should get a center of mass from a bspline", () => {
        const w = wire.createBSpline({
            points: [[0, 0, 0], [0, 0, 1], [1, 1, 0], [1, 0, 1]],
            closed: false
        });
        const center = wire.getWireCenterOfMass({
            shape: w
        });
        expect(center[0]).toBe(0.5927437729817302);
        expect(center[1]).toBe(0.392179685881662);
        expect(center[2]).toBe(0.48928161123208896);
    });

    it("should get centers of mass from two wires", () => {
        const w1 = wire.createCircleWire({
            radius: 1,
            center: [0, 1, 0.5],
            direction: [0, 1, 0]
        });
        const w2 = wire.createEllipseWire({
            radiusMajor: 1,
            radiusMinor: 0.5,
            center: [0, 2, 1],
            direction: [0, 1, 0]
        });
        const centers = wire.getWiresCentersOfMass({
            shapes: [w1, w2]
        });
        expect(centers[0]![0]).toBeCloseTo(0);
        expect(centers[0]![1]).toBeCloseTo(1);
        expect(centers[0]![2]).toBeCloseTo(0.5);

        expect(centers[1]![0]).toBeCloseTo(0);
        expect(centers[1]![1]).toBeCloseTo(2);
        expect(centers[1]![2]).toBeCloseTo(1);
    });

    it("should create zig zag wire between two wires", () => {
        const w1 = wire.createCircleWire({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const w2 = wire.createCircleWire({ radius: 3, center: [0, 4, 0], direction: [0, 0, 1] });

        const zigZagWire = wire.createZigZagBetweenTwoWires({ wire1: w1, wire2: w2, nrZigZags: 5, inverse: false, divideByEqualDistance: true, zigZagsPerEdge: true });
        const length = wire.getWireLength({ shape: zigZagWire });
        expect(length).toBeCloseTo(50.260581938510676);
        const cornerPoints = edge.getCornerPointsOfEdgesForShape({ shape: zigZagWire });
        expect(cornerPoints.length).toBe(10);
        w1.delete();
        w2.delete();
        zigZagWire.delete();
    });

    it("should create two wires between start and end points of two edges", () => {
        const e1 = edge.line({ start: [0, 0, 0], end: [0, 0, 5] });
        const e2 = edge.line({ start: [3, 0, 0], end: [3, 0, 5] });

        const wires = wire.createWiresBetweenStartEndPointsOfWiresAndEdges({ shapes: [e1, e2] });
        expect(wires.length).toBe(2);
        const startStart = wire.startPointOnWire({ shape: wires[0]! });
        const startEnd = wire.endPointOnWire({ shape: wires[0]! });
        const endStart = wire.startPointOnWire({ shape: wires[1]! });
        const endEnd = wire.endPointOnWire({ shape: wires[1]! });
        expect(startStart).toEqual([0, 0, 0]);
        expect(startEnd).toEqual([3, 0, 0]);
        expect(endStart).toEqual([0, 0, 5]);
        expect(endEnd).toEqual([3, 0, 5]);
        expect(wire.getWireLength({ shape: wires[0]! })).toBeCloseTo(3);
        expect(wire.getWireLength({ shape: wires[1]! })).toBeCloseTo(3);
        e1.delete();
        e2.delete();
        wires[0]!.delete();
        wires[1]!.delete();
    });

    it("should create two polyline wires between start and end points of three wires or edges", () => {
        const e1 = edge.line({ start: [0, 0, 0], end: [0, 0, 5] });
        const w2 = wire.createPolylineWire({ points: [[3, 0, 0], [3, 1, 2], [3, 0, 5]] });
        const e3 = edge.line({ start: [6, 0, 0], end: [6, 0, 5] });

        const wires = wire.createWiresBetweenStartEndPointsOfWiresAndEdges({ shapes: [e1, w2, e3] });
        expect(wires.length).toBe(2);
        const startCorners = edge.getCornerPointsOfEdgesForShape({ shape: wires[0]! });
        const endCorners = edge.getCornerPointsOfEdgesForShape({ shape: wires[1]! });
        expect(startCorners).toEqual([[0, 0, 0], [3, 0, 0], [6, 0, 0]]);
        expect(endCorners).toEqual([[0, 0, 5], [3, 0, 5], [6, 0, 5]]);
        e1.delete();
        w2.delete();
        e3.delete();
        wires[0]!.delete();
        wires[1]!.delete();
    });

    it("should throw when less than two shapes are provided to createWiresBetweenStartEndPointsOfWiresAndEdges", () => {
        const e1 = edge.line({ start: [0, 0, 0], end: [0, 0, 5] });
        expect(() => wire.createWiresBetweenStartEndPointsOfWiresAndEdges({ shapes: [e1] }))
            .toThrow("You must provide at least two wires or edges to connect their start and end points.");
        e1.delete();
    });

    it("should create closed polygon wires between start and end points when closed is true", () => {
        const e1 = edge.line({ start: [0, 0, 0], end: [0, 0, 5] });
        const e2 = edge.line({ start: [3, 0, 0], end: [3, 0, 5] });
        const e3 = edge.line({ start: [6, 0, 0], end: [6, 0, 5] });

        const wires = wire.createWiresBetweenStartEndPointsOfWiresAndEdges({ shapes: [e1, e2, e3], wireType: Inputs.OCCT.wireFromPointsTypeEnum.polyline, closed: true, tolerance: 1e-7 });
        expect(wires.length).toBe(2);
        expect(wire.isWireClosed({ shape: wires[0]! })).toBe(true);
        expect(wire.isWireClosed({ shape: wires[1]! })).toBe(true);
        e1.delete();
        e2.delete();
        e3.delete();
        wires[0]!.delete();
        wires[1]!.delete();
    });

    it("should create interpolated periodic wires between start and end points when interpolated and closed", () => {
        const e1 = edge.line({ start: [0, 0, 0], end: [0, 0, 5] });
        const e2 = edge.line({ start: [3, 4, 0], end: [3, 4, 5] });
        const e3 = edge.line({ start: [6, 0, 0], end: [6, 0, 5] });

        const wires = wire.createWiresBetweenStartEndPointsOfWiresAndEdges({ shapes: [e1, e2, e3], wireType: Inputs.OCCT.wireFromPointsTypeEnum.interpolated, closed: true, tolerance: 1e-7 });
        expect(wires.length).toBe(2);
        expect(wire.isWireClosed({ shape: wires[0]! })).toBe(true);
        expect(wire.getWireLength({ shape: wires[0]! })).toBeGreaterThan(0);
        e1.delete();
        e2.delete();
        e3.delete();
        wires[0]!.delete();
        wires[1]!.delete();
    });

    it("should create polyline wires between subdivided points of wires and edges", () => {
        const e1 = edge.line({ start: [0, 0, 0], end: [0, 0, 5] });
        const e2 = edge.line({ start: [3, 0, 0], end: [3, 0, 5] });
        const e3 = edge.line({ start: [6, 0, 0], end: [6, 0, 5] });

        const wires = wire.createWiresBetweenSubdividedPointsOfWiresAndEdges({ shapes: [e1, e2, e3], nrOfDivisions: 5, divideByEqualDistance: false, wireType: Inputs.OCCT.wireFromPointsTypeEnum.polyline, closed: false, tolerance: 1e-7 });
        expect(wires.length).toBe(6);
        wires.forEach((w) => {
            expect(wire.getWireLength({ shape: w })).toBeCloseTo(6);
            expect(wire.isWireClosed({ shape: w })).toBe(false);
        });
        const firstCorners = edge.getCornerPointsOfEdgesForShape({ shape: wires[0]! });
        expect(firstCorners).toEqual([[0, 0, 0], [3, 0, 0], [6, 0, 0]]);
        const lastCorners = edge.getCornerPointsOfEdgesForShape({ shape: wires[5]! });
        expect(lastCorners).toEqual([[0, 0, 5], [3, 0, 5], [6, 0, 5]]);
        e1.delete();
        e2.delete();
        e3.delete();
        wires.forEach((w) => w.delete());
    });

    it("should create closed polygon wires between subdivided points when closed is true", () => {
        const e1 = edge.line({ start: [0, 0, 0], end: [0, 0, 5] });
        const e2 = edge.line({ start: [3, 0, 0], end: [3, 0, 5] });
        const e3 = edge.line({ start: [6, 0, 0], end: [6, 0, 5] });

        const wires = wire.createWiresBetweenSubdividedPointsOfWiresAndEdges({ shapes: [e1, e2, e3], nrOfDivisions: 4, divideByEqualDistance: true, wireType: Inputs.OCCT.wireFromPointsTypeEnum.polyline, closed: true, tolerance: 1e-7 });
        expect(wires.length).toBe(5);
        wires.forEach((w) => {
            expect(wire.isWireClosed({ shape: w })).toBe(true);
            expect(wire.getWireLength({ shape: w })).toBeCloseTo(12);
        });
        e1.delete();
        e2.delete();
        e3.delete();
        wires.forEach((w) => w.delete());
    });

    it("should create interpolated wires between subdivided points", () => {
        const e1 = edge.line({ start: [0, 0, 0], end: [0, 0, 5] });
        const e2 = edge.line({ start: [3, 0, 0], end: [3, 0, 5] });
        const e3 = edge.line({ start: [6, 0, 0], end: [6, 0, 5] });

        const wires = wire.createWiresBetweenSubdividedPointsOfWiresAndEdges({ shapes: [e1, e2, e3], nrOfDivisions: 3, divideByEqualDistance: false, wireType: Inputs.OCCT.wireFromPointsTypeEnum.interpolated, closed: false, tolerance: 1e-7 });
        expect(wires.length).toBe(4);
        wires.forEach((w) => {
            expect(wire.getWireLength({ shape: w })).toBeCloseTo(6);
        });
        e1.delete();
        e2.delete();
        e3.delete();
        wires.forEach((w) => w.delete());
    });

    it("should throw when less than two shapes are provided to createWiresBetweenSubdividedPointsOfWiresAndEdges", () => {
        const e1 = edge.line({ start: [0, 0, 0], end: [0, 0, 5] });
        expect(() => wire.createWiresBetweenSubdividedPointsOfWiresAndEdges({ shapes: [e1], nrOfDivisions: 5, divideByEqualDistance: false, wireType: Inputs.OCCT.wireFromPointsTypeEnum.polyline, closed: false, tolerance: 1e-7 }))
            .toThrow("You must provide at least two wires or edges to connect their subdivided points.");
        e1.delete();
    });

    it("should create inverse zig zag wire between two wires", () => {
        const w1 = wire.createCircleWire({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const w2 = wire.createCircleWire({ radius: 3, center: [0, 4, 0], direction: [0, 0, 1] });

        const zigZagWire = wire.createZigZagBetweenTwoWires({ wire1: w1, wire2: w2, nrZigZags: 5, inverse: true, divideByEqualDistance: true, zigZagsPerEdge: true });
        const length = wire.getWireLength({ shape: zigZagWire });
        expect(length).toBeCloseTo(50.72841254233739);
        const cornerPoints = edge.getCornerPointsOfEdgesForShape({ shape: zigZagWire });
        expect(cornerPoints.length).toBe(10);
        w1.delete();
        w2.delete();
        zigZagWire.delete();
    });

    it("should create inverse zig zag wire between two wires", () => {
        const w1 = wire.createSquareWire({ size: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const w2 = wire.createSquareWire({ size: 3, center: [0, 4, 0], direction: [0, 0, 1] });

        const zigZagWire = wire.createZigZagBetweenTwoWires({ wire1: w1, wire2: w2, nrZigZags: 5, inverse: true, divideByEqualDistance: true, zigZagsPerEdge: true });
        const length = wire.getWireLength({ shape: zigZagWire });
        expect(length).toBeCloseTo(174.35848368606852);
        const cornerPoints = edge.getCornerPointsOfEdgesForShape({ shape: zigZagWire });
        expect(cornerPoints.length).toBe(40);
        w1.delete();
        w2.delete();
        zigZagWire.delete();
    });

    it("should trnasform wires to points", () => {
        const squareFace = face.createRectangleFace({ width: 10, length: 20, center: [0, 0, 0], direction: [0, 1, 0] });
        const edges = edge.getEdges({ shape: squareFace });
        const points = edges.map(e => [edge.pointOnEdgeAtParam({ shape: e, param: 0.3 }), edge.pointOnEdgeAtParam({ shape: e, param: 0.6 })]).flat();
        const circleFaces = points.map(p => face.createCircleFace({ radius: 1, center: p, direction: [0, 1, 0] }));
        const diff = booleans.difference({ shape: squareFace, shapes: circleFaces.reverse(), keepEdges: true });
        const w = wire.getWire({ shape: diff, index: 0 });
        const opt = new Inputs.OCCT.WiresToPointsDto<TopoDS_Shape>();
        opt.shape = w;
        const pts = wire.wiresToPoints(opt);
        expect(pts.length).toBe(1);
        expect(pts[0]!.length).toBe(269);
        expect(pts[0]![0]).toEqual([5, 0, -1]);
        expect(pts[0]![33]).toEqual([5, 0, -10]);
        expect(pts[0]![123]).toEqual([-4.168530387697455, 0, -3.444429766980398]);
        expect(pts[0]![200]).toEqual([-1, 0, 10]);
        expect(pts[0]![268]).toEqual([5, 0, -1]);
        squareFace.delete();
        edges.forEach(e => e.delete());
        circleFaces.forEach(f => f.delete());
        diff.delete();
        w.delete();
    });

    it("should create reversed wire from reversed edges", () => {
        const squareFace = face.createRectangleFace({ width: 10, length: 20, center: [0, 0, 0], direction: [0, 1, 0] });
        const edges = edge.getEdges({ shape: squareFace });
        const points = edges.map(e => [edge.pointOnEdgeAtParam({ shape: e, param: 0.3 }), edge.pointOnEdgeAtParam({ shape: e, param: 0.6 })]).flat();
        const circleFaces = points.map(p => face.createCircleFace({ radius: 1, center: p, direction: [0, 1, 0] }));
        const diff = booleans.difference({ shape: squareFace, shapes: circleFaces.reverse(), keepEdges: true });
        const w = wire.getWire({ shape: diff, index: 0 });
        const opt = new Inputs.OCCT.ShapeDto<TopoDS_Shape>();
        opt.shape = w;

        const wireReversed = wire.reversedWireFromReversedEdges(opt);

        const lastEdgeOnWire = edge.getEdgesAlongWire({ shape: w }).pop()!;
        const firstEdgeOnReversedWire = edge.getEdgesAlongWire({ shape: wireReversed }).shift()!;

        const startPointOnEdge = edge.startPointOnEdge({ shape: lastEdgeOnWire });
        const startPointOnReversedEdge = edge.startPointOnEdge({ shape: firstEdgeOnReversedWire });
        const endPointOnEdge = edge.endPointOnEdge({ shape: lastEdgeOnWire });
        const endPointOnReversedEdge = edge.endPointOnEdge({ shape: firstEdgeOnReversedWire });

        expect(startPointOnEdge).toEqual(endPointOnReversedEdge);
        expect(endPointOnEdge).toEqual(startPointOnReversedEdge);

        lastEdgeOnWire.delete();
        firstEdgeOnReversedWire.delete();
        wireReversed.delete();
        squareFace.delete();
        edges.forEach(e => e.delete());
        circleFaces.forEach(f => f.delete());
        diff.delete();
        w.delete();
    });

    it("should create tan wire from one circle to another overlaping circle and keep outside lines and outside circles", () => {
        checkConstraintTanLinesOnTwoOverlapingCircles(
            Inputs.OCCT.twoSidesStrictEnum.outside,
            Inputs.OCCT.fourSidesStrictEnum.outside,
            10.540342229885402,
        );
    });

    it("should create tan wire from one circle to another overlaping circle and keep outside lines and inside circles", () => {
        checkConstraintTanLinesOnTwoOverlapingCircles(
            Inputs.OCCT.twoSidesStrictEnum.outside,
            Inputs.OCCT.fourSidesStrictEnum.inside,
            8.995939568781521,
        );
    });

    it("should create tan wire from one circle to another overlaping circle and keep outside lines and inside of one circle and outside of other", () => {
        checkConstraintTanLinesOnTwoOverlapingCircles(
            Inputs.OCCT.twoSidesStrictEnum.outside,
            Inputs.OCCT.fourSidesStrictEnum.insideOutside,
            6.421935133608383,
        );
    });

    it("should create tan wire from one circle to another overlaping circle and keep outside lines and outside of one circle and inside of other", () => {
        checkConstraintTanLinesOnTwoOverlapingCircles(
            Inputs.OCCT.twoSidesStrictEnum.outside,
            Inputs.OCCT.fourSidesStrictEnum.outsideInside,
            13.114346665058541,
        );
    });

    it("should not create tan wire from one circle to another overlaping circle and keep inside lines and outside circles", () => {
        expect(() => {
            checkConstraintTanLinesOnTwoOverlapingCircles(
                Inputs.OCCT.twoSidesStrictEnum.inside,
                Inputs.OCCT.fourSidesStrictEnum.outside,
                10.540342229885404,
            );
        }).toThrow();
    });

    const checkConstraintTanLinesOnTwoOverlapingCircles = (pos: Inputs.OCCT.twoSidesStrictEnum, cirsRem: Inputs.OCCT.fourSidesStrictEnum, lengthExp: number) => {
        const circle1 = wire.createCircleWire({ radius: 1.6, center: [0, 0, 0], direction: [0, 1, 0] });
        const circle2 = wire.createCircleWire({ radius: 1, center: [1, 0, 0], direction: [0, 1, 0] });
        const w = wire.createWireFromTwoCirclesTan({
            circle1,
            circle2,
            keepLines: pos,
            circleRemainders: cirsRem,
            tolerance: 1e-7
        });
        const length = wire.getWireLength({ shape: w });
        expect(length).toEqual(lengthExp);
        w.delete();
    };

    it("should create tan wire from one circle to another non overlaping circle and keep inside lines and insides of circles", () => {
        checkConstraintTanLinesOnTwoNonOverlapingCircles(
            Inputs.OCCT.twoSidesStrictEnum.inside,
            Inputs.OCCT.fourSidesStrictEnum.inside,
            10.56817548978988,
        );
    });

    it("should create tan wire from one circle to another non overlaping circle and keep inside lines and outsides of circles", () => {
        checkConstraintTanLinesOnTwoNonOverlapingCircles(
            Inputs.OCCT.twoSidesStrictEnum.inside,
            Inputs.OCCT.fourSidesStrictEnum.outside,
            17.927053631733575,
        );
    });

    it("should create tan wire from one circle to another non overlaping circle and keep inside lines and outside of one circle and inside of other", () => {
        checkConstraintTanLinesOnTwoNonOverlapingCircles(
            Inputs.OCCT.twoSidesStrictEnum.inside,
            Inputs.OCCT.fourSidesStrictEnum.outsideInside,
            15.096715884832154,
        );
    });

    it("should create tan wire from one circle to another non overlaping circle and keep inside lines and inside of one circle and outside of other", () => {
        checkConstraintTanLinesOnTwoNonOverlapingCircles(
            Inputs.OCCT.twoSidesStrictEnum.inside,
            Inputs.OCCT.fourSidesStrictEnum.insideOutside,
            13.3985132366913,
        );
    });

    const checkConstraintTanLinesOnTwoNonOverlapingCircles = (pos: Inputs.OCCT.twoSidesStrictEnum, cirsRem: Inputs.OCCT.fourSidesStrictEnum, lengthExp: number) => {
        const circle1 = wire.createCircleWire({ radius: 1.6, center: [0, 0, 0], direction: [0, 1, 0] });
        const circle2 = wire.createCircleWire({ radius: 1, center: [4, 0, 0], direction: [0, 1, 0] });
        const w = wire.createWireFromTwoCirclesTan({
            circle1,
            circle2,
            keepLines: pos,
            circleRemainders: cirsRem,
            tolerance: 1e-7
        });
        const length = wire.getWireLength({ shape: w });
        expect(length).toEqual(lengthExp);
        w.delete();
    };

    describe("polylines, polygons and lines built through one polygon maker", () => {
        const refusalOf = (act: () => unknown): unknown => {
            try {
                act();
            } catch (failure) {
                return failure;
            }
            return undefined;
        };

        it("should delete every point it hands the kernel", () => {
            // Arrange
            const made: { isDeleted(): boolean }[] = [];
            const original = occt.gp_Pnt;
            Reflect.set(occt, "gp_Pnt", new Proxy(original, {
                construct(target, args): object {
                    const point = Reflect.construct(target, args);
                    made.push(point);
                    return point;
                },
            }));

            // Act
            try {
                wire.createPolylineWire({ points: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 3]] });
                wire.createPolygonWire({ points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] });
                wire.createLineWire({ start: [0, 0, 0], end: [0, 0, 4] });
            } finally {
                Reflect.set(occt, "gp_Pnt", original);
            }

            // Assert
            expect(made).toHaveLength(9);
            expect(made.filter(point => !point.isDeleted())).toEqual([]);
        });

        it("should close a polygon with an edge back to its first point, and leave a polyline open", () => {
            // Act
            const polygon = wire.createPolygonWire({ points: [[0, 0, 0], [2, 0, 0], [2, 0, 2]] });
            const polyline = wire.createPolylineWire({ points: [[0, 0, 0], [2, 0, 0], [2, 0, 2]] });

            // Assert
            expect([edge.getEdges({ shape: polygon }).length, occHelper.wiresService.isWireClosed({ shape: polygon })]).toEqual([3, true]);
            expect([edge.getEdges({ shape: polyline }).length, occHelper.wiresService.isWireClosed({ shape: polyline })]).toEqual([2, false]);
            expect(wire.getWireLength({ shape: polygon })).toBeCloseTo(4 + 2 * Math.SQRT2, 12);
        });

        it.each([
            ["one point", () => wire.createPolylineWire({ points: [[0, 0, 0]] }), "points", "A polyline needs at least two points, and `points` has 1."],
            ["no points", () => wire.createPolygonWire({ points: [] }), "points", "A polygon needs at least two points, and `points` has 0."],
            ["a point repeated", () => wire.createPolylineWire({ points: [[0, 0, 0], [1, 0, 0], [1, 0, 0], [1, 1, 0]] }), "points", "Points 1 and 2 of `points` are the same point, which would make an edge of length 0."],
            ["points closer than 1e-7", () => wire.createPolylineWire({ points: [[0, 0, 0], [1, 0, 0], [1, 0, 5e-8]] }), "points", "Points 1 and 2 of `points` are the same point, which would make an edge of length 0."],
            ["a polygon that repeats its first point", () => wire.createPolygonWire({ points: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 0, 0]] }), "points", "The last point of `points` repeats the first, and a polygon closes itself, so the closing edge would have length 0."],
            ["a line of length 0", () => wire.createLineWire({ start: [1, 2, 3], end: [1, 2, 3] }), "end", "`start` and `end` are the same point, so there is no line between them."],
        ] as [string, () => unknown, string, string][])("should refuse %s, naming the input", (_what, act, property, message) => {
            // Act
            const refusal = refusalOf(act);

            // Assert
            expect(refusal).toMatchObject({ name: "InputError", property, message });
        });

        it("should keep a polyline that ends on its first point closed, and one that passes 2e-7 from a point open to that point", () => {
            // Act
            const loop = wire.createPolylineWire({ points: [[0, 0, 0], [2, 0, 0], [2, 0, 2], [0, 0, 0]] });
            const near = wire.createPolylineWire({ points: [[0, 0, 0], [1, 0, 0], [1, 0, 2e-7]] });

            // Assert
            expect(occHelper.wiresService.isWireClosed({ shape: loop })).toBe(true);
            expect(edge.getEdges({ shape: near })).toHaveLength(2);
        });
    });

    describe("profiles placed before they are built", () => {
        it("should place a profile as a turn about Y, then Y turned onto the direction, then a move, with no copies and no location left on it", () => {
            // Arrange
            const points = occHelper.shapesHelperService.beamIProfile(2, 3, 0.2, 0.3, Inputs.Base.basicAlignmentEnum.midMid);
            const atOrigin = occHelper.wiresService.createPolygonWire({ points });
            const turned = occHelper.transformsService.rotate({ shape: atOrigin, angle: 30, axis: [0, 1, 0] });
            const expected = occHelper.transformsService.alignAndTranslate({ shape: turned, direction: [1, 1, 0], center: [1, 2, 3] });
            let copies = 0;
            const original = occt.BRepBuilderAPI_Transform;
            Reflect.set(occt, "BRepBuilderAPI_Transform", new Proxy(original, {
                construct(target, args): object {
                    copies++;
                    return Reflect.construct(target, args);
                },
            }));

            // Act
            let placed;
            try {
                placed = wire.createIBeamProfileWire({ width: 2, height: 3, webThickness: 0.2, flangeThickness: 0.3, rotation: 30, direction: [1, 1, 0], center: [1, 2, 3] });
            } finally {
                Reflect.set(occt, "BRepBuilderAPI_Transform", original);
            }

            // Assert
            const corners = edge.getCornerPointsOfEdgesForShape({ shape: expected }).map(point => point.map(value => expect.closeTo(value, 12)));
            expect(copies).toBe(0);
            expect(placed.Location().IsIdentity()).toBe(true);
            expect(edge.getCornerPointsOfEdgesForShape({ shape: placed })).toEqual(corners);
        });

        it.each([
            ["rectangle", () => wire.createRectangleWire({ width: 2, length: 4, center: [1, 2, 3], direction: [1, 0, 0] })],
            ["L polygon", () => wire.createLPolygonWire({ widthFirst: 1, lengthFirst: 4, widthSecond: 1, lengthSecond: 3, rotation: 20, center: [1, 2, 3], direction: [0, 0, 1] })],
            ["H beam", () => wire.createHBeamProfileWire({ width: 2, height: 3, webThickness: 0.2, flangeThickness: 0.3, rotation: 20, center: [1, 2, 3], direction: [0, 0, 1] })],
            ["T beam", () => wire.createTBeamProfileWire({ width: 2, height: 3, webThickness: 0.2, flangeThickness: 0.3, rotation: 20, center: [1, 2, 3], direction: [0, 0, 1] })],
            ["U beam", () => wire.createUBeamProfileWire({ width: 2, height: 3, webThickness: 0.2, flangeThickness: 0.3, flangeWidth: 0.5, rotation: 20, center: [1, 2, 3], direction: [0, 0, 1] })],
            ["christmas tree", () => wire.createChristmasTreeWire({ rotation: 20, origin: [1, 2, 3], direction: [0, 0, 1] })],
        ] as [string, () => TopoDS_Wire][])("should leave no location on a %s, its placement written into the geometry", (_what, make) => {
            // Act
            const placed = make();

            // Assert
            expect(placed.Location().IsIdentity()).toBe(true);
        });
    });

    describe("stars, n-gons and parallelograms through the same polygon maker", () => {
        const builtFromLines = (lines: Inputs.Base.Line3[], direction: Inputs.Base.Vector3, center: Inputs.Base.Point3): TopoDS_Wire => {
            const edges = lines.map(line => occHelper.edgesService.lineEdge(line));
            const combined = occHelper.converterService.combineEdgesAndWiresIntoAWire({ shapes: edges });
            return occHelper.transformsService.alignAndTranslate({ shape: combined, direction, center });
        };

        it.each([
            ["star", () => wire.createStarWire({ numRays: 7, outerRadius: 3, innerRadius: 1.5, half: false, offsetOuterEdges: 0.4, center: [1, 2, 3], direction: [1, 1, 0] }), () => occHelper.shapesHelperService.starLines(1.5, 3, 7, false, 0.4), [1, 1, 0], true],
            ["half star", () => wire.createStarWire({ numRays: 7, outerRadius: 3, innerRadius: 1.5, half: true, offsetOuterEdges: 0, center: [1, 2, 3], direction: [1, 1, 0] }), () => occHelper.shapesHelperService.starLines(1.5, 3, 7, true, 0), [1, 1, 0], false],
            ["n-gon", () => wire.createNGonWire({ nrCorners: 7, radius: 2, center: [1, 2, 3], direction: [0, 0, 1] }), () => occHelper.shapesHelperService.ngon(7, 2, [0, 0]), [0, 0, 1], true],
            ["parallelogram", () => wire.createParallelogramWire({ width: 5, height: 2, angle: 15, aroundCenter: false, center: [1, 2, 3], direction: [0, 0, 1] }), () => occHelper.shapesHelperService.parallelogram(5, 2, 15, false), [0, 0, 1], true],
        ] as [string, () => TopoDS_Wire, () => Inputs.Base.Line3[], Inputs.Base.Vector3, boolean][])("should build a %s with the corners edge by edge building gave, without copying it", (_what, make, lines, direction, closed) => {
            // Arrange
            const expected = builtFromLines(lines(), direction, [1, 2, 3]);
            let copies = 0;
            const original = occt.BRepBuilderAPI_Transform;
            Reflect.set(occt, "BRepBuilderAPI_Transform", new Proxy(original, {
                construct(target, args): object {
                    copies++;
                    return Reflect.construct(target, args);
                },
            }));

            // Act
            let placed;
            try {
                placed = make();
            } finally {
                Reflect.set(occt, "BRepBuilderAPI_Transform", original);
            }

            // Assert
            const corners = edge.getCornerPointsOfEdgesForShape({ shape: expected }).map(point => point.map(value => expect.closeTo(value, 12)));
            expect(copies).toBe(0);
            expect(placed.Location().IsIdentity()).toBe(true);
            expect(occHelper.wiresService.isWireClosed({ shape: placed })).toBe(closed);
            expect(edge.getCornerPointsOfEdgesForShape({ shape: placed })).toEqual(corners);
            expect(wire.getWireLength({ shape: placed })).toBeCloseTo(wire.getWireLength({ shape: expected }), 12);
        });

        it("should close a star on the vertex it starts from", () => {
            // Act
            const star = wire.createStarWire({ numRays: 23, outerRadius: 2, innerRadius: 1, half: false, center: [0, 0, 0], direction: [0, 1, 0] });

            // Assert
            const edges = occHelper.edgesService.getEdgesAlongWire({ shape: star });
            expect(edges).toHaveLength(46);
            expect(occHelper.edgesService.startPointOnEdge({ shape: edges[0]! })).toEqual(occHelper.edgesService.endPointOnEdge({ shape: edges[45]! }));
        });

        it.each([
            ["a parallelogram of width 0", () => wire.createParallelogramWire({ width: 0, height: 2, angle: 15, aroundCenter: true, center: [0, 0, 0], direction: [0, 1, 0] }), "Points 0 and 1 of `points` are the same point, which would make an edge of length 0."],
            ["an n-gon of one corner", () => wire.createNGonWire({ nrCorners: 1, radius: 2, center: [0, 0, 0], direction: [0, 1, 0] }), "A polygon needs at least two points, and `points` has 1."],
            ["a star of no rays", () => wire.createStarWire({ numRays: 0, outerRadius: 2, innerRadius: 1, half: false, center: [0, 0, 0], direction: [0, 1, 0] }), "A star needs at least two points, and `points` has 0."],
        ] as [string, () => unknown, string][])("should refuse %s before the kernel sees it", (_what, act, message) => {
            // Act
            let refusal: unknown;
            try {
                act();
            } catch (failure) {
                refusal = failure;
            }

            // Assert
            expect(refusal).toMatchObject({ name: "InputError", property: "points", message });
        });
    });

    describe("fromBaseLine", () => {
        it("should create wire fromBaseLine with basic line", () => {
            const line: Inputs.Base.Line3 = { start: [0, 0, 0], end: [3, 0, 0] };
            const w = wire.fromBaseLine({ line });
            const length = wire.getWireLength({ shape: w });
            expect(length).toBe(3);
            w.delete();
        });

        it("should create wire fromBaseLine with diagonal line", () => {
            const line: Inputs.Base.Line3 = { start: [0, 0, 0], end: [3, 4, 0] };
            const w = wire.fromBaseLine({ line });
            const length = wire.getWireLength({ shape: w });
            expect(length).toBe(5);
            w.delete();
        });

        it("should create wire fromBaseLine with 3D diagonal line", () => {
            const line: Inputs.Base.Line3 = { start: [1, 2, 3], end: [4, 6, 3] };
            const w = wire.fromBaseLine({ line });
            const length = wire.getWireLength({ shape: w });
            expect(length).toBe(5);
            w.delete();
        });
    });

    describe("fromBaseLines", () => {
        it("should create wires fromBaseLines with multiple lines", () => {
            const lines: Inputs.Base.Line3[] = [
                { start: [0, 0, 0], end: [1, 0, 0] },
                { start: [0, 0, 0], end: [0, 2, 0] },
                { start: [0, 0, 0], end: [0, 0, 3] },
            ];
            const wires = wire.fromBaseLines({ lines });
            expect(wires.length).toBe(3);
            const lengths = wires.map(w => wire.getWireLength({ shape: w }));
            expect(lengths[0]).toBe(1);
            expect(lengths[1]).toBe(2);
            expect(lengths[2]).toBe(3);
            wires.forEach(w => w.delete());
        });

        it("should create empty array fromBaseLines with empty input", () => {
            const wires = wire.fromBaseLines({ lines: [] });
            expect(wires.length).toBe(0);
        });
    });

    describe("fromBaseSegment", () => {
        it("should create wire fromBaseSegment with basic segment", () => {
            const segment: Inputs.Base.Segment3 = [[0, 0, 0], [5, 0, 0]];
            const w = wire.fromBaseSegment({ segment });
            const length = wire.getWireLength({ shape: w });
            expect(length).toBe(5);
            w.delete();
        });

        it("should create wire fromBaseSegment with 3D segment", () => {
            const segment: Inputs.Base.Segment3 = [[1, 1, 1], [4, 5, 1]];
            const w = wire.fromBaseSegment({ segment });
            const length = wire.getWireLength({ shape: w });
            expect(length).toBe(5);
            w.delete();
        });
    });

    describe("fromBaseSegments", () => {
        it("should create wires fromBaseSegments with multiple segments", () => {
            const segments: Inputs.Base.Segment3[] = [
                [[0, 0, 0], [2, 0, 0]],
                [[0, 0, 0], [0, 3, 0]],
                [[0, 0, 0], [0, 0, 4]],
            ];
            const wires = wire.fromBaseSegments({ segments });
            expect(wires.length).toBe(3);
            const lengths = wires.map(w => wire.getWireLength({ shape: w }));
            expect(lengths[0]).toBe(2);
            expect(lengths[1]).toBe(3);
            expect(lengths[2]).toBe(4);
            wires.forEach(w => w.delete());
        });

        it("should create empty array fromBaseSegments with empty input", () => {
            const wires = wire.fromBaseSegments({ segments: [] });
            expect(wires.length).toBe(0);
        });
    });

    describe("fromPoints", () => {
        it("should create polyline wire fromPoints for non-closed points", () => {
            const points: Inputs.Base.Point3[] = [
                [0, 0, 0],
                [1, 0, 0],
                [1, 1, 0],
            ];
            const w = wire.fromPoints({ points });
            const length = wire.getWireLength({ shape: w });
            expect(length).toBe(2);
            w.delete();
        });

        it("should throw fromPoints with only one point", () => {
            const points: Inputs.Base.Point3[] = [
                [0, 0, 0],
            ];
            expect(() => wire.fromPoints({ points })).toThrow("At least two points are required");
        });

        it("should create square-like polyline fromPoints", () => {
            const points: Inputs.Base.Point3[] = [
                [0, 0, 0],
                [2, 0, 0],
                [2, 2, 0],
                [0, 2, 0],
            ];
            const w = wire.fromPoints({ points });
            const length = wire.getWireLength({ shape: w });
            expect(length).toBe(6);
            expect(occHelper.wiresService.isWireClosed({ shape: w })).toBe(false);
            w.delete();
        });

        it("should close the wire when the last point repeats the first, without a zero-length edge", () => {
            // Arrange
            const points: Inputs.Base.Point3[] = [
                [0, 0, 0],
                [2, 0, 0],
                [2, 2, 0],
                [0, 2, 0],
                [0, 0, 0],
            ];

            // Act
            const w = wire.fromPoints({ points });

            // Assert
            expect(wire.getWireLength({ shape: w })).toBe(8);
            expect(occHelper.wiresService.isWireClosed({ shape: w })).toBe(true);
            expect(edge.getEdges({ shape: w }).length).toBe(4);
            w.delete();
        });

        it("should not close the wire when only the first two points coincide", () => {
            // Arrange
            const points: Inputs.Base.Point3[] = [
                [0, 0, 0],
                [0, 0, 0],
                [2, 0, 0],
                [2, 2, 0],
            ];

            // Act
            const build = () => wire.fromPoints({ points });

            // Assert
            expect(build).toThrow();
        });
    });

    describe("fromBasePolyline", () => {
        it("should create open polyline wire fromBasePolyline", () => {
            const polyline: Inputs.Base.Polyline3 = {
                points: [
                    [0, 0, 0],
                    [3, 0, 0],
                    [3, 4, 0],
                ],
                isClosed: false
            };
            const w = wire.fromBasePolyline({ polyline });
            const length = wire.getWireLength({ shape: w });
            expect(length).toBe(7);
            w.delete();
        });

        it("should create closed polygon wire fromBasePolyline", () => {
            const polyline: Inputs.Base.Polyline3 = {
                points: [
                    [0, 0, 0],
                    [3, 0, 0],
                    [3, 4, 0],
                ],
                isClosed: true
            };
            const w = wire.fromBasePolyline({ polyline });
            const length = wire.getWireLength({ shape: w });
            expect(length).toBe(12);
            w.delete();
        });

        it("should create closed square wire fromBasePolyline", () => {
            const polyline: Inputs.Base.Polyline3 = {
                points: [
                    [0, 0, 0],
                    [2, 0, 0],
                    [2, 2, 0],
                    [0, 2, 0],
                ],
                isClosed: true
            };
            const w = wire.fromBasePolyline({ polyline });
            const length = wire.getWireLength({ shape: w });
            expect(length).toBe(8);
            w.delete();
        });
    });

    describe("fromBaseTriangle", () => {
        it("should create triangle wire fromBaseTriangle", () => {
            const triangle: Inputs.Base.Triangle3 = [
                [0, 0, 0],
                [3, 0, 0],
                [0, 4, 0],
            ];
            const w = wire.fromBaseTriangle({ triangle });
            const length = wire.getWireLength({ shape: w });
            expect(length).toBe(12);
            w.delete();
        });

        it("should create equilateral triangle wire fromBaseTriangle", () => {
            const s = 2;
            const h = s * Math.sqrt(3) / 2;
            const triangle: Inputs.Base.Triangle3 = [
                [0, 0, 0],
                [s, 0, 0],
                [s / 2, 0, h],
            ];
            const w = wire.fromBaseTriangle({ triangle });
            const length = wire.getWireLength({ shape: w });
            expect(length).toBeCloseTo(6, 10);
            w.delete();
        });
    });

    describe("fromBaseMesh", () => {
        it("should create triangle wires fromBaseMesh", () => {
            const mesh: Inputs.Base.Mesh3 = [
                [[0, 0, 0], [3, 0, 0], [0, 4, 0]],
                [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
            ];
            const wires = wire.fromBaseMesh({ mesh });
            expect(wires.length).toBe(2);
            const lengths = wires.map(w => wire.getWireLength({ shape: w }));
            expect(lengths[0]).toBe(12);
            expect(lengths[1]).toBeCloseTo(2 + Math.sqrt(2), 10);
            wires.forEach(w => w.delete());
        });

        it("should create empty array fromBaseMesh with empty mesh", () => {
            const wires = wire.fromBaseMesh({ mesh: [] });
            expect(wires.length).toBe(0);
        });
    });

    describe("createLineWireWithExtensions", () => {
        it("should create line wire with extensions at both ends", () => {
            const w = wire.createLineWireWithExtensions({
                start: [0, 0, 0],
                end: [0, 1, 0],
                extensionStart: 0.5,
                extensionEnd: 0.5
            });
            const length = wire.getWireLength({ shape: w });
            expect(length).toBe(2);
            w.delete();
        });

        it("should create line wire with extension at start only", () => {
            const w = wire.createLineWireWithExtensions({
                start: [0, 0, 0],
                end: [0, 2, 0],
                extensionStart: 1,
                extensionEnd: 0
            });
            const length = wire.getWireLength({ shape: w });
            expect(length).toBe(3);
            w.delete();
        });

        it("should create line wire with extension at end only", () => {
            const w = wire.createLineWireWithExtensions({
                start: [0, 0, 0],
                end: [5, 0, 0],
                extensionStart: 0,
                extensionEnd: 2
            });
            const length = wire.getWireLength({ shape: w });
            expect(length).toBe(7);
            w.delete();
        });

        it("should create line wire with negative extensions (shortening)", () => {
            const w = wire.createLineWireWithExtensions({
                start: [0, 0, 0],
                end: [0, 10, 0],
                extensionStart: -1,
                extensionEnd: -1
            });
            const length = wire.getWireLength({ shape: w });
            expect(length).toBe(8);
            w.delete();
        });
    });

    describe("hexagonsInGrid", () => {
        it("should create hexagons in a grid", () => {
            const wires = wire.hexagonsInGrid({
                width: 5,
                height: 5,
                nrHexagonsInWidth: 2,
                nrHexagonsInHeight: 2,
            });
            expect(wires.length).toBe(4);
            const allClosed = wires.every(w => occHelper.wiresService.isWireClosed({ shape: w }));
            expect(allClosed).toBe(true);
            wires.forEach(w => {
                const length = wire.getWireLength({ shape: w });
                expect(length).toBeCloseTo(7.772757295452931);
            });
            wires.forEach(w => w.delete());
        });

        it("should create hexagons in a grid with flat top", () => {
            const wires = wire.hexagonsInGrid({
                width: 6,
                height: 6,
                nrHexagonsInWidth: 3,
                nrHexagonsInHeight: 3,
                flatTop: true,
            });
            expect(wires.length).toBe(9);
            wires.forEach(w => {
                const length = wire.getWireLength({ shape: w });
                expect(length).toBeCloseTo(6.58510478253727);
            });
            wires.forEach(w => w.delete());
        });

        it("should walk a scale pattern across the grid, wrapping when it runs out", () => {
            const inputs = new Inputs.OCCT.HexagonsInGridDto();
            inputs.width = 9;
            inputs.height = 3;
            inputs.nrHexagonsInWidth = 3;
            inputs.nrHexagonsInHeight = 1;
            inputs.scalePatternWidth = [1, 0.5];
            inputs.scalePatternHeight = [1, 0.5];

            // Act
            const wires = wire.hexagonsInGrid(inputs);

            const lengths = wires.map(w => wire.getWireLength({ shape: w }));
            expect(lengths[0]).toBeGreaterThan(lengths[1]!);
            expect(lengths[2]).toBeCloseTo(lengths[0]!, 6);

            wires.forEach(w => w.delete());
        });

        it("should leave out the hexagons an inclusion pattern says to skip", () => {
            // Arrange
            const inputs = new Inputs.OCCT.HexagonsInGridDto();
            inputs.width = 9;
            inputs.height = 3;
            inputs.nrHexagonsInWidth = 3;
            inputs.nrHexagonsInHeight = 1;
            inputs.inclusionPattern = [true, false];

            // Act
            const wires = wire.hexagonsInGrid(inputs);

            expect(wires).toHaveLength(2);

            wires.forEach(w => w.delete());
        });

        it("should round the corners a fillet pattern asks for", () => {
            // Arrange
            const inputs = new Inputs.OCCT.HexagonsInGridDto();
            inputs.width = 9;
            inputs.height = 3;
            inputs.nrHexagonsInWidth = 2;
            inputs.nrHexagonsInHeight = 1;
            inputs.filletPattern = [0.2, 0];

            // Act
            const wires = wire.hexagonsInGrid(inputs);

            const lengths = wires.map(w => wire.getWireLength({ shape: w }));
            expect(lengths[0]).toBeLessThan(lengths[1]!);

            wires.forEach(w => w.delete());
        });

        it("should create single hexagon", () => {
            const wires = wire.hexagonsInGrid({
                width: 2,
                height: 2,
                nrHexagonsInWidth: 1,
                nrHexagonsInHeight: 1,
            });

            expect(wires.length).toBe(1);
            const length = wire.getWireLength({ shape: wires[0]! });
            expect(length).toBeCloseTo(6.472135954999578);
            const isClosed = occHelper.wiresService.isWireClosed({ shape: wires[0]! });
            expect(isClosed).toBe(true);
            wires.forEach(w => w.delete());
        });
    });

    describe("midPointOnWire", () => {
        it("should get midpoint on a straight line wire", () => {
            const w = wire.createLineWire({ start: [0, 0, 0], end: [10, 0, 0] });
            const midPt = wire.midPointOnWire({ shape: w });
            expect(midPt[0]).toBeCloseTo(5, 10);
            expect(midPt[1]).toBeCloseTo(0, 10);
            expect(midPt[2]).toBeCloseTo(0, 10);
            w.delete();
        });

        it("should get midpoint on a 3D line wire", () => {
            const w = wire.createLineWire({ start: [0, 0, 0], end: [4, 6, 8] });
            const midPt = wire.midPointOnWire({ shape: w });
            expect(midPt[0]).toBeCloseTo(2, 10);
            expect(midPt[1]).toBeCloseTo(3, 10);
            expect(midPt[2]).toBeCloseTo(4, 10);
            w.delete();
        });

        it("should get midpoint on a polyline wire", () => {
            const w = wire.createPolylineWire({
                points: [[0, 0, 0], [4, 0, 0], [4, 4, 0]]
            });
            const midPt = wire.midPointOnWire({ shape: w });
            expect(midPt[0]).toBeCloseTo(4, 10);
            expect(midPt[1]).toBeCloseTo(0, 10);
            expect(midPt[2]).toBeCloseTo(0, 10);
            w.delete();
        });
    });

    describe("textWires", () => {
        it("should create text wires for simple text", () => {
            const dto = new Inputs.OCCT.TextWiresDto("A", 0, 0, 1);
            const wires = wire.textWires(dto);
            expect(wires.length).toBe(3);
            wires.forEach((w: TopoDS_Wire) => w.delete());
        });

        it("should create text wires for multiple characters", () => {
            const dto = new Inputs.OCCT.TextWiresDto("Hi", 0, 0, 1);
            const wires = wire.textWires(dto);
            expect(wires.length).toBe(5);
            wires.forEach((w: TopoDS_Wire) => w.delete());
        });

        it("should create text wires with custom height", () => {
            const dto1 = new Inputs.OCCT.TextWiresDto("X", 0, 0, 1);
            const dto2 = new Inputs.OCCT.TextWiresDto("X", 0, 0, 2);
            const wires1 = wire.textWires(dto1);
            const wires2 = wire.textWires(dto2);

            const totalLength1 = wires1.reduce((sum: number, w: TopoDS_Wire) => sum + wire.getWireLength({ shape: w }), 0);
            const totalLength2 = wires2.reduce((sum: number, w: TopoDS_Wire) => sum + wire.getWireLength({ shape: w }), 0);

            expect(totalLength2).toBeGreaterThan(totalLength1);
            wires1.forEach((w: TopoDS_Wire) => w.delete());
            wires2.forEach((w: TopoDS_Wire) => w.delete());
        });
    });

    describe("textWiresWithData", () => {
        it("should create text wires with data for simple text", () => {
            const dto = new Inputs.OCCT.TextWiresDto("A", 0, 0, 1);
            const result = wire.textWiresWithData(dto);
            expect(result).toBeDefined();
            expect(result.data).toBeDefined();
            expect(result.compound).toBeDefined();
            result.compound!.delete();
        });

        it("should measure the block along X and Z, where the glyphs lie, and name each character's compound", () => {
            // Arrange
            const dto = new Inputs.OCCT.TextWiresDto("AB", 0, 0, 1);

            // Act
            const result = wire.textWiresWithData(dto);

            // Assert
            const data = result.data!;
            expect(data.height).toBeCloseTo(1, 1);
            expect(data.width).toBeGreaterThan(data.height);
            expect(data.center).toHaveLength(3);
            expect(data.characters!.map(c => c.id)).toEqual(["char-0", "char-1"]);
            const ids = result.shapes!.map(s => s.id);
            data.characters!.forEach(c => expect(ids).toContain(c.shapes!.compound));
            result.compound!.delete();
        });
    });

    describe("createIBeamProfileWire", () => {
        it("should create I-beam profile wire with default values", () => {
            const dto = new Inputs.OCCT.IBeamProfileDto(2, 3, 0.2, 0.3);
            const w = wire.createIBeamProfileWire(dto);
            const length = wire.getWireLength({ shape: w });
            expect(length).toBeCloseTo(13.6);
            const isClosed = occHelper.wiresService.isWireClosed({ shape: w });
            expect(isClosed).toBe(true);
            w.delete();
        });

        it("should create I-beam profile wire with custom dimensions", () => {
            const dto = new Inputs.OCCT.IBeamProfileDto(4, 6, 0.4, 0.6);
            const w = wire.createIBeamProfileWire(dto);
            const length = wire.getWireLength({ shape: w });
            expect(length).toBeCloseTo(27.2);
            w.delete();
        });
    });

    describe("createHBeamProfileWire", () => {
        it("should create H-beam profile wire with default values", () => {
            const dto = new Inputs.OCCT.HBeamProfileDto(2, 3, 0.2, 0.3);
            const w = wire.createHBeamProfileWire(dto);
            const length = wire.getWireLength({ shape: w });
            expect(length).toBeCloseTo(15.6);
            const isClosed = occHelper.wiresService.isWireClosed({ shape: w });
            expect(isClosed).toBe(true);
            w.delete();
        });

        it("should create H-beam profile wire with custom dimensions", () => {
            const dto = new Inputs.OCCT.HBeamProfileDto(3, 4, 0.3, 0.4);
            const w = wire.createHBeamProfileWire(dto);
            const length = wire.getWireLength({ shape: w });
            expect(length).toBeCloseTo(21.4);
            w.delete();
        });
    });

    describe("createTBeamProfileWire", () => {
        it("should create T-beam profile wire with default values", () => {
            const dto = new Inputs.OCCT.TBeamProfileDto(2, 2, 0.2, 0.3);
            const w = wire.createTBeamProfileWire(dto);
            const length = wire.getWireLength({ shape: w });
            expect(length).toBeCloseTo(8);
            const isClosed = occHelper.wiresService.isWireClosed({ shape: w });
            expect(isClosed).toBe(true);
            w.delete();
        });

        it("should create T-beam profile wire with custom dimensions", () => {
            const dto = new Inputs.OCCT.TBeamProfileDto(3, 3, 0.3, 0.5);
            const w = wire.createTBeamProfileWire(dto);
            const length = wire.getWireLength({ shape: w });
            expect(length).toBeCloseTo(12);
            w.delete();
        });
    });

    describe("createUBeamProfileWire", () => {
        it("should create U-beam profile wire with default values", () => {
            const dto = new Inputs.OCCT.UBeamProfileDto(2, 3, 0.2, 0.3, 0.5);
            const w = wire.createUBeamProfileWire(dto);
            const length = wire.getWireLength({ shape: w });
            expect(length).toBeCloseTo(15);
            const isClosed = occHelper.wiresService.isWireClosed({ shape: w });
            expect(isClosed).toBe(true);
            w.delete();
        });

        it("should create U-beam profile wire with custom dimensions", () => {
            const dto = new Inputs.OCCT.UBeamProfileDto(4, 5, 0.4, 0.5, 1);
            const w = wire.createUBeamProfileWire(dto);
            const length = wire.getWireLength({ shape: w });
            expect(length).toBeCloseTo(26);
            w.delete();
        });
    });

    describe("isWireClosed", () => {
        it("should return true for closed circle wire", () => {
            const w = wire.createCircleWire({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
            const isClosed = wire.isWireClosed({ shape: w });
            expect(isClosed).toBe(true);
            w.delete();
        });

        it("should return true for closed polygon wire", () => {
            const w = wire.createPolygonWire({
                points: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]]
            });
            const isClosed = wire.isWireClosed({ shape: w });
            expect(isClosed).toBe(true);
            w.delete();
        });

        it("should return false for open line wire", () => {
            const w = wire.createLineWire({ start: [0, 0, 0], end: [1, 0, 0] });
            const isClosed = wire.isWireClosed({ shape: w });
            expect(isClosed).toBe(false);
            w.delete();
        });

        it("should return false for open polyline wire", () => {
            const w = wire.createPolylineWire({
                points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]]
            });
            const isClosed = wire.isWireClosed({ shape: w });
            expect(isClosed).toBe(false);
            w.delete();
        });

        it("should return true for closed square wire", () => {
            const w = wire.createSquareWire({ size: 2, center: [0, 0, 0], direction: [0, 1, 0] });
            const isClosed = wire.isWireClosed({ shape: w });
            expect(isClosed).toBe(true);
            w.delete();
        });

        it("should return true for closed rectangle wire", () => {
            const w = wire.createRectangleWire({ width: 3, length: 4, center: [0, 0, 0], direction: [0, 1, 0] });
            const isClosed = wire.isWireClosed({ shape: w });
            expect(isClosed).toBe(true);
            w.delete();
        });
    });

    describe("interpolation parametrization + bezier degree", () => {
        const diamond: Inputs.Base.Point3[] = [[1, 0, 0], [0, 1, 0], [-1, 0, 0], [0, -1, 0]];

        const bboxAsymmetry = (w: TopoDS_Wire): number => {
            const pts = occHelper.wiresService.divideWireByEqualDistanceToPoints({
                shape: w, nrOfDivisions: 400, removeEndPoint: true, removeStartPoint: false,
            });
            let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
            for (const p of pts) {
                xmin = Math.min(xmin, p[0]); xmax = Math.max(xmax, p[0]);
                ymin = Math.min(ymin, p[1]); ymax = Math.max(ymax, p[1]);
            }
            return Math.max(Math.abs(xmin + xmax), Math.abs(ymin + ymax), Math.abs((xmax - xmin) - (ymax - ymin)));
        };

        it("symmetric interpolation of a diamond is symmetric", () => {
            const w = wire.interpolatePointsSymmetric({ points: diamond, tolerance: 1e-7 });
            expect(w.IsNull()).toBe(false);
            expect(bboxAsymmetry(w)).toBeLessThan(1e-5);
            w.delete();
        });

        it("periodic interpolation builds a valid closed wire", () => {
            const w = wire.interpolatePoints({
                points: diamond, periodic: true,
                parametrization: Inputs.OCCT.bSplineParametrizationEnum.centripetal, tolerance: 1e-7,
            });
            expect(w.IsNull()).toBe(false);
            w.delete();
        });

        it("interpolation honours end tangents", () => {
            const w = wire.interpolatePoints({
                points: [[0, 0, 0], [1, 1, 0], [2, 0, 0]], periodic: false,
                startTangent: [0, 1, 0], endTangent: [0, -1, 0], tolerance: 1e-7,
            });
            expect(w.IsNull()).toBe(false);
            w.delete();
        });

        it("createBezier builds a low-degree curve", () => {
            const w = wire.createBezier({ points: [[0, 0, 0], [1, 2, 0], [2, 0, 0]], closed: false });
            expect(w.IsNull()).toBe(false);
            w.delete();
        });

        it("createBezier builds a bounded-degree curve for many control points", () => {
            const pts: Inputs.Base.Point3[] = Array.from({ length: 60 }, (_, i) => [i, i % 2 === 0 ? 1 : -1, 0]);
            const w = wire.createBezier({ points: pts, closed: false, degree: 3 });
            expect(w.IsNull()).toBe(false);
            w.delete();
        });
    });
    describe("helices and spirals", () => {
        it("should wind a helix of the height it was given", () => {
            // Act
            const helix = wire.createHelixWire({
                radius: 5, pitch: 2, height: 10, center: [0, 0, 0], direction: [0, 1, 0],
                clockwise: true, tolerance: 1e-7
            });

            // Assert
            const start = wire.startPointOnWire({ shape: helix });
            const end = wire.endPointOnWire({ shape: helix });
            expect(end[1] - start[1]).toBeCloseTo(10, 3);
            expect(wire.getWireLength({ shape: helix })).toBeGreaterThan(10);

            helix.delete();
        });

        it("should wind a helix the other way round when asked", () => {
            // Act
            const clockwise = wire.createHelixWire({
                radius: 5, pitch: 2, height: 10, center: [0, 0, 0], direction: [0, 1, 0],
                clockwise: true, tolerance: 1e-7
            });
            const anticlockwise = wire.createHelixWire({
                radius: 5, pitch: 2, height: 10, center: [0, 0, 0], direction: [0, 1, 0],
                clockwise: false, tolerance: 1e-7
            });

            // Assert
            const oneWay = wire.pointOnWireAtParam({ shape: clockwise, param: 0.25 });
            const otherWay = wire.pointOnWireAtParam({ shape: anticlockwise, param: 0.25 });
            expect(oneWay).not.toEqual(otherWay);

            clockwise.delete();
            anticlockwise.delete();
        });

        it("should wind a helix by the number of turns it was given instead of a height", () => {
            // Act
            const helix = wire.createHelixWireByTurns({
                radius: 5, pitch: 2, numTurns: 3, center: [0, 0, 0], direction: [0, 1, 0],
                clockwise: true, tolerance: 1e-7
            });

            const start = wire.startPointOnWire({ shape: helix });
            const end = wire.endPointOnWire({ shape: helix });
            expect(end[1] - start[1]).toBeCloseTo(6, 3);

            helix.delete();
        });

        it("should widen a tapered helix from one radius to the other", () => {
            // Act
            const helix = wire.createTaperedHelixWire({
                startRadius: 2, endRadius: 6, pitch: 2, height: 10, center: [0, 0, 0],
                direction: [0, 1, 0], clockwise: true, tolerance: 1e-7
            });

            // Assert
            const start = wire.startPointOnWire({ shape: helix });
            const end = wire.endPointOnWire({ shape: helix });
            const radiusAt = (point: Inputs.Base.Point3): number => Math.hypot(point[0], point[2]);
            expect(radiusAt(start)).toBeCloseTo(2, 2);
            expect(radiusAt(end)).toBeCloseTo(6, 2);

            helix.delete();
        });

        it("should wind a flat spiral in one plane", () => {
            // Act
            const spiral = wire.createFlatSpiralWire({
                startRadius: 1, endRadius: 5, numTurns: 4, center: [0, 0, 0],
                direction: [0, 1, 0], clockwise: true, tolerance: 1e-7
            });

            const start = wire.startPointOnWire({ shape: spiral });
            const end = wire.endPointOnWire({ shape: spiral });
            expect(start[1]).toBeCloseTo(0, 2);
            expect(end[1]).toBeCloseTo(0, 2);
            expect(Math.hypot(end[0], end[2])).toBeCloseTo(5, 2);

            spiral.delete();
        });
    });

    describe("bezier wires that close on themselves", () => {
        it("should build a periodic bezier that comes back to where it started", () => {
            // Act
            const bezier = wire.createBezier({
                points: [[0, 0, 0], [5, 0, 0], [5, 0, 5], [0, 0, 5]], closed: true
            });

            // Assert
            expect(wire.isWireClosed({ shape: bezier })).toBe(true);

            bezier.delete();
        });

        it("should build a weighted bezier that closes, taking one weight per point", () => {
            // Act
            const bezier = wire.createBezierWeights({
                points: [[0, 0, 0], [5, 0, 0], [5, 0, 5], [0, 0, 5]],
                weights: [1, 0.5, 0.5, 1, 1],
                closed: true,
            });

            // Assert
            expect(wire.getWireLength({ shape: bezier })).toBeGreaterThan(0);

            bezier.delete();
        });

        it("should refuse a weighted bezier whose weights do not match its points", () => {
            // Act
            const act = (): TopoDS_Wire => wire.createBezierWeights({
                points: [[0, 0, 0], [5, 0, 0], [5, 0, 5]], weights: [1, 1], closed: false
            });

            // Assert
            expect(act).toThrow(/points and weights/);
        });

        it("should refuse a closed weighted bezier whose weights do not match its points", () => {
            // Act
            const act = (): TopoDS_Wire => wire.createBezierWeights({
                points: [[0, 0, 0], [5, 0, 0], [5, 0, 5]], weights: [1, 1, 1, 1, 1], closed: true
            });

            // Assert
            expect(act).toThrow(/points must be one less/);
        });
    });
    describe("rebuilding a wire and moving where it starts", () => {
        it("should rebuild every edge of a wire at the degree it was given", () => {
            // Arrange
            const circle = wire.createCircleWire({ radius: 5, center: [0, 0, 0], direction: [0, 1, 0] });

            // Act
            const rebuilt = wire.rebuildWireDegree({ shape: circle, degree: 3, tolerance: 1e-7 });

            expect(wire.isWireClosed({ shape: rebuilt })).toBe(true);
            expect(wire.getWireLength({ shape: rebuilt })).toBeCloseTo(wire.getWireLength({ shape: circle }), 3);

            circle.delete();
            rebuilt.delete();
        });

        it("should move the seam of a wire to another parameter along it", () => {
            // Arrange
            const circle = wire.createCircleWire({ radius: 5, center: [0, 0, 0], direction: [0, 1, 0] });
            const before = wire.startPointOnWire({ shape: circle });

            // Act
            const moved = wire.moveWireSeamByParameter({ shape: circle, parameter: 0.25 });

            // Assert
            const after = wire.startPointOnWire({ shape: moved });
            expect(after).not.toEqual(before);
            expect(wire.getWireLength({ shape: moved })).toBeCloseTo(wire.getWireLength({ shape: circle }), 3);

            circle.delete();
            moved.delete();
        });

        it("should move the seam of a wire a given distance along it", () => {
            // Arrange
            const circle = wire.createCircleWire({ radius: 5, center: [0, 0, 0], direction: [0, 1, 0] });
            const before = wire.startPointOnWire({ shape: circle });

            // Act
            const moved = wire.moveWireSeamByLength({ shape: circle, length: 5 });

            // Assert
            expect(wire.startPointOnWire({ shape: moved })).not.toEqual(before);

            circle.delete();
            moved.delete();
        });
    });

    describe("debugInfo", () => {
        it("should describe a wire it was given", () => {
            // Arrange
            const square = wire.createSquareWire({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });

            // Act
            const info = wire.debugInfo({ shape: square });

            // Assert
            expect(info.valid).toBe(true);
            expect(info.nbEdges).toBe(4);
            expect(info.closed).toBe(true);
            expect(info.totalLength).toBeCloseTo(40, 5);
            expect(info.edges).toHaveLength(4);

            square.delete();
        });

        it("should say a wire that is not there is not valid, rather than fault", () => {
            // Act
            const noWire: TopoDS_Wire = undefined!;
            const info = wire.debugInfo({ shape: noWire });

            // Assert
            expect(info).toEqual({ valid: false, nbEdges: 0, closed: false, totalLength: 0, edges: [] });
        });
    });
    describe("interpolating through points, and the knobs that changes", () => {
        const CORNERS: Inputs.Base.Point3[] = [[0, 0, 0], [1, 0, 0], [10, 0, 3], [12, 0, 12]];

        it("should follow a uniform parametrization when it was asked for one", () => {
            // Act
            const uniform = wire.interpolatePoints({
                points: CORNERS, periodic: false, tolerance: 1e-7,
                parametrization: Inputs.OCCT.bSplineParametrizationEnum.uniform,
            });
            const chordal = wire.interpolatePoints({
                points: CORNERS, periodic: false, tolerance: 1e-7,
                parametrization: Inputs.OCCT.bSplineParametrizationEnum.chordLength,
            });

            expect(wire.getWireLength({ shape: uniform }))
                .not.toBeCloseTo(wire.getWireLength({ shape: chordal }), 6);

            uniform.delete();
            chordal.delete();
        });

        it("should follow a centripetal parametrization when it was asked for one", () => {
            // Act
            const centripetal = wire.interpolatePoints({
                points: CORNERS, periodic: false, tolerance: 1e-7,
                parametrization: Inputs.OCCT.bSplineParametrizationEnum.centripetal,
            });

            // Assert
            expect(wire.getWireLength({ shape: centripetal })).toBeGreaterThan(0);

            centripetal.delete();
        });

        it("should leave the curve at a tangent it was given for every point", () => {
            // Act
            const free = wire.interpolatePoints({ points: CORNERS, periodic: false, tolerance: 1e-7 });
            const constrained = wire.interpolatePoints({
                points: CORNERS, periodic: false, tolerance: 1e-7,
                tangents: [[1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1]],
            });

            expect(wire.getWireLength({ shape: constrained }))
                .not.toBeCloseTo(wire.getWireLength({ shape: free }), 6);

            free.delete();
            constrained.delete();
        });

        it("should take a tangent only where one was given, leaving the rest free", () => {
            // Act
            const created = wire.interpolatePoints({
                points: CORNERS, periodic: false, tolerance: 1e-7,
                tangents: [[1, 0, 0], undefined, undefined, [0, 0, -1]],
            });

            // Assert
            expect(wire.getWireLength({ shape: created })).toBeGreaterThan(0);

            created.delete();
        });
    });

    describe("bezier wires built from poles rather than through points", () => {
        it("should build a periodic bezier from its poles that closes on itself", () => {
            // Act
            const created = wire.createBezier({
                points: [[0, 0, 0], [10, 0, 0], [10, 0, 10], [0, 0, 10]],
                closed: false, periodic: true, degree: 3,
            });

            // Assert
            expect(wire.isWireClosed({ shape: created })).toBe(true);

            created.delete();
        });

        it("should build a periodic weighted bezier from its poles", () => {
            // Act
            const created = wire.createBezierWeights({
                points: [[0, 0, 0], [10, 0, 0], [10, 0, 10], [0, 0, 10]],
                weights: [1, 0.5, 1, 0.5],
                closed: false, periodic: true, degree: 3,
            });

            // Assert
            expect(wire.isWireClosed({ shape: created })).toBe(true);

            created.delete();
        });

        it("should refuse a periodic weighted bezier whose weights do not match its poles", () => {
            // Act
            const act = (): TopoDS_Wire => wire.createBezierWeights({
                points: [[0, 0, 0], [10, 0, 0], [10, 0, 10]],
                weights: [1, 1], closed: false, periodic: true,
            });

            // Assert
            expect(act).toThrow(/when bezier is periodic/);
        });
    });

    describe("defaults left to the DTO", () => {
        it("should draw each line of a list from the default ends it leaves out", () => {
            // Act
            const lines = wire.createLines({ lines: [{}, { end: [0, 0, 5] }] }) as TopoDS_Wire[];

            // Assert
            expect(lines.map((w) => wire.getWireLength({ shape: w }))).toEqual([1, 5]);
            lines.forEach((w) => w.delete());
        });

        it("should draw each line of a list from the default ends it hands as undefined", () => {
            // Act
            const lines = wire.createLines({ lines: [{ start: undefined, end: undefined }, { start: undefined, end: [0, 0, 5] }], returnCompound: undefined }) as TopoDS_Wire[];

            // Assert
            expect(lines.map((w) => wire.getWireLength({ shape: w }))).toEqual([1, 5]);
            lines.forEach((w) => w.delete());
        });

        it("should draw the circle the spelled out DTO draws when every default is left out", () => {
            // Act
            const leftOut = wire.createCircleWire({});
            const spelled = wire.createCircleWire(new Inputs.OCCT.CircleDto());

            // Assert
            expect(wire.getWireLength({ shape: leftOut })).toBeCloseTo(2 * Math.PI, 9);
            expect(wire.getWireLength({ shape: leftOut })).toBe(wire.getWireLength({ shape: spelled }));
            leftOut.delete();
            spelled.delete();
        });

        it("should draw the circle the spelled out DTO draws when every default is handed as undefined", () => {
            // Act
            const handedUndefined = wire.createCircleWire({ radius: undefined, center: undefined, direction: undefined });

            // Assert
            expect(wire.getWireLength({ shape: handedUndefined })).toBeCloseTo(2 * Math.PI, 9);
            handedUndefined.delete();
        });
    });

    describe("internal builders handed partial objects", () => {
        const zigzag: Inputs.Base.Point3[] = [[0, 0, 0], [1, 1, 0], [2, 0, 0], [3, 1, 0]];

        it("should make a line wire from the default ends a partial object leaves out", () => {
            // Act
            const leftOut = occHelper.wiresService.createLineWire({});
            const oneEndGiven = occHelper.wiresService.createLineWire({ start: undefined, end: [0, 0, 2] });

            // Assert
            expect(wire.getWireLength({ shape: leftOut })).toBe(1);
            expect(wire.getWireLength({ shape: oneEndGiven })).toBe(2);
            leftOut.delete();
            oneEndGiven.delete();
        });

        it("should interpolate points with the default periodicity, tolerance and parametrization a partial object leaves out", () => {
            // Act
            const leftOut = occHelper.wiresService.interpolatePoints({ points: zigzag });
            const spelled = occHelper.wiresService.interpolatePoints(Object.assign(new Inputs.OCCT.InterpolationDto(), { points: zigzag }));

            // Assert
            expect(wire.isWireClosed({ shape: leftOut })).toBe(false);
            expect(wire.getWireLength({ shape: leftOut })).toBe(wire.getWireLength({ shape: spelled }));
            leftOut.delete();
            spelled.delete();
        });

        it("should lay text out with the text DTO's own line spacing when a partial object leaves it out", () => {
            // Act
            const leftOut = occHelper.wiresService.textWiresWithData({ text: "A\nB" });
            const spelled = occHelper.wiresService.textWiresWithData(Object.assign(new Inputs.OCCT.TextWiresDto(), { text: "A\nB" }));

            // Assert
            expect(leftOut.data).toEqual(spelled.data);
            leftOut.compound?.delete();
            spelled.compound?.delete();
        });
    });
});
