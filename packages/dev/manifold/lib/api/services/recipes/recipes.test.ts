import type { Base } from "@bitbybit-dev/base";
import { InputError } from "@bitbybit-dev/base";
import type * as Manifold3D from "manifold-3d";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { getManifold } from "../../__test__/kernel";
import type { ManifoldService } from "../../manifold-service";
import type { ManifoldPrototype, CrossSectionPrototype } from "../../__test__/test-types";

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const SQUARE = [0, 0, 4, 0, 4, 2, 0, 2];
const FOUR_BY_FOUR = [0, 0, 4, 0, 4, 4, 0, 4];
const BILLIONFOLD: Base.TransformMatrix = [1e9, 0, 0, 0, 0, 1e9, 0, 0, 0, 0, 1e9, 0, 0, 0, 0, 1];
const NATIVE_EXCEPTION: unknown = 111536;

function recipeOf(nodes: Base.RecipeNode[], roots: Base.RecipeRoot[], f64: number[] = SQUARE, i32: number[] = []): Base.Recipe {
    return { format: "bitbybit.recipe", version: 1, millimetresPerUnit: 1, tolerance: 0.001, buffers: { f64: new Float64Array(f64), i32: new Int32Array(i32) }, nodes, roots };
}

function root(node: number, matrix: Base.TransformMatrix = IDENTITY): Base.RecipeRoot {
    return { node, matrix, tag: {} };
}

function moved(x: number, y = 0, z = 0): Base.TransformMatrix {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
}

function extrudedOnce(polygon: Base.RecipePolygonNode): Base.RecipeNode[] {
    return [polygon, { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 1 }];
}

const BOX: Base.RecipeNode[] = [
    { op: "polygon", points: [0, 8], holes: [] },
    { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 3 },
];

