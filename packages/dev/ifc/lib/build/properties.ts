import type * as Inputs from "../api/inputs";
import type { IfcTransaction } from "../model/transaction";
import type { IfcTypedValue, IfcValue } from "../step/step-types";
import { isList, isReference, isTyped, ref, typed } from "../step/values";
import type { ModelReader, PropertySpec } from "./build-types";
import { PROPERTY_DEFINITION } from "./constants";
import type { EntityWriter } from "./entity-writer";
import { relate } from "./relationships";
import { describeObject } from "./spatial";

const TYPE_OBJECT = "IfcTypeObject";

function nominalValue(property: PropertySpec): IfcTypedValue {
    if (property.type !== undefined) {
        return typed(property.type, property.value);
    }
    if (typeof property.value === "string") {
        return typed("IfcLabel", property.value);
    }
    if (typeof property.value === "boolean") {
        return typed("IfcBoolean", property.value);
    }
    return typed(Number.isSafeInteger(property.value) ? "IfcInteger" : "IfcReal", property.value);
}

function referencesOf(value: IfcValue): number[] {
    if (isReference(value)) {
        return [value.ref];
    }
    const items = isTyped(value) ? value.value : value;
    return isList(items) ? items.filter(isReference).map((item) => item.ref) : [];
}

function isType(reader: ModelReader, object: number): boolean {
    return reader.schema.isSubtypeOf(reader.entity(object).type, TYPE_OBJECT);
}

function writeProperties(writer: EntityWriter, properties: readonly PropertySpec[]): number[] {
    const names = new Set<string>();
    return properties.map((property) => {
        if (names.has(property.name)) {
            throw new Error(`The property set names '${property.name}' twice`);
        }
        names.add(property.name);
        return writer.create("IfcPropertySingleValue", { Name: property.name, NominalValue: nominalValue(property) });
    });
}

function attach(tx: IfcTransaction, writer: EntityWriter, objects: readonly number[], set: number): void {
    const types = objects.filter((object) => isType(tx, object));
    const occurrences = objects.filter((object) => !types.includes(object));
    for (const type of types) {
        tx.update(type, { HasPropertySets: [...referencesOf(tx.attribute(type, "HasPropertySets")).map(ref), ref(set)] });
    }
    if (occurrences.length) {
        relate(tx, writer, PROPERTY_DEFINITION, set, occurrences);
    }
}

export function addPropertySet(tx: IfcTransaction, writer: EntityWriter, objects: readonly number[], name: string, properties: readonly PropertySpec[]): number {
    if (!properties.length) {
        throw new Error("A property set needs at least one property");
    }
    const propertyIds = writeProperties(writer, properties);
    const set = writer.create("IfcPropertySet", { GlobalId: tx.globalId(undefined), Name: name, HasProperties: propertyIds.map(ref) });
    attach(tx, writer, objects, set);
    return set;
}

export function definitionsOf(reader: ModelReader, object: number): number[] {
    if (isType(reader, object)) {
        return referencesOf(reader.attribute(object, "HasPropertySets"));
    }
    return reader.referencesTo(object)
        .filter((user) => reader.get(user)?.type === PROPERTY_DEFINITION.relationship && referencesOf(reader.attribute(user, PROPERTY_DEFINITION.related)).includes(object))
        .flatMap((user) => referencesOf(reader.attribute(user, PROPERTY_DEFINITION.relating)));
}

function singleValues(reader: ModelReader, set: number): Record<string, string | number | boolean> {
    const values: Record<string, string | number | boolean> = {};
    for (const property of referencesOf(reader.attribute(set, "HasProperties"))) {
        if (reader.entity(property).type !== "IfcPropertySingleValue") {
            continue;
        }
        const name = reader.attribute(property, "Name");
        const value = reader.attribute(property, "NominalValue");
        const inner = isTyped(value) ? value.value : null;
        if (typeof name === "string" && (typeof inner === "string" || typeof inner === "number" || typeof inner === "boolean")) {
            values[name] = inner;
        }
    }
    return values;
}

export function propertySetsOf(reader: ModelReader, object: number): Inputs.IFC.PropertySetInfoDto[] {
    return definitionsOf(reader, object)
        .filter((definition) => reader.entity(definition).type === "IfcPropertySet")
        .map((set) => {
            const name = reader.attribute(set, "Name");
            return { name: typeof name === "string" ? name : "", properties: singleValues(reader, set) };
        });
}

