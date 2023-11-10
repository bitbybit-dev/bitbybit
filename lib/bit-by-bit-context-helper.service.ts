import { PrintSaveInterface } from "./models/print-save.model";
import { OBJFileLoader } from "@babylonjs/loaders";

export class BitByBitContextHelperService {

    static promptPrintSave: (prompt: PrintSaveInterface) => void;
    static promptPrint: (prompt: PrintSaveInterface) => void;

    static rerenderScene: () => void;
    static tolerance = 0.00001;
    static snapTolerance = 0.00001;
    static angular: { httpClient: any, HttpHeaders: any, HttpParams: any };
    static jsonpath: any;
    static tagBag: any[] = [];
    static timeoutBag: number[] = [];
    static intervalBag: number[] = [];
    static renderLoopBag: ((timePassedFromPreviousIteration: number) => void)[] = [];
    static keyDownBag: ({
        key: string,
        fn: () => void
    })[] = [];
    static keyUpBag: ({
        key: string,
        fn: () => void
    })[] = [];
    static keyPressBag: ({
        key: string,
        fn: () => void
    })[] = [];
    static currentlyPressedKeys = [];

    static babylon = {
        loader: new OBJFileLoader(),
    };

    static getFile(file: File): Promise<string | ArrayBuffer> {
        return new Promise((resolve, reject) => {
            if (file) {
                const reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = (evt) => {
                    const text = (evt as any).target.result;
                    resolve(text);
                };
                reader.onerror = (evt) => {
                    reject();
                };
            } else {
                reject();
            }
        });
    }

    static remap(value: number, from1: number, to1: number, from2: number, to2: number): number {
        return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
    }

}
