import type * as Inputs from "../../../inputs";
import { IDENTITY_MATRIX, LINEAR_COLUMN_STARTS, MATRIX_COLUMN, POSITION_SIZE, RIGID_TOLERANCE, TRANSLATION_START } from "./matrices.constants";
import { dot3, length3 } from "./vectors";

type Vec3 = Inputs.Base.Vector3;

export const isTransformMatrix = (value: unknown): value is Inputs.Base.TransformMatrix =>
    Array.isArray(value) && value.length === 16 && value.every(n => typeof n === "number" && Number.isFinite(n));

export const movedCoordinate = (matrix: readonly number[], x: number, y: number, z: number, axis: number): number =>
    matrix[axis]! * x + matrix[MATRIX_COLUMN + axis]! * y + matrix[2 * MATRIX_COLUMN + axis]! * z + matrix[TRANSLATION_START + axis]!;

export const movedPoint = (matrix: readonly number[], point: readonly number[]): Inputs.Base.Point3 => {
    const [x, y, z] = [point[0]!, point[1]!, point[2]!];
    return [movedCoordinate(matrix, x, y, z, 0), movedCoordinate(matrix, x, y, z, 1), movedCoordinate(matrix, x, y, z, 2)];
};

export const turnedVector = (matrix: readonly number[], vector: readonly number[]): Inputs.Base.Vector3 => {
    const [x, y, z] = [vector[0]!, vector[1]!, vector[2]!];
    const turned = (axis: number): number => matrix[axis]! * x + matrix[MATRIX_COLUMN + axis]! * y + matrix[2 * MATRIX_COLUMN + axis]! * z;
    return [turned(0), turned(1), turned(2)];
};

export const movedPositions = (matrix: readonly number[], positions: ArrayLike<number>): Float64Array => {
    const moved = new Float64Array(positions.length);
    for (let at = 0; at + POSITION_SIZE <= positions.length; at += POSITION_SIZE) {
        const [x, y, z] = [positions[at]!, positions[at + 1]!, positions[at + 2]!];
        moved[at] = movedCoordinate(matrix, x, y, z, 0);
        moved[at + 1] = movedCoordinate(matrix, x, y, z, 1);
        moved[at + 2] = movedCoordinate(matrix, x, y, z, 2);
    }
    return moved;
};

export const followedBy = (first: readonly number[], second: readonly number[]): Inputs.Base.TransformMatrix => {
    const product = Array.from({ length: 16 }, (_, index) => {
        const column = Math.floor(index / 4);
        const row = index % 4;
        return second[row]! * first[column * 4]! + second[4 + row]! * first[column * 4 + 1]!
            + second[8 + row]! * first[column * 4 + 2]! + second[12 + row]! * first[column * 4 + 3]!;
    });
    return product as Inputs.Base.TransformMatrix;
};

export const rigidInverse = (matrix: readonly number[]): Inputs.Base.TransformMatrix => {
    const [a, b, c, , d, e, f, , g, h, i, , x, y, z] = matrix as [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    return [a, d, g, 0, b, e, h, 0, c, f, i, 0, -(a * x + b * y + c * z), -(d * x + e * y + f * z), -(g * x + h * y + i * z), 1];
};

export const linearDeterminant = (matrix: readonly number[]): number => {
    const [a, b, c, , d, e, f, , g, h, i] = matrix as [number, number, number, number, number, number, number, number, number, number, number];
    return a * (e * i - f * h) - d * (b * i - c * h) + g * (b * f - c * e);
};

export const isRigidMatrix = (matrix: readonly number[], tolerance = RIGID_TOLERANCE): boolean => {
    const [x, y, z] = LINEAR_COLUMN_STARTS.map((start): Vec3 => [matrix[start]!, matrix[start + 1]!, matrix[start + 2]!]) as [Vec3, Vec3, Vec3];
    return [x, y, z].every((column) => Math.abs(length3(column) - 1) <= tolerance)
        && Math.abs(dot3(x, y)) <= tolerance && Math.abs(dot3(x, z)) <= tolerance && Math.abs(dot3(y, z)) <= tolerance
        && linearDeterminant(matrix) > 0;
};

export const composed = (matrices: readonly (readonly number[])[]): Inputs.Base.TransformMatrix =>
    matrices.reduce<Inputs.Base.TransformMatrix>((total, matrix) => followedBy(total, matrix), [...IDENTITY_MATRIX]);

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
