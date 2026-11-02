import type { Base } from "@bitbybit-dev/base";
import type * as Manifold3D from "manifold-3d";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { getManifold } from "../../__test__/kernel";
import type { ManifoldService } from "../../manifold-service";
import type { ManifoldPrototype } from "../../__test__/test-types";

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const TOLERANCE = 0.01;
const NOISE = 1e-11;
const GAP = TOLERANCE / 10;
const LENGTH = 1000;
const THICKNESS = 200;
const HEIGHT = 1000;
const HALF = THICKNESS / 2;
const WINDOW_WIDTH = 200;
const WINDOW_HEIGHT = 300;
const WINDOW_AREA = WINDOW_WIDTH * WINDOW_HEIGHT;
const NOISY_WALL = [0, -HALF - NOISE, LENGTH, -HALF - NOISE, LENGTH, HALF + NOISE, 0, HALF + NOISE];
const CLEAN_WALL = [0, -HALF, LENGTH, -HALF, LENGTH, HALF, 0, HALF];
const WINDOW = [0, 0, WINDOW_WIDTH, 0, WINDOW_WIDTH, WINDOW_HEIGHT, 0, WINDOW_HEIGHT];
const NOISY_HOST_VOLUME = LENGTH * (THICKNESS + 2 * NOISE) * HEIGHT;
const CLEAN_HOST_VOLUME = LENGTH * THICKNESS * HEIGHT;
const BOX_AREA = 2 * (LENGTH * THICKNESS + LENGTH * HEIGHT + THICKNESS * HEIGHT);
const ROUNDING_SCALE: Base.TransformMatrix = [0.9999999999999997, 0, 0, 0, 0, 0.9999999999999997, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function acrossTheWallAt(x: number, y: number, z = 400): Base.TransformMatrix {
    return [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, x, y, z, 1];
}

function recipeOf(nodes: Base.RecipeNode[], roots: number[], f64: number[], tolerance = TOLERANCE, millimetresPerUnit = 1, i32: number[] = []): Base.Recipe {
    return {
        format: "bitbybit.recipe",
        version: 1,
        millimetresPerUnit,
        tolerance,
        buffers: { f64: new Float64Array(f64), i32: new Int32Array(i32) },
        nodes,
        roots: roots.map((node) => ({ node, matrix: IDENTITY, tag: {} })),
    };
}

const BOX_FACES = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7];

function boxCorners(min: number[], max: number[]): number[][] {
    const corner = (x: number, y: number, z: number): number[] => [x ? max[0]! : min[0]!, y ? max[1]! : min[1]!, z ? max[2]! : min[2]!];
    return [corner(0, 0, 0), corner(1, 0, 0), corner(1, 1, 0), corner(0, 1, 0), corner(0, 0, 1), corner(1, 0, 1), corner(1, 1, 1), corner(0, 1, 1)];
}

function boxMesh(min: number[], max: number[]): { positions: number[]; indices: number[] } {
    return { positions: boxCorners(min, max).flat(), indices: BOX_FACES };
}

const WALL_AND_WINDOW: Base.RecipeNode[] = [
    { op: "polygon", points: [0, 8], holes: [] },
    { op: "extrude", profile: 0, direction: [0, 0, 1], depth: HEIGHT },
    { op: "polygon", points: [8, 8], holes: [] },
    { op: "extrude", profile: 2, direction: [0, 0, 1], depth: THICKNESS },
];

