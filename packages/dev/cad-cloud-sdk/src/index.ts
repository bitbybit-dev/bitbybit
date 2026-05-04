// ---------------------------------------------------------------------------
// @bitbybit-dev/cad-cloud-sdk — public API
// ---------------------------------------------------------------------------

// Client
export { BitbybitClient } from "./client.js";
export type { BitbybitClientOptions } from "./client.js";

// Errors
export { BitbybitApiError } from "./errors.js";
export { BitbybitValidationError } from "./validation/index.js";

// Utilities
export { unwrap } from "./unwrap.js";

// Polling
export type { PollOptions } from "./polling.js";

// Endpoint classes (for advanced typing / extension)
export { ModelsEndpoint } from "./endpoints/models.js";
export { TasksEndpoint } from "./endpoints/tasks.js";
export { CadEndpoint } from "./endpoints/cad.js";
export { ConvertEndpoint } from "./endpoints/convert.js";
export { FilesEndpoint } from "./endpoints/files.js";

// Pipeline builder helper
export { step } from "./types/pipeline-operations.js";

// All types (re-exported from schema-exports + custom + pipeline-operations)
export type * from "./types/index.js";
