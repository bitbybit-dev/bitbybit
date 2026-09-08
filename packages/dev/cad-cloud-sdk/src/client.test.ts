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
        it("sends x-api-key on every request and Content-Type only with a body", async () => {
            // Arrange
            const client = new BitbybitClient({ apiKey: "bbk_mykey" });
            fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

            // Act
            await client.request("GET", "/api/v1/tasks");
            await client.request("POST", "/api/v1/tasks", { kind: "probe" });

            // Assert
            const [getArgs, postArgs] = fetchMock.mock.calls;
            expect(getArgs![1].headers["x-api-key"]).toBe("bbk_mykey");
            expect(getArgs![1].headers["Content-Type"]).toBeUndefined();
            expect(getArgs![1].body).toBeUndefined();
            expect(postArgs![1].headers["x-api-key"]).toBe("bbk_mykey");
            expect(postArgs![1].headers["Content-Type"]).toBe("application/json");
            expect(postArgs![1].body).toBe(JSON.stringify({ kind: "probe" }));
        });

        it("sends JSON body for POST requests", async () => {
            // Arrange
            const client = new BitbybitClient({ apiKey: "bbk_test", validate: false });
            fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));
            const body = { operation: "test", params: {} };

            // Act
            await client.request("POST", "/api/v1/cad/execute", body);

            // Assert
            expect(fetchMock.mock.calls[0]![1].body).toBe(JSON.stringify(body));
        });

        it("does not send body for GET requests", async () => {
            // Arrange
            const client = new BitbybitClient({ apiKey: "bbk_test" });
            fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));

            // Act
            await client.request("GET", "/api/v1/tasks");

            // Assert
            expect(fetchMock.mock.calls[0]![1].body).toBe(undefined);
        });

        it("uses default base URL when none provided", async () => {
            // Arrange
            const client = new BitbybitClient({ apiKey: "bbk_test" });
            fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));

            // Act
            await client.request("GET", "/api/v1/tasks");

            // Assert
            expect(fetchMock.mock.calls[0]![0]).toBe("https://api.bitbybit.dev/api/v1/tasks");
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
            expect(fetchMock.mock.calls[0]![0]).toBe("https://api.bitbybit.dev/health");
            expect(result).toStrictEqual(healthData);
        });
    });

    // Which schema a request body is checked against is decided from its path: a fixed table for the
    // endpoints that have one, and two patterns for the model paths, where a model with a schema of
    // its own is checked against that one and any other against the generic submission schema.
    describe("request validation by path", () => {
        it("refuses a body the endpoint's schema rejects", async () => {
            // Arrange
            const client = new BitbybitClient({ apiKey: "bbk_test" });
            fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

            // Act & Assert
            await expect(client.request("POST", "/api/v1/cad/execute", {})).rejects.toThrow();
        });

        it("checks a model with a schema of its own against that schema", async () => {
            // Arrange
            const client = new BitbybitClient({ apiKey: "bbk_test" });
            fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

            // Act & Assert
            await expect(client.request("POST", "/api/v1/models/dragon-cup", { params: { height: "tall" } })).rejects.toThrow();
        });

        it("checks a model with no schema of its own against the generic one", async () => {
            // Arrange
            const client = new BitbybitClient({ apiKey: "bbk_test" });
            fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

            // Act & Assert
            await expect(client.request("POST", "/api/v1/models/no-such-model", { outputs: 7 })).rejects.toThrow();
        });

        it("checks a batch submission against the batch schema", async () => {
            // Arrange
            const client = new BitbybitClient({ apiKey: "bbk_test" });
            fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

            // Act & Assert
            await expect(client.request("POST", "/api/v1/models/dragon-cup/batch", { variations: "many" })).rejects.toThrow();
        });

        it("sends a body on a path no schema covers without checking it", async () => {
            // Arrange
            const client = new BitbybitClient({ apiKey: "bbk_test" });
            fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

            // Act & Assert
            await expect(client.request("POST", "/api/v1/something/new", { anything: true })).resolves.toBeInstanceOf(Response);
        });

        it("trims a trailing slash from the base url it was given", async () => {
            // Arrange
            const client = new BitbybitClient({ apiKey: "bbk_test", baseUrl: "https://staging.example.test/" });
            fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));

            // Act
            await client.request("GET", "/api/v1/tasks");

            // Assert
            expect(fetchMock.mock.calls[0]![0]).toBe("https://staging.example.test/api/v1/tasks");
        });
    });
});
