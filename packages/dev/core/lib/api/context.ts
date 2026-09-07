import { PrintSaveInterface } from "../models/print-save.model";
import type { JSONPath } from "jsonpath-plus";
import type { Tag } from "./inputs/tag-inputs";

export interface PreviewDataInterface {
    data: unknown;
    viewMode?: "data" | "schema" | "metadata" | undefined;
    hidden?: boolean | undefined;
}

export interface PreviewCSVInterface {
    data: string | unknown[][];
    columnSeparator?: string | undefined;
    rowSeparator?: string | undefined;
    startRow?: number | undefined;
    maxRows?: number | undefined;
    hidden?: boolean | undefined;
}

export interface PreviewAssemblyHierarchyInterface {
    data: unknown;
    hidden?: boolean | undefined;
}

export class ContextBase {
    /** The Blockly workspace, put here by the host. Nothing in these packages reads it. */
    blocklyWorkspace: unknown;
    /** @deprecated verbnurbs is unmaintained; this and the API over it come out in the next major. */
    verb: any;
    /** The OCCT instance, put here by the host. Nothing in these packages reads it. */
    occ: unknown;
    /**
     * The jsonpath-plus query, put here by the renderer packages. It takes the library's own type:
     * its callable is a set of overloads, one of which requires an option the others reject, and a
     * local restatement of the shape this code calls cannot satisfy that set.
     */
    jsonpath!: typeof JSONPath;
    canvasZoneClass = "canvasZone";

    promptPrintSave!: (prompt: PrintSaveInterface) => void;
    promptPrint!: (prompt: PrintSaveInterface) => void;
    promptPreviewData!: (data: PreviewDataInterface) => void;
    promptPreviewCSV!: (data: PreviewCSVInterface) => void;
    promptPreviewAssemblyHierarchy!: (data: PreviewAssemblyHierarchyInterface) => void;

    rerenderScene!: () => void;
    tolerance = 0.00001;
    snapTolerance = 0.00001;
    tagBag: Tag.TagDto[] = [];
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
    currentlyPressedKeys: string[] = [];

    getFile(file: File): Promise<string | ArrayBuffer> {
        return new Promise((resolve, reject) => {
            if (file) {
                const reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = (evt) => {
                    const text = evt.target?.result;
                    if (text === null || text === undefined) { reject(); return; }
                    resolve(text);
                };
                reader.onerror = (_evt) => {
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
