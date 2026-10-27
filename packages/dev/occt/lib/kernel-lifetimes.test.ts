import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import type { BitbybitOcctModule, TopoDS_Edge, TopoDS_Shape } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "./occ-helper";
import { OCCTService } from "./occ-service";
import { handlesIn, ledgerRun, namesOf } from "./__test__/kernel-ledger";
import type { KernelHandle } from "../../__test__/embind-ledger-types";
import { lifetimeCases } from "./__test__/lifetime-cases";
import { callWatcher } from "./__test__/call-watch";
import { changedSince, contentsOf } from "./__test__/input-contents";
import { patternOf, rawKernelExceptionsAlong, refusalOf, trapsAlong } from "./__test__/refusals";
import * as Inputs from "./api/inputs";
import type * as Models from "./api/models";
import type { Act, Arranged, CaseNotes, RefusalKind } from "./__test__/lifetime-cases-types";

const KERNEL_FUNCTIONS_STUBBED = ["BRepFill_Filling_AddEdge", "BuildShapesFromSegments", "BRepAdaptor_CompCurve_DN", "MakeArcThrough3Points"];
const REFUSED_FOR_THE_CALLER: readonly RefusalKind[] = ["input", "operation", "kernel"];
const REFUSED_BY_THE_STUBBED_STEP: readonly RefusalKind[] = ["stubbed", "kernel", "operation"];

const stubbedFailures = new WeakSet<object>();

const stubbedFailure = (): never => {
    const failure = new Error("the stubbed kernel step failed");
    stubbedFailures.add(failure);
    throw failure;
};

const isStubbedFailure = (thrown: unknown): boolean => typeof thrown === "object" && thrown !== null && stubbedFailures.has(thrown);

const failingOnCall = <A extends unknown[], R>(failing: number, original: (...args: A) => R): ((...args: A) => R) => {
    let calls = 0;
    return (...args: A): R => {
        calls += 1;
        return calls === failing ? stubbedFailure() : original(...args);
    };
};

const failingEverySecondCall = (original: (...args: unknown[]) => unknown): ((this: unknown, ...args: unknown[]) => unknown) => {
    let calls = 0;
    return function (this: unknown, ...args: unknown[]): unknown {
        calls += 1;
        return calls % 2 === 0 ? stubbedFailure() : Reflect.apply(original, this, args);
    };
};

