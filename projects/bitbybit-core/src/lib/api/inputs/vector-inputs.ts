import { BaseTypes } from '../bitbybit/base-types';

// tslint:disable-next-line: no-namespace
export namespace Vector {
    export class TwoVectorsDto {
        /**
         * First vector
         */
        first: number[];
        /**
         * Second vector
         */
        second: number[];
    }
    export class VectorBoolDto {
        /**
         * Vector of booleans
         */
        vector: boolean[];
    }
    export class VectorDto {
        /**
         * Vector array of numbers
         */
        vector: number[];
    }
    export class RangeMaxDto {
        /**
         * Maximum range boundary
         */
        max: number;
    }
    export class SpanDto extends BaseTypes.IntervalDto {
        /**
         * Step of the span
         */
        step: number;
    }
    export class RayPointDto extends VectorDto {
        /**
         * Origin location of the ray
         */
        point: number[];
        /**
         * Distance to the point on the ray
         */
        distance: number;
    }
    export class VectorsDto {
        /**
         * Vectors array
         */
        vectors: number[][];
    }
    export class FractionTwoVectorsDto extends TwoVectorsDto {
        /**
         * Fraction number
         */
        fraction = 0.5;
    }
    export class VectorScalarDto extends VectorDto {
        /**
         * Scalar number
         */
        scalar: number;
    }
    export class TwoVectorsReferenceDto extends TwoVectorsDto {
        /**
         * Reference vector
         */
        reference: number[];
    }
}
