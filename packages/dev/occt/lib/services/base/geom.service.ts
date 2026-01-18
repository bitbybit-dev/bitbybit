import { BRepAdaptor_Curve, BRepAdaptor_CompCurve, Geom_Curve, BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { Base } from "../../api/inputs/inputs";
import { VectorHelperService } from "../../api/vector-helper.service";
import { EntitiesService } from "./entities.service";

export class GeomService {

    constructor(
        public readonly occ: BitbybitOcctModule,
        private readonly vecHelper: VectorHelperService,
        private readonly entitiesService: EntitiesService
    ) { }

    curveLength(inputs: Inputs.OCCT.ShapeDto<BRepAdaptor_Curve>): number {
        return this.occ.GCPnts_AbscissaPoint_CurveLength(inputs.shape);
    }

    curveLengthCompCurve(inputs: Inputs.OCCT.ShapeDto<BRepAdaptor_CompCurve>): number {
        return this.occ.GCPnts_AbscissaPoint_CompCurveLength(inputs.shape);
    }

    pointOnCurveAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Geom_Curve | BRepAdaptor_CompCurve>): Base.Point3 {
        const curve = inputs.shape;
        const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
        const param = this.vecHelper.remap(inputs.param, 0, 1, curve.FirstParameter(), curve.LastParameter());
        curve.D0(param, gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        gpPnt.delete();
        return pt;
    }

    pointOnCurveAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<BRepAdaptor_Curve>): Base.Point3 {
        const absc = new this.occ.GCPnts_AbscissaPoint(inputs.shape, inputs.length, inputs.shape.FirstParameter());
        const param = absc.Parameter();

        const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
        inputs.shape.D0(param, gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        absc.delete();
        gpPnt.delete();
        return pt;
    }

    pointOnCompCurveAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<BRepAdaptor_CompCurve>): Base.Point3 {
        const absc = this.occ.GCPnts_AbscissaPoint_FromCompCurve(inputs.shape, inputs.length, inputs.shape.FirstParameter());
        const param = absc.Parameter();

        const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
        inputs.shape.D0(param, gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        absc.delete();
        gpPnt.delete();
        return pt;
    }

    pointsOnCurveAtLengths(inputs: Inputs.OCCT.DataOnGeometryAtLengthsDto<BRepAdaptor_Curve>): Base.Point3[] {
        return inputs.lengths.map(length => this.pointOnCurveAtLength({ shape: inputs.shape, length }));
    }

    pointsOnCompCurveAtLengths(inputs: Inputs.OCCT.DataOnGeometryAtLengthsDto<BRepAdaptor_CompCurve>): Base.Point3[] {
        return inputs.lengths.map(length => this.pointOnCompCurveAtLength({ shape: inputs.shape, length }));
    }

    tangentOnCurveAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<BRepAdaptor_Curve>): Base.Point3 {
        const absc = new this.occ.GCPnts_AbscissaPoint(inputs.shape, inputs.length, inputs.shape.FirstParameter());
        const param = absc.Parameter();
        const vec = this.occ.BRepAdaptor_Curve_DN(inputs.shape, param, 1);
        const pt: Base.Point3 = [vec.X(), vec.Y(), vec.Z()];
        vec.delete();
        absc.delete();
        return pt;
    }

    tangentOnCurveAtLengthCompCurve(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<BRepAdaptor_CompCurve>): Base.Point3 {
        const absc = this.occ.GCPnts_AbscissaPoint_FromCompCurve(inputs.shape, inputs.length, inputs.shape.FirstParameter());
        const param = absc.Parameter();
        const vec = this.occ.BRepAdaptor_CompCurve_DN(inputs.shape, param, 1);
        const pt: Base.Point3 = [vec.X(), vec.Y(), vec.Z()];
        vec.delete();
        absc.delete();
        return pt;
    }

    tangentOnCurveAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<BRepAdaptor_CompCurve>): Base.Point3 {
        const curve = inputs.shape;
        const param = this.vecHelper.remap(inputs.param, 0, 1, curve.FirstParameter(), curve.LastParameter());
        const vec = this.occ.BRepAdaptor_CompCurve_DN(curve, param, 1);
        const pt: Base.Point3 = [vec.X(), vec.Y(), vec.Z()];
        vec.delete();
        return pt;
    }

    divideCurveByEqualLengthDistance(inputs: Inputs.OCCT.DivideDto<BRepAdaptor_Curve>): Base.Point3[] {
        const curve = inputs.shape;
        const curveLen = this.occ.GCPnts_AbscissaPoint_CurveLengthBetween(curve, curve.FirstParameter(), curve.LastParameter());
        const step = curveLen / inputs.nrOfDivisions;

        const lengths: number[] = [];
        for (let i = 0; i <= curveLen + 0.000000001; i += step) {
            lengths.push(i);
        }

        if (inputs.removeStartPoint) {
            lengths.shift();
        }
        if (inputs.removeEndPoint) {
            lengths.pop();
        }

        const paramsLength = lengths.map(l => {
            const absc = new this.occ.GCPnts_AbscissaPoint(curve, l, curve.FirstParameter());
            const param = absc.Parameter();
            absc.delete();
            return param;
        });

        const points = paramsLength.map(r => {
            const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
            curve.D0(r, gpPnt);
            const pt = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] as Base.Point3;
            gpPnt.delete();
            return pt;
        });
        return points;
    }

    divideCompCurveByEqualLengthDistance(inputs: Inputs.OCCT.DivideDto<BRepAdaptor_CompCurve>): Base.Point3[] {
        const curve = inputs.shape;
        const curveLen = this.occ.GCPnts_AbscissaPoint_CompCurveLengthBetween(curve, curve.FirstParameter(), curve.LastParameter());
        const step = curveLen / inputs.nrOfDivisions;

        const lengths: number[] = [];
        for (let i = 0; i <= curveLen + 0.000000001; i += step) {
            lengths.push(i);
        }

        if (inputs.removeStartPoint) {
            lengths.shift();
        }
        if (inputs.removeEndPoint) {
            lengths.pop();
        }

        const paramsLength = lengths.map(l => {
            const absc = this.occ.GCPnts_AbscissaPoint_FromCompCurve(curve, l, curve.FirstParameter());
            const param = absc.Parameter();
            absc.delete();
            return param;
        });

        const points = paramsLength.map(r => {
            const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
            curve.D0(r, gpPnt);
            const pt = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] as Base.Point3;
            gpPnt.delete();
            return pt;
        });
        return points;
    }

    divideCurveToNrSegments(inputs: Inputs.OCCT.DivideDto<Geom_Curve | BRepAdaptor_CompCurve>, uMin: number, uMax: number) {
        const curve = inputs.shape;

        const ranges: number[] = [];
        for (let i = 0; i <= inputs.nrOfDivisions; i++) {
            const param = (i / inputs.nrOfDivisions);
            const paramMapped = this.vecHelper.remap(param, 0, 1, uMin, uMax);
            ranges.push(paramMapped);
        }

        if (inputs.removeStartPoint) {
            ranges.shift();
        }
        if (inputs.removeEndPoint) {
            ranges.pop();
        }

        const points = ranges.map(r => {
            const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
            curve.D0(r, gpPnt);
            const pt = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] as Base.Point3;
            gpPnt.delete();
            return pt;
        });

        return points;
    }


    startPointOnCurve(inputs: Inputs.OCCT.ShapeDto<Geom_Curve | BRepAdaptor_CompCurve>): Inputs.Base.Point3 {
        const curve = inputs.shape;
        const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
        curve.D0(curve.FirstParameter(), gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        gpPnt.delete();
        return pt;
    }

    endPointOnCurve(inputs: Inputs.OCCT.ShapeDto<Geom_Curve | BRepAdaptor_CompCurve>): Inputs.Base.Point3 {
        const curve = inputs.shape;
        const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
        curve.D0(curve.LastParameter(), gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        gpPnt.delete();
        return pt;
    }

    getLinearCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Base.Point3 {
        const edge: TopoDS_Shape = inputs.shape;
        const gprops = new this.occ.GProp_GProps();
        this.occ.BRepGProp_LinearProperties(edge, gprops);
        const gppnt = gprops.CentreOfMass();
        const pt: Base.Point3 = [gppnt.X(), gppnt.Y(), gppnt.Z()];
        gprops.delete();
        return pt;
    }


}
