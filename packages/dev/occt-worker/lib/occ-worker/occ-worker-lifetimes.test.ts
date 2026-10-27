import { describe, it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import { createHash } from "node:crypto";
import type { BitbybitOcctModule, TopoDS_Shape } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import type { Models } from "@bitbybit-dev/occt";
import { handlesIn, namesOf, openWindow, watchModule } from "../../../__test__/embind-ledger";
import { OCCT_LEDGER } from "../../../__test__/kernel-ledger-options";
import type { CacheHelper } from "./cache-helper";
import { CommandHandlers, getCommandHandler } from "./command-handlers";
import { CACHE_THRESHOLD, NON_CACHEABLE_FUNCTIONS, ReservedFunctions } from "./constants";
import { buildWithScripts } from "./design-scripts";
import type { DataInput } from "./occ-worker";
import { initializationComplete, onMessageInput } from "./occ-worker";
import { OCCTWorkerManager } from "./occ-worker-manager";
import type { WorkerAnswer, WorkerReference } from "./__test__/worker-answers-types";

const ROUNDS = 50;
const MOST_BYTES_PER_CALL = 64;

const plateDocument = {
    schemaVersion: 1,
    parameters: { width: 40, depth: 20, height: 10 },
    features: [
        { id: "base", type: "sketch", on: { plane: "XY" }, start: [0, 0], pen: [{ type: "hLine", length: "width" }, { type: "vLine", length: "depth" }, { type: "hLine", length: "-(width)" }, { type: "close" }] },
        { id: "plate", type: "extrude", profile: "base", distance: "height" },
    ],
};

const LUG_CODE = "return occt.shapes.solid.createBox({ width: 4, length: 4, height: 4, center: [0, 0, 12] });";

const luggedPlateDocument: Models.OCCT.DesignPartDocument = {
    schemaVersion: 1,
    assets: [{ id: "lugScript", uri: "lug.js", sha256: createHash("sha256").update(LUG_CODE).digest("hex") }],
    features: [
        { id: "base", type: "sketch", on: { plane: "XY" }, start: [0, 0], pen: [{ type: "hLine", length: 40 }, { type: "vLine", length: 20 }, { type: "hLine", length: -40 }, { type: "close" }] },
        { id: "plate", type: "extrude", profile: "base", distance: 10 },
        { id: "lug", type: "script", script: "lugScript", params: { on: { body: "plate" } } },
    ],
    parts: [{ id: "plate", body: "plate" }, { id: "lug", body: "lug" }],
};

const shapePointersIn = (value: unknown): WorkerReference[] => {
    if (typeof value !== "object" || value === null) {
        return [];
    }
    if ("type" in value && value.type === "occ-shape" && "hash" in value) {
        return [value as WorkerReference];
    }
    return Object.values(value).flatMap(shapePointersIn);
};

class KernelWorker extends EventTarget implements Worker {
    onmessage: Worker["onmessage"] = null;
    onmessageerror: Worker["onmessageerror"] = null;
    onerror: Worker["onerror"] = null;
    readonly answered: unknown[] = [];

    postMessage(message: DataInput): void {
        onMessageInput(structuredClone(message), (data: unknown) => {
            this.answered.push(data);
            this.onmessage?.({ data: structuredClone(data) } as MessageEvent);
        });
    }

    terminate(): void {
        this.onmessage = null;
    }
}

class InterleavingWorker extends KernelWorker {
    private answeredFirst = false;

    constructor(private readonly path: string, private readonly between: () => void) {
        super();
    }

    override postMessage(message: DataInput): void {
        super.postMessage(message);
        if (!this.answeredFirst && message.action.functionName === this.path) {
            this.answeredFirst = true;
            this.between();
        }
    }
}

class WorkerBeforeUnsharedDeletes extends KernelWorker {
    override postMessage(message: DataInput): void {
        const command = ReservedFunctions.DELETE_UNSHARED_SHAPES;
        const handler = getCommandHandler(command);
        Reflect.deleteProperty(CommandHandlers, command);
        NON_CACHEABLE_FUNCTIONS.delete(command);
        try {
            super.postMessage(message);
        } finally {
            if (handler !== undefined) {
                CommandHandlers[command] = handler;
            }
            NON_CACHEABLE_FUNCTIONS.add(command);
        }
    }
}

const LUG_BOX = { width: 4, length: 4, height: 4, center: [0, 0, 12] };

const PLATE_VOLUME = 8000;

const SHAPES_THE_LUGGED_PLATE_ROUNDS_HAND_OUT = 8;

const firstRoundOfTheLuggedPlate = { document: luggedPlateDocument, assets: { lugScript: LUG_CODE }, outcomes: [] };

const messageOf = (error: unknown): string => error instanceof Error ? error.message : String(error);

const roundedVolume = (volume: unknown): unknown => typeof volume === "number" ? Math.round(volume) : volume;

const hashesPastTheThreshold = (): Record<string, string> =>
    Object.fromEntries(Array.from({ length: CACHE_THRESHOLD + 1 }, (_, index) => [`outgrown-${index}`, `outgrown-${index}`]));

describe("the worker's kernel objects and heap across many calls", () => {
    let occt: BitbybitOcctModule;
    let cacheHelper: CacheHelper;
    let calls = 0;

    beforeAll(async () => {
        occt = await initOpenCascade();
        watchModule(occt, OCCT_LEDGER);
    });

    beforeEach(() => {
        cacheHelper = initializationComplete(occt, undefined, true);
        occt.SetMeshRetention(0);
    });

    afterEach(() => {
        cacheHelper.cleanAllCache();
    });

    const answerOf = (functionName: string, inputs: Record<string, unknown>): WorkerAnswer => {
        const answers: WorkerAnswer[] = [];
        calls++;
        onMessageInput({ action: { functionName, inputs }, uid: `call-${calls}` }, (data: unknown) => {
            answers.push(data as WorkerAnswer);
        });
        return answers[answers.length - 1]!;
    };
    const made = (functionName: string, inputs: Record<string, unknown>): WorkerReference => {
        const answer = answerOf(functionName, inputs);
        expect(answer.error).toBeUndefined();
        return answer.result as WorkerReference;
    };
    const plateOf = (answer: WorkerAnswer | undefined): WorkerReference | undefined => (answer?.result as Models.OCCT.DesignBuildResult<WorkerReference> | undefined)?.parts[0]?.shape;
    const watched = (rounds: () => void): { alive: string[]; bytesPerCall: number } => {
        rounds();
        const opened = openWindow();
        const before = occt.HeapBytesInUse();
        try {
            for (let round = 0; round < ROUNDS; round++) {
                rounds();
            }
        } finally {
            opened.close();
        }
        return { alive: namesOf(opened.made().filter(handle => !handle.isDeleted())), bytesPerCall: (occt.HeapBytesInUse() - before) / ROUNDS };
    };

    it("should keep no kernel object and no heap from calls the kernel refuses with a C++ exception", () => {
        // Arrange
        const box = made("shapes.solid.createBox", { width: 2, length: 2, height: 2, center: [0, 0, 0] });
        const side = made("shapes.face.getFace", { shape: box, index: 0 });
        const draft = { shape: box, faces: [side], direction: [0, 0, 0], angle: 5, neutralPlaneOrigin: [0, 0, 0], neutralPlaneDirection: [0, 0, 1], flag: true };

        // Act
        const { alive, bytesPerCall } = watched(() => {
            expect(answerOf("draft.draftAngle", { ...draft, angle: 5 + calls / 1000 }).errorKind).toBe("kernel");
        });

        // Assert
        expect(alive).toEqual([]);
        expect(bytesPerCall).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should keep no kernel object and no heap from calls stopped while the kernel builds", () => {
        // Arrange
        const words = Reflect.get(occt, "bitbybitControl") as Int32Array;
        const original: unknown = Reflect.get(occt, "MakeBoxFromPntAndDims");
        const makeBox = (original as (...args: unknown[]) => TopoDS_Shape).bind(occt);
        Reflect.set(occt, "MakeBoxFromPntAndDims", (...args: unknown[]): TopoDS_Shape => {
            const box = makeBox(...args);
            Atomics.store(words, 0, 1);
            return box;
        });

        // Act
        let watchedRounds: { alive: string[]; bytesPerCall: number };
        try {
            watchedRounds = watched(() => {
                expect(answerOf("shapes.solid.createBox", { width: 1, length: 2, height: 3 + calls / 1000, center: [0, 0, 0] }).errorKind).toBe("cancelled");
            });
        } finally {
            Reflect.set(occt, "MakeBoxFromPntAndDims", original);
            Atomics.store(words, 0, 0);
        }

        // Assert
        expect(watchedRounds.alive).toEqual([]);
        expect(watchedRounds.bytesPerCall).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should keep no kernel object of a design it built once the cache is cleaned", () => {
        // Arrange
        const opened = openWindow();

        // Act
        try {
            expect(answerOf("design.build", { document: plateDocument }).error).toBeUndefined();
            answerOf("cleanAllCache", {});
        } finally {
            opened.close();
        }

        // Assert
        expect(namesOf(opened.made().filter(handle => !handle.isDeleted()))).toEqual([]);
    });

    it("should keep no kernel object of a design it built once a run that outgrew the cache threshold resets the cache", () => {
        // Arrange
        const opened = openWindow();
        try {
            expect(answerOf("design.build", { document: plateDocument }).error).toBeUndefined();
        } finally {
            opened.close();
        }
        Object.assign(cacheHelper.usedHashes, hashesPastTheThreshold());

        // Act
        const answer = answerOf("startedTheRun", {});

        // Assert
        expect(answer.error).toBeUndefined();
        expect(cacheHelper.usedHashes).toEqual({});
        expect(namesOf(opened.made().filter(handle => !handle.isDeleted()))).toEqual([]);
    });

    it("should keep what the design builder kept, the sketch's face and the extruded shape, and the part shape and its structure copy the cached answer holds, while the run stays under the cache threshold", () => {
        // Arrange
        const opened = openWindow();
        try {
            expect(answerOf("design.build", { document: plateDocument }).error).toBeUndefined();
        } finally {
            opened.close();
        }

        // Act
        const answer = answerOf("startedTheRun", {});

        // Assert
        expect(answer.error).toBeUndefined();
        expect(namesOf(opened.made().filter(handle => !handle.isDeleted()))).toEqual(["TopoDS_Face", "TopoDS_Shape", "TopoDS_Shape", "TopoDS_Shape"]);
    });

    it("should come back to the kernel objects and heap it started from when every round deletes its shapes and cleans the cache", () => {
        // Arrange
        const round = (): void => {
            const size = 1 + calls / 1000;
            const box = made("shapes.solid.createBox", { width: size, length: 2, height: 3, center: [0, 0, 0] });
            const rounded = made("fillets.filletEdges", { shape: box, radius: 0.2 });
            made("operations.offset", { shape: rounded, distance: 0.1, tolerance: 1e-7 });
            answerOf("deleteShapes", { shapes: [box, rounded] });
            answerOf("cleanAllCache", {});
        };

        // Act
        const { alive, bytesPerCall } = watched(round);

        // Assert
        expect(alive).toEqual([]);
        expect(bytesPerCall).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should keep in the worker's cache no shape of the builds and scripts before the last one once the caller deletes the shapes the last build handed back", async () => {
        // Arrange
        const manager = new OCCTWorkerManager();
        manager.setOccWorker(new KernelWorker());
        const opened = openWindow();

        // Act
        let built: Awaited<ReturnType<typeof buildWithScripts>>;
        try {
            built = await buildWithScripts(manager, { document: luggedPlateDocument, assets: { lugScript: LUG_CODE } });
            await manager.genericCallToWorkerPromise("deleteShapes", { shapes: shapePointersIn(built) });
        } finally {
            opened.close();
        }

        // Assert
        expect([built.pending, built.report.map(entry => entry.status), shapePointersIn(built).length]).toEqual([undefined, ["ok", "ok", "ok"], 4]);
        expect(namesOf([...handlesIn(Object.values(cacheHelper.argCache))].filter(handle => !handle.isDeleted()))).toEqual([]);
        expect(namesOf(opened.made().filter(handle => !handle.isDeleted()))).toEqual(["TopoDS_Face", "TopoDS_Shape", "TopoDS_Shape"]);
    });

    it("should leave alive a shape the caller made before the build when a script of the build makes the same one, which the cache answers with the same shape", async () => {
        // Arrange
        const manager = new OCCTWorkerManager();
        manager.setOccWorker(new KernelWorker());
        const box = await manager.genericCallToWorkerPromise<WorkerReference>("shapes.solid.createBox", LUG_BOX);

        // Act
        const built = await buildWithScripts(manager, { document: luggedPlateDocument, assets: { lugScript: LUG_CODE } });
        const volume = await manager.genericCallToWorkerPromise("shapes.solid.getSolidVolume", { shape: box }).catch(messageOf);

        // Assert
        expect([built.report.map(entry => entry.status), roundedVolume(volume)]).toEqual([["ok", "ok", "ok"], 64]);
    });

    it("should leave alive a shape another caller is answered with while the build runs, between the script that made it and the next build", async () => {
        // Arrange
        const manager = new OCCTWorkerManager();
        let other: Promise<WorkerReference> | undefined;
        manager.setOccWorker(new InterleavingWorker("shapes.solid.createBox", () => {
            other = manager.genericCallToWorkerPromise<WorkerReference>("shapes.solid.createBox", LUG_BOX);
        }));

        // Act
        const built = await buildWithScripts(manager, { document: luggedPlateDocument, assets: { lugScript: LUG_CODE } });
        const volume = await manager.genericCallToWorkerPromise("shapes.solid.getSolidVolume", { shape: await other }).catch(messageOf);

        // Assert
        expect([built.report.map(entry => entry.status), roundedVolume(volume)]).toEqual([["ok", "ok", "ok"], 64]);
    });

    it("should leave alive the shapes a caller built again after deleting those it shared with the build's first round, when the build deletes that round", async () => {
        // Arrange
        const preview = answerOf("design.build", firstRoundOfTheLuggedPlate);
        let rebuilt: WorkerAnswer | undefined;
        const manager = new OCCTWorkerManager();
        manager.setOccWorker(new InterleavingWorker("design.build", () => {
            answerOf("deleteShapes", { shapes: shapePointersIn(preview.result) });
            rebuilt = answerOf("design.build", firstRoundOfTheLuggedPlate);
        }));

        // Act
        const built = await buildWithScripts(manager, { document: luggedPlateDocument, assets: { lugScript: LUG_CODE } });
        const volume = await manager.genericCallToWorkerPromise("shapes.solid.getSolidVolume", { shape: plateOf(rebuilt) }).catch(messageOf);

        // Assert
        expect([built.report.map(entry => entry.status), roundedVolume(volume)]).toEqual([["ok", "ok", "ok"], PLATE_VOLUME]);
    });

    it.each([
        ["cleans the whole cache", (): void => {
            answerOf("cleanAllCache", {});
        }],
        ["starts a run past the cache threshold", (): void => {
            Object.assign(cacheHelper.usedHashes, hashesPastTheThreshold());
            answerOf("startedTheRun", {});
        }],
    ])("should leave alive the shapes a caller built the build's first round again with, when it %s while a script runs and the build fails on the outcome that cleared", async (_when, clear) => {
        // Arrange
        let rebuilt: WorkerAnswer | undefined;
        const manager = new OCCTWorkerManager();
        manager.setOccWorker(new InterleavingWorker("shapes.solid.createBox", () => {
            clear();
            rebuilt = answerOf("design.build", firstRoundOfTheLuggedPlate);
        }));

        // Act
        const failure = await buildWithScripts(manager, { document: luggedPlateDocument, assets: { lugScript: LUG_CODE } }).then(() => "", messageOf);
        const volume = await manager.genericCallToWorkerPromise("shapes.solid.getSolidVolume", { shape: plateOf(rebuilt) }).catch(messageOf);

        // Assert
        expect(failure).toMatch(/^OCCT computation failed while executing function 'design\.build': Shape with hash \d+ not found in cache\./);
        expect(roundedVolume(volume)).toBe(PLATE_VOLUME);
    });

    it("should hand back the last build and delete nothing on a worker that does not know deleteUnsharedShapes, as before the build deleted anything", async () => {
        // Arrange
        const manager = new OCCTWorkerManager();
        const worker = new WorkerBeforeUnsharedDeletes();
        manager.setOccWorker(worker);

        // Act
        const statuses = await buildWithScripts(manager, { document: luggedPlateDocument, assets: { lugScript: LUG_CODE } }).then(built => built.report.map(entry => entry.status), messageOf);

        // Assert
        const handedOut = [...new Set(shapePointersIn(worker.answered).map(pointer => pointer.hash))];
        expect([statuses, handedOut.length, handedOut.filter(hash => cacheHelper.checkCache(hash) === null)]).toEqual([["ok", "ok", "ok"], SHAPES_THE_LUGGED_PLATE_ROUNDS_HAND_OUT, []]);
    });
});
