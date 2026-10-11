import { KernelCallError } from "@bitbybit-dev/base";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { JSCADWorkerManager } from "./jscad-worker-manager";
import { JscadStateEnum } from "./jscad-state.enum";
import type { JscadInfo } from "./jscad-info";
import { JSCADWorkerMock } from "./jscad-worker-mock";

type PostedCall = { action: { functionName: string; inputs: unknown }; uid: string };
type WorkerAnswer = "jscad-initialised" | "busy" | { uid: string; result?: unknown; error?: string; errorKind?: "input" | "kernel"; code?: string; details?: Record<string, unknown>; stack?: string };

class RecordingWorker extends JSCADWorkerMock {
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

describe("JSCADWorkerManager unit tests", () => {
    let manager: JSCADWorkerManager;
    let worker: RecordingWorker;
    let posted: PostedCall[];
    let states: JscadInfo[];

    const answer = (data: WorkerAnswer): void => {
        worker.onmessage({ data });
    };

    const uidOf = (index: number): string => (posted[index] as PostedCall).uid;

    beforeEach(() => {
        states = [];
        manager = new JSCADWorkerManager();
        worker = new RecordingWorker();
        posted = worker.posted;
        manager.jscadWorkerState$.subscribe((info) => states.push(info));
        manager.setJscadWorker(worker);
    });

    describe("jscadWorkerAlreadyInitialised", () => {
        it("should report false before a worker is set", () => {
            // Arrange
            const fresh = new JSCADWorkerManager();

            // Act
            const result = fresh.jscadWorkerAlreadyInitialised();

            // Assert
            expect(result).toBe(false);
        });

        it("should report true once a worker is set", () => {
            // Act
            const result = manager.jscadWorkerAlreadyInitialised();

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("genericCallToWorkerPromise", () => {
        it("should post the function name and the inputs it was given", () => {
            // Arrange
            const inputs = { radius: 3 };

            // Act
            void manager.genericCallToWorkerPromise("shapes.sphere", inputs);

            // Assert
            expect(posted).toHaveLength(1);
            expect((posted[0] as PostedCall).action).toEqual({ functionName: "shapes.sphere", inputs });
        });

        it("should resolve with the result the worker returned for that uid", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise<string>("shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), result: "a-sphere" });

            // Assert
            await expect(pending).resolves.toBe("a-sphere");
        });

        it("should resolve with a falsy result the worker returned", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise<boolean>("hulls.isConvex", {});

            // Act
            answer({ uid: uidOf(0), result: false });

            // Assert
            await expect(pending).resolves.toBe(false);
        });

        it("should resolve a call the worker answered without a result", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise<void>("shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0) });

            // Assert
            await expect(pending).resolves.toBeUndefined();
        });

        it("should leave a call pending when another call's uid is answered", async () => {
            // Arrange
            const first = manager.genericCallToWorkerPromise("shapes.sphere", {});
            void manager.genericCallToWorkerPromise("shapes.cube", {});
            let settled = false;
            void first.then(() => { settled = true; });

            // Act
            answer({ uid: uidOf(1), result: "a-cube" });
            await Promise.resolve();

            // Assert
            expect(settled).toBe(false);
        });

        it("should reject with an Error carrying the message the worker reported", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });

            // Assert
            await expect(pending).rejects.toBeInstanceOf(KernelCallError);
            await expect(pending).rejects.toMatchObject({ functionName: "shapes.sphere", kind: "kernel" });
            await expect(pending).rejects.toThrow("radius must be positive");
        });

        it("should carry the kind of failure and the stack the worker reported", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "shapes.sphere: `radius` must be positive", errorKind: "input", stack: "at kernel" });

            // Assert
            await expect(pending).rejects.toMatchObject({ kind: "input", workerStack: "at kernel" });
        });

        it("should carry the code of a failure the kernel named", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("booleans.union", {});

            // Act
            answer({ uid: uidOf(0), error: "The operation could not be completed.", errorKind: "kernel", code: "jscad.boolean.failed", details: { edges: [3] } });

            // Assert
            await expect(pending).rejects.toMatchObject({ kind: "kernel", code: "jscad.boolean.failed", details: { edges: [3] } });
        });

