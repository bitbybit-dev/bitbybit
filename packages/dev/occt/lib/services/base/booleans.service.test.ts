import { describe, it, expect, beforeAll, afterEach } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";

type BooleanClass = "BRepAlgoAPI_Fuse" | "BRepAlgoAPI_Cut" | "BRepAlgoAPI_Common";

describe("BooleansService", () => {
    let occt: BitbybitOcctModule;
    let helper: OccHelper;
    let service: OCCTService;
    const restores: (() => void)[] = [];

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        helper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt);
        service = new OCCTService(occt, helper);
    });

    afterEach(() => {
        while (restores.length) restores.pop()!();
    });

    function watch(name: BooleanClass): { made: number; built: number } {
        const tally = { made: 0, built: 0 };
        const original = occt[name];
        const build = original.prototype.Build;
        original.prototype.Build = function (this: unknown, ...args: unknown[]): unknown {
            tally.built++;
            return build.apply(this, args);
        };
        Reflect.set(occt, name, new Proxy(original, {
            construct(target, args): object {
                tally.made++;
                return Reflect.construct(target, args);
            },
        }));
        restores.push(() => {
            original.prototype.Build = build;
            Reflect.set(occt, name, original);
        });
        return tally;
    }

    function reportErrors(name: BooleanClass = "BRepAlgoAPI_Common"): void {
        const original = occt[name].prototype.HasErrors;
        occt[name].prototype.HasErrors = (): boolean => true;
        restores.push(() => {
            occt[name].prototype.HasErrors = original;
        });
    }

    function reportNotDone(name: BooleanClass): void {
        const original = occt[name].prototype.IsDone;
        occt[name].prototype.IsDone = (): boolean => false;
        restores.push(() => {
            occt[name].prototype.IsDone = original;
        });
    }

    function returnNullShape(name: BooleanClass): void {
        const original = occt[name].prototype.Shape;
        occt[name].prototype.Shape = (): TopoDS_Shape => new occt.TopoDS_Shape();
        restores.push(() => {
            occt[name].prototype.Shape = original;
        });
    }

    function failureOf(run: () => unknown): unknown {
        try {
            run();
        } catch (thrown) {
            return thrown;
        }
        return undefined;
    }

    const BOOLEAN_FAILED = { name: "KernelOperationError", code: "occt.boolean.failed" };
    const MIXED_DIMENSIONS = { name: "KernelOperationError", code: "occt.boolean.mixedDimensions" };

    function reportAlerts(name: BooleanClass, alerts: string): void {
        const errors = occt[name].prototype.HasErrors;
        const read = occt[name].prototype.ErrorAlerts;
        occt[name].prototype.HasErrors = (): boolean => true;
        occt[name].prototype.ErrorAlerts = (): string => alerts;
        restores.push(() => {
            occt[name].prototype.HasErrors = errors;
            occt[name].prototype.ErrorAlerts = read;
        });
    }

    function box(x: number, size: number): TopoDS_Shape {
        return service.shapes.solid.createBox({ width: size, length: size, height: size, center: [x, 0, 0] });
    }

    function volume(shape: TopoDS_Shape): number {
        return service.shapes.solid.getSolidVolume({ shape });
    }

    function volumes(shapes: TopoDS_Shape[]): number[] {
        return shapes.map(shape => Math.round(volume(shape) * 1000) / 1000);
    }

    describe("union", () => {
        it("fuses two shapes with one boolean, computed once", () => {
            // Arrange
            const fuse = watch("BRepAlgoAPI_Fuse");

            // Act
            const result = service.booleans.union({ shapes: [box(0, 10), box(5, 10)], keepEdges: false });

            // Assert
            expect(fuse).toEqual({ made: 1, built: 0 });
            expect(volume(result)).toBeCloseTo(1500);
        });

        it("fuses each further shape once", () => {
            // Arrange
            const fuse = watch("BRepAlgoAPI_Fuse");

            // Act
            const result = service.booleans.union({ shapes: [box(0, 10), box(5, 10), box(10, 10)], keepEdges: false });

            // Assert
            expect(fuse).toEqual({ made: 2, built: 0 });
            expect(volume(result)).toBeCloseTo(2000);
        });

        it("fuses a compound that comes first straight with the next shape", () => {
            // Arrange
            const fuse = watch("BRepAlgoAPI_Fuse");
            const pieces = service.shapes.compound.makeCompound({ shapes: [box(0, 10), box(30, 10)] });

            // Act
            const result = service.booleans.union({ shapes: [pieces, box(5, 10)], keepEdges: false });

            // Assert
            expect(fuse).toEqual({ made: 1, built: 0 });
            expect(volume(result)).toBeCloseTo(2500);
        });

        it("fuses a single shape with itself, returning a new shape", () => {
            // Arrange
            const fuse = watch("BRepAlgoAPI_Fuse");
            const single = box(0, 10);

            // Act
            const result = service.booleans.union({ shapes: [single], keepEdges: true });

            // Assert
            expect(fuse).toEqual({ made: 1, built: 0 });
            expect(result).not.toBe(single);
            expect(volume(result)).toBeCloseTo(1000);
        });
    });

    describe("difference", () => {
        it("cuts each tool once, computed once", () => {
            // Arrange
            const cut = watch("BRepAlgoAPI_Cut");
            const drill = (x: number): TopoDS_Shape => service.shapes.solid.createCylinder({ radius: 1, height: 20, center: [x, -10, 0], direction: [0, 1, 0] });

            // Act
            const result = service.booleans.difference({ shape: box(0, 10), shapes: [drill(-3), drill(0), drill(3)], keepEdges: false });

            // Assert
            expect(cut).toEqual({ made: 3, built: 0 });
            expect(volume(result)).toBeCloseTo(1000 - 3 * Math.PI * 10);
        });
    });

    describe("when the kernel cannot combine the shapes", () => {
        it.each([
            ["union", "BRepAlgoAPI_Fuse"],
            ["difference", "BRepAlgoAPI_Cut"],
            ["intersection", "BRepAlgoAPI_Common"],
        ] as const)("names shapes of different dimensions when %s's kernel reports the operation not allowed", (operation, name) => {
            // Arrange
            reportAlerts(name, "BOPAlgo_AlertNoFiller BOPAlgo_AlertBOPNotAllowed");

            // Act
            const failure = failureOf(() => {
                if (operation === "union") return helper.booleansService.union({ shapes: [box(0, 10), box(5, 10)], keepEdges: true });
                if (operation === "difference") return helper.booleansService.difference({ shape: box(0, 10), shapes: [box(5, 10)], keepEdges: true });
                return helper.booleansService.intersection({ shapes: [box(0, 10), box(5, 10)], keepEdges: true });
            });

            // Assert
            expect(failure).toMatchObject(MIXED_DIMENSIONS);
        });

        it("names no reason for alerts it does not know", () => {
            // Arrange
            reportAlerts("BRepAlgoAPI_Fuse", "BOPAlgo_AlertIntersectionFailed");

            // Act
            const failure = failureOf(() => helper.booleansService.union({ shapes: [box(0, 10), box(5, 10)], keepEdges: true }));

            // Assert
            expect(failure).toMatchObject(BOOLEAN_FAILED);
        });

        it.each([
            ["the shape to cut from", (): unknown => helper.booleansService.difference({ shape: new occt.TopoDS_Shape(), shapes: [box(0, 10)], keepEdges: true }), "shape", "The shape is empty"],
            ["a tool", (): unknown => helper.booleansService.difference({ shape: box(0, 10), shapes: [box(5, 1), new occt.TopoDS_Shape()], keepEdges: true }), "shapes", "The shape at position 1 of `shapes` is empty"],
            ["a shape of a union", (): unknown => helper.booleansService.union({ shapes: [new occt.TopoDS_Shape(), box(0, 10)], keepEdges: true }), "shapes", "The shape at position 0 of `shapes` is empty"],
        ])("refuses an empty %s as an input error", (_what, run, property, start) => {
            // Act
            const failure = failureOf(run);

            // Assert
            expect(failure).toMatchObject({ name: "InputError", property });
            expect((failure as Error).message.startsWith(start)).toBe(true);
        });

        it("names shapes of different dimensions for a union of a solid and an edge, and leaves both intact", () => {
            // Arrange
            const solid = box(0, 10);
            const edge = service.shapes.edge.line({ start: [-20, 0, 0], end: [20, 0, 0] });

            // Act
            const failure = failureOf(() => service.booleans.union({ shapes: [solid, edge], keepEdges: false }));

            // Assert
            expect(failure).toMatchObject(MIXED_DIMENSIONS);
            expect(volume(solid)).toBeCloseTo(1000);
            expect(edge.IsNull()).toBe(false);
        });

        it("names shapes of different dimensions for a solid cut by an edge, and leaves both intact", () => {
            // Arrange
            const solid = box(0, 10);
            const edge = service.shapes.edge.line({ start: [-20, 0, 0], end: [20, 0, 0] });

            // Act
            const failure = failureOf(() => service.booleans.difference({ shape: solid, shapes: [edge], keepEdges: false }));

            // Assert
            expect(failure).toMatchObject(MIXED_DIMENSIONS);
            expect(volume(solid)).toBeCloseTo(1000);
            expect(edge.IsNull()).toBe(false);
        });

        it.each([
            ["union", "BRepAlgoAPI_Fuse"],
            ["difference", "BRepAlgoAPI_Cut"],
        ] as const)("throws the named boolean failure from %s when the kernel reports errors", (operation, name) => {
            // Arrange
            reportErrors(name);

            // Act
            const failure = failureOf(() => operation === "union"
                ? helper.booleansService.union({ shapes: [box(0, 10), box(5, 10)], keepEdges: true })
                : helper.booleansService.difference({ shape: box(0, 10), shapes: [box(5, 10)], keepEdges: true }));

            // Assert
            expect(failure).toMatchObject(BOOLEAN_FAILED);
        });

        it.each([
            ["union", "BRepAlgoAPI_Fuse"],
            ["difference", "BRepAlgoAPI_Cut"],
        ] as const)("throws the named boolean failure from %s when the kernel says it is not done", (operation, name) => {
            // Arrange
            reportNotDone(name);

            // Act
            const failure = failureOf(() => operation === "union"
                ? helper.booleansService.union({ shapes: [box(0, 10), box(5, 10)], keepEdges: true })
                : helper.booleansService.difference({ shape: box(0, 10), shapes: [box(5, 10)], keepEdges: true }));

            // Assert
            expect(failure).toMatchObject(BOOLEAN_FAILED);
        });

        it.each([
            ["union", "BRepAlgoAPI_Fuse"],
            ["difference", "BRepAlgoAPI_Cut"],
            ["intersection", "BRepAlgoAPI_Common"],
        ] as const)("throws the named boolean failure from %s when the kernel returns no shape", (operation, name) => {
            // Arrange
            returnNullShape(name);

            // Act
            const failure = failureOf(() => {
                if (operation === "union") return helper.booleansService.union({ shapes: [box(0, 10), box(5, 10)], keepEdges: true });
                if (operation === "difference") return helper.booleansService.difference({ shape: box(0, 10), shapes: [box(5, 10)], keepEdges: true });
                return helper.booleansService.intersection({ shapes: [box(0, 10), box(5, 10)], keepEdges: true });
            });

            // Assert
            expect(failure).toMatchObject(BOOLEAN_FAILED);
        });

        it("leaves every shape it was given intact when a later cut fails", () => {
            // Arrange
            const solid = box(0, 10);
            const tool = box(5, 10);
            const edge = service.shapes.edge.line({ start: [-20, 0, 0], end: [20, 0, 0] });

            // Act
            const failure = failureOf(() => helper.booleansService.difference({ shape: solid, shapes: [tool, edge], keepEdges: true }));

            // Assert
            expect(failure).toMatchObject(MIXED_DIMENSIONS);
            expect(volume(solid)).toBeCloseTo(1000);
            expect(volume(tool)).toBeCloseTo(1000);
        });

        it("leaves every shape it was given intact when a later fuse fails", () => {
            // Arrange
            const first = box(0, 10);
            const second = box(5, 10);
            const edge = service.shapes.edge.line({ start: [-20, 0, 0], end: [20, 0, 0] });

            // Act
            const failure = failureOf(() => helper.booleansService.union({ shapes: [first, second, edge], keepEdges: true }));

            // Assert
            expect(failure).toMatchObject(MIXED_DIMENSIONS);
            expect(volume(first)).toBeCloseTo(1000);
            expect(volume(second)).toBeCloseTo(1000);
        });
    });

    describe("intersection", () => {
        it("keeps an intersection where one shape lies wholly inside the other, computed once", () => {
            // Arrange
            const common = watch("BRepAlgoAPI_Common");

            // Act
            const results = helper.booleansService.intersection({ shapes: [box(0, 10), box(0, 4)], keepEdges: false });

            // Assert
            expect(common).toEqual({ made: 1, built: 0 });
            expect(volumes(results)).toEqual([64]);
        });

        it("keeps the overlap of shapes whose faces lie on shared planes", () => {
            // Arrange
            const shapes = [box(0, 10), box(5, 10)];

            // Act
            const results = helper.booleansService.intersection({ shapes, keepEdges: false });

            // Assert
            expect(volumes(results)).toEqual([500]);
        });

        it("keeps the whole shape when both operands are the same", () => {
            // Arrange
            const one = box(0, 10);

            // Act
            const same = helper.booleansService.intersection({ shapes: [one, one], keepEdges: false });
            const equal = helper.booleansService.intersection({ shapes: [box(0, 10), box(0, 10)], keepEdges: false });

            // Assert
            expect(volumes(same)).toEqual([1000]);
            expect(volumes(equal)).toEqual([1000]);
        });

        it("returns no intersection for shapes that do not meet", () => {
            // Arrange
            const shapes = [box(0, 10), box(50, 10)];

            // Act
            const results = helper.booleansService.intersection({ shapes, keepEdges: false });

            // Assert
            expect(results).toEqual([]);
        });

        it("returns no intersection for solids that only touch at a face", () => {
            // Arrange
            const shapes = [box(0, 10), box(10, 10)];

            // Act
            const results = helper.booleansService.intersection({ shapes, keepEdges: false });

            // Assert
            expect(results).toEqual([]);
        });

        it("skips an empty intersection and keeps the others in order", () => {
            // Arrange
            const shapes = [box(0, 10), box(50, 10), box(0, 4), box(5, 10)];

            // Act
            const results = helper.booleansService.intersection({ shapes, keepEdges: false });

            // Assert
            expect(volumes(results)).toEqual([64, 500]);
        });

        it("keeps an intersection that is only a vertex, an edge or a face", () => {
            // Arrange
            const solid = box(0, 10);
            const vertex = service.shapes.vertex.vertexFromXYZ({ x: 1, y: 1, z: 1 });
            const edge = service.shapes.edge.line({ start: [-2, 0, 0], end: [2, 0, 0] });
            const face = service.shapes.face.createSquareFace({ size: 4, center: [0, 0, 0], direction: [0, 1, 0] });

            // Act
            const results = helper.booleansService.intersection({ shapes: [solid, vertex, edge, face], keepEdges: false });

            // Assert
            expect(results).toHaveLength(3);
            expect(service.shapes.vertex.getVertices({ shape: results[0]! })).toHaveLength(1);
            expect(service.shapes.edge.getEdgeLengthsOfShape({ shape: results[1]! })).toEqual([expect.closeTo(4)]);
            expect(service.shapes.face.getFaces({ shape: results[2]! }).map(f => service.shapes.face.getFaceArea({ shape: f }))).toEqual([expect.closeTo(16)]);
        });

        it("throws the named boolean failure when the kernel reports errors, even for a result with content", () => {
            // Arrange
            reportErrors();

            // Act
            const failure = failureOf(() => helper.booleansService.intersection({ shapes: [box(0, 10), box(0, 4)], keepEdges: false }));

            // Assert
            expect(failure).toMatchObject(BOOLEAN_FAILED);
        });

        it("refuses an empty operand as an input error that says which", () => {
            // Arrange
            const shapes = [box(0, 10), box(0, 4), new occt.TopoDS_Shape()];

            // Act
            const failure = failureOf(() => helper.booleansService.intersection({ shapes, keepEdges: false }));

            // Assert
            expect(failure).toMatchObject({ name: "InputError", property: "shapes", message: "The shape at position 2 of `shapes` is empty, as an operation that failed can leave it; nothing can be combined with it." });
        });

        it("throws the named boolean failure when a later pair fails, after an earlier pair succeeded", () => {
            // Arrange
            const shapes = [box(0, 10), box(0, 4), box(20, 1)];
            let pairs = 0;
            const errors = occt.BRepAlgoAPI_Common.prototype.HasErrors;
            occt.BRepAlgoAPI_Common.prototype.HasErrors = function (this: never): boolean {
                pairs++;
                return pairs > 1 || errors.call(this);
            };
            restores.push(() => {
                occt.BRepAlgoAPI_Common.prototype.HasErrors = errors;
            });

            // Act
            const failure = failureOf(() => helper.booleansService.intersection({ shapes, keepEdges: false }));

            // Assert
            expect(failure).toMatchObject(BOOLEAN_FAILED);
            expect(pairs).toBe(2);
        });

        it("throws the named boolean failure when the kernel says it is not done", () => {
            // Arrange
            reportNotDone("BRepAlgoAPI_Common");

            // Act
            const failure = failureOf(() => helper.booleansService.intersection({ shapes: [box(0, 10), box(0, 4)], keepEdges: false }));

            // Assert
            expect(failure).toMatchObject(BOOLEAN_FAILED);
        });

        it("wraps the intersections in one compound through the public API", () => {
            // Arrange
            const shapes = [box(0, 10), box(0, 4)];

            // Act
            const result = service.booleans.intersection({ shapes, keepEdges: false });

            // Assert
            expect(result.ShapeType()).toBe(occt.TopAbs_ShapeEnum.COMPOUND);
            expect(volumes(service.shapes.compound.getShapesOfCompound({ shape: result }))).toEqual([64]);
        });
    });
});
