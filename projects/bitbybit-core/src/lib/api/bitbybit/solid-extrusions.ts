import { Injectable } from '@angular/core';
import { Angle } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';

/**
 * Contains various functions for Solid extrusions from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
@Injectable()
export class SolidExtrusions {

    constructor(
        private readonly context: Context,
        private readonly geometryHelper: GeometryHelper
    ) { }

    /**
     * Linear extrude 2D geometries of solid category
     * <div>
     *  <img src="../assets/images/blockly-images/solid/extrusions/extrudeLinear.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_.solid.html#extrudelinear
     * @param inputs Contains options and geometries for expansion
     * @returns Extruded geometry
     */
    extrudeLinear(inputs: Inputs.Solid.ExtrudeLinearDto): any | any[] {
        const multipleGeometries = inputs.geometry.length && inputs.geometry.length > 0;
        const geometry = multipleGeometries ? inputs.geometry : [inputs.geometry];

        let extrusions = this.context.jscad.extrusions.extrudeLinear({
            height: inputs.height,
            twistAngle: Angle.FromDegrees(inputs.twistAngle).radians(),
            twistSteps: inputs.twistSteps
        }, ...geometry);

        if (multipleGeometries && !extrusions.length) {
            extrusions = [extrusions];
        }
        return extrusions;
    }

}
