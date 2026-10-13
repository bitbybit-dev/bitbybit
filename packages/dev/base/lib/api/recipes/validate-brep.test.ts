import { describe, expect, it } from "vitest";
import { checkRecipe } from "./validate";
import { recipeSurfaceMeshes } from "./surface-mesh";

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const SEAM_VERTICES = [1, 0, 0, 1, 0, 2];
const TRIANGLE = [0, 0, 0, 1, 0, 0, 0, 1, 0];
const SPLINE_POINTS = [0, 0, 0, 1, 1, 0, 2, 0, 0];
const SPLINE_KNOTS = [0, 1];
const NET = [0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1];
const NET_KNOTS = [0, 1];
const F64 = [...SEAM_VERTICES, ...TRIANGLE, ...SPLINE_POINTS, ...SPLINE_KNOTS, ...NET, ...NET_KNOTS, 1, 2, 1, -1];
const TRIANGLE_AT = SEAM_VERTICES.length;
const SPLINE_AT = TRIANGLE_AT + TRIANGLE.length;
const KNOTS_AT = SPLINE_AT + SPLINE_POINTS.length;
const NET_AT = KNOTS_AT + SPLINE_KNOTS.length;
const NET_KNOTS_AT = NET_AT + NET.length;
const WEIGHTS_AT = NET_KNOTS_AT + NET_KNOTS.length;

const placement = (z: number): Record<string, number[]> => ({ origin: [0, 0, z], axis: [0, 0, 1], xDirection: [1, 0, 0] });

function cylinder(): Record<string, unknown> {
    return {
        op: "brep",
        vertices: [0, SEAM_VERTICES.length],
        curves: [
            { kind: "circle", ...placement(0), radius: 1 },
            { kind: "circle", ...placement(2), radius: 1 },
            { kind: "line", origin: [1, 0, 0], direction: [0, 0, 1] },
        ],
        surfaces: [
            { kind: "cylinder", ...placement(0), radius: 1 },
            { kind: "plane", ...placement(0) },
            { kind: "plane", ...placement(2) },
        ],
        edges: [
            { curve: 0, start: 0, end: 0 },
            { curve: 1, start: 1, end: 1 },
            { curve: 2, start: 0, end: 1 },
        ],
        faces: [
            { surface: 0, sameSense: true, bounds: [{ outer: true, edges: [0, 2, 1, 2], forward: [true, true, false, false] }] },
            { surface: 1, sameSense: false, bounds: [{ outer: true, edges: [0], forward: [false] }] },
            { surface: 2, sameSense: true, bounds: [{ outer: true, edges: [1], forward: [true] }] },
        ],
        closed: true,
    };
}

function recipeOf(...nodes: unknown[]): unknown {
    return {
        format: "bitbybit.recipe",
        version: 1,
        millimetresPerUnit: 1,
        tolerance: 0.01,
        buffers: { f64: new Float64Array(F64), i32: new Int32Array([0, 1, 2]) },
        nodes: [{ op: "triangles", positions: [TRIANGLE_AT, TRIANGLE.length], indices: [0, 3] }, ...nodes],
        roots: [{ node: nodes.length, matrix: IDENTITY, tag: {} }],
    };
}

function withChanges(change: (node: Record<string, unknown>) => void): unknown {
    const node = cylinder();
    change(node);
    return recipeOf(node);
}

function splineCurve(extra: Record<string, unknown> = {}): Record<string, unknown> {
    return { kind: "bspline", degree: 2, points: [SPLINE_AT, SPLINE_POINTS.length], knots: [KNOTS_AT, SPLINE_KNOTS.length], multiplicities: [3, 3], ...extra };
}

function splineSurface(extra: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        kind: "bspline", uDegree: 1, vDegree: 1, uCount: 2, vCount: 2, points: [NET_AT, NET.length],
        uKnots: [NET_KNOTS_AT, NET_KNOTS.length], uMultiplicities: [2, 2], vKnots: [NET_KNOTS_AT, NET_KNOTS.length], vMultiplicities: [2, 2], ...extra,
    };
}

