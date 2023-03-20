
import { Angle } from '@babylonjs/core';
import { Context } from '../context';
import * as Inputs from '../inputs/inputs';

/**
 * Contains various methods for vector mathematics. Vector in bitbybit is simply an array, usually containing numbers.
 * In 3D [x, y, z] form describes space, where y is the up vector.
 * Because of this form Vector can be interchanged with Point, which also is an array in [x, y, z] form.
 * <div>
 *  <img src="../assets/images/blockly-images/vector/vector.svg" alt="Blockly Image"/>
 * </div>
 */

export class Vector {

    constructor(private readonly context: Context) { }
    /**
     * Measures the angle between two vectors in degrees
     * <div>
     *  <img src="../assets/images/blockly-images/vector/angleBetween.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#angleBetween
     * @param inputs Contains two vectors represented as number arrays
     * @group angles
     * @shortname angle
     * @returns Number in degrees
     * @drawable false
     */
    angleBetween(inputs: Inputs.Vector.TwoVectorsDto): number {
        return Angle.FromRadians(this.context.verb.core.Vec.angleBetween(inputs.first, inputs.second)).degrees();
    }

    /**
     * Measures the normalized 2d angle between two vectors in degrees
     * <div>
     *  <img src="../assets/images/blockly-images/vector/angleBetweenNormalized2d.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#angleBetweenNormalized2d
     * @param inputs Contains two vectors represented as number arrays
     * @returns Number in degrees
     * @group angles
     * @shortname angle normalized 2d
     * @drawable false
     */
    angleBetweenNormalized2d(inputs: Inputs.Vector.TwoVectorsDto): number {
        return Angle.FromRadians(this.context.verb.core.Vec.angleBetweenNormalized2d(inputs.first, inputs.second)).degrees();
    }

    /**
     * Measures a positive angle between two vectors given the reference vector in degrees
     * <div>
     *  <img src="../assets/images/blockly-images/vector/positiveAngleBetween.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#positiveAngleBetween
     * @param inputs Contains information of two vectors and a reference vector
     * @returns Number in degrees
     * @group angles
     * @shortname positive angle
     * @drawable false
     */
    positiveAngleBetween(inputs: Inputs.Vector.TwoVectorsReferenceDto): number {
        return Angle.FromRadians(this.context.verb.core.Vec.positiveAngleBetween(inputs.first, inputs.second, inputs.reference)).degrees();
    }

    /**
     * Adds all vector xyz values together and create a new vector
     * <div>
     *  <img src="../assets/images/blockly-images/vector/addAll.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#addAll
     * @param inputs Vectors to be added
     * @returns New vector that has xyz values as sums of all the vectors
     * @group sum
     * @shortname add all
     * @drawable false
     */
    addAll(inputs: Inputs.Vector.VectorsDto): number[] {
        return this.context.verb.core.Vec.addAll(inputs.vectors);
    }

    /**
     * Adds two vectors together
     * <div>
     *  <img src="../assets/images/blockly-images/vector/add.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#add
     * @param inputs Two vectors to be added
     * @returns Number array representing vector
     * @group sum
     * @shortname add
     * @drawable false
     */
    add(inputs: Inputs.Vector.TwoVectorsDto): number[] {
        return this.context.verb.core.Vec.add(inputs.first, inputs.second);
    }

    /**
     * Checks if the boolean array contains only true values, if there's a single false it will return false.
     * <div>
     *  <img src="../assets/images/blockly-images/vector/all.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#all
     * @param inputs Vectors to be checked
     * @returns Boolean indicating if vector contains only true values
     * @group sum
     * @shortname all
     * @drawable false
     */
    all(inputs: Inputs.Vector.VectorBoolDto): boolean {
        return this.context.verb.core.Vec.all(inputs.vector);
    }

    /**
     * Cross two vectors
     * <div>
     *  <img src="../assets/images/blockly-images/vector/cross.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#cross
     * @param inputs Two vectors to be crossed
     * @group base
     * @shortname all
     * @returns Crossed vector
     * @drawable false
     */
    cross(inputs: Inputs.Vector.TwoVectorsDto): number[] {
        return this.context.verb.core.Vec.cross(inputs.first, inputs.second);
    }

    /**
     * Squared distance between two vectors
     * <div>
     *  <img src="../assets/images/blockly-images/vector/distSquared.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#distSquared
     * @param inputs Two vectors
     * @returns Number representing squared distance between two vectors
     * @group distance
     * @shortname dist squared
     * @drawable false
     */
    distSquared(inputs: Inputs.Vector.TwoVectorsDto): number {
        return this.context.verb.core.Vec.distSquared(inputs.first, inputs.second);
    }

