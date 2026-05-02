---
sidebar_position: 5
title: Tasks
sidebar_label: Tasks
description: "Manage async CAD tasks — poll for status, list, cancel, retry, and download results with the Bitbybit SDK."
tags: [sdk, typescript, tasks]
---

# Tasks

The `client.tasks` endpoint manages the lifecycle of async tasks. Every model generation, CAD operation, and file conversion creates a task that progresses through statuses: `queued` → `processing` → `completed` (or `failed` / `cancelled` / `expired`).

## Get task status

```ts
const task = await client.tasks.get(taskId);

console.log(task.status);     // "queued" | "processing" | "completed" | ...
console.log(task.progress);   // 0–100 or null
console.log(task.error);      // error message if failed
console.log(task.resultParts); // available formats once completed
```

## List tasks

Paginated listing with optional filters:

```ts
const list = await client.tasks.list({
    status: "completed",
    kind: "model",
    page: 1,
    limit: 10,
});

for (const task of list.tasks) {
    console.log(`${task.taskId}: ${task.status}`);
}
```

## Download results

### All formats at once

Get download URLs for **all** available result formats in a single call:

```ts
const downloads = await client.tasks.getResults(taskId);
// downloads: { format, downloadUrl, filename }[]

for (const d of downloads) {
    console.log(`${d.format}: ${d.downloadUrl}`);
}
// e.g. "glb: https://...", "metadata: https://..."
```

### Single format

Get a pre-signed download URL for a specific format:

```ts
const result = await client.tasks.getResult(taskId, "glb");
console.log(result.downloadUrl); // expires after 1 hour
console.log(result.filename);    // e.g. "result.glb"
```

Without a format, the default (primary) result is returned:

```ts
const result = await client.tasks.getResult(taskId);
```

### Compound task results

For compound/batch tasks, get the manifest with per-sub-task download links:

```ts
const manifest = await client.tasks.getCompoundResult(taskId);

for (const entry of manifest.manifest) {
    console.log(`Sub-task ${entry.index}: ${entry.status}`);
    if (entry.downloadUrls) {
        console.log("  GLB:", entry.downloadUrls.glb);
    }
}
```

## Poll until done

Wait for a task to complete:

```ts
const task = await client.tasks.poll(taskId, {
    intervalMs: 2000,
    maxAttempts: 120,
    onProgress: (t) => console.log(`${t.status} — ${t.progress}%`),
    signal: AbortSignal.timeout(120_000),
});
```

Throws `BitbybitApiError` with code `TASK_FAILED`, `TASK_CANCELLED`, `TASK_EXPIRED`, or `POLL_TIMEOUT`.

### Poll + download

Combines polling and result retrieval (returns all formats):

```ts
const { task, downloads } = await client.tasks.pollAndDownload(taskId, {
    intervalMs: 3000,
});

const glb = downloads.find(d => d.format === "glb");
console.log("GLB:", glb?.downloadUrl);
```

## Cancel a task

Cancel a task that is still `queued` or `processing`:

```ts
const { cancelled } = await client.tasks.cancel(taskId);
```

## Retry a failed task

Re-queue a `failed` or `cancelled` task with the same parameters:

```ts
const newTask = await client.tasks.retry(taskId);
console.log(newTask.taskId); // new task ID
```

## Task statuses

| Status | Description |
|--------|-------------|
| `waiting` | Pending dependencies |
| `queued` | In the job queue |
| `processing` | Actively computing |
| `completed` | Result available for download |
| `failed` | Error occurred |
| `cancelled` | Cancelled by user |
| `expired` | Result TTL exceeded |
