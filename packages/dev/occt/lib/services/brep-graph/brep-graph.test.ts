import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTSolid, OCCTCompound } from "../shapes";
import { OCCTBrepGraph } from "./brep-graph";
import * as Inputs from "../../api/inputs";

describe("OCCT brep graph unit tests", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let brepGraph: OCCTBrepGraph;
    let solid: OCCTSolid;
    let compound: OCCTCompound;
    let hasBindings: boolean;

    const box = (): TopoDS_Shape => solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        brepGraph = new OCCTBrepGraph(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
        compound = new OCCTCompound(occt, occHelper);
        hasBindings = typeof (occt as unknown as { BRepGraphAnalyze?: unknown }).BRepGraphAnalyze === "function";
        if (!hasBindings) {
            // eslint-disable-next-line no-console
            console.warn("BRepGraph wasm bindings are not present in this build; skipping runtime brep graph assertions.");
        }
    });

    describe("analyze", () => {
        it("should count topology of a box", () => {
            if (!hasBindings) { return; }
            const b = box();
            const result = brepGraph.analyze({ shape: b });
            expect(result.ok).toBe(true);
            expect(result.solids).toBe(1);
            expect(result.shells).toBe(1);
            expect(result.faces).toBe(6);
            expect(result.wires).toBe(6);
            expect(result.edges).toBe(12);
            expect(result.vertices).toBe(8);
            expect(typeof result.generation).toBe("number");
            b.delete();
        });

        it("should count two solids in a compound", () => {
            if (!hasBindings) { return; }
            const b1 = solid.createBox({ width: 4, height: 4, length: 4, center: [0, 0, 0] });
            const b2 = solid.createBox({ width: 4, height: 4, length: 4, center: [20, 0, 0] });
            const comp = compound.makeCompound({ shapes: [b1, b2] });
            const result = brepGraph.analyze({ shape: comp });
            expect(result.ok).toBe(true);
            expect(result.solids).toBe(2);
            expect(result.faces).toBe(12);
            expect(result.vertices).toBe(16);
            expect(result.compounds).toBeGreaterThanOrEqual(1);
            b1.delete();
            b2.delete();
            comp.delete();
        });

        it("should count a single spherical face for a sphere", () => {
            if (!hasBindings) { return; }
            const sphere = solid.createSphere({ radius: 5, center: [0, 0, 0] });
            const result = brepGraph.analyze({ shape: sphere });
            expect(result.ok).toBe(true);
            expect(result.faces).toBe(1);
            sphere.delete();
        });
    });

    describe("faceAdjacency", () => {
        it("should report four neighbours and four edges per box face", () => {
            if (!hasBindings) { return; }
            const b = box();
            const result = brepGraph.faceAdjacency({ shape: b });
            expect(result.faces.length).toBe(6);
            result.faces.forEach((face, i) => {
                expect(face.index).toBe(i);
                expect(face.adjacent.length).toBe(4);
                expect(face.adjacent).not.toContain(i);
                expect(face.edges.length).toBe(4);
                expect(face.nbWires).toBe(1);
                expect(face.outerWire).toBeGreaterThanOrEqual(0);
            });
            b.delete();
        });
    });

    describe("edgeFaceMap", () => {
        it("should mark every box edge as shared by two faces, manifold and non-boundary", () => {
            if (!hasBindings) { return; }
            const b = box();
            const result = brepGraph.edgeFaceMap({ shape: b });
            expect(result.edges.length).toBe(12);
            result.edges.forEach(edge => {
                expect(edge.nbFaces).toBe(2);
                expect(edge.faces.length).toBe(2);
                expect(edge.boundary).toBe(false);
                expect(edge.manifold).toBe(true);
                expect(edge.degenerated).toBe(false);
                expect(edge.startVertex).toBeGreaterThanOrEqual(0);
                expect(edge.endVertex).toBeGreaterThanOrEqual(0);
                expect(edge.startVertex).not.toBe(edge.endVertex);
                expect(edge.tolerance).toBeLessThan(1);
            });
            b.delete();
        });
    });

    describe("vertexEdgeMap", () => {
        it("should place box corners on a 10mm cube and give each three incident edges", () => {
            if (!hasBindings) { return; }
            const b = box();
            const result = brepGraph.vertexEdgeMap({ shape: b });
            expect(result.vertices.length).toBe(8);
            result.vertices.forEach(vertex => {
                expect(vertex.point.length).toBe(3);
                vertex.point.forEach(c => expect(Math.abs(c)).toBeCloseTo(5));
                expect(vertex.edges.length).toBe(3);
            });
            b.delete();
        });
    });

    describe("faceInfo", () => {
        it("should describe all box faces as planar with valid UV bounds and unique uids", () => {
            if (!hasBindings) { return; }
            const b = box();
            const result = brepGraph.faceInfo({ shape: b });
            expect(result.faces.length).toBe(6);
            const uids = new Set<number>();
            result.faces.forEach(face => {
                expect(face.surfaceType).toBe("Plane");
                expect(face.uvBounds.length).toBe(4);
                expect(face.nbWires).toBe(1);
                uids.add(face.uid);
            });
            expect(uids.size).toBe(6);
            b.delete();
        });

        it("should classify cylinder faces as one Cylinder and two Planes", () => {
            if (!hasBindings) { return; }
            const cyl = solid.createCylinder({ radius: 5, height: 10, center: [0, 0, 0], direction: [0, 0, 1] });
            const result = brepGraph.faceInfo({ shape: cyl });
            const types = result.faces.map(f => f.surfaceType).sort();
            expect(types).toEqual(["Cylinder", "Plane", "Plane"]);
            cyl.delete();
        });

        it("should classify a sphere face as Sphere", () => {
            if (!hasBindings) { return; }
            const sphere = solid.createSphere({ radius: 5, center: [0, 0, 0] });
            const result = brepGraph.faceInfo({ shape: sphere });
            expect(result.faces[0].surfaceType).toBe("Sphere");
            sphere.delete();
        });
    });

    describe("edgeInfo", () => {
        it("should describe all box edges as lines with a parameter range", () => {
            if (!hasBindings) { return; }
            const b = box();
            const result = brepGraph.edgeInfo({ shape: b });
            expect(result.edges.length).toBe(12);
            result.edges.forEach(edge => {
                expect(edge.curveType).toBe("Line");
                expect(edge.hasCurve).toBe(true);
                expect(edge.degenerated).toBe(false);
                expect(edge.range).not.toBeNull();
                expect((edge.range as [number, number]).length).toBe(2);
            });
            b.delete();
        });

        it("should include circular edges on a cylinder", () => {
            if (!hasBindings) { return; }
            const cyl = solid.createCylinder({ radius: 5, height: 10, center: [0, 0, 0], direction: [0, 0, 1] });
            const result = brepGraph.edgeInfo({ shape: cyl });
            const types = new Set(result.edges.map(e => e.curveType));
            expect(types.has("Circle")).toBe(true);
            cyl.delete();
        });
    });

    describe("containment", () => {
        it("should map every box face up to the single shell and solid", () => {
            if (!hasBindings) { return; }
            const b = box();
            const result = brepGraph.containment({ shape: b });
            expect(result.shellsOfFace.length).toBe(6);
            result.shellsOfFace.forEach(shells => expect(shells).toEqual([0]));
            result.solidsOfFace.forEach(solids => expect(solids).toEqual([0]));
            expect(result.solidsOfShell).toEqual([[0]]);
            b.delete();
        });
    });

    describe("wireInfo", () => {
        it("should report six closed outer wires bound to their faces", () => {
            if (!hasBindings) { return; }
            const b = box();
            const result = brepGraph.wireInfo({ shape: b });
            expect(result.wires.length).toBe(6);
            const faces = new Set<number>();
            result.wires.forEach(wire => {
                expect(wire.closed).toBe(true);
                expect(wire.outer).toBe(true);
                expect(wire.nbCoEdges).toBe(4);
                expect(wire.nbDistinctEdges).toBe(4);
                expect(wire.face).toBeGreaterThanOrEqual(0);
                faces.add(wire.face);
            });
            expect(faces.size).toBe(6);
            b.delete();
        });
    });

    describe("assembly", () => {
        it("should return product and occurrence arrays for a compound", () => {
            if (!hasBindings) { return; }
            const b1 = solid.createBox({ width: 4, height: 4, length: 4, center: [0, 0, 0] });
            const b2 = solid.createBox({ width: 4, height: 4, length: 4, center: [20, 0, 0] });
            const comp = compound.makeCompound({ shapes: [b1, b2] });
            const result = brepGraph.assembly({ shape: comp });
            expect(result.ok).toBe(true);
            expect(Array.isArray(result.products)).toBe(true);
            expect(Array.isArray(result.occurrences)).toBe(true);
            expect(Array.isArray(result.rootProducts)).toBe(true);
            b1.delete();
            b2.delete();
            comp.delete();
        });
    });

    describe("validate", () => {
        it("should report a clean box as valid with no issues", () => {
            if (!hasBindings) { return; }
            const b = box();
            const result = brepGraph.validate({ shape: b });
            expect(result.ok).toBe(true);
            expect(result.valid).toBe(true);
            expect(result.errors).toBe(0);
            expect(result.issues.length).toBe(0);
            b.delete();
        });
    });

    describe("dump", () => {
        it("should dump consistent nodes with stable uids matching faceInfo", () => {
            if (!hasBindings) { return; }
            const b = box();
            const dump = brepGraph.dump({ shape: b });
            expect(dump.solids.length).toBe(1);
            expect(dump.shells.length).toBe(1);
            expect(dump.faces.length).toBe(6);
            expect(dump.edges.length).toBe(12);
            expect(dump.vertices.length).toBe(8);

            dump.edges.forEach(edge => {
                expect(edge.startVertex).toBeGreaterThanOrEqual(0);
                expect(edge.startVertex).toBeLessThan(8);
                expect(edge.endVertex).toBeLessThan(8);
                expect(edge.faces.length).toBe(2);
            });
            dump.vertices.forEach(v => expect(v.point.length).toBe(3));
            expect(dump.shells[0].nbFaces).toBe(6);
            expect(dump.shells[0].closed).toBe(true);

            const info = brepGraph.faceInfo({ shape: b });
            const dumpUids = dump.faces.map(f => f.uid).sort((a, z) => a - z);
            const infoUids = info.faces.map(f => f.uid).sort((a, z) => a - z);
            expect(dumpUids).toEqual(infoUids);
            b.delete();
        });
    });

    describe("reconstruct", () => {
        it("should reconstruct every kind present on a box to the right type", () => {
            if (!hasBindings) { return; }
            const b = box();
            const cases: [Inputs.OCCT.brepGraphNodeKindEnum, Inputs.OCCT.shapeTypeEnum][] = [
                [Inputs.OCCT.brepGraphNodeKindEnum.solid, Inputs.OCCT.shapeTypeEnum.solid],
                [Inputs.OCCT.brepGraphNodeKindEnum.shell, Inputs.OCCT.shapeTypeEnum.shell],
                [Inputs.OCCT.brepGraphNodeKindEnum.face, Inputs.OCCT.shapeTypeEnum.face],
                [Inputs.OCCT.brepGraphNodeKindEnum.wire, Inputs.OCCT.shapeTypeEnum.wire],
                [Inputs.OCCT.brepGraphNodeKindEnum.edge, Inputs.OCCT.shapeTypeEnum.edge],
                [Inputs.OCCT.brepGraphNodeKindEnum.vertex, Inputs.OCCT.shapeTypeEnum.vertex],
            ];
            cases.forEach(([kind, expected]) => {
                const sub = brepGraph.reconstruct({ shape: b, kind, index: 0 });
                expect(sub.IsNull()).toBe(false);
                expect(occHelper.enumService.getShapeTypeEnum(sub)).toBe(expected);
                sub.delete();
            });
            b.delete();
        });

        it("should reconstruct each of the six faces of a box", () => {
            if (!hasBindings) { return; }
            const b = box();
            const count = brepGraph.analyze({ shape: b }).faces;
            for (let i = 0; i < count; i++) {
                const face = brepGraph.reconstruct({ shape: b, kind: Inputs.OCCT.brepGraphNodeKindEnum.face, index: i });
                expect(face.IsNull()).toBe(false);
                expect(occHelper.enumService.getShapeTypeEnum(face)).toBe(Inputs.OCCT.shapeTypeEnum.face);
                face.delete();
            }
            b.delete();
        });

        it("should throw for an out-of-range node index", () => {
            if (!hasBindings) { return; }
            const b = box();
            expect(() => brepGraph.reconstruct({ shape: b, kind: Inputs.OCCT.brepGraphNodeKindEnum.face, index: 999 }))
                .toThrow();
            b.delete();
        });
    });

    describe("nodeOfShape", () => {
        it("should round-trip face, edge and vertex nodes", () => {
            if (!hasBindings) { return; }
            const b = box();
            const checks: [Inputs.OCCT.brepGraphNodeKindEnum, number, string][] = [
                [Inputs.OCCT.brepGraphNodeKindEnum.face, 3, "face"],
                [Inputs.OCCT.brepGraphNodeKindEnum.edge, 5, "edge"],
                [Inputs.OCCT.brepGraphNodeKindEnum.vertex, 2, "vertex"],
            ];
            checks.forEach(([kind, index, expectedKind]) => {
                const sub = brepGraph.reconstruct({ shape: b, kind, index });
                const node = brepGraph.nodeOfShape({ shape: b, subShape: sub });
                expect(node.valid).toBe(true);
                expect(node.kind).toBe(expectedKind);
                expect(node.index).toBe(index);
                expect(typeof node.uid).toBe("number");
                sub.delete();
            });
            b.delete();
        });

        it("should return invalid for a sub-shape that does not belong to the graph", () => {
            if (!hasBindings) { return; }
            const b = box();
            const other = solid.createBox({ width: 2, height: 2, length: 2, center: [50, 50, 50] });
            const otherFace = brepGraph.reconstruct({ shape: other, kind: Inputs.OCCT.brepGraphNodeKindEnum.face, index: 0 });
            const node = brepGraph.nodeOfShape({ shape: b, subShape: otherFace });
            expect(node.valid).toBe(false);
            b.delete();
            other.delete();
            otherFace.delete();
        });
    });

    describe("cross-reference contract", () => {
        it("should keep face indices consistent across helpers for a box", () => {
            if (!hasBindings) { return; }
            const b = box();
            const adjacency = brepGraph.faceAdjacency({ shape: b });
            const info = brepGraph.faceInfo({ shape: b });
            expect(adjacency.faces.length).toBe(info.faces.length);
            adjacency.faces.forEach((face, i) => {
                expect(face.index).toBe(i);
                expect(info.faces[i].index).toBe(i);
            });
            b.delete();
        });
    });
});
