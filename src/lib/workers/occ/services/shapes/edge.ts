import { ChFi3d_FilletShape, Geom2d_Curve, Geom_Surface, OpenCascadeInstance, TopAbs_ShapeEnum, TopoDS_Edge, TopoDS_Shape, TopoDS_Wire } from 'opencascade.js';
import { OccHelper, typeSpecificityEnum } from '../../occ-helper';
import * as Inputs from '../../../../api/inputs/inputs';
import { Base } from '../../../../api/inputs/inputs';

export class OCCTEdge {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    // TODO check this
    // filletWire(inputs: Inputs.OCCT.FilletDto): any {
    //     let wire: TopoDS_Wire = inputs.shape;
    //     const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
    //         wire, (this.occ.ChFi3d_FilletShape.ChFi3d_Rational as ChFi3d_FilletShape)
    //     );

    // }


    makeEdgeFromGeom2dCurveAndSurface(inputs: Inputs.OCCT.ShapesDto<Geom2d_Curve | Geom_Surface>) {
        const curve2d = new this.occ.Handle_Geom2d_Curve_2(inputs.shapes[0] as Geom2d_Curve);
        const surface = new this.occ.Handle_Geom_Surface_2(inputs.shapes[1] as Geom_Surface);
        const res = new this.occ.BRepBuilderAPI_MakeEdge_30(curve2d, surface);
        return this.och.getActualTypeOfShape(res.Shape());
    }

    line(inputs: Inputs.OCCT.LineDto) {
        return this.och.lineEdge(inputs);
    }

    arcThroughThreePoints(inputs: Inputs.OCCT.ArcEdgeThreePointsDto) {
        const gpPnt1 = this.och.gpPnt(inputs.start);
        const gpPnt2 = this.och.gpPnt(inputs.middle);
        const gpPnt3 = this.och.gpPnt(inputs.end);
        const segment = new this.occ.GC_MakeArcOfCircle_4(gpPnt1, gpPnt2, gpPnt3);
        const hcurve = new this.occ.Handle_Geom_Curve_2(segment.Value().get());
        return new this.occ.BRepBuilderAPI_MakeEdge_24(hcurve).Edge();
    }

    createCircleEdge(inputs: Inputs.OCCT.CircleDto) {
        return this.och.createCircle(inputs.radius, inputs.center, inputs.direction, typeSpecificityEnum.edge) as TopoDS_Edge;
    }

    createEllipseEdge(inputs: Inputs.OCCT.EllipseDto) {
        return this.och.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, typeSpecificityEnum.edge) as TopoDS_Edge;
    }

    removeInternalEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>) {
        const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(inputs.shape, true, true, false);
        fusor.Build();
        return fusor.Shape();
    }

    getEdge(inputs: Inputs.OCCT.ShapeIndexDto<TopoDS_Shape>): any {
        if (!inputs.shape || inputs.shape.ShapeType() > this.occ.TopAbs_ShapeEnum.TopAbs_WIRE || inputs.shape.IsNull()) {
            throw (new Error('Shape is not provided or is of incorrect type'));
        }
        if (!inputs.index) { inputs.index = 0; }
        let innerEdge = {}; let edgesFound = 0;
        this.och.forEachEdge(inputs.shape, (i, s) => {
            if (i === inputs.index) { innerEdge = s; } edgesFound++;
        });
        return innerEdge;
    }

    pointOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): { result: Inputs.Base.Point3 } {
        return { result: this.och.pointOnEdgeAtParam(inputs) };
    }

    tangentOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): { result: Inputs.Base.Vector3 } {
        return { result: this.och.tangentOnEdgeAtParam(inputs) };
    }

    startPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>) {
        const edge = inputs.shape;
        const { uMin, uMax } = this.och.getEdgeBounds(edge);
        const curve = this.och.getGeomCurveFromEdge(edge, uMin, uMax);
        const gpPnt = this.och.gpPnt([0, 0, 0]);
        curve.D0(uMin, gpPnt);
        return { result: [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] };
    }

    endPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>) {
        const edge = inputs.shape;
        const { uMin, uMax } = this.och.getEdgeBounds(edge);
        const curve = this.och.getGeomCurveFromEdge(edge, uMin, uMax);
        const gpPnt = this.och.gpPnt([0, 0, 0]);
        curve.D0(uMax, gpPnt);
        return { result: [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] };
    }

    pointOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): { result: Inputs.Base.Point3 } {
        return { result: this.och.pointOnEdgeAtLength(inputs) };
    }

    tangentOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): { result: Inputs.Base.Vector3 } {
        return { result: this.och.tangentOnEdgeAtLength(inputs) };
    }

    divideEdgeByParamsToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Edge>): { result: Inputs.Base.Point3[] } {
        return { result: this.och.divideEdgeByParamsToPoints(inputs) };
    }

    divideEdgeByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Edge>): { result: Inputs.Base.Point3[] } {
        return { result: this.och.divideEdgeByEqualDistanceToPoints(inputs) };
    }

    getEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>) {
        return this.och.getEdges(inputs);
    }

    getEdgeLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): { result: number } {
        return { result: this.och.getEdgeLength(inputs) };
    }

    getEdgesLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): { result: number[] } {
        return { result: this.och.getEdgesLengths(inputs) };
    }

    getEdgeCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): { result: Base.Point3 } {
        return { result: this.och.getEdgeCenterOfMass(inputs) };
    }

    getEdgesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): { result: Base.Point3[] } {
        return { result: this.och.getEdgesCentersOfMass(inputs) };
    }

    getCornerPointsOfEdgesForShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): { result: Inputs.Base.Point3[] } {
        const points = this.och.getCornerPointsOfEdgesForShape(inputs);
        return { result: points };
    }

}
