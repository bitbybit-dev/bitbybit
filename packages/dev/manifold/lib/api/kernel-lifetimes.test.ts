import { afterEach, beforeAll, describe, expect, it, vi, type MockInstance } from "vitest";
import Module from "manifold-3d";
import type * as Manifold3D from "manifold-3d";
import type { Base } from "@bitbybit-dev/base";
import { InputError } from "@bitbybit-dev/base";
import { ManifoldService } from "./manifold-service";
import { getManifold } from "./__test__/kernel";
import { ledgerRun, namesOf } from "./__test__/kernel-ledger";
import { isHandle, openWindow, talliesDuring } from "../../../__test__/embind-ledger";
import type { KernelHandle } from "../../../__test__/embind-ledger-types";
import type { CrossSectionReadPrototype, CrossSectionVectorClass, KernelVectorClass, ManifoldPrototype, Act, Arranged } from "./__test__/test-types";


const isDeleted = (kernelObject: object): boolean => isHandle(kernelObject) && kernelObject.isDeleted();

const OPEN_TRIANGLE: Base.Point3[] = [[0, 0, 0], [1, 0, 0], [0, 1, 0]];
const OPEN_TRIANGLE_NUMBERS = [0, 0, 0, 1, 0, 0, 0, 1, 0];
const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const NOT_A_MATRIX: unknown = null;
const NOT_A_VECTOR: unknown = "up";
const NOT_A_NUMBER: unknown = BigInt(1);
const NOT_A_LIST: unknown = 0.5;
const TRIANGLE: Manifold3D.SimplePolygon[] = [[[0, 0], [1, 0], [0, 1]]];
const TWO_APART_SQUARES: Manifold3D.SimplePolygon[] = [[[0, 0], [1, 0], [1, 1], [0, 1]], [[5, 0], [6, 0], [6, 1], [5, 1]]];

