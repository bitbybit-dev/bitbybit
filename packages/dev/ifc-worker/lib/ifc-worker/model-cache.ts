import { InputError, hashOfBytes, hashOfText } from "@bitbybit-dev/base";
import { isIfcModel } from "@bitbybit-dev/ifc";
import type * as Inputs from "@bitbybit-dev/ifc/lib/api/inputs";
import type { CachedResult } from "./handler-types";

export const MODEL_REFERENCE = "ifc-model";

const SPECIAL = "\u0000";

function keyPart(value: unknown, ancestors: Set<object>): unknown {
    if (typeof value === "number") {
        return Number.isFinite(value) && !Object.is(value, -0) ? value : { [SPECIAL]: String(Object.is(value, -0) ? "-0" : value) };
    }
    if (value === undefined) {
        return { [SPECIAL]: "undefined" };
    }
    if (value === null || typeof value !== "object") {
        return value;
    }
    if (value instanceof ArrayBuffer) {
        return { [SPECIAL]: "ArrayBuffer", digest: hashOfBytes(new Uint8Array(value)), length: value.byteLength };
    }
    if (ArrayBuffer.isView(value)) {
        return { [SPECIAL]: value.constructor.name, digest: hashOfBytes(new Uint8Array(value.buffer, value.byteOffset, value.byteLength)), length: value.byteLength };
    }
    if (ancestors.has(value)) {
        throw new InputError("The inputs of an IFC call refer to themselves");
    }
    ancestors.add(value);
    try {
        if (Array.isArray(value)) {
            return value.map((item) => keyPart(item, ancestors));
        }
        if (value instanceof Date) {
            return { [SPECIAL]: "Date", time: value.getTime() };
        }
        const record = value as Record<string, unknown>;
        return Object.fromEntries(Object.keys(record).sort().map((name) => [name, keyPart(record[name], ancestors)]));
    } finally {
        ancestors.delete(value);
    }
}

export function isModelReference(value: object): value is Inputs.IFC.IfcModelPointer {
    return "type" in value && value.type === MODEL_REFERENCE && "hash" in value && typeof value.hash === "number";
}

export class ModelCache {
    private readonly entries = new Map<number, CachedResult>();
    private freshKeys = 0;

    get size(): number {
        return this.entries.size;
    }

    keyOf(functionName: string, inputs: unknown): number {
        return hashOfText(JSON.stringify({ functionName, inputs: keyPart(inputs, new Set()) }));
    }

    freshKey(): number {
        this.freshKeys--;
        return this.freshKeys;
    }

    get(key: number): CachedResult | undefined {
        return this.entries.get(key);
    }

    store(key: number, result: unknown): CachedResult {
        const entry: CachedResult = isIfcModel(result) ? { kind: "model", model: result } : { kind: "value", value: result };
        this.entries.set(key, entry);
        return entry;
    }

    model(hash: number): unknown {
        const entry = this.entries.get(hash);
        if (!entry || entry.kind !== "model") {
            throw new Error(`The IFC model with handle ${hash} is not held by the worker; it may have been cleared, so make it again`);
        }
        return entry.model;
    }

    answer(key: number, entry: CachedResult): unknown {
        return entry.kind === "model" ? { hash: key, type: MODEL_REFERENCE } : entry.value;
    }

    clear(): void {
        this.entries.clear();
    }
}
