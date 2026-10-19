import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "./occ-helper";
import { OCCTService } from "./occ-service";
import type * as Inputs from "./api/inputs";

const WARM_UP_CALLS = 5;
const CALLS = 100;
const MOST_BYTES_PER_CALL = 16;

describe("OCCT kernel heap across repeated calls", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        kernel.SetMeshRetention(0);
        occt = new OCCTService(kernel, new OccHelper(kernel));
    }, 120_000);

    const bytesPerCall = (call: () => TopoDS_Shape | { shape: TopoDS_Shape } | TopoDS_Shape[]): number => {
        const once = (): void => {
            const made = call();
            (Array.isArray(made) ? made : ["shape" in made ? made.shape : made]).forEach(shape => shape.delete());
        };
        for (let warm = 0; warm < WARM_UP_CALLS; warm++) {
            once();
        }
        const before = kernel.HeapBytesInUse();
        for (let made = 0; made < CALLS; made++) {
            once();
        }
        return (kernel.HeapBytesInUse() - before) / CALLS;
    };

    const refusedRepeatedly = (call: () => unknown): { refusals: number; bytesPerCall: number } => {
        let refusals = 0;
        const once = (): void => {
            try {
                call();
            } catch {
                refusals += 1;
            }
        };
        for (let warm = 0; warm < WARM_UP_CALLS; warm++) {
            once();
        }
        const before = kernel.HeapBytesInUse();
        for (let made = 0; made < CALLS; made++) {
            once();
        }
        return { refusals, bytesPerCall: (kernel.HeapBytesInUse() - before) / CALLS };
    };

    const boxOnTheGround = (): TopoDS_Shape => occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [0, 5, 0] });
    const onTheGround = (): Inputs.Base.Frame => ({ origin: [0, 0, 0], normal: [0, 1, 0], direction: [1, 0, 0] });

    const circleWires = (): TopoDS_Shape[] => [
        occt.shapes.wire.createCircleWire({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] }),
        occt.shapes.wire.createCircleWire({ radius: 1, center: [0, 5, 0], direction: [0, 1, 0] }),
    ];

    it("should hold no more memory after lofting the same circle wires a hundred times, each solid deleted, than before", () => {
        // Arrange
        const shapes = circleWires();

        // Act
        const grown = bytesPerCall(() => occt.operations.loft({ shapes, makeSolid: true }));

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should hold no more memory after lofting the same circle edges a hundred times with history than before", () => {
        // Arrange
        const shapes = [
            occt.shapes.edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] }),
            occt.shapes.edge.createCircleEdge({ radius: 1, center: [0, 5, 0], direction: [0, 1, 0] }),
        ];

        // Act
        const grown = bytesPerCall(() => occt.operations.loftWithHistory({ shapes, makeSolid: true }));

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should hold no more memory after turning the same square face three quarters around an axis a hundred times than before", () => {
        // Arrange
        const shape = occt.shapes.face.createSquareFace({ size: 2, center: [5, 0, 0], direction: [0, 0, 1] });

        // Act
        const grown = bytesPerCall(() => occt.operations.revolve({ shape, angle: 270, direction: [0, 1, 0], copy: false }));

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should hold no more memory after turning the same square face a full turn with history a hundred times than before", () => {
        // Arrange
        const shape = occt.shapes.face.createSquareFace({ size: 2, center: [5, 0, 0], direction: [0, 0, 1] });

        // Act
        const grown = bytesPerCall(() => occt.operations.revolveWithHistory({ shape, angle: 360, direction: [0, 1, 0], copy: false }));

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should hold no more memory after extruding the same drawn face a hundred times than before", () => {
        // Arrange
        const shape = occt.sketch.pen({ commands: [{ type: "hLine", length: 40 }, { type: "vLine", length: 20 }, { type: "hLine", length: -40 }, { type: "close" }], makeFace: true });

        // Act
        const grown = bytesPerCall(() => occt.operations.extrude({ shape, direction: [0, 0, 8] }));

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should hold no more memory after extruding the same drawn face a hundred times with history than before", () => {
        // Arrange
        const shape = occt.sketch.pen({ commands: [{ type: "hLine", length: 40 }, { type: "vLine", length: 20 }, { type: "hLine", length: -40 }, { type: "close" }], makeFace: true });

        // Act
        const grown = bytesPerCall(() => occt.operations.extrudeWithHistory({ shape, direction: [0, 0, 8] }));

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should hold no more memory after an advanced loft of the same circle wire closed into a cone at a start point a hundred times than before", () => {
        // Arrange
        const shapes = [occt.shapes.wire.createCircleWire({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] })];

        // Act
        const grown = bytesPerCall(() => occt.operations.loftAdvanced({ shapes, startVertex: [0, -5, 0], makeSolid: true }));

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should hold no more memory after an advanced loft of the same two square wires a hundred times, which rules the skin between them, than before", () => {
        // Arrange
        const shapes = [
            occt.shapes.wire.createSquareWire({ size: 2, center: [0, 0, 0], direction: [0, 1, 0] }),
            occt.shapes.wire.createSquareWire({ size: 1, center: [0, 5, 0], direction: [0, 1, 0] }),
        ];

        // Act
        const grown = bytesPerCall(() => occt.operations.loftAdvanced({ shapes, makeSolid: true }));

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should hold no more memory after a straight advanced loft of the same three circle wires a hundred times than before", () => {
        // Arrange
        const shapes = [...circleWires(), occt.shapes.wire.createCircleWire({ radius: 1.5, center: [0, 9, 0], direction: [0, 1, 0] })];

        // Act
        const grown = bytesPerCall(() => occt.operations.loftAdvanced({ shapes, makeSolid: true, straight: true }));

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should hold no more memory after a closed straight advanced loft of the same three rings a hundred times than before", () => {
        // Arrange
        const shapes = [0, 1, 2].map(at => occt.shapes.wire.createCircleWire({ radius: 1, center: [5 * Math.cos(at * 2.1), 0, 5 * Math.sin(at * 2.1)], direction: [-Math.sin(at * 2.1), 0, Math.cos(at * 2.1)] }));

        // Act
        const grown = bytesPerCall(() => occt.operations.loftAdvanced({ shapes, makeSolid: true, closed: true, straight: true }));

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it.each([
        ["square wire", (): TopoDS_Shape => occt.shapes.wire.createSquareWire({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] })],
        ["square face", (): TopoDS_Shape => occt.shapes.face.createSquareFace({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] })],
    ] as [string, () => TopoDS_Shape][])("should hold no more memory after sweeping the same closed profile along the same %s with an evolved sweep a hundred times than before", (_spine, makeSpine) => {
        // Arrange
        const spine = makeSpine();
        const profile = occt.shapes.wire.createPolygonWire({ points: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]] });

        // Act
        const grown = bytesPerCall(() => occt.operations.sweepEvolved({ spine, profile, makeSolid: true }));

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it.each([
        ["extruding a face and a box together", (): (() => unknown) => {
            const shapes = [occt.shapes.face.createSquareFace({ size: 2, center: [0, 0, 0], direction: [0, 1, 0] }), boxOnTheGround()];
            return () => occt.operations.extrudeShapes({ shapes, direction: [0, 1, 0] });
        }],
        ["piping a polyline and a circle tighter than the radius together", (): (() => unknown) => {
            const shapes = [occt.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0]] }), occt.shapes.wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] })];
            return () => occt.operations.pipeWiresCylindrical({ shapes, radius: 2 });
        }],
        ["stretching a box and an unbounded plane by one matrix", (): (() => unknown) => {
            const box = boxOnTheGround();
            const shapes = [box, kernel.MakeFaceFromFaceSurface(occt.shapes.face.getFace({ shape: box, index: 0 }), 0)];
            return () => occt.transforms.transformShapesByMatrix({ shapes, transformation: [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1] });
        }],
        ["splitting a shape that is missing", (): (() => unknown) => {
            const shapes = [occt.shapes.face.createSquareFace({ size: 20, center: [0, 5, 0], direction: [0, 1, 0] })];
            const missing: unknown = undefined;
            return () => occt.operations.splitShapeWithShapes({ shape: missing as TopoDS_Shape, shapes, localFuzzyTolerance: 1e-7, nonDestructive: false });
        }],
        ["sweeping a profile along a spine out of plane with an evolved sweep", (): (() => unknown) => {
            const spine = occt.shapes.wire.createPolygonWire({ points: [[0, 0, 0], [10, 0, 0], [10, 5, 10], [0, 0, 10]] });
            const profile = occt.shapes.edge.line({ start: [0, 0, 0], end: [0, 0, 5] });
            return () => occt.operations.sweepEvolved({ spine, profile, makeSolid: true });
        }],
        ["piping a ring with more places than scales", (): (() => unknown) => {
            const spine = occt.shapes.edge.line({ start: [0, 0, 0], end: [0, 10, 0] });
            const profile = occt.shapes.wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
            return () => occt.operations.pipeWithScaling({ spine, profile, params: [0, 1], scales: [1], makeSolid: true });
        }],
        ["growing a skirt of length 0 from a square", (): (() => unknown) => {
            const shape = occt.shapes.wire.createSquareWire({ size: 15, center: [0, 0, 0], direction: [0, 1, 0] });
            return () => occt.draft.makeDraft({ shape, direction: [0, 1, 0], angle: 5, lengthMax: 0, internal: false });
        }],
        ["piping a ring along an empty wire", (): (() => unknown) => {
            const shapes = [occt.shapes.wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] })];
            const emptyWire = new kernel.TopoDS_Wire();
            return () => occt.operations.pipe({ shape: emptyWire, shapes });
        }],
        ["growing a skirt from a square up to a face at an angle that is not a number", (): (() => unknown) => {
            const shape = occt.shapes.wire.createSquareWire({ size: 15, center: [0, 0, 0], direction: [0, 1, 0] });
            const stopShape = occt.shapes.face.createSquareFace({ size: 60, center: [0, 8, 0], direction: [0, 1, 0] });
            return () => occt.draft.makeDraftToShape({ shape, direction: [0, 1, 0], angle: Number.NaN, stopShape, keepOut: false, internal: false });
        }],
        ["translating a box that was deleted", (): (() => unknown) => {
            const shape = boxOnTheGround();
            shape.delete();
            return () => occt.transforms.translate({ shape, translation: [1, 0, 0] });
        }],
        ["aligning an empty shape", (): (() => unknown) => {
            const shape = new kernel.TopoDS_Shape();
            return () => occt.transforms.align({ shape, fromOrigin: [0, 0, 0], fromDirection: [0, 1, 0], toOrigin: [1, 0, 0], toDirection: [1, 0, 0] });
        }],
        ["composing a transform that scales by 0", (): (() => unknown) => () => occt.transforms.composeTransform({ translation: [0, 0, 0], rotation: [0, 0, 0], scale: 0 })],
        ["drafting a box by a face of another box", (): (() => unknown) => {
            const shape = boxOnTheGround();
            const faces = [occt.shapes.face.getFace({ shape: occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [30, 5, 0] }), index: 0 })];
            return () => occt.draft.draftAngle({ shape, faces, direction: [0, 1, 0], angle: 5, neutralPlaneOrigin: [0, 0, 0], neutralPlaneDirection: [0, 1, 0], flag: true });
        }],
    ] as [string, () => () => unknown][])("should hold no more memory after %s is refused a hundred times than before", (_refused, arrange) => {
        // Arrange
        const call = arrange();

        // Act
        const { refusals, bytesPerCall } = refusedRepeatedly(call);

        // Assert
        expect(refusals).toBe(WARM_UP_CALLS + CALLS);
        expect(bytesPerCall).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should hold no more memory after an advanced loft with history of the same two circle wires a hundred times than before", () => {
        // Arrange
        const shapes = circleWires();

        // Act
        const grown = bytesPerCall(() => occt.operations.loftAdvancedWithHistory({ shapes, makeSolid: true }));

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should hold no more memory after slicing the same box a hundred times, its lowest plane lying on its bottom face, than before", () => {
        // Arrange
        const shape = boxOnTheGround();

        // Act
        const grown = bytesPerCall(() => occt.operations.slice({ shape, step: 1, direction: [0, 1, 0] }));

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should hold no more memory after slicing the same box in a pattern of steps a hundred times, its lowest plane lying on its bottom face, than before", () => {
        // Arrange
        const shape = boxOnTheGround();

        // Act
        const grown = bytesPerCall(() => occt.operations.sliceInStepPattern({ shape, steps: [1, 2], direction: [0, 1, 0] }));

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should hold no more memory after slicing the same cylinder along its axis a hundred times, its lowest plane lying on its base, than before", () => {
        // Arrange
        const shape = occt.shapes.solid.createCylinder({ radius: 2, height: 10, center: [0, 0, 0], direction: [0, 1, 0] });

        // Act
        const grown = bytesPerCall(() => occt.operations.slice({ shape, step: 1, direction: [0, 1, 0] }));

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should hold no more memory after slicing the same box into faces a hundred times with a frame on its bottom face than before", () => {
        // Arrange
        const shape = boxOnTheGround();

        // Act
        const grown = bytesPerCall(() => occt.operations.sliceByFrames({ shape, frames: [onTheGround()], makeFaces: true }));

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should hold no more memory after sectioning the same box into faces a hundred times with a frame on its bottom face than before", () => {
        // Arrange
        const shape = boxOnTheGround();

        // Act
        const grown = bytesPerCall(() => occt.operations.sectionByFrames({ shapes: [shape], frames: [onTheGround()], makeFaces: true }).flat());

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should hold no more memory after splitting the same box a hundred times with a frame on its bottom face than before", () => {
        // Arrange
        const shape = boxOnTheGround();

        // Act
        const grown = bytesPerCall(() => {
            const { front, back } = occt.operations.splitByFrame({ shape, frame: onTheGround() });
            return [front, back];
        });

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });

    it("should hold no more memory after cutting the same box a hundred times with a frame on its bottom face than before", () => {
        // Arrange
        const shape = boxOnTheGround();

        // Act
        const grown = bytesPerCall(() => occt.operations.cutByFrames({ shapes: [shape], frames: [onTheGround()] }));

        // Assert
        expect(grown).toBeLessThan(MOST_BYTES_PER_CALL);
    });
});
