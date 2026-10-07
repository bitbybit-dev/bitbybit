import { KernelCallError } from "@bitbybit-dev/base";
import { beforeEach, describe, expect, it } from "vitest";
import { BitByBitIFC } from "../api/bitbybit-ifc";
import { IFCWorkerMock } from "./ifc-worker-mock";
import type { DataInput } from "./worker-types";
import { IFCWorkerHandler } from "./ifc-worker";

const ABOVE_CACHE_THRESHOLD = 10001;

function startedHandler(): IFCWorkerHandler {
    const handler = new IFCWorkerHandler();
    handler.initializationComplete(() => undefined, true);
    return handler;
}

function started(): BitByBitIFC {
    const mock = new IFCWorkerMock();
    const facade = new BitByBitIFC();
    facade.init(mock);
    mock.initializationComplete();
    return facade;
}

describe("the IFC worker", () => {
    let facade: BitByBitIFC;

    beforeEach(() => {
        facade = started();
    });

    it("should answer a model with a handle and accept the handle in the next call", async () => {
        // Arrange
        const model = await facade.ifc.model.create({ name: "House", seed: "worker" });

        // Act
        const storey = await facade.ifc.spatial.addStorey({ model, id: "ground", name: "Ground" });
        const summary = await facade.ifc.model.summary({ model: storey });

        // Assert
        expect(model).toEqual({ hash: expect.any(Number), type: "ifc-model" });
        expect(summary.storeys.map((info) => info.name)).toEqual(["Ground"]);
    });

    it("should give the same handle for the same call, and a different one for a different call", async () => {
        // Act
        const first = await facade.ifc.model.create({ name: "House", seed: "worker" });
        const again = await facade.ifc.model.create({ name: "House", seed: "worker" });
        const other = await facade.ifc.model.create({ name: "Shed", seed: "worker" });

        // Assert
        expect(again).toEqual(first);
        expect(other.hash).not.toBe(first.hash);
    });

    it("should leave a model a later call changed as it was", async () => {
        // Arrange
        const model = await facade.ifc.model.create({ name: "House", seed: "worker" });

        // Act
        await facade.ifc.spatial.addStorey({ model, id: "ground" });
        const summary = await facade.ifc.model.summary({ model });

        // Assert
        expect(summary.storeys).toEqual([]);
    });

    it("should hand a recipe back with its buffers intact", async () => {
        // Arrange
        let model = await facade.ifc.model.create({ seed: "worker" });
        model = await facade.ifc.spatial.addStorey({ model, id: "ground" });
        model = await facade.ifc.walls.add({ model, storey: "ground", start: [0, 0], end: [4000, 0] });

        // Act
        const recipe = await facade.ifc.geometry.recipe({ model });

        // Assert
        expect(recipe.buffers.f64).toBeInstanceOf(Float64Array);
        expect(recipe.roots).toHaveLength(1);
    });

    it("should read a file given as bytes and key it by the bytes' contents", async () => {
        // Arrange
        const model = await facade.ifc.model.create({ name: "House", seed: "worker" });
        const text = await facade.ifc.model.write({ model, timeStamp: "2026-10-06T12:00:00" });
        const bytes = new TextEncoder().encode(text);

        // Act
        const first = await facade.ifc.model.read({ data: bytes });
        const second = await facade.ifc.model.read({ data: bytes.slice() });
        const summary = await facade.ifc.model.summary({ model: first });

        // Assert
        expect(second).toEqual(first);
        expect(summary.project).toBe("House");
    });

    it("should reject a failed call with a kernel call error naming the call", async () => {
        // Arrange
        const model = await facade.ifc.model.create({ seed: "worker" });

        // Act
        const failure = await facade.ifc.walls.add({ model, storey: "missing", start: [0, 0], end: [1, 0] }).catch((error: unknown) => error);

        // Assert
        expect(failure).toBeInstanceOf(KernelCallError);
        expect((failure as KernelCallError).functionName).toBe("walls.add");
        expect((failure as KernelCallError).message).toContain("The model has no storey 'missing'");
    });

    it("should refuse a handle it does not hold", async () => {
        // Act
        const failure = await facade.ifc.model.summary({ model: { hash: 12345, type: "ifc-model" } }).catch((error: unknown) => error);

        // Assert
        expect((failure as Error).message).toContain("The IFC model with handle 12345 is not held by the worker");
    });

    it("should forget every model when its cache is cleaned", async () => {
        // Arrange
        const model = await facade.ifc.model.create({ seed: "worker" });

        // Act
        await facade.ifcWorkerManager.cleanAllCache();
        const failure = await facade.ifc.model.summary({ model }).catch((error: unknown) => error);

        // Assert
        expect(failure).toBeInstanceOf(KernelCallError);
    });

    it("should keep its models when a run starts below the cache threshold", async () => {
        // Arrange
        const model = await facade.ifc.model.create({ name: "Kept", seed: "worker" });

        // Act
        await facade.ifcWorkerManager.startedTheRun();
        const summary = await facade.ifc.model.summary({ model });

        // Assert
        expect(summary.project).toBe("Kept");
    });

    it("should drop its models when a run starts above the cache threshold", async () => {
        // Arrange
        const first = await facade.ifc.model.create({ name: "First", seed: "worker" });
        for (let index = 0; index < ABOVE_CACHE_THRESHOLD; index++) {
            await facade.ifc.model.create({ name: `Model ${index}`, seed: "worker" });
        }

        // Act
        await facade.ifcWorkerManager.startedTheRun();
        const failure = await facade.ifc.model.summary({ model: first }).catch((error: unknown) => error);

        // Assert
        expect((failure as Error).message).toContain("is not held by the worker");
    });

    it("should post busy before every answer", () => {
        // Arrange
        const posted: unknown[] = [];

        // Act
        startedHandler().onMessageInput({ uid: "a", action: { functionName: "cleanAllCache", inputs: {} } }, (message) => posted.push(message));

        // Assert
        expect(posted).toEqual(["busy", { uid: "a", result: {} }]);
    });

    it("should answer even when the failure cannot be described", () => {
        // Arrange
        const posted: unknown[] = [];
        const hostile = { uid: "b", action: { functionName: "model.summary", get inputs(): never { throw new Error("unreadable"); } } };

        // Act
        startedHandler().onMessageInput(hostile, (message) => posted.push(message));

        // Assert
        expect(posted.at(-1)).toMatchObject({ uid: "b", result: undefined, errorKind: expect.any(String) });
    });

    it("should describe the failure of a call that names no method", () => {
        // Arrange
        const posted: unknown[] = [];
        const unnamed: DataInput = JSON.parse("{\"uid\":\"c\",\"action\":{\"inputs\":{}}}");

        // Act
        startedHandler().onMessageInput(unnamed, (message) => posted.push(message));

        // Assert
        expect(posted.at(-1)).toMatchObject({ uid: "c", result: undefined, errorKind: "input", error: expect.stringContaining("An IFC call must name the method it calls") });
    });

    it("should name no method when a failure that cannot be described has none", () => {
        // Arrange
        const posted: unknown[] = [];
        const hostile = { uid: "d", action: { functionName: "", get inputs(): never { throw new Error("unreadable"); } } };

        // Act
        startedHandler().onMessageInput(hostile, (message) => posted.push(message));

        // Assert
        expect(posted.at(-1)).toEqual({ uid: "d", result: undefined, error: "IFC call failed, and the failure could not be reported.", errorKind: "kernel" });
    });
});
