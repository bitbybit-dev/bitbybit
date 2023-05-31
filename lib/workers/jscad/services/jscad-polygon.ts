import { Angle } from '@babylonjs/core';
import { VectorHelperService } from 'bitbybit-occt';
import * as Inputs from '../../../api/inputs/inputs';

/**
 * Contains various functions for Polygon from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADPolygon {

    constructor(
        private readonly jscad: any,
        private readonly vecHelper: VectorHelperService,

    ) { }

    createFromPoints(inputs: Inputs.Point.PointsDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints);
    }

    createFromPolyline(inputs: Inputs.Polyline.PolylineDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints);
    }

    createFromCurve(inputs: Inputs.Verb.CurveDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.curve.tessellate().map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints);
    }

    createFromPath(inputs: Inputs.JSCAD.PathDto): Inputs.JSCAD.JSCADEntity {
        return this.removeDuplicatesAndCreateFromPoints(inputs.path.points);
    }

    circle(inputs: Inputs.JSCAD.CircleDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.circle({ center: inputs.center, radius: inputs.radius, segments: inputs.segments });
    }

    ellipse(inputs: Inputs.JSCAD.EllipseDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.ellipse(
            {
                center: inputs.center,
                radius: [inputs.radius[0], inputs.radius[1]],
                segments: inputs.segments
            }
        );
    }

    rectangle(inputs: Inputs.JSCAD.RectangleDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.rectangle(
            {
                center: [inputs.center[0], inputs.center[1]],
                size: [inputs.width, inputs.length]
            }
        );
    }

    roundedRectangle(inputs: Inputs.JSCAD.RoundedRectangleDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.roundedRectangle({
            center: [inputs.center[0], inputs.center[1]],
            size: [inputs.width, inputs.length],
            roundRadius: inputs.roundRadius,
            segments: inputs.segments,
        });
    }

    square(inputs: Inputs.JSCAD.SquareDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.square({ center: [inputs.center[0], inputs.center[1]], size: inputs.size });
    }

    star(inputs: Inputs.JSCAD.StarDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.star({
            center: [inputs.center[0], inputs.center[1]],
            vertices: inputs.vertices,
            density: inputs.density,
            outerRadius: inputs.outerRadius,
            innerRadius: inputs.innerRadius,
            startAngle: Angle.FromDegrees(inputs.startAngle).radians(),
        });
    }

    private removeDuplicatesAndCreateFromPoints(twoDimensionalPoints: number[][]): Inputs.JSCAD.JSCADEntity {
        const duplicatePointsRemoved = this.vecHelper.removeConsecutiveDuplicates(twoDimensionalPoints);
        const polygon = this.jscad.primitives.polygon({ points: duplicatePointsRemoved });
        return polygon;
    }

}
