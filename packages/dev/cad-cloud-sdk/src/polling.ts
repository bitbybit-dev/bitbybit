// ---------------------------------------------------------------------------
// Task polling — automatically waits for an async task to complete
// ---------------------------------------------------------------------------

import type { TaskDetail, ApiResponse } from "./types/index.js";
import { BitbybitApiError } from "./errors.js";

export interface PollOptions {
    /** Milliseconds between status checks. Default: 2 000. */
    intervalMs?: number;
    /** Maximum number of poll attempts before giving up. Default: 120 (≈ 4 min at 2 s). */
    maxAttempts?: number;
    /** Called after every status check so callers can report progress. */
    onProgress?: (task: TaskDetail) => void;
    /** AbortSignal to cancel polling early. */
    signal?: AbortSignal;
}

const DEFAULT_INTERVAL_MS = 2_000;
const DEFAULT_MAX_ATTEMPTS = 120;

const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled", "expired"]);

/**
 * Polls `GET /api/v1/tasks/:id` until the task reaches a terminal status.
 *
 * @returns The final `TaskDetail` once completed (or throws on failure / timeout).
 */
export async function pollTask(
    fetcher: (method: string, path: string) => Promise<Response>,
    taskId: string,
    opts: PollOptions = {},
): Promise<TaskDetail> {
    const interval = opts.intervalMs ?? DEFAULT_INTERVAL_MS;
    const maxAttempts = opts.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (opts.signal?.aborted) {
            throw new BitbybitApiError({
                code: "POLL_ABORTED",
                message: "Task polling was aborted",
                statusCode: 0,
            });
        }

        await sleep(interval);

        const res = await fetcher("GET", `/api/v1/tasks/${taskId}`);
        const body: ApiResponse<TaskDetail> = await res.json() as ApiResponse<TaskDetail>;

        if (!body.ok) {
            throw new BitbybitApiError({
                code: body.error.code,
                message: body.error.message,
                statusCode: res.status,
                details: body.error.details,
                requestId: body.error.requestId,
            });
        }

        const task = body.data;
        opts.onProgress?.(task);

        if (TERMINAL_STATUSES.has(task.status)) {
            if (task.status === "completed") {
                return task;
            }
            throw new BitbybitApiError({
                code: `TASK_${task.status.toUpperCase()}`,
                message: `Task ${task.status}: ${task.error ?? "no details"}`,
                statusCode: 200,
            });
        }
    }

    throw new BitbybitApiError({
        code: "POLL_TIMEOUT",
        message: `Task ${taskId} did not complete within ${maxAttempts} polls`,
        statusCode: 0,
    });
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
