import type { ModelSnapshot } from "../model/snapshot";
import type { IfcValue } from "../step/step-types";
import { isList, isReference } from "../step/values";
import { UnsupportedGeometryError } from "./errors";

export function referencesOf(value: IfcValue, what: string): number[] {
    if (!isList(value)) {
        throw new UnsupportedGeometryError(`${what} is not a list`);
    }
    return value.map((item) => {
        if (!isReference(item)) {
            throw new UnsupportedGeometryError(`${what} holds something other than a reference`);
        }
        return item.ref;
    });
}

export function referencesIn(model: ModelSnapshot, id: number, attribute: string): readonly number[] {
    return model.referenceList(id) ?? referencesOf(model.valueOf(model.peek(id), attribute), `#${id} ${attribute}`);
}
