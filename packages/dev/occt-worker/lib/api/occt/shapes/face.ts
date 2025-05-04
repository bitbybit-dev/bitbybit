import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";

export class OCCTFace {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Creates a faces from wires on face
     * @param inputs OpenCascade wires and guiding face
     * @returns OpenCascade faces
     * @group from
     * @shortname faces from wires on face
     * @drawable true
     */
    createFacesFromWiresOnFace(inputs: Inputs.OCCT.FacesFromWiresOnFaceDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSFacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.createFacesFromWiresOnFace", inputs);
    }

    /**
     * Creates a face from wire on face
     * @param inputs OpenCascade wire shape and guiding face
     * @returns OpenCascade face shape
     * @group from
     * @shortname face from wire on face
     * @drawable true
     */
    createFaceFromWireOnFace(inputs: Inputs.OCCT.FaceFromWireOnFaceDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSFacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.createFaceFromWireOnFace", inputs);
    }

    /**
     * Creates a face from wire
     * @param inputs OpenCascade wire shape and indication if face should be planar
     * @returns OpenCascade face shape
     * @group from
     * @shortname face from wire
     * @drawable true
     */
    createFaceFromWire(inputs: Inputs.OCCT.FaceFromWireDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSFacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.createFaceFromWire", inputs);
    }

    /**
     * Creates a face from wires. This can produce hollow faces.
     * @param inputs OpenCascade wire shapes and indication if face should be planar
     * @returns OpenCascade face shape
     * @group from
     * @shortname face from wires
     * @drawable true
     */
    createFaceFromWires(inputs: Inputs.OCCT.FaceFromWiresDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSFacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.createFaceFromWires", inputs);
    }

    /**
       * Creates a face from wires on the guiding face. This can produce hollow faces.
       * @param inputs OpenCascade wire shapes and indication if wire is inside the face
       * @returns OpenCascade face shape
       * @group from
       * @shortname face from wires on face
       * @drawable true
       */
    createFaceFromWiresOnFace(inputs: Inputs.OCCT.FaceFromWiresOnFaceDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSFacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.createFaceFromWiresOnFace", inputs);
    }

    /**
     * Creates faces from wires
     * @param inputs OpenCascade wire shape and indication if face should be planar
     * @returns OpenCascade face shape
     * @group from
     * @shortname faces from wires
     * @drawable true
     */
    createFacesFromWires(inputs: Inputs.OCCT.FacesFromWiresDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSFacePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.createFacesFromWires", inputs);
    }

    /**
     * Creates face from multiple circle tangent wires
     * @param inputs OpenCascade circle wire shapes
     * @returns OpenCascade face shape
     * @group from
     * @shortname face from circles tan
     * @drawable true
     */
    createFaceFromMultipleCircleTanWires(inputs: Inputs.OCCT.FaceFromMultipleCircleTanWiresDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.createFaceFromMultipleCircleTanWires", inputs);
    }

    /**
     * Creates face from multiple circle tangent wire collections
     * @param inputs OpenCascade circle wire shapes
     * @returns OpenCascade face shape
     * @group from
     * @shortname face from multiple circle tan collections
     * @drawable true
     */
    createFaceFromMultipleCircleTanWireCollections(inputs: Inputs.OCCT.FaceFromMultipleCircleTanWireCollectionsDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.createFaceFromMultipleCircleTanWireCollections", inputs);
    }

