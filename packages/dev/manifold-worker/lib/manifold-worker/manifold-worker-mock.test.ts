import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ManifoldWorkerMock } from "./manifold-worker-mock";
import { DataInput, initializationComplete, onMessageInput } from "./manifold-worker";

vi.mock("./manifold-worker", () => ({
    initializationComplete: vi.fn(),
    onMessageInput: vi.fn(),
}));

const A_CALL: DataInput = { action: { functionName: "manifold.shapes.cube", inputs: { size: 1 } }, uid: "call-1" };

describe("ManifoldWorkerMock unit tests", () => {
    let mock: ManifoldWorkerMock;

    beforeEach(() => {
        vi.clearAllMocks();
        mock = new ManifoldWorkerMock();
    });

    describe("initializationComplete", () => {
        it("should hand the kernel and its plugins to the worker's own initialiser", () => {
            // Arrange
            const kernel = { primitives: {} };
            const plugins = { dependencies: {} };

            // Act
            mock.initializationComplete(kernel, plugins, true);

            // Assert
            expect(initializationComplete).toHaveBeenCalledWith(kernel, plugins, true);
        });
    });

    describe("postMessage", () => {
        it("should run the call the message carries", () => {
            // Act
            mock.postMessage(A_CALL);

            // Assert
            expect(onMessageInput).toHaveBeenCalledTimes(1);
            expect(vi.mocked(onMessageInput).mock.calls[0]?.[0]).toBe(A_CALL);
        });

        it("should treat the busy notice as nothing to run", () => {
            // Act
            mock.postMessage("busy");

            // Assert
            expect(onMessageInput).not.toHaveBeenCalled();
        });

        it("should return the worker's answer on its own onmessage", () => {
            // Arrange
            const received: unknown[] = [];
            mock.onmessage = ({ data }) => received.push(data);
            vi.mocked(onMessageInput).mockImplementation((_input, post) => post({ uid: "call-1", result: "a-manifold" }));

            // Act
            mock.postMessage(A_CALL);

            // Assert
            expect(received).toEqual([{ uid: "call-1", result: "a-manifold" }]);
        });
    });

    describe("onMessageInput without a listener", () => {
        let logged: unknown[];

        beforeEach(() => {
            logged = [];
            vi.spyOn(console, "log").mockImplementation((message: unknown) => { logged.push(message); });
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("should say so rather than throw when nothing is listening", () => {
            // Arrange
            vi.mocked(onMessageInput).mockImplementation((_input, post) => post({ uid: "call-1" }));

            // Act
            mock.onMessageInput(A_CALL);

            // Assert
            expect(logged).toEqual(["No onmessage function defined"]);
        });
    });
});
