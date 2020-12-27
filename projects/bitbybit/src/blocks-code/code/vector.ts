import { Injectable } from '@angular/core';
import { Angle } from '@babylonjs/core';
import { Context } from './context';

@Injectable()
/**
 * Contains various methods for vector mathematics
 */
export class Vector {

    constructor(private readonly context: Context) { }
    /**
     * Measures the angle between two vectors in degrees
     * @param inputs Contains two vectors represented as number arrays
     */
    angle(inputs: TwoVectorsDto): number {
        return Angle.FromRadians(this.context.verb.core.Vec.angleBetween(inputs.first, inputs.second)).degrees();
    }

    /**
     * Measures the normalized 2d angle between two vectors in degrees
     * @param inputs Contains two vectors represented as number arrays
     */
    angleBetweenNormalized2d(inputs: TwoVectorsDto): number {
        return Angle.FromRadians(this.context.verb.core.Vec.angleBetweenNormalized2d(inputs.first, inputs.second)).degrees();
    }

    /**
     * Measures a positive angle between two vectors given the reference vector in degrees
     * @param inputs Contains information of two vectors and a reference vector
     */
    positiveAngleBetween(inputs: TwoVectorsReferenceDto): number {
        return Angle.FromRadians(this.context.verb.core.Vec.positiveAngleBetween(inputs.first, inputs.second, inputs.reference)).degrees();
    }

    /**
     * Adds all vectors together
     * @param inputs Vectors to be added
     */
    addAll(inputs: VectorsDto): number[] {
        return this.context.verb.core.Vec.addAll(inputs.vectors);
    }

    /**
     * Adds two vectors together
     * @param inputs Two vectors to be added
     */
    add(inputs: TwoVectorsDto): number[] {
        return this.context.verb.core.Vec.add(inputs.first, inputs.second);
    }

    /**
     * Checks if the boolean array is true or false
     * @param inputs Vectors to be checked
     */
    all(inputs: VectorBoolDto): boolean {
        return this.context.verb.core.Vec.all(inputs.vector);
    }

    /**
     * Cross two vectors
     * @param inputs Two vectors to be crossed
     */
    cross(inputs: TwoVectorsDto): number[] {
        return this.context.verb.core.Vec.cross(inputs.first, inputs.second);
    }

    /**
     * Squared distance between two vectors
     * @param inputs Two vectors
     */
    distSquared(inputs: TwoVectorsDto): number {
        return this.context.verb.core.Vec.distSquared(inputs.first, inputs.second);
    }

    /**
     * Distance between two vectors
     * @param inputs Two vectors
     */
    dist(inputs: TwoVectorsDto): number {
        return this.context.verb.core.Vec.dist(inputs.first, inputs.second);
    }

    /**
     * Divide the vector by a scalar value
     * @param inputs Contains vector and a scalar
     */
    div(inputs: VectorScalarDto): number[] {
        return this.context.verb.core.Vec.div(inputs.vector, inputs.scalar);
    }

    /**
     * Computes the domain between minimum and maximum values of the vector
     * @param inputs Vector information
     */
    domain(inputs: VectorDto): number {
        return this.context.verb.core.Vec.domain(inputs.vector);
    }

    /**
     * Dot product between two vectors
     * @param inputs Two vectors
     */
    dot(inputs: TwoVectorsDto): number {
        return this.context.verb.core.Vec.dot(inputs.first, inputs.second);
    }

    /**
     * Checks if vector is finite for each number and returns a boolean array
     * @param inputs Vector with possibly infinite values
     */
    finite(inputs: VectorDto): boolean[] {
        return this.context.verb.core.Vec.finite(inputs.vector);
    }

    /**
     * Checks if the vector is zero length
     * @param inputs Vector to be checked
     */
    isZero(inputs: VectorDto): boolean {
        return this.context.verb.core.Vec.isZero(inputs.vector);
    }