    /**
     * Distance between two vectors
     * <div>
     *  <img src="../assets/images/blockly-images/vector/dist.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#dist
     * @param inputs Two vectors
     * @returns Number representing distance between two vectors
     * @group distance
     * @shortname dist
     * @drawable false
     */
    dist(inputs: Inputs.Vector.TwoVectorsDto): number {
        return this.context.verb.core.Vec.dist(inputs.first, inputs.second);
    }

    /**
     * Divide the vector by a scalar value/
     * <div>
     *  <img src="../assets/images/blockly-images/vector/div.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#div
     * @param inputs Contains vector and a scalar
     * @returns Vector that is a result of division by a scalar
     * @group base
     * @shortname div
     * @drawable false
     */
    div(inputs: Inputs.Vector.VectorScalarDto): number[] {
        return this.context.verb.core.Vec.div(inputs.vector, inputs.scalar);
    }

    /**
     * Computes the domain between minimum and maximum values of the vector
     * <div>
     *  <img src="../assets/images/blockly-images/vector/domain.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#domain
     * @param inputs Vector information
     * @returns Number representing distance between two vectors
     * @group base
     * @shortname domain
     * @drawable false
     */
    domain(inputs: Inputs.Vector.VectorDto): number {
        return this.context.verb.core.Vec.domain(inputs.vector);
    }

    /**
     * Dot product between two vectors
     * <div>
     *  <img src="../assets/images/blockly-images/vector/dot.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#dot
     * @param inputs Two vectors
     * @returns Number representing dot product of the vector
     * @group base
     * @shortname dot
     * @drawable false
     */
    dot(inputs: Inputs.Vector.TwoVectorsDto): number {
        return this.context.verb.core.Vec.dot(inputs.first, inputs.second);
    }

    /**
     * Checks if vector is finite for each number and returns a boolean array
     * <div>
     *  <img src="../assets/images/blockly-images/vector/finite.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#finite
     * @param inputs Vector with possibly infinite values
     * @returns Vector array that contains boolean values for each number in the input
     * vector that identifies if value is finite (true) or infinite (false)
     * @group validate
     * @shortname finite
     * @drawable false
     */
    finite(inputs: Inputs.Vector.VectorDto): boolean[] {
        return this.context.verb.core.Vec.finite(inputs.vector);
    }

    /**
     * Checks if the vector is zero length
     * <div>
     *  <img src="../assets/images/blockly-images/vector/isZero.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#isZero
     * @param inputs Vector to be checked
     * @returns Boolean that identifies if vector is zero length
     * @group validate
     * @shortname isZero
     * @drawable false
     */
    isZero(inputs: Inputs.Vector.VectorDto): boolean {
        return this.context.verb.core.Vec.isZero(inputs.vector);
    }

    /**
     * Finds in between vector between two vectors by providing a fracture
     * <div>
     *  <img src="../assets/images/blockly-images/vector/lerp.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#lerp
     * @param inputs Information for finding vector between two vectors using a fraction
     * @returns Vector that is in between two vectors
     * @group distance
     * @shortname lerp
     * @drawable false
     */
    lerp(inputs: Inputs.Vector.FractionTwoVectorsDto): number[] {
        return this.context.verb.core.Vec.lerp(inputs.fraction, inputs.first, inputs.second);
    }

    /**
     * Finds the maximum value in the vector
     * <div>
     *  <img src="../assets/images/blockly-images/vector/max.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#max
     * @param inputs Vector to be checked
     * @returns Largest number in the vector
     * @group extract
     * @shortname max
     * @drawable false
     */
    max(inputs: Inputs.Vector.VectorDto): number {
        return this.context.verb.core.Vec.max(inputs.vector);
    }

    /**
     * Finds the minimum value in the vector
     * <div>
     *  <img src="../assets/images/blockly-images/vector/min.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#min
     * @param inputs Vector to be checked
     * @returns Lowest number in the vector
     * @group extract
     * @shortname min
     * @drawable false
     */
    min(inputs: Inputs.Vector.VectorDto): number {
        return this.context.verb.core.Vec.min(inputs.vector);
    }

    /**
     * Multiple vector with the scalar
     * <div>
     *  <img src="../assets/images/blockly-images/vector/mul.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#mul
     * @param inputs Vector with a scalar
     * @returns Vector that results from multiplication
     * @group base
     * @shortname mul
     * @drawable false
     */
    mul(inputs: Inputs.Vector.VectorScalarDto): number[] {
        return inputs.vector.map(s => s * inputs.scalar);
    }

    /**
     * Negates the vector
     * <div>
     *  <img src="../assets/images/blockly-images/vector/neg.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#neg
     * @param inputs Vector to negate
     * @returns Negative vector
     * @group base
     * @shortname neg
     * @drawable false
     */
    neg(inputs: Inputs.Vector.VectorDto): number[] {
        return this.context.verb.core.Vec.neg(inputs.vector);
    }

