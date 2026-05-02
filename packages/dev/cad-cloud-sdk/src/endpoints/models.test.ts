import { describe, it, expect } from "vitest";
import { ModelsEndpoint } from "./models.js";
import { okResponse, spyFetcher } from "../__test__/helpers.js";

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
            expect(calls[0].method).toBe("GET");
            expect(calls[0].path).toBe("/api/v1/models");
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
            expect(calls[0].method).toBe("GET");
            expect(calls[0].path).toBe("/api/v1/models/dragon-cup/params");
            expect(result).toStrictEqual(paramDef);
        });

        it("encodes special characters in model name", async () => {
            // Arrange
            const { fn, calls } = spyFetcher(okResponse({}));
            const models = new ModelsEndpoint(fn);

            // Act
            await models.getParams("my model");

            // Assert
            expect(calls[0].path).toBe("/api/v1/models/my%20model/params");
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
            expect(calls[0].method).toBe("POST");
            expect(calls[0].path).toBe("/api/v1/models/definitions");
            expect(calls[0].body).toStrictEqual({ names: ["dragon-cup", "phone-nest"] });
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
            expect(calls[0].method).toBe("POST");
            expect(calls[0].path).toBe("/api/v1/models/dragon-cup");
            expect(calls[0].body).toStrictEqual(body);
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
            expect(calls[0].method).toBe("POST");
            expect(calls[0].path).toBe("/api/v1/models/dragon-cup/batch");
            expect(result).toStrictEqual(compoundResult);
        });
    });
});
