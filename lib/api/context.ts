
import * as BABYLON from "@babylonjs/core";
import { PrintSaveInterface } from "../models/print-save.model";

export class Context {

    scene: BABYLON.Scene;
    engine: BABYLON.Engine;
    havokPlugin: BABYLON.HavokPlugin;
    blocklyWorkspace: any;
    verb: any;
    occ: any;
    jsonpath: any;
    canvasZoneClass = "canvasZone";

    promptPrintSave: (prompt: PrintSaveInterface) => void;
    promptPrint: (prompt: PrintSaveInterface) => void;

    rerenderScene: () => void;
    tolerance = 0.00001;
    snapTolerance = 0.00001;
    tagBag: any[] = [];
    timeoutBag: number[] = [];
    intervalBag: number[] = [];
    renderLoopBag: ((timePassedFromPreviousIteration: number) => void)[] = [];
    keyDownBag: ({
        key: string,
        fn: () => void
    })[] = [];
    keyUpBag: ({
        key: string,
        fn: () => void
    })[] = [];
    keyPressBag: ({
        key: string,
        fn: () => void
    })[] = [];
    currentlyPressedKeys = [];

    getFile(file: File): Promise<string | ArrayBuffer> {
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

    remap(value: number, from1: number, to1: number, from2: number, to2: number): number {
        return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
    }

}
