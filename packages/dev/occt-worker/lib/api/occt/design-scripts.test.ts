import { describe, it, expect, beforeEach } from "vitest";
import type { Inputs, Models } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";
import type { PostedCall } from "../__mocks__/test-helpers";
import { AnsweringWorker } from "../__mocks__/test-helpers";
import { OCCTDesign } from "./design";

type Result = Models.OCCT.DesignBuildResult<Inputs.OCCT.TopoDSShapePointer>;
type Pending = Models.OCCT.DesignPendingScript<Inputs.OCCT.TopoDSShapePointer>;

const BOX: Inputs.OCCT.TopoDSShapePointer = { hash: 7, type: "occ-shape" };
const PLATE: Inputs.OCCT.TopoDSShapePointer = { hash: 3, type: "occ-shape" };

const document: Models.OCCT.DesignPartDocument = {
    schemaVersion: 1,
    assets: [{ id: "lugScript", uri: "lug.js", sha256: "0".repeat(64) }, { id: "pinScript", uri: "pin.js", sha256: "1".repeat(64) }],
    features: [
        { id: "lug", type: "script", script: "lugScript", params: { size: 4 } },
        { id: "pin", type: "script", script: "pinScript", params: { on: { body: "lug" } } },
    ],
};

const result = (pending: Pending[]): Result => ({ parts: [], report: [], issues: [], parameters: {}, units: { length: "mm", angle: "deg" }, up: "y", ...(pending.length === 0 ? {} : { pending }) });

const waiting = (id: string, script: string, inputs: Record<string, unknown>): Pending => ({ id, path: `/features/${id}`, script, hash: `${id}-hash`, inputs });

const pointer = (hash: number): Inputs.OCCT.TopoDSShapePointer => ({ hash, type: "occ-shape" });

const partOf = (hash: number): Models.OCCT.DesignBuiltPart<Inputs.OCCT.TopoDSShapePointer> => ({ id: `part-${hash}`, itemKey: "0".repeat(16), buildKey: "0".repeat(16), name: "part", body: "body", shape: pointer(hash), shapeHash: "", faceNames: [], properties: {}, connectors: [], parameters: {} });

const withParts = (built: Result, ...hashes: number[]): Result => ({ ...built, parts: hashes.map(partOf) });

const WORKER_EPOCH = 5;

const UNKNOWN_PATH = "OCCT computation failed while executing function 'deleteUnsharedShapes': \"deleteUnsharedShapes\" is not a function. Input values were: {shapes: []}.";

const CANCELLED = "OCCT 'deleteUnsharedShapes' was cancelled before it finished; nothing it made was kept.";

const messageOf = (error: unknown): string => error instanceof Error ? error.message : String(error);

const isUnsharedDelete = (call: PostedCall): boolean => call.action.functionName === "deleteUnsharedShapes";

const asksTheEpoch = (call: PostedCall): boolean => isUnsharedDelete(call) && typeof call.action.inputs === "object" && call.action.inputs !== null && !("epoch" in call.action.inputs);

const isCleanup = (call: PostedCall): boolean => isUnsharedDelete(call) && !asksTheEpoch(call);

const deletedBy = (worker: BuildingWorker): unknown[] => worker.posted.filter(isCleanup).map(call => call.action.inputs);

const answeredOnce = (shape: Inputs.OCCT.TopoDSShapePointer): Inputs.OCCT.TopoDSShapePointer & { answers: number } => ({ ...shape, answers: 1 });

const inEpoch = (...shapes: Inputs.OCCT.TopoDSShapePointer[]): { epoch: number; shapes: unknown[] } => ({ epoch: WORKER_EPOCH, shapes: shapes.map(answeredOnce) });

const deletedHashes = (worker: BuildingWorker): unknown[][] => worker.posted.filter(isCleanup).map(call => {
    const inputs = call.action.inputs;
    const shapes: unknown = typeof inputs === "object" && inputs !== null && "shapes" in inputs ? inputs.shapes : undefined;
    return Array.isArray(shapes) ? shapes.map((shape: unknown) => typeof shape === "object" && shape !== null && "hash" in shape ? shape.hash : undefined) : [];
});

class BuildingWorker extends AnsweringWorker {
    readonly builds: Inputs.OCCT.DesignBuildDto<Inputs.OCCT.TopoDSShapePointer>[] = [];

    constructor(
        private readonly answer: (functionName: string, inputs: unknown, builds: number) => unknown,
        private readonly refusal: (call: PostedCall, builds: number) => string | { error: string; errorKind: string } | undefined = () => undefined,
        private readonly unsharedDeleteAnswer: unknown = { epoch: WORKER_EPOCH },
    ) {
        super();
    }

