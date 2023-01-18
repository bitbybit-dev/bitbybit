import { Geom2d_Curve, Geom2d_TrimmedCurve, Geom_Curve, OpenCascadeInstance } from 'opencascade.js';
import { OccHelper, typeSpecificityEnum } from '../../occ-helper';
import * as Inputs from '../../../../api/inputs/inputs';

export class OCCTCurves {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    geom2dEllipse(inputs: Inputs.OCCT.Geom2dEllipseDto) {
        const axis2d = this.och.gpAx2d(inputs.center, inputs.direction);
        return new this.occ.Geom2d_Ellipse_2(axis2d, inputs.radiusMajor, inputs.radiusMinor, inputs.sense);
    }

    geom2dCircle(inputs: Inputs.OCCT.Geom2dCircleDto) {
        const axis2d = this.och.gpAx2d(inputs.center, inputs.direction);
        return new this.occ.Geom2d_Circle_2(axis2d, inputs.radius, inputs.sense);
    }

    geom2dTrimmedCurve(inputs: Inputs.OCCT.Geom2dTrimmedCurveDto<Geom2d_Curve>) {
        const handleCurve = new this.occ.Handle_Geom2d_Curve_2(inputs.shape);
        const trimmed = new this.occ.Geom2d_TrimmedCurve(handleCurve, inputs.u1, inputs.u2, inputs.sense, inputs.theAdjustPeriodic);
        return trimmed;
    }

    geom2dSegment(inputs: Inputs.OCCT.Geom2dSegmentDto) {
        const pt1 = this.och.gpPnt2d(inputs.start);
        const pt2 = this.och.gpPnt2d(inputs.end);
        const res = new this.occ.GCE2d_MakeSegment_1(pt1, pt2);
        return res.Value().get();
    }

    get2dPointFrom2dCurveOnParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Geom2d_Curve>) {
        const pt2d = inputs.shape.Value(inputs.param);
        return { result: [pt2d.X(), pt2d.Y()] };
    }

    geomCircleCurve(inputs: Inputs.OCCT.CircleDto): any {
        return this.och.createCircle(inputs.radius, inputs.center, inputs.direction, typeSpecificityEnum.curve);
    }

    geomEllipseCurve(inputs: Inputs.OCCT.EllipseDto) {
        return this.och.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, typeSpecificityEnum.curve)
    }

}