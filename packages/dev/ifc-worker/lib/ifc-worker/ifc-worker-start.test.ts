import { afterEach, describe, expect, it, vi } from "vitest";
import { initializationComplete, onMessageInput } from "./ifc-worker";

describe("the IFC worker before it starts", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("should hold a call that arrives before it starts and answer it once started", () => {
        // Arrange
        const posted: unknown[] = [];
        const announced: unknown[] = [];
        onMessageInput({ uid: "early", action: { functionName: "model.create", inputs: { name: "Early", seed: "start" } } }, (message) => posted.push(message));
        const before = [...posted];

        // Act
        initializationComplete(false, (message) => announced.push(message));

        // Assert
        expect(before).toEqual([]);
        expect(announced).toEqual(["ifc-initialised"]);
        expect(posted).toEqual(["busy", { uid: "early", result: { hash: expect.any(Number), type: "ifc-model" } }]);
    });

    it("should not announce itself when asked not to", () => {
        // Arrange
        const announced: unknown[] = [];

        // Act
        initializationComplete(true, (message) => announced.push(message));

        // Assert
        expect(announced).toEqual([]);
    });

    it("should announce itself through the worker's own postMessage when given nowhere else", () => {
        // Arrange
        const announced = vi.fn();
        vi.stubGlobal("postMessage", announced);

        // Act
        initializationComplete();

        // Assert
        expect(announced).toHaveBeenCalledWith("ifc-initialised");
    });
});
