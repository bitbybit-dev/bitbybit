import { TopoDS_Face, OpenCascadeInstance, TopoDS_Wire, TopoDS_Compound, TopoDS_Shape, TopoDS_Edge } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs/inputs";

export class OCCTWire {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    createPolygonWire(inputs: Inputs.OCCT.PolygonDto): TopoDS_Wire {
        return this.och.wiresService.createPolygonWire(inputs);
    }

    createPolygons(inputs: Inputs.OCCT.PolygonsDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.polygons.map(p => this.createPolygonWire(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    createPolylineWire(inputs: Inputs.OCCT.PolylineDto): TopoDS_Wire {
        return this.och.wiresService.createPolylineWire(inputs);
    }

    createPolylines(inputs: Inputs.OCCT.PolylinesDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.polylines.map(p => this.createPolylineWire(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    createLineWire(inputs: Inputs.OCCT.LineDto): TopoDS_Wire {
        return this.och.wiresService.createLineWire(inputs);
    }

    createLineWireWithExtensions(inputs: Inputs.OCCT.LineWithExtensionsDto): TopoDS_Wire {
        return this.och.wiresService.createLineWireWithExtensions(inputs);
    }

    createLines(inputs: Inputs.OCCT.LinesDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.lines.map(p => this.createLineWire(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    createBezier(inputs: Inputs.OCCT.BezierDto) {
        return this.och.wiresService.createBezier(inputs);
    }

    createBezierWires(inputs: Inputs.OCCT.BezierWiresDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.bezierWires.map(p => this.createBezier(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    createBezierWeights(inputs: Inputs.OCCT.BezierWeightsDto) {
        return this.och.wiresService.createBezierWeights(inputs);
    }

    interpolatePoints(inputs: Inputs.OCCT.InterpolationDto): TopoDS_Wire {
        return this.och.wiresService.interpolatePoints(inputs);
    }

    interpolateWires(inputs: Inputs.OCCT.InterpolateWiresDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.interpolations.map(p => this.interpolatePoints(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    splitOnPoints(inputs: Inputs.OCCT.SplitWireOnPointsDto<TopoDS_Wire>): TopoDS_Wire[] {
        return this.och.wiresService.splitOnPoints(inputs);
    }

    combineEdgesAndWiresIntoAWire(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire | TopoDS_Edge>): TopoDS_Wire {
        return this.och.converterService.combineEdgesAndWiresIntoAWire(inputs);
    }

    createWireFromEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): TopoDS_Wire {
        return this.och.wiresService.createWireFromEdge(inputs);
    }

    addEdgesAndWiresToWire(inputs: Inputs.OCCT.ShapeShapesDto<TopoDS_Wire, TopoDS_Wire | TopoDS_Edge>): TopoDS_Wire {
        return this.och.wiresService.addEdgesAndWiresToWire(inputs);
    }

    createBSpline(inputs: Inputs.OCCT.BSplineDto): TopoDS_Wire {
        return this.och.wiresService.createBSpline(inputs);
    }

    createBSplines(inputs: Inputs.OCCT.BSplinesDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.bSplines.map(p => this.createBSpline(p)).filter(s => s !== undefined);
        return this.och.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    createZigZagBetweenTwoWires(inputs: Inputs.OCCT.ZigZagBetweenTwoWiresDto<TopoDS_Wire>): TopoDS_Wire {
        return this.och.wiresService.createZigZagBetweenTwoWires(inputs);
    }

    divideWireByParamsToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.och.wiresService.divideWireByParamsToPoints(inputs);
    }

    divideWiresByParamsToPoints(inputs: Inputs.OCCT.DivideShapesDto<TopoDS_Wire>): Inputs.Base.Point3[][] {
        return inputs.shapes.map(s => this.divideWireByParamsToPoints({ ...inputs, shape: s }));
    }

    divideWireByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.och.wiresService.divideWireByEqualDistanceToPoints(inputs);
    }

    divideWiresByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideShapesDto<TopoDS_Wire>): Inputs.Base.Point3[][] {
        return inputs.shapes.map(s => this.divideWireByEqualDistanceToPoints({ ...inputs, shape: s }));
    }

    pointOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.pointOnWireAtParam(inputs);
    }

    pointOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.pointOnWireAtLength(inputs);
    }

    pointsOnWireAtLengths(inputs: Inputs.OCCT.DataOnGeometryAtLengthsDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.och.wiresService.pointsOnWireAtLengths(inputs);
    }

    pointsOnWireAtEqualLength(inputs: Inputs.OCCT.PointsOnWireAtEqualLengthDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.och.wiresService.pointsOnWireAtEqualLength(inputs);
    }

    pointsOnWireAtPatternOfLengths(inputs: Inputs.OCCT.PointsOnWireAtPatternOfLengthsDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.och.wiresService.pointsOnWireAtPatternOfLengths(inputs);
    }

    tangentOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.tangentOnWireAtParam(inputs);
    }

    tangentOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.tangentOnWireAtLength(inputs);
    }

    derivativesOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): [Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3] {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);

        const absc = new this.occ.GCPnts_AbscissaPoint_2(curve, inputs.length, curve.FirstParameter());
        const param = absc.Parameter();
        const gpPnt = this.och.entitiesService.gpPnt([0, 0, 0]);

        const der1 = this.och.entitiesService.gpVec([0, 0, 0]);
        const der2 = this.och.entitiesService.gpVec([0, 0, 0]);
        const der3 = this.och.entitiesService.gpVec([0, 0, 0]);

        curve.D3(param, gpPnt, der1, der2, der3);
        const der: [Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3] = [[der1.X(), der1.Y(), der1.Z()], [der2.X(), der2.Y(), der2.Z()], [der3.X(), der3.Y(), der3.Z()]];
        der1.delete();
        der2.delete();
        der3.delete();
        curve.delete();
        absc.delete();
        gpPnt.delete();
        return der;
    }

    derivativesOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): [Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3] {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);

        const gpPnt = this.och.entitiesService.gpPnt([0, 0, 0]);

        const der1 = this.och.entitiesService.gpVec([0, 0, 0]);
        const der2 = this.och.entitiesService.gpVec([0, 0, 0]);
        const der3 = this.och.entitiesService.gpVec([0, 0, 0]);

        const param = this.och.vecHelper.remap(inputs.param, 0, 1, curve.FirstParameter(), curve.LastParameter());

        curve.D3(param, gpPnt, der1, der2, der3);
        const der: [Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3] = [[der1.X(), der1.Y(), der1.Z()], [der2.X(), der2.Y(), der2.Z()], [der3.X(), der3.Y(), der3.Z()]];
        der1.delete();
        der2.delete();
        der3.delete();
        curve.delete();
        gpPnt.delete();
        return der;
    }

    startPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.startPointOnWire(inputs);
    }

    midPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.midPointOnWire(inputs);
    }

    endPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.endPointOnWire(inputs);
    }

    createCircleWire(inputs: Inputs.OCCT.CircleDto) {
        return this.och.entitiesService.createCircle(inputs.radius, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.wire) as TopoDS_Wire;
    }

    createEllipseWire(inputs: Inputs.OCCT.EllipseDto) {
        return this.och.entitiesService.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.wire) as TopoDS_Wire;
    }

