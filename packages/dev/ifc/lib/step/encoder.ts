import { GLOBAL_ID_PATTERN, GLOBAL_ID_TYPE } from "../schema/constants";
import type { IfcSchema } from "../schema/schema";
import { SIMPLE_TYPES } from "../schema/schema";
import type { IfcAggregateSpec, IfcEntityInfo, IfcTypeSpec } from "../schema/schema-types";
import { IfcValueError, ValueProblem } from "./errors";
import { formatInteger, formatReal } from "./numbers";
import type { IfcEntity, IfcTypedValue, IfcValue } from "./step-types";
import { encodeString } from "./strings";
import { DERIVED, isBinary, isDerived, isEnumeration, isList, isReference, isTyped } from "./values";

const BINARY_DIGITS = /^[0-3][0-9A-Fa-f]*$/;

function describe(value: IfcValue): string {
    if (value === null) {
        return "nothing";
    }
    if (isDerived(value)) {
        return "the derived marker";
    }
    if (isList(value)) {
        return "a list";
    }
    if (isReference(value)) {
        return `a reference to #${value.ref}`;
    }
    if (isEnumeration(value)) {
        return `the enumeration value ${value.enum}`;
    }
    if (isTyped(value)) {
        return `a typed ${value.type}`;
    }
    if (typeof value === "string") {
        return "a text";
    }
    return typeof value === "number" || typeof value === "boolean" ? `${typeof value} ${value}` : "an unknown value";
}

function within(error: unknown, segment: string): unknown {
    return error instanceof ValueProblem ? error.within(segment) : error;
}

function checkSimple(spec: string, value: IfcValue): void {
    switch (spec) {
        case "REAL":
            if (typeof value !== "number" || !Number.isFinite(value)) {
                throw new ValueProblem(`expected a finite real number, got ${describe(value)}`);
            }
            return;
        case "INTEGER":
            if (typeof value !== "number" || !Number.isSafeInteger(value)) {
                throw new ValueProblem(`expected a whole number, got ${describe(value)}`);
            }
            return;
        case "NUMBER":
            if (typeof value !== "number" || !Number.isFinite(value)) {
                throw new ValueProblem(`expected a finite number, got ${describe(value)}`);
            }
            return;
        case "STRING":
            if (typeof value !== "string") {
                throw new ValueProblem(`expected a text, got ${describe(value)}`);
            }
            return;
        case "BOOLEAN":
            if (typeof value !== "boolean") {
                throw new ValueProblem(`expected true or false, got ${describe(value)}`);
            }
            return;
        case "LOGICAL":
            if (typeof value !== "boolean" && !(isEnumeration(value) && value.enum === "U")) {
                throw new ValueProblem(`expected true, false or unknown, got ${describe(value)}`);
            }
            return;
        default:
            if (!isBinary(value)) {
                throw new ValueProblem(`expected a binary value, got ${describe(value)}`);
            }
            if (!BINARY_DIGITS.test(value.binary)) {
                throw new ValueProblem("a binary value is a digit from 0 to 3 followed by hexadecimal digits");
            }
    }
}

function formatSimple(spec: string, value: IfcValue): string {
    checkSimple(spec, value);
    if (typeof value === "number") {
        return spec === "REAL" || (spec === "NUMBER" && !Number.isSafeInteger(value)) ? formatReal(value) : formatInteger(value);
    }
    if (typeof value === "string") {
        return encodeString(value);
    }
    if (typeof value === "boolean") {
        return value ? ".T." : ".F.";
    }
    return isBinary(value) ? `"${value.binary.toUpperCase()}"` : ".U.";
}

function checkBounds(spec: IfcAggregateSpec, value: readonly IfcValue[]): void {
    const [kind, lower, upper] = spec;
    if (kind === "ARRAY" && upper !== null) {
        if (value.length !== upper - lower + 1) {
            throw new ValueProblem(`an ARRAY [${lower}:${upper}] holds exactly ${upper - lower + 1} values, got ${value.length}`);
        }
    } else if (value.length < lower || (upper !== null && value.length > upper)) {
        throw new ValueProblem(`a ${kind} of ${lower} to ${upper ?? "any number of"} values, got ${value.length}`);
    }
}

