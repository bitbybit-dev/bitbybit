import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { JSCADWorkerManager } from "../jscad-worker/jscad-worker-manager";
import { JSCADWorkerMock } from "../jscad-worker/jscad-worker-mock";
import { JSCAD } from "./jscad";
import * as Inputs from "@bitbybit-dev/jscad/lib/api/inputs";

type PostedCall = { uid: string };

class AnsweringWorker extends JSCADWorkerMock {
    readonly blobs: Blob[] = [];

    override postMessage(message: PostedCall | "busy"): void {
        if (message === "busy") {
            return;
        }
        const blob = new Blob(["geometry"]);
        this.blobs.push(blob);
        this.onmessage({ data: { uid: message.uid, result: { blob } } });
    }
}

type AnchorRecord = {
    href: string;
    target: string;
    download: string;
    clicked: number;
    removed: number;
};

const OBJECT_URL = "blob:jscad/00000000";
const FILE_NAME = "part";
const IDENTITY: Inputs.JSCAD.JSCADMat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const A_PATH: Inputs.JSCAD.JSCADEntity = { points: [[0, 0], [1, 0]], isClosed: false, transforms: IDENTITY };

describe("the download members of the generated class", () => {
    let jscad: JSCAD;
    let anchors: AnchorRecord[];
    let created: string[];
    let blobs: Blob[];
    let urlsMadeFor: Blob[];

    const createAnchor = (): AnchorRecord => {
        const anchor: AnchorRecord = { href: "", target: "", download: "", clicked: 0, removed: 0 };
        return Object.assign(anchor, {
            click: () => { anchor.clicked += 1; },
            remove: () => { anchor.removed += 1; },
        });
    };

    beforeEach(() => {
        anchors = [];
        created = [];
        const manager = new JSCADWorkerManager();
        const worker = new AnsweringWorker();
        manager.setJscadWorker(worker);
        blobs = worker.blobs;
        jscad = new JSCAD(manager);

        vi.stubGlobal("document", {
            createElement: (tagName: string) => {
                created.push(tagName);
                const anchor = createAnchor();
                anchors.push(anchor);
                return anchor;
            },
        });
        urlsMadeFor = [];
        vi.spyOn(URL, "createObjectURL").mockImplementation((blob: Blob | MediaSource) => {
            urlsMadeFor.push(blob as Blob);
            return OBJECT_URL;
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    describe("downloadSolidSTL", () => {
        it("should name the file with the stl extension", async () => {
            // Arrange
            const inputs = new Inputs.JSCAD.DownloadSolidDto(A_PATH, FILE_NAME);

            // Act
            await jscad.downloadSolidSTL(inputs);

            // Assert
            expect((anchors[0] as AnchorRecord).download).toBe("part.stl");
        });

        it("should point the link at the object url of the blob the worker answered with", async () => {
            // Act
            await jscad.downloadSolidSTL(new Inputs.JSCAD.DownloadSolidDto(A_PATH, FILE_NAME));

            // Assert
            expect(urlsMadeFor).toEqual([blobs[0]]);
            expect((anchors[0] as AnchorRecord).href).toBe(OBJECT_URL);
        });

        it("should click the link once and remove it again", async () => {
            // Act
            await jscad.downloadSolidSTL(new Inputs.JSCAD.DownloadSolidDto(A_PATH, FILE_NAME));

            // Assert
            expect(anchors[0]).toMatchObject({ clicked: 1, removed: 1 });
        });

        it("should build the link as an anchor kept in the same tab", async () => {
            // Act
            await jscad.downloadSolidSTL(new Inputs.JSCAD.DownloadSolidDto(A_PATH, FILE_NAME));

            // Assert
            expect(created).toEqual(["a"]);
            expect((anchors[0] as AnchorRecord).target).toBe("_self");
        });
    });

    describe("downloadSolidsSTL", () => {
        it("should name the file with the stl extension", async () => {
            // Act
            await jscad.downloadSolidsSTL(new Inputs.JSCAD.DownloadSolidsDto([A_PATH], FILE_NAME));

            // Assert
            expect((anchors[0] as AnchorRecord).download).toBe("part.stl");
        });
    });

    describe("downloadGeometryDxf", () => {
        it("should name the file with the dxf extension", async () => {
            // Act
            await jscad.downloadGeometryDxf(new Inputs.JSCAD.DownloadGeometryDto(A_PATH, FILE_NAME));

            // Assert
            expect((anchors[0] as AnchorRecord).download).toBe("part.dxf");
        });
    });

    describe("downloadGeometry3MF", () => {
        it("should name the file with the 3mf extension", async () => {
            // Act
            await jscad.downloadGeometry3MF(new Inputs.JSCAD.DownloadGeometryDto(A_PATH, FILE_NAME));

            // Assert
            expect((anchors[0] as AnchorRecord).download).toBe("part.3mf");
        });
    });
});
