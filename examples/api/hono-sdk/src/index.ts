import { Hono } from "hono";
import { BitbybitValidationError } from "@bitbybit-dev/cad-cloud-sdk";
import type { Env } from "./types";
import { createDragonCup, createDragonCupBatch, createInvalidCup, getTaskResult } from "./bitbybit-client";
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
        if (e instanceof BitbybitValidationError) {
            return c.json({ error: e.message, validationErrors: e.errors }, 400);
        }
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

// Validation demo — intentionally sends invalid params to show client-side validation
app.post("/api/validate-demo", async (c) => {
    try {
        await createInvalidCup(c.env);
        return c.json({ error: "Should not reach here" }, 500);
    } catch (e: unknown) {
        if (e instanceof BitbybitValidationError) {
            return c.json({
                caught: "BitbybitValidationError",
                message: e.message,
                errors: e.errors,
            }, 400);
        }
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
