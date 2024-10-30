/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./base-inputs";
import { Math } from "./inputs";

export namespace Vector {

    export class TwoVectorsDto {
        constructor(first?: Base.Vector3, second?: Base.Vector3) {
            if (first !== undefined) { this.first = first; }
            if (second !== undefined) { this.second = second; }
        }
        /**
         * First vector
         * @default undefined
         */
        first: Base.Vector3;
        /**
         * Second vector
         * @default undefined
         */
        second: Base.Vector3;
    }
    export class VectorBoolDto {
        constructor(vector?: boolean[]) {
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * Vector of booleans
         * @default undefined
         */
        vector: boolean[];
    }
    export class RemoveAllDuplicateVectorsDto {
        constructor(vectors?: number[][], tolerance?: number) {
            if (vectors !== undefined) { this.vectors = vectors; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * Vectors array
         * @default undefined
         */
        vectors: number[][];
        /**
         * Tolerance value
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         */
        tolerance = 1e-7;
    }
    export class RemoveConsecutiveDuplicateVectorsDto {
        constructor(vectors?: number[][], checkFirstAndLast?: boolean, tolerance?: number) {
            if (vectors !== undefined) { this.vectors = vectors; }
            if (checkFirstAndLast !== undefined) { this.checkFirstAndLast = checkFirstAndLast; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * Vectors array
         * @default undefined
         */
        vectors: number[][];
        /**
         * Check first and last vectors
         * @default false
         */
        checkFirstAndLast = false;
        /**
         * Tolerance value
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         */
        tolerance = 1e-7;
    }
    export class VectorDto {
        constructor(vector?: number[]) {
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * Vector array of numbers
         * @default undefined
         */
        vector: number[];
    }
    export class RangeMaxDto {
        constructor(max?: number) {
            if (max !== undefined) { this.max = max; }
        }
        /**
         * Maximum range boundary
         * @default 10
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        max: number;
    }
    export class VectorXYZDto {
        constructor(x?: number, y?: number, z?: number) {
            if (x !== undefined) { this.x = x; }
            if (y !== undefined) { this.y = y; }
            if (z !== undefined) { this.z = z; }
        }
        /**
         * X value of vector
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.5
         */
        x: number;
        /**
         * Y value of vector
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.5
         */
        y: number;
        /**
         * Z value of vector
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.5
         */
        z: number;
    }
    export class VectorXYDto {
        constructor(x?: number, y?: number) {
            if (x !== undefined) { this.x = x; }
            if (y !== undefined) { this.y = y; }
        }
        /**
         * X value of vector
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.5
         */
        x: number;
        /**
         * Y value of vector
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.5
         */
        y: number;
    }
    export class SpanDto {
        constructor(step?: number, min?: number, max?: number) {
            if (step !== undefined) { this.step = step; }
            if (min !== undefined) { this.min = min; }
            if (max !== undefined) { this.max = max; }
        }
        /**
         * Step of the span
         * @default 0.1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        step = 0.1;
        /**
        * Min value of the span
        * @default 0
        * @minimum -Infinity
        * @maximum Infinity
        * @step 1
        */
        min = 0;
        /**
        * Max value of the span
        * @default 1
        * @minimum -Infinity
        * @maximum Infinity
        * @step 1
        */
        max = 1;
    }
    export class SpanEaseItemsDto {
        constructor(nrItems?: number, min?: number, max?: number, ease?: Math.easeEnum) {
            if (nrItems !== undefined) { this.nrItems = nrItems; }
            if (min !== undefined) { this.min = min; }
            if (max !== undefined) { this.max = max; }
            if (ease !== undefined) { this.ease = ease; }
        }
        /**
         * Nr of items in the span
         * @default 100
         * @minimum 2
         * @maximum Infinity
         * @step 1
         */
        nrItems = 100;
        /**
        * Min value of the span
        * @default 0
        * @minimum -Infinity
        * @maximum Infinity
        * @step 1
        */
        min = 0;
        /**
        * Max value of the span
        * @default 1
        * @minimum -Infinity
        * @maximum Infinity
        * @step 1
        */
        max = 1;
        /**
        * Ease type
        * @default easeInSine
        */
        ease: Math.easeEnum = Math.easeEnum.easeInSine;
        /**
         * Indicates wether only intervals should be outputed. This will output step lengths between the values.
         * @default false
         */
        intervals = false;
    }
    export class SpanLinearItemsDto {
        constructor(nrItems?: number, min?: number, max?: number) {
            if (nrItems !== undefined) { this.nrItems = nrItems; }
            if (min !== undefined) { this.min = min; }
            if (max !== undefined) { this.max = max; }
        }
        /**
         * Nr of items in the span
         * @default 100
         * @minimum 2
         * @maximum Infinity
         * @step 1
         */
        nrItems = 100;
        /**
        * Min value of the span
        * @default 0
        * @minimum -Infinity
        * @maximum Infinity
        * @step 1
        */
        min = 0;
        /**
        * Max value of the span
        * @default 1
        * @minimum -Infinity
        * @maximum Infinity
        * @step 1
        */
        max = 1;
    }
    export class RayPointDto {
        constructor(point?: Base.Point3, distance?: number, vector?: number[]) {
            if (point !== undefined) { this.point = point; }
            if (distance !== undefined) { this.distance = distance; }
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * Origin location of the ray
         * @default undefined
         */
        point: Base.Point3;
        /**
         * Distance to the point on the ray
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        distance: number;
        /**
         * Vector array of numbers
         * @default undefined
         */
        vector: number[];
    }
    export class VectorsDto {
        constructor(vectors?: number[][]) {
            if (vectors !== undefined) { this.vectors = vectors; }
        }
        /**
         * Vectors array
         * @default undefined
         */
        vectors: number[][];
    }
    export class FractionTwoVectorsDto {
        constructor(fraction?: number, first?: Base.Vector3, second?: Base.Vector3) {
            if (fraction !== undefined) { this.fraction = fraction; }
            if (first !== undefined) { this.first = first; }
            if (second !== undefined) { this.second = second; }
        }
        /**
         * Fraction number
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        fraction = 0.5;
        /**
         * First vector
         * @default undefined
         */
        first: Base.Vector3;
        /**
         * Second vector
         * @default undefined
         */
        second: Base.Vector3;
    }
    export class VectorScalarDto {
        constructor(scalar?: number, vector?: number[]) {
            if (scalar !== undefined) { this.scalar = scalar; }
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * Scalar number
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        scalar: number;
        /**
         * Vector array of numbers
         * @default undefined
         */
        vector: number[];
    }
    export class TwoVectorsReferenceDto {
        constructor(reference?: number[], first?: Base.Vector3, second?: Base.Vector3) {
            if (reference !== undefined) { this.reference = reference; }
            if (first !== undefined) { this.first = first; }
            if (second !== undefined) { this.second = second; }
        }
        /**
         * Reference vector
         * @default undefined
         */
        reference: number[];
        /**
         * First vector
         * @default undefined
         */
        first: Base.Vector3;
        /**
         * Second vector
         * @default undefined
         */
        second: Base.Vector3;
    }
}