    override postMessage(message: PostedCall): void {
        this.posted.push(message);
        const { functionName, inputs } = message.action;
        if (functionName === "design.build") {
            this.builds.push(inputs as Inputs.OCCT.DesignBuildDto<Inputs.OCCT.TopoDSShapePointer>);
        }
        const refused = this.refusal(message, this.builds.length);
        const answered = isUnsharedDelete(message) ? this.unsharedDeleteAnswer : this.answer(functionName, inputs, this.builds.length);
        this.onmessage?.({ data: refused === undefined ? { uid: message.uid, result: answered } : { uid: message.uid, ...(typeof refused === "string" ? { error: refused, errorKind: "kernel" } : refused) } } as MessageEvent);
    }
}

describe("building a design with its scripts", () => {
    let manager: OCCTWorkerManager;

    beforeEach(() => {
        manager = new OCCTWorkerManager();
    });

    it("should run each script once its inputs are ready, with the package's API, and build again with what each made until none waits", async () => {
        // Arrange
        const worker = new BuildingWorker((functionName, _inputs, builds) => {
            if (functionName === "shapes.solid.createBox") {
                return BOX;
            }
            if (functionName === "shapes.solid.createCylinder") {
                return { ...PLATE, hash: 9 };
            }
            return result(builds === 1 ? [waiting("lug", "lugScript", { size: 4 })] : builds === 2 ? [waiting("pin", "pinScript", { on: BOX })] : []);
        });
        manager.setOccWorker(worker);
        const design = new OCCTDesign(manager);
        const assets = {
            lugScript: "const box = await occt.shapes.solid.createBox({ width: inputs.size }); return { shape: box, roles: { top: [5] } };",
            pinScript: new TextEncoder().encode("return occt.shapes.solid.createCylinder({ radius: inputs.on.hash });"),
        };

        // Act
        const built = await design.buildWithScripts({ document, assets });

        // Assert
        expect(built.pending).toBeUndefined();
        expect(worker.paths()).toEqual(["deleteUnsharedShapes", "design.build", "shapes.solid.createBox", "design.build", "shapes.solid.createCylinder", "design.build", "deleteUnsharedShapes"]);
        expect(worker.posted[2]!.action.inputs).toEqual({ width: 4 });
        expect(worker.posted[4]!.action.inputs).toEqual({ radius: 7 });
        expect(worker.builds.map(build => build.outcomes)).toEqual([
            [],
            [{ hash: "lug-hash", shape: BOX, roles: { top: [5] } }],
            [{ hash: "lug-hash", shape: BOX, roles: { top: [5] } }, { hash: "pin-hash", shape: { ...PLATE, hash: 9 } }],
        ]);
    });

    it("should stop after every script has had its turn, handing back what still waits", async () => {
        // Arrange
        const worker = new BuildingWorker((functionName) => functionName === "design.build" ? result([waiting("lug", "lugScript", {})]) : BOX);
        manager.setOccWorker(worker);
        const design = new OCCTDesign(manager);

        // Act
        const built = await design.buildWithScripts({ document, assets: { lugScript: "return occt.shapes.solid.createBox({});", pinScript: "" } });

        // Assert
        expect(built.pending?.map(pending => pending.id)).toEqual(["lug"]);
        expect(worker.builds).toHaveLength(2);
    });

    it("should give a script the package by dotted path only, never as a promise or by a symbol", async () => {
        // Arrange
        manager.setOccWorker(new BuildingWorker((functionName, _inputs, builds) => functionName === "design.build" ? result(builds === 1 ? [waiting("lug", "lugScript", {})] : []) : BOX));
        const design = new OCCTDesign(manager);
        const code = "if (occt.then !== undefined || occt.shapes[Symbol.toPrimitive] !== undefined) { throw new Error(\"not a plain path\"); } return occt.shapes.solid.createBox({});";

        // Act
        const built = await design.buildWithScripts({ document, assets: { lugScript: code } });

        // Assert
        expect(built.pending).toBeUndefined();
    });

    it("should read code from any bytes, count the scripts of the documents an assembly places, and leave what the caller supplied already", async () => {
        // Arrange
        const worker = new BuildingWorker((functionName, _inputs, builds) => functionName === "design.build"
            ? result(builds === 1 ? [waiting("lug", "lugScript", {}), waiting("pin", "pinScript", {})] : [])
            : BOX);
        manager.setOccWorker(worker);
        const design = new OCCTDesign(manager);
        const assembly: Models.OCCT.DesignAssemblyDocument = { schemaVersion: 1, kind: "assembly", components: [] };
        const supplied = { hash: "lug-hash", shape: PLATE };

        // Act
        const built = await design.buildWithScripts({
            document,
            documents: [assembly, document],
            assets: { pinScript: new TextEncoder().encode("return occt.shapes.solid.createBox({});").buffer },
            outcomes: [supplied],
        });

        // Assert
        expect(built.pending).toBeUndefined();
        expect(worker.paths()).toEqual(["deleteUnsharedShapes", "design.build", "shapes.solid.createBox", "design.build", "deleteUnsharedShapes"]);
        expect(worker.builds[1]!.outcomes).toEqual([supplied, { hash: "pin-hash", shape: BOX }]);
        expect(worker.posted[4]!.action.inputs).toEqual(inEpoch(BOX));
    });

    it("should take a bare shape or one with roles, leave out roles that are not a table, and refuse what is not a shape", async () => {
        // Arrange
        const design = new OCCTDesign(manager);
        const outcomeOf = async (code: string): Promise<unknown> => {
            const worker = new BuildingWorker((functionName, _inputs, builds) => functionName === "design.build" ? result(builds === 1 ? [waiting("lug", "lugScript", {})] : []) : BOX);
            manager.setOccWorker(worker);
            try {
                await design.buildWithScripts({ document, assets: { lugScript: code } });
                return worker.builds[1]?.outcomes?.[0];
            } catch (error) {
                return error instanceof Error ? error.message : String(error);
            }
        };

        // Act
        const outcomes: unknown[] = [];
        for (const code of [
            "return { shape: { hash: 7, type: \"occ-shape\" }, roles: \"top\" };",
            "return { shape: { hash: 7, type: \"occ-shape\" }, roles: null };",
            "return null;",
            "return { shape: null };",
            "return { shape: { type: \"occ-shape\" } };",
            "return { shape: { hash: 7 } };",
            "return { shape: { hash: 7, type: \"occ-entity\" } };",
            "throw \"a plain text\";",
        ]) {
            outcomes.push(await outcomeOf(code));
        }

        // Assert
        const noShape = "The script of \"lug\" returned no shape: it returns a shape, or { shape, roles }.";
        expect(outcomes).toEqual([{ hash: "lug-hash", shape: BOX }, { hash: "lug-hash", shape: BOX }, noShape, noShape, noShape, noShape, noShape, "The script of \"lug\" failed: a plain text"]);
    });

    it("should name the script that failed, returned no shape, or was given no code", async () => {
        // Arrange
        manager.setOccWorker(new BuildingWorker(() => result([waiting("lug", "lugScript", {})])));
        const design = new OCCTDesign(manager);
        const run = (code: string | undefined): Promise<unknown> => design.buildWithScripts(code === undefined ? { document } : { document, assets: { lugScript: code } });

        // Act
        const failures = await Promise.all([run("throw new Error(\"no gear\");"), run("return 42;"), run(undefined)].map(promise => promise.then(() => "", (error: unknown) => error instanceof Error ? error.message : String(error))));

        // Assert
        expect(failures).toEqual([
            "The script of \"lug\" failed: no gear",
            "The script of \"lug\" returned no shape: it returns a shape, or { shape, roles }.",
            "The build was given no code for the script asset \"lugScript\".",
        ]);
    });

    it("should delete each build's shapes once the next build has run, keeping a shape passed on as an outcome until the last build has taken it, with the shapes the scripts made", async () => {
        // Arrange
        const builds = [
            withParts(result([waiting("lug", "lugScript", { on: pointer(21) })]), 31),
            withParts(result([waiting("pin", "pinScript", { on: pointer(22) })]), 32, 33),
            withParts(result([]), 34, 35, 36),
        ];
        const worker = new BuildingWorker((functionName, _inputs, built) => functionName === "design.build" ? builds[built - 1] : BOX);
        manager.setOccWorker(worker);
        const design = new OCCTDesign(manager);

        // Act
        const built = await design.buildWithScripts({ document, assets: { lugScript: "return occt.shapes.solid.createBox({});", pinScript: "return inputs.on;" } });

        // Assert
        expect(built).toBe(builds[2]);
        expect(worker.paths()).toEqual(["deleteUnsharedShapes", "design.build", "shapes.solid.createBox", "design.build", "deleteUnsharedShapes", "design.build", "deleteUnsharedShapes", "deleteUnsharedShapes"]);
        expect(worker.builds[2]!.outcomes).toEqual([{ hash: "lug-hash", shape: BOX }, { hash: "pin-hash", shape: pointer(22) }]);
        expect(deletedBy(worker)).toEqual([inEpoch(pointer(31), pointer(21)), inEpoch(pointer(32), pointer(33)), inEpoch(pointer(22), BOX)]);
    });

    it("should delete the shapes of the builds and scripts so far, but none the caller supplied, when a script fails, and throw the script's failure on", async () => {
        // Arrange
        const callers = pointer(99);
        const builds = [
            withParts(result([waiting("lug", "lugScript", { on: pointer(21) })]), 31),
            withParts(result([waiting("pin", "pinScript", { on: pointer(22) })]), 32),
        ];
        const worker = new BuildingWorker((functionName, _inputs, built) => functionName === "design.build" ? builds[built - 1] : callers);
        manager.setOccWorker(worker);
        const design = new OCCTDesign(manager);

        // Act
        const failure = await design.buildWithScripts({ document, assets: { lugScript: "return occt.shapes.solid.createBox({});", pinScript: "throw new Error(\"no pin\");" }, outcomes: [{ hash: "other-hash", shape: callers }] })
            .then(() => "", (error: unknown) => error instanceof Error ? error.message : String(error));

        // Assert
        expect(failure).toBe("The script of \"pin\" failed: no pin");
        expect(deletedBy(worker)).toEqual([inEpoch(pointer(31), pointer(21)), inEpoch(pointer(32), pointer(22))]);
    });

    it("should ask the worker to delete each shape with the number of the build's answers that carried it, and leave out a shape none of them carried", async () => {
        // Arrange
        const worker = new BuildingWorker((functionName, _inputs, built) => functionName === "design.build" ? result(built === 1 ? [waiting("lug", "lugScript", {}), waiting("pin", "pinScript", {})] : []) : BOX);
        manager.setOccWorker(worker);
        const design = new OCCTDesign(manager);
        const neverAnswered = pointer(55);

        // Act
        await design.buildWithScripts({ document, assets: { lugScript: "await occt.shapes.solid.createBox({}); return occt.shapes.solid.createBox({});", pinScript: `return ${JSON.stringify(neverAnswered)};` } });

        // Assert
        expect(deletedBy(worker)).toEqual([{ epoch: WORKER_EPOCH, shapes: [{ ...BOX, answers: 2 }] }]);
    });

    it("should delete the shapes of the build it was cleaning up after, with every other it made, when deleting the earlier build's shapes is refused", async () => {
        // Arrange
        const builds = [
            withParts(result([waiting("lug", "lugScript", { on: pointer(21) })]), 31),
            withParts(result([waiting("pin", "pinScript", { on: pointer(22) })]), 32, 33),
        ];
        let deletes = 0;
        const worker = new BuildingWorker(
            (functionName, _inputs, built) => functionName === "design.build" ? builds[built - 1] : BOX,
            (call) => isCleanup(call) && ++deletes === 1 ? "cancelled before it finished" : undefined,
        );
        manager.setOccWorker(worker);
        const design = new OCCTDesign(manager);

        // Act
        const failure = await design.buildWithScripts({ document, assets: { lugScript: "return occt.shapes.solid.createBox({});", pinScript: "return inputs.on;" } })
            .then(() => "", (error: unknown) => error instanceof Error ? error.message : String(error));

        // Assert
        expect(failure).toBe("cancelled before it finished");
        expect(deletedHashes(worker).at(-1)).toEqual([31, 21, 32, 33, 22, 7]);
    });

    it("should delete the last build's shapes too, and throw, when deleting the shapes before them is refused at the end", async () => {
        // Arrange
        const builds = [
            withParts(result([waiting("lug", "lugScript", { on: pointer(21) })]), 31),
            withParts(result([]), 34),
        ];
        let deletes = 0;
        const worker = new BuildingWorker(
            (functionName, _inputs, built) => functionName === "design.build" ? builds[built - 1] : BOX,
            (call) => isCleanup(call) && ++deletes === 2 ? "cancelled before it finished" : undefined,
        );
        manager.setOccWorker(worker);
        const design = new OCCTDesign(manager);

        // Act
        const failure = await design.buildWithScripts({ document, assets: { lugScript: "return occt.shapes.solid.createBox({});" } })
            .then(() => "", (error: unknown) => error instanceof Error ? error.message : String(error));

        // Assert
        expect(failure).toBe("cancelled before it finished");
        expect(deletedHashes(worker)).toEqual([[31, 21], [7], [34, 7]]);
    });

    it("should throw a failed build on after deleting the shapes of the builds and scripts before it", async () => {
        // Arrange
        const worker = new BuildingWorker(
            (functionName) => functionName === "design.build" ? withParts(result([waiting("lug", "lugScript", { on: pointer(21) })]), 31) : BOX,
            (call, builds) => call.action.functionName === "design.build" && builds === 2 ? "the kernel refused it" : undefined,
        );
        manager.setOccWorker(worker);
        const design = new OCCTDesign(manager);

        // Act
        const failure = await design.buildWithScripts({ document, assets: { lugScript: "return occt.shapes.solid.createBox({});" } })
            .then(() => "", (error: unknown) => error instanceof Error ? error.message : String(error));

        // Assert
        expect(failure).toBe("the kernel refused it");
        expect(deletedBy(worker)).toEqual([inEpoch(pointer(31), pointer(21), BOX)]);
    });

    it("should ask the worker for the epoch of its cache before the first build, and name that epoch in every delete", async () => {
        // Arrange
        const worker = new BuildingWorker((functionName, _inputs, built) => functionName === "design.build" ? withParts(result(built === 1 ? [waiting("lug", "lugScript", {})] : []), 30 + built) : BOX);
        manager.setOccWorker(worker);
        const design = new OCCTDesign(manager);

        // Act
        await design.buildWithScripts({ document, assets: { lugScript: "return occt.shapes.solid.createBox({});" } });

        // Assert
        expect(worker.posted[0]!.action).toEqual({ functionName: "deleteUnsharedShapes", inputs: { shapes: [] } });
        expect(deletedBy(worker)).toEqual([inEpoch(pointer(31)), inEpoch(BOX)]);
    });

    it("should ask the worker nothing but the build for documents without scripts", async () => {
        // Arrange
        const worker = new BuildingWorker(() => withParts(result([]), 31));
        manager.setOccWorker(worker);
        const design = new OCCTDesign(manager);

        // Act
        const built = await design.buildWithScripts({ document: { schemaVersion: 1, features: [] } });

        // Assert
        expect([worker.paths(), built.parts.map(part => part.shape)]).toEqual([["design.build"], [pointer(31)]]);
    });

    it("should hand back the last build and delete nothing on a worker that refuses the first request as a path it does not know, as a worker made before the command does", async () => {
        // Arrange
        const builds = [withParts(result([waiting("lug", "lugScript", { on: pointer(21) })]), 31), withParts(result([]), 34)];
        const worker = new BuildingWorker((functionName, _inputs, built) => functionName === "design.build" ? builds[built - 1] : BOX, (call) => isUnsharedDelete(call) ? UNKNOWN_PATH : undefined);
        manager.setOccWorker(worker);
        const design = new OCCTDesign(manager);

        // Act
        const built = await design.buildWithScripts({ document, assets: { lugScript: "return occt.shapes.solid.createBox({});" } });

        // Assert
        expect(built).toBe(builds[1]);
        expect(worker.paths()).toEqual(["deleteUnsharedShapes", "design.build", "shapes.solid.createBox", "design.build"]);
    });

    it("should delete nothing on a worker that answers the first request without an epoch", async () => {
        // Arrange
        const builds = [withParts(result([waiting("lug", "lugScript", { on: pointer(21) })]), 31), withParts(result([]), 34)];
        const worker = new BuildingWorker((functionName, _inputs, built) => functionName === "design.build" ? builds[built - 1] : BOX, () => undefined, {});
        manager.setOccWorker(worker);
        const design = new OCCTDesign(manager);

        // Act
        const built = await design.buildWithScripts({ document, assets: { lugScript: "return occt.shapes.solid.createBox({});" } });

        // Assert
        expect(built).toBe(builds[1]);
        expect(worker.paths()).toEqual(["deleteUnsharedShapes", "design.build", "shapes.solid.createBox", "design.build"]);
    });

    it.each(["cancelled", "crash"])("should throw on a first request the worker refuses as %s, and build nothing", async (errorKind) => {
        // Arrange
        const worker = new BuildingWorker(() => result([]), (call) => isUnsharedDelete(call) ? { error: CANCELLED, errorKind } : undefined);
        manager.setOccWorker(worker);
        const design = new OCCTDesign(manager);

        // Act
        const failure = await design.buildWithScripts({ document, assets: { lugScript: "return occt.shapes.solid.createBox({});" } }).then(() => "", messageOf);

        // Assert
        expect([failure, worker.paths()]).toEqual([CANCELLED, ["deleteUnsharedShapes"]]);
    });
});
