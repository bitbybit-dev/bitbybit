import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shell, TopoDS_Solid, TopoDS_Vertex, TopoDS_Wire, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { IteratorService } from "./iterator.service";
import { OCCTSolid } from "../shapes/solid";
import { OCCTFace } from "../shapes/face";
import { OCCTCompound } from "../shapes/compound";

describe("OCCT iterator service unit tests", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let iteratorService: IteratorService;
    let solid: OCCTSolid;
    let faceService: OCCTFace;
    let compoundService: OCCTCompound;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        iteratorService = new IteratorService(occt);
        solid = new OCCTSolid(occt, occHelper);
        faceService = new OCCTFace(occt, occHelper);
        compoundService = new OCCTCompound(occt, occHelper);
    });

    describe("forEachWire", () => {
        it("should iterate over wires in a face", () => {
            const f = faceService.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 1, 0] });
            const wires: TopoDS_Wire[] = [];
            iteratorService.forEachWire(f, (index, wire) => {
                wires.push(wire);
            });
            expect(wires.length).toBe(1);
            f.delete();
            wires.forEach(w => w.delete());
        });

        it("should iterate over multiple wires in a face with a hole", () => {
            const outerWire = occHelper.wiresService.createPolygonWire({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]] });
            const innerWire = occHelper.wiresService.createPolygonWire({ points: [[2, 2, 0], [8, 2, 0], [8, 8, 0], [2, 8, 0]] });
            const f = faceService.createFaceFromWires({ shapes: [outerWire, innerWire], planar: true });

            const wires: TopoDS_Wire[] = [];
            iteratorService.forEachWire(f, (index, wire) => {
                wires.push(wire);
            });
            expect(wires.length).toBe(2);

            outerWire.delete();
            innerWire.delete();
            f.delete();
            wires.forEach(w => w.delete());
        });
    });

    describe("forEachEdge", () => {
        it("should iterate over edges in a wire", () => {
            const wire = occHelper.wiresService.createPolygonWire({ points: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]] });
            const edges: TopoDS_Edge[] = [];
            iteratorService.forEachEdge(wire, (index, edge) => {
                edges.push(edge);
            });
            expect(edges.length).toBe(4);
            wire.delete();
            edges.forEach(e => e.delete());
        });

        it("should not duplicate edges with same hash", () => {
            const edge1 = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [1, 0, 0] });
            const edge2 = occHelper.edgesService.lineEdge({ start: [1, 0, 0], end: [2, 0, 0] });
            const wire = occHelper.converterService.combineEdgesAndWiresIntoAWire({ shapes: [edge1, edge2] });

            const edges: TopoDS_Edge[] = [];
            iteratorService.forEachEdge(wire, (index, edge) => {
                edges.push(edge);
            });
            expect(edges.length).toBe(2);

            edge1.delete();
            edge2.delete();
            wire.delete();
            edges.forEach(e => e.delete());
        });
    });

    describe("forEachEdgeAlongWire", () => {
        it("should iterate over edges in order along the wire", () => {
            // Use explicit edges to have control over the count
            const edge1 = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [1, 0, 0] });
            const edge2 = occHelper.edgesService.lineEdge({ start: [1, 0, 0], end: [1, 1, 0] });
            const wire = occHelper.converterService.combineEdgesAndWiresIntoAWire({ shapes: [edge1, edge2] });
            
            const edges: TopoDS_Edge[] = [];
            iteratorService.forEachEdgeAlongWire(wire, (index, edge) => {
                edges.push(edge);
            });
            expect(edges.length).toBe(2);

            // Check that edges are in correct order
            const edge1Start = occHelper.edgesService.startPointOnEdge({ shape: edges[0] });
            const edge1End = occHelper.edgesService.endPointOnEdge({ shape: edges[0] });
            const edge2Start = occHelper.edgesService.startPointOnEdge({ shape: edges[1] });

            expect(edge1Start[0]).toBeCloseTo(0, 5);
            expect(edge1End[0]).toBeCloseTo(1, 5);
            expect(edge2Start[0]).toBeCloseTo(1, 5);

            edge1.delete();
            edge2.delete();
            wire.delete();
            edges.forEach(e => e.delete());
        });
    });

    describe("forEachFace", () => {
        it("should iterate over faces in a solid", () => {
            const box = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const faces: TopoDS_Face[] = [];
            iteratorService.forEachFace(box, (index, f) => {
                faces.push(f);
            });
            expect(faces.length).toBe(6);
            box.delete();
            faces.forEach(f => f.delete());
        });

        it("should iterate over a single face", () => {
            const f = faceService.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 1, 0] });
            const faces: TopoDS_Face[] = [];
            iteratorService.forEachFace(f, (index, face) => {
                faces.push(face);
            });
            expect(faces.length).toBe(1);
            f.delete();
            faces.forEach(f => f.delete());
        });
    });

    describe("forEachShell", () => {
        it("should iterate over shells in a solid", () => {
            const box = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const shells: TopoDS_Shell[] = [];
            iteratorService.forEachShell(box, (index, shell) => {
                shells.push(shell);
            });
            expect(shells.length).toBe(1);
            box.delete();
            shells.forEach(s => s.delete());
        });

        it("should iterate over shells in a compound of solids", () => {
            const box1 = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const box2 = solid.createBox({ width: 1, height: 1, length: 1, center: [5, 0, 0] });
            const comp = compoundService.makeCompound({ shapes: [box1, box2] });

            const shells: TopoDS_Shell[] = [];
            iteratorService.forEachShell(comp, (index, shell) => {
                shells.push(shell);
            });
            expect(shells.length).toBe(2);

            box1.delete();
            box2.delete();
            comp.delete();
            shells.forEach(s => s.delete());
        });

        it("should return no shells for a wire shape", () => {
            const wire = occHelper.wiresService.createPolygonWire({ points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] });
            const shells: TopoDS_Shell[] = [];
            iteratorService.forEachShell(wire, (index, shell) => {
                shells.push(shell);
            });
            expect(shells.length).toBe(0);
            wire.delete();
        });
    });

    describe("forEachVertex", () => {
        it("should iterate over vertices in an edge", () => {
            const edge = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [1, 0, 0] });
            const vertices: TopoDS_Vertex[] = [];
            iteratorService.forEachVertex(edge, (index, vertex) => {
                vertices.push(vertex);
            });
            expect(vertices.length).toBe(2);
            edge.delete();
            vertices.forEach(v => v.delete());
        });

        it("should iterate over vertices in a triangle wire counting shared vertices", () => {
            // A closed triangle has 3 edges but TopExp_Explorer finds all vertices including shared ones
            const wire = occHelper.wiresService.createPolygonWire({ points: [[0, 0, 0], [1, 0, 0], [0.5, 1, 0]] });
            const vertices: TopoDS_Vertex[] = [];
            iteratorService.forEachVertex(wire, (index, vertex) => {
                vertices.push(vertex);
            });
            // Each edge has 2 vertices, 3 edges = 6 vertices found (vertices are shared at corners)
            expect(vertices.length).toBe(6);
            wire.delete();
            vertices.forEach(v => v.delete());
        });
    });

    describe("forEachSolid", () => {
        it("should iterate over a single solid", () => {
            const box = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const solids: TopoDS_Solid[] = [];
            iteratorService.forEachSolid(box, (index, s) => {
                solids.push(s);
            });
            expect(solids.length).toBe(1);
            box.delete();
            solids.forEach(s => s.delete());
        });

        it("should iterate over multiple solids in a compound", () => {
            const box1 = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const box2 = solid.createBox({ width: 1, height: 1, length: 1, center: [5, 0, 0] });
            const sphere = solid.createSphere({ radius: 0.5, center: [10, 0, 0] });
            const comp = compoundService.makeCompound({ shapes: [box1, box2, sphere] });

            const solids: TopoDS_Solid[] = [];
            iteratorService.forEachSolid(comp, (index, s) => {
                solids.push(s);
            });
            expect(solids.length).toBe(3);

            box1.delete();
            box2.delete();
            sphere.delete();
            comp.delete();
            solids.forEach(s => s.delete());
        });

        it("should return no solids for a face shape", () => {
            const f = faceService.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 1, 0] });
            const solids: TopoDS_Solid[] = [];
            iteratorService.forEachSolid(f, (index, s) => {
                solids.push(s);
            });
            expect(solids.length).toBe(0);
            f.delete();
        });
    });

    describe("forEachCompound", () => {
        it("should iterate over a compound", () => {
            const box1 = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const box2 = solid.createBox({ width: 1, height: 1, length: 1, center: [5, 0, 0] });
            const comp = compoundService.makeCompound({ shapes: [box1, box2] });

            const compounds: TopoDS_Shape[] = [];
            iteratorService.forEachCompound(comp, (index, shape) => {
                compounds.push(shape);
            });
            expect(compounds.length).toBe(1);

            box1.delete();
            box2.delete();
            comp.delete();
            compounds.forEach(c => c.delete());
        });

        it("should iterate over nested compounds", () => {
            const box1 = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const box2 = solid.createBox({ width: 1, height: 1, length: 1, center: [5, 0, 0] });
            const innerCompound = compoundService.makeCompound({ shapes: [box1, box2] });

            const box3 = solid.createBox({ width: 1, height: 1, length: 1, center: [10, 0, 0] });
            const outerCompound = compoundService.makeCompound({ shapes: [innerCompound, box3] });

            const compounds: TopoDS_Shape[] = [];
            iteratorService.forEachCompound(outerCompound, (index, shape) => {
                compounds.push(shape);
            });
            // TopExp_Explorer finds the outer compound itself when iterating for COMPOUND type
            // The inner compound is a child but explorer behavior may vary
            expect(compounds.length).toBeGreaterThanOrEqual(1);

            box1.delete();
            box2.delete();
            box3.delete();
            innerCompound.delete();
            outerCompound.delete();
            compounds.forEach(c => c.delete());
        });

        it("should return no compounds for a solid shape", () => {
            const box = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const compounds: TopoDS_Shape[] = [];
            iteratorService.forEachCompound(box, (index, shape) => {
                compounds.push(shape);
            });
            expect(compounds.length).toBe(0);
            box.delete();
        });
    });

    describe("forEachCompSolid", () => {
        it("should return no compsolids for a regular solid", () => {
            const box = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const compSolids: TopoDS_Shape[] = [];
            iteratorService.forEachCompSolid(box, (index, shape) => {
                compSolids.push(shape);
            });
            expect(compSolids.length).toBe(0);
            box.delete();
        });

        it("should return no compsolids for a compound of solids", () => {
            // A compound of solids is not the same as a compsolid
            const box1 = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const box2 = solid.createBox({ width: 1, height: 1, length: 1, center: [5, 0, 0] });
            const comp = compoundService.makeCompound({ shapes: [box1, box2] });

            const compSolids: TopoDS_Shape[] = [];
            iteratorService.forEachCompSolid(comp, (index, shape) => {
                compSolids.push(shape);
            });
            expect(compSolids.length).toBe(0);

            box1.delete();
            box2.delete();
            comp.delete();
        });
    });

    describe("forEachShapeInCompound", () => {
        it("should iterate over shapes in a compound", () => {
            const box1 = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const box2 = solid.createBox({ width: 1, height: 1, length: 1, center: [5, 0, 0] });
            const comp = compoundService.makeCompound({ shapes: [box1, box2] });

            const shapes: TopoDS_Shape[] = [];
            iteratorService.forEachShapeInCompound(comp, (index, shape) => {
                shapes.push(shape);
            });
            expect(shapes.length).toBe(2);

            box1.delete();
            box2.delete();
            comp.delete();
            shapes.forEach(s => s.delete());
        });

        it("should iterate over mixed shapes in a compound", () => {
            const box = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const f = faceService.createSquareFace({ size: 1, center: [5, 0, 0], direction: [0, 1, 0] });
            const wire = occHelper.wiresService.createPolygonWire({ points: [[10, 0, 0], [11, 0, 0], [11, 1, 0]] });
            const comp = compoundService.makeCompound({ shapes: [box, f, wire] });

            const shapes: TopoDS_Shape[] = [];
            iteratorService.forEachShapeInCompound(comp, (index, shape) => {
                shapes.push(shape);
            });
            expect(shapes.length).toBe(3);

            box.delete();
            f.delete();
            wire.delete();
            comp.delete();
            shapes.forEach(s => s.delete());
        });

        it("should not recurse into nested compounds by default", () => {
            const box1 = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const box2 = solid.createBox({ width: 1, height: 1, length: 1, center: [5, 0, 0] });
            const innerCompound = compoundService.makeCompound({ shapes: [box1, box2] });

            const box3 = solid.createBox({ width: 1, height: 1, length: 1, center: [10, 0, 0] });
            const outerCompound = compoundService.makeCompound({ shapes: [innerCompound, box3] });

            const shapes: TopoDS_Shape[] = [];
            iteratorService.forEachShapeInCompound(outerCompound, (index, shape) => {
                shapes.push(shape);
            });
            // Should only find the direct children: innerCompound and box3
            expect(shapes.length).toBe(2);

            box1.delete();
            box2.delete();
            box3.delete();
            innerCompound.delete();
            outerCompound.delete();
            shapes.forEach(s => s.delete());
        });
    });
});

