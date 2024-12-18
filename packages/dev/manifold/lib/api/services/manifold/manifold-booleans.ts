import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

export class ManifoldBooleans {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    split(inputs: Inputs.Manifold.SplitManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold[] {
        return inputs.manifoldToSplit.split(inputs.manifoldCutter);
    }

    splitByPlane(inputs: Inputs.Manifold.SplitByPlaneDto<Manifold3D.Manifold>): Manifold3D.Manifold[] {
        return inputs.manifold.splitByPlane(inputs.normal, inputs.originOffset);
    }

    splitByPlaneOnOffsets(inputs: Inputs.Manifold.SplitByPlaneOnOffsetsDto<Manifold3D.Manifold>): Manifold3D.Manifold[] {
        const pieces = [];

        const clone = inputs.manifold.asOriginal();
        const remainders = [clone];
        const junk = [];

        inputs.originOffsets.forEach((s, i) => {
            if (remainders[i]) {
                const halfs = remainders[i].splitByPlane(inputs.normal, s);
                if (!halfs[1].isEmpty() && !halfs[0].isEmpty()) {
                    pieces.push(halfs[1]);
                    remainders.push(halfs[0]);
                } else if (halfs[1].isEmpty() && !halfs[0].isEmpty()) {
                    remainders.push(halfs[0]);
                    junk.push(halfs[1]);
                } else if (!halfs[1].isEmpty() && halfs[0].isEmpty()) {
                    pieces.push(halfs[1]);
                    junk.push(halfs[0]);
                } else if (halfs[0].isEmpty() && halfs[1].isEmpty()) {
                    junk.push(...halfs);
                }
            }
        });
        remainders.forEach(r => r.delete());
        junk.forEach(j => j.delete());
        return pieces;
    }

    trimByPlane(inputs: Inputs.Manifold.TrimByPlaneDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.asOriginal().trimByPlane(inputs.normal, inputs.originOffset);
    }

    subtract(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold1.subtract(inputs.manifold2);
    }

    add(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold1.add(inputs.manifold2);
    }

    intersect(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold1.intersect(inputs.manifold2);
    }

    differenceTwo(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { difference } = Manifold;
        return difference(inputs.manifold1, inputs.manifold2);
    }

    difference(inputs: Inputs.Manifold.ManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { difference } = Manifold;
        return difference(inputs.manifolds);
    }

    unionTwo(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { union } = Manifold;
        return union(inputs.manifold1, inputs.manifold2);
    }

    union(inputs: Inputs.Manifold.ManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { union } = Manifold;
        return union(inputs.manifolds);
    }

    intersectionTwo(inputs: Inputs.Manifold.TwoManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { intersection } = Manifold;
        return intersection(inputs.manifold1, inputs.manifold2);
    }

    intersection(inputs: Inputs.Manifold.ManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { intersection } = Manifold;
        return intersection(inputs.manifolds);
    }

}
