import type { IfcSchema } from "../schema/schema";
import type { IfcAttributeInfo, IfcEntityInfo } from "../schema/schema-types";
import { encoderFor } from "../step/encoder";
import type { IfcEntity, IfcValue } from "../step/step-types";
import { DERIVED, enumValue, isDerived, isList, isReference } from "../step/values";
import { ModelSnapshot } from "./snapshot";
import { Ifc2x3Rows } from "./upgrade-rows";

const IFC4 = "IFC4";
const NOT_DEFINED = "NOTDEFINED";
const SET = "SET";
const SUCCESSORS: ReadonlyMap<string, string> = new Map([["IFCRELOCCUPIESSPACES", "IfcRelAssignsToActor"]]);

function notDefinedFor(schema: IfcSchema, attribute: IfcAttributeInfo): IfcValue | undefined {
    const type = typeof attribute.type === "string" ? schema.type(attribute.type) : undefined;
    return type && "e" in type && type.e.includes(NOT_DEFINED) ? enumValue(NOT_DEFINED) : undefined;
}

function keyOf(value: IfcValue): string {
    return isReference(value) ? `#${value.ref}` : JSON.stringify(value);
}

function withoutRepeats(values: readonly IfcValue[]): readonly IfcValue[] {
    const seen = new Set<string>();
    const kept = values.filter((value) => {
        const key = keyOf(value);
        const fresh = !seen.has(key);
        seen.add(key);
        return fresh;
    });
    return kept.length === values.length ? values : kept;
}

function upgradedValue(rows: Ifc2x3Rows, schema: IfcSchema, info: IfcEntityInfo, entity: IfcEntity, index: number, value: IfcValue): IfcValue {
    const attribute = info.attributes[index]!;
    if (attribute.derived) {
        return isDerived(value) ? value : DERIVED;
    }
    if (value === null || isDerived(value)) {
        if (attribute.optional) {
            return value === null ? value : null;
        }
        const fallback = notDefinedFor(schema, attribute) ?? rows.missing(info, entity, attribute);
        if (fallback === undefined) {
            throw new Error(`#${entity.id} ${info.name}.${attribute.name} is required by IFC4 and the file leaves it out, so the file cannot be upgraded`);
        }
        return fallback;
    }
    const converted = rows.converted(attribute, entity, value);
    if (converted !== undefined) {
        return converted;
    }
    return Array.isArray(attribute.type) && attribute.type[0] === SET && isList(value) ? withoutRepeats(value) : value;
}

function upgradedEntity(model: ModelSnapshot, id: number): IfcEntity {
    const known = model.typeOf(id);
    if (known !== undefined) {
        return model.peek(id);
    }
    const raw = model.source?.rawTypeOf(id) ?? "";
    const successor = SUCCESSORS.get(raw.toUpperCase());
    if (successor === undefined) {
        throw new Error(`#${id} is an ${raw}, which IFC4 has no counterpart for, so the file cannot be upgraded`);
    }
    return { id, type: successor, args: model.source!.rawArguments(id)! };
}

export function upgradeToIfc4(model: ModelSnapshot): ModelSnapshot {
    if (model.editable && model.schemaName === IFC4) {
        return model;
    }
    if (model.schema.name !== IFC4) {
        throw new Error(`Only an IFC2X3 model is upgraded to IFC4, and this one is ${model.schemaName}`);
    }
    const encoder = encoderFor(model.schema);
    const rows = new Ifc2x3Rows(model);
    const changes: [number, IfcEntity | null][] = [];
    for (const id of model.ids()) {
        if (model.typeOf(id) === undefined && rows.isDate(id)) {
            changes.push([id, null]);
            continue;
        }
        const read = rows.surfaced(rows.restyled(upgradedEntity(model, id)));
        const info = model.schema.entity(read.type);
        const entity = { ...read, args: rows.given(info, read.args) };
        if (entity.args.length > info.attributes.length) {
            throw new Error(`#${id} gives ${entity.args.length} values where IFC4's ${info.name} takes ${info.attributes.length}, so the file cannot be upgraded`);
        }
        const args = rows.completed(info, entity, info.attributes.map((_, index) => upgradedValue(rows, model.schema, info, entity, index, entity.args[index] ?? null)));
        const normalized = encoder.normalizeArguments(info.name, args, `#${id}`);
        const changed = entity.type !== model.typeOf(id) || read.args.length !== args.length || args.some((value, index) => value !== read.args[index]);
        if (changed) {
            changes.push([id, { id, type: info.name, args: normalized }]);
        }
    }
    const created = rows.created.map(([id, entity]): [number, IfcEntity] => [id, { ...entity, args: encoder.normalizeArguments(entity.type, entity.args, `#${id}`) }]);
    return new ModelSnapshot({
        ...model.parts,
        header: { ...model.header, schemaIdentifiers: [IFC4] },
        overlay: model.overlay.withChanges([...changes, ...created]),
        nextId: rows.next,
    });
}
