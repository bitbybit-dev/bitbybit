import { BitbybitClient } from "@bitbybit-dev/cad-cloud-sdk";

const BITBYBIT_API_KEY = process.env.BITBYBIT_API_KEY ?? "";
const BITBYBIT_API_URL = process.env.BITBYBIT_API_URL ?? "https://api.bitbybit.dev";

function getClient(): BitbybitClient {
    return new BitbybitClient({
        apiKey: BITBYBIT_API_KEY,
        baseUrl: BITBYBIT_API_URL,
    });
}

export async function createDragonCup(): Promise<{ taskId: string; downloads: { format: string; downloadUrl: string; filename: string }[] }> {
    const client = getClient();

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

export async function createDragonCupBatch(): Promise<{
    taskId: string;
    subTasks: { taskId: string; index: number; downloads: { format: string; downloadUrl: string; filename: string }[] }[];
}> {
    const client = getClient();

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

export async function getTaskResult(taskId: string): Promise<{ status: string; downloads?: { format: string; downloadUrl: string; filename: string }[] }> {
    const client = getClient();

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
export async function createInvalidCup(): Promise<never> {
    const client = getClient();

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