describe("ManifoldRecipes.build and cuts that end within the recipe's tolerance of a face of what they cut", () => {
    let manifold: ManifoldService;
    let manifoldPrototype: ManifoldPrototype;

    beforeAll(async () => {
        manifold = await getManifold();
        const [probe] = manifold.recipes.build({ recipe: recipeOf(WALL_AND_WINDOW.slice(0, 2), [1], CLEAN_WALL) });
        manifoldPrototype = Object.getPrototypeOf(probe) as ManifoldPrototype;
        probe!.delete();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function built(recipe: Base.Recipe, emptyWhenFailed = false): { genus: number; area: number; volume: number }[] {
        const solids: Manifold3D.Manifold[] = manifold.recipes.build({ recipe, emptyWhenFailed });
        return solids.map((solid) => {
            const result = { genus: solid.genus(), area: solid.surfaceArea(), volume: solid.volume() };
            solid.delete();
            return result;
        });
    }

    it("should cut an opening as deep as its wall right through it when placement rounding leaves it short of both faces, as Revit exports them", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            ...WALL_AND_WINDOW,
            { op: "transform", of: 3, matrix: acrossTheWallAt(300, HALF) },
            { op: "transform", of: 4, matrix: ROUNDING_SCALE },
            { op: "voids", host: 1, openings: [5] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...NOISY_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(NOISY_HOST_VOLUME - WINDOW_AREA * (THICKNESS + 2 * NOISE), 0);
        expect(wall?.area).toBeCloseTo(BOX_AREA - 2 * WINDOW_AREA + 2 * (WINDOW_WIDTH + WINDOW_HEIGHT) * THICKNESS, 0);
    });

    it("should cut an opening through a face it stops just short of when it is flush with the other", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            WALL_AND_WINDOW[0]!,
            WALL_AND_WINDOW[1]!,
            WALL_AND_WINDOW[2]!,
            { op: "extrude", profile: 2, direction: [0, 0, 1], depth: THICKNESS - GAP },
            { op: "transform", of: 3, matrix: acrossTheWallAt(300, HALF) },
            { op: "voids", host: 1, openings: [4] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [5], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - WINDOW_AREA * THICKNESS, 0);
    });

    it("should keep cutting an opening exactly as deep as its wall right through it", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            ...WALL_AND_WINDOW,
            { op: "transform", of: 3, matrix: acrossTheWallAt(300, HALF) },
            { op: "voids", host: 1, openings: [4] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [5], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - WINDOW_AREA * THICKNESS, 0);
    });

    it("should cut overlapping openings that each stop just short of both faces as one hole", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            ...WALL_AND_WINDOW,
            { op: "transform", of: 3, matrix: acrossTheWallAt(300, HALF) },
            { op: "transform", of: 4, matrix: ROUNDING_SCALE },
            { op: "transform", of: 3, matrix: acrossTheWallAt(400, HALF) },
            { op: "transform", of: 6, matrix: ROUNDING_SCALE },
            { op: "voids", host: 1, openings: [5, 7] },
        ];
        const joinedWidth = 300;

        // Act
        const [wall] = built(recipeOf(nodes, [8], [...NOISY_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(NOISY_HOST_VOLUME - joinedWidth * WINDOW_HEIGHT * (THICKNESS + 2 * NOISE), 0);
    });

    it("should cut every part of an opening made of several items right through, when each stops just short of both faces, wherever the opening is placed", () => {
        // Arrange
        const away = 1000;
        const nodes: Base.RecipeNode[] = [
            WALL_AND_WINDOW[0]!,
            WALL_AND_WINDOW[1]!,
            WALL_AND_WINDOW[2]!,
            { op: "extrude", profile: 2, direction: [0, 0, 1], depth: THICKNESS - 2 * GAP },
            { op: "transform", of: 3, matrix: acrossTheWallAt(100, HALF - GAP - away) },
            { op: "transform", of: 3, matrix: acrossTheWallAt(600, HALF - GAP - away) },
            { op: "compound", of: [4, 5] },
            { op: "transform", of: 6, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, away, 0, 1] },
            { op: "voids", host: 1, openings: [7] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [8], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(2);
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - 2 * WINDOW_AREA * THICKNESS, 0);
    });

    it("should extend only the side of a several-part opening that falls short, leaving every other face of its parts where it is drawn", () => {
        // Arrange
        const depth = THICKNESS - GAP;
        const nodes: Base.RecipeNode[] = [
            WALL_AND_WINDOW[0]!,
            WALL_AND_WINDOW[1]!,
            WALL_AND_WINDOW[2]!,
            { op: "extrude", profile: 2, direction: [0, 0, 1], depth },
            { op: "transform", of: 3, matrix: acrossTheWallAt(100, HALF) },
            { op: "transform", of: 3, matrix: acrossTheWallAt(600, HALF + depth) },
            { op: "compound", of: [4, 5] },
            { op: "voids", host: 1, openings: [6] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [7], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - WINDOW_AREA * THICKNESS, 0);
    });

    it("should reach each part of an opening through the face it falls short of, though another part runs past that face", () => {
        // Arrange
        const past = 100;
        const nodes: Base.RecipeNode[] = [
            ...WALL_AND_WINDOW,
            { op: "transform", of: 3, matrix: acrossTheWallAt(100, HALF - GAP) },
            { op: "transform", of: 3, matrix: acrossTheWallAt(600, HALF + past) },
            { op: "compound", of: [4, 5] },
            { op: "voids", host: 1, openings: [6] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [7], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(1);
    });

    it("should extend an opening's sill down to the wall's bottom and leave the step in its outline where it is drawn", () => {
        // Arrange
        const stepped = [0, 0, WINDOW_WIDTH, 0, WINDOW_WIDTH, WINDOW_HEIGHT, WINDOW_WIDTH / 2, WINDOW_HEIGHT, WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 0, WINDOW_HEIGHT / 2];
        const steppedArea = WINDOW_WIDTH * WINDOW_HEIGHT / 2 + (WINDOW_WIDTH / 2) * (WINDOW_HEIGHT / 2);
        const nodes: Base.RecipeNode[] = [
            WALL_AND_WINDOW[0]!,
            WALL_AND_WINDOW[1]!,
            { op: "polygon", points: [8, 12], holes: [] },
            { op: "extrude", profile: 2, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 3, matrix: acrossTheWallAt(300, HALF, GAP) },
            { op: "voids", host: 1, openings: [4] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [5], [...CLEAN_WALL, ...stepped]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - (steppedArea + WINDOW_WIDTH * GAP) * THICKNESS, 0);
    });

    it("should open a niche that stops just short of the front face, and leave its depth and outline as drawn", () => {
        // Arrange
        const nicheDepth = 150;
        const nodes: Base.RecipeNode[] = [
            WALL_AND_WINDOW[0]!,
            WALL_AND_WINDOW[1]!,
            WALL_AND_WINDOW[2]!,
            { op: "extrude", profile: 2, direction: [0, 0, 1], depth: nicheDepth },
            { op: "transform", of: 3, matrix: acrossTheWallAt(300, HALF - GAP) },
            { op: "voids", host: 1, openings: [4] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [5], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(CLEAN_HOST_VOLUME - wall!.volume).toBeCloseTo(WINDOW_AREA * (nicheDepth + GAP), 0);
    });

    it("should leave an opening inside the wall's outline as drawn, so the thin strips beside it keep their volume", () => {
        // Arrange
        const strip = 2 * TOLERANCE;
        const nodes: Base.RecipeNode[] = [
            ...WALL_AND_WINDOW,
            { op: "transform", of: 3, matrix: acrossTheWallAt(LENGTH - WINDOW_WIDTH - strip, HALF, strip) },
            { op: "voids", host: 1, openings: [4] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [5], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - WINDOW_AREA * THICKNESS, 0);
    });

    it("should cut an opening whose sill sits just above the wall's bottom face as a notch, leaving no sliver under it", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            ...WALL_AND_WINDOW,
            { op: "transform", of: 3, matrix: acrossTheWallAt(300, HALF, GAP) },
            { op: "voids", host: 1, openings: [4] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [5], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - WINDOW_WIDTH * (WINDOW_HEIGHT + GAP) * THICKNESS, 0);
    });

    it("should cut an opening whose side sits just inside the wall's end as a notch, leaving no sliver beside it", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            ...WALL_AND_WINDOW,
            { op: "transform", of: 3, matrix: acrossTheWallAt(LENGTH - WINDOW_WIDTH - GAP, HALF) },
            { op: "voids", host: 1, openings: [4] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [5], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - (WINDOW_WIDTH + GAP) * WINDOW_HEIGHT * THICKNESS, 0);
    });

    it("should measure the tolerance in the cut's own units when the opening is drawn in other units and scaled into them", () => {
        // Arrange
        const metreTolerance = 1e-5;
        const millimetres = 0.001;
        const metreWall = [0, -0.1, 1, -0.1, 1, 0.1, 0, 0.1];
        const metreWallWithAWindowShortBy = (gapInMillimetres: number): Base.Recipe => recipeOf([
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 1 },
            { op: "polygon", points: [8, 8], holes: [] },
            { op: "extrude", profile: 2, direction: [0, 0, 1], depth: THICKNESS - 2 * gapInMillimetres },
            { op: "transform", of: 3, matrix: [millimetres, 0, 0, 0, 0, 0, millimetres, 0, 0, -millimetres, 0, 0, 0.3, (HALF - gapInMillimetres) * millimetres, 0.4, 1] },
            { op: "voids", host: 1, openings: [4] },
        ], [5], [...metreWall, ...WINDOW], metreTolerance, 1000);
        const halfTheTolerance = 0.005;
        const threeTimesTheTolerance = 0.03;

        // Act
        const [withinTolerance] = built(metreWallWithAWindowShortBy(halfTheTolerance));
        const [beyondTolerance] = built(metreWallWithAWindowShortBy(threeTimesTheTolerance));

        // Assert
        expect(withinTolerance?.genus).toBe(1);
        expect(beyondTolerance?.genus).toBe(-1);
    });

    it("should reach through a face whatever transforms place the opening, a scale along one axis above a turn included", () => {
        // Arrange
        const gap = 0.75 * TOLERANCE;
        const halved = 0.5;
        const nodes: Base.RecipeNode[] = [
            WALL_AND_WINDOW[0]!,
            WALL_AND_WINDOW[1]!,
            WALL_AND_WINDOW[2]!,
            { op: "extrude", profile: 2, direction: [0, 0, 1], depth: (THICKNESS - 2 * gap) / halved },
            { op: "transform", of: 3, matrix: acrossTheWallAt(0, 0, 0) },
            { op: "transform", of: 4, matrix: [1, 0, 0, 0, 0, halved, 0, 0, 0, 0, 1, 0, 300, HALF - gap, 400, 1] },
            { op: "voids", host: 1, openings: [5] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(1);
    });

    it("should cut a slanted opening as deep as its slab through it, as wide as it is drawn", () => {
        // Arrange
        const slab = [0, -50, 2000, -50, 2000, 50, 0, 50];
        const slot = [0, -200, 1, -200, 1, 200, 0, 200];
        const run = 10;
        const slabThickness = 100;
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: slabThickness },
            { op: "polygon", points: [8, 8], holes: [] },
            { op: "extrude", profile: 2, direction: [run, 0, 1], depth: slabThickness * Math.hypot(run, 1) },
            { op: "transform", of: 3, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 989, 0, 0, 1] },
            { op: "voids", host: 1, openings: [4] },
        ];

        // Act
        const [cut] = built(recipeOf(nodes, [5], [...slab, ...slot]));

        // Assert
        expect(cut?.volume).toBeCloseTo(2000 * 100 * slabThickness - 1 * 100 * slabThickness, 0);
    });

    it("should cut a difference's solid tool through a face it stops just short of, measured on what is left after the tools before it, and its half-spaces as before", () => {
        // Arrange
        const trimmedHeight = 900;
        const nodes: Base.RecipeNode[] = [
            ...WALL_AND_WINDOW,
            { op: "transform", of: 3, matrix: acrossTheWallAt(300, HALF, trimmedHeight - WINDOW_HEIGHT - GAP) },
            { op: "halfSpace", origin: [0, 0, trimmedHeight], normal: [0, 0, 1] },
            { op: "difference", of: 1, tools: [5, 4] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(LENGTH * THICKNESS * trimmedHeight - WINDOW_WIDTH * (WINDOW_HEIGHT + GAP) * THICKNESS, 0);
    });

    it("should cut a triangle mesh opening that stops just short of both faces right through, as an extruded one", () => {
        // Arrange
        const { positions, indices } = boxMesh([300, -HALF + GAP, 400], [300 + WINDOW_WIDTH, HALF - GAP, 400 + WINDOW_HEIGHT]);
        const nodes: Base.RecipeNode[] = [
            WALL_AND_WINDOW[0]!,
            WALL_AND_WINDOW[1]!,
            { op: "triangles", positions: [8, positions.length], indices: [0, indices.length] },
            { op: "voids", host: 1, openings: [2] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [3], [...CLEAN_WALL, ...positions], TOLERANCE, 1, indices));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - WINDOW_AREA * THICKNESS, 1);
    });

    it("should reach a tilted face that touches the host's side at one corner and falls short of it at the others", () => {
        // Arrange
        const corners = boxCorners([300, -HALF, 400], [300 + WINDOW_WIDTH, HALF, 400 + WINDOW_HEIGHT]);
        corners[5] = [300 + WINDOW_WIDTH, -HALF + GAP, 400 + WINDOW_HEIGHT];
        const positions = corners.flat();
        const nodes: Base.RecipeNode[] = [
            WALL_AND_WINDOW[0]!,
            WALL_AND_WINDOW[1]!,
            { op: "triangles", positions: [8, positions.length], indices: [0, BOX_FACES.length] },
            { op: "voids", host: 1, openings: [2] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [3], [...CLEAN_WALL, ...positions], TOLERANCE, 1, BOX_FACES));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - WINDOW_AREA * THICKNESS, 0);
        expect(wall?.area).toBeCloseTo(BOX_AREA - 2 * WINDOW_AREA + 2 * (WINDOW_WIDTH + WINDOW_HEIGHT) * THICKNESS, -1);
    });

    it("should reach a tilted face that runs just past the host's side at most corners and falls short at one", () => {
        // Arrange
        const corners = boxCorners([300, -HALF - GAP / 2, 400], [300 + WINDOW_WIDTH, HALF, 400 + WINDOW_HEIGHT]);
        corners[5] = [300 + WINDOW_WIDTH, -HALF + GAP / 2, 400 + WINDOW_HEIGHT];
        const positions = corners.flat();
        const nodes: Base.RecipeNode[] = [
            WALL_AND_WINDOW[0]!,
            WALL_AND_WINDOW[1]!,
            { op: "triangles", positions: [8, positions.length], indices: [0, BOX_FACES.length] },
            { op: "voids", host: 1, openings: [2] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [3], [...CLEAN_WALL, ...positions], TOLERANCE, 1, BOX_FACES));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - WINDOW_AREA * THICKNESS, 0);
        expect(wall?.area).toBeCloseTo(BOX_AREA - 2 * WINDOW_AREA + 2 * (WINDOW_WIDTH + WINDOW_HEIGHT) * THICKNESS, -1);
    });

    it("should reach both faces of a wall no thicker than the tolerance", () => {
        // Arrange
        const coarse = 1;
        const plate = coarse;
        const noise = 1e-9;
        const square = [0, 0, 20, 0, 20, 20, 0, 20];
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 100 },
            { op: "polygon", points: [8, 8], holes: [] },
            { op: "extrude", profile: 2, direction: [0, 0, 1], depth: plate - 2 * noise },
            { op: "transform", of: 3, matrix: acrossTheWallAt(30, plate / 2 - noise, 30) },
            { op: "voids", host: 1, openings: [4] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [5], [0, -plate / 2, 100, -plate / 2, 100, plate / 2, 0, plate / 2, ...square], coarse));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(100 * plate * 100 - 20 * 20 * plate, 3);
    });

    it("should move only the corners on the side it reaches, leaving a step a few tolerances above that side as drawn", () => {
        // Arrange
        const step = 5 * TOLERANCE;
        const stepped = [0, step, WINDOW_WIDTH / 2, step, WINDOW_WIDTH / 2, 0, WINDOW_WIDTH, 0, WINDOW_WIDTH, WINDOW_HEIGHT, 0, WINDOW_HEIGHT];
        const nodes: Base.RecipeNode[] = [
            WALL_AND_WINDOW[0]!,
            WALL_AND_WINDOW[1]!,
            { op: "polygon", points: [8, 12], holes: [] },
            { op: "extrude", profile: 2, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 3, matrix: acrossTheWallAt(300, HALF, GAP) },
            { op: "voids", host: 1, openings: [4] },
        ];
        const reachedHalf = (WINDOW_WIDTH / 2) * (WINDOW_HEIGHT + GAP);
        const steppedHalf = (WINDOW_WIDTH / 2) * (WINDOW_HEIGHT - step);

        // Act
        const [wall] = built(recipeOf(nodes, [5], [...CLEAN_WALL, ...stepped]));

        // Assert
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - (reachedHalf + steppedHalf) * THICKNESS, 0);
    });

    it("should compare every solid tool of a difference with the same outline, so the order of the tools changes nothing", () => {
        // Arrange
        const endCut: Base.TransformMatrix = [1, 0, 0, 0, 0, 0, (HEIGHT + 200) / WINDOW_HEIGHT, 0, 0, -(THICKNESS + 200) / THICKNESS, 0, 0, LENGTH - 100, HALF + 100, -100, 1];
        const post = 0.005;
        const differenceOf = (tools: number[]): Base.Recipe => recipeOf([
            ...WALL_AND_WINDOW,
            { op: "transform", of: 3, matrix: endCut },
            { op: "transform", of: 3, matrix: acrossTheWallAt(LENGTH - 100 - post - WINDOW_WIDTH, HALF) },
            { op: "difference", of: 1, tools },
        ], [6], [...CLEAN_WALL, ...WINDOW]);

        // Act
        const [endFirst] = built(differenceOf([4, 5]));
        const [windowFirst] = built(differenceOf([5, 4]));

        // Assert
        expect(endFirst?.volume).toBeCloseTo(windowFirst!.volume, 0);
        expect(endFirst?.genus).toBe(windowFirst?.genus);
    });

    it("should reach each part of a difference's several-part tool through the face it falls short of, though another part runs past that face", () => {
        // Arrange
        const past = 100;
        const nodes: Base.RecipeNode[] = [
            ...WALL_AND_WINDOW,
            { op: "transform", of: 3, matrix: acrossTheWallAt(100, HALF - GAP) },
            { op: "transform", of: 3, matrix: acrossTheWallAt(600, HALF + past) },
            { op: "compound", of: [4, 5] },
            { op: "difference", of: 1, tools: [6] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [7], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - WINDOW_AREA * THICKNESS - WINDOW_AREA * (THICKNESS - past), 0);
    });

    it("should split a union of parts placed by several transforms above it, and reach each part on its own", () => {
        // Arrange
        const away = 1000;
        const past = 100;
        const nodes: Base.RecipeNode[] = [
            ...WALL_AND_WINDOW,
            { op: "transform", of: 3, matrix: acrossTheWallAt(100, HALF - GAP - away) },
            { op: "transform", of: 3, matrix: acrossTheWallAt(600, HALF + past - away) },
            { op: "union", of: [4, 5] },
            { op: "transform", of: 6, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, away / 2, 0, 1] },
            { op: "transform", of: 7, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, away / 2, 0, 1] },
            { op: "voids", host: 1, openings: [8] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [9], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - WINDOW_AREA * THICKNESS - WINDOW_AREA * (THICKNESS - past), 0);
    });

    it("should leave out an opening one of whose parts failed, and cut the host by the openings that built, when asked to go on", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            ...WALL_AND_WINDOW,
            { op: "triangles", positions: [16, 9], indices: [0, 3] },
            { op: "transform", of: 3, matrix: acrossTheWallAt(100, HALF) },
            { op: "compound", of: [4, 5] },
            { op: "transform", of: 3, matrix: acrossTheWallAt(600, HALF) },
            { op: "voids", host: 1, openings: [6, 7] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [8], [...CLEAN_WALL, ...WINDOW, 0, 0, 0, 1, 0, 0, 0, 1, 0], TOLERANCE, 1, [0, 1, 2]), true);

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - WINDOW_AREA * THICKNESS, 0);
    });

    it("should release the parts it placed, and the part it was placing, when placing a part of a several-part opening fails", () => {
        // Arrange
        const placedBy = 4242;
        const windowAt = (x: number): Base.TransformMatrix => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 100 - placedBy, 0, 1];
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [8, 8], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 1, matrix: [LENGTH / WINDOW_WIDTH, 0, 0, 0, 0, HEIGHT / WINDOW_HEIGHT, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
            { op: "transform", of: 1, matrix: windowAt(100) },
            { op: "transform", of: 1, matrix: windowAt(600) },
            { op: "compound", of: [3, 4] },
            { op: "transform", of: 5, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, placedBy, 0, 1] },
            { op: "voids", host: 2, openings: [6] },
        ];
        const original = manifoldPrototype.transform;
        const placing: Manifold3D.Manifold[] = [];
        const placed: Manifold3D.Manifold[] = [];
        vi.spyOn(manifoldPrototype, "transform").mockImplementation(function (this: Manifold3D.Manifold, matrix: Manifold3D.Mat4) {
            if (matrix[13] !== placedBy) {
                return original.call(this, matrix);
            }
            placing.push(this);
            if (placing.length === 3) {
                throw new Error("the kernel ran out of memory");
            }
            const result = original.call(this, matrix);
            placed.push(result);
            return result;
        });
        const released = vi.spyOn(manifoldPrototype, "delete");

        // Act
        const build = (): Manifold3D.Manifold[] => manifold.recipes.build({ recipe: recipeOf(nodes, [7], [...CLEAN_WALL, ...WINDOW]) });

        // Assert
        expect(build).toThrow("the kernel ran out of memory");
        expect(released.mock.contexts).toContain(placed[1]);
        expect(released.mock.contexts).toContain(placing[2]);
    });

    it("should split a tool into at most 64 parts, and reach a tool of more parts as a whole", () => {
        // Arrange
        const nestedTwice = (levels: number): Base.RecipeNode[] => [
            ...WALL_AND_WINDOW,
            { op: "transform", of: 3, matrix: acrossTheWallAt(300, HALF) },
            ...Array.from({ length: levels }, (_, level): Base.RecipeNode => ({ op: "compound", of: [4 + level, 4 + level] })),
            { op: "voids", host: 1, openings: [4 + levels] },
        ];
        const warp = vi.spyOn(manifoldPrototype, "warp");

        // Act
        built(recipeOf(nestedTwice(6), [11], [...CLEAN_WALL, ...WINDOW]));
        const splitWarps = warp.mock.calls.length;
        warp.mockClear();
        built(recipeOf(nestedTwice(7), [12], [...CLEAN_WALL, ...WINDOW]));
        const wholeWarps = warp.mock.calls.length;

        // Assert
        expect([splitWarps, wholeWarps]).toEqual([64, 1]);
    });

    it("should cut a triangle mesh opening inside its host as it is, never grown", () => {
        // Arrange
        const corner = [100, -50, 100];
        const edge = 50;
        const tetrahedron = [
            corner[0]!, corner[1]!, corner[2]!,
            corner[0]! + edge, corner[1]!, corner[2]!,
            corner[0]!, corner[1]! + edge, corner[2]!,
            corner[0]!, corner[1]!, corner[2]! + edge,
        ];
        const outwardFaces = [0, 2, 1, 0, 1, 3, 0, 3, 2, 1, 2, 3];
        const nodes: Base.RecipeNode[] = [
            WALL_AND_WINDOW[0]!,
            WALL_AND_WINDOW[1]!,
            { op: "triangles", positions: [8, 12], indices: [0, 12] },
            { op: "voids", host: 1, openings: [2] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [3], [...NOISY_WALL, ...tetrahedron], TOLERANCE, 1, outwardFaces));

        // Assert
        expect(wall?.genus).toBe(-1);
        expect(wall?.volume).toBeCloseTo(NOISY_HOST_VOLUME - edge ** 3 / 6, 0);
    });
});
