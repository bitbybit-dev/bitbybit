// ---------------------------------------------------------------------------
// SDK-only types — hand-written, NOT auto-generated.
// These types use generics, extends, aliases, or unions that can't be
// expressed in OpenAPI and therefore can't be derived from generated.ts.
// ---------------------------------------------------------------------------

import type {
    OutputOptions,
    TaskDetail,
    SubTaskSummary,
} from "./schema-exports.js";

// ---------------------------------------------------------------------------
// Generic envelope types
// ---------------------------------------------------------------------------

/** Generic success envelope with typed data. */
export interface ApiSuccess<T = unknown> {
    readonly ok: true;
    readonly data: T;
}

/** Generic error envelope. */
export interface ApiError {
    readonly ok: false;
    readonly error: {
        readonly code: string;
        readonly message: string;
        readonly details?: unknown;
        readonly requestId?: string;
    };
}

/** Discriminated union of success / error. */
export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ---------------------------------------------------------------------------
// Generic request types (typed params for intellisense)
// ---------------------------------------------------------------------------

/** Model submission with typed params. */
export interface ModelSubmission<TParams = Record<string, unknown>> {
    readonly params?: TParams;
    readonly outputs: OutputOptions;
}

/** Batch model submission (multiple param sets, one output config). */
export interface BatchModelSubmission<TParams = Record<string, unknown>> {
    readonly items: readonly { readonly params?: TParams }[];
    readonly outputs: OutputOptions;
}

// ---------------------------------------------------------------------------
// Composite / extended types
// ---------------------------------------------------------------------------

/** Compound task detail (extends TaskDetail with sub-tasks). */
export interface CompoundTaskDetail extends TaskDetail {
    readonly subTasks: readonly SubTaskSummary[];
}

/** Available download result formats (not an enum in the spec). */
export type ResultFormat = "glb" | "step" | "stpz" | "metadata" | "decomposed-mesh";
