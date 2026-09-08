import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";
import { OCCTIO } from "./io";
import { AnchorRecord, AnsweringWorker, recordDownloads } from "../__mocks__/test-helpers";
import { Inputs } from "@bitbybit-dev/occt";

// The save and dxf members are hand-written: the worker answers with the file's text and this side
// decides whether the browser is asked to download it, and under what name. Everything else in the
// class only forwards, and the delegation suite runs those.

const A_SHAPE: Inputs.OCCT.TopoDSShapePointer = { hash: 1, type: "occ-shape" };
const STEP_TEXT = "ISO-10303-21;";
const STL_TEXT = "solid part";
const DXF_TEXT = "0\nSECTION";

// The dxf and conversion DTOs carry a long tail of format settings these tests do not touch; each
// starts from the defaults the DTO itself declares and states only what the case is about.
const dxfInputs = (over: Partial<Inputs.OCCT.DxfPathsPartsListDto>): Inputs.OCCT.DxfPathsPartsListDto =>
    Object.assign(new Inputs.OCCT.DxfPathsPartsListDto(), over);
const gltfInputs = (over: Partial<Inputs.OCCT.ConvertStepToGltfDto>): Inputs.OCCT.ConvertStepToGltfDto =>
    Object.assign(new Inputs.OCCT.ConvertStepToGltfDto(), over);
const gltfAdvancedInputs = (over: Partial<Inputs.OCCT.ConvertStepToGltfAdvancedDto>): Inputs.OCCT.ConvertStepToGltfAdvancedDto =>
    Object.assign(new Inputs.OCCT.ConvertStepToGltfAdvancedDto(), over);
const dracoInputs = (over: Partial<Inputs.OCCT.ConvertStepToGltfWithDracoDto>): Inputs.OCCT.ConvertStepToGltfWithDracoDto =>
    Object.assign(new Inputs.OCCT.ConvertStepToGltfWithDracoDto(), over);
const dracoAdvancedInputs = (over: Partial<Inputs.OCCT.ConvertStepToGltfAdvancedWithDracoDto>): Inputs.OCCT.ConvertStepToGltfAdvancedWithDracoDto =>
    Object.assign(new Inputs.OCCT.ConvertStepToGltfAdvancedWithDracoDto(), over);
const parseInputs = (over: Partial<Inputs.OCCT.ParseStepAssemblyToJsonDto>): Inputs.OCCT.ParseStepAssemblyToJsonDto =>
    Object.assign(new Inputs.OCCT.ParseStepAssemblyToJsonDto(), over);

