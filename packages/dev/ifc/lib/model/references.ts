import type { IfcTypeSpec } from "../schema/schema-types";
import type { IfcValue } from "../step/step-types";
import { isList, isReference, isTyped } from "../step/values";
import type { ModelSnapshot } from "./snapshot";

function checkReference(model: ModelSnapshot, spec: string, id: number, path: string): void {
    const target = model.typeOf(id);
    if (target === undefined) {
        const what = model.has(id) ? `a ${model.source?.rawTypeOf(id) ?? "type"}, which ${model.schema.name} does not define` : "which the model does not hold";
        throw new Error(`${path} refers to #${id}, ${what}`);
    }
    const accepted = model.schema.hasEntity(spec) ? [spec] : model.schema.selectContents(spec).entities;
    if (!accepted.some((name) => model.schema.isSubtypeOf(target, name))) {
        throw new Error(`${path} refers to #${id}, an ${target}, where ${spec} is expected`);
    }
}

function checkValue(model: ModelSnapshot, spec: IfcTypeSpec, value: IfcValue, path: string): void {
    if (typeof spec !== "string") {
        if (isList(value)) {
            value.forEach((item, index) => checkValue(model, spec[3], item, `${path}[${index}]`));
        }
        return;
    }
    if (isReference(value)) {
        checkReference(model, spec, value.ref, path);
        return;
    }
    const type = model.schema.type(spec);
    if (!type) {
        return;
    }
    if ("t" in type) {
        checkValue(model, type.t, value, path);
    } else if ("s" in type && isTyped(value)) {
        checkValue(model, value.type, value.value, path);
    }
}

export function checkReferences(model: ModelSnapshot, changed: readonly number[], deleted: readonly number[]): void {
    for (const id of changed) {
        const entity = model.entity(id);
        const info = model.schema.entity(entity.type);
        info.attributes.forEach((attribute, index) => {
            checkValue(model, attribute.type, entity.args[index] ?? null, `#${id} ${info.name}.${attribute.name}`);
        });
    }
    for (const id of deleted) {
        const users = model.referencesTo(id);
        if (users.length) {
            throw new Error(`#${id} cannot be deleted while ${users.map((user) => `#${user}`).join(", ")} still refer to it`);
        }
    }
}
