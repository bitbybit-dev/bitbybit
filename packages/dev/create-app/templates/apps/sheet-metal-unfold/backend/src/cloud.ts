import { BitbybitClient, unwrap, type TaskDetail, type TaskDownload } from "@bitbybit-dev/cad-cloud-sdk";

export interface UnfoldSolidBody {
    stepFileId: string;
    kFactor: number;
    thicknessOverride: number;
    outputs: { formats: ("step" | "gltf")[] };
}

export interface CloudGateway {
    uploadStep(fileName: string, stepText: string): Promise<string>;
    unfoldSolid(body: UnfoldSolidBody): Promise<{ taskId: string }>;
    waitForTask(taskId: string): Promise<Pick<TaskDetail, "status" | "metadata" | "error">>;
    downloads(taskId: string): Promise<TaskDownload[]>;
    fetchText(url: string): Promise<string>;
}

export const UNFOLD_SOLID_PATH = "/api/v1/cad/pro/unfold/solid";

export function sdkGateway(apiKey: string, baseUrl: string): CloudGateway {
    const client = new BitbybitClient({ apiKey, baseUrl });
    return {
        async uploadStep(fileName, stepText) {
            const confirmed = await client.files.uploadBytes(fileName, new TextEncoder().encode(stepText), "application/step");
            return confirmed.fileId;
        },
        async unfoldSolid(body) {
            return unwrap<{ taskId: string }>(await client.request("POST", UNFOLD_SOLID_PATH, body));
        },
        async waitForTask(taskId) {
            return client.tasks.poll(taskId, { intervalMs: 1500, maxAttempts: 200 });
        },
        async downloads(taskId) {
            return client.tasks.getResults(taskId);
        },
        async fetchText(url) {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`downloading the flat pattern failed: HTTP ${response.status}`);
            return response.text();
        },
    };
}
