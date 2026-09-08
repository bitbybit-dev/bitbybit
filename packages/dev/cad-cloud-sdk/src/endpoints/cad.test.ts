import { describe, it, expect } from "vitest";
import { CadEndpoint } from "./cad.js";
import { NO_WAIT, downloadsResponse, okResponse, spyFetcher, taskResponse } from "../__test__/helpers.js";

describe("CadEndpoint", () => {
    describe("execute", () => {
        it("sends POST to /api/v1/cad/execute and returns data", async () => {
            // Arrange
            const taskResult = { taskId: "t-1", status: "queued" };
            const { fn, calls } = spyFetcher(okResponse(taskResult));
            const cad = new CadEndpoint(fn);
            const body = { operation: "occt.shapes.solid.createBox", params: { width: 10 } };

            // Act
            const result = await cad.execute(body);

            // Assert
            expect(calls[0]!.method).toBe("POST");
            expect(calls[0]!.path).toBe("/api/v1/cad/execute");
            expect(calls[0]!.body).toStrictEqual(body);
            expect(result).toStrictEqual(taskResult);
        });
    });

    describe("pipeline", () => {
        it("sends POST to /api/v1/cad/pipeline and returns data", async () => {
            // Arrange
            const taskResult = { taskId: "t-2", status: "queued" };
            const { fn, calls } = spyFetcher(okResponse(taskResult));
            const cad = new CadEndpoint(fn);
            const body = { steps: [{ operation: "test", params: {} }] };

            // Act
            const result = await cad.pipeline(body);

            // Assert
            expect(calls[0]!.method).toBe("POST");
            expect(calls[0]!.path).toBe("/api/v1/cad/pipeline");
            expect(result).toStrictEqual(taskResult);
        });
    });

    describe("compound", () => {
        it("sends POST to /api/v1/cad/compound and returns data", async () => {
            // Arrange
            const compoundResult = { taskId: "c-1", subTasks: [{ taskId: "s-1", index: 0 }] };
            const { fn, calls } = spyFetcher(okResponse(compoundResult));
            const cad = new CadEndpoint(fn);

            // Act
            const result = await cad.compound({ operations: [] } as never);

            // Assert
            expect(calls[0]!.method).toBe("POST");
            expect(calls[0]!.path).toBe("/api/v1/cad/compound");
            expect(result).toStrictEqual(compoundResult);
        });
    });

    // The two "and poll" members are the same three steps in a row: submit, poll the task until it is
    // done, then ask for every download the task produced.
    describe("executeAndPoll", () => {
        it("submits, polls until the task completes, and returns its downloads", async () => {
            // Arrange
            const { fn, calls } = spyFetcher(
                okResponse({ taskId: "t-1", status: "queued" }),
                taskResponse("t-1", "completed"),
                downloadsResponse({ format: "step", url: "https://example.test/part.step" }),
            );
            const cad = new CadEndpoint(fn);

            // Act
            const result = await cad.executeAndPoll({ operation: "box" }, NO_WAIT);

            // Assert
            expect(calls.map((call) => call.path)).toStrictEqual([
                "/api/v1/cad/execute",
                "/api/v1/tasks/t-1",
                "/api/v1/tasks/t-1/results",
            ]);
            expect(result).toStrictEqual({ taskId: "t-1", downloads: [{ format: "step", url: "https://example.test/part.step" }] });
        });
    });

    describe("pipelineAndPoll", () => {
        it("submits, polls until the task completes, and returns its downloads", async () => {
            // Arrange
            const { fn, calls } = spyFetcher(
                okResponse({ taskId: "t-2", status: "queued" }),
                taskResponse("t-2", "completed"),
                downloadsResponse({ format: "glb", url: "https://example.test/part.glb" }),
            );
            const cad = new CadEndpoint(fn);

            // Act
            const result = await cad.pipelineAndPoll({ steps: [] }, NO_WAIT);

            // Assert
            expect(calls[0]!.path).toBe("/api/v1/cad/pipeline");
            expect(result.taskId).toBe("t-2");
        });
    });
});