describe("ManifoldRecipes.build", () => {
    let manifold: ManifoldService;
    let manifoldPrototype: ManifoldPrototype;
    let crossSectionPrototype: CrossSectionPrototype;

    beforeAll(async () => {
        manifold = await getManifold();
        const [probe] = manifold.recipes.build({ recipe: recipeOf(BOX, [root(1)]) });
        manifoldPrototype = Object.getPrototypeOf(probe) as ManifoldPrototype;
        probe!.delete();
        const square = manifold.crossSection.shapes.square({ size: 1, center: false });
        crossSectionPrototype = Object.getPrototypeOf(square) as CrossSectionPrototype;
        square.delete();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function volumes(solids: Manifold3D.Manifold[]): number[] {
        const result = solids.map((solid) => solid.volume());
        solids.forEach((solid) => solid.delete());
        return result;
    }

    it("should build an extruded polygon as a solid of its area times its depth", () => {
        // Act
        const solids = manifold.recipes.build({ recipe: recipeOf(BOX, [root(1)]) });

        // Assert
        expect(volumes(solids)).toEqual([24]);
    });

    it("should build a mirrored root as a valid solid of the same volume, not turned inside out", () => {
        // Act
        const [solid] = manifold.recipes.build({ recipe: recipeOf(BOX, [root(1, [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])]) });
        const box = solid!.boundingBox();
        const volume = solid!.volume();
        const status = solid!.status();
        solid!.delete();

        // Assert
        expect(volume).toBeCloseTo(24, 9);
        expect(status).toBe("NoError");
        expect(box.min[0]).toBeCloseTo(-4, 9);
    });

    it("should place each root by its matrix", () => {
        // Act
        const [solid] = manifold.recipes.build({ recipe: recipeOf(BOX, [root(1, moved(10, 20, 30))]) });
        const box = solid!.boundingBox();
        solid!.delete();

        // Assert
        expect(box).toEqual({ min: [10, 20, 30], max: [14, 22, 33] });
    });

    it("should sweep along a slanted direction by the depth along it", () => {
        // Act
        const [solid] = manifold.recipes.build({ recipe: recipeOf([BOX[0]!, { op: "extrude", profile: 0, direction: [3, 0, 4], depth: 5 }], [root(1)]) });
        const box = solid!.boundingBox();
        const volume = solid!.volume();
        solid!.delete();

        // Assert
        expect(volume).toBeCloseTo(32, 9);
        expect(box.max[0]).toBeCloseTo(7, 9);
        expect(box.max[2]).toBeCloseTo(4, 9);
    });

    it("should build a clockwise outline as the same region as a counterclockwise one", () => {
        // Arrange
        const clockwise = [0, 0, 0, 2, 4, 2, 4, 0];

        // Act
        const solids = manifold.recipes.build({ recipe: recipeOf(BOX, [root(1)], clockwise) });

        // Assert
        expect(volumes(solids)).toEqual([24]);
    });

    it("should keep every loop of an outline that crosses itself", () => {
        // Arrange
        const bowTie = [0, 0, 2, 2, 2, 0, 0, 2];

        // Act
        const solids = manifold.recipes.build({ recipe: recipeOf(extrudedOnce({ op: "polygon", points: [0, 8], holes: [] }), [root(1)], bowTie) });

        // Assert
        expect(volumes(solids)[0]).toBeCloseTo(2, 9);
    });

    it("should leave a polygon's holes out of what it extrudes", () => {
        // Arrange
        const clockwiseHole = [1, 1, 1, 2, 2, 2, 2, 1];

        // Act
        const solids = manifold.recipes.build({ recipe: recipeOf(extrudedOnce({ op: "polygon", points: [0, 8], holes: [[8, 8]] }), [root(1)], [...FOUR_BY_FOUR, ...clockwiseHole]) });

        // Assert
        expect(volumes(solids)).toEqual([15]);
    });

    it("should cut a counterclockwise hole as well as a clockwise one", () => {
        // Arrange
        const counterClockwiseHole = [1, 1, 2, 1, 2, 2, 1, 2];

        // Act
        const solids = manifold.recipes.build({ recipe: recipeOf(extrudedOnce({ op: "polygon", points: [0, 8], holes: [[8, 8]] }), [root(1)], [...FOUR_BY_FOUR, ...counterClockwiseHole]) });

        // Assert
        expect(volumes(solids)).toEqual([15]);
    });

    it("should cut the overlap of two holes once, leaving no island where they cross", () => {
        // Arrange
        const wideHole = [1, 1, 3, 1, 3, 2, 1, 2];
        const tallHoleClockwise = [2, 1, 2, 3, 3, 3, 3, 1];
        const nodes = extrudedOnce({ op: "polygon", points: [0, 8], holes: [[8, 8], [16, 8]] });

        // Act
        const solids = manifold.recipes.build({ recipe: recipeOf(nodes, [root(1)], [...FOUR_BY_FOUR, ...wideHole, ...tallHoleClockwise]) });

        // Assert
        expect(volumes(solids)[0]).toBeCloseTo(13, 9);
    });

    it("should cut only the part of a hole that lies inside the boundary", () => {
        // Arrange
        const holeReachingOut = [3, 1, 5, 1, 5, 2, 3, 2];

        // Act
        const solids = manifold.recipes.build({ recipe: recipeOf(extrudedOnce({ op: "polygon", points: [0, 8], holes: [[8, 8]] }), [root(1)], [...FOUR_BY_FOUR, ...holeReachingOut]) });

        // Assert
        expect(volumes(solids)[0]).toBeCloseTo(15, 9);
    });

    it("should cut away the side of a half-space its normal points to", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [...BOX, { op: "halfSpace", origin: [0, 0, 1], normal: [0, 0, 1] }, { op: "difference", of: 1, tools: [2] }];

        // Act
        const solids = manifold.recipes.build({ recipe: recipeOf(nodes, [root(3)]) });

        // Assert
        expect(volumes(solids)[0]).toBeCloseTo(8, 9);
    });

    it("should subtract solid tools and cut openings out of a host", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            ...BOX,
            { op: "transform", of: 1, matrix: [0.25, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 1, -1, -1, 1] },
            { op: "difference", of: 1, tools: [2] },
            { op: "voids", host: 1, openings: [2] },
            { op: "voids", host: 1, openings: [] },
        ];

        // Act
        const solids = manifold.recipes.build({ recipe: recipeOf(nodes, [root(3), root(4), root(5)]) });

        // Assert
        expect(volumes(solids)).toEqual([18, 18, 24]);
    });

    it("should cut every tool of a difference in turn", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            ...BOX,
            { op: "halfSpace", origin: [0, 0, 2], normal: [0, 0, 1] },
            { op: "halfSpace", origin: [2, 0, 0], normal: [1, 0, 0] },
            { op: "difference", of: 1, tools: [2, 3] },
        ];

        // Act
        const solids = manifold.recipes.build({ recipe: recipeOf(nodes, [root(4)]) });

        // Assert
        expect(volumes(solids)[0]).toBeCloseTo(8, 9);
    });

    it("should release what a difference cut so far when a later tool fails", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            ...BOX,
            { op: "transform", of: 1, matrix: moved(1) },
            { op: "transform", of: 1, matrix: moved(2) },
            { op: "difference", of: 1, tools: [2, 3] },
        ];
        const original = manifoldPrototype.subtract;
        const cut: Manifold3D.Manifold[] = [];
        vi.spyOn(manifoldPrototype, "subtract").mockImplementation(function (this: Manifold3D.Manifold, other: Manifold3D.Manifold) {
            if (cut.length) {
                throw new Error("the kernel ran out of memory");
            }
            const result = original.call(this, other);
            cut.push(result);
            return result;
        });
        const released = vi.spyOn(manifoldPrototype, "delete");

        // Act
        const build = (): Manifold3D.Manifold[] => manifold.recipes.build({ recipe: recipeOf(nodes, [root(4)]) });

        // Assert
        expect(build).toThrow("the kernel ran out of memory");
        expect(released.mock.contexts).toContain(cut[0]);
    });

    it("should release the solids it already placed when the kernel fails on a later root", () => {
        // Arrange
        const original = manifoldPrototype.transform;
        const placed: Manifold3D.Manifold[] = [];
        const failingCall = 3;
        let calls = 0;
        vi.spyOn(manifoldPrototype, "transform").mockImplementation(function (this: Manifold3D.Manifold, matrix: Manifold3D.Mat4) {
            calls++;
            if (calls === failingCall) {
                throw new Error("the kernel ran out of memory");
            }
            const result = original.call(this, matrix);
            placed.push(result);
            return result;
        });
        const released = vi.spyOn(manifoldPrototype, "delete");

        // Act
        const build = (): Manifold3D.Manifold[] => manifold.recipes.build({ recipe: recipeOf(BOX, [root(1), root(1)]) });

        // Assert
        expect(build).toThrow("the kernel ran out of memory");
        expect(released.mock.contexts).toContain(placed[1]);
    });

    it("should build a compound of overlapping parts as the space they fill together, counting the overlap once", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [...BOX, { op: "transform", of: 1, matrix: moved(2) }, { op: "compound", of: [1, 2] }];

        // Act
        const solids = manifold.recipes.build({ recipe: recipeOf(nodes, [root(3)]) });

        // Assert
        expect(volumes(solids)).toEqual([36]);
    });

    it("should keep the apart parts of a compound as separate pieces of one solid", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [...BOX, { op: "transform", of: 1, matrix: moved(10) }, { op: "compound", of: [1, 2] }];

        // Act
        const [solid] = manifold.recipes.build({ recipe: recipeOf(nodes, [root(3)]) });
        const pieces = solid!.decompose();
        const volume = solid!.volume();
        pieces.forEach((piece) => piece.delete());
        solid!.delete();

        // Assert
        expect(pieces).toHaveLength(2);
        expect(volume).toBe(48);
    });

    it("should build a node several roots share once, not once for each root", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [...BOX, { op: "transform", of: 1, matrix: moved(2) }, { op: "difference", of: 1, tools: [2] }];
        const subtract = vi.spyOn(manifoldPrototype, "subtract");

        // Act
        const solids = manifold.recipes.build({ recipe: recipeOf(nodes, [root(3), root(3, moved(10)), root(3, moved(20))]) });

        // Assert
        expect(volumes(solids)).toEqual([12, 12, 12]);
        expect(subtract).toHaveBeenCalledTimes(1);
    });

    it("should build a circle with the number of sides asked for", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [{ op: "circle", center: [5, 5], radius: 1 }, { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 1 }];

        // Act
        const [solid] = manifold.recipes.build({ recipe: recipeOf(nodes, [root(1)]), circularSegments: 4 });
        const box = solid!.boundingBox();
        const volume = solid!.volume();
        solid!.delete();

        // Assert
        expect(volume).toBeCloseTo(2, 9);
        expect(box.min[0]).toBeCloseTo(4, 9);
        expect(box.max[1]).toBeCloseTo(6, 9);
    });

    it("should build a closed triangle mesh as a solid", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [{ op: "triangles", positions: [0, 12], indices: [0, 12] }];
        const tetrahedron = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1];

        // Act
        const solids = manifold.recipes.build({ recipe: recipeOf(nodes, [root(0)], tetrahedron, [0, 2, 1, 0, 1, 3, 1, 2, 3, 0, 3, 2]) });

        // Assert
        expect(volumes(solids)[0]).toBeCloseTo(1 / 6, 6);
    });

    it("should refuse a triangle mesh that is not closed, naming its node", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [{ op: "triangles", positions: [0, 9], indices: [0, 3] }];

        // Act & Assert
        expect(() => manifold.recipes.build({ recipe: recipeOf(nodes, [root(0)], [0, 0, 0, 1, 0, 0, 0, 1, 0], [0, 1, 2]) })).toThrow("Recipe node 0 is a triangle mesh that is not closed");
    });

    it("should give back an empty solid for a mesh that is not closed when asked, and still build the other roots", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [...BOX, { op: "triangles", positions: [8, 9], indices: [0, 3] }];
        const recipe = recipeOf(nodes, [root(1), root(2), root(1, moved(10))], [...SQUARE, 0, 0, 0, 1, 0, 0, 0, 1, 0], [0, 1, 2]);

        // Act
        const solids = manifold.recipes.build({ recipe, emptyWhenFailed: true });
        const empty = solids.map((solid) => solid.isEmpty());

        // Assert
        expect(empty).toEqual([false, true, false]);
        expect(volumes(solids)).toEqual([expect.closeTo(24, 9), 0, expect.closeTo(24, 9)]);
    });

    it("should leave every node built from a failed one unbuilt, so each root resting on it comes back empty", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            ...BOX,
            { op: "triangles", positions: [8, 9], indices: [0, 3] },
            { op: "transform", of: 2, matrix: moved(1) },
            { op: "difference", of: 1, tools: [2] },
            { op: "compound", of: [1, 3] },
            { op: "voids", host: 1, openings: [3] },
            { op: "transform", of: 1, matrix: moved(5) },
        ];
        const recipe = recipeOf(nodes, [root(4), root(5), root(6), root(7)], [...SQUARE, 0, 0, 0, 1, 0, 0, 0, 1, 0], [0, 1, 2]);
        const extrude = vi.spyOn(crossSectionPrototype, "extrude");

        // Act
        const solids = manifold.recipes.build({ recipe, emptyWhenFailed: true });

        // Assert
        expect(volumes(solids)).toEqual([0, 0, 0, expect.closeTo(24, 9)]);
        expect(extrude).toHaveBeenCalledTimes(1);
    });

    it("should still build what does not rest on a node that failed before it", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            { op: "triangles", positions: [8, 9], indices: [0, 3] },
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "extrude", profile: 1, direction: [0, 0, 1], depth: 3 },
            { op: "halfSpace", origin: [0, 0, 2], normal: [0, 0, 1] },
            { op: "difference", of: 2, tools: [3] },
        ];
        const recipe = recipeOf(nodes, [root(0), root(4)], [...SQUARE, 0, 0, 0, 1, 0, 0, 0, 1, 0], [0, 1, 2]);

        // Act
        const solids = manifold.recipes.build({ recipe, emptyWhenFailed: true });

        // Assert
        expect(volumes(solids)).toEqual([0, expect.closeTo(16, 9)]);
    });

    it("should give back an empty solid for a root whose placement the kernel reports broken when asked, releasing the broken one", () => {
        // Arrange
        const scaledPastWhatNumbersHold: Base.RecipeNode[] = Array.from({ length: 40 }, (_, at) => ({ op: "transform", of: at + 1, matrix: BILLIONFOLD }));
        const original = manifoldPrototype.transform;
        const placed: Manifold3D.Manifold[] = [];
        vi.spyOn(manifoldPrototype, "transform").mockImplementation(function (this: Manifold3D.Manifold, matrix: Manifold3D.Mat4) {
            const result = original.call(this, matrix);
            placed.push(result);
            return result;
        });
        const released = vi.spyOn(manifoldPrototype, "delete");

        // Act
        const solids = manifold.recipes.build({ recipe: recipeOf([...BOX, ...scaledPastWhatNumbersHold], [root(41), root(1)]), emptyWhenFailed: true });
        const transformsBeforeTheRoots = 1 + scaledPastWhatNumbersHold.length;

        // Assert
        expect(released.mock.contexts).toContain(placed[transformsBeforeTheRoots]);
        expect(volumes(solids)).toEqual([0, expect.closeTo(24, 9)]);
    });

    it("should still stop on the first root it cannot build when not asked to go on", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [...BOX, { op: "triangles", positions: [8, 9], indices: [0, 3] }];
        const recipe = recipeOf(nodes, [root(1), root(2)], [...SQUARE, 0, 0, 0, 1, 0, 0, 0, 1, 0], [0, 1, 2]);

        // Act & Assert
        expect(() => manifold.recipes.build({ recipe })).toThrow("Recipe node 2 is a triangle mesh that is not closed");
    });

    it("should turn the recipe's Z axis into Y by a rotation, not a mirror, when asked", () => {
        // Act
        const [solid] = manifold.recipes.build({ recipe: recipeOf(BOX, [root(1)]), adjustZtoY: true });
        const box = solid!.boundingBox();
        const volume = solid!.volume();
        solid!.delete();

        // Assert
        expect(box.min).toEqual([0, 0, -2]);
        expect(box.max).toEqual([4, 3, 0]);
        expect(volume).toBeCloseTo(24, 9);
    });

    it("should turn Z into Y after the root's own matrix has placed it", () => {
        // Act
        const [solid] = manifold.recipes.build({ recipe: recipeOf(BOX, [root(1, moved(10, 20, 30))]), adjustZtoY: true });
        const box = solid!.boundingBox();
        solid!.delete();

        // Assert
        expect(box).toEqual({ min: [10, 30, -22], max: [14, 33, -20] });
    });

    it("should turn Z into Y in the same transform that places a root, adding no kernel call", () => {
        // Arrange
        const transform = vi.spyOn(manifoldPrototype, "transform");
        volumes(manifold.recipes.build({ recipe: recipeOf(BOX, [root(1)]) }));
        const transformsUpright = transform.mock.calls.length;
        transform.mockClear();

        // Act
        volumes(manifold.recipes.build({ recipe: recipeOf(BOX, [root(1)]), adjustZtoY: true }));

        // Assert
        expect(transform).toHaveBeenCalledTimes(transformsUpright);
    });

    it("should refuse a root the kernel cannot build, naming its node and the kernel's status", () => {
        // Arrange
        const scaledPastWhatNumbersHold: Base.RecipeNode[] = Array.from({ length: 40 }, (_, at) => ({ op: "transform", of: at + 1, matrix: BILLIONFOLD }));

        // Act & Assert
        expect(() => manifold.recipes.build({ recipe: recipeOf([...BOX, ...scaledPastWhatNumbersHold], [root(41)]) })).toThrow("Recipe node 41, placed by root 0, could not be built: the kernel reports 'NonFiniteVertex'");
    });

    it("should turn a kernel failure that is not an error into one naming the node, with the kernel's value as its cause", () => {
        // Arrange
        vi.spyOn(crossSectionPrototype, "extrude").mockImplementation(() => {
            throw NATIVE_EXCEPTION;
        });

        // Act
        const build = (): Manifold3D.Manifold[] => manifold.recipes.build({ recipe: recipeOf(BOX, [root(1)]) });

        // Assert
        expect(build).toThrow(new Error("Recipe node 1 could not be built: the kernel stopped on an error it did not describe", { cause: NATIVE_EXCEPTION }));
    });

    it("should name the root when the kernel fails without an error while placing it", () => {
        // Arrange
        const original = manifoldPrototype.transform;
        vi.spyOn(manifoldPrototype, "transform").mockImplementation(function (this: Manifold3D.Manifold, matrix: Manifold3D.Mat4) {
            if (matrix[12] === 10) {
                throw NATIVE_EXCEPTION;
            }
            return original.call(this, matrix);
        });

        // Act
        const build = (): Manifold3D.Manifold[] => manifold.recipes.build({ recipe: recipeOf(BOX, [root(1), root(1, moved(10))]) });

        // Assert
        expect(build).toThrow("Recipe node 1, placed by root 1, could not be built: the kernel stopped on an error it did not describe");
    });

    it("should refuse a coordinate too large for the kernel before building anything", () => {
        // Act & Assert
        expect(() => manifold.recipes.build({ recipe: recipeOf(BOX, [root(1)], [0, 0, 3e10, 0, 3e10, 2, 0, 2]) })).toThrow(InputError);
    });

    it("should refuse a recipe that does not hold together before building anything", () => {
        // Act & Assert
        expect(() => manifold.recipes.build({ recipe: recipeOf([{ op: "extrude", profile: 5, direction: [0, 0, 1], depth: 1 }], [root(0)]) })).toThrow(InputError);
    });

    it("should refuse fewer than three sides for a circle", () => {
        // Act & Assert
        expect(() => manifold.recipes.build({ recipe: recipeOf(BOX, [root(1)]), circularSegments: 2 })).toThrow("A circle needs at least 3 sides, got 2");
    });

    it("should give nothing back for a recipe without roots", () => {
        // Act
        const solids = manifold.recipes.build({ recipe: recipeOf(BOX, []) });

        // Assert
        expect(solids).toEqual([]);
    });
});

