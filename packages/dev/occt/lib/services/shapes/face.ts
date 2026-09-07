import { Geom_Surface, BitbybitOcctModule, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import { Base } from "../../api/inputs";
import * as Models from "../../api/models";

export class OCCTFace {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Rebuilds a face's surface to relax (lower) or raise its U and V degree.
     * @param inputs face, target U/V degree, tolerance and keepTrim
     * @returns OpenCascade face
     * @group rebuild
     * @shortname rebuild face degree
     * @drawable true
     */
    rebuildFaceDegree(inputs: Inputs.OCCT.RebuildFaceDegreeDto<TopoDS_Face>): TopoDS_Face {
        return this.occ.RebuildFaceDegree(inputs.shape, inputs.uDegree, inputs.vDegree, inputs.tolerance, inputs.keepTrim);
    }

    /**
     * Flips a face's UV parametrization: swap U/V and/or reverse the U or V direction.
     * @param inputs face and flip options
     * @returns OpenCascade face
     * @group rebuild
     * @shortname flip face uv
     * @drawable true
     */
    flipFaceUV(inputs: Inputs.OCCT.FlipFaceUVDto<TopoDS_Face>): TopoDS_Face {
        return this.occ.FlipFaceUV(inputs.shape, inputs.swapUV, inputs.reverseU, inputs.reverseV);
    }

    /**
     * Reparametrizes a face so its U and/or V parameter is ~uniform by arc length (even iso spacing).
     * @param inputs face, directions, samples and tolerance
     * @returns OpenCascade face
     * @group rebuild
     * @shortname normalize face uv
     * @drawable true
     */
    normalizeFaceParametrization(inputs: Inputs.OCCT.NormalizeFaceParametrizationDto<TopoDS_Face>): TopoDS_Face {
        return this.occ.NormalizeFaceParametrization(inputs.shape, inputs.normalizeU, inputs.normalizeV, inputs.samples, inputs.tolerance);
    }

    /**
     * Returns debug info about the face's surface: type, U/V degree, poles/knots, U/V
     * rational/periodic/closed, UV bounds, area, planarity, orientation and wire/edge counts.
     * @param inputs face
     * @returns Face surface debug info
     * @group debug
     * @shortname face debug info
     * @drawable false
     */
    debugInfo(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): Models.OCCT.FaceDebugInfo {
        return JSON.parse(this.occ.FaceDebugInfoJson(inputs.shape)) as Models.OCCT.FaceDebugInfo;
    }

    /**
     * Creates face from triangle definition
     * @param inputs Triangle
     * @returns OpenCascade face
     * @group from base
     * @shortname face from triangle
     * @drawable true
     */
    fromBaseTriangle(inputs: Inputs.OCCT.TriangleBaseDto): TopoDS_Face {
        const wire = this.och.wiresService.createPolygonWire({ points: inputs.triangle });
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Creates faces from mesh definition
     * @param inputs Mesh
     * @returns OpenCascade faces
     * @group from base
     * @shortname faces from mesh
     * @drawable true
     */
    fromBaseMesh(inputs: Inputs.OCCT.MeshBaseDto): TopoDS_Face[] {
        const faces: TopoDS_Face[] = [];
        inputs.mesh.forEach((triangle) => {
            try {
                faces.push(this.fromBaseTriangle({ triangle }));
            } catch {
                console.warn("Failed to make face for triangle", triangle);
            }
        });
        return faces.flat();
    }

    /**
     * Creates a faces from wires on face
     * @param inputs OpenCascade wires and guiding face
     * @returns OpenCascade faces
     * @group from
     * @shortname faces from wires on face
     * @drawable true
     */
    createFacesFromWiresOnFace(inputs: Inputs.OCCT.FacesFromWiresOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Face[] {
        return this.och.facesService.createFacesFromWiresOnFace(inputs);
    }

    /**
     * Creates a face from wire on face
     * @param inputs OpenCascade wire shape and guiding face
     * @returns OpenCascade face shape
     * @group from
     * @shortname face from wire on face
     * @drawable true
     */
    createFaceFromWireOnFace(inputs: Inputs.OCCT.FaceFromWireOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Face {
        return this.och.facesService.createFaceFromWireOnFace(inputs);
    }

    /**
     * Creates a face from wire
     * @param inputs OpenCascade wire shape and indication if face should be planar
     * @returns OpenCascade face shape
     * @group from
     * @shortname face from wire
     * @drawable true
     */
    createFaceFromWire(inputs: Inputs.OCCT.FaceFromWireDto<TopoDS_Wire>): TopoDS_Face {
        return this.och.facesService.createFaceFromWire(inputs);
    }

    /**
     * Creates a face from wires. This can produce hollow faces.
     * @param inputs OpenCascade wire shapes and indication if face should be planar
     * @returns OpenCascade face shape
     * @group from
     * @shortname face from wires
     * @drawable true
     */
    createFaceFromWires(inputs: Inputs.OCCT.FaceFromWiresDto<TopoDS_Wire>): TopoDS_Face {
        return this.och.facesService.createFaceFromWires(inputs);
    }

    /**
     * Creates a face from wires on the guiding face. This can produce hollow faces.
     * @param inputs OpenCascade wire shapes and indication if wire is inside the face
     * @returns OpenCascade face shape
     * @group from
     * @shortname face from wires on face
     * @drawable true
     */
    createFaceFromWiresOnFace(inputs: Inputs.OCCT.FaceFromWiresOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Face {
        return this.och.facesService.createFaceFromWiresOnFace(inputs);
    }

    /**
     * Creates faces from wires
     * @param inputs OpenCascade wire shape and indication if face should be planar
     * @returns OpenCascade face shape
     * @group from
     * @shortname faces from wires
     * @drawable true
     */
    createFacesFromWires(inputs: Inputs.OCCT.FacesFromWiresDto<TopoDS_Wire>): TopoDS_Face[] {
        return this.och.facesService.createFacesFromWires(inputs);
    }

    /**
     * Creates face from multiple circle tangent wires
     * @param inputs OpenCascade circle wire shapes
     * @returns OpenCascade face shape
     * @group from
     * @shortname face from circles tan
     * @drawable true
     */
    createFaceFromMultipleCircleTanWires(inputs: Inputs.OCCT.FaceFromMultipleCircleTanWiresDto<TopoDS_Wire>): TopoDS_Shape {
        return this.och.facesService.createFaceFromMultipleCircleTanWires(inputs);
    }

    /**
     * Creates face from multiple circle tangent wire collections
     * @param inputs OpenCascade circle wire shapes
     * @returns OpenCascade face shape
     * @group from
     * @shortname face from multiple circle tan collections
     * @drawable true
     */
    createFaceFromMultipleCircleTanWireCollections(inputs: Inputs.OCCT.FaceFromMultipleCircleTanWireCollectionsDto<TopoDS_Wire>): TopoDS_Shape {
        return this.och.facesService.createFaceFromMultipleCircleTanWireCollections(inputs);
    }


    /**
     * Creates a face from the surface
     * @param inputs Face shape
     * @returns OpenCascade surface
     * @group from
     * @shortname surface
     * @drawable true
     */
    faceFromSurface(inputs: Inputs.OCCT.ShapeWithToleranceDto<Geom_Surface>): TopoDS_Face {
        return this.och.facesService.faceFromSurface(inputs);
    }

    /**
     * Creates a face from the surface and a wire
     * @param inputs OpenCascade surface, a wire and indication wether face should be created inside or not
     * @returns Face shape
     * @group from
     * @shortname surface and wire
     * @drawable true
     */
    faceFromSurfaceAndWire(inputs: Inputs.OCCT.FaceFromSurfaceAndWireDto<Geom_Surface, TopoDS_Wire>): TopoDS_Face {
        return this.och.facesService.faceFromSurfaceAndWire(inputs);
    }

    /**
     * Creates OpenCascade Polygon face
     * @param inputs Polygon points
     * @returns OpenCascade polygon face
     * @group primitives
     * @shortname polygon
     * @drawable true
     */
    createPolygonFace(inputs: Inputs.OCCT.PolygonDto): TopoDS_Face {
        return this.och.facesService.createPolygonFace(inputs);
    }

    /**
     * Creates OpenCascade circle face
     * @param inputs Circle parameters
     * @returns OpenCascade circle face
     * @group primitives
     * @shortname circle
     * @drawable true
     */
    createCircleFace(inputs: Inputs.OCCT.CircleDto): TopoDS_Face {
        return this.och.entitiesService.createCircle(inputs.radius, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.face) as TopoDS_Face;
    }

    /**
     * Creates OpenCascade hexagons in grid
     * @param inputs Hexagon parameters
     * @returns OpenCascade hexagons in grid
     * @group primitives
     * @shortname hexagons in grid
     * @drawable true
     */
    hexagonsInGrid(inputs: Inputs.OCCT.HexagonsInGridDto): TopoDS_Face[] {
        const hexagonWires = this.och.wiresService.hexagonsInGrid(inputs);
        return this.och.facesService.createFacesFromWires({ shapes: hexagonWires, planar: true });
    }

    /**
     * Creates OpenCascade ellipse face
     * @param inputs Ellipse parameters
     * @returns OpenCascade ellipse face
     * @group primitives
     * @shortname ellipse
     * @drawable true
     */
    createEllipseFace(inputs: Inputs.OCCT.EllipseDto): TopoDS_Face {
        return this.och.entitiesService.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.face) as TopoDS_Face;
    }

    /**
     * Creates OpenCascade square face
     * @param inputs Square parameters
     * @returns OpenCascade square face
     * @group primitives
     * @shortname square
     * @drawable true
     */
    createSquareFace(inputs: Inputs.OCCT.SquareDto): TopoDS_Face {
        return this.och.facesService.createSquareFace(inputs);
    }

    /**
     * Creates OpenCascade rectangle face
     * @param inputs rectangle parameters
     * @returns OpenCascade rectangle
     * @group primitives
     * @shortname rectangle
     * @drawable true
     */
    createRectangleFace(inputs: Inputs.OCCT.RectangleDto): TopoDS_Face {
        return this.och.facesService.createRectangleFace(inputs);
    }

    /**
     * Creates OpenCascade L-polygon face
     * @param inputs L-polygon parameters
     * @returns OpenCascade L-polygon face
     * @group primitives
     * @shortname L-polygon
     * @drawable true
     */
    createLPolygonFace(inputs: Inputs.OCCT.LPolygonDto): TopoDS_Face {
        const wire = this.och.wiresService.createLPolygonWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Creates OpenCascade star face
     * @param inputs Star parameters
     * @returns OpenCascade star face
     * @group primitives
     * @shortname star
     * @drawable true
     */
    createStarFace(inputs: Inputs.OCCT.StarDto): TopoDS_Face {
        const wire = this.och.wiresService.createStarWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Creates OpenCascade christmas tree face
     * @param inputs Christmas tree parameters
     * @returns OpenCascade christmas tree face
     * @group primitives
     * @shortname christmas tree
     * @drawable true
     */
    createChristmasTreeFace(inputs: Inputs.OCCT.ChristmasTreeDto): TopoDS_Face {
        const wire = this.och.wiresService.createChristmasTreeWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Creates OpenCascade parallelogram face
     * @param inputs Parallelogram parameters
     * @returns OpenCascade parallelogram face
     * @group primitives
     * @shortname parallelogram
     * @drawable true
     */
    createParallelogramFace(inputs: Inputs.OCCT.ParallelogramDto): TopoDS_Face {
        const wire = this.och.wiresService.createParallelogramWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Creates OpenCascade heart face
     * @param inputs Heart parameters
     * @returns OpenCascade heart face
     * @group primitives
     * @shortname heart
     * @drawable true
     */
    createHeartFace(inputs: Inputs.OCCT.Heart2DDto): TopoDS_Face {
        const wire = this.och.wiresService.createHeartWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Creates OpenCascade n-gon face
     * @param inputs N-gon parameters
     * @returns OpenCascade n-gon face
     * @group primitives
     * @shortname n-gon
     * @drawable true
     */
    createNGonFace(inputs: Inputs.OCCT.NGonWireDto): TopoDS_Face {
        const wire = this.och.wiresService.createNGonWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Creates OpenCascade I-beam profile face
     * @param inputs I-beam profile parameters
     * @returns OpenCascade I-beam profile face
     * @group beam profiles
     * @shortname I-beam profile
     * @drawable true
     */
    createIBeamProfileFace(inputs: Inputs.OCCT.IBeamProfileDto): TopoDS_Face {
        const wire = this.och.wiresService.createIBeamProfileWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    subdivideToUVOnParam(inputs: Inputs.OCCT.FaceLinearSubdivisionDto<TopoDS_Face>): Base.Point2[] {
        return this.och.facesService.subdivideToUVOnParam(inputs);
    }

    /**
     * Creates OpenCascade H-beam profile face
     * @param inputs H-beam profile parameters
     * @returns OpenCascade H-beam profile face
     * @group beam profiles
     * @shortname H-beam profile
     * @drawable true
     */
    createHBeamProfileFace(inputs: Inputs.OCCT.HBeamProfileDto): TopoDS_Face {
        const wire = this.och.wiresService.createHBeamProfileWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    uvOnFace(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>): Base.Point2 {
        return this.och.facesService.uvOnFace(inputs);
    }

    /**
     * Creates OpenCascade T-beam profile face
     * @param inputs T-beam profile parameters
     * @returns OpenCascade T-beam profile face
     * @group beam profiles
     * @shortname T-beam profile
     * @drawable true
     */
    createTBeamProfileFace(inputs: Inputs.OCCT.TBeamProfileDto): TopoDS_Face {
        const wire = this.och.wiresService.createTBeamProfileWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Creates OpenCascade U-beam profile face
     * @param inputs U-beam profile parameters
     * @returns OpenCascade U-beam profile face
     * @group beam profiles
     * @shortname U-beam profile
     * @drawable true
     */
    createUBeamProfileFace(inputs: Inputs.OCCT.UBeamProfileDto): TopoDS_Face {
        const wire = this.och.wiresService.createUBeamProfileWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Gets the face by providing an index from the shape
     * @param inputs Shape
     * @returns OpenCascade face
     * @group get
     * @shortname face
     * @drawable true
     */
    getFace(inputs: Inputs.OCCT.ShapeIndexDto<TopoDS_Shape>): TopoDS_Face {
        return this.och.shapeGettersService.getFace(inputs);
    }

    /**
     * Gets the faces of the shape in a list
     * @param inputs Shape
     * @returns OpenCascade faces array
     * @group get
     * @shortname faces
     * @drawable true
     */
    getFaces(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Face[] {
        return this.och.shapeGettersService.getFaces(inputs);
    }

    /**
     * Computes reversed face from input face
     * @param inputs Face
     * @returns OpenCascade face
     * @group get
     * @shortname reversed
     * @drawable true
     */
    reversedFace(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): TopoDS_Face {
        const face = inputs.shape as TopoDS_Face;
        const reversed = face.Reversed();
        const result = this.och.converterService.getActualTypeOfShape(reversed);
        reversed.delete();
        return result;
    }

    /**
     * Subdivides a face to point grid
     * @param inputs Face and options for subdivision
     * @returns points
     * @group extract
     * @shortname points
     * @drawable true
     */
    subdivideToPoints(inputs: Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.subdivideToPoints(inputs);
    }

    /**
     * Subdivides a face to wires
     * @param inputs Face and options for subdivision
     * @returns wires
     * @group extract
     * @shortname wires
     * @drawable true
     */
    subdivideToWires(inputs: Inputs.OCCT.FaceSubdivisionToWiresDto<TopoDS_Face>): TopoDS_Wire[] {
        return this.och.facesService.subdivideToWires(inputs);
    }

    /**
     * Subdivides a face to rectangle wires
     * @param inputs Face and options for subdivision
     * @returns wires
     * @group patterns
     * @shortname rectangle wires on face
     * @drawable true
     */
    subdivideToRectangleWires(inputs: Inputs.OCCT.FaceSubdivideToRectangleWiresDto<TopoDS_Face>): TopoDS_Wire[] {
        return this.och.facesService.subdivideToRectangleWires(inputs);
    }

    /**
     * Subdivides a face to rectangle wires
     * @param inputs Face and options for subdivision
     * @returns wires
     * @group patterns
     * @shortname rectangle holes on face
     * @drawable true
     */
    subdivideToRectangleHoles(inputs: Inputs.OCCT.FaceSubdivideToRectangleHolesDto<TopoDS_Face>): TopoDS_Face[] {
        return this.och.facesService.subdivideToRectangleHoles(inputs);
    }

    /**
     * Subdivides a face to hexagon wires
     * @param inputs Face and options for subdivision
     * @returns wires
     * @group patterns
     * @shortname hexagon wires on face
     * @drawable true
     */
    subdivideToHexagonWires(inputs: Inputs.OCCT.FaceSubdivideToHexagonWiresDto<TopoDS_Face>): TopoDS_Wire[] {
        return this.och.facesService.subdivideToHexagonWires(inputs);
    }

    /**
     * Subdivides a face to hexagon holes
     * @param inputs Face and options for subdivision
     * @returns faces
     * @group patterns
     * @shortname hexagon holes on face
     * @drawable true
     */
    subdivideToHexagonHoles(inputs: Inputs.OCCT.FaceSubdivideToHexagonHolesDto<TopoDS_Face>): TopoDS_Face[] {
        return this.och.facesService.subdivideToHexagonHoles(inputs);
    }

    /**
     * Subdivides a face to point grid with shifts and removals on nth uv rows or columns
     * @param inputs Face and params for subdivision
     * @returns points
     * @group extract
     * @shortname points nth
     * @drawable true
     */
    subdivideToPointsControlled(inputs: Inputs.OCCT.FaceSubdivisionControlledDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.subdivideToPointsControlled(inputs);
    }

    /**
     * Subdivides a face to normals grid
     * @param inputs Face and params for subdivision
     * @returns normal vectors
     * @group extract
     * @shortname normals
     * @drawable true
     */
    subdivideToNormals(inputs: Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>): Base.Vector3[] {
        return this.och.facesService.subdivideToNormals(inputs);
    }

    /**
     * Subdivides a face to uv grid
     * @param inputs Face and params for subdivision
     * @returns uv params in array
     * @group extract
     * @shortname uvs
     * @drawable true
     */
    subdivideToUV(inputs: Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>): Base.Point2[] {
        return this.och.facesService.subdivideToUV(inputs);
    }

    /**
     * Get point on UV where U and V are described between 0 and 1. These will be mapped to real bounds.
     * @param inputs Face and params for subdivision
     * @returns point
     * @group extract
     * @shortname point on uv
     * @drawable true
     */
    pointOnUV(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>): Base.Point3 {
        return this.och.facesService.pointOnUV(inputs);
    }

    /**
     * Get normal on UV where U and V are described between 0 and 1. These will be mapped to real bounds.
     * @param inputs Face and params for subdivision
     * @returns normal vector
     * @group extract
     * @shortname normal on uv
     * @drawable true
     */
    normalOnUV(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>): Base.Vector3 {
        return this.och.facesService.faceNormalOnUV(inputs);
    }

    /**
     * Get points on UVs where U and V are described between 0 and 1 in two dimensional arrays. These will be mapped to real bounds.
     * @param inputs Face and params for subdivision
     * @returns points
     * @group extract
     * @shortname points on uvs
     * @drawable true
     */
    pointsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.pointsOnUVs(inputs);
    }

    /**
     * Get normals on UVs where U and V are described between 0 and 1 in two dimensional arrays. These will be mapped to real bounds.
     * @param inputs Face and params for subdivision
     * @returns normals
     * @group extract
     * @shortname normals on uvs
     * @drawable true
     */
    normalsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<TopoDS_Face>): Base.Vector3[] {
        return this.och.facesService.normalsOnUVs(inputs);
    }

    /**
     * Subdivides a face to points along a line on parameter
     * @param inputs Face and params for subdivision
     * @returns points
     * @group extract
     * @shortname points on param
     * @drawable true
     */
    subdivideToPointsOnParam(inputs: Inputs.OCCT.FaceLinearSubdivisionDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.subdivideToPointsOnParam(inputs);
    }

    /**
     * Gets the wire along the parameter on the face
     * @param inputs Face and param
     * @returns wire
     * @group extract
     * @shortname wire along param
     * @drawable true
     */
    wireAlongParam(inputs: Inputs.OCCT.WireAlongParamDto<TopoDS_Face>): TopoDS_Wire {
        return this.och.facesService.wireAlongParam(inputs);
    }

    /**
     * Gets the wires along the parameters on the face
     * @param inputs Face and params
     * @returns wires
     * @group extract
     * @shortname wires along params
     * @drawable true
     */
    wiresAlongParams(inputs: Inputs.OCCT.WiresAlongParamsDto<TopoDS_Face>): TopoDS_Wire[] {
        return this.och.facesService.wiresAlongParams(inputs);
    }

    /**
     * Gets the U min bound of the face
     * @param inputs OCCT Face
     * @returns u min bound
     * @group get
     * @shortname u min
     * @drawable false
     */
    getUMinBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return this.och.facesService.getUMinBound(inputs);
    }

    /**
     * Gets the U max bound of the face
     * @param inputs OCCT Face
     * @returns u max bound
     * @group get
     * @shortname u max
     * @drawable false
     */
    getUMaxBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return this.och.facesService.getUMaxBound(inputs);
    }

    /**
     * Gets the V min bound of the face
     * @param inputs OCCT Face
     * @returns v min bound
     * @group get
     * @shortname v min
     * @drawable false
     */
    getVMinBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return this.och.facesService.getVMinBound(inputs);
    }

    /**
     * Gets the V max bound of the face
     * @param inputs OCCT Face
     * @returns v max bound
     * @group get
     * @shortname v max
     * @drawable false
     */
    getVMaxBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return this.och.facesService.getVMaxBound(inputs);
    }

    /**
     * Get the area of the face
     * @param inputs OCCT Face
     * @returns area
     * @group get
     * @shortname face area
     * @drawable false
     */
    getFaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return this.och.facesService.getFaceArea(inputs);
    }

    /**
     * Get the areas of the faces
     * @param inputs OCCT Faces
     * @returns areas
     * @group get
     * @shortname areas of faces
     * @drawable false
     */
    getFacesAreas(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): number[] {
        return this.och.facesService.getFacesAreas(inputs);
    }

    /**
     * Get the face center of mass point
     * @param inputs OCCT Face
     * @returns point
     * @group get
     * @shortname center of mass
     * @drawable true
     */
    getFaceCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): Base.Point3 {
        return this.och.facesService.getFaceCenterOfMass(inputs);
    }

    /**
     * Get the center of mass points for faces
     * @param inputs OCCT Faces
     * @returns points
     * @group get
     * @shortname centers of mass
     * @drawable true
     */
    getFacesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.getFacesCentersOfMass(inputs);
    }

    /**
     * Filters points on face
     * @param inputs face and collection of points with options
     * @returns filtered points
     * @group filter
     * @shortname filter face points
     * @drawable true
     */
    filterFacePoints(inputs: Inputs.OCCT.FilterFacePointsDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.filterFacePoints(inputs);
    }

    /**
     * Filters points on faces
     * @param inputs faces and collection of points with options
     * @returns filtered points
     * @group filter
     * @shortname filter points on faces
     * @drawable true
     */
    filterFacesPoints(inputs: Inputs.OCCT.FilterFacesPointsDto<TopoDS_Face>): Base.Point3[] | Base.Point3[][] {
        let res: Base.Point3[] | Base.Point3[][] = inputs.shapes.map(s => this.och.facesService.filterFacePoints({ ...inputs, shape: s }));
        if (inputs.flatPointsArray) {
            res = res.flat();
        }
        return res;
    }
}
