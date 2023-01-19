import { BaseTypes } from '../bitbybit/base-types';
import { Base } from './base-inputs';

// tslint:disable-next-line: no-namespace
export namespace Vector {
    export class TwoVectorsDto {
        /**
         * First vector
         */
        first: Base.Vector3;
        /**
         * Second vector
         */
        second: Base.Vector3;
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
        point:  Base.Point3;
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
