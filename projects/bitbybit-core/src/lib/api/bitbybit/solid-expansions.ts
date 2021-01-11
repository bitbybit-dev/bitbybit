import { Injectable } from '@angular/core';
import { Color3, Matrix, Mesh, MeshBuilder, StandardMaterial, VertexData } from '@babylonjs/core';
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
     *  <img src="../assets/images/blockly-images/solid/expand.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_.solid.html#expand
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
     *  <img src="../assets/images/blockly-images/solid/offset.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_.solid.html#offset
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
