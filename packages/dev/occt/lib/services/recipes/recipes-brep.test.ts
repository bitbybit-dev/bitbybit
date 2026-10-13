import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type { Base } from "@bitbybit-dev/base";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTAssemblyManager } from "../assembly/manager";
import { OCCTRecipes } from "./recipes";

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const SQUARE = [0, 0, 4, 0, 4, 2, 0, 2];
const SEAM = [1, 0, 0, 1, 0, 2];
const BOX_VOLUME = 4 * 2 * 3;
const STEPS_WITHOUT_BREPS = ["polygon", "circle", "extrude", "halfSpace", "difference", "transform", "voids", "triangles", "compound", "union", "intersection", "revolve", "loft"];

const placement = (z: number): Base.RecipeBrepPlacement => ({ origin: [0, 0, z], axis: [0, 0, 1], xDirection: [1, 0, 0] });

function cylinder(fallback?: number): Base.RecipeBrepNode {
    return {
        op: "brep",
        vertices: [SQUARE.length, SEAM.length],
        curves: [
            { kind: "circle", ...placement(0), radius: 1 },
            { kind: "circle", ...placement(2), radius: 1 },
            { kind: "line", origin: [1, 0, 0], direction: [0, 0, 1] },
        ],
        surfaces: [{ kind: "cylinder", ...placement(0), radius: 1 }, { kind: "plane", ...placement(0) }, { kind: "plane", ...placement(2) }],
        edges: [{ curve: 0, start: 0, end: 0 }, { curve: 1, start: 1, end: 1 }, { curve: 2, start: 0, end: 1 }],
        faces: [
            { surface: 0, sameSense: true, bounds: [{ outer: true, edges: [0, 2, 1, 2], forward: [true, true, false, false] }] },
            { surface: 1, sameSense: false, bounds: [{ outer: true, edges: [0], forward: [false] }] },
            { surface: 2, sameSense: true, bounds: [{ outer: true, edges: [1], forward: [true] }] },
        ],
        closed: true,
        ...(fallback === undefined ? {} : { fallback }),
    };
}

function recipeOf(nodes: Base.RecipeNode[], roots: number[]): Base.Recipe {
    return {
        format: "bitbybit.recipe", version: 1, millimetresPerUnit: 1, tolerance: 1e-7,
        buffers: { f64: new Float64Array([...SQUARE, ...SEAM]), i32: new Int32Array() },
        nodes,
        roots: roots.map((node) => ({ node, matrix: IDENTITY, tag: {} })),
    };
}

const BOX: Base.RecipeNode[] = [
    { op: "polygon", points: [0, SQUARE.length], holes: [] },
    { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 3 },
];

describe("OCCTRecipes and the brep node on a kernel that does not build exact breps", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    const shapes: TopoDS_Shape[] = [];

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt);
    });

    afterEach(() => {
        shapes.splice(0).forEach((shape) => shape.delete());
    });

    function recipesOn(kernel: BitbybitOcctModule): OCCTRecipes {
        return new OCCTRecipes(kernel, occHelper, new OCCTAssemblyManager(kernel, occHelper));
    }

    function kernelListing(steps: string[] | undefined): BitbybitOcctModule {
        return Object.create(occt, { RecipeSteps: { value: steps === undefined ? undefined : (): string => JSON.stringify(steps) } }) as BitbybitOcctModule;
    }

    it("should build the fallback of a brep node in its place on a kernel that names no exact breps among its steps", () => {
        // Arrange
        const recipes = recipesOn(kernelListing(STEPS_WITHOUT_BREPS));

        // Act
        const built = recipes.build({ recipe: recipeOf([...BOX, cylinder(1)], [2]) });
        shapes.push(...built);

        // Assert
        expect(occHelper.solidsService.getSolidVolume({ shape: built[0]! })).toBeCloseTo(BOX_VOLUME, 9);
    });

    it("should build the fallback on a kernel too old to list its steps", () => {
        // Arrange
        const recipes = recipesOn(kernelListing(undefined));

        // Act
        const built = recipes.build({ recipe: recipeOf([...BOX, cylinder(1)], [2]) });
        shapes.push(...built);

        // Assert
        expect(occHelper.solidsService.getSolidVolume({ shape: built[0]! })).toBeCloseTo(BOX_VOLUME, 9);
    });

    it("should hand the kernel a brep node without a fallback as it is, swapping only the ones that have one", () => {
        // Arrange
        const sent: string[] = [];
        const listing = kernelListing(STEPS_WITHOUT_BREPS);
        const recording = Object.create(listing, {
            BuildRecipes: { value: (text: string, ...rest: unknown[]): unknown => {
                sent.push(text);
                return (occt.BuildRecipes as (...args: unknown[]) => unknown)(text, ...rest);
            } },
        }) as BitbybitOcctModule;
        const recipes = recipesOn(recording);

        // Act
        const built = recipes.build({ recipe: recipeOf([...BOX, cylinder(), cylinder(1)], [2, 3]), emptyWhenFailed: true });
        shapes.push(...built);

        // Assert
        const nodes = (JSON.parse(sent[0]!) as { nodes: { op: string; of?: number[] }[] }).nodes;
        expect(nodes.map((node) => node.op)).toEqual(["polygon", "extrude", "brep", "compound"]);
        expect(nodes[3]!.of).toEqual([1]);
    });
});

describe("OCCTRecipes and the brep node on a kernel that builds exact breps", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let recipes: OCCTRecipes;
    const shapes: TopoDS_Shape[] = [];

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt);
        recipes = new OCCTRecipes(occt, occHelper, new OCCTAssemblyManager(occt, occHelper));
    });

    afterEach(() => {
        shapes.splice(0).forEach((shape) => shape.delete());
    });

    it("should build a closed cylinder of circles, a seam, a cylindrical side and two caps as an exact solid", () => {
        // Act
        const built = recipes.build({ recipe: recipeOf([...BOX, cylinder(1)], [2]) });
        shapes.push(...built);

        // Assert
        expect(occt.RecipeSteps()).toContain("\"brep\"");
        const faces = occHelper.shapeGettersService.getFaces({ shape: built[0]! });
        expect(faces).toHaveLength(3);
        faces.forEach((face) => face.delete());
        expect(occHelper.solidsService.getSolidVolume({ shape: built[0]! })).toBeCloseTo(Math.PI * 2, 6);
    });

    it("should build the fallback of a brep whose cap does not lie on its plane, without failing the root", () => {
        // Arrange
        const broken = cylinder(1);
        broken.surfaces[2] = { kind: "plane", ...placement(3) };

        // Act
        const built = recipes.build({ recipe: recipeOf([...BOX, broken], [2]) });
        shapes.push(...built);

        // Assert
        expect(occHelper.solidsService.getSolidVolume({ shape: built[0]! })).toBeCloseTo(BOX_VOLUME, 9);
    });
});