describe("checkRecipe and the brep node", () => {
    it("should accept a closed cylinder of circles, a seam, a cylindrical side and two caps, with or without a fallback", () => {
        // Arrange
        const plain = recipeOf(cylinder());
        const withFallback = recipeOf({ ...cylinder(), fallback: 0 });

        // Act
        const issues = [...checkRecipe(plain), ...checkRecipe(withFallback)];

        // Assert
        expect(issues).toEqual([]);
    });

    it("should accept every curve and surface kind it knows", () => {
        // Arrange
        const recipe = withChanges((node) => {
            node["curves"] = [
                ...(node["curves"] as unknown[]),
                { kind: "ellipse", ...placement(0), xRadius: 1, yRadius: 3 },
                splineCurve({ weights: [WEIGHTS_AT, 3] }),
            ];
            node["surfaces"] = [
                ...(node["surfaces"] as unknown[]),
                { kind: "cone", ...placement(0), radius: 0, semiAngle: 0.3 },
                { kind: "sphere", ...placement(0), radius: 2 },
                { kind: "torus", ...placement(0), majorRadius: 3, minorRadius: 1 },
                splineSurface({ weights: [WEIGHTS_AT, 4] }),
                { kind: "revolution", curve: 4, origin: [0, 0, 0], axis: [0, 1, 0] },
                { kind: "extrusion", curve: 3, direction: [0, 0, 1] },
            ];
        });

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues.map((issue) => issue.path)).toEqual(["nodes[1].surfaces[6].weights"]);
        expect(issues[0]!.message).toBe("must hold weights above zero");
    });

    it("should refuse a fallback that is not an earlier solid", () => {
        // Arrange
        const later = recipeOf({ ...cylinder(), fallback: 1 });
        const profile = {
            format: "bitbybit.recipe", version: 1, millimetresPerUnit: 1, tolerance: 0.01,
            buffers: { f64: new Float64Array([0, 0, 1, 0, 0, 1, ...F64.slice(0, SEAM_VERTICES.length)]), i32: new Int32Array(0) },
            nodes: [{ op: "polygon", points: [0, 6], holes: [] }, { ...cylinder(), vertices: [6, 6], fallback: 0 }],
            roots: [],
        };

        // Act
        const laterIssues = checkRecipe(later);
        const profileIssues = checkRecipe(profile);

        // Assert
        expect(laterIssues).toContainEqual({ path: "nodes[1].fallback", message: "must be the index of an earlier node, from 0 to 0" });
        expect(profileIssues).toEqual([{ path: "nodes[1].fallback", message: "refers to a profile node where solid is needed" }]);
    });

    it("should refuse a loop whose edges do not meet end to end, naming where it breaks", () => {
        // Arrange
        const recipe = withChanges((node) => {
            const faces = node["faces"] as { bounds: { forward: boolean[] }[] }[];
            faces[0]!.bounds[0]!.forward = [true, false, false, false];
        });

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([{ path: "nodes[1].faces[0].bounds[0].edges[0]", message: "ends at vertex 0, but the next edge of the loop starts at vertex 1" }]);
    });

    it("should refuse indices past the node's own lists", () => {
        // Arrange
        const recipe = withChanges((node) => {
            node["edges"] = [{ curve: 3, start: 0, end: 2 }, { curve: 1, start: 1, end: 1 }, { curve: 2, start: 0, end: 1 }];
            node["faces"] = [{ surface: 3, sameSense: true, bounds: [{ outer: true, edges: [5], forward: [true] }] }];
        });

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([
            { path: "nodes[1].edges[0].curve", message: "must be the index of one of the node's curves, from 0 to 2" },
            { path: "nodes[1].edges[0].end", message: "must be the index of one of the node's vertices, from 0 to 1" },
            { path: "nodes[1].faces[0].surface", message: "must be the index of one of the node's surfaces, from 0 to 2" },
            { path: "nodes[1].faces[0].bounds[0].edges[0]", message: "must be the index of one of the node's edges, from 0 to 2" },
        ]);
    });

    it("should refuse a face without bounds, a bound with a forward flag per edge missing, and two outer bounds", () => {
        // Arrange
        const recipe = withChanges((node) => {
            node["faces"] = [
                { surface: 0, sameSense: true, bounds: [] },
                { surface: 1, sameSense: true, bounds: [{ outer: true, edges: [0], forward: [] }] },
                { surface: 2, sameSense: true, bounds: [{ outer: true, edges: [1], forward: [true] }, { outer: true, edges: [1], forward: [false] }] },
            ];
        });

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([
            { path: "nodes[1].faces[0].bounds", message: "must be a list of at least 1 and at most 10000000 items" },
            { path: "nodes[1].faces[1].bounds[0].forward", message: "must be a list of 1 true or false values, one per edge" },
            { path: "nodes[1].faces[2].bounds", message: "must hold at most one outer bound, not 2" },
        ]);
    });

    it("should refuse a node without faces, and closed or sameSense that are not true or false", () => {
        // Arrange
        const recipe = withChanges((node) => {
            node["faces"] = [];
            node["closed"] = "yes";
            node["edges"] = [{ curve: 0, start: 0, end: 0, sameSense: 1, parameters: [1, 1] }];
        });

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([
            { path: "nodes[1].faces", message: "must be a list of at least 1 and at most 10000000 items" },
            { path: "nodes[1].edges[0].sameSense", message: "must be true or false, or be left out" },
            { path: "nodes[1].edges[0].parameters", message: "must be two different finite numbers, or be left out" },
            { path: "nodes[1].closed", message: "must be true or false" },
        ]);
    });

    it("should refuse a placement whose X direction lies along its axis, and kinds it does not know", () => {
        // Arrange
        const recipe = withChanges((node) => {
            node["curves"] = [{ kind: "circle", origin: [0, 0, 0], axis: [0, 0, 1], xDirection: [0, 0, -2], radius: 1 }, { kind: "parabola" }, { kind: "line", origin: [0, 0, 0], direction: [0, 0, 1] }];
            node["surfaces"] = [{ kind: "nurbs" }, { kind: "plane", ...placement(0) }, { kind: "plane", ...placement(2) }];
        });

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([
            { path: "nodes[1].curves[0].xDirection", message: "lies along the axis, so it gives no X direction" },
            { path: "nodes[1].curves[1].kind", message: "'parabola' is not a curve a brep node knows" },
            { path: "nodes[1].surfaces[0].kind", message: "'nurbs' is not a surface a brep node knows" },
        ]);
    });

    it("should refuse a cone's semi-angle outside a quarter turn, a negative cone radius and a torus without a tube", () => {
        // Arrange
        const recipe = withChanges((node) => {
            node["surfaces"] = [
                { kind: "cone", ...placement(0), radius: -1, semiAngle: Math.PI / 2 },
                { kind: "torus", ...placement(0), majorRadius: 2, minorRadius: 0 },
                { kind: "plane", ...placement(2) },
            ];
        });

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([
            { path: "nodes[1].surfaces[0].radius", message: "must be a finite number of zero or more" },
            { path: "nodes[1].surfaces[0].semiAngle", message: "must be an angle in radians above zero and below a quarter turn" },
            { path: "nodes[1].surfaces[1].minorRadius", message: "must be a number above zero and at most 1000000000" },
        ]);
    });

    it("should refuse B-spline curves whose knots do not rise, whose multiplicities do not add up or repeat an inner knot past the degree, or whose weights do not match", () => {
        // Arrange
        const recipe = withChanges((node) => {
            node["curves"] = [
                splineCurve({ multiplicities: [3, 2] }),
                splineCurve({ knots: [KNOTS_AT - 1, 2] }),
                splineCurve({ weights: [WEIGHTS_AT, 2] }),
                splineCurve({ degree: 1, multiplicities: [2, 2, 2] }),
                splineCurve({ degree: 26 }),
            ];
        });

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([
            { path: "nodes[1].curves[0].multiplicities", message: "must add up to 6, the 3 control points plus the degree plus one, not 5" },
            { path: "nodes[1].curves[1].knots", message: "must rise from one knot to the next" },
            { path: "nodes[1].curves[2].weights", message: "must hold one weight per control point, 3" },
            { path: "nodes[1].curves[3].multiplicities", message: "must be a list of whole numbers, one per knot: from 1 to 2 at the ends and at most 1 between them" },
            { path: "nodes[1].curves[4].degree", message: "must be a whole number from 1 to 25" },
        ]);
    });

    it("should refuse a B-spline surface whose net is not uCount by vCount points or is too small for its degree", () => {
        // Arrange
        const recipe = withChanges((node) => {
            node["surfaces"] = [
                splineSurface({ vCount: 3, vMultiplicities: [2, 3] }),
                splineSurface({ uDegree: 2, uMultiplicities: [3, 3] }),
                { kind: "plane", ...placement(2) },
            ];
        });

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([
            { path: "nodes[1].surfaces[0].points", message: "must hold uCount times vCount control points, 6" },
            { path: "nodes[1].surfaces[0].vMultiplicities", message: "must be a list of whole numbers, one per knot: from 1 to 2 at the ends and at most 1 between them" },
            { path: "nodes[1].surfaces[1].uCount", message: "must be a whole number of at least 3, the degree along u plus one" },
        ]);
    });

    it("should refuse a surface of revolution or extrusion over a curve the node does not have", () => {
        // Arrange
        const recipe = withChanges((node) => {
            node["surfaces"] = [
                { kind: "revolution", curve: 7, origin: [0, 0, 0], axis: [0, 0, 0] },
                { kind: "extrusion", curve: -1, direction: [0, 0, 1] },
                { kind: "plane", ...placement(2) },
            ];
        });

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([
            { path: "nodes[1].surfaces[0].curve", message: "must be the index of one of the node's curves, from 0 to 2" },
            { path: "nodes[1].surfaces[0].axis", message: "must not be a zero vector" },
            { path: "nodes[1].surfaces[1].curve", message: "must be the index of one of the node's curves, from 0 to 2" },
        ]);
    });
});

