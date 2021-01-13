import { simplifyDeclaration } from './simplify-declaration';

export const solidTextString = simplifyDeclaration(`
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
/**
 * Contains various functions for solid 3D texts from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
export declare class SolidText {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Creates a text that is based on chain hulling cylinders
     * <div>
     *  <img src="../assets/images/blockly-images/solid/text/cylindricalText.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_text_.solidtext.html#cylindricaltext
     * @param inputs Cylindrical text parameters
     * @returns List of solids for text
     */
    cylindricalText(inputs: Inputs.Solid.CylinderTextDto): any[];
    /**
     * Creates a text that is based on chain hulling spheres
     * <div>
     *  <img src="../assets/images/blockly-images/solid/text/sphericalText.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_text_.solidtext.html#sphericalText
     * @param inputs Spherical text parameters
     * @returns List of solids for text
     */
    sphericalText(inputs: Inputs.Solid.SphereTextDto): any[];
    private adjustTextToBeOnCenter;
    private createVectorText;
}

`);
