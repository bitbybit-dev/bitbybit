import { HttpClient } from '@angular/common/http';
import { Matrix, Vector3, Mesh, Scene, Color3, MeshBuilder } from '@babylonjs/core';
import { PrintSaveInterface } from './models/print-save.model';
import { TagInterface } from './models/tag.interface';
import { OBJFileLoader } from '@babylonjs/loaders';

export class BitByBitBlocklyHelperService {

    static promptPrintSave: (prompt: PrintSaveInterface) => void;
    static clearAllDrawn: () => void;
    static angular: { httpClient: HttpClient, HttpHeaders: any, HttpParams: any };
    static jsonpath: any;
    static tagBag: TagInterface[] = [];
    static timeoutBag: number[] = [];
    static intervalBag: number[] = [];
    static renderLoopBag: ((timePassedFromPreviousIteration: number) => void)[] = [];
    static babylon = {
        loader: new OBJFileLoader(),
    };

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

    static getFile(): Promise<string | ArrayBuffer> {
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

    static remap(value: number, from1: number, to1: number, from2: number, to2: number): number {
        return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
    }

    static localAxes(size: number, scene: Scene, colorXHex: string, colorYHex: string, colorZHex: string): Mesh {
        const pilotLocalAxisX = Mesh.CreateLines('pilot_local_axisX' + Math.random(), [
            Vector3.Zero(), new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0),
            new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0)
        ], scene);
        const colorX = Color3.FromHexString(colorXHex);
        pilotLocalAxisX.color = colorX;

        const pilotLocalAxisY = Mesh.CreateLines('pilot_local_axisY' + Math.random(), [
            Vector3.Zero(), new Vector3(0, size, 0), new Vector3(-0.05 * size, size * 0.95, 0),
            new Vector3(0, size, 0), new Vector3(0.05 * size, size * 0.95, 0)
        ], scene);
        const colorY = Color3.FromHexString(colorYHex);
        pilotLocalAxisY.color = colorY;

        const pilotLocalAxisZ = Mesh.CreateLines('pilot_local_axisZ' + Math.random(), [
            Vector3.Zero(), new Vector3(0, 0, size), new Vector3(0, -0.05 * size, size * 0.95),
            new Vector3(0, 0, size), new Vector3(0, 0.05 * size, size * 0.95)
        ], scene);
        const colorZ = Color3.FromHexString(colorZHex);
        pilotLocalAxisZ.color = colorZ;

        const localOrigin = MeshBuilder.CreateBox('local_origin' + Math.random(), { size: 1 }, scene);
        localOrigin.isVisible = false;

        pilotLocalAxisX.parent = localOrigin;
        pilotLocalAxisY.parent = localOrigin;
        pilotLocalAxisZ.parent = localOrigin;

        return localOrigin;
    }

}
