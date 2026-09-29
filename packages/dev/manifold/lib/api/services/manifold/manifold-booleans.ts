import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";
import { resolveDto } from "@bitbybit-dev/base";
import * as Resolved from "../../resolved-inputs";

/**
 * Combining Manifold solids: fusing, cutting and intersecting two or many at once, and splitting a
 * solid with another solid or a plane. Because the kernel works on closed triangle meshes, these
 * are fast and always give a watertight result; the two-shape and many-shape forms give the same
 * results and exist for convenience. Every method returns new solids and leaves the inputs as they
 * are.
 */
export class ManifoldBooleans {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    /**
     * Sweeps the second solid over the whole surface of the first and fuses everything it passes
     * through, growing the first solid by the shape of the second - the Minkowski sum, which is
     * how a solid is rounded or padded by a sphere.
     * @param inputs - The solid to grow and the solid to sweep
     * @returns The grown solid
     * @group minkowski
     * @shortname minkowski sum
     * @drawable true
     * @example
     * ```typescript
     * const padded = await bitbybit.manifold.manifold.booleans.minkowskiSum({ manifold1: cube, manifold2: sphere });
     * ```
     */
    minkowskiSum(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold1.minkowskiSum(inputs.manifold2);
    }

    /**
     * Sweeps the second solid over the whole surface of the first and cuts away everything it
     * passes through, shrinking the first solid by the shape of the second - the Minkowski
     * difference, the erosion that undoes a Minkowski sum.
     * @param inputs - The solid to shrink and the solid to sweep
     * @returns The shrunken solid
     * @group minkowski
     * @shortname minkowski difference
     * @drawable true
     * @example
     * ```typescript
     * const eroded = await bitbybit.manifold.manifold.booleans.minkowskiDifference({ manifold1: cube, manifold2: sphere });
     * ```
     */
    minkowskiDifference(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold1.minkowskiDifference(inputs.manifold2);
    }

    /**
     * Cuts the second solid out of the first, leaving what remains of the first.
     * @param inputs - The solid to cut from and the solid to cut with
     * @returns The first solid minus the second
     * @group a to b
     * @shortname subtract
     * @drawable true
     * @example
     * ```typescript
     * const holed = await bitbybit.manifold.manifold.booleans.subtract({ manifold1: cube, manifold2: sphere });
     * ```
     */
    subtract(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold1.subtract(inputs.manifold2);
    }

    /**
     * Fuses two solids into one closed, watertight solid.
     * @param inputs - The two solids
     * @returns The fused solid
     * @group a to b
     * @shortname add
     * @drawable true
     * @example
     * ```typescript
     * const fused = await bitbybit.manifold.manifold.booleans.add({ manifold1: cube, manifold2: sphere });
     * ```
     */
    add(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold1.add(inputs.manifold2);
    }

    /**
     * Keeps only the volume two solids share, dropping everything else.
     * @param inputs - The two solids
     * @returns The shared volume
     * @group a to b
     * @shortname intersect
     * @drawable true
     * @example
     * ```typescript
     * const common = await bitbybit.manifold.manifold.booleans.intersect({ manifold1: cube, manifold2: sphere });
     * ```
     */
    intersect(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold1.intersect(inputs.manifold2);
    }

    /**
     * Cuts the second solid out of the first, the same as `subtract`.
     * @param inputs - The solid to cut from and the solid to cut with
     * @returns The first solid minus the second
     * @group 2 manifolds
     * @shortname difference 2 manifolds
     * @drawable true
     * @example
     * ```typescript
     * const holed = await bitbybit.manifold.manifold.booleans.differenceTwo({ manifold1: cube, manifold2: sphere });
     * ```
     */
    differenceTwo(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        return Manifold.difference(inputs.manifold1, inputs.manifold2);
    }

    /**
     * Fuses two solids into one, the same as `add`.
     * @param inputs - The two solids
     * @returns The fused solid
     * @group 2 manifolds
     * @shortname union 2 manifolds
     * @drawable true
     * @example
     * ```typescript
     * const fused = await bitbybit.manifold.manifold.booleans.unionTwo({ manifold1: cube, manifold2: sphere });
     * ```
     */
    unionTwo(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        return Manifold.union(inputs.manifold1, inputs.manifold2);
    }

    /**
     * Keeps only the volume two solids share, the same as `intersect`.
     * @param inputs - The two solids
     * @returns The shared volume
     * @group 2 manifolds
     * @shortname intersection 2 manifolds
     * @drawable true
     * @example
     * ```typescript
     * const common = await bitbybit.manifold.manifold.booleans.intersectionTwo({ manifold1: cube, manifold2: sphere });
     * ```
     */
    intersectionTwo(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        return Manifold.intersection(inputs.manifold1, inputs.manifold2);
    }

    /**
     * Cuts every further solid in the list out of the first one.
     * @param inputs - The solids, the first being the one cut from
     * @returns The first solid minus all the others
     * @group multiple
     * @shortname difference manifolds
     * @drawable true
     * @example
     * ```typescript
     * const holed = await bitbybit.manifold.manifold.booleans.difference({ manifolds: [cube, sphere, cylinder] });
     * ```
     */
    difference(inputs: Inputs.Manifold.ManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        return Manifold.difference(inputs.manifolds);
    }

