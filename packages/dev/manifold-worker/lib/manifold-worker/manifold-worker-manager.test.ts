import { describe, it, expect, beforeEach, vi } from "vitest";
import { ManifoldWorkerManager } from "./manifold-worker-manager";
import { ManifoldStateEnum } from "./manifold-state.enum";
import { ManifoldInfo } from "./manifold-info";
import { ManifoldWorkerMock } from "./manifold-worker-mock";

type PostedCall = { action: { functionName: string; inputs: unknown }; uid: string };
type WorkerAnswer = "manifold-initialised" | "busy" | { uid: string; result?: unknown; error?: string };

class RecordingWorker extends ManifoldWorkerMock {
    readonly posted: PostedCall[] = [];

    override postMessage(message: PostedCall | "busy"): void {
        if (message !== "busy") {
            this.posted.push(message);
        }
    }
}

describe("ManifoldWorkerManager unit tests", () => {
    let manager: ManifoldWorkerManager;
    let worker: RecordingWorker;
    let posted: PostedCall[];
    let states: ManifoldInfo[];

    const answer = (data: WorkerAnswer): void => {
        worker.onmessage({ data });
    };

    const uidOf = (index: number): string => (posted[index] as PostedCall).uid;

    beforeEach(() => {
        states = [];
        manager = new ManifoldWorkerManager();
        worker = new RecordingWorker();
        posted = worker.posted;
        manager.manifoldWorkerState$.subscribe((info) => states.push(info));
        manager.setManifoldWorker(worker);
    });

    describe("manifoldWorkerAlreadyInitialised", () => {
        it("should report false before a worker is set", () => {
            // Arrange
            const fresh = new ManifoldWorkerManager();

            // Act
            const result = fresh.manifoldWorkerAlreadyInitialised();

            // Assert
            expect(result).toBe(false);
        });

        it("should report true once a worker is set", () => {
            // Act
            const result = manager.manifoldWorkerAlreadyInitialised();

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("genericCallToWorkerPromise", () => {
        it("should post the function name and the inputs it was given", () => {
            // Arrange
            const inputs = { radius: 3 };

            // Act
            void manager.genericCallToWorkerPromise("manifold.shapes.sphere", inputs);

            // Assert
            expect(posted).toHaveLength(1);
            expect((posted[0] as PostedCall).action).toEqual({ functionName: "manifold.shapes.sphere", inputs });
        });

        it("should resolve with the result the worker returned for that uid", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise<string>("manifold.shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), result: "a-manifold" });

            // Assert
            await expect(pending).resolves.toBe("a-manifold");
        });

        it("should leave a call pending when another call's uid is answered", async () => {
            // Arrange
            const first = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});
            void manager.genericCallToWorkerPromise("manifold.shapes.cube", {});
            let settled = false;
            void first.then(() => { settled = true; });

            // Act
            answer({ uid: uidOf(1), result: "another-manifold" });
            await Promise.resolve();

            // Assert
            expect(settled).toBe(false);
        });

        it("should reject with the error message the worker reported", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });

            // Assert
            await expect(pending).rejects.toBe("radius must be positive");
        });

        it("should pass the error to the error callback when one is registered", async () => {
            // Arrange
            const errorCallback = vi.fn();
            manager.errorCallback = errorCallback;
            const pending = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });
            await expect(pending).rejects.toBe("radius must be positive");

            // Assert
            expect(errorCallback).toHaveBeenCalledWith("radius must be positive");
        });

        it("should report an error carrying no known uid without throwing", () => {
            // Arrange
            const errorCallback = vi.fn();
            manager.errorCallback = errorCallback;

            // Act
            answer({ uid: "not-a-call", error: "worker died" });

            // Assert
            expect(errorCallback).toHaveBeenCalledWith("worker died");
        });
    });

    describe("the state subject", () => {
        it("should report the worker initialised when it says so", () => {
            // Act
            answer("manifold-initialised");

            // Assert
            expect(states).toEqual([{ state: ManifoldStateEnum.initialised }]);
        });

        it("should report computing when the worker says it is busy", () => {
            // Act
            answer("busy");

            // Assert
            expect(states).toEqual([{ state: ManifoldStateEnum.computing }]);
        });

        it("should report loaded when the last outstanding call is answered", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), result: "a-manifold" });
            await pending;

            // Assert
            expect(states).toEqual([{ state: ManifoldStateEnum.loaded }]);
        });

        it("should report computing while calls are still outstanding", async () => {
            // Arrange
            const first = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});
            void manager.genericCallToWorkerPromise("manifold.shapes.cube", {});

            // Act
            answer({ uid: uidOf(0), result: "a-manifold" });
            await first;

            // Assert
            expect(states).toEqual([{ state: ManifoldStateEnum.computing }]);
        });
    });

    describe("cleanPromisesMade", () => {
        it("should forget the outstanding calls so a late answer settles nothing", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});
            let settled = false;
            void pending.then(() => { settled = true; });

            // Act
            manager.cleanPromisesMade();
            answer({ uid: uidOf(0), result: "a-manifold" });
            await Promise.resolve();

            // Assert
            expect(settled).toBe(false);
        });
    });

    describe("startedTheRun", () => {
        it("should post the run marker with empty inputs", () => {
            // Act
            void manager.startedTheRun();

            // Assert
            expect((posted[0] as PostedCall).action).toEqual({ functionName: "startedTheRun", inputs: {} });
        });
    });

    describe("cleanAllCache", () => {
        it("should post the cache marker with empty inputs", () => {
            // Act
            void manager.cleanAllCache();

            // Assert
            expect((posted[0] as PostedCall).action).toEqual({ functionName: "cleanAllCache", inputs: {} });
        });
    });
});
