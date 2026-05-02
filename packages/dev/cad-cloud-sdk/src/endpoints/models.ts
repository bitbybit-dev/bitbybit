// ---------------------------------------------------------------------------
// Models endpoint — /api/v1/models
// ---------------------------------------------------------------------------

import type {
    ModelList,
    ModelDefinition,
    ModelBatchDefinitions,
    ModelSubmission,
    BatchModelSubmission,
    ModelParamMap,
    OutputOptions,
    TaskCreatedResult,
    CompoundTaskCreatedResult,
    CompoundTaskDetail,
    SubTaskSummary,
    TaskDownload,
} from "../types/index.js";
import type { PollOptions } from "../polling.js";
import { pollTask } from "../polling.js";
import { unwrap } from "../unwrap.js";
import { fetchDownloads } from "../fetch-downloads.js";

type Fetcher = (method: string, path: string, body?: unknown) => Promise<Response>;

export class ModelsEndpoint {
    constructor(private readonly fetch: Fetcher) {}

    /** List all registered parametric model names. */
    async list(): Promise<ModelList> {
        return unwrap(await this.fetch("GET", "/api/v1/models"));
    }

    /** Get parameter definitions for a single model. */
    async getParams(modelName: string): Promise<ModelDefinition> {
        return unwrap(await this.fetch("GET", `/api/v1/models/${encodeURIComponent(modelName)}/params`));
    }

    /** Batch-fetch parameter definitions for multiple models. */
    async getDefinitions(names: string[]): Promise<ModelBatchDefinitions> {
        return unwrap(await this.fetch("POST", "/api/v1/models/definitions", { names }));
    }

    /**
     * Submit a model for generation. Returns immediately with task info.
     * Use `runAndPoll` for a higher-level API that waits for the result.
     */
    async submit<K extends string>(
        modelName: K,
        body: K extends keyof ModelParamMap
            ? ModelSubmission<ModelParamMap[K]>
            : ModelSubmission,
    ): Promise<TaskCreatedResult> {
        const res = await this.fetch("POST", `/api/v1/models/${encodeURIComponent(modelName)}`, body);
        return unwrap(res);
    }

    /**
     * Submit a model, poll until complete, and return download URLs for all requested formats.
     * Metadata is always included when available.
     *
     * This is the main high-level API for generating a model and getting results.
     */
    async run<K extends string>(
        modelName: K,
        body: K extends keyof ModelParamMap
            ? { params?: ModelParamMap[K]; outputs: OutputOptions }
            : ModelSubmission,
        opts?: PollOptions,
    ): Promise<{ taskId: string; downloads: TaskDownload[] }> {
        const res = await this.fetch("POST", `/api/v1/models/${encodeURIComponent(modelName)}`, body);
        const created = await unwrap<TaskCreatedResult>(res);
        const task = await pollTask(this.fetch, created.taskId, opts);

        const downloads = await fetchDownloads(this.fetch, task.taskId);
        return { taskId: task.taskId, downloads };
    }

    /**
     * Submit a batch of model variations for parallel generation.
     * Returns immediately with compound task info and sub-task IDs.
     */
    async batchSubmit<K extends string>(
        modelName: K,
        body: K extends keyof ModelParamMap
            ? BatchModelSubmission<ModelParamMap[K]>
            : BatchModelSubmission,
    ): Promise<CompoundTaskCreatedResult> {
        const res = await this.fetch(
            "POST",
            `/api/v1/models/${encodeURIComponent(modelName)}/batch`,
            body,
        );
        return unwrap(res);
    }

    /**
     * Submit a batch, poll the compound task until all sub-tasks finish,
     * and return download URLs for each sub-task (all requested formats + metadata).
     */
    async batchRun<K extends string>(
        modelName: K,
        body: K extends keyof ModelParamMap
            ? BatchModelSubmission<ModelParamMap[K]>
            : BatchModelSubmission,
        opts?: PollOptions,
    ): Promise<{
        taskId: string;
        subTasks: readonly { taskId: string; index: number; downloads: TaskDownload[] }[];
    }> {
        const res = await this.fetch(
            "POST",
            `/api/v1/models/${encodeURIComponent(modelName)}/batch`,
            body,
        );
        const compound = await unwrap<CompoundTaskCreatedResult>(res);
        const task = await pollTask(this.fetch, compound.taskId, opts) as CompoundTaskDetail;

        const subTasks = await Promise.all(
            (task.subTasks ?? compound.subTasks).map(async (sub: SubTaskSummary) => {
                if (sub.status !== "completed") {
                    return { taskId: sub.taskId, index: sub.index, downloads: [] as TaskDownload[] };
                }
                try {
                    const downloads = await fetchDownloads(this.fetch, sub.taskId);
                    return { taskId: sub.taskId, index: sub.index, downloads };
                } catch {
                    return { taskId: sub.taskId, index: sub.index, downloads: [] as TaskDownload[] };
                }
            }),
        );

        return { taskId: compound.taskId, subTasks };
    }
}
