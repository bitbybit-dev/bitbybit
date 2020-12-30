import { Injectable } from '@angular/core';
import { Angle } from '@babylonjs/core';
import { BitByBitBlocklyHelperService } from '../../bit-by-bit-blockly-helper.service';
import { Context } from '../context';
import * as Inputs from '../inputs/inputs';

/**
 * Contains various methods for points. Point in bitbybit is simply an array containing 3 numbers for [x, y, z].
 * Because of this form Point can be interchanged with Vector, which also is an array in [x, y, z] form.
 * <div>
 *  <img src="../assets/images/blockly-images/point/point.png" alt="Blockly Image"/>
 * </div>
 */
@Injectable()
export class Point {

    constructor(private readonly context: Context) { }
    /**
     * Measures the angle between two vectors in degrees
     * <div>
     *  <img src="../assets/images/blockly-images/vector/angleBetween.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_vector_.vector.html#anglebetween
     * @param inputs Contains two vectors represented as number arrays
     * @returns Number in degrees
     */
    transformPoint(inputs: Inputs.Point.TransformPointDto): number[] {
        const transformation = inputs.matrix;
        let transformedControlPoints = [inputs.point];
        transformedControlPoints = this.transformPoints(transformation, transformedControlPoints);
        return transformedControlPoints[0];
    }

    private transformPoints(transformation: number[][] | number[][][], transformedControlPoints: number[][]): number[][] {
        let transformationArrays = [];

        if (this.getArrayDepth(transformation) === 2) {
            transformation.forEach(transform => {
                transformationArrays.push(...transform);
            });
        } else {
            transformationArrays = transformation;
        }
        transformationArrays.forEach(transform => {
            transformedControlPoints = BitByBitBlocklyHelperService.transformPointsByMatrixArray(transformedControlPoints, transform);
        });
        return transformedControlPoints;
    }

    private getArrayDepth = (value): number => {
        return Array.isArray(value) ?
          1 + Math.max(...value.map(this.getArrayDepth)) :
          0;
      }
}
