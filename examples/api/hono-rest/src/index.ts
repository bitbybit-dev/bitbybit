import { Hono } from "hono";
import type { Env } from "./types";
import { createDragonCup, createDragonCupBatch, getTaskResult } from "./bitbybit-client";
import { getHtml } from "./frontend";

const app = new Hono<{ Bindings: Env }>();

// Serve the Three.js frontend
app.get("/", (c) => {
    return c.html(getHtml());
});

// Backend endpoint — calls bitbybit API with server-side API key
app.post("/api/generate", async (c) => {
    try {
        const result = await createDragonCup(c.env);
        return c.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return c.json({ error: message }, 500);
    }
});

// Batch generation — creates 3 dragon cup variations in parallel
app.post("/api/generate-batch", async (c) => {
    try {
        const result = await createDragonCupBatch(c.env);
        return c.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return c.json({ error: message }, 500);
    }
});

// Fetch result for an existing task
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

export default app;
