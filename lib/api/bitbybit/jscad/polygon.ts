
import { JSCADWorkerManager } from '../../../workers/jscad/jscad-worker-manager';
import * as Inputs from '../../inputs/inputs';

/**
 * Contains various functions for Polygon from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */

export class JSCADPolygon {

    constructor(
        private readonly jscadWorkerManager: JSCADWorkerManager,
    ) { }

    /**
     * Create a 2D polygon from a list of points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/createFromPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.JSCADPolygon.html#createFromPoints
     * @param inputs Points
     * @returns Path
     * @group from
     * @shortname points
     * @drawable true
     */
     async createFromPoints(inputs: Inputs.Point.PointsDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('polygon.createFromPoints', inputs);
    }

    /**
     * Create a 2D polygon from a polyline
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/createFromPolyline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.JSCADPolygon.html#createFromPolyline
     * @param inputs Polyline
     * @returns Polygon
     * @group from
     * @shortname polyline
     * @drawable true
     */
     async createFromPolyline(inputs: Inputs.Polyline.PolylineDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('polygon.createFromPolyline', inputs);
    }

    /**
     * Create a 2D polygon from a curve
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/createFromCurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.JSCADPolygon.html#createFromCurve
     * @param inputs Nurbs curve
     * @returns Polygon
     * @group from
     * @shortname curve
     * @drawable true
     */
     async createFromCurve(inputs: Inputs.Verb.CurveDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('polygon.createFromCurve', inputs);
    }

    /**
     * Create a 2D polygon from a path
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/createFromPath.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.JSCADPolygon.html#createFromPath
     * @param inputs Path
     * @returns Polygon
     * @group from
     * @shortname path
     * @drawable true
     */
     async createFromPath(inputs: Inputs.JSCAD.PathDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('polygon.createFromPath', inputs);
    }

    /**
     * Create a 2D polygon circle
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/circle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.JSCADPolygon.html#circle
     * @param inputs Circle parameters
     * @returns Circle polygon
     * @group primitives
     * @shortname circle
     * @drawable true
     */
     async circle(inputs: Inputs.JSCAD.CircleDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('polygon.circle', inputs);
    }

    /**
     * Create a 2D polygon ellipse
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/ellipse.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.JSCADPolygon.html#ellipse
     * @param inputs Ellipse parameters
     * @returns Ellipse polygon
     * @group primitives
     * @shortname ellipse
     * @drawable true
     */
     async ellipse(inputs: Inputs.JSCAD.EllipseDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('polygon.ellipse', inputs);
    }

    /**
     * Create a 2D polygon rectangle
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/rectangle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.JSCADPolygon.html#rectangle
     * @param inputs Rectangle parameters
     * @returns Rectangle polygon
     * @group primitives
     * @shortname rectangle
     * @drawable true
     */
     async  rectangle(inputs: Inputs.JSCAD.RectangleDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('polygon.rectangle', inputs);
    }

    /**
     * Create a 2D rounded rectangle
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/roundedRectangle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.JSCADPolygon.html#roundedRectangle
     * @param inputs Rounded rectangle parameters
     * @returns Rounded rectangle polygon
     * @group primitives
     * @shortname rounded rectangle
     * @drawable true
     */
     async roundedRectangle(inputs: Inputs.JSCAD.RoundedRectangleDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('polygon.roundedRectangle', inputs);
    }

    /**
     * Create a 2D polygon square
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/square.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.JSCADPolygon.html#square
     * @param inputs Square parameters
     * @returns Square polygon
     * @group primitives
     * @shortname square
     * @drawable true
     */
     async square(inputs: Inputs.JSCAD.SquareDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('polygon.square', inputs);
    }

    /**
     * Create a 2D polygon star
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/star.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.JSCADPolygon.html#star
     * @param inputs Star parameters
     * @returns Star polygon
     * @group primitives
     * @shortname star
     * @drawable true
     */
    async star(inputs: Inputs.JSCAD.StarDto): Promise<any> {
        return await this.jscadWorkerManager.genericCallToWorkerPromise('polygon.star', inputs);
    }
}
