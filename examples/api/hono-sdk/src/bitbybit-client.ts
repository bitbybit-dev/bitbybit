import { BitbybitClient } from "@bitbybit-dev/cad-cloud-sdk";
import { step } from "@bitbybit-dev/cad-cloud-sdk/pipeline";
import type { Env } from "./types";

function getClient(env: Env): BitbybitClient {
    return new BitbybitClient({
        apiKey: env.BITBYBIT_API_KEY,
        baseUrl: env.BITBYBIT_API_URL,
    });
}

export async function createDragonCup(env: Env): Promise<{ taskId: string; downloads: { format: string; downloadUrl: string; filename: string }[] }> {
    const client = getClient(env);

    return client.models.run("dragon-cup", {
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
}

export async function createDragonCupBatch(env: Env): Promise<{
    taskId: string;
    subTasks: { taskId: string; index: number; downloads: { format: string; downloadUrl: string; filename: string }[] }[];
}> {
    const client = getClient(env);

    const result = await client.models.batchRun("dragon-cup", {
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
        outputs: {
            formats: ["gltf"],
        },
    });

    return { taskId: result.taskId, subTasks: [...result.subTasks] };
}

export async function getTaskResult(env: Env, taskId: string): Promise<{ status: string; downloads?: { format: string; downloadUrl: string; filename: string }[] }> {
    const client = getClient(env);

    const task = await client.tasks.get(taskId);

    if (task.status === "failed" || task.status === "cancelled" || task.status === "expired") {
        throw new Error(`Task ${task.status}: ${task.error ?? "no details"}`);
    }

    if (task.status !== "completed") {
        return { status: task.status };
    }

    const downloads = await client.tasks.getResults(taskId);
    return { status: "completed", downloads };
}

/**
 * Intentionally invalid request — height exceeds the 50cm maximum.
 * The SDK validates against JSON Schema before sending, so this throws
 * a BitbybitValidationError without ever hitting the network.
 */
export async function createInvalidCup(env: Env): Promise<never> {
    const client = getClient(env);

    await client.models.run("dragon-cup", {
        params: {
            height: 999,        // max is 50
            radiusBottom: -5,   // must be > 0
        },
        outputs: {
            formats: ["gltf"],
        },
    });

    throw new Error("unreachable");
}

// ---------------------------------------------------------------------------
// Pipeline examples (using typed step() helper)
// ---------------------------------------------------------------------------

/**
 * Translate, Union + Fillet: createBox → translate → union → fillet
 * Creates a box, translates a copy, unions both, fillets the result.
 */
export async function runTranslateUnionFilletPipeline(env: Env): Promise<{ taskId: string; downloads: { format: string; downloadUrl: string; filename: string }[] }> {
    const client = getClient(env);

    return client.cad.pipelineAndPoll({
        steps: [
            step("occt.shapes.solid.createBox", { width: 8, length: 6, height: 4, center: [0, 0, 0] }),
            step("occt.transforms.translate", { shape: "$ref:0", translation: [4, 2, 3] }),
            step("occt.booleans.union", { shapes: ["$ref:0", "$ref:1"] }),
            step("occt.fillets.filletEdges", { shape: "$ref:2", radius: 0.5 }),
        ],
        outputs: { formats: ["stpz", "gltf"] },
    });
}

/**
 * Map: Cylinders at Positions
 * Parses an array of center positions, maps a cylinder at each, unions the result.
 */
export async function runMapCylindersPipeline(env: Env): Promise<{ taskId: string; downloads: { format: string; downloadUrl: string; filename: string }[] }> {
    const client = getClient(env);

    return client.cad.pipelineAndPoll({
        steps: [
            step("json.parse", { text: "[[0,0,0],[1.5,0,0],[3,0,0],[4.5,0,0]]" }),
            {
                type: "map",
                items: "$ref:0",
                steps: [step("occt.shapes.solid.createCylinder", { radius: 1, height: 5, center: "$item" as never })],
            },
            step("occt.booleans.union", { shapes: "$ref:5" }),
        ],
        outputs: { formats: ["stpz", "gltf"] },
    });
}

/**
 * Map: Spheres at Different Radii
 * Creates spheres of radii 1–5 at pre-computed positions, compounds the result.
 */
export async function runMapSpheresPipeline(env: Env): Promise<{ taskId: string; downloads: { format: string; downloadUrl: string; filename: string }[] }> {
    const client = getClient(env);

    return client.cad.pipelineAndPoll({
        steps: [
            step("json.parse", { text: "[[0,0,0],[4,0,0],[10,0,0],[18,0,0],[28,0,0]]" }),
            {
                type: "map",
                items: "$ref:0",
                steps: [
                    step("math.twoNrOperation", { first: "$index" as never, second: 1, operation: "add" }),
                    step("occt.shapes.solid.createSphere", { radius: "$prev" as never, center: "$item" as never }),
                ],
            },
            step("occt.shapes.compound.makeCompound", { shapes: "$ref:11" }),
        ],
        outputs: { formats: ["stpz", "gltf"] },
    });
}

/**
 * Choice: Conditional Shape Size
 * Parses a number, increments it, then picks a large box (> 5) or small sphere.
 */
export async function runChoicePipeline(env: Env): Promise<{ taskId: string; downloads: { format: string; downloadUrl: string; filename: string }[] }> {
    const client = getClient(env);

    return client.cad.pipelineAndPoll({
        steps: [
            step("json.parse", { text: "10" }),
            step("math.twoNrOperation", { first: "$ref:0" as never, second: 1, operation: "add" }),
            {
                type: "choice",
                value: "$ref:1",
                operator: "gt",
                compareTo: 5,
                then: [step("occt.shapes.solid.createBox", { width: 10, length: 10, height: 10, center: [0, 0, 0] })],
                else: [step("occt.shapes.solid.createSphere", { radius: 2, center: [0, 0, 0] })],
            },
        ],
        outputs: { formats: ["stpz", "gltf"] },
    });
}

/**
 * File-input pipeline: import an uploaded STEP file, fillet all edges, export.
 */
export async function runFileInputPipeline(env: Env, fileId: string): Promise<{ taskId: string; downloads: { format: string; downloadUrl: string; filename: string }[] }> {
    const client = getClient(env);

    return client.cad.pipelineAndPoll({
        steps: [
            step("occt.io.loadSTEPorIGES", { filetext: "$file:0", fileName: "shape.step", adjustZtoY: true }),
            step("occt.fillets.filletEdges", { shape: "$ref:0", radius: 0.1 }),
        ],
        inputFiles: [{ fileId, role: "input" }],
        outputs: { formats: ["stpz", "gltf"], meshPrecision: 0.001 },
    });
}

/**
 * Upload a file via the SDK and get a fileId for use in pipelines.
 */
export async function uploadFile(env: Env, fileBuffer: ArrayBuffer, filename: string): Promise<string> {
    const client = getClient(env);
    const result = await client.files.uploadBytes(filename, fileBuffer);
    return result.fileId;
}
