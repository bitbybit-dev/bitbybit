import { VectorHelperService } from "../../../../../lib/api/vector-helper.service";
import { ShapesHelperService } from "../../../../../lib/api/shapes-helper.service";
import initOpenCascade, { OpenCascadeInstance } from "../../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTEdge } from "./edge";
import { OccHelper } from "../../occ-helper";
import { OCCTGeom } from "../geom/geom";

describe('OCCT edge unit tests', () => {
    let edge: OCCTEdge;
    let geom: OCCTGeom;
    let occHelper: OccHelper

    const closeToNr = 8;

    beforeAll(async () => {
        const occt: OpenCascadeInstance = await (initOpenCascade as any).default();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        geom = new OCCTGeom(occt, occHelper);
        edge = new OCCTEdge(occt, occHelper);
    });

    it('should create a circle edge of the right radius and it will mach the length', async () => {
        const e = edge.createCircleEdge({ radius: 10, center: [0, 0, 0], direction: [0, 0, 1] });
        const length = edge.getEdgeLength({ shape: e });
        expect(length.result).toEqual(62.83185307179586);
    });

    it('should create a circle edge and the point on it will be at specific location', async () => {
        const e = edge.createCircleEdge({ radius: 1, center: [0, 1, 0], direction: [1, 1, 0] });
        const point = edge.pointOnEdgeAtParam({ shape: e, param: 0.5 });
        const x = point.result[0];
        const y = point.result[1];
        const z = point.result[2];
        expect(x).toBeCloseTo(-0.7071067811865476, closeToNr);
        expect(y).toBeCloseTo(1.7071067811865475, closeToNr);
        expect(z).toBeCloseTo(0, closeToNr);
    });

    it('should create an edge line between two points', async () => {
        const e = edge.line({ start: [-1, -1, -1], end: [1, 1, 1] });
        const length = edge.getEdgeLength({ shape: e });
        expect(length.result).toEqual(3.4641016151377544);
    })

    it('should create an edge line between two points and the point on it will be at specific location', async () => {
        const e = edge.line({ start: [-1, -1, -1], end: [1, 1, 1] });
        const point = edge.pointOnEdgeAtParam({ shape: e, param: 0.5 });
        const x = point.result[0];
        const y = point.result[1];
        const z = point.result[2];
        expect(x).toBeCloseTo(0, closeToNr);
        expect(y).toBeCloseTo(0, closeToNr);
        expect(z).toBeCloseTo(0, closeToNr);
    });

    it('should create an arc edge between three points and the length will be correct', async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const length = edge.getEdgeLength({ shape: e });
        expect(length.result).toEqual(4.05306515313624);
    });

    it('should make edge from geom 2d curve and surface', async () => {
        const elipse2d = geom.curves.geom2dEllipse({ radiusMinor: 1, radiusMajor: 2, center: [0, 0], direction: [0, 1], sense: true });
        const cylinderSrf = geom.surfaces.cylindricalSurface({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });

        const e = edge.makeEdgeFromGeom2dCurveAndSurface({
            shapes: [elipse2d, cylinderSrf]
        })
        const length = edge.getEdgeLength({ shape: e });
        expect(length.result).toEqual(12.566370614359172);
    });

    it('should make ellipse edge', async () => {
        const e = edge.createEllipseEdge({ radiusMinor: 2, radiusMajor: 3, center: [0, 0, 0], direction: [0, 0, 1] });
        const length = edge.getEdgeLength({ shape: e });
        expect(length.result).toEqual(15.869698772210649);
    });

    it('should not make ellipse edge when minor radius is larger than major radius', async () => {
        expect(() =>
            edge.createEllipseEdge({ radiusMinor: 3, radiusMajor: 2, center: [0, 0, 0], direction: [0, 0, 1] })
        ).toThrowError('Ellipse could not be created.');
    });

    it('should be able to get an edge from solid shape', async () => {
        const box = occHelper.bRepPrimAPIMakeBox(10, 10, 10, [0, 0, 0]);
        const e = edge.getEdge({ shape: box, index: 1 });
        const length = edge.getEdgeLength({ shape: e });
        expect(length.result).toEqual(10);
    });

    it('should not be able to get an edge from solid shape with undefined index', async () => {
        const box = occHelper.bRepPrimAPIMakeBox(10, 10, 10, [0, 0, 0]);
        expect(() =>
            edge.getEdge({ shape: box, index: 0 })
        ).toThrowError('Edge can not be found for shape on index 0');
    });

    it('should be not able to get an edge from solid shape with undefined index', async () => {
        const box = occHelper.bRepPrimAPIMakeBox(10, 10, 10, [0, 0, 0]);
        expect(() =>
            edge.getEdge({ shape: box, index: 13 })
        ).toThrowError('Edge can not be found for shape on index 13');
    });

    it('should not be able to get an edge if shape is not provided', async () => {
        expect(() =>
            edge.getEdge({ shape: undefined, index: 1 })
        ).toThrowError('Edge can not be found for shape that is not provided or is of incorrect type');
    });

    it('should not remove internal edges if there are none', async () => {
        const box = occHelper.bRepPrimAPIMakeBox(10, 10, 10, [0, 0, 0]);
        const boxEdges = edge.getEdges({ shape: box });
        const shapeWithoutEdges = edge.removeInternalEdges({ shape: box });
        const removedBoxEdges = edge.getEdges({ shape: shapeWithoutEdges });
        expect(boxEdges.length).toBe(removedBoxEdges.length);
    });

    it('should get a point on edge at param', async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const pt = edge.pointOnEdgeAtParam({ shape: e, param: 0.25 });
        expect(pt.result).toEqual([-0.8321107509656731, -0.02482724898439559, -0.8321107509656731]);
    });

    it('should get a tangent on edge at param', async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const pt = edge.tangentOnEdgeAtParam({ shape: e, param: 0.25 });
        expect(pt.result).toEqual([0.6895512650714751, 1.8838890905986638, 0.6895512650714751]);
    });

    it('should get a start point on edge', async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const pt = edge.startPointOnEdge({ shape: e });
        const x = pt.result[0];
        const y = pt.result[1];
        const z = pt.result[2];

        expect(x).toBeCloseTo(-1, closeToNr);
        expect(y).toBeCloseTo(-1, closeToNr);
        expect(z).toBeCloseTo(-1, closeToNr);
    });

    it('should get an end point on edge', async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const pt = edge.endPointOnEdge({ shape: e });
        const x = pt.result[0];
        const y = pt.result[1];
        const z = pt.result[2];

        expect(x).toBeCloseTo(1, closeToNr);
        expect(y).toBeCloseTo(1, closeToNr);
        expect(z).toBeCloseTo(1, closeToNr);
    });

    it('should get a point on the edge at length', async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const pt = edge.pointOnEdgeAtLength({ shape: e, length: 0 });
        const x = pt.result[0];
        const y = pt.result[1];
        const z = pt.result[2];

        expect(x).toBeCloseTo(-1, closeToNr);
        expect(y).toBeCloseTo(-1, closeToNr);
        expect(z).toBeCloseTo(-1, closeToNr);
    });

    it('should get a point on the edge at length', async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const pt = edge.pointOnEdgeAtLength({ shape: e, length: 0.1 });
        const x = pt.result[0];
        const y = pt.result[1];
        const z = pt.result[2];
        expect(x).toBeCloseTo(-0.9983336419524473, closeToNr);
        expect(y).toBeCloseTo(-0.9000370329220284, closeToNr);
        expect(z).toBeCloseTo(-0.9983336419524473, closeToNr);
    });

    it('should get a point on the edge at length', async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const pt = edge.pointOnEdgeAtLength({ shape: e, length: 0.7 });
        const x = pt.result[0];
        const y = pt.result[1];
        const z = pt.result[2];
        expect(x).toBeCloseTo(-0.9190716982049705, closeToNr);
        expect(y).toBeCloseTo(-0.3126347181393845, closeToNr);
        expect(z).toBeCloseTo(-0.9190716982049705, closeToNr);
    });

    it('should get a point on the edge at length', async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const edgeLength = edge.getEdgeLength({ shape: e });
        const pt = edge.pointOnEdgeAtLength({ shape: e, length: edgeLength.result });
        const x = pt.result[0];
        const y = pt.result[1];
        const z = pt.result[2];
        expect(x).toBeCloseTo(1, closeToNr);
        expect(y).toBeCloseTo(1, closeToNr);
        expect(z).toBeCloseTo(1, closeToNr);
    });

    it('should get a tangent on the arc edge at length', async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const pt = edge.tangentOnEdgeAtLength({ shape: e, length: 0.1 });
        const x = pt.result[0];
        const y = pt.result[1];
        const z = pt.result[2];
        expect(x).toBeCloseTo(0.1350521394892781, closeToNr);
        expect(y).toBeCloseTo(4.048562581312783, closeToNr);
        expect(z).toBeCloseTo(0.1350521394892781, closeToNr);
    });

    it('should get a tangent on the circle edge at length', async () => {
        const e = edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const pt = edge.tangentOnEdgeAtLength({ shape: e, length: Math.PI });
        const x = pt.result[0];
        const y = pt.result[1];
        const z = pt.result[2];
        expect(x).toBeCloseTo(-6.283185307179586, closeToNr);
        expect(y).toBeCloseTo(0, closeToNr);
        expect(z).toBeCloseTo(0, closeToNr);
    });

    it('should divide the edge by params to points', async () => {
        const e = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const pt = edge.divideEdgeByParamsToPoints({ shape: e, nrOfDivisions: 10, removeEndPoint: false, removeStartPoint: false });
        const points = pt.result;
        expect(points.length).toBe(11);
        expect(points[0][0]).toBeCloseTo(points[10][0], closeToNr);
        expect(points[0][1]).toBeCloseTo(points[10][1], closeToNr);
        expect(points[0][2]).toBeCloseTo(points[10][2], closeToNr);
    });

    it('should divide the edge by params to points', async () => {
        const e = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const pt = edge.divideEdgeByParamsToPoints({ shape: e, nrOfDivisions: 10, removeEndPoint: false, removeStartPoint: false });
        const points = pt.result;
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
        ])
    });

    it('should divide the edge by params to points and remove start and end points', async () => {
        const e = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const pt = edge.divideEdgeByParamsToPoints({ shape: e, nrOfDivisions: 10, removeEndPoint: true, removeStartPoint: true });
        const points = pt.result;
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
        ])
    });

    it('should divide the edge by params to points and remove end point', async () => {
        const e = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const pt = edge.divideEdgeByParamsToPoints({ shape: e, nrOfDivisions: 10, removeEndPoint: true, removeStartPoint: false });
        const points = pt.result;
        expect(points.length).toBe(10);
        expect(points[0][0]).not.toBeCloseTo(points[9][0], closeToNr);
        expect(points[0][1]).toBeCloseTo(points[9][1], closeToNr);
        expect(points[0][2]).not.toBeCloseTo(points[9][2], closeToNr);
    });

    it('should divide the edge by equal length to points', async () => {
        const e = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const pt = edge.divideEdgeByEqualDistanceToPoints({ shape: e, nrOfDivisions: 10, removeEndPoint: false, removeStartPoint: false });
        const points = pt.result;
        expect(points.length).toBe(11);
        expect(points[0][0]).toBeCloseTo(points[10][0], closeToNr);
        expect(points[0][1]).toBeCloseTo(points[10][1], closeToNr);
        expect(points[0][2]).toBeCloseTo(points[10][2], closeToNr);
    });


    it('should divide the edge by equal length to points', async () => {
        const e = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const pt = edge.divideEdgeByEqualDistanceToPoints({ shape: e, nrOfDivisions: 10, removeEndPoint: false, removeStartPoint: false });
        const points = pt.result;
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
    });

    it('should divide the edge by equal length to points and remove start and end points', async () => {
        const e = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const pt = edge.divideEdgeByEqualDistanceToPoints({ shape: e, nrOfDivisions: 10, removeEndPoint: true, removeStartPoint: true });
        const points = pt.result;
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
    });

    it('should get edge lengths', async () => {
        const cylinder = occHelper.bRepPrimAPIMakeCylinder([0, 0, 0], [0, 1, 0], 1, 2);
        const edges = edge.getEdges({ shape: cylinder });
        const lengths = edge.getEdgesLengths({ shapes: edges }).result;
        expect(lengths.length).toBe(3);
        expect(lengths[0]).toBe(6.283185307179586);
        expect(lengths[1]).toBe(2);
        expect(lengths[2]).toBe(6.283185307179586);
    });

    it('should get edge center of mass of a circle', async () => {
        const e = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const center = edge.getEdgeCenterOfMass({ shape: e }).result;
        expect(center[0]).toBeCloseTo(0, closeToNr);
        expect(center[1]).toBeCloseTo(0, closeToNr);
        expect(center[2]).toBeCloseTo(0, closeToNr);
    });

    it('should get edge center of mass of an arc', async () => {
        const e = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });
        const center = edge.getEdgeCenterOfMass({ shape: e }).result;
        expect(center[0]).toBeCloseTo(-0.24018055142257372, closeToNr);
        expect(center[1]).toBeCloseTo(0.4803611028451472, closeToNr);
        expect(center[2]).toBeCloseTo(-0.24018055142257372, closeToNr);
    });

    it('should get edges centers of mass of a circle', async () => {
        const e1 = edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
        const e2 = edge.arcThroughThreePoints({ start: [-1, -1, -1], middle: [0, 1, 0], end: [1, 1, 1] });

        const centers = edge.getEdgesCentersOfMass({ shapes: [e1, e2] }).result;
        expect(centers).toEqual([
            [5.551115123125783e-17, 0, 9.43689570931383e-15],
            [-0.24018055142257372, 0.4803611028451472, -0.24018055142257372]
        ]);
    });

    it('should get corner points of edges for the shape', async () => {
        const box = occHelper.bRepPrimAPIMakeBox(10, 10, 10, [0, 0, 0]);
        const corners = edge.getCornerPointsOfEdgesForShape({ shape: box }).result;
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
    });

});

