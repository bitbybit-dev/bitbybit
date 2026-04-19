import express from "express";
import type { Env } from "./types.js";
import { createDragonCup, createDragonCupBatch, getTaskResult } from "./bitbybit-client.js";
import { getHtml } from "./frontend.js";

const app = express();
app.use(express.json());

const env: Env = {
    BITBYBIT_API_KEY: process.env.BITBYBIT_API_KEY ?? "",
    BITBYBIT_API_URL: process.env.BITBYBIT_API_URL ?? "https://api.bitbybit.dev",
};

if (!env.BITBYBIT_API_KEY) {
    console.error("BITBYBIT_API_KEY environment variable is required");
    process.exit(1);
}

// Serve the Three.js frontend
app.get("/", (_req, res) => {
    res.type("html").send(getHtml());
});

// Backend endpoint — calls bitbybit API with server-side API key
app.post("/api/generate", async (_req, res) => {
    try {
        const result = await createDragonCup(env);
        res.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        res.status(500).json({ error: message });
    }
});

// Batch generation — creates 3 dragon cup variations in parallel
app.post("/api/generate-batch", async (_req, res) => {
    try {
        const result = await createDragonCupBatch(env);
        res.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        res.status(500).json({ error: message });
    }
});

// Fetch result for an existing task
app.get("/api/task/:id", async (req, res) => {
    try {
        const taskId = req.params.id;
        const result = await getTaskResult(env, taskId);
        res.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        res.status(500).json({ error: message });
    }
});

const PORT = parseInt(process.env.PORT ?? "3000", 10);
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
