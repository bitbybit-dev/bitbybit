import { VectorHelperService } from "@bitbybit-dev/occt";
import { Base } from "../../../api/inputs";
import * as Inputs from "../../../api/inputs/jscad-inputs";
import { MathBitByBit } from "../../../api/bitbybit";
import * as JSCAD from "@jscad/modeling";

/**
 * Contains various functions for Path from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADPath {

    constructor(
        private readonly jscad: typeof JSCAD,
        private readonly vecHelper: VectorHelperService,
        private readonly math: MathBitByBit
    ) { }

    createFromPoints(inputs: Inputs.JSCAD.PathFromPointsDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, inputs.closed);
    }

    createPathsFromPoints(inputs: Inputs.JSCAD.PathsFromPointsDto): Inputs.JSCAD.JSCADEntity[] {
        return inputs.pointsLists.map(points => {
            const twoDimensionalPoints = points.map(pt => [pt[0], pt[1]]);
            if (twoDimensionalPoints.length > 1 &&
                this.vecHelper.vectorsTheSame(twoDimensionalPoints[0], twoDimensionalPoints[twoDimensionalPoints.length - 1], 0.00001)) {
                return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, true);
            }
            return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, false);
        });
    }

    createFromPolyline(inputs: Inputs.JSCAD.PathFromPolylineDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, inputs.closed);
    }

    createEmpty(): Inputs.JSCAD.JSCADEntity {
        return this.jscad.geometries.path2.create();
    }

    close(inputs: Inputs.JSCAD.PathDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.geometries.path2.close(inputs.path);
    }

    appendPoints(inputs: Inputs.JSCAD.PathAppendPointsDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]);
        const duplicatePointsRemoved = this.vecHelper.removeConsecutiveDuplicates(twoDimensionalPoints);
        return this.jscad.geometries.path2.appendPoints(duplicatePointsRemoved as JSCAD.maths.vec2.Vec2[], inputs.path);
    }

    appendPolyline(inputs: Inputs.JSCAD.PathAppendPolylineDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]) as Base.Point2[];
        return this.appendPoints({ points: twoDimensionalPoints, path: inputs.path });
    }

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
        }, inputs.path);
    }

    private removeDuplicatesAndCreateFromPoints(twoDimensionalPoints: number[][], closed: boolean): any {
        const duplicatePointsRemoved = this.vecHelper.removeConsecutiveDuplicates(twoDimensionalPoints);
        let path2d = this.jscad.geometries.path2.fromPoints({}, duplicatePointsRemoved  as JSCAD.maths.vec2.Vec2[]);
        if (closed) {
            path2d = this.jscad.geometries.path2.close(path2d);
        }
        return path2d;
    }
}
