export const occtWorkerDeclarations = `declare class BitByBitOCCT {
    occtWorkerManager: OCCTWorkerManager;
    occt: OCCT;
    constructor();
    init(occt: Worker): void;
}declare class OCCTAssembly {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Scans assembly
     * @param inputs Shape to scan
     * @returns Data for assembly preview
     */
    scan(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<any>;
}declare class OCCTBooleans {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Joins separate objects
     * @param inputs Objects to join
     * @returns OpenCascade joined shape
     * @group booleans
     * @shortname union
     * @drawable true
     */
    union(inputs: Inputs.OCCT.UnionDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Does boolean difference operation between a main shape and given shapes
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade difference shape
     * @group booleans
     * @shortname difference
     * @drawable true
     */
    difference(inputs: Inputs.OCCT.DifferenceDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Does boolean intersection operation between a main shape and given shapes
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade intersection of shapes
     * @group booleans
     * @shortname intersection
     * @drawable true
     */
    intersection(inputs: Inputs.OCCT.IntersectionDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
}declare class OCCTFillets {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
    * Fillets OpenCascade Shapes
    * @param inputs Shape, radius and edge indexes to fillet
    * @returns OpenCascade shape with filleted edges
    * @group 3d
    * @shortname fillet
    * @drawable true
    */
    filletEdges(inputs: Inputs.OCCT.FilletDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Chamfer OpenCascade Shape edges
     * @param inputs Shape, distance and edge indexes to chamfer
     * @returns OpenCascade shape with chamfered edges
     * @group 3d
     * @shortname chamfer
    * @drawable true
     */
    chamferEdges(inputs: Inputs.OCCT.ChamferDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Fillets 2d wires or faces
     * @param inputs Shape
     * @returns OpenCascade filleted shape result
     * @group 2d
     * @shortname fillet
     * @drawable true
     */
    fillet2d(inputs: Inputs.OCCT.FilletDto<Inputs.OCCT.TopoDSWirePointer | Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer | Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Fillets two planar edges into a wire by providing a radius, plane, edges and possible solution index if more than one result exists
     * @param inputs Definition for fillets
     * @returns OpenCascade wire shape if solution is found
     * @group 2d
     * @shortname fillet 2 edges
     * @drawable true
     */
    filletTwoEdgesInPlaneIntoAWire(inputs: Inputs.OCCT.FilletTwoEdgesInPlaneDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
}declare class OCCTCurves {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates a 2d ellipse. Be sure to use this geometry only for constructive purposes of modeling, but not for representation. You need to transform these curves to edges in order to draw them.
     * @param inputs 2D Ellipse parameters
     * @returns OpenCascade Geom2d_ellipse
     * @group primitives
     * @shortname ellipse 2d
     */
    geom2dEllipse(inputs: Inputs.OCCT.Geom2dEllipseDto): Promise<Inputs.OCCT.Geom2dCurvePointer>;
    /**
     * Creates a trimmed curve from the basis curve limited between U1 and U2. This curve can't be drawn.
     * @param inputs Bounds and strategy for trimming the curve
     * @returns OpenCascade Geom2d_TrimmedCurve
     * @group create
     * @shortname trimmed 2d
     */
    geom2dTrimmedCurve(inputs: Inputs.OCCT.Geom2dTrimmedCurveDto<Inputs.OCCT.Geom2dCurvePointer>): Promise<Inputs.OCCT.Geom2dCurvePointer>;
    /**
     * Creates a trimmed 2d curve segment between two 2d points. This curve can't be drawn.
     * @param inputs Two 2d points for start and end
     * @returns OpenCascade Geom2d_Segment
     * @group primitives
     * @shortname segment 2d
     */
    geom2dSegment(inputs: Inputs.OCCT.Geom2dSegmentDto): Promise<Inputs.OCCT.Geom2dCurvePointer>;
    /**
     * Gets 2d point represented by [number, number] on a curve at parameter.
     * @param inputs 2D Curve shape and parameter
     * @returns Point as array of 2 numbers
     * @group get
     * @shortname 2d point on curve
     */
    get2dPointFrom2dCurveOnParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.Geom2dCurvePointer>): Promise<Inputs.Base.Point2>;
    /**
     * Creates a circle geom curve
     * @param inputs Axis information and radius
     * @returns Opencascade Geom_Circle curve
     * @group primitives
     * @shortname circle
     * @drawable false
     */
    geomCircleCurve(inputs: Inputs.OCCT.CircleDto): Promise<Inputs.OCCT.GeomCurvePointer>;
    /**
     * Creates an ellipse geom curve
     * @param inputs Axis information and radius
     * @returns Opencascade Geom_Ellipse curve
     * @group primitives
     * @shortname ellipse
     * @drawable false
     */
    geomEllipseCurve(inputs: Inputs.OCCT.EllipseDto): Promise<Inputs.OCCT.GeomCurvePointer>;
}declare class OCCTGeom {
    readonly curves: OCCTCurves;
    readonly surfaces: OCCTSurfaces;
    constructor(occWorkerManager: OCCTWorkerManager);
}declare class OCCTSurfaces {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates an infinite cylindrical surface that can not be drawn. Be sure to use this geometry only for constructive purposes of modeling, but not for representation.
     * @param inputs Cylinder parameters
     * @returns OpenCascade cylindrical surface
     * @group surfaces
     * @shortname cylindrical
     * @drawable false
     */
    cylindricalSurface(inputs: Inputs.OCCT.GeomCylindricalSurfaceDto): Promise<Inputs.OCCT.GeomSurfacePointer>;
    /**
     * Creates a surface from the face
     * @param inputs Face shape
     * @returns OpenCascade geom surface
     * @group surfaces
     * @shortname from face
     * @drawable false
     */
    surfaceFromFace(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.GeomSurfacePointer>;
}declare class OCCTIO {
    readonly occWorkerManager: OCCTWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Saves the step file
     * @param inputs STEP filename and shape to be saved
     * @returns String of a step file
     * @group io
     * @shortname save step
     * @drawable false
     */
    saveShapeSTEP(inputs: Inputs.OCCT.SaveStepDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string>;
}/**
 * Contains various methods for OpenCascade implementation
 */
declare class OCCT {
    readonly occWorkerManager: OCCTWorkerManager;
    readonly shapes: OCCTShapes;
    readonly geom: OCCTGeom;
    readonly fillets: OCCTFillets;
    readonly transforms: OCCTTransforms;
    readonly operations: OCCTOperations;
    readonly booleans: OCCTBooleans;
    io: OCCTIO;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates mesh from the shape
     * @param inputs shape
     * @group drawing
     * @shortname shape to mesh
     * @drawable false
     * @ignore true
     */
    shapeToMesh(inputs: Inputs.OCCT.ShapeToMeshDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.DecomposedMeshDto>;
    /**
     * Deletes shape from the cache to keep memory usage low
     * @param inputs shape
     * @group memory
     * @shortname delete shape
     */
    deleteShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
    /**
     * Deletes shapes from the cache to keep memory usage low
     * @param inputs shape
     * @group memory
     * @shortname delete shapes
     */
    deleteShapes(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
}declare class OCCTOperations {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Lofts wires into a shell
     * @param inputs Loft wires
     * @returns Resulting loft shape
     * @group lofts
     * @shortname loft
     * @drawable true
     */
    loft(inputs: Inputs.OCCT.LoftDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Lofts wires into a shell by using many advanced options
     * @param inputs Advanced loft parameters
     * @returns Resulting loft shell
     * @group lofts
     * @shortname loft adv.
     * @drawable true
     */
    loftAdvanced(inputs: Inputs.OCCT.LoftAdvancedDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Extrudes the face along direction
     * @param inputs Shape to extrude and direction parameter with tolerance
     * @returns Resulting extruded shape
     * @group extrusions
     * @shortname extrude
     * @drawable true
     */
    extrude(inputs: Inputs.OCCT.ExtrudeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Extrudes the shapes along direction
     * @param inputs Shapes to extrude and direction parameter with tolerance
     * @returns Resulting extruded shapes
     * @group extrusions
     * @shortname extrude shapes
     * @drawable true
     */
    extrudeShapes(inputs: Inputs.OCCT.ExtrudeShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Splits the face with edges
     * @param inputs Face to split and edges to split with
     * @returns Resulting split shape
     * @group divisions
     * @shortname split
     * @drawable true
     */
    splitShapeWithShapes(inputs: Inputs.OCCT.SplitDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Revolves the shape around the given direction
     * @param inputs Revolve parameters
     * @returns Resulting revolved shape
     * @group revolutions
     * @shortname revolve
     * @drawable true
     */
    revolve(inputs: Inputs.OCCT.RevolveDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Rotated extrude that is perofrmed on the shape
     * @param inputs Rotated extrusion inputs
     * @returns OpenCascade shape
     * @group extrusions
     * @shortname rotated extrude
     * @drawable true
     */
    rotatedExtrude(inputs: Inputs.OCCT.RotationExtrudeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Pipe shapes along the wire
     * @param inputs Path wire and shapes along the path
     * @returns OpenCascade shape
     * @group pipeing
     * @shortname pipe
     * @drawable true
     */
    pipe(inputs: Inputs.OCCT.ShapeShapesDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Offset for various shapes
     * @param inputs Shape to offset and distance with tolerance
     * @returns Resulting offset shape
     * @group offsets
     * @shortname offset
     * @drawable true
     */
    offset(inputs: Inputs.OCCT.OffsetDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Thickens the shape into a solid by an offset distance
     * @param inputs OpenCascade shape
     * @returns OpenCascade solid shape
     * @group offsets
     * @shortname thicken
     * @drawable true
     */
    makeThickSolidSimple(inputs: Inputs.OCCT.ThisckSolidSimpleDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Thickens the shape into a solid by joining
     * @param inputs OpenCascade shape and options for thickening
     * @returns OpenCascade solid shape
     * @group offsets
     * @shortname joined thicken
     * @drawable true
     */
    makeThickSolidByJoin(inputs: Inputs.OCCT.ThickSolidByJoinDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
}declare class OCCTCompound {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Makes the compound shape, which can include any kind of shapes
     * @param inputs OpenCascade shapes
     * @returns OpenCascade compounded shape
     * @group create
     * @shortname make
     * @drawable true
     */
    makeCompound(inputs: Inputs.OCCT.CompoundShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSCompoundPointer>;
}declare class OCCTEdge {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates linear edge between two points
     * @param inputs Two points between which edge should be created
     * @returns OpenCascade edge
     * @group primitives
     * @shortname line
     * @drawable true
     */
    line(inputs: Inputs.OCCT.LineDto): Promise<Inputs.OCCT.TopoDSEdgePointer>;
    /**
     * Creates arc edge between three points
     * @param inputs Shape, radius and edge indexes to fillet
     * @returns OpenCascade edge
     * @group primitives
     * @shortname arc 3 points
     * @drawable true
     */
    arcThroughThreePoints(inputs: Inputs.OCCT.ArcEdgeThreePointsDto): Promise<Inputs.OCCT.TopoDSEdgePointer>;
    /**
     * Creates OpenCascade circle edge
     * @param inputs Circle parameters
     * @returns OpenCascade circle edge
     * @group primitives
     * @shortname circle
     * @drawable true
     */
    createCircleEdge(inputs: Inputs.OCCT.CircleDto): Promise<Inputs.OCCT.TopoDSEdgePointer>;
    /**
     * Creates OpenCascade ellipse edge
     * @param inputs Ellipse parameters
     * @returns OpenCascade ellipse edge
     * @group primitives
     * @shortname ellipse
     * @drawable true
     */
    createEllipseEdge(inputs: Inputs.OCCT.EllipseDto): Promise<Inputs.OCCT.TopoDSEdgePointer>;
    /**
     * Removes internal faces for the shape
     * @param inputs Shape
     * @returns OpenCascade shape with no internal edges
     * @group shapes
     * @shortname remove internal
     * @drawable true
     */
    removeInternalEdges(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Gets the edge by providing an index from the shape
     * @param inputs Shape
     * @returns OpenCascade edge
     * @group shapes
     * @shortname get edge
     * @drawable true
     */
    getEdge(inputs: Inputs.OCCT.ShapeIndexDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer>;
    /**
     * Gets the edges of a shape in a list
     * @param inputs Shape
     * @returns OpenCascade edge list
     * @group shapes
     * @shortname get edges
     * @drawable true
     */
    getEdges(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer[]>;
    /**
     * Creates an edge from geom curve and geom surface
     * @param inputs shapes are expected to contain 2 array elements - first is geom curve, second geom surface
     * @returns OpenCascade TopoDS_Edge
     * @group from
     * @shortname 2d curve and surface
     * @drawable true
     */
    makeEdgeFromGeom2dCurveAndSurface(inputs: Inputs.OCCT.EdgeFromGeom2dCurveAndSurfaceDto<Inputs.OCCT.Geom2dCurvePointer, Inputs.OCCT.GeomSurfacePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer>;
    /**
     * Gets corner points of edges for a shape. There's no order guarantee here. All duplicates are removed, so when three edges form one corner, that will be represented by a single point in the list.
     * @param inputs Shape that contains edges - wire, face, shell, solid
     * @returns List of points
     * @group get
     * @shortname corners
     * @drawable true
     */
    getCornerPointsOfEdgesForShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[]>;
    /**
     * Gets the edge length
     * @param inputs edge
     * @returns Length
     * @group get
     * @shortname length
     * @drawable false
     */
    getEdgeLength(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<number>;
    /**
     * Gets the lengths of the edges
     * @param inputs edges
     * @returns Lengths
     * @group get
     * @shortname lengths
     * @drawable false
     */
    getEdgesLengths(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<number[]>;
    /**
     * Gets the center of mass for the edge
     * @param inputs edge
     * @returns Point representing center of mass
     * @group get
     * @shortname center of mass
     * @drawable true
     */
    getEdgeCenterOfMass(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Gets the centers of mass for the edges
     * @param inputs edges
     * @returns Points representing centers of mass
     * @group get
     * @shortname centers of mass
     * @drawable true
     */
    getEdgesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]>;
    /**
     * Gets the point on edge at param
     * @param input edge
     * @returns Point on param
     * @group extract
     * @shortname point at param
     * @drawable true
     */
    pointOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Gets the tangent vector on edge at param
     * @param input edge
     * @returns Tangent vector on param
     * @group extract
     * @shortname tangent at param
     * @drawable true
     */
    tangentOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Gets the point on edge at length
     * @param input edge and length
     * @returns Point on edge
     * @group extract
     * @shortname point at length
     * @drawable true
     */
    pointOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Gets the tangent vector on edge at length
     * @param input edge and length
     * @returns Tangent vector on edge
     * @group extract
     * @shortname tangent at length
     * @drawable true
     */
    tangentOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Gets the start point on edge
     * @param input edge
     * @returns Start point
     * @group extract
     * @shortname start point
     * @drawable true
     */
    startPointOnEdge(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Gets the end point on edge
     * @param input edge
     * @returns End point
     * @group extract
     * @shortname end point
     * @drawable true
     */
    endPointOnEdge(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Divides edge by params to points
     * @param input edge and division params
     * @returns Points
     * @group extract
     * @shortname points by params
     * @drawable true
     */
    divideEdgeByParamsToPoints(inputs: Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]>;
    /**
     * Divides edge by length to points
     * @param input edge and division params
     * @returns Points
     * @group extract
     * @shortname points by distance
     * @drawable true
     */
    divideEdgeByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]>;
}declare class OCCTFace {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates a face from wire
     * @param inputs OpenCascade wire shape and indication if face should be planar
     * @returns OpenCascade face shape
     * @group from
     * @shortname wire
     * @drawable true
     */
    createFaceFromWire(inputs: Inputs.OCCT.FaceFromWireDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Creates faces from wires
     * @param inputs OpenCascade wire shape and indication if face should be planar
     * @returns OpenCascade face shape
     * @group from
     * @shortname wires
     * @drawable true
     */
    createFacesFromWires(inputs: Inputs.OCCT.FaceFromWireDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSFacePointer[]>;
    /**
     * Creates a face from the surface
     * @param inputs Face shape
     * @returns OpenCascade surface
     * @group from
     * @shortname surface
     * @drawable true
     */
    faceFromSurface(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.GeomSurfacePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Creates a face from the surface and a wire
     * @param inputs OpenCascade surface, a wire and indication wether face should be created inside or not
     * @returns Face shape
     * @group from
     * @shortname surface and wire
     * @drawable true
     */
    faceFromSurfaceAndWire(inputs: Inputs.OCCT.FaceFromSurfaceAndWireDto<Inputs.OCCT.GeomSurfacePointer, Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Creates OpenCascade Polygon face
     * @param inputs Polygon points
     * @returns OpenCascade polygon face
     * @group primitives
     * @shortname polygon
     * @drawable true
     */
    createPolygonFace(inputs: Inputs.OCCT.PolygonDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Creates OpenCascade circle face
     * @param inputs Circle parameters
     * @returns OpenCascade circle face
     * @group primitives
     * @shortname circle
     * @drawable true
     */
    createCircleFace(inputs: Inputs.OCCT.CircleDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Creates OpenCascade ellipse face
     * @param inputs Ellipse parameters
     * @returns OpenCascade ellipse face
     * @group primitives
     * @shortname ellipse
     * @drawable true
     */
    createEllipseFace(inputs: Inputs.OCCT.EllipseDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Creates OpenCascade square face
     * @param inputs Square parameters
     * @returns OpenCascade square face
     * @group primitives
     * @shortname square
     * @drawable true
     */
    createSquareFace(inputs: Inputs.OCCT.SquareDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Creates OpenCascade rectangle face
     * @param inputs rectangle parameters
     * @returns OpenCascade rectangle
     * @group primitives
     * @shortname rectangle
     * @drawable true
     */
    createRectangleFace(inputs: Inputs.OCCT.RectangleDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Gets the face by providing an index from the shape
     * @param inputs Shape
     * @returns OpenCascade face
     * @group get
     * @shortname face
     * @drawable true
     */
    getFace(inputs: Inputs.OCCT.ShapeIndexDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Gets the faces of the shape in a list
     * @param inputs Shape
     * @returns OpenCascade faces array
     * @group get
     * @shortname faces
     * @drawable true
     */
    getFaces(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSFacePointer[]>;
    /**
     * Computes reversed face from input face
     * @param inputs Face
     * @returns OpenCascade face
     * @group get
     * @shortname reversed
     * @drawable true
     */
    reversedFace(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Subdivides a face to point grid
     * @param inputs Face and params for subdivision
     * @returns points
     * @group extract
     * @shortname points
     * @drawable true
     */
    subdivideToPoints(inputs: Inputs.OCCT.FaceSubdivisionDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]>;
    /**
     * Subdivides a face to point grid with shifts and removals on nth uv rows or columns
     * @param inputs Face and params for subdivision
     * @returns points
     * @group extract
     * @shortname points nth
     * @drawable true
     */
    subdivideToPointsControlled(inputs: Inputs.OCCT.FaceSubdivisionControlledDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]>;
    /**
     * Subdivides a face to normals grid
     * @param inputs Face and params for subdivision
     * @returns normal vectors
     * @group extract
     * @shortname normals
     * @drawable true
     */
    subdivideToNormals(inputs: Inputs.OCCT.FaceSubdivisionDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Vector3[]>;
    /**
     * Subdivides a face to uv grid
     * @param inputs Face and params for subdivision
     * @returns uv params in array
     * @group extract
     * @shortname uvs
     * @drawable true
     */
    subdivideToUV(inputs: Inputs.OCCT.FaceSubdivisionDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point2[]>;
    /**
     * Get point on UV where U and V are described between 0 and 1. These will be mapped to real bounds.
     * @param inputs Face and params for subdivision
     * @returns point
     * @group extract
     * @shortname point on uv
     * @drawable true
     */
    pointOnUV(inputs: Inputs.OCCT.DataOnUVDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Get normal on UV where U and V are described between 0 and 1. These will be mapped to real bounds.
     * @param inputs Face and params for subdivision
     * @returns normal vector
     * @group extract
     * @shortname normal on uv
     * @drawable true
     */
    normalOnUV(inputs: Inputs.OCCT.DataOnUVDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Vector3>;
    /**
     * Get points on UVs where U and V are described between 0 and 1 in two dimensional arrays. These will be mapped to real bounds.
     * @param inputs Face and params for subdivision
     * @returns points
     * @group extract
     * @shortname points on uvs
     * @drawable true
     */
    pointsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]>;
    /**
     * Get normals on UVs where U and V are described between 0 and 1 in two dimensional arrays. These will be mapped to real bounds.
     * @param inputs Face and params for subdivision
     * @returns normals
     * @group extract
     * @shortname normals on uvs
     * @drawable true
     */
    normalsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Vector3[]>;
    /**
     * Subdivides a face to points along a line on parameter
     * @param inputs Face and params for subdivision
     * @returns points
     * @group extract
     * @shortname points on param
     * @drawable true
     */
    subdivideToPointsOnParam(inputs: Inputs.OCCT.FaceLinearSubdivisionDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]>;
    /**
     * Gets the U min bound of the face
     * @param inputs OCCT Face
     * @returns u min bound
     * @group get
     * @shortname u min
     * @drawable false
     */
    getUMinBound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number>;
    /**
     * Gets the U max bound of the face
     * @param inputs OCCT Face
     * @returns u max bound
     * @group get
     * @shortname u max
     * @drawable false
     */
    getUMaxBound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number>;
    /**
     * Gets the V min bound of the face
     * @param inputs OCCT Face
     * @returns v min bound
     * @group get
     * @shortname v min
     * @drawable false
     */
    getVMinBound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number>;
    /**
     * Gets the V max bound of the face
     * @param inputs OCCT Face
     * @returns v max bound
     * @group get
     * @shortname v max
     * @drawable false
     */
    getVMaxBound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number>;
    /**
     * Get the area of the face
     * @param inputs OCCT Face
     * @returns area
     * @group get
     * @shortname face area
     * @drawable false
     */
    getFaceArea(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number>;
    /**
     * Get the areas of the faces
     * @param inputs OCCT Faces
     * @returns areas
     * @group get
     * @shortname areas of faces
     * @drawable false
     */
    getFacesAreas(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number[]>;
    /**
     * Get the face center of mass point
     * @param inputs OCCT Face
     * @returns point
     * @group get
     * @shortname center of mass
     * @drawable true
     */
    getFaceCenterOfMass(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Get the face center of mass point
     * @param inputs OCCT Faces
     * @returns points
     * @group get
     * @shortname centers of mass
     * @drawable true
     */
    getFacesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]>;
}declare class OCCTShapes {
    readonly edge: OCCTEdge;
    readonly wire: OCCTWire;
    readonly face: OCCTFace;
    readonly shell: OCCTShell;
    readonly solid: OCCTSolid;
    readonly compound: OCCTCompound;
    constructor(occWorkerManager: OCCTWorkerManager);
}declare class OCCTShell {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates a shell from faces
     * @param inputs OpenCascade shell and faces
     * @returns OpenCascade shell
     * @group create
     * @shortname sew
     * @drawable true
     */
    sewFaces(inputs: Inputs.OCCT.SewDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSShellPointer>;
    /**
     * Get shell surface area
     * @param inputs shell shape
     * @returns Surface area
     * @group get
     * @shortname area
     * @drawable false
     */
    getShellSurfaceArea(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShellPointer>): Promise<number>;
}declare class OCCTSolid {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates Solid From shell that must be closed
     * @param inputs Closed shell to make into solid
     * @returns OpenCascade Solid
     * @group from
     * @shortname shell
     * @drawable true
     */
    fromClosedShell(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShellPointer>): Promise<Inputs.OCCT.TopoDSSolidPointer>;
    /**
     * Creates OpenCascade Box
     * @param inputs Box size and center
     * @returns OpenCascade Box
     * @group primitives
     * @shortname box
     * @drawable true
     */
    createBox(inputs: Inputs.OCCT.BoxDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
    /**
     * Creates OpenCascade Box from corner
     * @param inputs Box size and corner coordinates
     * @returns OpenCascade Box
     * @group primitives
     * @shortname box corner
     * @drawable true
     */
    createBoxFromCorner(inputs: Inputs.OCCT.BoxFromCornerDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
    /**
     * Creates OpenCascade Cylinder
     * @param inputs Cylinder parameters
     * @returns OpenCascade Cylinder
     * @group primitives
     * @shortname cylinder
     * @drawable true
     */
    createCylinder(inputs: Inputs.OCCT.CylinderDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
    /**
     * Creates OpenCascade Cylinders on simple bit by bit lines represented by two points
     * @param inputs Cylinder parameters
     * @returns OpenCascade Cylinder
     * @group primitives
     * @shortname cylinders on lines
     * @drawable true
     */
    createCylindersOnLines(inputs: Inputs.OCCT.CylindersOnLinesDto): Promise<Inputs.OCCT.TopoDSSolidPointer[]>;
    /**
     * Creates OpenCascade Sphere
     * @param inputs Sphere radius and center
     * @returns OpenCascade Sphere
     * @group primitives
     * @shortname sphere
     * @drawable true
     */
    createSphere(inputs: Inputs.OCCT.SphereDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
    /**
     * Creates OpenCascade Cone
     * @param inputs Cone parameters
     * @returns OpenCascade cone shape
     * @group primitives
     * @shortname cone
     * @drawable true
     */
    createCone(inputs: Inputs.OCCT.ConeDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
    /**
     * Get solid surface area
     * @param inputs Closed solid shape
     * @returns Surface area
     * @group get
     * @shortname area
     * @drawable false
     */
    getSolidSurfaceArea(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<number>;
    /**
    * Get solid volume
    * @param inputs Closed solid shape
    * @returns volume
    * @group get
    * @shortname volume
    * @drawable false
    */
    getSolidVolume(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<number>;
    /**
    * Get solids volumes
    * @param inputs Closed solid shapes
    * @returns volumes
    * @group get
    * @shortname volumes
    * @drawable false
    */
    getSolidsVolumes(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<number[]>;
    /**
    * Get solid center of mass
    * @param inputs Closed solid shape
    * @returns center of mass point
    * @group get
    * @shortname center of mass
    * @drawable true
    */
    getSolidCenterOfMass(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<Inputs.Base.Point3>;
    /**
     * Get centers of mass of solids
     * @param inputs Closed solid shapes
     * @returns Points indicating centers of mass
    * @group get
    * @shortname centers of mass
    * @drawable true
     */
    getSolidsCentersOfMass(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<Inputs.Base.Point3[]>;
}declare class OCCTWire {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates OpenCascade Polygon wire
     * @param inputs Polygon points
     * @returns OpenCascade polygon wire shape
     * @group via points
     * @shortname polygon
     * @drawable true
     */
    createPolygonWire(inputs: Inputs.OCCT.PolygonDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
    * Creates OpenCascade Bezier wire
    * @param inputs Points through which to make bezier curve
    * @returns OpenCascade Bezier wire
    * @group via points
    * @shortname bezier
    * @drawable true
    */
    createBezier(inputs: Inputs.OCCT.BezierDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Creates OpenCascade BSpline wire from points. This method can be used to create nicely shaped (periodic) loops.
     * @param inputs Points through which to make the curve, periodic bool and tolerance
     * @returns OpenCascade BSpline wire
     * @group via points
     * @shortname interpolate
     * @drawable true
     */
    interpolatePoints(inputs: Inputs.OCCT.InterpolationDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Creates OpenCascade BSPline wire
     * @param inputs Points through which to make BSpline
     * @returns OpenCascade BSpline wire
     * @group via points
     * @shortname bspline
     * @drawable true
     */
    createBSpline(inputs: Inputs.OCCT.BSplineDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Combines OpenCascade edges and wires into a single wire
     * @param inputs List of shapes of edges and wires
     * @returns OpenCascade wire
     * @group build
     * @shortname combine
     * @drawable true
     */
    combineEdgesAndWiresIntoAWire(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSWirePointer | Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Adds OpenCascade edges and wires into another wire
     * @param inputs List of shapes of edges and wires and a single shape wire to which edges need to be added
     * @returns OpenCascade wire
     * @group build
     * @shortname extend
     * @drawable true
     */
    addEdgesAndWiresToWire(inputs: Inputs.OCCT.ShapeShapesDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSWirePointer | Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
    * Divides OpenCascade wire to points blindly following its parametric space
    * @param inputs Describes into how many points should the wire be divided
    * @returns Points on wire
    * @group extract
    * @shortname points by params
    * @drawable true
    */
    divideWireByParamsToPoints(inputs: Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3[]>;
    /**
    * Divides OpenCascade wire to equal distance points
    * @param inputs Describes into how many points should the wire be divided
    * @returns Points on wire
    * @group extract
    * @shortname points by distance
    * @drawable true
    */
    divideWireByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3[]>;
    /**
    * Evaluates point on a wire at parameter value between 0 and 1, being start and end points
    * @param inputs Wire shape and parameter
    * @returns Point as array of 3 numbers
    * @group extract
    * @shortname point at param
    * @drawable true
    */
    pointOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3>;
    /**
    * Evaluates point on a wire at certain length
    * @param inputs Wire shape and length value
    * @returns Point as array of 3 numbers
    * @group extract
    * @shortname point at length
    * @drawable true
    */
    pointOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3>;
    /**
    * Evaluates tangent vector on a wire at parameter value between 0 and 1, being start and end points
    * @param inputs Wire shape and parameter
    * @returns Tangent vector as array of 3 numbers
    * @group extract
    * @shortname tangent at param
    * @drawable true
    */
    tangentOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Vector3>;
    /**
    * Evaluates tangent vector on a wire at certain length
    * @param inputs Wire shape and length value
    * @returns Tangent vector as array of 3 numbers
    * @group extract
    * @shortname tangent at length
    * @drawable true
    */
    tangentOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Vector3>;
    /**
    * Computes 3 derivative vectors of a curve at a given length
    * @param inputs Wire shape and length value
    * @returns Three arrays of vectors. Each vector represents derivatives in order - first, second, third
    * @group extract
    * @shortname derivatives at length
    * @drawable false
    */
    derivativesOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSWirePointer>): Promise<[Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3]>;
    /**
    * Computes 3 derivative vectors of a curve on parameter between 0 and 1.
    * @param inputs Wire shape and parameter value
    * @returns Three arrays of vectors. Each vector represents derivatives in order - first, second, third
    * @group extract
    * @shortname derivatives at param
    * @drawable false
    */
    derivativesOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSWirePointer>): Promise<[Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3]>;
    /**
    * Computes the star point on the wire at param 0
    * @param inputs Wire shape
    * @returns The length of the wire
    * @group extract
    * @shortname start point
    * @drawable true
    */
    startPointOnWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3>;
    /**
    * Computes the end point on the wire at param 1
    * @param inputs Wire shape
    * @returns The length of the wire
    * @group extract
    * @shortname end point
    * @drawable true
    */
    endPointOnWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Creates OpenCascade circle wire
     * @param inputs Circle parameters
     * @returns OpenCascade circle wire
     * @group primitives
     * @shortname circle
     * @drawable true
     */
    createCircleWire(inputs: Inputs.OCCT.CircleDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Creates OpenCascade square wire
     * @param inputs Square parameters
     * @returns OpenCascade square wire
     * @group primitives
     * @shortname square
     * @drawable true
     */
    createSquareWire(inputs: Inputs.OCCT.SquareDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Creates OpenCascade star wire
     * @param inputs star parameters
     * @returns OpenCascade star wire
     * @group primitives
     * @shortname star
     * @drawable true
     */
    createStarWire(inputs: Inputs.OCCT.StarDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Creates OpenCascade n-gon wire
     * @param inputs ngon parameters
     * @returns OpenCascade ngon wire
     * @group primitives
     * @shortname n-gon
     * @drawable true
     */
    createNGonWire(inputs: Inputs.OCCT.NGonWireDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Creates n  parallelogram wire
     * @param inputs parallelogram parameters
     * @returns OpenCascade star wire
     * @group primitives
     * @shortname parallelogram
     * @drawable true
     */
    createParallelogramWire(inputs: Inputs.OCCT.ParallelogramDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Creates OpenCascade rectangle wire
     * @param inputs rectangle parameters
     * @returns OpenCascade rectangle
     * @group primitives
     * @shortname rectangle
     * @drawable true
     */
    createRectangleWire(inputs: Inputs.OCCT.RectangleDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Creates OpenCascade ellipse wire
     * @param inputs Ellipse parameters
     * @returns OpenCascade ellipse wire
     * @group primitives
     * @shortname ellipse
     * @drawable true
     */
    createEllipseWire(inputs: Inputs.OCCT.EllipseDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Gets the wire by providing an index from the shape
     * @param inputs Shape
     * @returns OpenCascade wire
     * @group get
     * @shortname wire
     * @drawable true
     */
    getWire(inputs: Inputs.OCCT.ShapeIndexDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Gets the wires by providing an index from the shape
     * @param inputs Shape
     * @returns OpenCascade wires
     * @group get
     * @shortname wires
     * @drawable true
     */
    getWires(inputs: Inputs.OCCT.ShapeIndexDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Computes reversed wire from input wire
     * @param inputs Shape
     * @returns OpenCascade wire
     * @group get
     * @shortname reversed
     * @drawable true
     */
    reversedWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Gets the wire length
     * @param inputs wire
     * @returns Length
     * @group get
     * @shortname length
     * @drawable false
     */
    getWireLength(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<number>;
    /**
     * Gets the lengths of wires
     * @param inputs wires
     * @returns Lengths
     * @group get
     * @shortname lengths
     * @drawable false
     */
    getWiresLengths(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSWirePointer>): Promise<number[]>;
    /**
     * Places a wire on the face by mapping it's 2d coordinates to UV space. Wire must be positioned on the ground XZ plane for this to work.
     * @param inputs two shapes - first a wire and second a face
     * @returns OpenCascade wire
     * @group place
     * @shortname wire on face
     * @drawable true
     */
    placeWireOnFace(inputs: Inputs.OCCT.WireOnFaceDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Places multiple wires on the face by mapping it's 2d coordinates to UV space. Wires must be positioned on the ground XZ plane for this to work.
     * @param inputs a face and a list of wires
     * @returns OpenCascade wires
     * @group place
     * @shortname wires on face
     * @drawable true
     */
    placeWiresOnFace(inputs: Inputs.OCCT.ShapeShapesDto<Inputs.OCCT.TopoDSFacePointer, Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]>;
}declare class OCCTTransforms {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Transforms the shape
     * @param inputs Transformation description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname transform
     * @drawable true
     */
    transform(inputs: Inputs.OCCT.TransformDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Rotate the shape
     * @param inputs Rotation description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname rotate
     * @drawable true
     */
    rotate(inputs: Inputs.OCCT.RotateDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Align the shape
     * @param inputs Align description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname align
     * @drawable true
     */
    align(inputs: Inputs.OCCT.AlignDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Translates the shape
     * @param inputs Translation description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname translate
     * @drawable true
     */
    translate(inputs: Inputs.OCCT.TranslateDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Scales the shape
     * @param inputs Scale description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname scale
     * @drawable true
     */
    scale(inputs: Inputs.OCCT.ScaleDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Scales the shape in 3D
     * @param inputs Scale 3D description
     * @returns OpenCascade scaled shape
     * @group on single shape
     * @shortname scale 3d
     * @drawable true
     */
    scale3d(inputs: Inputs.OCCT.Scale3DDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Mirrors the shape
     * @param inputs Mirror axis origin, axis direction and shape
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname mirror
     * @drawable true
     */
    mirror(inputs: Inputs.OCCT.MirrorDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Mirrors the shape along the normal and origin
     * @param inputs Normal for mirroring with origin
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname mirror normal
     * @drawable true
     */
    mirrorAlongNormal(inputs: Inputs.OCCT.MirrorAlongNormalDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Transforms the array of shapes with transformations
     * @param inputs Transformation descriptions
     * @returns OpenCascade shapes
     * @group on multiple shapes
     * @shortname transforms
     * @drawable true
     */
    transformShapes(inputs: Inputs.OCCT.TransformShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
    /**
     * Rotate the shapes with rotations
     * @param inputs Rotation descriptions
     * @returns OpenCascade shapes
     * @group on multiple shapes
     * @shortname rotations
     * @drawable true
     */
    rotateShapes(inputs: Inputs.OCCT.RotateShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
    /**
     * Align the shapes with alignments
     * @param inputs Align descriptions
     * @returns OpenCascade shapes
     * @group on multiple shapes
     * @shortname alignments
     * @drawable true
     */
    alignShapes(inputs: Inputs.OCCT.AlignShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
    /**
     * Translates the shapes with translations
     * @param inputs Translation descriptions
     * @returns OpenCascade shapes
     * @group on multiple shapes
     * @shortname translations
     * @drawable true
     */
    translateShapes(inputs: Inputs.OCCT.TranslateShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
    /**
     * Scales the shapes with scale factors
     * @param inputs Scale descriptions
     * @returns OpenCascade shapes
     * @group on multiple shapes
     * @shortname scales
     * @drawable true
     */
    scaleShapes(inputs: Inputs.OCCT.ScaleShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
    /**
     * Scales the shape in 3D
     * @param inputs Scale 3D descriptions
     * @returns OpenCascade scaled shapes
     * @group on multiple shapes
     * @shortname scales 3d
     * @drawable true
     */
    scale3dShapes(inputs: Inputs.OCCT.Scale3DShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
    /**
     * Mirrors the shapes with multiple mirrors
     * @param inputs Mirror axis origins, axis directions and shapes
     * @returns OpenCascade shapes
     * @group on multiple shapes
     * @shortname mirrors
     * @drawable true
     */
    mirrorShapes(inputs: Inputs.OCCT.MirrorShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
    /**
     * Mirrors the shapes along the normal and origin
     * @param inputs Normals for mirroring with origins
     * @returns OpenCascade shapes
     * @group on multiple shapes
     * @shortname mirrors normal
     * @drawable true
     */
    mirrorAlongNormalShapes(inputs: Inputs.OCCT.MirrorAlongNormalShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
}`;
    