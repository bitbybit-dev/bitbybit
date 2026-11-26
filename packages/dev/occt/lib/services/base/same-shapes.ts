import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";

const HASH_BOUND = 2147483647;

export class SameShapes {
    private readonly byHash = new Map<number, number[]>();

    constructor(private readonly occ: BitbybitOcctModule, private readonly shapes: readonly TopoDS_Shape[]) {
        shapes.forEach((shape, index) => {
            const hash = occ.TopoDS_Shape_HashCode(shape, HASH_BOUND);
            this.byHash.set(hash, [...(this.byHash.get(hash) ?? []), index]);
        });
    }

    indexOf(shape: TopoDS_Shape): number | undefined {
        return (this.byHash.get(this.occ.TopoDS_Shape_HashCode(shape, HASH_BOUND)) ?? []).find(index => this.shapes[index]!.IsSame(shape));
    }
}
