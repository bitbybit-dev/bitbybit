import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type * as Inputs from "../inputs";
import { BaseBitByBit } from "./base-bitbybit";

type Matrix = Inputs.Base.TransformMatrix;
type Vec = Inputs.Base.Point3;

interface Chain {
    recipe: Inputs.Base.Recipe;
    steps: Matrix[];
    placement: Matrix;
    size: Vec;
}

const base = new BaseBitByBit();
const SEED = 20261018;
const RUNS = 150;

const CORNERS: Vec[] = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
const FACES = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7];

const applied = (matrix: readonly number[], [x, y, z]: Vec): Vec => [0, 1, 2].map(row => matrix[row]! * x + matrix[4 + row]! * y + matrix[8 + row]! * z + matrix[12 + row]!) as Vec;

const determinant = (m: readonly number[]): number => m[0]! * (m[5]! * m[10]! - m[6]! * m[9]!) - m[4]! * (m[1]! * m[10]! - m[2]! * m[9]!) + m[8]! * (m[1]! * m[6]! - m[2]! * m[5]!);

const isRigidByColumns = (m: readonly number[]): boolean => {
    const columns = [0, 4, 8].map(start => [m[start]!, m[start + 1]!, m[start + 2]!]);
    const dot = (a: number[], b: number[]): number => a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!;
    return columns.every(column => Math.abs(Math.sqrt(dot(column, column)) - 1) <= 1e-7)
        && Math.abs(dot(columns[0]!, columns[1]!)) <= 1e-7 && Math.abs(dot(columns[0]!, columns[2]!)) <= 1e-7 && Math.abs(dot(columns[1]!, columns[2]!)) <= 1e-7
        && determinant(m) > 0;
};

const axis = fc.tuple(fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true })).filter(v => Math.hypot(...v) > 0.1);
const spot = fc.tuple(fc.double({ min: -1e4, max: 1e4, noNaN: true }), fc.double({ min: -1e4, max: 1e4, noNaN: true }), fc.double({ min: -1e4, max: 1e4, noNaN: true }));

const stepArbitrary: fc.Arbitrary<Matrix> = fc.oneof(
    { weight: 3, arbitrary: fc.record({ around: axis, angle: fc.double({ min: -360, max: 360, noNaN: true }), centre: spot }).map(({ around, angle, centre }) => base.transforms.combine({ transformation: base.transforms.rotationCenterAxis({ center: centre, axis: around, angle }) })[0]!) },
    { weight: 2, arbitrary: spot.map(translation => base.transforms.translationXYZ({ translation })[0]!) },
    { weight: 1, arbitrary: fc.constantFrom<Vec>([-1, 1, 1], [1, -1, 1], [1, 1, -1]).map(scaleXyz => base.transforms.scaleXYZ({ scaleXyz })[0]!) },
    { weight: 1, arbitrary: fc.double({ min: 0.1, max: 10, noNaN: true }).map(scale => base.transforms.uniformScale({ scale })[0]!) },
);

const chainArbitrary: fc.Arbitrary<Chain> = fc.record({
    size: fc.tuple(fc.double({ min: 0.01, max: 100, noNaN: true }), fc.double({ min: 0.01, max: 100, noNaN: true }), fc.double({ min: 0.01, max: 100, noNaN: true })),
    steps: fc.array(stepArbitrary, { minLength: 0, maxLength: 6 }),
    placement: stepArbitrary,
}).map(({ size, steps: given, placement: placing }) => {
    const signedZeroFree = (matrix: Matrix): Matrix => matrix.map(value => value + 0) as Matrix;
    const steps = given.map(signedZeroFree);
    const placement = signedZeroFree(placing);
    const nodes: Inputs.Base.RecipeNode[] = [{ op: "triangles", positions: [0, 24], indices: [0, 36] }];
    steps.forEach((matrix, index) => nodes.push({ op: "transform", of: index, matrix }));
    const recipe: Inputs.Base.Recipe = {
        format: "bitbybit.recipe",
        version: 1,
        millimetresPerUnit: 1,
        tolerance: 1e-6,
        buffers: { f64: new Float64Array(CORNERS.flatMap(([x, y, z]) => [x * size[0], y * size[1], z * size[2]])), i32: new Int32Array(FACES) },
        nodes,
        roots: [{ node: nodes.length - 1, matrix: placement, tag: {} }],
    };
    return { recipe, steps, placement, size };
});

const placedCorner = ({ steps, placement, size }: Chain, corner: Vec): Vec => {
    const inside = steps.reduce<Vec>((moved, matrix) => applied(matrix, moved), [corner[0] * size[0], corner[1] * size[1], corner[2] * size[2]]);
    return applied(placement, inside);
};

