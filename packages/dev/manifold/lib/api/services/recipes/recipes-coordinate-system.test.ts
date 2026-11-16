import type * as Manifold3D from "manifold-3d";
import type { Base } from "@bitbybit-dev/base";
import { BaseBitByBit, Inputs as BaseInputs } from "@bitbybit-dev/base";
import { isRigidMatrix } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { getManifold } from "../../__test__/kernel";
import type * as Inputs from "../../inputs";
import type { ManifoldService } from "../../manifold-service";
import { ManifoldRecipes } from "./recipes";

const { leftHanded, rightHanded } = BaseInputs.Base.coordinateSystemEnum;

type System = BaseInputs.Base.coordinateSystemEnum | undefined;
type Bounds = number[][];

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const SQUARE = [0, 0, 2, 0, 2, 1, 0, 1];
const TRIANGLE = [0, 0, 0, 1, 0, 0, 0, 1, 0];
const BOX: Base.RecipeNode[] = [
    { op: "polygon", points: [0, 8], holes: [] },
    { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 3 },
];
const BOX_VOLUME = 6;

const AS_THE_RECIPE_SAYS: Bounds = [[10, 20, 30], [12, 21, 33]];
const TURNED_TO_Y_UP: Bounds = [[10, 30, -21], [12, 33, -20]];
const Y_AND_Z_SWAPPED: Bounds = [[10, 30, 20], [12, 33, 21]];
const X_MIRRORED: Bounds = [[-12, 20, 30], [-10, 21, 33]];

const CASES: [string, System, boolean, Bounds][] = [
    ["as the recipe says with no coordinate system, as it always has", undefined, false, AS_THE_RECIPE_SAYS],
    ["turned to y up with no coordinate system, as it always has", undefined, true, TURNED_TO_Y_UP],
    ["as the recipe says in a right-handed system", rightHanded, false, AS_THE_RECIPE_SAYS],
    ["turned to y up in a right-handed system", rightHanded, true, TURNED_TO_Y_UP],
    ["with its x mirrored in a left-handed system", leftHanded, false, X_MIRRORED],
    ["with y and z swapped in a left-handed system when its z is up", leftHanded, true, Y_AND_Z_SWAPPED],
];

function moved(x: number, y = 0, z = 0): Base.TransformMatrix {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
}

function recipeOf(nodes: Base.RecipeNode[], roots: Base.RecipeRoot[], f64: number[] = SQUARE, i32: number[] = []): Base.Recipe {
    return { format: "bitbybit.recipe", version: 1, millimetresPerUnit: 1, tolerance: 1e-6, buffers: { f64: new Float64Array(f64), i32: new Int32Array(i32) }, nodes, roots, groups: [] };
}

function rootOf(node: number, matrix: Base.TransformMatrix = IDENTITY): Base.RecipeRoot {
    return { node, matrix, tag: {} };
}

const rounded = (value: number): number => Math.round(value * 1e6) / 1e6 + 0;

function placedPointsOf(mesh: Inputs.Manifold.DecomposedManifoldMeshDto, matrix: Base.TransformMatrix): Base.Point3[] {
    return Array.from({ length: mesh.vertProperties.length / mesh.numProp }, (_point, at): Base.Point3 => {
        const [x, y, z] = [mesh.vertProperties[at * mesh.numProp]!, mesh.vertProperties[at * mesh.numProp + 1]!, mesh.vertProperties[at * mesh.numProp + 2]!];
        return [0, 1, 2].map((axis) => matrix[axis]! * x + matrix[4 + axis]! * y + matrix[8 + axis]! * z + matrix[12 + axis]!) as Base.Point3;
    });
}

function boundsOfPoints(points: Base.Point3[]): Bounds {
    return [Math.min, Math.max].map((pick) => [0, 1, 2].map((axis) => rounded(pick(...points.map((point) => point[axis]!)))));
}

const LIFTED_TRIANGLE: Base.Point3[] = [[10, 20, 30], [11, 20, 30], [10, 21, 30]];

