import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BitbybitClient } from "./client.js";

// Mock global fetch for health() and request()
const fetchMock = vi.fn();

describe("BitbybitClient", () => {
    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("constructor", () => {
        it("throws when apiKey is empty", () => {
            // Act
            const act = () => new BitbybitClient({ apiKey: "" });

            // Assert
            expect(act).toThrow("BitbybitClient requires an apiKey");
        });

        it("creates endpoint instances", () => {
            // Act
            const client = new BitbybitClient({ apiKey: "bbk_test" });

            // Assert
            expect(client.models).not.toBe(undefined);
            expect(client.tasks).not.toBe(undefined);
            expect(client.cad).not.toBe(undefined);
            expect(client.convert).not.toBe(undefined);
            expect(client.files).not.toBe(undefined);
        });

        it("strips trailing slashes from baseUrl", async () => {
            // Arrange
            const client = new BitbybitClient({ apiKey: "bbk_test", baseUrl: "https://api.example.com//" });
            fetchMock.mockResolvedValueOnce(
                new Response(JSON.stringify({ ok: true, data: [] }), { status: 200 }),
            );

            // Act
            await client.request("GET", "/api/v1/models");

            // Assert
            expect(fetchMock).toHaveBeenCalledWith(
                "https://api.example.com/api/v1/models",
                expect.objectContaining({ method: "GET" }),
            );
        });
    });

    describe("request", () => {
        it("sends x-api-key and Content-Type headers", async () => {
            // Arrange
            const client = new BitbybitClient({ apiKey: "bbk_mykey" });
            fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));

            // Act
            await client.request("GET", "/api/v1/tasks");

            // Assert
            const callArgs = fetchMock.mock.calls[0];
            expect(callArgs[1].headers["x-api-key"]).toBe("bbk_mykey");
            expect(callArgs[1].headers["Content-Type"]).toBe("application/json");
        });

        it("sends JSON body for POST requests", async () => {
            // Arrange
            const client = new BitbybitClient({ apiKey: "bbk_test", validate: false });
            fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));
            const body = { operation: "test", params: {} };

            // Act
            await client.request("POST", "/api/v1/cad/execute", body);

            // Assert
            expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify(body));
        });

        it("does not send body for GET requests", async () => {
            // Arrange
            const client = new BitbybitClient({ apiKey: "bbk_test" });
            fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));

            // Act
            await client.request("GET", "/api/v1/tasks");

            // Assert
            expect(fetchMock.mock.calls[0][1].body).toBe(undefined);
        });

        it("uses default base URL when none provided", async () => {
            // Arrange
            const client = new BitbybitClient({ apiKey: "bbk_test" });
            fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));

            // Act
            await client.request("GET", "/api/v1/tasks");

            // Assert
            expect(fetchMock.mock.calls[0][0]).toBe("https://api.bitbybit.dev/api/v1/tasks");
        });

        it("skips validation when validate is false", async () => {
            // Arrange
            const client = new BitbybitClient({ apiKey: "bbk_test", validate: false });
            fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));
            const invalidBody = {}; // missing required fields

            // Act & Assert (should not throw validation error)
            await expect(client.request("POST", "/api/v1/cad/execute", invalidBody)).resolves.toBeInstanceOf(Response);
        });

        it("skips validation for GET requests even when validate is true", async () => {
            // Arrange
            const client = new BitbybitClient({ apiKey: "bbk_test", validate: true });
            fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));

            // Act & Assert (GET with body should not trigger validation)
            await expect(client.request("GET", "/api/v1/tasks", {})).resolves.toBeInstanceOf(Response);
        });
    });

    describe("health", () => {
        it("fetches from /health endpoint", async () => {
            // Arrange
            const healthData = { ok: true, instance: "worker-1", timestamp: "2024-01-01T00:00:00Z" };
            const client = new BitbybitClient({ apiKey: "bbk_test" });
            fetchMock.mockResolvedValueOnce(
                new Response(JSON.stringify(healthData), { status: 200 }),
            );

            // Act
            const result = await client.health();

            // Assert
            expect(fetchMock.mock.calls[0][0]).toBe("https://api.bitbybit.dev/health");
            expect(result).toStrictEqual(healthData);
        });
    });
});
