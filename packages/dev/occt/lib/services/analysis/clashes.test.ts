import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import { readKernelException } from "../../kernel-exception";
import { InputError } from "@bitbybit-dev/base";

describe("OCCT clashes", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const close = (values: number[], digits = 9): unknown[] => values.map(value => expect.closeTo(value, digits));
    const loose = <T>(value: unknown): T => value as T;
    const thrownBy = (action: () => unknown): InputError => {
        try {
            action();
        } catch (error) {
            expect(error).toBeInstanceOf(InputError);
            return error as InputError;
        }
        throw new Error("expected an InputError, but nothing was thrown");
    };
    const messageOf = (action: () => unknown): string => {
        try {
            action();
        } catch (error) {
            const read = readKernelException(kernel, error);
            return read instanceof Error ? read.message : String(read);
        }
        return "nothing thrown";
    };
    const boxFrom = (x: number, size = 10): TopoDS_Shape => occt.shapes.solid.createBox({ width: size, length: 10, height: 10, center: [x + size / 2, 5, 5], originOnCenter: true });
    const rowOfBoxes = (): TopoDS_Shape[] => [boxFrom(0), boxFrom(8), boxFrom(18), boxFrom(29), boxFrom(100)];
    const meshTriangleAt = (z: number): TopoDS_Shape => {
        const stl = `solid t\nfacet normal 0 0 1\nouter loop\nvertex 0 0 ${z}\nvertex 1 0 ${z}\nvertex 0 1 ${z}\nendloop\nendfacet\nendsolid t\n`;
        return kernel.ReadStlFromBytes(new TextEncoder().encode(stl), false);
    };
    const crossingSquares = (): TopoDS_Shape => occt.shapes.compound.makeCompound({
        shapes: [
            occt.shapes.face.createSquareFace({ size: 10, center: [0, 0, 0], direction: [0, 0, 1] }),
            occt.shapes.face.createSquareFace({ size: 10, center: [0, 0, 0], direction: [1, 0, 0] }),
        ],
    });

    describe("betweenShapes", () => {
        it("should report overlapping and touching boxes, the overlap's volume, and nothing for boxes apart", () => {
            // Arrange
            const shapes = rowOfBoxes();

            // Act
            const clashes = occt.analysis.clashes.betweenShapes({ shapes });

            // Assert
            expect(clashes.map(clash => [clash.indexA, clash.indexB])).toEqual([[0, 1], [1, 2]]);
            expect(clashes.map(clash => clash.distance)).toEqual(close([0, 0]));
            expect(clashes[0]!.volume).toBeCloseTo(2 * 10 * 10, 6);
            expect(clashes[1]!.volume).toBeCloseTo(0, 9);
        });

        it("should report boxes 1 apart within a clearance of 1.5 and not within 0.5", () => {
            // Arrange
            const shapes = rowOfBoxes();

            // Act
            const wide = occt.analysis.clashes.betweenShapes({ shapes, clearance: 1.5 });
            const narrow = occt.analysis.clashes.betweenShapes({ shapes, clearance: 0.5 });

            // Assert
            const gap = wide.find(clash => clash.indexA === 2 && clash.indexB === 3);
            expect(wide).toHaveLength(3);
            expect(gap!.distance).toBeCloseTo(1, 9);
            expect(gap!.pointA[0]).toBeCloseTo(28, 9);
            expect(gap!.pointB[0]).toBeCloseTo(29, 9);
            expect(narrow).toHaveLength(2);
        });

        it("should report a box inside another at distance 0 with the inner box's volume", () => {
            // Arrange
            const outer = boxFrom(0);
            const inner = occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [5, 5, 5], originOnCenter: true });

            // Act
            const clashes = occt.analysis.clashes.betweenShapes({ shapes: [outer, inner] });

            // Assert
            expect(clashes).toHaveLength(1);
            expect(clashes[0]!.distance).toBe(0);
            expect(clashes[0]!.volume).toBeCloseTo(8, 6);
        });

        it("should refuse a negative clearance, a list holding a missing shape, and meshes it cannot measure", () => {
            // Arrange
            const shapes = rowOfBoxes();

            // Act
            const negative = thrownBy(() => occt.analysis.clashes.betweenShapes({ shapes, clearance: -1 }));
            const missing = thrownBy(() => occt.analysis.clashes.betweenShapes({ shapes: [boxFrom(0), loose<TopoDS_Shape>(undefined)] }));
            const meshes = messageOf(() => occt.analysis.clashes.betweenShapes({ shapes: [meshTriangleAt(0), meshTriangleAt(1)], clearance: 2 }));

            // Assert
            expect(negative.property).toBe("clearance");
            expect(missing.message).toBe("`shapes` holds a missing or empty shape at position 1, as an operation that failed can leave it.");
            expect(meshes).toBe("Standard_DomainError: ClashesBetween: the distance between shapes 0 and 1 could not be computed");
        });
    });

    describe("facesWithin", () => {
        it("should find the face pairs of two boxes 0.5 apart, sorted, all 0.5 apart", () => {
            // Arrange
            const left = boxFrom(0);
            const right = boxFrom(10.5);

            // Act
            const pairs = occt.analysis.clashes.facesWithin({ shapeA: left, shapeB: right, clearance: 1 });

            // Assert
            const facing = pairs.filter(pair => pair.pointA[0] > 10 - 1e-9 && pair.pointB[0] < 10.5 + 1e-9);
            expect(pairs).toHaveLength(21);
            pairs.forEach(pair => expect(pair.distance).toBeCloseTo(0.5, 9));
            expect(facing).toHaveLength(21);
            expect(pairs.map(pair => [pair.indexA, pair.indexB])).toEqual([...pairs.map(pair => [pair.indexA, pair.indexB])].sort((first, second) => first[0]! - second[0]! || first[1]! - second[1]!));
            pairs.forEach(pair => expect(pair.volume).toBe(0));
        });

        it("should find no pairs within a clearance smaller than the gap", () => {
            // Act
            const pairs = occt.analysis.clashes.facesWithin({ shapeA: boxFrom(0), shapeB: boxFrom(10.5), clearance: 0.25 });

            // Assert
            expect(pairs).toEqual([]);
        });

        it("should number the faces as the face getter does", () => {
            // Arrange
            const left = boxFrom(0);
            const right = boxFrom(10.5);

            // Act
            const pairs = occt.analysis.clashes.facesWithin({ shapeA: left, shapeB: right, clearance: 1 });

            // Assert
            const [facingA] = occt.select.faces.facing({ shape: left, direction: [1, 0, 0], angle: 0 });
            const [facingB] = occt.select.faces.facing({ shape: right, direction: [-1, 0, 0], angle: 0 });
            expect(pairs.map(pair => [pair.indexA, pair.indexB])).toContainEqual([facingA, facingB]);
        });

        it("should refuse a negative clearance and a meshing precision of 0", () => {
            // Act
            const clearance = thrownBy(() => occt.analysis.clashes.facesWithin({ shapeA: boxFrom(0), shapeB: boxFrom(10.5), clearance: -0.1 }));
            const precision = thrownBy(() => occt.analysis.clashes.facesWithin({ shapeA: boxFrom(0), shapeB: boxFrom(10.5), precision: 0 }));
            const missing = thrownBy(() => occt.analysis.clashes.facesWithin({ shapeA: boxFrom(0), shapeB: loose<TopoDS_Shape>(undefined) }));

            // Assert
            expect(clearance.property).toBe("clearance");
            expect(precision.message).toBe("`precision` must be a finite number above 0; it is 0.");
            expect(missing.property).toBe("shapeB");
        });
    });

    describe("selfIntersections", () => {
        it("should find nothing in a box", () => {
            // Act
            const crossings = occt.analysis.clashes.selfIntersections({ shape: boxFrom(0) });

            // Assert
            expect(crossings).toEqual([]);
        });

        it("should find two squares crossing, at the middle of their crossing", () => {
            // Arrange
            const squares = crossingSquares();

            // Act
            const crossings = occt.analysis.clashes.selfIntersections({ shape: squares });

            // Assert
            expect(crossings).toHaveLength(1);
            expect([crossings[0]!.indexA, crossings[0]!.indexB]).toEqual([0, 1]);
            expect(crossings[0]!.pointA).toEqual(close([0, 0, 0]));
            expect(crossings[0]!.pointB).toEqual(crossings[0]!.pointA);
            expect(crossings[0]!.distance).toBe(0);
        });

        it("should refuse a meshing precision that is not above 0, and a missing shape", () => {
            // Act
            const precision = thrownBy(() => occt.analysis.clashes.selfIntersections({ shape: crossingSquares(), precision: Number.NaN }));
            const missing = thrownBy(() => occt.analysis.clashes.selfIntersections({ shape: loose<TopoDS_Shape>(undefined) }));

            // Assert
            expect(precision.property).toBe("precision");
            expect(missing.property).toBe("shape");
        });
    });
});