    /**
     * Compute squared norm
     * <div>
     *  <img src="../assets/images/blockly-images/vector/normSquared.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#normSquared
     * @param inputs Vector for squared norm
     * @returns Number that is squared norm
     * @group base
     * @shortname norm squared
     * @drawable false
     */
    normSquared(inputs: Inputs.Vector.VectorDto): number {
        return this.context.verb.core.Vec.normSquared(inputs.vector);
    }

    /**
     * Norm of the vector
     * <div>
     *  <img src="../assets/images/blockly-images/vector/norm.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#norm
     * @param inputs Vector to compute the norm
     * @returns Number that is norm of the vector
     * @group base
     * @shortname norm
     * @drawable false
     */
    norm(inputs: Inputs.Vector.VectorDto): number {
        return this.context.verb.core.Vec.norm(inputs.vector);
    }

    /**
     * Normalize the vector into a unit vector, that has a length of 1
     * <div>
     *  <img src="../assets/images/blockly-images/vector/normalized.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#normalized
     * @param inputs Vector to normalize
     * @returns Unit vector that has length of 1
     * @group base
     * @shortname normalized
     * @drawable false
     */
    normalized(inputs: Inputs.Vector.VectorDto): number[] {
        return this.context.verb.core.Vec.normalized(inputs.vector);
    }

    /**
     * Finds a point coordinates on the given distance ray that spans between the point along the direction vector
     * <div>
     *  <img src="../assets/images/blockly-images/vector/onRay.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#onRay
     * @param inputs Provide a point, vector and a distance for finding a point
     * @returns Vector representing point on the ray
     * @group base
     * @shortname on ray
     * @drawable false
     */
    onRay(inputs: Inputs.Vector.RayPointDto): number[] {
        return this.context.verb.core.Vec.onRay(inputs.point, inputs.vector, inputs.distance);
    }

    /**
     * Create a xyz vector
     * <div>
     *  <img src="../assets/images/blockly-images/vector/vectorXYZ.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#vectorXYZ
     * @param inputs Max value for the range
     * @returns Create a vector of xyz values
     * @group create
     * @shortname vector XYZ
     * @drawable true
     */
    vectorXYZ(inputs: Inputs.Vector.VectorXYZDto): Inputs.Base.Vector3 {
        return [inputs.x, inputs.y, inputs.z];
    }

    /**
     * Creates a vector of integers between 0 and maximum ceiling integer
     * <div>
     *  <img src="../assets/images/blockly-images/vector/range.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#range
     * @param inputs Max value for the range
     * @returns Vector containing items from 0 to max
     * @group create
     * @shortname range
     * @drawable false
     */
    range(inputs: Inputs.Vector.RangeMaxDto): number[] {
        return this.context.verb.core.Vec.range(inputs.max);
    }

    /**
     * Computes signed angle between two vectors and a reference. This will always return a smaller angle between two possible angles.
     * <div>
     *  <img src="../assets/images/blockly-images/vector/signedAngleBetween.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#signedAngleBetween
     * @param inputs Contains information of two vectors and a reference vector
     * @returns Signed angle in degrees
     * @group angles
     * @shortname signed angle
     * @drawable false
     */
    signedAngleBetween(inputs: Inputs.Vector.TwoVectorsReferenceDto): number {
        return Angle.FromRadians(
            this.context.verb.core.Vec.signedAngleBetween(inputs.first, inputs.second, inputs.reference)
        ).degrees();
    }

    /**
     * Creates a vector that contains numbers spanning between minimum and maximum values at a given step
     * <div>
     *  <img src="../assets/images/blockly-images/vector/span.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#span
     * @param inputs Span information containing min, max and step values
     * @returns Vector containing number between min, max and increasing at a given step
     * @group create
     * @shortname span
     * @drawable false
     */
    span(inputs: Inputs.Vector.SpanDto): number[] {
        return this.context.verb.core.Vec.span(inputs.min, inputs.max, inputs.step);
    }

    /**
     * Subtract two vectors
     * <div>
     *  <img src="../assets/images/blockly-images/vector/sub.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#sub
     * @param inputs Two vectors
     * @returns Vector that result by subtraction two vectors
     * @group base
     * @shortname sub
     * @drawable false
     */
    sub(inputs: Inputs.Vector.TwoVectorsDto): number[] {
        return this.context.verb.core.Vec.sub(inputs.first, inputs.second);
    }

    /**
     * Sums the values of the vector
     * <div>
     *  <img src="../assets/images/blockly-images/vector/sum.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.Vector.html#sum
     * @param inputs Vector to sum
     * @returns Number that results by adding up all values in the vector
     * @group base
     * @shortname sum
     * @drawable false
     */
    sum(inputs: Inputs.Vector.VectorDto): number {
        return this.context.verb.core.Vec.sum(inputs.vector);
    }
}
