import { Injectable } from '@angular/core';
import { LinesMesh, Matrix, Color3, Vector3, Color4 } from '@babylonjs/core';
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

    edgesRendering(mesh: LinesMesh, width: number, opacity: number, colour: string): void {
        mesh.enableEdgesRendering();
        mesh.edgesWidth = width;
        const edgeColor = Color3.FromHexString(colour);
        mesh.color = edgeColor;
        mesh.edgesColor = new Color4(edgeColor.r, edgeColor.g, edgeColor.b, opacity);
    }

}
