/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./base-inputs";
import { Math } from "./math-inputs";

/**
 * Parameters for vector arithmetic: the operands for addition, subtraction, scaling, dot and cross
 * products, normalization, angle and distance measurement, projection and interpolation. Vectors are
 * number arrays, so these DTOs mostly carry one or two of them plus a scalar.
 */
export namespace Vector {

    /**
     * Two vectors for the pairwise operations of `vector`: `add`, `sub`, `dot`, `cross`, `dist`,
     * `angleBetween` and the rest. Both need the same number of entries; where order matters,
     * `first` is the left operand.
     */
    export class TwoVectorsDto {
        constructor(first?: number[], second?: number[]) {
            if (first !== undefined) { this.first = first; }
            if (second !== undefined) { this.second = second; }
        }
        /**
         * First vector. Where order matters it is the left operand: the one subtracted from in
         * `sub`, the left side of the product in `cross`.
         * @default undefined
         */
        first!: number[];
        /**
         * Second vector, with the same number of entries as `first`.
         * @default undefined
         */
        second!: number[];
    }
    /**
     * A list of booleans for `vector.all`, which tells whether every one of them is true.
     */
    export class VectorBoolDto {
        constructor(vector?: boolean[]) {
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * The booleans to check.
         * @default undefined
         */
        vector!: boolean[];
    }
    /**
     * Vectors to filter with `vector.removeAllDuplicateVectors`, and how close two vectors must be
     * to count as the same.
     */
    export class RemoveAllDuplicateVectorsDto {
        constructor(vectors?: number[][], tolerance?: number) {
            if (vectors !== undefined) { this.vectors = vectors; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * The vectors to filter; their order is kept.
         * @default undefined
         */
        vectors!: number[][];
        /**
         * Two vectors count as the same when every entry differs by less than this.
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         */
        tolerance = 1e-7;
    }
    /**
     * Vectors to filter with `vector.removeConsecutiveDuplicateVectors`: only a vector that repeats
     * its predecessor is dropped, and optionally a last vector that repeats the first.
     */
    export class RemoveConsecutiveDuplicateVectorsDto {
        constructor(vectors?: number[][], checkFirstAndLast?: boolean, tolerance?: number) {
            if (vectors !== undefined) { this.vectors = vectors; }
            if (checkFirstAndLast !== undefined) { this.checkFirstAndLast = checkFirstAndLast; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * The vectors to filter; their order is kept.
         * @default undefined
         */
        vectors!: number[][];
        /**
         * When true, a last vector that repeats the first is dropped as well, which closes a loop
         * of points cleanly.
         * @default false
         */
        checkFirstAndLast = false;
        /**
         * Two vectors count as the same when every entry differs by less than this.
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         */
        tolerance = 1e-7;
    }
    /**
     * Two vectors to compare with `vector.vectorsTheSame`, and how close their entries must be.
     */
    export class VectorsTheSameDto {
        constructor(vec1?: number[], vec2?: number[], tolerance?: number) {
            if (vec1 !== undefined) { this.vec1 = vec1; }
            if (vec2 !== undefined) { this.vec2 = vec2; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * First vector to compare.
         * @default undefined
         */
        vec1!: number[];
        /**
         * Second vector; a different length means the two are never the same.
         * @default undefined
         */
        vec2!: number[];
        /**
         * Entries count as equal when they differ by less than this.
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         */
        tolerance = 1e-7;
    }
    /**
     * One vector of any length for the single-vector methods of `vector`: `sum`, `min`, `max`,
     * `norm`, `neg`, `finite`, `isZero` and the others.
     */
    export class VectorDto {
        constructor(vector?: number[]) {
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * The vector, as a list of numbers.
         * @default undefined
         */
        vector!: number[];
    }
    /**
     * A list of number strings for `vector.parseNumbers`, which turns each into a number.
     */
    export class VectorStringDto {
        constructor(vector?: string[]) {
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * The strings to parse, such as `["1", "2.5"]`.
         * @default undefined
         */
        vector!: string[];
    }
    /**
     * One 3D vector for `vector.length`, `vector.lengthSq` and `vector.normalized`.
     */
    export class Vector3Dto {
        constructor(vector?: Base.Vector3) {
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * The vector as `[x, y, z]`.
         * @default undefined
         */
        vector!: Base.Vector3;
    }
    /**
     * The end of the range `vector.range` lists, which runs from 0 up to but not including it.
     */
    export class RangeMaxDto {
        constructor(max?: number) {
            if (max !== undefined) { this.max = max; }
        }
        /**
         * The end of the range; it is not included, so 5 gives `[0, 1, 2, 3, 4]`.
         * @default 10
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        max: number = 10;
    }
    /**
     * The three values `vector.vectorXYZ` puts together into `[x, y, z]`.
     */
    export class VectorXYZDto {
        constructor(x?: number, y?: number, z?: number) {
            if (x !== undefined) { this.x = x; }
            if (y !== undefined) { this.y = y; }
            if (z !== undefined) { this.z = z; }
        }
        /**
         * The X value, the first entry.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.5
         */
        x: number = 0;
        /**
         * The Y value, the second entry; Y is up.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.5
         */
        y: number = 0;
        /**
         * The Z value, the third entry.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.5
         */
        z: number = 0;
    }
    /**
     * The two values `vector.vectorXY` puts together into `[x, y]`.
     */
    export class VectorXYDto {
        constructor(x?: number, y?: number) {
            if (x !== undefined) { this.x = x; }
            if (y !== undefined) { this.y = y; }
        }
        /**
         * The X value, the first entry.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.5
         */
        x: number = 0;
        /**
         * The Y value, the second entry.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.5
         */
        y: number = 0;
    }
    /**
     * A start, an end and a step for `vector.span`, which lists every number from `min` to `max` in
     * steps of `step`.
     */
    export class SpanDto {
        constructor(step?: number, min?: number, max?: number) {
            if (step !== undefined) { this.step = step; }
            if (min !== undefined) { this.min = min; }
            if (max !== undefined) { this.max = max; }
        }
        /**
         * Distance between neighboring numbers; the last number is `max` only when a step lands on
         * it.
         * @default 0.1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        step = 0.1;
        /**
         * The first number of the span.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        min = 0;
        /**
         * The end of the span; included when a step lands on it.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        max = 1;
    }
    /**
     * A start, an end, a count and an easing curve for `vector.spanEaseItems`, which spaces the
     * numbers unevenly along the curve.
     */
    export class SpanEaseItemsDto {
        constructor(nrItems?: number, min?: number, max?: number, ease?: Math.easeEnum) {
            if (nrItems !== undefined) { this.nrItems = nrItems; }
            if (min !== undefined) { this.min = min; }
            if (max !== undefined) { this.max = max; }
            if (ease !== undefined) { this.ease = ease; }
        }
        /**
         * How many numbers to produce, including `min` and `max`; at least 2.
         * @default 100
         * @minimum 2
         * @maximum Infinity
         * @step 1
         */
        nrItems = 100;
        /**
         * The first number.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        min = 0;
        /**
         * The last number.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        max = 1;
        /**
         * The easing curve that spaces the numbers: an `easeIn` curve bunches them near `min`, an
         * `easeOut` curve near `max`, an `easeInOut` curve at both ends.
         * @default easeInSine
         */
        ease: Math.easeEnum = Math.easeEnum.easeInSine;
        /**
         * When true, the result holds the gaps between neighboring numbers instead of the numbers
         * themselves; the first entry is `min`.
         * @default false
         */
        intervals = false;
    }
    /**
     * A start, an end and a count for `vector.spanLinearItems`, which spaces the numbers evenly.
     */
    export class SpanLinearItemsDto {
        constructor(nrItems?: number, min?: number, max?: number) {
            if (nrItems !== undefined) { this.nrItems = nrItems; }
            if (min !== undefined) { this.min = min; }
            if (max !== undefined) { this.max = max; }
        }
        /**
         * How many numbers to produce, including `min` and `max`; at least 2.
         * @default 100
         * @minimum 2
         * @maximum Infinity
         * @step 1
         */
        nrItems = 100;
        /**
         * The first number.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        min = 0;
        /**
         * The last number.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        max = 1;
    }
    /**
     * A start point, a direction and a distance for `vector.onRay`, which finds the point that far
     * along the direction.
     */
    export class RayPointDto {
        constructor(point?: Base.Point3, distance?: number, vector?: number[]) {
            if (point !== undefined) { this.point = point; }
            if (distance !== undefined) { this.distance = distance; }
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * Where the ray starts.
         * @default undefined
         */
        point!: Base.Point3;
        /**
         * How far to travel from `point`, in multiples of the direction vector's length; a negative
         * distance goes backwards.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        distance: number = 1;
        /**
         * The direction to travel in, used as given; a unit vector makes `distance` a length in
         * model units.
         * @default undefined
         */
        vector!: number[];
    }
    /**
     * A list of vectors for `vector.addAll`, which adds them entry by entry into one vector.
     */
    export class VectorsDto {
        constructor(vectors?: number[][]) {
            if (vectors !== undefined) { this.vectors = vectors; }
        }
        /**
         * The vectors to add together; the result has as many entries as the first.
         * @default undefined
         */
        vectors!: number[][];
    }
    /**
     * Two vectors and a fraction for `vector.lerp`, which blends them: 1 gives the first, 0 the
     * second.
     */
    export class FractionTwoVectorsDto {
        constructor(fraction?: number, first?: Base.Vector3, second?: Base.Vector3) {
            if (fraction !== undefined) { this.fraction = fraction; }
            if (first !== undefined) { this.first = first; }
            if (second !== undefined) { this.second = second; }
        }
        /**
         * The share of `first` in the blend: 1 gives `first`, 0 gives `second`, 0.5 the midpoint.
         * Values outside 0 to 1 extrapolate past the ends.
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        fraction = 0.5;
        /**
         * The vector the blend reaches at fraction 1.
         * @default undefined
         */
        first!: Base.Vector3;
        /**
         * The vector the blend reaches at fraction 0.
         * @default undefined
         */
        second!: Base.Vector3;
    }
    /**
     * A vector and one number for `vector.mul` and `vector.div`, which apply the number to every
     * entry.
     */
    export class VectorScalarDto {
        constructor(scalar?: number, vector?: number[]) {
            if (scalar !== undefined) { this.scalar = scalar; }
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * The number every entry is multiplied or divided by.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        scalar: number = 1;
        /**
         * The vector to scale.
         * @default undefined
         */
        vector!: number[];
    }
    /**
     * Two vectors and a reference direction for `vector.signedAngleBetween` and
     * `vector.positiveAngleBetween`, which measure the turn from the first to the second around the
     * reference.
     */
    export class TwoVectorsReferenceDto {
        constructor(reference?: number[], first?: Base.Vector3, second?: Base.Vector3) {
            if (reference !== undefined) { this.reference = reference; }
            if (first !== undefined) { this.first = first; }
            if (second !== undefined) { this.second = second; }
        }
        /**
         * The direction to turn around; the angle is counter-clockwise when this vector points
         * toward you.
         * @default undefined
         */
        reference!: number[];
        /**
         * The vector the turn starts from.
         * @default undefined
         */
        first!: Base.Vector3;
        /**
         * The vector the turn ends at.
         * @default undefined
         */
        second!: Base.Vector3;
    }
}