export class IfcEncoder {
    private readonly schema: IfcSchema;

    constructor(schema: IfcSchema) {
        this.schema = schema;
    }

    normalizeArguments(type: string, args: readonly IfcValue[], path: string): IfcValue[] {
        const info = this.writable(type, args.length, path);
        return info.attributes.map((_, index) => this.normalizeAttribute(info, index, args[index]!, path));
    }

    normalizeAttribute(info: IfcEntityInfo, index: number, value: IfcValue, path: string): IfcValue {
        const attribute = info.attributes[index]!;
        try {
            if (attribute.derived) {
                if (value !== null && !isDerived(value)) {
                    throw new ValueProblem("the attribute is derived and takes no value");
                }
                return DERIVED;
            }
            if (value === null) {
                if (!attribute.optional) {
                    throw new ValueProblem("the attribute is required");
                }
                return null;
            }
            return this.normalize(attribute.type, value);
        } catch (error) {
            throw this.located(error, path, info, index);
        }
    }

    encodeEntity(entity: IfcEntity): string {
        const path = `#${entity.id}`;
        const info = this.writable(entity.type, entity.args.length, path);
        const parts = info.attributes.map((attribute, index) => {
            const value = entity.args[index]!;
            try {
                if (attribute.derived) {
                    if (value !== null && !isDerived(value)) {
                        throw new ValueProblem("the attribute is derived and takes no value");
                    }
                    return "*";
                }
                if (value === null) {
                    if (!attribute.optional) {
                        throw new ValueProblem("the attribute is required");
                    }
                    return "$";
                }
                return this.format(attribute.type, value);
            } catch (error) {
                throw this.located(error, path, info, index);
            }
        });
        return `#${entity.id}=${info.name.toUpperCase()}(${parts.join(",")});`;
    }

    encodeValue(spec: IfcTypeSpec, value: IfcValue, path: string): string {
        try {
            return this.format(spec, value);
        } catch (error) {
            if (error instanceof ValueProblem) {
                throw new IfcValueError(`${path}${error.segments.join("")}`, error.message);
            }
            throw error;
        }
    }

    private writable(type: string, count: number, path: string): IfcEntityInfo {
        const info = this.schema.entity(type);
        if (info.abstract) {
            throw new IfcValueError(path, `${info.name} is abstract and cannot be written`);
        }
        if (count !== info.attributes.length) {
            throw new IfcValueError(path, `${info.name} has ${info.attributes.length} attributes, got ${count} values`);
        }
        return info;
    }

    private located(error: unknown, path: string, info: IfcEntityInfo, index: number): unknown {
        if (!(error instanceof ValueProblem)) {
            return error;
        }
        return new IfcValueError(`${path} ${info.name}.${info.attributes[index]!.name}${error.segments.join("")}`, error.message);
    }

    private enumMember(spec: string, members: readonly string[], value: IfcValue): string {
        const member = typeof value === "string" ? value.toUpperCase() : isEnumeration(value) ? value.enum : undefined;
        if (member === undefined || !members.includes(member)) {
            throw new ValueProblem(`expected one of ${members.join(", ")} for ${spec}, got ${describe(value)}`);
        }
        return member;
    }

    private selected(select: string, value: IfcValue): IfcTypedValue | undefined {
        const contents = this.schema.selectContents(select);
        if (isReference(value)) {
            if (!contents.entities.length) {
                throw new ValueProblem(`${select} takes typed values, not references`);
            }
            return undefined;
        }
        if (!isTyped(value)) {
            throw new ValueProblem(`${select} needs a typed value or a reference, got ${describe(value)}`);
        }
        const typeName = this.schema.typeName(value.type);
        if (typeName === undefined || !contents.valueTypes.has(typeName)) {
            throw new ValueProblem(`${value.type} is not one of the types ${select} accepts`);
        }
        return { type: typeName, value: value.value };
    }

