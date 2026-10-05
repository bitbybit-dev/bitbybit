import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";

type BooleanCall = "BooleanFuse" | "BooleanCut" | "BooleanCommon" | "BooleanFuseWithHistory" | "BooleanCutWithHistory";
type BooleanAnswer = { shape: TopoDS_Shape | null, errorAlerts: string };

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
        while (restores.length) {
            restores.pop()!();
        }
    });

    function watch(name: BooleanCall, failFrom = Infinity, alerts = ""): { sizes: number[][], shapes: (TopoDS_Shape | null)[], strategies: unknown[] } {
        const tally = { sizes: [] as number[][], shapes: [] as (TopoDS_Shape | null)[], strategies: [] as unknown[] };
        const original: unknown = Reflect.get(occt, name);
        const call = (original as (...args: unknown[]) => BooleanAnswer).bind(occt);
        Reflect.set(occt, name, (...args: unknown[]): BooleanAnswer => {
            tally.sizes.push(args.filter(Array.isArray).map(list => list.length));
            tally.strategies.push(args[args.length - 1]);
            const answer = tally.sizes.length >= failFrom ? { shape: null, errorAlerts: alerts } : call(...args);
            tally.shapes.push(answer.shape);
            return answer;
        });
        restores.push(() => {
            Reflect.set(occt, name, original);
        });
        return tally;
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
        it("fuses every shape in one kernel call", () => {
            // Arrange
            const fuse = watch("BooleanFuse");

            // Act
            const result = service.booleans.union({ shapes: [box(0, 10), box(5, 10), box(10, 10)], keepEdges: false });

            // Assert
            expect(fuse.sizes).toEqual([[3]]);
            expect(volume(result)).toBeCloseTo(2000);
        });

        it("merges the overlapping pieces of a compound it is given", () => {
            // Arrange
            const pieces = service.shapes.compound.makeCompound({ shapes: [box(0, 10), box(5, 10)] });

            // Act
            const result = service.booleans.union({ shapes: [pieces], keepEdges: false });

            // Assert
            expect(service.shapes.solid.getSolids({ shape: result })).toHaveLength(1);
            expect(volume(result)).toBeCloseTo(1500);
        });

        it("fuses the pieces of a compound that comes first with the next shape, and keeps a piece that meets nothing apart", () => {
            // Arrange
            const pieces = service.shapes.compound.makeCompound({ shapes: [box(0, 10), box(30, 10)] });

            // Act
            const result = service.booleans.union({ shapes: [pieces, box(5, 10)], keepEdges: false });

            // Assert
            expect(volumes(service.shapes.solid.getSolids({ shape: result })).sort((a, b) => a - b)).toEqual([1000, 1500]);
        });

        it("returns a single shape as a new shape", () => {
            // Arrange
            const single = box(0, 10);

            // Act
            const result = service.booleans.union({ shapes: [single], keepEdges: true });

            // Assert
            expect(result).not.toBe(single);
            expect(volume(result)).toBeCloseTo(1000);
        });
    });

    describe("difference", () => {
        it("cuts with every tool in one kernel call", () => {
            // Arrange
            const cut = watch("BooleanCut");
            const drill = (x: number): TopoDS_Shape => service.shapes.solid.createCylinder({ radius: 1, height: 20, center: [x, -10, 0], direction: [0, 1, 0] });

            // Act
            const result = service.booleans.difference({ shape: box(0, 10), shapes: [drill(-3), drill(0), drill(3)], keepEdges: false });

            // Assert
            expect(cut.sizes).toEqual([[1, 3]]);
            expect(volume(result)).toBeCloseTo(1000 - 3 * Math.PI * 10);
        });
    });

    describe("when the kernel cannot combine the shapes", () => {
        it.each([
            ["union", "BooleanFuse"],
            ["difference", "BooleanCut"],
            ["intersection", "BooleanCommon"],
        ] as const)("names shapes of different dimensions when %s's kernel reports the operation not allowed", (operation, name) => {
            // Arrange
            watch(name, 1, "BOPAlgo_AlertNoFiller BOPAlgo_AlertBOPNotAllowed");

            // Act
            const failure = failureOf(() => {
                if (operation === "union") {
                    return helper.booleansService.union({ shapes: [box(0, 10), box(5, 10)], keepEdges: true, strategy: Inputs.OCCT.booleanStrategyEnum.oneAfterAnother });
                }
                if (operation === "difference") {
                    return helper.booleansService.difference({ shape: box(0, 10), shapes: [box(5, 10)], keepEdges: true, strategy: Inputs.OCCT.booleanStrategyEnum.oneAfterAnother });
                }
                return helper.booleansService.intersection({ shapes: [box(0, 10), box(5, 10)], keepEdges: true });
            });

            // Assert
            expect(failure).toMatchObject(MIXED_DIMENSIONS);
        });

        it("names no reason for alerts it does not know", () => {
            // Arrange
            watch("BooleanFuse", 1, "BOPAlgo_AlertIntersectionFailed");

            // Act
            const failure = failureOf(() => helper.booleansService.union({ shapes: [box(0, 10), box(5, 10)], keepEdges: true, strategy: Inputs.OCCT.booleanStrategyEnum.oneAfterAnother }));

            // Assert
            expect(failure).toMatchObject(BOOLEAN_FAILED);
        });

        it.each([
            ["the shape to cut from", (): unknown => helper.booleansService.difference({ shape: new occt.TopoDS_Shape(), shapes: [box(0, 10)], keepEdges: true, strategy: Inputs.OCCT.booleanStrategyEnum.oneAfterAnother }), "shape", "`shape` is missing or empty"],
            ["a tool", (): unknown => helper.booleansService.difference({ shape: box(0, 10), shapes: [box(5, 1), new occt.TopoDS_Shape()], keepEdges: true, strategy: Inputs.OCCT.booleanStrategyEnum.oneAfterAnother }), "shapes", "`shapes` holds a missing or empty shape at position 1"],
            ["a shape of a union", (): unknown => helper.booleansService.union({ shapes: [new occt.TopoDS_Shape(), box(0, 10)], keepEdges: true, strategy: Inputs.OCCT.booleanStrategyEnum.oneAfterAnother }), "shapes", "`shapes` holds a missing or empty shape at position 0"],
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
            ["union", "BooleanFuse"],
            ["difference", "BooleanCut"],
            ["intersection", "BooleanCommon"],
        ] as const)("throws the named boolean failure from %s when the kernel builds no shape and names no alert", (operation, name) => {
            // Arrange
            watch(name, 1);

            // Act
            const failure = failureOf(() => {
                if (operation === "union") {
                    return helper.booleansService.union({ shapes: [box(0, 10), box(5, 10)], keepEdges: true, strategy: Inputs.OCCT.booleanStrategyEnum.oneAfterAnother });
                }
                if (operation === "difference") {
                    return helper.booleansService.difference({ shape: box(0, 10), shapes: [box(5, 10)], keepEdges: true, strategy: Inputs.OCCT.booleanStrategyEnum.oneAfterAnother });
                }
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
            const failure = failureOf(() => helper.booleansService.difference({ shape: solid, shapes: [tool, edge], keepEdges: true, strategy: Inputs.OCCT.booleanStrategyEnum.oneAfterAnother }));

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
            const failure = failureOf(() => helper.booleansService.union({ shapes: [first, second, edge], keepEdges: true, strategy: Inputs.OCCT.booleanStrategyEnum.oneAfterAnother }));

            // Assert
            expect(failure).toMatchObject(MIXED_DIMENSIONS);
            expect(volume(first)).toBeCloseTo(1000);
            expect(volume(second)).toBeCloseTo(1000);
        });
    });

    describe("intersection", () => {
        it("keeps an intersection where one shape lies wholly inside the other, in one kernel call", () => {
            // Arrange
            const common = watch("BooleanCommon");

            // Act
            const results = helper.booleansService.intersection({ shapes: [box(0, 10), box(0, 4)], keepEdges: false });

            // Assert
            expect(common.sizes).toEqual([[1, 1]]);
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

        it("refuses an empty operand as an input error that says which", () => {
            // Arrange
            const shapes = [box(0, 10), box(0, 4), new occt.TopoDS_Shape()];

            // Act
            const failure = failureOf(() => helper.booleansService.intersection({ shapes, keepEdges: false }));

            // Assert
            expect(failure).toMatchObject({ name: "InputError", property: "shapes", message: "`shapes` holds a missing or empty shape at position 2, as an operation that failed can leave it." });
        });

        it("throws the named boolean failure when a later pair fails, and releases what the earlier pair made", () => {
            // Arrange
            const shapes = [box(0, 10), box(0, 4), box(20, 1)];
            const common = watch("BooleanCommon", 2);

            // Act
            const failure = failureOf(() => helper.booleansService.intersection({ shapes, keepEdges: false }));

            // Assert
            expect(failure).toMatchObject(BOOLEAN_FAILED);
            expect(common.sizes).toHaveLength(2);
            expect(common.shapes[0]!.isDeleted()).toBe(true);
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

    describe("strategy", () => {
        it.each([
            { strategy: undefined, expected: "OneAfterAnother" as const },
            { strategy: Inputs.OCCT.booleanStrategyEnum.oneAfterAnother, expected: "OneAfterAnother" as const },
            { strategy: Inputs.OCCT.booleanStrategyEnum.inGroups, expected: "InGroups" as const },
            { strategy: Inputs.OCCT.booleanStrategyEnum.allAtOnce, expected: "AllAtOnce" as const },
        ])("hands the kernel $expected for unions and differences asked for $strategy, with history or without", ({ strategy, expected }) => {
            // Arrange
            const fuse = watch("BooleanFuse");
            const cut = watch("BooleanCut");
            const fuseWithHistory = watch("BooleanFuseWithHistory");
            const cutWithHistory = watch("BooleanCutWithHistory");

            // Act
            service.booleans.union({ shapes: [box(0, 10), box(5, 10)], keepEdges: false, strategy });
            service.booleans.difference({ shape: box(0, 10), shapes: [box(5, 10)], keepEdges: false, strategy });
            service.booleans.unionWithHistory({ shapes: [box(0, 10), box(5, 10)], keepEdges: false, strategy });
            service.booleans.differenceWithHistory({ shape: box(0, 10), shapes: [box(5, 10)], keepEdges: false, strategy });

            // Assert
            const wanted = occt.BitbybitBool_Strategy[expected];
            expect([...fuse.strategies, ...cut.strategies, ...fuseWithHistory.strategies, ...cutWithHistory.strategies]).toEqual([wanted, wanted, wanted, wanted]);
        });

        it("unites and cuts as one after another does when the strategy is left out, numbering the faces the same", () => {
            // Arrange
            const tools = (): TopoDS_Shape[] => [box(5, 10), service.shapes.solid.createSphere({ radius: 4, center: [12, 0, 0] })];
            const centres = (shape: TopoDS_Shape): Inputs.Base.Point3[] => service.shapes.face.getFacesCentersOfMass({ shapes: service.shapes.face.getFaces({ shape }) });

            // Act
            const unset = service.booleans.difference({ shape: box(0, 20), shapes: tools(), keepEdges: false });
            const asked = service.booleans.difference({ shape: box(0, 20), shapes: tools(), keepEdges: false, strategy: Inputs.OCCT.booleanStrategyEnum.oneAfterAnother });

            // Assert
            expect(centres(unset)).toEqual(centres(asked).map(centre => centre.map(value => expect.closeTo(value, 9))));
            expect(volume(unset)).toBeCloseTo(volume(asked), 9);
        });
    });
});
