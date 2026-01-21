import { Inputs, Models } from "@bitbybit-dev/occt";
import { ShapeParser } from "../../../shape-parser";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";
export class OCCTWire {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
      * Creates linear wire from base line format {start: Point3, end: Point3}
      * @param inputs base line
      * @returns OpenCascade wire
      * @group from base
      * @shortname wire from base line
      * @drawable true
      */
    fromBaseLine(inputs: Inputs.OCCT.LineBaseDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.fromBaseLine", inputs);
    }

    /**
     * Creates linear wires from base lines format {start: Point3, end: Point3}[]
     * @param inputs base lines
     * @returns OpenCascade wires
     * @group from base
     * @shortname wires from base lines
     * @drawable true
     */
    fromBaseLines(inputs: Inputs.OCCT.LineBaseDto): Promise<Inputs.OCCT.TopoDSWirePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.fromBaseLines", inputs);
    }

    /**
     * Creates linear wire from base segment format [Point3, Point3]
     * @param inputs base segment
     * @returns OpenCascade wire
     * @group from base
     * @shortname wire from base segment
     * @drawable true
     */
    fromBaseSegment(inputs: Inputs.OCCT.SegmentBaseDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.fromBaseSegment", inputs);
    }

    /**
     * Creates linear wires from base segments format [Point3, Point3][]
     * @param inputs base segments
     * @returns OpenCascade wires
     * @group from base
     * @shortname wires from base segments
     * @drawable true
     */
    fromBaseSegments(inputs: Inputs.OCCT.SegmentsBaseDto): Promise<Inputs.OCCT.TopoDSWirePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.fromBaseSegments", inputs);
    }

    /**
     * Creates wire from collection of points
     * @param inputs Points
     * @returns OpenCascade wire
     * @group from base
     * @shortname wire from points
     * @drawable true
     */
    fromPoints(inputs: Inputs.OCCT.PointsDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.fromPoints", inputs);
    }

    /**
     * Creates wire from polyline definition
     * @param inputs Polyline
     * @returns OpenCascade wire
     * @group from base
     * @shortname wire from polyline
     * @drawable true
     */
    fromBasePolyline(inputs: Inputs.OCCT.PolylineBaseDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.fromBasePolyline", inputs);
    }

    /**
     * Creates wire from triangle definition
     * @param inputs Triangle
     * @returns OpenCascade wire
     * @group from base
     * @shortname wire from triangle
     * @drawable true
     */
    fromBaseTriangle(inputs: Inputs.OCCT.TriangleBaseDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.fromBaseTriangle", inputs);
    }

    /**
     * Creates wires from mesh definition
     * @param inputs Mesh
     * @returns OpenCascade wires
     * @group from base
     * @shortname wires from mesh
     * @drawable true
     */
    fromBaseMesh(inputs: Inputs.OCCT.MeshBaseDto): Promise<Inputs.OCCT.TopoDSWirePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.fromBaseMesh", inputs);
    }

    /**
     * Creates OpenCascade Polygon wire
     * @param inputs Polygon points
     * @returns OpenCascade polygon wire shape
     * @group via points
     * @shortname polygon
     * @drawable true
     */
    createPolygonWire(inputs: Inputs.OCCT.PolygonDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createPolygonWire", inputs);
    }

    /**
     * Creates OpenCascade Polygons
     * @param inputs Polygon points
     * @returns OpenCascade polygon wires shapes
     * @group multiple
     * @shortname polygons
     * @drawable true
     */
    createPolygons(inputs: Inputs.OCCT.PolygonsDto): Promise<Inputs.OCCT.TopoDSWirePointer[] | Inputs.OCCT.TopoDSCompoundPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createPolygons", inputs);
    }

    /**
     * Creates OpenCascade line wire
     * @param inputs line start and end point
     * @returns OpenCascade line wire shape
     * @group via points
     * @shortname line
     * @drawable true
     */
    createLineWire(inputs: Inputs.OCCT.LineDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createLineWire", inputs);
    }

    /**
     * Creates OpenCascade line wire with extensions
     * @param inputs line start and end point and extension lengths for both start and end
     * @returns OpenCascade line wire shape
     * @group via points
     * @shortname line with extensions
     * @drawable true
     */
    createLineWireWithExtensions(inputs: Inputs.OCCT.LineWithExtensionsDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createLineWireWithExtensions", inputs);
    }

    /**
     * Creates OpenCascade lines
     * @param inputs lines with start and end points
     * @returns OpenCascade line wire shapes
     * @group multiple
     * @shortname lines
     * @drawable true
     */
    createLines(inputs: Inputs.OCCT.LinesDto): Promise<Inputs.OCCT.TopoDSWirePointer[] | Inputs.OCCT.TopoDSCompoundPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createLines", inputs);
    }

    /**
     * Splits a wire on a set of given points
     * @param inputs wire and a list of points
     * @returns OpenCascade line wire shapes
     * @group extract
     * @shortname split on points
     * @drawable true
     */
    splitOnPoints(inputs: Inputs.OCCT.SplitWireOnPointsDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.splitOnPoints", inputs);
    }

    /**
     * Transform shape wires to points ordered in lists. 
     * This also removes duplicated points between start end end points of 
     * consecutive edges on the wire
     * @param inputs OCCT shape
     * @returns point lists for wires
     * @group extract
     * @shortname wires to points
     * @drawable false
     */
    wiresToPoints(inputs: Inputs.OCCT.WiresToPointsDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[][]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.wiresToPoints", inputs);
    }

    /**
     * Creates OpenCascade polyline wire
     * @param inputs polyline points
     * @returns OpenCascade polyline wire shape
     * @group via points
     * @shortname polyline
     * @drawable true
     */
    createPolylineWire(inputs: Inputs.OCCT.PolylineDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createPolylineWire", inputs);
    }

    /**
     * Creates zig zag between two wires
     * @param inputs two wires and zig zag parameters
     * @returns OpenCascade polyline wire shape
     * @group via wires
     * @shortname zig zag between two wires
     * @drawable true
     */
    createZigZagBetweenTwoWires(inputs: Inputs.OCCT.ZigZagBetweenTwoWiresDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createZigZagBetweenTwoWires", inputs);
    }

    /**
     * Creates a tangent wire enclosing two planar circles
     * @param inputs two circle wires and tolerance
     * @returns OpenCascade wire shape
     * @group via wires
     * @shortname tangent wire from two circles
     * @drawable true
     */
    createWireFromTwoCirclesTan(inputs: Inputs.OCCT.WireFromTwoCirclesTanDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createWireFromTwoCirclesTan", inputs);
    }

    /**
     * Creates OpenCascade polyline wires
     * @param inputs polylines
     * @returns OpenCascade polyline wire shapes
     * @group multiple
     * @shortname polylines
     * @drawable true
     */
    createPolylines(inputs: Inputs.OCCT.PolylinesDto): Promise<Inputs.OCCT.TopoDSWirePointer[] | Inputs.OCCT.TopoDSCompoundPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createPolylines", inputs);
    }

    /**
    * Creates OpenCascade Bezier wire
    * @param inputs Points through which to make bezier curve
    * @returns OpenCascade Bezier wire
    * @group via points
    * @shortname bezier
    * @drawable true
    */
    createBezier(inputs: Inputs.OCCT.BezierDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createBezier", inputs);
    }

    /**
    * Creates OpenCascade Bezier wire with weights
    * @param inputs Points through which to make bezier curve and weights on those points which are used to control the curve
    * @returns OpenCascade Bezier wire
    * @group via points
    * @shortname bezier weights
    * @drawable true
    */
    createBezierWeights(inputs: Inputs.OCCT.BezierWeightsDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createBezierWeights", inputs);
    }

    /**
    * Creates OpenCascade Bezier wires
    * @param inputs Multiple bezier wire definitions
    * @returns OpenCascade Bezier wires
    * @group multiple
    * @shortname bezier wires
    * @drawable true
    */
    createBezierWires(inputs: Inputs.OCCT.BezierWiresDto): Promise<Inputs.OCCT.TopoDSWirePointer[] | Inputs.OCCT.TopoDSCompoundPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createBezierWires", inputs);
    }

    /**
     * Creates OpenCascade BSpline wire from points. This method can be used to create nicely shaped (periodic) loops.
     * @param inputs Points through which to make the curve, periodic bool and tolerance
     * @returns OpenCascade BSpline wire
     * @group via points
     * @shortname interpolate
     * @drawable true
     */
    interpolatePoints(inputs: Inputs.OCCT.InterpolationDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.interpolatePoints", inputs);
    }

    /**
     * Creates OpenCascade multiple interpolated wires
     * @param inputs Interpolated wire definitions
     * @returns OpenCascade BSpline wires
     * @group multiple
     * @shortname interpolate wires
     * @drawable true
     */
    interpolateWires(inputs: Inputs.OCCT.InterpolateWiresDto): Promise<Inputs.OCCT.TopoDSWirePointer[] | Inputs.OCCT.TopoDSCompoundPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.interpolateWires", inputs);
    }

    /**
     * Creates OpenCascade BSPline wire
     * @param inputs Points through which to make BSpline
     * @returns OpenCascade BSpline wire
     * @group via points
     * @shortname bspline
     * @drawable true
     */
    createBSpline(inputs: Inputs.OCCT.BSplineDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createBSpline", inputs);
    }

    /**
     * Creates OpenCascade BSPline wires
     * @param inputs Points through which to make BSpline
     * @returns OpenCascade BSpline wires
     * @group multiple
     * @shortname bsplines
     * @drawable true
     */
    createBSplines(inputs: Inputs.OCCT.BSplinesDto): Promise<Inputs.OCCT.TopoDSWirePointer[] | Inputs.OCCT.TopoDSCompoundPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createBSplines", inputs);
    }

    /**
     * Combines OpenCascade edges and wires into a single wire
     * @param inputs List of shapes of edges and wires
     * @returns OpenCascade wire
     * @group build
     * @shortname combine
     * @drawable true
     */
    combineEdgesAndWiresIntoAWire(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSWirePointer | Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.combineEdgesAndWiresIntoAWire", inputs);
    }

    /**
     * Creates wire from edge
     * @param inputs An edge to transform into a wire
     * @returns OpenCascade wire
     * @group build
     * @shortname wire from edge
     * @drawable true
     */
    createWireFromEdge(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createWireFromEdge", inputs);
    }

    /**
     * Adds OpenCascade edges and wires into another wire
     * @param inputs List of shapes of edges and wires and a single shape wire to which edges need to be added
     * @returns OpenCascade wire
     * @group build
     * @shortname extend
     * @drawable true
     */
    addEdgesAndWiresToWire(inputs: Inputs.OCCT.ShapeShapesDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSWirePointer | Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.addEdgesAndWiresToWire", inputs);
    }

    /**
    * Divides OpenCascade wire to points blindly following its parametric space
    * @param inputs Describes into how many points should the wire be divided
    * @returns Points on wire
    * @group extract
    * @shortname points by params
    * @drawable true
    */
    divideWireByParamsToPoints(inputs: Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.divideWireByParamsToPoints", inputs);
    }

    /**
    * Divides OpenCascade wires to points blindly following its parametric space
    * @param inputs Describes into how many points should the wires be divided
    * @returns Points on wire
    * @group extract from wires
    * @shortname points by params
    * @drawable true
    */
    divideWiresByParamsToPoints(inputs: Inputs.OCCT.DivideShapesDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3[][]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.divideWiresByParamsToPoints", inputs);
    }

    /**
    * Divides OpenCascade wire to equal distance points
    * @param inputs Describes into how many points should the wire be divided
    * @returns Points on wire
    * @group extract
    * @shortname points by distance
    * @drawable true
    */
    divideWireByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.divideWireByEqualDistanceToPoints", inputs);
    }

    /**
    * Divides OpenCascade wires to equal distance points
    * @param inputs Describes into how many points should the wires be divided
    * @returns Points on wire
    * @group extract from wires
    * @shortname points by distance
    * @drawable true
    */
    divideWiresByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideShapesDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.divideWiresByEqualDistanceToPoints", inputs);
    }

    /**
    * Evaluates point on a wire at parameter value between 0 and 1, being start and end points
    * @param inputs Wire shape and parameter
    * @returns Point as array of 3 numbers
    * @group extract
    * @shortname point at param
    * @drawable true
    */
    pointOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.pointOnWireAtParam", inputs);
    }

    /**
    * Evaluates point on a wire at certain length
    * @param inputs Wire shape and length value
    * @returns Point as array of 3 numbers
    * @group extract
    * @shortname point at length
    * @drawable true
    */
    pointOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.pointOnWireAtLength", inputs);
    }

    /**
    * Evaluates points on a wire at certain lengths
    * @param inputs Wire shape and lengths array
    * @returns Points as arrays of 3 numbers
    * @group extract
    * @shortname points at lengths
    * @drawable true
    */
    pointsOnWireAtLengths(inputs: Inputs.OCCT.DataOnGeometryAtLengthsDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.pointsOnWireAtLengths", inputs);
    }

    /**
    * Evaluates points on a wire at equal length
    * @param inputs Wire shape and length
    * @returns Points as arrays of 3 numbers
    * @group extract
    * @shortname points at equal length
    * @drawable true
    */
    pointsOnWireAtEqualLength(inputs: Inputs.OCCT.PointsOnWireAtEqualLengthDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.pointsOnWireAtEqualLength", inputs);
    }

    /**
     * Evaluates points on a wire at pattern of lengths
     * @param inputs Wire shape and lengths pattern
     * @returns Points as arrays of 3 numbers
     * @group extract
     * @shortname points at pattern of lengths
     * @drawable true
     */
    pointsOnWireAtPatternOfLengths(inputs: Inputs.OCCT.PointsOnWireAtPatternOfLengthsDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.pointsOnWireAtPatternOfLengths", inputs);
    }

    /**
    * Evaluates tangent vector on a wire at parameter value between 0 and 1, being start and end points
    * @param inputs Wire shape and parameter
    * @returns Tangent vector as array of 3 numbers
    * @group extract
    * @shortname tangent at param
    * @drawable true
    */
    tangentOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Vector3> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.tangentOnWireAtParam", inputs);
    }

    /**
    * Evaluates tangent vector on a wire at certain length
    * @param inputs Wire shape and length value
    * @returns Tangent vector as array of 3 numbers
    * @group extract
    * @shortname tangent at length
    * @drawable true
    */
    tangentOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Vector3> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.tangentOnWireAtLength", inputs);
    }

    /**
    * Computes 3 derivative vectors of a curve at a given length
    * @param inputs Wire shape and length value
    * @returns Three arrays of vectors. Each vector represents derivatives in order - first, second, third
    * @group extract
    * @shortname derivatives at length
    * @drawable false
    */
    derivativesOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSWirePointer>): Promise<[Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.derivativesOnWireAtLength", inputs);
    }

    /**
    * Computes 3 derivative vectors of a curve on parameter between 0 and 1.
    * @param inputs Wire shape and parameter value
    * @returns Three arrays of vectors. Each vector represents derivatives in order - first, second, third
    * @group extract
    * @shortname derivatives at param
    * @drawable false
    */
    derivativesOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSWirePointer>): Promise<[Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.derivativesOnWireAtParam", inputs);
    }

    /**
    * Computes the start point on the wire at param 0
    * @param inputs Wire shape
    * @returns The start point on wire
    * @group extract
    * @shortname start point
    * @drawable true
    */
    startPointOnWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.startPointOnWire", inputs);
    }

    /**
     * Computes the middle point on the wire at param 0.5
     * @param inputs Wire shape
     * @returns The middle point on wire
     * @group extract
     * @shortname mid point
     * @drawable true
     */
    midPointOnWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.midPointOnWire", inputs);
    }

    /**
    * Computes the end point on the wire at param 1
    * @param inputs Wire shape
    * @returns The length of the wire
    * @group extract
    * @shortname end point
    * @drawable true
    */
    endPointOnWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.endPointOnWire", inputs);
    }

    /**
     * Creates OpenCascade circle wire
     * @param inputs Circle parameters
     * @returns OpenCascade circle wire
     * @group primitives
     * @shortname circle
     * @drawable true
     */
    createCircleWire(inputs: Inputs.OCCT.CircleDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createCircleWire", inputs);
    }

    /**
     * Creates OpenCascade hexagon wires in grid
     * @param inputs grid parameters
     * @returns OpenCascade hexagon wires
     * @group primitives
     * @shortname hegagons in grid
     * @drawable true
     */
    hexagonsInGrid(inputs: Inputs.OCCT.HexagonsInGridDto): Promise<Inputs.OCCT.TopoDSWirePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.hexagonsInGrid", inputs);
    }

    /**
     * Creates OpenCascade square wire
     * @param inputs Square parameters
     * @returns OpenCascade square wire
     * @group primitives
     * @shortname square
     * @drawable true
     */
    createSquareWire(inputs: Inputs.OCCT.SquareDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createSquareWire", inputs);
    }

    /**
     * Creates OpenCascade star wire
     * @param inputs star parameters
     * @returns OpenCascade star wire
     * @group primitives
     * @shortname star
     * @drawable true
     */
    createStarWire(inputs: Inputs.OCCT.StarDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createStarWire", inputs);
    }

    /**
     * Creates Christmas tree wire
     * @param inputs christmas tree parameters
     * @returns OpenCascade christmas tree wire
     * @group primitives
     * @shortname christmas tree
     * @drawable true
     */
    createChristmasTreeWire(inputs: Inputs.OCCT.ChristmasTreeDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createChristmasTreeWire", inputs);
    }

    /**
     * Creates OpenCascade n-gon wire
     * @param inputs ngon parameters
     * @returns OpenCascade ngon wire
     * @group primitives
     * @shortname n-gon
     * @drawable true
     */
    createNGonWire(inputs: Inputs.OCCT.NGonWireDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createNGonWire", inputs);
    }

    /**
     * Creates n parallelogram wire
     * @param inputs parallelogram parameters
     * @returns OpenCascade parallelogram wire
     * @group primitives
     * @shortname parallelogram
     * @drawable true
     */
    createParallelogramWire(inputs: Inputs.OCCT.ParallelogramDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createParallelogramWire", inputs);
    }

    /**
     * Creates a heart wire
     * @param inputs heart parameters
     * @returns OpenCascade heart shaped wire
     * @group primitives
     * @shortname heart
     * @drawable true
     */
    createHeartWire(inputs: Inputs.OCCT.Heart2DDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createHeartWire", inputs);
    }

    /**
     * Creates OpenCascade rectangle wire
     * @param inputs rectangle parameters
     * @returns OpenCascade rectangle
     * @group primitives
     * @shortname rectangle
     * @drawable true
     */
    createRectangleWire(inputs: Inputs.OCCT.RectangleDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createRectangleWire", inputs);
    }

    /**
     * Creates OpenCascade L polygon wire
     * @param inputs L polygon parameters
     * @returns OpenCascade polygon
     * @group primitives
     * @shortname L polygon
     * @drawable true
     */
    createLPolygonWire(inputs: Inputs.OCCT.LPolygonDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createLPolygonWire", inputs);
    }

    /**
     * Creates OpenCascade I-beam profile wire
     * @param inputs I-beam profile parameters
     * @returns OpenCascade I-beam profile wire
     * @group beam profiles
     * @shortname I-beam profile
     * @drawable true
     */
    createIBeamProfileWire(inputs: Inputs.OCCT.IBeamProfileDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createIBeamProfileWire", inputs);
    }

    /**
     * Creates OpenCascade H-beam profile wire
     * @param inputs H-beam profile parameters
     * @returns OpenCascade H-beam profile wire
     * @group beam profiles
     * @shortname H-beam profile
     * @drawable true
     */
    createHBeamProfileWire(inputs: Inputs.OCCT.HBeamProfileDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createHBeamProfileWire", inputs);
    }

    /**
     * Creates OpenCascade T-beam profile wire
     * @param inputs T-beam profile parameters
     * @returns OpenCascade T-beam profile wire
     * @group beam profiles
     * @shortname T-beam profile
     * @drawable true
     */
    createTBeamProfileWire(inputs: Inputs.OCCT.TBeamProfileDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createTBeamProfileWire", inputs);
    }

    /**
     * Creates OpenCascade U-beam profile wire
     * @param inputs U-beam profile parameters
     * @returns OpenCascade U-beam profile wire
     * @group beam profiles
     * @shortname U-beam profile
     * @drawable true
     */
    createUBeamProfileWire(inputs: Inputs.OCCT.UBeamProfileDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createUBeamProfileWire", inputs);
    }

    /**
     * Creates OpenCascade ellipse wire
     * @param inputs Ellipse parameters
     * @returns OpenCascade ellipse wire
     * @group primitives
     * @shortname ellipse
     * @drawable true
     */
    createEllipseWire(inputs: Inputs.OCCT.EllipseDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createEllipseWire", inputs);
    }

    /**
     * Creates a 3D helix wire
     * @param inputs Helix parameters including radius, pitch, height, center and direction
     * @returns OpenCascade helix wire
     * @group primitives
     * @shortname helix
     * @drawable true
     */
    createHelixWire(inputs: Inputs.OCCT.HelixWireDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createHelixWire", inputs);
    }

    /**
     * Creates a 3D helix wire by specifying the number of turns
     * @param inputs Helix parameters including radius, pitch, number of turns, center and direction
     * @returns OpenCascade helix wire
     * @group primitives
     * @shortname helix by turns
     * @drawable true
     */
    createHelixWireByTurns(inputs: Inputs.OCCT.HelixWireByTurnsDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createHelixWireByTurns", inputs);
    }

    /**
     * Creates a conical (tapered) helix wire with varying radius
     * @param inputs Tapered helix parameters including start/end radii, pitch, height, center and direction
     * @returns OpenCascade tapered helix wire
     * @group primitives
     * @shortname tapered helix
     * @drawable true
     */
    createTaperedHelixWire(inputs: Inputs.OCCT.TaperedHelixWireDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createTaperedHelixWire", inputs);
    }

    /**
     * Creates a flat (Archimedean) spiral wire lying in a plane
     * @param inputs Flat spiral parameters including start/end radii, number of turns, center and direction
     * @returns OpenCascade flat spiral wire
     * @group primitives
     * @shortname flat spiral
     * @drawable true
     */
    createFlatSpiralWire(inputs: Inputs.OCCT.FlatSpiralWireDto): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.createFlatSpiralWire", inputs);
    }

    /**
     * Creates OpenCascade text wires based on simplex font created by Dr. A. V. Hershey
     * @param inputs Text parameters
     * @returns OpenCascade text wires
     * @group primitives
     * @shortname text wires
     * @drawable true
     */
    textWires(inputs: Inputs.OCCT.TextWiresDto): Promise<Inputs.OCCT.TopoDSWirePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.textWires", inputs);
    }

    /**
     * Creates OpenCascade compound out of text wires and returns additional information based on simplex font created by Dr. A. V. Hershey
     * @param inputs Text parameters
     * @returns OpenCascade text compound derivative data
     * @group primitives
     * @shortname text wires deriv
     * @drawable true
     */
    async textWiresWithData(inputs: Inputs.OCCT.TextWiresDto): Promise<Models.OCCT.TextWiresDataDto<Inputs.OCCT.TopoDSCompoundPointer>> {
        const res: Models.OCCT.ObjectDefinition<Models.OCCT.TextWiresDataDto<Inputs.OCCT.TopoDSCompoundPointer>, Inputs.OCCT.TopoDSShapePointer> = await this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.textWiresWithData", inputs);
        const mapped = ShapeParser.parse(res.data, res.shapes);
        const r: Models.OCCT.TextWiresDataDto<Inputs.OCCT.TopoDSShapePointer> = {
            ...mapped,
            type: res.data.type,
            name: res.data.name,
            shapes: res.shapes,
            compound: res.compound,
        };
        return r;
    }

    /**
     * Gets the wire by providing an index from the shape
     * @param inputs Shape
     * @returns OpenCascade wire
     * @group get
     * @shortname wire
     * @drawable true
     */
    getWire(inputs: Inputs.OCCT.ShapeIndexDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.getWire", inputs);
    }

    /**
     * Gets all the wires from the shape
     * @param inputs Shape
     * @returns OpenCascade wires
     * @group get
     * @shortname wires
     * @drawable true
     */
    getWires(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.getWires", inputs);
    }

    /**
     * Get the wire center of mass point
     * @param inputs OCCT Wire
     * @returns point
     * @group get
     * @shortname center of mass
     * @drawable true
     */
    getWireCenterOfMass(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.getWireCenterOfMass", inputs);
    }

    /**
     * Get the wires centers of mass point
     * @param inputs OCCT Wires
     * @returns points
     * @group get
     * @shortname centers of mass
     * @drawable true
     */
    getWiresCentersOfMass(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.getWiresCentersOfMass", inputs);
    }

    /**
     * Computes reversed wire from input wire
     * @param inputs Shape
     * @returns OpenCascade wire
     * @group get
     * @shortname reversed
     * @drawable true
     */
    reversedWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.reversedWire", inputs);
    }

    /**
     * Computes reversed wire by reversing all edges and combining them into a new wire
     * @param inputs Shape
     * @returns OpenCascade wire
     * @group get
     * @shortname reversed wire by rev edges
     * @drawable true
     */
    reversedWireFromReversedEdges(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.reversedWireFromReversedEdges", inputs);
    }

    /**
     * Checks whether wire is closed
     * @param inputs wire
     * @returns boolean
     * @group get
     * @shortname is wire closed
     * @drawable false
     */
    isWireClosed(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<boolean> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.isWireClosed", inputs);
    }

    /**
     * Gets the wire length
     * @param inputs wire
     * @returns Length
     * @group get
     * @shortname length
     * @drawable false
     */
    getWireLength(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<number> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.getWireLength", inputs);
    }

    /**
     * Gets the lengths of wires
     * @param inputs wires
     * @returns Lengths
     * @group get
     * @shortname lengths
     * @drawable false
     */
    getWiresLengths(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSWirePointer>): Promise<number[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.getWiresLengths", inputs);
    }

    /**
     * Places a wire on the face by mapping it's 2d coordinates to UV space. Wire must be positioned on the ground XZ plane for this to work.
     * @param inputs two shapes - first a wire and second a face
     * @returns OpenCascade wire
     * @group place
     * @shortname wire on face
     * @drawable true
     */
    placeWireOnFace(inputs: Inputs.OCCT.WireOnFaceDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.placeWireOnFace", inputs);
    }

    /**
     * Places multiple wires on the face by mapping it's 2d coordinates to UV space. Wires must be positioned on the ground XZ plane for this to work.
     * @param inputs a face and a list of wires
     * @returns OpenCascade wires
     * @group place
     * @shortname wires on face
     * @drawable true
     */
    placeWiresOnFace(inputs: Inputs.OCCT.WiresOnFaceDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.placeWiresOnFace", inputs);
    }

    /**
     * Closes the open wire with additional straight edge joining start and end points
     * @param inputs Shape
     * @returns OpenCascade wire
     * @group edit
     * @shortname close open wire
     * @drawable true
     */
    closeOpenWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.closeOpenWire", inputs);
    }

    /**
     * Project wire on the shape
     * @param inputs wire and shape
     * @returns OpenCascade compound
     * @group place
     * @shortname project
     * @drawable true
     */
    project(inputs: Inputs.OCCT.ProjectWireDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSCompoundPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.project", inputs);
    }

    /**
     * Project multiple wires on the shape
     * @param inputs wire and shape
     * @returns OpenCascade compound
     * @group place
     * @shortname project wires
     * @drawable true
     */
    projectWires(inputs: Inputs.OCCT.ProjectWiresDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSCompoundPointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.projectWires", inputs);
    }
}
