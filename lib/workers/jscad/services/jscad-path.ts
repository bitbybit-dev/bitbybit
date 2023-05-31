import { VectorHelperService } from 'bitbybit-occt';
import { Angle } from '@babylonjs/core';
import { Base } from '../../../api/inputs';
import * as Inputs from '../../../api/inputs/jscad-inputs';

/**
 * Contains various functions for Path from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADPath {

    constructor(
        private readonly jscad: any,
        private readonly vecHelper: VectorHelperService,

    ) { }

    createFromPoints(inputs: Inputs.JSCAD.PathFromPointsDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, inputs.closed);
    }

    createFromPolyline(inputs: Inputs.JSCAD.PathFromPolylineDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, inputs.closed);
    }

    createFromCurve(inputs: Inputs.JSCAD.PathFromCurveDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.curve.tessellate().map(pt => [pt[0], pt[1]]);
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
        return this.jscad.geometries.path2.appendPoints(duplicatePointsRemoved, inputs.path);
    }

    appendPolyline(inputs: Inputs.JSCAD.PathAppendPolylineDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]) as Base.Point2[];
        return this.appendPoints({points: twoDimensionalPoints, path: inputs.path});
    }

    appendCurve(inputs: Inputs.JSCAD.PathAppendCurveDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.curve.tessellate().map(pt => [pt[0], pt[1]]);
        return this.appendPoints({points: twoDimensionalPoints, path: inputs.path});
    }

    appendArc(inputs: Inputs.JSCAD.PathAppendArcDto): Inputs.JSCAD.JSCADEntity {
        const endpoint = [inputs.endPoint[0], inputs.endPoint[1]];
        const radius = [inputs.radiusX, inputs.radiusY];
        return this.jscad.geometries.path2.appendArc({
            endpoint,
            radius,
            xaxisrotation: Angle.FromDegrees(inputs.xAxisRotation).radians(),
            clockwise: inputs.clockwise,
            large: inputs.large,
            segments: inputs.segments,
        }, inputs.path);
    }

    private removeDuplicatesAndCreateFromPoints(twoDimensionalPoints: number[][], closed: boolean): any {
        const duplicatePointsRemoved = this.vecHelper.removeConsecutiveDuplicates(twoDimensionalPoints);
        let path2d = this.jscad.geometries.path2.fromPoints({}, duplicatePointsRemoved);
        if (closed) {
            path2d = this.jscad.geometries.path2.close(path2d);
        }
        return path2d;
    }
}
