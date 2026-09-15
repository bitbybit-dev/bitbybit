import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import { Base } from "../../api/inputs";
import * as Models from "../../api/models";

/**
 * Rounding and beveling single corners of an OpenCascade shell or solid, picked by a point near
 * them rather than by edge index: the corner nearest each point is found, classified and treated on
 * its own, leaving the rest of the shape untouched. A corner is where several edges meet at one
 * vertex. `classifyCornerByPoint` reports what kind of corner a point would pick, and
 * `cornerByPointReport` explains what a fillet did or why it was skipped.
 */
export class OCCTCorners {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) { }

    /**
     * Rounds the corner nearest each given point on a shell or solid, touching only that corner.
     *
     * `radius` is the rounding size; `taperFactor`, for 3D corners, sets how far the rounding
     * reaches along the meeting edges, 0 for the tightest, 1 for the full reach. `snapTolerance`
     * caps the point-to-vertex distance, 0 accepting the nearest; `mode` `planarOnly` skips 3D
     * corners.
     * @param inputs - The shape, the points near the corners, the radius, the taper factor, the snap tolerance and the mode
     * @returns The shape with rounded corners
     * @group by point
     * @shortname fillet corner by point
     * @drawable true
     * @example
     * ```typescript
     * const rounded = await bitbybit.occt.corners.filletCornerByPoint({
     *     shape: box,
     *     points: [[5, 5, 5]],
     *     radius: 1,
     *     taperFactor: 1,
     *     snapTolerance: 0,
     *     mode: Bit.Inputs.OCCT.cornerModeEnum.auto,
     * });
     * ```
     */
    filletCornerByPoint(inputs: Inputs.OCCT.FilletCornerByPointDto<TopoDS_Shape>): TopoDS_Shape {
        const points = this.pointsToVectorDouble(inputs.points);
        const mode = this.cornerModeToNumber(inputs.mode);
        const result = this.occ.FilletCornerByPoint(inputs.shape, points, inputs.radius, inputs.taperFactor, inputs.snapTolerance, mode);
        points.delete();
        if (result.IsNull()) {
            result.delete();
            throw new Error("Could not fillet the corner(s) for the given point(s).");
        }
        const shape = this.och.converterService.getActualTypeOfShape(result);
        result.delete();
        return shape;
    }

    /**
     * Bevels the corner nearest each given point on a shell or solid, touching only that corner.
     *
     * `distance` is how far the bevel reaches from the corner and `angle` its slope in degrees.
     * `snapTolerance` caps how far a point may be from a vertex, 0 accepting the nearest; `mode`
     * `planarOnly` skips 3D corners. A corner that cannot be beveled throws.
     * @param inputs - The shape, the points near the corners, the distance, the angle, the snap tolerance and the mode
     * @returns The shape with beveled corners
     * @group by point
     * @shortname chamfer corner by point
     * @drawable true
     * @example
     * ```typescript
     * const beveled = await bitbybit.occt.corners.chamferCornerByPoint({
     *     shape: box,
     *     points: [[5, 5, 5]],
     *     distance: 1,
     *     angle: 45,
     *     snapTolerance: 0,
     *     mode: Bit.Inputs.OCCT.cornerModeEnum.auto,
     * });
     * ```
     */
    chamferCornerByPoint(inputs: Inputs.OCCT.ChamferCornerByPointDto<TopoDS_Shape>): TopoDS_Shape {
        const points = this.pointsToVectorDouble(inputs.points);
        const mode = this.cornerModeToNumber(inputs.mode);
        const result = this.occ.ChamferCornerByPoint(inputs.shape, points, inputs.distance, inputs.angle, inputs.snapTolerance, mode);
        points.delete();
        if (result.IsNull()) {
            result.delete();
            throw new Error("Could not chamfer the corner(s) for the given point(s).");
        }
        const shape = this.och.converterService.getActualTypeOfShape(result);
        result.delete();
        return shape;
    }

    /**
     * Looks up the corner nearest each given point and reports what kind it is, without changing
     * the shape.
     *
     * Each entry says where the corner is, how far it was from the point, how many edges and faces
     * meet there and whether it is planar, developable or a true 3D corner, or why none was found.
     * It shows what `filletCornerByPoint` picks.
     * @param inputs - The shape, the points near the corners and the snap tolerance
     * @returns The report with one entry per point
     * @group by point
     * @shortname classify corner by point
     * @drawable false
     * @example
     * ```typescript
     * const report = await bitbybit.occt.corners.classifyCornerByPoint({ shape: box, points: [[5, 5, 5]], snapTolerance: 0 });
     * console.log(report.results[0].classification);
     * ```
     */
    classifyCornerByPoint(inputs: Inputs.OCCT.ClassifyCornerByPointDto<TopoDS_Shape>): Models.OCCT.CornerByPointReport {
        const points = this.pointsToVectorDouble(inputs.points);
        const json = this.occ.ClassifyCornerByPoint(inputs.shape, points, inputs.snapTolerance);
        points.delete();
        return JSON.parse(json) as Models.OCCT.CornerByPointReport;
    }

    /**
     * Runs the same corner rounding as `filletCornerByPoint` and returns a report instead of the
     * shape: for each point, which corner was found, how it was classified, what was done and
     * whether it succeeded.
     *
     * Handy for finding out why a fillet was skipped before changing the radius or the points.
     * @param inputs - The shape, the points near the corners, the radius, the taper factor, the snap tolerance and the mode
     * @returns The report with one entry per point
     * @group by point
     * @shortname corner by point report
     * @drawable false
     * @example
     * ```typescript
     * const report = await bitbybit.occt.corners.cornerByPointReport({
     *     shape: box,
     *     points: [[5, 5, 5]],
     *     radius: 1,
     *     taperFactor: 1,
     *     snapTolerance: 0,
     *     mode: Bit.Inputs.OCCT.cornerModeEnum.auto,
     * });
     * console.log(report.results[0].applied, report.results[0].message);
     * ```
     */
    cornerByPointReport(inputs: Inputs.OCCT.FilletCornerByPointDto<TopoDS_Shape>): Models.OCCT.CornerByPointReport {
        const points = this.pointsToVectorDouble(inputs.points);
        const mode = this.cornerModeToNumber(inputs.mode);
        const json = this.occ.CornerByPointReport(inputs.shape, points, inputs.radius, inputs.taperFactor, inputs.snapTolerance, mode);
        points.delete();
        return JSON.parse(json) as Models.OCCT.CornerByPointReport;
    }

    private cornerModeToNumber(mode: Inputs.OCCT.cornerModeEnum): number {
        return mode === Inputs.OCCT.cornerModeEnum.planarOnly ? 1 : 0;
    }

    private pointsToVectorDouble(points: Base.Point3[]) {
        const vec = new this.occ.VectorDouble();
        for (const point of points) {
            vec.push_back(point[0]);
            vec.push_back(point[1]);
            vec.push_back(point[2]);
        }
        return vec;
    }

}
