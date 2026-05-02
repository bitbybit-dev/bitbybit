// ---------------------------------------------------------------------------
// Tasks endpoint — /api/v1/tasks
// ---------------------------------------------------------------------------

import type {
    TaskDetail,
    TaskList,
    TaskListQuery,
    TaskResultDownload,
    TaskCreatedResult,
    ResultFormat,
    CompoundResultManifest,
    TaskDownload,
    TaskResultsDownload,
} from "../types/index.js";
import type { PollOptions } from "../polling.js";
import { pollTask } from "../polling.js";
import { unwrap } from "../unwrap.js";

type Fetcher = (method: string, path: string, body?: unknown) => Promise<Response>;

export class TasksEndpoint {
    constructor(private readonly fetch: Fetcher) {}

    /** Get the status and details of a single task. */
    async get(taskId: string): Promise<TaskDetail> {
        return unwrap(await this.fetch("GET", `/api/v1/tasks/${encodeURIComponent(taskId)}`));
    }

    /** List tasks with optional filters. */
    async list(query?: TaskListQuery): Promise<TaskList> {
        const params = new URLSearchParams();
        if (query?.page != null) params.set("page", String(query.page));
        if (query?.limit != null) params.set("limit", String(query.limit));
        if (query?.status) params.set("status", query.status);
        if (query?.kind) params.set("kind", query.kind);
        const qs = params.toString();
        return unwrap(await this.fetch("GET", `/api/v1/tasks${qs ? `?${qs}` : ""}`));
    }

    /** Get the download URL for a completed task result. */
    async getResult(taskId: string, format?: ResultFormat): Promise<TaskResultDownload> {
        const path = format
            ? `/api/v1/tasks/${encodeURIComponent(taskId)}/result/${encodeURIComponent(format)}`
            : `/api/v1/tasks/${encodeURIComponent(taskId)}/result`;
        return unwrap(await this.fetch("GET", path));
    }

    /** Get download URLs for all available result formats of a completed task. */
    async getResults(taskId: string): Promise<TaskDownload[]> {
        const res = await this.fetch(
            "GET",
            `/api/v1/tasks/${encodeURIComponent(taskId)}/results`,
        );
        const data = await unwrap<TaskResultsDownload>(res);
        return data.downloads;
    }

    /** Get the compound result manifest for a compound task. */
    async getCompoundResult(taskId: string): Promise<CompoundResultManifest> {
        return unwrap(
            await this.fetch("GET", `/api/v1/tasks/${encodeURIComponent(taskId)}/result`),
        );
    }

    /** Cancel a running or queued task. */
    async cancel(taskId: string): Promise<{ cancelled: boolean }> {
        return unwrap(await this.fetch("DELETE", `/api/v1/tasks/${encodeURIComponent(taskId)}`));
    }

    /** Retry a failed or cancelled task. Returns 202 with new task info. */
    async retry(taskId: string): Promise<TaskCreatedResult> {
        return unwrap(
            await this.fetch("POST", `/api/v1/tasks/${encodeURIComponent(taskId)}/retry`),
        );
    }

    /**
     * Poll a task until it reaches a terminal status.
     * Returns the final TaskDetail on completion; throws on failure/timeout.
     */
    async poll(taskId: string, opts?: PollOptions): Promise<TaskDetail> {
        return pollTask(this.fetch, taskId, opts);
    }

    /**
     * Poll a task and retrieve all download URLs once completed.
     */
    async pollAndDownload(
        taskId: string,
        opts?: PollOptions,
    ): Promise<{ task: TaskDetail; downloads: TaskDownload[] }> {
        const task = await pollTask(this.fetch, taskId, opts);
        const downloads = await this.getResults(task.taskId);
        return { task, downloads };
    }
}
