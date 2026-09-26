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

    function reportErrors(): void {
        const original = occt.BRepAlgoAPI_Common.prototype.HasErrors;
        occt.BRepAlgoAPI_Common.prototype.HasErrors = (): boolean => true;
        restores.push(() => {
            occt.BRepAlgoAPI_Common.prototype.HasErrors = original;
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

        it("drops a result the kernel reports errors for, even when it has content", () => {
            // Arrange
            reportErrors();

            // Act
            const results = helper.booleansService.intersection({ shapes: [box(0, 10), box(0, 4)], keepEdges: false });

            // Assert
            expect(results).toEqual([]);
        });

        it("returns no intersection instead of throwing when an operand is a null shape", () => {
            // Arrange
            const shapes = [box(0, 10), new occt.TopoDS_Shape()];

            // Act
            const results = helper.booleansService.intersection({ shapes, keepEdges: false });

            // Assert
            expect(results).toEqual([]);
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
