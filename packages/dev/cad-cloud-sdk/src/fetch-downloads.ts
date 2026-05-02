// ---------------------------------------------------------------------------
// Shared helper — fetch all download URLs for a completed task
// ---------------------------------------------------------------------------

import type { TaskDownload, TaskResultsDownload } from "./types/index.js";
import { unwrap } from "./unwrap.js";

type Fetcher = (method: string, path: string, body?: unknown) => Promise<Response>;

/**
 * Fetch all download URLs for a completed task in a single API call.
 * Uses `GET /api/v1/tasks/{taskId}/results` (returns all formats at once).
 */
export async function fetchDownloads(
    fetcher: Fetcher,
    taskId: string,
): Promise<TaskDownload[]> {
    const path = `/api/v1/tasks/${encodeURIComponent(taskId)}/results`;
    const res = await fetcher("GET", path);
    const data = await unwrap<TaskResultsDownload>(res);
    return data.downloads;
}
