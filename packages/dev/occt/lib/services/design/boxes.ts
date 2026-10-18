import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { MOST_BOXES } from "./constants";

export function knownBox(boxes: Map<string, readonly number[]>, hash: string, shape: TopoDS_Shape, occ: BitbybitOcctModule): readonly number[] {
    const known = boxes.get(hash);
    if (known !== undefined) {
        return known;
    }
    if (boxes.size >= MOST_BOXES) {
        boxes.clear();
    }
    const box = Array.from(occ.BoundingBoxOf(shape));
    boxes.set(hash, box);
    return box;
}
