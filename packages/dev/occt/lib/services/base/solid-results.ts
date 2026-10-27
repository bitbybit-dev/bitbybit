import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";

const LEAST_VOLUME = 1e-21;

const VOLUME_SLACK = 1.000001;

const BOX_VALUES = 6;

function boxVolumeOf(occ: BitbybitOcctModule, shape: TopoDS_Shape): number {
    const box = occ.BoundingBoxOf(shape);
    if (box.length < BOX_VALUES) {
        return 0;
    }
    const [width, height, depth] = subtract3([box[3]!, box[4]!, box[5]!], [box[0]!, box[1]!, box[2]!]);
    return width * height * depth;
}

export function holdsSolid(occ: BitbybitOcctModule, shape: TopoDS_Shape): boolean {
    return occ.CountSubShapes(shape, occ.TopAbs_ShapeEnum.SOLID, false) > 0;
}

export function isBrokenResult(occ: BitbybitOcctModule, made: TopoDS_Shape, asSolid: boolean): boolean {
    if (made.IsNull()) {
        return true;
    }
    if (!asSolid || occ.ShapeIsValid(made)) {
        return false;
    }
    const volume = Math.abs(occ.VolumePropertiesOfEach([made])[0] ?? Number.NaN);
    return !holdsSolid(occ, made) || !(volume > LEAST_VOLUME) || volume > boxVolumeOf(occ, made) * VOLUME_SLACK;
}

export function unbrokenResult<T extends TopoDS_Shape>(occ: BitbybitOcctModule, made: T, asSolid: boolean, failure: () => Error): T {
    if (isBrokenResult(occ, made, asSolid)) {
        made.delete();
        throw failure();
    }
    return made;
}
