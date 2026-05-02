import { describe, it, expect } from "vitest";
import { fetchDownloads } from "./fetch-downloads.js";
import { BitbybitApiError } from "./errors.js";

function jsonResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

describe("fetchDownloads", () => {
    it("returns downloads array from successful response", async () => {
        // Arrange
        const downloads = [
            { format: "glb", downloadUrl: "https://r2.example.com/result.glb", filename: "result.glb" },
            { format: "step", downloadUrl: "https://r2.example.com/result.step", filename: "result.step" },
        ];
        const fetcher = async (_m: string, _p: string) =>
            jsonResponse({ ok: true, data: { downloads } });

        // Act
        const result = await fetchDownloads(fetcher, "task-123");

        // Assert
        expect(result).toStrictEqual(downloads);
    });

    it("calls the correct API path with encoded taskId", async () => {
        // Arrange
        let calledPath = "";
        const fetcher = async (_m: string, path: string) => {
            calledPath = path;
            return jsonResponse({ ok: true, data: { downloads: [] } });
        };

        // Act
        await fetchDownloads(fetcher, "task/with special");

        // Assert
        expect(calledPath).toBe("/api/v1/tasks/task%2Fwith%20special/results");
    });

    it("uses GET method", async () => {
        // Arrange
        let calledMethod = "";
        const fetcher = async (method: string, _p: string) => {
            calledMethod = method;
            return jsonResponse({ ok: true, data: { downloads: [] } });
        };

        // Act
        await fetchDownloads(fetcher, "t-1");

        // Assert
        expect(calledMethod).toBe("GET");
    });

    it("throws BitbybitApiError when API returns error", async () => {
        // Arrange
        const fetcher = async () =>
            jsonResponse({ ok: false, error: { code: "NOT_FOUND", message: "no task" } }, 404);

        // Act & Assert
        await expect(fetchDownloads(fetcher, "t-bad")).rejects.toThrow(BitbybitApiError);
    });
});
