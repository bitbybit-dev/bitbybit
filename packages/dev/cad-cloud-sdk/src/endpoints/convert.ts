// ---------------------------------------------------------------------------
// Convert endpoint — /api/v1/convert
// ---------------------------------------------------------------------------

import type { StepToGltfBody, StepToGltfAdvancedBody, StepToGltfWithDracoBody, StepToGltfAdvancedWithDracoBody, TaskCreatedResult, TaskDownload } from "../types/index.js";
import type { PollOptions } from "../polling.js";
import { pollTask } from "../polling.js";
import { unwrap } from "../unwrap.js";
import { fetchDownloads } from "../fetch-downloads.js";

type Fetcher = (method: string, path: string, body?: unknown) => Promise<Response>;

export class ConvertEndpoint {
    constructor(private readonly fetch: Fetcher) {}

    /** Convert STEP to glTF (simple mode). Returns task info. */
    async stepToGltf(body: StepToGltfBody): Promise<TaskCreatedResult> {
        return unwrap(await this.fetch("POST", "/api/v1/convert/step-to-gltf", body));
    }

    /** Convert STEP to glTF (advanced mode with full options). Returns task info. */
    async stepToGltfAdvanced(body: StepToGltfAdvancedBody): Promise<TaskCreatedResult> {
        return unwrap(await this.fetch("POST", "/api/v1/convert/step-to-gltf-advanced", body));
    }

    /**
     * Convert STEP to glTF (simple), poll until complete, return all downloads.
     */
    async stepToGltfAndPoll(
        body: StepToGltfBody,
        opts?: PollOptions,
    ): Promise<{ taskId: string; downloads: TaskDownload[] }> {
        const created = await this.stepToGltf(body);
        const task = await pollTask(this.fetch, created.taskId, opts);
        const downloads = await fetchDownloads(this.fetch, task.taskId);
        return { taskId: task.taskId, downloads };
    }

    /**
     * Convert STEP to glTF (advanced), poll until complete, return all downloads.
     */
    async stepToGltfAdvancedAndPoll(
        body: StepToGltfAdvancedBody,
        opts?: PollOptions,
    ): Promise<{ taskId: string; downloads: TaskDownload[] }> {
        const created = await this.stepToGltfAdvanced(body);
        const task = await pollTask(this.fetch, created.taskId, opts);
        const downloads = await fetchDownloads(this.fetch, task.taskId);
        return { taskId: task.taskId, downloads };
    }

    /** Convert STEP to Draco-compressed glTF (simple mode). Returns task info. */
    async stepToGltfWithDraco(body: StepToGltfWithDracoBody): Promise<TaskCreatedResult> {
        return unwrap(await this.fetch("POST", "/api/v1/convert/step-to-gltf-with-draco", body));
    }

    /** Convert STEP to Draco-compressed glTF (advanced mode with full options). Returns task info. */
    async stepToGltfAdvancedWithDraco(body: StepToGltfAdvancedWithDracoBody): Promise<TaskCreatedResult> {
        return unwrap(await this.fetch("POST", "/api/v1/convert/step-to-gltf-advanced-with-draco", body));
    }

    /**
     * Convert STEP to Draco-compressed glTF (simple), poll until complete, return all downloads.
     */
    async stepToGltfWithDracoAndPoll(
        body: StepToGltfWithDracoBody,
        opts?: PollOptions,
    ): Promise<{ taskId: string; downloads: TaskDownload[] }> {
        const created = await this.stepToGltfWithDraco(body);
        const task = await pollTask(this.fetch, created.taskId, opts);
        const downloads = await fetchDownloads(this.fetch, task.taskId);
        return { taskId: task.taskId, downloads };
    }

    /**
     * Convert STEP to Draco-compressed glTF (advanced), poll until complete, return all downloads.
     */
    async stepToGltfAdvancedWithDracoAndPoll(
        body: StepToGltfAdvancedWithDracoBody,
        opts?: PollOptions,
    ): Promise<{ taskId: string; downloads: TaskDownload[] }> {
        const created = await this.stepToGltfAdvancedWithDraco(body);
        const task = await pollTask(this.fetch, created.taskId, opts);
        const downloads = await fetchDownloads(this.fetch, task.taskId);
        return { taskId: task.taskId, downloads };
    }
}
