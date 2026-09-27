import { BRepAdaptor_CompCurve, Geom_Curve, BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { Base } from "../../api/inputs";
import { VectorHelperService } from "../../api/vector-helper.service";
import { EntitiesService } from "./entities.service";
import * as Resolved from "../../api/resolved-inputs";
import { InputError } from "@bitbybit-dev/base";
import { MassAndCentre, massesAndCentres, pointsFromCoordinates } from "./kernel-arrays";

export class GeomService {

    constructor(
        public readonly occ: BitbybitOcctModule,
        private readonly vecHelper: VectorHelperService,
        private readonly entitiesService: EntitiesService
    ) { }

    /**
     * Points at arc lengths from the start of an edge or a wire, sampled in one kernel call. A length
     * beyond the end continues along the curve past it.
     */
    pointsAtLengths(shape: TopoDS_Shape, lengths: number[]): Base.Point3[] {
        return this.sampledPoints(this.occ.CurvePointsAtLengths(shape, lengths));
    }

    /**
     * Points at parameters running from 0 at the start of an edge or a wire to 1 at its end, mapped
     * linearly onto the curve's parameter range, sampled in one kernel call.
     */
    pointsAtNormalizedParameters(shape: TopoDS_Shape, parameters: number[]): Base.Point3[] {
        return this.sampledPoints(this.occ.CurvePointsAtNormalizedParameters(shape, parameters));
    }

    /**
     * The values `nrOfDivisions` equal steps apart from 0 to `total`, the last one exactly `total`,
     * without the first or the last when the inputs ask.
     */
    divisions(inputs: Resolved.OCCT.DivideDto<unknown>, total: number): number[] {
        const count = inputs.nrOfDivisions;
        if (!(count >= 1)) {
            throw new InputError(`\`nrOfDivisions\` must be at least 1, and is ${count}.`, "nrOfDivisions");
        }
        const values: number[] = [];
        for (let index = 0; index <= count; index++) {
            values.push((index / count) * total);
        }
        if (inputs.removeStartPoint) {
            values.shift();
        }
        if (inputs.removeEndPoint) {
            values.pop();
        }
        return values;
    }

    /**
     * The length and the centre of mass of each shape's edges, in one kernel call. An edge is measured
     * along its curve and a wire along its edges as one curve; anything else sums its edges.
     */
    lengthsAndCentres(shapes: TopoDS_Shape[]): MassAndCentre[] {
        return massesAndCentres(this.occ.LinearPropertiesOfEach(shapes));
    }

    /** The area and the centroid of each shape's faces, in one kernel call. */
    areasAndCentres(shapes: TopoDS_Shape[]): MassAndCentre[] {
        return massesAndCentres(this.occ.SurfacePropertiesOfEach(shapes));
    }

    /** The volume and the centre of mass of each shape's solids, in one kernel call. */
    volumesAndCentres(shapes: TopoDS_Shape[]): MassAndCentre[] {
        return massesAndCentres(this.occ.VolumePropertiesOfEach(shapes));
    }

    private sampledPoints(coordinates: Float64Array | null): Base.Point3[] {
        if (!coordinates) {
            throw new Error("Points can only be sampled along an edge or a wire that has some length.");
        }
        return pointsFromCoordinates(coordinates);
    }

    pointOnCurveAtParam(inputs: Resolved.OCCT.DataOnGeometryAtParamDto<Geom_Curve | BRepAdaptor_CompCurve>): Base.Point3 {
        const curve = inputs.shape;
        const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
        const param = this.vecHelper.remap(inputs.param, 0, 1, curve.FirstParameter(), curve.LastParameter());
        curve.D0(param, gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        gpPnt.delete();
        return pt;
    }

    tangentOnCurveAtLengthCompCurve(inputs: Resolved.OCCT.DataOnGeometryAtLengthDto<BRepAdaptor_CompCurve>): Base.Point3 {
        const absc = this.occ.GCPnts_AbscissaPoint_FromCompCurve(inputs.shape, inputs.length, inputs.shape.FirstParameter());
        const param = absc.Parameter();
        const vec = this.occ.BRepAdaptor_CompCurve_DN(inputs.shape, param, 1);
        const pt: Base.Point3 = [vec.X(), vec.Y(), vec.Z()];
        vec.delete();
        absc.delete();
        return pt;
    }

    tangentOnCurveAtParam(inputs: Resolved.OCCT.DataOnGeometryAtParamDto<BRepAdaptor_CompCurve>): Base.Point3 {
        const curve = inputs.shape;
        const param = this.vecHelper.remap(inputs.param, 0, 1, curve.FirstParameter(), curve.LastParameter());
        const vec = this.occ.BRepAdaptor_CompCurve_DN(curve, param, 1);
        const pt: Base.Point3 = [vec.X(), vec.Y(), vec.Z()];
        vec.delete();
        return pt;
    }

    getLinearCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Base.Point3 {
        return this.lengthsAndCentres([inputs.shape])[0]!.centre;
    }

}
