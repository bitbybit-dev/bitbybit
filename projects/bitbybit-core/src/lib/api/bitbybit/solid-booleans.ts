import { Injectable } from '@angular/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';

/**
 * Contains various functions for Solid booleans from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
@Injectable()
export class SolidBooleans {

    constructor(
        private readonly context: Context
    ) { }

    /**
     * Intersect multiple solid mesh objects
     * <div>
     *  <img src="../assets/images/blockly-images/solid/booleans/intersect1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/booleans/intersect2.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_booleans_.solidbooleans.html#intersect
     * @param inputs Contains multiple solids for intersection
     * @returns Solid mesh
     */
    intersect(inputs: Inputs.Solid.BooleanObjectsDto): any {
        return this.context.jscad.booleans.intersect(...inputs.objects);
    }

    /**
     * Subtract multiple solid mesh objects
     * <div>
     *  <img src="../assets/images/blockly-images/solid/booleans/subtract1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/booleans/subtract2.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/booleans/subtract3.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_booleans_.solidbooleans.html#subtract
     * @param inputs Contains multiple solids for subtraction
     * @returns Solid mesh
     */
    subtract(inputs: Inputs.Solid.BooleanObjectsDto): any {
        return this.context.jscad.booleans.subtract(...inputs.objects);
    }

    /**
     * Union multiple solid mesh objects
     * <div>
     *  <img src="../assets/images/blockly-images/solid/booleans/union1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/booleans/union2.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_booleans_.solidbooleans.html#union
     * @param inputs Contains multiple solids for union
     * @returns Solid mesh
     */
    union(inputs: Inputs.Solid.BooleanObjectsDto): any {
        return this.context.jscad.booleans.union(...inputs.objects);
    }
}
