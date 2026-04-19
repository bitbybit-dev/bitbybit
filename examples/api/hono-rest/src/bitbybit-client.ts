import type { Env } from "./types";

const POLL_INTERVAL_MS = 2_000;
const MAX_POLL_ATTEMPTS = 120; // 4 minutes max

interface TaskResponse {
    ok: boolean;
    data?: {
        taskId: string;
        status: string;
        statusUrl?: string;
        resultParts?: Record<string, unknown> | null;
        error?: string | null;
    };
    error?: { code: string; message: string };
}

interface SubTaskSummary {
    taskId: string;
    index: number;
    status: string;
}

interface CompoundTaskResponse {
    ok: boolean;
    data?: {
        taskId: string;
        kind: string;
        subTaskCount: number;
        statusUrl: string;
        subTasks: SubTaskSummary[];
    };
    error?: { code: string; message: string };
}

interface ResultResponse {
    ok: boolean;
    data?: { downloadUrl: string; filename: string };
    error?: { code: string; message: string };
}

async function apiRequest(env: Env, method: string, path: string, body?: unknown): Promise<Response> {
    const url = `${env.BITBYBIT_API_URL}${path}`;
    const headers: Record<string, string> = {
        "x-api-key": env.BITBYBIT_API_KEY,
        "Content-Type": "application/json",
    };

    return fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
}

export async function createDragonCup(env: Env): Promise<{ taskId: string; downloadUrl: string }> {
    // 1. Create dragon cup model — returns 202 with taskId
    const createRes = await apiRequest(env, "POST", "/api/v1/models/dragon-cup", {
        params: {
            height: 8,
            radiusBottom: 4,
            radiusTopOffset: 2,
            radiusMidOffset: 2,
            rotationTopAngle: 20,
            rotationMidAngle: 20,
            nrSkinCellsVertical: 5,
            nrSkinCellsHorizontal: 10,
            thickness: 0.6,
            bottomThickness: 1,
            scale: 1,
            origin: [0, 0, 0],
            direction: [0, 1, 0],
        },
        outputs: {
            formats: ["gltf"],
        },
    });

    if (!createRes.ok && createRes.status !== 202) {
        const err = await createRes.text();
        throw new Error(`Failed to create dragon cup: ${createRes.status} ${err}`);
    }

    const createData: TaskResponse = await createRes.json();
    if (!createData.ok || !createData.data?.taskId) {
        throw new Error(`API error: ${createData.error?.message ?? "unknown"}`);
    }

    const { taskId } = createData.data;
    const downloadUrl = await pollAndGetResult(env, taskId);
    return { taskId, downloadUrl };
}

