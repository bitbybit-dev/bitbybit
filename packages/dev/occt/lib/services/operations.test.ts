import initOpenCascade, { OpenCascadeInstance, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../api/inputs/inputs";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { VectorHelperService } from "../api/vector-helper.service";
import { OccHelper } from "../occ-helper";
import { OCCTOperations } from "./operations";
import { OCCTEdge, OCCTFace, OCCTShell, OCCTSolid, OCCTWire } from "./shapes";

describe("OCCT operations unit tests", () => {
    let occt: OpenCascadeInstance;
    let operations: OCCTOperations;
    let occHelper: OccHelper;
    let wire: OCCTWire;
    let edge: OCCTEdge;
    let face: OCCTFace;
    let solid: OCCTSolid;
    let shell: OCCTShell;

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        wire = new OCCTWire(occt, occHelper);
        face = new OCCTFace(occt, occHelper);
        edge = new OCCTEdge(occt, occHelper);
        operations = new OCCTOperations(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
        shell = new OCCTShell(occt, occHelper);
    });

    it("should get two closest points between two shapes", async () => {

        const sph1 = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 1);
        const sph2 = occHelper.entitiesService.bRepPrimAPIMakeSphere([3, 3, 3], [0, 1, 0], 1);
        const res = operations.closestPointsBetweenTwoShapes({ shape1: sph1, shape2: sph2 });
        expect(res.length).toBe(2);
        expect(res).toEqual([
            [0.5773398570788231, 0.577340634175626, 0.5773703157921182],
            [2.4226416164327524, 2.4226611251606816, 2.4226464510164636]
        ]);
    });

    it("should get five closest points between a shape and a collection of points", async () => {
        const points = [
            [0, 2, 0],
            [1, 1, 1],
            [2, -2, 2],
            [-3, 3, 3],
            [4, 4, -4],
        ] as Inputs.Base.Point3[];
        const sph = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 1);
        const res = operations.closestPointsOnShapeFromPoints({ shape: sph, points });
        expect(res.length).toBe(5);
        expect(res).toEqual([
            [-1.4997597826618576e-32, 1, 6.123233995736766e-17],
            [0.5773502691896258, 0.5773502691896257, 0.5773502691896257],
            [0.5773502691896258, -0.5773502691896257, 0.5773502691896257],
            [-0.5773502691896258, 0.5773502691896257, 0.5773502691896256],
            [0.5773502691896258, 0.5773502691896257, -0.5773502691896257]
        ]);
    });

    it("should get ten closest points between two shape and a collection of points", async () => {
        const points = [
            [0, 2, 0],
            [1, 1, 1],
            [2, -2, 2],
            [-3, 3, 3],
            [4, 4, -4],
        ] as Inputs.Base.Point3[];
        const sph1 = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 10, 0], [0, 1, 0], 1);
        const sph2 = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 10], [0, 1, 0], 2);

        const res = operations.closestPointsOnShapesFromPoints({ shapes: [sph1, sph2], points });
        expect(res.length).toBe(10);
        expect(res).toEqual(
            [
                [-1.4997597826618576e-32, 9, 6.123233995736766e-17],
                [0.1097642599896904, 9.012121660092786, 0.10976425998969039],
                [0.1622214211307626, 9.026671473215425, 0.16222142113076257],
                [-0.3665083330689157, 9.144813889505864, 0.36650833306891556],
                [0.48507125007266594, 9.272393124891002, -0.4850712500726658],
                [2.4017299715812683e-16, 0.3922322702763681, 8.03883864861816],
                [0.21952851997938053, 0.21952851997938067, 8.024243320185574],
                [0.471404520791032, -0.47140452079103173, 8.114381916835873],
                [-0.733016666137831, 0.7330166661378313, 8.289627779011727],
                [0.5298129428260179, 0.5298129428260177, 8.145654700108938]
            ]
        );
    });

    it("should loft three ellipses correctly", async () => {
        const ellipse1 = wire.createEllipseWire({ center: [0, 0, 0], radiusMajor: 1, radiusMinor: 0.5, direction: [0, 1, 0] });
        const ellipse2 = wire.createEllipseWire({ center: [0, 1, 0], radiusMajor: 2, radiusMinor: 1, direction: [0, 1, 0] });
        const ellipse3 = wire.createEllipseWire({ center: [0, 2, 0], radiusMajor: 0.5, radiusMinor: 0.3, direction: [0, 1, 0] });

        const res = operations.loft({ shapes: [ellipse1, ellipse2, ellipse3], makeSolid: false });
        const faces = face.getFaces({ shape: res });
        const faceOfLoft = faces[0];
        const area = face.getFaceArea({ shape: faceOfLoft });
        expect(area).toEqual(19.731425414345722);
        const subd = new Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>(faceOfLoft);
        subd.nrDivisionsU = 3;
        subd.nrDivisionsV = 3;
        const pointsOnFace = face.subdivideToPoints(subd);
        expect(pointsOnFace).toEqual([
            [-1.4480758326328265e-16, 0, 0.9999999999999996],
            [-2.9314375490419973e-16, 1.1222576454204045, 1.9878480388174884],
            [-1.7076514842078376e-16, 2, 0.49999999999999994],
            [1.1102230246251565e-16, 0, -0.9999999864095009],
            [1.942890293094024e-16, 1.122257645420405, -1.9878480118016424],
            [4.85722573273506e-17, 2, -0.4999999932047503],
            [2.6784174176031053e-16, 0, 0.9999999999999991],
            [5.339545466727986e-16, 1.1222576454204045, 1.9878480388174875],
            [1.623017589667632e-16, 2, 0.49999999999999994]
        ]);
    });

    it("should loft three ellipses correctly by using advanced loft method", async () => {
        const ellipse1 = wire.createEllipseWire({ center: [0, 0, 0], radiusMajor: 1, radiusMinor: 0.5, direction: [0, 1, 0] });
        const ellipse2 = wire.createEllipseWire({ center: [0, 1, 0], radiusMajor: 2, radiusMinor: 1, direction: [0, 1, 0] });
        const ellipse3 = wire.createEllipseWire({ center: [0, 2, 0], radiusMajor: 0.5, radiusMinor: 0.3, direction: [0, 1, 0] });

        const opt = new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>([ellipse1, ellipse2, ellipse3]);
        const res = operations.loftAdvanced(opt);
        const faces = face.getFaces({ shape: res });
        const faceOfLoft = faces[0];
        const area = face.getFaceArea({ shape: faceOfLoft });
        expect(area).toEqual(19.60954299347563);
        const subd = new Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>(faceOfLoft);
        subd.nrDivisionsU = 3;
        subd.nrDivisionsV = 3;
        const pointsOnFace = face.subdivideToPoints(subd);
        expect(pointsOnFace).toEqual([
            [-1.4480758326328265e-16, 0, 0.9999999999999996],
            [-2.908864483812667e-16, 1.060683523583573, 1.9894154044367316],
            [-1.7076514842078376e-16, 2, 0.49999999999999994],
            [1.1102230246251565e-16, 0, -0.9999999864095009],
            [1.942890293094024e-16, 1.060683523583573, -1.9894153773995842],
            [4.85722573273506e-17, 2, -0.4999999932047503],
            [2.6784174176031053e-16, 0, 0.9999999999999991],
            [5.336575480145869e-16, 1.060683523583573, 1.989415404436731],
            [1.623017589667632e-16, 2, 0.49999999999999994]
        ]);
    });

    it("should loft three ellipses correctly by using advanced loft method that is closed", async () => {
        const ellipse1 = wire.createEllipseWire({ center: [0, 0, 0], radiusMajor: 1, radiusMinor: 0.5, direction: [0, 1, 0] });
        const ellipse2 = wire.createEllipseWire({ center: [0, 1, 0], radiusMajor: 2, radiusMinor: 1, direction: [0, 1, 0] });
        const ellipse3 = wire.createEllipseWire({ center: [0, 2, 0], radiusMajor: 0.5, radiusMinor: 0.3, direction: [0, 1, 0] });

        const opt = new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>([ellipse1, ellipse2, ellipse3]);
        opt.closed = true;
        const res = operations.loftAdvanced(opt);
        const faces = face.getFaces({ shape: res });
        const faceOfLoft = faces[0];
        const area = face.getFaceArea({ shape: faceOfLoft });
        expect(area).toEqual(26.727187158113303);
        const subd = new Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>(faceOfLoft);
        subd.nrDivisionsU = 3;
        subd.nrDivisionsV = 3;
        const pointsOnFace = face.subdivideToPoints(subd);
        expect(pointsOnFace).toEqual([
            [-1.4480758326328265e-16, 0, 0.9999999999999996],
            [-2.3256347106100894e-16, 1.7646585137649389, 1.1737689851268602],
            [-1.4480758326328265e-16, 0, 0.9999999999999996],
            [1.1102230246251565e-16, 0, -0.9999999864095009],
            [8.326672684688674e-17, 1.764658513764939, -1.1737689691747544],
            [1.1102230246251565e-16, 0, -0.9999999864095009],
            [2.6784174176031053e-16, 0, 0.9999999999999991],
            [3.3244467246878387e-16, 1.7646585137649389, 1.17376898512686],
            [2.6784174176031053e-16, 0, 0.9999999999999991]
        ]);
    });

    it("should loft three ellipses correctly by using advanced loft method that uses approxChordLength parametrisation", async () => {
        const ellipse1 = wire.createEllipseWire({ center: [0, 0, 0], radiusMajor: 1, radiusMinor: 0.5, direction: [0, 1, 0] });
        const ellipse2 = wire.createEllipseWire({ center: [0, 1, 0], radiusMajor: 2, radiusMinor: 1, direction: [0, 1, 0] });
        const ellipse3 = wire.createEllipseWire({ center: [0, 2, 0], radiusMajor: 0.5, radiusMinor: 0.3, direction: [0, 1, 0] });

        const opt = new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>([ellipse1, ellipse2, ellipse3]);
        opt.parType = Inputs.OCCT.approxParametrizationTypeEnum.approxChordLength;
        const res = operations.loftAdvanced(opt);
        const faces = face.getFaces({ shape: res });
        const faceOfLoft = faces[0];
        const area = face.getFaceArea({ shape: faceOfLoft });
        expect(area).toEqual(19.731425414345722);
        const subd = new Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>(faceOfLoft);
        subd.nrDivisionsU = 3;
        subd.nrDivisionsV = 3;
        const pointsOnFace = face.subdivideToPoints(subd);
        expect(pointsOnFace).toEqual([
            [-1.4480758326328265e-16, 0, 0.9999999999999996],
            [-2.9314375490419973e-16, 1.1222576454204045, 1.9878480388174884],
            [-1.7076514842078376e-16, 2, 0.49999999999999994],
            [1.1102230246251565e-16, 0, -0.9999999864095009],
            [1.942890293094024e-16, 1.122257645420405, -1.9878480118016424],
            [4.85722573273506e-17, 2, -0.4999999932047503],
            [2.6784174176031053e-16, 0, 0.9999999999999991],
            [5.339545466727986e-16, 1.1222576454204045, 1.9878480388174875],
            [1.623017589667632e-16, 2, 0.49999999999999994]
        ]);
    });

    it("should loft three ellipses correctly by using advanced loft method that uses approxIsoParametric parametrisation", async () => {
        const ellipse1 = wire.createEllipseWire({ center: [0, 0, 0], radiusMajor: 1, radiusMinor: 0.5, direction: [0, 1, 0] });
        const ellipse2 = wire.createEllipseWire({ center: [0, 1, 0], radiusMajor: 2, radiusMinor: 1, direction: [0, 1, 0] });
        const ellipse3 = wire.createEllipseWire({ center: [0, 2, 0], radiusMajor: 0.5, radiusMinor: 0.3, direction: [0, 1, 0] });

        const opt = new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>([ellipse1, ellipse2, ellipse3]);
        opt.parType = Inputs.OCCT.approxParametrizationTypeEnum.approxIsoParametric;
        const res = operations.loftAdvanced(opt);
        const faces = face.getFaces({ shape: res });
        const faceOfLoft = faces[0];
        const area = face.getFaceArea({ shape: faceOfLoft });
        expect(area).toEqual(19.628737555434956);
        const subd = new Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>(faceOfLoft);
        subd.nrDivisionsU = 3;
        subd.nrDivisionsV = 3;
        const pointsOnFace = face.subdivideToPoints(subd);
        expect(pointsOnFace).toEqual([
            [-1.4480758326328265e-16, 0, 0.9999999999999996],
            [-2.896151665265653e-16, 1, 1.9999999999999991],
            [-1.7076514842078376e-16, 2, 0.49999999999999994],
            [1.1102230246251565e-16, 0, -0.9999999864095009],
            [2.220446049250313e-16, 1.0000000000000004, -1.9999999728190019],
            [4.85722573273506e-17, 2, -0.4999999932047503],
            [2.6784174176031053e-16, 0, 0.9999999999999991],
            [5.356834835206212e-16, 1, 1.9999999999999982],
            [1.623017589667632e-16, 2, 0.49999999999999994]
        ]);
    });

    it("should loft three ellipses correctly by using advanced loft method and start and end vertexes", async () => {
        const ellipse1 = wire.createEllipseWire({ center: [0, 1, 0], radiusMajor: 1, radiusMinor: 0.5, direction: [0, 1, 0] });
        const ellipse2 = wire.createEllipseWire({ center: [0, 2, 0], radiusMajor: 2, radiusMinor: 1, direction: [0, 1, 0] });
        const ellipse3 = wire.createEllipseWire({ center: [0, 3, 0], radiusMajor: 0.5, radiusMinor: 0.3, direction: [0, 1, 0] });

        const opt = new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>([ellipse1, ellipse2, ellipse3]);
        opt.startVertex = [0, 0, 0];
        opt.endVertex = [0, 4, 0];
        const res = operations.loftAdvanced(opt);
        const faces = face.getFaces({ shape: res });
        const faceOfLoft = faces[0];
        const area = face.getFaceArea({ shape: faceOfLoft });
        expect(area).toEqual(21.996996042031732);
        const subd = new Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>(faceOfLoft);
        subd.nrDivisionsU = 3;
        subd.nrDivisionsV = 3;
        const pointsOnFace = face.subdivideToPoints(subd);
        expect(pointsOnFace).toEqual(
            [
                [0, 0, 0],
                [-2.8987003281313973e-16, 2.0073499398141568, 1.9983661266076949],
                [0, 4, 0],
                [0, 0, 0],
                [2.3592239273284567e-16, 2.0073499398141568, -1.9983660994489023],
                [0, 4, 0],
                [0, 0, 0],
                [5.353876694283919e-16, 2.0073499398141568, 1.9983661266076944],
                [0, 4, 0]
            ]
        );
    });

    it("should loft three ellipses correctly by using advanced loft method with closed and periodic interpolation enabled", async () => {
        const ellipse1 = wire.createEllipseWire({ center: [0, 0, 0], radiusMajor: 1, radiusMinor: 0.5, direction: [0, 1, 0] });
        const ellipse2 = wire.createEllipseWire({ center: [0, 1, 0], radiusMajor: 2, radiusMinor: 1, direction: [0, 1, 0] });
        const ellipse3 = wire.createEllipseWire({ center: [0, 2, 0], radiusMajor: 0.5, radiusMinor: 0.3, direction: [0, 1, 0] });

        const opt = new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>([ellipse1, ellipse2, ellipse3]);
        opt.periodic = true;
        opt.closed = true;
        opt.nrPeriodicSections = 10;
        const res = operations.loftAdvanced(opt);
        const faces = face.getFaces({ shape: res });
        const faceOfLoft = faces[0];
        const area = face.getFaceArea({ shape: faceOfLoft });
        expect(area).toEqual(25.324671688146765);
        const subd = new Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>(faceOfLoft);
        subd.nrDivisionsU = 3;
        subd.nrDivisionsV = 3;
        const pointsOnFace = face.subdivideToPoints(subd);

        expect(pointsOnFace).toEqual([
            [0, -5.551115123125783e-17, 1],
            [-8.914760633184574e-17, -5.5511151231257815e-17, -1.0000000000000007],
            [-1.2246467991473532e-16, -5.551115123125783e-17, 1],
            [0, 2.0432249027445284, 1.0479566351043827],
            [-3.9717754623032344e-17, 2.0432249027445293, -1.047956635104383],
            [-1.3811166947220446e-16, 2.0432249027445284, 1.047956635104383],
            [0, -2.7755575615628914e-17, 1],
            [2.1874696130669933e-17, -2.775557561562902e-17, -1],
            [-1.2246467991473532e-16, -2.7755575615628914e-17, 1]
        ]);
    });

    it("should not loft three ellipses by using advanced loft method if periodic option is enabled and closed disabled", async () => {
        const ellipse1 = wire.createEllipseWire({ center: [0, 0, 0], radiusMajor: 1, radiusMinor: 0.5, direction: [0, 1, 0] });
        const ellipse2 = wire.createEllipseWire({ center: [0, 1, 0], radiusMajor: 2, radiusMinor: 1, direction: [0, 1, 0] });
        const ellipse3 = wire.createEllipseWire({ center: [0, 2, 0], radiusMajor: 0.5, radiusMinor: 0.3, direction: [0, 1, 0] });

        const opt = new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>([ellipse1, ellipse2, ellipse3]);
        opt.periodic = true;
        opt.closed = false;
        opt.nrPeriodicSections = 10;
        expect(() => operations.loftAdvanced(opt)).toThrow("Cant construct periodic non closed loft.");
    });

    it("should slice a solid shape to pieces", () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeBox(1, 2, 3, [0, 0, 0]);
        const res = operations.slice({ shape: box, direction: [0, 1, 0], step: 0.1 });
        const wires = wire.getWires({ shape: res });
        const faces = face.getFaces({ shape: res });
        expect(faces.length).toBe(31);
        expect(wires.length).toBe(31);
    });

    it("should slice a solid shape to pieces", () => {
        const sphere = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        const res = operations.slice({ shape: sphere, direction: [0, 1, 0], step: 0.1 });
        const wires = wire.getWires({ shape: res });
        const faces = face.getFaces({ shape: res });
        expect(faces.length).toBe(59);
        expect(wires.length).toBe(59);
    });

    it("should slice two compounded solid shapes to pieces", () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        const sphere = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        const comp = occHelper.converterService.makeCompound({ shapes: [box, sphere] });
        const res = operations.slice({ shape: comp, direction: [0, 1, 0], step: 0.1 });
        const wires = wire.getWires({ shape: res });
        const faces = face.getFaces({ shape: res });
        expect(faces.length).toBe(118);
        expect(wires.length).toBe(118);
    });

    it("should slice two compounded solid shapes to pieces on an angle", () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        const sphere = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        const comp = occHelper.converterService.makeCompound({ shapes: [box, sphere] });
        const res = operations.slice({ shape: comp, direction: [0, 1, 1], step: 0.2 });
        const wires = wire.getWires({ shape: res });
        const faces = face.getFaces({ shape: res });
        expect(faces.length).toBe(62);
        expect(wires.length).toBe(62);
    });

    it("should not slice shapes when step is 0", () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        expect(() => operations.slice({ shape: box, direction: [0, 1, 1], step: 0 })).toThrow("Step needs to be positive.");
    });

    it("should not slice shapes when step is lower than 0", () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        expect(() => operations.slice({ shape: box, direction: [0, 1, 1], step: -0.1 })).toThrow("Step needs to be positive.");
    });

    it("should not slice shapes that are not solids", () => {
        const starWire = wire.createStarWire({ numRays: 5, innerRadius: 3, outerRadius: 5, center: [0, 0, 0], direction: [0, 1, 0], half: false });
        const starWireExtrusion = operations.extrude({ shape: starWire, direction: [0, 1, 0] });
        expect(() => operations.slice({ shape: starWireExtrusion, direction: [0, 1, 1], step: 0.1 })).toThrow("No solids found to slice.");
    });

    it("should not slice shapes that are not solids", () => {
        const starWire = wire.createStarWire({ numRays: 5, innerRadius: 3, outerRadius: 5, center: [0, 0, 0], direction: [0, 1, 0], half: false });
        expect(() => operations.slice({ shape: starWire, direction: [0, 1, 1], step: 0.1 })).toThrow("No solids found to slice.");
    });

    it("should slice two compounded solid shapes to pieces on an angle with step pattern of two numbers", () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        const sphere = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        const comp = occHelper.converterService.makeCompound({ shapes: [box, sphere] });
        const res = operations.sliceInStepPattern({ shape: comp, direction: [0, 1, 1], steps: [0.1, 0.2] });
        const wires = wire.getWires({ shape: res });
        const faces = face.getFaces({ shape: res });
        expect(faces.length).toBe(82);
        expect(wires.length).toBe(82);
    });

    it("should slice two compounded solid shapes to pieces on an angle with step pattern of three numbers", () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        const sphere = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        const comp = occHelper.converterService.makeCompound({ shapes: [box, sphere] });
        const res = operations.sliceInStepPattern({ shape: comp, direction: [0, 1, 1], steps: [0.1, 0.2, 0.3] });
        const wires = wire.getWires({ shape: res });
        const faces = face.getFaces({ shape: res });
        expect(faces.length).toBe(62);
        expect(wires.length).toBe(62);
    });

    it("should not slice in pattern if steps property is undefines", () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        expect(() => operations.sliceInStepPattern({ shape: box, direction: [0, 1, 1], steps: undefined })).toThrow("Steps must be provided with at elast one positive value");
    });

    it("should not slice in pattern if steps property is an empty array", () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        expect(() => operations.sliceInStepPattern({ shape: box, direction: [0, 1, 1], steps: [] })).toThrow("Steps must be provided with at elast one positive value");
    });

    it("should not slice in pattern shapes that are not solids", () => {
        const starWire = wire.createStarWire({ numRays: 5, innerRadius: 3, outerRadius: 5, center: [0, 0, 0], direction: [0, 1, 0], half: false });
        const starWireExtrusion = operations.extrude({ shape: starWire, direction: [0, 1, 0] });
        expect(() => operations.sliceInStepPattern({ shape: starWireExtrusion, direction: [0, 1, 1], steps: [0.1] })).toThrow("No solids found to slice.");
    });

    it("should not slice in pattern shapes that are not solids", () => {
        const starWire = wire.createStarWire({ numRays: 5, innerRadius: 3, outerRadius: 5, center: [0, 0, 0], direction: [0, 1, 0], half: false });
        expect(() => operations.sliceInStepPattern({ shape: starWire, direction: [0, 1, 1], steps: [0.1] })).toThrow("No solids found to slice.");
    });

    it("should offset 3D wire by distance if given a direction of a plane normal for offset", () => {
        const points = [
            [0, 24, -20],
            [-10, 20, -10],
            [0, 15, 0],
            [0, 12, 10],
            [20, 7, 16],
            [40, 25, 40],
            [-20, 7, 16],
            [-20, 7, -16]
        ] as Inputs.Base.Point3[];

        const polylineWire = wire.createPolylineWire({
            points,
        });

        const filletWire = occHelper.filletsService.fillet3DWire({ shape: polylineWire, radius: 5, direction: [0, 30, 0] });
        const offsetWireDir1 = operations.offset3DWire({
            shape: filletWire,
            direction: [0, 1, 0],
            offset: 2,
        }) as TopoDS_Wire;

        const offsetWireDir2 = operations.offset3DWire({
            shape: filletWire,
            direction: [0, 1, 0],
            offset: -2,
        }) as TopoDS_Wire;

        const filletLength = wire.getWireLength({ shape: filletWire });
        const wireLength1 = wire.getWireLength({ shape: offsetWireDir1 });
        const wireLength2 = wire.getWireLength({ shape: offsetWireDir2 });

        expect(wireLength1).toBeCloseTo(168.790359306275);
        expect(filletLength).toBeCloseTo(164.11239253261422);
        expect(wireLength2).toBeCloseTo(160.25576209902425);

    });

    it("should offset 3D wire by distance if given a direction of a plane normal for offset", () => {
        const points = [
            [0, 24, -20],
            [-10, 20, -10],
            [0, 15, 0],
            [0, 12, 10],
            [20, 7, 16],
            [40, 25, 40],
            [-20, 7, 16],
            [-20, 7, -16]
        ] as Inputs.Base.Point3[];

        const interpolatedWire = wire.interpolatePoints({
            points,
            periodic: false,
            tolerance: 0.1,
        });

        const offsetWireDir1 = operations.offset3DWire({
            shape: interpolatedWire,
            direction: [0, 1, 0],
            offset: 2,
        }) as TopoDS_Wire;

        const offsetWireDir2 = operations.offset3DWire({
            shape: interpolatedWire,
            direction: [0, 1, 0],
            offset: -2,
        }) as TopoDS_Wire;

        const interpWireLength = wire.getWireLength({ shape: interpolatedWire });
        const wireLength1 = wire.getWireLength({ shape: offsetWireDir1 });
        const wireLength2 = wire.getWireLength({ shape: offsetWireDir2 });

        expect(wireLength1).toBeCloseTo(218.52116637474018);
        expect(interpWireLength).toBeCloseTo(213.1483348902019);
        expect(wireLength2).toBeCloseTo(208.59746753494878);

    });

    it("should offset 3D combined wire from interpolation and a line by distance if given a direction of a plane normal for offset", () => {
        const points = [
            [0, 0, 0],
            [0, 1, 1],
            [2, 0.5, 1],
            [2, 0, 2],
        ] as Inputs.Base.Point3[];

        const polylineWire = wire.interpolatePoints({
            points,
            periodic: false,
            tolerance: 0.1,
        });

        const lineWire = wire.createLineWire({
            start: [2, 0, 2],
            end: [5, 0, 0],
        });

        const combinedWire = wire.combineEdgesAndWiresIntoAWire({
            shapes: [polylineWire, lineWire]
        });

        const offsetWireDir1 = operations.offset3DWire({
            shape: combinedWire,
            direction: [0, 1, 0],
            offset: 0.1,
        }) as TopoDS_Wire;

        const offsetWireDir2 = operations.offset3DWire({
            shape: combinedWire,
            direction: [0, 1, 0],
            offset: -0.1,
        }) as TopoDS_Wire;


        const interpWireLength = wire.getWireLength({ shape: combinedWire });
        const wireLength1 = wire.getWireLength({ shape: offsetWireDir1 });
        const wireLength2 = wire.getWireLength({ shape: offsetWireDir2 });

        expect(wireLength1).toBeCloseTo(8.606363207743371);
        expect(interpWireLength).toBeCloseTo(8.58583309897651);
        expect(wireLength2).toBeCloseTo(8.592691735283145);

    });

    it("should measure distances from points to a shape", () => {
        const sphere = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 1);
        const points = [
            [6, 0, 0],
            [0, 3, 0],
            [0, 7, 3],
            [0, 0, -3],
            [0, -3, 0],
            [0, 0, 5],
        ] as Inputs.Base.Point3[];

        const distances = operations.distancesToShapeFromPoints({ shape: sphere, points });
        expect(distances).toEqual([5, 2, 6.615773105863909, 2, 2, 4]);
    });

    it("should offset a square to negative direction", () => {
        const squareWire = wire.createSquareWire({ center: [0, 0, 0], size: 1, direction: [0, 0, 1] });
        const offsetRes = operations.offset({ shape: squareWire, distance: -0.1, tolerance: 1e-7 });
        const wires = wire.getWires({ shape: offsetRes });
        const wireLength = wire.getWireLength({ shape: offsetRes });
        expect(wireLength).toEqual(3.2);
        squareWire.delete();
        offsetRes.delete();
        wires.forEach(w => w.delete());
    });

    it("should offset a square to positive direction", () => {
        const squareWire = wire.createSquareWire({ center: [0, 0, 0], size: 1, direction: [0, 0, 1] });
        const offsetRes = operations.offset({ shape: squareWire, distance: 0.1, tolerance: 1e-7 });
        const wires = wire.getWires({ shape: offsetRes });
        const wireLength = wire.getWireLength({ shape: offsetRes });
        expect(wireLength).toEqual(4.628318530717959);
        squareWire.delete();
        offsetRes.delete();
        wires.forEach(w => w.delete());
    });

    it("should offset a circle by using a face to negative direction", () => {
        const circleWire = wire.createCircleWire({ center: [0, 0, 0], radius: 1, direction: [0, 0, 1] });
        const f = occHelper.facesService.createSquareFace({ size: 10, direction: [0, 0, 1], center: [0, 0, 0] });
        const fRev = face.reversedFace({ shape: f });
        const offsetRes = operations.offset({ shape: circleWire, distance: -0.1, tolerance: 1e-7, face: fRev });
        const wires = wire.getWires({ shape: offsetRes });
        const wireLengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(wireLengths).toEqual([39.2, 6.911503837897545]);
        circleWire.delete();
        f.delete();
        fRev.delete();
        offsetRes.delete();
        wires.forEach(w => w.delete());
    });

    it("should offset a circle edge by using a face to negative direction", () => {
        const circleEdge = edge.createCircleEdge({ center: [0, 0, 0], radius: 1, direction: [0, 0, 1] });
        const f = occHelper.facesService.createSquareFace({ size: 10, direction: [0, 0, 1], center: [0, 0, 0] });
        const fRev = face.reversedFace({ shape: f });
        const offsetRes = operations.offset({ shape: circleEdge, distance: -0.1, tolerance: 1e-7, face: fRev });
        const wires = wire.getWires({ shape: offsetRes });
        const wireLengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(wireLengths).toEqual([39.2, 6.911503837897545]);
        circleEdge.delete();
        f.delete();
        fRev.delete();
        offsetRes.delete();
        wires.forEach(w => w.delete());
    });

    it("should offset a circle by using a face to positive direction", () => {
        const circleWire = wire.createCircleWire({ center: [0, 0, 0], radius: 1, direction: [0, 0, 1] });
        const f = occHelper.facesService.createSquareFace({ size: 10, direction: [0, 0, 1], center: [0, 0, 0] });
        const fRev = face.reversedFace({ shape: f });
        const offsetRes = operations.offset({ shape: circleWire, distance: 0.1, tolerance: 1e-7, face: fRev });
        const wires = wire.getWires({ shape: offsetRes });
        const wireLengths = wires.map(w => wire.getWireLength({ shape: w }));
        expect(wireLengths).toEqual([40.62831853071796, 5.654866776461628]);
        circleWire.delete();
        f.delete();
        fRev.delete();
        offsetRes.delete();
        wires.forEach(w => w.delete());
    });

    it("should offset a sphere to negative direction", () => {
        const sphere = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 1);
        const offsetRes = operations.offset({ shape: sphere, distance: -0.1, tolerance: 1e-7 });
        const faceAreaOriginal = face.getFaceArea({ shape: sphere });
        const faceArea = face.getFaceArea({ shape: offsetRes });
        expect(faceAreaOriginal).toEqual(12.566370614359172);
        expect(faceArea).toEqual(10.17876019763093);
        sphere.delete();
        offsetRes.delete();
    });

    it("should offset a sphere to positive direction", () => {
        const sphere = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 1);
        const offsetRes = operations.offset({ shape: sphere, distance: 0.1, tolerance: 1e-7 });
        const faceAreaOriginal = face.getFaceArea({ shape: sphere });
        const faceArea = face.getFaceArea({ shape: offsetRes });
        expect(faceAreaOriginal).toEqual(12.566370614359172);
        expect(faceArea).toEqual(15.205308443374602);
        sphere.delete();
        offsetRes.delete();
    });

    it("should offset a cube to positive direction", () => {
        const sphere = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 1);
        const offsetRes = operations.offset({ shape: sphere, distance: 0.1, tolerance: 1e-7 });
        const faceAreaOriginal = face.getFaceArea({ shape: sphere });
        const faceArea = face.getFaceArea({ shape: offsetRes });
        expect(faceAreaOriginal).toEqual(12.566370614359172);
        expect(faceArea).toEqual(15.205308443374602);
        sphere.delete();
        offsetRes.delete();
    });

    it("should extrude multiple shapes", () => {
        const squareFace = face.createSquareFace({ center: [0, 0, 3], size: 1, direction: [0, 0, 1] });
        const circleFace = face.createCircleFace({ center: [0, 0, 0], radius: 1, direction: [0, 0, 1] });
        const res = operations.extrudeShapes({ shapes: [squareFace, circleFace], direction: [0, 0, 1] });
        const volumes = res.map(s => {
            return solid.getSolidVolume({ shape: s });
        });
        expect(volumes).toEqual([0.9999999999999998, 3.1415926535897922]);
        squareFace.delete();
        circleFace.delete();
        res.forEach(s => s.delete());
    });

    it("should revolve the contour 90 degrees", () => {
        const circleFace = face.createCircleFace({ center: [5, 0, 0], radius: 1, direction: [0, 1, 0] });
        const res = operations.revolve({ shape: circleFace, direction: [0, 0, 1], angle: 90, copy: true });
        const vol = solid.getSolidVolume({ shape: res });
        expect(vol).toEqual(24.674021577404435);
        circleFace.delete();
        res.delete();
    });

    it("should revolve the contour 360 degress", () => {
        const circleFace = face.createCircleFace({ center: [5, 0, 0], radius: 1, direction: [0, 1, 0] });
        const res = operations.revolve({ shape: circleFace, direction: [0, 0, 1], angle: 360, copy: true });
        const vol = solid.getSolidVolume({ shape: res });
        expect(vol).toEqual(98.69604401089357);
        circleFace.delete();
        res.delete();
    });

    it("should create rotated extrusion", () => {
        const squareWire = wire.createSquareWire({ center: [0.5, 0, 0], size: 1, direction: [0, 1, 0] });
        const res = operations.rotatedExtrude({ shape: squareWire, angle: 360, height: 10, makeSolid: true });
        const vol = solid.getSolidVolume({ shape: res });
        expect(vol).toEqual(9.999989483139538);
        squareWire.delete();
        res.delete();
    });

    it("should create rotated extrusion with shape positioned above Y=0", () => {
        // Test with a shape positioned at Y=5
        const squareWire = wire.createSquareWire({ center: [0.5, 5, 0], size: 1, direction: [0, 1, 0] });
        const res = operations.rotatedExtrude({ shape: squareWire, angle: 360, height: 10, makeSolid: true });
        const vol = solid.getSolidVolume({ shape: res });
        // Volume should be the same as the ground-level test since the algorithm should work correctly now
        expect(vol).toBeCloseTo(9.999989483139538, 5);
        
        // Check bounding box to ensure the result is positioned correctly
        const bbox = operations.boundingBoxOfShape({ shape: res });
        expect(bbox.min[1]).toBeCloseTo(5, 1); // Bottom should be at Y=5
        expect(bbox.max[1]).toBeCloseTo(15, 1); // Top should be at Y=15
        
        squareWire.delete();
        res.delete();
    });

    it("should create rotated extrusion with shape positioned below Y=0", () => {
        // Test with a shape positioned at Y=-3
        const squareWire = wire.createSquareWire({ center: [0.5, -3, 0], size: 1, direction: [0, 1, 0] });
        const res = operations.rotatedExtrude({ shape: squareWire, angle: 360, height: 10, makeSolid: true });
        const vol = solid.getSolidVolume({ shape: res });
        // Volume should be the same as the ground-level test
        expect(vol).toBeCloseTo(9.999989483139538, 5);
        
        // Check bounding box to ensure the result is positioned correctly
        const bbox = operations.boundingBoxOfShape({ shape: res });
        expect(bbox.min[1]).toBeCloseTo(-3, 1); // Bottom should be at Y=-3
        expect(bbox.max[1]).toBeCloseTo(7, 1); // Top should be at Y=7
        
        squareWire.delete();
        res.delete();
    });

    it("should create rotated extrusion with shape at arbitrary Y position", () => {
        // Test with a shape positioned at Y=25.7 (arbitrary high position)
        const squareWire = wire.createSquareWire({ center: [0.5, 25.7, 0], size: 1, direction: [0, 1, 0] });
        const res = operations.rotatedExtrude({ shape: squareWire, angle: 360, height: 5, makeSolid: true });
        const vol = solid.getSolidVolume({ shape: res });
        // Volume should be proportional to height (5 instead of 10)
        expect(vol).toBeCloseTo(5.0, 1);
        
        // Check bounding box to ensure the result is positioned correctly
        const bbox = operations.boundingBoxOfShape({ shape: res });
        expect(bbox.min[1]).toBeCloseTo(25.7, 1); // Bottom should be at Y=25.7
        expect(bbox.max[1]).toBeCloseTo(30.7, 1); // Top should be at Y=30.7
        
        squareWire.delete();
        res.delete();
    });

    it("should create rotated extrusion with partial rotation at elevated position", () => {
        // Test with partial rotation (180 degrees) at Y=10
        const squareWire = wire.createSquareWire({ center: [0.5, 10, 0], size: 1, direction: [0, 1, 0] });
        const res = operations.rotatedExtrude({ shape: squareWire, angle: 180, height: 8, makeSolid: true });
        const vol = solid.getSolidVolume({ shape: res });
        // Volume should be half of a full rotation
        expect(vol).toBeCloseTo(7.999990663583383, 1);
        
        // Check bounding box to ensure the result is positioned correctly
        const bbox = operations.boundingBoxOfShape({ shape: res });
        expect(bbox.min[1]).toBeCloseTo(10, 1); // Bottom should be at Y=10
        expect(bbox.max[1]).toBeCloseTo(18, 1); // Top should be at Y=18
        
        squareWire.delete();
        res.delete();
    });

    it("should create rotated extrusion as surface (not solid) at elevated position", () => {
        // Test with makeSolid=false at Y=7
        const squareWire = wire.createSquareWire({ center: [0.5, 7, 0], size: 1, direction: [0, 1, 0] });
        const res = operations.rotatedExtrude({ shape: squareWire, angle: 360, height: 6, makeSolid: false });
        
        // Check that it's not a solid but a shell/surface
        const faces = face.getFaces({ shape: res });
        expect(faces.length).toBeGreaterThan(0);
        
        // Check bounding box to ensure the result is positioned correctly
        const bbox = operations.boundingBoxOfShape({ shape: res });
        expect(bbox.min[1]).toBeCloseTo(7, 1); // Bottom should be at Y=7
        expect(bbox.max[1]).toBeCloseTo(13, 1); // Top should be at Y=13
        
        squareWire.delete();
        res.delete();
        faces.forEach(f => f.delete());
    });

    it("should create rotated extrusion with circle wire at negative Y position", () => {
        // Test with a different shape type (circle) at Y=-8
        const circleWire = wire.createCircleWire({ center: [2, -8, 0], radius: 0.5, direction: [0, 1, 0] });
        const res = operations.rotatedExtrude({ shape: circleWire, angle: 270, height: 12, makeSolid: true });
        const vol = solid.getSolidVolume({ shape: res });
        // Volume should be proportional to the circle area and 3/4 rotation
        expect(vol).toBeCloseTo(9.424769481063818, 1);
        
        // Check bounding box to ensure the result is positioned correctly
        const bbox = operations.boundingBoxOfShape({ shape: res });
        expect(bbox.min[1]).toBeCloseTo(-8, 1); // Bottom should be at Y=-8
        expect(bbox.max[1]).toBeCloseTo(4, 1); // Top should be at Y=4
        
        circleWire.delete();
        res.delete();
    });

    it("should pipe a single profile along the backbone wire", () => {
        const interpolatedWire = wire.interpolatePoints({
            points: [
                [0, 0, 0],
                [0, 1, 0],
                [1, 2, 0],
                [1, 3, 0],
                [0, 4, 0],
            ],
            tolerance: 1e-7,
            periodic: false
        });

        const circleWire = wire.createCircleWire({ center: [0, 0, 0], radius: 0.2, direction: [0, 1, 0] });
        const res = operations.pipe({ shape: interpolatedWire, shapes: [circleWire] });
        const vol = solid.getSolidVolume({ shape: res });
        expect(vol).toEqual(0.5499995987174751);
        interpolatedWire.delete();
        circleWire.delete();
        res.delete();
    });

    it("should pipe two profile wires along the backbone wire", () => {
        const interpolatedWire = wire.interpolatePoints({
            points: [
                [0, 0, 0],
                [0, 1, 0],
                [1, 2, 0],
                [1, 3, 0],
                [0, 4, 0],
            ],
            tolerance: 1e-7,
            periodic: false
        });

        const circleWire1 = wire.createCircleWire({ center: [0, 0, 0], radius: 0.2, direction: [0, 1, 0] });
        const circleWire2 = wire.createCircleWire({ center: [0, 4, 0], radius: 1, direction: [0, 1, 0] });

        const res = operations.pipe({ shape: interpolatedWire, shapes: [circleWire1, circleWire2] });
        const vol = solid.getSolidVolume({ shape: res });
        expect(vol).toEqual(2.2134035565869317);
        interpolatedWire.delete();
        circleWire1.delete();
        circleWire2.delete();
        res.delete();
    });

    it("should pipe interpolated wire with ngon", () => {
        const interpolatedWire = wire.interpolatePoints({
            points: [
                [0, 0, 0],
                [0, 1, 0],
                [1, 2, 0],
                [1, 3, 0],
                [0, 4, 0],
            ],
            tolerance: 1e-7,
            periodic: false
        });
        const res = operations.pipePolylineWireNGon({ shape: interpolatedWire, nrCorners: 6, radius: 0.2, makeSolid: true, forceApproxC1: false, trihedronEnum: Inputs.OCCT.geomFillTrihedronEnum.isConstantNormal });
        const vol = solid.getSolidVolume({ shape: res });
        expect(vol).toEqual(0.5184607136026386);
        interpolatedWire.delete();
        res.delete();
    });

    it("should pipe interpolated wire with circular profile", () => {
        const interpolatedWire = wire.interpolatePoints({
            points: [
                [0, 0, 0],
                [0, 1, 0],
                [1, 2, 0],
                [1, 3, 0],
                [0, 4, 0],
            ],
            tolerance: 1e-7,
            periodic: false
        });
        const res = operations.pipeWireCylindrical({ shape: interpolatedWire, radius: 0.2, makeSolid: true, forceApproxC1: false, trihedronEnum: Inputs.OCCT.geomFillTrihedronEnum.isConstantNormal });
        const vol = solid.getSolidVolume({ shape: res });
        expect(vol).toEqual(0.6269086976927102);
        interpolatedWire.delete();
        res.delete();
    });

    it("should pipe interpolated profile", () => {
        const interpolatedWire = wire.interpolatePoints({
            points: [
                [0, 0, 4],
                [0, 1, 4],
                [1, 2, 4],
                [1, 3, 4],
                [0, 4, 4],
            ],
            tolerance: 1e-7,
            periodic: false
        });
        const res = operations.pipeWiresCylindrical({ shapes: [interpolatedWire], radius: 0.2, makeSolid: true, forceApproxC1: false, trihedronEnum: Inputs.OCCT.geomFillTrihedronEnum.isConstantNormal });
        const vols = res.map(s => solid.getSolidVolume({ shape: s }));
        expect(vols).toEqual([0.626908697692709]);
        res.forEach(s => s.delete());
    });

    it("should make thick solid simple", () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeBox(1, 2, 3, [0, 0, 0]);
        const boxFaces = face.getFaces({ shape: box });
        const fRem = boxFaces.pop();
        fRem.delete();
        const sew = shell.sewFaces({ shapes: boxFaces, tolerance: 1e-7 });
        const res = operations.makeThickSolidSimple({ shape: sew, offset: 0.3 });
        const vol = solid.getSolidVolume({ shape: res });
        expect(vol).toEqual(2.494285714285714);
        box.delete();
        sew.delete();
        boxFaces.forEach(f => f.delete());
        res.delete();
    });

    describe("Bounding box operations", () => {
        it("should get bounding box properties of a box shape", () => {
            const box = occHelper.entitiesService.bRepPrimAPIMakeBox(2, 3, 4, [0, 0, 0]);
            const bbox = operations.boundingBoxOfShape({ shape: box });
            
            expect(bbox.min[0]).toBeCloseTo(-1, 5);
            expect(bbox.min[1]).toBeCloseTo(-2, 5);
            expect(bbox.min[2]).toBeCloseTo(-1.5, 5);
            expect(bbox.max[0]).toBeCloseTo(1, 5);
            expect(bbox.max[1]).toBeCloseTo(2, 5);
            expect(bbox.max[2]).toBeCloseTo(1.5, 5);
            expect(bbox.center[0]).toBeCloseTo(0, 5);
            expect(bbox.center[1]).toBeCloseTo(0, 5);
            expect(bbox.center[2]).toBeCloseTo(0, 5);
            expect(bbox.size[0]).toBeCloseTo(2, 5);
            expect(bbox.size[1]).toBeCloseTo(4, 5);
            expect(bbox.size[2]).toBeCloseTo(3, 5);
            
            box.delete();
        });

        it("should get bounding box min point of a sphere", () => {
            const sphere = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 2);
            const min = operations.boundingBoxMinOfShape({ shape: sphere });
            
            expect(min[0]).toBeCloseTo(-2, 5);
            expect(min[1]).toBeCloseTo(-2, 5);
            expect(min[2]).toBeCloseTo(-2, 5);
            
            sphere.delete();
        });

        it("should get bounding box max point of a sphere", () => {
            const sphere = occHelper.entitiesService.bRepPrimAPIMakeSphere([5, 10, -3], [0, 1, 0], 1.5);
            const max = operations.boundingBoxMaxOfShape({ shape: sphere });
            
            expect(max[0]).toBeCloseTo(6.5, 5);
            expect(max[1]).toBeCloseTo(11.5, 5);
            expect(max[2]).toBeCloseTo(-1.5, 5);
            
            sphere.delete();
        });

        it("should get bounding box center of a cylinder", () => {
            const cyl = occHelper.entitiesService.bRepPrimAPIMakeCylinder([0, 0, 0], [0, 1, 0], 2, 10, 360);
            const center = operations.boundingBoxCenterOfShape({ shape: cyl });
            
            expect(center[0]).toBeCloseTo(0, 5);
            expect(center[1]).toBeCloseTo(5, 5);
            expect(center[2]).toBeCloseTo(0, 5);
            
            cyl.delete();
        });

        it("should get bounding box size of a cube", () => {
            const box = occHelper.entitiesService.bRepPrimAPIMakeBox(5, 5, 5, [0, 0, 0]);
            const size = operations.boundingBoxSizeOfShape({ shape: box });
            
            expect(size[0]).toBeCloseTo(5, 5);
            expect(size[1]).toBeCloseTo(5, 5);
            expect(size[2]).toBeCloseTo(5, 5);
            
            box.delete();
        });

        it("should create a bounding box shape from a complex wire", () => {
            const points = [
                [0, 0, 0],
                [5, 10, 3],
                [-2, 5, 8],
                [3, -1, 2]
            ] as Inputs.Base.Point3[];
            const polyWire = wire.createPolylineWire({ points });
            
            const bboxShape = operations.boundingBoxShapeOfShape({ shape: polyWire });
            const volume = solid.getSolidVolume({ shape: bboxShape });
            const bbox = operations.boundingBoxOfShape({ shape: polyWire });
            
            // Volume should be width * height * depth
            const expectedVolume = bbox.size[0] * bbox.size[1] * bbox.size[2];
            expect(volume).toBeCloseTo(expectedVolume, 5);
            
            polyWire.delete();
            bboxShape.delete();
        });

        it("should get bounding box of compound shape with multiple solids", () => {
            const box1 = occHelper.entitiesService.bRepPrimAPIMakeBox(1, 1, 1, [0, 0, 0]);
            const box2 = occHelper.entitiesService.bRepPrimAPIMakeBox(1, 1, 1, [5, 5, 5]);
            const compound = occHelper.converterService.makeCompound({ shapes: [box1, box2] });
            
            const bbox = operations.boundingBoxOfShape({ shape: compound });

            expect(bbox.min[0]).toBeCloseTo(-0.5, 4);
            expect(bbox.min[1]).toBeCloseTo(-0.5, 4);
            expect(bbox.min[2]).toBeCloseTo(-0.5, 4);
            expect(bbox.max[0]).toBeCloseTo(5.5, 4);
            expect(bbox.max[1]).toBeCloseTo(5.5, 4);
            expect(bbox.max[2]).toBeCloseTo(5.5, 4);
            expect(bbox.size[0]).toBeCloseTo(6, 4);
            expect(bbox.size[1]).toBeCloseTo(6, 4);
            expect(bbox.size[2]).toBeCloseTo(6, 4);
            
            box1.delete();
            box2.delete();
            compound.delete();
        });

        it("should get bounding box of extruded wire", () => {
            const circleWire = wire.createCircleWire({ center: [3, 0, 0], radius: 1, direction: [0, 1, 0] });
            const extruded = operations.extrude({ shape: circleWire, direction: [0, 5, 0] });
            
            const bbox = operations.boundingBoxOfShape({ shape: extruded });
            
            expect(bbox.min[0]).toBeCloseTo(2, 5);
            expect(bbox.min[1]).toBeCloseTo(0, 5);
            expect(bbox.min[2]).toBeCloseTo(-1, 5);
            expect(bbox.max[0]).toBeCloseTo(4, 5);
            expect(bbox.max[1]).toBeCloseTo(5, 5);
            expect(bbox.max[2]).toBeCloseTo(1, 5);
            
            circleWire.delete();
            extruded.delete();
        });

        it("should get bounding box of revolved shape", () => {
            const squareFace = face.createSquareFace({ center: [5, 0, 0], size: 2, direction: [0, 1, 0] });
            const revolved = operations.revolve({ shape: squareFace, direction: [0, 1, 0], angle: 180, copy: false });
            
            const bbox = operations.boundingBoxOfShape({ shape: revolved });

            expect(bbox.min[0]).toBeCloseTo(-6, 0);
            expect(bbox.min[1]).toBeCloseTo(0, 5);
            expect(bbox.min[2]).toBeCloseTo(-6, 0);
            expect(bbox.max[0]).toBeCloseTo(6, 0);
            expect(bbox.max[1]).toBeCloseTo(0, 5);
            expect(bbox.max[2]).toBeCloseTo(1, 0);
            
            squareFace.delete();
            revolved.delete();
        });
    });

    describe("Bounding sphere operations", () => {
        it("should get bounding sphere properties of a box", () => {
            const box = occHelper.entitiesService.bRepPrimAPIMakeBox(2, 2, 2, [0, 0, 0]);
            const bsphere = operations.boundingSphereOfShape({ shape: box });
            
            // Box is centered at [0,0,0], bounding sphere center is at bbox center
            expect(bsphere.center[0]).toBeCloseTo(0, 5);
            expect(bsphere.center[1]).toBeCloseTo(0, 5);
            expect(bsphere.center[2]).toBeCloseTo(0, 5);
            expect(bsphere.radius).toBeCloseTo(Math.sqrt(3), 5);
            
            box.delete();
        });

        it("should get bounding sphere center of a sphere", () => {
            const sphere = occHelper.entitiesService.bRepPrimAPIMakeSphere([3, 4, 5], [0, 1, 0], 2);
            const center = operations.boundingSphereCenterOfShape({ shape: sphere });
            
            expect(center[0]).toBeCloseTo(3, 5);
            expect(center[1]).toBeCloseTo(4, 5);
            expect(center[2]).toBeCloseTo(5, 5);
            
            sphere.delete();
        });

        it("should get bounding sphere radius of a cylinder", () => {
            const cyl = occHelper.entitiesService.bRepPrimAPIMakeCylinder([0, 0, 0], [0, 1, 0], 3, 8, 360);
            const radius = operations.boundingSphereRadiusOfShape({ shape: cyl });
            
            // For a cylinder with radius 3 and height 8, the bounding sphere radius is
            // the distance from center (0, 4, 0) to corner (3, 8, 0) or (3, 0, 0)
            // = sqrt(3^2 + 4^2 + 3^2) = sqrt(34) ≈ 5.83
            expect(radius).toBeCloseTo(Math.sqrt(34), 2);
            
            cyl.delete();
        });

        it("should create a bounding sphere shape from a torus-like shape", () => {
            const circle = face.createCircleFace({ center: [5, 0, 0], radius: 1, direction: [0, 1, 0] });
            const torus = operations.revolve({ shape: circle, direction: [0, 1, 0], angle: 360, copy: false });
            
            const bsphereShape = operations.boundingSphereShapeOfShape({ shape: torus });
            const bsphere = operations.boundingSphereOfShape({ shape: torus });
            
            // Get the volume of the bounding sphere
            const volume = solid.getSolidVolume({ shape: bsphereShape });
            const expectedVolume = (4 / 3) * Math.PI * Math.pow(bsphere.radius, 3);
            
            expect(volume).toBeCloseTo(expectedVolume, 2);
            
            circle.delete();
            torus.delete();
            bsphereShape.delete();
        });

        it("should get bounding sphere of compound with multiple shapes", () => {
            const sphere1 = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 1);
            const sphere2 = occHelper.entitiesService.bRepPrimAPIMakeSphere([10, 0, 0], [0, 1, 0], 1);
            const compound = occHelper.converterService.makeCompound({ shapes: [sphere1, sphere2] });
            
            const bsphere = operations.boundingSphereOfShape({ shape: compound });
            
            // Center should be at midpoint of bounding box
            expect(bsphere.center[0]).toBeCloseTo(5, 5);
            expect(bsphere.center[1]).toBeCloseTo(0, 5);
            expect(bsphere.center[2]).toBeCloseTo(0, 5);

            expect(bsphere.radius).toBeCloseTo(Math.sqrt(38), 2);
            
            sphere1.delete();
            sphere2.delete();
            compound.delete();
        });

        it("should get bounding sphere for a wire", () => {
            const points = [
                [0, 0, 0],
                [10, 0, 0],
                [10, 10, 0],
                [0, 10, 0]
            ] as Inputs.Base.Point3[];
            const squareWire = wire.createPolylineWire({ points });
            
            const bsphere = operations.boundingSphereOfShape({ shape: squareWire });
            
            expect(bsphere.center).toEqual([5, 5, 0]);
            expect(bsphere.radius).toBeCloseTo(Math.sqrt(50), 5);
            
            squareWire.delete();
        });

        it("should compare bounding box and bounding sphere volumes", () => {
            const box = occHelper.entitiesService.bRepPrimAPIMakeBox(4, 4, 4, [-2, -2, -2]);
            
            const bboxShape = operations.boundingBoxShapeOfShape({ shape: box });
            const bsphereShape = operations.boundingSphereShapeOfShape({ shape: box });
            
            const bboxVolume = solid.getSolidVolume({ shape: bboxShape });
            const bsphereVolume = solid.getSolidVolume({ shape: bsphereShape });
            
            // Bounding sphere should always have larger volume than bounding box for a cube
            expect(bsphereVolume).toBeGreaterThan(bboxVolume);
            expect(bboxVolume).toBeCloseTo(64, 4);
            
            box.delete();
            bboxShape.delete();
            bsphereShape.delete();
        });
    });


});


