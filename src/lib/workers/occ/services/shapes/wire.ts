import { OpenCascadeInstance, TopoDS_Shape, TopoDS_Wire } from 'opencascade.js';
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

    combineEdgesAndWiresIntoAWire(inputs: Inputs.OCCT.ShapesDto): any {
        return this.och.combineEdgesAndWiresIntoAWire(inputs);
    }

    addEdgesAndWiresToWire(inputs: Inputs.OCCT.ShapeShapesDto): any {
        const makeWire = new this.occ.BRepBuilderAPI_MakeWire_1();
        makeWire.Add_2(inputs.shape);
        inputs.shapes.forEach((shape: TopoDS_Shape) => {
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

    divideWireByParamsToPoints(inputs: Inputs.OCCT.DivideWireDto): { result: Inputs.Base.Point3[] } {
        const step = 1 / inputs.nrOfDivisions;

        const wire = inputs.shape as TopoDS_Wire;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const lastParam = curve.LastParameter();

        const ranges = [];
        if (inputs.excludeEndPoints) {
            for (let i = step; i <= lastParam - step; i += step) {
                ranges.push(i)
            }
            if (ranges.length < inputs.nrOfDivisions - 1) {
                ranges.push(1 - step);
            }
        } else {
            for (let i = 0; i <= lastParam; i += step) {
                ranges.push(i)
            }
            if (ranges.length < inputs.nrOfDivisions + 1) {
                ranges.push(1);
            }
        }

        const points = ranges.map(r => {
            const gpPnt = this.och.gpPnt([0, 0, 0]);
            curve.D0(r, gpPnt);
            return [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] as Inputs.Base.Point3;
        });

        return { result: points };
    }

    divideWireByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideWireDto): { result: Inputs.Base.Point3[] } {

        const wire = inputs.shape as TopoDS_Wire;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const curveLength = this.occ.GCPnts_AbscissaPoint.Length_5(curve, curve.FirstParameter(), curve.LastParameter());
        const step = curveLength / inputs.nrOfDivisions;

        const lengths = [];
        if (inputs.excludeEndPoints) {
            for (let i = step; i < curveLength; i += step) {
                lengths.push(i);
            }
        } else {
            for (let i = 0; i <= curveLength; i += step) {
                lengths.push(i);
            }
        }

        const paramsLength = lengths.map(l => {
            const absc = new this.occ.GCPnts_AbscissaPoint_2(curve, l, curve.FirstParameter());
            const param = absc.Parameter();
            return param;
        })

        const points = paramsLength.map(r => {
            const gpPnt = this.och.gpPnt([0, 0, 0]);
            curve.D0(r, gpPnt);
            return [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] as Inputs.Base.Point3;
        });

        return { result: points };
    }

    pointOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto): { result: Inputs.Base.Point3 } {
        const wire = inputs.shape as TopoDS_Wire;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);

        const gpPnt = this.och.gpPnt([0, 0, 0]);
        curve.D0(inputs.param, gpPnt);
        return { result: [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] };
    }

    pointOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto): { result: Inputs.Base.Point3 } {
        const wire = inputs.shape as TopoDS_Wire;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);

        const absc = new this.occ.GCPnts_AbscissaPoint_2(curve, inputs.length, curve.FirstParameter());
        const param = absc.Parameter();

        const gpPnt = this.och.gpPnt([0, 0, 0]);
        curve.D0(param, gpPnt);
        return { result: [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] };
    }

    derivativesOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto): { result: [Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3] } {
        const wire = inputs.shape as TopoDS_Wire;
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


    derivativesOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto): { result: [Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3] } {
        const wire = inputs.shape as TopoDS_Wire;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);

        const gpPnt = this.och.gpPnt([0, 0, 0]);

        const der1 = this.och.gpVec([0, 0, 0]);
        const der2 = this.och.gpVec([0, 0, 0]);
        const der3 = this.och.gpVec([0, 0, 0]);

        curve.D3(inputs.param, gpPnt, der1, der2, der3);
        return { result: [[der1.X(), der1.Y(), der1.Z()], [der2.X(), der2.Y(), der2.Z()], [der3.X(), der3.Y(), der3.Z()]] };
    }

    wireLength(inputs: Inputs.OCCT.ShapeDto): { result: number } {
        const wire = inputs.shape as TopoDS_Wire;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const curveLength = this.occ.GCPnts_AbscissaPoint.Length_5(curve, curve.FirstParameter(), curve.LastParameter());

        return { result: curveLength };
    }

    startPointOnWire(inputs: Inputs.OCCT.ShapeDto): { result: Inputs.Base.Point3 } {
        const wire = inputs.shape as TopoDS_Wire;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const gpPnt = this.och.gpPnt([0, 0, 0]);
        curve.D0(0, gpPnt);
        return { result: [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] };
    }

    endPointOnWire(inputs: Inputs.OCCT.ShapeDto): { result: Inputs.Base.Point3 } {
        const wire = inputs.shape as TopoDS_Wire;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const gpPnt = this.och.gpPnt([0, 0, 0]);
        curve.D0(1, gpPnt);
        return { result: [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] };
    }

    createInterpolation(inputs: Inputs.OCCT.BSplineDto): any {
        // ToDo unaccessible api, git issue opened on opencascade.js GeomAPI_Interpolate
        const ptList = new this.occ.TColgp_Array1OfPnt_2(1, inputs.points.length + (inputs.closed ? 1 : 0));
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            ptList.SetValue(pIndex, this.och.gpPnt(inputs.points[pIndex - 1]));
        }

        if (inputs.closed) { ptList.SetValue(inputs.points.length + 1, ptList.Value(1)); }
        const d = new this.occ.Handle_TColgp_HArray1OfPnt_1();
        const tcol = d.get();
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            tcol.SetValue(pIndex, this.och.gpPnt(inputs.points[pIndex - 1]));
        }


        // const d = new this.occ.Handle_TColgp_HArray1OfPnt_2(ptList);

        // const d = bitbybit.occt.shapes.wire.createInterpolation({ points: [[0,0,0], [1,1,1], [2,2,3]], closed: true})

        // const s = new this.occ.Handle_TColgp_HArray1OfPnt_1
        // const x = new this.occ.Handle_TColgp_HArray1OfPnt
        const geomCurveHandle = new this.occ.GeomAPI_Interpolate_1(tcol, true, 1.0e-3);
        const edge = new this.occ.BRepBuilderAPI_MakeEdge_24(
            new this.occ.Handle_Geom_Curve_2(geomCurveHandle.Curve().get())
        ).Edge();
        return new this.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
    }

    createBezier(inputs: Inputs.OCCT.BezierDto): any {
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

    createCircleWire(inputs: Inputs.OCCT.CircleDto): any {
        return this.och.createCircle(inputs.radius, inputs.center, inputs.direction, typeSpecificityEnum.wire);
    }

    createEllipseWire(inputs: Inputs.OCCT.EllipseDto) {
        return this.och.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, typeSpecificityEnum.wire)
    }

    getWire(inputs: Inputs.OCCT.ShapeIndexDto): any {
        if (!inputs.shape || inputs.shape.ShapeType() > this.occ.TopAbs_ShapeEnum.TopAbs_FACE || inputs.shape.IsNull()) {
            throw (new Error('Shape is not provided or is of incorrect type'));
        }
        if (!inputs.index) { inputs.index = 0; }
        let innerWire = {}; let wiresFound = 0;
        this.och.forEachWire(inputs.shape, (i, s) => {
            if (i === inputs.index) { innerWire = this.occ.TopoDS.Wire_1(s); } wiresFound++;
        });
        return innerWire;
    }

    reversedWire(inputs: Inputs.OCCT.ShapeDto): any {
        const wire = inputs.shape as TopoDS_Wire;
        return wire.Reversed();
    }
}
