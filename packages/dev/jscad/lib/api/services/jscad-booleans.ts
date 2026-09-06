
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

    /**
     * Intersect multiple solid mesh objects
     * @param inputs Contains multiple solids for intersection
     * @returns Solid mesh     
     * @group boolean
     * @shortname intersect
     * @drawable true
     */
    intersect(inputs: Inputs.JSCAD.BooleanObjectsDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.booleans.intersect(...inputs.meshes);
    }

    /**
     * Subtract multiple solid mesh objects
     * @param inputs Contains multiple solids for subtraction
     * @returns Solid mesh     
     * @group boolean
     * @shortname subtract
     * @drawable true
     */
    subtract(inputs: Inputs.JSCAD.BooleanObjectsDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.booleans.subtract(...inputs.meshes);
    }

    /**
     * Union multiple solid mesh objects
     * @param inputs Contains multiple solids for union
     * @returns Solid mesh
     * @group boolean
     * @shortname union
     * @drawable true
     */
    union(inputs: Inputs.JSCAD.BooleanObjectsDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.booleans.union(...inputs.meshes);
    }

    /**
     * Intersect two solid mesh objects
     * @param inputs Contains multiple solids for intersection
     * @returns Solid mesh     
     * @group boolean
     * @shortname intersect two
     * @drawable true
     */
    intersectTwo(inputs: Inputs.JSCAD.BooleanTwoObjectsDto): Inputs.JSCAD.JSCADEntity {
        const meshes = [inputs.first, inputs.second];
        return this.jscad.booleans.intersect(...meshes);
    }

    /**
     * Subtract two solid mesh objects
     * @param inputs Contains multiple solids for subtraction
     * @returns Solid mesh     
     * @group boolean
     * @shortname subtract two
     * @drawable true
     */
    subtractTwo(inputs: Inputs.JSCAD.BooleanTwoObjectsDto): Inputs.JSCAD.JSCADEntity {
        const meshes = [inputs.first, inputs.second];
        return this.jscad.booleans.subtract(...meshes);
    }

    /**
     * Union two solid mesh objects
     * @param inputs Contains multiple solids for union
     * @returns Solid mesh
     * @group boolean
     * @shortname union two
     * @drawable true
     */
    unionTwo(inputs: Inputs.JSCAD.BooleanTwoObjectsDto): Inputs.JSCAD.JSCADEntity {
        const meshes = [inputs.first, inputs.second];
        return this.jscad.booleans.union(...meshes);
    }

    /**
     * Subtract multiple meshes from one mesh object
     * @param inputs Contains mesh from which to subtract and multiple meshes for subtraction
     * @returns mesh     
     * @group boolean
     * @shortname subtract from
     * @drawable true
     */
    subtractFrom(inputs: Inputs.JSCAD.BooleanObjectsFromDto): Inputs.JSCAD.JSCADEntity {
        const meshes = [inputs.from, ...inputs.meshes];
        return this.jscad.booleans.subtract(...meshes);
    }
}
