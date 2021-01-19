import { simplifyDeclaration } from '../simplify-declaration';

export const vectorInputsString = simplifyDeclaration(`
import { IntervalDto } from '../bitbybit/base-types';
export namespace Vector {
    class TwoVectorsDto {
        /**
         * First vector
         */
        first: number[];
        /**
         * Second vector
         */
        second: number[];
    }
    class VectorBoolDto {
        /**
         * Vector of booleans
         */
        vector: boolean[];
    }
    class VectorDto {
        /**
         * Vector array of numbers
         */
        vector: number[];
    }
    class RangeMaxDto {
        /**
         * Maximum range boundary
         */
        max: number;
    }
    class SpanDto extends BaseTypes.IntervalDto {
        /**
         * Step of the span
         */
        step: number;
    }
    class RayPointDto extends VectorDto {
        /**
         * Origin location of the ray
         */
        point: number[];
        /**
         * Distance to the point on the ray
         */
        distance: number;
    }
    class VectorsDto {
        /**
         * Vectors array
         */
        vectors: number[][];
    }
    class FractionTwoVectorsDto extends TwoVectorsDto {
        /**
         * Fraction number
         */
        fraction: number;
    }
    class VectorScalarDto extends VectorDto {
        /**
         * Scalar number
         */
        scalar: number;
    }
    class TwoVectorsReferenceDto extends TwoVectorsDto {
        /**
         * Reference vector
         */
        reference: number[];
    }
}
`);
