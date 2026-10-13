import type { IfcTransaction } from "../model/transaction";
import { isReference } from "../step/values";
import type { ModelReader } from "./build-types";
import type { EntityWriter } from "./entity-writer";
import { propertySetsOf, setPropertyValues } from "./properties";
import { firstItem } from "./representations";

const REGISTRY = "BBIM_Boolean";
const DATA = "Data";
const CLIPPING = "IfcBooleanClippingResult";
const BOOLEAN = "IfcBooleanResult";
const LISTED_ID = /\d+/g;

function clippingsOf(reader: ModelReader, body: number | undefined): number[] {
    const chain: number[] = [];
    let current = body === undefined ? undefined : firstItem(reader, body);
    while (current !== undefined && reader.typeOf(current) === CLIPPING) {
        chain.unshift(current);
        const first = reader.attribute(current, "FirstOperand");
        current = isReference(first) ? first.ref : undefined;
    }
    return chain;
}

function listedIn(reader: ModelReader, product: number): string | undefined {
    const data = propertySetsOf(reader, product).find((set) => set.name === REGISTRY)?.properties[DATA];
    return typeof data === "string" ? data : undefined;
}

export function registerClippings(tx: IfcTransaction, writer: EntityWriter, product: number, before: number | undefined, after: number): void {
    const listing = listedIn(tx, product);
    const listed = (listing?.match(LISTED_ID) ?? []).map(Number);
    const old = clippingsOf(tx, before);
    const isBoolean = (id: number): boolean => {
        const type = tx.typeOf(id);
        return type !== undefined && tx.schema.isSubtypeOf(type, BOOLEAN);
    };
    const others = listed.filter((id) => !old.includes(id) && isBoolean(id));
    const now = clippingsOf(tx, after).filter((_, index) => index >= old.length || listed.includes(old[index]!));
    const data = `[${[...others, ...now].join(", ")}]`;
    if (data !== listing && (listing !== undefined || now.length)) {
        setPropertyValues(tx, writer, product, REGISTRY, [{ name: DATA, value: data, type: "IfcLabel" }]);
    }
}
