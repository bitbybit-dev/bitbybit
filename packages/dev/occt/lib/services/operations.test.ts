import { Inputs } from "../api";
import initOpenCascade, { OpenCascadeInstance, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { Base } from "../api/inputs/base-inputs";
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
        ] as Base.Point3[];
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
        ] as Base.Point3[];
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
        expect(vol).toEqual(9.999989383137159);
        squareWire.delete();
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


});


