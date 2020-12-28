import { Injectable } from '@angular/core';
import { Angle } from '@babylonjs/core';
import { Context } from '../context';

/**
 * Contains various methods for vector mathematics. Vector in bitbybit is simply an array, usually containing numbers. In 3D [x, y, z] form describes space, where y is the up vector.
 * Because of this form Vector can be interchanged with Point, which also is an array in [x, y, z] form.
 * <div>
 *  <img src="../assets/images/blockly-images/vector/vector.png" alt="Blockly Image"/>
 * </div>
 */
@Injectable()
export class Vector {

    constructor(private readonly context: Context) { }
    /**
     * Measures the angle between two vectors in degrees
     * <div>
     *  <img src="../assets/images/blockly-images/vector/angleBetween.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Contains two vectors represented as number arrays
     * @returns Number in degrees
     */
    angleBetween(inputs: TwoVectorsDto): number {
        return Angle.FromRadians(this.context.verb.core.Vec.angleBetween(inputs.first, inputs.second)).degrees();
    }

    /**
     * Measures the normalized 2d angle between two vectors in degrees
     * <div>
     *  <img src="../assets/images/blockly-images/vector/angleBetweenNormalized2d.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Contains two vectors represented as number arrays
     * @returns Number in degrees
     */
    angleBetweenNormalized2d(inputs: TwoVectorsDto): number {
        return Angle.FromRadians(this.context.verb.core.Vec.angleBetweenNormalized2d(inputs.first, inputs.second)).degrees();
    }

    /**
     * Measures a positive angle between two vectors given the reference vector in degrees
     * <div>
     *  <img src="../assets/images/blockly-images/vector/positiveAngleBetween.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Contains information of two vectors and a reference vector
     */
    positiveAngleBetween(inputs: TwoVectorsReferenceDto): number {
        return Angle.FromRadians(this.context.verb.core.Vec.positiveAngleBetween(inputs.first, inputs.second, inputs.reference)).degrees();
    }

    /**
     * Adds all vectors together
     * <div>
     *  <img src="../assets/images/blockly-images/vector/addAll.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Vectors to be added
     */
    addAll(inputs: VectorsDto): number[] {
        return this.context.verb.core.Vec.addAll(inputs.vectors);
    }

    /**
     * Adds two vectors together
     * <div>
     *  <img src="../assets/images/blockly-images/vector/add.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Two vectors to be added
     */
    add(inputs: TwoVectorsDto): number[] {
        return this.context.verb.core.Vec.add(inputs.first, inputs.second);
    }

    /**
     * Checks if the boolean array is true or false
     * <div>
     *  <img src="../assets/images/blockly-images/vector/all.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Vectors to be checked
     */
    all(inputs: VectorBoolDto): boolean {
        return this.context.verb.core.Vec.all(inputs.vector);
    }

    /**
     * Cross two vectors
     * <div>
     *  <img src="../assets/images/blockly-images/vector/cross.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Two vectors to be crossed
     */
    cross(inputs: TwoVectorsDto): number[] {
        return this.context.verb.core.Vec.cross(inputs.first, inputs.second);
    }

    /**
     * Squared distance between two vectors
     * <div>
     *  <img src="../assets/images/blockly-images/vector/distSquared.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Two vectors
     */
    distSquared(inputs: TwoVectorsDto): number {
        return this.context.verb.core.Vec.distSquared(inputs.first, inputs.second);
    }

    /**
     * Distance between two vectors
     * <div>
     *  <img src="../assets/images/blockly-images/vector/dist.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Two vectors
     */
    dist(inputs: TwoVectorsDto): number {
        return this.context.verb.core.Vec.dist(inputs.first, inputs.second);
    }

    /**
     * Divide the vector by a scalar value
     * <div>
     *  <img src="../assets/images/blockly-images/vector/div.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Contains vector and a scalar
     */
    div(inputs: VectorScalarDto): number[] {
        return this.context.verb.core.Vec.div(inputs.vector, inputs.scalar);
    }

    /**
     * Computes the domain between minimum and maximum values of the vector
     * <div>
     *  <img src="../assets/images/blockly-images/vector/domain.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Vector information
     */
    domain(inputs: VectorDto): number {
        return this.context.verb.core.Vec.domain(inputs.vector);
    }

    /**
     * Dot product between two vectors
     * <div>
     *  <img src="../assets/images/blockly-images/vector/dot.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Two vectors
     */
    dot(inputs: TwoVectorsDto): number {
        return this.context.verb.core.Vec.dot(inputs.first, inputs.second);
    }

