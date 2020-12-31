import { Injectable } from '@angular/core';
import { Matrix } from '@babylonjs/core';
import { Vector3 } from '@babylonjs/core/Maths/math';

@Injectable()
export class GeometryHelper {
    constructor() {}

    transformControlPoints(transformation: number[][] | number[][][], transformedControlPoints: number[][]): number[][] {
        let transformationArrays = [];

        if (this.getArrayDepth(transformation) === 2) {
            transformation.forEach(transform => {
                transformationArrays.push(...transform);
            });
        } else {
            transformationArrays = transformation;
        }

        transformationArrays.forEach(transform => {
            transformedControlPoints = this.transformPointsByMatrixArray(transformedControlPoints, transform);
        });
        return transformedControlPoints;
    }

    getArrayDepth = (value): number => {
        return Array.isArray(value) ?
            1 + Math.max(...value.map(this.getArrayDepth)) :
            0;
    }

    transformPointsByMatrixArray(points: number[][], transform: number[]): number[][] {
        const transformMatrix = Matrix.FromArray(transform);
        return this.transformPointsByMatrix(points, transformMatrix);
    }

    transformPointsByMatrix(points: number[][], transformMatrix: Matrix): number[][] {
        const transformedPoints = [];
        for (let i = 0; i < points.length; i++) {
            const pt = points[i];
            const vector = new Vector3(pt[0], pt[1], pt[2]);
            const transformedVector = Vector3.TransformCoordinates(vector, transformMatrix);
            transformedPoints.push([transformedVector.x, transformedVector.y, transformedVector.z]);
        }
        return transformedPoints;
    }

}
