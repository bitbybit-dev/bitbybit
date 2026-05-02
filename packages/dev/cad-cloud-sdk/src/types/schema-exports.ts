// ---------------------------------------------------------------------------
// AUTO-GENERATED — do not edit manually.
// ---------------------------------------------------------------------------

import type { components, paths } from "./generated.js";

// ---------------------------------------------------------------------------
// Schema re-exports (1:1 from OpenAPI component schemas, names unchanged)
// ---------------------------------------------------------------------------

/** Submit multiple parameter variations of the same model for parallel generation */
export type BatchModelSubmissionBody = components["schemas"]["BatchModelSubmissionBody"];
/** Success envelope wrapping a Bitbybit CAD operation result */
export type CadOperationResponse = components["schemas"]["CadOperationResponse"];
/** Operation-specific result data. Shape varies by the CAD algorithm executed (OCCT, Manifold, JSCAD, or vector/math operations). */
export type CadResultData = components["schemas"]["CadResultData"];
/** Confirmation that a task was successfully cancelled */
export type CancelResult = components["schemas"]["CancelResult"];
/** Success response for task cancellation */
export type CancelTaskResponse = components["schemas"]["CancelTaskResponse"];
/** Execute multiple independent Bitbybit CAD operations in parallel. Each item runs as a separate sub-task and can be polled individually. */
export type CompoundExecuteBody = components["schemas"]["CompoundExecuteBody"];
/** A single operation within a compound (parallel) task. Each item runs independently. */
export type CompoundItem = components["schemas"]["CompoundItem"];
/** Status/result info for one sub-task in a compound manifest */
export type CompoundResultEntry = components["schemas"]["CompoundResultEntry"];
/** Result manifest for a completed compound task */
export type CompoundResultManifest = components["schemas"]["CompoundResultManifest"];
/** Success envelope containing the compound task result manifest with per-sub-task download links */
export type CompoundResultManifestResponse = components["schemas"]["CompoundResultManifestResponse"];
/** HTTP 202 response when a compound (parallel) task is accepted */
export type CompoundTaskAcceptedResponse = components["schemas"]["CompoundTaskAcceptedResponse"];
/** Returned when a compound (parallel) task is accepted. Contains initial status for all sub-tasks. */
export type CompoundTaskCreatedResult = components["schemas"]["CompoundTaskCreatedResult"];
/** Success envelope confirming a file upload was verified */
export type ConfirmResponse = components["schemas"]["ConfirmResponse"];
/** Returned after a file upload is verified. The file is now ready to be used in CAD operations. */
export type ConfirmResult = components["schemas"]["ConfirmResult"];
/** Fine-grained options controlling STEP → glTF conversion: tessellation quality, attribute extraction, coordinate systems, and output format. */
export type ConvertAdvancedOptions = components["schemas"]["ConvertAdvancedOptions"];
/** Fetch parameter definitions for one or more parametric models. Returns available parameters, types, defaults, and constraints. */
export type DefinitionsBody = components["schemas"]["DefinitionsBody"];
/** Success response for file deletion */
export type DeleteFileResponse = components["schemas"]["DeleteFileResponse"];
/** Confirmation that a resource was successfully deleted */
export type DeleteResult = components["schemas"]["DeleteResult"];
/** Request body for the Dragon Cup model */
export type DragonCupBody = components["schemas"]["DragonCupBody"];
/** Dragon Cup model parameters — all optional, sane defaults apply */
export type DragonCupParams = components["schemas"]["DragonCupParams"];
/** Structured error information with machine-readable code and optional debugging context */
export type ErrorDetail = components["schemas"]["ErrorDetail"];
/** Standard error envelope */
export type ErrorResponse = components["schemas"]["ErrorResponse"];
/** Execute a single Bitbybit CAD operation. The operation runs asynchronously and returns a task ID for polling. */
export type ExecuteBody = components["schemas"]["ExecuteBody"];
/** Full metadata for an uploaded file */
export type FileDetail = components["schemas"]["FileDetail"];
/** Success envelope containing a single file's metadata */
export type FileDetailResponse = components["schemas"]["FileDetailResponse"];
/** Paginated list of uploaded files with total count */
export type FileList = components["schemas"]["FileList"];
/** Success envelope containing a paginated file list */
export type FileListResponse = components["schemas"]["FileListResponse"];
/** File lifecycle state: 'pending' (upload URL issued, awaiting PUT), 'confirmed' (upload verified and file is usable), 'expired' (upload URL expired before completion) */
export type FileStatus = components["schemas"]["FileStatus"];
/** Request a pre-signed upload URL. After receiving the URL, PUT the raw file bytes to it within the expiration window. */
export type FileUploadBody = components["schemas"]["FileUploadBody"];
/** How node/mesh names are derived from STEP product/instance labels */
export type GltfNameFormat = components["schemas"]["GltfNameFormat"];
/** Transform representation in glTF output */
export type GltfTransformFormat = components["schemas"]["GltfTransformFormat"];
/** Success envelope for health check */
export type HealthResponse = components["schemas"]["HealthResponse"];
/** API health check result indicating overall system status */
export type HealthStatus = components["schemas"]["HealthStatus"];
/** Mesh angular deflection in radians. Range: [0.01, π] */
export type MeshAngle = components["schemas"]["MeshAngle"];
/** Mesh tessellation precision (lower = finer). Range: [0.005, 10] */
export type MeshPrecision = components["schemas"]["MeshPrecision"];
/** Definitions for multiple models in a single response */
export type ModelBatchDefinitions = components["schemas"]["ModelBatchDefinitions"];
/** Success envelope containing multiple model definitions */
export type ModelBatchDefinitionsResponse = components["schemas"]["ModelBatchDefinitionsResponse"];
/** Full definition of a parametric model including all parameters and their constraints */
export type ModelDefinition = components["schemas"]["ModelDefinition"];
/** Success envelope containing a single model's definition */
export type ModelDefinitionResponse = components["schemas"]["ModelDefinitionResponse"];
/** List of all available parametric models */
export type ModelList = components["schemas"]["ModelList"];
/** Success envelope containing the list of available models */
export type ModelListResponse = components["schemas"]["ModelListResponse"];
/** Data type of a model parameter: 'number' (float), 'integer' (whole number), 'boolean' (true/false), 'array' (list of values) */
export type ModelParamApiType = components["schemas"]["ModelParamApiType"];
/** Schema definition for a single model parameter */
export type ModelParamDefinition = components["schemas"]["ModelParamDefinition"];
/** Submit a parametric model for generation with specified parameters and output formats */
export type ModelSubmissionBody = components["schemas"]["ModelSubmissionBody"];
/** Output file format: 'step' (raw STEP), 'stpz' (gzip-compressed STEP), 'decomposed-mesh' (triangulated JSON), 'gltf' (glTF 2.0 binary .glb). Note: 'step' and 'stpz' are mutually exclusive — choose one or the other, not both. */
export type OutputFormat = components["schemas"]["OutputFormat"];
/** Controls which output formats are generated and their quality settings */
export type OutputOptions = components["schemas"]["OutputOptions"];
/** Request body for the Phone Nest model */
export type PhoneNestBody = components["schemas"]["PhoneNestBody"];
/** Phone Nest model parameters — all optional, sane defaults apply */
export type PhoneNestParams = components["schemas"]["PhoneNestParams"];
/** Execute a chain of Bitbybit CAD operations sequentially. Each step can reference earlier step outputs via '$ref:N'. The final step's output is stored as the task result. */
export type PipelineBody = components["schemas"]["PipelineBody"];
/** A single step in a sequential CAD pipeline. Steps can reference outputs of earlier steps via $ref. */
export type PipelineStep = components["schemas"]["PipelineStep"];
/** 3D point as [x, y, z] tuple, each coordinate in [-1000, 1000] */
export type Point3 = components["schemas"]["Point3"];
/** Uniform scale factor. Range: [1e-6, 1000] */
export type PositiveScale = components["schemas"]["PositiveScale"];
/** Metadata about a single downloadable result part */
export type ResultPartMeta = components["schemas"]["ResultPartMeta"];
/** Convert a STEP file to glTF with full control over tessellation, naming, coordinate systems, and output format. */
export type StepToGltfAdvancedBody = components["schemas"]["StepToGltfAdvancedBody"];
/** Convert a STEP file to glTF format with default settings. Upload the STEP file first, then pass its ID here. */
export type StepToGltfBody = components["schemas"]["StepToGltfBody"];
/** Status summary for one sub-task within a compound (parallel) task */
export type SubTaskSummary = components["schemas"]["SubTaskSummary"];
/** HTTP 202 response when a task is accepted for async processing */
export type TaskAcceptedResponse = components["schemas"]["TaskAcceptedResponse"];
/** Returned when a CAD task is accepted. Poll the statusUrl to track progress. */
export type TaskCreatedResult = components["schemas"]["TaskCreatedResult"];
/** Complete task status including lifecycle timestamps, progress, and result metadata */
export type TaskDetail = components["schemas"]["TaskDetail"];
/** Success envelope containing a single task's full details */
export type TaskDetailResponse = components["schemas"]["TaskDetailResponse"];
/** Type of work: 'cad' (single operation), 'model' (parametric model), 'convert-simple'/'convert-advanced' (file conversion), 'pipeline' (sequential chain), 'compound' (parallel batch), 'tenant' (tenant-scoped) */
export type TaskKind = components["schemas"]["TaskKind"];
/** Paginated list of tasks with total count */
export type TaskList = components["schemas"]["TaskList"];
/** Success envelope containing a paginated task list */
export type TaskListResponse = components["schemas"]["TaskListResponse"];
/** Result download link for standard tasks, or a compound manifest with per-sub-task download links */
export type TaskOrCompoundResultResponse = components["schemas"]["TaskOrCompoundResultResponse"];
/** Download information for a completed task result */
export type TaskResultDownload = components["schemas"]["TaskResultDownload"];
/** Success envelope containing a download link for a task result */
export type TaskResultResponse = components["schemas"]["TaskResultResponse"];
/** Download information for all available result formats of a completed task */
export type TaskResultsDownload = components["schemas"]["TaskResultsDownload"];
/** Success envelope containing download links for all result formats */
export type TaskResultsResponse = components["schemas"]["TaskResultsResponse"];
/** Task lifecycle state: waiting (pending dependencies), queued (in queue), processing (actively computing), completed (result available), failed (error occurred), cancelled (user-cancelled), expired (result TTL exceeded) */
export type TaskStatus = components["schemas"]["TaskStatus"];
/** Success envelope containing the pre-signed upload URL and file metadata */
export type UploadResponse = components["schemas"]["UploadResponse"];
/** Response after requesting a file upload. Contains the pre-signed URL to PUT your file to. */
export type UploadResult = components["schemas"]["UploadResult"];

// ---------------------------------------------------------------------------
// Path-derived query parameter types
// ---------------------------------------------------------------------------

/** Query parameters for listing tasks (pagination, status filter, kind filter) */
export type TaskListQuery = NonNullable<paths["/api/v1/tasks"]["get"]["parameters"]["query"]>;
/** Query parameters for listing files (pagination, status filter) */
export type FileListQuery = NonNullable<paths["/api/v1/files"]["get"]["parameters"]["query"]>;

// ---------------------------------------------------------------------------
// Derived convenience types
// ---------------------------------------------------------------------------

/** A single download entry (element of TaskResultsDownload.downloads). */
export type TaskDownload = TaskResultsDownload["downloads"][number];

/** Maps known model slugs to their typed param interfaces for intellisense. */
export interface ModelParamMap {
    "dragon-cup": DragonCupParams;
    "phone-nest": PhoneNestParams;
}
