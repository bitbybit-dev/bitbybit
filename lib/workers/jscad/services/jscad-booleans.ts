
import * as Inputs from "../../../api/inputs/jscad-inputs";

/**
 * Contains various functions for Solid booleans from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADBooleans {

    constructor(
        private readonly jscad: any
    ) { }

    intersect(inputs: Inputs.JSCAD.BooleanObjectsDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.booleans.intersect(...inputs.meshes);
    }
    subtract(inputs: Inputs.JSCAD.BooleanObjectsDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.booleans.subtract(...inputs.meshes);
    }
    union(inputs: Inputs.JSCAD.BooleanObjectsDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.booleans.union(...inputs.meshes);
    }
}
