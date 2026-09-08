import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { JSCADWorkerMock } from "./jscad-worker-mock";
import { DataInput, initializationComplete, onMessageInput } from "./jscad-worker";

// The mock stands where a real Worker would for consumers that run the kernel on the main thread.
// It has to behave like one from the outside: a message posted in comes back out on onmessage, and
// the "busy" notice a real worker sends to itself is not a call to run anything.
vi.mock("./jscad-worker", () => ({
    initializationComplete: vi.fn(),
    onMessageInput: vi.fn(),
}));

const A_CALL: DataInput = { action: { functionName: "shapes.cube", inputs: { size: 1 } }, uid: "call-1" };

describe("JSCADWorkerMock unit tests", () => {
    let mock: JSCADWorkerMock;

    beforeEach(() => {
        vi.clearAllMocks();
        mock = new JSCADWorkerMock();
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
            vi.mocked(onMessageInput).mockImplementation((_input, post) => post({ uid: "call-1", result: "a-cube" }));

            // Act
            mock.postMessage(A_CALL);

            // Assert
            expect(received).toEqual([{ uid: "call-1", result: "a-cube" }]);
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
