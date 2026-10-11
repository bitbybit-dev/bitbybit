import { describe, expect, it } from "vitest";
import type { Base } from "../inputs/base-inputs";
import { checkRecipe } from "./validate";

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const RAISED: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 5, 1];
const TURNED: Base.TransformMatrix = [0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 5, 0, 5, 1];
const SQUARE = [0, 0, 1, 0, 1, 1, 0, 1];

function stepsRecipe(nodes: unknown[], frames: readonly (readonly number[])[] = [IDENTITY, RAISED, TURNED]): unknown {
    return {
        format: "bitbybit.recipe",
        version: 1,
        millimetresPerUnit: 1,
        tolerance: 0.01,
        buffers: { f64: new Float64Array([...SQUARE, ...frames.flat()]), i32: new Int32Array(0) },
        nodes: [
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "circle", center: [3, 0], radius: 1 },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 2 },
            ...nodes,
        ],
        roots: [],
    };
}

describe("checkRecipe and the steps that join, turn and loft", () => {
    it("should accept unions, intersections, turns and lofts of one profile by many frames or of a profile per frame", () => {
        // Arrange
        const recipe = stepsRecipe([
            { op: "union", of: [2] },
            { op: "intersection", of: [2, 3] },
            { op: "revolve", profile: 1, origin: [0, 0], direction: [0, 1], angle: Math.PI / 2 },
            { op: "revolve", profile: 0, origin: [-1, 0], direction: [1, 1], angle: 2 * Math.PI },
            { op: "loft", profiles: [0], frames: [8, 48] },
            { op: "loft", profiles: [0, 1], frames: [8, 32] },
        ]);

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([]);
    });

    it("should refuse a union of nothing, an intersection of fewer than two solids and either of a profile", () => {
        // Arrange
        const recipe = stepsRecipe([{ op: "union", of: [] }, { op: "intersection", of: [2] }, { op: "union", of: [0] }]);

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([
            { path: "nodes[3].of", message: "must be a list of at least one node index" },
            { path: "nodes[4].of", message: "must be a list of at least 2 node indices" },
            { path: "nodes[5].of[0]", message: "refers to a profile node where solid is needed" },
        ]);
    });

    it("should refuse a turn of a solid, about a zero direction or an origin that is not two numbers, and by an angle of none or more than a turn", () => {
        // Arrange
        const recipe = stepsRecipe([
            { op: "revolve", profile: 2, origin: [0, 0, 0], direction: [0, 0], angle: 0 },
            { op: "revolve", profile: 0, origin: [0, 0], direction: [1, "0"], angle: 7 },
        ]);

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([
            { path: "nodes[3].profile", message: "refers to a solid node where profile is needed" },
            { path: "nodes[3].origin", message: "must be two numbers, each from -1000000000 to 1000000000" },
            { path: "nodes[3].direction", message: "must not be a zero vector" },
            { path: "nodes[3].angle", message: "must be an angle in radians above zero and at most a whole turn" },
            { path: "nodes[4].direction", message: "must be two numbers, each from -1000000000 to 1000000000" },
            { path: "nodes[4].angle", message: "must be an angle in radians above zero and at most a whole turn" },
        ]);
    });

    it("should refuse a loft of a solid, of one frame, of frames that are not whole matrices, and of profiles that do not match its frames", () => {
        // Arrange
        const recipe = stepsRecipe([
            { op: "loft", profiles: [2], frames: [8, 16] },
            { op: "loft", profiles: [0], frames: [8, 40] },
            { op: "loft", profiles: [0, 1], frames: [8, 48] },
            { op: "loft", profiles: [], frames: [8, 32] },
        ]);

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([
            { path: "nodes[3].profiles[0]", message: "refers to a solid node where profile is needed" },
            { path: "nodes[3].frames", message: "must hold a multiple of 16 numbers, at least 32" },
            { path: "nodes[4].frames", message: "must hold a multiple of 16 numbers, at least 32" },
            { path: "nodes[5].profiles", message: "must hold one profile, or one for each of the 3 frames" },
            { path: "nodes[6].profiles", message: "must be a list of at least one node index" },
        ]);
    });

    it("should refuse a loft frame that projects or flattens the profile, naming the frame", () => {
        // Arrange
        const projecting = [1, 0, 0, 0.5, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        const flattening = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        const projects = stepsRecipe([{ op: "loft", profiles: [0], frames: [8, 32] }], [IDENTITY, projecting]);
        const flattens = stepsRecipe([{ op: "loft", profiles: [0], frames: [8, 48] }], [IDENTITY, RAISED, flattening]);

        // Act
        const [projected, flattened] = [checkRecipe(projects), checkRecipe(flattens)];

        // Assert
        expect(projected).toEqual([{ path: "nodes[3].frames[1]", message: "must have 0, 0, 0, 1 as its bottom row, at numbers 3, 7, 11 and 15 of the frame" }]);
        expect(flattened).toEqual([{ path: "nodes[3].frames[2]", message: "flattens the profile it places: its rotation and scale part has no inverse" }]);
    });

    it("should keep loft frames that all mirror or none do, and refuse one that mirrors where the first does not or the other way round", () => {
        // Arrange
        const mirrored = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1];
        const turnsOver = "turns the profile over where the first frame does not, or the other way round: a loft's frames all mirror, or none do";
        const loft = { op: "loft", profiles: [0], frames: [8, 48] };

        // Act
        const [none, all, later, first] = [
            checkRecipe(stepsRecipe([loft], [IDENTITY, RAISED, TURNED])),
            checkRecipe(stepsRecipe([loft], [mirrored, mirrored, mirrored])),
            checkRecipe(stepsRecipe([loft], [IDENTITY, RAISED, mirrored])),
            checkRecipe(stepsRecipe([loft], [mirrored, RAISED, mirrored])),
        ];

        // Assert
        expect([none, all]).toEqual([[], []]);
        expect(later).toEqual([{ path: "nodes[3].frames[2]", message: turnsOver }]);
        expect(first).toEqual([{ path: "nodes[3].frames[1]", message: turnsOver }]);
    });
});
