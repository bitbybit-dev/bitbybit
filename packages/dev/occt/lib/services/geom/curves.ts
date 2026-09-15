import { Geom2d_Curve, BitbybitOcctModule, TopoDS_Wire, Handle_Geom2d_Curve } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";

/**
 * Construction curves of OpenCascade: 2D curves in a plane or in the UV space of a surface
 * (circles, ellipses, segments, trimmed pieces), which feed
 * `shapes.edge.makeEdgeFromGeom2dCurveAndSurface`, and circle and ellipse wires. The 2D curves have
 * no topology and cannot be drawn; a point on them is read with `get2dPointFrom2dCurveOnParam`.
 */
export class OCCTCurves {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Creates a 2D ellipse curve in a plane, for constructions in the UV space of a surface.
     *
     * `direction` is the direction of the major axis; `radiusMajor` must be at least `radiusMinor`,
     * and `sense` flips the curve's direction. The curve cannot be drawn; wrap it with
     * `shapes.edge.makeEdgeFromGeom2dCurveAndSurface`.
     * @param inputs - The center, the major axis direction, the two radii and the direction sense
     * @returns The 2D ellipse curve
     * @group primitives
     * @shortname ellipse 2d
     * @example
     * ```typescript
     * const ellipse = await bitbybit.occt.geom.curves.geom2dEllipse({ center: [0, 0], direction: [1, 0], radiusMinor: 1, radiusMajor: 2, sense: false });
     * ```
     */
    geom2dEllipse(inputs: Inputs.OCCT.Geom2dEllipseDto): Handle_Geom2d_Curve {
        const dir2: Inputs.Base.Vector2 = [-inputs.direction[1], inputs.direction[0]];
        const axis2d = this.och.entitiesService.gpAx22d(inputs.center, inputs.direction, dir2);
        const res = this.occ.CreateGeom2d_Ellipse(axis2d, inputs.radiusMajor, inputs.radiusMinor);
        axis2d.delete();
        return res;
    }

    /**
     * Creates a 2D circle curve in a plane, for constructions in the UV space of a surface.
     *
     * `direction` sets where the curve's parameter starts, and `sense` flips its direction. The
     * curve cannot be drawn; wrap it with `shapes.edge.makeEdgeFromGeom2dCurveAndSurface`.
     * @param inputs - The center, the start direction, the radius and the direction sense
     * @returns The 2D circle curve
     */
    geom2dCircle(inputs: Inputs.OCCT.Geom2dCircleDto): Handle_Geom2d_Curve {
        const dir2: Inputs.Base.Vector2 = [-inputs.direction[1], inputs.direction[0]];
        const axis2d = this.och.entitiesService.gpAx22d(inputs.center, inputs.direction, dir2);
        const res = this.occ.CreateGeom2d_Circle(axis2d, inputs.radius);
        axis2d.delete();
        return res;
    }

    /**
     * Cuts a piece out of a 2D curve between the parameters `u1` and `u2`.
     *
     * On a closed curve such as a circle the parameters run around it, so a trimmed circle is an
     * arc. The result cannot be drawn on its own.
     * @param inputs - The 2D curve, the two parameters and the trimming options
     * @returns The trimmed 2D curve
     * @group create
     * @shortname trimmed 2d
     * @example
     * ```typescript
     * const arc = await bitbybit.occt.geom.curves.geom2dTrimmedCurve({ shape: circle2d, u1: 0, u2: 1.57, sense: true, adjustPeriodic: true });
     * ```
     */
    geom2dTrimmedCurve(inputs: Inputs.OCCT.Geom2dTrimmedCurveDto<Handle_Geom2d_Curve>): Handle_Geom2d_Curve {
        return this.occ.CreateGeom2d_TrimmedCurve(inputs.shape, inputs.u1, inputs.u2);
    }

    /**
     * Creates a straight 2D curve segment between two 2D points, for constructions in the UV space
     * of a surface.
     *
     * The segment cannot be drawn on its own.
     * @param inputs - The start and end points
     * @returns The 2D segment curve
     * @group primitives
     * @shortname segment 2d
     * @example
     * ```typescript
     * const segment = await bitbybit.occt.geom.curves.geom2dSegment({ start: [0, 0], end: [1, 0] });
     * ```
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
     * Evaluates a 2D curve at a parameter and returns the 2D point there.
     *
     * The parameter is in the curve's own range, not a fraction: a circle runs from 0 to two pi, a
     * segment from 0 to its length.
     * @param inputs - The 2D curve and the parameter
     * @returns The point as two numbers
     * @group get
     * @shortname 2d point on curve
     * @example
     * ```typescript
     * const point = await bitbybit.occt.geom.curves.get2dPointFrom2dCurveOnParam({ shape: circle2d, param: 1.57 });
     * ```
     */
    get2dPointFrom2dCurveOnParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Geom2d_Curve>): Inputs.Base.Point2 {
        const pt2d = inputs.shape.Value(inputs.param);
        const pt: Inputs.Base.Point2 = [pt2d.X(), pt2d.Y()];
        pt2d.delete();
        return pt;
    }

    /**
     * Creates a full circle as a closed single-edge wire, lying in the plane whose normal is
     * `direction`.
     *
     * The same as `shapes.wire.createCircleWire`, kept here beside the 2D curves.
     * @param inputs - The radius, the center and the plane normal
     * @returns The circle wire
     * @group primitives
     * @shortname circle
     * @drawable false
     * @example
     * ```typescript
     * const circle = await bitbybit.occt.geom.curves.geomCircleCurve({ radius: 5, center: [0, 0, 0], direction: [0, 1, 0] });
     * ```
     */
    geomCircleCurve(inputs: Inputs.OCCT.CircleDto): TopoDS_Wire {
        return this.och.entitiesService.createCircle(inputs.radius, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.wire);
    }

    /**
     * Creates a full ellipse as a closed single-edge wire, lying in the plane whose normal is
     * `direction`.
     *
     * The same as `shapes.wire.createEllipseWire`, kept here beside the 2D curves; `radiusMajor`
     * must not be smaller than `radiusMinor`.
     * @param inputs - The center, the plane normal and the two radii
     * @returns The ellipse wire
     * @group primitives
     * @shortname ellipse
     * @drawable false
     * @example
     * ```typescript
     * const ellipse = await bitbybit.occt.geom.curves.geomEllipseCurve({ center: [0, 0, 0], direction: [0, 1, 0], radiusMinor: 3, radiusMajor: 6 });
     * ```
     */
    geomEllipseCurve(inputs: Inputs.OCCT.EllipseDto): TopoDS_Wire {
        return this.och.entitiesService.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.wire);
    }

}