describe("Manifold kernel object lifetimes", () => {
    let manifold: ManifoldService;

    beforeAll(async () => {
        manifold = await getManifold();
    });

    const square = (): Manifold3D.CrossSection => manifold.crossSection.shapes.square({ center: false, size: 2 });
    const cube = (): Manifold3D.Manifold => manifold.manifold.shapes.cube({ center: true, size: 4 });

    const leavesNothingButItsAnswer = (arrange: () => Act): void => {
        // Arrange
        const act = arrange();

        // Act
        const run = ledgerRun(act);

        // Assert
        expect(run.thrown).toBeUndefined();
        expect(namesOf(run.leaked)).toEqual([]);
    };

    describe("a call that succeeds keeps only what it hands back", () => {
        const leaking: Arranged[] = [
            ["extruding a square centred on its height", () => { const crossSection = square(); return () => manifold.crossSection.operations.extrude({ crossSection, height: 2, center: true }); }],
            ["revolving a square turned to match its profile", () => { const crossSection = manifold.crossSection.transforms.translate({ crossSection: square(), vector: [3, 0] }); return () => manifold.crossSection.operations.revolve({ crossSection, revolveDegrees: 360, matchProfile: true, circularSegments: 16 }); }],
            ["trimming a cube by a plane", () => { const shape = cube(); return () => manifold.manifold.booleans.trimByPlane({ manifold: shape, normal: [1, 0, 0], originOffset: 0 }); }],
        ];

        const keeping: Arranged[] = [
            ["extruding a square from its base", () => { const crossSection = square(); return () => manifold.crossSection.operations.extrude({ crossSection, height: 2, center: false }); }],
            ["revolving a square as the kernel stands it", () => { const crossSection = manifold.crossSection.transforms.translate({ crossSection: square(), vector: [3, 0] }); return () => manifold.crossSection.operations.revolve({ crossSection, revolveDegrees: 360, matchProfile: false, circularSegments: 16 }); }],
        ];

        it.each(leaking)("should keep nothing but its answer after %s", (_name, arrange) => leavesNothingButItsAnswer(arrange));

        it.each(keeping)("should keep nothing but its answer after %s, as it does today", (_name, arrange) => leavesNothingButItsAnswer(arrange));
    });

    describe("a call that throws partway keeps nothing it made", () => {
        const throwsAndKeepsNothing = (arrange: () => Act): void => {
            // Arrange
            const act = arrange();

            // Act
            const run = ledgerRun(act);

            // Assert
            expect(run.thrown).toBeInstanceOf(TypeError);
            expect(namesOf(run.leaked)).toEqual([]);
        };

        const throwing: Arranged[] = [
            ["transforming a cube by a list whose second entry is not a matrix", () => { const shape = cube(); return () => manifold.manifold.transforms.transforms({ manifold: shape, transforms: [IDENTITY, NOT_A_MATRIX as Base.TransformMatrix] }); }],
            ["splitting a cube by a normal that is not a vector", () => { const shape = cube(); return () => manifold.manifold.booleans.splitByPlaneOnOffsets({ manifold: shape, normal: NOT_A_VECTOR as Base.Vector3, originOffsets: [0.5] }); }],
            ["splitting a cube at offsets whose second is not a number", () => { const shape = cube(); return () => manifold.manifold.booleans.splitByPlaneOnOffsets({ manifold: shape, normal: [0, 0, 1], originOffsets: [0.5, NOT_A_NUMBER as number] }); }],
        ];

        it.each(throwing)("should keep nothing it made after %s", (_name, arrange) => throwsAndKeepsNothing(arrange));

        it("should refuse offsets that are not a list with an input error naming them and keep nothing it made", () => {
            // Arrange
            const shape = cube();
            const act = (): unknown => manifold.manifold.booleans.splitByPlaneOnOffsets({ manifold: shape, normal: [0, 0, 1], originOffsets: NOT_A_LIST as number[] });

            // Act
            const run = ledgerRun(act);

            // Assert
            expect(run.thrown).toBeInstanceOf(InputError);
            expect(run.thrown).toMatchObject({ property: "originOffsets" });
            expect(namesOf(run.leaked)).toEqual([]);
        });
    });

    describe("a solid the kernel refuses is freed, not left alive", () => {
        let manifoldPrototype: ManifoldPrototype;

        beforeAll(() => {
            const probe = cube();
            manifoldPrototype = Object.getPrototypeOf(probe) as ManifoldPrototype;
            probe.delete();
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        const refusedSolidsOf = (statusRead: MockInstance<ManifoldPrototype["status"]>): Manifold3D.Manifold[] =>
            statusRead.mock.contexts.filter((_solid, at) => statusRead.mock.results[at]?.value !== "NoError");

        it("should free the solid it refuses to build from an open mesh", () => {
            // Arrange
            const statusRead = vi.spyOn(manifoldPrototype, "status");
            const mesh = { numProp: 3, vertProperties: Float32Array.from(OPEN_TRIANGLE_NUMBERS), triVerts: Uint32Array.from([0, 1, 2]), mergeFromVert: new Uint32Array(), mergeToVert: new Uint32Array() };

            // Act & Assert
            expect(() => manifold.manifold.shapes.manifoldFromMesh({ mesh })).toThrow("Not manifold");
            expect(refusedSolidsOf(statusRead).map(isDeleted)).toEqual([true]);
        });

        it("should free the solid it refuses to build from triangles that do not close", () => {
            // Arrange
            const statusRead = vi.spyOn(manifoldPrototype, "status");

            // Act & Assert
            expect(() => manifold.manifold.shapes.fromPolygonPoints({ polygonPoints: [OPEN_TRIANGLE] })).toThrow("Not manifold");
            expect(refusedSolidsOf(statusRead).map(isDeleted)).toEqual([true]);
        });

        it("should free the solid a recipe asked for an empty answer on failure refuses to build from an open triangle mesh", () => {
            // Arrange
            const statusRead = vi.spyOn(manifoldPrototype, "status");
            const recipe: Base.Recipe = { format: "bitbybit.recipe", version: 1, millimetresPerUnit: 1, tolerance: 0.001, buffers: { f64: Float64Array.from(OPEN_TRIANGLE_NUMBERS), i32: Int32Array.from([0, 1, 2]) }, nodes: [{ op: "triangles", positions: [0, 9], indices: [0, 3] }], roots: [{ node: 0, matrix: IDENTITY, tag: {} }] };

            // Act
            const solids = manifold.recipes.build({ recipe, emptyWhenFailed: true });

            // Assert
            expect(solids.map(solid => solid.isEmpty())).toEqual([true]);
            expect(refusedSolidsOf(statusRead).map(isDeleted)).toEqual([true]);
            solids.forEach(solid => solid.delete());
        });
    });

    it("should count the solid it builds from a mesh among what the call made, so a leak of it would show", () => {
        // Arrange
        const source = cube();
        const mesh = source.getMesh();
        source.delete();

        // Act
        const run = ledgerRun(() => manifold.manifold.shapes.manifoldFromMesh({ mesh }));

        // Assert
        expect([run.made, namesOf(run.leaked)]).toEqual([1, []]);
        (run.result as Manifold3D.Manifold).delete();
    });

});

describe("Manifold kernel object lifetimes for calls handed plain polygons", () => {
    let wasm: Manifold3D.ManifoldToplevel;
    let manifold: ManifoldService;

    beforeAll(async () => {
        wasm = await Module();
        wasm.setup();
        manifold = new ManifoldService(wasm);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const crossSectionVectorOf = (kernel: Manifold3D.ManifoldToplevel): CrossSectionVectorClass => {
        const vectorClass: unknown = Reflect.get(kernel, "Vector_crossSection");
        return vectorClass as CrossSectionVectorClass;
    };

    it("should free the cross-sections it builds from the polygons it composes, and leave the cross-sections it was handed alive", () => {
        // Arrange
        const square = manifold.crossSection.shapes.square({ center: false, size: 2 });
        const triangle: Manifold3D.Polygons = [[[5, 0], [7, 0], [7, 2]]];
        const pushed = vi.spyOn(crossSectionVectorOf(wasm).prototype, "push_back");

        // Act
        const composed = manifold.crossSection.operations.compose({ polygons: [square, triangle] });

        // Assert
        const handedToTheKernel = pushed.mock.calls.map(([section]) => section);
        expect(handedToTheKernel.map(section => section === square || isDeleted(section))).toEqual([true, true]);
        expect(isDeleted(square)).toBe(false);
        expect(manifold.crossSection.evaluate.area({ crossSection: composed })).toBeCloseTo(6, 6);
        composed.delete();
        square.delete();
    });
});

describe("the kernel ledger on what the library's own code makes", () => {
    let wasm: Manifold3D.ManifoldToplevel;
    let manifold: ManifoldService;

    beforeAll(async () => {
        wasm = await Module();
        wasm.setup();
        manifold = new ManifoldService(wasm);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const vectorClassOf = (kernel: Manifold3D.ManifoldToplevel): KernelVectorClass => Reflect.get(kernel, "Vector_vec2");
    const readPrototypeOf = (section: Manifold3D.CrossSection): CrossSectionReadPrototype => Object.getPrototypeOf(section);

    it("should count the cross-section the library's class makes when called without new among what the call made", () => {
        // Arrange
        const opened = openWindow();

        // Act
        const section: Manifold3D.CrossSection = Reflect.apply(wasm.CrossSection, undefined, [TRIANGLE]);
        opened.close();

        // Assert
        expect(opened.made()).toContain(section);
        section.delete();
    });

    it("should leave out of a run's leaks the vector the library's own code made and dropped, and keep in them a vector the run's own code dropped", () => {
        // Arrange
        const Vector = vectorClassOf(wasm);

        // Act
        const run = ledgerRun(() => {
            void new Vector();
            return new wasm.CrossSection(TRIANGLE);
        });

        // Assert
        expect(namesOf(run.leaked)).toEqual(["Vector_vec2"]);
        run.leaked.forEach(handle => handle.delete());
        run.result?.delete();
    });

    it("should judge a vector a public call's own code drops as left alive, and count the vector the library's code drops apart, as the library's", () => {
        // Arrange
        const Vector = vectorClassOf(wasm);
        const square = manifold.crossSection.shapes.square({ center: false, size: 2 });
        const read = readPrototypeOf(square);
        const toPolygons = read.toPolygons;
        const dropped: KernelHandle[] = [];
        vi.spyOn(read, "toPolygons").mockImplementation(function (this: Manifold3D.CrossSection) {
            dropped.push(new Vector());
            return toPolygons.call(this);
        });

        // Act
        const judged = talliesDuring(() => manifold.crossSection.crossSectionToPolygons({ crossSection: square }));

        // Assert
        const tally = judged.get("crossSection.crossSectionToPolygons")?.ok;
        expect([tally?.leakedCalls, tally?.leaked, tally?.foreignCalls, tally?.foreign]).toEqual([1, { Vector_vec2: 1 }, 1, { Vector_vec2: 1 }]);
        dropped.forEach(handle => handle.delete());
        square.delete();
    });

    it("should keep the most of each class one call of a path left beside the totals of all its calls", () => {
        // Arrange
        const one = manifold.crossSection.shapes.square({ center: false, size: 2 });
        const two = new wasm.CrossSection(TWO_APART_SQUARES);

        // Act
        const judged = talliesDuring(() => {
            manifold.crossSection.crossSectionToPolygons({ crossSection: one });
            manifold.crossSection.crossSectionToPolygons({ crossSection: two });
        });

        // Assert
        const tally = judged.get("crossSection.crossSectionToPolygons")?.ok;
        expect([tally?.foreignCalls, tally?.foreign, tally?.foreignMost]).toEqual([2, { Vector_vec2: 3 }, { Vector_vec2: 2 }]);
        one.delete();
        two.delete();
    });
});
