import { Validator } from "@cfworker/json-schema";
import type { OutputUnit, Schema } from "@cfworker/json-schema";
import { schemaBundle } from "./request-schemas.js";

/** Structured validation error thrown before a request is sent. */
export class BitbybitValidationError extends Error {
    readonly errors: OutputUnit[];

    constructor(schemaName: string, errors: OutputUnit[]) {
        const details = errors
            .map((e) => `${e.instanceLocation} ${e.error}`)
            .join("; ");
        super(`Validation failed for ${schemaName}: ${details}`);
        this.name = "BitbybitValidationError";
        this.errors = errors;
    }
}

const validators = new Map<string, Validator>();

function getValidator(schemaName: string): Validator | undefined {
    const cached = validators.get(schemaName);
    if (cached) return cached;

    const def = (schemaBundle.$defs as unknown as Record<string, Schema>)[schemaName];
    if (!def) return undefined;

    const rootSchema: Schema = {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        $ref: `#/$defs/${schemaName}`,
        $defs: schemaBundle.$defs,
    };

    const validator = new Validator(rootSchema, "2020-12", false);
    validators.set(schemaName, validator);
    return validator;
}

/**
 * Validate `data` against the JSON Schema for `schemaName`.
 * Throws `BitbybitValidationError` if invalid.
 */
export function validateRequestBody(schemaName: string, data: unknown): void {
    const validator = getValidator(schemaName);
    if (!validator) {
        return;
    }
    const result = validator.validate(data);
    if (!result.valid) {
        throw new BitbybitValidationError(schemaName, result.errors);
    }
}

/**
 * Look up the schema name for a given endpoint key.
 * Returns undefined if not mapped.
 */
export function getEndpointSchema(endpointKey: string): string | undefined {
    return (schemaBundle.endpoints as Record<string, string>)[endpointKey];
}
