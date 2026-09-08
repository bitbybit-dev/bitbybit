import { describe, it, expect, beforeEach } from "vitest";
import { BitByBitManifold } from "./bitbybit-manifold";
import { ManifoldBitByBit } from "./manifold-bitbybit";
import { ManifoldWorkerManager } from "../manifold-worker/manifold-worker-manager";


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

describe("BitByBitManifold unit tests", () => {
    let bitbybit: BitByBitManifold;

    beforeEach(() => {
        bitbybit = new BitByBitManifold();
    });

    describe("construction", () => {
        it("should own a worker manager", () => {
            expect(bitbybit.manifoldWorkerManager).toBeInstanceOf(ManifoldWorkerManager);
        });

        it("should own the API layer", () => {
            expect(bitbybit.manifold).toBeInstanceOf(ManifoldBitByBit);
        });

        it("should start with no worker set", () => {
            expect(bitbybit.manifoldWorkerManager.manifoldWorkerAlreadyInitialised()).toBe(false);
        });
    });

    describe("init", () => {
        it("should give the manager the worker it was handed", () => {
            // Arrange
            const worker = new RecordingWorker();

            // Act
            bitbybit.init(worker);

            // Assert
            expect(bitbybit.manifoldWorkerManager.manifoldWorkerAlreadyInitialised()).toBe(true);
        });

        it("should route a call through to the worker it was given", () => {
            // Arrange
            const worker = new RecordingWorker();
            bitbybit.init(worker);

            // Act
            void bitbybit.manifold.manifold.shapes.cube({ size: 1, center: true });

            // Assert
            expect(worker.posted.map((call) => call.action.functionName)).toEqual(["manifold.shapes.cube"]);
        });

        it("should leave the manager without a worker when handed nothing", () => {
            // Act
            bitbybit.init(NO_WORKER);

            // Assert
            expect(bitbybit.manifoldWorkerManager.manifoldWorkerAlreadyInitialised()).toBe(false);
        });
    });
});