    /**
     * Creates a face from the surface
     * @param inputs Face shape
     * @returns OpenCascade surface
     * @group from
     * @shortname surface
     * @drawable true
     */
    faceFromSurface(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.GeomSurfacePointer>): Promise<Inputs.OCCT.TopoDSFacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.faceFromSurface", inputs);
    }

    /**
     * Creates a face from the surface and a wire
     * @param inputs OpenCascade surface, a wire and indication wether face should be created inside or not
     * @returns Face shape
     * @group from
     * @shortname surface and wire
     * @drawable true
     */
    faceFromSurfaceAndWire(inputs: Inputs.OCCT.FaceFromSurfaceAndWireDto<Inputs.OCCT.GeomSurfacePointer, Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSFacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.faceFromSurfaceAndWire", inputs);
    }

    /**
     * Creates OpenCascade Polygon face
     * @param inputs Polygon points
     * @returns OpenCascade polygon face
     * @group primitives
     * @shortname polygon
     * @drawable true
     */
    createPolygonFace(inputs: Inputs.OCCT.PolygonDto): Promise<Inputs.OCCT.TopoDSFacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.createPolygonFace", inputs);
    }

    /**
     * Creates OpenCascade circle face
     * @param inputs Circle parameters
     * @returns OpenCascade circle face
     * @group primitives
     * @shortname circle
     * @drawable true
     */
    createCircleFace(inputs: Inputs.OCCT.CircleDto): Promise<Inputs.OCCT.TopoDSFacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.createCircleFace", inputs);
    }

    /**
     * Creates OpenCascade hexagons in grid
     * @param inputs Hexagon parameters
     * @returns OpenCascade hexagons in grid
     * @group primitives
     * @shortname hexagons in grid
     * @drawable true
     */
    hexagonsInGrid(inputs: Inputs.OCCT.HexagonsInGridDto): Promise<Inputs.OCCT.TopoDSFacePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.hexagonsInGrid", inputs);
    }

    /**
     * Creates OpenCascade ellipse face
     * @param inputs Ellipse parameters
     * @returns OpenCascade ellipse face
     * @group primitives
     * @shortname ellipse
     * @drawable true
     */
    createEllipseFace(inputs: Inputs.OCCT.EllipseDto): Promise<Inputs.OCCT.TopoDSFacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.createEllipseFace", inputs);
    }

    /**
     * Creates OpenCascade square face
     * @param inputs Square parameters
     * @returns OpenCascade square face
     * @group primitives
     * @shortname square
     * @drawable true
     */
    createSquareFace(inputs: Inputs.OCCT.SquareDto): Promise<Inputs.OCCT.TopoDSFacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.createSquareFace", inputs);
    }

    /**
     * Creates OpenCascade rectangle face
     * @param inputs rectangle parameters
     * @returns OpenCascade rectangle
     * @group primitives
     * @shortname rectangle
     * @drawable true
     */
    createRectangleFace(inputs: Inputs.OCCT.RectangleDto): Promise<Inputs.OCCT.TopoDSFacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.createRectangleFace", inputs);
    }

    /**
     * Gets the face by providing an index from the shape
     * @param inputs Shape
     * @returns OpenCascade face
     * @group get
     * @shortname face
     * @drawable true
     */
    getFace(inputs: Inputs.OCCT.ShapeIndexDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSFacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.getFace", inputs);
    }

    /**
     * Gets the faces of the shape in a list
     * @param inputs Shape
     * @returns OpenCascade faces array
     * @group get
     * @shortname faces
     * @drawable true
     */
    getFaces(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSFacePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.getFaces", inputs);
    }

    /**
     * Computes reversed face from input face
     * @param inputs Face
     * @returns OpenCascade face
     * @group get
     * @shortname reversed
     * @drawable true
     */
    reversedFace(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSFacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.reversedFace", inputs);
    }

    /**
     * Subdivides a face to point grid
     * @param inputs Face and options for subdivision
     * @returns points
     * @group extract
     * @shortname points
     * @drawable true
     */
    subdivideToPoints(inputs: Inputs.OCCT.FaceSubdivisionDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.subdivideToPoints", inputs);
    }

    /**
     * Subdivides a face to wires
     * @param inputs Face and options for subdivision
     * @returns wires
     * @group extract
     * @shortname wires
     * @drawable true
     */
    subdivideToWires(inputs: Inputs.OCCT.FaceSubdivisionToWiresDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.subdivideToWires", inputs);
    }

    /**
     * Subdivides a face to rectangle wires
     * @param inputs Face and options for subdivision
     * @returns wires
     * @group patterns
     * @shortname rectangle wires on face
     * @drawable true
     */
    subdivideToRectangleWires(inputs: Inputs.OCCT.FaceSubdivideToRectangleWiresDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.subdivideToRectangleWires", inputs);
    }

    /**
     * Subdivides a face to rectangle wires
     * @param inputs Face and options for subdivision
     * @returns wires
     * @group patterns
     * @shortname rectangle holes on face
     * @drawable true
     */
    subdivideToRectangleHoles(inputs: Inputs.OCCT.FaceSubdivideToRectangleHolesDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSFacePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.subdivideToRectangleHoles", inputs);
    }

    /**
     * Subdivides a face to hexagon wires
     * @param inputs Face and options for subdivision
     * @returns wires
     * @group patterns
     * @shortname hexagon wires on face
     * @drawable true
     */
    subdivideToHexagonWires(inputs: Inputs.OCCT.FaceSubdivideToHexagonWiresDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.subdivideToHexagonWires", inputs);
    }

    /**
     * Subdivides a face to point grid with shifts and removals on nth uv rows or columns
     * @param inputs Face and params for subdivision
     * @returns points
     * @group extract
     * @shortname points nth
     * @drawable true
     */
    subdivideToPointsControlled(inputs: Inputs.OCCT.FaceSubdivisionControlledDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.subdivideToPointsControlled", inputs);
    }

    /**
     * Subdivides a face to normals grid
     * @param inputs Face and params for subdivision
     * @returns normal vectors
     * @group extract
     * @shortname normals
     * @drawable true
     */
    subdivideToNormals(inputs: Inputs.OCCT.FaceSubdivisionDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Vector3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.subdivideToNormals", inputs);
    }

    /**
     * Subdivides a face to uv grid
     * @param inputs Face and params for subdivision
     * @returns uv params in array
     * @group extract
     * @shortname uvs
     * @drawable true
     */
    subdivideToUV(inputs: Inputs.OCCT.FaceSubdivisionDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point2[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.subdivideToUV", inputs);
    }

    /**
     * Get point on UV where U and V are described between 0 and 1. These will be mapped to real bounds.
     * @param inputs Face and params for subdivision
     * @returns point
     * @group extract
     * @shortname point on uv
     * @drawable true
     */
    pointOnUV(inputs: Inputs.OCCT.DataOnUVDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.pointOnUV", inputs);
    }

    /**
     * Get normal on UV where U and V are described between 0 and 1. These will be mapped to real bounds.
     * @param inputs Face and params for subdivision
     * @returns normal vector
     * @group extract
     * @shortname normal on uv
     * @drawable true
     */
    normalOnUV(inputs: Inputs.OCCT.DataOnUVDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Vector3> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.normalOnUV", inputs);
    }

    /**
     * Get points on UVs where U and V are described between 0 and 1 in two dimensional arrays. These will be mapped to real bounds.
     * @param inputs Face and params for subdivision
     * @returns points
     * @group extract
     * @shortname points on uvs
     * @drawable true
     */
    pointsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.pointsOnUVs", inputs);
    }

    /**
     * Get normals on UVs where U and V are described between 0 and 1 in two dimensional arrays. These will be mapped to real bounds.
     * @param inputs Face and params for subdivision
     * @returns normals
     * @group extract
     * @shortname normals on uvs
     * @drawable true
     */
    normalsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Vector3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.normalsOnUVs", inputs);
    }

    /**
     * Subdivides a face to points along a line on parameter
     * @param inputs Face and params for subdivision
     * @returns points
     * @group extract
     * @shortname points on param
     * @drawable true
     */
    subdivideToPointsOnParam(inputs: Inputs.OCCT.FaceLinearSubdivisionDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.subdivideToPointsOnParam", inputs);
    }

    /**
     * Gets the wire along the parameter on the face
     * @param inputs Face and param
     * @returns wire
     * @group extract
     * @shortname wire along param
     * @drawable true
     */
    wireAlongParam(inputs: Inputs.OCCT.WireAlongParamDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.wireAlongParam", inputs);
    }

    /**
     * Gets the wires along the parameters on the face
     * @param inputs Face and params
     * @returns wires
     * @group extract
     * @shortname wires along params
     * @drawable true
     */
    wiresAlongParams(inputs: Inputs.OCCT.WiresAlongParamsDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.wiresAlongParams", inputs);
    }

    /**
     * Gets the U min bound of the face
     * @param inputs OCCT Face
     * @returns u min bound
     * @group get
     * @shortname u min
     * @drawable false
     */
    getUMinBound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.getUMinBound", inputs);
    }

    /**
     * Gets the U max bound of the face
     * @param inputs OCCT Face
     * @returns u max bound
     * @group get
     * @shortname u max
     * @drawable false
     */
    getUMaxBound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.getUMaxBound", inputs);
    }

    /**
     * Gets the V min bound of the face
     * @param inputs OCCT Face
     * @returns v min bound
     * @group get
     * @shortname v min
     * @drawable false
     */
    getVMinBound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.getVMinBound", inputs);
    }

    /**
     * Gets the V max bound of the face
     * @param inputs OCCT Face
     * @returns v max bound
     * @group get
     * @shortname v max
     * @drawable false
     */
    getVMaxBound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.getVMaxBound", inputs);
    }

    /**
     * Get the area of the face
     * @param inputs OCCT Face
     * @returns area
     * @group get
     * @shortname face area
     * @drawable false
     */
    getFaceArea(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.getFaceArea", inputs);
    }

    /**
     * Get the areas of the faces
     * @param inputs OCCT Faces
     * @returns areas
     * @group get
     * @shortname areas of faces
     * @drawable false
     */
    getFacesAreas(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.getFacesAreas", inputs);
    }

    /**
     * Get the face center of mass point
     * @param inputs OCCT Face
     * @returns point
     * @group get
     * @shortname center of mass
     * @drawable true
     */
    getFaceCenterOfMass(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.getFaceCenterOfMass", inputs);
    }

    /**
     * Get the center of mass points for faces
     * @param inputs OCCT Faces
     * @returns points
     * @group get
     * @shortname centers of mass
     * @drawable true
     */
    getFacesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.getFacesCentersOfMass", inputs);
    }

    /**
     * Filters points on face
     * @param inputs face and collection of points with options
     * @returns filtered points
     * @group filter
     * @shortname filter face points
     * @drawable true
     */
    filterFacePoints(inputs: Inputs.OCCT.FilterFacePointsDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.filterFacePoints", inputs);
    }

    /**
     * Filters points on faces
     * @param inputs faces and collection of points with options
     * @returns filtered points
     * @group filter
     * @shortname filter points on faces
     * @drawable true
     */
    filterFacesPoints(inputs: Inputs.OCCT.FilterFacesPointsDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[] | Inputs.Base.Point3[][]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.face.filterFacesPoints", inputs);
    }
}
