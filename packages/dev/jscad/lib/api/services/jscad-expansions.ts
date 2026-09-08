import * as Inputs from "../inputs/jscad-inputs";
import * as JSCAD from "@jscad/modeling";
import { asEntity, asKind, oneOrMany } from "./entity-narrowing";

/**
 * Contains various functions for Solid expansions from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADExpansions {

    constructor(
        private readonly jscad: typeof JSCAD,
    ) { }

    /**
     * Expand geometries of solid category
     * @param inputs Contains options and geometries for expansion
     * @returns Expanded geometry
     * @group expansion
     * @shortname expand
     * @drawable true
     */
    expand(inputs: Inputs.JSCAD.ExpansionDto): Inputs.JSCAD.JSCADEntity {
        const geometry = asKind<Inputs.JSCAD.JSCADGeom2>(oneOrMany(inputs.geometry));
        if (!inputs.corners) {
            inputs.corners = Inputs.JSCAD.solidCornerTypeEnum.round;
        }
        const result = this.jscad.expansions.expand({
            delta: inputs.delta,
            corners: inputs.corners,
            segments: inputs.segments,
        }, ...geometry);
        return asEntity(result);
    }

    /**
     * Offset 2d geometries of solid category
     * @param inputs Contains options and geometries for offset
     * @returns Expanded geometry
     * @group expansion
     * @shortname offset
     * @drawable true
     */
    offset(inputs: Inputs.JSCAD.ExpansionDto): Inputs.JSCAD.JSCADEntity {
        const geometry = asKind<Inputs.JSCAD.JSCADGeom2>(oneOrMany(inputs.geometry));
        if (!inputs.corners) {
            inputs.corners = Inputs.JSCAD.solidCornerTypeEnum.edge;
        }
        const result = this.jscad.expansions.offset({
            delta: inputs.delta,
            corners: inputs.corners,
            segments: inputs.segments,
        }, ...geometry);
        return asEntity(result);
    }
}
