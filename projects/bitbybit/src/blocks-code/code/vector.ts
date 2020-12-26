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
     * Measures an angle between two vectors in degrees
     * @param inputs Contains two vectors represented as number arrays
     */
    angle(inputs: TwoVectorsDto): number {
        return Angle.FromRadians(this.context.verb.core.Vec.angleBetween(inputs.first, inputs.second)).degrees();
    }

    /**
     * Measures an normalized 2d angle between two vectors in degrees
     * @param inputs Contains two vectors represented as number arrays
     */
    angleBetweenNormalized2d(inputs: TwoVectorsDto): number {
        return Angle.FromRadians(this.context.verb.core.Vec.angleBetweenNormalized2d(inputs.first, inputs.second)).degrees();
    }

    /**
     * Measures a positive angle between two vectors given the reference vector in degrees
     * @param inputs Contains information between two vectors represented as number arrays
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
}

interface VectorsDto {
    vectors: number[][];
}

interface VectorBoolDto {
    vector: boolean[];
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
