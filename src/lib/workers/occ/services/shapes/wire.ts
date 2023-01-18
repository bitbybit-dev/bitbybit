import { Geom_Surface, TopoDS_Face, OpenCascadeInstance, TopoDS_Wire, TopoDS_Shape, TopoDS_Edge } from 'opencascade.js';
import { OccHelper, typeSpecificityEnum } from '../../occ-helper';
import * as Inputs from '../../../../api/inputs/inputs';

export class OCCTWire {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    createPolygonWire(inputs: Inputs.OCCT.PolygonDto): any {
        return this.och.createPolygonWire(inputs);
    }

    combineEdgesAndWiresIntoAWire(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire | TopoDS_Edge>): any {
        return this.och.combineEdgesAndWiresIntoAWire(inputs);
    }

    addEdgesAndWiresToWire(inputs: Inputs.OCCT.ShapeShapesDto<TopoDS_Wire, TopoDS_Wire | TopoDS_Edge>): any {
        const makeWire = new this.occ.BRepBuilderAPI_MakeWire_1();
        makeWire.Add_2(inputs.shape);
        inputs.shapes.forEach((shape) => {
            if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
                makeWire.Add_1(shape);
            } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_WIRE) {
                makeWire.Add_2(shape);
            }
        });
        if (makeWire.IsDone()) {
            return makeWire.Wire();
        } else {
            return null;
        }
    }

    createBSpline(inputs: Inputs.OCCT.BSplineDto): any {
        return this.och.createBSpline(inputs);
    }

    divideWireByParamsToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): { result: Inputs.Base.Point3[] } {
        return { result: this.och.divideWireByParamsToPoints(inputs) };
    }

    divideWireByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): { result: Inputs.Base.Point3[] } {
        return { result: this.och.divideWireByEqualDistanceToPoints(inputs) };
    }

    pointOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): { result: Inputs.Base.Point3 } {
        return { result: this.och.pointOnWireAtParam(inputs) };
    }

    pointOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): { result: Inputs.Base.Point3 } {
        return { result: this.och.pointOnWireAtLength(inputs) };
    }

    tangentOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): { result: Inputs.Base.Point3 } {
        return { result: this.och.tangentOnWireAtParam(inputs) };
    }

    tangentOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): { result: Inputs.Base.Point3 } {
        return { result: this.och.tangentOnWireAtLength(inputs) };
    }
    derivativesOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): { result: [Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3] } {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);

        const absc = new this.occ.GCPnts_AbscissaPoint_2(curve, inputs.length, curve.FirstParameter());
        const param = absc.Parameter();
        const gpPnt = this.och.gpPnt([0, 0, 0]);

        const der1 = this.och.gpVec([0, 0, 0]);
        const der2 = this.och.gpVec([0, 0, 0]);
        const der3 = this.och.gpVec([0, 0, 0]);

        curve.D3(param, gpPnt, der1, der2, der3);
        return { result: [[der1.X(), der1.Y(), der1.Z()], [der2.X(), der2.Y(), der2.Z()], [der3.X(), der3.Y(), der3.Z()]] };
    }


    derivativesOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): { result: [Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3] } {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);

        const gpPnt = this.och.gpPnt([0, 0, 0]);

        const der1 = this.och.gpVec([0, 0, 0]);
        const der2 = this.och.gpVec([0, 0, 0]);
        const der3 = this.och.gpVec([0, 0, 0]);

        const param = this.och.remap(inputs.param, 0, 1, curve.FirstParameter(), curve.LastParameter());

        curve.D3(param, gpPnt, der1, der2, der3);
        return { result: [[der1.X(), der1.Y(), der1.Z()], [der2.X(), der2.Y(), der2.Z()], [der3.X(), der3.Y(), der3.Z()]] };
    }

    startPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): { result: Inputs.Base.Point3 } {
        return { result: this.och.startPointOnWire(inputs) };
    }

    endPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): { result: Inputs.Base.Point3 } {
        return { result: this.och.endPointOnWire(inputs) };
    }

    createBezier(inputs: Inputs.OCCT.BezierDto) {
        const ptList = new this.occ.TColgp_Array1OfPnt_2(1, inputs.points.length + (inputs.closed ? 1 : 0));
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            ptList.SetValue(pIndex, this.och.gpPnt(inputs.points[pIndex - 1]));
        }
        if (inputs.closed) { ptList.SetValue(inputs.points.length + 1, ptList.Value(1)); }
        const geomCurveHandle = new this.occ.Geom_BezierCurve_1(ptList);
        const edge = new this.occ.BRepBuilderAPI_MakeEdge_24(
            new this.occ.Handle_Geom_Curve_2(geomCurveHandle)
        ).Edge();
        return new this.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
    }

    interpolatePoints(inputs: Inputs.OCCT.InterpolationDto) {
        return this.och.interpolatePoints(inputs);
    }

    createCircleWire(inputs: Inputs.OCCT.CircleDto) {
        return this.och.createCircle(inputs.radius, inputs.center, inputs.direction, typeSpecificityEnum.wire) as TopoDS_Wire;
    }

    createEllipseWire(inputs: Inputs.OCCT.EllipseDto) {
        return this.och.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, typeSpecificityEnum.wire) as TopoDS_Wire;
    }

    createSquareWire(inputs: Inputs.OCCT.SquareDto): TopoDS_Wire {
        return this.och.createSquareWire(inputs);
    }

    createStarWire(inputs: Inputs.OCCT.StarDto): TopoDS_Wire {
        return this.och.createStarWire(inputs);
    }

    createParallelogramWire(inputs: Inputs.OCCT.ParallelogramDto): TopoDS_Wire {
        return this.och.createParallelogramWire(inputs);
    }

    createRectangleWire(inputs: Inputs.OCCT.RectangleDto): TopoDS_Wire {
        return this.och.createRectangleWire(inputs);
    }

    getWire(inputs: Inputs.OCCT.ShapeIndexDto<TopoDS_Shape>): TopoDS_Wire {
        if (!inputs.shape || inputs.shape.ShapeType() > this.occ.TopAbs_ShapeEnum.TopAbs_FACE || inputs.shape.IsNull()) {
            throw (new Error('Shape is not provided or is of incorrect type'));
        }
        if (!inputs.index) { inputs.index = 0; }
        let innerWire: any = {}; let wiresFound = 0;
        this.och.forEachWire(inputs.shape, (i, s) => {
            if (i === inputs.index) { innerWire = this.occ.TopoDS.Wire_1(s); } wiresFound++;
        });
        return innerWire;
    }

    getWires(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Wire[] {
        return this.och.getWires(inputs);
    }

    getWireLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): { result: number } {
        return { result: this.och.getWireLength(inputs) };
    }

    getWiresLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire>): { result: number[] } {
        return { result: this.och.getWiresLengths(inputs) };
    }

    reversedWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): any {
        const wire: TopoDS_Wire = inputs.shape;
        return this.och.getActualTypeOfShape(wire.Reversed());
    }

    placeWireOnFace(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire | TopoDS_Face>) {
        let wire: TopoDS_Wire = inputs.shapes[0] as TopoDS_Wire;
        let face: TopoDS_Face = inputs.shapes[1] as TopoDS_Face;
        const srf = this.och.surfaceFromFace({ shape: face });
        return this.placeWire(wire, srf);
    }

    placeWiresOnFace(inputs: Inputs.OCCT.ShapeShapesDto<TopoDS_Face, TopoDS_Wire>) {
        let wires = inputs.shapes;
        let face = inputs.shape;
        const srf = this.och.surfaceFromFace({ shape: face });

        return wires.map(wire => this.placeWire(wire, srf));
    }

    private placeWire(wire: TopoDS_Wire, surface: Geom_Surface) {
        let edges = this.och.getEdges({ shape: wire });
        let newEdges = [];
        edges.forEach(e => {
            const umin = { current: 0 };
            const umax = { current: 0 };
            this.occ.BRep_Tool.Range_1(e, umin as any, umax as any);
            const crv = this.occ.BRep_Tool.Curve_2(e, umin.current, umax.current);
            if (!crv.IsNull()) {
                const c2dHandle = this.occ.GeomAPI.To2d(crv, this.och.gpPln([0, 0, 0], [0, 1, 0]));
                const newEdgeOnSrf = this.och.makeEdgeFromGeom2dCurveAndSurfaceBounded({ shapes: [c2dHandle.get(), surface] }, umin.current, umax.current);
                newEdges.push(newEdgeOnSrf);
            }
        });
        return this.och.combineEdgesAndWiresIntoAWire({ shapes: newEdges });
    }
}
