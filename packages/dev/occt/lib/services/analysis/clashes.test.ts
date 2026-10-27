import { describe, it, expect, beforeAll, vi } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../../occ-service";
import { readKernelException } from "../../kernel-exception";
import { InputError } from "@bitbybit-dev/base";

describe("OCCT clashes", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
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
    const outcomeOf = (action: () => unknown): string => {
        try {
            return JSON.stringify(action());
        } catch (error) {
            const read = readKernelException(kernel, error);
            return read instanceof Error ? read.message : String(read);
        }
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

        it("should rule out by their meshes a box resting in a hollow one, and still find a box sunk into the hollow one's wall, as measuring every pair does", () => {
            // Arrange
            const outer = occt.shapes.solid.createBox({ width: 30, length: 30, height: 30, center: [0, 0, 0], originOnCenter: true });
            const cavity = occt.shapes.solid.createBox({ width: 20, length: 20, height: 20, center: [0, 0, 0], originOnCenter: true });
            const hollow = occt.booleans.difference({ shape: outer, shapes: [cavity], keepEdges: false });
            const resting = occt.shapes.solid.createBox({ width: 4, length: 4, height: 4, center: [0, 0, -7.9], originOnCenter: true });
            const sunk = occt.shapes.solid.createBox({ width: 4, length: 4, height: 4, center: [9, 0, 0], originOnCenter: true });
            const gear = occt.parts.mechanical.gears.spurGear({ module: 2, teeth: 20, width: 6, bore: 8 });
            const shapes = [hollow, resting, sunk, gear];

            // Act
            const filtered = occt.analysis.clashes.betweenShapes({ shapes, clearance: 0.05 });
            const measured = occt.analysis.clashes.betweenShapes({ shapes, clearance: 0.05, prefilter: false });

            // Assert
            expect(filtered).toEqual(measured);
            expect(filtered.some(clash => clash.indexA === 0 && clash.indexB === 1)).toBe(false);
            expect(filtered.find(clash => clash.indexA === 0 && clash.indexB === 2)?.volume).toBeCloseTo(4 * 4 * 1, 6);
            expect(filtered.some(clash => clash.indexB === 3)).toBe(true);
        });

        it.each([0.01, 1, 100])("should agree with measuring every pair at a scale of %s, turned, with compounds, a free edge and parts a hair from a wall", scale => {
            // Arrange
            const cube = (size: number, center: [number, number, number]): TopoDS_Shape => occt.shapes.solid.createBox({ width: size * scale, length: size * scale, height: size * scale, center: [center[0] * scale, center[1] * scale, center[2] * scale], originOnCenter: true });
            const scene = [
                cube(10, [0, 0, 0]),
                cube(2, [3.999, 0, 0]),
                occt.shapes.solid.createSphere({ radius: 1.5 * scale, center: [0, 6.6 * scale, 0] }),
                occt.shapes.solid.createCylinder({ radius: 2 * scale, height: 4 * scale, center: [-7.002 * scale, 0, -2 * scale], direction: [0, 0, 1] }),
                occt.shapes.solid.createCylinder({ radius: scale, height: 5 * scale, center: [-2 * scale, -2 * scale, 3 * scale], direction: [0, 0, 1] }),
                occt.shapes.compound.makeCompound({ shapes: [cube(4, [20, 0, 0]), cube(4, [22, 0, 0]), cube(1, [21, 0, 0])] }),
                cube(1, [21, 0, 0]),
                occt.shapes.compound.makeCompound({ shapes: [cube(2, [40, 0, 0]), occt.shapes.edge.line({ start: [0, 0, -8 * scale], end: [0, 0, -4 * scale] })] }),
            ];
            const shapes = scene.map(shape => occt.transforms.rotate({ shape, axis: [1, 1, 1], angle: 37 }));
            const facesWithin = vi.spyOn(kernel, "FacesWithin");
            const classified = vi.spyOn(kernel, "ClassifyPointsInSolid");

            // Act
            const runs = [0, 0.05, 0.2].map(share => ({
                filtered: occt.analysis.clashes.betweenShapes({ shapes, clearance: share * scale }),
                measured: occt.analysis.clashes.betweenShapes({ shapes, clearance: share * scale, prefilter: false }),
            }));

            // Assert
            runs.forEach(run => expect(run.filtered).toEqual(run.measured));
            expect(runs[0]!.measured.map(clash => [clash.indexA, clash.indexB])).toEqual([[0, 1], [0, 4], [0, 7], [5, 6]]);
            expect(facesWithin).toHaveBeenCalled();
            expect(classified).toHaveBeenCalled();
            facesWithin.mockRestore();
            classified.mockRestore();
        });

        it("should still agree when the kernel cannot classify a point, telling a part a hair inside a wall by a point far from it, and measuring one with no point that far", () => {
            // Arrange
            const block = occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0], originOnCenter: true });
            const inside = occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [3.999, 0, 0], originOnCenter: true });
            const outside = occt.shapes.solid.createCylinder({ radius: 2, height: 4, center: [-7.002, 0, -2], direction: [0, 0, 1] });
            const thin = occt.shapes.solid.createBox({ width: 0.002, length: 4, height: 4, center: [4.997, 0, 0], originOnCenter: true });
            const speck = occt.shapes.solid.createBox({ width: 0.0005, length: 0.0005, height: 0.0005, center: [4.99875, 1.5, 0], originOnCenter: true });
            const shapes = [block, inside, outside, thin, speck];
            const unknown = vi.spyOn(kernel, "ClassifyPointsInSolid").mockImplementation((_shape, points) => new Int32Array(points.length / 3).fill(3));

            // Act
            const filtered = occt.analysis.clashes.betweenShapes({ shapes });
            unknown.mockRestore();

            // Assert
            expect(filtered).toEqual(occt.analysis.clashes.betweenShapes({ shapes, prefilter: false }));
            expect(filtered.map(clash => [clash.indexA, clash.indexB])).toEqual([[0, 1], [0, 3], [0, 4], [1, 3]]);
        });

        it("should rule out without measuring a piston a hair inside its bore and a block resting in a hollow, by finer meshes and a point classified or far from the wall", () => {
            // Arrange
            const outer = occt.shapes.solid.createBox({ width: 30, length: 30, height: 30, center: [0, 0, 0], originOnCenter: true });
            const cavity = occt.shapes.solid.createBox({ width: 20, length: 20, height: 20, center: [0, 0, 0], originOnCenter: true });
            const hollow = occt.booleans.difference({ shape: outer, shapes: [cavity], keepEdges: false });
            const resting = occt.shapes.solid.createBox({ width: 4, length: 4, height: 4, center: [0, 0, -7.999], originOnCenter: true });
            const barrel = occt.shapes.solid.createCylinder({ radius: 15, height: 20, center: [60, 0, 0], direction: [0, 0, 1] });
            const bore = occt.shapes.solid.createCylinder({ radius: 10.02, height: 20, center: [60, 0, 0], direction: [0, 0, 1] });
            const tube = occt.booleans.difference({ shape: barrel, shapes: [bore], keepEdges: false });
            const piston = occt.shapes.solid.createCylinder({ radius: 10, height: 20, center: [60, 0, 0], direction: [0, 0, 1] });
            const shapes = [hollow, resting, tube, piston];
            const measured = vi.spyOn(kernel, "ClashesBetween");
            const firstUnknown = vi.spyOn(kernel, "ClassifyPointsInSolid").mockImplementation((_shape, points) => Int32Array.from({ length: points.length / 3 }, (_, index) => index === 0 ? 3 : 1));

            // Act
            const partlyKnown = occt.analysis.clashes.betweenShapes({ shapes });
            firstUnknown.mockImplementation((_shape, points) => new Int32Array(points.length / 3).fill(3));
            const unknown = occt.analysis.clashes.betweenShapes({ shapes });
            firstUnknown.mockRestore();

            // Assert
            expect([partlyKnown, unknown]).toEqual([[], []]);
            expect(measured).not.toHaveBeenCalled();
            measured.mockRestore();
        });

        it("should find ridges five micrometres apart on parts modelled in metres", () => {
            // Arrange
            const ridge = (y: number): TopoDS_Shape => occt.transforms.rotate({ shape: occt.shapes.solid.createBox({ width: 1e-3, length: 1e-3, height: 1e-3, center: [0, y, 0], originOnCenter: true }), axis: [0, 1, 0], angle: 45 });
            const shapes = [ridge(0), occt.transforms.translate({ shape: ridge(0), translation: [0, 0, 1e-3 * Math.SQRT2 + 5e-6] })];

            // Act
            const filtered = occt.analysis.clashes.betweenShapes({ shapes, clearance: 1e-5 });

            // Assert
            expect(filtered).toEqual(occt.analysis.clashes.betweenShapes({ shapes, clearance: 1e-5, prefilter: false }));
            expect(filtered[0]?.distance).toBeCloseTo(5e-6, 12);
        });

        it("should measure a part a hair inside a solid whose faces carry only a mesh as measuring every pair does, and name a pair it cannot measure by its own positions", () => {
            // Arrange
            const corners = [[0, 0, 0], [10, 0, 0], [0, 10, 0], [0, 0, 10]];
            const facet = (...at: number[]): string => `facet normal 0 0 0\nouter loop\n${at.map(index => `vertex ${corners[index]!.join(" ")}`).join("\n")}\nendloop\nendfacet\n`;
            const tetrahedron = kernel.ReadStlFromBytes(new TextEncoder().encode(`solid t\n${facet(0, 2, 1)}${facet(0, 1, 3)}${facet(0, 3, 2)}${facet(1, 2, 3)}endsolid t\n`), false);
            const builder = new kernel.BRep_Builder();
            const shell = builder.MakeShell();
            builder.Add(shell, tetrahedron);
            const meshOnly = builder.MakeSolid();
            builder.Add(meshOnly, shell);
            const near = [meshOnly, occt.shapes.solid.createBox({ width: 0.5, length: 0.5, height: 0.5, center: [0.252, 2, 2], originOnCenter: true })];
            const unmeasurable = [boxFrom(20), boxFrom(100), meshTriangleAt(0), meshTriangleAt(1)];

            // Act
            const filtered = outcomeOf(() => occt.analysis.clashes.betweenShapes({ shapes: near }));
            const named = messageOf(() => occt.analysis.clashes.betweenShapes({ shapes: unmeasurable, clearance: 2 }));

            // Assert
            expect(filtered).toBe(outcomeOf(() => occt.analysis.clashes.betweenShapes({ shapes: near, prefilter: false })));
            expect(named).toBe("Standard_DomainError: ClashesBetween: the distance between shapes 2 and 3 could not be computed");
            builder.delete();
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
