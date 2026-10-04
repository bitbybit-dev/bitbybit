import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";
import { OCCTIO } from "./io";
import { AnchorRecord, AnsweringWorker, recordDownloads } from "../__mocks__/test-helpers";
import { Inputs, Models } from "@bitbybit-dev/occt";

const A_SHAPE: Inputs.OCCT.TopoDSShapePointer = { hash: 1, type: "occ-shape" };
const A_VIEW: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] };
const STL_BYTES = new Uint8Array([83, 84, 76, 0, 1, 2]);
const BREP_TEXT = "CASCADE Topology V3";
const BREP_BYTES = new Uint8Array([79, 112, 101, 110, 0, 7]);
const PLY_TEXT = "ply";
const SVG_TEXT = "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>";
const OBJ_WITH_LIBRARY: Models.OCCT.ObjFiles = { obj: "mtllib brick.mtl\ng brick\nv 0 0 0\n", mtl: "newmtl red\nKd 1 0 0\n" };
const OBJ_WITHOUT_LIBRARY: Models.OCCT.ObjFiles = { obj: "g brick\nv 0 0 0\n", mtl: "" };

describe("OCCTIO hand-written file members", () => {
    let io: OCCTIO;
    let worker: AnsweringWorker;
    let anchors: AnchorRecord[];
    let blobs: Blob[];

    const sentInputs = (): Record<string, unknown> => worker.posted[0]?.action.inputs as Record<string, unknown>;

    beforeEach(() => {
        const manager = new OCCTWorkerManager();
        worker = new AnsweringWorker();
        manager.setOccWorker(worker);
        worker.answers.set("io.saveShapeStl", STL_BYTES);
        worker.answers.set("io.saveShapeBrep", BREP_TEXT);
        worker.answers.set("io.saveShapeBrepBinary", BREP_BYTES);
        worker.answers.set("io.saveShapeObj", OBJ_WITH_LIBRARY);
        worker.answers.set("io.saveShapePly", PLY_TEXT);
        worker.answers.set("io.saveShapeSvg", SVG_TEXT);
        io = new OCCTIO(manager);
        const recorded = recordDownloads();
        anchors = recorded.anchors;
        blobs = recorded.blobs;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    describe("saveShapeStl in its binary form", () => {
        it("should hand back the bytes the worker answered with", async () => {
            // Act
            const result = await io.saveShapeStlAndReturn({ shape: A_SHAPE, binary: true, tryDownload: false });

            // Assert
            expect(result).toEqual(STL_BYTES);
        });

        it("should download the bytes under the name the caller gave", async () => {
            // Act
            await io.saveShapeStl({ shape: A_SHAPE, binary: true, fileName: "part.stl" });

            // Assert
            expect(anchors.map(anchor => anchor.download)).toEqual(["part.stl"]);
            expect(new Uint8Array(await blobs[0]!.arrayBuffer())).toEqual(STL_BYTES);
        });
    });

    describe("saveShapeBrep", () => {
        it("should post the save path and hand back the text", async () => {
            // Act
            const result = await io.saveShapeBrepAndReturn({ shape: A_SHAPE, tryDownload: false });

            // Assert
            expect(worker.paths()).toEqual(["io.saveShapeBrep"]);
            expect(result).toBe(BREP_TEXT);
            expect(anchors).toEqual([]);
        });

        it("should download by the defaults of its DTO when the caller leaves them out", async () => {
            // Act
            await io.saveShapeBrep({ shape: A_SHAPE });

            // Assert
            expect(anchors.map(anchor => anchor.download)).toEqual(["shape.brep"]);
            await expect(blobs[0]!.text()).resolves.toBe(BREP_TEXT);
        });
    });

    describe("saveShapeBrepBinary", () => {
        it("should post the binary save path with the defaults of its DTO and hand back the bytes", async () => {
            // Act
            const result = await io.saveShapeBrepBinaryAndReturn({ shape: A_SHAPE, tryDownload: false });

            // Assert
            expect(worker.paths()).toEqual(["io.saveShapeBrepBinary"]);
            expect(sentInputs()).toEqual({ ...new Inputs.OCCT.SaveBrepBinaryDto(A_SHAPE), tryDownload: false });
            expect(result).toEqual(BREP_BYTES);
            expect(anchors).toEqual([]);
        });

        it("should send the caller's choice to leave the mesh out", async () => {
            // Act
            await io.saveShapeBrepBinaryAndReturn({ shape: A_SHAPE, tryDownload: false, withTriangulation: false });

            // Assert
            expect(sentInputs()["withTriangulation"]).toBe(false);
        });

        it("should download the bytes as a binary file under the default name of its DTO", async () => {
            // Act
            await io.saveShapeBrepBinary({ shape: A_SHAPE });

            // Assert
            expect(anchors.map(anchor => anchor.download)).toEqual(["shape.bbrep"]);
            expect(blobs[0]!.type).toBe("application/octet-stream");
            expect(new Uint8Array(await blobs[0]!.arrayBuffer())).toEqual(BREP_BYTES);
        });
    });

    describe("saveShapeObj", () => {
        it("should download the OBJ file and the material library under the name its mtllib line gives", async () => {
            // Act
            await io.saveShapeObj({ shape: A_SHAPE, fileName: "brick.obj" });

            // Assert
            expect(anchors.map(anchor => anchor.download)).toEqual(["brick.obj", "brick.mtl"]);
            await expect(blobs[1]!.text()).resolves.toBe(OBJ_WITH_LIBRARY.mtl);
        });

        it("should download the OBJ file alone when it has no material library", async () => {
            // Arrange
            worker.answers.set("io.saveShapeObj", OBJ_WITHOUT_LIBRARY);

            // Act
            await io.saveShapeObj({ shape: A_SHAPE });

            // Assert
            expect(anchors.map(anchor => anchor.download)).toEqual(["shape.obj"]);
        });

        it("should hand back both texts and download nothing when the caller did not ask for it", async () => {
            // Act
            const result = await io.saveShapeObjAndReturn({ shape: A_SHAPE, tryDownload: false });

            // Assert
            expect(result).toEqual(OBJ_WITH_LIBRARY);
            expect(anchors).toEqual([]);
        });
    });

    describe("saveShapePly", () => {
        it("should download the text under the default name of its DTO", async () => {
            // Act
            await io.saveShapePly({ shape: A_SHAPE });

            // Assert
            expect(anchors.map(anchor => anchor.download)).toEqual(["shape.ply"]);
            await expect(blobs[0]!.text()).resolves.toBe(PLY_TEXT);
        });

        it("should hand back the text the worker answered with", async () => {
            // Act
            const result = await io.saveShapePlyAndReturn({ shape: A_SHAPE, tryDownload: false });

            // Assert
            expect(result).toBe(PLY_TEXT);
        });
    });

    describe("saveShapeSvg", () => {
        it("should download the drawing as an SVG image under the name the caller gave", async () => {
            // Act
            await io.saveShapeSvg({ shape: A_SHAPE, frame: A_VIEW, fileName: "top.svg" });

            // Assert
            expect(anchors.map(anchor => anchor.download)).toEqual(["top.svg"]);
            expect(blobs[0]!.type).toBe("image/svg+xml");
        });

        it("should send the defaults of its DTO for what the caller leaves out", async () => {
            // Act
            await io.saveShapeSvgAndReturn({ shape: A_SHAPE, frame: A_VIEW, tryDownload: false });

            // Assert
            expect(sentInputs()).toEqual({ ...new Inputs.OCCT.SaveSvgDto(A_SHAPE, A_VIEW), tryDownload: false });
        });
    });

    describe("loadStl", () => {
        it("should send a File as the bytes it holds, with the defaults of its DTO", async () => {
            // Arrange
            const file = new File([new Uint8Array([1, 2, 3])], "part.stl");

            // Act
            await io.loadStl({ stlData: file });

            // Assert
            expect(worker.paths()).toEqual(["io.loadStl"]);
            expect(sentInputs()).toEqual({ ...new Inputs.OCCT.LoadStlDto(), stlData: new Uint8Array([1, 2, 3]) });
        });

        it("should send text as it stands", async () => {
            // Act
            await io.loadStl({ stlData: "solid a\nendsolid a\n", asFaces: true });

            // Assert
            expect(sentInputs()).toMatchObject({ stlData: "solid a\nendsolid a\n", asFaces: true });
        });
    });

    describe("loadBrep", () => {
        it("should send a Blob as the bytes it holds", async () => {
            // Arrange
            const blob = new Blob([BREP_TEXT]);

            // Act
            await io.loadBrep({ brepData: blob });

            // Assert
            expect(worker.paths()).toEqual(["io.loadBrep"]);
            expect(sentInputs()["brepData"]).toEqual(new TextEncoder().encode(BREP_TEXT));
        });
    });

    describe("loadBrepBinary", () => {
        it("should send a Blob as the bytes it holds", async () => {
            // Arrange
            const blob = new Blob([BREP_BYTES]);

            // Act
            await io.loadBrepBinary({ brepData: blob });

            // Assert
            expect(worker.paths()).toEqual(["io.loadBrepBinary"]);
            expect(sentInputs()["brepData"]).toEqual(BREP_BYTES);
        });

        it("should send an ArrayBuffer as the bytes it holds", async () => {
            // Act
            await io.loadBrepBinary({ brepData: BREP_BYTES.slice().buffer });

            // Assert
            expect(sentInputs()["brepData"]).toEqual(BREP_BYTES);
        });
    });

    describe("without a document to download into", () => {
        it("should hand back the text and start no download", async () => {
            // Arrange
            vi.unstubAllGlobals();

            // Act
            const result = await io.saveShapeBrepAndReturn({ shape: A_SHAPE, tryDownload: true });

            // Assert
            expect(result).toBe(BREP_TEXT);
            expect(anchors).toEqual([]);
        });
    });
});
