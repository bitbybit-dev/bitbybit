import * as Inputs from "../inputs/jscad-inputs";
import * as JSCAD from "@jscad/modeling";
import { asKind } from "./entity-narrowing";

/**
 * Contains various functions for Solid hulls from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADHulls {

    constructor(
        private readonly jscad: typeof JSCAD,
    ) { }

    /**
     * Hull chain connects solids or 2d geometries by filling an empty space in between objects in order.
     * Geometries need to be of the same type.
     * @param inputs Geometries
     * @returns Chain hulled geometry
     * @group hulls
     * @shortname hull chain
     * @drawable true
     */
    hullChain(inputs: Inputs.JSCAD.HullDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.hulls.hullChain(...asKind<Inputs.JSCAD.JSCADGeom3>(inputs.meshes));
    }

    /**
     * Convex hull connects solids or 2d geometries by filling an empty space in between without following order.
     * Geometries need to be of the same type.
     * @param inputs Geometries
     * @returns Hulled geometry
     * @group hulls
     * @shortname hull
     * @drawable true
     */
    hull(inputs: Inputs.JSCAD.HullDto): Inputs.JSCAD.JSCADEntity  {
        return this.jscad.hulls.hull(...asKind<Inputs.JSCAD.JSCADGeom3>(inputs.meshes));
    }
}
