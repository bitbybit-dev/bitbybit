
import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";

export class OCCTVertex {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
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
    vertexFromXYZ(inputs: Inputs.OCCT.XYZDto): Promise<Inputs.OCCT.TopoDSVertexPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.vertex.vertexFromXYZ", inputs);
    }
    
    /**
     * Creates vertex shape from point
     * @param inputs a point
     * @returns OpenCascade vertex
     * @group from
     * @shortname vertex from point
     * @drawable true
     */
    vertexFromPoint(inputs: Inputs.OCCT.PointDto): Promise<Inputs.OCCT.TopoDSVertexPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.vertex.vertexFromPoint", inputs);
    }

    /**
     * Creates vertices from points
     * @param inputs a point
     * @returns OpenCascade vertices
     * @group from
     * @shortname vertices from points
     * @drawable true
     */
    verticesFromPoints(inputs: Inputs.OCCT.PointsDto): Promise<Inputs.OCCT.TopoDSVertexPointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.vertex.verticesFromPoints", inputs);
    }

    /**
     * Creates compound shape containing multiple vertices. This simply speeds up rendering and allows to apply occt transformations easily on vertex groups.
     * @param inputs points
     * @returns OpenCascade vertices as compound shape
     * @group from
     * @shortname compound vertices from points
     * @drawable true
     */
    verticesCompoundFromPoints(inputs: Inputs.OCCT.PointsDto): Promise<Inputs.OCCT.TopoDSCompoundPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.vertex.verticesCompoundFromPoints", inputs);
    }

    /**
     * Get all vertices in the list of a shape
     * @param inputs a shape
     * @returns OpenCascade vertices
     * @group get
     * @shortname get vertices from shape
     * @drawable true
     */
    getVertices(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSVertexPointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.vertex.getVertices", inputs);
    }

    /**
     * Get all vertices in the list of a shape as points
     * @param inputs a shape
     * @returns Points
     * @group get
     * @shortname get vertices as points
     * @drawable true
     */
    getVerticesAsPoints(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.vertex.getVerticesAsPoints", inputs);
    }

    /**
     * Transforms vertices to points
     * @param inputs a vertex shapes
     * @returns Points
     * @group transform
     * @shortname vertices to points
     * @drawable true
     */
    verticesToPoints(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSVertexPointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.vertex.verticesToPoints", inputs);
    }

    /**
     * Transform vertex to point
     * @param inputs a vertex shape
     * @returns Point
     * @group transform
     * @shortname vertex to point
     * @drawable true
     */
    vertexToPoint(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSVertexPointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.vertex.vertexToPoint", inputs);
    }

    /**
     * Project points on a shape and return the projected points - length of the vector is essential
     * @param inputs points, shape and direction that includes the length
     * @returns Points
     * @group place
     * @shortname project points
     * @drawable true
     */
    projectPoints(inputs: Inputs.OCCT.ProjectPointsOnShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[]>{
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.vertex.projectPoints", inputs);
    }
}
