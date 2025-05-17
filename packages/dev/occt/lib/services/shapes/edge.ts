import { Geom2d_Curve, Geom_Surface, OpenCascadeInstance, TopoDS_Edge, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs/inputs";

export class OCCTEdge {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    fromBaseLine(inputs: Inputs.OCCT.LineBaseDto) {
        return this.line(inputs.line);
    }

    fromBaseLines(inputs: Inputs.OCCT.LinesBaseDto) {
        return inputs.lines.map(line => this.line(line));
    }

    fromBaseSegment(inputs: Inputs.OCCT.SegmentBaseDto) {
        return this.line({ start: inputs.segment[0], end: inputs.segment[1] });
    }

    fromBaseSegments(inputs: Inputs.OCCT.SegmentsBaseDto) {
        return inputs.segments.map(segment => this.line({ start: segment[0], end: segment[1] }));
    }

    fromPoints(inputs: Inputs.OCCT.PointsDto) {
        const edges = [];
        for (let i = 0; i < inputs.points.length - 1; i++) {
            const start = inputs.points[i];
            const end = inputs.points[i + 1];
            edges.push(this.line({ start, end }));
        }
        return edges;
    }

    fromBasePolyline(inputs: Inputs.OCCT.PolylineBaseDto) {
        const points = inputs.polyline.points;
        if (inputs.polyline.isClosed) {
            points.push(points[0]);
        }
        return this.fromPoints({ points });
    }

    fromBaseTriangle(inputs: Inputs.OCCT.TriangleBaseDto) {
        const points = inputs.triangle;
        return this.fromBasePolyline({ polyline: { points, isClosed: true }});
    }

    fromBaseMesh(inputs: Inputs.OCCT.MeshBaseDto) {
        const edges = [];
        inputs.mesh.forEach((triangle) => {
            try {
                edges.push(this.fromBaseTriangle({ triangle }));
            } catch (e) {
                console.warn("Failed to make edges for triangle", triangle);
            }
        });
        return edges.flat();
    }

    makeEdgeFromGeom2dCurveAndSurface(inputs: Inputs.OCCT.CurveAndSurfaceDto<Geom2d_Curve, Geom_Surface>) {
        return this.och.edgesService.makeEdgeFromGeom2dCurveAndSurface(inputs);
    }

    line(inputs: Inputs.OCCT.LineDto) {
        return this.och.edgesService.lineEdge(inputs);
    }

    arcThroughThreePoints(inputs: Inputs.OCCT.ArcEdgeThreePointsDto) {
        return this.och.edgesService.arcThroughThreePoints(inputs);
    }

    arcThroughTwoPointsAndTangent(inputs: Inputs.OCCT.ArcEdgeTwoPointsTangentDto) {
        return this.och.edgesService.arcThroughTwoPointsAndTangent(inputs);
    }

    arcFromCircleAndTwoPoints(inputs: Inputs.OCCT.ArcEdgeCircleTwoPointsDto<TopoDS_Edge>) {
        return this.och.edgesService.arcFromCircleAndTwoPoints(inputs);
    }

    arcFromCircleAndTwoAngles(inputs: Inputs.OCCT.ArcEdgeCircleTwoAnglesDto<TopoDS_Edge>) {
        return this.och.edgesService.arcFromCircleAndTwoAngles(inputs);
    }

    arcFromCirclePointAndAngle(inputs: Inputs.OCCT.ArcEdgeCirclePointAngleDto<TopoDS_Edge>) {
        return this.och.edgesService.arcFromCirclePointAndAngle(inputs);
    }

    createCircleEdge(inputs: Inputs.OCCT.CircleDto) {
        return this.och.entitiesService.createCircle(inputs.radius, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.edge) as TopoDS_Edge;
    }

    createEllipseEdge(inputs: Inputs.OCCT.EllipseDto) {
        return this.och.entitiesService.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.edge) as TopoDS_Edge;
    }

    removeInternalEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>) {
        const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(inputs.shape, true, true, false);
        fusor.Build();
        const shape = fusor.Shape();
        fusor.delete();
        return shape;
    }

    getEdge(inputs: Inputs.OCCT.EdgeIndexDto<TopoDS_Shape>): TopoDS_Edge {
        return this.och.shapeGettersService.getEdge(inputs);
    }

    edgesToPoints(inputs: Inputs.OCCT.EdgesToPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        return this.och.edgesService.edgesToPoints(inputs);
    }

    reversedEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): TopoDS_Edge {
        const edge: TopoDS_Edge = inputs.shape;
        const reversed = edge.Reversed();
        const result = this.och.converterService.getActualTypeOfShape(reversed);
        reversed.delete();
        return result;
    }

    pointOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.edgesService.pointOnEdgeAtParam(inputs);
    }

    pointsOnEdgesAtParam(inputs: Inputs.OCCT.DataOnGeometryesAtParamDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return inputs.shapes.map((shape) => this.och.edgesService.pointOnEdgeAtParam({ shape, param: inputs.param }));
    }

    tangentOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): Inputs.Base.Vector3 {
        return this.och.edgesService.tangentOnEdgeAtParam(inputs);
    }

    tangentsOnEdgesAtParam(inputs: Inputs.OCCT.DataOnGeometryesAtParamDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return inputs.shapes.map((shape) => this.och.edgesService.tangentOnEdgeAtParam({ shape, param: inputs.param }));
    }

    startPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.edgesService.startPointOnEdge(inputs);
    }

    startPointsOnEdges(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return inputs.shapes.map(shape => this.och.edgesService.startPointOnEdge({ shape }));
    }

    endPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.edgesService.endPointOnEdge(inputs);
    }

    endPointsOnEdges(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return inputs.shapes.map(shape => this.och.edgesService.endPointOnEdge({ shape }));
    }

    pointOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.edgesService.pointOnEdgeAtLength(inputs);
    }

    pointsOnEdgesAtLength(inputs: Inputs.OCCT.DataOnGeometryesAtLengthDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return inputs.shapes.map((shape) => this.och.edgesService.pointOnEdgeAtLength({ shape, length: inputs.length }));
    }

    tangentOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Inputs.Base.Vector3 {
        return this.och.edgesService.tangentOnEdgeAtLength(inputs);
    }

    tangentsOnEdgesAtLength(inputs: Inputs.OCCT.DataOnGeometryesAtLengthDto<TopoDS_Edge>): Inputs.Base.Vector3[] {
        return inputs.shapes.map((shape) => this.och.edgesService.tangentOnEdgeAtLength({ shape, length: inputs.length }));
    }

    divideEdgeByParamsToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return this.och.edgesService.divideEdgeByParamsToPoints(inputs);
    }

    divideEdgesByParamsToPoints(inputs: Inputs.OCCT.DivideShapesDto<TopoDS_Edge>): Inputs.Base.Point3[][] {
        return inputs.shapes.map(shape => this.divideEdgeByParamsToPoints({ shape, nrOfDivisions: inputs.nrOfDivisions, removeEndPoint: inputs.removeEndPoint, removeStartPoint: inputs.removeStartPoint }));
    }

    divideEdgeByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return this.och.edgesService.divideEdgeByEqualDistanceToPoints(inputs);
    }

    divideEdgesByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideShapesDto<TopoDS_Edge>): Inputs.Base.Point3[][] {
        return inputs.shapes.map(shape => this.divideEdgeByEqualDistanceToPoints({ shape, nrOfDivisions: inputs.nrOfDivisions, removeEndPoint: inputs.removeEndPoint, removeStartPoint: inputs.removeStartPoint }));
    }

    isEdgeLinear(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>) {
        return this.och.edgesService.isEdgeLinear(inputs);
    }

    isEdgeCircular(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>) {
        return this.och.edgesService.isEdgeCircular(inputs);
    }

    getEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>) {
        return this.och.shapeGettersService.getEdges(inputs);
    }

    getEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>) {
        return this.och.edgesService.getEdgesAlongWire(inputs);
    }

    getCircularEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Edge[] {
        return this.och.edgesService.getCircularEdgesAlongWire(inputs);
    }

    getLinearEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Edge[] {
        return this.och.edgesService.getLinearEdgesAlongWire(inputs);
    }

    getEdgeLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): number {
        return this.och.edgesService.getEdgeLength(inputs);
    }

    getEdgeLengthsOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): number[] {
        return this.och.edgesService.getEdgeLengthsOfShape(inputs);
    }

    getEdgesLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): number[] {
        return this.och.edgesService.getEdgesLengths(inputs);
    }

    getEdgeCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.geomService.getLinearCenterOfMass(inputs);
    }

    getEdgesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return this.och.edgesService.getEdgesCentersOfMass(inputs);
    }

    getCornerPointsOfEdgesForShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        return this.och.edgesService.getCornerPointsOfEdgesForShape(inputs);
    }

    getCircularEdgeCenterPoint(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Point3 {
        return this.och.edgesService.getCircularEdgeCenterPoint(inputs);
    }

    getCircularEdgeRadius(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): number {
        return this.och.edgesService.getCircularEdgeRadius(inputs);
    }

    getCircularEdgePlaneDirection(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Vector3 {
        return this.och.edgesService.getCircularEdgePlaneDirection(inputs);
    }

    constraintTanLinesFromTwoPtsToCircle(inputs: Inputs.OCCT.ConstraintTanLinesFromTwoPtsToCircleDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.edgesService.constraintTanLinesFromTwoPtsToCircle(inputs);
    }

    constraintTanLinesFromPtToCircle(inputs: Inputs.OCCT.ConstraintTanLinesFromPtToCircleDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.edgesService.constraintTanLinesFromPtToCircle(inputs);
    }

    constraintTanLinesOnTwoCircles(inputs: Inputs.OCCT.ConstraintTanLinesOnTwoCirclesDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.edgesService.constraintTanLinesOnTwoCircles(inputs);
    }

    constraintTanCirclesOnTwoCircles(inputs: Inputs.OCCT.ConstraintTanCirclesOnTwoCirclesDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.edgesService.constraintTanCirclesOnTwoCircles(inputs);
    }

    constraintTanCirclesOnCircleAndPnt(inputs: Inputs.OCCT.ConstraintTanCirclesOnCircleAndPntDto<TopoDS_Edge>): TopoDS_Shape[] {
        return this.och.edgesService.constraintTanCirclesOnCircleAndPnt(inputs);
    }
}
