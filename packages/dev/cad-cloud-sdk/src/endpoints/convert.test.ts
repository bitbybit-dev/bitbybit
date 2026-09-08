import { describe, it, expect } from "vitest";
import { ConvertEndpoint } from "./convert.js";
import { NO_WAIT, downloadsResponse, okResponse, spyFetcher, taskResponse } from "../__test__/helpers.js";

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
            expect(calls[0]!.method).toBe("POST");
            expect(calls[0]!.path).toBe("/api/v1/convert/step-to-gltf");
            expect(calls[0]!.body).toStrictEqual(body);
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
            expect(calls[0]!.method).toBe("POST");
            expect(calls[0]!.path).toBe("/api/v1/convert/step-to-gltf-advanced");
            expect(result).toStrictEqual(taskResult);
        });
    });

    describe("stepToGltfWithDraco", () => {
        it("sends POST to /api/v1/convert/step-to-gltf-with-draco and returns task result", async () => {
            // Arrange
            const taskResult = { taskId: "t-3", status: "queued" };
            const { fn, calls } = spyFetcher(okResponse(taskResult));
            const convert = new ConvertEndpoint(fn);

            // Act
            const result = await convert.stepToGltfWithDraco({ fileId: "f-3" } as never);

            // Assert
            expect(calls[0]!.path).toBe("/api/v1/convert/step-to-gltf-with-draco");
            expect(result).toStrictEqual(taskResult);
        });
    });

    describe("stepToGltfAdvancedWithDraco", () => {
        it("sends POST to /api/v1/convert/step-to-gltf-advanced-with-draco and returns task result", async () => {
            // Arrange
            const taskResult = { taskId: "t-4", status: "queued" };
            const { fn, calls } = spyFetcher(okResponse(taskResult));
            const convert = new ConvertEndpoint(fn);

            // Act
            const result = await convert.stepToGltfAdvancedWithDraco({ fileId: "f-4" } as never);

            // Assert
            expect(calls[0]!.path).toBe("/api/v1/convert/step-to-gltf-advanced-with-draco");
            expect(result).toStrictEqual(taskResult);
        });
    });

    describe("stepToGltfAndPoll", () => {
        it("submits, polls until the task completes, and returns its downloads", async () => {
            // Arrange
            const { fn, calls } = spyFetcher(
                okResponse({ taskId: "t-1", status: "queued" }),
                taskResponse("t-1", "completed"),
                downloadsResponse({ format: "glb", url: "https://example.test/model.glb" }),
            );
            const convert = new ConvertEndpoint(fn);

            // Act
            const result = await convert.stepToGltfAndPoll({ fileId: "f-1" } as never, NO_WAIT);

            // Assert
            expect(calls.map((call) => call.path)).toStrictEqual([
                "/api/v1/convert/step-to-gltf",
                "/api/v1/tasks/t-1",
                "/api/v1/tasks/t-1/results",
            ]);
            expect(result).toStrictEqual({ taskId: "t-1", downloads: [{ format: "glb", url: "https://example.test/model.glb" }] });
        });
    });

    describe("stepToGltfAdvancedAndPoll", () => {
        it("submits, polls until the task completes, and returns its downloads", async () => {
            // Arrange
            const { fn, calls } = spyFetcher(
                okResponse({ taskId: "t-2", status: "queued" }),
                taskResponse("t-2", "completed"),
                downloadsResponse({ format: "glb", url: "https://example.test/model.glb" }),
            );
            const convert = new ConvertEndpoint(fn);

            // Act
            const result = await convert.stepToGltfAdvancedAndPoll({ fileId: "f-2" } as never, NO_WAIT);

            // Assert
            expect(calls[0]!.path).toBe("/api/v1/convert/step-to-gltf-advanced");
            expect(result.taskId).toBe("t-2");
        });
    });

    describe("stepToGltfWithDracoAndPoll", () => {
        it("submits, polls until the task completes, and returns its downloads", async () => {
            // Arrange
            const { fn, calls } = spyFetcher(
                okResponse({ taskId: "t-3", status: "queued" }),
                taskResponse("t-3", "completed"),
                downloadsResponse({ format: "glb", url: "https://example.test/model.glb" }),
            );
            const convert = new ConvertEndpoint(fn);

            // Act
            const result = await convert.stepToGltfWithDracoAndPoll({ fileId: "f-3" } as never, NO_WAIT);

            // Assert
            expect(calls[0]!.path).toBe("/api/v1/convert/step-to-gltf-with-draco");
            expect(result.downloads).toHaveLength(1);
        });
    });

    describe("stepToGltfAdvancedWithDracoAndPoll", () => {
        it("submits, polls until the task completes, and returns its downloads", async () => {
            // Arrange
            const { fn, calls } = spyFetcher(
                okResponse({ taskId: "t-4", status: "queued" }),
                taskResponse("t-4", "completed"),
                downloadsResponse({ format: "glb", url: "https://example.test/model.glb" }),
            );
            const convert = new ConvertEndpoint(fn);

            // Act
            const result = await convert.stepToGltfAdvancedWithDracoAndPoll({ fileId: "f-4" } as never, NO_WAIT);

            // Assert
            expect(calls[0]!.path).toBe("/api/v1/convert/step-to-gltf-advanced-with-draco");
            expect(result.taskId).toBe("t-4");
        });
    });
});