describe("checkRecipe and a malformed brep node", () => {
    it("should name every part that is not the object, list, range or value its place needs", () => {
        // Arrange
        const recipe = withChanges((node) => {
            node["curves"] = [
                7,
                { kind: "line", origin: [0, 0], direction: [0, 0, 1] },
                { kind: "circle", origin: [0, "0", 0], axis: [0, 0, 1], xDirection: [1, 0, 0], radius: 1 },
                splineCurve({ knots: [9999, 2] }),
                splineCurve({ multiplicities: [3, 1, 2] }),
                splineCurve({ weights: [9999, 3] }),
            ];
            node["surfaces"] = [
                "plane",
                { kind: "revolution", curve: 0, origin: [0, 0], axis: [0, 0, 1] },
                splineSurface({ vCount: 1 }),
                splineSurface({ uDegree: 0, vDegree: 0 }),
            ];
            node["edges"] = [null, { curve: 1, start: 0, end: 1 }];
            node["faces"] = [
                null,
                { surface: 0, sameSense: "yes", bounds: [null, { outer: "yes", edges: [1], forward: [true] }] },
            ];
        });

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        const named = issues.map((issue) => `${issue.path}: ${issue.message}`);
        expect(named).toEqual(expect.arrayContaining([
            "nodes[1].curves[0]: must be an object with a kind",
            "nodes[1].curves[1].origin: must be three numbers, each from -1000000000 to 1000000000",
            "nodes[1].curves[2].origin: must be three numbers, each from -1000000000 to 1000000000",
            "nodes[1].curves[3].knots: runs past the end of its buffer, which holds 44 numbers",
            "nodes[1].curves[4].multiplicities: must hold one multiplicity per knot, 2",
            "nodes[1].curves[5].weights: runs past the end of its buffer, which holds 44 numbers",
            "nodes[1].surfaces[0]: must be an object with a kind",
            "nodes[1].surfaces[1].origin: must be three numbers, each from -1000000000 to 1000000000",
            "nodes[1].surfaces[2].vCount: must be a whole number of at least 2, the degree along v plus one",
            "nodes[1].surfaces[3].uDegree: must be a whole number from 1 to 25",
            "nodes[1].surfaces[3].vDegree: must be a whole number from 1 to 25",
            "nodes[1].edges[0]: must be an object with a curve, a start and an end",
            "nodes[1].faces[0]: must be an object with a surface, sameSense and bounds",
            "nodes[1].faces[1].sameSense: must be true or false",
            "nodes[1].faces[1].bounds[0]: must be an object with outer, edges and forward",
            "nodes[1].faces[1].bounds[1].outer: must be true or false",
        ]));
    });

    it("should refuse lists that are not lists, a vertex range outside the buffer, and an index into a list the node leaves empty", () => {
        // Arrange
        const recipe = withChanges((node) => {
            node["vertices"] = [9999, 3];
            node["curves"] = "none";
            node["edges"] = [{ curve: 0, start: 0, end: 0 }];
        });

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        const named = issues.map((issue) => `${issue.path}: ${issue.message}`);
        expect(named).toEqual(expect.arrayContaining([
            "nodes[1].vertices: runs past the end of its buffer, which holds 44 numbers",
            "nodes[1].curves: must be a list of at most 10000000 items",
            "nodes[1].edges[0].curve: must be the index of one of the node's curves, and it has none",
            "nodes[1].edges[0].start: must be the index of one of the node's vertices, and it has none",
        ]));
    });
});

