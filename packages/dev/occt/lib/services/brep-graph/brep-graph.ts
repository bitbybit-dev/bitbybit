import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";

export class OCCTBrepGraph {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) { }

    /**
     * Topology and assembly element counts plus graph metadata for a shape
     * @param inputs shape to analyze
     * @returns Counts and graph metadata
     * @group topology
     * @shortname analyze
     * @drawable false
     */
    analyze(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphAnalysis {
        return JSON.parse(this.occ.BRepGraphAnalyze(inputs.shape)) as Models.OCCT.BRepGraphAnalysis;
    }

    /**
     * Face adjacency graph with per-face edges, wire count and outer wire
     * @param inputs shape to analyze
     * @returns Per-face adjacency
     * @group topology
     * @shortname face adjacency
     * @drawable false
     */
    faceAdjacency(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphFaceAdjacencyResult {
        return JSON.parse(this.occ.BRepGraphFaceAdjacency(inputs.shape)) as Models.OCCT.BRepGraphFaceAdjacencyResult;
    }

    /**
     * Edge to face incidence with topology flags and end vertices
     * @param inputs shape to analyze
     * @returns Per-edge face map
     * @group topology
     * @shortname edge face map
     * @drawable false
     */
    edgeFaceMap(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphEdgeFaceMapResult {
        return JSON.parse(this.occ.BRepGraphEdgeFaceMap(inputs.shape)) as Models.OCCT.BRepGraphEdgeFaceMapResult;
    }

    /**
     * Vertex report with 3D point, tolerance and incident edges
     * @param inputs shape to analyze
     * @returns Per-vertex edge map
     * @group topology
     * @shortname vertex edge map
     * @drawable false
     */
    vertexEdgeMap(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphVertexEdgeMapResult {
        return JSON.parse(this.occ.BRepGraphVertexEdgeMap(inputs.shape)) as Models.OCCT.BRepGraphVertexEdgeMapResult;
    }

    /**
     * Per-face geometry with surface type, UV bounds, triangulation flag and UID
     * @param inputs shape to analyze
     * @returns Per-face geometry info
     * @group geometry
     * @shortname face info
     * @drawable false
     */
    faceInfo(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphFaceInfoResult {
        return JSON.parse(this.occ.BRepGraphFaceInfo(inputs.shape)) as Models.OCCT.BRepGraphFaceInfoResult;
    }

    /**
     * Per-edge geometry with curve type, parameter range, continuity and UID
     * @param inputs shape to analyze
     * @returns Per-edge geometry info
     * @group geometry
     * @shortname edge info
     * @drawable false
     */
    edgeInfo(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphEdgeInfoResult {
        return JSON.parse(this.occ.BRepGraphEdgeInfo(inputs.shape)) as Models.OCCT.BRepGraphEdgeInfoResult;
    }

    /**
     * Upward containment navigation with parent indices per child
     * @param inputs shape to analyze
     * @returns Containment maps
     * @group topology
     * @shortname containment
     * @drawable false
     */
    containment(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphContainmentResult {
        return JSON.parse(this.occ.BRepGraphContainment(inputs.shape)) as Models.OCCT.BRepGraphContainmentResult;
    }

    /**
     * Per-wire report with closure, outer flag, coedge and edge counts and owning face
     * @param inputs shape to analyze
     * @returns Per-wire info
     * @group topology
     * @shortname wire info
     * @drawable false
     */
    wireInfo(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphWireInfoResult {
        return JSON.parse(this.occ.BRepGraphWireInfo(inputs.shape)) as Models.OCCT.BRepGraphWireInfoResult;
    }

    /**
     * Graph-native assembly structure using the product and occurrence model
     * @param inputs shape to analyze
     * @returns Assembly products and occurrences
     * @group assembly
     * @shortname assembly
     * @drawable false
     */
    assembly(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphAssemblyResult {
        return JSON.parse(this.occ.BRepGraphAssembly(inputs.shape)) as Models.OCCT.BRepGraphAssemblyResult;
    }

    /**
     * Structural graph validation that checks graph integrity, not geometric validity
     * @param inputs shape to analyze
     * @returns Validation issues
     * @group validation
     * @shortname validate
     * @drawable false
     */
    validate(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphValidationResult {
        return JSON.parse(this.occ.BRepGraphValidate(inputs.shape)) as Models.OCCT.BRepGraphValidationResult;
    }

    /**
     * Full structural dump of every active node with UID and direct downward references
     * @param inputs shape to analyze
     * @returns Structural dump
     * @group topology
     * @shortname dump
     * @drawable false
     */
    dump(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphDumpResult {
        return JSON.parse(this.occ.BRepGraphDump(inputs.shape)) as Models.OCCT.BRepGraphDumpResult;
    }

    /**
     * Reconstruct a real sub-shape from a graph node identified by kind and index
     * @param inputs shape, node kind and index
     * @returns The reconstructed sub-shape
     * @group navigate
     * @shortname reconstruct
     * @drawable true
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
     * Reverse lookup that finds the graph node for a sub-shape of the source shape
     * @param inputs shape and sub-shape to locate
     * @returns The matching node or an invalid result
     * @group navigate
     * @shortname node of shape
     * @drawable false
     */
    nodeOfShape(inputs: Inputs.OCCT.BRepGraphNodeOfShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphNodeLookup {
        return JSON.parse(this.occ.BRepGraphNodeOfShape(inputs.shape, inputs.subShape)) as Models.OCCT.BRepGraphNodeLookup;
    }

}
