---
sidebar_position: 2
title: Validation
sidebar_label: Validation
description: "Client-side request validation in @bitbybit-dev/cad-cloud-sdk — catch parameter errors before they reach the API."
tags: [sdk, typescript, validation]
---

# Client-side validation

The SDK validates every request body **before** it leaves your server. This catches parameter errors instantly with clear messages — no round-trip to the API required.

Validation is **enabled by default** and covers all `POST` requests (model submissions, CAD operations, file uploads, etc.).

## How it works

When you call any SDK method that sends a request body, the SDK:

1. Looks up the JSON Schema for the target endpoint
2. Validates your data against it using a lightweight, eval-free validator
3. Throws `BitbybitValidationError` immediately if invalid — the request never reaches the network
4. Sends the request normally if valid

This works in all runtimes: Node.js, Cloudflare Workers, Deno, Bun.

## Why it matters

Although the API server always validates incoming requests, **invalid requests that reach the server may still consume compute resources** — and those resources can count toward your usage. Client-side validation prevents bad requests from hitting the server at all, which means:

- **Cost savings** — no compute time wasted on requests that would be rejected anyway
- **Faster feedback** — validation errors appear in microseconds, not after a network round-trip
- **Better developer experience** — error messages reference your local data (e.g. `#/params/height must be <= 50`) instead of a generic server response

## Catching validation errors

```ts
import { BitbybitClient, BitbybitValidationError } from "@bitbybit-dev/cad-cloud-sdk";

const client = new BitbybitClient({ apiKey: process.env.BITBYBIT_API_KEY! });

try {
    await client.models.run("dragon-cup", {
        params: { height: 999, radiusBottom: -5 }, // both out of range
        outputs: { formats: ["gltf"] },
    });
} catch (err) {
    if (err instanceof BitbybitValidationError) {
        console.error(err.message);
        // "Validation failed for DragonCupBody: #/params/height must be <= 50; ..."

        console.error(err.errors);
        // Array of detailed error objects:
        // [{ keyword: "maximum", instanceLocation: "#/params/height", error: "must be <= 50" }, ...]
    }
}
```

### Error structure

| Property | Type | Description |
|----------|------|-------------|
| `err.message` | `string` | Human-readable summary of all violations |
| `err.errors` | `OutputUnit[]` | Array of individual constraint violations |
| `err.errors[].keyword` | `string` | JSON Schema keyword that failed (`required`, `maximum`, `type`, etc.) |
| `err.errors[].instanceLocation` | `string` | JSON Pointer to the offending value (e.g. `#/params/height`) |
| `err.errors[].error` | `string` | Description of the violation |

## What gets validated

All constraints from the OpenAPI spec are enforced client-side:

| Constraint | Example |
|------------|---------|
| `required` | Missing `operation` field in execute body |
| `type` | Passing a string where a number is expected |
| `minimum` / `maximum` | Dragon Cup height must be 1–50 |
| `minLength` / `maxLength` | File ID must be at least 1 character |
| `minItems` / `maxItems` | Batch must have 1–50 items |
| `pattern` | Enum values must match allowed patterns |
| `enum` | Output format must be one of `gltf`, `step`, `brep` |
| `additionalProperties` | Rejects unknown/misspelled fields |

### Per-model schemas

Each registered model has its own schema with parameter-specific constraints. For example, `dragon-cup` enforces:
- `height`: 1–50
- `radiusBottom`: 1–30
- `outputs.formats`: at least one format required

### Generic schemas

Operations without model-specific schemas still validate against generic schemas:
- `ExecuteBody` — requires `operation` (string)
- `PipelineBody` — requires `steps` (non-empty array)
- `FileUploadBody` — requires `filename`, `contentType`, `bytes`
- `BatchModelSubmissionBody` — requires `items` (1–50) and `outputs`

## Disabling validation

Pass `validate: false` when initializing the client:

```ts
const client = new BitbybitClient({
    apiKey: process.env.BITBYBIT_API_KEY!,
    validate: false,
});
```

This is useful when:
- The API has added new endpoints/models that your SDK version doesn't have schemas for yet
- You want to skip the validation overhead in a hot path (the overhead is minimal — microseconds)
- You're proxying raw user input and prefer the server's error response format

:::tip
Even with client-side validation disabled, the API server still validates every request. Client-side validation simply gives you faster, more descriptive error messages during development.
:::

## Distinguishing validation errors from API errors

Both error types extend `Error`, but they are different classes:

```ts
import { BitbybitValidationError, BitbybitApiError } from "@bitbybit-dev/cad-cloud-sdk";

try {
    await client.cad.execute(body);
} catch (err) {
    if (err instanceof BitbybitValidationError) {
        // Request never sent — fix the input
        console.error("Invalid input:", err.message);
    } else if (err instanceof BitbybitApiError) {
        // Server returned an error
        console.error(`API error ${err.code}:`, err.message);
    }
}
```

| | `BitbybitValidationError` | `BitbybitApiError` |
|---|---|---|
| When thrown | Before request is sent | After server responds |
| Network call made? | No | Yes |
| Has `.errors` array? | Yes (constraint details) | No |
| Has `.statusCode`? | No | Yes (HTTP status) |
| Has `.code`? | No | Yes (e.g. `VALIDATION_ERROR`, `NOT_FOUND`) |
