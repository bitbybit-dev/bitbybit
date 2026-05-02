import { describe, it, expect } from "vitest";
import { unwrap } from "./unwrap.js";
import { BitbybitApiError } from "./errors.js";

describe("unwrap", () => {
    it("returns data from a successful response envelope", async () => {
        // Arrange
        const body = { ok: true, data: { taskId: "t-1", status: "queued" } };
        const res = new Response(JSON.stringify(body), { status: 200 });

        // Act
        const result = await unwrap<{ taskId: string; status: string }>(res);

        // Assert
        expect(result).toStrictEqual({ taskId: "t-1", status: "queued" });
    });

    it("throws BitbybitApiError for error envelope", async () => {
        // Arrange
        const body = {
            ok: false,
            error: { code: "NOT_FOUND", message: "Task not found" },
        };
        const res = new Response(JSON.stringify(body), { status: 404 });

        // Act & Assert
        await expect(unwrap(res)).rejects.toThrow(BitbybitApiError);
    });

    it("populates error fields from response envelope", async () => {
        // Arrange
        const body = {
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid params",
                details: { field: "height" },
                requestId: "req-abc",
            },
        };
        const res = new Response(JSON.stringify(body), { status: 400 });

        // Act
        let error: BitbybitApiError | undefined;
        try {
            await unwrap(res);
        } catch (e) {
            error = e as BitbybitApiError;
        }

        // Assert
        expect(error!.code).toBe("VALIDATION_ERROR");
        expect(error!.message).toBe("Invalid params");
        expect(error!.statusCode).toBe(400);
        expect(error!.details).toStrictEqual({ field: "height" });
        expect(error!.requestId).toBe("req-abc");
    });

    it("sets statusCode from the HTTP response status", async () => {
        // Arrange
        const body = { ok: false, error: { code: "FORBIDDEN", message: "denied" } };
        const res = new Response(JSON.stringify(body), { status: 403 });

        // Act
        let error: BitbybitApiError | undefined;
        try {
            await unwrap(res);
        } catch (e) {
            error = e as BitbybitApiError;
        }

        // Assert
        expect(error!.statusCode).toBe(403);
    });
});
