import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Edge, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTWire, OCCTEdge } from "../shapes";
import { DxfService } from "./dxf.service";
import * as Inputs from "../../api/inputs/inputs";

describe("DxfService unit tests", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let dxfService: DxfService;
    let wire: OCCTWire;
    let edge: OCCTEdge;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        dxfService = occHelper.dxfService;
        wire = new OCCTWire(occt, occHelper);
        edge = new OCCTEdge(occt, occHelper);
    });

    describe("tryCreatePolylineWithBulges", () => {
        // Helper to access private method
        const callTryCreatePolylineWithBulges = (
            service: DxfService,
            edges: TopoDS_Edge[],
            startIndex: number,
            shouldBeClosed: boolean
        ) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (service as any).tryCreatePolylineWithBulges(edges, startIndex, shouldBeClosed);
        };

        it("should return null for a single linear edge", () => {
            const lineEdge = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [10, 0, 0] });
            const edges = [lineEdge];

            const result = callTryCreatePolylineWithBulges(dxfService, edges, 0, false);

            // Returns null because we need at least 2 edges
            expect(result).toBeNull();

            lineEdge.delete();
        });

        it("should return null for a full circle edge", () => {
            const circleEdge = edge.createCircleEdge({
                radius: 5,
                center: [0, 0, 0],
                direction: [0, 1, 0]
            });
            const edges = [circleEdge];

            const result = callTryCreatePolylineWithBulges(dxfService, edges, 0, false);

            // Full circles are handled separately
            expect(result).toBeNull();

            circleEdge.delete();
        });

        it("should create a polyline from two consecutive linear edges", () => {
            const edge1 = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [10, 0, 0] });
            const edge2 = occHelper.edgesService.lineEdge({ start: [10, 0, 0], end: [10, 0, 10] });
            const edges = [edge1, edge2];

            const result = callTryCreatePolylineWithBulges(dxfService, edges, 0, false);

            expect(result).not.toBeNull();
            expect(result.nextIndex).toBe(2);
            expect(result.polyline.points.length).toBe(3); // Start + mid + end
            expect(result.polyline.closed).toBe(false);
            
            // All bulges should be 0 for linear edges
            result.polyline.bulges.forEach((bulge: number) => {
                expect(bulge).toBe(0);
            });

            edge1.delete();
            edge2.delete();
        });

        it("should create a polyline from two consecutive linear edges with closed flag", () => {
            const edge1 = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [10, 0, 0] });
            const edge2 = occHelper.edgesService.lineEdge({ start: [10, 0, 0], end: [0, 0, 0] });
            const edges = [edge1, edge2];

            const result = callTryCreatePolylineWithBulges(dxfService, edges, 0, true);

            expect(result).not.toBeNull();
            expect(result.polyline.closed).toBe(true);
            expect(result.polyline.points.length).toBe(3);

            edge1.delete();
            edge2.delete();
        });

        it("should create a polyline with non-zero bulges for arc edges", () => {
            const lineEdge = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [10, 0, 0] });
            const arcEdge = occHelper.edgesService.arcThroughThreePoints({
                start: [10, 0, 0],
                middle: [12, 0, 5],
                end: [10, 0, 10]
            });
            const edges = [lineEdge, arcEdge];

            const result = callTryCreatePolylineWithBulges(dxfService, edges, 0, false);

            expect(result).not.toBeNull();
            expect(result.nextIndex).toBe(2);
            expect(result.polyline.points.length).toBe(3);
            
            // First bulge should be 0 (line), second should be non-zero (arc)
            expect(result.polyline.bulges[0]).toBe(0);
            expect(Math.abs(result.polyline.bulges[1])).toBeCloseTo(0.399999999);

            lineEdge.delete();
            arcEdge.delete();
        });

        it("should stop at complex edge", () => {
            const lineEdge1 = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [5, 0, 0] });
            const lineEdge2 = occHelper.edgesService.lineEdge({ start: [5, 0, 0], end: [10, 0, 0] });
            
            // Create a bezier/spline edge (complex edge)
            const bezierWire = wire.interpolatePoints({
                points: [[10, 0, 0], [12, 0, 3], [15, 0, 5]] as Inputs.Base.Point3[],
                periodic: false,
                tolerance: 0.0001
            });
            const bezierEdges = occHelper.edgesService.getEdgesAlongWire({ shape: bezierWire });
            
            const lineEdge3 = occHelper.edgesService.lineEdge({ start: [15, 0, 5], end: [20, 0, 5] });
            
            const edges = [lineEdge1, lineEdge2, ...bezierEdges, lineEdge3];

            const result = callTryCreatePolylineWithBulges(dxfService, edges, 0, false);

            expect(result).not.toBeNull();
            // Should stop at the complex bezier edge
            expect(result.nextIndex).toBe(2);
            expect(result.polyline.points.length).toBe(3);

            lineEdge1.delete();
            lineEdge2.delete();
            bezierWire.delete();
            lineEdge3.delete();
        });

        it("should return null when starting with a complex edge", () => {
            const bezierWire = wire.interpolatePoints({
                points: [[0, 0, 0], [5, 0, 3], [10, 0, 0]] as Inputs.Base.Point3[],
                periodic: false,
                tolerance: 0.0001
            });
            const bezierEdges = occHelper.edgesService.getEdgesAlongWire({ shape: bezierWire });

            const result = callTryCreatePolylineWithBulges(dxfService, bezierEdges, 0, false);

            // Complex edge at start should return null
            expect(result).toBeNull();

            bezierWire.delete();
        });

        it("should handle starting from a middle index", () => {
            const edge1 = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [5, 0, 0] });
            const edge2 = occHelper.edgesService.lineEdge({ start: [5, 0, 0], end: [10, 0, 0] });
            const edge3 = occHelper.edgesService.lineEdge({ start: [10, 0, 0], end: [15, 0, 0] });
            const edge4 = occHelper.edgesService.lineEdge({ start: [15, 0, 0], end: [20, 0, 0] });
            const edges = [edge1, edge2, edge3, edge4];

            const result = callTryCreatePolylineWithBulges(dxfService, edges, 2, false);

            expect(result).not.toBeNull();
            expect(result.nextIndex).toBe(4);
            expect(result.polyline.points.length).toBe(3); // edge3 start, edge4 start, edge4 end
            
            // First point should be start of edge3
            expect(result.polyline.points[0][0]).toBeCloseTo(10, 2); // X
            expect(result.polyline.points[0][1]).toBeCloseTo(0, 2); // Z (mapped to Y in DXF)

            edge1.delete();
            edge2.delete();
            edge3.delete();
            edge4.delete();
        });

        it("should create polyline with correct point mapping from XZ to XY", () => {
            // Points at different Z values (which become Y in DXF)
            const edge1 = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [10, 0, 5] });
            const edge2 = occHelper.edgesService.lineEdge({ start: [10, 0, 5], end: [20, 0, 10] });
            const edges = [edge1, edge2];

            const result = callTryCreatePolylineWithBulges(dxfService, edges, 0, false);

            expect(result).not.toBeNull();
            // Check X coordinates
            expect(result.polyline.points[0][0]).toBeCloseTo(0, 2);
            expect(result.polyline.points[1][0]).toBeCloseTo(10, 2);
            expect(result.polyline.points[2][0]).toBeCloseTo(20, 2);
            
            // Check Y coordinates (originally Z in 3D)
            expect(result.polyline.points[0][1]).toBeCloseTo(0, 2);
            expect(result.polyline.points[1][1]).toBeCloseTo(5, 2);
            expect(result.polyline.points[2][1]).toBeCloseTo(10, 2);

            edge1.delete();
            edge2.delete();
        });

        it("should handle mixed linear and arc edges", () => {
            const line1 = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [10, 0, 0] });
            const arc = occHelper.edgesService.arcThroughThreePoints({
                start: [10, 0, 0],
                middle: [15, 0, 5],
                end: [10, 0, 10]
            });
            const line2 = occHelper.edgesService.lineEdge({ start: [10, 0, 10], end: [0, 0, 10] });
            const edges = [line1, arc, line2];

            const result = callTryCreatePolylineWithBulges(dxfService, edges, 0, false);

            expect(result).not.toBeNull();
            expect(result.nextIndex).toBe(3);
            expect(result.polyline.points.length).toBe(4);
            
            // Check bulges: line=0, arc=non-zero, line=0, last=0
            expect(result.polyline.bulges[0]).toBe(0);
            expect(Math.abs(result.polyline.bulges[1])).toBeCloseTo(1);
            expect(result.polyline.bulges[2]).toBe(0);
            expect(result.polyline.bulges[3]).toBe(0);

            line1.delete();
            arc.delete();
            line2.delete();
        });

        it("should stop when encountering a full circle in the middle", () => {
            const line1 = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [10, 0, 0] });
            const line2 = occHelper.edgesService.lineEdge({ start: [10, 0, 0], end: [20, 0, 0] });
            const circleEdge = edge.createCircleEdge({
                radius: 3,
                center: [25, 0, 0],
                direction: [0, 1, 0]
            });
            const line3 = occHelper.edgesService.lineEdge({ start: [30, 0, 0], end: [40, 0, 0] });
            const edges = [line1, line2, circleEdge, line3];

            const result = callTryCreatePolylineWithBulges(dxfService, edges, 0, false);

            expect(result).not.toBeNull();
            // Should stop at the full circle
            expect(result.nextIndex).toBe(2);
            expect(result.polyline.points.length).toBe(3);

            line1.delete();
            line2.delete();
            circleEdge.delete();
            line3.delete();
        });

        it("should handle a closed rectangle with 4 edges", () => {
            const edge1 = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [10, 0, 0] });
            const edge2 = occHelper.edgesService.lineEdge({ start: [10, 0, 0], end: [10, 0, 5] });
            const edge3 = occHelper.edgesService.lineEdge({ start: [10, 0, 5], end: [0, 0, 5] });
            const edge4 = occHelper.edgesService.lineEdge({ start: [0, 0, 5], end: [0, 0, 0] });
            const edges = [edge1, edge2, edge3, edge4];

            const result = callTryCreatePolylineWithBulges(dxfService, edges, 0, true);

            expect(result).not.toBeNull();
            expect(result.nextIndex).toBe(4);
            expect(result.polyline.closed).toBe(true);
            expect(result.polyline.points.length).toBe(5); // 4 corners + end point
            
            // All bulges should be 0
            result.polyline.bulges.forEach((bulge: number) => {
                expect(bulge).toBe(0);
            });

            edge1.delete();
            edge2.delete();
            edge3.delete();
            edge4.delete();
        });

        it("should calculate correct bulge for a 90-degree arc", () => {
            // Create a 90-degree arc from (5, 0, 0) to (0, 0, 5) with center at origin, radius 5
            // This is a CCW 90-degree arc in the XZ plane
            const arcEdge = occHelper.edgesService.arcThroughThreePoints({
                start: [5, 0, 0],
                middle: [5 * Math.cos(Math.PI / 4), 0, 5 * Math.sin(Math.PI / 4)], // 45 degrees
                end: [0, 0, 5]
            });
            const lineEdge = occHelper.edgesService.lineEdge({ start: [0, 0, 5], end: [0, 0, 10] });
            const edges = [arcEdge, lineEdge];

            const result = callTryCreatePolylineWithBulges(dxfService, edges, 0, false);

            expect(result).not.toBeNull();
            
            // For a 90-degree arc, bulge = tan(90/4) = tan(22.5°) ≈ 0.414
            // Sign depends on arc direction
            expect(Math.abs(result.polyline.bulges[0])).toBeCloseTo(0.414, 1);

            arcEdge.delete();
            lineEdge.delete();
        });

        it("should calculate correct bulge for a 180-degree arc (semicircle)", () => {
            // Create a semicircle arc
            const arcEdge = occHelper.edgesService.arcThroughThreePoints({
                start: [0, 0, 0],
                middle: [5, 0, 5],
                end: [10, 0, 0]
            });
            const lineEdge = occHelper.edgesService.lineEdge({ start: [10, 0, 0], end: [20, 0, 0] });
            const edges = [arcEdge, lineEdge];

            const result = callTryCreatePolylineWithBulges(dxfService, edges, 0, false);

            expect(result).not.toBeNull();
            
            // For a 180-degree arc, bulge = tan(180/4) = tan(45°) = 1.0
            expect(Math.abs(result.polyline.bulges[0])).toBeCloseTo(1.0, 1);

            arcEdge.delete();
            lineEdge.delete();
        });
    });
});
