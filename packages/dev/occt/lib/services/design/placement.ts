import * as Inputs from "../../api/inputs";
import { Vector, cross, unit } from "./helpers";

/** A placement as a column-major 4 x 4 matrix. */
export type Matrix = Inputs.Base.TransformMatrix;

const DEGREES = Math.PI / 180;

/** The matrix that leaves everything where it is. */
export const IDENTITY: Matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

/** The matrix that applies `first` and then `second`. A function named `then` would make this module look like a promise to `await import`. */
export function followedBy(first: Matrix, second: Matrix): Matrix {
    const product = new Array<number>(16).fill(0);
    for (let column = 0; column < 4; column++) {
        for (let row = 0; row < 4; row++) {
            let sum = 0;
            for (let inner = 0; inner < 4; inner++) {
                sum += second[inner * 4 + row]! * first[column * 4 + inner]!;
            }
            product[column * 4 + row] = sum;
        }
    }
    return product as Matrix;
}

/** `vector` with its part along the unit vector `axis` taken out, so it lies across the axis. */
function across(vector: readonly number[], axis: Vector): Vector {
    const along = vector[0]! * axis[0] + vector[1]! * axis[1] + vector[2]! * axis[2];
    return [vector[0]! - along * axis[0], vector[1]! - along * axis[1], vector[2]! - along * axis[2]];
}

/**
 * The matrix that moves the origin and the X, Y and Z axes onto a frame: its origin, its direction
 * laid into the plane across its normal, the normal crossed with that, and the normal. The direction
 * must not lie along the normal.
 */
export function frameMatrix(frame: Inputs.Base.Frame): Matrix {
    const z = unit(frame.normal);
    const x = unit(across(frame.direction, z));
    const y = cross(z, x);
    return [x[0], x[1], x[2], 0, y[0], y[1], y[2], 0, z[0], z[1], z[2], 0, frame.origin[0], frame.origin[1], frame.origin[2], 1];
}

/** The inverse of a rigid motion: its rotation transposed and its translation undone. */
export function inverse(matrix: Matrix): Matrix {
    const at = (row: number, column: number): number => matrix[column * 4 + row]!;
    const rotation = [0, 1, 2].map(row => [0, 1, 2].map(column => at(column, row)));
    const translation = [0, 1, 2].map(row => -(rotation[row]![0]! * at(0, 3) + rotation[row]![1]! * at(1, 3) + rotation[row]![2]! * at(2, 3)));
    return [
        rotation[0]![0]!, rotation[1]![0]!, rotation[2]![0]!, 0,
        rotation[0]![1]!, rotation[1]![1]!, rotation[2]![1]!, 0,
        rotation[0]![2]!, rotation[1]![2]!, rotation[2]![2]!, 0,
        translation[0]!, translation[1]!, translation[2]!, 1,
    ];
}

/** A point moved by a matrix. */
export function movedPoint(matrix: Matrix, point: readonly number[]): Vector {
    return [0, 1, 2].map(row => matrix[row]! * point[0]! + matrix[4 + row]! * point[1]! + matrix[8 + row]! * point[2]! + matrix[12 + row]!) as Vector;
}

/** A direction turned by a matrix, without its translation. */
export function turned(matrix: Matrix, vector: readonly number[]): Vector {
    return [0, 1, 2].map(row => matrix[row]! * vector[0]! + matrix[4 + row]! * vector[1]! + matrix[8 + row]! * vector[2]!) as Vector;
}

/** A frame moved by a matrix. */
export function movedFrame(matrix: Matrix, frame: Inputs.Base.Frame): Inputs.Base.Frame {
    return { origin: movedPoint(matrix, frame.origin), normal: turned(matrix, frame.normal), direction: turned(matrix, frame.direction) };
}

/** A vector turned about the unit `axis` by `degrees`, right-handed; a part along the axis is left for `frameMatrix` to take out. */
function turnedAbout(vector: Vector, axis: Vector, degrees: number): Vector {
    const angle = degrees * DEGREES;
    const side = cross(axis, vector);
    return [0, 1, 2].map(index => vector[index]! * Math.cos(angle) + side[index]! * Math.sin(angle)) as Vector;
}

/**
 * The placement a joint gives: it brings `connector` (a frame in the component's own coordinates)
 * onto `target`, the connector's normal against the target's (along it with `flip`), the x axes
 * along each other turned by `angle` degrees about the target's normal, and `offset` along that
 * normal.
 */
export function jointMatrix(connector: Inputs.Base.Frame, target: Inputs.Base.Frame, flip: boolean, angle: number, offset: number): Matrix {
    const normal = unit(target.normal);
    const direction = turnedAbout(unit(target.direction), normal, angle);
    const origin = [0, 1, 2].map(index => target.origin[index]! + offset * normal[index]!) as Vector;
    const meeting = frameMatrix({ origin, normal: flip ? normal : [-normal[0], -normal[1], -normal[2]], direction });
    return followedBy(inverse(frameMatrix(connector)), meeting);
}
