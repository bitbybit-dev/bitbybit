import { Injectable } from '@angular/core';
import { Angle } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';

/**
 * Contains various functions for Polygon from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
@Injectable()
export class JSCADPolygon {

    constructor(
        private readonly context: Context,
        private readonly geometryHelper: GeometryHelper,

    ) { }

    /**
     * Create a 2D polygon from a list of points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/createFromPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#createfrompoints
     * @param inputs Points
     * @returns Path
     */
    createFromPoints(inputs: Inputs.Point.PointsDto): any {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints);
    }

    /**
     * Create a 2D polygon from a polyline
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/createFromPolyline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#createfrompolyline
     * @param inputs Polyline
     * @returns Polygon
     */
    createFromPolyline(inputs: Inputs.Polyline.PolylineDto): any {
        const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints);
    }

    /**
     * Create a 2D polygon from a curve
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/createFromCurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#createfromcurve
     * @param inputs Nurbs curve
     * @returns Polygon
     */
    createFromCurve(inputs: Inputs.Verb.CurveDto): any {
        const twoDimensionalPoints = inputs.curve.tessellate().map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints);
    }

    /**
     * Create a 2D polygon from a path
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/createFromPath.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#createfrompath
     * @param inputs Path
     * @returns Polygon
     */
    createFromPath(inputs: Inputs.JSCAD.PathDto): any {
        return this.removeDuplicatesAndCreateFromPoints(inputs.path.points);
    }

    /**
     * Create a 2D polygon circle
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/circle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#circle
     * @param inputs Circle parameters
     * @returns Circle polygon
     */
    circle(inputs: Inputs.JSCAD.CircleDto): any {
        return this.context.jscad.primitives.circle({ center: inputs.center, radius: inputs.radius, segments: inputs.segments });
    }

    /**
     * Create a 2D polygon ellipse
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/ellipse.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#ellipse
     * @param inputs Ellipse parameters
     * @returns Ellipse polygon
     */
    ellipse(inputs: Inputs.JSCAD.EllipseDto): any {
        return this.context.jscad.primitives.ellipse(
            {
                center: inputs.center,
                radius: [inputs.radius[0], inputs.radius[1]],
                segments: inputs.segments
            }
        );
    }

    /**
     * Create a 2D polygon rectangle
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/rectangle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#rectangle
     * @param inputs Rectangle parameters
     * @returns Rectangle polygon
     */
    rectangle(inputs: Inputs.JSCAD.RectangleDto): any {
        return this.context.jscad.primitives.rectangle(
            {
                center: [inputs.center[0], inputs.center[1]],
                size: [inputs.width, inputs.length]
            }
        );
    }

    /**
     * Create a 2D rounded rectangle
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/roundedRectangle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#roundedrectangle
     * @param inputs Rounded rectangle parameters
     * @returns Rounded rectangle polygon
     */
    roundedRectangle(inputs: Inputs.JSCAD.RoundedRectangleDto): any {
        return this.context.jscad.primitives.roundedRectangle({
            center: [inputs.center[0], inputs.center[1]],
            size: [inputs.width, inputs.length],
            roundRadius: inputs.roundRadius,
            segments: inputs.segments,
        });
    }

    /**
     * Create a 2D polygon square
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/square.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#square
     * @param inputs Square parameters
     * @returns Square polygon
     */
    square(inputs: Inputs.JSCAD.SquareDto): any {
        return this.context.jscad.primitives.square({ center: [inputs.center[0], inputs.center[1]], size: inputs.size });
    }

    /**
     * Create a 2D polygon star
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/star.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#star
     * @param inputs Star parameters
     * @returns Star polygon
     */
    star(inputs: Inputs.JSCAD.StarDto): any {
        return this.context.jscad.primitives.star({
            center: [inputs.center[0], inputs.center[1]],
            vertices: inputs.vertices,
            density: inputs.density,
            outerRadius: inputs.outerRadius,
            innerRadius: inputs.innerRadius,
            startAngle: Angle.FromDegrees(inputs.startAngle).radians(),
        });
    }

    private removeDuplicatesAndCreateFromPoints(twoDimensionalPoints: number[][]): any {
        const duplicatePointsRemoved = this.geometryHelper.removeConsecutiveDuplicates(twoDimensionalPoints);
        const polygon = this.context.jscad.primitives.polygon({ points: duplicatePointsRemoved });
        return polygon;
    }

}
