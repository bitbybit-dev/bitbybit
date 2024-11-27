import { GeometryHelper } from "@bitbybit-dev/base";
import * as Inputs from "../inputs";
import { MathBitByBit } from "@bitbybit-dev/base";
import * as JSCAD from "@jscad/modeling";

/**
 * Contains various functions for Polygon from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADPolygon {

    constructor(
        private readonly jscad: typeof JSCAD,
        private readonly geometryHelper: GeometryHelper,
        private readonly math: MathBitByBit

    ) { }

    createFromPoints(inputs: Inputs.Point.PointsDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]) as Inputs.Base.Point2[];
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints);
    }

    createFromPolyline(inputs: Inputs.JSCAD.PolylineDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]) as Inputs.Base.Point2[];
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints);
    }

    // TODO conversions between various CAD kernels should happen on higher levels of abstraction (this was meant to create jscad polygons from VERB-NURBS curves)
    createFromCurve(inputs: Inputs.JSCAD.CurveDto): Inputs.JSCAD.JSCADEntity {
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
            startAngle: this.math.degToRad({ number: inputs.startAngle }),
        });
    }

    private removeDuplicatesAndCreateFromPoints(twoDimensionalPoints: Inputs.Base.Point2[]): Inputs.JSCAD.JSCADEntity {
        const duplicatePointsRemoved = this.geometryHelper.removeConsecutiveVectorDuplicates(twoDimensionalPoints);
        const polygon = this.jscad.primitives.polygon({ points: duplicatePointsRemoved as JSCAD.maths.vec2.Vec2[] });
        return polygon;
    }

}
