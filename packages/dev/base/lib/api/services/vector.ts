
import * as Inputs from "../inputs";
import { GeometryHelper } from "./geometry-helper";
import { MathBitByBit } from "./math";

/**
 * Vector maths on plain number arrays. A vector is an array of numbers; in 3D it is `[x, y, z]`
 * with Y pointing up, the same shape as a point, so the two can be passed to each other's methods.
 * Every method returns a new array or a number and never changes its inputs. Angles are in degrees.
 */
export class Vector {

    constructor(private readonly math: MathBitByBit, private readonly geometryHelper: GeometryHelper) { }

    /**
     * Removes every repeated vector from a list, keeping the first occurrence of each.
     *
     * Two vectors count as the same when every entry differs by less than `tolerance`.
     * Example: [[1,2,3], [4,5,6], [1,2,3], [7,8,9]] -> [[1,2,3], [4,5,6], [7,8,9]]
     * @param inputs - Vectors to filter and the tolerance
     * @returns The vectors without repeats, in their original order
     * @group remove
     * @shortname remove all duplicates
     * @drawable false
     * @example
     * ```typescript
     * const unique = bitbybit.vector.removeAllDuplicateVectors({
     *     vectors: [[1, 2, 3], [4, 5, 6], [1, 2, 3]],
     *     tolerance: 1e-7,
     * });
     * ```
     */
    removeAllDuplicateVectors(inputs: Inputs.Vector.RemoveAllDuplicateVectorsDto): number[][] {
        return this.geometryHelper.removeAllDuplicateVectors(inputs.vectors, inputs.tolerance);
    }

    /**
     * Removes a vector when it repeats the one right before it; the same vector further away is
     * kept.
     *
     * With `checkFirstAndLast` on, a last vector that repeats the first is dropped too, which
     * closes a loop of points cleanly. Entries within `tolerance` of each other count as equal.
     * Example: [[1,2], [1,2], [3,4], [1,2]] -> [[1,2], [3,4], [1,2]]
     * @param inputs - Vectors to filter, whether to compare the first and last, and the tolerance
     * @returns The vectors without consecutive repeats
     * @group remove
     * @shortname remove consecutive duplicates
     * @drawable false
     * @example
     * ```typescript
     * const cleaned = bitbybit.vector.removeConsecutiveDuplicateVectors({
     *     vectors: [[0, 0], [0, 0], [1, 1], [0, 0]],
     *     checkFirstAndLast: true,
     *     tolerance: 1e-7,
     * });
     * ```
     */
    removeConsecutiveDuplicateVectors(inputs: Inputs.Vector.RemoveConsecutiveDuplicateVectorsDto): number[][] {
        return this.geometryHelper.removeConsecutiveVectorDuplicates(inputs.vectors, inputs.checkFirstAndLast, inputs.tolerance);
    }

    /**
     * Tells whether two vectors are the same within a tolerance, entry by entry.
     *
     * Vectors of different length are never the same.
     * Example: [1,2,3] and [1.0001,2.0001,3.0001] with tolerance 0.001 -> true
     * @param inputs - The two vectors and the tolerance
     * @returns True when every entry differs by less than the tolerance
     * @group validate
     * @shortname vectors the same
     * @drawable false
     * @example
     * ```typescript
     * const same = bitbybit.vector.vectorsTheSame({ vec1: [1, 2, 3], vec2: [1, 2, 3.0000001], tolerance: 1e-6 });
     * ```
     */
    vectorsTheSame(inputs: Inputs.Vector.VectorsTheSameDto): boolean {
        return this.geometryHelper.vectorsTheSame(inputs.vec1, inputs.vec2, inputs.tolerance);
    }

    /**
     * Measures the angle between two vectors in degrees, always between 0 and 180.
     *
     * The direction of turning is not considered; use `signedAngleBetween` for that.
     * Example: [1,0,0] and [0,1,0] -> 90
     * @param inputs - The two vectors
     * @returns Angle in degrees
     * @group angles
     * @shortname angle
     * @drawable false
     * @example
     * ```typescript
     * const angle = bitbybit.vector.angleBetween({ first: [1, 0, 0], second: [0, 1, 0] });
     * ```
     */
    angleBetween(inputs: Inputs.Vector.TwoVectorsDto): number {
        return this.math.radToDeg({
            number: Math.acos(this.dot({ first: inputs.first, second: inputs.second }) / (this.norm({ vector: inputs.first }) * this.norm({ vector: inputs.second })))
        });
    }

