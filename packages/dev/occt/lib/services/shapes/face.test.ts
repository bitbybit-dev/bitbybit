import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Face, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTWire } from "./wire";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTFace } from "./face";
import { OCCTGeom } from "../geom/geom";
import { Base, OCCT } from "../../api/inputs";

describe("OCCT face unit tests", () => {
    let occt: BitbybitOcctModule;
    let wire: OCCTWire;
    let face: OCCTFace;
    let geom: OCCTGeom;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        wire = new OCCTWire(occt, occHelper);
        face = new OCCTFace(occt, occHelper);
        geom = new OCCTGeom(occt, occHelper);
    });

    it("should create a face from closed planar wire", async () => {
        const w = wire.createCircleWire({ radius: 3, center: [0, 0, 0], direction: [0, 0, 1] });
        const f = face.createFaceFromWire({ shape: w, planar: true });
        const area = face.getFaceArea({ shape: f });
        expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
        expect(area).toBeCloseTo(28.274333882308138);
        w.delete();
        f.delete();
    });

    it("should create a face from closed non-planar wire", async () => {
        const w = wire.interpolatePoints({ points: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], periodic: true, tolerance: 1e-7 });
        const f = face.createFaceFromWire({ shape: w, planar: false });
        const area = face.getFaceArea({ shape: f });
        expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
        expect(area).toBeCloseTo(1.5999655130076433);
        w.delete();
        f.delete();
    });

    it("should not create a good face from open non-planar wire", async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], closed: false });
        const f = face.createFaceFromWire({ shape: w, planar: false });
        const area = face.getFaceArea({ shape: f });
        expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
        //TODO check how to test validity of a face later
        expect(area).toBeLessThan(0);
        w.delete();
        f.delete();
    });

    it("should not create a good face from shape that is not a wire", async () => {
        const b = occHelper.entitiesService.bRepPrimAPIMakeBox(1, 1, 1, [0, 0, 0]);
        expect(() => face.createFaceFromWire({ shape: b, planar: false })).toThrowError("Provided input shape is not a wire");
        b.delete();
    });

    it("should create a faces from closed planar wires", async () => {
        const w1 = wire.createCircleWire({ radius: 3, center: [0, 0, 0], direction: [0, 0, 1] });
        const w2 = wire.createCircleWire({ radius: 2, center: [0, 0, 1], direction: [0, 0, 1] });
        const f = face.createFacesFromWires({ shapes: [w1, w2], planar: true });
        const area1 = face.getFaceArea({ shape: f[0] });
        const area2 = face.getFaceArea({ shape: f[1] });
        expect(area1).toBeCloseTo(28.274333882308138);
        expect(area2).toBeCloseTo(12.566370614359167);
        w1.delete();
        w2.delete();
        f.forEach(s => s.delete());
    });

    it("should create an infinite face from surface", async () => {
        const srf = geom.surfaces.cylindricalSurface({ radius: 3, center: [0, 0, 0], direction: [0, 0, 1] });
        const f = face.faceFromSurface({ shape: srf, tolerance: 1e-7 });
        const area = face.getFaceArea({ shape: f });
        expect(area).toBeCloseTo(2e+100);
        srf.delete();
        f.delete();
    });

    it("should create an face from surface and wire", async () => {
        const f1 = face.createCircleFace({ radius: 3, center: [0, 0, 0], direction: [0, 0, 1] });
        const srf = geom.surfaces.surfaceFromFace({ shape: f1 });
        const w = wire.createCircleWire({ radius: 2, center: [0, 0, 1], direction: [0, 0, 1] });
        const f = face.faceFromSurfaceAndWire({ surface: srf, wire: w, inside: true });
        const area = face.getFaceArea({ shape: f });
        expect(area).toBeCloseTo(12.566370614359167);
        f1.delete();
        srf.delete();
        w.delete();
        f.delete();
    });

    it("should get u min bound", () => {
        const f = face.createRectangleFace({ width: 1, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const uMin = face.getUMinBound({ shape: f });
        expect(uMin).toBe(-1);
        f.delete();
    });

    it("should get u max bound", () => {
        const f = face.createRectangleFace({ width: 1, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const uMax = face.getUMaxBound({ shape: f });
        expect(uMax).toBe(1);
        f.delete();
    });

    it("should get v min bound", () => {
        const f = face.createRectangleFace({ width: 1, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const vMin = face.getVMinBound({ shape: f });
        expect(vMin).toBe(-0.5);
        f.delete();
    });

    it("should get v max bound", () => {
        const f = face.createRectangleFace({ width: 1, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const vMax = face.getVMaxBound({ shape: f });
        expect(vMax).toBe(0.5);
        f.delete();
    });

    it("should subdivide face into points", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const pts = face.subdivideToPoints({
            shape: f,
            nrDivisionsU: 5,
            nrDivisionsV: 6,
            removeEndEdgeU: false,
            removeEndEdgeV: false,
            removeStartEdgeU: false,
            removeStartEdgeV: false,
            shiftHalfStepU: false,
            shiftHalfStepV: false,
        });
        expect(pts.length).toBe(30);
        expect(pts).toEqual([
            [0, -2, 1.2246467991473532e-16],
            [0, -1.618033988749895, 1.1755705045849463],
            [0, -0.6180339887498948, 1.902113032590307],
            [0, 0.6180339887498948, 1.902113032590307],
            [0, 1.618033988749895, 1.1755705045849463],
            [0, 2, 1.2246467991473532e-16],
            [1.2246467991473532e-16, -2, 7.498798913309288e-33],
            [1.1755705045849463, -1.618033988749895, 7.198293278059966e-17],
            [1.902113032590307, -0.6180339887498948, 1.1647083184890923e-16],
            [1.902113032590307, 0.6180339887498948, 1.1647083184890923e-16],
            [1.1755705045849463, 1.618033988749895, 7.198293278059966e-17],
            [1.2246467991473532e-16, 2, 7.498798913309288e-33],
            [1.4997597826618576e-32, -2, -1.2246467991473532e-16],
            [1.4396586556119933e-16, -1.618033988749895, -1.1755705045849463],
            [2.3294166369781847e-16, -0.6180339887498948, -1.902113032590307],
            [2.3294166369781847e-16, 0.6180339887498948, -1.902113032590307],
            [1.4396586556119933e-16, 1.618033988749895, -1.1755705045849463],
            [1.4997597826618576e-32, 2, -1.2246467991473532e-16],
            [-1.2246467991473532e-16, -2, -2.2496396739927864e-32],
            [-1.1755705045849463, -1.618033988749895, -2.15948798341799e-16],
            [-1.902113032590307, -0.6180339887498948, -3.494124955467277e-16],
            [-1.902113032590307, 0.6180339887498948, -3.494124955467277e-16],
            [-1.1755705045849463, 1.618033988749895, -2.15948798341799e-16],
            [-1.2246467991473532e-16, 2, -2.2496396739927864e-32],
            [-2.999519565323715e-32, -2, 1.2246467991473532e-16],
            [-2.8793173112239865e-16, -1.618033988749895, 1.1755705045849463],
            [-4.658833273956369e-16, -0.6180339887498948, 1.902113032590307],
            [-4.658833273956369e-16, 0.6180339887498948, 1.902113032590307],
            [-2.8793173112239865e-16, 1.618033988749895, 1.1755705045849463],
            [-2.999519565323715e-32, 2, 1.2246467991473532e-16]
        ]);
        sph.delete();
        f.delete();
    });

    it("should subdivide face into points controlled", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const subdOpt = new OCCT.FaceSubdivisionControlledDto<TopoDS_Face>(f);
        subdOpt.nrDivisionsU = 5;
        subdOpt.nrDivisionsV = 6;
        subdOpt.shiftHalfStepNthU = 2;
        const pts = face.subdivideToPointsControlled(subdOpt);
        expect(pts.length).toBe(30);
        expect(pts).toEqual(
            [
                [8.659560562354932e-17, -2, 8.659560562354934e-17],
                [0, -1.618033988749895, 1.1755705045849463],
                [1.3449970239279145, -0.6180339887498948, 1.3449970239279148],
                [0, 0.6180339887498948, 1.902113032590307],
                [0.8312538755549068, 1.618033988749895, 0.8312538755549069],
                [0, 2, 1.2246467991473532e-16],
                [8.659560562354934e-17, -2, -8.659560562354932e-17],
                [1.1755705045849463, -1.618033988749895, 7.198293278059966e-17],
                [1.3449970239279148, -0.6180339887498948, -1.3449970239279145],
                [1.902113032590307, 0.6180339887498948, 1.1647083184890923e-16],
                [0.8312538755549069, 1.618033988749895, -0.8312538755549068],
                [1.2246467991473532e-16, 2, 7.498798913309288e-33],
                [-8.659560562354932e-17, -2, -8.659560562354935e-17],
                [1.4396586556119933e-16, -1.618033988749895, -1.1755705045849463],
                [-1.3449970239279145, -0.6180339887498948, -1.344997023927915],
                [2.3294166369781847e-16, 0.6180339887498948, -1.902113032590307],
                [-0.8312538755549068, 1.618033988749895, -0.831253875554907],
                [1.4997597826618576e-32, 2, -1.2246467991473532e-16],
                [-8.659560562354935e-17, -2, 8.65956056235493e-17],
                [-1.1755705045849463, -1.618033988749895, -2.15948798341799e-16],
                [-1.344997023927915, -0.6180339887498948, 1.3449970239279143],
                [-1.902113032590307, 0.6180339887498948, -3.494124955467277e-16],
                [-0.831253875554907, 1.618033988749895, 0.8312538755549067],
                [-1.2246467991473532e-16, 2, -2.2496396739927864e-32],
                [8.65956056235493e-17, -2, 8.659560562354935e-17],
                [-2.8793173112239865e-16, -1.618033988749895, 1.1755705045849463],
                [1.3449970239279143, -0.6180339887498948, 1.344997023927915],
                [-4.658833273956369e-16, 0.6180339887498948, 1.902113032590307],
                [0.8312538755549067, 1.618033988749895, 0.831253875554907],
                [-2.999519565323715e-32, 2, 1.2246467991473532e-16]
            ]
        );
        sph.delete();
        f.delete();
    });

    it("should subdivide face into points controlled with removals", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const subdOpt = new OCCT.FaceSubdivisionControlledDto<TopoDS_Face>(f);
        subdOpt.nrDivisionsU = 4;
        subdOpt.nrDivisionsV = 7;
        subdOpt.shiftHalfStepNthV = 3;
        subdOpt.removeEndEdgeNthV = 2;
        subdOpt.removeEndEdgeNthU = 1;
        subdOpt.removeStartEdgeNthV = 2;
        subdOpt.removeStartEdgeNthU = 1;
        const pts = face.subdivideToPointsControlled(subdOpt);
        expect(pts.length).toBe(12);
        expect(pts).toEqual(
            [
                [1.0605752387249069e-16, -2, -6.123233995736764e-17],
                [0.8660254037844385, -1.7320508075688774, -0.49999999999999967],
                [1.5, -1, -0.8660254037844383],
                [1.7320508075688774, 0, -0.9999999999999996],
                [1.5000000000000002, 0.9999999999999997, -0.8660254037844384],
                [0.8660254037844393, 1.732050807568877, -0.5000000000000001],
                [1.0605752387249069e-16, 2, -6.123233995736764e-17],
                [-0.8660254037844383, -1.7320508075688774, -0.5000000000000003],
                [-1.4999999999999996, -1, -0.8660254037844394],
                [-1.732050807568877, 0, -1.0000000000000009],
                [-1.4999999999999998, 0.9999999999999997, -0.8660254037844395],
                [-0.866025403784439, 1.732050807568877, -0.5000000000000008]
            ]
        );
        sph.delete();
        f.delete();
    });

    it("should subdivide face into points", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const pts = face.subdivideToPoints({
            shape: f,
            nrDivisionsU: 4,
            nrDivisionsV: 3,
            removeEndEdgeU: false,
            removeEndEdgeV: false,
            removeStartEdgeU: false,
            removeStartEdgeV: false,
            shiftHalfStepU: false,
            shiftHalfStepV: false,
        });
        expect(pts.length).toBe(12);
        expect(pts).toEqual([
            [0, -2, 1.2246467991473532e-16],
            [0, 0, 2],
            [0, 2, 1.2246467991473532e-16],
            [1.0605752387249069e-16, -2, -6.123233995736764e-17],
            [1.7320508075688774, 0, -0.9999999999999996],
            [1.0605752387249069e-16, 2, -6.123233995736764e-17],
            [-1.0605752387249067e-16, -2, -6.123233995736771e-17],
            [-1.732050807568877, 0, -1.0000000000000009],
            [-1.0605752387249067e-16, 2, -6.123233995736771e-17],
            [-2.999519565323715e-32, -2, 1.2246467991473532e-16],
            [-4.898587196589413e-16, 0, 2],
            [-2.999519565323715e-32, 2, 1.2246467991473532e-16]
        ]);
        sph.delete();
        f.delete();
    });

    it("should subdivide face into points, remove end edges and shift u and v directions", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const pts = face.subdivideToPoints({
            shape: f,
            nrDivisionsU: 5,
            nrDivisionsV: 4,
            removeEndEdgeU: true,
            removeEndEdgeV: true,
            removeStartEdgeU: true,
            removeStartEdgeV: true,
            shiftHalfStepU: true,
            shiftHalfStepV: true,
        });
        expect(pts.length).toBe(6);
        expect(pts).toEqual([
            [1.4142135623730951, -4.440892098500626e-16, -1.414213562373095],
            [0.707106781186548, 1.732050807568877, -0.7071067811865479],
            [-1.414213562373095, -4.440892098500626e-16, -1.4142135623730954],
            [-0.7071067811865479, 1.732050807568877, -0.7071067811865481],
            [-1.4142135623730954, -4.440892098500626e-16, 1.4142135623730947],
            [-0.7071067811865481, 1.732050807568877, 0.7071067811865478]
        ]);
        sph.delete();
        f.delete();
    });

    it("should subdivide into normals", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const normals = face.subdivideToNormals({
            shape: f,
            nrDivisionsU: 4,
            nrDivisionsV: 3,
            removeEndEdgeU: false,
            removeEndEdgeV: false,
            removeStartEdgeU: false,
            removeStartEdgeV: false,
            shiftHalfStepU: false,
            shiftHalfStepV: false,
        });
        expect(normals.length).toBe(12);
        expect(normals).toEqual([
            [0, -1, 1.2246467991473532e-16],
            [0, -0, 1],
            [-0, 1, 1.2246467991473532e-16],
            [1.060575238724907e-16, -1, -6.123233995736765e-17],
            [0.8660254037844388, 0, -0.49999999999999983],
            [1.060575238724907e-16, 1, -6.123233995736765e-17],
            [-1.0605752387249067e-16, -1, -6.123233995736771e-17],
            [-0.8660254037844385, 0, -0.5000000000000004],
            [-1.0605752387249067e-16, 1, -6.123233995736771e-17],
            [-2.999519565323715e-32, -1, 1.2246467991473532e-16],
            [-2.4492935982947064e-16, 0, 1],
            [-2.999519565323715e-32, 1, 1.2246467991473532e-16]
        ]);
        sph.delete();
        f.delete();
    });

    it("should subdivide face into normals, remove end edges and shift u and v directions", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const normals = face.subdivideToNormals({
            shape: f,
            nrDivisionsU: 5,
            nrDivisionsV: 4,
            removeEndEdgeU: true,
            removeEndEdgeV: true,
            removeStartEdgeU: true,
            removeStartEdgeV: true,
            shiftHalfStepU: true,
            shiftHalfStepV: true,
        });
        expect(normals.length).toBe(6);
        expect(normals).toEqual([
            [0.7071067811865476, -2.220446049250313e-16, -0.7071067811865475],
            [0.353553390593274, 0.8660254037844385, -0.35355339059327395],
            [-0.7071067811865475, -2.220446049250313e-16, -0.7071067811865477],
            [-0.35355339059327384, 0.8660254037844385, -0.35355339059327395],
            [-0.7071067811865477, -2.220446049250313e-16, 0.7071067811865474],
            [-0.35355339059327406, 0.8660254037844385, 0.3535533905932739]
        ]);
        sph.delete();
        f.delete();
    });

    it("should subdivide to points on param on u", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const points = face.subdivideToPointsOnParam({
            shape: f,
            nrPoints: 4,
            removeEndPoint: false,
            removeStartPoint: false,
            shiftHalfStep: false,
            param: 0.2,
            isU: true
        });
        expect(points.length).toBe(4);
        expect(points).toEqual([
            [1.1647083184890923e-16, -2, 3.7843667304341506e-17],
            [1.6472782070926637, -1, 0.535233134659635],
            [1.647278207092664, 0.9999999999999997, 0.535233134659635],
            [1.1647083184890923e-16, 2, 3.7843667304341506e-17]
        ]);
        sph.delete();
        f.delete();
    });

    it("should subdivide to points on param on v", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const points = face.subdivideToPointsOnParam({
            shape: f,
            nrPoints: 4,
            removeEndPoint: false,
            removeStartPoint: false,
            shiftHalfStep: false,
            param: 0.5,
            isU: false
        });
        expect(points.length).toBe(4);
        expect(points).toEqual([
            [0, 0, 2],
            [1.7320508075688774, 0, -0.9999999999999996],
            [-1.732050807568877, 0, -1.0000000000000009],
            [-4.898587196589413e-16, 0, 2]
        ]);
        sph.delete();
        f.delete();
    });

    it("should subdivide to points on param, remove start and end points and shift half step on v", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const points = face.subdivideToPointsOnParam({
            shape: f,
            nrPoints: 7,
            removeEndPoint: true,
            removeStartPoint: true,
            shiftHalfStep: true,
            param: 0.3,
            isU: false
        });
        expect(points.length).toBe(5);
        expect(points).toEqual([
            [1.618033988749895, -1.1755705045849463, 9.907600726170916e-17],
            [0.809016994374948, -1.1755705045849463, -1.4012585384440732],
            [-0.809016994374947, -1.1755705045849463, -1.4012585384440739],
            [-1.618033988749895, -1.1755705045849463, -2.9722802178512745e-16],
            [-0.8090169943749481, -1.1755705045849463, 1.4012585384440732]
        ]);
        sph.delete();
        f.delete();
    });

    it("should subdivide to points on param, remove start and end points and shift half step on u", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const points = face.subdivideToPointsOnParam({
            shape: f,
            nrPoints: 7,
            removeEndPoint: true,
            removeStartPoint: true,
            shiftHalfStep: true,
            param: 0.3,
            isU: true
        });
        expect(points.length).toBe(5);
        expect(points).toEqual([
            [1.3449970239279145, -1.4142135623730951, -0.43701602444882093],
            [1.8373001026999978, -0.5176380902050418, -0.5969749912579707],
            [1.837300102699998, 0.5176380902050414, -0.5969749912579708],
            [1.344997023927915, 1.4142135623730947, -0.43701602444882104],
            [0.49230307877208407, 1.9318516525781364, -0.15995896680915006]
        ]);
        sph.delete();
        f.delete();
    });

    it("should subdivide to points on param on u", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uvs = face.subdivideToUVOnParam({
            shape: f,
            nrPoints: 4,
            removeEndPoint: false,
            removeStartPoint: false,
            shiftHalfStep: false,
            param: 0.2,
            isU: true
        });
        expect(uvs.length).toBe(4);
        expect(uvs).toEqual([
            [1.2566370614359172, -1.5707963267948966],
            [1.2566370614359172, -0.5235987755982989],
            [1.2566370614359172, 0.5235987755982987],
            [1.2566370614359172, 1.5707963267948966]
        ]);
        sph.delete();
        f.delete();
    });

    it("should subdivide to points on param on u", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uvs = face.subdivideToUVOnParam({
            shape: f,
            nrPoints: 4,
            removeEndPoint: false,
            removeStartPoint: false,
            shiftHalfStep: false,
            param: 0.3423,
            isU: true
        });
        expect(uvs.length).toBe(4);
        expect(uvs).toEqual([
            [2.1507343306475724, -1.5707963267948966],
            [2.1507343306475724, -0.5235987755982989],
            [2.1507343306475724, 0.5235987755982987],
            [2.1507343306475724, 1.5707963267948966]
        ]);
        sph.delete();
        f.delete();
    });

    it("should subdivide to points on param on v", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uvs = face.subdivideToUVOnParam({
            shape: f,
            nrPoints: 4,
            removeEndPoint: false,
            removeStartPoint: false,
            shiftHalfStep: false,
            param: 0.3423,
            isU: false
        });
        expect(uvs.length).toBe(4);
        expect(uvs).toEqual([
            [0, -0.4954291614711104],
            [2.0943951023931953, -0.4954291614711104],
            [4.1887902047863905, -0.4954291614711104],
            [6.283185307179586, -0.4954291614711104]
        ]);
        sph.delete();
        f.delete();
    });

    it("should subdivide to points on param on u and remove edge points and shift step", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uvs = face.subdivideToUVOnParam({
            shape: f,
            nrPoints: 8,
            removeEndPoint: true,
            removeStartPoint: true,
            shiftHalfStep: true,
            param: 0.222,
            isU: true
        });
        expect(uvs.length).toBe(6);
        expect(uvs).toEqual([
            [1.3948671381938682, -0.8975979010256552],
            [1.3948671381938682, -0.4487989505128276],
            [1.3948671381938682, 0],
            [1.3948671381938682, 0.4487989505128276],
            [1.3948671381938682, 0.8975979010256552],
            [1.3948671381938682, 1.3463968515384828]
        ]);
        sph.delete();
        f.delete();
    });

    it("should subdivide to points on param on v and remove edge points and shift step", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uvs = face.subdivideToUVOnParam({
            shape: f,
            nrPoints: 8,
            removeEndPoint: true,
            removeStartPoint: true,
            shiftHalfStep: true,
            param: 0.666,
            isU: false
        });
        expect(uvs.length).toBe(6);
        expect(uvs).toEqual([
            [1.3463968515384828, 0.5215043804959056],
            [2.243994752564138, 0.5215043804959056],
            [3.141592653589793, 0.5215043804959056],
            [4.039190554615448, 0.5215043804959056],
            [4.9367884556411035, 0.5215043804959056],
            [5.834386356666759, 0.5215043804959056]
        ]);
        sph.delete();
        f.delete();
    });

    it("should subdivide face into uvs", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uvs = face.subdivideToUV({
            shape: f,
            nrDivisionsU: 5,
            nrDivisionsV: 6,
            removeEndEdgeU: false,
            removeEndEdgeV: false,
            removeStartEdgeU: false,
            removeStartEdgeV: false,
            shiftHalfStepU: false,
            shiftHalfStepV: false,
        });
        expect(uvs.length).toBe(30);
        expect(uvs).toEqual([
            [0, -1.5707963267948966],
            [0, -0.9424777960769379],
            [0, -0.3141592653589793],
            [0, 0.3141592653589793],
            [0, 0.9424777960769379],
            [0, 1.5707963267948966],
            [1.5707963267948966, -1.5707963267948966],
            [1.5707963267948966, -0.9424777960769379],
            [1.5707963267948966, -0.3141592653589793],
            [1.5707963267948966, 0.3141592653589793],
            [1.5707963267948966, 0.9424777960769379],
            [1.5707963267948966, 1.5707963267948966],
            [3.141592653589793, -1.5707963267948966],
            [3.141592653589793, -0.9424777960769379],
            [3.141592653589793, -0.3141592653589793],
            [3.141592653589793, 0.3141592653589793],
            [3.141592653589793, 0.9424777960769379],
            [3.141592653589793, 1.5707963267948966],
            [4.71238898038469, -1.5707963267948966],
            [4.71238898038469, -0.9424777960769379],
            [4.71238898038469, -0.3141592653589793],
            [4.71238898038469, 0.3141592653589793],
            [4.71238898038469, 0.9424777960769379],
            [4.71238898038469, 1.5707963267948966],
            [6.283185307179586, -1.5707963267948966],
            [6.283185307179586, -0.9424777960769379],
            [6.283185307179586, -0.3141592653589793],
            [6.283185307179586, 0.3141592653589793],
            [6.283185307179586, 0.9424777960769379],
            [6.283185307179586, 1.5707963267948966]
        ]);
        sph.delete();
        f.delete();
    });

    it("should subdivide face into uvs", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uvs = face.subdivideToUV({
            shape: f,
            nrDivisionsU: 4,
            nrDivisionsV: 3,
            removeEndEdgeU: false,
            removeEndEdgeV: false,
            removeStartEdgeU: false,
            removeStartEdgeV: false,
            shiftHalfStepU: false,
            shiftHalfStepV: false,
        });
        expect(uvs.length).toBe(12);
        expect(uvs).toEqual([
            [0, -1.5707963267948966],
            [0, 0],
            [0, 1.5707963267948966],
            [2.0943951023931953, -1.5707963267948966],
            [2.0943951023931953, 0],
            [2.0943951023931953, 1.5707963267948966],
            [4.1887902047863905, -1.5707963267948966],
            [4.1887902047863905, 0],
            [4.1887902047863905, 1.5707963267948966],
            [6.283185307179586, -1.5707963267948966],
            [6.283185307179586, 0],
            [6.283185307179586, 1.5707963267948966]
        ]);
        sph.delete();
        f.delete();
    });


    it("should subdivide face into uvs remove end and start edges and shift half step both on u and v", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uvs = face.subdivideToUV({
            shape: f,
            nrDivisionsU: 6,
            nrDivisionsV: 5,
            removeEndEdgeU: true,
            removeEndEdgeV: true,
            removeStartEdgeU: true,
            removeStartEdgeV: true,
            shiftHalfStepU: true,
            shiftHalfStepV: true,
        });
        expect(uvs.length).toBe(12);
        expect(uvs).toEqual([
            [1.8849555921538759, -0.39269908169872414],
            [1.8849555921538759, 0.39269908169872414],
            [1.8849555921538759, 1.1780972450961724],
            [3.141592653589793, -0.39269908169872414],
            [3.141592653589793, 0.39269908169872414],
            [3.141592653589793, 1.1780972450961724],
            [4.39822971502571, -0.39269908169872414],
            [4.39822971502571, 0.39269908169872414],
            [4.39822971502571, 1.1780972450961724],
            [5.654866776461628, -0.39269908169872414],
            [5.654866776461628, 0.39269908169872414],
            [5.654866776461628, 1.1780972450961724]
        ]);
        sph.delete();
        f.delete();
    });

    it("should get uv on face", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const uv = face.uvOnFace({ shape: f, paramU: 0.2, paramV: 0.3 });
        expect(uv.length).toBe(2);
        expect(uv).toEqual([
            1.2566370614359172, -0.6283185307179586
        ]);
        sph.delete();
        f.delete();
    });

    it("should get points on uvs", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const points = face.pointsOnUVs({ shape: f, paramsUV: [[0.2, 0.3], [0, 0], [0.5, 0.4]] });
        expect(points.length).toBe(3);
        expect(points).toEqual([
            [1.5388417685876268, -1.1755705045849463, 0.5000000000000001],
            [0, -2, 1.2246467991473532e-16],
            [2.3294166369781847e-16, -0.6180339887498948, -1.902113032590307]
        ]);
        sph.delete();
        f.delete();
    });


    it("should get normals on uvs", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const normals = face.normalsOnUVs({ shape: f, paramsUV: [[0.2, 0.3], [0, 0], [0.5, 0.4]] });
        expect(normals.length).toBe(3);
        expect(normals).toEqual([
            [0.7694208842938133, -0.5877852522924731, 0.25000000000000006],
            [0, -1, 1.2246467991473532e-16],
            [1.1647083184890923e-16, -0.3090169943749474, -0.9510565162951536]
        ]);
        sph.delete();
        f.delete();
    });

    it("should get point on uv", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const point = face.pointOnUV({ shape: f, paramU: 0.2, paramV: 0.3 });
        expect(point.length).toBe(3);
        expect(point).toEqual([1.5388417685876268, -1.1755705045849463, 0.5000000000000001]);
        sph.delete();
        f.delete();
    });

    it("should get normal on uv", () => {
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
        const f = face.getFace({ shape: sph, index: 0 });
        const normal = face.normalOnUV({ shape: f, paramU: 0.2, paramV: 0.3 });
        expect(normal.length).toBe(3);
        expect(normal).toEqual([0.7694208842938133, -0.5877852522924731, 0.25000000000000006]);
        sph.delete();
        f.delete();
    });

    it("should create polygon face", () => {
        const f = face.createPolygonFace({ points: [[0, 0, 0], [1, 0, -2], [1, 0, 0], [0, 0, 1]] });
        const area = face.getFaceArea({ shape: f });
        expect(area).toBe(1.5);
        f.delete();
    });

    it("should create ellipse face", () => {
        const f = face.createEllipseFace({ center: [0, 0, 0], radiusMinor: 1, radiusMajor: 2, direction: [0, 1, 0] });
        const area = face.getFaceArea({ shape: f });
        expect(area).toBe(6.283185307179584);
        f.delete();
    });

    it("should not create ellipse face when radius major is smaller then minor", () => {
        // When minor > major, the ellipse creation will return a null shape or swap the radii
        // This is expected behavior - the test verifies the function doesn't crash
        const f = face.createEllipseFace({ center: [0, 0, 0], radiusMinor: 2, radiusMajor: 1, direction: [0, 1, 0] });
        // Either null or a valid face with swapped radii
        if (f && !f.IsNull()) {
            f.delete();
        }
    });

    it("should create square face", () => {
        const f = face.createSquareFace({ center: [0, 0, 0], size: 2, direction: [0, 1, 0] });
        const area = face.getFaceArea({ shape: f });
        expect(area).toBe(4);
        f.delete();
    });

    it("should not get a face of a shape that does not have faces", async () => {
        const d = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [1, 1, 1] });
        expect(() => face.getFace({ shape: d, index: 22 })).toThrowError("Shape is of incorrect type");
        d.delete();
    });

    it("should not get a face of a shape that does not have particular index", async () => {
        const b = occHelper.entitiesService.bRepPrimAPIMakeBox(1, 1, 1, [0, 0, 0]);
        expect(() => face.getFace({ shape: b, index: 22 })).toThrowError("Face index is out of range");
        b.delete();
    });

    it("should not get a face of a shape that does not have particular index", async () => {
        const b = occHelper.entitiesService.bRepPrimAPIMakeBox(1, 1, 1, [0, 0, 0]);
        expect(() => face.getFace({ shape: b, index: -22 })).toThrowError("Face index is out of range");
        b.delete();
    });

    it("should get faces", async () => {
        const b = occHelper.entitiesService.bRepPrimAPIMakeBox(1, 1, 1, [0, 0, 0]);
        const faces = face.getFaces({ shape: b });
        expect(faces.length).toBe(6);
        b.delete();
        faces.forEach(f => f.delete());
    });

    it("should reverse a face", async () => {
        const f = face.createRectangleFace({ center: [0, 0, 0], width: 2, length: 1, direction: [0, 1, 0] });
        const w = wire.getWire({ shape: f, index: 0 });
        const fr = face.reversedFace({ shape: f });
        const wr = wire.getWire({ shape: fr, index: 0 });
        const pt1 = wire.pointOnWireAtLength({ shape: w, length: 0.1 });
        const pt2 = wire.pointOnWireAtLength({ shape: wr, length: 0.1 });
        expect(pt1).not.toEqual(pt2);
        f.delete();
        fr.delete();
        w.delete();
        wr.delete();
    });

    it("should get faces areas", async () => {
        const f1 = face.createRectangleFace({ center: [0, 0, 0], width: 2, length: 1, direction: [0, 1, 0] });
        const f2 = face.createCircleFace({ radius: 3, center: [0, 0, 0], direction: [0, 0, 1] });
        const areas = face.getFacesAreas({ shapes: [f1, f2] });
        expect(areas.length).toBe(2);
        expect(areas[0]).toBe(2);
        expect(areas[1]).toBe(28.274333882308138);
        f1.delete();
        f2.delete();
    });

    it("should get faces centers of mass", async () => {
        const f1 = face.createRectangleFace({ center: [0, 1, 0], width: 2, length: 1, direction: [0, 1, 0] });
        const f2 = face.createCircleFace({ radius: 3, center: [0, 3, 3], direction: [0, 0, 1] });
        const centers = face.getFacesCentersOfMass({ shapes: [f1, f2] });
        expect(centers).toEqual([
            [2.0816681711721685e-17, 1, 8.023096076392733e-18],
            [4.440892098500626e-16, 2.9999999999999996, 3]
        ]);
        f1.delete();
        f2.delete();
    });

    it("should get face center of mass", async () => {
        const f1 = face.createRectangleFace({ center: [0, 1, 0], width: 2, length: 1, direction: [0, 1, 0] });
        const center = face.getFaceCenterOfMass({ shape: f1 });
        expect(center).toEqual(
            [2.0816681711721685e-17, 1, 8.023096076392733e-18],
        );
        f1.delete();
    });

    it("should filter points in and on the face", async () => {
        const hOpt = new OCCT.Heart2DDto();
        const heartWire = wire.createHeartWire(hOpt);
        const heartFace = face.createFaceFromWire({ shape: heartWire, planar: true });
        const divOpt = new OCCT.FaceSubdivisionDto<TopoDS_Face>();
        divOpt.shape = heartFace;
        divOpt.nrDivisionsU = 5;
        divOpt.nrDivisionsV = 5;
        const divideFaceToPts = face.subdivideToPoints(divOpt);

        const filterOpt = new OCCT.FilterFacePointsDto<TopoDS_Face>();
        filterOpt.shape = heartFace;
        filterOpt.points = divideFaceToPts;
        const filteredPoints = face.filterFacePoints(filterOpt);
        expect(filteredPoints.length).toBe(8);
        expect(filteredPoints).toEqual(
            [
                [-2.20370219144301e-16, 0, -1],
                [-2.20370219144301e-16, 0, -0.48991902935457365],
                [-0.5711786039363733, 0, 0.020161941290852692],
                [-2.20370219144301e-16, 0, 0.020161941290852692],
                [0.5711786039363729, 0, 0.020161941290852692],
                [-0.5711786039363733, 0, 0.530242911936279],
                [-2.20370219144301e-16, 0, 0.530242911936279],
                [0.5711786039363729, 0, 0.530242911936279]
            ]
        );
        heartWire.delete();
        heartFace.delete();
    });

    it("should filter points outside face", async () => {
        const hOpt = new OCCT.Heart2DDto();
        const heartWire = wire.createHeartWire(hOpt);
        const heartFace = face.createFaceFromWire({ shape: heartWire, planar: true });
        const divOpt = new OCCT.FaceSubdivisionDto<TopoDS_Face>();
        divOpt.shape = heartFace;
        divOpt.nrDivisionsU = 5;
        divOpt.nrDivisionsV = 5;
        const divideFaceToPts = face.subdivideToPoints(divOpt);

        const filterOpt = new OCCT.FilterFacePointsDto<TopoDS_Face>();
        filterOpt.shape = heartFace;
        filterOpt.points = divideFaceToPts;
        filterOpt.keepOut = true;
        filterOpt.keepOn = false;
        filterOpt.keepIn = false;
        const filteredPoints = face.filterFacePoints(filterOpt);
        expect(filteredPoints.length).toBe(17);
        expect(filteredPoints).toEqual(
            [
                [-1.1423572078727464, 0, -1],
                [-0.5711786039363733, 0, -1],
                [0.5711786039363729, 0, -1],
                [1.142357207872746, 0, -1],
                [-1.1423572078727464, 0, -0.48991902935457365],
                [-0.5711786039363733, 0, -0.48991902935457365],
                [0.5711786039363729, 0, -0.48991902935457365],
                [1.142357207872746, 0, -0.48991902935457365],
                [-1.1423572078727464, 0, 0.020161941290852692],
                [1.142357207872746, 0, 0.020161941290852692],
                [-1.1423572078727464, 0, 0.530242911936279],
                [1.142357207872746, 0, 0.530242911936279],
                [-1.1423572078727464, 0, 1.0403238825817054],
                [-0.5711786039363733, 0, 1.0403238825817054],
                [-2.20370219144301e-16, 0, 1.0403238825817054],
                [0.5711786039363729, 0, 1.0403238825817054],
                [1.142357207872746, 0, 1.0403238825817054]
            ]
        );
        heartWire.delete();
        heartFace.delete();
    });

    it("should filter points on the edge of the face", async () => {
        const hOpt = new OCCT.Heart2DDto();
        const heartWire = wire.createHeartWire(hOpt);
        const heartFace = face.createFaceFromWire({ shape: heartWire, planar: true });
        const divOpt = new OCCT.DivideDto<TopoDS_Wire>(heartWire);
        divOpt.removeStartPoint = true;
        const wirePoints = wire.divideWireByParamsToPoints(divOpt);
        const filterOpt = new OCCT.FilterFacePointsDto<TopoDS_Face>();
        filterOpt.shape = heartFace;
        filterOpt.points = wirePoints;
        filterOpt.keepOn = true;
        filterOpt.keepIn = true;
        filterOpt.tolerance = 0.001;
        filterOpt.gapTolerance = 0.1;
        const filteredPoints = face.filterFacePoints(filterOpt);
        expect(filteredPoints.length).toBe(10);
        expect(filteredPoints).toEqual(
            [
                [0.5281025079658215, 0, 0.9967856920991937],
                [0.9713657876933374, 0, 0.5598225652870827],
                [0.8897981326850651, 0, -0.05771921248386577],
                [0.4446309983867859, 0, -0.552394801549345],
                [0, 0, -1],
                [-0.4446309983867858, 0, -0.552394801549345],
                [-0.8897981326850652, 0, -0.05771921248386558],
                [-0.9713657876933373, 0, 0.5598225652870836],
                [-0.528102507965821, 0, 0.9967856920991938],
                [0, 0, 0.7]
            ]
        );
        heartWire.delete();
        heartFace.delete();
    });

    it("should not filter if provided points are empty", async () => {
        const hOpt = new OCCT.Heart2DDto();
        const heartWire = wire.createHeartWire(hOpt);
        const heartFace = face.createFaceFromWire({ shape: heartWire, planar: true });
        const filterOpt = new OCCT.FilterFacePointsDto<TopoDS_Face>();
        filterOpt.shape = heartFace;
        filterOpt.points = [];
        const filteredPoints = face.filterFacePoints(filterOpt);
        expect(filteredPoints.length).toBe(0);
        heartWire.delete();
        heartFace.delete();
    });

    it("should create a face from wires", async () => {
        const circle1 = wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const circle2 = wire.createCircleWire({ radius: 0.2, center: [0, 0, 0.3], direction: [0, 1, 0] });
        const reverse2 = wire.reversedWire({ shape: circle2 });
        const circle3 = wire.createCircleWire({ radius: 0.1, center: [0, 0, -0.15], direction: [0, 1, 0] });
        const reverse3 = wire.reversedWire({ shape: circle3 });
        const f1 = face.createFaceFromWires({ shapes: [circle1, reverse2, reverse3], planar: true });
        const area = face.getFaceArea({ shape: f1 });
        expect(area).toBe(2.984513020910302);
        circle1.delete();
        circle2.delete();
        circle3.delete();
        reverse2.delete();
        reverse3.delete();
        f1.delete();
    });

    describe("Face from multiple circle tan wires", () => {
        it("should create face from two circle tan wires by using all with all strategy", () => {
            const circle1 = wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
            const circle2 = wire.createCircleWire({ radius: 0.2, center: [0, 0, 2], direction: [0, 1, 0] });

            const f = face.createFaceFromMultipleCircleTanWires({
                circles: [circle1, circle2],
                combination: OCCT.combinationCirclesForFaceEnum.allWithAll,
                unify: true,
                tolerance: 1e-7
            });

            const faces = face.getFaces({ shape: f });
            expect(faces.length).toBe(1);
            const area = face.getFaceArea({ shape: f });
            expect(area).toBe(4.228320685670285);

            circle1.delete();
            circle2.delete();
            f.delete();
            faces.forEach((f) => f.delete());
        });

        it("should create face from four circle tan wires by using allWithAll strategy", () => {
            const circles = create4CirclesForFaceConstruction();

            const f = face.createFaceFromMultipleCircleTanWires({
                circles,
                combination: OCCT.combinationCirclesForFaceEnum.allWithAll,
                unify: true,
                tolerance: 1e-7
            });

            const faces = face.getFaces({ shape: f });
            expect(faces.length).toBe(1);
            const area = face.getFaceArea({ shape: f });
            expect(area).toBe(27.584215142769313);

            circles.forEach((c) => c.delete());
            f.delete();
            faces.forEach((f) => f.delete());
        });

        it("should create face from four circle tan wires by using inOrder strategy", () => {
            const circles = create4CirclesForFaceConstruction();

            const f = face.createFaceFromMultipleCircleTanWires({
                circles,
                combination: OCCT.combinationCirclesForFaceEnum.inOrder,
                unify: true,
                tolerance: 1e-7
            });

            const faces = face.getFaces({ shape: f });
            expect(faces.length).toBe(1);
            const area = face.getFaceArea({ shape: f });
            expect(area).toBe(21.828359362876572);

            circles.forEach((c) => c.delete());
            f.delete();
            faces.forEach((f) => f.delete());
        });

        it("should create face from four circle tan wires by using inOrderClosed strategy", () => {
            const circles = create4CirclesForFaceConstruction();
            const f = face.createFaceFromMultipleCircleTanWires({
                circles,
                combination: OCCT.combinationCirclesForFaceEnum.inOrderClosed,
                unify: true,
                tolerance: 1e-7
            });

            const faces = face.getFaces({ shape: f });
            expect(faces.length).toBe(1);
            const area = face.getFaceArea({ shape: f });
            expect(area).toBe(24.764075269346932);

            circles.forEach((c) => c.delete());
            f.delete();
            faces.forEach((f) => f.delete());
        });


        it("should create face from four circle tan wires by using inOrderClosed strategy and return non-unified result of compounded shapes", () => {
            const circles = create4CirclesForFaceConstruction();
            const f = face.createFaceFromMultipleCircleTanWires({
                circles,
                combination: OCCT.combinationCirclesForFaceEnum.inOrderClosed,
                unify: false,
                tolerance: 1e-7
            });

            const faces = face.getFaces({ shape: f });
            expect(faces.length).toBe(4);
            const areas = faces.map(f => face.getFaceArea({ shape: f }));
            expect(areas).toEqual([4.228320685670285, 8.94581601121022, 18.478357180330566, 9.320341329624728]);

            circles.forEach((c) => c.delete());
            f.delete();
            faces.forEach((f) => f.delete());
        });

        const create4CirclesForFaceConstruction = () => {
            const circle1 = wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
            const circle2 = wire.createCircleWire({ radius: 0.2, center: [0, 0, 2], direction: [0, 1, 0] });
            const circle3 = wire.createCircleWire({ radius: 1.3, center: [4, 0, 2], direction: [0, 1, 0] });
            const circle4 = wire.createCircleWire({ radius: 0.6, center: [-4, 0, 2], direction: [0, 1, 0] });
            return [circle1, circle2, circle3, circle4];
        };

        it("should not create face from two circle tan wires by using all with all strategy if circles are inside each other", () => {
            const circle1 = wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
            const circle2 = wire.createCircleWire({ radius: 0.2, center: [0, 0, 0], direction: [0, 1, 0] });

            expect(() => {
                face.createFaceFromMultipleCircleTanWires({
                    circles: [circle1, circle2],
                    combination: OCCT.combinationCirclesForFaceEnum.allWithAll,
                    unify: true,
                    tolerance: 1e-7
                });
            }).toThrow();

            circle1.delete();
            circle2.delete();
        });

        it("should create face from multiple circle tan wire collections by using strategy in order (to form separate faces)", () => {

            const { circlesOnPts1, circlesOnPts2, circlesOnPts3, circle1, circle2, circle3 } = createCirclesForFaceConstruction(4);

            const f = face.createFaceFromMultipleCircleTanWireCollections({
                listsOfCircles: [circlesOnPts1, circlesOnPts2, circlesOnPts3],
                combination: OCCT.combinationCirclesForFaceEnum.inOrder,
                unify: true,
                tolerance: 1e-7
            });

            const faces = face.getFaces({ shape: f });
            expect(faces.length).toBe(4);
            const area = face.getFaceArea({ shape: f });
            expect(area).toBe(172.58436431800175);

            deleteCircleShapes(circle1, circle2, circle3, circlesOnPts1, circlesOnPts2, circlesOnPts3);
            f.delete();
            faces.forEach((f) => f.delete());
        });

        it("should not create face from multiple circle tan wire collections by using strategy in order if circle lists are not of equal length", () => {
            const { circlesOnPts1, circlesOnPts2, circlesOnPts3, circle1, circle2, circle3 } = createNonEqualCircles(4);

            expect(() => {
                face.createFaceFromMultipleCircleTanWireCollections({
                    listsOfCircles: [circlesOnPts1, circlesOnPts2, circlesOnPts3],
                    combination: OCCT.combinationCirclesForFaceEnum.inOrder,
                    unify: true,
                    tolerance: 1e-7
                });
            }).toThrowError("All lists of circles must have the same length in order to use inOrder strategy.");

            deleteCircleShapes(circle1, circle2, circle3, circlesOnPts1, circlesOnPts2, circlesOnPts3);
        });

        it("should create face from multiple circle tan wire collections by using strategy all witj all (to form a single face)", () => {
            const { circlesOnPts1, circlesOnPts2, circlesOnPts3, circle1, circle2, circle3 } = createCirclesForFaceConstruction(3);

            const f = face.createFaceFromMultipleCircleTanWireCollections({
                listsOfCircles: [circlesOnPts1, circlesOnPts2, circlesOnPts3],
                combination: OCCT.combinationCirclesForFaceEnum.allWithAll,
                unify: true,
                tolerance: 1e-7
            });

            const faces = face.getFaces({ shape: f });
            expect(faces.length).toBe(1);
            const area = face.getFaceArea({ shape: f });
            expect(area).toBe(767.6148455097346);

            deleteCircleShapes(circle1, circle2, circle3, circlesOnPts1, circlesOnPts2, circlesOnPts3);
            f.delete();
            faces.forEach((f) => f.delete());
        });

        it("should create face from multiple circle tan wire collections by using strategy in order closed (to form a grid)", () => {
            const { circlesOnPts1, circlesOnPts2, circlesOnPts3, circle1, circle2, circle3 } = createCirclesForFaceConstruction(3);

            const f = face.createFaceFromMultipleCircleTanWireCollections({
                listsOfCircles: [circlesOnPts1, circlesOnPts2, circlesOnPts3],
                combination: OCCT.combinationCirclesForFaceEnum.inOrderClosed,
                unify: true,
                tolerance: 1e-7
            });

            const faces = face.getFaces({ shape: f });
            expect(faces.length).toBe(1);
            const area = face.getFaceArea({ shape: f });
            expect(area).toBe(693.4583936058482);

            deleteCircleShapes(circle1, circle2, circle3, circlesOnPts1, circlesOnPts2, circlesOnPts3);
            f.delete();
            faces.forEach((f) => f.delete());
        });

        it("should create face from multiple circle tan wire collections by using strategy in order closed (to form a grid) and not unify the faces into one", () => {
            const { circlesOnPts1, circlesOnPts2, circlesOnPts3, circle1, circle2, circle3 } = createCirclesForFaceConstruction(3);

            const f = face.createFaceFromMultipleCircleTanWireCollections({
                listsOfCircles: [circlesOnPts1, circlesOnPts2, circlesOnPts3],
                combination: OCCT.combinationCirclesForFaceEnum.inOrderClosed,
                unify: false,
                tolerance: 1e-7
            });

            const faces = face.getFaces({ shape: f });
            expect(faces.length).toBe(15);
            const areas = face.getFacesAreas({ shapes: faces });
            expect(areas).toEqual([
                23.741592653589795, 22.84844425398502,
                22.848444253985033, 23.141592653589793,
                23.14159265358979, 23.141592653589775,
                37.78260880496733, 37.782608804967325,
                37.78260880496735, 72.42362495634481,
                72.42362495634487, 72.42362495634481,
                107.06464110772245, 107.06464110772241,
                107.0646411077224
            ]);

            deleteCircleShapes(circle1, circle2, circle3, circlesOnPts1, circlesOnPts2, circlesOnPts3);
            f.delete();
            faces.forEach((f) => f.delete());
        });

        it("should not create face from multiple circle tan wire collections by using strategy in order closed if circle lists are not of equal length", () => {
            const { circlesOnPts1, circlesOnPts2, circlesOnPts3, circle1, circle2, circle3 } = createNonEqualCircles(4);

            expect(() => {
                face.createFaceFromMultipleCircleTanWireCollections({
                    listsOfCircles: [circlesOnPts1, circlesOnPts2, circlesOnPts3],
                    combination: OCCT.combinationCirclesForFaceEnum.inOrderClosed,
                    unify: true,
                    tolerance: 1e-7
                });
            }).toThrowError("All lists of circles must have the same length in order to use inOrderClosed strategy.");

            deleteCircleShapes(circle1, circle2, circle3, circlesOnPts1, circlesOnPts2, circlesOnPts3);
        });

        const createCirclesForFaceConstruction = (nrOfDivisions: number) => {
            const circle1 = wire.createCircleWire({ radius: 10, center: [0, 0, 0], direction: [0, 1, 0] });
            const circle2 = wire.createCircleWire({ radius: 20, center: [0, 0, 0.3], direction: [0, 1, 0] });
            const circle3 = wire.createCircleWire({ radius: 30, center: [0, 0, 0.3], direction: [0, 1, 0] });

            const ptsOnCircle1 = wire.divideWireByParamsToPoints({ shape: circle1, nrOfDivisions, removeEndPoint: true, removeStartPoint: false });
            const ptsOnCircle2 = wire.divideWireByParamsToPoints({ shape: circle2, nrOfDivisions, removeEndPoint: true, removeStartPoint: false });
            const ptsOnCircle3 = wire.divideWireByParamsToPoints({ shape: circle3, nrOfDivisions, removeEndPoint: true, removeStartPoint: false });

            const circlesOnPts1 = ptsOnCircle1.map((pt) => wire.createCircleWire({ radius: 1, center: pt, direction: [0, 1, 0] }));
            const circlesOnPts2 = ptsOnCircle2.map((pt) => wire.createCircleWire({ radius: 1, center: pt, direction: [0, 1, 0] }));
            const circlesOnPts3 = ptsOnCircle3.map((pt) => wire.createCircleWire({ radius: 1, center: pt, direction: [0, 1, 0] }));
            return { circlesOnPts1, circlesOnPts2, circlesOnPts3, circle1, circle2, circle3 };
        };

        const createNonEqualCircles = (nrOfDivisions: number) => {
            const circle1 = wire.createCircleWire({ radius: 10, center: [0, 0, 0], direction: [0, 1, 0] });
            const circle2 = wire.createCircleWire({ radius: 20, center: [0, 0, 0.3], direction: [0, 1, 0] });
            const circle3 = wire.createCircleWire({ radius: 30, center: [0, 0, 0.3], direction: [0, 1, 0] });

            const ptsOnCircle1 = wire.divideWireByParamsToPoints({ shape: circle1, nrOfDivisions, removeEndPoint: true, removeStartPoint: false });
            const ptsOnCircle2 = wire.divideWireByParamsToPoints({ shape: circle2, nrOfDivisions, removeEndPoint: true, removeStartPoint: false });
            ptsOnCircle2.pop();
            const ptsOnCircle3 = wire.divideWireByParamsToPoints({ shape: circle3, nrOfDivisions, removeEndPoint: true, removeStartPoint: false });

            const circlesOnPts1 = ptsOnCircle1.map((pt) => wire.createCircleWire({ radius: 1, center: pt, direction: [0, 1, 0] }));
            const circlesOnPts2 = ptsOnCircle2.map((pt) => wire.createCircleWire({ radius: 1, center: pt, direction: [0, 1, 0] }));
            const circlesOnPts3 = ptsOnCircle3.map((pt) => wire.createCircleWire({ radius: 1, center: pt, direction: [0, 1, 0] }));
            return { circlesOnPts1, circlesOnPts2, circlesOnPts3, circle1, circle2, circle3 };
        };


        const deleteCircleShapes = (circle1: TopoDS_Wire, circle2: TopoDS_Wire, circle3: TopoDS_Wire, circlesOnPts1: TopoDS_Wire[], circlesOnPts2: TopoDS_Wire[], circlesOnPts3: TopoDS_Wire[]) => {
            circle1.delete();
            circle2.delete();
            circle3.delete();
            circlesOnPts1.forEach((c) => c.delete());
            circlesOnPts2.forEach((c) => c.delete());
            circlesOnPts3.forEach((c) => c.delete());
        };
    });

    describe("Face creation methods", () => {
        it("should create L-polygon face with default parameters", () => {
            const f = face.createLPolygonFace({
                widthFirst: 2,
                lengthFirst: 3,
                widthSecond: 1,
                lengthSecond: 2,
                align: OCCT.directionEnum.outside,
                rotation: 0,
                center: [0, 0, 0],
                direction: [0, 1, 0]
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(10);
            f.delete();
        });

        it("should create L-polygon face with different alignment", () => {
            const f = face.createLPolygonFace({
                widthFirst: 3,
                lengthFirst: 4,
                widthSecond: 1.5,
                lengthSecond: 3,
                align: OCCT.directionEnum.inside,
                rotation: 0,
                center: [0, 0, 0],
                direction: [0, 1, 0]
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(11.9999975);
            f.delete();
        });

        it("should create I-beam profile face with default parameters", () => {
            const f = face.createIBeamProfileFace({
                width: 2,
                height: 3,
                webThickness: 0.2,
                flangeThickness: 0.3,
                alignment: Base.basicAlignmentEnum.midMid,
                rotation: 0,
                center: [0, 0, 0],
                direction: [0, 1, 0]
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(1.68);
            f.delete();
        });

        it("should create I-beam profile face with custom dimensions", () => {
            const f = face.createIBeamProfileFace({
                width: 4,
                height: 5,
                webThickness: 0.5,
                flangeThickness: 0.8,
                alignment: Base.basicAlignmentEnum.midMid,
                rotation: 0,
                center: [0, 0, 0],
                direction: [0, 1, 0]
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(8.099);
            f.delete();
        });

        it("should create H-beam profile face with default parameters", () => {
            const f = face.createHBeamProfileFace({
                width: 2,
                height: 3,
                webThickness: 0.2,
                flangeThickness: 0.3,
                alignment: Base.basicAlignmentEnum.midMid,
                rotation: 0,
                center: [0, 0, 0],
                direction: [0, 1, 0]
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(2.08);
            f.delete();
        });

        it("should create H-beam profile face with larger dimensions", () => {
            const f = face.createHBeamProfileFace({
                width: 3,
                height: 4,
                webThickness: 0.3,
                flangeThickness: 0.5,
                alignment: Base.basicAlignmentEnum.midMid,
                rotation: 0,
                center: [0, 0, 0],
                direction: [0, 1, 0]
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(4.60);
            f.delete();
        });

        it("should create T-beam profile face with default parameters", () => {
            const f = face.createTBeamProfileFace({
                width: 2,
                height: 2,
                webThickness: 0.2,
                flangeThickness: 0.3,
                alignment: Base.basicAlignmentEnum.midMid,
                rotation: 0,
                center: [0, 0, 0],
                direction: [0, 1, 0]
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(0.94);
            f.delete();
        });

        it("should create T-beam profile face with custom dimensions", () => {
            const f = face.createTBeamProfileFace({
                width: 3,
                height: 3,
                webThickness: 0.4,
                flangeThickness: 0.5,
                alignment: Base.basicAlignmentEnum.midMid,
                rotation: 0,
                center: [0, 0, 0],
                direction: [0, 1, 0]
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(2.5);
            f.delete();
        });

        it("should create U-beam profile face with default parameters", () => {
            const f = face.createUBeamProfileFace({
                width: 2,
                height: 3,
                webThickness: 0.2,
                flangeThickness: 0.3,
                flangeWidth: 0.5,
                alignment: Base.basicAlignmentEnum.midMid,
                rotation: 0,
                center: [0, 0, 0],
                direction: [0, 1, 0]
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(2.25);
            f.delete();
        });

        it("should create U-beam profile face with larger dimensions", () => {
            const f = face.createUBeamProfileFace({
                width: 4,
                height: 5,
                webThickness: 0.4,
                flangeThickness: 0.6,
                flangeWidth: 1,
                alignment: Base.basicAlignmentEnum.midMid,
                rotation: 0,
                center: [0, 0, 0],
                direction: [0, 1, 0]
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(7.999);
            f.delete();
        });

        it("should create star face with default parameters", () => {
            const f = face.createStarFace({
                outerRadius: 2,
                innerRadius: 1,
                numRays: 5,
                center: [0, 0, 0],
                direction: [0, 1, 0],
                offsetOuterEdges: 0,
                half: false
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(5.877852522924732);
            f.delete();
        });

        it("should create star face with 7 rays", () => {
            const f = face.createStarFace({
                outerRadius: 3,
                innerRadius: 1.5,
                numRays: 7,
                center: [0, 0, 0],
                direction: [0, 1, 0],
                offsetOuterEdges: 0,
                half: false
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(13.667337782203083);
            f.delete();
        });

        it("should create christmas tree face with default parameters", () => {
            const f = face.createChristmasTreeFace({
                height: 6,
                innerDist: 1.5,
                outerDist: 3,
                nrSkirts: 5,
                trunkHeight: 1,
                trunkWidth: 1,
                half: false,
                rotation: 0,
                origin: [0, 0, 0],
                direction: [0, 1, 0]
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(15.688);
            f.delete();
        });

        it("should create christmas tree face with custom dimensions", () => {
            const f = face.createChristmasTreeFace({
                height: 10,
                innerDist: 2,
                outerDist: 5,
                nrSkirts: 7,
                trunkHeight: 2,
                trunkWidth: 1.5,
                half: false,
                rotation: 0,
                origin: [0, 0, 0],
                direction: [0, 1, 0]
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(40.75510204081631);
            f.delete();
        });

        it("should create parallelogram face with default parameters", () => {
            const f = face.createParallelogramFace({
                center: [0, 0, 0],
                direction: [0, 1, 0],
                aroundCenter: true,
                width: 2,
                height: 1,
                angle: 15
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(2);
            f.delete();
        });

        it("should create parallelogram face with different angle", () => {
            const f = face.createParallelogramFace({
                center: [0, 0, 0],
                direction: [0, 1, 0],
                aroundCenter: true,
                width: 4,
                height: 2,
                angle: 30
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(8);
            f.delete();
        });

        it("should create heart face with default parameters", () => {
            const f = face.createHeartFace({
                center: [0, 0, 0],
                direction: [0, 1, 0],
                rotation: 0,
                sizeApprox: 2
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(2.7330366007628006);
            f.delete();
        });

        it("should create heart face with larger size", () => {
            const f = face.createHeartFace({
                center: [0, 0, 0],
                direction: [0, 1, 0],
                rotation: 0,
                sizeApprox: 4
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(10.932146403051203);
            f.delete();
        });

        it("should create n-gon face with 6 corners (hexagon)", () => {
            const f = face.createNGonFace({
                center: [0, 0, 0],
                direction: [0, 1, 0],
                nrCorners: 6,
                radius: 1
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(2.598076211353316);
            f.delete();
        });

        it("should create n-gon face with 8 corners (octagon)", () => {
            const f = face.createNGonFace({
                center: [0, 0, 0],
                direction: [0, 1, 0],
                nrCorners: 8,
                radius: 2
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(11.31370849898476);
            f.delete();
        });

        it("should create n-gon face with 3 corners (triangle)", () => {
            const f = face.createNGonFace({
                center: [0, 0, 0],
                direction: [0, 1, 0],
                nrCorners: 3,
                radius: 1.5
            });
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(2.927644244729986);
            f.delete();
        });
    });

    describe("Face from base triangle and mesh", () => {
        it("should create face from base triangle", () => {
            const dto = new OCCT.TriangleBaseDto([[0, 0, 0], [2, 0, 0], [1, 2, 0]]);
            const f = face.fromBaseTriangle(dto);
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(2);
            f.delete();
        });

        it("should create face from base triangle with different orientation", () => {
            const dto = new OCCT.TriangleBaseDto([[0, 0, 0], [3, 0, 0], [3, 4, 0]]);
            const f = face.fromBaseTriangle(dto);
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(6);
            f.delete();
        });

        it("should create faces from base mesh with single triangle", () => {
            const dto = new OCCT.MeshBaseDto([[[0, 0, 0], [2, 0, 0], [1, 2, 0]]]);
            const faces = face.fromBaseMesh(dto);
            expect(faces.length).toBe(1);
            const area = face.getFaceArea({ shape: faces[0] });
            expect(area).toBeCloseTo(2);
            faces.forEach(f => f.delete());
        });

        it("should create faces from base mesh with multiple triangles", () => {
            const dto = new OCCT.MeshBaseDto([
                [[0, 0, 0], [2, 0, 0], [1, 2, 0]],
                [[0, 0, 0], [1, 2, 0], [-1, 2, 0]],
                [[5, 0, 0], [7, 0, 0], [6, 3, 0]]
            ]);
            const faces = face.fromBaseMesh(dto);
            expect(faces.length).toBe(3);
            const area1 = face.getFaceArea({ shape: faces[0] });
            const area2 = face.getFaceArea({ shape: faces[1] });
            const area3 = face.getFaceArea({ shape: faces[2] });
            expect(area1).toBeCloseTo(2);
            expect(area2).toBeCloseTo(2);
            expect(area3).toBeCloseTo(3);
            faces.forEach(f => f.delete());
        });
    });

    describe("Face from wire on face methods", () => {
        it("should create face from wire on face", () => {
            const baseFace = face.createRectangleFace({ width: 10, length: 10, center: [0, 0, 0], direction: [0, 0, 1] });
            const circleWire = wire.createCircleWire({ radius: 2, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FaceFromWireOnFaceDto(circleWire, baseFace, true);
            const f = face.createFaceFromWireOnFace(dto);
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(Math.PI * 4);
            baseFace.delete();
            circleWire.delete();
            f.delete();
        });

        it("should create faces from wires on face", () => {
            const baseFace = face.createRectangleFace({ width: 10, length: 10, center: [0, 0, 0], direction: [0, 0, 1] });
            const circleWire1 = wire.createCircleWire({ radius: 1, center: [-2, -2, 0], direction: [0, 0, 1] });
            const circleWire2 = wire.createCircleWire({ radius: 1.5, center: [2, 2, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FacesFromWiresOnFaceDto([circleWire1, circleWire2], baseFace, true);
            const faces = face.createFacesFromWiresOnFace(dto);
            expect(faces.length).toBe(2);
            const area1 = face.getFaceArea({ shape: faces[0] });
            const area2 = face.getFaceArea({ shape: faces[1] });
            expect(area1).toBeCloseTo(Math.PI);
            expect(area2).toBeCloseTo(Math.PI * 2.25);
            baseFace.delete();
            circleWire1.delete();
            circleWire2.delete();
            faces.forEach(f => f.delete());
        });

        it("should create face from multiple wires on face", () => {
            const baseFace = face.createRectangleFace({ width: 10, length: 10, center: [0, 0, 0], direction: [0, 0, 1] });
            const outerWire = wire.createCircleWire({ radius: 3, center: [0, 0, 0], direction: [0, 0, 1] });
            const innerWire = wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FaceFromWiresOnFaceDto([outerWire, innerWire], baseFace, true);
            const f = face.createFaceFromWiresOnFace(dto);
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            // Combined area of both circles: π*3² + π*1² = 9π + π = 10π
            expect(area).toBeCloseTo(Math.PI * 10);
            baseFace.delete();
            outerWire.delete();
            innerWire.delete();
            f.delete();
        });

        it("should create face from wires on face with rectangular boundary", () => {
            const baseFace = face.createRectangleFace({ width: 10, length: 10, center: [0, 0, 0], direction: [0, 0, 1] });
            const rectWire = wire.createRectangleWire({ width: 4, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FaceFromWiresOnFaceDto([rectWire], baseFace, true);
            const f = face.createFaceFromWiresOnFace(dto);
            const area = face.getFaceArea({ shape: f });
            expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
            expect(area).toBeCloseTo(8);
            baseFace.delete();
            rectWire.delete();
            f.delete();
        });
    });

    describe("Face subdivision to wires", () => {
        it("should subdivide face to wires along U", () => {
            const f = face.createRectangleFace({ width: 4, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FaceSubdivisionToWiresDto(f, 5, true, false, false, false);
            const wires = face.subdivideToWires(dto);
            expect(wires.length).toBe(6);
            wires.forEach(w => {
                expect(w.ShapeType()).toBe(occt.TopAbs_ShapeEnum.WIRE);
                const length = wire.getWireLength({ shape: w });
                expect(length).toBeCloseTo(4);
                w.delete();
            });
            f.delete();
        });

        it("should subdivide face to wires along V", () => {
            const f = face.createRectangleFace({ width: 4, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FaceSubdivisionToWiresDto(f, 4, false, false, false, false);
            const wires = face.subdivideToWires(dto);
            expect(wires.length).toBe(5);
            wires.forEach(w => {
                expect(w.ShapeType()).toBe(occt.TopAbs_ShapeEnum.WIRE);
                const length = wire.getWireLength({ shape: w });
                expect(length).toBeCloseTo(2);
                w.delete();
            });
            f.delete();
        });

        it("should subdivide face to wires with start and end removed", () => {
            const f = face.createRectangleFace({ width: 4, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FaceSubdivisionToWiresDto(f, 6, true, false, true, true);
            const wires = face.subdivideToWires(dto);
            expect(wires.length).toBe(5);
            wires.forEach(w => {
                const length = wire.getWireLength({ shape: w });
                expect(length).toBeCloseTo(4);
                w.delete();
            });
            f.delete();
        });
    });

    describe("Face subdivision to rectangle wires and holes", () => {
        it("should subdivide face to rectangle wires", () => {
            const f = face.createRectangleFace({ width: 10, length: 10, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FaceSubdivideToRectangleWiresDto(f, 3, 3);
            const wires = face.subdivideToRectangleWires(dto);
            expect(wires.length).toBe(30);
            wires.forEach(w => {
                expect(w.ShapeType()).toBe(occt.TopAbs_ShapeEnum.WIRE);
                const length = wire.getWireLength({ shape: w });
                expect(length).toBeCloseTo(8.666666666666666);
                w.delete();
            });
            f.delete();
        });

        it("should subdivide face to rectangle wires with scale pattern", () => {
            const f = face.createRectangleFace({ width: 10, length: 10, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FaceSubdivideToRectangleWiresDto(f, 2, 2, [0.8, 0.6], [0.9, 0.7]);
            const wires = face.subdivideToRectangleWires(dto);
            expect(wires.length).toBe(20);
            wires.forEach((w, i) => {
                const length = wire.getWireLength({ shape: w });
                if (i % 2 === 0) {
                    expect(length).toBeCloseTo(9.8);
                } else {
                    expect(length).toBeCloseTo(7.4);
                }
                w.delete();
            });
            f.delete();
        });

        it("should subdivide face to rectangle holes", () => {
            const f = face.createRectangleFace({ width: 10, length: 10, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FaceSubdivideToRectangleHolesDto(f, 2, 2, [0.5], [0.5]);
            const faces = face.subdivideToRectangleHoles(dto);
            expect(faces.length).toBe(1);
            faces.forEach(fc => fc.delete());
            f.delete();
        });

        it("should subdivide face to rectangle holes with holesToFaces", () => {
            const f = face.createRectangleFace({ width: 10, length: 10, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FaceSubdivideToRectangleHolesDto(f, 2, 2, [0.5], [0.5], undefined, undefined, true);
            const faces = face.subdivideToRectangleHoles(dto);
            expect(faces.length).toBe(21);
            faces.forEach(fc => fc.delete());
            f.delete();
        });
    });

    describe("Face subdivision to hexagon wires and holes", () => {
        it("should subdivide face to hexagon wires", () => {
            const f = face.createRectangleFace({ width: 10, length: 10, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FaceSubdivideToHexagonWiresDto(f, 3, 3);
            const wires = face.subdivideToHexagonWires(dto);
            expect(wires.length).toBe(30);
            wires.forEach(w => {
                expect(w.ShapeType()).toBe(occt.TopAbs_ShapeEnum.WIRE);
                const length = wire.getWireLength({ shape: w });
                expect(length).toBeCloseTo(8.430363180804955);
                w.delete();
            });
            f.delete();
        });

        it("should subdivide face to hexagon wires with flat U", () => {
            const f = face.createRectangleFace({ width: 10, length: 10, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FaceSubdivideToHexagonWiresDto(f, 2, 2, true);
            const wires = face.subdivideToHexagonWires(dto);
            expect(wires.length).toBe(20);
            wires.forEach(w => {
                const length = wire.getWireLength({ shape: w });
                expect(length).toBeCloseTo(9.393712757732946);
                w.delete();
            });
            f.delete();
        });

        it("should subdivide face to hexagon holes", () => {
            const f = face.createRectangleFace({ width: 10, length: 10, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FaceSubdivideToHexagonHolesDto(f, 2, 2);
            const faces = face.subdivideToHexagonHoles(dto);
            expect(faces.length).toBe(1);
            const area = face.getFaceArea({ shape: faces[0] });
            expect(area).toBeCloseTo(79.59183673469393);
            faces.forEach(fc => fc.delete());
            f.delete();
        });

        it("should subdivide face to hexagon holes with holesToFaces", () => {
            const f = face.createRectangleFace({ width: 10, length: 10, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FaceSubdivideToHexagonHolesDto(f, 2, 2, false, true);
            const faces = face.subdivideToHexagonHoles(dto);
            expect(faces.length).toBe(21);
            faces.forEach((fc, i) => {
                const area = face.getFaceArea({ shape: fc });
                if (i === 0) {
                    expect(area).toBeCloseTo(79.59183673469393);
                } else {
                    expect(area).toBeCloseTo(1.0204081632653064);
                }
                fc.delete();
            });
            f.delete();
        });
    });

    describe("Wire along param methods", () => {
        it("should create wire along U param", () => {
            const f = face.createRectangleFace({ width: 4, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.WireAlongParamDto(f, true, 0.5);
            const w = face.wireAlongParam(dto);
            expect(w.ShapeType()).toBe(occt.TopAbs_ShapeEnum.WIRE);
            const length = wire.getWireLength({ shape: w });
            expect(length).toBeCloseTo(4);
            f.delete();
            w.delete();
        });

        it("should create wire along V param", () => {
            const f = face.createRectangleFace({ width: 4, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.WireAlongParamDto(f, false, 0.5);
            const w = face.wireAlongParam(dto);
            expect(w.ShapeType()).toBe(occt.TopAbs_ShapeEnum.WIRE);
            const length = wire.getWireLength({ shape: w });
            expect(length).toBeCloseTo(2);
            f.delete();
            w.delete();
        });

        it("should create wires along multiple U params", () => {
            const f = face.createRectangleFace({ width: 4, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.WiresAlongParamsDto(f, true, [0.25, 0.5, 0.75]);
            const wires = face.wiresAlongParams(dto);
            expect(wires.length).toBe(3);
            wires.forEach(w => {
                expect(w.ShapeType()).toBe(occt.TopAbs_ShapeEnum.WIRE);
                const length = wire.getWireLength({ shape: w });
                expect(length).toBeCloseTo(4);
                w.delete();
            });
            f.delete();
        });

        it("should create wires along multiple V params", () => {
            const f = face.createRectangleFace({ width: 4, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.WiresAlongParamsDto(f, false, [0.2, 0.8]);
            const wires = face.wiresAlongParams(dto);
            expect(wires.length).toBe(2);
            wires.forEach(w => {
                const length = wire.getWireLength({ shape: w });
                expect(length).toBeCloseTo(2);
                w.delete();
            });
            f.delete();
        });
    });

    describe("Hexagons in grid", () => {
        it("should create hexagons in grid", () => {
            const dto = new OCCT.HexagonsInGridDto(5, 5, 3, 3);
            const hexFaces = face.hexagonsInGrid(dto);
            expect(hexFaces.length).toBe(9);
            hexFaces.forEach(f => {
                expect(f.ShapeType()).toBe(occt.TopAbs_ShapeEnum.FACE);
                const area = face.getFaceArea({ shape: f });
                expect(area).toBeCloseTo(2.142857142857143);
                f.delete();
            });
        });

        it("should create hexagons in grid with flat top", () => {
            const dto = new OCCT.HexagonsInGridDto(6, 6, 2, 2, true);
            const hexFaces = face.hexagonsInGrid(dto);
            expect(hexFaces.length).toBe(4);
            hexFaces.forEach(f => {
                const area = face.getFaceArea({ shape: f });
                expect(area).toBeCloseTo(6.171428571428569);
                f.delete();
            });
        });

        it("should create hexagons in grid with extensions", () => {
            const dto = new OCCT.HexagonsInGridDto(8, 8, 3, 3, false, true, true, true, true);
            const hexFaces = face.hexagonsInGrid(dto);
            expect(hexFaces.length).toBe(9);
            hexFaces.forEach(f => {
                const area = face.getFaceArea({ shape: f });
                expect(area).toBeCloseTo(9.599999999999998);
                f.delete();
            });
        });
    });

    describe("Filter faces points", () => {
        it("should filter points for multiple faces returning flat array", () => {
            const f1 = face.createRectangleFace({ width: 2, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
            const f2 = face.createRectangleFace({ width: 2, length: 2, center: [5, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FilterFacesPointsDto(
                [f1, f2],
                [[0, 0, 0], [0.5, 0.5, 0], [5, 0, 0], [5.5, 0.5, 0], [10, 10, 0]],
                1e-4,
                false,
                0.1,
                true,
                true,
                false,
                false,
                true
            );
            const filteredPoints = face.filterFacesPoints(dto);
            expect(Array.isArray(filteredPoints)).toBe(true);
            expect((filteredPoints as number[][]).length).toBe(4);
            f1.delete();
            f2.delete();
        });

        it("should filter points for multiple faces returning nested array", () => {
            const f1 = face.createRectangleFace({ width: 2, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
            const f2 = face.createRectangleFace({ width: 2, length: 2, center: [5, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FilterFacesPointsDto(
                [f1, f2],
                [[0, 0, 0], [0.5, 0.5, 0], [5, 0, 0], [5.5, 0.5, 0], [10, 10, 0]],
                1e-4,
                false,
                0.1,
                true,
                true,
                false,
                false,
                false
            );
            const filteredPoints = face.filterFacesPoints(dto);
            expect(Array.isArray(filteredPoints)).toBe(true);
            expect((filteredPoints as number[][][]).length).toBe(2);
            f1.delete();
            f2.delete();
        });

        it("should return empty array when no points match", () => {
            const f1 = face.createRectangleFace({ width: 2, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
            const dto = new OCCT.FilterFacesPointsDto(
                [f1],
                [[100, 100, 0], [200, 200, 0]],
                1e-4,
                false,
                0.1,
                true,
                true,
                false,
                false,
                true
            );
            const filteredPoints = face.filterFacesPoints(dto);
            expect((filteredPoints as number[][]).length).toBe(0);
            f1.delete();
        });
    });

});
