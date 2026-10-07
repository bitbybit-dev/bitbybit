import type { IfcTransaction } from "../model/transaction";
import { isList, isReference, ref } from "../step/values";
import type { ModelReader } from "./build-types";
import { requiredReference } from "./checks";

export function representationOf(reader: ModelReader, product: number, identifier: string): number | undefined {
    const shape = reader.attribute(product, "Representation");
    if (!isReference(shape)) {
        return undefined;
    }
    const representations = reader.attribute(shape.ref, "Representations");
    for (const representation of isList(representations) ? representations : []) {
        if (isReference(representation) && reader.attribute(representation.ref, "RepresentationIdentifier") === identifier) {
            return representation.ref;
        }
    }
    return undefined;
}

export function firstItem(reader: ModelReader, representation: number): number {
    const items = reader.attribute(representation, "Items");
    const first = isList(items) ? items[0] : undefined;
    if (!isReference(first)) {
        throw new Error(`#${representation} holds no items`);
    }
    return first.ref;
}

export function unwrapClippings(reader: ModelReader, item: number): [number, number[]] {
    const halfSpaces: number[] = [];
    let current = item;
    while (reader.entity(current).type === "IfcBooleanClippingResult") {
        const second = reader.attribute(current, "SecondOperand");
        const first = reader.attribute(current, "FirstOperand");
        if (!isReference(second) || !isReference(first)) {
            throw new Error(`#${current} is a clipping without operands`);
        }
        halfSpaces.unshift(second.ref);
        current = first.ref;
    }
    return [current, halfSpaces];
}

export function replaceRepresentation(tx: IfcTransaction, product: number, oldRepresentation: number | undefined, newRepresentation: number): void {
    const shape = requiredReference(tx, product, "Representation");
    const representations = tx.attribute(shape, "Representations");
    const kept = (isList(representations) ? representations : []).filter((item) => !(isReference(item) && item.ref === oldRepresentation));
    tx.update(shape, { Representations: [...kept, ref(newRepresentation)] });
    if (oldRepresentation !== undefined) {
        tx.dropIfUnused([oldRepresentation]);
    }
}
