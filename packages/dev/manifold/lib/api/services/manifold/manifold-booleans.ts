import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldBooleans {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    /**
     * Subtract two manifold shapes
     * @param inputs two shapes
     * @returns subtracted manifold shape
     * @group a to b
     * @shortname subtract
     * @drawable true
     */
    subtract(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold1.subtract(inputs.manifold2);
    }

    /**
     * Add two manifold shapes
     * @param inputs two shapes
     * @returns unioned manifold shape
     * @group a to b
     * @shortname add
     * @drawable true
     */
    add(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold1.add(inputs.manifold2);
    }

    /**
     * Intersect two manifold shapes
     * @param inputs two shapes
     * @returns intersected manifold shape
     * @group a to b
     * @shortname intersect
     * @drawable true
     */
    intersect(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold1.intersect(inputs.manifold2);
    }

    /**
     * Difference of two manifold shapes
     * @param inputs two shapes
     * @returns difference of two manifold shapes
     * @group 2 manifolds
     * @shortname difference 2 manifolds
     * @drawable true
     */
    differenceTwo(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { difference } = Manifold;
        return difference(inputs.manifold1, inputs.manifold2);
    }

    /**
     * Union of two manifold shapes
     * @param inputs two shapes
     * @returns union of two manifold shapes
     * @group 2 manifolds
     * @shortname union 2 manifolds
     * @drawable true
     */
    unionTwo(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { union } = Manifold;
        return union(inputs.manifold1, inputs.manifold2);
    }

    /**
     * Intersection of two manifold shapes
     * @param inputs two shapes
     * @returns intersection of two manifold shapes
     * @group 2 manifolds
     * @shortname intersection 2 manifolds
     * @drawable true
     */
    intersectionTwo(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { intersection } = Manifold;
        return intersection(inputs.manifold1, inputs.manifold2);
    }

    /**
     * Difference of multiple manifold shapes
     * @param inputs multiple shapes
     * @returns difference of two manifold shapes
     * @group multiple
     * @shortname difference manifolds
     * @drawable true
     */
    difference(inputs: Inputs.Manifold.ManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { difference } = Manifold;
        return difference(inputs.manifolds);
    }

    /**
     * Union of multiple manifold shapes
     * @param inputs multiple shapes
     * @returns union of two manifold shapes
     * @group multiple
     * @shortname union manifolds
     * @drawable true
     */
    union(inputs: Inputs.Manifold.ManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { union } = Manifold;
        return union(inputs.manifolds);
    }

    /**
     * Intersection of multiple manifold shapes
     * @param inputs two shapes
     * @returns intersection of multiple manifold shapes
     * @group multiple
     * @shortname intersection manifolds
     * @drawable true
     */
    intersection(inputs: Inputs.Manifold.ManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { intersection } = Manifold;
        return intersection(inputs.manifolds);
    }

    /**
     * Split manifold by another manifold
     * @param inputs manifold to split and manifold cutter
     * @returns split manifold
     * @group split
     * @shortname split
     * @drawable true
     */
    split(inputs: Inputs.Manifold.SplitManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold[] {
        return inputs.manifoldToSplit.split(inputs.manifoldCutter);
    }

    /**
     * Split manifold by plane
     * @param inputs manifold and plane
     * @returns split manifold
     * @group split
     * @shortname split by plane
     * @drawable true
     */
    splitByPlane(inputs: Inputs.Manifold.SplitByPlaneDto<Manifold3D.Manifold>): Manifold3D.Manifold[] {
        return inputs.manifold.splitByPlane(inputs.normal, inputs.originOffset);
    }

    /**
     * Split manifold by plane on various offsets. Each cut takes the part below the plane as a
     * finished piece and carries the part above it to the next, larger offset, so a run of n offsets
     * yields n + 1 pieces and accounts for the whole of the solid.
     * @param inputs manifold, plane and the list of offsets
     * @returns splitted manifolds, one more than the offsets given
     * @group split
     * @shortname split by plane on offsets
     * @drawable true
     */
    splitByPlaneOnOffsets(inputs: Inputs.Manifold.SplitByPlaneOnOffsetsDto<Manifold3D.Manifold>): Manifold3D.Manifold[] {
        const pieces: Manifold3D.Manifold[] = [];
        const junk: Manifold3D.Manifold[] = [];

        let remainder: Manifold3D.Manifold | undefined = inputs.manifold.asOriginal();

        inputs.originOffsets.forEach((offset) => {
            if (!remainder) {
                return;
            }
            const halfs = remainder.splitByPlane(inputs.normal, offset);
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
     * Trim manifold by plane
     * @param inputs manifold and plane
     * @returns trimmed manifold
     * @group trim
     * @shortname trim by plane
     * @drawable true
     */
    trimByPlane(inputs: Inputs.Manifold.TrimByPlaneDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.asOriginal().trimByPlane(inputs.normal, inputs.originOffset);
    }

}
