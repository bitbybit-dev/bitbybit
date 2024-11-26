
import * as Inputs from "../inputs/jscad-inputs";
import * as JSCAD from "@jscad/modeling";

/**
 * Contains various functions for Solid booleans from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADBooleans {

    constructor(
        private readonly jscad: typeof JSCAD
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

    intersectTwo(inputs: Inputs.JSCAD.BooleanTwoObjectsDto): Inputs.JSCAD.JSCADEntity {
        const meshes = [inputs.first, inputs.second];
        return this.jscad.booleans.intersect(...meshes);
    }

    subtractTwo(inputs: Inputs.JSCAD.BooleanTwoObjectsDto): Inputs.JSCAD.JSCADEntity {
        const meshes = [inputs.first, inputs.second];
        return this.jscad.booleans.subtract(...meshes);
    }

    unionTwo(inputs: Inputs.JSCAD.BooleanTwoObjectsDto): Inputs.JSCAD.JSCADEntity {
        const meshes = [inputs.first, inputs.second];
        return this.jscad.booleans.union(...meshes);
    }

    subtractFrom(inputs: Inputs.JSCAD.BooleanObjectsFromDto): Inputs.JSCAD.JSCADEntity {
        const meshes = [inputs.from, ...inputs.meshes];
        return this.jscad.booleans.subtract(...meshes);
    }
}
