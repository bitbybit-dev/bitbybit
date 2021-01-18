import { simplifyDeclaration } from './simplify-declaration';

export const solidPolygonString = simplifyDeclaration(`
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
/**
 * Contains various functions for Polygon from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
export declare class SolidPolygon {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Create a 2D polygon from a list of points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/polygon/createFromPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_polygon_.solidpolygon.html#createfrompoints
     * @param inputs Points
     * @returns Path
     */
    createFromPoints(inputs: Inputs.Point.PointsDto): any;
    /**
     * Create a 2D polygon from a polyline
     * <div>
     *  <img src="../assets/images/blockly-images/solid/polygon/createFromPolyline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_polygon_.solidpolygon.html#createfrompolyline
     * @param inputs Polyline
     * @returns Polygon
     */
    createFromPolyline(inputs: Inputs.Polyline.PolylineDto): any;
    /**
     * Create a 2D polygon from a curve
     * <div>
     *  <img src="../assets/images/blockly-images/solid/polygon/createFromCurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_polygon_.solidpolygon.html#createfromcurve
     * @param inputs Nurbs curve
     * @returns Polygon
     */
    createFromCurve(inputs: Inputs.Curve.CurveDto): any;
    /**
     * Create a 2D polygon from a path
     * <div>
     *  <img src="../assets/images/blockly-images/solid/polygon/createFromPath.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_polygon_.solidpolygon.html#createfrompath
     * @param inputs Path
     * @returns Polygon
     */
    createFromPath(inputs: Inputs.Solid.PathDto): any;
    /**
     * Create a 2D polygon circle
     * <div>
     *  <img src="../assets/images/blockly-images/solid/polygon/circle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_polygon_.solidpolygon.html#circle
     * @param inputs Circle parameters
     * @returns Circle polygon
     */
    circle(inputs: Inputs.Solid.CircleDto): any;
    /**
     * Create a 2D polygon ellipse
     * <div>
     *  <img src="../assets/images/blockly-images/solid/polygon/ellipse.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_polygon_.solidpolygon.html#ellipse
     * @param inputs Ellipse parameters
     * @returns Ellipse polygon
     */
    ellipse(inputs: Inputs.Solid.EllipseDto): any;
    /**
     * Create a 2D polygon rectangle
     * <div>
     *  <img src="../assets/images/blockly-images/solid/polygon/rectangle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_polygon_.solidpolygon.html#rectangle
     * @param inputs Rectangle parameters
     * @returns Rectangle polygon
     */
    rectangle(inputs: Inputs.Solid.RectangleDto): any;
    /**
     * Create a 2D rounded rectangle
     * <div>
     *  <img src="../assets/images/blockly-images/solid/polygon/roundedRectangle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_polygon_.solidpolygon.html#roundedrectangle
     * @param inputs Rounded rectangle parameters
     * @returns Rounded rectangle polygon
     */
    roundedRectangle(inputs: Inputs.Solid.RoundedRectangleDto): any;
    /**
     * Create a 2D polygon square
     * <div>
     *  <img src="../assets/images/blockly-images/solid/polygon/square.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_polygon_.solidpolygon.html#square
     * @param inputs Square parameters
     * @returns Square polygon
     */
    square(inputs: Inputs.Solid.SquareDto): any;
    /**
     * Create a 2D polygon star
     * <div>
     *  <img src="../assets/images/blockly-images/solid/polygon/star.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_polygon_.solidpolygon.html#star
     * @param inputs Star parameters
     * @returns Star polygon
     */
    star(inputs: Inputs.Solid.StarDto): any;
    private removeDuplicatesAndCreateFromPoints;
}
`);
