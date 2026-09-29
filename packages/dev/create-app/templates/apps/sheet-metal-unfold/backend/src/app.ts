import express, { type Express } from "express";
import type { CloudGateway } from "./cloud.js";

export const NO_KEY_CODE = "NO_API_KEY";
export const CAD_CLOUD_URL = "https://bitbybit.dev/cad-cloud";
export const STUDIO_KEYS_URL = "https://studio.bitbybit.dev/keys/billing";
const MAX_STEP_BYTES = "20mb";

export interface UnfoldRequest {
    stepText: string;
    fileName?: string;
    kFactor?: number;
}

export function createApp(gateway: CloudGateway | null): Express {
    const app = express();
    app.use(express.json({ limit: MAX_STEP_BYTES }));

    app.get("/api/health", (_request, response) => {
        response.json({ ok: true, cloud: gateway ? "configured" : "no key" });
    });

    app.post("/api/unfold", async (request, response) => {
        if (!gateway) {
            response.status(503).json({
                code: NO_KEY_CODE,
                error: "BITBYBIT_API_KEY is not configured, so this backend cannot unfold.",
                help: `The unfold runs on CAD Cloud (${CAD_CLOUD_URL}); create a key in Bitbybit Studio (${STUDIO_KEYS_URL}), put it in backend/.env and restart.`,
            });
            return;
        }
        const body = request.body as Partial<UnfoldRequest> | undefined;
        if (!body || typeof body.stepText !== "string" || body.stepText.length === 0) {
            response.status(400).json({ error: "stepText (the part as STEP text) is required" });
            return;
        }
        try {
            const fileName = body.fileName ?? "part.step";
            const fileId = await gateway.uploadStep(fileName, body.stepText);
            const { taskId } = await gateway.unfoldSolid({
                stepFileId: fileId,
                kFactor: body.kFactor ?? 0.44,
                thicknessOverride: 0,
                outputs: { formats: ["step", "gltf"] },
            });
            const task = await gateway.waitForTask(taskId);
            if (task.status !== "completed") {
                response.status(502).json({ error: `CAD Cloud task ${taskId} ended as ${task.status}: ${JSON.stringify(task.error ?? "")}` });
                return;
            }
            const downloads = await gateway.downloads(taskId);
            const step = downloads.find((download) => download.format === "step" || download.format === "stpz");
            if (!step) {
                response.status(502).json({ error: `CAD Cloud task ${taskId} returned no STEP flat pattern` });
                return;
            }
            const report = (task.metadata as { report?: unknown } | null)?.report ?? [];
            response.json({ taskId, report, flatStep: await gateway.fetchText(step.downloadUrl), downloads });
        } catch (error) {
            response.status(500).json({ error: error instanceof Error ? error.message : String(error) });
        }
    });

    return app;
}
