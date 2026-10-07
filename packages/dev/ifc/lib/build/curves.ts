import type { Base } from "@bitbybit-dev/base";
import { isList } from "../step/values";
import type { ModelReader } from "./build-types";
import { requiredReference } from "./checks";
import { numbersOf, pointOf } from "./placement";

export function polylinePoints(reader: ModelReader, curve: number): Base.Point2[] | undefined {
    const type = reader.entity(curve).type;
    if (type === "IfcIndexedPolyCurve") {
        const list = requiredReference(reader, curve, "Points");
        const coordinates = reader.attribute(list, "CoordList");
        return (isList(coordinates) ? coordinates : []).map((item, index) => {
            const numbers = numbersOf(item, `#${list} point ${index}`);
            return [numbers[0] ?? 0, numbers[1] ?? 0];
        });
    }
    if (type === "IfcPolyline") {
        const list = reader.attribute(curve, "Points");
        return (isList(list) ? list : []).map((item) => {
            const point = pointOf(reader, item);
            return [point[0], point[1]];
        });
    }
    return undefined;
}
