import { GeometryHelper } from "@bitbybit-dev/base";
import { Base } from "../inputs";
import * as Inputs from "../inputs/jscad-inputs";
import { MathBitByBit } from "@bitbybit-dev/base";
import * as JSCAD from "@jscad/modeling";
import { asPath } from "./entity-narrowing";

/**
 * Building JSCAD paths, the 2D polylines that walls are extruded along, offsets follow and filled
 * shapes are closed from. A path lies in the XY plane and is open or closed; it grows by appending
 * points, polylines and arcs to its end, and a closed path accepts nothing more. Points given in 3D
 * keep only X and Y.
 */
export class JSCADPath {

    constructor(
        private readonly jscad: typeof JSCAD,
        private readonly geometryHelper: GeometryHelper,
        private readonly math: MathBitByBit
    ) { }

    /**
     * Builds a 2D path through the points in order, open or closed back to the first point as
     * `closed` says.
     *
     * Only X and Y of each point are used and repeated consecutive points are removed.
     * @param inputs - The points and whether to close the path
     * @returns The 2D path
     * @group from
     * @shortname points
     * @drawable true
     * @example
     * ```typescript
     * const path = await bitbybit.jscad.path.createFromPoints({ points: [[0, 0], [10, 0], [10, 10]], closed: false });
     * ```
     */
    createFromPoints(inputs: Inputs.JSCAD.PathFromPointsDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, inputs.closed);
    }

    /**
     * Builds one 2D path per list of points, in the same order; a list whose last point coincides
     * with its first becomes a closed path, any other stays open.
     *
     * Only X and Y of each point are used and repeated consecutive points are removed.
     * @param inputs - The lists of points
     * @returns One 2D path per list
     * @group from
     * @shortname paths from points
     * @drawable true
     * @example
     * ```typescript
     * const paths = await bitbybit.jscad.path.createPathsFromPoints({ pointsLists: [[[0, 0], [10, 0], [10, 10], [0, 0]], [[20, 0], [30, 0]]] });
     * ```
     */
    createPathsFromPoints(inputs: Inputs.JSCAD.PathsFromPointsDto): Inputs.JSCAD.JSCADEntity[] {
        return inputs.pointsLists.map(points => {
            const twoDimensionalPoints = points.map(pt => [pt[0], pt[1]]);
            if (twoDimensionalPoints.length > 1 &&
                this.geometryHelper.vectorsTheSame(twoDimensionalPoints[0]!, twoDimensionalPoints[twoDimensionalPoints.length - 1]!, 0.00001)) {
                return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, true);
            }
            return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, false);
        });
    }

    /**
     * Builds a 2D path through the points of a polyline, open or closed back to the first point as
     * `closed` says, whatever the polyline's own flag holds.
     *
     * Only X and Y of each point are used and repeated consecutive points are removed.
     * @param inputs - The polyline and whether to close the path
     * @returns The 2D path
     * @group from
     * @shortname polyline
     * @drawable true
     * @example
     * ```typescript
     * const path = await bitbybit.jscad.path.createFromPolyline({ polyline: { points: [[0, 0, 0], [10, 0, 0], [10, 10, 0]] }, closed: true });
     * ```
     */
    createFromPolyline(inputs: Inputs.JSCAD.PathFromPolylineDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, inputs.closed);
    }

    /**
     * Makes an empty open 2D path with no points, a starting point for `appendPoints`,
     * `appendPolyline` and `appendArc`.
     * @returns The empty 2D path
     * @group create
     * @shortname empty
     * @drawable false
     * @example
     * ```typescript
     * const empty = await bitbybit.jscad.path.createEmpty();
     * const path = await bitbybit.jscad.path.appendPoints({ path: empty, points: [[0, 0], [10, 0], [10, 10]] });
     * ```
     */
    createEmpty(): Inputs.JSCAD.JSCADEntity {
        return this.jscad.geometries.path2.create();
    }

    /**
     * Closes an open 2D path by joining its last point back to its first, giving a closed copy; a
     * path that is already closed comes back closed.
     *
     * A 2D shape or a solid throws an error.
     * @param inputs - The 2D path
     * @returns The closed 2D path
     * @group edit
     * @shortname close
     * @drawable true
     * @example
     * ```typescript
     * const closed = await bitbybit.jscad.path.close({ path });
     * ```
     */
    close(inputs: Inputs.JSCAD.PathDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.geometries.path2.close(asPath(inputs.path, "path operations"));
    }

    /**
     * Adds points to the end of an open 2D path, giving a longer copy.
     *
     * Only X and Y of each point are used and repeated consecutive points are removed; a closed
     * path throws an error.
     * @param inputs - The 2D path and the points to add
     * @returns The extended 2D path
     * @group append
     * @shortname points
     * @drawable true
     * @example
     * ```typescript
     * const longer = await bitbybit.jscad.path.appendPoints({ path, points: [[20, 10], [20, 0]] });
     * ```
     */
    appendPoints(inputs: Inputs.JSCAD.PathAppendPointsDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]);
        const duplicatePointsRemoved = this.geometryHelper.removeConsecutiveVectorDuplicates(twoDimensionalPoints);
        return this.jscad.geometries.path2.appendPoints(duplicatePointsRemoved as JSCAD.maths.vec2.Vec2[], asPath(inputs.path, "path operations"));
    }

    /**
     * Adds the points of a polyline to the end of an open 2D path, giving a longer copy.
     *
     * Only X and Y of each point are used and repeated consecutive points are removed; a closed
     * path throws an error.
     * @param inputs - The 2D path and the polyline to add
     * @returns The extended 2D path
     * @group append
     * @shortname polyline
     * @drawable true
     * @example
     * ```typescript
     * const longer = await bitbybit.jscad.path.appendPolyline({ path, polyline: { points: [[20, 10, 0], [20, 0, 0]] } });
     * ```
     */
    appendPolyline(inputs: Inputs.JSCAD.PathAppendPolylineDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]) as Base.Point2[];
        return this.appendPoints({ points: twoDimensionalPoints, path: inputs.path });
    }

    /**
     * Adds an elliptical arc from the last point of an open 2D path to `endPoint`, giving a longer
     * copy.
     *
     * `radiusX` and `radiusY` size the ellipse and `xAxisRotation` tilts it in degrees; `clockwise`
     * and `large` pick one of the four arcs that fit, and radii too small to reach the end point
     * are scaled up.
     * @param inputs - The 2D path, the end point, the two radii, the tilt, the arc choice and the segment count
     * @returns The extended 2D path
     * @group append
     * @shortname arc
     * @drawable true
     * @example
     * ```typescript
     * const start = await bitbybit.jscad.path.createFromPoints({ points: [[0, 0]], closed: false });
     * const arc = await bitbybit.jscad.path.appendArc({ path: start, endPoint: [10, 10], radiusX: 10, radiusY: 10, xAxisRotation: 0, clockwise: false, large: false, segments: 32 });
     * ```
     */
    appendArc(inputs: Inputs.JSCAD.PathAppendArcDto): Inputs.JSCAD.JSCADEntity {
        const endpoint = [inputs.endPoint[0], inputs.endPoint[1]] as JSCAD.maths.vec2.Vec2;
        const radius = [inputs.radiusX, inputs.radiusY] as JSCAD.maths.vec2.Vec2;
        return this.jscad.geometries.path2.appendArc({
            endpoint ,
            radius,
            xaxisrotation: this.math.degToRad({number: inputs.xAxisRotation}),
            clockwise: inputs.clockwise,
            large: inputs.large,
            segments: inputs.segments,
        }, asPath(inputs.path, "path operations"));
    }

    private removeDuplicatesAndCreateFromPoints(twoDimensionalPoints: number[][], closed: boolean): any {
        const duplicatePointsRemoved = this.geometryHelper.removeConsecutiveVectorDuplicates(twoDimensionalPoints);
        let path2d = this.jscad.geometries.path2.fromPoints({}, duplicatePointsRemoved  as JSCAD.maths.vec2.Vec2[]);
        if (closed) {
            path2d = this.jscad.geometries.path2.close(path2d);
        }
        return path2d;
    }
}
