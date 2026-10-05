import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import type { BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shell, TopoDS_Solid, TopoDS_Vertex, TopoDS_Wire, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
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

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("one kernel call per walk", () => {
        const explorerWalk = (shape: TopoDS_Shape, type: typeof occt.TopAbs_ShapeEnum.EDGE): TopoDS_Shape[] => {
            const shapes: TopoDS_Shape[] = [];
            const explorer = new occt.TopExp_Explorer(shape, type, occt.TopAbs_ShapeEnum.SHAPE);
            for (; explorer.More(); explorer.Next()) {
                shapes.push(explorer.Current());
            }
            explorer.delete();
            return shapes;
        };

        it("should pass each edge of a box once, at its first visit in explorer order, though two faces share it", () => {
            // Arrange
            const box = solid.createBox({ width: 1, length: 2, height: 3, center: [0, 0, 0] });
            const firstVisits = explorerWalk(box, occt.TopAbs_ShapeEnum.EDGE).filter((edge, index, all) => all.findIndex(other => other.IsSame(edge)) === index);
            const passed: [number, TopoDS_Edge][] = [];
            const calls = vi.spyOn(occt, "EdgesOf");

            // Act
            iteratorService.forEachEdge(box, (index, edge) => passed.push([index, edge]));

            // Assert
            expect(calls).toHaveBeenCalledTimes(1);
            expect(passed.map(([index]) => index)).toEqual([...Array(12).keys()]);
            expect(passed.map(([, edge], index) => edge.IsEqual(firstVisits[index]!) && edge.ShapeType() === occt.TopAbs_ShapeEnum.EDGE)).toEqual(Array(12).fill(true));
        });

        it.each([
            ["faces", (shape: TopoDS_Shape, pass: (shape: TopoDS_Shape) => void): void => iteratorService.forEachFace(shape, (_index, face) => pass(face)), "FACE", 6],
            ["wires", (shape: TopoDS_Shape, pass: (shape: TopoDS_Shape) => void): void => iteratorService.forEachWire(shape, (_index, wire) => pass(wire)), "WIRE", 6],
            ["vertices", (shape: TopoDS_Shape, pass: (shape: TopoDS_Shape) => void): void => iteratorService.forEachVertex(shape, (_index, vertex) => pass(vertex)), "VERTEX", 48],
            ["shells", (shape: TopoDS_Shape, pass: (shape: TopoDS_Shape) => void): void => iteratorService.forEachShell(shape, (_index, shell) => pass(shell)), "SHELL", 1],
            ["solids", (shape: TopoDS_Shape, pass: (shape: TopoDS_Shape) => void): void => iteratorService.forEachSolid(shape, (_index, found) => pass(found)), "SOLID", 1],
        ] as [string, (shape: TopoDS_Shape, pass: (shape: TopoDS_Shape) => void) => void, "FACE" | "WIRE" | "VERTEX" | "SHELL" | "SOLID", number][])("should pass the %s of a box at every visit, in explorer order", (_what, walk, type, count) => {
            // Arrange
            const box = solid.createBox({ width: 1, length: 2, height: 3, center: [0, 0, 0] });
            const expected = explorerWalk(box, occt.TopAbs_ShapeEnum[type]);
            const passed: TopoDS_Shape[] = [];

            // Act
            walk(box, shape => passed.push(shape));

            // Assert
            expect(passed).toHaveLength(count);
            expect(passed.map((shape, index) => shape.IsEqual(expected[index]!) && shape.ShapeType() === occt.TopAbs_ShapeEnum[type])).toEqual(Array(count).fill(true));
        });
    });

    describe("forEachWire", () => {
        it("should iterate over wires in a face", () => {
            const f = faceService.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 1, 0] });
            const wires: TopoDS_Wire[] = [];
            iteratorService.forEachWire(f, (_index, wire) => {
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
            iteratorService.forEachWire(f, (_index, wire) => {
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
            iteratorService.forEachEdge(wire, (_index, edge) => {
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
            iteratorService.forEachEdge(wire, (_index, edge) => {
                edges.push(edge);
            });
            expect(edges.length).toBe(2);

            edge1.delete();
            edge2.delete();
            wire.delete();
            edges.forEach(e => e.delete());
        });
    });

    describe("a compound that holds the same shape twice", () => {
        it.each([
            ["faces", (shape: TopoDS_Shape, pass: () => void): void => iteratorService.forEachFace(shape, pass), 12],
            ["wires", (shape: TopoDS_Shape, pass: () => void): void => iteratorService.forEachWire(shape, pass), 12],
            ["shells", (shape: TopoDS_Shape, pass: () => void): void => iteratorService.forEachShell(shape, pass), 2],
            ["solids", (shape: TopoDS_Shape, pass: () => void): void => iteratorService.forEachSolid(shape, pass), 2],
        ] as [string, (shape: TopoDS_Shape, pass: () => void) => void, number][])("should pass the %s of both placements", (_what, walk, count) => {
            // Arrange
            const box = solid.createBox({ width: 1, length: 2, height: 3, center: [0, 0, 0] });
            const twice = compoundService.makeCompound({ shapes: [box, box] });
            let passed = 0;

            // Act
            walk(twice, () => passed++);

            // Assert
            expect(passed).toBe(count);
        });

        it("should pass the compound itself and not look inside it for more", () => {
            // Arrange
            const inner = compoundService.makeCompound({ shapes: [solid.createBox({ width: 1, length: 2, height: 3, center: [0, 0, 0] })] });
            const outer = compoundService.makeCompound({ shapes: [inner, inner] });
            const passed: number[] = [];

            // Act
            iteratorService.forEachCompound(outer, index => passed.push(index));

            // Assert
            expect(passed).toEqual([0]);
        });

        it("should pass a compsolid it holds twice at both visits", () => {
            // Arrange
            const builder = new occt.BRep_Builder();
            const compSolid = builder.MakeCompSolid();
            builder.Add(compSolid, solid.createBox({ width: 1, length: 2, height: 3, center: [0, 0, 0] }));
            const outer = compoundService.makeCompound({ shapes: [compSolid, compSolid] });
            let passed = 0;

            // Act
            iteratorService.forEachCompSolid(outer, () => passed++);

            // Assert
            expect(passed).toBe(2);
        });

        it("should number a compound's children from 0 in the order they were added", () => {
            // Arrange
            const box = solid.createBox({ width: 1, length: 2, height: 3, center: [0, 0, 0] });
            const sphere = solid.createSphere({ radius: 1, center: [0, 0, 0] });
            const compound = compoundService.makeCompound({ shapes: [box, sphere, box] });
            const passed: [number, TopoDS_Shape][] = [];

            // Act
            iteratorService.forEachShapeInCompound(compound, (index, child) => passed.push([index, child]));

            // Assert
            expect(passed.map(([index]) => index)).toEqual([0, 1, 2]);
            expect(passed.map(([, child]) => child.IsSame(sphere))).toEqual([false, true, false]);
        });
    });

    describe("edges along a wire", () => {
        it("should give the edges head to tail, each once", () => {
            // Arrange
            const edge1 = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [1, 0, 0] });
            const edge2 = occHelper.edgesService.lineEdge({ start: [1, 0, 0], end: [1, 1, 0] });
            const wire = occHelper.converterService.combineEdgesAndWiresIntoAWire({ shapes: [edge1, edge2] });

            // Act
            const edges = occHelper.edgesService.getEdgesAlongWire({ shape: wire });

            // Assert
            expect(edges.map(edge => [occHelper.edgesService.startPointOnEdge({ shape: edge }), occHelper.edgesService.endPointOnEdge({ shape: edge })]))
                .toEqual([[[0, 0, 0], [1, 0, 0]], [[1, 0, 0], [1, 1, 0]]].map(ends => ends.map(point => point.map(value => expect.closeTo(value, 12)))));
        });

        const recordingEdges = (name: "EdgesAlongWire" | "EdgesOf", act: () => void): TopoDS_Edge[] => {
            const handedOut: TopoDS_Edge[] = [];
            const original: unknown = Reflect.get(occt, name);
            const walk = (original as (...args: unknown[]) => TopoDS_Edge[]).bind(occt);
            Reflect.set(occt, name, (...args: unknown[]): TopoDS_Edge[] => {
                const edges = walk(...args);
                handedOut.push(...edges);
                return edges;
            });
            try {
                act();
            } finally {
                Reflect.set(occt, name, original);
            }
            return handedOut;
        };

        it("should release the edges it walked once it has rebuilt the wire from them", () => {
            // Arrange
            const square = occHelper.wiresService.createPolygonWire({ points: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] });
            let rebuilt: TopoDS_Wire | undefined;

            // Act
            const walked = recordingEdges("EdgesAlongWire", () => {
                rebuilt = occHelper.edgesService.fixEdgeOrientationsAlongWire({ shape: square });
            });

            // Assert
            expect(walked).toHaveLength(4);
            expect(walked.filter(edge => !edge.isDeleted())).toEqual([]);
            expect(occHelper.edgesService.getEdgesAlongWire({ shape: rebuilt! })).toHaveLength(4);
        });

        it("should release the edges it measured, and never the edge it was given", () => {
            // Arrange
            const box = solid.createBox({ width: 1, length: 2, height: 3, center: [0, 0, 0] });
            const line = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [3, 0, 0] });

            // Act
            const found = recordingEdges("EdgesOf", () => occHelper.edgesService.getEdgeLengthsOfShape({ shape: box }));
            const lengths = occHelper.edgesService.getEdgeLengthsOfShape({ shape: line });

            // Assert
            expect(found).toHaveLength(12);
            expect(found.filter(edge => !edge.isDeleted())).toEqual([]);
            expect([lengths, line.isDeleted()]).toEqual([[3], false]);
        });

        it("should refuse a wire with no edges, which makes no wire", () => {
            // Arrange
            const builder = new occt.BRep_Builder();
            const empty = builder.MakeWire();

            // Act
            const act = () => occHelper.edgesService.getEdgesAlongWire({ shape: empty });

            // Assert
            expect(act).toThrow("Wire could not be constructed");
        });
    });

    describe("forEachFace", () => {
        it("should iterate over faces in a solid", () => {
            const box = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const faces: TopoDS_Face[] = [];
            iteratorService.forEachFace(box, (_index, f) => {
                faces.push(f);
            });
            expect(faces.length).toBe(6);
            box.delete();
            faces.forEach(f => f.delete());
        });

        it("should iterate over a single face", () => {
            const f = faceService.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 1, 0] });
            const faces: TopoDS_Face[] = [];
            iteratorService.forEachFace(f, (_index, face) => {
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
            iteratorService.forEachShell(box, (_index, shell) => {
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
            iteratorService.forEachShell(comp, (_index, shell) => {
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
            iteratorService.forEachShell(wire, (_index, shell) => {
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
            iteratorService.forEachVertex(edge, (_index, vertex) => {
                vertices.push(vertex);
            });
            expect(vertices.length).toBe(2);
            edge.delete();
            vertices.forEach(v => v.delete());
        });

        it("should iterate over vertices in a triangle wire counting shared vertices", () => {
            const wire = occHelper.wiresService.createPolygonWire({ points: [[0, 0, 0], [1, 0, 0], [0.5, 1, 0]] });
            const vertices: TopoDS_Vertex[] = [];
            iteratorService.forEachVertex(wire, (_index, vertex) => {
                vertices.push(vertex);
            });
            expect(vertices.length).toBe(6);
            wire.delete();
            vertices.forEach(v => v.delete());
        });
    });

    describe("forEachSolid", () => {
        it("should iterate over a single solid", () => {
            const box = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const solids: TopoDS_Solid[] = [];
            iteratorService.forEachSolid(box, (_index, s) => {
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
            iteratorService.forEachSolid(comp, (_index, s) => {
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
            iteratorService.forEachSolid(f, (_index, s) => {
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
            iteratorService.forEachCompound(comp, (_index, shape) => {
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
            iteratorService.forEachCompound(outerCompound, (_index, shape) => {
                compounds.push(shape);
            });
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
            iteratorService.forEachCompound(box, (_index, shape) => {
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
            iteratorService.forEachCompSolid(box, (_index, shape) => {
                compSolids.push(shape);
            });
            expect(compSolids.length).toBe(0);
            box.delete();
        });

        it("should return no compsolids for a compound of solids", () => {
            const box1 = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const box2 = solid.createBox({ width: 1, height: 1, length: 1, center: [5, 0, 0] });
            const comp = compoundService.makeCompound({ shapes: [box1, box2] });

            const compSolids: TopoDS_Shape[] = [];
            iteratorService.forEachCompSolid(comp, (_index, shape) => {
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
            iteratorService.forEachShapeInCompound(comp, (_index, shape) => {
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
            iteratorService.forEachShapeInCompound(comp, (_index, shape) => {
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
            iteratorService.forEachShapeInCompound(outerCompound, (_index, shape) => {
                shapes.push(shape);
            });
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
