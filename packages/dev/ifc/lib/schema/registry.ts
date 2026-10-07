import { IFC4_SCHEMA } from "./generated/ifc4";
import { IfcSchema } from "./schema";

const loaded = new Map<string, IfcSchema>();
const TABLES = new Map([[IFC4_SCHEMA.name, IFC4_SCHEMA]]);

const READ_THROUGH = new Map([["IFC2X3", IFC4_SCHEMA.name]]);

export const SUPPORTED_SCHEMAS: readonly string[] = [...TABLES.keys()];
export const READ_THROUGH_SCHEMAS: readonly string[] = [...READ_THROUGH.keys()];

export function isSupportedSchema(identifier: string): boolean {
    return TABLES.has(identifier.trim().toUpperCase());
}

export function readingSchemaFor(identifier: string): IfcSchema | undefined {
    const name = identifier.trim().toUpperCase();
    const through = READ_THROUGH.get(name);
    return TABLES.has(name) ? schemaNamed(name) : through === undefined ? undefined : schemaNamed(through);
}

export function schemaNamed(identifier: string): IfcSchema {
    const name = identifier.trim().toUpperCase();
    const known = loaded.get(name);
    if (known) {
        return known;
    }
    const table = TABLES.get(name);
    if (!table) {
        throw new Error(`The IFC schema ${identifier} is not supported; supported: ${SUPPORTED_SCHEMAS.join(", ")}`);
    }
    const schema = new IfcSchema(table);
    loaded.set(name, schema);
    return schema;
}