        it("should leave the code unset when the worker reported none", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "failed" });

            // Assert
            await expect(pending).rejects.toMatchObject({ code: undefined, details: undefined });
        });

        it("should pass the error to the error callback when one is registered", async () => {
            // Arrange
            const errorCallback = vi.fn();
            manager.errorCallback = errorCallback;
            const pending = manager.genericCallToWorkerPromise("shapes.sphere", {});

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
            const pending = manager.genericCallToWorkerPromise("shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });

            // Assert
            await expect(pending).rejects.toThrow("radius must be positive");
            vi.restoreAllMocks();
        });

        it("should reject with exactly the message the worker reported, and no stack when it sent none", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });

            // Assert
            await expect(pending).rejects.toMatchObject({ name: "KernelCallError", message: "radius must be positive", functionName: "shapes.sphere", kind: "kernel", workerStack: undefined });
        });

        it("should reject a call whose worker reported an empty message", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "" });

            // Assert
            await expect(pending).rejects.toMatchObject({ name: "KernelCallError", message: "", functionName: "shapes.sphere" });
        });

        it.each([0, "", null, false])("should resolve a call the worker answered with %j as that value", async (falsy) => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), result: falsy });

            // Assert
            await expect(pending).resolves.toBe(falsy);
        });

        it("should settle each call by its own uid when two are outstanding", async () => {
            // Arrange
            const first = manager.genericCallToWorkerPromise("shapes.sphere", { radius: 1 });
            const second = manager.genericCallToWorkerPromise("shapes.sphere", { radius: 2 });

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
            const pending = manager.genericCallToWorkerPromise("shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });

            // Assert
            await expect(pending).rejects.toMatchObject({ name: "KernelCallError", message: "radius must be positive" });
            expect(logged).toEqual([["JSCAD errorCallback threw:", broke]]);
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
            const pending = manager.genericCallToWorkerPromise("shapes.sphere", { material: (): number => 1 });

            // Assert
            await expect(pending).rejects.toBeInstanceOf(KernelCallError);
            await expect(pending).rejects.toMatchObject({ functionName: "shapes.sphere", kind: "input", message: "shapes.sphere: the inputs could not be sent to the worker: () => 1 could not be cloned." });
        });

        it("should report the worker loaded when nothing else is outstanding", async () => {
            // Arrange
            worker.refusals = 1;

            // Act
            const pending = manager.genericCallToWorkerPromise("shapes.sphere", {});
            await expect(pending).rejects.toBeInstanceOf(KernelCallError);

            // Assert
            expect(states).toEqual([{ state: JscadStateEnum.loaded }]);
        });

        it("should say only that the inputs could not be sent when what was thrown is not an error", async () => {
            // Arrange
            worker.refusals = 1;
            worker.refusal = "not an error";

            // Act
            const pending = manager.genericCallToWorkerPromise("shapes.sphere", {});

            // Assert
            await expect(pending).rejects.toMatchObject({ functionName: "shapes.sphere", kind: "input", message: "shapes.sphere: the inputs could not be sent to the worker" });
        });

        it("should not report the worker loaded while another call is still outstanding", async () => {
            // Arrange
            void manager.genericCallToWorkerPromise("shapes.cube", {});
            worker.refusals = 1;
            states.length = 0;

            // Act
            const refused = manager.genericCallToWorkerPromise("shapes.sphere", {});
            await expect(refused).rejects.toBeInstanceOf(KernelCallError);

            // Assert
            expect(states.filter((s) => s.state === JscadStateEnum.loaded)).toEqual([]);
        });

        it("should not count a call it could not send as outstanding", async () => {
            // Arrange
            worker.refusals = 1;
            const refused = manager.genericCallToWorkerPromise("shapes.sphere", {});
            await expect(refused).rejects.toBeInstanceOf(KernelCallError);
            const sent = manager.genericCallToWorkerPromise("shapes.cube", {});
            states.length = 0;

            // Act
            answer({ uid: uidOf(0), result: "a-shape" });
            await sent;

            // Assert
            expect(states).toEqual([{ state: JscadStateEnum.loaded }]);
        });
    });

    describe("the state subject", () => {
        it("should report the worker initialised when it says so", () => {
            // Act
            answer("jscad-initialised");

            // Assert
            expect(states).toEqual([{ state: JscadStateEnum.initialised }]);
        });

        it("should report computing when the worker says it is busy", () => {
            // Act
            answer("busy");

            // Assert
            expect(states).toEqual([{ state: JscadStateEnum.computing }]);
        });

        it("should report loaded when the last outstanding call is answered", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), result: "a-sphere" });
            await pending;

            // Assert
            expect(states).toEqual([{ state: JscadStateEnum.loaded }]);
        });

        it("should report loaded once the last outstanding call has been refused", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.sphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });
            await expect(pending).rejects.toThrow("radius must be positive");

            // Assert
            expect(states).toEqual([{ state: JscadStateEnum.loaded }]);
        });

        it("should report computing while calls are still outstanding", async () => {
            // Arrange
            const first = manager.genericCallToWorkerPromise("shapes.sphere", {});
            void manager.genericCallToWorkerPromise("shapes.cube", {});

            // Act
            answer({ uid: uidOf(0), result: "a-sphere" });
            await first;

            // Assert
            expect(states).toEqual([{ state: JscadStateEnum.computing }]);
        });
    });

    describe("cleanPromisesMade", () => {
        it("should forget the outstanding calls so a late answer settles nothing", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.sphere", {});
            let settled = false;
            void pending.then(() => { settled = true; });

            // Act
            manager.cleanPromisesMade();
            answer({ uid: uidOf(0), result: "a-sphere" });
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
