import type { IfcBinaryValue, IfcDerivedValue, IfcEnumerationValue, IfcReference, IfcTypedValue, IfcValue } from "./step-types";

export const DERIVED: IfcDerivedValue = Object.freeze({ derived: true });

export function ref(id: number): IfcReference {
    return { ref: id };
}

export function enumValue(value: string): IfcEnumerationValue {
    return { enum: value.toUpperCase() };
}

export function typed(type: string, value: IfcValue): IfcTypedValue {
    return { type, value };
}

function isRecord(value: IfcValue | undefined): value is Exclude<IfcValue, null | boolean | number | string | readonly IfcValue[]> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isReference(value: IfcValue | undefined): value is IfcReference {
    return isRecord(value) && "ref" in value;
}

export function isEnumeration(value: IfcValue | undefined): value is IfcEnumerationValue {
    return isRecord(value) && "enum" in value;
}

export function isTyped(value: IfcValue | undefined): value is IfcTypedValue {
    return isRecord(value) && "type" in value && "value" in value;
}

export function isBinary(value: IfcValue | undefined): value is IfcBinaryValue {
    return isRecord(value) && "binary" in value;
}

export function isDerived(value: IfcValue | undefined): value is IfcDerivedValue {
    return isRecord(value) && "derived" in value;
}

export function isList(value: IfcValue | undefined): value is readonly IfcValue[] {
    return Array.isArray(value);
}

export function textValue(value: IfcValue | undefined): string | undefined {
    if (typeof value === "string") {
        return value;
    }
    return isTyped(value) && typeof value.value === "string" ? value.value : undefined;
}

export function referencesIn(value: IfcValue, into: number[] = []): number[] {
    if (isReference(value)) {
        into.push(value.ref);
    } else if (isList(value)) {
        for (const item of value) {
            referencesIn(item, into);
        }
    } else if (isTyped(value)) {
        referencesIn(value.value, into);
    }
    return into;
}
