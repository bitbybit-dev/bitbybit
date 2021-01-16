import { HttpClient } from '@angular/common/http';
import { Vector3, Mesh, Scene, Color3, MeshBuilder } from '@babylonjs/core';
import { PrintSaveInterface } from './models/print-save.model';
import { OBJFileLoader } from '@babylonjs/loaders';
export class BitByBitBlocklyHelperService {

    static promptPrintSave: (prompt: PrintSaveInterface) => void;
    static clearAllDrawn: () => void;
    static tolerance = 0.00001;
    static snapTolerance = 0.00001;
    static angular: { httpClient: HttpClient, HttpHeaders: any, HttpParams: any };
    static jsonpath: any;
    static tagBag: any[] = [];
    static timeoutBag: number[] = [];
    static intervalBag: number[] = [];
    static renderLoopBag: ((timePassedFromPreviousIteration: number) => void)[] = [];
    static babylon = {
        loader: new OBJFileLoader(),
    };

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

}
