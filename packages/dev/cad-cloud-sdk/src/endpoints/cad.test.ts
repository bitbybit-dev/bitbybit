import { describe, it, expect } from "vitest";
import { CadEndpoint } from "./cad.js";
import { okResponse, spyFetcher } from "../__test__/helpers.js";

describe("CadEndpoint", () => {
    describe("execute", () => {
        it("sends POST to /api/v1/cad/execute and returns data", async () => {
            // Arrange
            const taskResult = { taskId: "t-1", status: "queued" };
            const { fn, calls } = spyFetcher(okResponse(taskResult));
            const cad = new CadEndpoint(fn);
            const body = { operation: "occt.shapes.solid.createBox", params: { width: 10 } };

            // Act
            const result = await cad.execute(body as never);

            // Assert
            expect(calls[0].method).toBe("POST");
            expect(calls[0].path).toBe("/api/v1/cad/execute");
            expect(calls[0].body).toStrictEqual(body);
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
            const result = await cad.pipeline(body as never);

            // Assert
            expect(calls[0].method).toBe("POST");
            expect(calls[0].path).toBe("/api/v1/cad/pipeline");
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
            expect(calls[0].method).toBe("POST");
            expect(calls[0].path).toBe("/api/v1/cad/compound");
            expect(result).toStrictEqual(compoundResult);
        });
    });
});