describe("ManifoldRecipes.surfaceMeshes", () => {
    let manifold: ManifoldService;

    beforeAll(async () => {
        manifold = await getManifold();
    });

    const OPEN: Base.RecipeNode[] = [...BOX, { op: "triangles", positions: [8, 9], indices: [0, 3] }];
    const OPEN_NUMBERS = [...SQUARE, 0, 0, 0, 1, 0, 0, 0, 1, 0];

    it("should give the open mesh build leaves empty as the mesh it describes, placed and turned as build would", () => {
        // Arrange
        const recipe = recipeOf(OPEN, [root(1), root(2, moved(10))], OPEN_NUMBERS, [0, 1, 2]);

        // Act
        const [mesh] = manifold.recipes.surfaceMeshes({ recipe, roots: [1], adjustZtoY: true });

        // Assert
        expect(mesh!.numProp).toBe(3);
        expect(Array.from(mesh!.vertProperties)).toEqual([10, 0, 0, 11, 0, 0, 10, 0, -1]);
        expect(Array.from(mesh!.triVerts)).toEqual([0, 1, 2]);
    });

    it("should give an empty mesh for a root built from something other than triangles, and read every root when none are named", () => {
        // Arrange
        const recipe = recipeOf(OPEN, [root(1), root(2)], OPEN_NUMBERS, [0, 1, 2]);

        // Act
        const meshes = manifold.recipes.surfaceMeshes({ recipe });

        // Assert
        expect(meshes.map((mesh) => [mesh.vertProperties.length, mesh.triVerts.length])).toEqual([[0, 0], [9, 3]]);
    });

    it("should refuse a recipe that does not hold together", () => {
        // Act & Assert
        expect(() => manifold.recipes.surfaceMeshes({ recipe: recipeOf([{ op: "extrude", profile: 5, direction: [0, 0, 1], depth: 1 }], [root(0)]) })).toThrow(InputError);
    });
});
