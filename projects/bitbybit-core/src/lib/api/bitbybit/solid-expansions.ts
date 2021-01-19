import { Injectable } from '@angular/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';

/**
 * Contains various functions for Solid expansions from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
@Injectable()
export class SolidExpansions {

    constructor(
        private readonly context: Context,
        private readonly geometryHelper: GeometryHelper
    ) { }

    /**
     * Expand geometries of solid category
     * <div>
     *  <img src="../assets/images/blockly-images/solid/expansions/expand1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/expansions/expand2.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/expansions/expand3.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/expansions/expand4.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/expansions/expand5.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/expansions/expand6.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_solid_expansions.solidexpansions.html#expand
     * @param inputs Contains options and geometries for expansion
     * @returns Expanded geometry
     */
    expand(inputs: Inputs.Solid.ExpansionDto): any | any[] {
        const geometry = inputs.geometry.length && inputs.geometry.length > 0 ? inputs.geometry : [inputs.geometry];
        if (!inputs.corners) {
            inputs.corners = Inputs.Solid.SolidCornerTypeEnum.round;
        }
        const result = this.context.jscad.expansions.expand({
            delta: inputs.delta,
            corners: inputs.corners,
            segments: inputs.segments,
        }, ...geometry);
        return result;
    }

    /**
     * Offset 2d geometries of solid category
     * <div>
     *  <img src="../assets/images/blockly-images/solid/expansions/offset1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/expansions/offset2.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/expansions/offset3.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/expansions/offset4.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_solid_expansions.solidexpansions.html#offset
     * @param inputs Contains options and geometries for offset
     * @returns Expanded geometry
     */
    offset(inputs: Inputs.Solid.ExpansionDto): any | any[] {
        const geometry = inputs.geometry.length && inputs.geometry.length > 0 ? inputs.geometry : [inputs.geometry];
        if (!inputs.corners) {
            inputs.corners = Inputs.Solid.SolidCornerTypeEnum.edge;
        }
        const result = this.context.jscad.expansions.offset({
            delta: inputs.delta,
            corners: inputs.corners,
            segments: inputs.segments,
        }, ...geometry);
        return result;
    }
}