export async function createDragonCupBatch(
    env: Env,
): Promise<{ taskId: string; downloadUrls: string[] }> {
    const createRes = await apiRequest(env, "POST", "/api/v1/models/dragon-cup/batch", {
        items: [
            {
                params: {
                    height: 4, radiusBottom: 4, radiusTopOffset: 2, radiusMidOffset: 2,
                    rotationTopAngle: 20, rotationMidAngle: 20,
                    nrSkinCellsVertical: 2, nrSkinCellsHorizontal: 6,
                    nrSkinCellDivisionsTop: 2, nrSkinCellDivisionsBottom: 3,
                    skinCellOuterHeight: 1, skinCellInnerHeight: 0.3,
                    skinCellBottomHeight: 1, skinCellTopHeight: 1,
                    thickness: 2,
                },
            },
            {
                params: {
                    height: 7, radiusBottom: 4, radiusTopOffset: 2, radiusMidOffset: 2,
                    rotationTopAngle: 20, rotationMidAngle: 20,
                    nrSkinCellsVertical: 1, nrSkinCellsHorizontal: 12,
                    nrSkinCellDivisionsTop: 1, nrSkinCellDivisionsBottom: 1,
                    skinCellOuterHeight: 2, skinCellInnerHeight: 1,
                    skinCellBottomHeight: 1, skinCellTopHeight: 1,
                    thickness: 0.5,
                },
            },
            {
                params: {
                    height: 9, radiusBottom: 2, radiusTopOffset: 1, radiusMidOffset: 1,
                    rotationTopAngle: -30, rotationMidAngle: -30,
                    nrSkinCellsVertical: 1, nrSkinCellsHorizontal: 5,
                    nrSkinCellDivisionsTop: 1, nrSkinCellDivisionsBottom: 1,
                    skinCellOuterHeight: 4, skinCellInnerHeight: -0.3,
                    skinCellBottomHeight: 0.5, skinCellTopHeight: 0.3,
                    thickness: 0.5,
                },
            },
        ],
        outputs: { formats: ["gltf"] },
    });

    if (!createRes.ok && createRes.status !== 202) {
        const err = await createRes.text();
        throw new Error(`Failed to create batch: ${createRes.status} ${err}`);
    }

    const createData: CompoundTaskResponse = await createRes.json();
    if (!createData.ok || !createData.data?.taskId) {
        throw new Error(`API error: ${createData.error?.message ?? "unknown"}`);
    }

    const { taskId, subTasks } = createData.data;

    // Poll compound task until all sub-tasks complete
    await pollUntilDone(env, taskId);

    // Fetch each sub-task result
    const downloadUrls: string[] = [];
    for (const sub of subTasks) {
        const resultRes = await apiRequest(env, "GET", `/api/v1/tasks/${sub.taskId}/result/glb`);
        const resultData: ResultResponse = await resultRes.json();
        if (!resultData.ok || !resultData.data?.downloadUrl) {
            throw new Error(`Sub-task ${sub.index} result error: ${resultData.error?.message ?? "no download URL"}`);
        }
        downloadUrls.push(resultData.data.downloadUrl);
    }

    return { taskId, downloadUrls };
}

export async function getTaskResult(env: Env, taskId: string): Promise<{ status: string; downloadUrl?: string }> {
    const statusRes = await apiRequest(env, "GET", `/api/v1/tasks/${taskId}`);
    const statusData: TaskResponse = await statusRes.json();

    if (!statusData.ok || !statusData.data) {
        throw new Error(`Task error: ${statusData.error?.message ?? "unknown"}`);
    }

    const { status } = statusData.data;

    if (status === "failed" || status === "cancelled" || status === "expired") {
        throw new Error(`Task ${status}: ${statusData.data.error ?? "no details"}`);
    }

    if (status !== "completed") {
        return { status };
    }

    const resultRes = await apiRequest(env, "GET", `/api/v1/tasks/${taskId}/result/glb`);
    const resultData: ResultResponse = await resultRes.json();

    if (!resultData.ok || !resultData.data?.downloadUrl) {
        throw new Error(`Result error: ${resultData.error?.message ?? "no download URL"}`);
    }

    return { status: "completed", downloadUrl: resultData.data.downloadUrl };
}

async function pollUntilDone(env: Env, taskId: string): Promise<void> {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        await sleep(POLL_INTERVAL_MS);

        const statusRes = await apiRequest(env, "GET", `/api/v1/tasks/${taskId}`);
        const statusData: TaskResponse = await statusRes.json();

        if (!statusData.ok || !statusData.data) {
            throw new Error(`Task poll error: ${statusData.error?.message ?? "unknown"}`);
        }

        const { status } = statusData.data;

        if (status === "completed") {
            return;
        }
        if (status === "failed" || status === "cancelled" || status === "expired") {
            throw new Error(`Task ${status}: ${statusData.data.error ?? "no details"}`);
        }
    }
    throw new Error("Polling timed out");
}

async function pollAndGetResult(env: Env, taskId: string): Promise<string> {
    await pollUntilDone(env, taskId);

    const resultRes = await apiRequest(env, "GET", `/api/v1/tasks/${taskId}/result/glb`);
    const resultData: ResultResponse = await resultRes.json();

    if (!resultData.ok || !resultData.data?.downloadUrl) {
        throw new Error(`Result error: ${resultData.error?.message ?? "no download URL"}`);
    }

    return resultData.data.downloadUrl;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