function liftedTriangle(): Base.Recipe {
    return recipeOf([{ op: "triangles", positions: [0, 9], indices: [0, 3] }], [rootOf(0, moved(10, 20, 30))], TRIANGLE, [0, 1, 2]);
}

function placedBySystem(system: System, adjustZtoY: boolean): Bounds {
    return boundsOfPoints(LIFTED_TRIANGLE.map(([x, y, z]): Base.Point3 => {
        if (system === leftHanded) {
            return adjustZtoY ? [x, z, y] : [0 - x, y, z];
        }
        return adjustZtoY ? [x, z, 0 - y] : [x, y, z];
    }));
}

function boundsOfSolid(solid: Manifold3D.Manifold): Bounds {
    const box = solid.boundingBox();
    return [[...box.min].map(rounded), [...box.max].map(rounded)];
}

describe("Manifold recipes in a coordinate system", () => {
    let manifold: ManifoldService;
    const base = new BaseBitByBit();

    beforeAll(async () => {
        manifold = await getManifold();
    });

    afterEach(() => {
        manifold.settings = {};
    });

    const inSystem = (system: System): void => {
        manifold.settings = system === undefined ? {} : { coordinateSystem: system };
    };
    const volumeOfMesh = (mesh: Inputs.Manifold.DecomposedManifoldMeshDto, matrix: Base.TransformMatrix): number => {
        const points = placedPointsOf(mesh, matrix);
        const triangles = Array.from({ length: mesh.triVerts.length / 3 }, (_triangle, at): Base.Triangle3 => [points[mesh.triVerts[at * 3]!]!, points[mesh.triVerts[at * 3 + 1]!]!, points[mesh.triVerts[at * 3 + 2]!]!]);
        return rounded(base.mesh.signedVolume({ mesh: triangles }));
    };
    const liftedBox = (): Base.Recipe => recipeOf(BOX, [rootOf(1, moved(10, 20, 30))]);

    describe.each(CASES)("a root placed %s", (_name, system, adjustZtoY, bounds) => {
        it("should build its solid there, valid and of its own volume", () => {
            // Arrange
            inSystem(system);

            // Act
            const [solid] = manifold.recipes.build({ recipe: liftedBox(), adjustZtoY });

            // Assert
            try {
                const box = solid!.boundingBox();
                expect([[...box.min].map(rounded), [...box.max].map(rounded)]).toEqual(bounds);
                expect([solid!.status(), rounded(solid!.volume())]).toEqual(["NoError", BOX_VOLUME]);
            } finally {
                solid!.delete();
            }
        });

        it("should give its mesh and placement there, the mesh facing outward", () => {
            // Arrange
            inSystem(system);

            // Act
            const { meshes, placements } = manifold.recipes.meshes({ recipe: liftedBox(), adjustZtoY });

            // Assert
            const mesh = meshes[placements[0]!.mesh]!;
            expect(boundsOfPoints(placedPointsOf(mesh, placements[0]!.matrix))).toEqual(bounds);
            expect(volumeOfMesh(mesh, placements[0]!.matrix)).toBe(BOX_VOLUME);
        });

        it("should place the surface of a root that is no solid there, from its own mesh and from the surface call alike", () => {
            // Arrange
            inSystem(system);
            const recipe = liftedTriangle();
            const asPlaced = placedBySystem(system, adjustZtoY);

            // Act
            const { meshes, placements } = manifold.recipes.meshes({ recipe, adjustZtoY, emptyWhenFailed: true });
            const [surface] = manifold.recipes.surfaceMeshes({ recipe, roots: [0], adjustZtoY });

            // Assert
            expect(boundsOfPoints(placedPointsOf(meshes[placements[0]!.mesh]!, placements[0]!.matrix))).toEqual(asPlaced);
            expect(boundsOfPoints(placedPointsOf(surface!, IDENTITY))).toEqual(asPlaced);
        });
    });

    it.each([
        ["with its x mirrored", false],
        ["with y and z swapped", true],
    ])("should keep roots that only turn and move sharing one mesh and placed by turns and moves in a left-handed system %s, so they still draw as instances", (_name, adjustZtoY) => {
        // Arrange
        inSystem(leftHanded);
        const quarterTurnAboutZ: Base.TransformMatrix = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 5, 6, 7, 1];
        const recipe = recipeOf(BOX, [rootOf(1), rootOf(1, moved(10, 20, 30)), rootOf(1, quarterTurnAboutZ)]);

        // Act
        const { meshes, placements } = manifold.recipes.meshes({ recipe, adjustZtoY });

        // Assert
        expect(meshes).toHaveLength(1);
        expect(placements.map((placement) => [placement.mesh, isRigidMatrix(placement.matrix)])).toEqual([[0, true], [0, true], [0, true]]);
        expect(placements.map((placement) => volumeOfMesh(meshes[0]!, placement.matrix))).toEqual([BOX_VOLUME, BOX_VOLUME, BOX_VOLUME]);
        expect(placements[0]!.matrix).toEqual(IDENTITY);
    });

    it.each([
        ["with its x mirrored", false],
        ["with y and z swapped", true],
    ])("should place each instance of a turned and moved root in a left-handed system %s where its solid is built", (_name, adjustZtoY) => {
        // Arrange
        inSystem(leftHanded);
        const quarterTurnAboutZ: Base.TransformMatrix = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 5, 6, 7, 1];
        const halfTurnAboutX: Base.TransformMatrix = [1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 0, -4, 3, 9, 1];
        const recipe = recipeOf(BOX, [rootOf(1, moved(10, 20, 30)), rootOf(1, quarterTurnAboutZ), rootOf(1, halfTurnAboutX)]);
        const solids = manifold.recipes.build({ recipe, adjustZtoY });
        const built = solids.map(boundsOfSolid);
        solids.forEach((solid) => solid.delete());

        // Act
        const { meshes, placements } = manifold.recipes.meshes({ recipe, adjustZtoY });

        // Assert
        expect(placements.map((placement) => boundsOfPoints(placedPointsOf(meshes[placement.mesh]!, placement.matrix)))).toEqual(built);
    });

    it.each([
        ["left-handed", leftHanded, false],
        ["left-handed, z up", leftHanded, true],
        ["right-handed, z up", rightHanded, true],
        ["right-handed", rightHanded, false],
    ])("should place the surface of a root that is no solid by its own %s system, whatever the base recipes it was given work by", (_name, system, adjustZtoY) => {
        // Arrange
        const otherBase = new BaseBitByBit();
        otherBase.settings = { coordinateSystem: system === leftHanded ? rightHanded : leftHanded };
        const recipes = new ManifoldRecipes(Reflect.get(manifold, "wasm") as Manifold3D.ManifoldToplevel, otherBase.recipes, () => ({ coordinateSystem: system }));

        // Act
        const { meshes, placements } = recipes.meshes({ recipe: liftedTriangle(), adjustZtoY, emptyWhenFailed: true });

        // Assert
        expect(boundsOfPoints(placedPointsOf(meshes[placements[0]!.mesh]!, placements[0]!.matrix))).toEqual(placedBySystem(system, adjustZtoY));
    });

    it("should build a root as the recipe says when the recipes were made without settings", () => {
        // Arrange
        const recipes = new ManifoldRecipes(Reflect.get(manifold, "wasm") as Manifold3D.ManifoldToplevel, new BaseBitByBit().recipes);

        // Act
        const solids = recipes.build({ recipe: liftedBox(), adjustZtoY: false });

        // Assert
        try {
            expect(solids.map(boundsOfSolid)).toEqual([AS_THE_RECIPE_SAYS]);
        } finally {
            solids.forEach((solid) => solid.delete());
        }
    });

    it("should refuse a name that is no setting and keep the settings it had", () => {
        // Arrange
        manifold.settings = { coordinateSystem: rightHanded };

        // Act & Assert
        expect(() => { manifold.settings = JSON.parse("{\"handedness\":\"right\"}"); }).toThrow("`handedness` is not a setting");
        expect(manifold.settings).toEqual({ coordinateSystem: "rightHanded" });
    });
});
