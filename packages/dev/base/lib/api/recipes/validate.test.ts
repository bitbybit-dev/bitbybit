import { describe, expect, it } from "vitest";
import type { Base } from "../inputs/base-inputs";
import { InputError } from "../kernel-calls/errors";
import { assertRecipe, checkRecipe } from "./validate";

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const BEYOND_COORDINATES = 2e10;

function wallRecipe(): Base.Recipe {
    return {
        format: "bitbybit.recipe",
        version: 1,
        millimetresPerUnit: 1,
        tolerance: 0.01,
        buffers: { f64: new Float64Array([0, 0, 5000, 0, 5000, 200, 0, 200, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]), i32: new Int32Array([0, 1, 2, 0, 1, 3]) },
        nodes: [
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 2700 },
            { op: "halfSpace", origin: [0, 0, 2400], normal: [0, -0.2, 1] },
            { op: "difference", of: 1, tools: [2] },
            { op: "circle", center: [0, 0], radius: 100 },
            { op: "extrude", profile: 4, direction: [0, 0, 1], depth: 300 },
            { op: "transform", of: 5, matrix: [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 1800, 300, 900, 1] },
            { op: "voids", host: 3, openings: [6] },
            { op: "triangles", positions: [8, 12], indices: [0, 6] },
            { op: "compound", of: [7, 8] },
        ],
        roots: [{ node: 9, matrix: IDENTITY, tag: { globalId: "2O2Fr$t4X7Zf8NOew3FLOH" } }],
    };
}

function withNode(index: number, node: unknown): unknown {
    const recipe = wallRecipe();
    return { ...recipe, nodes: recipe.nodes.map((existing, at) => (at === index ? node : existing)) };
}

function chainOfTransforms(length: number): Base.Recipe {
    const transforms: Base.RecipeNode[] = Array.from({ length: length - 2 }, (_, at) => ({ op: "transform", of: at + 1, matrix: IDENTITY }));
    return { ...wallRecipe(), nodes: [{ op: "polygon", points: [0, 8], holes: [] }, { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 1 }, ...transforms], roots: [] };
}

function afterAFullIssueList(node: unknown): unknown {
    return { ...wallRecipe(), nodes: [...Array.from({ length: 150 }, () => ({ op: "loft" })), node], roots: [] };
}

function countingReads(values: Float64Array): { buffer: Float64Array; reads: () => number } {
    let count = 0;
    const buffer = new Proxy(values, {
        get(target, key): unknown {
            if (typeof key === "string" && /^\d+$/.test(key)) {
                count++;
            }
            const value: unknown = Reflect.get(target, key);
            return typeof value === "function" ? value.bind(target) : value;
        },
    });
    return { buffer, reads: () => count };
}

