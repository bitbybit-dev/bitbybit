import { describe, it, expect, beforeEach } from "vitest";
import { BitByBitJSCAD } from "./bitbybit-jscad";
import { JSCAD } from "./jscad";
import { JSCADWorkerManager } from "../jscad-worker/jscad-worker-manager";


// The entry point for a consumer that wants this kernel and nothing else from the platform: it owns
// the manager, hands it to the API layer, and takes the worker once the host has one.

type PostedCall = { action: { functionName: string; inputs: unknown }; uid: string };

// The worker a host would hand in: a real one is what this entry point declares, so the stand-in is
// a whole Worker rather than the package's mock, recording what reaches it instead of running it.
class RecordingWorker extends EventTarget implements Worker {
    readonly posted: PostedCall[] = [];
    onmessage: Worker["onmessage"] = null;
    onmessageerror: Worker["onmessageerror"] = null;
    onerror: Worker["onerror"] = null;

    postMessage(message: PostedCall): void {
        this.posted.push(message);
    }

    terminate(): void {
        this.posted.length = 0;
    }
}

// A host that has not produced a worker hands in nothing at all, which the declared parameter type
// does not admit; the guard against it is the behaviour under test.
const NO_WORKER: Worker = undefined!;

describe("BitByBitJSCAD unit tests", () => {
    let bitbybit: BitByBitJSCAD;

    beforeEach(() => {
        bitbybit = new BitByBitJSCAD();
    });

    describe("construction", () => {
        it("should own a worker manager", () => {
            expect(bitbybit.jscadWorkerManager).toBeInstanceOf(JSCADWorkerManager);
        });

        it("should own the API layer", () => {
            expect(bitbybit.jscad).toBeInstanceOf(JSCAD);
        });

        it("should start with no worker set", () => {
            expect(bitbybit.jscadWorkerManager.jscadWorkerAlreadyInitialised()).toBe(false);
        });
    });

    describe("init", () => {
        it("should give the manager the worker it was handed", () => {
            // Arrange
            const worker = new RecordingWorker();

            // Act
            bitbybit.init(worker);

            // Assert
            expect(bitbybit.jscadWorkerManager.jscadWorkerAlreadyInitialised()).toBe(true);
        });

        it("should route a call through to the worker it was given", () => {
            // Arrange
            const worker = new RecordingWorker();
            bitbybit.init(worker);

            // Act
            void bitbybit.jscad.shapes.cube({ center: [0, 0, 0], size: 1 });

            // Assert
            expect(worker.posted.map((call) => call.action.functionName)).toEqual(["shapes.cube"]);
        });

        it("should leave the manager without a worker when handed nothing", () => {
            // Act
            bitbybit.init(NO_WORKER);

            // Assert
            expect(bitbybit.jscadWorkerManager.jscadWorkerAlreadyInitialised()).toBe(false);
        });
    });
});
