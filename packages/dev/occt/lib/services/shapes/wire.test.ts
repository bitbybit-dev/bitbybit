import initOpenCascade, { OpenCascadeInstance, TopoDS_Compound, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTEdge } from "./edge";
import { OccHelper } from "../../occ-helper";
import { OCCTWire } from "./wire";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import * as Inputs from "../../api/inputs/inputs";
import { OCCTFace } from "./face";
import { OCCTShape } from "./shape";
import { OCCTBooleans } from "../booleans";

describe("OCCT wire unit tests", () => {
    let occt: OpenCascadeInstance;
    let wire: OCCTWire;
    let edge: OCCTEdge;
    let face: OCCTFace;
    let booleans: OCCTBooleans;
    let shape: OCCTShape;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        edge = new OCCTEdge(occt, occHelper);
        wire = new OCCTWire(occt, occHelper);
        face = new OCCTFace(occt, occHelper);
        shape = new OCCTShape(occt, occHelper);
        booleans = new OCCTBooleans(occt, occHelper);
    });

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
        expect(length).toBe(5.72419586092437);
        w.delete();
    });

    it("should create a closed bezier wire", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: true });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(5.35324065286954);
        w.delete();
    });

    it("should create a bezier wire from points and weights", async () => {
        const w = wire.createBezierWeights({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], weights: [1, 0.1, 1], closed: false });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(5.401698013119389);
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
        expect(lengths).toEqual([
            5.72419586092437,
            6.208665118504617
        ]);
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
        expect(lengths).toEqual([
            5.72419586092437,
            6.208665118504617
        ]);
        wires.forEach(w => w.delete());
    });

    it("should interpolate points", async () => {
        const w = wire.interpolatePoints({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], periodic: false, tolerance: 1e-7 });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(7.253892713957898);
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
        expect(lengths).toEqual([
            7.253892713957898,
            11.692656773237736
        ]);
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
        expect(lengths).toEqual([
            7.253892713957898,
            11.692656773237736
        ]);
        wires.forEach(w => w.delete());
    });

    it("should interpolate points into periodic bspline", async () => {
        const w = wire.interpolatePoints({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], periodic: true, tolerance: 1e-7 });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(13.783004883953232);
        w.delete();
    });

    it("should create open bspline through points", async () => {
        const w = wire.createBSpline({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(7.0645304892614575);
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
        expect(lengths).toEqual([
            7.0645304892614575,
            12.10236321616439
        ]);
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
        expect(lengths).toEqual([
            7.0645304892614575,
            12.10236321616439
        ]);
        wires.forEach(w => w.delete());
    });

    it("should create closed bspline through points", async () => {
        const w = wire.createBSpline({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: true });
        const length = wire.getWireLength({ shape: w });
        expect(length).toBe(14.232853140068247);
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
        delete inp.align;
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
            ]
        );
        res.delete();
    });

    it("should create a heart wire", async () => {
        const inputs = new Inputs.OCCT.Heart2DDto();
        const w = wire.createHeartWire(inputs);
        const length = wire.getWireLength({ shape: w });
        const cornerPoints = edge.getCornerPointsOfEdgesForShape({ shape: w });
        expect(cornerPoints.length).toBe(2);
        expect(length).toBe(6.490970890685014);
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
        expect(length).toBe(23.07819782619483);
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
        expect(() => wire.getWire({ shape: undefined, index: 0 })).toThrowError("Shape is not provided or is null");
    });

    it("should throw error if shape is of incorrect type", async () => {
        const b = edge.createCircleEdge({ radius: 5, center: [0, 0, 0], direction: [0, 0, 1] });
        expect(() => wire.getWire({ shape: b, index: 0 })).toThrowError("Shape is of incorrect type");
        b.delete();
    });

    it("should throw error if innerWire not found", async () => {
        const rect = wire.createRectangleWire({ width: 10, length: 10, center: [0, 0, 0], direction: [0, 1, 0] });
        expect(() => wire.getWire({ shape: rect, index: 10 })).toThrowError("Shape is of incorrect type");
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
        expect(pt).toEqual([0.2939162221922262, 0.3579972308349849, 0.16020252160689685]);
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
        expect(pts).toEqual(
            [
                [0, 0, 0],
                [26.20680036154594, 31.017104093182553, 12.025759329091523],
                [41.10377561579763, 57.81890379754844, 41.78782045437701],
                [47.83637918802147, 79.19797696386944, 78.40399443961991],
                [49.95344076587983, 96.94846811846361, 117.48756838145943],
                [49.24368430384965, 112.29890805031368, 157.6380593661601],
                [46.63057260711679, 125.95930427759268, 198.3218291761897],
                [42.64204791663795, 138.36131406342085, 239.29816536695725],
                [37.607256511613905, 149.7850248335503, 280.444420804841],
                [31.74558205541915, 160.42254205936862, 321.6924000098737],
                [25.21099037239069, 170.41166043718798, 363.00167516199326],
                [18.11601209946386, 179.85485320321632, 404.34710275938113],
                [10.545617981339019, 188.83060510731758, 445.71246781494636],
                [2.565701960772223, 197.40051133256722, 487.0870234294875],
                [0, 200, 500]
            ]
        );
        w.delete();
    });

    it("should get points on wire at equal length and include and try next", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [100, 100, 0], [0, 200, 500]], closed: false });
        const pts = wire.pointsOnWireAtEqualLength({ shape: w, length: 43, tryNext: true, includeFirst: false, includeLast: false });
        expect(pts.length).toEqual(14);
        expect(pts).toEqual(
            [
                [26.20680036154594, 31.017104093182553, 12.025759329091523],
                [41.10377561579763, 57.81890379754844, 41.78782045437701],
                [47.83637918802147, 79.19797696386944, 78.40399443961991],
                [49.95344076587983, 96.94846811846361, 117.48756838145943],
                [49.24368430384965, 112.29890805031368, 157.6380593661601],
                [46.63057260711679, 125.95930427759268, 198.3218291761897],
                [42.64204791663795, 138.36131406342085, 239.29816536695725],
                [37.607256511613905, 149.7850248335503, 280.444420804841],
                [31.74558205541915, 160.42254205936862, 321.6924000098737],
                [25.21099037239069, 170.41166043718798, 363.00167516199326],
                [18.11601209946386, 179.85485320321632, 404.34710275938113],
                [10.545617981339019, 188.83060510731758, 445.71246781494636],
                [2.565701960772223, 197.40051133256722, 487.0870234294875],
                [-14.42375267847194, 213.51101504124782, 569.8369192992993]
            ]
        );
        w.delete();
    });

    it("should get points on wire at equal length and include first point", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [100, 100, 0], [0, 200, 500]], closed: false });
        const pts = wire.pointsOnWireAtEqualLength({ shape: w, length: 13, tryNext: false, includeFirst: true, includeLast: false });
        expect(pts.length).toEqual(45);
        expect(pts).toEqual(
            [
                [0, 0, 0],
                [8.925537476825706, 9.363955819801697, 1.096045857439976],
                [17.094951671226923, 18.876577576173382, 4.454064762366146],
                [24.23767692788206, 28.2193297995652, 9.954132179207857],
                [30.241556482596163, 37.137541382151085, 17.239962248887302],
                [35.15060768706391, 45.50340870671618, 25.882002549130675],
                [39.09327759557308, 53.29513429111069, 35.504641738844036],
                [42.21779292225526, 60.54823938594188, 45.82611615921655],
                [44.6598506196154, 67.31927362990655, 56.64855752572789],
                [46.5329163084223, 73.66719273766013, 67.83569107309457],
                [47.92854778406781, 79.64587405004974, 79.29331566495485],
                [48.919843463656555, 85.30199648698206, 90.95538255831374],
                [49.56523352144216, 90.67512489565851, 102.77472843554087],
                [49.91173902911818, 95.79854856313159, 114.71702383503352],
                [49.99754808938379, 100.70027289197989, 126.75681200649025],
                [49.853987109096416, 105.40394098605057, 138.8748846923854],
                [49.50701329339851, 109.92961939453369, 151.05651525283798],
                [48.978344414095055, 114.29444357717323, 163.29024790769543],
                [48.286318307905184, 118.5131396153911, 175.5670532687148],
                [47.44655176780701, 122.59844345167599, 187.87972920967243],
                [46.47245013928169, 126.5614376896971, 200.2224688760385],
                [45.37560513382148, 130.41182291865624, 212.59054446208694],
                [44.16610829068757, 134.15813727155634, 224.98007245217195],
                [42.85280023446306, 137.80793505479224, 237.38783705082292],
                [41.443470625214886, 141.3679329306774, 249.8111557636563],
                [39.945019902397036, 144.8441302683037, 262.24777591476663],
                [38.36359116477269, 148.24190882464603, 274.6957941496833],
                [36.70467850936903, 151.5661157944458, 287.153593212692],
                [34.973216663021994, 154.82113340123132, 299.61979184552325],
                [33.173655632443605, 158.01093753346242, 312.0932047525471],
                [31.310023268264835, 161.13914741266052, 324.57281036098925],
                [29.385978010727417, 164.20906787872346, 337.05772466999014],
                [27.40485360633772, 167.22372556421175, 349.54717989468503],
                [25.369697217454487, 170.18589998360855, 362.0405069153852],
                [23.28330206257504, 173.09815036979384, 374.537120768047],
                [21.148235503605935, 175.96283893640899, 387.0365085820076],
                [18.96686332261376, 178.78215112242904, 399.5382194995382],
                [16.741370793275486, 181.55811327725098, 412.0418562099387],
                [14.473781043124013, 184.29260816569385, 424.54706780642465],
                [12.16597111541449, 186.98738860844773, 437.053543732583],
                [9.819686069236015, 189.6440895215786, 449.5610086308564],
                [7.4365513997126005, 192.26423857626247, 462.06921794137463],
                [5.0180840139654626, 194.84926566509046, 474.5779541278124],
                [2.565701960772223, 197.40051133256722, 487.0870234294875],
                [0.08073308087001294, 199.91923430364145, 499.5962530569286]
            ]
        );
        w.delete();
    });

    it("should get points on wire at lengths", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [100, 100, 0], [0, 200, 500]], closed: false });
        const pts = wire.pointsOnWireAtLengths({ shape: w, lengths: [0, 12, 33, 66, 88] });
        expect(pts.length).toEqual(5);
        expect(pts).toEqual(
            [
                [0, 0, 0],
                [8.261627213281036, 8.634390729641643, 0.9319087909015193],
                [21.079970747732684, 23.947348169485483, 7.168443554381996],
                [35.48631058836566, 46.122937326475686, 26.591566845275047],
                [41.561928462999006, 58.9194169053043, 43.39372110576323]
            ]
        );
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
        expect(pts).toEqual(
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
        );
        w.delete();
    });

    it("should get points on wire at pattern of lengths and exclude first and last points but try to find next point", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [100, 100, 0], [0, 200, 500]], closed: false });
        const pts = wire.pointsOnWireAtPatternOfLengths({ shape: w, lengths: [10, 40, 70, 5], includeFirst: false, includeLast: false, tryNext: true });
        expect(pts.length).toEqual(19);
        expect(pts).toEqual(
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
        );
        w.delete();
    });

    it("should divide wires to points by params", async () => {
        const w1 = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const w2 = wire.createBezier({ points: [[0, 1, 0], [1, 1, 2], [3, 2, 5]], closed: true });

        const pts = wire.divideWiresByParamsToPoints({ shapes: [w1, w2], nrOfDivisions: 12, removeEndPoint: false, removeStartPoint: false });
        expect(pts.length).toEqual(2);
        expect(pts[0].length).toEqual(13);
        expect(pts[1].length).toEqual(13);

        expect(pts).toEqual(
            [
                [[0, 0, 0], [0.15277777777777776, 0.16666666666666666, 0.03472222222222222], [0.2777777777777778, 0.3333333333333333, 0.13888888888888887], [0.375, 0.5, 0.3125], [0.4444444444444445, 0.6666666666666666, 0.5555555555555555], [0.48611111111111105, 0.8333333333333334, 0.8680555555555557], [0.5, 1, 1.25], [0.4861111111111111, 1.1666666666666667, 1.701388888888889], [0.4444444444444445, 1.3333333333333333, 2.222222222222222], [0.375, 1.5, 2.8125], [0.27777777777777773, 1.6666666666666667, 3.4722222222222228], [0.15277777777777785, 1.8333333333333333, 4.201388888888888], [0, 2, 5]],
                [[0, 1, 0], [0.2673611111111111, 1.0190972222222223, 0.515625], [0.5555555555555556, 1.0694444444444444, 1.0416666666666665], [0.84375, 1.140625, 1.546875], [1.1111111111111112, 1.2222222222222223, 2], [1.3368055555555556, 1.3038194444444444, 2.369791666666667], [1.5, 1.375, 2.625], [1.5798611111111114, 1.4253472222222223, 2.734375], [1.5555555555555556, 1.4444444444444444, 2.6666666666666665], [1.40625, 1.421875, 2.390625], [1.1111111111111112, 1.3472222222222223, 1.875], [0.6493055555555557, 1.2100694444444444, 1.0885416666666665], [0, 1, 0]]
            ]
        );
        w1.delete();
        w2.delete();
    });

    it("should divide wires to points by params", async () => {
        const w1 = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const w2 = wire.createBezier({ points: [[0, 1, 0], [1, 1, 2], [3, 2, 5]], closed: true });

        const pts = wire.divideWiresByEqualDistanceToPoints({ shapes: [w1, w2], nrOfDivisions: 12, removeEndPoint: false, removeStartPoint: false });
        expect(pts.length).toEqual(2);
        expect(pts[0].length).toEqual(13);
        expect(pts[1].length).toEqual(13);

        expect(pts).toEqual([
            [[0, 0, 0], [0.2838222828590555, 0.3424625985680442, 0.14660078927247172], [0.43115226769191084, 0.6289266048122308, 0.4944358428008], [0.4892636529329303, 0.8534643588264631, 0.9105017647338322], [0.49923676534972294, 1.039070056316239, 1.34958322741629], [0.480111123635674, 1.1994436078911832, 1.798331210638773], [0.4414571610105028, 1.3421778455408742, 2.2518017113259283], [0.38869559662499154, 1.4718143774303798, 2.7077969520134704], [0.32519482109496023, 1.5912785788527093, 3.1652093943943727], [0.25319786452105564, 1.702569762342423, 3.6234297445534183], [0.17427907733231243, 1.8071194740156968, 4.082100991708461], [0.08958978033353904, 1.9059914123946882, 4.541004080152873], [2.2204460492503128e-16, 1.9999999999999998, 4.999999999999998]],
            [[0, 1, 0], [0.2445415223932723, 1.0162343770636948, 0.47284866772284984], [0.4984278224951234, 1.057610239508077, 0.9392454054821698], [0.758875699662155, 1.1177927244842796, 1.3999586748400303], [1.0246956935075888, 1.1942266492049987, 1.8551647378101788], [1.2959263476180198, 1.2879719428038818, 2.303880752432158], [1.5781406397702806, 1.4234560666158775, 2.7328252129246846], [1.3521231253298114, 1.409714937782383, 2.29453131287724], [1.0629757299626925, 1.333723436835422, 1.7922280230899632], [0.8217649237290864, 1.2629879159244757, 1.3805419315336966], [0.5652427899625962, 1.1837364526010647, 0.9467491273241277], [0.29009449989277686, 1.0955717797183926, 0.4846172200671603], [-2.6645352591003765e-15, 0.9999999999999991, -3.552713678800502e-15]]
        ]);
        w1.delete();
        w2.delete();
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
        expect(pts).toEqual(
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
        );
        w.delete();
    });

    it("should divide wire to points by equal distance and remove start and end points", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const pts = wire.divideWireByEqualDistanceToPoints({ shape: w, nrOfDivisions: 12, removeEndPoint: true, removeStartPoint: true });
        expect(pts.length).toEqual(11);
        expect(pts).toEqual(
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
        );
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
            .toThrowError("Wire could not be constructed. Check if edges and wires do not have disconnected elements.");
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
        const length1 = wire.getWireLength({ shape: placed[0] });
        const length2 = wire.getWireLength({ shape: placed[1] });

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
        const circle = wire.createSquareWire({
            size: 1,
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
            expect(l).toBeCloseTo(0.4, 10);
        });
    });


    it("should split circle wire by points", () => {
        const circle = wire.createSquareWire({
            size: 1,
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
        expect(split.length).toBe(9);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        expect(segmentLengths).toEqual([
            0.8000000000000003,
            0.3999999999999999,
            0.39999999999999986,
            0.3999999999999999,
            0.3999999999999999,
            0.3999999999999999,
            0.3999999999999999,
            0.40000000000000013,
            0.4]);
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
        const edges = [];
        split.forEach(s => {
            edges.push(edge.getEdges({ shape: s }));
        });
        expect(edges.length).toBe(10);
        const lengths = edges.map(e => e.length);
        expect(lengths).toEqual([1, 1, 1, 2, 1, 1, 1, 1, 2, 1]);
    });

    it("should create less wires than there are edges on the wire and group edges correctly even if end point is not added to the wire", () => {
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
        const edges = [];
        split.forEach(s => {
            edges.push(edge.getEdges({ shape: s }));
        });
        expect(edges.length).toBe(10);
        const lengths = edges.map(e => e.length);
        expect(lengths).toEqual([1, 1, 1, 2, 1, 1, 1, 1, 2, 1]);
    });

    it("should create less wires than there are edges on the wire and group edges correctly even if start and end point is not added to the wire", () => {
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
        expect(split.length).toBe(9);
        const edges = [];
        split.forEach(s => {
            edges.push(edge.getEdges({ shape: s }));
        });
        expect(edges.length).toBe(9);
        const lengths = edges.map(e => e.length);
        expect(lengths).toEqual([2, 1, 2, 1, 1, 1, 1, 2, 1]);
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
        expect(split.length).toBe(9);
        const segmentLengths = split.map((s) => wire.getWireLength({ shape: s }));
        expect(segmentLengths).toEqual([
            9.369811423392672,
            4.684905711696324,
            4.6849057116963175,
            4.684905711696346,
            4.684905711696367,
            4.68490571169632,
            4.684905711696342,
            4.684905711696341,
            4.684905711696342]);
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
        expect(wireLengths).toEqual([54.5543899385554, 54.55438993855537]);

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
        expect(wireLengths).toEqual([36.22718914885955, 36.22718914885927, 16.139612940402895, 16.139612940402888]);

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
        expect(centers[0][0]).toBeCloseTo(0);
        expect(centers[0][1]).toBeCloseTo(1);
        expect(centers[0][2]).toBeCloseTo(0.5);

        expect(centers[1][0]).toBeCloseTo(0);
        expect(centers[1][1]).toBeCloseTo(2);
        expect(centers[1][2]).toBeCloseTo(1);
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
        expect(pts[0].length).toBe(269);
        expect(pts[0][0]).toEqual([5, 0, -1]);
        expect(pts[0][33]).toEqual([5, 0, -10]);
        expect(pts[0][123]).toEqual([-4.168530387697455, 0, -3.444429766980398]);
        expect(pts[0][200]).toEqual([-1, 0, 10]);
        expect(pts[0][268]).toEqual([5, 0, -1]);
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

        const lastEdgeOnWire = edge.getEdgesAlongWire({ shape: w }).pop();
        const firstEdgeOnReversedWire = edge.getEdgesAlongWire({ shape: wireReversed }).shift();

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
});
