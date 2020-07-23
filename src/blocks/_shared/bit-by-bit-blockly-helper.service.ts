import { HttpClient } from '@angular/common/http';
import { Matrix, Vector3 } from '@babylonjs/core';
import { PrintSaveInterface } from './models/print-save.model';

export class BitByBitBlocklyHelperService {

    static promptPrintSave: (prompt: PrintSaveInterface) => void;
    static angular: { httpClient: HttpClient, HttpHeaders: any, HttpParams: any };
    static jsonpath: any;
    static tagBag = [];

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

    static getFile() {
        return new Promise((resolve, reject) => {
            const inputFileElement = document.getElementById('fileInput') as HTMLInputElement;

            inputFileElement.onchange = (e) => {
                const file = inputFileElement.files[0];

                if (file) {
                    const reader = new FileReader();
                    reader.readAsText(file, 'UTF-8');
                    reader.onload = (evt) => {
                        const text = evt.target.result;
                        resolve(text);
                    };
                    reader.onerror = (evt) => {
                        reject();
                    };
                } else {
                    reject();
                }
            };
            inputFileElement.click();
        });
    }

    static remap(value: number, from1: number, to1: number, from2: number, to2: number) {
        return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
    }

}
