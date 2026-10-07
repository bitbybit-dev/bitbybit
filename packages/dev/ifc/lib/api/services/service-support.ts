import { GEOMETRY_TOLERANCE_METRES, METRES_TO_MILLIMETRES } from "../../build/constants";
import { EntityWriter } from "../../build/entity-writer";
import { millimetresPerUnit } from "../../build/project";
import { resolveObject } from "../../build/spatial";
import { ModelSnapshot } from "../../model/snapshot";
import { IfcTransaction } from "../../model/transaction";
import type { ModelChange } from "./service-types";

export function modelOf(value: unknown): ModelSnapshot {
    if (!(value instanceof ModelSnapshot)) {
        throw new TypeError("Expected an IFC model, as `model.create` or `model.read` return");
    }
    return value;
}

export function editModel(model: unknown, change: ModelChange): ModelSnapshot {
    const base = modelOf(model);
    const tx = new IfcTransaction(base);
    change(tx, new EntityWriter(tx));
    return tx.commit();
}

export function lengthTolerance(model: ModelSnapshot): number {
    return GEOMETRY_TOLERANCE_METRES * METRES_TO_MILLIMETRES / millimetresPerUnit(model);
}

export function lengthIn(model: ModelSnapshot, value: number | undefined, millimetres: number): number {
    return value ?? millimetres / millimetresPerUnit(model);
}

export function resolveId(model: ModelSnapshot, idOrGlobalId: string, type: string, what: string): number {
    if (typeof idOrGlobalId !== "string" || idOrGlobalId.length === 0) {
        throw new TypeError(`Expected the ${what}'s GlobalId or id as a text`);
    }
    return resolveObject(model, idOrGlobalId, type, what);
}

export function oneOf<T extends string>(value: unknown, allowed: Readonly<Record<string, T>>, what: string): T {
    const values = Object.values(allowed);
    if (typeof value !== "string" || !values.includes(value as T)) {
        throw new RangeError(`The ${what} '${String(value)}' is not one of ${values.join(", ")}`);
    }
    return value as T;
}
