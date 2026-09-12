import * as Inputs from "../inputs/jscad-inputs";
import * as JSCAD from "@jscad/modeling";
import { asKind } from "./entity-narrowing";

/**
 * Wrapping JSCAD geometry in its convex hull, the shape a tight sheet would take around it: `hull`
 * wraps everything at once and `hullChain` wraps each consecutive pair, so a row of shapes becomes
 * a bent tube rather than one lump. All inputs of a call must be of the same kind, solids, 2D
 * shapes or paths.
 */
export class JSCADHulls {

    constructor(
        private readonly jscad: typeof JSCAD,
    ) { }

    /**
     * Wraps each consecutive pair of inputs in a convex hull and fuses the hulls, so a row of
     * shapes becomes a continuous strand that follows their order.
     *
     * A bend in the row is kept, where `hull` would fill it in. All inputs must be of the same
     * kind.
     * @param inputs - The solids, 2D shapes or paths, in the order they connect
     * @returns The chained hull
     * @group hulls
     * @shortname hull chain
     * @drawable true
     * @example
     * ```typescript
     * const spheres = await bitbybit.jscad.shapes.spheresOnCenterPoints({ centers: [[0, 0, 0], [10, 0, 0], [10, 10, 0]], radius: 1, segments: 16 });
     * const strand = await bitbybit.jscad.hulls.hullChain({ meshes: spheres });
     * ```
     */
    hullChain(inputs: Inputs.JSCAD.HullDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.hulls.hullChain(...asKind<Inputs.JSCAD.JSCADGeom3>(inputs.meshes));
    }

    /**
     * Wraps all the inputs in one convex hull, the smallest shape without dents that contains them
     * all, regardless of their order.
     *
     * All inputs must be of the same kind, solids, 2D shapes or paths.
     * @param inputs - The solids, 2D shapes or paths
     * @returns The convex hull
     * @group hulls
     * @shortname hull
     * @drawable true
     * @example
     * ```typescript
     * const wrapped = await bitbybit.jscad.hulls.hull({ meshes: [cube, sphere] });
     * ```
     */
    hull(inputs: Inputs.JSCAD.HullDto): Inputs.JSCAD.JSCADEntity  {
        return this.jscad.hulls.hull(...asKind<Inputs.JSCAD.JSCADGeom3>(inputs.meshes));
    }
}
