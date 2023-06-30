/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./base-inputs";

// tslint:disable-next-line: no-namespace
export namespace Vector {
    export class TwoVectorsDto {
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
        /**
         * Vector of booleans
         * @default undefined
         */
        vector: boolean[];
    }
    export class VectorDto {
        /**
         * Vector array of numbers
         * @default undefined
         */
        vector: number[];
    }
    export class RangeMaxDto {
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
    export class SpanDto {
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
    export class RayPointDto {
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
        /**
         * Vectors array
         * @default undefined
         */
        vectors: number[][];
    }
    export class FractionTwoVectorsDto {
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
