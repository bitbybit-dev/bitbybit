import { simplifyDeclaration } from './simplify-declaration';

export const solidExtrusionsString = simplifyDeclaration(`
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
/**
 * Contains various functions for Solid extrusions from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
export declare class SolidExtrusions {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Linear extrude 2D geometries of solid category
     * <div>
     *  <img src="../assets/images/blockly-images/solid/extrusions/extrudeLinear.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_extrusions_.solidextrusions.html#extrudelinear
     * @param inputs Contains options and geometries for linear extrude
     * @returns Extruded geometry
     */
    extrudeLinear(inputs: Inputs.Solid.ExtrudeLinearDto): any | any[];
    /**
     * Rectangular extrude 2D geometries of solid category. Creates a wall-type extrusion of certain height and size.
     * <div>
     *  <img src="../assets/images/blockly-images/solid/extrusions/extrudeRectangular.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_extrusions_.solidextrusions.html#extruderectangular
     * @param inputs Contains options and geometries for rectangular extrude
     * @returns Extruded geometry
     */
    extrudeRectangular(inputs: Inputs.Solid.ExtrudeRectangularDto): any | any[];
    /**
     * Rectangular extrude a list of 2D points. Creates a wall-type extrusion of certain height and size.
     * <div>
     *  <img src="../assets/images/blockly-images/solid/extrusions/extrudeRectangularPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_extrusions_.solidextrusions.html#extruderectangularpoints
     * @param inputs Contains options and points for extrusion
     * @returns Extruded geometry
     */
    extrudeRectangularPoints(inputs: Inputs.Solid.ExtrudeRectangularPointsDto): any;
    /**
     * Rectangular extrude a list of 2D points. Creates a wall-type extrusion of certain height and size.
     * <div>
     *  <img src="../assets/images/blockly-images/solid/extrusions/extrudeRectangularPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_extrusions_.solidextrusions.html#extruderotate
     * @param inputs Contains options and points for extrusion
     * @returns Extruded geometry
     */
    extrudeRotate(inputs: Inputs.Solid.ExtrudeRotateDto): any;
}

`);