describe("checkRecipe and a brep node's solids", () => {
    it("should accept a solid naming its outer shell's faces, and one with a cavity", () => {
        // Arrange
        const one = withChanges((node) => {
            node["solids"] = [{ outer: [0, 1, 2] }];
        });
        const hollow = withChanges((node) => {
            node["solids"] = [{ outer: [0, 1], voids: [[2]] }];
        });

        // Act
        const issues = [...checkRecipe(one), ...checkRecipe(hollow)];

        // Assert
        expect(issues).toEqual([]);
    });

    it("should refuse a face two shells hold, a face the node lacks, an empty outer shell, a solid that is not an object, and solids on an open node", () => {
        // Arrange
        const recipe = withChanges((node) => {
            node["solids"] = [{ outer: [0, 1], voids: [[1], [7]] }, 4, { outer: [] }];
        });
        const open = withChanges((node) => {
            node["closed"] = false;
            node["solids"] = [{ outer: [0, 1, 2] }];
        });

        // Act
        const issues = checkRecipe(recipe).map((issue) => `${issue.path}: ${issue.message}`);
        const openIssues = checkRecipe(open).map((issue) => `${issue.path}: ${issue.message}`);

        // Assert
        expect(issues).toEqual([
            "nodes[1].solids[0].voids[0][0]: names face 1, which another shell already holds",
            "nodes[1].solids[0].voids[1][0]: must be the index of one of the node's faces, from 0 to 2",
            "nodes[1].solids[1]: must be an object with an outer shell",
            "nodes[1].solids[2].outer: must be a list of at least 1 and at most 10000000 items",
            "nodes[1].solids: must place each of the node's faces in a shell, and leaves face 2 out",
        ]);
        expect(openIssues).toEqual(["nodes[1].solids: must be left out of a node whose faces do not close a volume"]);
    });

    it("should refuse solids that leave a face out of every shell, naming the first one", () => {
        // Arrange
        const recipe = withChanges((node) => {
            node["solids"] = [{ outer: [1] }];
        });

        // Act
        const issues = checkRecipe(recipe).map((issue) => `${issue.path}: ${issue.message}`);

        // Assert
        expect(issues).toEqual(["nodes[1].solids: must place each of the node's faces in a shell, and leaves face 0 out"]);
    });

    it("should not name a face left out when the solids are not a list at all", () => {
        // Arrange
        const recipe = withChanges((node) => {
            node["solids"] = "all";
        });

        // Act
        const issues = checkRecipe(recipe).map((issue) => issue.path);

        // Assert
        expect(issues).toEqual(["nodes[1].solids"]);
    });
});

describe("recipeSurfaceMeshes and the brep node", () => {
    it("should give a brep root the triangles of its fallback, and nothing for one without a fallback", () => {
        // Arrange
        const withFallback = recipeOf({ ...cylinder(), fallback: 0 });
        const without = recipeOf(cylinder());

        // Act
        const [fallbackMesh] = recipeSurfaceMeshes(withFallback);
        const [none] = recipeSurfaceMeshes(without);

        // Assert
        expect(Array.from(fallbackMesh!.positions)).toEqual(TRIANGLE);
        expect(Array.from(fallbackMesh!.indices)).toEqual([0, 1, 2]);
        expect(none).toBeUndefined();
    });
});
