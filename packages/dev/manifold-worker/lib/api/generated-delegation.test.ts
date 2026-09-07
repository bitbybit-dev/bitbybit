import { describe, it, expect, beforeEach } from "vitest";
import { ManifoldWorkerManager } from "../manifold-worker/manifold-worker-manager";
import { ManifoldBitByBit } from "./manifold-bitbybit";
import * as Inputs from "@bitbybit-dev/manifold/lib/api/inputs";

// The API layer under lib/api is generated from the kernel: every method is one call posting its own
// dotted path to the worker. check:worker-api pins what is generated and check:worker-parity pins the
// set of paths, but neither runs a line of it. This suite does.

type PostedCall = { action: { functionName: string; inputs: unknown }; uid: string };

const CUBE_SIZE = 2;

describe("the generated worker API", () => {
    let manager: ManifoldWorkerManager;
    let manifold: ManifoldBitByBit;
    let posted: PostedCall[];

    beforeEach(() => {
        posted = [];
        manager = new ManifoldWorkerManager();
        manager.setManifoldWorker({
            postMessage: (message: PostedCall) => posted.push(message),
            onmessage: null,
        } as unknown as Worker);
        manifold = new ManifoldBitByBit(manager);
    });

    it("should post the dotted path of the method that was called", () => {
        // Arrange
        const inputs = new Inputs.Manifold.CubeDto(true, CUBE_SIZE);

        // Act
        void manifold.manifold.shapes.cube(inputs);

        // Assert
        expect(posted).toHaveLength(1);
        const [call] = posted as [PostedCall];
        expect(call.action.functionName).toBe("manifold.shapes.cube");
        expect(call.action.inputs).toBe(inputs);
    });

    it("should keep the three top-level services on their own paths", () => {
        // Act
        void manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));
        void manifold.crossSection.shapes.circle({ radius: 1 } as never);
        void manifold.mesh.evaluate.numProp({ mesh: {} } as never);

        // Assert
        const paths = posted.map((call) => call.action.functionName);
        expect(paths[0]).toBe("manifold.shapes.cube");
        expect(paths[1]?.startsWith("crossSection.")).toBe(true);
        expect(paths[2]?.startsWith("mesh.")).toBe(true);
    });

    it("should settle the call when the worker answers with its identity", async () => {
        // Arrange
        const expected = "a-manifold";
        const pending = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));

        // Act
        (manager["manifoldWorker"] as Worker).onmessage?.({ data: { uid: (posted[0] as PostedCall).uid, result: expected } } as MessageEvent);

        // Assert
        await expect(pending).resolves.toBe(expected);
    });
});
