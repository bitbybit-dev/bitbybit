import { Geom2d_Curve, Geom_Surface, BitbybitOcctModule, TopoDS_Edge, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";

export class OCCTEdge {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Rebuilds an edge's curve to relax (lower) or raise its polynomial degree.
     * @param inputs edge, target degree and tolerance
     * @returns OpenCascade edge
     * @group rebuild
     * @shortname rebuild edge degree
     * @drawable true
     */
    rebuildEdgeDegree(inputs: Inputs.OCCT.RebuildCurveDegreeDto<TopoDS_Edge>): TopoDS_Edge {
        return this.occ.RebuildEdgeDegree(inputs.shape, inputs.degree, inputs.tolerance);
    }

    /**
     * Moves the seam (origin) of a periodic edge to a parameter value.
     * @param inputs periodic edge and parameter
     * @returns OpenCascade edge
     * @group seam
     * @shortname move edge seam by param
     * @drawable true
     */
    moveEdgeSeamByParameter(inputs: Inputs.OCCT.CurveSeamByParameterDto<TopoDS_Edge>): TopoDS_Edge {
        return this.occ.MoveSeamByParameter(inputs.shape, inputs.parameter);
    }

    /**
     * Moves the seam (origin) of a periodic edge by an arc length from the current start.
     * @param inputs periodic edge and length
     * @returns OpenCascade edge
     * @group seam
     * @shortname move edge seam by length
     * @drawable true
     */
    moveEdgeSeamByLength(inputs: Inputs.OCCT.CurveSeamByLengthDto<TopoDS_Edge>): TopoDS_Edge {
        return this.occ.MoveSeamByLength(inputs.shape, inputs.length);
    }

    /**
     * Returns debug info about the edge's curve: type, degree, poles/knots, rational/periodic/closed,
     * parameter range, period, length and end points.
     * @param inputs edge
     * @returns Edge curve debug info
     * @group debug
     * @shortname edge debug info
     * @drawable false
     */
    debugInfo(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Models.OCCT.EdgeDebugInfo {
        return JSON.parse(this.occ.EdgeDebugInfoJson(inputs.shape)) as Models.OCCT.EdgeDebugInfo;
    }

    /**
     * Creates linear edge from base line format {start: Point3, end: Point3}
     * @param inputs base line
     * @returns OpenCascade edge
     * @group from base
     * @shortname edge from base line
     * @drawable true
     */
    fromBaseLine(inputs: Inputs.OCCT.LineBaseDto) {
        return this.line(inputs.line);
    }

    /**
     * Creates linear edges from base lines format {start: Point3, end: Point3}[]
     * @param inputs base lines
     * @returns OpenCascade edges
     * @group from base
     * @shortname edges from base lines
     * @drawable true
     */
    fromBaseLines(inputs: Inputs.OCCT.LinesBaseDto) {
        return inputs.lines.map(line => this.line(line));
    }

    /**
     * Creates linear edge from base segment format [Point3, Point3]
     * @param inputs base segment
     * @returns OpenCascade edge
     * @group from base
     * @shortname edge from base segment
     * @drawable true
     */
    fromBaseSegment(inputs: Inputs.OCCT.SegmentBaseDto) {
        return this.line({ start: inputs.segment[0], end: inputs.segment[1] });
    }

    /**
     * Creates linear edge from base segments format [Point3, Point3][]
     * @param inputs base segments
     * @returns OpenCascade edges
     * @group from base
     * @shortname edges from base segments
     * @drawable true
     */
    fromBaseSegments(inputs: Inputs.OCCT.SegmentsBaseDto) {
        return inputs.segments.map(segment => this.line({ start: segment[0], end: segment[1] }));
    }

    /**
     * Creates linear edges from collection of points
     * @param inputs Points
     * @returns OpenCascade edges
     * @group from base
     * @shortname edges from points
     * @drawable true
     */
    fromPoints(inputs: Inputs.OCCT.PointsDto) {
        const edges = [];
        for (let i = 0; i < inputs.points.length - 1; i++) {
            const start = inputs.points[i]!;
            const end = inputs.points[i + 1]!;
            edges.push(this.line({ start, end }));
        }
        return edges;
    }

    /**
     * Creates linear edges from polyline definition
     * @param inputs Polyline
     * @returns OpenCascade edges
     * @group from base
     * @shortname edges from polyline
     * @drawable true
     */
    fromBasePolyline(inputs: Inputs.OCCT.PolylineBaseDto) {
        const points = inputs.polyline.points;
        if (inputs.polyline.isClosed) {
            points.push(points[0]!);
        }
        return this.fromPoints({ points });
    }

    /**
     * Creates linear edges from triangle definition
     * @param inputs Triangle
     * @returns OpenCascade edges
     * @group from base
     * @shortname edges from triangle
     * @drawable true
     */
    fromBaseTriangle(inputs: Inputs.OCCT.TriangleBaseDto) {
        const points = inputs.triangle;
        return this.fromBasePolyline({ polyline: { points, isClosed: true }});
    }

    /**
     * Creates linear edges from mesh definition
     * @param inputs Mesh
     * @returns OpenCascade edges
     * @group from base
     * @shortname edges from mesh
     * @drawable true
     */
    fromBaseMesh(inputs: Inputs.OCCT.MeshBaseDto) {
        const edges: TopoDS_Edge[][] = [];
        inputs.mesh.forEach((triangle) => {
            try {
                edges.push(this.fromBaseTriangle({ triangle }));
            } catch (e) {
                console.warn("Failed to make edges for triangle", triangle);
            }
        });
        return edges.flat();
    }

    /**
     * Creates an edge from geom curve and geom surface
     * @param inputs shapes are expected to contain 2 array elements - first is geom curve, second geom surface
     * @returns OpenCascade TopoDS_Edge
     * @group from
     * @shortname 2d curve and surface
     * @drawable true
     */
    makeEdgeFromGeom2dCurveAndSurface(inputs: Inputs.OCCT.CurveAndSurfaceDto<Geom2d_Curve, Geom_Surface>) {
        return this.och.edgesService.makeEdgeFromGeom2dCurveAndSurface(inputs);
    }

    /**
     * Creates linear edge between two points
     * @param inputs Two points between which edge should be created
     * @returns OpenCascade edge
     * @group primitives
     * @shortname line
     * @drawable true
     */
    line(inputs: Inputs.OCCT.LineDto) {
        return this.och.edgesService.lineEdge(inputs);
    }

    /**
     * Creates arc edge between three points
     * @param inputs three points
     * @returns OpenCascade edge
     * @group primitives
     * @shortname arc 3 points
     * @drawable true
     */
    arcThroughThreePoints(inputs: Inputs.OCCT.ArcEdgeThreePointsDto) {
        return this.och.edgesService.arcThroughThreePoints(inputs);
    }

    /**
     * Creates arc edge between two points given the tangent direction vector on first point.
     * @param inputs two points and tangent vector
     * @returns OpenCascade edge
     * @group primitives
     * @shortname arc 2 points tangent
     * @drawable true
     */
    arcThroughTwoPointsAndTangent(inputs: Inputs.OCCT.ArcEdgeTwoPointsTangentDto) {
        return this.och.edgesService.arcThroughTwoPointsAndTangent(inputs);
    }

    /**
     * Creates an arc edge between two points on a circle
     * @param inputs two points and circle edge
     * @returns OpenCascade edge
     * @group primitives
     * @shortname arc from circle and points
     * @drawable true
     */
    arcFromCircleAndTwoPoints(inputs: Inputs.OCCT.ArcEdgeCircleTwoPointsDto<TopoDS_Edge>) {
        return this.och.edgesService.arcFromCircleAndTwoPoints(inputs);
    }

    /**
     * Creates an arc edge between two alpha angles on a circle
     * @param inputs two angles and circle edge
     * @returns OpenCascade edge
     * @group primitives
     * @shortname arc from circle and angles
     * @drawable true
     */
    arcFromCircleAndTwoAngles(inputs: Inputs.OCCT.ArcEdgeCircleTwoAnglesDto<TopoDS_Edge>) {
        return this.och.edgesService.arcFromCircleAndTwoAngles(inputs);
    }

    /**
     * Creates an arc edge between the point on a circle and a given alpha angle
     * @param inputs point, circle edge and alpha angle
     * @returns OpenCascade edge
     * @group primitives
     * @shortname arc from circle point and angle
     * @drawable true
     */
    arcFromCirclePointAndAngle(inputs: Inputs.OCCT.ArcEdgeCirclePointAngleDto<TopoDS_Edge>) {
        return this.och.edgesService.arcFromCirclePointAndAngle(inputs);
    }

    /**
     * Creates OpenCascade circle edge
     * @param inputs Circle parameters
     * @returns OpenCascade circle edge
     * @group primitives
     * @shortname circle
     * @drawable true
     */
    createCircleEdge(inputs: Inputs.OCCT.CircleDto) {
        return this.och.entitiesService.createCircle(inputs.radius, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.edge) as TopoDS_Edge;
    }

    /**
     * Creates OpenCascade ellipse edge
     * @param inputs Ellipse parameters
     * @returns OpenCascade ellipse edge
     * @group primitives
     * @shortname ellipse
     * @drawable true
     */
    createEllipseEdge(inputs: Inputs.OCCT.EllipseDto) {
        return this.och.entitiesService.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.edge) as TopoDS_Edge;
    }

    /**
     * Removes internal faces for the shape
     * @param inputs Shape
     * @returns OpenCascade shape with no internal edges
     * @group shapes
     * @shortname remove internal
     * @drawable true
     */
    removeInternalEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>) {
        return this.occ.ShapeUpgrade_UnifySameDomain_Perform(inputs.shape, true, true, false);
    }

    /**
     * Gets the edge by providing an index from the shape
     * @param inputs Shape
     * @returns OpenCascade edge
     * @group get
     * @shortname get edge
     * @drawable true
     */
    getEdge(inputs: Inputs.OCCT.EdgeIndexDto<TopoDS_Shape>): TopoDS_Edge {
        return this.och.shapeGettersService.getEdge(inputs);
    }

    /**
     * Gets the points of all edges from a shape in separate lists for each edge
     * @param inputs Shape
     * @returns OpenCascade points lists
     * @group extract
     * @shortname edges to points
     * @drawable false
     */
    edgesToPoints(inputs: Inputs.OCCT.EdgesToPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        return this.och.edgesService.edgesToPoints(inputs);
    }

    /**
     * Computes reversed edge from input edge
     * @param inputs Shape
     * @returns OpenCascade edge
     * @group get
     * @shortname reversed edge
     * @drawable true
     */
    reversedEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): TopoDS_Edge {
        const edge: TopoDS_Edge = inputs.shape;
        const reversed = edge.Reversed();
        const result = this.och.converterService.getActualTypeOfShape(reversed);
        reversed.delete();
        return result;
    }

    /**
     * Gets the point on edge at param
     * @param input edge
     * @returns Point on param
     * @group extract
     * @shortname point at param
     * @drawable true
     */
    pointOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.edgesService.pointOnEdgeAtParam(inputs);
    }

    /**
     * Gets the points on edges at param
     * @param input edges
     * @returns Points on param
     * @group extract
     * @shortname points on edges at param
     * @drawable true
     */
    pointsOnEdgesAtParam(inputs: Inputs.OCCT.DataOnGeometryesAtParamDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return inputs.shapes.map((shape) => this.och.edgesService.pointOnEdgeAtParam({ shape, param: inputs.param }));
    }

    /**
     * Gets the tangent vector on edge at param
     * @param input edge
     * @returns Tangent vector on param
     * @group extract
     * @shortname tangent at param
     * @drawable true
     */
    tangentOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): Inputs.Base.Vector3 {
        return this.och.edgesService.tangentOnEdgeAtParam(inputs);
    }

    /**
     * Gets the tangent vectors on edges at param
     * @param input edges
     * @returns Tangent vectors on param
     * @group extract
     * @shortname tangents on edges at param
     * @drawable true
     */
    tangentsOnEdgesAtParam(inputs: Inputs.OCCT.DataOnGeometryesAtParamDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return inputs.shapes.map((shape) => this.och.edgesService.tangentOnEdgeAtParam({ shape, param: inputs.param }));
    }

    /**
     * Gets the start point on edge
     * @param input edge
     * @returns Start point
     * @group extract
     * @shortname start point
     * @drawable true
     */
    startPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.edgesService.startPointOnEdge(inputs);
    }

    /**
     * Gets the start points on edges
     * @param input edges
     * @returns Start points
     * @group extract
     * @shortname start points
     * @drawable true
     */
    startPointsOnEdges(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return inputs.shapes.map(shape => this.och.edgesService.startPointOnEdge({ shape }));
    }

    /**
     * Gets the end point on edge
     * @param input edge
     * @returns End point
     * @group extract
     * @shortname end point
     * @drawable true
     */
    endPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.edgesService.endPointOnEdge(inputs);
    }

    /**
     * Gets the end points on edges
     * @param input edges
     * @returns End points
     * @group extract
     * @shortname end points
     * @drawable true
     */
    endPointsOnEdges(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return inputs.shapes.map(shape => this.och.edgesService.endPointOnEdge({ shape }));
    }

    /**
     * Gets the point on edge at length
     * @param input edge and length
     * @returns Point on edge
     * @group extract
     * @shortname point at length
     * @drawable true
     */
    pointOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.edgesService.pointOnEdgeAtLength(inputs);
    }

    /**
     * Gets the points on edges at length
     * @param input edges and length
     * @returns Points on edges
     * @group extract
     * @shortname points at length
     * @drawable true
     */
    pointsOnEdgesAtLength(inputs: Inputs.OCCT.DataOnGeometryesAtLengthDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return inputs.shapes.map((shape) => this.och.edgesService.pointOnEdgeAtLength({ shape, length: inputs.length }));
    }

    /**
     * Gets the tangent vector on edge at length
     * @param input edge and length
     * @returns Tangent vector on edge
     * @group extract
     * @shortname tangent at length
     * @drawable true
     */
    tangentOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Inputs.Base.Vector3 {
        return this.och.edgesService.tangentOnEdgeAtLength(inputs);
    }

    /**
     * Gets the tangent vectors on edges at length
     * @param input edges and length
     * @returns Tangent vectors on edges
     * @group extract
     * @shortname tangents at length
     * @drawable true
     */
    tangentsOnEdgesAtLength(inputs: Inputs.OCCT.DataOnGeometryesAtLengthDto<TopoDS_Edge>): Inputs.Base.Vector3[] {
        return inputs.shapes.map((shape) => this.och.edgesService.tangentOnEdgeAtLength({ shape, length: inputs.length }));
    }

    /**
     * Divides edge by params to points
     * @param input edge and division params
     * @returns Points
     * @group extract
     * @shortname points by params
     * @drawable true
     */
    divideEdgeByParamsToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return this.och.edgesService.divideEdgeByParamsToPoints(inputs);
    }

    /**
     * Divides edges by params to points
     * @param input edges and division params
     * @returns Points
     * @group extract
     * @shortname points by params on edges
     * @drawable false
     */
    divideEdgesByParamsToPoints(inputs: Inputs.OCCT.DivideShapesDto<TopoDS_Edge>): Inputs.Base.Point3[][] {
        return inputs.shapes.map(shape => this.divideEdgeByParamsToPoints({ shape, nrOfDivisions: inputs.nrOfDivisions, removeEndPoint: inputs.removeEndPoint, removeStartPoint: inputs.removeStartPoint }));
    }

    /**
     * Divides edge by length to points
     * @param input edge and division params
     * @returns Points
     * @group extract
     * @shortname points by distance
     * @drawable true
     */
    divideEdgeByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return this.och.edgesService.divideEdgeByEqualDistanceToPoints(inputs);
    }

    /**
     * Divides edges by length to points
     * @param input edges and division params
     * @returns Points
     * @group extract
     * @shortname points by distance on edges
     * @drawable false
     */
    divideEdgesByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideShapesDto<TopoDS_Edge>): Inputs.Base.Point3[][] {
        return inputs.shapes.map(shape => this.divideEdgeByEqualDistanceToPoints({ shape, nrOfDivisions: inputs.nrOfDivisions, removeEndPoint: inputs.removeEndPoint, removeStartPoint: inputs.removeStartPoint }));
    }

    /**
     * Checks whether an edge is linear
     * @param input edge
     * @returns boolean if is linear
     * @group is
     * @shortname is edge linear
     * @drawable false
     */
    isEdgeLinear(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>) {
        return this.och.edgesService.isEdgeLinear(inputs);
    }

    /**
     * Checks whether an edge is circular
     * @param input edge
     * @returns boolean if is circular
     * @group is
     * @shortname is edge circular
     * @drawable false
     */
    isEdgeCircular(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>) {
        return this.och.edgesService.isEdgeCircular(inputs);
    }

    /**
     * Gets the edges of a shape in a list
     * @param inputs Shape
     * @returns OpenCascade edge list
     * @group get
     * @shortname get edges
     * @drawable true
     */
    getEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>) {
        return this.och.shapeGettersService.getEdges(inputs);
    }

    /**
     * Gets the edges of a wire ordered along the direction of the wire
     * @param inputs wire shape
     * @returns OpenCascade edge list
     * @group get
     * @shortname get edges along wire
     * @drawable true
     */
    getEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>) {
        return this.och.edgesService.getEdgesAlongWire(inputs);
    }

    /**
     * Gets circular edges of a wire ordered along the direction of the wire
     * @param inputs wire shape
     * @returns OpenCascade edge list
     * @group get
     * @shortname get circular edges along wire
     * @drawable true
     */
    getCircularEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Edge[] {
        return this.och.edgesService.getCircularEdgesAlongWire(inputs);
    }

    /**
     * Gets linear edges of a wire ordered along the direction of the wire
     * @param inputs wire shape
     * @returns OpenCascade edge list
     * @group get
     * @shortname get linear edges along wire
     * @drawable true
     */
    getLinearEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Edge[] {
        return this.och.edgesService.getLinearEdgesAlongWire(inputs);
    }

    /**
     * Gets the edge length
     * @param inputs edge
     * @returns Length
     * @group get
     * @shortname edge length
     * @drawable false
     */
    getEdgeLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): number {
        return this.och.edgesService.getEdgeLength(inputs);
    }

    /**
     * Gets the edge lengths of the shape
     * @param inputs shape
     * @returns Lengths
     * @group get
     * @shortname edge lengths of shape
     * @drawable false
     */
    getEdgeLengthsOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): number[] {
        return this.och.edgesService.getEdgeLengthsOfShape(inputs);
    }

    /**
     * Gets the lengths of the edges
     * @param inputs edges
     * @returns Lengths
     * @group get
     * @shortname lengths
     * @drawable false
     */
    getEdgesLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): number[] {
        return this.och.edgesService.getEdgesLengths(inputs);
    }

    /**
     * Gets the center of mass for the edge
     * @param inputs edge
     * @returns Point representing center of mass
     * @group get
     * @shortname center of mass
     * @drawable true
     */
    getEdgeCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.geomService.getLinearCenterOfMass(inputs);
    }

    /**
     * Gets the centers of mass for the edges
     * @param inputs edges
     * @returns Points representing centers of mass
     * @group get
     * @shortname centers of mass
     * @drawable true
     */
    getEdgesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return this.och.edgesService.getEdgesCentersOfMass(inputs);
    }

    /**
     * Gets corner points of edges for a shape. There's no order guarantee here. All duplicates are removed, so when three edges form one corner, that will be represented by a single point in the list. 
     * @param inputs Shape that contains edges - wire, face, shell, solid
     * @returns List of points
     * @group get
     * @shortname corners
     * @drawable true
     */
    getCornerPointsOfEdgesForShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        return this.och.edgesService.getCornerPointsOfEdgesForShape(inputs);
    }

    /**
     * Gets the center point of the circular edge. If edge is not circular, point will not be returned.
     * @param inputs edge
     * @returns Point representing center of the circular edge
     * @group get circular edge
     * @shortname get center of circular edge
     * @drawable true
     */
    getCircularEdgeCenterPoint(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.edgesService.getCircularEdgeCenterPoint(inputs);
    }

    /**
     * Gets the radius of the circular edge. If edge is not circular, radius will not be returned.
     * @param inputs edge
     * @returns Radius of the circular edge
     * @group get circular edge
     * @shortname get radius of circular edge
     * @drawable false
     */
    getCircularEdgeRadius(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): number {
        return this.och.edgesService.getCircularEdgeRadius(inputs);
    }

    /**
     * Gets the direction vector of the plane of the circular edge. If edge is not circular, direction vector will not be returned.
     * @param inputs edge
     * @returns Direction vector of the circular edge
     * @group get circular edge
     * @shortname get plane direction of circular edge
     * @drawable true
     */
    getCircularEdgePlaneDirection(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Vector3 {
        return this.och.edgesService.getCircularEdgePlaneDirection(inputs);
    }

    /**
     * Creates lines from two given points till circle tangent locations
     * @param input resulting lines
     * @returns lines
     * @group constraint
     * @shortname tan lines from 2 pts to circle
     * @drawable true
     */
    constraintTanLinesFromTwoPtsToCircle(inputs: Inputs.OCCT.ConstraintTanLinesFromTwoPtsToCircleDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.edgesService.constraintTanLinesFromTwoPtsToCircle(inputs);
    }

    /**
     * Creates lines from a given point till circle tangent locations
     * @param input resulting lines
     * @returns lines
     * @group constraint
     * @shortname tan lines from pt to circle
     * @drawable true
     */
    constraintTanLinesFromPtToCircle(inputs: Inputs.OCCT.ConstraintTanLinesFromPtToCircleDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.edgesService.constraintTanLinesFromPtToCircle(inputs);
    }

    /**
     * Creates tangent lines between two circles.
     * @param input resulting lines
     * @returns lines
     * @group constraint
     * @shortname tan lines on two circles
     * @drawable true
     */
    constraintTanLinesOnTwoCircles(inputs: Inputs.OCCT.ConstraintTanLinesOnTwoCirclesDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.edgesService.constraintTanLinesOnTwoCircles(inputs);
    }

    /**
     * Creates tangent circles between two circles.
     * @param input resulting circles
     * @returns circles
     * @group constraint
     * @shortname tan circles on two circles
     * @drawable true
     */
    constraintTanCirclesOnTwoCircles(inputs: Inputs.OCCT.ConstraintTanCirclesOnTwoCirclesDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.edgesService.constraintTanCirclesOnTwoCircles(inputs);
    }

    /**
     * Creates tangent circles between a point and a circle.
     * @param input resulting circles
     * @returns circles
     * @group constraint
     * @shortname tan circles on circle and pnt
     * @drawable true
     */
    constraintTanCirclesOnCircleAndPnt(inputs: Inputs.OCCT.ConstraintTanCirclesOnCircleAndPntDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.edgesService.constraintTanCirclesOnCircleAndPnt(inputs);
    }

    createSymmetricPeriodicBSplineEdge(inputs: Inputs.OCCT.InterpolationDto): TopoDS_Edge {
        return this.och.edgesService.createSymmetricPeriodicBSplineEdge(inputs);
    }
}
