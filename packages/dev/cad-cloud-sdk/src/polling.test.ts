import { describe, it, expect, vi } from "vitest";
import { pollTask } from "./polling.js";
import { BitbybitApiError } from "./errors.js";

function jsonResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

describe("pollTask", () => {
    it("returns completed task after polling", async () => {
        // Arrange
        const completedTask = { taskId: "t-1", status: "completed", kind: "model" };
        const fetcher = vi.fn()
            .mockResolvedValueOnce(jsonResponse({ ok: true, data: { taskId: "t-1", status: "processing", kind: "model" } }))
            .mockResolvedValueOnce(jsonResponse({ ok: true, data: completedTask }));

        // Act
        const result = await pollTask(fetcher, "t-1", { intervalMs: 1, maxAttempts: 5 });

        // Assert
        expect(result).toStrictEqual(completedTask);
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("calls the correct endpoint path", async () => {
        // Arrange
        const fetcher = vi.fn()
            .mockResolvedValueOnce(jsonResponse({ ok: true, data: { taskId: "t-99", status: "completed" } }));

        // Act
        await pollTask(fetcher, "t-99", { intervalMs: 1 });

        // Assert
        expect(fetcher).toHaveBeenCalledWith("GET", "/api/v1/tasks/t-99");
    });

    it("throws TASK_FAILED for failed tasks", async () => {
        // Arrange
        const fetcher = vi.fn()
            .mockImplementation(async () => jsonResponse({
                ok: true,
                data: { taskId: "t-1", status: "failed", error: "out of memory" },
            }));

        // Act
        let error: BitbybitApiError | undefined;
        try {
            await pollTask(fetcher, "t-1", { intervalMs: 1 });
        } catch (e) {
            error = e as BitbybitApiError;
        }

        // Assert
        expect(error!.code).toBe("TASK_FAILED");
        expect(error!.message).toContain("out of memory");
    });

    it("throws TASK_CANCELLED for cancelled tasks", async () => {
        // Arrange
        const fetcher = vi.fn()
            .mockImplementation(async () => jsonResponse({
                ok: true,
                data: { taskId: "t-1", status: "cancelled" },
            }));

        // Act
        let error: BitbybitApiError | undefined;
        try {
            await pollTask(fetcher, "t-1", { intervalMs: 1 });
        } catch (e) {
            error = e as BitbybitApiError;
        }

        // Assert
        expect(error!.code).toBe("TASK_CANCELLED");
    });

    it("throws TASK_EXPIRED for expired tasks", async () => {
        // Arrange
        const fetcher = vi.fn()
            .mockImplementation(async () => jsonResponse({
                ok: true,
                data: { taskId: "t-1", status: "expired" },
            }));

        // Act
        let error: BitbybitApiError | undefined;
        try {
            await pollTask(fetcher, "t-1", { intervalMs: 1 });
        } catch (e) {
            error = e as BitbybitApiError;
        }

        // Assert
        expect(error!.code).toBe("TASK_EXPIRED");
    });

    it("throws POLL_TIMEOUT when maxAttempts exceeded", async () => {
        // Arrange
        const fetcher = vi.fn()
            .mockImplementation(async () => jsonResponse({
                ok: true,
                data: { taskId: "t-1", status: "processing" },
            }));

        // Act
        let error: BitbybitApiError | undefined;
        try {
            await pollTask(fetcher, "t-1", { intervalMs: 1, maxAttempts: 2 });
        } catch (e) {
            error = e as BitbybitApiError;
        }

        // Assert
        expect(error!.code).toBe("POLL_TIMEOUT");
        expect(error!.message).toContain("t-1");
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("throws BitbybitApiError when API returns error envelope", async () => {
        // Arrange
        const fetcher = vi.fn()
            .mockImplementation(async () => jsonResponse(
                { ok: false, error: { code: "UNAUTHORIZED", message: "bad key" } },
                401,
            ));

        // Act
        let error: BitbybitApiError | undefined;
        try {
            await pollTask(fetcher, "t-1", { intervalMs: 1 });
        } catch (e) {
            error = e as BitbybitApiError;
        }

        // Assert
        expect(error!.code).toBe("UNAUTHORIZED");
        expect(error!.statusCode).toBe(401);
    });

    it("calls onProgress callback after each poll", async () => {
        // Arrange
        const onProgress = vi.fn();
        const fetcher = vi.fn()
            .mockResolvedValueOnce(jsonResponse({ ok: true, data: { taskId: "t-1", status: "queued" } }))
            .mockResolvedValueOnce(jsonResponse({ ok: true, data: { taskId: "t-1", status: "processing" } }))
            .mockResolvedValueOnce(jsonResponse({ ok: true, data: { taskId: "t-1", status: "completed" } }));

        // Act
        await pollTask(fetcher, "t-1", { intervalMs: 1, onProgress });

        // Assert
        expect(onProgress).toHaveBeenCalledTimes(3);
        expect(onProgress).toHaveBeenNthCalledWith(1, { taskId: "t-1", status: "queued" });
        expect(onProgress).toHaveBeenNthCalledWith(2, { taskId: "t-1", status: "processing" });
        expect(onProgress).toHaveBeenNthCalledWith(3, { taskId: "t-1", status: "completed" });
    });

    it("throws POLL_ABORTED when AbortSignal is aborted", async () => {
        // Arrange
        const controller = new AbortController();
        controller.abort();
        const fetcher = vi.fn();

        // Act
        let error: BitbybitApiError | undefined;
        try {
            await pollTask(fetcher, "t-1", { intervalMs: 1, signal: controller.signal });
        } catch (e) {
            error = e as BitbybitApiError;
        }

        // Assert
        expect(error!.code).toBe("POLL_ABORTED");
        expect(fetcher).not.toHaveBeenCalled();
    });
});
