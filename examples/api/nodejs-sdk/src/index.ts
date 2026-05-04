import express from "express";
import multer from "multer";
import { BitbybitValidationError } from "@bitbybit-dev/cad-cloud-sdk";
import { createDragonCup, createDragonCupBatch, createInvalidCup, getTaskResult, runTranslateUnionFilletPipeline, runMapCylindersPipeline, runMapSpheresPipeline, runChoicePipeline, runFileInputPipeline, uploadFile } from "./bitbybit-client.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const app = express();
app.use(express.json());

if (!process.env.BITBYBIT_API_KEY) {
    console.error("BITBYBIT_API_KEY environment variable is required");
    process.exit(1);
}

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

// Pipeline: translate → union → fillet
app.post("/api/pipeline/translate-union-fillet", async (_req, res) => {
    try {
        const result = await runTranslateUnionFilletPipeline();
        res.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        res.status(500).json({ error: message });
    }
});

// Pipeline: map cylinders at positions
app.post("/api/pipeline/map-cylinders", async (_req, res) => {
    try {
        const result = await runMapCylindersPipeline();
        res.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        res.status(500).json({ error: message });
    }
});

// Pipeline: map spheres at different radii
app.post("/api/pipeline/map-spheres", async (_req, res) => {
    try {
        const result = await runMapSpheresPipeline();
        res.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        res.status(500).json({ error: message });
    }
});

// Pipeline: choice conditional
app.post("/api/pipeline/choice", async (_req, res) => {
    try {
        const result = await runChoicePipeline();
        res.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        res.status(500).json({ error: message });
    }
});

// Pipeline: file input (upload STEP → fillet)
app.post("/api/pipeline/file-input", upload.single("file"), async (req, res) => {
    try {
        const file = req.file;
        if (!file) { res.status(400).json({ error: "No file uploaded" }); return; }

        const fileId = await uploadFile(file.buffer.buffer as ArrayBuffer, file.originalname);
        const result = await runFileInputPipeline(fileId);
        res.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        res.status(500).json({ error: message });
    }
});

// Proxy download — streams a remote file through the backend to avoid CORS issues with GLTFLoader
app.get("/api/proxy-download", async (req, res) => {
    const url = req.query.url as string | undefined;
    if (!url) { res.status(400).json({ error: "Missing url parameter" }); return; }

    try {
        const response = await fetch(url);
        if (!response.ok || !response.body) {
            res.status(502).json({ error: `Upstream error: ${response.status}` });
            return;
        }
        res.setHeader("Content-Type", response.headers.get("Content-Type") || "model/gltf-binary");
        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        res.status(500).json({ error: message });
    }
});

const PORT = parseInt(process.env.PORT ?? "3000", 10);
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
