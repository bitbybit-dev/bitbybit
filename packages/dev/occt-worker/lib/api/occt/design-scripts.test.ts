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

class BuildingWorker extends AnsweringWorker {
    readonly builds: Inputs.OCCT.DesignBuildDto<Inputs.OCCT.TopoDSShapePointer>[] = [];

    constructor(private readonly answer: (functionName: string, inputs: unknown, builds: number) => unknown) {
        super();
    }

    override postMessage(message: PostedCall): void {
        this.posted.push(message);
        const { functionName, inputs } = message.action;
        if (functionName === "design.build") {
            this.builds.push(inputs as Inputs.OCCT.DesignBuildDto<Inputs.OCCT.TopoDSShapePointer>);
        }
        this.onmessage?.({ data: { uid: message.uid, result: this.answer(functionName, inputs, this.builds.length) } } as MessageEvent);
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
        expect(worker.paths()).toEqual(["design.build", "shapes.solid.createBox", "design.build", "shapes.solid.createCylinder", "design.build"]);
        expect(worker.posted[1]!.action.inputs).toEqual({ width: 4 });
        expect(worker.posted[3]!.action.inputs).toEqual({ radius: 7 });
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
        expect(worker.paths()).toEqual(["design.build", "shapes.solid.createBox", "design.build"]);
        expect(worker.builds[1]!.outcomes).toEqual([supplied, { hash: "pin-hash", shape: BOX }]);
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
});
