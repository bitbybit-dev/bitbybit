import { simplifyDeclaration } from './simplify-declaration';

export const jscadPolygonString = simplifyDeclaration(`
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
/**
 * Contains various functions for Polygon from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
export declare class JSCADPolygon {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Create a 2D polygon from a list of points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/createFromPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#createfrompoints
     * @param inputs Points
     * @returns Path
     */
    createFromPoints(inputs: Inputs.Point.PointsDto): any;
    /**
     * Create a 2D polygon from a polyline
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/createFromPolyline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#createfrompolyline
     * @param inputs Polyline
     * @returns Polygon
     */
    createFromPolyline(inputs: Inputs.Polyline.PolylineDto): any;
    /**
     * Create a 2D polygon from a curve
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/createFromCurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#createfromcurve
     * @param inputs Nurbs curve
     * @returns Polygon
     */
    createFromCurve(inputs: Inputs.Curve.CurveDto): any;
    /**
     * Create a 2D polygon from a path
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/createFromPath.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#createfrompath
     * @param inputs Path
     * @returns Polygon
     */
    createFromPath(inputs: Inputs.JSCAD.PathDto): any;
    /**
     * Create a 2D polygon circle
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/circle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#circle
     * @param inputs Circle parameters
     * @returns Circle polygon
     */
    circle(inputs: Inputs.JSCAD.CircleDto): any;
    /**
     * Create a 2D polygon ellipse
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/ellipse.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#ellipse
     * @param inputs Ellipse parameters
     * @returns Ellipse polygon
     */
    ellipse(inputs: Inputs.JSCAD.EllipseDto): any;
    /**
     * Create a 2D polygon rectangle
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/rectangle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#rectangle
     * @param inputs Rectangle parameters
     * @returns Rectangle polygon
     */
    rectangle(inputs: Inputs.JSCAD.RectangleDto): any;
    /**
     * Create a 2D rounded rectangle
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/roundedRectangle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#roundedrectangle
     * @param inputs Rounded rectangle parameters
     * @returns Rounded rectangle polygon
     */
    roundedRectangle(inputs: Inputs.JSCAD.RoundedRectangleDto): any;
    /**
     * Create a 2D polygon square
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/square.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#square
     * @param inputs Square parameters
     * @returns Square polygon
     */
    square(inputs: Inputs.JSCAD.SquareDto): any;
    /**
     * Create a 2D polygon star
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/polygon/star.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#star
     * @param inputs Star parameters
     * @returns Star polygon
     */
    star(inputs: Inputs.JSCAD.StarDto): any;
    private removeDuplicatesAndCreateFromPoints;
}
`);