    /**
     * Fuses all the solids in a list into one.
     * @param inputs - The solids
     * @returns The fused solid
     * @group multiple
     * @shortname union manifolds
     * @drawable true
     * @example
     * ```typescript
     * const fused = await bitbybit.manifold.manifold.booleans.union({ manifolds: [cube, sphere, cylinder] });
     * ```
     */
    union(inputs: Inputs.Manifold.ManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        return Manifold.union(inputs.manifolds);
    }

    /**
     * Keeps only the volume all the solids in a list share.
     * @param inputs - The solids
     * @returns The volume common to all of them
     * @group multiple
     * @shortname intersection manifolds
     * @drawable true
     * @example
     * ```typescript
     * const common = await bitbybit.manifold.manifold.booleans.intersection({ manifolds: [cube, sphere] });
     * ```
     */
    intersection(inputs: Inputs.Manifold.ManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        return Manifold.intersection(inputs.manifolds);
    }

    /**
     * Cuts a solid with another solid and keeps both pieces: the part inside the cutter and the
     * part outside it.
     *
     * Cheaper than an intersection followed by a subtraction when both are needed.
     * @param inputs - The solid to split and the solid to cut with
     * @returns Two solids: the part inside the cutter, then the part outside it
     * @group split
     * @shortname split
     * @drawable true
     * @example
     * ```typescript
     * const [inside, outside] = await bitbybit.manifold.manifold.booleans.split({ manifoldToSplit: cube, manifoldCutter: sphere });
     * ```
     */
    split(inputs: Inputs.Manifold.SplitManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold[] {
        return inputs.manifoldToSplit.split(inputs.manifoldCutter);
    }

    /**
     * Cuts a solid with a plane and keeps both pieces.
     *
     * The plane is given by its normal and its distance from the origin along that normal; the
     * first piece lies on the side the normal points to, the second on the other side.
     * @param inputs - The solid, the plane normal and the plane's distance from the origin
     * @returns Two solids: the part on the normal's side, then the rest
     * @group split
     * @shortname split by plane
     * @drawable true
     * @example
     * ```typescript
     * const [top, bottom] = await bitbybit.manifold.manifold.booleans.splitByPlane({ manifold: cube, normal: [0, 0, 1], originOffset: 0.5 });
     * ```
     */
    splitByPlane(inputs: Inputs.Manifold.SplitByPlaneDto<Manifold3D.Manifold>): Manifold3D.Manifold[] {
        const resolved = resolveDto(Inputs.Manifold.SplitByPlaneDto, inputs) as Resolved.Manifold.SplitByPlaneDto<Manifold3D.Manifold>;
        return resolved.manifold.splitByPlane(resolved.normal, resolved.originOffset);
    }

    /**
     * Cuts a solid into slabs with several parallel planes, all with the same normal, at the given
     * distances from the origin.
     *
     * Each cut keeps the part on the far side of the normal as a finished piece and carries the
     * rest to the next distance, so the offsets should increase; n offsets give n + 1 pieces, empty
     * ones dropped.
     * @param inputs - The solid, the plane normal and the distances of the planes from the origin
     * @returns The slabs, one more than the offsets given
     * @group split
     * @shortname split by plane on offsets
     * @drawable true
     * @example
     * ```typescript
     * const slabs = await bitbybit.manifold.manifold.booleans.splitByPlaneOnOffsets({ manifold: cube, normal: [0, 0, 1], originOffsets: [0.25, 0.5, 0.75] });
     * ```
     */
    splitByPlaneOnOffsets(inputs: Inputs.Manifold.SplitByPlaneOnOffsetsDto<Manifold3D.Manifold>): Manifold3D.Manifold[] {
        const resolved = resolveDto(Inputs.Manifold.SplitByPlaneOnOffsetsDto, inputs) as Resolved.Manifold.SplitByPlaneOnOffsetsDto<Manifold3D.Manifold>;
        const pieces: Manifold3D.Manifold[] = [];
        const junk: Manifold3D.Manifold[] = [];

        let remainder: Manifold3D.Manifold | undefined = resolved.manifold.asOriginal();

        resolved.originOffsets.forEach((offset) => {
            if (!remainder) {
                return;
            }
            const halfs = remainder.splitByPlane(resolved.normal, offset);
            junk.push(remainder);
            remainder = undefined;

            if (halfs[1].isEmpty()) {
                junk.push(halfs[1]);
            } else {
                pieces.push(halfs[1]);
            }

            if (halfs[0].isEmpty()) {
                junk.push(halfs[0]);
            } else {
                remainder = halfs[0];
            }
        });

        if (remainder) {
            pieces.push(remainder);
        }
        junk.forEach(j => j.delete());
        return pieces;
    }

    /**
     * Cuts a solid with a plane and keeps only the part on the side the normal points to.
     *
     * The plane is given by its normal and its distance from the origin along that normal.
     * @param inputs - The solid, the plane normal and the plane's distance from the origin
     * @returns The part of the solid on the normal's side
     * @group trim
     * @shortname trim by plane
     * @drawable true
     * @example
     * ```typescript
     * const half = await bitbybit.manifold.manifold.booleans.trimByPlane({ manifold: sphere, normal: [0, 0, 1], originOffset: 0 });
     * ```
     */
    trimByPlane(inputs: Inputs.Manifold.TrimByPlaneDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const resolved = resolveDto(Inputs.Manifold.TrimByPlaneDto, inputs) as Resolved.Manifold.TrimByPlaneDto<Manifold3D.Manifold>;
        return resolved.manifold.asOriginal().trimByPlane(resolved.normal, resolved.originOffset);
    }

}