const signedVolume = (positions: ArrayLike<number>, indices: ArrayLike<number>): number => {
    let sixfold = 0;
    for (let at = 0; at + 2 < indices.length; at += 3) {
        const [a, b, c] = [indices[at]!, indices[at + 1]!, indices[at + 2]!].map(index => [positions[index * 3]!, positions[index * 3 + 1]!, positions[index * 3 + 2]!]);
        sixfold += a![0]! * (b![1]! * c![2]! - b![2]! * c![1]!) - a![1]! * (b![0]! * c![2]! - b![2]! * c![0]!) + a![2]! * (b![0]! * c![1]! - b![1]! * c![0]!);
    }
    return sixfold / 6;
};

const reachOf = (chain: Chain): number => CORNERS.reduce((largest, corner) => Math.max(largest, ...placedCorner(chain, corner).map(Math.abs)), 1);

describe("recipes against independent oracles", () => {
    it("should find nothing wrong with a box placed through any chain of turns, moves, mirrors and scales", () => {
        // Act & Assert
        fc.assert(fc.property(chainArbitrary, ({ recipe }) => {
            expect(base.recipes.check({ recipe })).toEqual([]);
        }), { seed: SEED, numRuns: RUNS });
    });

    it("should place a root of triangles through every transform below it and then its own matrix, first step first", () => {
        // Act & Assert
        fc.assert(fc.property(chainArbitrary, (chain) => {
            const [mesh] = base.recipes.surfaceMeshes({ recipe: chain.recipe });
            const reach = reachOf(chain);
            CORNERS.forEach((corner, index) => {
                const expected = placedCorner(chain, corner);
                [0, 1, 2].forEach(axisIndex => expect(Math.abs(mesh!.positions[index * 3 + axisIndex]! - expected[axisIndex]!)).toBeLessThanOrEqual(1e-6 * reach));
            });
        }), { seed: SEED, numRuns: RUNS });
    });

    it("should keep the box's outside out, its volume the box's times the size of every scale, through any mirror", () => {
        // Act & Assert
        fc.assert(fc.property(chainArbitrary, (chain) => {
            const [mesh] = base.recipes.surfaceMeshes({ recipe: chain.recipe });
            const positions = Array.from(mesh!.positions, value => value);
            const factor = Math.abs([...chain.steps, chain.placement].reduce((total, matrix) => total * determinant(matrix), 1));
            const expected = chain.size[0] * chain.size[1] * chain.size[2] * factor;
            const volume = signedVolume(positions, mesh!.indices);
            expect(volume).toBeGreaterThan(0);
            expect(Math.abs(volume - expected)).toBeLessThanOrEqual(1e-4 * expected + 1e-6 * reachOf(chain) ** 2 * Math.cbrt(expected));
        }), { seed: SEED, numRuns: RUNS });
    });

    it("should fold every rigid transform at the top of a chain into the placement and stop at the first that mirrors or scales", () => {
        // Act & Assert
        fc.assert(fc.property(chainArbitrary, (chain) => {
            const top = chain.recipe.nodes.length - 1;
            const source = base.recipes.sourceOf({ recipe: chain.recipe, node: top, matrix: chain.placement });
            const folded = chain.steps.slice(source.node);
            const kept = chain.steps.slice(0, source.node);
            expect(folded.every(isRigidByColumns)).toBe(true);
            expect(source.node === 0 || !isRigidByColumns(chain.steps[source.node - 1]!)).toBe(true);
            const reach = reachOf(chain);
            CORNERS.forEach(corner => {
                const below = kept.reduce<Vec>((moved, matrix) => applied(matrix, moved), [corner[0] * chain.size[0], corner[1] * chain.size[1], corner[2] * chain.size[2]]);
                const viaSource = applied(source.matrix, below);
                const direct = placedCorner(chain, corner);
                [0, 1, 2].forEach(axisIndex => expect(Math.abs(viaSource[axisIndex]! - direct[axisIndex]!)).toBeLessThanOrEqual(1e-9 * reach));
            });
        }), { seed: SEED, numRuns: RUNS });
    });

    it("should read back from JSON, where the buffers are lists, the same recipe", () => {
        // Act & Assert
        fc.assert(fc.property(chainArbitrary, ({ recipe }) => {
            const json: unknown = JSON.parse(JSON.stringify({ ...recipe, buffers: { f64: Array.from(recipe.buffers.f64), i32: Array.from(recipe.buffers.i32) } }));
            expect(base.recipes.read({ recipe: json as Inputs.Base.Recipe })).toEqual(recipe);
        }), { seed: SEED, numRuns: RUNS });
    });
});
