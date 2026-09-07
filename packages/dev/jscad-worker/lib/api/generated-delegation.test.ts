import { describe, it, expect, beforeEach } from "vitest";
import { JSCADWorkerManager } from "../jscad-worker/jscad-worker-manager";
import { JSCAD } from "./jscad";
import * as Inputs from "@bitbybit-dev/jscad/lib/api/inputs";

// The API layer under lib/api is generated from the kernel: every method is one call posting its own
// dotted path to the worker. check:worker-api pins what is generated and check:worker-parity pins the
// set of paths, but neither runs a line of it. This suite does.

type PostedCall = { action: { functionName: string; inputs: unknown }; uid: string };

const CUBE_SIZE = 2;
const ORIGIN: Inputs.Base.Point3 = [0, 0, 0];

describe("the generated worker API", () => {
    let manager: JSCADWorkerManager;
    let jscad: JSCAD;
    let posted: PostedCall[];

    beforeEach(() => {
        posted = [];
        manager = new JSCADWorkerManager();
        manager.setJscadWorker({
            postMessage: (message: PostedCall) => posted.push(message),
            onmessage: null,
        } as unknown as Worker);
        jscad = new JSCAD(manager);
    });

    it("should post the dotted path of the method that was called", () => {
        // Arrange
        const inputs = new Inputs.JSCAD.CubeDto(ORIGIN, CUBE_SIZE);

        // Act
        void jscad.shapes.cube(inputs);

        // Assert
        expect(posted).toHaveLength(1);
        const [call] = posted as [PostedCall];
        expect(call.action.functionName).toBe("shapes.cube");
        expect(call.action.inputs).toBe(inputs);
    });

    it("should keep each service on its own path", () => {
        // Act
        void jscad.shapes.cube(new Inputs.JSCAD.CubeDto(ORIGIN, CUBE_SIZE));
        void jscad.booleans.union({ meshes: [] });
        void jscad.expansions.expand({ geometry: {}, delta: 1 } as never);

        // Assert
        expect(posted.map((call) => call.action.functionName)).toEqual([
            "shapes.cube",
            "booleans.union",
            "expansions.expand",
        ]);
    });

    it("should settle the call when the worker answers with its identity", async () => {
        // Arrange
        const expected = "a-shape";
        const pending = jscad.shapes.cube(new Inputs.JSCAD.CubeDto(ORIGIN, CUBE_SIZE));

        // Act
        (manager["jscadWorker"] as Worker).onmessage?.({ data: { uid: (posted[0] as PostedCall).uid, result: expected } } as MessageEvent);

        // Assert
        await expect(pending).resolves.toBe(expected);
    });
});
