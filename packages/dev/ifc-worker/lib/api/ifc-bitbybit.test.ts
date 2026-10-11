import { ifcDtoRegistry } from "@bitbybit-dev/ifc";
import { describe, expect, it, vi } from "vitest";
import { IFCWorkerManager } from "../ifc-worker/ifc-worker-manager";
import { IFCBitByBit } from "./ifc-bitbybit";

const methodAt = (root: object, path: string): unknown => path.split(".").reduce<unknown>((owner, segment) => (owner === null || owner === undefined ? undefined : Reflect.get(owner, segment)), root);

describe("IFCBitByBit", () => {
    it.each(Object.keys(ifcDtoRegistry))("should send %s to the worker under its own dotted path", async (path) => {
        // Arrange
        const manager = new IFCWorkerManager();
        const send = vi.spyOn(manager, "genericCallToWorkerPromise").mockResolvedValue("answer");
        const facade = new IFCBitByBit(manager);
        const method = methodAt(facade, path) as (inputs: object) => Promise<unknown>;
        const owner = methodAt(facade, path.split(".").slice(0, -1).join("."));
        const inputs = { marker: path };

        // Act
        const answer = await method.call(owner, inputs);

        // Assert
        expect(send).toHaveBeenCalledWith(path, inputs);
        expect(answer).toBe("answer");
    });
});
