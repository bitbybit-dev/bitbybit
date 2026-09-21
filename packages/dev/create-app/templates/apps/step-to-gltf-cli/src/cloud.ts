import { BitbybitClient } from "@bitbybit-dev/cad-cloud-sdk";
import type { ConvertOptions } from "./convert.js";

export const CAD_CLOUD_URL = "https://bitbybit.dev/cad-cloud";
export const STUDIO_KEYS_URL = "https://studio.bitbybit.dev/keys/billing";
export const KEY_VARIABLE = "BITBYBIT_API_KEY";
export const URL_VARIABLE = "BITBYBIT_API_URL";
export const DEFAULT_API_URL = "https://api.bitbybit.dev";
export const NO_KEY_EXIT = 2;

export const NO_KEY_MESSAGE = [
    `--cloud converts on CAD Cloud, and ${KEY_VARIABLE} is not set.`,
    "Without --cloud this tool converts in-process on the open-source kernel, free, with the same result for any file this machine can hold;",
    "--cloud is for the cases a local kernel cannot serve: a serverless or edge function without the memory for it, or a volume of files worth handing to a queue.",
    `Any CAD Cloud plan includes conversion (${CAD_CLOUD_URL}); create a key in Bitbybit Studio (${STUDIO_KEYS_URL}) and export ${KEY_VARIABLE} before running with --cloud.`,
].join("\n");

export interface CloudResult {
    glb: Uint8Array;
    taskId: string;
}

export async function convertViaCloud(file: string, text: string, options: ConvertOptions, env: NodeJS.ProcessEnv = process.env): Promise<CloudResult> {
    const apiKey = env[KEY_VARIABLE];
    if (!apiKey) throw new Error(NO_KEY_MESSAGE);
    const client = new BitbybitClient({ apiKey, baseUrl: env[URL_VARIABLE] ?? DEFAULT_API_URL });
    const uploaded = await client.files.uploadBytes(file, new TextEncoder().encode(text), "application/step");
    const { taskId, downloads } = await client.convert.stepToGltfAndPoll({ stepFileId: uploaded.fileId, meshPrecision: options.meshPrecision, meshRelative: true }, { intervalMs: 1500, maxAttempts: 200 });
    const glb = downloads.find((download) => download.format === "glb" || download.format === "gltf");
    if (!glb) throw new Error(`${file}: CAD Cloud task ${taskId} returned no glTF download`);
    const response = await fetch(glb.downloadUrl);
    if (!response.ok) throw new Error(`${file}: downloading the glTF failed with HTTP ${response.status}`);
    return { glb: new Uint8Array(await response.arrayBuffer()), taskId };
}
