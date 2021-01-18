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
     *  <img src="../assets/images/blockly-images/solid/extrusions/extrudeLinear1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/extrusions/extrudeLinear2.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_extrusions_.solidextrusions.html#extrudelinear
     * @param inputs Contains options and geometries for linear extrude
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

    /**
     * Rectangular extrude 2D geometries of solid category. Creates a wall-type extrusion of certain height and size.
     * <div>
     *  <img src="../assets/images/blockly-images/solid/extrusions/extrudeRectangular1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/solid/extrusions/extrudeRectangular2.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_extrusions_.solidextrusions.html#extruderectangular
     * @param inputs Contains options and geometries for rectangular extrude
     * @returns Extruded geometry
     */
    extrudeRectangular(inputs: Inputs.Solid.ExtrudeRectangularDto): any | any[] {
        const multipleGeometries = inputs.geometry.length && inputs.geometry.length > 0;
        const geometry = multipleGeometries ? inputs.geometry : [inputs.geometry];

        let extrusions = this.context.jscad.extrusions.extrudeRectangular({ height: inputs.height, size: inputs.size }, ...geometry);
        if (multipleGeometries && !extrusions.length) {
            extrusions = [extrusions];
        }
        return extrusions;
    }

    /**
     * Rectangular extrude a list of 2D points. Creates a wall-type extrusion of certain height and size.
     * <div>
     *  <img src="../assets/images/blockly-images/solid/extrusions/extrudeRectangularPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_extrusions_.solidextrusions.html#extruderectangularpoints
     * @param inputs Contains options and points for extrusion
     * @returns Extruded geometry
     */
    extrudeRectangularPoints(inputs: Inputs.Solid.ExtrudeRectangularPointsDto): any {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]);
        const duplicatePointsRemoved = this.geometryHelper.removeConsecutiveDuplicates(twoDimensionalPoints);
        const path = this.context.jscad.geometries.path2.fromPoints({}, duplicatePointsRemoved);
        const extrusion = this.extrudeRectangular({ height: inputs.height, size: inputs.size, geometry: path });
        return extrusion;
    }

    /**
     * Rectangular extrude a list of 2D points. Creates a wall-type extrusion of certain height and size.
     * <div>
     *  <img src="../assets/images/blockly-images/solid/extrusions/extrudeRectangularPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_extrusions_.solidextrusions.html#extruderotate
     * @param inputs Contains options and points for extrusion
     * @returns Extruded geometry
     */
    extrudeRotate(inputs: Inputs.Solid.ExtrudeRotateDto): any {
        const options = {
            angle: Angle.FromDegrees(inputs.angle).radians(),
            startAngle: Angle.FromDegrees(inputs.startAngle).radians(),
            overflow: 'cap',
            segments: inputs.segments
        };
        const extrusion = this.context.jscad.extrusions.extrudeRotate(options, inputs.polygon);
        return extrusion;
    }

}
