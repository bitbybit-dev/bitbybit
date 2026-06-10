import { Inputs } from "@bitbybit-dev/occt";
import { Models } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";

export class OCCTBrepGraph {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Topology and assembly element counts plus graph metadata for a shape
     * @param inputs shape to analyze
     * @returns Counts and graph metadata
     * @group topology
     * @shortname analyze
     * @drawable false
     */
    analyze(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Models.OCCT.BRepGraphAnalysis> {
        return this.occWorkerManager.genericCallToWorkerPromise("brepGraph.analyze", inputs);
    }

    /**
     * Face adjacency graph with per-face edges, wire count and outer wire
     * @param inputs shape to analyze
     * @returns Per-face adjacency
     * @group topology
     * @shortname face adjacency
     * @drawable false
     */
    faceAdjacency(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Models.OCCT.BRepGraphFaceAdjacencyResult> {
        return this.occWorkerManager.genericCallToWorkerPromise("brepGraph.faceAdjacency", inputs);
    }

    /**
     * Edge to face incidence with topology flags and end vertices
     * @param inputs shape to analyze
     * @returns Per-edge face map
     * @group topology
     * @shortname edge face map
     * @drawable false
     */
    edgeFaceMap(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Models.OCCT.BRepGraphEdgeFaceMapResult> {
        return this.occWorkerManager.genericCallToWorkerPromise("brepGraph.edgeFaceMap", inputs);
    }

    /**
     * Vertex report with 3D point, tolerance and incident edges
     * @param inputs shape to analyze
     * @returns Per-vertex edge map
     * @group topology
     * @shortname vertex edge map
     * @drawable false
     */
    vertexEdgeMap(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Models.OCCT.BRepGraphVertexEdgeMapResult> {
        return this.occWorkerManager.genericCallToWorkerPromise("brepGraph.vertexEdgeMap", inputs);
    }

    /**
     * Per-face geometry with surface type, UV bounds, triangulation flag and UID
     * @param inputs shape to analyze
     * @returns Per-face geometry info
     * @group geometry
     * @shortname face info
     * @drawable false
     */
    faceInfo(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Models.OCCT.BRepGraphFaceInfoResult> {
        return this.occWorkerManager.genericCallToWorkerPromise("brepGraph.faceInfo", inputs);
    }

    /**
     * Per-edge geometry with curve type, parameter range, continuity and UID
     * @param inputs shape to analyze
     * @returns Per-edge geometry info
     * @group geometry
     * @shortname edge info
     * @drawable false
     */
    edgeInfo(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Models.OCCT.BRepGraphEdgeInfoResult> {
        return this.occWorkerManager.genericCallToWorkerPromise("brepGraph.edgeInfo", inputs);
    }

    /**
     * Upward containment navigation with parent indices per child
     * @param inputs shape to analyze
     * @returns Containment maps
     * @group topology
     * @shortname containment
     * @drawable false
     */
    containment(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Models.OCCT.BRepGraphContainmentResult> {
        return this.occWorkerManager.genericCallToWorkerPromise("brepGraph.containment", inputs);
    }

    /**
     * Per-wire report with closure, outer flag, coedge and edge counts and owning face
     * @param inputs shape to analyze
     * @returns Per-wire info
     * @group topology
     * @shortname wire info
     * @drawable false
     */
    wireInfo(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Models.OCCT.BRepGraphWireInfoResult> {
        return this.occWorkerManager.genericCallToWorkerPromise("brepGraph.wireInfo", inputs);
    }

    /**
     * Graph-native assembly structure using the product and occurrence model
     * @param inputs shape to analyze
     * @returns Assembly products and occurrences
     * @group assembly
     * @shortname assembly
     * @drawable false
     */
    assembly(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Models.OCCT.BRepGraphAssemblyResult> {
        return this.occWorkerManager.genericCallToWorkerPromise("brepGraph.assembly", inputs);
    }

    /**
     * Structural graph validation that checks graph integrity, not geometric validity
     * @param inputs shape to analyze
     * @returns Validation issues
     * @group validation
     * @shortname validate
     * @drawable false
     */
    validate(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Models.OCCT.BRepGraphValidationResult> {
        return this.occWorkerManager.genericCallToWorkerPromise("brepGraph.validate", inputs);
    }

    /**
     * Full structural dump of every active node with UID and direct downward references
     * @param inputs shape to analyze
     * @returns Structural dump
     * @group topology
     * @shortname dump
     * @drawable false
     */
    dump(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Models.OCCT.BRepGraphDumpResult> {
        return this.occWorkerManager.genericCallToWorkerPromise("brepGraph.dump", inputs);
    }

    /**
     * Reconstruct a real sub-shape from a graph node identified by kind and index
     * @param inputs shape, node kind and index
     * @returns The reconstructed sub-shape
     * @group navigate
     * @shortname reconstruct
     * @drawable true
     */
    reconstruct(inputs: Inputs.OCCT.BRepGraphReconstructDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("brepGraph.reconstruct", inputs);
    }

    /**
     * Reverse lookup that finds the graph node for a sub-shape of the source shape
     * @param inputs shape and sub-shape to locate
     * @returns The matching node or an invalid result
     * @group navigate
     * @shortname node of shape
     * @drawable false
     */
    nodeOfShape(inputs: Inputs.OCCT.BRepGraphNodeOfShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Models.OCCT.BRepGraphNodeLookup> {
        return this.occWorkerManager.genericCallToWorkerPromise("brepGraph.nodeOfShape", inputs);
    }

}
