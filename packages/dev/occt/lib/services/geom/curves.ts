import { Geom2d_Curve, Geom_Curve, BitbybitOcctModule, TopoDS_Edge, TopoDS_Wire, Handle_Geom2d_Curve } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs/inputs";

export class OCCTCurves {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    geom2dEllipse(inputs: Inputs.OCCT.Geom2dEllipseDto) {
        // Create axis with primary direction, perpendicular direction is computed internally
        const dir2: Inputs.Base.Vector2 = [-inputs.direction[1], inputs.direction[0]]; // Perpendicular to direction
        const axis2d = this.och.entitiesService.gpAx22d(inputs.center, inputs.direction, dir2);
        const res = this.occ.CreateGeom2d_Ellipse(axis2d, inputs.radiusMajor, inputs.radiusMinor);
        axis2d.delete();
        return res;
    }

    geom2dCircle(inputs: Inputs.OCCT.Geom2dCircleDto) {
        // Create axis with primary direction, perpendicular direction is computed internally
        const dir2: Inputs.Base.Vector2 = [-inputs.direction[1], inputs.direction[0]]; // Perpendicular to direction
        const axis2d = this.och.entitiesService.gpAx22d(inputs.center, inputs.direction, dir2);
        const res = this.occ.CreateGeom2d_Circle(axis2d, inputs.radius);
        axis2d.delete();
        return res;
    }

    geom2dTrimmedCurve(inputs: Inputs.OCCT.Geom2dTrimmedCurveDto<Handle_Geom2d_Curve>) {
        return this.occ.CreateGeom2d_TrimmedCurve(inputs.shape, inputs.u1, inputs.u2);
    }

    geom2dSegment(inputs: Inputs.OCCT.Geom2dSegmentDto) {
        const pt1 = this.och.entitiesService.gpPnt2d(inputs.start);
        const pt2 = this.och.entitiesService.gpPnt2d(inputs.end);
        const res = this.occ.CreateGeom2d_Segment(pt1, pt2);
        pt1.delete();
        pt2.delete();
        return res;
    }

    get2dPointFrom2dCurveOnParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Geom2d_Curve>) {
        const pt2d = inputs.shape.Value(inputs.param);
        const pt = [pt2d.X(), pt2d.Y()]; 
        pt2d.delete();
        return pt;
    }

    geomCircleCurve(inputs: Inputs.OCCT.CircleDto): TopoDS_Wire {
        return this.och.entitiesService.createCircle(inputs.radius, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.wire) as TopoDS_Wire;
    }

    geomEllipseCurve(inputs: Inputs.OCCT.EllipseDto): TopoDS_Wire {
        return this.och.entitiesService.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.wire) as TopoDS_Wire;
    }

}