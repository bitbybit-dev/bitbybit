import initOpenCascade, { OpenCascadeInstance, TopoDS_Edge } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { OCCTShapeFix } from "./shape-fix";
import { OCCTEdge } from "./shapes/edge";
import { OCCTWire } from "./shapes/wire";


describe("OCCT shape fix unit tests", () => {
    let occt: OpenCascadeInstance;
    let edge: OCCTEdge;
    let wire: OCCTWire;
    let shapeFix: OCCTShapeFix;
    let occHelper: OccHelper;

    const getEdgeStartAndEndPoints = (e: TopoDS_Edge): { start: number[], end: number[] } => {
        const startPt = occHelper.edgesService.startPointOnEdge({ shape: e });
        const endPt = occHelper.edgesService.endPointOnEdge({ shape: e });
        return { start: startPt, end: endPt };
    };

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();

        occHelper = new OccHelper(vec, s, occt);
        wire = new OCCTWire(occt, occHelper);
        edge = new OCCTEdge(occt, occHelper);
        shapeFix = new OCCTShapeFix(occt, occHelper);
    });

    it("should do a basic shape fix", async () => {
        const edge1 = edge.line({ start: [0, 0, 0], end: [0, 0, 1] });
        const edge2 = edge.line({ start: [0, 0, 1], end: [0, 0, 1.000000000001] });
        const edge3 = edge.line({ start: [0, 0, 1.000000000001], end: [0, 0, 3] });
        const wire1 = wire.combineEdgesAndWiresIntoAWire({
            shapes: [edge1, edge2, edge3],
        });
        const edgesOriginal = edge.getEdges({ shape: wire1 });
        expect(edgesOriginal.length).toBe(3);
        const result = shapeFix.basicShapeRepair({ shape: wire1, precision: 0.0001, minTolerance: 0.0001, maxTolerance: 0.0001 });
        const edges = edge.getEdges({ shape: result });
        expect(edges.length).toBe(2);
        edge1.delete();
        edge2.delete();
        edge3.delete();
        wire1.delete();
        result.delete();
        edgesOriginal.forEach(e => e.delete());
        edges.forEach(e => e.delete());
    });

    it("should fix small edge on a wire", async () => {
        const edge1 = edge.line({ start: [0, 0, 0], end: [0, 0, 1] });
        const edge2 = edge.line({ start: [0, 0, 1], end: [0, 0, 1.000000000001] });
        const edge3 = edge.line({ start: [0, 0, 1.000000000001], end: [0, 0, 3] });
        const wire1 = wire.combineEdgesAndWiresIntoAWire({
            shapes: [edge1, edge2, edge3],
        });
        const edgesOriginal = edge.getEdges({ shape: wire1 });
        expect(edgesOriginal.length).toBe(3);
        const result = shapeFix.fixSmallEdgeOnWire({ shape: wire1, lockvtx: false, precsmall: 0.000000000001 });
        const edges = edge.getEdges({ shape: result });
        expect(edges.length).toBe(2);

        edge1.delete();
        edge2.delete();
        edge3.delete();
        wire1.delete();
        result.delete();
        edgesOriginal.forEach(e => e.delete());
        edges.forEach(e => e.delete());
    });

    it("should fix small edge on a wire with lockvtx set to true", async () => {
        const edge1 = edge.line({ start: [0, 0, 0], end: [0, 0, 1] });
        const edge2 = edge.line({ start: [0, 0, 1], end: [0, 0, 1.000000000001] });
        const edge3 = edge.line({ start: [0, 0, 1.000000000001], end: [0, 0, 3] });
        const wire1 = wire.combineEdgesAndWiresIntoAWire({
            shapes: [edge1, edge2, edge3],
        });
        const edgesOriginal = edge.getEdges({ shape: wire1 });
        expect(edgesOriginal.length).toBe(3);
        const result = shapeFix.fixSmallEdgeOnWire({ shape: wire1, lockvtx: true, precsmall: 0.000000000001 });
        const edges = edge.getEdges({ shape: result });
        expect(edges.length).toBe(2);

        edge1.delete();
        edge2.delete();
        edge3.delete();
        wire1.delete();
        result.delete();
        edgesOriginal.forEach(e => e.delete());
        edges.forEach(e => e.delete());

    });

    it("should not fix large enough edge on a wire", async () => {
        const edge1 = edge.line({ start: [0, 0, 0], end: [0, 0, 1] });
        const edge2 = edge.line({ start: [0, 0, 1], end: [0, 0, 1.0000001] });
        const edge3 = edge.line({ start: [0, 0, 1.0000001], end: [0, 0, 3] });
        const wire1 = wire.combineEdgesAndWiresIntoAWire({
            shapes: [edge1, edge2, edge3],
        });
        const edgesOriginal = edge.getEdges({ shape: wire1 });
        expect(edgesOriginal.length).toBe(3);
        const result = shapeFix.fixSmallEdgeOnWire({ shape: wire1, lockvtx: false, precsmall: 1e-7 });
        const edges = edge.getEdges({ shape: result });
        expect(edges.length).toBe(3);

        edge1.delete();
        edge2.delete();
        edge3.delete();
        wire1.delete();
        result.delete();
        edgesOriginal.forEach(e => e.delete());
        edges.forEach(e => e.delete());
    });

    it("should fix edge orientations along wire when edges have inconsistent directions", async () => {
        // Create edges where the second edge is reversed (end to start instead of start to end)
        const edge1 = edge.line({ start: [0, 0, 0], end: [1, 0, 0] });
        // This edge goes backwards - from [2,0,0] to [1,0,0] instead of [1,0,0] to [2,0,0]
        const edge2 = edge.line({ start: [2, 0, 0], end: [1, 0, 0] });
        const edge3 = edge.line({ start: [2, 0, 0], end: [3, 0, 0] });

        const wire1 = wire.combineEdgesAndWiresIntoAWire({
            shapes: [edge1, edge2, edge3],
        });

        const result = shapeFix.fixEdgeOrientationsAlongWire({ shape: wire1 });

        // Get edges from the fixed wire
        const fixedEdges = edge.getEdges({ shape: result });
        expect(fixedEdges.length).toBe(3);

        // Check that edges are now properly oriented along the wire
        const edge1Points = getEdgeStartAndEndPoints(fixedEdges[0]);
        const edge2Points = getEdgeStartAndEndPoints(fixedEdges[1]);
        const edge3Points = getEdgeStartAndEndPoints(fixedEdges[2]);

        // Each edge's end should connect to the next edge's start
        expect(edge1Points.end[0]).toBeCloseTo(edge2Points.start[0], 5);
        expect(edge1Points.end[1]).toBeCloseTo(edge2Points.start[1], 5);
        expect(edge1Points.end[2]).toBeCloseTo(edge2Points.start[2], 5);

        expect(edge2Points.end[0]).toBeCloseTo(edge3Points.start[0], 5);
        expect(edge2Points.end[1]).toBeCloseTo(edge3Points.start[1], 5);
        expect(edge2Points.end[2]).toBeCloseTo(edge3Points.start[2], 5);

        edge1.delete();
        edge2.delete();
        edge3.delete();
        wire1.delete();
        result.delete();
        fixedEdges.forEach(e => e.delete());
    });

    it("should preserve wire when edges already have correct orientations", async () => {
        // Create properly oriented edges
        const edge1 = edge.line({ start: [0, 0, 0], end: [1, 0, 0] });
        const edge2 = edge.line({ start: [1, 0, 0], end: [2, 0, 0] });
        const edge3 = edge.line({ start: [2, 0, 0], end: [3, 0, 0] });

        const wire1 = wire.combineEdgesAndWiresIntoAWire({
            shapes: [edge1, edge2, edge3],
        });

        const result = shapeFix.fixEdgeOrientationsAlongWire({ shape: wire1 });

        const fixedEdges = edge.getEdges({ shape: result });
        expect(fixedEdges.length).toBe(3);

        // Verify edges maintain correct orientation
        const edge1Points = getEdgeStartAndEndPoints(fixedEdges[0]);
        const edge2Points = getEdgeStartAndEndPoints(fixedEdges[1]);
        const edge3Points = getEdgeStartAndEndPoints(fixedEdges[2]);

        expect(edge1Points.start).toEqual([0, 0, 0]);
        expect(edge1Points.end).toEqual([1, 0, 0]);
        expect(edge2Points.start).toEqual([1, 0, 0]);
        expect(edge2Points.end).toEqual([2, 0, 0]);
        expect(edge3Points.start).toEqual([2, 0, 0]);
        expect(edge3Points.end).toEqual([3, 0, 0]);

        edge1.delete();
        edge2.delete();
        edge3.delete();
        wire1.delete();
        result.delete();
        fixedEdges.forEach(e => e.delete());
    });

    it("should fix edge orientations in a closed wire", async () => {
        // Create a closed triangle with one reversed edge
        const edge1 = edge.line({ start: [0, 0, 0], end: [1, 0, 0] });
        // Reversed edge
        const edge2 = edge.line({ start: [0.5, 1, 0], end: [1, 0, 0] });
        const edge3 = edge.line({ start: [0.5, 1, 0], end: [0, 0, 0] });

        const wire1 = wire.combineEdgesAndWiresIntoAWire({
            shapes: [edge1, edge2, edge3],
        });

        expect(occHelper.wiresService.isWireClosed({ shape: wire1 })).toBe(true);

        const result = shapeFix.fixEdgeOrientationsAlongWire({ shape: wire1 });

        expect(occHelper.wiresService.isWireClosed({ shape: result })).toBe(true);

        const fixedEdges = edge.getEdges({ shape: result });
        expect(fixedEdges.length).toBe(3);

        // Check connectivity of fixed edges
        const edge1Points = getEdgeStartAndEndPoints(fixedEdges[0]);
        const edge2Points = getEdgeStartAndEndPoints(fixedEdges[1]);
        const edge3Points = getEdgeStartAndEndPoints(fixedEdges[2]);

        expect(edge1Points.end[0]).toBeCloseTo(edge2Points.start[0], 5);
        expect(edge1Points.end[1]).toBeCloseTo(edge2Points.start[1], 5);
        expect(edge2Points.end[0]).toBeCloseTo(edge3Points.start[0], 5);
        expect(edge2Points.end[1]).toBeCloseTo(edge3Points.start[1], 5);
        expect(edge3Points.end[0]).toBeCloseTo(edge1Points.start[0], 5);
        expect(edge3Points.end[1]).toBeCloseTo(edge1Points.start[1], 5);

        edge1.delete();
        edge2.delete();
        edge3.delete();
        wire1.delete();
        result.delete();
        fixedEdges.forEach(e => e.delete());
    });

    it("should fix edge orientations with arc edges", async () => {
        const edge1 = edge.line({ start: [0, 0, 0], end: [1, 0, 0] });
        // Arc going backwards
        const arcEdge = edge.arcThroughThreePoints({ start: [2, 0, 0], middle: [1.5, 0.5, 0], end: [1, 0, 0] });
        const edge3 = edge.line({ start: [2, 0, 0], end: [3, 0, 0] });

        const wire1 = wire.combineEdgesAndWiresIntoAWire({
            shapes: [edge1, arcEdge, edge3],
        });

        const result = shapeFix.fixEdgeOrientationsAlongWire({ shape: wire1 });

        const fixedEdges = edge.getEdges({ shape: result });
        expect(fixedEdges.length).toBe(3);

        // Check that edges are connected properly
        const edge1Points = getEdgeStartAndEndPoints(fixedEdges[0]);
        const edge2Points = getEdgeStartAndEndPoints(fixedEdges[1]);
        const edge3Points = getEdgeStartAndEndPoints(fixedEdges[2]);

        expect(edge1Points.end[0]).toBeCloseTo(edge2Points.start[0], 5);
        expect(edge2Points.end[0]).toBeCloseTo(edge3Points.start[0], 5);

        edge1.delete();
        arcEdge.delete();
        edge3.delete();
        wire1.delete();
        result.delete();
        fixedEdges.forEach(e => e.delete());
    });

    it("should handle a single edge wire", async () => {
        const edge1 = edge.line({ start: [0, 0, 0], end: [1, 0, 0] });

        const wire1 = wire.combineEdgesAndWiresIntoAWire({
            shapes: [edge1],
        });

        const result = shapeFix.fixEdgeOrientationsAlongWire({ shape: wire1 });

        const fixedEdges = edge.getEdges({ shape: result });
        expect(fixedEdges.length).toBe(1);

        const edgePoints = getEdgeStartAndEndPoints(fixedEdges[0]);
        expect(edgePoints.start).toEqual([0, 0, 0]);
        expect(edgePoints.end).toEqual([1, 0, 0]);

        edge1.delete();
        wire1.delete();
        result.delete();
        fixedEdges.forEach(e => e.delete());
    });
});

