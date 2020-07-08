import { Matrix, Vector3 } from '@babylonjs/core';
import { PrintSaveInterface } from './models/print-save.model';

export class BitByBitBlocklyHelperService {

    static promptPrintSave: (prompt: PrintSaveInterface) => void;

    static transformPointsByMatrix(points: [], transformMatrix: Matrix) {
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
