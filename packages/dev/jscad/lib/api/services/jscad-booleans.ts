
import * as Inputs from "../inputs/jscad-inputs";
import * as JSCAD from "@jscad/modeling";
import { asKind } from "./entity-narrowing";

/**
 * Combining JSCAD geometry: union fuses, subtract cuts and intersect keeps the overlap, in a
 * two-input form and a many-input form. All inputs of one call must be of the same kind, either
 * solids or flat 2D shapes, or the kernel throws an error; a path cannot be combined. Every method
 * gives new geometry and leaves the inputs as they are.
 */
export class JSCADBooleans {

    constructor(
        private readonly jscad: typeof JSCAD
    ) { }

    /**
     * Keeps only the volume or area that all the inputs share, dropping everything else.
     *
     * The inputs must all be solids or all be 2D shapes; an empty result is possible when they do
     * not overlap.
     * @param inputs - The solids or 2D shapes to intersect
     * @returns The shared part as one solid or 2D shape
     * @group boolean
     * @shortname intersect
     * @drawable true
     * @example
     * ```typescript
     * const common = await bitbybit.jscad.booleans.intersect({ meshes: [cube, sphere] });
     * ```
     */
    intersect(inputs: Inputs.JSCAD.BooleanObjectsDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.booleans.intersect(...asKind<Inputs.JSCAD.JSCADGeom3>(inputs.meshes));
    }

    /**
     * Cuts every later input out of the first one, leaving what remains of the first.
     *
     * The inputs must all be solids or all be 2D shapes; the order matters, the first is the one
     * being cut.
     * @param inputs - The geometry to cut from, first, followed by the geometry to cut with
     * @returns The first input minus the others
     * @group boolean
     * @shortname subtract
     * @drawable true
     * @example
     * ```typescript
     * const holed = await bitbybit.jscad.booleans.subtract({ meshes: [cube, cylinder1, cylinder2] });
     * ```
     */
    subtract(inputs: Inputs.JSCAD.BooleanObjectsDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.booleans.subtract(...asKind<Inputs.JSCAD.JSCADGeom3>(inputs.meshes));
    }

    /**
     * Fuses all the inputs into one solid or one 2D shape, merging where they overlap and keeping
     * separate parts as one entity.
     *
     * The inputs must all be solids or all be 2D shapes.
     * @param inputs - The solids or 2D shapes to fuse
     * @returns The fused solid or 2D shape
     * @group boolean
     * @shortname union
     * @drawable true
     * @example
     * ```typescript
     * const fused = await bitbybit.jscad.booleans.union({ meshes: [cube, sphere] });
     * ```
     */
    union(inputs: Inputs.JSCAD.BooleanObjectsDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.booleans.union(...asKind<Inputs.JSCAD.JSCADGeom3>(inputs.meshes));
    }

    /**
     * Keeps only the volume or area that `first` and `second` share, the two-input form of
     * `intersect`.
     * @param inputs - The two solids or two 2D shapes
     * @returns The shared part
     * @group boolean
     * @shortname intersect two
     * @drawable true
     * @example
     * ```typescript
     * const common = await bitbybit.jscad.booleans.intersectTwo({ first: cube, second: sphere });
     * ```
     */
    intersectTwo(inputs: Inputs.JSCAD.BooleanTwoObjectsDto): Inputs.JSCAD.JSCADEntity {
        const meshes = asKind<Inputs.JSCAD.JSCADGeom3>([inputs.first, inputs.second]);
        return this.jscad.booleans.intersect(...meshes);
    }

    /**
     * Cuts `second` out of `first`, the two-input form of `subtract`.
     * @param inputs - The geometry to cut from and the geometry to cut with
     * @returns The first input minus the second
     * @group boolean
     * @shortname subtract two
     * @drawable true
     * @example
     * ```typescript
     * const holed = await bitbybit.jscad.booleans.subtractTwo({ first: cube, second: sphere });
     * ```
     */
    subtractTwo(inputs: Inputs.JSCAD.BooleanTwoObjectsDto): Inputs.JSCAD.JSCADEntity {
        const meshes = asKind<Inputs.JSCAD.JSCADGeom3>([inputs.first, inputs.second]);
        return this.jscad.booleans.subtract(...meshes);
    }

    /**
     * Fuses `first` and `second` into one, the two-input form of `union`.
     * @param inputs - The two solids or two 2D shapes
     * @returns The fused solid or 2D shape
     * @group boolean
     * @shortname union two
     * @drawable true
     * @example
     * ```typescript
     * const fused = await bitbybit.jscad.booleans.unionTwo({ first: cube, second: sphere });
     * ```
     */
    unionTwo(inputs: Inputs.JSCAD.BooleanTwoObjectsDto): Inputs.JSCAD.JSCADEntity {
        const meshes = asKind<Inputs.JSCAD.JSCADGeom3>([inputs.first, inputs.second]);
        return this.jscad.booleans.union(...meshes);
    }

    /**
     * Cuts every entry of `meshes` out of `from`, leaving what remains of `from`; the same as
     * `subtract` with the base geometry named separately.
     * @param inputs - The geometry to cut from and the list of geometry to cut with
     * @returns The base geometry minus the others
     * @group boolean
     * @shortname subtract from
     * @drawable true
     * @example
     * ```typescript
     * const holed = await bitbybit.jscad.booleans.subtractFrom({ from: cube, meshes: [cylinder1, cylinder2] });
     * ```
     */
    subtractFrom(inputs: Inputs.JSCAD.BooleanObjectsFromDto): Inputs.JSCAD.JSCADEntity {
        const meshes = asKind<Inputs.JSCAD.JSCADGeom3>([inputs.from, ...inputs.meshes]);
        return this.jscad.booleans.subtract(...meshes);
    }
}