describe("OCCTIO downloads", () => {
    let io: OCCTIO;
    let worker: AnsweringWorker;
    let anchors: AnchorRecord[];
    let blobs: Blob[];

    const anchor = (): AnchorRecord => anchors[0] as AnchorRecord;

    beforeEach(() => {
        const manager = new OCCTWorkerManager();
        worker = new AnsweringWorker();
        manager.setOccWorker(worker);
        worker.answers.set("io.saveShapeSTEP", STEP_TEXT);
        worker.answers.set("io.saveShapeStl", STL_TEXT);
        worker.answers.set("io.dxfCreate", DXF_TEXT);
        io = new OCCTIO(manager);
        const recorded = recordDownloads();
        anchors = recorded.anchors;
        blobs = recorded.blobs;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    describe("saveShapeSTEP", () => {
        it("should post the save path", async () => {
            // Act
            await io.saveShapeSTEP({ shape: A_SHAPE, fileName: "part.step", adjustYtoZ: false, tryDownload: false });

            // Assert
            expect(worker.paths()).toEqual(["io.saveShapeSTEP"]);
        });

        it("should download nothing when the caller did not ask for it", async () => {
            // Act
            await io.saveShapeSTEP({ shape: A_SHAPE, fileName: "part.step", adjustYtoZ: false, tryDownload: false });

            // Assert
            expect(anchors).toEqual([]);
        });

        it("should download the file under the name the caller gave", async () => {
            // Act
            await io.saveShapeSTEP({ shape: A_SHAPE, fileName: "part.step", adjustYtoZ: false, tryDownload: true });

            // Assert
            expect(anchor().download).toBe("part.step");
            expect(anchor()).toMatchObject({ clicked: 1, removed: 1, target: "_self" });
        });

        it("should give the file the step extension when the name lacks one", async () => {
            // Act
            await io.saveShapeSTEP({ shape: A_SHAPE, fileName: "part", adjustYtoZ: false, tryDownload: true });

            // Assert
            expect(anchor().download).toBe("part.step");
        });

        it("should name the file itself when the caller gave no name", async () => {
            // Act
            await io.saveShapeSTEP({ shape: A_SHAPE, fileName: "", adjustYtoZ: false, tryDownload: true });

            // Assert
            expect(anchor().download).toBe("bitbybit-dev.step");
        });

        it("should download the text the worker answered with", async () => {
            // Act
            await io.saveShapeSTEP({ shape: A_SHAPE, fileName: "part.step", adjustYtoZ: false, tryDownload: true });

            // Assert
            await expect((blobs[0] as Blob).text()).resolves.toBe(STEP_TEXT);
        });
    });

    describe("saveShapeSTEPAndReturn", () => {
        it("should hand back the text the worker answered with", async () => {
            // Act
            const result = await io.saveShapeSTEPAndReturn({ shape: A_SHAPE, fileName: "part.step", adjustYtoZ: false, tryDownload: false });

            // Assert
            expect(result).toBe(STEP_TEXT);
        });
    });

    describe("saveShapeStl", () => {
        it("should download the file under the name the caller gave", async () => {
            // Act
            await io.saveShapeStl({ shape: A_SHAPE, fileName: "part.stl", precision: 0.01, adjustYtoZ: false, tryDownload: true, binary: false });

            // Assert
            expect(anchor().download).toBe("part.stl");
        });

        it("should name the file itself when the caller gave no name", async () => {
            // Act
            await io.saveShapeStl({ shape: A_SHAPE, fileName: "", precision: 0.01, adjustYtoZ: false, tryDownload: true, binary: false });

            // Assert
            expect(anchor().download).toBe("bitbybit-dev.stl");
        });

        it("should download nothing when the caller did not ask for it", async () => {
            // Act
            await io.saveShapeStl({ shape: A_SHAPE, fileName: "part.stl", precision: 0.01, adjustYtoZ: false, tryDownload: false, binary: false });

            // Assert
            expect(anchors).toEqual([]);
        });
    });

    describe("saveShapeStlAndReturn", () => {
        it("should hand back the text the worker answered with", async () => {
            // Act
            const result = await io.saveShapeStlAndReturn({ shape: A_SHAPE, fileName: "part.stl", precision: 0.01, adjustYtoZ: false, tryDownload: false, binary: false });

            // Assert
            expect(result).toBe(STL_TEXT);
        });
    });

    describe("dxfCreate", () => {
        it("should hand back the text the worker answered with", async () => {
            // Act
            const result = await io.dxfCreate(dxfInputs({ pathsParts: [], fileName: "drawing.dxf", tryDownload: false }));

            // Assert
            expect(result).toBe(DXF_TEXT);
        });

        it("should download the file under the name the caller gave", async () => {
            // Act
            await io.dxfCreate(dxfInputs({ pathsParts: [], fileName: "drawing.dxf", tryDownload: true }));

            // Assert
            expect(anchor().download).toBe("drawing.dxf");
        });

        it("should name the file itself when the caller gave no name", async () => {
            // Act
            await io.dxfCreate(dxfInputs({ pathsParts: [], fileName: "", tryDownload: true }));

            // Assert
            expect(anchor().download).toBe("bitbybit-dev.dxf");
        });

        it("should download nothing when the caller did not ask for it", async () => {
            // Act
            await io.dxfCreate(dxfInputs({ pathsParts: [], fileName: "drawing.dxf", tryDownload: false }));

            // Assert
            expect(anchors).toEqual([]);
        });
    });
});

describe("OCCTIO step conversions", () => {
    let io: OCCTIO;
    let worker: AnsweringWorker;

    const sentInputs = (): { stepData?: unknown } => worker.posted[0]?.action.inputs as { stepData?: unknown };

    beforeEach(() => {
        const manager = new OCCTWorkerManager();
        worker = new AnsweringWorker();
        manager.setOccWorker(worker);
        io = new OCCTIO(manager);
    });

    describe("convertStepToGltf", () => {
        it("should post the conversion path", async () => {
            // Act
            await io.convertStepToGltf(gltfInputs({ stepData: STEP_TEXT }));

            // Assert
            expect(worker.paths()).toEqual(["io.convertStepToGltf"]);
        });

        it("should send step text through as it stands", async () => {
            // Act
            await io.convertStepToGltf(gltfInputs({ stepData: STEP_TEXT }));

            // Assert
            expect(sentInputs().stepData).toBe(STEP_TEXT);
        });

        it("should send a File as the bytes it holds", async () => {
            // Arrange
            const file = new File([new Uint8Array([1, 2, 3])], "part.step");

            // Act
            await io.convertStepToGltf(gltfInputs({ stepData: file }));

            // Assert
            expect(sentInputs().stepData).toEqual(new Uint8Array([1, 2, 3]));
        });

        it("should keep the rest of the inputs it was given", async () => {
            // Act
            await io.convertStepToGltf(gltfInputs({ stepData: STEP_TEXT, meshPrecision: 0.25 }));

            // Assert
            expect(worker.posted[0]?.action.inputs).toMatchObject({ meshPrecision: 0.25 });
        });
    });

    describe("convertStepToGltfAdvanced", () => {
        it("should post the conversion path with the prepared data", async () => {
            // Act
            await io.convertStepToGltfAdvanced(gltfAdvancedInputs({ stepData: STEP_TEXT }));

            // Assert
            expect(worker.paths()).toEqual(["io.convertStepToGltfAdvanced"]);
            expect(sentInputs().stepData).toBe(STEP_TEXT);
        });
    });

    describe("convertStepToGltfWithDraco", () => {
        it("should post the conversion path with the prepared data", async () => {
            // Act
            await io.convertStepToGltfWithDraco(dracoInputs({ stepData: STEP_TEXT }));

            // Assert
            expect(worker.paths()).toEqual(["io.convertStepToGltfWithDraco"]);
            expect(sentInputs().stepData).toBe(STEP_TEXT);
        });
    });

    describe("convertStepToGltfAdvancedWithDraco", () => {
        it("should post the conversion path with the prepared data", async () => {
            // Act
            await io.convertStepToGltfAdvancedWithDraco(dracoAdvancedInputs({ stepData: STEP_TEXT }));

            // Assert
            expect(worker.paths()).toEqual(["io.convertStepToGltfAdvancedWithDraco"]);
            expect(sentInputs().stepData).toBe(STEP_TEXT);
        });
    });

    describe("parseStepToJson", () => {
        it("should post the parse path with the prepared data", async () => {
            // Act
            await io.parseStepToJson(parseInputs({ stepData: STEP_TEXT }));

            // Assert
            expect(worker.paths()).toEqual(["io.parseStepToJson"]);
            expect(sentInputs().stepData).toBe(STEP_TEXT);
        });
    });
});
