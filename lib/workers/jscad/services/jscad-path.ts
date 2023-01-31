import { Angle } from '@babylonjs/core';
import { VectorHelperService } from 'bitbybit-occt/lib/api/vector-helper.service';
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

    createFromPoints(inputs: Inputs.JSCAD.PathFromPointsDto): any {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, inputs.closed);
    }

    createFromPolyline(inputs: Inputs.JSCAD.PathFromPolylineDto): any {
        const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, inputs.closed);
    }

    createFromCurve(inputs: Inputs.JSCAD.PathFromCurveDto): any {
        const twoDimensionalPoints = inputs.curve.tessellate().map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, inputs.closed);
    }

    createEmpty(): any {
        return this.jscad.geometries.path2.create();
    }

    close(inputs: Inputs.JSCAD.PathDto): any {
        return this.jscad.geometries.path2.close(inputs.path);
    }

    appendPoints(inputs: Inputs.JSCAD.PathAppendPointsDto): any {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]);
        const duplicatePointsRemoved = this.vecHelper.removeConsecutiveDuplicates(twoDimensionalPoints);
        return this.jscad.geometries.path2.appendPoints(duplicatePointsRemoved, inputs.path);
    }

    appendPolyline(inputs: Inputs.JSCAD.PathAppendPolylineDto): any {
        const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]);
        return this.appendPoints({points: twoDimensionalPoints, path: inputs.path});
    }

    appendCurve(inputs: Inputs.JSCAD.PathAppendCurveDto): any {
        const twoDimensionalPoints = inputs.curve.tessellate().map(pt => [pt[0], pt[1]]);
        return this.appendPoints({points: twoDimensionalPoints, path: inputs.path});
    }

    appendArc(inputs: Inputs.JSCAD.PathAppendArcDto): any {
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
