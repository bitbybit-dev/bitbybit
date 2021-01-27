import { Injectable } from '@angular/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';

/**
 * Contains various functions for Solid booleans from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
@Injectable()
export class JSCADBooleans {

    constructor(
        private readonly context: Context
    ) { }

    /**
     * Intersect multiple solid mesh objects
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/booleans/intersect1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/booleans/intersect2.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_booleans.jscadbooleans.html#intersect
     * @param inputs Contains multiple solids for intersection
     * @returns Solid mesh
     */
    intersect(inputs: Inputs.JSCAD.BooleanObjectsDto): any {
        return this.context.jscad.booleans.intersect(...inputs.objects);
    }

    /**
     * Subtract multiple solid mesh objects
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/booleans/subtract1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/booleans/subtract2.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/booleans/subtract3.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_booleans.jscadbooleans.html#subtract
     * @param inputs Contains multiple solids for subtraction
     * @returns Solid mesh
     */
    subtract(inputs: Inputs.JSCAD.BooleanObjectsDto): any {
        return this.context.jscad.booleans.subtract(...inputs.objects);
    }

    /**
     * Union multiple solid mesh objects
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/booleans/union1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/booleans/union2.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_booleans.jscadbooleans.html#union
     * @param inputs Contains multiple solids for union
     * @returns Solid mesh
     */
    union(inputs: Inputs.JSCAD.BooleanObjectsDto): any {
        return this.context.jscad.booleans.union(...inputs.objects);
    }
}
