import type { Env } from "./types.js";

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
    };
    if (body != null) {
        headers["Content-Type"] = "application/json";
    }

    return fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
}

export async function createDragonCup(env: Env): Promise<{ taskId: string; downloads: { format: string; downloadUrl: string; filename: string }[] }> {
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

    const createData: TaskResponse = await createRes.json() as TaskResponse;
    if (!createData.ok || !createData.data?.taskId) {
        throw new Error(`API error: ${createData.error?.message ?? "unknown"}`);
    }

    const { taskId } = createData.data;
    const downloads = await pollAndGetResult(env, taskId);
    return { taskId, downloads };
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

    const createData: CompoundTaskResponse = await createRes.json() as CompoundTaskResponse;
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
        const resultData: ResultResponse = await resultRes.json() as ResultResponse;
        if (!resultData.ok || !resultData.data?.downloadUrl) {
            throw new Error(`Sub-task ${sub.index} result error: ${resultData.error?.message ?? "no download URL"}`);
        }
        downloadUrls.push(resultData.data.downloadUrl);
    }

    return { taskId, downloadUrls };
}

export async function getTaskResult(env: Env, taskId: string): Promise<{ status: string; downloads?: { format: string; downloadUrl: string; filename: string }[] }> {
    const statusRes = await apiRequest(env, "GET", `/api/v1/tasks/${taskId}`);
    const statusData: TaskResponse = await statusRes.json() as TaskResponse;

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

    const resultRes = await apiRequest(env, "GET", `/api/v1/tasks/${taskId}/results`);
    const resultData = await resultRes.json() as { ok: boolean; data?: { downloads: { format: string; downloadUrl: string; filename: string }[] }; error?: { message: string } };

    if (!resultData.ok || !resultData.data?.downloads) {
        throw new Error(`Result error: ${resultData.error?.message ?? "no downloads"}`);
    }

    return { status: "completed", downloads: resultData.data.downloads };
}