    textWires(inputs: Inputs.OCCT.TextWiresDto) {
        return this.och.wiresService.textWires(inputs);
    }

    textWiresWithData(inputs: Inputs.OCCT.TextWiresDto) {
        return this.och.wiresService.textWiresWithData(inputs);
    }

    createSquareWire(inputs: Inputs.OCCT.SquareDto): TopoDS_Wire {
        return this.och.wiresService.createSquareWire(inputs);
    }

    createStarWire(inputs: Inputs.OCCT.StarDto): TopoDS_Wire {
        return this.och.wiresService.createStarWire(inputs);
    }

    createChristmasTreeWire(inputs: Inputs.OCCT.ChristmasTreeDto): TopoDS_Wire {
        return this.och.wiresService.createChristmasTreeWire(inputs);
    }

    createParallelogramWire(inputs: Inputs.OCCT.ParallelogramDto): TopoDS_Wire {
        return this.och.wiresService.createParallelogramWire(inputs);
    }

    createHeartWire(inputs: Inputs.OCCT.Heart2DDto): TopoDS_Wire {
        return this.och.wiresService.createHeartWire(inputs);
    }

    createNGonWire(inputs: Inputs.OCCT.NGonWireDto): TopoDS_Wire {
        return this.och.wiresService.createNGonWire(inputs);
    }

    createRectangleWire(inputs: Inputs.OCCT.RectangleDto): TopoDS_Wire {
        return this.och.wiresService.createRectangleWire(inputs);
    }

