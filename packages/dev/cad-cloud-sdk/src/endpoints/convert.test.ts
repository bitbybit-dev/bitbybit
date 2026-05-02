import { describe, it, expect } from "vitest";
import { ConvertEndpoint } from "./convert.js";
import { okResponse, spyFetcher } from "../__test__/helpers.js";

describe("ConvertEndpoint", () => {
    describe("stepToGltf", () => {
        it("sends POST to /api/v1/convert/step-to-gltf and returns task result", async () => {
            // Arrange
            const taskResult = { taskId: "t-1", status: "queued" };
            const { fn, calls } = spyFetcher(okResponse(taskResult));
            const convert = new ConvertEndpoint(fn);
            const body = { fileId: "f-1" };

            // Act
            const result = await convert.stepToGltf(body as never);

            // Assert
            expect(calls[0].method).toBe("POST");
            expect(calls[0].path).toBe("/api/v1/convert/step-to-gltf");
            expect(calls[0].body).toStrictEqual(body);
            expect(result).toStrictEqual(taskResult);
        });
    });

    describe("stepToGltfAdvanced", () => {
        it("sends POST to /api/v1/convert/step-to-gltf-advanced and returns task result", async () => {
            // Arrange
            const taskResult = { taskId: "t-2", status: "queued" };
            const { fn, calls } = spyFetcher(okResponse(taskResult));
            const convert = new ConvertEndpoint(fn);
            const body = { fileId: "f-2", options: { quality: "high" } };

            // Act
            const result = await convert.stepToGltfAdvanced(body as never);

            // Assert
            expect(calls[0].method).toBe("POST");
            expect(calls[0].path).toBe("/api/v1/convert/step-to-gltf-advanced");
            expect(result).toStrictEqual(taskResult);
        });
    });
});