function nameOf(reader: ModelReader, id: number): string {
    const name = reader.attribute(id, "Name");
    return typeof name === "string" ? name : "";
}

function findSet(reader: ModelReader, object: number, name: string): number | undefined {
    return definitionsOf(reader, object).find((definition) => reader.entity(definition).type === "IfcPropertySet" && nameOf(reader, definition) === name);
}

function namedSet(reader: ModelReader, object: number, name: string): number {
    const set = findSet(reader, object, name);
    if (set === undefined) {
        throw new Error(`${describeObject(reader, object)} has no property set named '${name}'`);
    }
    return set;
}

function holdersOf(reader: ModelReader, set: number): number {
    return reader.referencesTo(set).reduce((count, user) => {
        if (reader.get(user)?.type === PROPERTY_DEFINITION.relationship) {
            return count + referencesOf(reader.attribute(user, PROPERTY_DEFINITION.related)).length;
        }
        return count + (isType(reader, user) ? 1 : 0);
    }, 0);
}

function detachSet(tx: IfcTransaction, writer: EntityWriter, object: number, set: number): void {
    if (isType(tx, object)) {
        const kept = referencesOf(tx.attribute(object, "HasPropertySets")).filter((id) => id !== set);
        tx.update(object, { HasPropertySets: kept.length ? kept.map(ref) : null });
        return;
    }
    for (const user of tx.referencesTo(set)) {
        const related = tx.get(user)?.type === PROPERTY_DEFINITION.relationship ? referencesOf(tx.attribute(user, PROPERTY_DEFINITION.related)) : [];
        if (!related.includes(object)) {
            continue;
        }
        const siblings = referencesOf(tx.attribute(user, PROPERTY_DEFINITION.relating)).filter((id) => id !== set);
        const kept = related.filter((id) => id !== object);
        if (kept.length) {
            tx.update(user, { [PROPERTY_DEFINITION.related]: kept.map(ref) });
        } else {
            tx.delete(user);
        }
        siblings.forEach((sibling) => relate(tx, writer, PROPERTY_DEFINITION, sibling, [object]));
    }
}

function ownSet(tx: IfcTransaction, writer: EntityWriter, object: number, set: number): number {
    if (holdersOf(tx, set) <= 1) {
        return set;
    }
    const copy = writer.create("IfcPropertySet", {
        GlobalId: tx.globalId(undefined),
        Name: tx.attribute(set, "Name"),
        Description: tx.attribute(set, "Description"),
        HasProperties: tx.attribute(set, "HasProperties"),
    });
    detachSet(tx, writer, object, set);
    attach(tx, writer, [object], copy);
    return copy;
}

export function setPropertyValues(tx: IfcTransaction, writer: EntityWriter, object: number, name: string, properties: readonly PropertySpec[]): void {
    if (!properties.length) {
        throw new Error("Give at least one property to set");
    }
    const found = findSet(tx, object, name);
    if (found === undefined) {
        addPropertySet(tx, writer, [object], name, properties);
        return;
    }
    const set = ownSet(tx, writer, object, found);
    const changed = new Set(properties.map((property) => property.name));
    const current = referencesOf(tx.attribute(set, "HasProperties"));
    const kept = current.filter((property) => !changed.has(nameOf(tx, property)));
    tx.update(set, { HasProperties: [...kept, ...writeProperties(writer, properties)].map(ref) });
    tx.dropIfUnused(current.filter((property) => !kept.includes(property)));
}

export function removePropertyValues(tx: IfcTransaction, writer: EntityWriter, object: number, name: string, names: readonly string[]): void {
    const found = namedSet(tx, object, name);
    const current = referencesOf(tx.attribute(found, "HasProperties"));
    const missing = names.find((property) => !current.some((id) => nameOf(tx, id) === property));
    if (missing !== undefined) {
        throw new Error(`The property set '${name}' of ${describeObject(tx, object)} has no property named '${missing}'`);
    }
    const kept = current.filter((property) => !names.includes(nameOf(tx, property)));
    if (!kept.length) {
        removePropertySet(tx, writer, object, name);
        return;
    }
    const set = ownSet(tx, writer, object, found);
    tx.update(set, { HasProperties: kept.map(ref) });
    tx.dropIfUnused(current.filter((property) => !kept.includes(property)));
}

export function removePropertySet(tx: IfcTransaction, writer: EntityWriter, object: number, name: string): void {
    const set = namedSet(tx, object, name);
    detachSet(tx, writer, object, set);
    tx.dropIfUnused([set]);
}
