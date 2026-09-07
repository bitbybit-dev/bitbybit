import { GeometryHelper } from "@bitbybit-dev/base";
import * as Inputs from "../inputs";
import { MathBitByBit } from "@bitbybit-dev/base";
import * as JSCAD from "@jscad/modeling";
import { asPath } from "./entity-narrowing";

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

    /**
     * Create a 2D polygon from a list of points
     * @param inputs Points
     * @returns Polygons
     * @group from
     * @shortname polygon from points
     * @drawable true
     */
    createFromPoints(inputs: Inputs.Point.PointsDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]) as Inputs.Base.Point2[];
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints);
    }

    /**
     * Create a 2D polygon from a polyline
     * @param inputs Polyline
     * @returns Polygon
     * @group from
     * @shortname polyline
     * @drawable true
     */
    createFromPolyline(inputs: Inputs.JSCAD.PolylineDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]) as Inputs.Base.Point2[];
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints);
    }

    /**
     * Create a 2D polygon from a curve
     * @param inputs Nurbs curve
     * @returns Polygon
     * @group from
     * @shortname curve
     * @drawable true
     */
    createFromCurve(inputs: Inputs.JSCAD.CurveDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.curve.tessellate().map((pt: Inputs.Base.Point3) => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints);
    }

    /**
     * Create a 2D polygon from a path
     * @param inputs Path
     * @returns Polygon
     * @group from
     * @shortname path
     * @drawable true
     */
    createFromPath(inputs: Inputs.JSCAD.PathDto): Inputs.JSCAD.JSCADEntity {
        return this.removeDuplicatesAndCreateFromPoints(asPath(inputs.path, "createFromPath").points);
    }

    /**
     * Create a 2D polygon circle
     * @param inputs Circle parameters
     * @returns Circle polygon
     * @group primitives
     * @shortname circle
     * @drawable true
     */
    circle(inputs: Inputs.JSCAD.CircleDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.circle({ center: inputs.center, radius: inputs.radius, segments: inputs.segments });
    }

    /**
     * Create a 2D polygon ellipse
     * @param inputs Ellipse parameters
     * @returns Ellipse polygon
     * @group primitives
     * @shortname ellipse
     * @drawable true
     */
    ellipse(inputs: Inputs.JSCAD.EllipseDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.ellipse(
            {
                center: inputs.center,
                radius: [inputs.radius[0], inputs.radius[1]],
                segments: inputs.segments
            }
        );
    }

    /**
     * Create a 2D polygon rectangle
     * @param inputs Rectangle parameters
     * @returns Rectangle polygon
     * @group primitives
     * @shortname rectangle
     * @drawable true
     */
    rectangle(inputs: Inputs.JSCAD.RectangleDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.rectangle(
            {
                center: [inputs.center[0], inputs.center[1]],
                size: [inputs.width, inputs.length]
            }
        );
    }

    /**
     * Create a 2D rounded rectangle
     * @param inputs Rounded rectangle parameters
     * @returns Rounded rectangle polygon
     * @group primitives
     * @shortname rounded rectangle
     * @drawable true
     */
    roundedRectangle(inputs: Inputs.JSCAD.RoundedRectangleDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.roundedRectangle({
            center: [inputs.center[0], inputs.center[1]],
            size: [inputs.width, inputs.length],
            roundRadius: inputs.roundRadius,
            segments: inputs.segments,
        });
    }

    /**
     * Create a 2D polygon square
     * @param inputs Square parameters
     * @returns Square polygon
     * @group primitives
     * @shortname square
     * @drawable true
     */
    square(inputs: Inputs.JSCAD.SquareDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.square({ center: [inputs.center[0], inputs.center[1]], size: inputs.size });
    }

    /**
     * Create a 2D polygon star
     * @param inputs Star parameters
     * @returns Star polygon
     * @group primitives
     * @shortname star
     * @drawable true
     */
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
