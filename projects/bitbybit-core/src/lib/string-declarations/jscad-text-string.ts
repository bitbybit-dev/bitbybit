import { simplifyDeclaration } from './simplify-declaration';

export const jscadTextString = simplifyDeclaration(`
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
/**
 * Contains various functions for solid 3D texts from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
export declare class JSCADText {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Creates a text that is based on chain hulling cylinders
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/text/cylindricalText.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_text.jscadtext.html#cylindricaltext
     * @param inputs Cylindrical text parameters
     * @returns List of solids for text
     */
    cylindricalText(inputs: Inputs.JSCAD.CylinderTextDto): any[];
    /**
     * Creates a text that is based on chain hulling spheres
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/text/sphericalText.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_text.jscadtext.html#sphericalText
     * @param inputs Spherical text parameters
     * @returns List of solids for text
     */
    sphericalText(inputs: Inputs.JSCAD.SphereTextDto): any[];
    private adjustTextToBeOnCenter;
    private createVectorText;
}

`);
