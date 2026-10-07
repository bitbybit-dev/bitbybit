import type * as Inputs from "../../inputs";

type Vec3 = Inputs.Base.Vector3;

/** Whether a value is one column-major 4 x 4 matrix: sixteen finite numbers. */
export const isTransformMatrix = (value: unknown): value is Inputs.Base.TransformMatrix =>
    Array.isArray(value) && value.length === 16 && value.every(n => typeof n === "number" && Number.isFinite(n));

/** The product of two column-major 4 x 4 matrices: `first` applied, then `second`. */
export const followedBy = (first: readonly number[], second: readonly number[]): Inputs.Base.TransformMatrix => {
    const product = Array.from({ length: 16 }, (_, index) => {
        const column = Math.floor(index / 4);
        const row = index % 4;
        return second[row]! * first[column * 4]! + second[4 + row]! * first[column * 4 + 1]!
            + second[8 + row]! * first[column * 4 + 2]! + second[12 + row]! * first[column * 4 + 3]!;
    });
    return product as Inputs.Base.TransformMatrix;
};

/** The determinant of a column-major 4 x 4 matrix's rotation and scale part: negative when it mirrors, near zero when it flattens. */
export const linearDeterminant = (matrix: readonly number[]): number => {
    const [a, b, c, , d, e, f, , g, h, i] = matrix as [number, number, number, number, number, number, number, number, number, number, number];
    return a * (e * i - f * h) - d * (b * i - c * h) + g * (b * f - c * e);
};

/** One column-major 4 x 4 matrix that applies a list of them first to last; the identity for an empty list. */
export const composed = (matrices: readonly (readonly number[])[]): Inputs.Base.TransformMatrix =>
    matrices.reduce<Inputs.Base.TransformMatrix>((total, matrix) => followedBy(total, matrix), [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

/**
 * The eigenvalues of a symmetric 3 x 3 matrix, largest first, each with its unit eigenvector, by
 * cyclic Jacobi rotations; the vectors come out at right angles to each other.
 */
export const symmetricEigen = (matrix: readonly (readonly number[])[]): { value: number, vector: Vec3 }[] => {
    let a = matrix.map(row => [...row]);
    let v = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    const multiply = (p: number[][], q: number[][]): number[][] =>
        p.map((row, i) => q[0]!.map((_, j) => row.reduce((total, _unused, k) => total + p[i]![k]! * q[k]![j]!, 0)));
    const transpose = (p: number[][]): number[][] => p[0]!.map((_, j) => p.map(row => row[j]!));
    const size = a.flat().reduce((total, entry) => total + entry * entry, 0);
    for (let sweep = 0; sweep < 64; sweep++) {
        const off = a[0]![1]! ** 2 + a[0]![2]! ** 2 + a[1]![2]! ** 2;
        if (off <= 1e-30 * size) {
            break;
        }
        for (const [p, q] of [[0, 1], [0, 2], [1, 2]] as const) {
            const apq = a[p]![q]!;
            if (apq === 0) {
                continue;
            }
            const theta = (a[q]![q]! - a[p]![p]!) / (2 * apq);
            const t = (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
            const c = 1 / Math.sqrt(t * t + 1);
            const s = t * c;
            const rotation = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
            rotation[p]![p] = c;
            rotation[q]![q] = c;
            rotation[p]![q] = s;
            rotation[q]![p] = -s;
            a = multiply(transpose(rotation), multiply(a, rotation));
            v = multiply(v, rotation);
        }
    }
    return [0, 1, 2]
        .map(k => ({ value: a[k]![k]!, vector: [v[0]![k]!, v[1]![k]!, v[2]![k]!] as Vec3 }))
        .sort((first, second) => second.value - first.value);
};
