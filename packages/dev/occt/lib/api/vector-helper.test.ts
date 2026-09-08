import { describe, it, expect, beforeAll } from "vitest";
import { Inputs } from ".";
import { VectorHelperService } from "./vector-helper.service";

const removeAllDuplicateVectorsQuadraticOracle = (
    service: VectorHelperService,
    vectors: number[][],
    tolerance = 1e-7,
): number[][] => {
    const cleanVectors: number[][] = [];
    vectors.forEach(vector => {
        if (!cleanVectors.some(s => service.vectorsTheSame(vector, s, tolerance))) {
            cleanVectors.push(vector);
        }
    });
    return cleanVectors;
};

const expectSameAsOracle = (
    service: VectorHelperService,
    vectors: number[][],
    tolerance?: number,
): number[][] => {
    const expected = tolerance === undefined
        ? removeAllDuplicateVectorsQuadraticOracle(service, vectors)
        : removeAllDuplicateVectorsQuadraticOracle(service, vectors, tolerance);
    const actual = tolerance === undefined
        ? service.removeAllDuplicateVectors(vectors)
        : service.removeAllDuplicateVectors(vectors, tolerance);
    expect(actual.length).toBe(expected.length);
    for (let i = 0; i < expected.length; i++) {
        expect(actual[i]).toBe(expected[i]);
    }
    return actual;
};

const mulberry32 = (seed: number) => {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};


describe("OCCT vector helper unit tests", () => {

    let service: VectorHelperService;

    beforeAll(async () => {
        service = new VectorHelperService();
    });

    it("should convert degrees to radians", () => {
        expect(service.degToRad(180)).toBe(Math.PI);
    });

    it("should remap value", () => {
        expect(service.remap(5, 0, 10, 0, 100)).toBe(50);
    });

    it("should remove all duplicate vectors", () => {
        const vectors = [[1, 2, 3], [1, 2, 3], [1, 2, 3]];
        expect(service.removeAllDuplicateVectors(vectors)).toEqual([[1, 2, 3]]);
    });

    it("should compute average vector", () => {
        const vectors = [[1, 2, 3], [2, 3, 4], [3, 4, 5]];
        expect(service.averageVector(vectors)).toEqual([2, 3, 4]);
    });

    it("should compute magnitude of the vector", () => {
        const vector = [1, 2, 3];
        expect(service.magnitude(vector)).toEqual(Math.sqrt(14));
    });

    it("should normalize vector", () => {
        const vector = [1, 2, 3];
        const magnitude = service.magnitude(vector);
        expect(service.normalize(vector)).toEqual([1 / magnitude, 2 / magnitude, 3 / magnitude]);
    });

    it("should translate point", () => {
        const point = [1, 2, 3] as Inputs.Base.Point3;
        const vector = [1, 2, 3] as Inputs.Base.Vector3;
        const distance = 2;
        const res = service.translatePoint(point, vector, distance);
        expect(res).toEqual([3, 6, 9]);
    });

    it("should check if vectors are the same", () => {
        const vec1 = [1, 2, 3];
        const vec2 = [1, 2, 3, 6];
        const res = service.vectorsTheSame(vec1, vec2, 1e-7);
        expect(res).toEqual(false);
    });

    it("should remove all duplicates", () => {
        const vectors = [[1, 2, 3], [2, 5, 6], [1, 2, 3], [2, 5, 6], [1, 2, 3]];
        const res = service.removeAllDuplicateVectors(vectors);
        expect(res).toEqual([[1, 2, 3], [2, 5, 6]]);
    });

    it("should remove consecutive duplicates", () => {
        const vectors = [[1, 2, 3], [2, 5, 6], [1, 2, 3], [2, 5, 6], [1, 2, 3]];
        const res = service.removeConsecutiveDuplicates(vectors,);
        expect(res).toEqual([[1, 2, 3], [2, 5, 6], [1, 2, 3], [2, 5, 6]]);
    });

    it("should do nothing just return single vector when removing consecutive duplicates", () => {
        const vectors = [[1, 2, 3]];
        const res = service.removeConsecutiveDuplicates(vectors);
        expect(res).toEqual([[1, 2, 3]]);
    });
});

