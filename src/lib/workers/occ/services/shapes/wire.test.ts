import { VectorHelperService } from "../../../../../lib/api/vector-helper.service";
import { ShapesHelperService } from "../../../../../lib/api/shapes-helper.service";
import initOpenCascade, { OpenCascadeInstance } from "../../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTEdge } from "./edge";
import { OccHelper } from "../../occ-helper";
import { OCCTGeom } from "../geom/geom";
import { OCCTWire } from "./wire";

describe('OCCT wire unit tests', () => {
    let wire: OCCTWire;
    let edge: OCCTEdge;
    let geom: OCCTGeom;
    let occHelper: OccHelper

    const closeToNr = 13;

    beforeAll(async () => {
        const occt: OpenCascadeInstance = await (initOpenCascade as any).default();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        geom = new OCCTGeom(occt, occHelper);
        edge = new OCCTEdge(occt, occHelper);
        wire = new OCCTWire(occt, occHelper);
    });

    it('should create a circle edge of the right radius and it will mach the length', async () => {
        const w = wire.createCircleWire({ radius: 3, center: [1, 0, 0], direction: [0, 1, 0] });
        const length = wire.getWireLength({ shape: w }).result;
        expect(length).toBe(18.849555921538762);
    });

    it('should create a square wire', async () => {
        const w = wire.createSquareWire({ size: 4, center: [1, 0, 0], direction: [0, 1, 0] });
        const length = wire.getWireLength({ shape: w }).result;
        expect(length).toBe(16);
    });

    it('should create an open bezier wire', async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const length = wire.getWireLength({ shape: w }).result;
        expect(length).toBe(5.72415866652804);
    });

    it('should create a closed bezier wire', async () => {
        const w = wire.createBezier({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: true });
        const length = wire.getWireLength({ shape: w }).result;
        expect(length).toBe(5.333863420641158);
    });

    it('should interpolate points', async () => {
        const w = wire.interpolatePoints({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], periodic: false, tolerance: 1e-7 });
        const length = wire.getWireLength({ shape: w }).result;
        expect(length).toBe(7.256109149279404);
    });

    it('should interpolate points into periodic bspline', async () => {
        const w = wire.interpolatePoints({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], periodic: true, tolerance: 1e-7 });
        const length = wire.getWireLength({ shape: w }).result;
        expect(length).toBe(13.782923673238976);
    });


    it('should create open bspline through points', async () => {
        const w = wire.createBSpline({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: false });
        const length = wire.getWireLength({ shape: w }).result;
        expect(length).toBe(7.064531406714803);
    });

    it('should create closed bspline through points', async () => {
        const w = wire.createBSpline({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]], closed: true });
        const length = wire.getWireLength({ shape: w }).result;
        expect(length).toBe(14.120032294676554);
    });

    it('should create a polygon wire', async () => {
        const w = wire.createPolygonWire({ points: [[0, 0, 0], [1, 1, 0], [0, 2, 5]] });
        const length = wire.getWireLength({ shape: w }).result;
        expect(length).toBe(11.99553079221423);
    });

    it('should create a star wire', async () => {
        const w = wire.createStarWire({ numRays: 9, outerRadius: 5, innerRadius: 2, center: [0, 0, 0], direction: [0, 0, 1], half: false });
        const length = wire.getWireLength({ shape: w }).result;
        const cornerPoints = edge.getCornerPointsOfEdgesForShape({ shape: w }).result;
        expect(cornerPoints.length).toBe(18);
        expect(length).toBe(57.5047112618376);
    });

    it('should create ellipse wire', async () => {
        const w = wire.createEllipseWire({ radiusMajor: 5, radiusMinor: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const length = wire.getWireLength({ shape: w }).result;
        expect(length).toBe(23.07819782619483);
    });

    it('should create rectangle wire', async () => {
        const w = wire.createRectangleWire({ width: 5, length: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const length = wire.getWireLength({ shape: w }).result;
        expect(length).toBe(14);
    });

    it('should create a parallelogram wire', async () => {
        const w = wire.createParallelogramWire({ width: 5, height: 2, center: [0, 0, 0], direction: [0, 1, 0], angle: 15, aroundCenter: true });
        const length = wire.getWireLength({ shape: w }).result;
        expect(length).toBe(14.141104721640332);
    });

    it('should create a parallelogram wire of 0 angle', async () => {
        const w = wire.createParallelogramWire({ width: 5, height: 2, center: [0, 0, 0], direction: [0, 1, 0], angle: 0, aroundCenter: true });
        const length = wire.getWireLength({ shape: w }).result;
        expect(length).toBe(14);
    });
});

