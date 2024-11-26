import { VectorHelperService } from "@bitbybit-dev/occt";
import * as Inputs from "../inputs/jscad-inputs";
import { MathBitByBit } from "@bitbybit-dev/base";
import * as JSCAD from "@jscad/modeling";

/**
 * Contains various functions for Solid extrusions from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADExtrusions {

    constructor(
        private readonly jscad: typeof JSCAD,
        private readonly vecHelper: VectorHelperService,
        private readonly math: MathBitByBit
    ) { }

    extrudeLinear(inputs: Inputs.JSCAD.ExtrudeLinearDto): Inputs.JSCAD.JSCADEntity {
        const multipleGeometries = inputs.geometry.length && inputs.geometry.length > 0;
        const geometry = multipleGeometries ? inputs.geometry : [inputs.geometry];

        const extrusions = this.jscad.extrusions.extrudeLinear({
            height: inputs.height,
            twistAngle: this.math.degToRad({ number: inputs.twistAngle }),
            twistSteps: inputs.twistSteps
        }, ...geometry);

        return extrusions;
    }

    extrudeRectangular(inputs: Inputs.JSCAD.ExtrudeRectangularDto): Inputs.JSCAD.JSCADEntity {
        const multipleGeometries = inputs.geometry.length && inputs.geometry.length > 0;
        const geometry = multipleGeometries ? inputs.geometry : [inputs.geometry];

        const extrusions = this.jscad.extrusions.extrudeRectangular({ height: inputs.height, size: inputs.size }, ...geometry);
       
        return extrusions;
    }

    extrudeRectangularPoints(inputs: Inputs.JSCAD.ExtrudeRectangularPointsDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]);
        const duplicatePointsRemoved = this.vecHelper.removeConsecutiveDuplicates(twoDimensionalPoints);
        const path = this.jscad.geometries.path2.fromPoints({}, duplicatePointsRemoved as JSCAD.maths.vec2.Vec2[]);
        const extrusion = this.extrudeRectangular({ height: inputs.height, size: inputs.size, geometry: path });
        return extrusion;
    }

    extrudeRotate(inputs: Inputs.JSCAD.ExtrudeRotateDto): Inputs.JSCAD.JSCADEntity {
        const options = {
            angle: this.math.degToRad({ number: inputs.angle }),
            startAngle: this.math.degToRad({ number: inputs.startAngle }),
            overflow: "cap",
            segments: inputs.segments
        };
        const extrusion = this.jscad.extrusions.extrudeRotate(options as any, inputs.polygon);
        return extrusion;
    }

}
