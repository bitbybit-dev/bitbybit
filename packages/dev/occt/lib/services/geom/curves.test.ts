import initOpenCascade, { OpenCascadeInstance } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTGeom } from "../geom/geom";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";

describe("OCCT edge unit tests", () => {
    let geom: OCCTGeom;
    let occHelper: OccHelper;
    let occt: OpenCascadeInstance;
    let vec: VectorHelperService;
    let s: ShapesHelperService;

    beforeAll(async () => {
        occt = await initOpenCascade();
        vec = new VectorHelperService();
        s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        geom = new OCCTGeom(occt, occHelper);
    });

    it("should create circle curve", async () => {
        const circle = geom.curves.geomCircleCurve({
            radius: 10,
            center: [0, 0, 0],
            direction: [0, 0, 1]
        });
        expect(circle).toBeDefined();
        circle.delete();
    });

    it("should create 2d circle curve", async () => {
        const circle = geom.curves.geom2dCircle({
            radius: 10,
            center: [0, 0],
            direction: [0, 1],
            sense: false
        });
        expect(circle).toBeDefined();
        const point = geom.curves.get2dPointFrom2dCurveOnParam({
            shape: circle,
            param: 0
        });
        expect(point).toEqual([0, 10]);
       

        circle.delete();
    });

    it("should create 2d trimmed curve", async () => {
        const circle = geom.curves.geom2dCircle({
            radius: 10,
            center: [0, 0],
            direction: [0, 1],
            sense: false
        });
        const trimmed = geom.curves.geom2dTrimmedCurve({
            shape: circle,
            u1: 0,
            u2: 0.5,
            sense: false,
            adjustPeriodic: false
        });

        const point = geom.curves.get2dPointFrom2dCurveOnParam({
            shape: trimmed,
            param: trimmed.LastParameter()
        });
        const point2 = geom.curves.get2dPointFrom2dCurveOnParam({
            shape: circle,
            param: circle.LastParameter()
        });

        expect(point).toEqual([2.4492935982947065e-15, 10]);
        expect(point2).toEqual([-2.4492935982947065e-15, 10]);
        circle.delete();
        trimmed.delete();
    });

    it("should create ellipse curve", async () => {
        const ellipse = geom.curves.geomEllipseCurve({
            radiusMajor: 10,
            radiusMinor: 5,
            center: [0, 0, 0],
            direction: [0, 0, 1]
        });
        expect(ellipse).toBeDefined();
        ellipse.delete();
    });

    it("should get 2d point from 2d curve on param", async () => {
        const circle = geom.curves.geomCircleCurve({
            radius: 10,
            center: [0, 0, 0],
            direction: [0, 0, 1]
        });
        const point = geom.curves.get2dPointFrom2dCurveOnParam({
            shape: circle,
            param: 0.5
        });
        expect(point).toBeDefined();
        expect(point).toEqual([8.775825618903728, 4.79425538604203]);
        circle.delete();
    });

    it("should create geom 2d segment", async () => {
        const segment = geom.curves.geom2dSegment({
            start: [1, 0],
            end: [10, 10]
        });
        expect(segment).toBeDefined();
        const pt = geom.curves.get2dPointFrom2dCurveOnParam({
            shape: segment,
            param: 0.5
        });
        expect(pt).toEqual([1.3344823658112248, 0.3716470731235832]);

        const ptStart = geom.curves.get2dPointFrom2dCurveOnParam({
            shape: segment,
            param: segment.FirstParameter()
        });
        expect(ptStart).toEqual([1, 0]);

        const ptEnd = geom.curves.get2dPointFrom2dCurveOnParam({
            shape: segment,
            param: segment.LastParameter()
        });
        expect(ptEnd).toEqual([10, 10]);
        segment.delete();
    });

});
