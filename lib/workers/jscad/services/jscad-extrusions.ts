import { Angle } from '@babylonjs/core';
import { VectorHelperService } from 'bitbybit-occt';
import * as Inputs from '../../../api/inputs/jscad-inputs';

/**
 * Contains various functions for Solid extrusions from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADExtrusions {

    constructor(
        private readonly jscad: any,
        private readonly vecHelper: VectorHelperService
    ) { }

    extrudeLinear(inputs: Inputs.JSCAD.ExtrudeLinearDto): Inputs.JSCAD.JSCADEntity {
        const multipleGeometries = inputs.geometry.length && inputs.geometry.length > 0;
        const geometry = multipleGeometries ? inputs.geometry : [inputs.geometry];

        let extrusions = this.jscad.extrusions.extrudeLinear({
            height: inputs.height,
            twistAngle: Angle.FromDegrees(inputs.twistAngle).radians(),
            twistSteps: inputs.twistSteps
        }, ...geometry);

        if (multipleGeometries && !extrusions.length) {
            extrusions = [extrusions];
        }
        return extrusions;
    }

    extrudeRectangular(inputs: Inputs.JSCAD.ExtrudeRectangularDto): Inputs.JSCAD.JSCADEntity {
        const multipleGeometries = inputs.geometry.length && inputs.geometry.length > 0;
        const geometry = multipleGeometries ? inputs.geometry : [inputs.geometry];

        let extrusions = this.jscad.extrusions.extrudeRectangular({ height: inputs.height, size: inputs.size }, ...geometry);
        if (multipleGeometries && !extrusions.length) {
            extrusions = [extrusions];
        }
        return extrusions;
    }

    extrudeRectangularPoints(inputs: Inputs.JSCAD.ExtrudeRectangularPointsDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]);
        const duplicatePointsRemoved = this.vecHelper.removeConsecutiveDuplicates(twoDimensionalPoints);
        const path = this.jscad.geometries.path2.fromPoints({}, duplicatePointsRemoved);
        const extrusion = this.extrudeRectangular({ height: inputs.height, size: inputs.size, geometry: path });
        return extrusion;
    }

    extrudeRotate(inputs: Inputs.JSCAD.ExtrudeRotateDto): Inputs.JSCAD.JSCADEntity {
        const options = {
            angle: Angle.FromDegrees(inputs.angle).radians(),
            startAngle: Angle.FromDegrees(inputs.startAngle).radians(),
            overflow: 'cap',
            segments: inputs.segments
        };
        const extrusion = this.jscad.extrusions.extrudeRotate(options, inputs.polygon);
        return extrusion;
    }

}