    /**
     * Measures the signed angle from the first 2D vector to the second, in degrees from -180 to
     * 180.
     *
     * Only the first two entries of each vector are used; a positive angle turns counter-clockwise.
     * Example: [1,0] to [0,1] -> 90, [0,1] to [1,0] -> -90
     * @param inputs - The two 2D vectors
     * @returns Signed angle in degrees
     * @group angles
     * @shortname angle normalized 2d
     * @drawable false
     * @example
     * ```typescript
     * const angle = bitbybit.vector.angleBetweenNormalized2d({ first: [1, 0], second: [0, 1] });
     * ```
     */
    angleBetweenNormalized2d(inputs: Inputs.Vector.TwoVectorsDto): number {
        const perpDot = inputs.first[0]! * inputs.second[1]! - inputs.first[1]! * inputs.second[0]!;
        return this.math.radToDeg({
            number: Math.atan2(perpDot, this.dot({ first: inputs.first, second: inputs.second }))
        });
    }

    /**
     * Measures the angle from the first vector to the second, turning around a reference direction,
     * in degrees from 0 to 360.
     *
     * The turn is counter-clockwise when the reference vector points toward you.
     * Example: [1,0,0] to [0,0,-1] around [0,1,0] -> 90
     * @param inputs - The two vectors and the reference direction to turn around
     * @returns Angle in degrees from 0 to 360
     * @group angles
     * @shortname positive angle
     * @drawable false
     * @example
     * ```typescript
     * const angle = bitbybit.vector.positiveAngleBetween({ first: [1, 0, 0], second: [0, 0, -1], reference: [0, 1, 0] });
     * ```
     */
    positiveAngleBetween(inputs: Inputs.Vector.TwoVectorsReferenceDto): number {
        const angle = this.signedAngleBetween(inputs);
        return angle < 0 ? 360 + angle : angle;
    }

    /**
     * Adds a list of vectors together entry by entry into one vector.
     *
     * The result has as many entries as the first vector.
     * Example: [[1,2,3], [4,5,6], [7,8,9]] -> [12,15,18]
     * @param inputs - Vectors to add
     * @returns The vector of sums
     * @group sum
     * @shortname add all
     * @drawable false
     * @example
     * ```typescript
     * const total = bitbybit.vector.addAll({ vectors: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] });
     * ```
     */
    addAll(inputs: Inputs.Vector.VectorsDto): number[] {
        const res = [];
        for (let i = 0; i < inputs.vectors[0]!.length; i++) {
            let sum = 0;
            for (const vector of inputs.vectors) {
                sum += vector[i]!;
            }
            res.push(sum);
        }
        return res;
    }

    /**
     * Adds two vectors entry by entry.
     *
     * Example: [1,2,3] + [4,5,6] -> [5,7,9]
     * @param inputs - The two vectors to add
     * @returns The vector of sums
     * @group sum
     * @shortname add
     * @drawable false
     * @example
     * ```typescript
     * const sum = bitbybit.vector.add({ first: [1, 2, 3], second: [4, 5, 6] });
     * ```
     */
    add(inputs: Inputs.Vector.TwoVectorsDto): number[] {
        const res = [];
        for (let i = 0; i < inputs.first.length; i++) {
            res.push(inputs.first[i]! + inputs.second[i]!);
        }
        return res;
    }

    /**
     * Tells whether every value in a list of booleans is true.
     *
     * Example: [true, true, true] -> true, [true, false, true] -> false
     * @param inputs - The booleans to check
     * @returns True when no entry is false
     * @group sum
     * @shortname all
     * @drawable false
     * @example
     * ```typescript
     * const allTrue = bitbybit.vector.all({ vector: [true, true, false] });
     * ```
     */
    all(inputs: Inputs.Vector.VectorBoolDto): boolean {
        return inputs.vector.every(v => v);
    }

