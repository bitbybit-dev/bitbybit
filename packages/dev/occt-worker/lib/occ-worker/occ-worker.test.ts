import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { InputIssueReport } from "@bitbybit-dev/base";
import { setInputIssueSink } from "@bitbybit-dev/base";
import type { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "@bitbybit-dev/occt/lib/api/inputs";
import type { CacheHelper } from "./cache-helper";
import { initializationComplete, onMessageInput } from "./occ-worker";

type CallAction = <T, R>(functionName: string, inputs: T) => Promise<R>;

describe("OCCT wire unit tests", () => {
    let occt: BitbybitOcctModule;

    let cacheHelper: CacheHelper;
    beforeAll(async () => {
        occt = await initOpenCascade();
        cacheHelper = initializationComplete(occt, undefined, true);
    });

    beforeEach(() => {
        cacheHelper.cleanAllCache();
    });

    it("should report a property the real registry does not list for the operation, and still build the wire", async () => {
        // Arrange
        const reports: InputIssueReport[] = [];
        setInputIssueSink((report) => reports.push(report));

        // Act
        const wire = await callAction<{ radius: number; radious: number }, Inputs.OCCT.TopoDSWirePointer>("shapes.wire.createCircleWire", { radius: 1, radious: 2 });

        // Assert
        expect(reports).toEqual([{ kernel: "OCCT", path: "shapes.wire.createCircleWire", issue: { property: "radious", code: "unknown-property", message: "is not an input of this operation and is ignored" } }]);
        expect(wire.type).toBe("occ-shape");
        setInputIssueSink();
    });

    it("should create a wire", async () => {
        const cdto = new Inputs.OCCT.CircleDto(1, [0, 0, 0], [0, 1, 0]);
        const wire = await callAction<Inputs.OCCT.CircleDto, Inputs.OCCT.TopoDSWirePointer>("shapes.wire.createCircleWire", cdto);
        expect(wire.hash).toEqual(5651468716275304);
        expect(wire.type).toEqual("occ-shape");
    });

    it("should get length of a wire", async () => {
        const cdto = new Inputs.OCCT.CircleDto(1, [0, 0, 0], [0, 1, 0]);
        const wire = await callAction<Inputs.OCCT.CircleDto, Inputs.OCCT.TopoDSWirePointer>("shapes.wire.createCircleWire", cdto);
        expect(wire.hash).toEqual(5651468716275304);
        expect(wire.type).toEqual("occ-shape");
        const length = await callAction<Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>, number>("shapes.wire.getWireLength", { shape: wire });
        expect(length).toBeCloseTo(6.283185307179586);
        const length2 = await callAction<Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>, number>("shapes.wire.getWireLength", { shape: wire });
        expect(length2).toBeCloseTo(6.283185307179586);
    });

    it("should create advanced loft through straight sections", async () => {
        const loft = await createLoft(callAction);
        expect(loft.hash).toBeDefined();
        expect(loft.type).toBe("occ-shape");
    });

    it("should loft advanced and use cache", async () => {
        const loft1 = await createLoft(callAction);
        const loft2 = await createLoft(callAction);

        expect(loft1.hash).toBe(loft2.hash);
        expect(loft2.type).toBe("occ-shape");
    });

    it("should subdivide wire into points", async () => {
        const cdto1 = new Inputs.OCCT.CircleDto(1, [0, 0, 0], [0, 1, 0]);
        const wire1 = await callAction<Inputs.OCCT.CircleDto, Inputs.OCCT.TopoDSWirePointer>("shapes.wire.createCircleWire", cdto1);
        const divDto = new Inputs.OCCT.DivideDto(wire1, 10);
        const points = await callAction<Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSWirePointer>, Inputs.Base.Point3[]>("shapes.wire.divideWireByParamsToPoints", divDto);
        expect(points.length).toBe(11);
        expect(points).toEqual([
            [0, 0, 1],
            [0.5877852522924731, 0, 0.8090169943749475],
            [0.9510565162951535, 0, 0.30901699437494745],
            [0.9510565162951536, 0, -0.30901699437494734],
            [0.5877852522924732, 0, -0.8090169943749473],
            [1.2246467991473532e-16, 0, -1],
            [-0.587785252292473, 0, -0.8090169943749475],
            [-0.9510565162951535, 0, -0.30901699437494756],
            [-0.9510565162951536, 0, 0.30901699437494723],
            [-0.5877852522924734, 0, 0.8090169943749473],
            [-2.4492935982947064e-16, 0, 1]
        ]);
    });

    it("should subdivide wire into points", async () => {
        const cdto1 = new Inputs.OCCT.CircleDto(1, [0, 0, 0], [0, 1, 0]);
        const wire1 = await callAction<Inputs.OCCT.CircleDto, Inputs.OCCT.TopoDSWirePointer>("shapes.wire.createCircleWire", cdto1);
        const divDto = new Inputs.OCCT.DivideDto(wire1, 10);
        await callAction<Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSWirePointer>, Inputs.Base.Point3[]>("shapes.wire.divideWireByParamsToPoints", divDto);
        const points2 = await callAction<Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSWirePointer>, Inputs.Base.Point3[]>("shapes.wire.divideWireByParamsToPoints", divDto);
        expect(points2.length).toBe(11);
        expect(points2).toEqual([
            [0, 0, 1],
            [0.5877852522924731, 0, 0.8090169943749475],
            [0.9510565162951535, 0, 0.30901699437494745],
            [0.9510565162951536, 0, -0.30901699437494734],
            [0.5877852522924732, 0, -0.8090169943749473],
            [1.2246467991473532e-16, 0, -1],
            [-0.587785252292473, 0, -0.8090169943749475],
            [-0.9510565162951535, 0, -0.30901699437494756],
            [-0.9510565162951536, 0, 0.30901699437494723],
            [-0.5877852522924734, 0, 0.8090169943749473],
            [-2.4492935982947064e-16, 0, 1]
        ]);
    });

    it("should get lengths of edges", async () => {
        const boxDto = new Inputs.OCCT.BoxDto(1, 1, 1);
        const box = await callAction<Inputs.OCCT.BoxDto, Inputs.OCCT.TopoDSSolidPointer>("shapes.solid.createBox", boxDto);
        expect(box.hash).toBeDefined();
        expect(box.type).toBe("occ-shape");
        const edges = await callAction<Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>, Inputs.OCCT.TopoDSEdgePointer[]>("shapes.edge.getEdges", { shape: box });
        const lengths = await callAction<Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSShapePointer>, number[]>("shapes.edge.getEdgesLengths", { shapes: edges });
        expect(lengths.length).toBe(12);
        expect(lengths).toEqual([
            1, 1, 1, 1, 1,
            1, 1, 1, 1, 1,
            1, 1
        ]);
        const lengths2 = await callAction<Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSShapePointer>, number[]>("shapes.edge.getEdgesLengths", { shapes: edges });
        expect(lengths2.length).toBe(12);
        expect(lengths2).toEqual([
            1, 1, 1, 1, 1,
            1, 1, 1, 1, 1,
            1, 1
        ]);
    });

    it("should get edges of a box and subdivide them into points", async () => {
        const boxDto = new Inputs.OCCT.BoxDto(1, 1, 1);
        const box = await callAction<Inputs.OCCT.BoxDto, Inputs.OCCT.TopoDSSolidPointer>("shapes.solid.createBox", boxDto);
        expect(box.hash).toBeDefined();
        expect(box.type).toBe("occ-shape");
        const edges = await callAction<Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>, Inputs.OCCT.TopoDSEdgePointer[]>("shapes.edge.getEdges", { shape: box });
        expect(edges.length).toBe(12);
        const expectedEdgesResultBeforeCache = [...edges];
        const edgesAfterCache = await callAction<Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>, Inputs.OCCT.TopoDSEdgePointer[]>("shapes.edge.getEdges", { shape: box });
        expect(edgesAfterCache).toEqual(expectedEdgesResultBeforeCache);

        const points = await Promise.all(
            edgesAfterCache.map((edge: Inputs.OCCT.TopoDSEdgePointer) => {
                const divDto = new Inputs.OCCT.DivideDto(edge, 4);
                return callAction<Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSWirePointer>, Inputs.Base.Point3[]>("shapes.edge.divideEdgeByParamsToPoints", divDto);
            })
        );
        expect(points).toEqual([
            [
                [-0.5, -0.5, -0.5],
                [-0.5, -0.5, -0.25],
                [-0.5, -0.5, 0],
                [-0.5, -0.5, 0.25],
                [-0.5, -0.5, 0.5]
            ],
            [
                [-0.5, -0.5, 0.5],
                [-0.5, -0.25, 0.5],
                [-0.5, 0, 0.5],
                [-0.5, 0.25, 0.5],
                [-0.5, 0.5, 0.5]
            ],
            [
                [-0.5, 0.5, 0.5],
                [-0.5, 0.5, 0.25],
                [-0.5, 0.5, 0],
                [-0.5, 0.5, -0.25],
                [-0.5, 0.5, -0.5]
            ],
            [
                [-0.5, 0.5, -0.5],
                [-0.5, 0.25, -0.5],
                [-0.5, 0, -0.5],
                [-0.5, -0.25, -0.5],
                [-0.5, -0.5, -0.5]
            ],
            [
                [0.5, -0.5, 0.5],
                [0.5, -0.5, 0.25],
                [0.5, -0.5, 0],
                [0.5, -0.5, -0.25],
                [0.5, -0.5, -0.5]
            ],
            [
                [0.5, 0.5, 0.5],
                [0.5, 0.25, 0.5],
                [0.5, 0, 0.5],
                [0.5, -0.25, 0.5],
                [0.5, -0.5, 0.5]
            ],
            [
                [0.5, 0.5, -0.5],
                [0.5, 0.5, -0.25],
                [0.5, 0.5, 0],
                [0.5, 0.5, 0.25],
                [0.5, 0.5, 0.5]
            ],
            [
                [0.5, -0.5, -0.5],
                [0.5, -0.25, -0.5],
                [0.5, 0, -0.5],
                [0.5, 0.25, -0.5],
                [0.5, 0.5, -0.5]
            ],
            [
                [-0.5, -0.5, -0.5],
                [-0.25, -0.5, -0.5],
                [0, -0.5, -0.5],
                [0.25, -0.5, -0.5],
                [0.5, -0.5, -0.5]
            ],
            [
                [0.5, -0.5, 0.5],
                [0.25, -0.5, 0.5],
                [0, -0.5, 0.5],
                [-0.25, -0.5, 0.5],
                [-0.5, -0.5, 0.5]
            ],
            [
                [0.5, 0.5, -0.5],
                [0.25, 0.5, -0.5],
                [0, 0.5, -0.5],
                [-0.25, 0.5, -0.5],
                [-0.5, 0.5, -0.5]
            ],
            [
                [-0.5, 0.5, 0.5],
                [-0.25, 0.5, 0.5],
                [0, 0.5, 0.5],
                [0.25, 0.5, 0.5],
                [0.5, 0.5, 0.5]
            ]
        ]);
    });

    const callAction: CallAction = <T, R>(functionName: string, inputs: T): Promise<R> => {
        return new Promise<R>((resolve, reject) => {
            try {
                onMessageInput({
                    action: {
                        functionName,
                        inputs: { ...inputs } as Record<string, unknown>
                    },
                    uid: "sdadwa",
                }, (message) => {
                    const data = message as { result: R; error?: string };
                    if (message !== "busy") {
                        resolve(data.result);
                    }
                    if (data.error) {
                        console.error("ERROR HAPPENED: ", data.error);
                        reject(new Error(data.error));
                    }
                });
            } catch (err) {
                console.error("ERROR HAPPENED: ", err);
                reject(err instanceof Error ? err : new Error(String(err)));
            }
        });
    };

});

async function createLoft(callAction: CallAction) {
    const cdto1 = new Inputs.OCCT.CircleDto(1, [0, 0, 0], [0, 1, 0]);
    const wire1 = await callAction<Inputs.OCCT.CircleDto, Inputs.OCCT.TopoDSWirePointer>("shapes.wire.createCircleWire", cdto1);

    const cdto2 = new Inputs.OCCT.CircleDto(2, [0, 1, 0], [0, 1, 0]);
    const wire2 = await callAction<Inputs.OCCT.CircleDto, Inputs.OCCT.TopoDSWirePointer>("shapes.wire.createCircleWire", cdto2);

    const cdto3 = new Inputs.OCCT.CircleDto(1.5, [0, 2, 0], [0, 1, 0]);
    const wire3 = await callAction<Inputs.OCCT.CircleDto, Inputs.OCCT.TopoDSWirePointer>("shapes.wire.createCircleWire", cdto3);

    const ldto = new Inputs.OCCT.LoftAdvancedDto([wire1, wire2, wire3]);
    ldto.closed = true;
    ldto.straight = true;
    const loft = await callAction<Inputs.OCCT.LoftAdvancedDto<Inputs.OCCT.TopoDSShapePointer>, Inputs.OCCT.TopoDSShapePointer>("operations.loftAdvanced", ldto);
    return loft;
}
