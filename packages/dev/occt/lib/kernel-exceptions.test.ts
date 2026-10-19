import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import type { BitbybitOcctModule, TopoDS_Edge } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "./occ-helper";
import { OCCTService } from "./occ-service";
import type * as Models from "./api/models";
import { readKernelException } from "./kernel-exception";
import { releaseDesignCaches } from "./release-design-caches";
import { openWindow } from "../../__test__/embind-ledger";
import type { Act, Arranged } from "./__test__/lifetime-cases-types";

const WARM_UP_CALLS = 3;
const CALLS = 40;
const MOST_BYTES_PER_CALL = 16;

describe("C++ exceptions a service catches are freed", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;
    let och: OccHelper;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        kernel.SetMeshRetention(0);
        och = new OccHelper(kernel);
        occt = new OCCTService(kernel, och);
    }, 120_000);

    const replaced = new Map<string, unknown>();

    afterEach(() => {
        replaced.forEach((original, name) => Reflect.set(kernel, name, original));
        replaced.clear();
        vi.restoreAllMocks();
    });

    const failure = (): unknown => {
        const point = new kernel.gp_Pnt(1, 2, 3);
        const maker = new kernel.BRepBuilderAPI_MakeEdge(point, point);
        try {
            return maker.Edge();
        } catch (error) {
            return error;
        } finally {
            maker.delete();
            point.delete();
        }
    };
    const throwing = function (): never {
        throw failure();
    };
    const stub = (name: string): void => {
        if (!replaced.has(name)) {
            replaced.set(name, Reflect.get(kernel, name));
        }
        Reflect.set(kernel, name, throwing);
    };
    const line = (): TopoDS_Edge => occt.shapes.edge.line({ start: [0, 0, 0], end: [10, 0, 0] });
    const box = (): ReturnType<OCCTService["shapes"]["solid"]["createBox"]> => occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [0, 0, 0] });
    const pushedPastItsNeighbours: Models.OCCT.DesignPartDocument = {
        schemaVersion: 1,
        features: [
            { id: "base", type: "sketch", on: { plane: "XY" }, start: [0, 0], pen: [{ type: "hLine", length: 10 }, { type: "vLine", length: 10 }, { type: "hLine", length: -10 }, { type: "close" }] },
            { id: "plate", type: "extrude", profile: "base", distance: 2 },
            { id: "top", type: "sketch", on: { face: { of: "plate", role: "end" }, origin: [5, 5, 2] }, start: [-2, -2], pen: [{ type: "hLine", length: 4 }, { type: "vLine", length: 4 }, { type: "hLine", length: -4 }, { type: "close" }] },
            { id: "step", type: "boss", profile: "top", body: "plate", distance: 3 },
            { id: "sink", type: "pushPull", body: "plate", face: { of: "step", role: "end" }, distance: -4, mode: "offset" },
        ],
    };

    const roundedPlate: Models.OCCT.DesignPartDocument = {
        schemaVersion: 1,
        parameters: { radius: { value: 1, min: 0 } },
        features: [
            { id: "base", type: "sketch", on: { plane: "XY" }, start: [0, 0], pen: [{ type: "hLine", length: 30 }, { type: "vLine", length: 12 }, { type: "hLine", length: -30 }, { type: "close" }] },
            { id: "plate", type: "extrude", profile: "base", distance: 4 },
            { id: "corners", type: "fillet", body: "plate", radius: "radius", edges: { between: [{ of: "plate", role: "side" }, { of: "plate", role: "side" }], count: 4 } },
        ],
    };

    const isRawKernelException = (thrown: unknown): boolean => thrown instanceof (Reflect.get(WebAssembly, "Exception") as new (...args: never[]) => object);

    const measured = (act: Act): { bytesPerCall: number; freedPerCall: number; rawThrows: number } => {
        const freed = vi.spyOn(kernel, "decrementExceptionRefcount");
        let counting = false;
        let freedInside = 0;
        let rawThrows = 0;
        const once = (): void => {
            const opened = openWindow();
            const before = freed.mock.calls.length;
            try {
                act();
                freedInside += counting ? freed.mock.calls.length - before : 0;
            } catch (error) {
                freedInside += counting ? freed.mock.calls.length - before : 0;
                rawThrows += counting && isRawKernelException(error) ? 1 : 0;
                readKernelException(kernel, error);
            } finally {
                opened.close();
            }
            releaseDesignCaches(occt);
            opened.made().filter(handle => !handle.isDeleted()).forEach(handle => handle.delete());
        };
        for (let call = 0; call < WARM_UP_CALLS; call++) {
            once();
        }
        counting = true;
        const before = kernel.HeapBytesInUse();
        for (let call = 0; call < CALLS; call++) {
            once();
        }
        const bytesPerCall = (kernel.HeapBytesInUse() - before) / CALLS;
        return { bytesPerCall, freedPerCall: freedInside / CALLS, rawThrows };
    };

    const reached: Arranged[] = [
        ["asking a straight edge for its radius", () => { const shape = line(); return () => occt.shapes.edge.getCircularEdgeRadius({ shape }); }],
        ["asking a straight edge for the circle it would lie on in its plane", () => { const shape = line(); return () => och.edgesService.getGpCircle2dFromEdge({ shape }); }],
        ["making the edges of a mesh whose triangle has two corners at one point", () => () => occt.shapes.edge.fromBaseMesh({ mesh: [[[0, 0, 0], [0, 0, 0], [1, 0, 0]]] })],
        ["building a design that pushes a face by an offset that fails", () => () => occt.design.build({ document: pushedPastItsNeighbours })],
    ];

    const stubbed: Arranged[] = [
        ["writing STEP when the writer cannot transfer the shape", () => { vi.spyOn(kernel.STEPControl_Writer.prototype, "Transfer").mockImplementation(throwing); const shape = box(); return () => occt.io.saveShapeSTEP({ shape, fileName: "box.step", adjustYtoZ: false }); }],
        ["scaling a box unevenly when the kernel cannot transform it", () => { vi.spyOn(kernel.BRepBuilderAPI_GTransform.prototype, "Shape").mockImplementation(throwing); const shape = box(); return () => occt.transforms.scale3d({ shape, scale: [1, 2, 3], center: [0, 0, 0] }); }],
        ["transforming a box by an uneven matrix when the kernel cannot transform it", () => { vi.spyOn(kernel.BRepBuilderAPI_GTransform.prototype, "Shape").mockImplementation(throwing); const shape = box(); return () => occt.transforms.transformByMatrix({ shape, transformation: [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1] }); }],
        ["splitting a wire at a point the kernel cannot project", () => { stub("ProjectPointOnCurve"); const shape = occt.shapes.wire.createLineWire({ start: [0, 0, 0], end: [10, 0, 0] }); return () => occt.shapes.wire.splitOnPoints({ shape, points: [[5, 0, 0]] }); }],
        ["reading the corner points of a box's edges when the kernel cannot read an edge", () => { stub("BRep_Tool_GetEdgeParameters"); const shape = box(); return () => och.edgesService.getCornerPointsOfEdgesForShape({ shape }); }],
        ["making the edges of a polygon wire when the kernel cannot build it", () => { stub("BRepBuilderAPI_MakePolygon"); return () => occt.shapes.wire.fromBaseMesh({ mesh: [[[0, 0, 0], [1, 0, 0], [0, 1, 0]]] }); }],
        ["converting STEP bytes to glTF when the kernel throws", () => { stub("ConvertStepToGltfFromBinary"); const stepData = new TextEncoder().encode("ISO-10303-21;"); return () => occt.io.convertStepToGltf({ stepData }); }],
        ["reading STEP into JSON when the kernel throws", () => { stub("ParseStepAssemblyToJsonFromMemory"); stub("ParseStepAssemblyToJsonFromBinary"); return () => occt.io.parseStepToJson({ stepData: "ISO-10303-21;" }); }],
        ["probing a fillet when the kernel cannot round the plate", () => { vi.spyOn(occt.fillets, "filletEdges").mockImplementation(throwing); return () => occt.design.probeFillet({ document: roundedPlate, feature: "corners" }); }],
        ["making the faces of a mesh when the kernel cannot make a face", () => { stub("MakeFaceFromWireOnlyPlane"); return () => occt.shapes.face.fromBaseMesh({ mesh: [[[0, 0, 0], [1, 0, 0], [0, 1, 0]]] }); }],
    ];

    it.each(reached)("should free every C++ exception it catches when %s", (_name, arrange) => {
        // Arrange
        const act = arrange();

        // Act
        const { bytesPerCall, freedPerCall, rawThrows } = measured(act);

        // Assert
        expect(rawThrows).toBe(0);
        expect(freedPerCall).toBeGreaterThanOrEqual(1);
        expect(bytesPerCall).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it.each(stubbed)("should free the C++ exception it catches when %s", (_name, arrange) => {
        // Arrange
        const act = arrange();

        // Act
        const { bytesPerCall, freedPerCall, rawThrows } = measured(act);

        // Assert
        expect(rawThrows).toBe(0);
        expect(freedPerCall).toBeGreaterThanOrEqual(1);
        expect(bytesPerCall).toBeLessThan(MOST_BYTES_PER_CALL);
    });
});