    /**
     * Computes the cross product of two 3D vectors: a vector at right angles to both.
     *
     * Its direction follows the right-hand rule and its length is the area of the parallelogram the
     * two vectors span.
     * Example: [1,0,0] x [0,1,0] -> [0,0,1]
     * @param inputs - The two 3D vectors
     * @returns The vector perpendicular to both
     * @group base
     * @shortname cross
     * @drawable false
     * @example
     * ```typescript
     * const normal = bitbybit.vector.cross({ first: [1, 0, 0], second: [0, 1, 0] });
     * ```
     */
    cross(inputs: Inputs.Vector.TwoVectorsDto): number[] {
        const res = [];
        res.push(inputs.first[1]! * inputs.second[2]! - inputs.first[2]! * inputs.second[1]!);
        res.push(inputs.first[2]! * inputs.second[0]! - inputs.first[0]! * inputs.second[2]!);
        res.push(inputs.first[0]! * inputs.second[1]! - inputs.first[1]! * inputs.second[0]!);
        return res;
    }

    /**
     * Computes the squared distance between two vectors, which avoids the square root when only
     * comparing distances.
     *
     * Example: [0,0,0] to [3,4,0] -> 25
     * @param inputs - The two vectors
     * @returns The squared distance
     * @group distance
     * @shortname dist squared
     * @drawable false
     * @example
     * ```typescript
     * const d2 = bitbybit.vector.distSquared({ first: [0, 0, 0], second: [3, 4, 0] });
     * ```
     */
    distSquared(inputs: Inputs.Vector.TwoVectorsDto): number {
        let res = 0;
        for (let i = 0; i < inputs.first.length; i++) {
            res += Math.pow(inputs.first[i]! - inputs.second[i]!, 2);
        }
        return res;
    }

    /**
     * Computes the straight-line distance between two vectors.
     *
     * Example: [0,0,0] to [3,4,0] -> 5
     * @param inputs - The two vectors
     * @returns The distance in model units
     * @group distance
     * @shortname dist
     * @drawable false
     * @example
     * ```typescript
     * const distance = bitbybit.vector.dist({ first: [0, 0, 0], second: [3, 4, 0] });
     * ```
     */
    dist(inputs: Inputs.Vector.TwoVectorsDto): number {
        return Math.sqrt(this.distSquared(inputs));
    }

    /**
     * Divides every entry of a vector by one number.
     *
     * Example: [10,20,30] / 2 -> [5,10,15]
     * @param inputs - The vector and the number to divide by
     * @returns The divided vector
     * @group base
     * @shortname div
     * @drawable false
     * @example
     * ```typescript
     * const half = bitbybit.vector.div({ vector: [10, 20, 30], scalar: 2 });
     * ```
     */
    div(inputs: Inputs.Vector.VectorScalarDto): number[] {
        const res = [];
        for (let i = 0; i < inputs.vector.length; i++) {
            res.push(inputs.vector[i]! / inputs.scalar);
        }
        return res;
    }

    /**
     * Subtracts the first value of a vector from its last, which for a sorted list is its range.
     *
     * Example: [1,3,5,9] -> 8
     * @param inputs - The vector
     * @returns Last value minus first value
     * @group base
     * @shortname domain
     * @drawable false
     * @example
     * ```typescript
     * const span = bitbybit.vector.domain({ vector: [1, 3, 5, 9] });
     * ```
     */
    domain(inputs: Inputs.Vector.VectorDto): number {
        return inputs.vector[inputs.vector.length - 1]! - inputs.vector[0]!;
    }

    /**
     * Computes the dot product of two vectors: the sum of the products of matching entries.
     *
     * It is 0 for vectors at right angles and, for unit vectors, the cosine of the angle between
     * them.
     * Example: [1,2,3] and [4,5,6] -> 32
     * @param inputs - The two vectors
     * @returns The dot product
     * @group base
     * @shortname dot
     * @drawable false
     * @example
     * ```typescript
     * const projection = bitbybit.vector.dot({ first: [1, 2, 3], second: [4, 5, 6] });
     * ```
     */
    dot(inputs: Inputs.Vector.TwoVectorsDto): number {
        let res = 0;
        for (let i = 0; i < inputs.first.length; i++) {
            res += inputs.first[i]! * inputs.second[i]!;
        }
        return res;
    }

