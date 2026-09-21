import { Hono } from "hono";
import type { Env } from "./types";
import { createDragonCup, createDragonCupBatch, getTaskResult, runTranslateUnionFilletPipeline, runMapCylindersPipeline, runMapSpheresPipeline, runChoicePipeline, runFileInputPipeline, uploadFile } from "./bitbybit-client";

const app = new Hono<{ Bindings: Env }>();

app.use("/api/*", async (c, next) => {
    if (!c.env.BITBYBIT_API_KEY) {
        return c.json({
            error: "BITBYBIT_API_KEY is not configured.",
            help: "You need a Bitbybit API key to use this service. Create an account on https://bitbybit.dev and purchase an API key plan at https://bitbybit.dev/auth/pick-plan?api-keys=true to get access to managed CAD cloud servers.",
        }, 503);
    }
    return next();
});

app.post("/api/generate", async (c) => {
    try {
        const result = await createDragonCup(c.env);
        return c.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return c.json({ error: message }, 500);
    }
});

app.post("/api/generate-batch", async (c) => {
    try {
        const result = await createDragonCupBatch(c.env);
        return c.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return c.json({ error: message }, 500);
    }
});

app.get("/api/task/:id", async (c) => {
    try {
        const taskId = c.req.param("id");
        const result = await getTaskResult(c.env, taskId);
        return c.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return c.json({ error: message }, 500);
    }
});

app.post("/api/pipeline/translate-union-fillet", async (c) => {
    try {
        const result = await runTranslateUnionFilletPipeline(c.env);
        return c.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return c.json({ error: message }, 500);
    }
});

app.post("/api/pipeline/map-cylinders", async (c) => {
    try {
        const result = await runMapCylindersPipeline(c.env);
        return c.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return c.json({ error: message }, 500);
    }
});

app.post("/api/pipeline/map-spheres", async (c) => {
    try {
        const result = await runMapSpheresPipeline(c.env);
        return c.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return c.json({ error: message }, 500);
    }
});

app.post("/api/pipeline/choice", async (c) => {
    try {
        const result = await runChoicePipeline(c.env);
        return c.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return c.json({ error: message }, 500);
    }
});

app.post("/api/pipeline/file-input", async (c) => {
    try {
        const formData = await c.req.formData();
        const file = formData.get("file") as File | null;
        if (!file) return c.json({ error: "No file uploaded" }, 400);

        const buffer = await file.arrayBuffer();
        const fileId = await uploadFile(c.env, buffer, file.name);
        const result = await runFileInputPipeline(c.env, fileId);
        return c.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return c.json({ error: message }, 500);
    }
});

app.get("/api/proxy-download", async (c) => {
    const url = c.req.query("url");
    if (!url) return c.json({ error: "Missing url parameter" }, 400);

    const response = await fetch(url);
    if (!response.ok) return c.json({ error: `Upstream error: ${response.status}` }, 502);

    const buffer = await response.arrayBuffer();
    return c.body(buffer, 200, {
        "Content-Type": "model/gltf-binary",
        "Access-Control-Allow-Origin": "*",
    });
});

export default app;
