import { Geom2d_Curve, BitbybitOcctModule, TopoDS_Wire, Handle_Geom2d_Curve } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";

export class OCCTCurves {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Creates a 2d ellipse. Be sure to use this geometry only for constructive purposes of modeling, but not for representation. You need to transform these curves to edges in order to draw them.
     * @param inputs 2D Ellipse parameters
     * @returns OpenCascade Geom2d_ellipse
     * @group primitives
     * @shortname ellipse 2d
     */
    geom2dEllipse(inputs: Inputs.OCCT.Geom2dEllipseDto): Handle_Geom2d_Curve {
        // Create axis with primary direction, perpendicular direction is computed internally
        const dir2: Inputs.Base.Vector2 = [-inputs.direction[1], inputs.direction[0]]; // Perpendicular to direction
        const axis2d = this.och.entitiesService.gpAx22d(inputs.center, inputs.direction, dir2);
        const res = this.occ.CreateGeom2d_Ellipse(axis2d, inputs.radiusMajor, inputs.radiusMinor);
        axis2d.delete();
        return res;
    }

    geom2dCircle(inputs: Inputs.OCCT.Geom2dCircleDto): Handle_Geom2d_Curve {
        // Create axis with primary direction, perpendicular direction is computed internally
        const dir2: Inputs.Base.Vector2 = [-inputs.direction[1], inputs.direction[0]]; // Perpendicular to direction
        const axis2d = this.och.entitiesService.gpAx22d(inputs.center, inputs.direction, dir2);
        const res = this.occ.CreateGeom2d_Circle(axis2d, inputs.radius);
        axis2d.delete();
        return res;
    }

    /**
     * Creates a trimmed curve from the basis curve limited between U1 and U2. This curve can't be drawn.
     * @param inputs Bounds and strategy for trimming the curve
     * @returns OpenCascade Geom2d_TrimmedCurve
     * @group create
     * @shortname trimmed 2d
     */
    geom2dTrimmedCurve(inputs: Inputs.OCCT.Geom2dTrimmedCurveDto<Handle_Geom2d_Curve>): Handle_Geom2d_Curve {
        return this.occ.CreateGeom2d_TrimmedCurve(inputs.shape, inputs.u1, inputs.u2);
    }

    /**
     * Creates a trimmed 2d curve segment between two 2d points. This curve can't be drawn.
     * @param inputs Two 2d points for start and end
     * @returns OpenCascade Geom2d_Segment
     * @group primitives
     * @shortname segment 2d
     */
    geom2dSegment(inputs: Inputs.OCCT.Geom2dSegmentDto): Handle_Geom2d_Curve {
        const pt1 = this.och.entitiesService.gpPnt2d(inputs.start);
        const pt2 = this.och.entitiesService.gpPnt2d(inputs.end);
        const res = this.occ.CreateGeom2d_Segment(pt1, pt2);
        pt1.delete();
        pt2.delete();
        return res;
    }

    /**
     * Gets 2d point represented by [number, number] on a curve at parameter.
     * @param inputs 2D Curve shape and parameter
     * @returns Point as array of 2 numbers
     * @group get
     * @shortname 2d point on curve
     */
    get2dPointFrom2dCurveOnParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Geom2d_Curve>): Inputs.Base.Point2 {
        const pt2d = inputs.shape.Value(inputs.param);
        const pt: Inputs.Base.Point2 = [pt2d.X(), pt2d.Y()];
        pt2d.delete();
        return pt;
    }

    /**
     * Creates a circle geom curve
     * @param inputs Axis information and radius
     * @returns Opencascade Geom_Circle curve
     * @group primitives
     * @shortname circle
     * @drawable false
     */
    geomCircleCurve(inputs: Inputs.OCCT.CircleDto): TopoDS_Wire {
        return this.och.entitiesService.createCircle(inputs.radius, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.wire) as TopoDS_Wire;
    }

    /**
     * Creates an ellipse geom curve
     * @param inputs Axis information and radius
     * @returns Opencascade Geom_Ellipse curve
     * @group primitives
     * @shortname ellipse
     * @drawable false
     */
    geomEllipseCurve(inputs: Inputs.OCCT.EllipseDto): TopoDS_Wire {
        return this.och.entitiesService.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.wire) as TopoDS_Wire;
    }

}