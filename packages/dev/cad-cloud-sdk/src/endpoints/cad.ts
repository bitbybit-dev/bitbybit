// ---------------------------------------------------------------------------
// CAD execute endpoint — /api/v1/cad
// ---------------------------------------------------------------------------

import type { ExecuteBody, PipelineBody, CompoundExecuteBody, TaskCreatedResult, CompoundTaskCreatedResult, TaskDownload } from "../types/index.js";
import type { PollOptions } from "../polling.js";
import { pollTask } from "../polling.js";
import { unwrap } from "../unwrap.js";
import { fetchDownloads } from "../fetch-downloads.js";

type Fetcher = (method: string, path: string, body?: unknown) => Promise<Response>;

export class CadEndpoint {
    constructor(private readonly fetch: Fetcher) {}

    /** Submit a single CAD operation. Returns immediately with task info. */
    async execute(body: ExecuteBody): Promise<TaskCreatedResult> {
        return unwrap(await this.fetch("POST", "/api/v1/cad/execute", body));
    }

    /** Submit a CAD pipeline (sequential steps with $ref references). */
    async pipeline(body: PipelineBody): Promise<TaskCreatedResult> {
        return unwrap(await this.fetch("POST", "/api/v1/cad/pipeline", body));
    }

    /** Submit a compound (parallel) CAD execution. */
    async compound(body: CompoundExecuteBody): Promise<CompoundTaskCreatedResult> {
        return unwrap(await this.fetch("POST", "/api/v1/cad/compound", body));
    }

    /**
     * Execute a single CAD operation, poll until complete, and return all downloads.
     */
    async executeAndPoll(
        body: ExecuteBody,
        opts?: PollOptions,
    ): Promise<{ taskId: string; downloads: TaskDownload[] }> {
        const created = await this.execute(body);
        const task = await pollTask(this.fetch, created.taskId, opts);
        const downloads = await fetchDownloads(this.fetch, task.taskId);
        return { taskId: task.taskId, downloads };
    }

    /**
     * Submit a pipeline, poll until complete, and return all downloads.
     */
    async pipelineAndPoll(
        body: PipelineBody,
        opts?: PollOptions,
    ): Promise<{ taskId: string; downloads: TaskDownload[] }> {
        const created = await this.pipeline(body);
        const task = await pollTask(this.fetch, created.taskId, opts);
        const downloads = await fetchDownloads(this.fetch, task.taskId);
        return { taskId: task.taskId, downloads };
    }
}
