import { simplifyDeclaration } from './simplify-declaration';

export const solidBooleansString = simplifyDeclaration(`
import { Context } from '../context';
import * as Inputs from '../inputs/inputs';
/**
 * Contains various functions for Solid booleans from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
export declare class SolidBooleans {
    private readonly context;
    constructor(context: Context);
    /**
     * Intersect multiple solid mesh objects
     * <div>
     *  <img src="../assets/images/blockly-images/solid/booleans/intersect.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_solid_booleans.solidbooleans.html#intersect
     * @param inputs Contains multiple solids for intersection
     * @returns Solid mesh
     */
    intersect(inputs: Inputs.Solid.BooleanObjectsDto): any;
    /**
     * Subtract multiple solid mesh objects
     * <div>
     *  <img src="../assets/images/blockly-images/solid/booleans/subtract.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_solid_booleans.solidbooleans.html#subtract
     * @param inputs Contains multiple solids for subtraction
     * @returns Solid mesh
     */
    subtract(inputs: Inputs.Solid.BooleanObjectsDto): any;
    /**
     * Union multiple solid mesh objects
     * <div>
     *  <img src="../assets/images/blockly-images/solid/booleans/union.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_solid_booleans.solidbooleans.html#union
     * @param inputs Contains multiple solids for union
     * @returns Solid mesh
     */
    union(inputs: Inputs.Solid.BooleanObjectsDto): any;
}

`);
