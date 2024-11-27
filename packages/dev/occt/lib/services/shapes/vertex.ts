import { OpenCascadeInstance, TopoDS_Vertex, TopoDS_Shape, TopoDS_Compound } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs/inputs";

export class OCCTVertex {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    vertexFromXYZ(inputs: Inputs.OCCT.XYZDto): TopoDS_Vertex {
        return this.och.verticesService.vertexFromXYZ(inputs);
    }

    vertexFromPoint(inputs: Inputs.OCCT.PointDto): TopoDS_Vertex {
        return this.och.verticesService.vertexFromPoint(inputs);
    }

    verticesFromPoints(inputs: Inputs.OCCT.PointsDto): TopoDS_Vertex[] {
        return this.och.verticesService.verticesFromPoints(inputs);
    }

    verticesCompoundFromPoints(inputs: Inputs.OCCT.PointsDto): TopoDS_Compound {
        return this.och.verticesService.verticesCompoundFromPoints(inputs);
    }

    getVertices(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Vertex[] {
        return this.och.verticesService.getVertices(inputs);
    }

    getVerticesAsPoints(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        return this.och.verticesService.getVerticesAsPoints(inputs);
    }

    verticesToPoints(inputs: Inputs.OCCT.ShapesDto<TopoDS_Vertex>): Inputs.Base.Point3[] {
        return this.och.verticesService.verticesToPoints(inputs);
    }

    vertexToPoint(inputs: Inputs.OCCT.ShapeDto<TopoDS_Vertex>): Inputs.Base.Point3 {
        return this.och.verticesService.vertexToPoint(inputs);
    }

    projectPoints(inputs: Inputs.OCCT.ProjectPointsOnShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        return this.och.verticesService.projectPoints(inputs);
    }
}
