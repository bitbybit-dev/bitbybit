import { simplifyDeclaration } from './simplify-declaration';

export const solidExpansionsString = simplifyDeclaration(`
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
/**
 * Contains various functions for Solid expansions from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
export declare class SolidExpansions {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Expand geometries of solid category
     * <div>
     *  <img src="../assets/images/blockly-images/solid/expansions/expand.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_solid_expansions.solidexpansions.html#expand
     * @param inputs Contains options and geometries for expansion
     * @returns Expanded geometry
     */
    expand(inputs: Inputs.Solid.ExpansionDto): any | any[];
    /**
     * Offset 2d geometries of solid category
     * <div>
     *  <img src="../assets/images/blockly-images/solid/expansions/offset.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_solid_expansions.solidexpansions.html#offset
     * @param inputs Contains options and geometries for offset
     * @returns Expanded geometry
     */
    offset(inputs: Inputs.Solid.ExpansionDto): any | any[];
}

`);