    /**
     * Checks if vector is finite for each number and returns a boolean array
     * <div>
     *  <img src="../assets/images/blockly-images/vector/finite.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Vector with possibly infinite values
     */
    finite(inputs: VectorDto): boolean[] {
        return this.context.verb.core.Vec.finite(inputs.vector);
    }

    /**
     * Checks if the vector is zero length
     * <div>
     *  <img src="../assets/images/blockly-images/vector/isZero.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Vector to be checked
     */
    isZero(inputs: VectorDto): boolean {
        return this.context.verb.core.Vec.isZero(inputs.vector);
    }

    /**
     * Finds in between vector between two vectors by providing a fracture
     * 
     * <div>
     *  <img src="../assets/images/blockly-images/vector/lerp.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Information for finding vector between two vectors using a fraction
     */
    lerp(inputs: FractionTwoVectorsDto): number[] {
        return this.context.verb.core.Vec.lerp(inputs.fraction, inputs.first, inputs.second);
    }

    /**
     * Finds the maximum value in the vector
     * <div>
     *  <img src="../assets/images/blockly-images/vector/max.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Vector to be checked
     */
    max(inputs: VectorDto): number {
        return this.context.verb.core.Vec.max(inputs.vector);
    }

    /**
     * Finds the minimum value in the vector
     * <div>
     *  <img src="../assets/images/blockly-images/vector/min.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Vector to be checked
     */
    min(inputs: VectorDto): number {
        return this.context.verb.core.Vec.min(inputs.vector);
    }

    /**
     * Multiple vector with the scalar
     * <div>
     *  <img src="../assets/images/blockly-images/vector/mul.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Vector with a scalar
     */
    mul(inputs: VectorScalarDto): number[] {
        return inputs.vector.map(s => s * inputs.scalar);
    }

    /**
     * Negates the vector
     * <div>
     *  <img src="../assets/images/blockly-images/vector/neg.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Vector to negate
     */
    neg(inputs: VectorDto): number[] {
        return this.context.verb.core.Vec.neg(inputs.vector);
    }

    /**
     * Compute squared norm
     * <div>
     *  <img src="../assets/images/blockly-images/vector/normSquared.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Vector for squared norm
     */
    normSquared(inputs: VectorDto): number {
        return this.context.verb.core.Vec.normSquared(inputs.vector);
    }

    /**
     * Norm of the vector
     * <div>
     *  <img src="../assets/images/blockly-images/vector/norm.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Vector to compute the norm
     */
    norm(inputs: VectorDto): number {
        return this.context.verb.core.Vec.norm(inputs.vector);
    }

    /**
     * Normalize the vector
     * <div>
     *  <img src="../assets/images/blockly-images/vector/normalized.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Vector to normalize
     */
    normalized(inputs: VectorDto): number {
        return this.context.verb.core.Vec.normalized(inputs.vector);
    }

    /**
     * Finds a point coordinates on the given distance ray that spans between the point along the direction vector
     * <div>
     *  <img src="../assets/images/blockly-images/vector/onRay.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Provide a point, vector and a distance for finding a point
     */
    onRay(inputs: RayPointDto): number[] {
        return this.context.verb.core.Vec.onRay(inputs.point, inputs.vector, inputs.distance);
    }

    /**
     * Creates a vector of integers between 0 and maximum ceiling integer
     * <div>
     *  <img src="../assets/images/blockly-images/vector/range.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Max value for the range
     */
    range(inputs: RangeMaxDto): number[] {
        return this.context.verb.core.Vec.range(inputs.max);
    }

    /**
     * Computes signed angle between two vectors and a reference. This will always return a smaller angle between two possible angles.
     * <div>
     *  <img src="../assets/images/blockly-images/vector/signedAngleBetween.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Contains information of two vectors and a reference vector
     */
    signedAngleBetween(inputs: TwoVectorsReferenceDto): number {
        return Angle.FromRadians(
            this.context.verb.core.Vec.signedAngleBetween(inputs.first, inputs.second, inputs.reference)
        ).degrees();
    }

    /**
     * Creates a vector that contains numbers spanning between minimum and maximum values at a given step
     * <div>
     *  <img src="../assets/images/blockly-images/vector/span.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Span information containing min, max and step values
     */
    span(inputs: SpanDto): number[] {
        return this.context.verb.core.Vec.span(inputs.min, inputs.max, inputs.step);
    }

    /**
     * Subtract two vectors
     * <div>
     *  <img src="../assets/images/blockly-images/vector/sub.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Two vectors
     */
    sub(inputs: TwoVectorsDto): number[] {
        return this.context.verb.core.Vec.sub(inputs.first, inputs.second);
    }

    /**
     * Sums the values of the vector
     * <div>
     *  <img src="../assets/images/blockly-images/vector/sum.png" alt="Blockly Image"/>
     * </div>
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