    /**
     * Marks which entries of a vector are finite numbers.
     *
     * Example: [1, 2, Infinity, 3] -> [true, true, false, true]
     * @param inputs - The vector to check
     * @returns One boolean per entry, true when it is finite
     * @group validate
     * @shortname finite
     * @drawable false
     * @example
     * ```typescript
     * const flags = bitbybit.vector.finite({ vector: [1, Infinity, 3] });
     * ```
     */
    finite(inputs: Inputs.Vector.VectorDto): boolean[] {
        return inputs.vector.map(v => isFinite(v));
    }

    /**
     * Tells whether a vector has no length, that is, every entry is exactly 0.
     *
     * Example: [0,0,0] -> true, [0,0,0.001] -> false
     * @param inputs - The vector to check
     * @returns True when the length is 0
     * @group validate
     * @shortname isZero
     * @drawable false
     * @example
     * ```typescript
     * const zero = bitbybit.vector.isZero({ vector: [0, 0, 0] });
     * ```
     */
    isZero(inputs: Inputs.Vector.VectorDto): boolean {
        return this.norm({ vector: inputs.vector }) === 0;
    }

    /**
     * Blends two vectors linearly by a fraction.
     *
     * `fraction` is the share of `first`: 1 gives `first`, 0 gives `second`, 0.5 the midpoint.
     * Example: [0,0,0] and [10,10,10] at 0.5 -> [5,5,5]
     * @param inputs - The two vectors and the fraction of the first
     * @returns The blended vector
     * @group distance
     * @shortname lerp
     * @drawable false
     * @example
     * ```typescript
     * const mid = bitbybit.vector.lerp({ first: [0, 0, 0], second: [10, 10, 10], fraction: 0.5 });
     * ```
     */
    lerp(inputs: Inputs.Vector.FractionTwoVectorsDto): number[] {
        return this.add(
            {
                first: this.mul({ vector: inputs.first, scalar: inputs.fraction }),
                second: this.mul({ vector: inputs.second, scalar: 1.0 - inputs.fraction })
            }
        );
    }

    /**
     * Finds the largest value in a vector.
     *
     * Example: [3, 7, 2, 9, 1] -> 9
     * @param inputs - The vector
     * @returns The largest entry
     * @group extract
     * @shortname max
     * @drawable false
     * @example
     * ```typescript
     * const largest = bitbybit.vector.max({ vector: [3, 7, 2, 9, 1] });
     * ```
     */
    max(inputs: Inputs.Vector.VectorDto): number {
        return Math.max(...inputs.vector);
    }

    /**
     * Finds the smallest value in a vector.
     *
     * Example: [3, 7, 2, 9, 1] -> 1
     * @param inputs - The vector
     * @returns The smallest entry
     * @group extract
     * @shortname min
     * @drawable false
     * @example
     * ```typescript
     * const smallest = bitbybit.vector.min({ vector: [3, 7, 2, 9, 1] });
     * ```
     */
    min(inputs: Inputs.Vector.VectorDto): number {
        return Math.min(...inputs.vector);
    }

    /**
     * Multiplies every entry of a vector by one number.
     *
     * Example: [2,3,4] x 5 -> [10,15,20]
     * @param inputs - The vector and the number to multiply by
     * @returns The scaled vector
     * @group base
     * @shortname mul
     * @drawable false
     * @example
     * ```typescript
     * const scaled = bitbybit.vector.mul({ vector: [2, 3, 4], scalar: 5 });
     * ```
     */
    mul(inputs: Inputs.Vector.VectorScalarDto): number[] {
        const res = [];
        for (let i = 0; i < inputs.vector.length; i++) {
            res.push(inputs.vector[i]! * inputs.scalar);
        }
        return res;
    }