describe("checkRecipe", () => {
    it("should accept a recipe that uses every kind of node", () => {
        // Act
        const issues = checkRecipe(wallRecipe());

        // Assert
        expect(issues).toEqual([]);
    });

    it("should refuse something that is not an object", () => {
        // Act
        const issues = checkRecipe([1, 2]);

        // Assert
        expect(issues).toEqual([{ path: "", message: "a recipe must be an object" }]);
    });

    it("should name a wrong format or version", () => {
        // Act
        const issues = checkRecipe({ ...wallRecipe(), version: 2 });

        // Assert
        expect(issues.map((issue) => issue.path)).toEqual(["format"]);
    });

    it("should refuse units and tolerances that are not above zero", () => {
        // Act
        const issues = checkRecipe({ ...wallRecipe(), millimetresPerUnit: 0, tolerance: Number.NaN });

        // Assert
        expect(issues.map((issue) => issue.path)).toEqual(["millimetresPerUnit", "tolerance"]);
    });

    it("should refuse buffers that are not typed arrays, without looking at the nodes", () => {
        // Act
        const issues = checkRecipe({ ...wallRecipe(), buffers: { f64: [0, 1], i32: new Int32Array() } });

        // Assert
        expect(issues).toEqual([{ path: "buffers", message: "must hold an f64 Float64Array and an i32 Int32Array" }]);
    });

    it("should refuse buffers that are not an object", () => {
        // Act
        const issues = checkRecipe({ ...wallRecipe(), buffers: "f64" });

        // Assert
        expect(issues).toEqual([{ path: "buffers", message: "must hold an f64 Float64Array and an i32 Int32Array" }]);
    });

    it("should refuse a buffer beyond the size limit before reading it", () => {
        // Arrange
        const huge: unknown = Object.defineProperty(Object.create(Float64Array.prototype), "length", { value: 2_000_000_000 });

        // Act
        const issues = checkRecipe({ ...wallRecipe(), buffers: { f64: huge, i32: new Int32Array() } });

        // Assert
        expect(issues).toEqual([{ path: "buffers", message: "must each hold at most 1000000000 numbers" }]);
    });

    it("should refuse nodes that are not a list", () => {
        // Act
        const issues = checkRecipe({ ...wallRecipe(), nodes: {} });

        // Assert
        expect(issues).toEqual([{ path: "nodes", message: "must be a list of at most 10000000 nodes" }]);
    });

    it("should refuse roots that are not a list with a message of their own", () => {
        // Act
        const issues = checkRecipe({ ...wallRecipe(), roots: {} });

        // Assert
        expect(issues).toEqual([{ path: "roots", message: "must be a list of at most 10000000 roots" }]);
    });

    it("should refuse a node that refers forward to a later node", () => {
        // Act
        const issues = checkRecipe(withNode(1, { op: "extrude", profile: 4, direction: [0, 0, 1], depth: 1 }));

        // Assert
        expect(issues).toContainEqual({ path: "nodes[1].profile", message: "must be the index of an earlier node, from 0 to 0" });
    });

    it("should say that no node comes before the first one when it refers to another", () => {
        // Act
        const issues = checkRecipe(withNode(0, { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 1 }));

        // Assert
        expect(issues).toContainEqual({ path: "nodes[0].profile", message: "must be the index of an earlier node, and none comes before it" });
    });

    it("should refuse an extrusion of a solid rather than a profile", () => {
        // Act
        const issues = checkRecipe(withNode(5, { op: "extrude", profile: 1, direction: [0, 0, 1], depth: 1 }));

        // Assert
        expect(issues).toContainEqual({ path: "nodes[5].profile", message: "refers to a solid node where profile is needed" });
    });

    it("should accept a half-space only as the tool of a difference", () => {
        // Act
        const issues = checkRecipe(withNode(7, { op: "voids", host: 3, openings: [2] }));

        // Assert
        expect(issues).toContainEqual({ path: "nodes[7].openings[0]", message: "refers to a halfSpace node where solid is needed" });
    });

    it("should refuse a polygon range that runs past its buffer or holds an odd count", () => {
        // Act
        const past = checkRecipe(withNode(0, { op: "polygon", points: [10, 20], holes: [] }));
        const odd = checkRecipe(withNode(0, { op: "polygon", points: [0, 7], holes: [] }));

        // Assert
        expect(past[0]).toEqual({ path: "nodes[0].points", message: "runs past the end of its buffer, which holds 20 numbers" });
        expect(odd[0]).toEqual({ path: "nodes[0].points", message: "must hold a multiple of 2 numbers, at least 6" });
    });

    it("should refuse a polygon without a holes list and a range that is not two whole numbers", () => {
        // Act
        const issues = checkRecipe(withNode(0, { op: "polygon", points: [0.5, 8] }));

        // Assert
        expect(issues.map((issue) => issue.path)).toEqual(["nodes[0].points", "nodes[0].holes"]);
    });

    it("should check every hole's range and name the hole that is wrong", () => {
        // Act
        const issues = checkRecipe(withNode(0, { op: "polygon", points: [0, 8], holes: [[0, 8], [10, 40]] }));

        // Assert
        expect(issues).toEqual([{ path: "nodes[0].holes[1]", message: "runs past the end of its buffer, which holds 20 numbers" }]);
    });

    it("should name a range field that holds a number instead of a range", () => {
        // Act
        const issues = checkRecipe(withNode(8, { op: "triangles", positions: 5, indices: [0, 6] }));

        // Assert
        expect(issues).toEqual([{ path: "nodes[8].positions", message: "must be a range of two whole numbers, a start and a count" }]);
    });

    it("should name a holes field that holds a number instead of a list", () => {
        // Act
        const issues = checkRecipe(withNode(0, { op: "polygon", points: [0, 8], holes: 7 }));

        // Assert
        expect(issues).toEqual([{ path: "nodes[0].holes", message: "must be a list of ranges, empty when there are no holes" }]);
    });

    it("should report rather than throw on range fields that are not ranges once the issue list is full", () => {
        // Act
        const triangles = checkRecipe(afterAFullIssueList({ op: "triangles", positions: 5, indices: 6 }));
        const polygon = checkRecipe(afterAFullIssueList({ op: "polygon", points: 5, holes: 7 }));

        // Assert
        expect(triangles).toHaveLength(100);
        expect(polygon).toHaveLength(100);
    });

    it("should not read triangle indices through a range it refused once the issue list is full", () => {
        // Act
        const issues = checkRecipe(afterAFullIssueList({ op: "triangles", positions: [8, 12], indices: [0, 3e9] }));

        // Assert
        expect(issues).toHaveLength(100);
    });

    it("should find a coordinate that is not finite and name where it sits in the buffer", () => {
        // Arrange
        const recipe = wallRecipe();
        recipe.buffers.f64[3] = Number.POSITIVE_INFINITY;

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([{ path: "buffers.f64[3]", message: "holds Infinity, where every number must be a coordinate from -1000000000 to 1000000000" }]);
    });

    it("should refuse a number of the buffer that no node reads when it is not a coordinate", () => {
        // Act
        const issues = checkRecipe({ ...wallRecipe(), buffers: { f64: new Float64Array([0, 0, 5000, 0, 5000, 200, 0, 200, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, Number.NaN]), i32: new Int32Array([0, 1, 2, 0, 1, 3]) } });

        // Assert
        expect(issues).toEqual([{ path: "buffers.f64[20]", message: "holds NaN, where every number must be a coordinate from -1000000000 to 1000000000" }]);
    });

    it("should refuse a coordinate too large for a kernel to hold", () => {
        // Arrange
        const recipe = wallRecipe();
        recipe.buffers.f64[2] = BEYOND_COORDINATES;

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([{ path: "buffers.f64[2]", message: "holds 20000000000, where every number must be a coordinate from -1000000000 to 1000000000" }]);
    });

    it("should read each coordinate once however many nodes share its range", () => {
        // Arrange
        const shared = countingReads(new Float64Array(1000));
        const polygons: Base.RecipeNode[] = Array.from({ length: 50 }, () => ({ op: "polygon", points: [0, 1000], holes: [[0, 1000]] }));

        // Act
        const issues = checkRecipe({ ...wallRecipe(), buffers: { f64: shared.buffer, i32: new Int32Array() }, nodes: polygons, roots: [] });

        // Assert
        expect(issues).toEqual([]);
        expect(shared.reads()).toBe(1000);
    });

    it("should refuse nodes that together refer to more numbers than a recipe may build from", () => {
        // Arrange
        const million = new Float64Array(1_000_000);
        const polygons: Base.RecipeNode[] = Array.from({ length: 1001 }, () => ({ op: "polygon", points: [0, 1_000_000], holes: [] }));

        // Act
        const issues = checkRecipe({ ...wallRecipe(), buffers: { f64: million, i32: new Int32Array() }, nodes: polygons, roots: [] });

        // Assert
        expect(issues).toEqual([{ path: "nodes", message: "refer to 1001000000 numbers of the buffers in all, more than the 1000000000 a recipe may build from" }]);
    });

    it("should stop reading triangle indices once the nodes refer to more numbers than a recipe may build from", () => {
        // Arrange
        const million = new Float64Array(1_000_000);
        const polygons: Base.RecipeNode[] = Array.from({ length: 1001 }, () => ({ op: "polygon", points: [0, 1_000_000], holes: [] }));
        const badCorners: Base.RecipeNode = { op: "triangles", positions: [0, 9], indices: [0, 3] };

        // Act
        const issues = checkRecipe({ ...wallRecipe(), buffers: { f64: million, i32: new Int32Array([0, 1, 7]) }, nodes: [...polygons, badCorners], roots: [] });

        // Assert
        expect(issues.map((issue) => issue.path)).toEqual(["nodes"]);
    });

    it("should refuse an extrusion of no depth, a zero direction and one in the XY plane", () => {
        // Act
        const depth = checkRecipe(withNode(1, { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 0 }));
        const zero = checkRecipe(withNode(1, { op: "extrude", profile: 0, direction: [0, 0, 0], depth: 1 }));
        const flat = checkRecipe(withNode(1, { op: "extrude", profile: 0, direction: [1, 0, 0], depth: 1 }));

        // Assert
        expect(depth).toContainEqual({ path: "nodes[1].depth", message: "must be a number above zero and at most 1000000000" });
        expect(zero).toContainEqual({ path: "nodes[1].direction", message: "must not be a zero vector" });
        expect(flat).toContainEqual({ path: "nodes[1].direction", message: "lies in the XY plane, so the sweep has no volume" });
    });

    it("should refuse an extrusion too deep or along a direction too large for a kernel to hold", () => {
        // Act
        const issues = checkRecipe(withNode(1, { op: "extrude", profile: 0, direction: [0, 0, 1e300], depth: 1e308 }));

        // Assert
        expect(issues).toEqual([
            { path: "nodes[1].direction", message: "must be three numbers, each from -1000000000 to 1000000000" },
            { path: "nodes[1].depth", message: "must be a number above zero and at most 1000000000" },
        ]);
    });

    it("should refuse a circle without a finite centre or a radius above zero", () => {
        // Act
        const issues = checkRecipe(withNode(4, { op: "circle", center: [0], radius: -1 }));

        // Assert
        expect(issues.map((issue) => issue.path)).toEqual(["nodes[4].center", "nodes[4].radius"]);
    });

    it("should refuse a circle centred or sized beyond what a kernel can hold", () => {
        // Act
        const issues = checkRecipe(withNode(4, { op: "circle", center: [BEYOND_COORDINATES, 0], radius: BEYOND_COORDINATES }));

        // Assert
        expect(issues).toEqual([
            { path: "nodes[4].center", message: "must be two numbers, each from -1000000000 to 1000000000" },
            { path: "nodes[4].radius", message: "must be a number above zero and at most 1000000000" },
        ]);
    });

    it("should refuse a half-space with a zero normal and an origin that is not three numbers", () => {
        // Act
        const issues = checkRecipe(withNode(2, { op: "halfSpace", origin: [0, 0], normal: [0, 0, 0] }));

        // Assert
        expect(issues.map((issue) => issue.path)).toEqual(["nodes[2].origin", "nodes[2].normal"]);
    });

    it("should refuse a half-space whose origin lies beyond what a kernel can hold", () => {
        // Act
        const issues = checkRecipe(withNode(2, { op: "halfSpace", origin: [0, 0, 1e300], normal: [0, 0, 1] }));

        // Assert
        expect(issues).toEqual([{ path: "nodes[2].origin", message: "must be three numbers, each from -10000000000000 to 10000000000000" }]);
    });

    it("should refuse a difference without tools and a compound without parts", () => {
        // Act
        const difference = checkRecipe(withNode(3, { op: "difference", of: 1, tools: [] }));
        const compound = checkRecipe(withNode(9, { op: "compound", of: [] }));

        // Assert
        expect(difference).toContainEqual({ path: "nodes[3].tools", message: "must be a list of at least one node index" });
        expect(compound).toContainEqual({ path: "nodes[9].of", message: "must be a list of at least one node index" });
    });

    it("should accept voids without openings but refuse openings that are not a list", () => {
        // Act
        const empty = checkRecipe(withNode(7, { op: "voids", host: 3, openings: [] }));
        const wrong = checkRecipe(withNode(7, { op: "voids", host: 3, openings: 6 }));

        // Assert
        expect(empty).toEqual([]);
        expect(wrong).toContainEqual({ path: "nodes[7].openings", message: "must be a list of node indices" });
    });

    it("should refuse a matrix that is not sixteen numbers or that flattens", () => {
        // Act
        const short = checkRecipe(withNode(6, { op: "transform", of: 5, matrix: [1, 0, 0] }));
        const flat = checkRecipe(withNode(6, { op: "transform", of: 5, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1] }));

        // Assert
        expect(short).toContainEqual({ path: "nodes[6].matrix", message: "must be sixteen numbers in column-major order, each from -10000000000000 to 10000000000000" });
        expect(flat).toContainEqual({ path: "nodes[6].matrix", message: "flattens what it transforms: its rotation and scale part has no inverse" });
    });

    it("should refuse a matrix whose translation lies beyond what a kernel can hold", () => {
        // Act
        const issues = checkRecipe(withNode(6, { op: "transform", of: 5, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1e14, 0, 0, 1] }));

        // Assert
        expect(issues).toEqual([{ path: "nodes[6].matrix", message: "must be sixteen numbers in column-major order, each from -10000000000000 to 10000000000000" }]);
    });

    it("should take a placement in survey coordinates, millions of metres out in millimetres, and a mirror", () => {
        // Act
        const surveyed = checkRecipe({ ...wallRecipe(), roots: [{ node: 9, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5.8e9, 3.2e8, 0, 1], tag: {} }] });
        const mirrored = checkRecipe(withNode(6, { op: "transform", of: 5, matrix: [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }));

        // Assert
        expect(surveyed).toEqual([]);
        expect(mirrored).toEqual([]);
    });

    it("should refuse a transform matrix that projects rather than moves, turns and scales", () => {
        // Act
        const weighted = checkRecipe(withNode(6, { op: "transform", of: 5, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2] }));
        const perspective = checkRecipe(withNode(6, { op: "transform", of: 5, matrix: [1, 0, 0, 0.5, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }));

        // Assert
        const message = "must have 0, 0, 0, 1 as its bottom row, at indices 3, 7, 11 and 15: it moves, turns, mirrors and scales, and never projects";
        expect(weighted).toEqual([{ path: "nodes[6].matrix", message }]);
        expect(perspective).toEqual([{ path: "nodes[6].matrix", message }]);
    });

    it("should refuse a root matrix that projects", () => {
        // Act
        const issues = checkRecipe({ ...wallRecipe(), roots: [{ node: 9, matrix: [1, 0, 0, 0, 0, 1, 0, 0.1, 0, 0, 1, 0, 0, 0, 0, 1], tag: {} }] });

        // Assert
        expect(issues.map((issue) => issue.path)).toEqual(["roots[0].matrix"]);
    });

    it("should refuse triangle indices outside the node's positions", () => {
        // Arrange
        const recipe = wallRecipe();
        recipe.buffers.i32[5] = 4;

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([{ path: "nodes[8].indices", message: "points at position 4, but the node has 4 positions" }]);
    });

    it("should refuse negative triangle indices", () => {
        // Arrange
        const recipe = wallRecipe();
        recipe.buffers.i32[0] = -1;

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([{ path: "nodes[8].indices", message: "points at position -1, but the node has 4 positions" }]);
    });

    it("should refuse a node that is not an object and an operation recipes do not know", () => {
        // Act
        const missing = checkRecipe(withNode(9, "compound"));
        const unknown = checkRecipe(withNode(9, { op: "loft", of: [7] }));

        // Assert
        expect(missing).toContainEqual({ path: "nodes[9]", message: "must be an object with an op" });
        expect(unknown).toContainEqual({ path: "nodes[9].op", message: "'loft' is not an operation recipes know" });
    });

    it("should accept nodes nested as deep as the limit", () => {
        // Act
        const issues = checkRecipe(chainOfTransforms(1000));

        // Assert
        expect(issues).toEqual([]);
    });

    it("should refuse nodes nested deeper than the limit, naming where the chain first crosses it", () => {
        // Act
        const issues = checkRecipe(chainOfTransforms(1005));

        // Assert
        expect(issues).toEqual([{ path: "nodes[1000]", message: "stands 1001 steps deep, more than the 1000 a recipe may nest" }]);
    });

    it("should measure a node's depth by the deepest of the nodes it lists", () => {
        // Arrange
        const chain = chainOfTransforms(1000);
        const recipe: Base.Recipe = { ...chain, nodes: [...chain.nodes, { op: "compound", of: [1, 999] }] };

        // Act
        const issues = checkRecipe(recipe);

        // Assert
        expect(issues).toEqual([{ path: "nodes[1000]", message: "stands 1001 steps deep, more than the 1000 a recipe may nest" }]);
    });

    it("should refuse a root that builds a profile, has no matrix or no tag", () => {
        // Act
        const issues = checkRecipe({ ...wallRecipe(), roots: [{ node: 0, matrix: IDENTITY, tag: {} }, { node: 9, tag: {} }, { node: 9, matrix: IDENTITY }, 7] });

        // Assert
        expect(issues.map((issue) => issue.path)).toEqual(["roots[0].node", "roots[1].matrix", "roots[2].tag", "roots[3]"]);
    });

    it("should refuse a gap in the list of nodes rather than skip over it", () => {
        // Arrange
        const gappy: unknown[] = [];
        gappy[0] = { op: "polygon", points: [0, 8], holes: [] };
        gappy[2] = { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 1 };

        // Act
        const issues = checkRecipe({ ...wallRecipe(), nodes: gappy, roots: [] });

        // Assert
        expect(issues).toEqual([{ path: "nodes[1]", message: "must be an object with an op" }]);
    });

    it("should refuse a gap in the list of roots rather than skip over it", () => {
        // Arrange
        const gappy: unknown[] = [];
        gappy[1] = { node: 9, matrix: IDENTITY, tag: {} };

        // Act
        const issues = checkRecipe({ ...wallRecipe(), roots: gappy });

        // Assert
        expect(issues).toEqual([{ path: "roots[0]", message: "must be an object with a node, a matrix and a tag" }]);
    });

    it("should refuse a gap in a range, a point, a list of holes and a list of tools", () => {
        // Arrange
        const range: unknown[] = [];
        range[1] = 8;
        const point: unknown[] = [];
        point[1] = 0;
        const holes: unknown[] = [];
        holes[1] = [0, 8];
        const tools: unknown[] = [];
        tools[1] = 2;
        const recipe = wallRecipe();
        const nodes: unknown[] = [...recipe.nodes];
        nodes[0] = { op: "polygon", points: range, holes };
        nodes[3] = { op: "difference", of: 1, tools };
        nodes[4] = { op: "circle", center: point, radius: 100 };

        // Act
        const issues = checkRecipe({ ...recipe, nodes });

        // Assert
        expect(issues.map((issue) => issue.path)).toEqual(["nodes[0].points", "nodes[0].holes[0]", "nodes[3].tools[0]", "nodes[4].center"]);
    });

    it("should stop listing after a hundred issues", () => {
        // Act
        const issues = checkRecipe({ ...wallRecipe(), nodes: Array.from({ length: 150 }, () => ({ op: "loft" })), roots: [] });

        // Assert
        expect(issues).toHaveLength(100);
    });
});

describe("assertRecipe", () => {
    it("should pass a valid recipe through", () => {
        // Act & Assert
        expect(() => assertRecipe(wallRecipe())).not.toThrow();
    });

    it("should throw an input error naming the first three problems", () => {
        // Act
        const attempt = (): void => assertRecipe({ ...wallRecipe(), millimetresPerUnit: -1, tolerance: 0, nodes: [{ op: "loft" }, { op: "loft" }], roots: [] });

        // Assert
        expect(attempt).toThrow(InputError);
        expect(attempt).toThrow("The recipe cannot be built: millimetresPerUnit must be a finite number above zero; tolerance must be a finite number above zero; nodes[0].op 'loft' is not an operation recipes know");
    });

    it("should leave out the path when the problem is the whole value", () => {
        // Act & Assert
        expect(() => assertRecipe(null)).toThrow("The recipe cannot be built: a recipe must be an object");
    });
});
