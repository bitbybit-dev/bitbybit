import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";

/**
 * Structural queries over an OpenCascade shape seen as a graph: which faces touch, which faces an
 * edge belongs to, which edges meet at a vertex, what surface or curve backs each face or edge, how
 * shells and solids contain each other, and the product and occurrence tree of an assembly. Every
 * query returns plain data with `ok` and an error message rather than throwing, so a batch of
 * queries can report per-item failures; `reconstruct` turns a node of that data back into a real
 * sub-shape.
 */
export class OCCTBrepGraph {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) { }

    /**
     * Counts what a shape is made of: solids, shells, faces, wires, edges, coedges and vertices,
     * the distinct surfaces and curves behind them, and any assembly products and occurrences.
     *
     * The quickest way to see what an imported file holds, and to tell one solid from a compound
     * that only looks like one.
     * @param inputs - The shape to analyze
     * @returns The counts and graph metadata
     * @group topology
     * @shortname analyze
     * @drawable false
     * @example
     * ```typescript
     * const census = await bitbybit.occt.brepGraph.analyze({ shape: imported });
     * console.log(census.solids, census.faces);
     * ```
     */
    analyze(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphAnalysis {
        return JSON.parse(this.occ.BRepGraphAnalyze(inputs.shape)) as Models.OCCT.BRepGraphAnalysis;
    }

    /**
     * Lists, for every face, the faces that share an edge with it, along with its edges, wire count
     * and outer wire.
     *
     * Faces are numbered from 0 in the order the kernel walks the shape, the same order
     * `shapes.face.getFaces` uses. This is the building block for growing a selection outward from
     * a seed face or finding the faces of a pocket.
     * @param inputs - The shape to analyze
     * @returns One adjacency entry per face
     * @group topology
     * @shortname face adjacency
     * @drawable false
     * @example
     * ```typescript
     * const adjacency = await bitbybit.occt.brepGraph.faceAdjacency({ shape: box });
     * console.log(adjacency.faces[0].adjacent);
     * ```
     */
    faceAdjacency(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphFaceAdjacencyResult {
        return JSON.parse(this.occ.BRepGraphFaceAdjacency(inputs.shape)) as Models.OCCT.BRepGraphFaceAdjacencyResult;
    }

    /**
     * Lists, for every edge, the faces it belongs to, its end vertices and its topology flags, such
     * as whether it is a seam or a border edge.
     *
     * Edges are numbered from 0 in the order `shapes.edge.getEdges` lists them.
     * @param inputs - The shape to analyze
     * @returns One entry per edge
     * @group topology
     * @shortname edge face map
     * @drawable false
     * @example
     * ```typescript
     * const edges = await bitbybit.occt.brepGraph.edgeFaceMap({ shape: box });
     * ```
     */
    edgeFaceMap(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphEdgeFaceMapResult {
        return JSON.parse(this.occ.BRepGraphEdgeFaceMap(inputs.shape)) as Models.OCCT.BRepGraphEdgeFaceMapResult;
    }

    /**
     * Lists every vertex with its 3D point, its tolerance and the edges that meet there.
     *
     * Vertices are numbered from 0 in the order the kernel walks the shape.
     * @param inputs - The shape to analyze
     * @returns One entry per vertex
     * @group topology
     * @shortname vertex edge map
     * @drawable false
     * @example
     * ```typescript
     * const vertices = await bitbybit.occt.brepGraph.vertexEdgeMap({ shape: box });
     * ```
     */
    vertexEdgeMap(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphVertexEdgeMapResult {
        return JSON.parse(this.occ.BRepGraphVertexEdgeMap(inputs.shape)) as Models.OCCT.BRepGraphVertexEdgeMapResult;
    }

    /**
     * Describes the geometry of every face: the kind of surface it lies on, its UV bounds, whether
     * it carries a triangulation, and a unique id.
     *
     * Faces are numbered from 0 in the order `shapes.face.getFaces` uses.
     * @param inputs - The shape to analyze
     * @returns One geometry entry per face
     * @group geometry
     * @shortname face info
     * @drawable false
     * @example
     * ```typescript
     * const faces = await bitbybit.occt.brepGraph.faceInfo({ shape: cylinder });
     * console.log(faces.faces.map(f => f.surfaceType));
     * ```
     */
    faceInfo(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphFaceInfoResult {
        return JSON.parse(this.occ.BRepGraphFaceInfo(inputs.shape)) as Models.OCCT.BRepGraphFaceInfoResult;
    }

    /**
     * Describes the geometry of every edge: the kind of curve it follows, its parameter range, its
     * continuity and a unique id.
     *
     * Edges are numbered from 0 in the order `shapes.edge.getEdges` lists them.
     * @param inputs - The shape to analyze
     * @returns One geometry entry per edge
     * @group geometry
     * @shortname edge info
     * @drawable false
     * @example
     * ```typescript
     * const edges = await bitbybit.occt.brepGraph.edgeInfo({ shape: cylinder });
     * ```
     */
    edgeInfo(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphEdgeInfoResult {
        return JSON.parse(this.occ.BRepGraphEdgeInfo(inputs.shape)) as Models.OCCT.BRepGraphEdgeInfoResult;
    }

    /**
     * Maps the shape's parts upward: which shells each face belongs to, which solids each shell
     * belongs to, and which solids each face ends up in.
     *
     * Each list holds the parent indexes of one child, so a face shared by two solids lists both.
     * @param inputs - The shape to analyze
     * @returns The parent indexes per face and per shell
     * @group topology
     * @shortname containment
     * @drawable false
     * @example
     * ```typescript
     * const containment = await bitbybit.occt.brepGraph.containment({ shape: compound });
     * ```
     */
    containment(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphContainmentResult {
        return JSON.parse(this.occ.BRepGraphContainment(inputs.shape)) as Models.OCCT.BRepGraphContainmentResult;
    }

    /**
     * Describes every wire: whether it is closed, whether it is the outer boundary of its face, how
     * many coedges and distinct edges it has and which face owns it.
     * @param inputs - The shape to analyze
     * @returns One entry per wire
     * @group topology
     * @shortname wire info
     * @drawable false
     * @example
     * ```typescript
     * const wires = await bitbybit.occt.brepGraph.wireInfo({ shape: plateWithHoles });
     * ```
     */
    wireInfo(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphWireInfoResult {
        return JSON.parse(this.occ.BRepGraphWireInfo(inputs.shape)) as Models.OCCT.BRepGraphWireInfoResult;
    }

    /**
     * Reads the assembly structure of a shape as products and occurrences: a product is a part or
     * sub-assembly defined once, an occurrence is one placement of it with a matrix and a parent.
     *
     * This is what STEP assembly import produces and what a tree view walks; a plain shape reports
     * no products.
     * @param inputs - The shape to analyze
     * @returns The root products, all products and all occurrences
     * @group assembly
     * @shortname assembly
     * @drawable false
     * @example
     * ```typescript
     * const tree = await bitbybit.occt.brepGraph.assembly({ shape: imported });
     * console.log(tree.products.length, tree.occurrences.length);
     * ```
     */
    assembly(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphAssemblyResult {
        return JSON.parse(this.occ.BRepGraphAssembly(inputs.shape)) as Models.OCCT.BRepGraphAssemblyResult;
    }

    /**
     * Checks the structure of a shape's graph for problems such as dangling references or
     * inconsistent links, and lists every issue found with its severity.
     *
     * This checks the bookkeeping, not the geometry; `shapes.shape.isValid` and
     * `shapeFix.basicShapeRepair` deal with geometric validity.
     * @param inputs - The shape to analyze
     * @returns Whether the graph is sound and the issues found
     * @group validation
     * @shortname validate
     * @drawable false
     * @example
     * ```typescript
     * const report = await bitbybit.occt.brepGraph.validate({ shape: imported });
     * console.log(report.valid, report.issues);
     * ```
     */
    validate(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphValidationResult {
        return JSON.parse(this.occ.BRepGraphValidate(inputs.shape)) as Models.OCCT.BRepGraphValidationResult;
    }

    /**
     * Dumps the whole structure of a shape: every solid, shell, face, edge and vertex with its
     * unique id and the parts directly below it.
     *
     * The heaviest query here, for reasoning about the whole topology at once rather than answering
     * one question.
     * @param inputs - The shape to analyze
     * @returns The solids, shells, faces, edges and vertices with their references
     * @group topology
     * @shortname dump
     * @drawable false
     * @example
     * ```typescript
     * const structure = await bitbybit.occt.brepGraph.dump({ shape: box });
     * console.log(structure.faces.length, structure.edges.length);
     * ```
     */
    dump(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphDumpResult {
        return JSON.parse(this.occ.BRepGraphDump(inputs.shape)) as Models.OCCT.BRepGraphDumpResult;
    }

    /**
     * Turns a node of the graph, given by its kind and index, back into the real sub-shape it
     * stands for, so a face or edge found by a query can be used in an operation.
     *
     * The indexes are the ones the query results use, counted from 0 per kind.
     * @param inputs - The shape, the node kind and the node index
     * @returns The sub-shape
     * @group navigate
     * @shortname reconstruct
     * @drawable true
     * @example
     * ```typescript
     * const face = await bitbybit.occt.brepGraph.reconstruct({ shape: box, kind: Bit.Inputs.OCCT.brepGraphNodeKindEnum.face, index: 2 });
     * ```
     */
    reconstruct(inputs: Inputs.OCCT.BRepGraphReconstructDto<TopoDS_Shape>): TopoDS_Shape {
        const shape = this.occ.BRepGraphReconstruct(inputs.shape, inputs.kind, inputs.index);
        if (shape.IsNull()) {
            throw new Error("Could not reconstruct a sub-shape for the given node.");
        }
        const result = this.och.converterService.getActualTypeOfShape(shape);
        shape.delete();
        return result;
    }

    /**
     * Finds the graph node that stands for a given sub-shape of a shape: its kind, its index and
     * its unique id.
     *
     * The reverse of `reconstruct`; a sub-shape that does not belong to the shape gives a result
     * marked invalid.
     * @param inputs - The shape and one of its sub-shapes
     * @returns The node's kind, index and id, or an invalid result
     * @group navigate
     * @shortname node of shape
     * @drawable false
     * @example
     * ```typescript
     * const faces = await bitbybit.occt.shapes.face.getFaces({ shape: box });
     * const node = await bitbybit.occt.brepGraph.nodeOfShape({ shape: box, subShape: faces[0] });
     * console.log(node.kind, node.index);
     * ```
     */
    nodeOfShape(inputs: Inputs.OCCT.BRepGraphNodeOfShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphNodeLookup {
        return JSON.parse(this.occ.BRepGraphNodeOfShape(inputs.shape, inputs.subShape)) as Models.OCCT.BRepGraphNodeLookup;
    }

}
