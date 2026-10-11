import { KernelCallError } from "@bitbybit-dev/base";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ManifoldWorkerManager } from "./manifold-worker-manager";
import { ManifoldStateEnum } from "./manifold-state.enum";
import type { ManifoldInfo } from "./manifold-info";
import { ManifoldWorkerMock } from "./manifold-worker-mock";

type PostedCall = { action: { functionName: string; inputs: unknown }; uid: string };
type WorkerAnswer = "manifold-initialised" | "busy" | { uid: string; result?: unknown; error?: string; errorKind?: "input" | "kernel"; code?: string; details?: Record<string, unknown>; stack?: string };

class RecordingWorker extends ManifoldWorkerMock {
    readonly posted: PostedCall[] = [];

    refusals = 0;

    refusal: unknown = new Error("() => 1 could not be cloned.");

    override postMessage(message: PostedCall | "busy"): void {
        if (this.refusals > 0) {
            this.refusals -= 1;
            throw this.refusal;
        }
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

        it("should resolve with a falsy result the worker returned", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise<boolean>("manifold.evaluate.isEmpty", {});

            // Act
            answer({ uid: uidOf(0), result: false });

            // Assert
            await expect(pending).resolves.toBe(false);
        });

        it("should resolve a call the worker answered without a result", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise<void>("manifold.shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0) });

            // Assert
            await expect(pending).resolves.toBeUndefined();
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

        it("should reject with an Error carrying the message the worker reported", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });

            // Assert
            await expect(pending).rejects.toBeInstanceOf(KernelCallError);
            await expect(pending).rejects.toMatchObject({ functionName: "manifold.shapes.sphere", kind: "kernel" });
            await expect(pending).rejects.toThrow("radius must be positive");
        });

        it("should carry the kind of failure and the stack the worker reported", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "manifold.shapes.sphere: `radius` must be positive", errorKind: "input", stack: "at kernel" });

            // Assert
            await expect(pending).rejects.toMatchObject({ kind: "input", workerStack: "at kernel" });
        });

        it("should carry the code of a failure the kernel named", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("manifold.booleans.union", {});

            // Act
            answer({ uid: uidOf(0), error: "The operation could not be completed.", errorKind: "kernel", code: "manifold.boolean.failed", details: { edges: [3] } });

            // Assert
            await expect(pending).rejects.toMatchObject({ kind: "kernel", code: "manifold.boolean.failed", details: { edges: [3] } });
        });

        it("should leave the code unset when the worker reported none", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "failed" });

            // Assert
            await expect(pending).rejects.toMatchObject({ code: undefined, details: undefined });
        });

        it("should pass the error to the error callback when one is registered", async () => {
            // Arrange
            const errorCallback = vi.fn();
            manager.errorCallback = errorCallback;
            const pending = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });
            await expect(pending).rejects.toThrow("radius must be positive");

            // Assert
            expect(errorCallback).toHaveBeenCalledWith("radius must be positive");
        });

        it("should still reject the call when the error callback itself throws", async () => {
            // Arrange
            vi.spyOn(console, "error").mockImplementation(() => undefined);
            manager.errorCallback = () => { throw new Error("the handler broke"); };
            const pending = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });

            // Assert
            await expect(pending).rejects.toThrow("radius must be positive");
            vi.restoreAllMocks();
        });

        it("should reject with exactly the message the worker reported, and no stack when it sent none", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });

            // Assert
            await expect(pending).rejects.toMatchObject({ name: "KernelCallError", message: "radius must be positive", functionName: "manifold.shapes.sphere", kind: "kernel", workerStack: undefined });
        });

        it("should reject a call whose worker reported an empty message", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "" });

            // Assert
            await expect(pending).rejects.toMatchObject({ name: "KernelCallError", message: "", functionName: "manifold.shapes.sphere" });
        });

        it.each([0, "", null, false])("should resolve a call the worker answered with %j as that value", async (falsy) => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), result: falsy });

            // Assert
            await expect(pending).resolves.toBe(falsy);
        });

        it("should settle each call by its own uid when two are outstanding", async () => {
            // Arrange
            const first = manager.genericCallToWorkerPromise("manifold.shapes.sphere", { radius: 1 });
            const second = manager.genericCallToWorkerPromise("manifold.shapes.sphere", { radius: 2 });

            // Act
            answer({ uid: uidOf(1), result: "the second" });
            answer({ uid: uidOf(0), error: "the first failed" });

            // Assert
            await expect(second).resolves.toBe("the second");
            await expect(first).rejects.toMatchObject({ message: "the first failed" });
        });

        it("should log what an error callback threw and still reject with the worker's message", async () => {
            // Arrange
            const logged: unknown[][] = [];
            vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => { logged.push(args); });
            const broke = new Error("the handler broke");
            manager.errorCallback = () => { throw broke; };
            const pending = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });

            // Assert
            await expect(pending).rejects.toMatchObject({ name: "KernelCallError", message: "radius must be positive" });
            expect(logged).toEqual([["Manifold errorCallback threw:", broke]]);
            vi.restoreAllMocks();
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

    describe("inputs that cannot cross to the worker", () => {
        it("should reject the call at once as a failure of its inputs, naming the path", async () => {
            // Arrange
            worker.refusals = 1;

            // Act
            const pending = manager.genericCallToWorkerPromise("manifold.shapes.sphere", { material: (): number => 1 });

            // Assert
            await expect(pending).rejects.toBeInstanceOf(KernelCallError);
            await expect(pending).rejects.toMatchObject({ functionName: "manifold.shapes.sphere", kind: "input", message: "manifold.shapes.sphere: the inputs could not be sent to the worker: () => 1 could not be cloned." });
        });

        it("should report the worker loaded when nothing else is outstanding", async () => {
            // Arrange
            worker.refusals = 1;

            // Act
            const pending = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});
            await expect(pending).rejects.toBeInstanceOf(KernelCallError);

            // Assert
            expect(states).toEqual([{ state: ManifoldStateEnum.loaded }]);
        });

        it("should say only that the inputs could not be sent when what was thrown is not an error", async () => {
            // Arrange
            worker.refusals = 1;
            worker.refusal = "not an error";

            // Act
            const pending = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});

            // Assert
            await expect(pending).rejects.toMatchObject({ functionName: "manifold.shapes.sphere", kind: "input", message: "manifold.shapes.sphere: the inputs could not be sent to the worker" });
        });

        it("should not report the worker loaded while another call is still outstanding", async () => {
            // Arrange
            void manager.genericCallToWorkerPromise("manifold.shapes.cube", {});
            worker.refusals = 1;
            states.length = 0;

            // Act
            const refused = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});
            await expect(refused).rejects.toBeInstanceOf(KernelCallError);

            // Assert
            expect(states.filter((s) => s.state === ManifoldStateEnum.loaded)).toEqual([]);
        });

        it("should not count a call it could not send as outstanding", async () => {
            // Arrange
            worker.refusals = 1;
            const refused = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});
            await expect(refused).rejects.toBeInstanceOf(KernelCallError);
            const sent = manager.genericCallToWorkerPromise("manifold.shapes.cube", {});
            states.length = 0;

            // Act
            answer({ uid: uidOf(0), result: "a-shape" });
            await sent;

            // Assert
            expect(states).toEqual([{ state: ManifoldStateEnum.loaded }]);
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

        it("should report loaded once the last outstanding call has been refused", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("manifold.shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });
            await expect(pending).rejects.toThrow("radius must be positive");

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