    createLPolygonWire(inputs: Inputs.OCCT.LPolygonDto): TopoDS_Wire {
        return this.och.wiresService.createLPolygonWire(inputs);
    }

    getWire(inputs: Inputs.OCCT.ShapeIndexDto<TopoDS_Shape>): TopoDS_Wire {
        return this.och.shapeGettersService.getWire(inputs);
    }

    getWires(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Wire[] {
        return this.och.shapeGettersService.getWires(inputs);
    }

    getWireLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): number {
        return this.och.wiresService.getWireLength(inputs);
    }

    getWiresLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire>): number[] {
        return this.och.wiresService.getWiresLengths(inputs);
    }

    isWireClosed(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): boolean {
        return this.och.wiresService.isWireClosed(inputs);
    }

    getWireCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Inputs.Base.Point3 {
        return this.och.wiresService.getWireCenterOfMass(inputs);
    }

    getWiresCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return inputs.shapes.map(w => this.och.wiresService.getWireCenterOfMass({
            shape: w
        }));
    }

    reversedWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        return this.och.wiresService.reversedWire(inputs);
    }

    reversedWireFromReversedEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        return this.och.wiresService.reversedWireFromReversedEdges(inputs);
    }

    placeWireOnFace(inputs: Inputs.OCCT.WireOnFaceDto<TopoDS_Wire, TopoDS_Face>) {
        const wire = inputs.wire as TopoDS_Wire;
        const face = inputs.face as TopoDS_Face;
        const srf = this.och.surfaceFromFace({ shape: face });
        const result = this.och.wiresService.placeWire(wire, srf);
        return result;
    }

    placeWiresOnFace(inputs: Inputs.OCCT.WiresOnFaceDto<TopoDS_Wire, TopoDS_Face>) {
        const wires = inputs.wires;
        const face = inputs.face;
        const srf = this.och.surfaceFromFace({ shape: face });
        const result = wires.map(wire => this.och.wiresService.placeWire(wire, srf));
        return result;
    }

    closeOpenWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        const wire = inputs.shape;
        const firstPoint = this.och.wiresService.startPointOnWire({ shape: wire });
        const lastPoint = this.och.wiresService.endPointOnWire({ shape: wire });
        const tolerance = 1.0e-7;
        if (this.och.vecHelper.vectorsTheSame(firstPoint, lastPoint, tolerance)) {
            return wire;
        }
        const edgeWire = this.createLineWire({ start: lastPoint, end: firstPoint });
        const result = this.addEdgesAndWiresToWire({ shape: wire, shapes: [edgeWire] });
        edgeWire.delete();
        return result;
    }

    project(inputs: Inputs.OCCT.ProjectWireDto<TopoDS_Wire, TopoDS_Shape>): TopoDS_Compound {
        const wire = inputs.wire;
        const gpDir = this.och.entitiesService.gpDir(inputs.direction);
        const proj = new this.occ.BRepProj_Projection_1(wire, inputs.shape, gpDir);
        const shape = proj.Shape();
        gpDir.delete();
        proj.delete();
        return shape;
    }

    wiresToPoints(inputs: Inputs.OCCT.WiresToPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        const wires = this.getWires({ shape: inputs.shape });
        const allWirePoints = [];
        wires.forEach(w => {
            const edgePoints = this.och.edgesService.edgesToPoints({ ...inputs, shape: w });
            const flatPoints = edgePoints.flat();
            const dupsRemoved = this.och.vecHelper.removeConsecutiveDuplicates(flatPoints, false);
            allWirePoints.push(dupsRemoved);
        });
        return allWirePoints;
    }

    projectWires(inputs: Inputs.OCCT.ProjectWiresDto<TopoDS_Wire, TopoDS_Shape>): TopoDS_Compound[] {
        const shapes = [];
        inputs.wires.forEach(wire => {
            const gpDir = this.och.entitiesService.gpDir(inputs.direction);
            const proj = new this.occ.BRepProj_Projection_1(wire, inputs.shape, gpDir);
            const shape = proj.Shape();
            shapes.push(shape);
            gpDir.delete();
            proj.delete();
        });

        return shapes;
    }

    createWireFromTwoCirclesTan(inputs: Inputs.OCCT.WireFromTwoCirclesTanDto<TopoDS_Wire>): TopoDS_Wire {
        return this.och.wiresService.createWireFromTwoCirclesTan(inputs);
    }
}
