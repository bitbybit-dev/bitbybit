import { KernelCallError } from "@bitbybit-dev/base";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { OCCTWorkerManager } from "./occ-worker-manager";
import { OccStateEnum } from "./occ-state.enum";
import { OccInfo } from "./occ-info";

type PostedCall = { action: { functionName: string; inputs: unknown }; uid: string };
type WorkerAnswer = "occ-initialised" | "busy" | { uid: string; result?: unknown; error?: string; errorKind?: "input" | "kernel"; code?: string; stack?: string };

class RecordingWorker extends EventTarget implements Worker {
    readonly posted: PostedCall[] = [];
    onmessage: Worker["onmessage"] = null;
    onmessageerror: Worker["onmessageerror"] = null;
    onerror: Worker["onerror"] = null;

    refusals = 0;

    refusal: unknown = new Error("() => 1 could not be cloned.");

    postMessage(message: PostedCall): void {
        if (this.refusals > 0) {
            this.refusals -= 1;
            throw this.refusal;
        }
        this.posted.push(message);
    }

    terminate(): void {
        this.posted.length = 0;
    }
}

describe("OCCTWorkerManager unit tests", () => {
    let manager: OCCTWorkerManager;
    let worker: RecordingWorker;
    let posted: PostedCall[];
    let states: OccInfo[];

    const answer = (data: WorkerAnswer): void => {
        worker.onmessage?.({ data } as MessageEvent);
    };

    const uidOf = (index: number): string => (posted[index] as PostedCall).uid;

    beforeEach(() => {
        states = [];
        manager = new OCCTWorkerManager();
        worker = new RecordingWorker();
        posted = worker.posted;
        manager.occWorkerState$.subscribe((info) => states.push(info));
        manager.setOccWorker(worker);
    });

    describe("occWorkerAlreadyInitialised", () => {
        it("should report false before a worker is set", () => {
            // Arrange
            const fresh = new OCCTWorkerManager();

            // Act
            const result = fresh.occWorkerAlreadyInitialised();

            // Assert
            expect(result).toBe(false);
        });

        it("should report true once a worker is set", () => {
            expect(manager.occWorkerAlreadyInitialised()).toBe(true);
        });
    });

    describe("prepareStepData", () => {
        it("should read a File into bytes", async () => {
            // Arrange
            const file = new File([new Uint8Array([1, 2, 3])], "part.step");

            // Act
            const result = await manager.prepareStepData(file);

            // Assert
            expect(result).toEqual(new Uint8Array([1, 2, 3]));
        });

        it("should read a Blob into bytes", async () => {
            // Arrange
            const blob = new Blob([new Uint8Array([4, 5])]);

            // Act
            const result = await manager.prepareStepData(blob);

            // Assert
            expect(result).toEqual(new Uint8Array([4, 5]));
        });

        it("should wrap an ArrayBuffer in bytes", async () => {
            // Arrange
            const buffer = new Uint8Array([6, 7]).buffer;

            // Act
            const result = await manager.prepareStepData(buffer);

            // Assert
            expect(result).toEqual(new Uint8Array([6, 7]));
        });

        it("should pass bytes through as they are", async () => {
            // Arrange
            const bytes = new Uint8Array([8, 9]);

            // Act
            const result = await manager.prepareStepData(bytes);

            // Assert
            expect(result).toBe(bytes);
        });

        it("should pass a string through as it is", async () => {
            // Act
            const result = await manager.prepareStepData("ISO-10303-21;");

            // Assert
            expect(result).toBe("ISO-10303-21;");
        });
    });

    describe("genericCallToWorkerPromise", () => {
        it("should post the function name and the inputs it was given", () => {
            // Arrange
            const inputs = { radius: 3 };

            // Act
            void manager.genericCallToWorkerPromise("shapes.solid.createSphere", inputs);

            // Assert
            expect(posted).toHaveLength(1);
            expect((posted[0] as PostedCall).action).toEqual({ functionName: "shapes.solid.createSphere", inputs });
        });

        it("should resolve with the result the worker returned for that uid", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise<string>("shapes.solid.createSphere", {});

            // Act
            answer({ uid: uidOf(0), result: "a-sphere" });

            // Assert
            await expect(pending).resolves.toBe("a-sphere");
        });

        it("should resolve with a falsy result the worker returned", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise<number>("shapes.face.getFaceArea", {});

            // Act
            answer({ uid: uidOf(0), result: 0 });

            // Assert
            await expect(pending).resolves.toBe(0);
        });

        it("should resolve a call the worker answered without a result", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise<void>("shapes.solid.createSphere", {});

            // Act
            answer({ uid: uidOf(0) });

            // Assert
            await expect(pending).resolves.toBeUndefined();
        });

        it("should leave a call pending when another call's uid is answered", async () => {
            // Arrange
            const first = manager.genericCallToWorkerPromise("shapes.solid.createSphere", {});
            void manager.genericCallToWorkerPromise("shapes.solid.createBox", {});
            let settled = false;
            void first.then(() => { settled = true; });

            // Act
            answer({ uid: uidOf(1), result: "a-box" });
            await Promise.resolve();

            // Assert
            expect(settled).toBe(false);
        });

        it("should reject with an Error carrying the message the worker reported", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.solid.createSphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });

            // Assert
            await expect(pending).rejects.toBeInstanceOf(KernelCallError);
            await expect(pending).rejects.toMatchObject({ functionName: "shapes.solid.createSphere", kind: "kernel" });
            await expect(pending).rejects.toThrow("radius must be positive");
        });

        it("should carry the kind of failure and the stack the worker reported", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.solid.createSphere", {});

            // Act
            answer({ uid: uidOf(0), error: "shapes.solid.createSphere: `radius` must be positive", errorKind: "input", stack: "at kernel" });

            // Assert
            await expect(pending).rejects.toMatchObject({ kind: "input", workerStack: "at kernel" });
        });

        it("should carry the code of a failure the kernel named", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("fillets.filletEdges", {});

            // Act
            answer({ uid: uidOf(0), error: "The operation could not be completed.", errorKind: "kernel", code: "occt.fillet.failed" });

            // Assert
            await expect(pending).rejects.toMatchObject({ kind: "kernel", code: "occt.fillet.failed" });
        });

        it("should leave the code unset when the worker reported none", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.solid.createSphere", {});

            // Act
            answer({ uid: uidOf(0), error: "failed" });

            // Assert
            await expect(pending).rejects.toMatchObject({ code: undefined });
        });

        it("should pass the error to the error callback when one is registered", async () => {
            // Arrange
            const errorCallback = vi.fn();
            manager.errorCallback = errorCallback;
            const pending = manager.genericCallToWorkerPromise("shapes.solid.createSphere", {});

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
            const pending = manager.genericCallToWorkerPromise("shapes.solid.createSphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });

            // Assert
            await expect(pending).rejects.toThrow("radius must be positive");
            vi.restoreAllMocks();
        });

        it("should reject with exactly the message the worker reported, and no stack when it sent none", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.solid.createSphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });

            // Assert
            await expect(pending).rejects.toMatchObject({ name: "KernelCallError", message: "radius must be positive", functionName: "shapes.solid.createSphere", kind: "kernel", workerStack: undefined });
        });

        it("should reject a call whose worker reported an empty message", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.solid.createSphere", {});

            // Act
            answer({ uid: uidOf(0), error: "" });

            // Assert
            await expect(pending).rejects.toMatchObject({ name: "KernelCallError", message: "", functionName: "shapes.solid.createSphere" });
        });

        it.each([0, "", null, false])("should resolve a call the worker answered with %j as that value", async (falsy) => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.solid.createSphere", {});

            // Act
            answer({ uid: uidOf(0), result: falsy });

            // Assert
            await expect(pending).resolves.toBe(falsy);
        });

        it("should settle each call by its own uid when two are outstanding", async () => {
            // Arrange
            const first = manager.genericCallToWorkerPromise("shapes.solid.createSphere", { radius: 1 });
            const second = manager.genericCallToWorkerPromise("shapes.solid.createSphere", { radius: 2 });

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
            const pending = manager.genericCallToWorkerPromise("shapes.solid.createSphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });

            // Assert
            await expect(pending).rejects.toMatchObject({ name: "KernelCallError", message: "radius must be positive" });
            expect(logged).toEqual([["OCCT errorCallback threw:", broke]]);
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
            const pending = manager.genericCallToWorkerPromise("shapes.solid.createBox", { material: (): number => 1 });

            // Assert
            await expect(pending).rejects.toBeInstanceOf(KernelCallError);
            await expect(pending).rejects.toMatchObject({ functionName: "shapes.solid.createBox", kind: "input", message: "shapes.solid.createBox: the inputs could not be sent to the worker: () => 1 could not be cloned." });
        });

        it("should report the worker loaded when nothing else is outstanding", async () => {
            // Arrange
            worker.refusals = 1;

            // Act
            const pending = manager.genericCallToWorkerPromise("shapes.solid.createBox", {});
            await expect(pending).rejects.toBeInstanceOf(KernelCallError);

            // Assert
            expect(states).toEqual([{ state: OccStateEnum.loaded }]);
        });

        it("should say only that the inputs could not be sent when what was thrown is not an error", async () => {
            // Arrange
            worker.refusals = 1;
            worker.refusal = "not an error";

            // Act
            const pending = manager.genericCallToWorkerPromise("shapes.solid.createBox", {});

            // Assert
            await expect(pending).rejects.toMatchObject({ functionName: "shapes.solid.createBox", kind: "input", message: "shapes.solid.createBox: the inputs could not be sent to the worker" });
        });

        it("should not report the worker loaded while another call is still outstanding", async () => {
            // Arrange
            void manager.genericCallToWorkerPromise("shapes.solid.createCube", {});
            worker.refusals = 1;
            states.length = 0;

            // Act
            const refused = manager.genericCallToWorkerPromise("shapes.solid.createBox", {});
            await expect(refused).rejects.toBeInstanceOf(KernelCallError);

            // Assert
            expect(states.filter((s) => s.state === OccStateEnum.loaded)).toEqual([]);
        });

        it("should not count a call it could not send as outstanding", async () => {
            // Arrange
            worker.refusals = 1;
            const refused = manager.genericCallToWorkerPromise("shapes.solid.createBox", {});
            await expect(refused).rejects.toBeInstanceOf(KernelCallError);
            const sent = manager.genericCallToWorkerPromise("shapes.solid.createCube", {});
            states.length = 0;

            // Act
            answer({ uid: uidOf(0), result: "a-shape" });
            await sent;

            // Assert
            expect(states).toEqual([{ state: OccStateEnum.loaded }]);
        });
    });

    describe("the state subject", () => {
        it("should report the worker initialised when it says so", () => {
            // Act
            answer("occ-initialised");

            // Assert
            expect(states).toEqual([{ state: OccStateEnum.initialised }]);
        });

        it("should report computing when the worker says it is busy", () => {
            // Act
            answer("busy");

            // Assert
            expect(states).toEqual([{ state: OccStateEnum.computing }]);
        });

        it("should report loaded when the last outstanding call is answered", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.solid.createSphere", {});

            // Act
            answer({ uid: uidOf(0), result: "a-sphere" });
            await pending;

            // Assert
            expect(states).toEqual([{ state: OccStateEnum.loaded }]);
        });

        it("should report loaded once the last outstanding call has been refused", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.solid.createSphere", {});

            // Act
            answer({ uid: uidOf(0), error: "radius must be positive" });
            await expect(pending).rejects.toThrow("radius must be positive");

            // Assert
            expect(states).toEqual([{ state: OccStateEnum.loaded }]);
        });

        it("should report computing while calls are still outstanding", async () => {
            // Arrange
            const first = manager.genericCallToWorkerPromise("shapes.solid.createSphere", {});
            void manager.genericCallToWorkerPromise("shapes.solid.createBox", {});

            // Act
            answer({ uid: uidOf(0), result: "a-sphere" });
            await first;

            // Assert
            expect(states).toEqual([{ state: OccStateEnum.computing }]);
        });
    });

    describe("cleanPromisesMade", () => {
        it("should forget the outstanding calls so a late answer settles nothing", async () => {
            // Arrange
            const pending = manager.genericCallToWorkerPromise("shapes.solid.createSphere", {});
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