    /**
     * Flips the sign of every entry, so the vector points the opposite way.
     *
     * Example: [5,-3,2] -> [-5,3,-2]
     * @param inputs - The vector to flip
     * @returns The negated vector
     * @group base
     * @shortname neg
     * @drawable false
     * @example
     * ```typescript
     * const opposite = bitbybit.vector.neg({ vector: [5, -3, 2] });
     * ```
     */
    neg(inputs: Inputs.Vector.VectorDto): number[] {
        const res = [];
        for (let i = 0; i < inputs.vector.length; i++) {
            res.push(-inputs.vector[i]!);
        }
        return res;
    }

    /**
     * Computes the squared length of a vector, which avoids the square root when only comparing
     * lengths.
     *
     * Example: [3,4,0] -> 25
     * @param inputs - The vector
     * @returns The squared length
     * @group base
     * @shortname norm squared
     * @drawable false
     * @example
     * ```typescript
     * const n2 = bitbybit.vector.normSquared({ vector: [3, 4, 0] });
     * ```
     */
    normSquared(inputs: Inputs.Vector.VectorDto): number {
        return this.dot({ first: inputs.vector, second: inputs.vector });
    }

    /**
     * Computes the length of a vector.
     *
     * Example: [3,4,0] -> 5, [1,0,0] -> 1
     * @param inputs - The vector
     * @returns The length in model units
     * @group base
     * @shortname norm
     * @drawable false
     * @example
     * ```typescript
     * const len = bitbybit.vector.norm({ vector: [3, 4, 0] });
     * ```
     */
    norm(inputs: Inputs.Vector.VectorDto): number {
        const norm2 = this.normSquared(inputs);
        return norm2 !== 0.0 ? Math.sqrt(norm2) : norm2;
    }

    /**
     * Scales a 3D vector to length 1 while keeping its direction.
     *
     * A vector shorter than 1e-8 has no direction to keep, so the result is undefined.
     * Example: [3,4,0] -> [0.6,0.8,0]
     * @param inputs - The 3D vector to normalize
     * @returns The unit vector, or undefined for a zero-length input
     * @group base
     * @shortname normalized
     * @drawable false
     * @example
     * ```typescript
     * const direction = bitbybit.vector.normalized({ vector: [3, 4, 0] });
     * ```
     */
    normalized(inputs: Inputs.Vector.VectorDto): number[] | undefined {
        const len = this.length({vector: inputs.vector as Inputs.Base.Vector3});
        if (len <= 1e-8) {
            return undefined;
        }
        return this.div({ scalar: this.norm(inputs), vector: inputs.vector });
    }

    /**
     * Finds the point at a given distance from a start point along a direction.
     *
     * The direction is used as given, so a direction of length 2 travels twice the distance.
     * Example: start [0,0,0], direction [1,0,0], distance 5 -> [5,0,0]
     * @param inputs - The start point, the direction and the distance
     * @returns The point on the ray
     * @group base
     * @shortname on ray
     * @drawable false
     * @example
     * ```typescript
     * const ahead = bitbybit.vector.onRay({ point: [0, 0, 0], vector: [1, 0, 0], distance: 5 });
     * ```
     */
    onRay(inputs: Inputs.Vector.RayPointDto): number[] {
        return this.add({ first: inputs.point, second: this.mul({ vector: inputs.vector, scalar: inputs.distance }) });
    }

    /**
     * Builds a 3D vector from its x, y and z values.
     *
     * Example: x=1, y=2, z=3 -> [1,2,3]
     * @param inputs - The three values
     * @returns The vector `[x, y, z]`
     * @group create
     * @shortname vector XYZ
     * @drawable true
     * @example
     * ```typescript
     * const up = bitbybit.vector.vectorXYZ({ x: 0, y: 1, z: 0 });
     * ```
     */
    vectorXYZ(inputs: Inputs.Vector.VectorXYZDto): Inputs.Base.Vector3 {
        return [inputs.x, inputs.y, inputs.z];
    }

