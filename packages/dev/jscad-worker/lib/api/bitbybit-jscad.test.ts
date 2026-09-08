import { describe, it, expect, beforeEach } from "vitest";
import { BitByBitJSCAD } from "./bitbybit-jscad";
import { JSCAD } from "./jscad";
import { JSCADWorkerManager } from "../jscad-worker/jscad-worker-manager";


type PostedCall = { action: { functionName: string; inputs: unknown }; uid: string };

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
