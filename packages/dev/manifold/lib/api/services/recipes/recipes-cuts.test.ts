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

const L_PLAN = [0, 0, LENGTH, 0, LENGTH, THICKNESS, THICKNESS, THICKNESS, THICKNESS, LENGTH, 0, LENGTH];
const L_PLAN_VOLUME = (LENGTH * THICKNESS + THICKNESS * (LENGTH - THICKNESS)) * HEIGHT;
const STEPPED_ELEVATION = [0, 0, LENGTH, 0, LENGTH, HEIGHT, LENGTH / 2, HEIGHT, LENGTH / 2, 600, 0, 600];
const STEPPED_VOLUME = ((LENGTH / 2) * 600 + (LENGTH / 2) * HEIGHT) * THICKNESS;

function acrossTheWallAt(x: number, y: number, z = 400): Base.TransformMatrix {
    return [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, x, y, z, 1];
}

function movedBy(x: number, y: number): Base.TransformMatrix {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, 0, 1];
}

function turnedBy(angle: number): Base.TransformMatrix {
    return [Math.cos(angle), Math.sin(angle), 0, 0, -Math.sin(angle), Math.cos(angle), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

function lShapedWallWithAWindowShortOfItsInnerFaceBy(gap: number, away = 0): Base.RecipeNode[] {
    return [
        { op: "polygon", points: [0, 12], holes: [] },
        { op: "extrude", profile: 0, direction: [0, 0, 1], depth: HEIGHT },
        { op: "transform", of: 1, matrix: movedBy(away, away) },
        { op: "polygon", points: [12, 8], holes: [] },
        { op: "extrude", profile: 3, direction: [0, 0, 1], depth: THICKNESS - gap - GAP },
        { op: "transform", of: 4, matrix: acrossTheWallAt(away + 300, away + THICKNESS - gap) },
        { op: "voids", host: 2, openings: [5] },
    ];
}

function steppedWallWithAnOpening(points: number): Base.RecipeNode[] {
    return [
        { op: "polygon", points: [0, 12], holes: [] },
        { op: "extrude", profile: 0, direction: [0, 0, 1], depth: THICKNESS },
        { op: "transform", of: 1, matrix: acrossTheWallAt(0, HALF, 0) },
        { op: "polygon", points: [12, points], holes: [] },
        { op: "extrude", profile: 3, direction: [0, 0, 1], depth: THICKNESS },
        { op: "transform", of: 4, matrix: acrossTheWallAt(0, HALF, 0) },
        { op: "voids", host: 2, openings: [5] },
    ];
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

    it("should cut an opening through a face inside the host's box that it stops just short of, as an L-shaped wall's inner face", () => {
        // Arrange
        const nodes = lShapedWallWithAWindowShortOfItsInnerFaceBy(GAP);

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...L_PLAN, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(L_PLAN_VOLUME - WINDOW_AREA * THICKNESS, 0);
    });

    it("should find the face inside the host's box that a window stops just short of among a host of many triangles", () => {
        // Arrange
        const tooth = 10;
        const rise = GAP / 10;
        const teeth = Array.from({ length: (LENGTH - THICKNESS) / tooth - 1 }, (_, at) => [LENGTH - tooth / 2 - tooth * at, THICKNESS + (at % 2 === 0 ? rise : 0)]).flat();
        const lPlanWithAToothedInnerFace = [0, 0, LENGTH, 0, LENGTH, THICKNESS, ...teeth, THICKNESS, THICKNESS, THICKNESS, LENGTH, 0, LENGTH];
        const toothArea = tooth * rise;
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, lPlanWithAToothedInnerFace.length], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: HEIGHT },
            { op: "polygon", points: [lPlanWithAToothedInnerFace.length, 8], holes: [] },
            { op: "extrude", profile: 2, direction: [0, 0, 1], depth: THICKNESS - 2 * GAP },
            { op: "transform", of: 3, matrix: acrossTheWallAt(300, THICKNESS - GAP) },
            { op: "voids", host: 1, openings: [4] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [5], [...lPlanWithAToothedInnerFace, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(L_PLAN_VOLUME + 40 * toothArea * HEIGHT - WINDOW_AREA * THICKNESS - 10 * toothArea * WINDOW_HEIGHT, 0);
    });

    it("should reach a face inside the host's box however far from the cut's origin the host lies", () => {
        // Arrange
        const pastAFloatStepFromTheOrigin = 1e7 + 0.5003;
        const nodes = lShapedWallWithAWindowShortOfItsInnerFaceBy(GAP, pastAFloatStepFromTheOrigin);

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...L_PLAN, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(L_PLAN_VOLUME - WINDOW_AREA * THICKNESS, 0);
    });

    it("should leave an opening a few tolerances short of a face inside the host's box as drawn, a niche of the depth it was given", () => {
        // Arrange
        const gap = 2 * TOLERANCE;
        const nodes = lShapedWallWithAWindowShortOfItsInnerFaceBy(gap);

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...L_PLAN, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(L_PLAN_VOLUME - WINDOW_AREA * (THICKNESS - gap), 0);
    });

    it("should cut a sink hole as deep as its counter top through the worktop that the backsplash rises above, placed as an IFC file places them", () => {
        // Arrange
        const counterSection = [
            -0.0605333333335195, -0.2146833333333333, 0.08106666666703725, -0.2146833333333333, 0.08106666666703725, -0.1956333333333329,
            -0.02053333333351722, -0.1956333333333329, -0.02053333333351722, 0.4103166666666662, -0.0605333333335195, 0.4103166666666662,
        ];
        const sectionArea = 0.02693548;
        const sectionOutline = 1.5332;
        const counterLength = 3;
        const holeWidth = 0.4062;
        const holeLength = 0.4034;
        const worktopThickness = 0.04000000000000228;
        const hole = [-holeWidth / 2, -holeLength / 2, holeWidth / 2, -holeLength / 2, holeWidth / 2, holeLength / 2, -holeWidth / 2, holeLength / 2];
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 12], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: counterLength },
            { op: "transform", of: 1, matrix: [0, 0, 1, 0, 0, -1, 0, 0, 1, 0, 0, 0, -1.200462295081974, -0.2146833333333333, 0.920533333333552, 1] },
            { op: "polygon", points: [12, 8], holes: [] },
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: worktopThickness },
            { op: "transform", of: 4, matrix: [-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0.2995377049180236, -0.289000000000011, 0.8600000000000327, 1] },
            { op: "transform", of: 5, matrix: IDENTITY },
            { op: "voids", host: 2, openings: [6] },
        ];
        const holeArea = holeWidth * holeLength;

        // Act
        const [counter] = built(recipeOf(nodes, [7], [...counterSection, ...hole], 1e-5, 1000));

        // Assert
        expect(counter?.genus).toBe(1);
        expect(counter?.volume).toBeCloseTo(sectionArea * counterLength - holeArea * worktopThickness, 6);
        expect(counter?.area).toBeCloseTo(2 * sectionArea + sectionOutline * counterLength - 2 * holeArea + 2 * (holeWidth + holeLength) * worktopThickness, 4);
    });

    it("should cut an opening through a wall whose faces do not run along the cut's axes, short of both faces", () => {
        // Arrange
        const turn = turnedBy(Math.PI / 6);
        const nodes: Base.RecipeNode[] = [
            WALL_AND_WINDOW[0]!,
            WALL_AND_WINDOW[1]!,
            { op: "transform", of: 1, matrix: turn },
            WALL_AND_WINDOW[2]!,
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: THICKNESS - 2 * GAP },
            { op: "transform", of: 4, matrix: acrossTheWallAt(300, HALF - GAP) },
            { op: "transform", of: 5, matrix: turn },
            { op: "voids", host: 2, openings: [6] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [7], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - WINDOW_AREA * THICKNESS, 0);
    });

    it("should leave an opening a few tolerances short of a face that does not run along the cut's axes as drawn, and reach the face it nearly meets", () => {
        // Arrange
        const turn = turnedBy(Math.PI / 6);
        const gap = 2 * TOLERANCE;
        const nodes: Base.RecipeNode[] = [
            WALL_AND_WINDOW[0]!,
            WALL_AND_WINDOW[1]!,
            { op: "transform", of: 1, matrix: turn },
            WALL_AND_WINDOW[2]!,
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: THICKNESS - GAP - gap },
            { op: "transform", of: 4, matrix: acrossTheWallAt(300, HALF - GAP) },
            { op: "transform", of: 5, matrix: turn },
            { op: "voids", host: 2, openings: [6] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [7], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - WINDOW_AREA * (THICKNESS - gap), 0);
    });

    it("should compare a difference's solid tool after a half-space with the solid as that half-space left it, though a solid tool came before the half-space", () => {
        // Arrange
        const trimmedHeight = 900;
        const nodes: Base.RecipeNode[] = [
            ...WALL_AND_WINDOW,
            { op: "transform", of: 3, matrix: acrossTheWallAt(100, HALF) },
            { op: "halfSpace", origin: [0, 0, trimmedHeight], normal: [0, 0, 1] },
            { op: "transform", of: 3, matrix: acrossTheWallAt(600, HALF, trimmedHeight - WINDOW_HEIGHT - GAP) },
            { op: "difference", of: 1, tools: [4, 5, 6] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [7], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(LENGTH * THICKNESS * trimmedHeight - WINDOW_AREA * THICKNESS - WINDOW_WIDTH * (WINDOW_HEIGHT + GAP) * THICKNESS, 0);
    });

    it("should move a corner exactly halfway between two opposite sides it reaches out through the lower one", () => {
        // Arrange
        const coarse = 1;
        const plate = coarse;
        const lopsidedOutline = [30, -plate / 2, 50, -plate / 2, 52, 0, 55, plate / 2, 30, plate / 2, 28, 0];
        const toolHeight = 20;
        const cutWhenTheMiddleCornersMoveDown = 24.4 * plate * toolHeight;
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 100 },
            { op: "polygon", points: [8, 12], holes: [] },
            { op: "extrude", profile: 2, direction: [0, 0, 1], depth: toolHeight },
            { op: "transform", of: 3, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 30, 1] },
            { op: "voids", host: 1, openings: [4] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [5], [0, -plate / 2, 100, -plate / 2, 100, plate / 2, 0, plate / 2, ...lopsidedOutline], coarse));

        // Assert
        expect(wall?.volume).toBeCloseTo(100 * plate * 100 - cutWhenTheMiddleCornersMoveDown, 3);
    });

    it("should cut a difference's solid tool through a sloped top that a half-space before it clipped below the box, as a notch", () => {
        // Arrange
        const rise = 0.2;
        const eaves = 800;
        const slopedTopAt = (x: number): number => eaves + rise * x;
        const notch = [300, 400, 500, 400, 500, slopedTopAt(500) - GAP, 300, slopedTopAt(300) - GAP];
        const notchArea = (500 - 300) * ((slopedTopAt(300) + slopedTopAt(500)) / 2 - 400);
        const nodes: Base.RecipeNode[] = [
            WALL_AND_WINDOW[0]!,
            WALL_AND_WINDOW[1]!,
            { op: "halfSpace", origin: [0, 0, eaves], normal: [-rise, 0, 1] },
            { op: "polygon", points: [8, 8], holes: [] },
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 4, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "difference", of: 1, tools: [2, 5] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...CLEAN_WALL, ...notch]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(LENGTH * THICKNESS * slopedTopAt(LENGTH / 2) - notchArea * THICKNESS, 1);
    });

    it("should leave the sides of an opening that meet faces inside the host's box only along an edge where they are drawn", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 12], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 1, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "polygon", points: [12, 8], holes: [] },
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 4, matrix: acrossTheWallAt(LENGTH / 2 + GAP, HALF, 600 - WINDOW_HEIGHT) },
            { op: "voids", host: 2, openings: [5] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...STEPPED_ELEVATION, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(STEPPED_VOLUME - WINDOW_AREA * THICKNESS, 0);
    });

    it("should leave an opening's head where it is drawn when it lies flush with a face inside the host's box over a strip narrower than the tolerance", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 12], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 1, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "polygon", points: [12, 8], holes: [] },
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 4, matrix: acrossTheWallAt(LENGTH / 2 - GAP, HALF, 600 - WINDOW_HEIGHT) },
            { op: "voids", host: 2, openings: [5] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...STEPPED_ELEVATION, ...WINDOW]));

        // Assert
        expect(wall?.volume).toBeCloseTo(STEPPED_VOLUME - WINDOW_AREA * THICKNESS, 0);
    });

    it("should leave a side where it is drawn when only part of it lies on a face inside the host's box, so it cuts no slot past that face's edge", () => {
        // Arrange
        const notchFrom = 300;
        const notchTo = 700;
        const notchBottom = 400;
        const stepTop = 600;
        const notch = [notchFrom, notchBottom, notchTo, notchBottom, notchTo, stepTop, notchFrom, stepTop];
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 12], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 1, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "polygon", points: [12, 8], holes: [] },
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 4, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "voids", host: 2, openings: [5] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...STEPPED_ELEVATION, ...notch]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(STEPPED_VOLUME - (notchTo - notchFrom) * (stepTop - notchBottom) * THICKNESS, 0);
    });

    it("should leave a side where it is drawn when its ends lie on faces inside the host's box but its middle runs under a taller part of the host", () => {
        // Arrange
        const tallMiddle = [0, 0, LENGTH, 0, LENGTH, 600, 600, 600, 600, HEIGHT, 400, HEIGHT, 400, 600, 0, 600];
        const tallMiddleVolume = (LENGTH * 600 + 200 * (HEIGHT - 600)) * THICKNESS;
        const pocket = [300, 400, 700, 400, 700, 600, 300, 600];
        const pocketDepth = HALF;
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 16], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 1, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "polygon", points: [16, 8], holes: [] },
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: pocketDepth },
            { op: "transform", of: 4, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "voids", host: 2, openings: [5] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...tallMiddle, ...pocket]));

        // Assert
        expect(wall?.volume).toBeCloseTo(tallMiddleVolume - (700 - 300) * (600 - 400) * pocketDepth, 0);
    });

    it("should not count a face that faces the same way at another height as one a side lies on, though both lie within the tool's reach", () => {
        // Arrange
        const steppedWithATunnel = [...STEPPED_ELEVATION.slice(0, 12), 550, 450, 900, 450, 900, 520, 550, 520];
        const tunnelArea = (900 - 550) * (520 - 450);
        const notch = [300, 400, 700, 400, 700, 600, 300, 600];
        const notchInTheTunnel = (700 - 550) * (520 - 450);
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 12], holes: [[12, 8]] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 1, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "polygon", points: [20, 8], holes: [] },
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 4, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "voids", host: 2, openings: [5] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...steppedWithATunnel, ...notch]));

        // Assert
        expect(wall?.volume).toBeCloseTo(STEPPED_VOLUME - tunnelArea * THICKNESS - ((700 - 300) * (600 - 400) - notchInTheTunnel) * THICKNESS, 0);
    });

    it("should leave an opening that meets a face inside the host's box along one edge only where it is drawn, as a niche", () => {
        // Arrange
        const width = 200;
        const eaves = THICKNESS / 2;
        const gableWithItsRidgeOnTheInnerFace = [300, 0, 300 + width, 0, 300 + width, eaves, 300 + width / 2, THICKNESS, 300, eaves];
        const gableArea = width * eaves + (width * (THICKNESS - eaves)) / 2;
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 12], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: HEIGHT },
            { op: "polygon", points: [12, 10], holes: [] },
            { op: "extrude", profile: 2, direction: [0, 0, 1], depth: WINDOW_HEIGHT },
            { op: "transform", of: 3, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 400, 1] },
            { op: "voids", host: 1, openings: [4] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [5], [...L_PLAN, ...gableWithItsRidgeOnTheInnerFace]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(L_PLAN_VOLUME - gableArea * WINDOW_HEIGHT, 0);
    });

    it("should leave an opening that meets a turned and tilted face inside the host's box along one edge only where it is drawn, the edge running across the face's axes", () => {
        // Arrange
        const tilt = Math.PI / 7;
        const turn = Math.PI / 6;
        const tilted: Base.TransformMatrix = [
            Math.cos(turn), Math.sin(turn) * Math.cos(tilt), Math.sin(turn) * Math.sin(tilt), 0,
            -Math.sin(turn), Math.cos(turn) * Math.cos(tilt), Math.cos(turn) * Math.sin(tilt), 0,
            0, -Math.sin(tilt), Math.cos(tilt), 0,
            0, 0, 0, 1,
        ];
        const width = 200;
        const eaves = THICKNESS / 2;
        const gableWithItsRidgeOnTheInnerFace = [300, 0, 300 + width, 0, 300 + width, eaves, 300 + width / 2, THICKNESS, 300, eaves];
        const gableArea = width * eaves + (width * (THICKNESS - eaves)) / 2;
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 12], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: HEIGHT },
            { op: "transform", of: 1, matrix: tilted },
            { op: "polygon", points: [12, 10], holes: [] },
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: WINDOW_HEIGHT },
            { op: "transform", of: 4, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 400, 1] },
            { op: "transform", of: 5, matrix: tilted },
            { op: "voids", host: 2, openings: [6] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [7], [...L_PLAN, ...gableWithItsRidgeOnTheInnerFace]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(L_PLAN_VOLUME - gableArea * WINDOW_HEIGHT, 0);
    });

    it("should reach a face whose edge an opening's side ends on, with the corners rounding left just off that edge", () => {
        // Arrange
        const turn = turnedBy(Math.PI / 6);
        const nodes: Base.RecipeNode[] = [
            WALL_AND_WINDOW[0]!,
            WALL_AND_WINDOW[1]!,
            { op: "transform", of: 1, matrix: turn },
            WALL_AND_WINDOW[2]!,
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: THICKNESS - 2 * GAP },
            { op: "transform", of: 4, matrix: acrossTheWallAt(LENGTH - WINDOW_WIDTH, HALF - GAP) },
            { op: "transform", of: 5, matrix: turn },
            { op: "voids", host: 2, openings: [6] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [7], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(CLEAN_HOST_VOLUME - WINDOW_AREA * THICKNESS, 0);
    });

    it("should leave an opening whose flat ridge on a face inside the host's box is narrower than the tolerance where it is drawn, as a niche", () => {
        // Arrange
        const width = 200;
        const eaves = THICKNESS / 2;
        const ridge = TOLERANCE / 2;
        const ridgeAt = THICKNESS - GAP;
        const gableWithANarrowFlatRidge = [300, 0, 300 + width, 0, 300 + width, eaves, 300 + (width + ridge) / 2, ridgeAt, 300 + (width - ridge) / 2, ridgeAt, 300, eaves];
        const gableArea = width * eaves + ((width + ridge) * (ridgeAt - eaves)) / 2;
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 12], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: HEIGHT },
            { op: "polygon", points: [12, 12], holes: [] },
            { op: "extrude", profile: 2, direction: [0, 0, 1], depth: WINDOW_HEIGHT },
            { op: "transform", of: 3, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 400, 1] },
            { op: "voids", host: 1, openings: [4] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [5], [...L_PLAN, ...gableWithANarrowFlatRidge]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(L_PLAN_VOLUME - gableArea * WINDOW_HEIGHT, 0);
    });

    it("should not count a face that faces the other way on the same plane as one a side lies on, so it cuts nothing from a block it only touches", () => {
        // Arrange
        const blocksMeetingAtAnEdge = [0, 0, 500, 0, 500, 600, 1000, 600, 1000, 1000, 500, 1000, 500, 600, 0, 600];
        const notch = [300, 400, 700, 400, 700, 600, 300, 600];
        const blocksVolume = (500 * 600 + 500 * 400) * THICKNESS;
        const cutFromTheLowerBlock = (500 - 300) * (600 - 400) * THICKNESS;
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 16], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 1, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "polygon", points: [16, 8], holes: [] },
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 4, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "voids", host: 2, openings: [5] },
        ];

        // Act
        const [blocks] = built(recipeOf(nodes, [6], [...blocksMeetingAtAnEdge, ...notch]));

        // Assert
        expect(blocks?.volume).toBeCloseTo(blocksVolume - cutFromTheLowerBlock, 0);
    });

    it("should reach a face of an opening that lies on a face inside the host's box, though another face of the opening on the same plane runs under a taller part of the host", () => {
        // Arrange
        const prongTop = 600 - GAP;
        const twoProngs = [300, 400, 700, 400, 700, prongTop, 600, prongTop, 600, 500, 450, 500, 450, prongTop, 300, prongTop];
        const cutThroughTheStepAndShortUnderTheTallerPart = 400 * 100 + 150 * 100 + 100 * (prongTop - 500);
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 12], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 1, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "polygon", points: [12, 16], holes: [] },
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 4, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "voids", host: 2, openings: [5] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...STEPPED_ELEVATION, ...twoProngs]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(STEPPED_VOLUME - cutThroughTheStepAndShortUnderTheTallerPart * THICKNESS, 0);
    });

    it("should keep a side that lies on a face of the host in its plane when the head beside it is reached through a sloped face, leaving no sliver", () => {
        // Arrange
        const notchedSlab = [0, 0, 8500, 0, 8500, 200, 8000, 200, 8000, 400, 7600, 400, 7600, 600, 8000, 600, 8000, 1000, 7500, 500, 7500, 8000, 0, 8000];
        const slabArea = 60395000;
        const opening = [7800, 450, 8000, 450, 8000, 1000, 7800, 800];
        const openingInsideTheSlab = 200 * ((800 - 600 + (1000 - 600)) / 2);
        const keptOutline = 8500 + 200 + 500 + 200 + 400 + 200 + 200 + 200 + 300 * Math.SQRT2 + 7500 + 7500 + 8000;
        const depth = 350;
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 24], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth },
            { op: "polygon", points: [24, 8], holes: [] },
            { op: "extrude", profile: 2, direction: [0, 0, 1], depth },
            { op: "voids", host: 1, openings: [3] },
        ];

        // Act
        const [slab] = built(recipeOf(nodes, [4], [...notchedSlab, ...opening]));

        // Assert
        expect(slab?.genus).toBe(0);
        expect(slab?.volume).toBeCloseTo((slabArea - openingInsideTheSlab) * depth, 0);
        expect(slab?.area).toBeCloseTo(2 * (slabArea - openingInsideTheSlab) + keptOutline * depth, 0);
    });

    it("should reach a face of an opening on a face inside the host's box that faces the same way as a side of the box the opening also reaches", () => {
        // Arrange
        const stepThenRiser = [300, 500, 700, 500, 700, HEIGHT - GAP, 500, HEIGHT - GAP, 500, 600 - GAP, 300, 600 - GAP];
        const cutFromTheStepAndTheTallerPart = 200 * 100 + 200 * (HEIGHT - 500);

        // Act
        const [wall] = built(recipeOf(steppedWallWithAnOpening(12), [6], [...STEPPED_ELEVATION, ...stepThenRiser]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(STEPPED_VOLUME - cutFromTheStepAndTheTallerPart * THICKNESS, 0);
    });

    it("should reach an opening's end whose outline has a corner all but on the line between the corners beside it", () => {
        // Arrange
        const windowWithABarelyRaisedHead = [0, 0, WINDOW_WIDTH, 0, WINDOW_WIDTH, WINDOW_HEIGHT, WINDOW_WIDTH / 2, WINDOW_HEIGHT + GAP, 0, WINDOW_HEIGHT];
        const raisedHeadArea = (WINDOW_WIDTH * GAP) / 2;
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 12], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: HEIGHT },
            { op: "polygon", points: [12, 10], holes: [] },
            { op: "extrude", profile: 2, direction: [0, 0, 1], depth: THICKNESS - 2 * GAP },
            { op: "transform", of: 3, matrix: acrossTheWallAt(300, THICKNESS - GAP) },
            { op: "voids", host: 1, openings: [4] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [5], [...L_PLAN, ...windowWithABarelyRaisedHead]));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(L_PLAN_VOLUME - (WINDOW_AREA + raisedHeadArea) * THICKNESS, 0);
    });

    it("should reach a face of an opening beside a chamfer of it, sliding the corner between them along the chamfer", () => {
        // Arrange
        const chamferRise = 42;
        const chamfered = [300, 400, 450, 400, 450, 600 - GAP - chamferRise, 400, 600 - GAP, 300, 600 - GAP];
        const leftAboveTheChamfer = ((50 + (GAP * 50) / chamferRise) * (chamferRise + GAP)) / 2;

        // Act
        const [wall] = built(recipeOf(steppedWallWithAnOpening(10), [6], [...STEPPED_ELEVATION, ...chamfered]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(STEPPED_VOLUME - (150 * 200 - leftAboveTheChamfer) * THICKNESS, 0);
    });

    it("should leave a face of an opening where it is drawn when reaching it would slide a corner along a shallow chamfer beside it more than twice the tolerance", () => {
        // Arrange
        const chamferRise = 13;
        const chamfered = [300, 400, 450, 400, 450, 600 - GAP - chamferRise, 400, 600 - GAP, 300, 600 - GAP];
        const drawnArea = 150 * (200 - GAP) - (50 * chamferRise) / 2;
        const warped = vi.spyOn(manifoldPrototype, "warpBatch");

        // Act
        const [wall] = built(recipeOf(steppedWallWithAnOpening(10), [6], [...STEPPED_ELEVATION, ...chamfered]));

        // Assert
        expect(warped).not.toHaveBeenCalled();
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(STEPPED_VOLUME - drawnArea * THICKNESS, 0);
    });

    it("should leave an opening's end where it is drawn when a corner of it is shared by more than three of its faces, so none of them leaves its plane", () => {
        // Arrange
        const min = [300, HALF, 400];
        const max = [500, THICKNESS - GAP, 700];
        const corners = boxCorners(min, max);
        corners[5] = [max[0]! + 20, min[1]!, max[2]!];
        const rightSideFoldedThroughACornerOfTheEnd = [...BOX_FACES.slice(0, 18), 2, 6, 5, 2, 5, 1, ...BOX_FACES.slice(24)];
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 12], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: HEIGHT },
            { op: "triangles", positions: [12, 24], indices: [0, 36] },
            { op: "voids", host: 1, openings: [2] },
        ];

        // Act
        const [wall, opening] = built(recipeOf(nodes, [3, 2], [...L_PLAN, ...corners.flat()], TOLERANCE, 1, rightSideFoldedThroughACornerOfTheEnd));

        // Assert
        expect(wall?.genus).toBe(-1);
        expect(wall?.volume).toBeCloseTo(L_PLAN_VOLUME - opening!.volume, 0);
    });

    it("should reach a triangle mesh opening's end whose triangles rounding has turned a little apart, with a corner inside the end and one on its edge moving out with it", () => {
        // Arrange
        const min = [300, GAP, 400];
        const max = [500, THICKNESS - GAP, 700];
        const insideTheEnd = [400, max[1]! - GAP, 550];
        const onTheEndsLowerEdge = [400, max[1]!, 400];
        const corners = [...boxCorners(min, max), insideTheEnd, onTheEndsLowerEdge];
        const lowerEdgeSplitAndEndFanned = [
            0, 2, 1, 0, 3, 9, 0, 9, 2,
            ...BOX_FACES.slice(6, 24),
            2, 9, 8, 9, 3, 8, 3, 7, 8, 7, 6, 8, 6, 2, 8,
            ...BOX_FACES.slice(30),
        ];
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 12], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: HEIGHT },
            { op: "triangles", positions: [12, 30], indices: [0, lowerEdgeSplitAndEndFanned.length] },
            { op: "voids", host: 1, openings: [2] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [3], [...L_PLAN, ...corners.flat()], TOLERANCE, 1, lowerEdgeSplitAndEndFanned));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(L_PLAN_VOLUME - (max[0]! - min[0]!) * (max[2]! - min[2]!) * THICKNESS, 0);
    });

    it("should reach a triangle mesh opening's end as one face, though one of its triangles is a sliver narrower than the tolerance", () => {
        // Arrange
        const min = [300, GAP, 400];
        const max = [500, THICKNESS - GAP, 700];
        const justAboveTheEndsLowerEdge = [400, max[1]!, min[2]! + GAP];
        const corners = [...boxCorners(min, max), justAboveTheEndsLowerEdge];
        const endWithASliverAlongItsLowerEdge = [...BOX_FACES.slice(0, 24), 2, 3, 8, 3, 7, 8, 7, 6, 8, 6, 2, 8, ...BOX_FACES.slice(30)];
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 12], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: HEIGHT },
            { op: "triangles", positions: [12, 27], indices: [0, endWithASliverAlongItsLowerEdge.length] },
            { op: "voids", host: 1, openings: [2] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [3], [...L_PLAN, ...corners.flat()], TOLERANCE, 1, endWithASliverAlongItsLowerEdge));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(L_PLAN_VOLUME - (max[0]! - min[0]!) * (max[2]! - min[2]!) * THICKNESS, 0);
    });

    it("should leave an opening's end where it is drawn when a narrow part of the host stands on the face it ends on, so it cuts no slot under it", () => {
        // Arrange
        const postBetweenTheSamplePoints = [0, 0, LENGTH, 0, LENGTH, 600, 380, 600, 380, HEIGHT, 320, HEIGHT, 320, 600, 0, 600];
        const wallWithAPostVolume = (LENGTH * 600 + 60 * (HEIGHT - 600)) * THICKNESS;
        const pocket = [300, -50, 700, -50, 700, 50, 300, 50];
        const pocketDepth = 200 - GAP;
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 16], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 1, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "polygon", points: [16, 8], holes: [] },
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: pocketDepth },
            { op: "transform", of: 4, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 400, 1] },
            { op: "voids", host: 2, openings: [5] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...postBetweenTheSamplePoints, ...pocket]));

        // Assert
        expect(wall?.genus).toBe(-1);
        expect(wall?.volume).toBeCloseTo(wallWithAPostVolume - 400 * 100 * pocketDepth, 0);
    });

    it("should leave an opening's end where it is drawn when another part of the host lies within the tolerance beyond the face it ends on", () => {
        // Arrange
        const block = [0, 0, 100, 0, 100, 100, 0, 100];
        const hole = [40, 40, 60, 40, 60, 60, 40, 60];
        const gapBetweenTheBlocks = 0.3 * TOLERANCE;
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 100 },
            { op: "transform", of: 1, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 100 + gapBetweenTheBlocks, 1] },
            { op: "compound", of: [1, 2] },
            { op: "polygon", points: [8, 8], holes: [] },
            { op: "extrude", profile: 4, direction: [0, 0, 1], depth: 100 },
            { op: "voids", host: 3, openings: [5] },
        ];

        // Act
        const [blocks] = built(recipeOf(nodes, [6], [...block, ...hole]));

        // Assert
        expect(blocks?.volume).toBeCloseTo(2 * 100 ** 3 - 20 * 20 * 100, 0);
    });

    it("should leave an opening's end where it is drawn when a rib under a millimetre wide stands on the face it ends on", () => {
        // Arrange
        const rib = 0.9;
        const steppedWithARib = [0, 0, LENGTH, 0, LENGTH, HEIGHT, 500, HEIGHT, 500, 600, 400 + rib, 600, 400 + rib, 800, 400, 800, 400, 600, 0, 600];
        const steppedWithARibVolume = STEPPED_VOLUME + rib * 200 * THICKNESS;
        const underTheRib = [300, 400, 480, 400, 480, 600 - GAP, 300, 600 - GAP];
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 20], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 1, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "polygon", points: [20, 8], holes: [] },
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 4, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "voids", host: 2, openings: [5] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...steppedWithARib, ...underTheRib]));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(steppedWithARibVolume - 180 * (200 - GAP) * THICKNESS, 0);
    });

    it("should reach an opening's end that runs a hair under a taller part of the host, the part of the host beyond it no wider than a strip of the tolerance", () => {
        // Arrange
        const aHairUnderTheTallerPart = [300, 400, 500 + GAP, 400, 500 + GAP, 600 - GAP, 300, 600 - GAP];

        // Act
        const [wall] = built(recipeOf(steppedWallWithAnOpening(8), [6], [...STEPPED_ELEVATION, ...aHairUnderTheTallerPart]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(STEPPED_VOLUME - (200 + GAP) * 200 * THICKNESS, 0);
    });

    it("should reach an opening's end through a face though another part of the host lies beyond it, further than the tolerance", () => {
        // Arrange
        const block = [0, 0, 100, 0, 100, 100, 0, 100];
        const hole = [40, 40, 60, 40, 60, 60, 40, 60];
        const gapBetweenTheBlocks = 2 * TOLERANCE;
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 100 },
            { op: "transform", of: 1, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 100 + gapBetweenTheBlocks, 1] },
            { op: "compound", of: [1, 2] },
            { op: "polygon", points: [8, 8], holes: [] },
            { op: "extrude", profile: 4, direction: [0, 0, 1], depth: 100 - GAP },
            { op: "voids", host: 3, openings: [5] },
        ];

        // Act
        const [blocks] = built(recipeOf(nodes, [6], [...block, ...hole]));

        // Assert
        expect(blocks?.genus).toBe(0);
        expect(blocks?.volume).toBeCloseTo(2 * 100 ** 3 - 20 * 20 * 100, 0);
    });

    it("should leave a face of an opening where it is drawn when its middle runs over air, though its ends lie on a face inside the host's box", () => {
        // Arrange
        const steppedWithADip = [0, 0, LENGTH, 0, LENGTH, HEIGHT, 500, HEIGHT, 500, 600, 350, 600, 350, 550, 250, 550, 250, 600, 0, 600];
        const steppedWithADipVolume = STEPPED_VOLUME - 100 * 50 * THICKNESS;
        const overTheDip = [200, 400, 400, 400, 400, 600 - GAP, 200, 600 - GAP];
        const cutFromTheWall = 200 * (200 - GAP) - 100 * (50 - GAP);
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 20], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 1, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "polygon", points: [20, 8], holes: [] },
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 4, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "voids", host: 2, openings: [5] },
        ];

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...steppedWithADip, ...overTheDip]));

        // Assert
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(steppedWithADipVolume - cutFromTheWall * THICKNESS, 0);
    });

    it("should leave an opening's end that already runs past a face inside the host's box where it is drawn, building the opening no further", () => {
        // Arrange
        const nodes = lShapedWallWithAWindowShortOfItsInnerFaceBy(-2 * TOLERANCE);
        const warped = vi.spyOn(manifoldPrototype, "warpBatch");

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...L_PLAN, ...WINDOW]));

        // Assert
        expect(warped).not.toHaveBeenCalled();
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(L_PLAN_VOLUME - WINDOW_AREA * THICKNESS, 0);
    });

    it("should leave a face of an opening where it is drawn when it meets, at a corner, a face that runs on all but in its plane into a taller part of the host", () => {
        // Arrange
        const rise = TOLERANCE;
        const headRunningOnUnderTheTallerPart = [300, 400, 700, 400, 700, 600 - GAP + rise, 500, 600 - GAP, 300, 600 - GAP];
        const drawnArea = 400 * (200 - GAP) + (200 * rise) / 2;

        // Act
        const [wall] = built(recipeOf(steppedWallWithAnOpening(10), [6], [...STEPPED_ELEVATION, ...headRunningOnUnderTheTallerPart]));

        // Assert
        expect(wall?.genus).toBe(1);
        expect(wall?.volume).toBeCloseTo(STEPPED_VOLUME - drawnArea * THICKNESS, 0);
    });

    it("should cut with an opening as the sides of the box leave it, never built again, when no face of it lies on a face of the host", () => {
        // Arrange
        const partlyUnderTheStep = [450, 400, 550, 400, 550, 600 - GAP, 450, 600 - GAP];
        const warped = vi.spyOn(manifoldPrototype, "warpBatch");

        // Act
        const [wall] = built(recipeOf(steppedWallWithAnOpening(8), [6], [...STEPPED_ELEVATION, ...partlyUnderTheStep]));

        // Assert
        expect(warped).not.toHaveBeenCalled();
        expect(wall?.volume).toBeCloseTo(STEPPED_VOLUME - 100 * (200 - GAP) * THICKNESS, 0);
    });

    it("should read no mesh at all when the host fills its box, as a plain wall does", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            ...WALL_AND_WINDOW,
            { op: "transform", of: 3, matrix: acrossTheWallAt(300, HALF) },
            { op: "voids", host: 1, openings: [4] },
        ];
        const read = vi.spyOn(manifoldPrototype, "getMesh");

        // Act
        const [wall] = built(recipeOf(nodes, [5], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(read).not.toHaveBeenCalled();
        expect(wall?.genus).toBe(1);
    });

    it("should read only the host's mesh when every face near an opening is a side of the host's box", () => {
        // Arrange
        const belowTheStep = [100, 100, 300, 100, 300, 400, 100, 400];
        const read = vi.spyOn(manifoldPrototype, "getMesh");

        // Act
        const [wall] = built(recipeOf(steppedWallWithAnOpening(8), [6], [...STEPPED_ELEVATION, ...belowTheStep]));

        // Assert
        expect(read).toHaveBeenCalledTimes(1);
        expect(wall?.genus).toBe(1);
    });

    it("should pass over a face of the host too narrow to keep its width in 32-bit floats, and cut an opening beside it as drawn", () => {
        // Arrange
        const narrowerThanAFloatStep = 2e-6;
        const steppedWithANarrowFaceAtOneCorner = [...STEPPED_ELEVATION, narrowerThanAFloatStep / 2, narrowerThanAFloatStep];
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 14], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 1, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "polygon", points: [14, 8], holes: [] },
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: THICKNESS },
            { op: "transform", of: 4, matrix: acrossTheWallAt(0, HALF, 0) },
            { op: "voids", host: 2, openings: [5] },
        ];
        const read = vi.spyOn(manifoldPrototype, "getMesh");

        // Act
        const [wall] = built(recipeOf(nodes, [6], [...steppedWithANarrowFaceAtOneCorner, ...WINDOW]));

        // Assert
        expect(read).toHaveBeenCalledTimes(1);
        expect(wall?.genus).toBe(0);
        expect(wall?.volume).toBeCloseTo(STEPPED_VOLUME - WINDOW_AREA * THICKNESS, 0);
    });

    it("should build an empty solid when the host of a voids step builds empty, reading no mesh from it", () => {
        // Arrange
        const apart: Base.TransformMatrix = movedBy(2 * LENGTH, 0);
        const nodes: Base.RecipeNode[] = [
            ...WALL_AND_WINDOW,
            { op: "transform", of: 1, matrix: apart },
            { op: "intersection", of: [1, 4] },
            { op: "transform", of: 3, matrix: acrossTheWallAt(300, HALF) },
            { op: "voids", host: 5, openings: [6] },
        ];
        const read = vi.spyOn(manifoldPrototype, "getMesh");

        // Act
        const [wall] = built(recipeOf(nodes, [7], [...CLEAN_WALL, ...WINDOW]));

        // Assert
        expect(read).not.toHaveBeenCalled();
        expect(wall?.volume).toBe(0);
    });

    it("should read no mesh for a difference that only clips by half-spaces", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            WALL_AND_WINDOW[0]!,
            WALL_AND_WINDOW[1]!,
            { op: "halfSpace", origin: [0, 0, 900], normal: [0, 0, 1] },
            { op: "halfSpace", origin: [900, 0, 0], normal: [1, 0, 1] },
            { op: "difference", of: 1, tools: [2, 3] },
        ];
        const read = vi.spyOn(manifoldPrototype, "getMesh");

        // Act
        const [wall] = built(recipeOf(nodes, [4], CLEAN_WALL));

        // Assert
        expect(read).not.toHaveBeenCalled();
        expect(wall?.volume).toBeCloseTo(((900 * 900) / 2) * THICKNESS, 0);
    });
});