describe("OCCT kernel object lifetimes", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;
    let och: OccHelper;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        och = new OccHelper(kernel);
        occt = new OCCTService(kernel, och);
    }, 120_000);

    const box = (size = 10): TopoDS_Shape => occt.shapes.solid.createBox({ width: size, length: size, height: size, center: [0, 0, 0] });
    const ball = (): TopoDS_Shape => occt.shapes.solid.createSphere({ radius: 6, center: [5, 5, 5] });
    const watcher = callWatcher();
    const watchedOcct = (): OCCTService => watcher.watched(occt);
    const watchedOch = (): OccHelper => watcher.watched(och);
    const cases = lifetimeCases(watchedOcct, watchedOch);

    const deletedAmong = (inputs: readonly KernelHandle[]): KernelHandle[] => inputs.filter(input => input.isDeleted());

    const leavesNothingButItsAnswer = (arrange: () => Act, notes: CaseNotes = {}): void => {
        // Arrange
        const arranged = ledgerRun(kernel, arrange);
        const contents = contentsOf(kernel, arranged.leaked);

        // Act
        const watched = watcher.callsDuring(() => ledgerRun(kernel, () => arranged.result?.()));

        // Assert
        const changed = namesOf(changedSince(kernel, contents));
        expect(arranged.thrown).toBeUndefined();
        expect(watched.value.thrown).toBeUndefined();
        expect(namesOf(watched.value.leaked)).toEqual([]);
        expect(namesOf(deletedAmong(arranged.leaked))).toEqual([]);
        expect(changed.length > 0, `the kernel objects it was given and changed: ${changed.join(", ")}`).toBe(notes.changesItsInput !== undefined);
        expect(watched.calls.map(call => call.path)).toHaveLength(1);
        expect(watched.calls.map(call => call.after)).toEqual(watched.calls.map(call => call.before));
    };

    const leavesNothingWhenItFails = (arrange: () => Act, notes: CaseNotes = {}, accepted: readonly RefusalKind[] = REFUSED_FOR_THE_CALLER): void => {
        // Arrange
        const arranged = ledgerRun(kernel, arrange);
        const contents = contentsOf(kernel, arranged.leaked);

        // Act
        const watched = watcher.callsDuring(() => ledgerRun(kernel, () => arranged.result?.()));

        // Assert
        const refusal = refusalOf(watched.value.thrown, isStubbedFailure);
        const changed = namesOf(changedSince(kernel, contents));
        expect(arranged.thrown).toBeUndefined();
        expect(watched.value.thrown).toBeDefined();
        expect(trapsAlong(watched.value.thrown)).toEqual([]);
        expect(rawKernelExceptionsAlong(watched.value.thrown)).toEqual([]);
        expect(accepted, `refused by ${refusal.kind}: ${refusal.message}`).toContain(refusal.kind);
        expect(refusal).toMatchObject(patternOf(notes.refusedBy));
        expect(namesOf(watched.value.leaked)).toEqual([]);
        expect(namesOf(deletedAmong(arranged.leaked))).toEqual([]);
        expect(changed.length > 0, `the kernel objects it was given and changed: ${changed.join(", ")}`).toBe(notes.changesItsInput !== undefined);
        expect(watched.calls.map(call => call.path)).toHaveLength(1);
        expect(watched.calls.map(call => call.after)).toEqual(watched.calls.map(call => call.before));
    };

    describe("a call that succeeds keeps only what it hands back", () => {
        const leaking = cases.succeeding;

        const keeping = cases.succeedingAsToday;

        it.each(leaking)("should keep nothing but its answer, and leave what it was given as it was, after %s", (_name, arrange, notes) => leavesNothingButItsAnswer(arrange, notes));

        it.each(keeping)("should keep nothing but its answer, and leave what it was given as it was, after %s, as it does today", (_name, arrange, notes) => leavesNothingButItsAnswer(arrange, notes));
    });

    describe("a call the kernel refuses keeps nothing it made", () => {
        const leaking = cases.refused;

        const keeping = cases.refusedAsToday;

        it.each(leaking)("should keep nothing it made, leave what it was given as it was and refuse the caller for the reason it states, when %s fails", (_name, arrange, notes) => leavesNothingWhenItFails(arrange, notes));

        it.each(keeping)("should keep nothing it made, leave what it was given as it was and refuse the caller for the reason it states, when %s fails, as it does today", (_name, arrange, notes) => leavesNothingWhenItFails(arrange, notes));
    });

    describe("a call whose step fails partway keeps nothing it made", () => {
        let originals: Map<string, unknown>;

        beforeEach(() => {
            originals = new Map(KERNEL_FUNCTIONS_STUBBED.map(name => [name, Reflect.get(kernel, name)]));
        });

        afterEach(() => {
            vi.restoreAllMocks();
            originals.forEach((original, name) => Reflect.set(kernel, name, original));
        });

        const closedCircle = (): TopoDS_Shape => occt.shapes.wire.createCircleWire({ radius: 10, center: [0, 0, 0], direction: [0, 1, 0] });
        const flatCircle = (): TopoDS_Edge => occt.shapes.edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 0, 1] });
        const clockwiseSquare: Models.OCCT.SketchCommand[] = [{ type: "vLine", length: 10 }, { type: "hLine", length: 10 }, { type: "vLine", length: -10 }, { type: "close" }];
        const edgeBetweenEqualPoints = (): never => {
            const point = new kernel.gp_Pnt(1, 2, 3);
            const maker = new kernel.BRepBuilderAPI_MakeEdge(point, point);
            try {
                maker.Edge();
            } finally {
                maker.delete();
                point.delete();
            }
            throw new Error("the kernel made an edge between two equal points");
        };

        const stubbed: Arranged[] = [
            ["stroking a closed wire into a ring whose inner face cannot be made", () => { const shape = closedCircle(); const original = occt.shapes.face.createFaceFromWire.bind(occt.shapes.face); vi.spyOn(occt.shapes.face, "createFaceFromWire").mockImplementation(failingOnCall(2, original)); return () => watchedOcct().sketch.stroke({ shape, width: 2 }); }],
            ["stroking a closed wire into a ring whose cut cannot be read for faces", () => { const shape = closedCircle(); vi.spyOn(occt.shapes.face, "getFaces").mockImplementation(stubbedFailure); return () => watchedOcct().sketch.stroke({ shape, width: 2 }); }],
            ["stroking a closed wire into a ring whose face cannot be turned to the frame", () => { const shape = closedCircle(); vi.spyOn(occt.shapes.face, "normalOnUV").mockImplementation(stubbedFailure); return () => watchedOcct().sketch.stroke({ shape, width: 2 }); }],
            ["stroking an open wire into a band whose face cannot be turned to the frame", () => { const shape = occt.shapes.wire.createLineWire({ start: [0, 0, 0], end: [10, 0, 0] }); vi.spyOn(occt.shapes.face, "normalOnUV").mockImplementation(stubbedFailure); return () => watchedOcct().sketch.stroke({ shape, width: 2 }); }],
            ["stroking an edge when the plane of the frame cannot be made", () => { const shape = occt.shapes.edge.line({ start: [0, 0, 0], end: [10, 0, 0] }); vi.spyOn(och.facesService, "createFaceFromWire").mockImplementation(stubbedFailure); return () => watchedOcct().sketch.stroke({ shape, width: 2 }); }],
            ["drawing a face of a clockwise outline when the face cannot be made", () => { vi.spyOn(och.facesService, "createFaceFromWire").mockImplementation(stubbedFailure); return () => watchedOcct().sketch.pen({ commands: clockwiseSquare, makeFace: true }); }],
            ["filling a wire with a face that is not planar when an edge cannot be added", () => { const shape = occt.shapes.wire.createRectangleWire({ width: 8, length: 4, center: [0, 0, 0], direction: [0, 1, 0] }); Reflect.set(kernel, "BRepFill_Filling_AddEdge", stubbedFailure); return () => watchedOcct().shapes.face.createFaceFromWire({ shape, planar: false }); }],
            ["reading the flat circle of an edge when its axis cannot be made", () => { const shape = flatCircle(); vi.spyOn(och.entitiesService, "gpAx2d").mockImplementation(stubbedFailure); return () => watchedOch().edgesService.getGpCircle2dFromEdge({ shape }); }],
            ["drawing the circles tangent to a circle through a point when the second cannot be turned back", () => { const circle = occt.shapes.edge.createCircleEdge({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] }); const original = och.transformsService.align.bind(och.transformsService); vi.spyOn(och.transformsService, "align").mockImplementation(failingOnCall(4, original)); return () => watchedOcct().shapes.edge.constraintTanCirclesOnCircleAndPnt({ circle, point: [3, 0, -3], radius: 4, tolerance: 1e-7 }); }],
            ["drawing the circles tangent to two circles when the second cannot be turned back", () => { const circle1 = flatCircle(); const circle2 = occt.shapes.edge.createCircleEdge({ radius: 1, center: [5, 0, 0], direction: [0, 0, 1] }); const original = och.transformsService.align.bind(och.transformsService); vi.spyOn(och.transformsService, "align").mockImplementation(failingOnCall(4, original)); return () => watchedOcct().shapes.edge.constraintTanCirclesOnTwoCircles({ circle1, circle2, radius: 3, tolerance: 1e-7 }); }],
            ["joining two points to a circle by tangent lines when the third cannot be turned back", () => { const circle = flatCircle(); const original = och.transformsService.align.bind(och.transformsService); vi.spyOn(och.transformsService, "align").mockImplementation(failingOnCall(6, original)); return () => watchedOcct().shapes.edge.constraintTanLinesFromTwoPtsToCircle({ circle, point1: [3, 0, 0], point2: [0, 2, 0], positionResult: Inputs.OCCT.positionResultEnum.all, circleRemainder: Inputs.OCCT.circleInclusionEnum.none, tolerance: 1e-7 }); }],
            ["reading a box from STEP turned to Y up when it cannot be rotated", () => { const filetext = occt.io.saveShapeSTEP({ shape: box(), fileName: "box.step", adjustYtoZ: false }); vi.spyOn(och.transformsService, "rotate").mockImplementation(stubbedFailure); return () => watchedOcct().io.loadSTEPorIGES({ filetext, fileName: "box.step", adjustZtoY: true }); }],
            ["stroking an open wire into a band whose round end cap cannot be drawn", () => { const shape = occt.shapes.wire.createLineWire({ start: [0, 0, 0], end: [10, 0, 0] }); vi.spyOn(occt.shapes.edge, "arcThroughThreePoints").mockImplementation(stubbedFailure); return () => watchedOcct().sketch.stroke({ shape, width: 2, cap: Inputs.OCCT.strokeCapEnum.round }); }],
            ["stroking an open wire into a band whose round start cap cannot be drawn", () => { const shape = occt.shapes.wire.createLineWire({ start: [0, 0, 0], end: [10, 0, 0] }); const original = occt.shapes.edge.arcThroughThreePoints.bind(occt.shapes.edge); vi.spyOn(occt.shapes.edge, "arcThroughThreePoints").mockImplementation(failingOnCall(2, original)); return () => watchedOcct().sketch.stroke({ shape, width: 2, cap: Inputs.OCCT.strokeCapEnum.round }); }],
            ["stroking an open wire into a band when the start of an offset edge cannot be read", () => { const shape = occt.shapes.wire.createLineWire({ start: [0, 0, 0], end: [10, 0, 0] }); vi.spyOn(occt.shapes.edge, "startPointOnEdge").mockImplementation(stubbedFailure); return () => watchedOcct().sketch.stroke({ shape, width: 2 }); }],
            ["moving two boxes when the second cannot be moved", () => { const shapes = [box(), box()]; const original = och.transformsService.translate.bind(och.transformsService); vi.spyOn(och.transformsService, "translate").mockImplementation(failingOnCall(2, original)); return () => watchedOcct().transforms.translateShapes({ shapes, translations: [[1, 0, 0], [2, 0, 0]] }); }],
            ["scaling two boxes when the second cannot be scaled", () => { const shapes = [box(), box()]; const original = och.transformsService.scaleFromCenter.bind(och.transformsService); vi.spyOn(och.transformsService, "scaleFromCenter").mockImplementation(failingOnCall(2, original)); return () => watchedOcct().transforms.scaleShapes({ shapes, factors: [2, 3] }); }],
            ["scaling two boxes unevenly when the second cannot be scaled", () => { const shapes = [box(), box()]; const original = och.transformsService.scale3d.bind(och.transformsService); vi.spyOn(och.transformsService, "scale3d").mockImplementation(failingOnCall(2, original)); return () => watchedOcct().transforms.scale3dShapes({ shapes, scales: [[1, 2, 3], [3, 2, 1]], centers: [[0, 0, 0], [0, 0, 0]] }); }],
            ["drawing an arc through three points when the kernel cannot trim its circle", () => { Reflect.set(kernel, "MakeArcThrough3Points", edgeBetweenEqualPoints); return () => watchedOcct().shapes.edge.arcThroughThreePoints({ start: [0, 0, 1], middle: [1, 0, 0], end: [0, 0, -1] }); }],
            ["offsetting an open wire when the kernel cannot perform the offset", () => { const shape = occt.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0], [10, 0, 5]] }); vi.spyOn(kernel.BRepOffsetAPI_MakeOffset.prototype, "Perform").mockImplementation(edgeBetweenEqualPoints); return () => watchedOcct().shapes.wire.offsetOpen({ shape, distance: 1, joinType: Inputs.OCCT.joinTypeEnum.arc }); }, { refusedBy: { kind: "operation", code: "occt.offset.failed" } }],
            ["offsetting an open wire on a face when the kernel cannot perform the offset", () => { const shape = occt.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0], [10, 0, 5]] }); const face = occt.shapes.face.createRectangleFace({ width: 40, length: 40, center: [0, 0, 0], direction: [0, 1, 0] }); vi.spyOn(kernel.BRepOffsetAPI_MakeOffset.prototype, "Perform").mockImplementation(edgeBetweenEqualPoints); return () => watchedOcct().shapes.wire.offsetOpen({ shape, face, distance: 1, joinType: Inputs.OCCT.joinTypeEnum.arc }); }, { refusedBy: { kind: "operation", code: "occt.offset.failed" } }],
            ["reading the tangent at a length along a wire when the derivative cannot be read", () => { const shape = occt.shapes.wire.createLineWire({ start: [0, 0, 0], end: [10, 0, 0] }); Reflect.set(kernel, "BRepAdaptor_CompCurve_DN", stubbedFailure); return () => watchedOcct().shapes.wire.tangentOnWireAtLength({ shape, length: 4 }); }],
            ["subdividing a face into rounded rectangles when the length of a line placed on it cannot be read", () => { const shape = occt.shapes.face.createRectangleFace({ width: 8, length: 4, center: [0, 0, 0], direction: [0, 1, 0] }); vi.spyOn(och.wiresService, "getWireLength").mockImplementation(stubbedFailure); return () => watchedOcct().shapes.face.subdivideToRectangleWires({ ...new Inputs.OCCT.FaceSubdivideToRectangleWiresDto(), shape, filletPattern: [0.5] }); }],
        ];

        it.each(stubbed)("should keep nothing it made, leave what it was given as it was and surface the failed step, when %s", (_name, arrange, notes) => leavesNothingWhenItFails(arrange, notes, REFUSED_BY_THE_STUBBED_STEP));

        it.each(["ReadFile", "TransferRoots"] as const)("should read the C++ exception and keep nothing it made when the STEP reader's %s throws on STEP text", method => {
            // Arrange
            const filetext = occt.io.saveShapeSTEP({ shape: box(), fileName: "box.step", adjustYtoZ: false });
            vi.spyOn(kernel.STEPControl_Reader.prototype, method).mockImplementation(edgeBetweenEqualPoints);

            // Act
            const run = ledgerRun(kernel, () => occt.io.loadSTEPorIGES({ filetext, fileName: "box.step", adjustZtoY: false }));

            // Assert
            expect(run.thrown).toEqual(new Error("StdFail_NotDone: BRep_API: command not done"));
            expect(namesOf(run.leaked)).toEqual([]);
        });

        it("should let a failure to make the axis of the flat circle of an edge surface as itself", () => {
            // Arrange
            const shape = flatCircle();
            vi.spyOn(och.entitiesService, "gpAx2d").mockImplementation(stubbedFailure);

            // Act
            const run = ledgerRun(kernel, () => och.edgesService.getGpCircle2dFromEdge({ shape }));

            // Assert
            expect(run.thrown).toEqual(new Error("the stubbed kernel step failed"));
            expect(namesOf(run.leaked)).toEqual([]);
        });

        it("should free the null compound the path kernel hands back for a path it could not build", () => {
            // Arrange
            const subpaths: Inputs.OCCT.PathSubpath[] = [{ start: [0, 0], segments: [{ type: "line", to: [10, 0] }], closed: false }];
            const nullCompound = (): TopoDS_Shape => new kernel.TopoDS_Compound();
            Reflect.set(kernel, "BuildShapesFromSegments", nullCompound);

            // Act
            const run = ledgerRun(kernel, () => occt.path.shapeFromPath({ subpaths, makeFaces: false, joinSegments: true, tolerance: 1e-7, scale: 1, flipY: false, origin: [0, 0, 0] }));

            // Assert
            expect(run.thrown).toBeUndefined();
            expect(run.result).toBeUndefined();
            expect(namesOf(run.leaked)).toEqual([]);
        });

        it("should free the first corner point of every edge whose last one cannot be read", () => {
            // Arrange
            const shape = box();
            const curveValue: unknown = Reflect.get(kernel.Handle_Geom_Curve.prototype, "Value");
            vi.spyOn(kernel.Handle_Geom_Curve.prototype, "Value").mockImplementation(failingEverySecondCall(curveValue as (...args: unknown[]) => unknown));
            vi.spyOn(console, "log").mockImplementation(() => undefined);

            // Act
            const run = ledgerRun(kernel, () => och.edgesService.getCornerPointsOfEdgesForShape({ shape }));

            // Assert
            expect(run.thrown).toBeUndefined();
            expect(run.result).toEqual([]);
            expect(namesOf(run.leaked)).toEqual([]);
            expect(shape.isDeleted()).toBe(false);
        });
    });

    describe("a part redrawn again and again", () => {
        const drilledPlate = (corner: number): TopoDS_Shape => {
            const sketch = occt.shapes.face.createRectangleFace({ width: 40, length: 20, center: [0, 0, 0], direction: [0, 1, 0] });
            const plate = occt.operations.extrude({ shape: sketch, direction: [0, 4, 0] });
            const holes = [-12, 12].map(x => occt.shapes.solid.createCylinder({ radius: 2, height: 10, center: [x, -2, 0], direction: [0, 1, 0] }));
            const drilled = occt.booleans.difference({ shape: plate, shapes: holes, keepEdges: false });
            const rounded = occt.fillets.filletEdges({ shape: drilled, radius: corner, indexes: [0, 2] });
            [sketch, plate, ...holes, drilled].forEach(shape => shape.delete());
            return rounded;
        };
        const drawn = (shape: TopoDS_Shape): void => {
            och.meshingService.shapeToMeshBuffers({ shape, precision: 0.1, computeMetadata: true });
            shape.delete();
        };

        it("should hold no more kernel objects after ten redraws of a drilled and rounded plate than before them", () => {
            // Arrange
            const corners = [1, 1.5, 2, 2.5, 3, 1, 1.5, 2, 2.5, 3];

            // Act
            const run = ledgerRun(kernel, () => corners.forEach(corner => drawn(drilledPlate(corner))));

            // Assert
            expect(run.thrown).toBeUndefined();
            expect(run.made).toBeGreaterThan(100);
            expect(namesOf(run.leaked)).toEqual([]);
        });

        it("should hold no more kernel objects after ten redraws of a plate cut from a rounded outline than before them", () => {
            // Arrange
            const radii = [0.5, 1, 1.5, 2, 2.5, 0.5, 1, 1.5, 2, 2.5];
            const outlinePlate = (radius: number): TopoDS_Shape => {
                const rectangle = occt.shapes.wire.createRectangleWire({ width: 40, length: 20, center: [0, 0, 0], direction: [0, 1, 0] });
                const outline = occt.fillets.fillet2d({ shape: rectangle, radius });
                const face = occt.shapes.face.createFaceFromWire({ shape: outline, planar: true });
                const plate = occt.operations.extrude({ shape: face, direction: [0, 4, 0] });
                [rectangle, outline, face].forEach(shape => shape.delete());
                return plate;
            };

            // Act
            const run = ledgerRun(kernel, () => radii.forEach(radius => drawn(outlinePlate(radius))));

            // Assert
            expect(run.thrown).toBeUndefined();
            expect(namesOf(run.leaked)).toEqual([]);
        });

        it("should hand back every shape it made in a list it was asked to keep, and nothing besides", () => {
            // Arrange
            const shapes = [box(), ball()];

            // Act
            const run = ledgerRun(kernel, () => occt.booleans.intersectionWithHistory({ shapes, keepEdges: false }));

            // Assert
            expect([...handlesIn(run.result)].map(handle => handle.isDeleted())).toEqual([false]);
            expect(namesOf(run.leaked)).toEqual([]);
            expect(shapes.map(shape => shape.isDeleted())).toEqual([false, false]);
        });
    });
});
