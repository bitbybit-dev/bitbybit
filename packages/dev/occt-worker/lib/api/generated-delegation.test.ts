import { describe, it, expect, beforeEach } from "vitest";
import { OCCTWorkerManager } from "../occ-worker/occ-worker-manager";
import { OCCT } from "./occt/occt";
import * as Inputs from "@bitbybit-dev/occt/lib/api/inputs";

// The API layer under lib/api is generated from the kernel: every method is one call posting its own
// dotted path to the worker. What is generated is pinned byte for byte by check:worker-api, and the
// set of paths by check:worker-parity - but neither of those runs a single line of it. This suite
// does, across the shapes of method the generator emits, so a generator change that produced valid
// code doing the wrong thing fails here.

type PostedCall = { action: { functionName: string; inputs: unknown }; uid: string };

const SPHERE_RADIUS = 5;
const WIRE_POINTER = "wire-pointer" as unknown as Inputs.OCCT.TopoDSWirePointer;

describe("the generated worker API", () => {
    let manager: OCCTWorkerManager;
    let occt: OCCT;
    let posted: PostedCall[];

    beforeEach(() => {
        posted = [];
        manager = new OCCTWorkerManager();
        manager.setOccWorker({
            postMessage: (message: PostedCall) => posted.push(message),
            onmessage: null,
        } as unknown as Worker);
        occt = new OCCT(manager);
    });

    it("should post the dotted path of the method that was called", async () => {
        // Arrange
        const inputs = new Inputs.OCCT.SphereDto(SPHERE_RADIUS, [0, 0, 0]);

        // Act
        void occt.shapes.solid.createSphere(inputs);

        // Assert
        expect(posted).toHaveLength(1);
        expect(posted[0]!.action.functionName).toBe("shapes.solid.createSphere");
        expect(posted[0]!.action.inputs).toBe(inputs);
    });

    it("should keep each nested service on its own path", () => {
        // Act
        void occt.shapes.wire.createCircleWire(new Inputs.OCCT.CircleDto(1, [0, 0, 0], [0, 1, 0]));
        void occt.shapes.face.getFaceArea({ shape: WIRE_POINTER } as never);
        void occt.transforms.translate({ shape: WIRE_POINTER, translation: [1, 0, 0] } as never);

        // Assert
        expect(posted.map((call) => call.action.functionName)).toEqual([
            "shapes.wire.createCircleWire",
            "shapes.face.getFaceArea",
            "transforms.translate",
        ]);
    });

    it("should give every call its own identity so replies can be matched back", () => {
        // Act
        void occt.shapes.wire.createCircleWire(new Inputs.OCCT.CircleDto(1, [0, 0, 0], [0, 1, 0]));
        void occt.shapes.wire.createCircleWire(new Inputs.OCCT.CircleDto(2, [0, 0, 0], [0, 1, 0]));

        // Assert
        expect(posted[0]!.uid).not.toBe(posted[1]!.uid);
    });

    it("should settle the call when the worker answers with its identity", async () => {
        // Arrange
        const expected = "a-shape-pointer";
        const pending = occt.shapes.solid.createSphere(new Inputs.OCCT.SphereDto(SPHERE_RADIUS, [0, 0, 0]));

        // Act
        (manager["occWorker"] as Worker).onmessage?.({ data: { uid: posted[0]!.uid, result: expected } } as MessageEvent);

        // Assert
        await expect(pending).resolves.toBe(expected);
    });

    it("should reject the call when the worker answers with an error", async () => {
        // Arrange
        const message = "the kernel refused";
        manager.errorCallback = (): void => undefined;
        const pending = occt.shapes.solid.createSphere(new Inputs.OCCT.SphereDto(SPHERE_RADIUS, [0, 0, 0]));

        // Act
        (manager["occWorker"] as Worker).onmessage?.({ data: { uid: posted[0]!.uid, error: message } } as MessageEvent);

        // Assert
        await expect(pending).rejects.toThrow(message);
    });
});
