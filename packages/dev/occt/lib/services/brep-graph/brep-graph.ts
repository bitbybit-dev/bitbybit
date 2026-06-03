import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";

export class OCCTBrepGraph {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) { }

    analyze(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphAnalysis {
        return JSON.parse(this.occ.BRepGraphAnalyze(inputs.shape)) as Models.OCCT.BRepGraphAnalysis;
    }

    faceAdjacency(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphFaceAdjacencyResult {
        return JSON.parse(this.occ.BRepGraphFaceAdjacency(inputs.shape)) as Models.OCCT.BRepGraphFaceAdjacencyResult;
    }

    edgeFaceMap(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphEdgeFaceMapResult {
        return JSON.parse(this.occ.BRepGraphEdgeFaceMap(inputs.shape)) as Models.OCCT.BRepGraphEdgeFaceMapResult;
    }

    vertexEdgeMap(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphVertexEdgeMapResult {
        return JSON.parse(this.occ.BRepGraphVertexEdgeMap(inputs.shape)) as Models.OCCT.BRepGraphVertexEdgeMapResult;
    }

    faceInfo(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphFaceInfoResult {
        return JSON.parse(this.occ.BRepGraphFaceInfo(inputs.shape)) as Models.OCCT.BRepGraphFaceInfoResult;
    }

    edgeInfo(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphEdgeInfoResult {
        return JSON.parse(this.occ.BRepGraphEdgeInfo(inputs.shape)) as Models.OCCT.BRepGraphEdgeInfoResult;
    }

    containment(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphContainmentResult {
        return JSON.parse(this.occ.BRepGraphContainment(inputs.shape)) as Models.OCCT.BRepGraphContainmentResult;
    }

    wireInfo(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphWireInfoResult {
        return JSON.parse(this.occ.BRepGraphWireInfo(inputs.shape)) as Models.OCCT.BRepGraphWireInfoResult;
    }

    assembly(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphAssemblyResult {
        return JSON.parse(this.occ.BRepGraphAssembly(inputs.shape)) as Models.OCCT.BRepGraphAssemblyResult;
    }

    validate(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphValidationResult {
        return JSON.parse(this.occ.BRepGraphValidate(inputs.shape)) as Models.OCCT.BRepGraphValidationResult;
    }

    dump(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphDumpResult {
        return JSON.parse(this.occ.BRepGraphDump(inputs.shape)) as Models.OCCT.BRepGraphDumpResult;
    }

    reconstruct(inputs: Inputs.OCCT.BRepGraphReconstructDto<TopoDS_Shape>): TopoDS_Shape {
        const shape = this.occ.BRepGraphReconstruct(inputs.shape, inputs.kind, inputs.index);
        if (shape.IsNull()) {
            throw new Error("Could not reconstruct a sub-shape for the given node.");
        }
        const result = this.och.converterService.getActualTypeOfShape(shape);
        shape.delete();
        return result;
    }

    nodeOfShape(inputs: Inputs.OCCT.BRepGraphNodeOfShapeDto<TopoDS_Shape>): Models.OCCT.BRepGraphNodeLookup {
        return JSON.parse(this.occ.BRepGraphNodeOfShape(inputs.shape, inputs.subShape)) as Models.OCCT.BRepGraphNodeLookup;
    }

}
