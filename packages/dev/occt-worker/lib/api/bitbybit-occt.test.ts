import { describe, it, expect, beforeEach } from "vitest";
import { BitByBitOCCT } from "./bitbybit-occt";
import { OCCT } from "./occt/occt";
import { OCCTWorkerManager } from "../occ-worker/occ-worker-manager";


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

describe("BitByBitOCCT unit tests", () => {
    let bitbybit: BitByBitOCCT;

    beforeEach(() => {
        bitbybit = new BitByBitOCCT();
    });

    describe("construction", () => {
        it("should own a worker manager", () => {
            expect(bitbybit.occtWorkerManager).toBeInstanceOf(OCCTWorkerManager);
        });

        it("should own the API layer", () => {
            expect(bitbybit.occt).toBeInstanceOf(OCCT);
        });

        it("should start with no worker set", () => {
            expect(bitbybit.occtWorkerManager.occWorkerAlreadyInitialised()).toBe(false);
        });
    });

    describe("init", () => {
        it("should give the manager the worker it was handed", () => {
            // Arrange
            const worker = new RecordingWorker();

            // Act
            bitbybit.init(worker);

            // Assert
            expect(bitbybit.occtWorkerManager.occWorkerAlreadyInitialised()).toBe(true);
        });

        it("should route a call through to the worker it was given", () => {
            // Arrange
            const worker = new RecordingWorker();
            bitbybit.init(worker);

            // Act
            void bitbybit.occt.shapes.solid.createSphere({ radius: 1, center: [0, 0, 0] });

            // Assert
            expect(worker.posted.map((call) => call.action.functionName)).toEqual(["shapes.solid.createSphere"]);
        });

        it("should leave the manager without a worker when handed nothing", () => {
            // Act
            bitbybit.init(NO_WORKER);

            // Assert
            expect(bitbybit.occtWorkerManager.occWorkerAlreadyInitialised()).toBe(false);
        });
    });
});
