import initOpenCascade, { OpenCascadeInstance } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTEdge } from "./edge";
import { OccHelper } from "../../occ-helper";
import { OCCTGeom } from "../geom/geom";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { Inputs } from "../../api";
import { OCCTFace } from "./face";
import { OCCTBooleans } from "../booleans";
import { OCCTWire } from "./wire";
import { OCCTFillets } from "../fillets";

describe("OCCT edge unit tests", () => {
    let edge: OCCTEdge;
    let wire: OCCTWire;
    let face: OCCTFace;
    let booleans: OCCTBooleans;
    let fillets: OCCTFillets;
    let geom: OCCTGeom;
    let occHelper: OccHelper;
    let occt: OpenCascadeInstance;
    let vec: VectorHelperService;
    let s: ShapesHelperService;

    const closeToNr = 13;

    beforeAll(async () => {
        occt = await initOpenCascade();
        vec = new VectorHelperService();
        s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        geom = new OCCTGeom(occt, occHelper);
        edge = new OCCTEdge(occt, occHelper);
        face = new OCCTFace(occt, occHelper);
        wire = new OCCTWire(occt, occHelper);
        fillets = new OCCTFillets(occt, occHelper);
        booleans = new OCCTBooleans(occt, occHelper);
    });

    it("should create a circle edge of the right radius and it will mach the length", async () => {
        const e = edge.createCircleEdge({ radius: 10, center: [0, 0, 0], direction: [0, 0, 1] });
        const length = edge.getEdgeLength({ shape: e });
        expect(length).toEqual(62.83185307179586);
        e.delete();
    });

    it("should create a circle edge and the point on it will be at specific location", async () => {
        const e = edge.createCircleEdge({ radius: 1, center: [0, 1, 0], direction: [1, 1, 0] });
        const point = edge.pointOnEdgeAtParam({ shape: e, param: 0.5 });
        const x = point[0];
        const y = point[1];
        const z = point[2];
        expect(x).toBeCloseTo(-0.7071067811865476, closeToNr);
        expect(y).toBeCloseTo(1.7071067811865475, closeToNr);
        expect(z).toBeCloseTo(0, closeToNr);
        e.delete();
    });

    it("should create an edge line between two points", async () => {
        const e = edge.line({ start: [-1, -1, -1], end: [1, 1, 1] });
        const length = edge.getEdgeLength({ shape: e });
        expect(length).toEqual(3.4641016151377544);
        e.delete();
    });

    it("should create an edge line between two points and the point on it will be at specific location", async () => {
        const e = edge.line({ start: [-1, -1, -1], end: [1, 1, 1] });
        const point = edge.pointOnEdgeAtParam({ shape: e, param: 0.5 });
        const x = point[0];
        const y = point[1];
        const z = point[2];
        expect(x).toBeCloseTo(0, closeToNr);
        expect(y).toBeCloseTo(0, closeToNr);
        expect(z).toBeCloseTo(0, closeToNr);
        e.delete();
    });

    it("should create an arc edge between three points and the length will be correct", async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const length = edge.getEdgeLength({ shape: e });
        expect(length).toEqual(4.05306515313624);
        e.delete();
    });

    it("should make edge from geom 2d curve and surface", async () => {
        const elipse2d = geom.curves.geom2dEllipse({ radiusMinor: 1, radiusMajor: 2, center: [0, 0], direction: [0, 1], sense: true });
        const cylinderSrf = geom.surfaces.cylindricalSurface({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });

        const e = edge.makeEdgeFromGeom2dCurveAndSurface({
            curve: elipse2d,
            surface: cylinderSrf
        });
        const length = edge.getEdgeLength({ shape: e });
        expect(length).toEqual(12.56637061435917);
        e.delete();
        elipse2d.delete();
        cylinderSrf.delete();
    });

    it("should make ellipse edge", async () => {
        const e = edge.createEllipseEdge({ radiusMinor: 2, radiusMajor: 3, center: [0, 0, 0], direction: [0, 0, 1] });
        const length = edge.getEdgeLength({ shape: e });
        expect(length).toEqual(15.869698772210647);
        e.delete();
    });

    it("should not make ellipse edge when minor radius is larger than major radius", async () => {
        expect(() =>
            edge.createEllipseEdge({ radiusMinor: 3, radiusMajor: 2, center: [0, 0, 0], direction: [0, 0, 1] })
        ).toThrowError("Ellipse could not be created.");
    });

    it("should be able to get an edge from solid shape", async () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeBox(10, 10, 10, [0, 0, 0]);
        const e = edge.getEdge({ shape: box, index: 1 });
        const length = edge.getEdgeLength({ shape: e });
        expect(length).toEqual(10);
        box.delete();
        e.delete();
    });

    it("should not be able to get an edge from solid shape with undefined index", async () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeBox(10, 10, 10, [0, 0, 0]);
        expect(() =>
            edge.getEdge({ shape: box, index: 0 })
        ).toThrowError("Edge can not be found for shape on index 0");
        box.delete();
    });

    it("should be not able to get an edge from solid shape with undefined index", async () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeBox(10, 10, 10, [0, 0, 0]);
        expect(() =>
            edge.getEdge({ shape: box, index: 13 })
        ).toThrowError("Edge can not be found for shape on index 13");
        box.delete();
    });

    it("should not be able to get an edge if shape is not provided", async () => {
        expect(() =>
            edge.getEdge({ shape: undefined, index: 1 })
        ).toThrowError("Edge can not be found for shape that is not provided or is of incorrect type");
    });

    it("should not remove internal edges if there are none", async () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeBox(10, 10, 10, [0, 0, 0]);
        const boxEdges = edge.getEdges({ shape: box });
        const shapeWithoutEdges = edge.removeInternalEdges({ shape: box });
        const removedBoxEdges = edge.getEdges({ shape: shapeWithoutEdges });
        expect(boxEdges.length).toBe(removedBoxEdges.length);
        box.delete();
        boxEdges.forEach(e => e.delete());
        shapeWithoutEdges.delete();
        removedBoxEdges.forEach(e => e.delete());
    });

    it("should get a point on edge at param", async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const pt = edge.pointOnEdgeAtParam({ shape: e, param: 0.25 });
        expect(pt).toEqual([-0.8321107509656731, -0.02482724898439559, -0.8321107509656731]);
        e.delete();
    });

    it("should get a tangent on edge at param", async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const pt = edge.tangentOnEdgeAtParam({ shape: e, param: 0.25 });
        expect(pt).toEqual([0.6895512650714751, 1.8838890905986638, 0.6895512650714751]);
        e.delete();
    });

    it("should get a start point on edge", async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const pt = edge.startPointOnEdge({ shape: e });
        const x = pt[0];
        const y = pt[1];
        const z = pt[2];

        expect(x).toBeCloseTo(-1, closeToNr);
        expect(y).toBeCloseTo(-1, closeToNr);
        expect(z).toBeCloseTo(-1, closeToNr);
        e.delete();
    });

    it("should get an end point on edge", async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const pt = edge.endPointOnEdge({ shape: e });
        const x = pt[0];
        const y = pt[1];
        const z = pt[2];

        expect(x).toBeCloseTo(1, closeToNr);
        expect(y).toBeCloseTo(1, closeToNr);
        expect(z).toBeCloseTo(1, closeToNr);
        e.delete();
    });

    it("should get a point on the edge at length", async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const pt = edge.pointOnEdgeAtLength({ shape: e, length: 0 });
        const x = pt[0];
        const y = pt[1];
        const z = pt[2];

        expect(x).toBeCloseTo(-1, closeToNr);
        expect(y).toBeCloseTo(-1, closeToNr);
        expect(z).toBeCloseTo(-1, closeToNr);
        e.delete();
    });

    it("should get a point on the edge at length", async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const pt = edge.pointOnEdgeAtLength({ shape: e, length: 0.1 });
        const x = pt[0];
        const y = pt[1];
        const z = pt[2];
        expect(x).toBeCloseTo(-0.9983336419524473, closeToNr);
        expect(y).toBeCloseTo(-0.9000370329220284, closeToNr);
        expect(z).toBeCloseTo(-0.9983336419524473, closeToNr);
        e.delete();
    });

    it("should get a point on the edge at length", async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const pt = edge.pointOnEdgeAtLength({ shape: e, length: 0.7 });
        const x = pt[0];
        const y = pt[1];
        const z = pt[2];
        expect(x).toBeCloseTo(-0.9190716982049705, closeToNr);
        expect(y).toBeCloseTo(-0.3126347181393845, closeToNr);
        expect(z).toBeCloseTo(-0.9190716982049705, closeToNr);
        e.delete();
    });

    it("should get a point on the edge at length", async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const edgeLength = edge.getEdgeLength({ shape: e });
        const pt = edge.pointOnEdgeAtLength({ shape: e, length: edgeLength });
        const x = pt[0];
        const y = pt[1];
        const z = pt[2];
        expect(x).toBeCloseTo(1, closeToNr);
        expect(y).toBeCloseTo(1, closeToNr);
        expect(z).toBeCloseTo(1, closeToNr);
        e.delete();
    });

    it("should get a tangent on the arc edge at length", async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const pt = edge.tangentOnEdgeAtLength({ shape: e, length: 0.1 });
        const x = pt[0];
        const y = pt[1];
        const z = pt[2];
        expect(x).toBeCloseTo(0.1350521394892781, closeToNr);
        expect(y).toBeCloseTo(4.048562581312783, closeToNr);
        expect(z).toBeCloseTo(0.1350521394892781, closeToNr);
        e.delete();
    });

    it("should get a tangent on the circle edge at length", async () => {
        const e = edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const pt = edge.tangentOnEdgeAtLength({ shape: e, length: Math.PI });
        const x = pt[0];
        const y = pt[1];
        const z = pt[2];
        expect(x).toBeCloseTo(-6.283185307179586, closeToNr);
        expect(y).toBeCloseTo(0, closeToNr);
        expect(z).toBeCloseTo(0, closeToNr);
        e.delete();
    });

    it("should divide the edge by params to points", async () => {
        const e = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const points = edge.divideEdgeByParamsToPoints({ shape: e, nrOfDivisions: 10, removeEndPoint: false, removeStartPoint: false });
        expect(points.length).toBe(11);
        expect(points[0][0]).toBeCloseTo(points[10][0], closeToNr);
        expect(points[0][1]).toBeCloseTo(points[10][1], closeToNr);
        expect(points[0][2]).toBeCloseTo(points[10][2], closeToNr);
        e.delete();
    });

    it("should divide the edge by params to points", async () => {
        const e = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const points = edge.divideEdgeByParamsToPoints({ shape: e, nrOfDivisions: 10, removeEndPoint: false, removeStartPoint: false });
        expect(points.length).toBe(11);
        expect(points).toEqual([
            [0, 0, 2],
            [1.1755705045849463, 0, 1.618033988749895],
            [1.902113032590307, 0, 0.6180339887498949],
            [1.9021130325903073, 0, -0.6180339887498947],
            [1.1755705045849465, 0, -1.6180339887498947],
            [2.4492935982947064e-16, 0, -2],
            [-1.175570504584946, 0, -1.618033988749895],
            [-1.902113032590307, 0, -0.6180339887498951],
            [-1.9021130325903073, 0, 0.6180339887498945],
            [-1.1755705045849467, 0, 1.6180339887498947],
            [-4.898587196589413e-16, 0, 2]
        ]);
        e.delete();
    });

    it("should divide the edge by params to points and remove start and end points", async () => {
        const e = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const points = edge.divideEdgeByParamsToPoints({ shape: e, nrOfDivisions: 10, removeEndPoint: true, removeStartPoint: true });
        expect(points.length).toBe(9);
        expect(points).toEqual([
            [1.1755705045849463, 0, 1.618033988749895],
            [1.902113032590307, 0, 0.6180339887498949],
            [1.9021130325903073, 0, -0.6180339887498947],
            [1.1755705045849465, 0, -1.6180339887498947],
            [2.4492935982947064e-16, 0, -2],
            [-1.175570504584946, 0, -1.618033988749895],
            [-1.902113032590307, 0, -0.6180339887498951],
            [-1.9021130325903073, 0, 0.6180339887498945],
            [-1.1755705045849467, 0, 1.6180339887498947],
        ]);
        e.delete();
    });

    it("should divide the edge by params to points and remove end point", async () => {
        const e = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const points = edge.divideEdgeByParamsToPoints({ shape: e, nrOfDivisions: 10, removeEndPoint: true, removeStartPoint: false });
        expect(points.length).toBe(10);
        expect(points[0][0]).not.toBeCloseTo(points[9][0], closeToNr);
        expect(points[0][1]).toBeCloseTo(points[9][1], closeToNr);
        expect(points[0][2]).not.toBeCloseTo(points[9][2], closeToNr);
        e.delete();
    });

    it("should divide the edge by equal length to points", async () => {
        const e = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const points = edge.divideEdgeByEqualDistanceToPoints({ shape: e, nrOfDivisions: 10, removeEndPoint: false, removeStartPoint: false });
        expect(points.length).toBe(11);
        expect(points[0][0]).toBeCloseTo(points[10][0], closeToNr);
        expect(points[0][1]).toBeCloseTo(points[10][1], closeToNr);
        expect(points[0][2]).toBeCloseTo(points[10][2], closeToNr);
        e.delete();
    });


    it("should divide the edge by equal length to points", async () => {
        const e = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const points = edge.divideEdgeByEqualDistanceToPoints({ shape: e, nrOfDivisions: 10, removeEndPoint: false, removeStartPoint: false });
        expect(points.length).toBe(11);
        expect(points[0]).toEqual([0, 0, 2]);
        expect(points[1]).toEqual([1.1755705045849463, 0, 1.618033988749895]);
        expect(points[2]).toEqual([1.902113032590307, 0, 0.6180339887498949]);
        expect(points[3]).toEqual([1.902113032590307, 0, -0.6180339887498951]);
        expect(points[4]).toEqual([1.1755705045849465, 0, -1.6180339887498947]);
        expect(points[5]).toEqual([2.4492935982947064e-16, 0, -2]);
        expect(points[6]).toEqual([-1.175570504584946, 0, -1.618033988749895]);
        expect(points[7]).toEqual([-1.9021130325903075, 0, -0.6180339887498935]);
        expect(points[8]).toEqual([-1.9021130325903073, 0, 0.6180339887498945]);
        expect(points[9]).toEqual([-1.1755705045849467, 0, 1.6180339887498947]);
        expect(points[10]).toEqual([-4.898587196589413e-16, 0, 2]);
        e.delete();
    });

    it("should divide the edge by equal length to points and remove start and end points", async () => {
        const e = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const points = edge.divideEdgeByEqualDistanceToPoints({ shape: e, nrOfDivisions: 10, removeEndPoint: true, removeStartPoint: true });
        expect(points.length).toBe(9);
        expect(points[0]).toEqual([1.1755705045849463, 0, 1.618033988749895]);
        expect(points[1]).toEqual([1.902113032590307, 0, 0.6180339887498949]);
        expect(points[2]).toEqual([1.902113032590307, 0, -0.6180339887498951]);
        expect(points[3]).toEqual([1.1755705045849465, 0, -1.6180339887498947]);
        expect(points[4]).toEqual([2.4492935982947064e-16, 0, -2]);
        expect(points[5]).toEqual([-1.175570504584946, 0, -1.618033988749895]);
        expect(points[6]).toEqual([-1.9021130325903075, 0, -0.6180339887498935]);
        expect(points[7]).toEqual([-1.9021130325903073, 0, 0.6180339887498945]);
        expect(points[8]).toEqual([-1.1755705045849467, 0, 1.6180339887498947]);
        e.delete();
    });

    it("should get edge lengths", async () => {
        const cylinder = occHelper.entitiesService.bRepPrimAPIMakeCylinder([0, 0, 0], [0, 1, 0], 1, 2);
        const edges = edge.getEdges({ shape: cylinder });
        const lengths = edge.getEdgesLengths({ shapes: edges });
        expect(lengths.length).toBe(3);
        expect(lengths[0]).toBe(6.283185307179587);
        expect(lengths[1]).toBe(2);
        expect(lengths[2]).toBe(6.283185307179587);
        cylinder.delete();
        edges.forEach((e) => e.delete());
    });

    it("should get edge center of mass of a circle", async () => {
        const e = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const center = edge.getEdgeCenterOfMass({ shape: e });
        expect(center[0]).toBeCloseTo(0, closeToNr);
        expect(center[1]).toBeCloseTo(0, closeToNr);
        expect(center[2]).toBeCloseTo(0, closeToNr);
        e.delete();
    });

    it("should get edge center of mass of an arc", async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const center = edge.getEdgeCenterOfMass({ shape: e });
        expect(center[0]).toBeCloseTo(-0.24018055142257372, closeToNr);
        expect(center[1]).toBeCloseTo(0.4803611028451472, closeToNr);
        expect(center[2]).toBeCloseTo(-0.24018055142257372, closeToNr);
        e.delete();
    });

    it("should get edges centers of mass of a circle", async () => {
        const e1 = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const e2 = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });

        const centers = edge.getEdgesCentersOfMass({ shapes: [e1, e2] });
        expect(centers).toEqual([
            [5.551115123125783e-17, 0, 9.43689570931383e-15],
            [-0.24018055142257372, 0.4803611028451472, -0.24018055142257372]
        ]);
        e1.delete();
        e2.delete();
    });

    it("should get corner points of edges for the shape", async () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeBox(10, 10, 10, [0, 0, 0]);
        const corners = edge.getCornerPointsOfEdgesForShape({ shape: box });
        expect(corners.length).toBe(8);
        expect(corners).toEqual([
            [-5, -5, -5],
            [-5, -5, 5],
            [-5, 5, 5],
            [-5, 5, -5],
            [5, -5, -5],
            [5, -5, 5],
            [5, 5, 5],
            [5, 5, -5]
        ]);
        box.delete();
    });

    it("should create edge from two points and a tangent vector", () => {
        const e = edge.arcThroughTwoPointsAndTangent({
            start: [0, 0, 0],
            end: [1, 1, 1],
            tangentVec: [1, 0, 0]
        });
        const length = edge.getEdgeLength({ shape: e });
        expect(length).toBe(2.02653257656812);
        e.delete();
    });

    it("should create an arc from circle and two points", () => {
        const circle = edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 0, 1] });
        const ptOnCircle1 = edge.pointOnEdgeAtParam({ shape: circle, param: 0.3 });
        const ptOnCircle2 = edge.pointOnEdgeAtParam({ shape: circle, param: 0.6 });
        const e = edge.arcFromCircleAndTwoPoints({
            start: ptOnCircle1,
            end: ptOnCircle2,
            circle,
            sense: true
        });
        const length = edge.getEdgeLength({ shape: e });
        expect(length).toBe(1.8849555921538759);
        e.delete();
        circle.delete();
    });

    it("should create an arc from circle and two alpha angles", () => {
        const circle = edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 0, 1] });
        const e = edge.arcFromCircleAndTwoAngles({
            alphaAngle1: -30,
            alphaAngle2: 55,
            circle,
            sense: true
        });
        const length = edge.getEdgeLength({ shape: e });
        expect(length).toBe(1.4835298641951802);
        e.delete();
        circle.delete();
    });

    it("should create an arc from circle between the point and an angle", () => {
        const circle = edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 0, 1] });
        const ptOnCircle = edge.pointOnEdgeAtParam({ shape: circle, param: 0.3 });
        const e = edge.arcFromCirclePointAndAngle({
            point: ptOnCircle,
            alphaAngle: -30,
            circle,
            sense: true
        });
        const length = edge.getEdgeLength({ shape: e });
        expect(length).toBe(3.874630939427411);
        e.delete();
        circle.delete();
    });

    it("should convert edges to points with default options", () => {
        const circle = edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 0, 1] });
        const opt = new Inputs.OCCT.EdgesToPointsDto(circle);
        const points = edge.edgesToPoints(opt);
        expect(points.length).toBe(1);
        expect(points[0].length).toBe(64);
        const firstPt = points[0][0];
        expect(firstPt[0]).toBeCloseTo(1);
        expect(firstPt[1]).toBeCloseTo(0);
        expect(firstPt[2]).toBeCloseTo(0);
        const secondTestPt = points[0][23];
        expect(secondTestPt[0]).toBeCloseTo(-0.6616858375968588);
        expect(secondTestPt[1]).toBeCloseTo(0.7497812029677347);
        expect(secondTestPt[2]).toBeCloseTo(0);
        circle.delete();
    });

    it("should return fewer points if angular deflection is higher", () => {
        const circle = edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 0, 1] });
        const opt = new Inputs.OCCT.EdgesToPointsDto(circle);
        opt.angularDeflection = 0.2;
        const points = edge.edgesToPoints(opt);
        expect(points.length).toBe(1);
        expect(points[0].length).toBe(33);
        circle.delete();
    });

    it("should return more points if angular deflection is lower", () => {
        const circle = edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 0, 1] });
        const opt = new Inputs.OCCT.EdgesToPointsDto(circle);
        opt.angularDeflection = 0.05;
        const points = edge.edgesToPoints(opt);
        expect(points.length).toBe(1);
        expect(points[0].length).toBe(127);
        circle.delete();
    });

    it("should return same amount of points if curvature deflection is higher for circular edge", () => {
        const circle = edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 0, 1] });
        const opt = new Inputs.OCCT.EdgesToPointsDto(circle);
        opt.curvatureDeflection = 0.2;
        const points = edge.edgesToPoints(opt);
        expect(points.length).toBe(1);
        expect(points[0].length).toBe(64);
        circle.delete();
    });

    it("should return fewer points if minimum length is higher", () => {
        const circle = edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 0, 1] });
        const opt = new Inputs.OCCT.EdgesToPointsDto(circle);
        opt.minimumLength = 0.2;
        const points = edge.edgesToPoints(opt);
        expect(points.length).toBe(1);
        expect(points[0].length).toBe(33);
        circle.delete();
    });

    it("should return 100 points if even if deflectors would produce fewer points", () => {
        const circle = edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 0, 1] });
        const opt = new Inputs.OCCT.EdgesToPointsDto(circle);
        opt.minimumOfPoints = 100;
        const points = edge.edgesToPoints(opt);
        expect(points.length).toBe(1);
        expect(points[0].length).toBe(100);
        circle.delete();
    });

    it("should create reversed edge", () => {
        const line = edge.line({ start: [0, 0, 0], end: [0, 0, 1] });
        const reversed = edge.reversedEdge({ shape: line });
        const length = edge.getEdgeLength({ shape: reversed });
        expect(length).toBe(1);
        const startPoint = edge.startPointOnEdge({ shape: reversed });
        expect(startPoint).toEqual([0, 0, 1]);
        const endPoint = edge.endPointOnEdge({ shape: reversed });
        expect(endPoint).toEqual([0, 0, 0]);
        line.delete();
        reversed.delete();
    });

    it("should get edges along wire", () => {
        const squareFace = face.createRectangleFace({ width: 10, length: 20, center: [0, 0, 0], direction: [0, 1, 0] });
        const edges = edge.getEdges({ shape: squareFace });
        const points = edges.map(e => [edge.pointOnEdgeAtParam({ shape: e, param: 0.3 }), edge.pointOnEdgeAtParam({ shape: e, param: 0.6 })]).flat();
        const circleFaces = points.map(p => face.createCircleFace({ radius: 1, center: p, direction: [0, 1, 0] }));
        const diff = booleans.difference({ shape: squareFace, shapes: circleFaces.reverse(), keepEdges: true });
        const w = wire.getWire({ shape: diff, index: 0 });
        const edgesNotAlongWire = edge.getEdges({ shape: w });
        const edgesAlongWire = edge.getEdgesAlongWire({ shape: w });
        const startPointsNotAlong = edgesNotAlongWire.map(e => edge.startPointOnEdge({ shape: e }));
        const startPointsAlong = edgesAlongWire.map(e => edge.startPointOnEdge({ shape: e }));
        expect(edgesNotAlongWire.length).toBe(22);
        expect(edgesAlongWire.length).toBe(22);
        expect(startPointsAlong).not.toEqual(startPointsNotAlong);
        expect(startPointsNotAlong).toEqual(
            [
                [5, 0, -1],
                [5, 0, 3],
                [5, 0, 5],
                [5, 0, 10],
                [2, 0, 10],
                [0, 0, 10.000000000000004],
                [-1, 0, 10],
                [-3, 0, 10.000000000000004],
                [-5, 0, 10],
                [-5, 0, 3],
                [-5, 0, 1],
                [-5, 0, -3],
                [-5, 0, -5],
                [-5, 0, -10],
                [-2, 0, -10],
                [-1.0000000000000002, 0, -9],
                [0, 0, -9.999999999999996],
                [1, 0, -10],
                [1.9999999999999998, 0, -9],
                [3, 0, -9.999999999999996],
                [5, 0, -10],
                [5, 0, -3]
            ]);
        expect(startPointsAlong).toEqual(
            [
                [5, 0, -1],
                [5, 0, -3],
                [5, 0, -10],
                [3, 0, -9.999999999999996],
                [1.9999999999999998, 0, -9],
                [1, 0, -10],
                [0, 0, -9.999999999999996],
                [-1.0000000000000002, 0, -9],
                [-2, 0, -10],
                [-5, 0, -10],
                [-5, 0, -5],
                [-5, 0, -3],
                [-5, 0, 1],
                [-5, 0, 3],
                [-5, 0, 10],
                [-3, 0, 10.000000000000004],
                [-1, 0, 10],
                [0, 0, 10.000000000000004],
                [2, 0, 10],
                [5, 0, 10],
                [5, 0, 5],
                [5, 0, 3]
            ]);
        squareFace.delete();
        edges.forEach(e => e.delete());
        circleFaces.forEach(f => f.delete());
        diff.delete();
        w.delete();
        edgesNotAlongWire.forEach(e => e.delete());
        edgesAlongWire.forEach(e => e.delete());
    });

    it("should get circular edges along wire", () => {
        const star = wire.createStarWire({ outerRadius: 10, innerRadius: 5, numRays: 5, center: [0, 0, 0], direction: [0, 1, 0], half: false });
        const filletWire = fillets.fillet2d({ shape: star, radius: 0.1 });
        const circEdges = edge.getCircularEdgesAlongWire({ shape: filletWire });
        expect(circEdges.length).toBe(10);
        const centerPointsOfCircEdges = circEdges.map(e => edge.pointOnEdgeAtParam({ shape: e, param: 0.5 }));
        expect(centerPointsOfCircEdges).toEqual(
            [
                [4.055584049054565, 0, 2.9465542875383197],
                [3.0512476630476084, 0, 9.390774700406086],
                [-1.5490952625069239, 0, 4.767624986933736],
                [-7.988270089952323, 0, 5.8038179455435746],
                [-5.012977573095285, 0, -1.352518115073085e-15],
                [-7.988270089952325, 0, -5.803817945543571],
                [-1.5490952625069248, 0, -4.767624986933734],
                [3.0512476630476053, 0, -9.390774700406087],
                [4.055584049054564, 0, -2.946554287538323],
                [9.874044853809437, 0, -1.45074205086341e-15]
            ]
        );
        star.delete();
        filletWire.delete();
        circEdges.forEach(e => e.delete());
    });

    it("should get linear edges along wire", () => {
        const star = wire.createStarWire({ outerRadius: 10, innerRadius: 5, numRays: 5, center: [0, 0, 0], direction: [0, 1, 0], half: false });
        const filletWire = fillets.fillet2d({ shape: star, radius: 0.1 });
        const linearEdges = edge.getLinearEdgesAlongWire({ shape: filletWire });
        expect(linearEdges.length).toBe(10);
        const centerPointsOfLinEdges = linearEdges.map(e => edge.pointOnEdgeAtParam({ shape: e, param: 0.5 }));
        expect(centerPointsOfLinEdges).toEqual(
            [
                [6.9552653011507495, 0, 1.5026664063837831],
                [3.5784158560510866, 0, 6.150500930772069],
                [0.7201745008328477, 0, 7.07919984366991],
                [-4.743682676229625, 0, 5.3038850294387885],
                [-6.510172981805056, 0, 2.8725197101571633],
                [-6.510172981805057, 0, -2.8725197101571625],
                [-4.743682676229623, 0, -5.303885029438787],
                [0.7201745008328464, 0, -7.07919984366991],
                [3.578415856051085, 0, -6.150500930772071],
                [6.955265301150748, 0, -1.5026664063837851]
            ]
        );
        star.delete();
        filletWire.delete();
        linearEdges.forEach(e => e.delete());
    });

    it("should get circular edge center points", () => {
        const star = wire.createStarWire({ outerRadius: 10, innerRadius: 5, numRays: 5, center: [0, 0, 0], direction: [0, 1, 0], half: false });
        const filletWire = fillets.fillet2d({ shape: star, radius: 0.2 });
        const circularEdges = edge.getCircularEdgesAlongWire({ shape: filletWire });
        expect(circularEdges.length).toBe(10);
        const centersOfCircles = circularEdges.map(e => edge.getCircularEdgeCenterPoint({ shape: e }));
        expect(centersOfCircles).toEqual(
            [
                [4.227886525109383, 0, 3.0717393640727706],
                [2.950521983470752, 0, 9.080772934601606],
                [-1.6149089520140991, 0, 4.9701786956507314],
                [-7.724566837280184, 0, 5.6122263177039216],
                [-5.225955146190568, 0, 5.622660297988197e-16],
                [-7.724566837280185, 0, -5.612226317703919],
                [-1.614908952014098, 0, -4.970178695650731],
                [2.95052198347075, 0, -9.080772934601608],
                [4.227886525109382, 0, -3.0717393640727724],
                [9.548089707618868, 0, -1.4446188168676734e-15]
            ]
        );
        star.delete();
        filletWire.delete();
        circularEdges.forEach(e => e.delete());
    });

    it("should get circular edge radius", () => {
        const star = wire.createStarWire({ outerRadius: 10, innerRadius: 5, numRays: 5, center: [0, 0, 0], direction: [0, 1, 0], half: false });
        const filletWire = fillets.fillet2d({ shape: star, radius: 0.2 });
        const circularEdges = edge.getCircularEdgesAlongWire({ shape: filletWire });
        expect(circularEdges.length).toBe(10);
        const radiusList = circularEdges.map(e => edge.getCircularEdgeRadius({ shape: e }));
        expect(radiusList).toEqual(
            [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2]
        );
        star.delete();
        filletWire.delete();
        circularEdges.forEach(e => e.delete());
    });

    it("should get circular edge plane direction", () => {
        const star = wire.createStarWire({ outerRadius: 10, innerRadius: 5, numRays: 5, center: [0, 0, 0], direction: [0, 1, 0], half: false });
        const filletWire = fillets.fillet2d({ shape: star, radius: 0.2 });
        const circularEdges = edge.getCircularEdgesAlongWire({ shape: filletWire });
        expect(circularEdges.length).toBe(10);
        const radiusList = circularEdges.map(e => edge.getCircularEdgePlaneDirection({ shape: e }));
        expect(radiusList).toEqual(
            [[0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0]]
        );
        star.delete();
        filletWire.delete();
        circularEdges.forEach(e => e.delete());
    });

    it("should create tan lines from two points to a circle and keep sides 1", () => {
        checkConstraintTanLinesFromTwoPtsToCircle(
            Inputs.OCCT.positionResultEnum.keepSide1,
            Inputs.OCCT.circleInclusionEnum.keepSide1,
            3,
            [2.8284271247461903, 5.575824665437111, 1.7320508075688772]
        );
    });

    it("should create tan lines from two points to a circle and keep sides 2", () => {
        checkConstraintTanLinesFromTwoPtsToCircle(
            Inputs.OCCT.positionResultEnum.keepSide2,
            Inputs.OCCT.circleInclusionEnum.keepSide2,
            3,
            [2.8284271247461903, 3.8489532953322696, 1.7320508075688772]
        );
    });

    it("should create tan lines from two points to a circle and keep side 1 for position of lines and keep side 2 for circle", () => {
        checkConstraintTanLinesFromTwoPtsToCircle(
            Inputs.OCCT.positionResultEnum.keepSide1,
            Inputs.OCCT.circleInclusionEnum.keepSide2,
            3,
            [2.8284271247461903, 0.7073606417424754, 1.7320508075688772]
        );
    });

    it("should create tan lines from two points to a circle and keep side 2 for position of lines and keep side 1 for circle", () => {
        checkConstraintTanLinesFromTwoPtsToCircle(
            Inputs.OCCT.positionResultEnum.keepSide2,
            Inputs.OCCT.circleInclusionEnum.keepSide1,
            3,
            [2.8284271247461903, 2.4342320118473175, 1.7320508075688772]
        );
    });

    it("should create tan lines from two points to a circle and keep all sides for position of lines and keep none for circle", () => {
        checkConstraintTanLinesFromTwoPtsToCircle(
            Inputs.OCCT.positionResultEnum.all,
            Inputs.OCCT.circleInclusionEnum.keepSide1,
            4,
            [2.8284271247461903, 2.8284271247461903, 1.7320508075688772, 1.7320508075688772]
        );
    });

    it("should create tan lines from two points to a circle and keep all side 1 for position of lines and keep none for circle", () => {
        checkConstraintTanLinesFromTwoPtsToCircle(
            Inputs.OCCT.positionResultEnum.keepSide1,
            Inputs.OCCT.circleInclusionEnum.none,
            2,
            [2.8284271247461903, 1.7320508075688772]
        );
    });

    it("should create tan lines from two points to a circle and return all solutions for unrecognized enum value", () => {
        checkConstraintTanLinesFromTwoPtsToCircle(
            "whatever" as any,
            Inputs.OCCT.circleInclusionEnum.none,
            4,
            [2.8284271247461903, 2.8284271247461903, 1.7320508075688772, 1.7320508075688772]
        );
    });

    const checkConstraintTanLinesFromTwoPtsToCircle = (pos: Inputs.OCCT.positionResultEnum, cirRem: Inputs.OCCT.circleInclusionEnum, lengthExp: number, lengthsExp: number[]) => {
        const circle = edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 0, 1] });
        const pt1 = [3, 0, 0] as Inputs.Base.Point3;
        const pt2 = [0, 2, 0] as Inputs.Base.Point3;
        const edges = edge.constraintTanLinesFromTwoPtsToCircle({
            point1: pt1,
            point2: pt2,
            circle,
            positionResult: pos,
            circleRemainder: cirRem,
            tolerance: 1e-7
        });
        expect(edges.length).toBe(lengthExp);
        const lengths = edges.map(e => edge.getEdgeLength({ shape: e }));
        expect(lengths).toEqual(lengthsExp);
        circle.delete();
        edges.forEach(e => e.delete());
    };

    it("should create tan lines from one point to a circle and keep side 1 lines", () => {
        checkConstraintTanLinesFromPtToCircle(
            Inputs.OCCT.positionResultEnum.keepSide1,
            Inputs.OCCT.circleInclusionEnum.none,
            1,
            [4.737087712930804]
        );
    });

    it("should create tan lines from one point to a circle and keep side 2 lines", () => {
        checkConstraintTanLinesFromPtToCircle(
            Inputs.OCCT.positionResultEnum.keepSide2,
            Inputs.OCCT.circleInclusionEnum.none,
            1,
            [4.737087712930805]
        );
    });

    it("should create tan lines from one point to a circle and keep all sides", () => {
        checkConstraintTanLinesFromPtToCircle(
            Inputs.OCCT.positionResultEnum.all,
            Inputs.OCCT.circleInclusionEnum.none,
            2,
            [4.737087712930804, 4.737087712930805]
        );
    });

    it("should create tan lines from one point to a circle and keep all sides and a circle 1 side", () => {
        checkConstraintTanLinesFromPtToCircle(
            Inputs.OCCT.positionResultEnum.all,
            Inputs.OCCT.circleInclusionEnum.keepSide1,
            3,
            [4.737087712930804, 6.068882605086486, 4.737087712930805]
        );
    });

    it("should create tan lines from one point to a circle and keep all sides and a circle 2 side", () => {
        checkConstraintTanLinesFromPtToCircle(
            Inputs.OCCT.positionResultEnum.all,
            Inputs.OCCT.circleInclusionEnum.keepSide2,
            3,
            [4.737087712930804, 3.984213886400852, 4.737087712930805]
        );
    });

    it("should create tan lines from one point to a circle and keep all sides for unrecognized position enum", () => {
        checkConstraintTanLinesFromPtToCircle(
            "whatever" as any,
            Inputs.OCCT.circleInclusionEnum.keepSide2,
            3,
            [4.737087712930804, 3.984213886400852, 4.737087712930805]
        );
    });

    const checkConstraintTanLinesFromPtToCircle = (pos: Inputs.OCCT.positionResultEnum, cirRem: Inputs.OCCT.circleInclusionEnum, lengthExp: number, lengthsExp: number[]) => {
        const circle = edge.createCircleEdge({ radius: 1.6, center: [0, 0, 0], direction: [0, 0, 1] });
        const pt1 = [3, 4, 0] as Inputs.Base.Point3;
        const edges = edge.constraintTanLinesFromPtToCircle({
            point: pt1,
            circle,
            positionResult: pos,
            circleRemainder: cirRem,
            tolerance: 1e-7
        });
        expect(edges.length).toBe(lengthExp);
        const lengths = edges.map(e => edge.getEdgeLength({ shape: e }));
        expect(lengths).toEqual(lengthsExp);
        circle.delete();
        edges.forEach(e => e.delete());
    };

    it("should create tan lines from one circle to another overlaping circle and keep side 2 and outsides of circles", () => {
        checkConstraintTanLinesOnTwoOverlapingCircles(
            Inputs.OCCT.positionResultEnum.keepSide2,
            Inputs.OCCT.twoCircleInclusionEnum.outside,
            4,
            [7.085751793882178, 0.7999999999999999, 0.7999999999999999, 1.8545904360032246]
        );
    });

    it("should create tan lines from one circle to another overlaping circle and return no solutions for keep side 1", () => {
        checkConstraintTanLinesOnTwoOverlapingCircles(
            Inputs.OCCT.positionResultEnum.keepSide1,
            Inputs.OCCT.twoCircleInclusionEnum.outside,
            0,
            []
        );
    });

    it("should create tan lines from one circle to another overlaping circle and keep side 2 and insides of circles", () => {
        checkConstraintTanLinesOnTwoOverlapingCircles(
            Inputs.OCCT.positionResultEnum.keepSide2,
            Inputs.OCCT.twoCircleInclusionEnum.inside,
            4,
            [2.967344697605159, 0.7999999999999999, 0.7999999999999999, 4.428594871176362]
        );
    });

    it("should create tan lines from one circle to another overlaping circle and keep side 2 and inside and outside of circles", () => {
        checkConstraintTanLinesOnTwoOverlapingCircles(
            Inputs.OCCT.positionResultEnum.keepSide2,
            Inputs.OCCT.twoCircleInclusionEnum.insideOutside,
            4,
            [2.967344697605159, 0.7999999999999999, 0.7999999999999999, 1.8545904360032246]
        );
    });

    it("should create tan lines from one circle to another overlaping circle and keep side 2 and outside and inside of circles", () => {
        checkConstraintTanLinesOnTwoOverlapingCircles(
            Inputs.OCCT.positionResultEnum.keepSide2,
            Inputs.OCCT.twoCircleInclusionEnum.outsideInside,
            4,
            [7.085751793882178, 0.7999999999999999, 0.7999999999999999, 4.428594871176362]
        );
    });

    const checkConstraintTanLinesOnTwoOverlapingCircles = (pos: Inputs.OCCT.positionResultEnum, cirsRem: Inputs.OCCT.twoCircleInclusionEnum, lengthExp: number, lengthsExp: number[]) => {
        const circle1 = edge.createCircleEdge({ radius: 1.6, center: [0, 0, 0], direction: [0, 1, 0] });
        const circle2 = edge.createCircleEdge({ radius: 1, center: [1, 0, 0], direction: [0, 1, 0] });
        const edges = edge.constraintTanLinesOnTwoCircles({
            circle1,
            circle2,
            positionResult: pos,
            circleRemainders: cirsRem,
            tolerance: 1e-7
        });
        expect(edges.length).toBe(lengthExp);
        const lengths = edges.map(e => edge.getEdgeLength({ shape: e }));
        expect(lengths).toEqual(lengthsExp);
        circle1.delete();
        circle2.delete();
        edges.forEach(e => e.delete());
    };

    it("should create tan lines from one circle to another non overlaping circle and return all solutions for lines and none of circles", () => {
        checkConstraintTanLinesOnTwoNotOverlapingCircles(
            Inputs.OCCT.positionResultEnum.all,
            Inputs.OCCT.twoCircleInclusionEnum.none,
            4,
            [10.148891565092217, 9.746794344808965, 10.14889156509222, 9.746794344808963]
        );
    });

    it("should create tan lines from one circle to another non overlaping circle and return all solutions for lines if unrecognized enum", () => {
        checkConstraintTanLinesOnTwoNotOverlapingCircles(
            "whatever" as any,
            Inputs.OCCT.twoCircleInclusionEnum.none,
            4,
            [10.148891565092217, 9.746794344808965, 10.14889156509222, 9.746794344808963]
        );
    });

    it("should create tan lines from one circle to another non overlaping circle and return solutions for keep side 1 and outsides of circles", () => {
        checkConstraintTanLinesOnTwoNotOverlapingCircles(
            Inputs.OCCT.positionResultEnum.keepSide1,
            Inputs.OCCT.twoCircleInclusionEnum.outside,
            4,
            [3.7387754028616786, 9.746794344808965, 9.746794344808963, 7.47755080572336]
        );
    });

    it("should create tan lines from one circle to another non overlaping circle and return solutions for keep side 2 and outsides of circles", () => {
        checkConstraintTanLinesOnTwoNotOverlapingCircles(
            Inputs.OCCT.positionResultEnum.keepSide2,
            Inputs.OCCT.twoCircleInclusionEnum.outside,
            4,
            [2.9451608620359457, 10.148891565092217, 10.14889156509222, 6.676048890287283]
        );
    });

    it("should create tan lines from one circle to another non overlaping circle and return solutions for keep side 2 and insides of circles", () => {
        checkConstraintTanLinesOnTwoNotOverlapingCircles(
            Inputs.OCCT.positionResultEnum.keepSide2,
            Inputs.OCCT.twoCircleInclusionEnum.inside,
            4,
            [3.3380244451436414, 10.148891565092217, 10.14889156509222, 5.8903217240718915]
        );
    });

    it("should create tan lines from one circle to another non overlaping circle and return solutions for keep side 2 and inside and outside of circles", () => {
        checkConstraintTanLinesOnTwoNotOverlapingCircles(
            Inputs.OCCT.positionResultEnum.keepSide2,
            Inputs.OCCT.twoCircleInclusionEnum.insideOutside,
            4,
            [3.3380244451436414, 10.148891565092217, 10.14889156509222, 6.676048890287283]
        );
    });

    it("should create tan lines from one circle to another non overlaping circle and return solutions for keep side 2 and outside and inside of circles", () => {
        checkConstraintTanLinesOnTwoNotOverlapingCircles(
            Inputs.OCCT.positionResultEnum.keepSide2,
            Inputs.OCCT.twoCircleInclusionEnum.insideOutside,
            4,
            [3.3380244451436414, 10.148891565092217, 10.14889156509222, 6.676048890287283]
        );
    });


    it("should create tan lines from one circle to another non overlaping circle and return solutions for keep side 1 and insides of circles", () => {
        checkConstraintTanLinesOnTwoNotOverlapingCircles(
            Inputs.OCCT.positionResultEnum.keepSide1,
            Inputs.OCCT.twoCircleInclusionEnum.inside,
            4,
            [2.5444099043179085, 9.746794344808965, 9.746794344808963, 5.088819808635815]
        );
    });

    it("should create tan lines from one circle to another non overlaping circle and return solutions for keep side 1 and inside and outside of circles", () => {
        checkConstraintTanLinesOnTwoNotOverlapingCircles(
            Inputs.OCCT.positionResultEnum.keepSide1,
            Inputs.OCCT.twoCircleInclusionEnum.insideOutside,
            4,
            [2.5444099043179085, 9.746794344808965, 9.746794344808963, 7.47755080572336]
        );
    });

    it("should create tan lines from one circle to another non overlaping circle and return solutions for keep side 1 and outside and inside of circles", () => {
        checkConstraintTanLinesOnTwoNotOverlapingCircles(
            Inputs.OCCT.positionResultEnum.keepSide1,
            Inputs.OCCT.twoCircleInclusionEnum.outsideInside,
            4,
            [3.7387754028616786, 9.746794344808965, 9.746794344808963, 5.088819808635815]
        );
    });

    const checkConstraintTanLinesOnTwoNotOverlapingCircles = (pos: Inputs.OCCT.positionResultEnum, cirsRem: Inputs.OCCT.twoCircleInclusionEnum, lengthExp: number, lengthsExp: number[]) => {
        const circle1 = edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const circle2 = edge.createCircleEdge({ radius: 2, center: [2, 0, 10], direction: [0, 1, 0] });
        const edges = edge.constraintTanLinesOnTwoCircles({
            circle1,
            circle2,
            positionResult: pos,
            circleRemainders: cirsRem,
            tolerance: 1e-7
        });
        expect(edges.length).toBe(lengthExp);
        const lengths = edges.map(e => edge.getEdgeLength({ shape: e }));
        expect(lengths).toEqual(lengthsExp);
        circle1.delete();
        circle2.delete();
        edges.forEach(e => e.delete());
    };

    it("should create tan circles from one circle to another non overlaping circle and return 2 solutions in case radius only reaches enough", () => {
        checkConstraintTanCirclesOnTwoNotOverlapingCircles(
            4,
            2,
            [25.13274122871835, 25.13274122871835],
            [
                [2.9060073031642, 0, 4.068798539367161],
                [-1.1175457647026619, 0, 4.8735091529405326]
            ]
        );
    });

    it("should create tan circles from one circle to another non overlaping circle and return 4 solutions in case radius reaches enough", () => {
        checkConstraintTanCirclesOnTwoNotOverlapingCircles(
            5,
            4,
            [31.41592653589793, 31.41592653589793, 31.41592653589793, 31.41592653589793],
            [
                [2.614762624750974, 0, 3.0270474750498058],
                [-1.2493780093663585, 0, 3.799875601873272],
                [4.808797098908968, 0, 3.5882405802182076],
                [-3.0587970989089683, 0, 5.161759419781794],
            ]
        );
    });

    const checkConstraintTanCirclesOnTwoNotOverlapingCircles = (radius: number, lengthExp: number, lengthsExp: number[], centersExp: Inputs.Base.Point3[]) => {
        const circle1 = edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const circle2 = edge.createCircleEdge({ radius: 2, center: [2, 0, 10], direction: [0, 1, 0] });
        const edges = edge.constraintTanCirclesOnTwoCircles({
            circle1,
            circle2,
            radius,
            tolerance: 1e-7
        });
        expect(edges.length).toBe(lengthExp);
        const lengths = edges.map(e => edge.getEdgeLength({ shape: e }));
        const centers = edges.map(e => edge.getCircularEdgeCenterPoint({ shape: e }));
        expect(lengths).toEqual(lengthsExp);
        expect(centers).toEqual(centersExp);
        circle1.delete();
        circle2.delete();
        edges.forEach(e => e.delete());
    };

    it("should create tan circles from one circle to another overlaping circle and return 8 solutions in case radius is small enough", () => {
        checkConstraintTanCirclesOnTwoOverlapingCircles(
            0.05,
            8,
            [0.3141592653589793, 0.3141592653589793, 0.3141592653589793, 0.3141592653589793, 0.3141592653589793, 0.3141592653589793, 0.3141592653589793, 0.3141592653589793],
            [
                [0.8280264491643186, 0, 0.4656953934540581],
                [0.1719735508356814, 0, 0.9343046065459418],
                [0.8804390224883223, 0, 0.3568292696511984],
                [0.051993409944110114, 0, 0.9485761357542071],
                [0.9480065900558897, 0, 0.4514238642457931],
                [0.11956097751167805, 0, 1.0431707303488016],
                [0.9899324277732429, 0, 0.35004826587625504],
                [0.010067572226757193, 0, 1.049951734123745],
            ]
        );
    });

    it("should create tan circles from one circle to another overlaping circle and return 6 solutions in case radius is larger", () => {
        checkConstraintTanCirclesOnTwoOverlapingCircles(
            0.2,
            6,
            [1.2566370614359172, 1.2566370614359172, 1.2566370614359172, 1.2566370614359172, 1.2566370614359172, 1.2566370614359172],
            [
                [0.7684191974430021, 0, 0.22255771611214142],
                [-0.03868946771327236, 0, 0.7990639055094804],
                [1.0386894677132723, 0, 0.6009360944905199],
                [0.2315808025569982, 0, 1.1774422838878587],
                [1.1808182676114922, 0, 0.21370123742036295],
                [-0.180818267611492, 0, 1.1862987625796375]
            ]
        );
    });

    it("should create tan circles from one circle to another overlaping circle and return 4 solutions in case radius is very large", () => {
        checkConstraintTanCirclesOnTwoOverlapingCircles(
            3,
            4,
            [18.84955592153876, 18.84955592153876, 18.84955592153876, 18.84955592153876],
            [
                [1.969234034675432, 0, -0.349452881911023],
                [-0.969234034675432, 0, 1.7494528819110229],
                [3.678772498087051, 0, -1.5705517843478938],
                [-2.678772498087051, 0, 2.970551784347894],
            ]
        );
    });

    const checkConstraintTanCirclesOnTwoOverlapingCircles = (radius: number, lengthExp: number, lengthsExp: number[], centersExp: Inputs.Base.Point3[]) => {
        const circle1 = edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const circle2 = edge.createCircleEdge({ radius: 1, center: [1, 0, 1.4], direction: [0, 1, 0] });
        const edges = edge.constraintTanCirclesOnTwoCircles({
            circle1,
            circle2,
            radius,
            tolerance: 1e-7
        });
        expect(edges.length).toBe(lengthExp);
        const lengths = edges.map(e => edge.getEdgeLength({ shape: e }));
        const centers = edges.map(e => edge.getCircularEdgeCenterPoint({ shape: e }));
        expect(lengths).toEqual(lengthsExp);
        expect(centers).toEqual(centersExp);
        circle1.delete();
        circle2.delete();
        edges.forEach(e => e.delete());
    };

    it("should create tan circles from one circle to another non overlaping inside circle and return no solutions", () => {
        checkConstraintTanCirclesOnTwoNonOverlapingCirclesInsideEachOther(
            0.3,
            0,
            [],
            []
        );
    });

    const checkConstraintTanCirclesOnTwoNonOverlapingCirclesInsideEachOther = (radius: number, lengthExp: number, lengthsExp: number[], centersExp: Inputs.Base.Point3[]) => {
        const circle1 = edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const circle2 = edge.createCircleEdge({ radius: 0.5, center: [0, 0, 0], direction: [0, 1, 0] });
        const edges = edge.constraintTanCirclesOnTwoCircles({
            circle1,
            circle2,
            radius,
            tolerance: 1e-7
        });
        expect(edges.length).toBe(lengthExp);
        const lengths = edges.map(e => edge.getEdgeLength({ shape: e }));
        const centers = edges.map(e => edge.getCircularEdgeCenterPoint({ shape: e }));
        expect(lengths).toEqual(lengthsExp);
        expect(centers).toEqual(centersExp);
        circle1.delete();
        circle2.delete();
        edges.forEach(e => e.delete());
    };

    it("should create tan circles from one circle and a point outside it and return solutions", () => {
        checkConstraintTanCirclesOnCircleAndPnt(
            4,
            4,
            [25.13274122871835, 25.13274122871835, 25.13274122871835, 25.13274122871835],
            [
                [-0.9963733805414999, 0, -2.8297067138748333],
                [2.8297067138748333, 0, 0.9963733805414999],
                [-0.47717802865892844, 0, -4.97717802865893],
                [4.97717802865893, 0, 0.47717802865892844]
            ]
        );
    });

    it("should create tan circles from one circle and a point outside it and return 2 solutions for mid range radius", () => {
        checkConstraintTanCirclesOnCircleAndPnt(
            2,
            2,
            [12.566370614359174, 12.566370614359174],
            [
                [1.007607323780357, 0, -2.8257260095529766],
                [2.8257260095529766, 0, -1.007607323780357],
            ]
        );
    });

    it("should not create tan circles from one circle and a point outside it if radius too small", () => {
        checkConstraintTanCirclesOnCircleAndPnt(
            0.5,
            0,
            [],
            []
        );
    });

    const checkConstraintTanCirclesOnCircleAndPnt = (radius: number, lengthExp: number, lengthsExp: number[], centersExp: Inputs.Base.Point3[]) => {
        const circle = edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const point = [3, 0, -3] as Inputs.Base.Point3;
        const edges = edge.constraintTanCirclesOnCircleAndPnt({
            circle,
            point,
            radius,
            tolerance: 1e-7
        });
        expect(edges.length).toBe(lengthExp);
        const lengths = edges.map(e => edge.getEdgeLength({ shape: e }));
        const centers = edges.map(e => edge.getCircularEdgeCenterPoint({ shape: e }));
        expect(lengths).toEqual(lengthsExp);
        expect(centers).toEqual(centersExp);
        circle.delete();
        edges.forEach(e => e.delete());
    };
});
