import express from "express";
import { BitbybitValidationError } from "@bitbybit-dev/cad-cloud-sdk";
import { createDragonCup, createDragonCupBatch, createInvalidCup, getTaskResult } from "./bitbybit-client.js";
import { getHtml } from "./frontend.js";

const app = express();
app.use(express.json());

if (!process.env.BITBYBIT_API_KEY) {
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
        const result = await createDragonCup();
        res.json(result);
    } catch (e: unknown) {
        if (e instanceof BitbybitValidationError) {
            res.status(400).json({ error: e.message, validationErrors: e.errors });
            return;
        }
        const message = e instanceof Error ? e.message : "Unknown error";
        res.status(500).json({ error: message });
    }
});

// Batch generation — creates 3 dragon cup variations in parallel
app.post("/api/generate-batch", async (_req, res) => {
    try {
        const result = await createDragonCupBatch();
        res.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        res.status(500).json({ error: message });
    }
});

// Validation demo — intentionally sends invalid params to show client-side validation
app.post("/api/validate-demo", async (_req, res) => {
    try {
        await createInvalidCup();
        res.status(500).json({ error: "Should not reach here" });
    } catch (e: unknown) {
        if (e instanceof BitbybitValidationError) {
            res.status(400).json({
                caught: "BitbybitValidationError",
                message: e.message,
                errors: e.errors,
            });
            return;
        }
        const message = e instanceof Error ? e.message : "Unknown error";
        res.status(500).json({ error: message });
    }
});

// Fetch result for an existing task
app.get("/api/task/:id", async (req, res) => {
    try {
        const taskId = req.params.id;
        const result = await getTaskResult(taskId);
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