describe("OCCT vector helper removeAllDuplicateVectors equivalence with the quadratic original", () => {

    let service: VectorHelperService;

    beforeAll(() => {
        service = new VectorHelperService();
    });

    it("should match the original on an empty input", () => {
        expect(expectSameAsOracle(service, [])).toEqual([]);
    });

    it("should match the original on a single vector", () => {
        expect(expectSameAsOracle(service, [[1, 2, 3]])).toEqual([[1, 2, 3]]);
    });

    it("should match the original when every vector is a duplicate", () => {
        const vectors = [[1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3]];
        expect(expectSameAsOracle(service, vectors)).toEqual([[1, 2, 3]]);
    });

    it("should match the original when there are no duplicates at all", () => {
        const vectors = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]];
        expect(expectSameAsOracle(service, vectors)).toEqual(vectors);
    });

    it("should keep the first of each duplicate group in first-seen order", () => {
        const vectors = [[5, 5, 5], [1, 1, 1], [5, 5, 5], [2, 2, 2], [1, 1, 1], [5, 5, 5]];
        expect(expectSameAsOracle(service, vectors)).toEqual([[5, 5, 5], [1, 1, 1], [2, 2, 2]]);
    });

    it("should match the original across mixed vector lengths", () => {
        const vectors = [[1], [1, 2], [1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5], [1, 2, 3], [1], [1, 2, 3, 4, 5]];
        expect(expectSameAsOracle(service, vectors)).toEqual([[1], [1, 2], [1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5]]);
    });

    it("should not let component values run together across different lengths", () => {
        const vectors = [[1, 23], [12, 3], [123], [1, 2, 3]];
        expect(expectSameAsOracle(service, vectors)).toEqual(vectors);
    });

    it("should match the original on empty vectors, which the original treats as all the same", () => {
        const vectors = [[], [], [1], []];
        expect(expectSameAsOracle(service, vectors)).toEqual([[], [1]]);
    });

    it("should treat negative zero and positive zero as the same, exactly as the original does", () => {
        const vectors = [[-0, 0, 0], [0, -0, 0], [0, 0, -0], [0, 0, 0], [-0, -0, -0]];
        const res = expectSameAsOracle(service, vectors);
        expect(res.length).toBe(1);
        expect(res[0]).toBe(vectors[0]);
    });

    it("should keep negative zero apart from a value a whole tolerance away, as the original does", () => {
        const vectors = [[-0, 0, 0], [-1e-6, 0, 0], [1e-6, 0, 0]];
        expect(expectSameAsOracle(service, vectors).length).toBe(3);
    });

    it("should keep every NaN bearing vector, because NaN never compares equal", () => {
        const vectors = [[NaN, 1, 2], [NaN, 1, 2], [1, NaN, 2], [1, 2, 3], [1, 2, 3], [NaN, NaN, NaN], [NaN, NaN, NaN]];
        const res = expectSameAsOracle(service, vectors);
        expect(res.length).toBe(6);
    });

    it("should keep every infinite vector, because infinity never compares equal either", () => {
        const vectors = [
            [Infinity, 0, 0], [Infinity, 0, 0], [-Infinity, 0, 0], [-Infinity, 0, 0],
            [1, 2, 3], [1, 2, 3], [0, 0, Infinity],
        ];
        const res = expectSameAsOracle(service, vectors);
        expect(res.length).toBe(6);
    });

    it("should match the original for floats that differ only in the last bits", () => {
        const vectors = [[0.1 + 0.2, 0, 0], [0.3, 0, 0], [0.3000002, 0, 0]];
        const res = expectSameAsOracle(service, vectors);
        expect(res.length).toBe(2);
        expect(res[0]).toBe(vectors[0]);
        expect(res[1]).toBe(vectors[2]);
    });

    it("should match the original for pairs that straddle a tolerance sized grid boundary", () => {
        const tolerance = 1e-7;
        const vectors: number[][] = [];
        for (let i = -4; i <= 4; i++) {
            const onBoundary = i * tolerance;
            vectors.push([onBoundary, 0, 0]);
            vectors.push([onBoundary - tolerance / 4, 0, 0]);
            vectors.push([onBoundary + tolerance / 4, 0, 0]);
            vectors.push([onBoundary - tolerance / 2, 0, 0]);
            vectors.push([onBoundary + tolerance / 2, 0, 0]);
        }
        expectSameAsOracle(service, vectors, tolerance);
    });

    it("should match the original for a chain of vectors each within tolerance of the previous one", () => {
        const tolerance = 1e-3;
        const vectors: number[][] = [];
        for (let i = 0; i < 400; i++) {
            vectors.push([i * tolerance * 0.6, 0, 0]);
        }
        expectSameAsOracle(service, vectors, tolerance);
    });

    it("should match the original for a custom tolerance that swallows near neighbours", () => {
        const vectors = [[1, 2], [1.00001, 2], [2, 3], [2, 3], [1, 2.000000001]];
        expectSameAsOracle(service, vectors, 0.0001);
        expectSameAsOracle(service, vectors, 0.00001);
        expectSameAsOracle(service, vectors, 0.1);
    });

    it("should match the original for a zero or negative tolerance, where nothing but empties collapse", () => {
        const vectors = [[1, 2], [1, 2], [], [], [3, 4]];
        expect(expectSameAsOracle(service, vectors, 0)).toEqual([[1, 2], [1, 2], [], [3, 4]]);
        expect(expectSameAsOracle(service, vectors, -1)).toEqual([[1, 2], [1, 2], [], [3, 4]]);
    });

    it("should match the original for a NaN tolerance", () => {
        const vectors = [[1, 2], [1, 2], [], [], [3, 4]];
        expectSameAsOracle(service, vectors, NaN);
    });

    it("should match the original for an infinite tolerance, where everything of a length collapses", () => {
        const vectors = [[1, 2], [500, 600], [1, 2, 3], [7, 8, 9], [4, 5]];
        expect(expectSameAsOracle(service, vectors, Infinity)).toEqual([[1, 2], [1, 2, 3]]);
    });

    it("should match the original for magnitudes far beyond safe grid arithmetic", () => {
        const tolerance = 1e-9;
        const huge = 1e12;
        const vectors = [
            [huge, 0, 0], [huge, 0, 0], [1, 2, 3], [1, 2, 3],
            [huge, 0, 0], [-huge, 0, 0], [-huge, 0, 0], [huge + 1, 0, 0],
        ];
        expect(expectSameAsOracle(service, vectors, tolerance).length).toBe(4);
    });

    it("should match the original where a pair straddles the safe grid arithmetic threshold", () => {
        const tolerance = 1e-9;
        const threshold = 2 ** 50 * tolerance;
        const justAbove = threshold + tolerance / 4;
        const justBelow = threshold - tolerance / 4;
        expect(justAbove - justBelow).toBeLessThan(tolerance);
        const vectors = [
            [justAbove, 0, 0],
            [justBelow, 0, 0],
            [justBelow, 0, 0],
            [justAbove, 0, 0],
            [1, 1, 1],
        ];
        expect(expectSameAsOracle(service, vectors, tolerance).length).toBe(2);
    });

    it("should match the original for very long vectors that agree on their first components", () => {
        const vectors: number[][] = [];
        for (let i = 0; i < 300; i++) {
            vectors.push([1, 2, 3, 4, 5, 6, i % 7, (i % 5) * 2, i % 3]);
        }
        const res = expectSameAsOracle(service, vectors);
        expect(res.length).toBe(105);
    });

    it("should match the original for two dimensional and one dimensional inputs", () => {
        const vectors = [[1, 2], [1, 2], [3, 4], [1.00000001, 2], [3, 4.5]];
        expectSameAsOracle(service, vectors);
        expectSameAsOracle(service, [[1], [1], [2], [1.00000001], [2.5]]);
    });

    it("should match the original on a randomised lattice with many near duplicates", () => {
        const random = mulberry32(20260907);
        const tolerance = 1e-7;
        const vectors: number[][] = [];
        for (let i = 0; i < 3000; i++) {
            const lattice = () => Math.floor(random() * 12) * tolerance + (random() - 0.5) * tolerance * 1.4;
            vectors.push([lattice(), lattice(), lattice()]);
        }
        expectSameAsOracle(service, vectors, tolerance);
    });

    it("should match the original on randomised mixed length inputs with odd values", () => {
        const random = mulberry32(424242);
        const oddValues = [0, -0, 1, -1, NaN, Infinity, -Infinity, 1e-7, -1e-7, 5e-8, 1e9, -1e9];
        for (let round = 0; round < 60; round++) {
            const vectors: number[][] = [];
            const count = 1 + Math.floor(random() * 40);
            for (let i = 0; i < count; i++) {
                const length = Math.floor(random() * 9);
                const vector: number[] = [];
                for (let d = 0; d < length; d++) {
                    vector.push(oddValues[Math.floor(random() * oddValues.length)]!);
                }
                vectors.push(vector);
            }
            const tolerance = [1e-7, 1e-3, 0, 1, 1e-12][Math.floor(random() * 5)]!;
            expectSameAsOracle(service, vectors, tolerance);
        }
    });

    it("should match the original on a large point cloud", () => {
        const random = mulberry32(987654321);
        const vectors: number[][] = [];
        for (let i = 0; i < 4000; i++) {
            const point = [random() * 100, random() * 100, random() * 100];
            vectors.push(point);
            if (i % 3 === 0) {
                vectors.push([...point]);
            }
        }
        const res = expectSameAsOracle(service, vectors);
        expect(res.length).toBe(4000);
    });

    it("should deduplicate twenty thousand vectors down to the ten thousand distinct ones", () => {
        const vectors: number[][] = [];
        for (let i = 0; i < 10000; i++) {
            vectors.push([i, i * 2, i * 3]);
            vectors.push([i, i * 2, i * 3]);
        }
        const res = service.removeAllDuplicateVectors(vectors);
        expect(res.length).toBe(10000);
        expect(res[0]).toBe(vectors[0]);
        expect(res[9999]).toBe(vectors[19998]);
    });
});
