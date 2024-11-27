import initOpenCascade, { OpenCascadeInstance } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
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
});

