import { describe, it, expect } from "vitest";
import { TasksEndpoint } from "./tasks.js";
import { okResponse, spyFetcher } from "../__test__/helpers.js";

describe("TasksEndpoint", () => {
    describe("get", () => {
        it("sends GET to /api/v1/tasks/{id} and returns task detail", async () => {
            // Arrange
            const task = { taskId: "t-1", status: "completed", kind: "model" };
            const { fn, calls } = spyFetcher(okResponse(task));
            const tasks = new TasksEndpoint(fn);

            // Act
            const result = await tasks.get("t-1");

            // Assert
            expect(calls[0].method).toBe("GET");
            expect(calls[0].path).toBe("/api/v1/tasks/t-1");
            expect(result).toStrictEqual(task);
        });

        it("encodes special characters in taskId", async () => {
            // Arrange
            const { fn, calls } = spyFetcher(okResponse({}));
            const tasks = new TasksEndpoint(fn);

            // Act
            await tasks.get("task/special");

            // Assert
            expect(calls[0].path).toBe("/api/v1/tasks/task%2Fspecial");
        });
    });

    describe("list", () => {
        it("sends GET to /api/v1/tasks without query when none provided", async () => {
            // Arrange
            const taskList = { tasks: [], total: 0 };
            const { fn, calls } = spyFetcher(okResponse(taskList));
            const tasks = new TasksEndpoint(fn);

            // Act
            const result = await tasks.list();

            // Assert
            expect(calls[0].method).toBe("GET");
            expect(calls[0].path).toBe("/api/v1/tasks");
            expect(result).toStrictEqual(taskList);
        });

        it("appends query parameters when provided", async () => {
            // Arrange
            const { fn, calls } = spyFetcher(okResponse({ tasks: [], total: 0 }));
            const tasks = new TasksEndpoint(fn);

            // Act
            await tasks.list({ page: 2, limit: 10, status: "completed", kind: "model" });

            // Assert
            expect(calls[0].path).toContain("page=2");
            expect(calls[0].path).toContain("limit=10");
            expect(calls[0].path).toContain("status=completed");
            expect(calls[0].path).toContain("kind=model");
        });
    });

    describe("getResult", () => {
        it("sends GET to /api/v1/tasks/{id}/result without format", async () => {
            // Arrange
            const { fn, calls } = spyFetcher(okResponse({ downloadUrl: "https://example.com/r" }));
            const tasks = new TasksEndpoint(fn);

            // Act
            await tasks.getResult("t-1");

            // Assert
            expect(calls[0].path).toBe("/api/v1/tasks/t-1/result");
        });

        it("appends format to path when provided", async () => {
            // Arrange
            const { fn, calls } = spyFetcher(okResponse({ downloadUrl: "https://example.com/r" }));
            const tasks = new TasksEndpoint(fn);

            // Act
            await tasks.getResult("t-1", "glb" as never);

            // Assert
            expect(calls[0].path).toBe("/api/v1/tasks/t-1/result/glb");
        });
    });

    describe("getResults", () => {
        it("sends GET to /api/v1/tasks/{id}/results and returns downloads array", async () => {
            // Arrange
            const downloads = [{ format: "glb", downloadUrl: "https://example.com/r.glb" }];
            const { fn, calls } = spyFetcher(okResponse({ downloads }));
            const tasks = new TasksEndpoint(fn);

            // Act
            const result = await tasks.getResults("t-1");

            // Assert
            expect(calls[0].path).toBe("/api/v1/tasks/t-1/results");
            expect(result).toStrictEqual(downloads);
        });
    });

    describe("cancel", () => {
        it("sends DELETE to /api/v1/tasks/{id}", async () => {
            // Arrange
            const { fn, calls } = spyFetcher(okResponse({ cancelled: true }));
            const tasks = new TasksEndpoint(fn);

            // Act
            const result = await tasks.cancel("t-1");

            // Assert
            expect(calls[0].method).toBe("DELETE");
            expect(calls[0].path).toBe("/api/v1/tasks/t-1");
            expect(result).toStrictEqual({ cancelled: true });
        });
    });

    describe("retry", () => {
        it("sends POST to /api/v1/tasks/{id}/retry", async () => {
            // Arrange
            const taskResult = { taskId: "t-2", status: "queued" };
            const { fn, calls } = spyFetcher(okResponse(taskResult));
            const tasks = new TasksEndpoint(fn);

            // Act
            const result = await tasks.retry("t-1");

            // Assert
            expect(calls[0].method).toBe("POST");
            expect(calls[0].path).toBe("/api/v1/tasks/t-1/retry");
            expect(result).toStrictEqual(taskResult);
        });
    });

    describe("getCompoundResult", () => {
        it("sends GET to /api/v1/tasks/{id}/result", async () => {
            // Arrange
            const manifest = { subTasks: [{ taskId: "s-1", downloads: [] }] };
            const { fn, calls } = spyFetcher(okResponse(manifest));
            const tasks = new TasksEndpoint(fn);

            // Act
            const result = await tasks.getCompoundResult("c-1");

            // Assert
            expect(calls[0].path).toBe("/api/v1/tasks/c-1/result");
            expect(result).toStrictEqual(manifest);
        });
    });
});
