import { BitbybitOcctModule, TopoDS_Vertex, TopoDS_Shape, TopoDS_Compound } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";

export class OCCTVertex {

    constructor(
        _occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Creates vertex shape from x y z coordinates
     * @param inputs x y z coordinates
     * @returns OpenCascade vertex
     * @group from
     * @shortname vertex from xyz
     * @drawable true
     */
    vertexFromXYZ(inputs: Inputs.OCCT.XYZDto): TopoDS_Vertex {
        return this.och.verticesService.vertexFromXYZ(inputs);
    }

    /**
     * Creates vertex shape from point
     * @param inputs a point
     * @returns OpenCascade vertex
     * @group from
     * @shortname vertex from point
     * @drawable true
     */
    vertexFromPoint(inputs: Inputs.OCCT.PointDto): TopoDS_Vertex {
        return this.och.verticesService.vertexFromPoint(inputs);
    }

    /**
     * Creates vertices from points
     * @param inputs a point
     * @returns OpenCascade vertices
     * @group from
     * @shortname vertices from points
     * @drawable true
     */
    verticesFromPoints(inputs: Inputs.OCCT.PointsDto): TopoDS_Vertex[] {
        return this.och.verticesService.verticesFromPoints(inputs);
    }

    /**
     * Creates compound shape containing multiple vertices. This simply speeds up rendering and allows to apply occt transformations easily on vertex groups.
     * @param inputs points
     * @returns OpenCascade vertices as compound shape
     * @group from
     * @shortname compound vertices from points
     * @drawable true
     */
    verticesCompoundFromPoints(inputs: Inputs.OCCT.PointsDto): TopoDS_Compound {
        return this.och.verticesService.verticesCompoundFromPoints(inputs);
    }

    /**
     * Get all vertices in the list of a shape
     * @param inputs a shape
     * @returns OpenCascade vertices
     * @group get
     * @shortname get vertices from shape
     * @drawable true
     */
    getVertices(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Vertex[] {
        return this.och.verticesService.getVertices(inputs);
    }

    /**
     * Get all vertices in the list of a shape as points
     * @param inputs a shape
     * @returns Points
     * @group get
     * @shortname get vertices as points
     * @drawable true
     */
    getVerticesAsPoints(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        return this.och.verticesService.getVerticesAsPoints(inputs);
    }

    /**
     * Transforms vertices to points
     * @param inputs a vertex shapes
     * @returns Points
     * @group transform
     * @shortname vertices to points
     * @drawable true
     */
    verticesToPoints(inputs: Inputs.OCCT.ShapesDto<TopoDS_Vertex>): Inputs.Base.Point3[] {
        return this.och.verticesService.verticesToPoints(inputs);
    }

    /**
     * Transform vertex to point
     * @param inputs a vertex shape
     * @returns Point
     * @group transform
     * @shortname vertex to point
     * @drawable true
     */
    vertexToPoint(inputs: Inputs.OCCT.ShapeDto<TopoDS_Vertex>): Inputs.Base.Point3 {
        return this.och.verticesService.vertexToPoint(inputs);
    }

    /**
     * Project points on a shape and return the projected points - length of the vector is essential
     * @param inputs points, shape and direction that includes the length
     * @returns Points
     * @group place
     * @shortname project points
     * @drawable true
     */
    projectPoints(inputs: Inputs.OCCT.ProjectPointsOnShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        return this.och.verticesService.projectPoints(inputs);
    }
}
