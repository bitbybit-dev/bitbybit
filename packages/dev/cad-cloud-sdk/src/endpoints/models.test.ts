import { describe, it, expect } from "vitest";
import { ModelsEndpoint } from "./models.js";
import { NO_WAIT, downloadsResponse, errorResponse, okResponse, spyFetcher, taskResponse } from "../__test__/helpers.js";

describe("ModelsEndpoint", () => {
    describe("list", () => {
        it("sends GET to /api/v1/models and returns data", async () => {
            // Arrange
            const modelList = { models: ["dragon-cup", "phone-nest"] };
            const { fn, calls } = spyFetcher(okResponse(modelList));
            const models = new ModelsEndpoint(fn);

            // Act
            const result = await models.list();

            // Assert
            expect(calls[0]!.method).toBe("GET");
            expect(calls[0]!.path).toBe("/api/v1/models");
            expect(result).toStrictEqual(modelList);
        });
    });

    describe("getParams", () => {
        it("sends GET to /api/v1/models/{name}/params", async () => {
            // Arrange
            const paramDef = { parameters: { height: { type: "number" } } };
            const { fn, calls } = spyFetcher(okResponse(paramDef));
            const models = new ModelsEndpoint(fn);

            // Act
            const result = await models.getParams("dragon-cup");

            // Assert
            expect(calls[0]!.method).toBe("GET");
            expect(calls[0]!.path).toBe("/api/v1/models/dragon-cup/params");
            expect(result).toStrictEqual(paramDef);
        });

        it("encodes special characters in model name", async () => {
            // Arrange
            const { fn, calls } = spyFetcher(okResponse({}));
            const models = new ModelsEndpoint(fn);

            // Act
            await models.getParams("my model");

            // Assert
            expect(calls[0]!.path).toBe("/api/v1/models/my%20model/params");
        });
    });

    describe("getDefinitions", () => {
        it("sends POST to /api/v1/models/definitions with names array", async () => {
            // Arrange
            const defs = { definitions: {} };
            const { fn, calls } = spyFetcher(okResponse(defs));
            const models = new ModelsEndpoint(fn);

            // Act
            const result = await models.getDefinitions(["dragon-cup", "phone-nest"]);

            // Assert
            expect(calls[0]!.method).toBe("POST");
            expect(calls[0]!.path).toBe("/api/v1/models/definitions");
            expect(calls[0]!.body).toStrictEqual({ names: ["dragon-cup", "phone-nest"] });
            expect(result).toStrictEqual(defs);
        });
    });

    describe("submit", () => {
        it("sends POST to /api/v1/models/{name} with body", async () => {
            // Arrange
            const taskResult = { taskId: "t-1", status: "queued" };
            const { fn, calls } = spyFetcher(okResponse(taskResult));
            const models = new ModelsEndpoint(fn);
            const body = { params: { height: 10 }, outputs: { formats: ["gltf"] } };

            // Act
            const result = await models.submit("dragon-cup", body as never);

            // Assert
            expect(calls[0]!.method).toBe("POST");
            expect(calls[0]!.path).toBe("/api/v1/models/dragon-cup");
            expect(calls[0]!.body).toStrictEqual(body);
            expect(result).toStrictEqual(taskResult);
        });
    });

    describe("batchSubmit", () => {
        it("sends POST to /api/v1/models/{name}/batch", async () => {
            // Arrange
            const compoundResult = { taskId: "c-1", subTasks: [{ taskId: "s-1", index: 0 }] };
            const { fn, calls } = spyFetcher(okResponse(compoundResult));
            const models = new ModelsEndpoint(fn);
            const body = { variations: [{ params: { height: 10 } }], outputs: { formats: ["gltf"] } };

            // Act
            const result = await models.batchSubmit("dragon-cup", body as never);

            // Assert
            expect(calls[0]!.method).toBe("POST");
            expect(calls[0]!.path).toBe("/api/v1/models/dragon-cup/batch");
            expect(result).toStrictEqual(compoundResult);
        });
    });

    // run and batchRun are the whole point of the endpoint: submit, poll, and collect what came out.
    describe("run", () => {
        it("submits the model, polls it, and returns its downloads", async () => {
            // Arrange
            const { fn, calls } = spyFetcher(
                okResponse({ taskId: "t-1", status: "queued" }),
                taskResponse("t-1", "completed"),
                downloadsResponse({ format: "glb", url: "https://example.test/model.glb" }),
            );
            const models = new ModelsEndpoint(fn);

            // Act
            const result = await models.run("gear", { outputs: { glb: true } } as never, NO_WAIT);

            // Assert
            expect(calls.map((call) => call.path)).toStrictEqual([
                "/api/v1/models/gear",
                "/api/v1/tasks/t-1",
                "/api/v1/tasks/t-1/results",
            ]);
            expect(result).toStrictEqual({ taskId: "t-1", downloads: [{ format: "glb", url: "https://example.test/model.glb" }] });
        });

        it("escapes a model name that needs it", async () => {
            // Arrange
            const { fn, calls } = spyFetcher(
                okResponse({ taskId: "t-1", status: "queued" }),
                taskResponse("t-1", "completed"),
                downloadsResponse(),
            );
            const models = new ModelsEndpoint(fn);

            // Act
            await models.run("gear/v2", { outputs: {} } as never, NO_WAIT);

            // Assert
            expect(calls[0]!.path).toBe("/api/v1/models/gear%2Fv2");
        });
    });

    describe("batchSubmit", () => {
        it("sends POST to the batch path and returns the compound task", async () => {
            // Arrange
            const compound = { taskId: "c-1", subTasks: [] };
            const { fn, calls } = spyFetcher(okResponse(compound));
            const models = new ModelsEndpoint(fn);

            // Act
            const result = await models.batchSubmit("gear", { variations: [] } as never);

            // Assert
            expect(calls[0]!.path).toBe("/api/v1/models/gear/batch");
            expect(result).toStrictEqual(compound);
        });
    });

    describe("batchRun", () => {
        it("returns the downloads of every sub task that completed", async () => {
            // Arrange
            const { fn } = spyFetcher(
                okResponse({ taskId: "c-1", subTasks: [{ taskId: "s-1", index: 0, status: "queued" }] }),
                taskResponse("c-1", "completed", { subTasks: [{ taskId: "s-1", index: 0, status: "completed" }] }),
                downloadsResponse({ format: "glb", url: "https://example.test/0.glb" }),
            );
            const models = new ModelsEndpoint(fn);

            // Act
            const result = await models.batchRun("gear", { variations: [] } as never, NO_WAIT);

            // Assert
            expect(result.subTasks).toStrictEqual([
                { taskId: "s-1", index: 0, downloads: [{ format: "glb", url: "https://example.test/0.glb" }] },
            ]);
        });

        it("returns no downloads for a sub task that did not complete", async () => {
            // Arrange
            const { fn } = spyFetcher(
                okResponse({ taskId: "c-1", subTasks: [{ taskId: "s-1", index: 0, status: "queued" }] }),
                taskResponse("c-1", "completed", { subTasks: [{ taskId: "s-1", index: 0, status: "failed" }] }),
            );
            const models = new ModelsEndpoint(fn);

            // Act
            const result = await models.batchRun("gear", { variations: [] } as never, NO_WAIT);

            // Assert
            expect(result.subTasks).toStrictEqual([{ taskId: "s-1", index: 0, downloads: [] }]);
        });

        it("returns no downloads for a sub task whose results cannot be fetched", async () => {
            // Arrange
            const { fn } = spyFetcher(
                okResponse({ taskId: "c-1", subTasks: [{ taskId: "s-1", index: 0, status: "queued" }] }),
                taskResponse("c-1", "completed", { subTasks: [{ taskId: "s-1", index: 0, status: "completed" }] }),
                errorResponse("NOT_FOUND", "results are gone", 404),
            );
            const models = new ModelsEndpoint(fn);

            // Act
            const result = await models.batchRun("gear", { variations: [] } as never, NO_WAIT);

            // Assert
            expect(result.subTasks).toStrictEqual([{ taskId: "s-1", index: 0, downloads: [] }]);
        });

        it("falls back to the sub tasks the submission reported when the compound task lists none", async () => {
            // Arrange
            const { fn } = spyFetcher(
                okResponse({ taskId: "c-1", subTasks: [{ taskId: "s-1", index: 0, status: "completed" }] }),
                taskResponse("c-1", "completed"),
                downloadsResponse({ format: "glb", url: "https://example.test/0.glb" }),
            );
            const models = new ModelsEndpoint(fn);

            // Act
            const result = await models.batchRun("gear", { variations: [] } as never, NO_WAIT);

            // Assert
            expect(result.subTasks[0]!.downloads).toHaveLength(1);
        });
    });
});