    /**
     * Builds a 2D vector from its x and y values.
     *
     * Example: x=3, y=4 -> [3,4]
     * @param inputs - The two values
     * @returns The vector `[x, y]`
     * @group create
     * @shortname vector XY
     * @drawable true
     * @example
     * ```typescript
     * const right = bitbybit.vector.vectorXY({ x: 1, y: 0 });
     * ```
     */
    vectorXY(inputs: Inputs.Vector.VectorXYDto): Inputs.Base.Vector2 {
        return [inputs.x, inputs.y];
    }

    /**
     * Lists the whole numbers from 0 up to, but not including, `max`.
     *
     * Example: max=5 -> [0,1,2,3,4]
     * @param inputs - The end of the range, which is left out
     * @returns The numbers from 0 to max - 1
     * @group create
     * @shortname range
     * @drawable false
     * @example
     * ```typescript
     * const indices = bitbybit.vector.range({ max: 5 });
     * ```
     */
    range(inputs: Inputs.Vector.RangeMaxDto): number[] {
        const res = [];
        for (let i = 0; i < inputs.max; i++) {
            res.push(i);
        }
        return res;
    }

    /**
     * Measures the angle from the first vector to the second, turning around a reference direction,
     * in degrees from 0 to 360.
     *
     * The turn is counter-clockwise when the reference vector points toward you: a clockwise turn
     * of 30 degrees reads as 330.
     * Example: [1,0,0] to [0,0,-1] around [0,1,0] -> 90
     * @param inputs - The two vectors and the reference direction to turn around
     * @returns Angle in degrees from 0 to 360
     * @group angles
     * @shortname signed angle
     * @drawable false
     * @example
     * ```typescript
     * const angle = bitbybit.vector.signedAngleBetween({ first: [1, 0, 0], second: [0, 0, -1], reference: [0, 1, 0] });
     * ```
     */
    signedAngleBetween(inputs: Inputs.Vector.TwoVectorsReferenceDto): number {
        const nab = this.cross({ first: inputs.first, second: inputs.second });
        const al = this.norm({ vector: inputs.first });
        const bl = this.norm({ vector: inputs.second });
        const abl = al * bl;
        const adb = this.dot({ first: inputs.first, second: inputs.second });
        const sina = this.norm({ vector: nab }) / abl;
        const cosa = adb / abl;
        const w = Math.atan2(sina, cosa);
        const s = this.dot({ first: inputs.reference, second: nab });
        const res = s > 0.0 ? w : 2 * Math.PI - w;
        return this.math.radToDeg({ number: res });
    }

    /**
     * Lists the numbers from `min` to `max`, stepping by `step`; `max` is included when a step
     * lands on it.
     *
     * Example: min=0, max=10, step=2 -> [0,2,4,6,8,10]
     * @param inputs - The start, the end and the step
     * @returns The numbers in the span
     * @group create
     * @shortname span
     * @drawable false
     * @example
     * ```typescript
     * const values = bitbybit.vector.span({ min: 0, max: 10, step: 2.5 });
     * ```
     */
    span(inputs: Inputs.Vector.SpanDto): number[] {
        const res = [];
        for (let i = inputs.min; i <= inputs.max; i += inputs.step) {
            res.push(i);
        }
        return res;
    }

    /**
     * Lists `nrItems` numbers from `min` to `max` spaced by an easing curve, so they bunch up at
     * one end or both.
     *
     * With `intervals` on, the result holds the gaps between neighbors instead of the values
     * themselves.
     * Example: min=0, max=100, nrItems=5, ease='easeInQuad' -> [0, 6.25, 25, 56.25, 100]
     * @param inputs - The start, the end, the number of items, the easing and whether to return the gaps
     * @returns The eased numbers, or the gaps between them
     * @group create
     * @shortname span ease items
     * @drawable false
     * @example
     * ```typescript
     * const eased = bitbybit.vector.spanEaseItems({ min: 0, max: 100, nrItems: 5, ease: Bit.Inputs.Math.easeEnum.easeInQuad, intervals: false });
     * ```
     */
    spanEaseItems(inputs: Inputs.Vector.SpanEaseItemsDto): number[] {
        const res = [];
        for (let i = 0; i < inputs.nrItems; i++) {
            const x = i * 1 / (inputs.nrItems - 1);
            res.push(this.math.ease({ x: x, ease: inputs.ease, min: inputs.min, max: inputs.max }));
        }
        if (inputs.intervals) {
            return res.map((v, i, a) => i === 0 ? v : v - a[i - 1]!);
        }
        return res;
    }