async function pollUntilDone(env: Env, taskId: string): Promise<void> {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        await sleep(POLL_INTERVAL_MS);

        const statusRes = await apiRequest(env, "GET", `/api/v1/tasks/${taskId}`);
        const statusData: TaskResponse = await statusRes.json() as TaskResponse;

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

async function pollAndGetResult(env: Env, taskId: string): Promise<{ format: string; downloadUrl: string; filename: string }[]> {
    await pollUntilDone(env, taskId);

    const resultRes = await apiRequest(env, "GET", `/api/v1/tasks/${taskId}/results`);
    const resultData = await resultRes.json() as { ok: boolean; data?: { downloads: { format: string; downloadUrl: string; filename: string }[] }; error?: { message: string } };

    if (!resultData.ok || !resultData.data?.downloads) {
        throw new Error(`Result error: ${resultData.error?.message ?? "no downloads"}`);
    }

    return resultData.data.downloads;
}

// ---------------------------------------------------------------------------
// Pipeline examples
// ---------------------------------------------------------------------------

async function submitPipeline(env: Env, body: unknown): Promise<{ taskId: string; downloads: { format: string; downloadUrl: string; filename: string }[] }> {
    const createRes = await apiRequest(env, "POST", "/api/v1/cad/pipeline", body);
    if (!createRes.ok && createRes.status !== 202) {
        const err = await createRes.text();
        throw new Error(`Pipeline failed: ${createRes.status} ${err}`);
    }

    const createData: TaskResponse = await createRes.json() as TaskResponse;
    if (!createData.ok || !createData.data?.taskId) {
        throw new Error(`API error: ${createData.error?.message ?? "unknown"}`);
    }

    const { taskId } = createData.data;
    const downloads = await pollAndGetResult(env, taskId);
    return { taskId, downloads };
}

/**
 * Translate, Union + Fillet: createBox → translate → union → fillet
 */
export async function runTranslateUnionFilletPipeline(env: Env): Promise<{ taskId: string; downloads: { format: string; downloadUrl: string; filename: string }[] }> {
    return submitPipeline(env, {
        steps: [
            { operation: "occt.shapes.solid.createBox", params: { width: 8, length: 6, height: 4, center: [0, 0, 0] } },
            { operation: "occt.transforms.translate", params: { shape: "$ref:0", translation: [4, 2, 3] } },
            { operation: "occt.booleans.union", params: { shapes: ["$ref:0", "$ref:1"] } },
            { operation: "occt.fillets.filletEdges", params: { shape: "$ref:2", radius: 0.5 } },
        ],
        outputs: { formats: ["stpz", "gltf"] },
    });
}

/**
 * Map: Cylinders at Positions
 */
export async function runMapCylindersPipeline(env: Env): Promise<{ taskId: string; downloads: { format: string; downloadUrl: string; filename: string }[] }> {
    return submitPipeline(env, {
        steps: [
            { operation: "json.parse", params: { text: "[[0,0,0],[1.5,0,0],[3,0,0],[4.5,0,0]]" } },
            {
                type: "map",
                items: "$ref:0",
                steps: [{ operation: "occt.shapes.solid.createCylinder", params: { radius: 1, height: 5, center: "$item" } }],
            },
            { operation: "occt.booleans.union", params: { shapes: "$ref:5" } },
        ],
        outputs: { formats: ["stpz", "gltf"] },
    });
}

/**
 * Map: Spheres at Different Radii
 */
export async function runMapSpheresPipeline(env: Env): Promise<{ taskId: string; downloads: { format: string; downloadUrl: string; filename: string }[] }> {
    return submitPipeline(env, {
        steps: [
            { operation: "json.parse", params: { text: "[[0,0,0],[4,0,0],[10,0,0],[18,0,0],[28,0,0]]" } },
            {
                type: "map",
                items: "$ref:0",
                steps: [
                    { operation: "math.twoNrOperation", params: { first: "$index", second: 1, operation: "add" } },
                    { operation: "occt.shapes.solid.createSphere", params: { radius: "$prev", center: "$item" } },
                ],
            },
            { operation: "occt.shapes.compound.makeCompound", params: { shapes: "$ref:11" } },
        ],
        outputs: { formats: ["stpz", "gltf"] },
    });
}

/**
 * Choice: Conditional Shape Size
 */
export async function runChoicePipeline(env: Env): Promise<{ taskId: string; downloads: { format: string; downloadUrl: string; filename: string }[] }> {
    return submitPipeline(env, {
        steps: [
            { operation: "json.parse", params: { text: "10" } },
            { operation: "math.twoNrOperation", params: { first: "$ref:0", second: 1, operation: "add" } },
            {
                type: "choice",
                value: "$ref:1",
                operator: "gt",
                compareTo: 5,
                then: [{ operation: "occt.shapes.solid.createBox", params: { width: 10, length: 10, height: 10, center: [0, 0, 0] } }],
                else: [{ operation: "occt.shapes.solid.createSphere", params: { radius: 2, center: [0, 0, 0] } }],
            },
        ],
        outputs: { formats: ["stpz", "gltf"] },
    });
}

/**
 * File-input pipeline: upload a STEP file, fillet all edges, export.
 */
export async function runFileInputPipeline(env: Env, fileId: string): Promise<{ taskId: string; downloads: { format: string; downloadUrl: string; filename: string }[] }> {
    return submitPipeline(env, {
        steps: [
            { operation: "occt.io.loadSTEPorIGES", params: { filetext: "$file:0", fileName: "shape.step", adjustZtoY: true } },
            { operation: "occt.fillets.filletEdges", params: { shape: "$ref:0", radius: 0.1 } },
        ],
        inputFiles: [{ fileId, role: "input" }],
        outputs: { formats: ["stpz", "gltf"], meshPrecision: 0.001 },
    });
}

/**
 * Upload a file to the Bitbybit API, returns a fileId for use in pipelines.
 */
export async function uploadFile(env: Env, fileBuffer: ArrayBuffer, filename: string): Promise<string> {
    // 1. Request a pre-signed upload URL
    const uploadRes = await apiRequest(env, "POST", "/api/v1/files/upload", {
        filename,
        contentType: "application/octet-stream",
        bytes: fileBuffer.byteLength,
    });

    if (!uploadRes.ok) {
        const err = await uploadRes.text();
        throw new Error(`File upload request failed: ${uploadRes.status} ${err}`);
    }

    const uploadData = await uploadRes.json() as { ok: boolean; data?: { fileId: string; uploadUrl: string }; error?: { message: string } };
    if (!uploadData.ok || !uploadData.data?.uploadUrl) {
        throw new Error(`Upload error: ${uploadData.error?.message ?? "no uploadUrl"}`);
    }

    const { fileId, uploadUrl } = uploadData.data;

    // 2. PUT raw bytes to the pre-signed URL
    const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
        body: fileBuffer,
    });

    if (!putRes.ok) {
        throw new Error(`PUT to upload URL failed: ${putRes.status} ${putRes.statusText}`);
    }

    // 3. Confirm the upload
    const confirmRes = await apiRequest(env, "POST", `/api/v1/files/${encodeURIComponent(fileId)}/confirm`);
    if (!confirmRes.ok) {
        const err = await confirmRes.text();
        throw new Error(`File confirm failed: ${confirmRes.status} ${err}`);
    }

    return fileId;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
