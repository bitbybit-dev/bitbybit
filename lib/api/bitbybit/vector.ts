
import { Context } from "../context";
import * as Inputs from "../inputs/inputs";
import { GeometryHelper } from "../geometry-helper";
import { MathBitByBit } from "./math";

/**
 * Contains various methods for vector mathematics. Vector in bitbybit is simply an array, usually containing numbers.
 * In 3D [x, y, z] form describes space, where y is the up vector.
 * Because of this form Vector can be interchanged with Point, which also is an array in [x, y, z] form.
 */

export class Vector {

    constructor(private readonly context: Context, private readonly math: MathBitByBit, private readonly geometryHelper: GeometryHelper) { }

    /**
     * Removes all duplicate vectors from the input array
     * @param inputs Contains vectors and a tolerance value
     * @returns Array of vectors without duplicates
     * @group remove
     * @shortname remove all duplicates
     * @drawable false
     */
    removeAllDuplicateVectors(inputs: Inputs.Vector.RemoveAllDuplicateVectorsDto): number[][] {
        return this.geometryHelper.removeAllDuplicateVectors(inputs.vectors, inputs.tolerance);
    }

    /**
     * Removes consecutive duplicate vectors from the input array
     * @param inputs Contains vectors and a tolerance value
     * @returns Array of vectors without duplicates
     * @group remove
     * @shortname remove consecutive duplicates
     * @drawable false
     */
    removeConsecutiveDuplicateVectors(inputs: Inputs.Vector.RemoveConsecutiveDuplicateVectorsDto): number[][] {
        return this.geometryHelper.removeConsecutiveVectorDuplicates(inputs.vectors, inputs.checkFirstAndLast, inputs.tolerance);
    }
    /**
     * Measures the angle between two vectors in degrees
     * @param inputs Contains two vectors represented as number arrays
     * @group angles
     * @shortname angle
     * @returns Number in degrees
     * @drawable false
     */
    angleBetween(inputs: Inputs.Vector.TwoVectorsDto): number {
        return this.math.radToDeg({
            number: this.context.verb.core.Vec.angleBetween(inputs.first, inputs.second)
        });
    }

    /**
     * Measures the normalized 2d angle between two vectors in degrees
     * @param inputs Contains two vectors represented as number arrays
     * @returns Number in degrees
     * @group angles
     * @shortname angle normalized 2d
     * @drawable false
     */
    angleBetweenNormalized2d(inputs: Inputs.Vector.TwoVectorsDto): number {
        return this.math.radToDeg({
            number: this.context.verb.core.Vec.angleBetweenNormalized2d(inputs.first, inputs.second)
        });
    }

    /**
     * Measures a positive angle between two vectors given the reference vector in degrees
     * @param inputs Contains information of two vectors and a reference vector
     * @returns Number in degrees
     * @group angles
     * @shortname positive angle
     * @drawable false
     */
    positiveAngleBetween(inputs: Inputs.Vector.TwoVectorsReferenceDto): number {
        return this.math.radToDeg({
            number: this.context.verb.core.Vec.positiveAngleBetween(inputs.first, inputs.second, inputs.reference)
        });
    }

    /**
     * Adds all vector xyz values together and create a new vector
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
     * Divide the vector by a scalar value
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
     * @param inputs Vector coordinates
     * @returns Create a vector of xyz values
     * @group create
     * @shortname vector XYZ
     * @drawable true
     */
    vectorXYZ(inputs: Inputs.Vector.VectorXYZDto): Inputs.Base.Vector3 {
        return [inputs.x, inputs.y, inputs.z];
    }

    /**
     * Create 2d xy vector
     * @param inputs Vector coordinates
     * @returns Create a vector of xy values
     * @group create
     * @shortname vector XY
     * @drawable true
     */
    vectorXY(inputs: Inputs.Vector.VectorXYDto): Inputs.Base.Vector2 {
        return [inputs.x, inputs.y];
    }

    /**
     * Creates a vector of integers between 0 and maximum ceiling integer
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
     * @param inputs Contains information of two vectors and a reference vector
     * @returns Signed angle in degrees
     * @group angles
     * @shortname signed angle
     * @drawable false
     */
    signedAngleBetween(inputs: Inputs.Vector.TwoVectorsReferenceDto): number {
        return this.math.radToDeg({
            number: this.context.verb.core.Vec.signedAngleBetween(inputs.first, inputs.second, inputs.reference)
        });
    }

    /**
     * Creates a vector that contains numbers spanning between minimum and maximum values at a given step
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
     * Creates a vector that contains numbers spanning between minimum and maximum values at a given ease function
     * @param inputs Span information containing min, max and ease function
     * @returns Vector containing numbers between min, max and increasing in non-linear steps defined by nr of items in the vector and type
     * @group create
     * @shortname span ease items
     * @drawable false
     */
    spanEaseItems(inputs: Inputs.Vector.SpanEaseItemsDto): number[] {
        const res = [];
        for (let i = 0; i < inputs.nrItems; i++) {
            const x = i * 1 / (inputs.nrItems - 1);
            res.push(this.math.ease({ x: x, ease: inputs.ease, min: inputs.min, max: inputs.max }));
        }
        if (inputs.intervals) {
            return res.map((v, i, a) => i === 0 ? v : v - a[i - 1]);
        }
        return res;
    }

    /**
     * Creates a vector that contains numbers spanning between minimum and maximum values by giving nr of items
     * @param inputs Span information containing min, max and step values
     * @returns Vector containing number between min, max by giving nr of items
     * @group create
     * @shortname span linear items
     * @drawable false
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
     * Subtract two vectors
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