    private definedValue(spec: string, value: IfcValue): IfcValue {
        if (!isTyped(value)) {
            return value;
        }
        if (this.schema.typeName(value.type) !== this.schema.typeName(spec)) {
            throw new ValueProblem(`expected ${spec}, got a typed ${value.type}`);
        }
        return value.value;
    }

    private checkGlobalId(spec: string, value: IfcValue): void {
        if (spec === GLOBAL_ID_TYPE && (typeof value !== "string" || !GLOBAL_ID_PATTERN.test(value))) {
            throw new ValueProblem("a GlobalId is 22 characters of 0-9, A-Z, a-z, _ and $, the first from 0 to 3");
        }
    }

    private normalize(spec: IfcTypeSpec, value: IfcValue): IfcValue {
        if (value === null || isDerived(value)) {
            throw new ValueProblem(`expected a value, got ${describe(value)}`);
        }
        if (typeof spec !== "string") {
            return this.normalizeList(spec, value);
        }
        if (SIMPLE_TYPES.has(spec)) {
            checkSimple(spec, value);
            return value;
        }
        if (this.schema.hasEntity(spec)) {
            if (!isReference(value)) {
                throw new ValueProblem(`expected a reference to an ${spec}, got ${describe(value)}`);
            }
            return value;
        }
        const type = this.schema.type(spec)!;
        if ("e" in type) {
            return { enum: this.enumMember(spec, type.e, value) };
        }
        if ("s" in type) {
            const chosen = this.selected(spec, value);
            return chosen === undefined ? value : { type: chosen.type, value: this.normalize(chosen.type, chosen.value) };
        }
        const inner = this.definedValue(spec, value);
        this.checkGlobalId(this.schema.typeName(spec)!, inner);
        return this.normalize(type.t, inner);
    }

    private normalizeList(spec: IfcAggregateSpec, value: IfcValue): IfcValue[] {
        if (!isList(value)) {
            throw new ValueProblem(`expected a list, got ${describe(value)}`);
        }
        checkBounds(spec, value);
        const member = spec[3];
        const items = value.map((item, index) => {
            try {
                return this.normalize(member, item);
            } catch (error) {
                throw within(error, `[${index}]`);
            }
        });
        if (spec[0] === "SET") {
            this.format(spec, items);
        }
        return items;
    }

    private format(spec: IfcTypeSpec, value: IfcValue): string {
        if (value === null || isDerived(value)) {
            throw new ValueProblem(`expected a value, got ${describe(value)}`);
        }
        if (typeof spec !== "string") {
            if (!isList(value)) {
                throw new ValueProblem(`expected a list, got ${describe(value)}`);
            }
            checkBounds(spec, value);
            const parts = value.map((item, index) => {
                try {
                    return this.format(spec[3], item);
                } catch (error) {
                    throw within(error, `[${index}]`);
                }
            });
            if (spec[0] === "SET" && new Set(parts).size !== parts.length) {
                throw new ValueProblem("a SET holds each value once, and this one repeats a value");
            }
            return `(${parts.join(",")})`;
        }
        if (SIMPLE_TYPES.has(spec)) {
            return formatSimple(spec, value);
        }
        if (this.schema.hasEntity(spec)) {
            if (!isReference(value)) {
                throw new ValueProblem(`expected a reference to an ${spec}, got ${describe(value)}`);
            }
            return `#${value.ref}`;
        }
        const type = this.schema.type(spec);
        if (!type) {
            throw new ValueProblem(`the schema has no type ${spec}`);
        }
        if ("e" in type) {
            return `.${this.enumMember(spec, type.e, value)}.`;
        }
        if ("s" in type) {
            const chosen = this.selected(spec, value);
            return chosen === undefined ? this.format(this.schema.selectContents(spec).entities[0]!, value) : `${chosen.type.toUpperCase()}(${this.format(chosen.type, chosen.value)})`;
        }
        return this.format(type.t, this.definedValue(spec, value));
    }
}

const encoders = new WeakMap<IfcSchema, IfcEncoder>();

export function encoderFor(schema: IfcSchema): IfcEncoder {
    let encoder = encoders.get(schema);
    if (!encoder) {
        encoder = new IfcEncoder(schema);
        encoders.set(schema, encoder);
    }
    return encoder;
}