    /**
     * Finds in between vector between two vectors by providing a fracture
     * @param inputs Information for finding vector between two vectors using a fraction
     */
    lerp(inputs: FractionTwoVectorsDto): number[] {
        return this.context.verb.core.Vec.lerp(inputs.fraction, inputs.first, inputs.second);
    }

    /**
     * Finds the maximum value in the vector
     * @param inputs Vector to be checked
     */
    max(inputs: VectorDto): number {
        return this.context.verb.core.Vec.max(inputs.vector);
    }

    /**
     * Finds the minimum value in the vector
     * @param inputs Vector to be checked
     */
    min(inputs: VectorDto): number {
        return this.context.verb.core.Vec.min(inputs.vector);
    }

    /**
     * Multiple vector with the scalar
     * @param inputs Vector with a scalar
     */
    mul(inputs: VectorScalarDto): number[] {
        return inputs.vector.map(s => s * inputs.scalar);
    }

    /**
     * Negates the vector
     * @param inputs Vector to negate
     */
    neg(inputs: VectorDto): number[] {
        return this.context.verb.core.Vec.neg(inputs.vector);
    }

    /**
     * Compute squared norm
     * @param inputs Vector for squared norm
     */
    normSquared(inputs: VectorDto): number {
        return this.context.verb.core.Vec.normSquared(inputs.vector);
    }

    /**
     * Norm of the vector
     * @param inputs Vector to compute the norm
     */
    norm(inputs: VectorDto): number {
        return this.context.verb.core.Vec.norm(inputs.vector);
    }

    /**
     * Normalize the vector
     * @param inputs Vector to normalize
     */
    normalized(inputs: VectorDto): number {
        return this.context.verb.core.Vec.normalized(inputs.vector);
    }

    /**
     * Finds a point coordinates on the given distance ray that spans between the point along the direction vector
     * @param inputs Provide a point, vector and a distance for finding a point
     */
    onRay(inputs: RayPointDto): number[] {
        return this.context.verb.core.Vec.onRay(inputs.point, inputs.vector, inputs.distance);
    }

    /**
     * Creates a vector of integers between 0 and maximum ceiling integer
     * @param inputs Max value for the range
     */
    range(inputs: RangeMaxDto): number[] {
        return this.context.verb.core.Vec.range(inputs.max);
    }

    /**
     * Computes signed angle between two vectors and a reference. This will always return a smaller angle between two possible angles.
     * @param inputs Contains information of two vectors and a reference vector
     */
    signedAngleBetween(inputs: TwoVectorsReferenceDto): number {
        return this.context.verb.core.Vec.signedAngleBetween(inputs.first, inputs.second, inputs.reference);
    }

    /**
     * Creates a vector that contains numbers spanning between minimum and maximum values at a given step
     * @param inputs Span information containing min, max and step values
     */
    span(inputs: SpanDto): number[] {
        return this.context.verb.core.Vec.span(inputs.min, inputs.max, inputs.step);
    }

    /**
     * Subtract two vectors
     * @param inputs Two vectors
     */
    sub(inputs: TwoVectorsDto): number[] {
        return this.context.verb.core.Vec.sub(inputs.first, inputs.second);
    }

    /**
     * Sums the values of the vector
     * @param inputs Vector to sum
     */
    sum(inputs: VectorDto): number {
        return this.context.verb.core.Vec.sum(inputs.vector);
    }
}
interface RangeMaxDto {
    max: number;
}
interface SpanDto {
    min: number;
    max: number;
    step: number;
}

interface RayPointDto {
    vector: number[];
    point: number[];
    distance: number;
}
interface VectorDto {
    vector: number[];
}
interface VectorsDto {
    vectors: number[][];
}

interface VectorBoolDto {
    vector: boolean[];
}

interface FractionTwoVectorsDto {
    first: number[];
    second: number[];
    fraction: number;
}
interface VectorScalarDto {
    vector: number[];
    scalar: number;
}

interface TwoVectorsDto {
    first: number[];
    second: number[];
}

interface TwoVectorsReferenceDto {
    first: number[];
    second: number[];
    reference: number[];
}
