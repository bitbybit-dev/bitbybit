import * as Inputs from "../../../api/inputs/jscad-inputs";

/**
 * Contains various functions for Solid expansions from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADExpansions {

    constructor(
        private readonly jscad: any,
    ) { }

    expand(inputs: Inputs.JSCAD.ExpansionDto): Inputs.JSCAD.JSCADEntity {
        const geometry = inputs.geometry.length && inputs.geometry.length > 0 ? inputs.geometry : [inputs.geometry];
        if (!inputs.corners) {
            inputs.corners = Inputs.JSCAD.solidCornerTypeEnum.round;
        }
        const result = this.jscad.expansions.expand({
            delta: inputs.delta,
            corners: inputs.corners,
            segments: inputs.segments,
        }, ...geometry);
        return result;
    }

    offset(inputs: Inputs.JSCAD.ExpansionDto): Inputs.JSCAD.JSCADEntity {
        const geometry = inputs.geometry.length && inputs.geometry.length > 0 ? inputs.geometry : [inputs.geometry];
        if (!inputs.corners) {
            inputs.corners = Inputs.JSCAD.solidCornerTypeEnum.edge;
        }
        const result = this.jscad.expansions.offset({
            delta: inputs.delta,
            corners: inputs.corners,
            segments: inputs.segments,
        }, ...geometry);
        return result;
    }
}
