import { Adaptor3d_Curve, BRepAdaptor_CompCurve_2, Geom_Curve, OpenCascadeInstance, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { Base } from "../../api/inputs/inputs";
import { VectorHelperService } from "../../api/vector-helper.service";
import { EntitiesService } from "./entities.service";

export class GeomService {

    constructor(
        public readonly occ: OpenCascadeInstance,
        private readonly vecHelper: VectorHelperService,
        private readonly entitiesService: EntitiesService
    ) { }

    curveLength(inputs: Inputs.OCCT.ShapeDto<Adaptor3d_Curve>): number {
        return this.occ.GCPnts_AbscissaPoint.Length_1(inputs.shape);
    }

    pointOnCurveAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Geom_Curve | BRepAdaptor_CompCurve_2>): Base.Point3 {
        const curve = inputs.shape;
        const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
        const param = this.vecHelper.remap(inputs.param, 0, 1, curve.FirstParameter(), curve.LastParameter());
        curve.D0(param, gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        gpPnt.delete();
        return pt;
    }

    pointOnCurveAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Adaptor3d_Curve>): Base.Point3 {
        const absc = new this.occ.GCPnts_AbscissaPoint_2(inputs.shape, inputs.length, inputs.shape.FirstParameter());
        const param = absc.Parameter();

        const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
        inputs.shape.D0(param, gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        absc.delete();
        gpPnt.delete();
        return pt;
    }

    pointsOnCurveAtLengths(inputs: Inputs.OCCT.DataOnGeometryAtLengthsDto<Adaptor3d_Curve>): Base.Point3[] {
        return inputs.lengths.map(length => this.pointOnCurveAtLength({ shape: inputs.shape, length }));
    }

    tangentOnCurveAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Adaptor3d_Curve>): Base.Point3 {
        const absc = new this.occ.GCPnts_AbscissaPoint_2(inputs.shape, inputs.length, inputs.shape.FirstParameter());
        const param = absc.Parameter();
        const vec = inputs.shape.DN(param, 1);
        const pt: Base.Point3 = [vec.X(), vec.Y(), vec.Z()];
        vec.delete();
        absc.delete();
        return pt;
    }

    tangentOnCurveAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Geom_Curve | BRepAdaptor_CompCurve_2>): Base.Point3 {
        const curve = inputs.shape;
        const param = this.vecHelper.remap(inputs.param, 0, 1, curve.FirstParameter(), curve.LastParameter());
        const vec = curve.DN(param, 1);
        const pt: Base.Point3 = [vec.X(), vec.Y(), vec.Z()];
        vec.delete();
        return pt;
    }

    divideCurveByEqualLengthDistance(inputs: Inputs.OCCT.DivideDto<Adaptor3d_Curve>): Base.Point3[] {
        const curve = inputs.shape;
        const curveLength = this.occ.GCPnts_AbscissaPoint.Length_5(curve, curve.FirstParameter(), curve.LastParameter());
        const step = curveLength / inputs.nrOfDivisions;

        const lengths: number[] = [];
        for (let i = 0; i <= curveLength + 0.000000001; i += step) {
            lengths.push(i);
        }

        if (inputs.removeStartPoint) {
            lengths.shift();
        }
        if (inputs.removeEndPoint) {
            lengths.pop();
        }

        const paramsLength = lengths.map(l => {
            const absc = new this.occ.GCPnts_AbscissaPoint_2(curve, l, curve.FirstParameter());
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

    divideCurveToNrSegments(inputs: Inputs.OCCT.DivideDto<Geom_Curve | BRepAdaptor_CompCurve_2>, uMin: number, uMax: number) {
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


    startPointOnCurve(inputs: Inputs.OCCT.ShapeDto<Geom_Curve | BRepAdaptor_CompCurve_2>): Inputs.Base.Point3 {
        const curve = inputs.shape;
        const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
        curve.D0(curve.FirstParameter(), gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        gpPnt.delete();
        return pt;
    }

    endPointOnCurve(inputs: Inputs.OCCT.ShapeDto<Geom_Curve | BRepAdaptor_CompCurve_2>): Inputs.Base.Point3 {
        const curve = inputs.shape;
        const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
        curve.D0(curve.LastParameter(), gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        gpPnt.delete();
        return pt;
    }

    getLinearCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Base.Point3 {
        const edge: TopoDS_Shape = inputs.shape;
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.LinearProperties(edge, gprops, false, false);
        const gppnt = gprops.CentreOfMass();
        const pt: Base.Point3 = [gppnt.X(), gppnt.Y(), gppnt.Z()];
        gprops.delete();
        return pt;
    }


}