    /**
     * Lists `nrItems` evenly spaced numbers from `min` to `max`, both included.
     *
     * Example: min=0, max=10, nrItems=5 -> [0, 2.5, 5, 7.5, 10]
     * @param inputs - The start, the end and the number of items
     * @returns The evenly spaced numbers
     * @group create
     * @shortname span linear items
     * @drawable false
     * @example
     * ```typescript
     * const values = bitbybit.vector.spanLinearItems({ min: 0, max: 10, nrItems: 5 });
     * ```
     */
    spanLinearItems(inputs: Inputs.Vector.SpanLinearItemsDto): number[] {
        const res = [];
        const dist = (inputs.max - inputs.min);
        for (let i = 0; i < inputs.nrItems; i++) {
            const x = dist * i / (inputs.nrItems - 1);
            res.push(x + inputs.min);
        }
        return res;
    }

    /**
     * Subtracts the second vector from the first, entry by entry.
     *
     * Example: [10,20,30] - [1,2,3] -> [9,18,27]
     * @param inputs - The vector to subtract from and the vector to subtract
     * @returns The vector of differences
     * @group base
     * @shortname sub
     * @drawable false
     * @example
     * ```typescript
     * const diff = bitbybit.vector.sub({ first: [10, 20, 30], second: [1, 2, 3] });
     * ```
     */
    sub(inputs: Inputs.Vector.TwoVectorsDto): number[] {
        const res = [];
        for (let i = 0; i < inputs.first.length; i++) {
            res.push(inputs.first[i]! - inputs.second[i]!);
        }
        return res;
    }

    /**
     * Adds up all values of a vector into one number.
     *
     * Example: [1,2,3,4] -> 10
     * @param inputs - The vector to add up
     * @returns The total
     * @group base
     * @shortname sum
     * @drawable false
     * @example
     * ```typescript
     * const total = bitbybit.vector.sum({ vector: [1, 2, 3, 4] });
     * ```
     */
    sum(inputs: Inputs.Vector.VectorDto): number {
        return inputs.vector.reduce((a, b) => a + b, 0);
    }

    /**
     * Computes the squared length of a 3D vector, which avoids the square root when only comparing
     * lengths.
     *
     * Example: [3,4,0] -> 25
     * @param inputs - The 3D vector
     * @returns The squared length
     * @group base
     * @shortname length squared
     * @drawable false
     * @example
     * ```typescript
     * const l2 = bitbybit.vector.lengthSq({ vector: [3, 4, 0] });
     * ```
     */
    lengthSq(inputs: Inputs.Vector.Vector3Dto): number {
        const v = inputs.vector;
        return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    }

    /**
     * Computes the length of a 3D vector.
     *
     * Example: [3,4,0] -> 5
     * @param inputs - The 3D vector
     * @returns The length in model units
     * @group base
     * @shortname length
     * @drawable false
     * @example
     * ```typescript
     * const len = bitbybit.vector.length({ vector: [3, 4, 0] });
     * ```
     */
    length(inputs: Inputs.Vector.Vector3Dto): number {
        return Math.sqrt(this.lengthSq(inputs));
    }

    /**
     * Turns a list of number strings into numbers.
     *
     * A string that is not a number becomes NaN.
     * Example: ['1', '2.5', '3'] -> [1, 2.5, 3]
     * @param inputs - The strings to parse
     * @returns The numbers
     * @group create
     * @shortname parse numbers
     * @drawable false
     * @example
     * ```typescript
     * const numbers = bitbybit.vector.parseNumbers({ vector: ["1", "2.5", "-3"] });
     * ```
     */
    parseNumbers(inputs: Inputs.Vector.VectorStringDto): number[] {
        return inputs.vector.map(v => parseFloat(v));
    }
}
