import { describe, it, expect, beforeAll } from "vitest";
import { createHash } from "node:crypto";
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import { initializationComplete, onMessageInput } from "./occ-worker";

type Ref = { type: string; hash: number };
type Built = { parts: { id: string; shape: Ref }[]; report: { id: string; status: string; cached: boolean }[] };

const call = <R>(functionName: string, inputs: Record<string, unknown>): Promise<R> => new Promise<R>((resolve, reject) => {
    onMessageInput({ action: { functionName, inputs: { ...inputs } }, uid: functionName }, message => {
        if (message === "busy") {
            return;
        }
        const data = message as { result: R; error?: string };
        if (data.error) {
            reject(new Error(data.error));
        } else {
            resolve(data.result);
        }
    });
});

const plate = {
    schemaVersion: 1,
    parameters: { width: 40, corner: 1 },
    features: [
        { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", length: "width" }, { type: "vLine", length: 20 }, { type: "hLine", length: "-width" }, { type: "close" }] },
        { id: "plate", type: "extrude", profile: "base", distance: 10 },
        { id: "round", type: "fillet", body: "plate", radius: "corner", edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 } },
    ],
};

const volumeOf = (built: Built): Promise<number> => call<number>("shapes.solid.getSolidVolume", { shape: built.parts[0]!.shape });

describe("shapes shared between results, through the worker", () => {
    beforeAll(async () => {
        initializationComplete(await initOpenCascade(), undefined, true);
    }, 120_000);

    it("should leave a solid whole after a face taken from it is deleted", async () => {
        // Arrange
        const box = await call<Ref>("shapes.solid.createBox", { width: 1, length: 2, height: 3, center: [0, 0, 0] });
        const face = await call<Ref>("shapes.face.getFace", { shape: box, index: 0 });

        // Act
        await call("deleteShapes", { shapes: [face] });
        const area = await call<number>("shapes.solid.getSolidSurfaceArea", { shape: box });

        // Assert
        expect(area).toBeCloseTo(22, 9);
    });

    it("should build a design whole again after the parts of its last build were deleted, with the same values and with others", async () => {
        // Arrange
        const first = await call<Built>("design.build", { document: plate });
        const firstVolume = await volumeOf(first);
        await call("deleteShapes", { shapes: first.parts.map(part => part.shape) });

        // Act
        const same = await call<Built>("design.build", { document: plate });
        const sameVolume = await volumeOf(same);
        await call("deleteShapes", { shapes: same.parts.map(part => part.shape) });
        const rounder = await call<Built>("design.build", { document: plate, parameters: { corner: 2 } });

        // Assert
        expect(sameVolume).toBeCloseTo(firstVolume, 6);
        expect(rounder.report.map(entry => entry.status)).toEqual(["ok", "ok", "ok"]);
        expect(rounder.report.map(entry => entry.cached)).toEqual([true, true, false]);
        expect(Math.abs(await volumeOf(rounder) - (40 * 20 * 10 - 120 * 2 * 2 * (1 - Math.PI / 4)))).toBeLessThan(5);
    });

    it("should key a design build by the bytes of the assets nested in its inputs", async () => {
        // Arrange
        const brepOf = async (size: number): Promise<ArrayBuffer> => {
            const box = await call<Ref>("shapes.solid.createBox", { width: size, length: size, height: 2, center: [0, 1, 0] });
            const text = await call<string>("io.saveShapeBrep", { shape: box, fileName: "box.brep", tryDownload: false, withTriangulation: false });
            return new TextEncoder().encode(text).buffer;
        };
        const documentOf = (bytes: ArrayBuffer): unknown => ({ schemaVersion: 1, assets: [{ id: "file", uri: "box.brep", sha256: createHash("sha256").update(new Uint8Array(bytes)).digest("hex") }], features: [{ id: "part", type: "import", asset: "file", format: "brep" }] });
        const smallBytes = await brepOf(4);
        const largeBytes = await brepOf(8);

        // Act
        const small = await call<Built>("design.build", { document: documentOf(smallBytes), assets: { file: smallBytes } });
        const large = await call<Built>("design.build", { document: documentOf(largeBytes), assets: { file: largeBytes } });

        // Assert
        expect(await volumeOf(small)).toBeCloseTo(32, 6);
        expect(await volumeOf(large)).toBeCloseTo(128, 6);
    });

    it("should check a `__proto__` key in a document as the property it is, not hide what it holds", async () => {
        // Arrange
        const text = "{\"schemaVersion\":1,\"features\":[{\"id\":\"base\",\"type\":\"sketch\",\"on\":{\"plane\":\"XY\"},\"pen\":[{\"type\":\"hLine\",\"length\":4},{\"type\":\"vLine\",\"length\":4},{\"type\":\"close\"}]},{\"id\":\"block\",\"type\":\"extrude\",\"profile\":\"base\",\"__proto__\":{\"distance\":2}}]}";

        // Act
        const issues = await call<{ path: string }[]>("design.validate", { document: JSON.parse(text) });

        // Assert
        expect(issues.map(issue => issue.path)).toContain("/features/1/__proto__");
    });
});
