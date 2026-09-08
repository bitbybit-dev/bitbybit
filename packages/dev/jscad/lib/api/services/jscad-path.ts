import { GeometryHelper } from "@bitbybit-dev/base";
import { Base } from "../inputs";
import * as Inputs from "../inputs/jscad-inputs";
import { MathBitByBit } from "@bitbybit-dev/base";
import * as JSCAD from "@jscad/modeling";
import { asPath } from "./entity-narrowing";

/**
 * Contains various functions for Path from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADPath {

    constructor(
        private readonly jscad: typeof JSCAD,
        private readonly geometryHelper: GeometryHelper,
        private readonly math: MathBitByBit
    ) { }

    /**
     * Create a 2D path from a list of points
     * @param inputs Points and indication if we want a closed path or not
     * @returns Path
     * @group from
     * @shortname points
     * @drawable true
     */
    createFromPoints(inputs: Inputs.JSCAD.PathFromPointsDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, inputs.closed);
    }

    /**
     * Create 2D paths from a lists of points
     * @param inputs Points lists
     * @returns Paths
     * @group from
     * @shortname paths from points
     * @drawable true
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
     * Create a 2D path from a polyline
     * @param inputs Polyline and indication if we want a closed path or not
     * @returns Path
     * @group from
     * @shortname polyline
     * @drawable true
     */
    createFromPolyline(inputs: Inputs.JSCAD.PathFromPolylineDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, inputs.closed);
    }

    /**
     * Create empty 2D path
     * @returns Empty path
     * @group create
     * @shortname empty
     * @drawable false
     */
    createEmpty(): Inputs.JSCAD.JSCADEntity {
        return this.jscad.geometries.path2.create();
    }

    /**
     * Closes an open 2D path
     * @param inputs Path
     * @returns Closed path
     * @group edit
     * @shortname close
     * @drawable true
     */
    close(inputs: Inputs.JSCAD.PathDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.geometries.path2.close(asPath(inputs.path, "path operations"));
    }

    /**
     * Append the path with 2D points
     * @param inputs Path to append and points
     * @returns Appended path
     * @group append
     * @shortname points
     * @drawable true
     */
    appendPoints(inputs: Inputs.JSCAD.PathAppendPointsDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]);
        const duplicatePointsRemoved = this.geometryHelper.removeConsecutiveVectorDuplicates(twoDimensionalPoints);
        return this.jscad.geometries.path2.appendPoints(duplicatePointsRemoved as JSCAD.maths.vec2.Vec2[], asPath(inputs.path, "path operations"));
    }

    /**
     * Append the path with polyline
     * @param inputs Path to append and polyline
     * @returns Appended path
     * @group append
     * @shortname polyline
     * @drawable true
     */
    appendPolyline(inputs: Inputs.JSCAD.PathAppendPolylineDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]) as Base.Point2[];
        return this.appendPoints({ points: twoDimensionalPoints, path: inputs.path });
    }

    /**
     * Append the arc to the path
     * @param inputs Path and arc parameters
     * @returns Appended path
     * @group append
     * @shortname arc
     * @drawable true
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
