import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../api/inputs";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { VectorHelperService } from "../api/vector-helper.service";
import { OccHelper } from "../occ-helper";
import { OCCTOperations } from "./operations";
import { OCCTEdge, OCCTFace, OCCTShell, OCCTSolid, OCCTWire } from "./shapes";
import { OCCTTransforms } from "./transforms";

describe("OCCT operations unit tests", () => {
    let occt: BitbybitOcctModule;
    let operations: OCCTOperations;
    let occHelper: OccHelper;
    let wire: OCCTWire;
    let edge: OCCTEdge;
    let face: OCCTFace;
    let solid: OCCTSolid;
    let shell: OCCTShell;
    let transforms: OCCTTransforms;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        wire = new OCCTWire(occt, occHelper);
        face = new OCCTFace(occt, occHelper);
        edge = new OCCTEdge(occt, occHelper);
        operations = new OCCTOperations(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
        shell = new OCCTShell(occt, occHelper);
        transforms = new OCCTTransforms(occt, occHelper);
    });

    it("should get two closest points between two shapes", () => {

        const sph1 = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 1);
        const sph2 = occHelper.entitiesService.bRepPrimAPIMakeSphere([3, 3, 3], [0, 1, 0], 1);
        const res = operations.closestPointsBetweenTwoShapes({ shape1: sph1, shape2: sph2 });
        expect(res.length).toBe(2);
        expect(res).toEqual([
            [0.5773398570788231, 0.577340634175626, 0.5773703157921182],
            [2.4226416164327524, 2.4226611251606816, 2.4226464510164636]
        ]);
    });

    it("should get five closest points between a shape and a collection of points", () => {
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

    it("should get ten closest points between two shape and a collection of points", () => {
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

    it("should measure a loft between two equal spline sections as its cap times its height", () => {
        // Arrange
        const points: Inputs.Base.Point3[] = Array.from({ length: 24 }, (_, i) => {
            const t = 2 * Math.PI * i / 24;
            return [3 * Math.cos(t), 0, Math.sin(t) * (1 + 0.6 * Math.cos(t))];
        });
        const bottom = wire.interpolatePoints({ points, periodic: true, tolerance: 1e-7 });
        const top = transforms.translate({ shape: bottom, translation: [0, 5, 0] });
        const cap = face.createFaceFromWire({ shape: bottom, planar: true });

        // Act
        const loft = operations.loft({ shapes: [bottom, top], makeSolid: true });
        const volume = solid.getSolidVolume({ shape: loft });
        const centre = solid.getSolidCenterOfMass({ shape: loft });

        // Assert
        const capArea = face.getFaceArea({ shape: cap });
        const capCentre = face.getFaceCenterOfMass({ shape: cap });
        expect(volume).toBeCloseTo(capArea * 5, 6);
        expect(centre[0]).toBeCloseTo(capCentre[0], 8);
        expect(centre[1]).toBeCloseTo(2.5, 8);
        expect(centre[2]).toBeCloseTo(capCentre[2], 8);
        [bottom, top, cap, loft].forEach(s => s.delete());
    });

    it("should loft three ellipses correctly", () => {
        const ellipse1 = wire.createEllipseWire({ center: [0, 0, 0], radiusMajor: 1, radiusMinor: 0.5, direction: [0, 1, 0] });
        const ellipse2 = wire.createEllipseWire({ center: [0, 1, 0], radiusMajor: 2, radiusMinor: 1, direction: [0, 1, 0] });
        const ellipse3 = wire.createEllipseWire({ center: [0, 2, 0], radiusMajor: 0.5, radiusMinor: 0.3, direction: [0, 1, 0] });

        const res = operations.loft({ shapes: [ellipse1, ellipse2, ellipse3], makeSolid: false });
        const faces = face.getFaces({ shape: res });
        const faceOfLoft = faces[0]!;
        const area = face.getFaceArea({ shape: faceOfLoft });
        expect(area).toBeCloseTo(19.730573533020213, 10);
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

    it("should loft three ellipses correctly by using advanced loft method", () => {
        const ellipse1 = wire.createEllipseWire({ center: [0, 0, 0], radiusMajor: 1, radiusMinor: 0.5, direction: [0, 1, 0] });
        const ellipse2 = wire.createEllipseWire({ center: [0, 1, 0], radiusMajor: 2, radiusMinor: 1, direction: [0, 1, 0] });
        const ellipse3 = wire.createEllipseWire({ center: [0, 2, 0], radiusMajor: 0.5, radiusMinor: 0.3, direction: [0, 1, 0] });

        const opt = new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>([ellipse1, ellipse2, ellipse3]);
        const res = operations.loftAdvanced(opt);
        const faces = face.getFaces({ shape: res });
        const faceOfLoft = faces[0]!;
        const area = face.getFaceArea({ shape: faceOfLoft });
        expect(area).toBeCloseTo(19.60871770951131, 10);
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

    it("should loft three ellipses correctly by using advanced loft method that is closed", () => {
        const ellipse1 = wire.createEllipseWire({ center: [0, 0, 0], radiusMajor: 1, radiusMinor: 0.5, direction: [0, 1, 0] });
        const ellipse2 = wire.createEllipseWire({ center: [0, 1, 0], radiusMajor: 2, radiusMinor: 1, direction: [0, 1, 0] });
        const ellipse3 = wire.createEllipseWire({ center: [0, 2, 0], radiusMajor: 0.5, radiusMinor: 0.3, direction: [0, 1, 0] });

        const opt = new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>([ellipse1, ellipse2, ellipse3]);
        opt.closed = true;
        const res = operations.loftAdvanced(opt);
        const faces = face.getFaces({ shape: res });
        const faceOfLoft = faces[0]!;
        const area = face.getFaceArea({ shape: faceOfLoft });
        expect(area).toBeCloseTo(26.72602046424945, 10);
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

    it("should loft three ellipses correctly by using advanced loft method that uses approxChordLength parametrisation", () => {
        const ellipse1 = wire.createEllipseWire({ center: [0, 0, 0], radiusMajor: 1, radiusMinor: 0.5, direction: [0, 1, 0] });
        const ellipse2 = wire.createEllipseWire({ center: [0, 1, 0], radiusMajor: 2, radiusMinor: 1, direction: [0, 1, 0] });
        const ellipse3 = wire.createEllipseWire({ center: [0, 2, 0], radiusMajor: 0.5, radiusMinor: 0.3, direction: [0, 1, 0] });

        const opt = new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>([ellipse1, ellipse2, ellipse3]);
        opt.parType = Inputs.OCCT.approxParametrizationTypeEnum.approxChordLength;
        const res = operations.loftAdvanced(opt);
        const faces = face.getFaces({ shape: res });
        const faceOfLoft = faces[0]!;
        const area = face.getFaceArea({ shape: faceOfLoft });
        expect(area).toBeCloseTo(19.730573533020213, 10);
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

    it("should loft three ellipses correctly by using advanced loft method that uses approxIsoParametric parametrisation", () => {
        const ellipse1 = wire.createEllipseWire({ center: [0, 0, 0], radiusMajor: 1, radiusMinor: 0.5, direction: [0, 1, 0] });
        const ellipse2 = wire.createEllipseWire({ center: [0, 1, 0], radiusMajor: 2, radiusMinor: 1, direction: [0, 1, 0] });
        const ellipse3 = wire.createEllipseWire({ center: [0, 2, 0], radiusMajor: 0.5, radiusMinor: 0.3, direction: [0, 1, 0] });

        const opt = new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>([ellipse1, ellipse2, ellipse3]);
        opt.parType = Inputs.OCCT.approxParametrizationTypeEnum.approxIsoParametric;
        const res = operations.loftAdvanced(opt);
        const faces = face.getFaces({ shape: res });
        const faceOfLoft = faces[0]!;
        const area = face.getFaceArea({ shape: faceOfLoft });
        expect(area).toBeCloseTo(19.62793439501324, 10);
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

    it("should loft three ellipses correctly by using advanced loft method and start and end vertexes", () => {
        const ellipse1 = wire.createEllipseWire({ center: [0, 1, 0], radiusMajor: 1, radiusMinor: 0.5, direction: [0, 1, 0] });
        const ellipse2 = wire.createEllipseWire({ center: [0, 2, 0], radiusMajor: 2, radiusMinor: 1, direction: [0, 1, 0] });
        const ellipse3 = wire.createEllipseWire({ center: [0, 3, 0], radiusMajor: 0.5, radiusMinor: 0.3, direction: [0, 1, 0] });

        const opt = new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>([ellipse1, ellipse2, ellipse3]);
        opt.startVertex = [0, 0, 0];
        opt.endVertex = [0, 4, 0];
        const res = operations.loftAdvanced(opt);
        const faces = face.getFaces({ shape: res });
        const faceOfLoft = faces[0]!;
        const area = face.getFaceArea({ shape: faceOfLoft });
        expect(area).toBeCloseTo(21.99350080665466, 10);
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

    it("should loft three ellipses correctly by using advanced loft method with closed and periodic interpolation enabled", () => {
        const ellipse1 = wire.createEllipseWire({ center: [0, 0, 0], radiusMajor: 1, radiusMinor: 0.5, direction: [0, 1, 0] });
        const ellipse2 = wire.createEllipseWire({ center: [0, 1, 0], radiusMajor: 2, radiusMinor: 1, direction: [0, 1, 0] });
        const ellipse3 = wire.createEllipseWire({ center: [0, 2, 0], radiusMajor: 0.5, radiusMinor: 0.3, direction: [0, 1, 0] });

        const opt = new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>([ellipse1, ellipse2, ellipse3]);
        opt.periodic = true;
        opt.closed = true;
        opt.nrPeriodicSections = 10;
        const res = operations.loftAdvanced(opt);
        const faces = face.getFaces({ shape: res });
        const faceOfLoft = faces[0]!;
        const area = face.getFaceArea({ shape: faceOfLoft });
        expect(area).toBeCloseTo(25.325391299348812, 10);
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

    it("should not loft three ellipses by using advanced loft method if periodic option is enabled and closed disabled", () => {
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

    it("should slice a solid that lies away from the origin", () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeBox(1, 2, 3, [1000, 0, 500]);
        const res = operations.slice({ shape: box, direction: [0, 1, 0], step: 0.1 });
        expect(face.getFaces({ shape: res }).length).toBe(31);
    });

    it("should slice in a pattern of steps a solid that lies away from the origin", () => {
        const atOrigin = occHelper.entitiesService.bRepPrimAPIMakeBox(1, 2, 3, [0, 0, 0]);
        const away = occHelper.entitiesService.bRepPrimAPIMakeBox(1, 2, 3, [1000, 0, 500]);
        const expected = face.getFaces({ shape: operations.sliceInStepPattern({ shape: atOrigin, direction: [0, 1, 0], steps: [0.1, 0.3] }) }).length;
        const res = operations.sliceInStepPattern({ shape: away, direction: [0, 1, 0], steps: [0.1, 0.3] });
        expect(expected).toBeGreaterThan(0);
        expect(face.getFaces({ shape: res }).length).toBe(expected);
    });

    it("should revolve by exactly the angle given", () => {
        const outline = wire.createPolygonWire({ points: [[1, 0, 0], [2, 0, 0], [2, 1, 0], [1, 1, 0]] });
        const profile = face.createFaceFromWire({ shape: outline, planar: true });
        const res = operations.revolve({ shape: profile, angle: 90, direction: [0, 1, 0], copy: false });
        const xs = occHelper.shapeGettersService.getVertices({ shape: res }).map(v => occHelper.converterService.vertexToPoint({ shape: v })[0]);
        expect(Math.min(...xs)).toBeGreaterThan(-1e-9);
    });

    it("should leave the list of sections a closed loft was given as it was", () => {
        const sections = [
            wire.createEllipseWire({ center: [0, 0, 0], radiusMajor: 1, radiusMinor: 0.5, direction: [0, 1, 0] }),
            wire.createEllipseWire({ center: [0, 1, 0], radiusMajor: 2, radiusMinor: 1, direction: [0, 1, 0] }),
            wire.createEllipseWire({ center: [0, 2, 0], radiusMajor: 0.5, radiusMinor: 0.3, direction: [0, 1, 0] }),
        ];
        const opt = new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>(sections);
        opt.closed = true;
        operations.loftAdvanced(opt);
        expect(sections).toHaveLength(3);
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

    it("should not slice in pattern when the steps list is empty", () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        expect(() => operations.sliceInStepPattern({ shape: box, direction: [0, 1, 1], steps: [] })).toThrow("Steps must add up to more than 0, or the slices never move along the shape.");
    });

    it("should not slice in pattern if steps property is an empty array", () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 3);
        expect(() => operations.sliceInStepPattern({ shape: box, direction: [0, 1, 1], steps: [] })).toThrow("Steps must add up to more than 0, or the slices never move along the shape.");
    });

    it.each<[string, number[]]>([
        ["that move back as far as they move forward", [1, -1]],
        ["that move back further than they move forward", [1, -2]],
        ["of which none moves", [0, 0]],
        ["that make the first gap too long to move back from", [100, -100]],
    ])("should refuse steps %s instead of slicing forever", (_what, steps) => {
        // Arrange
        const box = solid.createBox({ width: 1, length: 1, height: 5, center: [0, 0, 0] });

        // Act
        const cut = (): unknown => operations.sliceInStepPattern({ shape: box, direction: [0, 1, 0], steps });

        // Assert
        expect(cut).toThrow("Steps must add up to more than 0, or the slices never move along the shape.");
        box.delete();
    });

    it("should slice with steps that move back less than they move forward", () => {
        // Arrange
        const box = solid.createBox({ width: 1, length: 1, height: 5, center: [0, 0, 0] });

        // Act
        const res = operations.sliceInStepPattern({ shape: box, direction: [0, 1, 0], steps: [2, -1] });

        // Assert
        expect(face.getFaces({ shape: res }).length).toBeGreaterThan(0);
        box.delete();
        res.delete();
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

    const offsetPoints = (source: TopoDS_Wire, distance: number, direction: Inputs.Base.Vector3, samples: number): Inputs.Base.Point3[] =>
        Array.from({ length: samples + 1 }, (_, index) => {
            const param = index / samples;
            const [x, y, z] = wire.pointOnWireAtParam({ shape: source, param });
            const [tx, ty, tz] = wire.tangentOnWireAtParam({ shape: source, param });
            const side: Inputs.Base.Vector3 = [direction[1] * tz - direction[2] * ty, direction[2] * tx - direction[0] * tz, direction[0] * ty - direction[1] * tx];
            const scale = distance / Math.hypot(side[0], side[1], side[2]);
            return [x + side[0] * scale, y + side[1] * scale, z + side[2] * scale];
        });

    const pointsAtFractions = (shape: TopoDS_Wire, samples: number): Inputs.Base.Point3[] =>
        Array.from({ length: samples + 1 }, (_, index) => wire.pointOnWireAtParam({ shape, param: index / samples }));

    const closeTo9 = (points: Inputs.Base.Point3[]): unknown[] => points.map(point => point.map(value => expect.closeTo(value, 9)));

    it("should move every point of a rounded 3D polyline at right angles to it and to the direction", () => {
        // Arrange
        const polyline = wire.createPolylineWire({ points: [[0, 24, -20], [-10, 20, -10], [0, 15, 0], [0, 12, 10], [20, 7, 16], [40, 25, 40], [-20, 7, 16], [-20, 7, -16]] });
        const rounded = occHelper.filletsService.fillet3DWire({ shape: polyline, radius: 5, direction: [0, 1, 0] });

        // Act
        const outward = operations.offset3DWire({ shape: rounded, direction: [0, 1, 0], offset: 2 }) as TopoDS_Wire;
        const inward = operations.offset3DWire({ shape: rounded, direction: [0, 1, 0], offset: -2 }) as TopoDS_Wire;

        // Assert
        expect(pointsAtFractions(outward, 40)).toEqual(closeTo9(offsetPoints(rounded, 2, [0, 1, 0], 40)));
        expect(pointsAtFractions(inward, 40)).toEqual(closeTo9(offsetPoints(rounded, -2, [0, 1, 0], 40)));
    });

    it("should move every point of a smooth 3D curve at right angles to it and to the direction", () => {
        // Arrange
        const curve = wire.interpolatePoints({ points: [[0, 24, -20], [-10, 20, -10], [0, 15, 0], [0, 12, 10], [20, 7, 16], [40, 25, 40], [-20, 7, 16], [-20, 7, -16]], periodic: false, tolerance: 0.1 });

        // Act
        const offset = operations.offset3DWire({ shape: curve, direction: [0, 3, 0], offset: 2 }) as TopoDS_Wire;

        // Assert
        expect(pointsAtFractions(offset, 40)).toEqual(closeTo9(offsetPoints(curve, 2, [0, 1, 0], 40)));
    });

    it("should hand back the offset edges in order where a sharp corner keeps them apart", () => {
        // Arrange
        const curve = wire.interpolatePoints({ points: [[0, 0, 0], [0, 1, 1], [2, 0.5, 1], [2, 0, 2]], periodic: false, tolerance: 0.1 });
        const joined = wire.combineEdgesAndWiresIntoAWire({ shapes: [curve, wire.createLineWire({ start: [2, 0, 2], end: [5, 0, 0] })] });

        // Act
        const offset = operations.offset3DWire({ shape: joined, direction: [0, 1, 0], offset: 0.1 });

        // Assert
        expect(Array.isArray(offset)).toBe(true);
        const edges = offset as TopoDS_Edge[];
        expect(edges).toHaveLength(2);
        expect(occHelper.edgesService.startPointOnEdge({ shape: edges[1]! }))
            .toEqual(closeTo9([[2 - 0.2 / Math.sqrt(13), 0, 2 - 0.3 / Math.sqrt(13)]])[0]);
    });

    it("should shrink a circle about the direction in its own plane, running the same way", () => {
        // Arrange
        const circle = wire.createCircleWire({ radius: 5, center: [0, 0, 0], direction: [0, 1, 0] });

        // Act
        const offset = operations.offset3DWire({ shape: circle, direction: [0, 1, 0], offset: 1 }) as TopoDS_Wire;

        // Assert
        expect(wire.getWireLength({ shape: offset })).toBeCloseTo(8 * Math.PI, 12);
        expect(pointsAtFractions(offset, 4)).toEqual(closeTo9(pointsAtFractions(circle, 4).map(([x, y, z]) => [x * 0.8, y, z * 0.8])));
    });

    it("should refuse a direction of length 0", () => {
        // Arrange
        const circle = wire.createCircleWire({ radius: 5, center: [0, 0, 0], direction: [0, 1, 0] });

        // Act
        const act = (): unknown => operations.offset3DWire({ shape: circle, direction: [0, 0, 0], offset: 1 });

        // Assert
        expect(act).toThrow(expect.objectContaining({ name: "InputError", property: "direction" }));
    });

    it("should fail where the wire runs along the direction, having no side to go to", () => {
        // Arrange
        const rise = wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0]] });

        // Act
        const act = (): unknown => operations.offset3DWire({ shape: rise, direction: [0, 1, 0], offset: 1 });

        // Assert
        expect(act).toThrow(expect.objectContaining({ name: "KernelOperationError", code: "occt.offset.failed" }));
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

    describe("offsetAdv", () => {
        it("should pass a failure of the wire offset on, releasing it, rather than offsetting the wire as a 3D shape", () => {
            // Arrange
            const circle = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
            const failure = new Error("the kernel could not offset the wire");
            const makers: { isDeleted(): boolean }[] = [];
            let offsetsAsShape = 0;
            const wireOffset = occt.BRepOffsetAPI_MakeOffset;
            const shapeOffset = occt.BRepOffsetAPI_MakeOffsetShape;
            Reflect.set(occt, "BRepOffsetAPI_MakeOffset", new Proxy(wireOffset, {
                construct(target, args): object {
                    const maker = Reflect.construct(target, args);
                    maker.Perform = (): never => {
                        throw failure;
                    };
                    makers.push(maker);
                    return maker;
                },
            }));
            Reflect.set(occt, "BRepOffsetAPI_MakeOffsetShape", new Proxy(shapeOffset, {
                construct(target, args): object {
                    offsetsAsShape++;
                    return Reflect.construct(target, args);
                },
            }));

            // Act
            let thrown: unknown;
            try {
                operations.offsetAdv({ shape: circle, distance: 0.2, tolerance: 1e-7, joinType: Inputs.OCCT.joinTypeEnum.arc, removeIntEdges: false });
            } catch (caught) {
                thrown = caught;
            } finally {
                Reflect.set(occt, "BRepOffsetAPI_MakeOffset", wireOffset);
                Reflect.set(occt, "BRepOffsetAPI_MakeOffsetShape", shapeOffset);
            }

            // Assert
            expect(thrown).toBe(failure);
            expect(makers.map(maker => maker.isDeleted())).toEqual([true]);
            expect(offsetsAsShape).toBe(0);
        });

        it("should offset a square wire with arc join type", () => {
            const squareWire = wire.createSquareWire({ size: 2, center: [0, 0, 0], direction: [0, 1, 0] });
            const offsetRes = operations.offsetAdv({
                shape: squareWire,
                distance: 0.2,
                tolerance: 1e-7,
                joinType: Inputs.OCCT.joinTypeEnum.arc,
                removeIntEdges: false
            });
            const length = wire.getWireLength({ shape: offsetRes });
            expect(length).toBeGreaterThan(8);
            squareWire.delete();
            offsetRes.delete();
        });

        it("should offset a square wire with intersection join type", () => {
            const squareWire = wire.createSquareWire({ size: 2, center: [0, 0, 0], direction: [0, 1, 0] });
            const offsetRes = operations.offsetAdv({
                shape: squareWire,
                distance: 0.2,
                tolerance: 1e-7,
                joinType: Inputs.OCCT.joinTypeEnum.intersection,
                removeIntEdges: false
            });
            const length = wire.getWireLength({ shape: offsetRes });
            expect(length).toBeCloseTo(9.6, 1);
            squareWire.delete();
            offsetRes.delete();
        });

        it("should offset a square wire to negative direction", () => {
            const squareWire = wire.createSquareWire({ size: 2, center: [0, 0, 0], direction: [0, 1, 0] });
            const offsetRes = operations.offsetAdv({
                shape: squareWire,
                distance: -0.2,
                tolerance: 1e-7,
                joinType: Inputs.OCCT.joinTypeEnum.arc,
                removeIntEdges: false
            });
            const length = wire.getWireLength({ shape: offsetRes });
            expect(length).toBeLessThan(8);
            squareWire.delete();
            offsetRes.delete();
        });

        it("should offset a sphere with arc join type", () => {
            const sphere = occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 1);
            const offsetRes = operations.offsetAdv({
                shape: sphere,
                distance: 0.1,
                tolerance: 1e-7,
                joinType: Inputs.OCCT.joinTypeEnum.arc,
                removeIntEdges: false
            });
            const faceAreaOriginal = face.getFaceArea({ shape: sphere });
            const faceArea = face.getFaceArea({ shape: offsetRes });
            expect(faceArea).toBeGreaterThan(faceAreaOriginal);
            sphere.delete();
            offsetRes.delete();
        });

        it("should offset a circle wire using a face reference", () => {
            const circleWire = wire.createCircleWire({ center: [0, 0, 0], radius: 1, direction: [0, 1, 0] });
            const f = face.createFaceFromWire({ shape: circleWire, planar: true });
            const fRev = transforms.mirrorAlongNormal({ shape: f, origin: [0, 0, 0], normal: [1, 0, 0] });
            const offsetRes = operations.offsetAdv({
                shape: circleWire,
                face: fRev,
                distance: 0.2,
                tolerance: 1e-7,
                joinType: Inputs.OCCT.joinTypeEnum.arc,
                removeIntEdges: false
            });
            const wires = wire.getWires({ shape: offsetRes });
            const length = wire.getWireLength({ shape: wires[0]! });
            expect(length).toBeCloseTo(2 * Math.PI * 1.2, 1);
            circleWire.delete();
            f.delete();
            fRev.delete();
            offsetRes.delete();
            wires.forEach(w => w.delete());
        });

        it("should return original shape when distance is zero", () => {
            const squareWire = wire.createSquareWire({ size: 2, center: [0, 0, 0], direction: [0, 1, 0] });
            const offsetRes = operations.offsetAdv({
                shape: squareWire,
                distance: 0,
                tolerance: 1e-7,
                joinType: Inputs.OCCT.joinTypeEnum.arc,
                removeIntEdges: false
            });
            expect(offsetRes).toBe(squareWire);
            squareWire.delete();
        });

        it("should offset a box solid", () => {
            const box = occHelper.entitiesService.bRepPrimAPIMakeBox(2, 2, 2, [0, 0, 0]);
            const offsetRes = operations.offsetAdv({
                shape: box,
                distance: 0.1,
                tolerance: 1e-7,
                joinType: Inputs.OCCT.joinTypeEnum.arc,
                removeIntEdges: false
            });
            const volumeOriginal = solid.getSolidVolume({ shape: box });
            const volumeOffset = solid.getSolidVolume({ shape: offsetRes });
            expect(volumeOffset).toBeGreaterThan(volumeOriginal);
            box.delete();
            offsetRes.delete();
        });
    });

    describe("extrusions the kernel cannot build", () => {
        const refusalOf = (act: () => unknown): unknown => {
            try {
                act();
            } catch (failure) {
                return failure;
            }
            return undefined;
        };

        it.each([
            [[0, 0, 0], "`direction` is [0, 0, 0], and an extrusion needs a direction with some length: the shape travels along it for that length."],
            [[0, Number.NaN, 0], "`direction` is [0, NaN, 0], and the direction of an extrusion has to be finite numbers."],
            [[Number.POSITIVE_INFINITY, 0, 0], "`direction` is [Infinity, 0, 0], and the direction of an extrusion has to be finite numbers."],
        ] as [Inputs.Base.Vector3, string][])("should refuse the direction %j, naming it", (direction, message) => {
            // Arrange
            const circle = wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });

            // Act
            const refusals = [
                refusalOf(() => operations.extrude({ shape: circle, direction })),
                refusalOf(() => operations.extrudeShapes({ shapes: [circle], direction })),
            ];

            // Assert
            expect(refusals).toEqual([
                expect.objectContaining({ name: "InputError", property: "direction", message }),
                expect.objectContaining({ name: "InputError", property: "direction", message }),
            ]);
        });

        it("should refuse a shape that holds a solid, alone or in a compound", () => {
            // Arrange
            const box = solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0] });
            const square = face.createSquareFace({ size: 2, center: [5, 0, 0], direction: [0, 1, 0] });
            const mixed = occHelper.converterService.makeCompound({ shapes: [square, box] });

            // Act
            const refusals = [box, mixed].map(shape => refusalOf(() => operations.extrude({ shape, direction: [0, 1, 0] })));

            // Assert
            const refusal = expect.objectContaining({ name: "InputError", property: "shape", message: "`shape` holds a solid, which cannot be extruded; extrude its faces, a shell or a wire instead." });
            expect(refusals).toEqual([refusal, refusal]);
        });

        it("should extrude a shell and a direction far shorter than the shape", () => {
            // Arrange
            const box = solid.createBox({ width: 2, length: 2, height: 2, center: [0, 0, 0] });
            const cup = shell.sewFaces({ shapes: face.getFaces({ shape: box }).slice(0, 5), tolerance: 1e-7 });

            // Act
            const walls = operations.extrude({ shape: cup, direction: [0, 1e-3, 0] });

            // Assert
            expect(walls.IsNull()).toBe(false);
            expect(face.getFaces({ shape: walls }).length).toBeGreaterThan(5);
        });
    });

    it("should extrude multiple shapes", () => {
        const squareFace = face.createSquareFace({ center: [0, 0, 3], size: 1, direction: [0, 0, 1] });
        const circleFace = face.createCircleFace({ center: [0, 0, 0], radius: 1, direction: [0, 0, 1] });
        const res = operations.extrudeShapes({ shapes: [squareFace, circleFace], direction: [0, 0, 1] });
        const volumes = res.map(s => {
            return solid.getSolidVolume({ shape: s });
        });
        expect(volumes).toHaveLength(2);
        expect(volumes[0]).toBeCloseTo(1, 12);
        expect(volumes[1]).toBeCloseTo(Math.PI, 12);
        squareFace.delete();
        circleFace.delete();
        res.forEach(s => s.delete());
    });

    it("should revolve the contour 90 degrees", () => {
        const circleFace = face.createCircleFace({ center: [5, 0, 0], radius: 1, direction: [0, 1, 0] });
        const res = operations.revolve({ shape: circleFace, direction: [0, 0, 1], angle: 90, copy: true });
        const vol = solid.getSolidVolume({ shape: res });
        expect(vol).toBeCloseTo(2.5 * Math.PI * Math.PI, 10);
        circleFace.delete();
        res.delete();
    });

    it("should revolve the contour 360 degress", () => {
        const circleFace = face.createCircleFace({ center: [5, 0, 0], radius: 1, direction: [0, 1, 0] });
        const res = operations.revolve({ shape: circleFace, direction: [0, 0, 1], angle: 360, copy: true });
        const vol = solid.getSolidVolume({ shape: res });
        expect(vol).toBeCloseTo(10 * Math.PI * Math.PI, 10);
        circleFace.delete();
        res.delete();
    });

    it("should revolve by a negative angle the other way round", () => {
        // Arrange
        const circleFace = face.createCircleFace({ center: [5, 0, 0], radius: 1, direction: [0, 1, 0] });

        // Act
        const res = operations.revolve({ shape: circleFace, direction: [0, 0, 1], angle: -90, copy: true });

        // Assert
        expect(solid.getSolidVolume({ shape: res })).toBeCloseTo(2.5 * Math.PI * Math.PI, 10);
        expect(operations.boundingBoxCenterOfShape({ shape: res })[1]).toBeLessThan(0);
        circleFace.delete();
        res.delete();
    });

    it("should refuse an angle of 0 rather than make a full turn", () => {
        // Arrange
        const circleFace = face.createCircleFace({ center: [5, 0, 0], radius: 1, direction: [0, 1, 0] });

        // Act
        const spin = (): unknown => operations.revolve({ shape: circleFace, direction: [0, 0, 1], angle: 0, copy: true });

        // Assert
        expect(spin).toThrow("The revolve angle must not be 0, or nothing is swept.");
        circleFace.delete();
    });

    it.each([-360, -400])("should make a full turn for an angle of %s", (angle) => {
        // Arrange
        const circleFace = face.createCircleFace({ center: [5, 0, 0], radius: 1, direction: [0, 1, 0] });

        // Act
        const res = operations.revolve({ shape: circleFace, direction: [0, 0, 1], angle, copy: true });

        // Assert
        expect(solid.getSolidVolume({ shape: res })).toBeCloseTo(10 * Math.PI * Math.PI, 8);
        circleFace.delete();
        res.delete();
    });

    it("should revolve about the Y axis when the direction is left out", () => {
        // Arrange
        const circleFace = face.createCircleFace({ center: [5, 0, 0], radius: 1, direction: [0, 0, 1] });

        // Act
        const res = operations.revolve({ shape: circleFace, angle: 90 });

        // Assert
        expect(solid.getSolidVolume({ shape: res })).toBeCloseTo(2.5 * Math.PI * Math.PI, 10);
        expect(operations.boundingBoxSizeOfShape({ shape: res })[1]).toBeCloseTo(2, 6);
        circleFace.delete();
        res.delete();
    });

    it("should create rotated extrusion", () => {
        const squareWire = wire.createSquareWire({ center: [0.5, 0, 0], size: 1, direction: [0, 1, 0] });
        const res = operations.rotatedExtrude({ shape: squareWire, angle: 360, height: 10, makeSolid: true });
        const vol = solid.getSolidVolume({ shape: res });
        expect(vol).toBeCloseTo(10, 3);
        squareWire.delete();
        res.delete();
    });

    it("should create rotated extrusion with shape positioned above Y=0", () => {
        const squareWire = wire.createSquareWire({ center: [0.5, 5, 0], size: 1, direction: [0, 1, 0] });
        const res = operations.rotatedExtrude({ shape: squareWire, angle: 360, height: 10, makeSolid: true });
        const vol = solid.getSolidVolume({ shape: res });
        expect(vol).toBeCloseTo(10, 3);
        
        const bbox = operations.boundingBoxOfShape({ shape: res });
        expect(bbox.min[1]).toBeCloseTo(5, 1);
        expect(bbox.max[1]).toBeCloseTo(15, 1);
        
        squareWire.delete();
        res.delete();
    });

    it("should create rotated extrusion with shape positioned below Y=0", () => {
        const squareWire = wire.createSquareWire({ center: [0.5, -3, 0], size: 1, direction: [0, 1, 0] });
        const res = operations.rotatedExtrude({ shape: squareWire, angle: 360, height: 10, makeSolid: true });
        const vol = solid.getSolidVolume({ shape: res });
        expect(vol).toBeCloseTo(10, 3);
        
        const bbox = operations.boundingBoxOfShape({ shape: res });
        expect(bbox.min[1]).toBeCloseTo(-3, 1);
        expect(bbox.max[1]).toBeCloseTo(7, 1);
        
        squareWire.delete();
        res.delete();
    });

    it("should create rotated extrusion with shape at arbitrary Y position", () => {
        const squareWire = wire.createSquareWire({ center: [0.5, 25.7, 0], size: 1, direction: [0, 1, 0] });
        const res = operations.rotatedExtrude({ shape: squareWire, angle: 360, height: 5, makeSolid: true });
        const vol = solid.getSolidVolume({ shape: res });
        expect(vol).toBeCloseTo(5.0, 1);
        
        const bbox = operations.boundingBoxOfShape({ shape: res });
        expect(bbox.min[1]).toBeCloseTo(25.7, 1);
        expect(bbox.max[1]).toBeCloseTo(30.7, 1);
        
        squareWire.delete();
        res.delete();
    });

    it("should create rotated extrusion with partial rotation at elevated position", () => {
        const squareWire = wire.createSquareWire({ center: [0.5, 10, 0], size: 1, direction: [0, 1, 0] });
        const res = operations.rotatedExtrude({ shape: squareWire, angle: 180, height: 8, makeSolid: true });
        const vol = solid.getSolidVolume({ shape: res });
        expect(vol).toBeCloseTo(7.999990663583383, 1);
        
        const bbox = operations.boundingBoxOfShape({ shape: res });
        expect(bbox.min[1]).toBeCloseTo(10, 1);
        expect(bbox.max[1]).toBeCloseTo(18, 1);
        
        squareWire.delete();
        res.delete();
    });

    it("should create rotated extrusion as surface (not solid) at elevated position", () => {
        const squareWire = wire.createSquareWire({ center: [0.5, 7, 0], size: 1, direction: [0, 1, 0] });
        const res = operations.rotatedExtrude({ shape: squareWire, angle: 360, height: 6, makeSolid: false });
        
        const faces = face.getFaces({ shape: res });
        expect(faces.length).toBeGreaterThan(0);
        
        const bbox = operations.boundingBoxOfShape({ shape: res });
        expect(bbox.min[1]).toBeCloseTo(7, 1);
        expect(bbox.max[1]).toBeCloseTo(13, 1);
        
        squareWire.delete();
        res.delete();
        faces.forEach(f => f.delete());
    });

    it("should create rotated extrusion with circle wire at negative Y position", () => {
        const circleWire = wire.createCircleWire({ center: [2, -8, 0], radius: 0.5, direction: [0, 1, 0] });
        const res = operations.rotatedExtrude({ shape: circleWire, angle: 270, height: 12, makeSolid: true });
        const vol = solid.getSolidVolume({ shape: res });
        expect(vol).toBeCloseTo(9.424769481063818, 1);
        
        const bbox = operations.boundingBoxOfShape({ shape: res });
        expect(bbox.min[1]).toBeCloseTo(-8, 1);
        expect(bbox.max[1]).toBeCloseTo(4, 1);
        
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
        expect(vol).toBeCloseTo(0.5499178295992303, 10);
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
        expect(vol).toBeCloseTo(2.213470624416594, 10);
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
        const hexagonArea = 1.5 * Math.sqrt(3) * 0.2 * 0.2;
        expect(vol).toBeCloseTo(hexagonArea * wire.getWireLength({ shape: interpolatedWire }), 4);
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
        expect(vol).toBeCloseTo(Math.PI * 0.2 * 0.2 * wire.getWireLength({ shape: interpolatedWire }), 5);
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
        expect(vols).toHaveLength(1);
        expect(vols[0]).toBeCloseTo(Math.PI * 0.2 * 0.2 * wire.getWireLength({ shape: interpolatedWire }), 5);
        res.forEach(s => s.delete());
    });

    it("should refuse a tube OCCT builds without its side along a straight path, naming the trihedron", () => {
        // Arrange
        const straight = wire.interpolatePoints({ points: [[0, 0, 0], [30, 40, 0], [60, 80, 0]], tolerance: 1e-7, periodic: false, startTangent: [0.6, 0.8, 0], endTangent: [0.6, 0.8, 0] });

        // Act
        const act = (): TopoDS_Shape => operations.pipeWireCylindrical({ shape: straight, radius: 3, makeSolid: true, forceApproxC1: false, trihedronEnum: Inputs.OCCT.geomFillTrihedronEnum.isFrenet });

        // Assert
        expect(act).toThrow(expect.objectContaining({ name: "KernelOperationError", code: "occt.pipe.notValid", details: { trihedron: "isFrenet" } }));
        expect(act).toThrow("With the isFrenet trihedron OCCT can do that on a path that is straight or nearly so; the discrete trihedron (isDiscreteTrihedron) builds such paths.");
        straight.delete();
    });

    it("should build the same straight path as a valid tube with the discrete trihedron", () => {
        // Arrange
        const straight = wire.interpolatePoints({ points: [[0, 0, 0], [30, 40, 0], [60, 80, 0]], tolerance: 1e-7, periodic: false, startTangent: [0.6, 0.8, 0], endTangent: [0.6, 0.8, 0] });

        // Act
        const tube = operations.pipeWireCylindrical({ shape: straight, radius: 3, makeSolid: true, forceApproxC1: false, trihedronEnum: Inputs.OCCT.geomFillTrihedronEnum.isDiscreteTrihedron });

        // Assert
        expect(face.getFaces({ shape: tube })).toHaveLength(3);
        expect(solid.getSolidVolume({ shape: tube })).toBeCloseTo(Math.PI * 9 * 100, 3);
        straight.delete();
        tube.delete();
    });

    it("should refuse a polygon bar OCCT builds without its sides along a straight path", () => {
        // Arrange
        const straight = wire.interpolatePoints({ points: [[0, 0, 0], [30, 40, 0], [60, 80, 0]], tolerance: 1e-7, periodic: false, startTangent: [0.6, 0.8, 0], endTangent: [0.6, 0.8, 0] });

        // Act
        const act = (): TopoDS_Shape => operations.pipePolylineWireNGon({ shape: straight, radius: 3, nrCorners: 6, makeSolid: true, forceApproxC1: false, trihedronEnum: Inputs.OCCT.geomFillTrihedronEnum.isFrenet });

        // Assert
        expect(act).toThrow(expect.objectContaining({ name: "KernelOperationError", code: "occt.pipe.notValid", details: { trihedron: "isFrenet" } }));
        straight.delete();
    });

    it("should make thick solid simple", () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeBox(1, 2, 3, [0, 0, 0]);
        const boxFaces = face.getFaces({ shape: box });
        const fRem = boxFaces.pop()!;
        fRem.delete();
        const sew = shell.sewFaces({ shapes: boxFaces, tolerance: 1e-7 });
        const res = operations.makeThickSolidSimple({ shape: sew, offset: 0.3 });
        expect(res.ShapeType()).toBe(occt.TopAbs_ShapeEnum.SOLID);
        expect(face.getFaces({ shape: res })).toHaveLength(14);
        expect(occt.ShapeIsValid(res)).toBe(true);
        expect(solid.getSolidVolume({ shape: res })).toBeCloseTo(2.593333, 6);
        box.delete();
        sew.delete();
        boxFaces.forEach(f => f.delete());
        res.delete();
    });

    it.each([0.3, -0.3])("should thicken a face by %s into a solid with its matter inside", (offset) => {
        // Arrange
        const square = face.createSquareFace({ size: 2, center: [0, 0, 0], direction: [0, 1, 0] });

        // Act
        const slab = operations.makeThickSolidSimple({ shape: square, offset });

        // Assert
        const box = operations.boundingBoxOfShape({ shape: slab });
        expect(slab.ShapeType()).toBe(occt.TopAbs_ShapeEnum.SOLID);
        expect(solid.getSolidVolume({ shape: slab })).toBeCloseTo(1.2, 9);
        expect([box.min[1], box.max[1]]).toEqual((offset > 0 ? [0, 0.3] : [-0.3, 0]).map(v => expect.closeTo(v, 6)));
    });

    describe("splitShapeWithShapes", () => {
        it("should split a face with a wire", () => {
            const squareFace = face.createSquareFace({ size: 4, center: [0, 0, 0], direction: [0, 1, 0] });
            const circleWire = wire.createCircleWire({ center: [0, 0, 0], radius: 1, direction: [0, 1, 0] });
            const splitDto = new Inputs.OCCT.SplitDto(squareFace, [circleWire]);
            const results = operations.splitShapeWithShapes(splitDto);
            expect(results.length).toBe(3);
            squareFace.delete();
            circleWire.delete();
            results.forEach(s => s.delete());
        });

        it("should split a face with multiple wires", () => {
            const squareFace = face.createSquareFace({ size: 6, center: [0, 0, 0], direction: [0, 1, 0] });
            const circleWire1 = wire.createCircleWire({ center: [-1, 0, 0], radius: 0.5, direction: [0, 1, 0] });
            const circleWire2 = wire.createCircleWire({ center: [1, 0, 0], radius: 0.5, direction: [0, 1, 0] });
            const splitDto = new Inputs.OCCT.SplitDto(squareFace, [circleWire1, circleWire2]);
            const results = operations.splitShapeWithShapes(splitDto);
            expect(results.length).toBe(5);
            squareFace.delete();
            circleWire1.delete();
            circleWire2.delete();
            results.forEach(s => s.delete());
        });

        it("should return results when splitting shapes", () => {
            const squareFace = face.createSquareFace({ size: 4, center: [0, 0, 0], direction: [0, 1, 0] });
            const lineWire = wire.createLineWire({ start: [-3, 0, 0], end: [3, 0, 0] });
            const splitDto = new Inputs.OCCT.SplitDto(squareFace, [lineWire]);
            const results = operations.splitShapeWithShapes(splitDto);
            expect(results.length).toBe(3);
            squareFace.delete();
            lineWire.delete();
            results.forEach(s => s.delete());
        });
    });

    describe("makeThickSolidByJoin", () => {
        it("should make thick solid from a solid by removing a face", () => {
            const box = occHelper.entitiesService.bRepPrimAPIMakeBox(2, 2, 2, [0, 0, 0]);
            const boxFaces = face.getFaces({ shape: box });
            const topFace = boxFaces[boxFaces.length - 1];
            const thickDto = new Inputs.OCCT.ThickSolidByJoinDto(box, [topFace as TopoDS_Shape], 0.2, 1e-3);
            const result = operations.makeThickSolidByJoin(thickDto);
            const vol = solid.getSolidVolume({ shape: result });
            expect(vol).toBeCloseTo(4.519409997776157);
            box.delete();
            boxFaces.forEach(f => f.delete());
            result.delete();
        });

        it("should make thick solid with arc join type", () => {
            const box = occHelper.entitiesService.bRepPrimAPIMakeBox(2, 2, 2, [0, 0, 0]);
            const boxFaces = face.getFaces({ shape: box });
            const topFace = boxFaces[boxFaces.length - 1];
            const thickDto = new Inputs.OCCT.ThickSolidByJoinDto(
                box, [topFace as TopoDS_Shape], 0.3, 1e-3, false, false, Inputs.OCCT.joinTypeEnum.arc, false
            );
            const resultArc = operations.makeThickSolidByJoin(thickDto);
            const volArc = solid.getSolidVolume({ shape: resultArc });
            expect(volArc).toBeCloseTo(7.187522023473766);

            box.delete();
            boxFaces.forEach(f => f.delete());
            resultArc.delete();
        });

        it("should make thick solid with intersection join type", () => {
            const box = occHelper.entitiesService.bRepPrimAPIMakeBox(2, 2, 2, [0, 0, 0]);
            const boxFaces = face.getFaces({ shape: box });
            const topFace = boxFaces[boxFaces.length - 1];
            const thickDto = new Inputs.OCCT.ThickSolidByJoinDto(
                box, [topFace as TopoDS_Shape], 0.3, 1e-3, false, false, Inputs.OCCT.joinTypeEnum.intersection, false
            );
            const resultIntersection = operations.makeThickSolidByJoin(thickDto);
            const volIntersection = solid.getSolidVolume({ shape: resultIntersection });
            expect(volIntersection).toBeCloseTo(7.547999999999998);

            box.delete();
            boxFaces.forEach(f => f.delete());
            resultIntersection.delete();
        });
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
            const cyl = occHelper.entitiesService.bRepPrimAPIMakeCylinder([0, 0, 0], [0, 1, 0], 2, 10, 2 * Math.PI);
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
            const cyl = occHelper.entitiesService.bRepPrimAPIMakeCylinder([0, 0, 0], [0, 1, 0], 3, 8, 2 * Math.PI);
            const radius = operations.boundingSphereRadiusOfShape({ shape: cyl });
            
            expect(radius).toBeCloseTo(Math.sqrt(34), 2);
            
            cyl.delete();
        });

        it("should create a bounding sphere shape from a torus-like shape", () => {
            const circle = face.createCircleFace({ center: [5, 0, 0], radius: 1, direction: [0, 1, 0] });
            const torus = operations.revolve({ shape: circle, direction: [0, 1, 0], angle: 360, copy: false });
            
            const bsphereShape = operations.boundingSphereShapeOfShape({ shape: torus });
            const bsphere = operations.boundingSphereOfShape({ shape: torus });
            
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
            
            expect(bsphereVolume).toBeGreaterThan(bboxVolume);
            expect(bboxVolume).toBeCloseTo(64, 4);
            
            box.delete();
            bboxShape.delete();
            bsphereShape.delete();
        });
    });

    describe("a shape with nothing in it", () => {
        it("should refuse to find closest points on it", () => {
            // Arrange
            const empty = occHelper.converterService.makeCompound({ shapes: [] });

            // Act
            const act = () => operations.closestPointsOnShapeFromPoints({ shape: empty, points: [[0, 0, 0]] });

            // Assert
            expect(act).toThrow("Closest points could not be found.");
        });

        it("should refuse its bounding box, naming the input", () => {
            // Arrange
            const empty = occHelper.converterService.makeCompound({ shapes: [] });
            let refusal: unknown;

            // Act
            try {
                operations.boundingBoxOfShape({ shape: empty });
            } catch (failure) {
                refusal = failure;
            }

            // Assert
            expect(refusal).toMatchObject({ name: "InputError", property: "shape", message: "`shape` has no geometry to bound, so it has no bounding box." });
        });
    });
});
