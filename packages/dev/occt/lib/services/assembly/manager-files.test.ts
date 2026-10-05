import { describe, it, expect, beforeAll, afterEach } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { readKernelException } from "../../kernel-exception";
import { OCCTAssemblyManager } from "./manager";
import { OCCTAssemblyQuery } from "./query";
import { OCCTSolid } from "../shapes";
import * as Inputs from "../../api/inputs";
import { OCCTService } from "../../occ-service";

const MISSING: unknown = undefined;
const GLB_HEADER_BYTES = 12;
const GLB_CHUNK_HEADER_BYTES = 8;
const TETRAHEDRON_OBJ = "v 0 0 0\nv 1 0 0\nv 0 1 0\nv 0 0 1\nf 1 3 2\nf 1 2 4\nf 1 4 3\nf 2 3 4\n";
const RED: Inputs.Base.ColorRGBA = { r: 1, g: 0, b: 0, a: 1 };

describe("OCCT assembly documents read from STEP, glTF and OBJ files and written as OBJ and PLY", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let manager: OCCTAssemblyManager;
    let query: OCCTAssemblyQuery;
    let solid: OCCTSolid;

    const brickDocument = (colorRgba?: Inputs.Base.ColorRGBA): Handle_TDocStd_Document => {
        const brick = solid.createBox({ width: 10, height: 20, length: 30, center: [5, 10, 15] });
        const part = colorRgba === undefined
            ? manager.createPart({ id: "brick", shape: brick, name: "Brick" })
            : manager.createPart({ id: "brick", shape: brick, name: "Brick", colorRgba });
        const structure = manager.combineStructure({ parts: [part], nodes: [], clearDocument: false });
        return manager.buildAssemblyDocument({ structure });
    };

    const glbOf = (document: Handle_TDocStd_Document): Uint8Array => manager.exportDocumentToGltf({ document, meshDeflection: 0.1 });

    const uncompressedGlbOf = (document: Handle_TDocStd_Document): Uint8Array => manager.exportDocumentToGltfWithDraco({ document, meshDeflection: 0.1, useDraco: false });

    const gltfTextOf = (glb: Uint8Array): string => {
        const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
        const jsonLength = view.getUint32(GLB_HEADER_BYTES, true);
        const jsonStart = GLB_HEADER_BYTES + GLB_CHUNK_HEADER_BYTES;
        const json = JSON.parse(new TextDecoder().decode(glb.subarray(jsonStart, jsonStart + jsonLength))) as { buffers: { byteLength: number; uri?: string }[] };
        const binaryStart = jsonStart + jsonLength + GLB_CHUNK_HEADER_BYTES;
        const buffer = json.buffers[0]!;
        const binary = glb.subarray(binaryStart, binaryStart + buffer.byteLength);
        let characters = "";
        binary.forEach(byte => { characters += String.fromCharCode(byte); });
        buffer.uri = `data:application/octet-stream;base64,${btoa(characters)}`;
        return JSON.stringify(json);
    };

    const onlyPartShape = (document: Handle_TDocStd_Document): TopoDS_Shape => {
        const parts = query.getDocumentParts({ document }).filter(part => part.type === "part");
        expect(parts).toHaveLength(1);
        return query.getShapeFromLabel({ document, label: parts[0]!.label });
    };

    const boundsOf = (shape: TopoDS_Shape): { min: number[]; max: number[] } => {
        const bounds = occHelper.operationsService.boundingBoxOfShape({ shape });
        const rounded = (values: number[]): number[] => values.map(value => Math.round(value * 1e6) / 1e6 + 0);
        return { min: rounded(bounds.min), max: rounded(bounds.max) };
    };

    const kernelMessageOf = (act: () => unknown): string => {
        try {
            act();
        } catch (thrown) {
            const read = readKernelException(occt, thrown);
            return read instanceof Error ? read.message : String(read);
        }
        return "no exception";
    };

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt);
        manager = new OCCTAssemblyManager(occt, occHelper);
        query = new OCCTAssemblyQuery(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
    });

    describe("the meshes a glTF export leaves", () => {
        const meshedTriangles = (document: Handle_TDocStd_Document): number =>
            occHelper.shapeGettersService.getFaces({ shape: onlyPartShape(document) })
                .reduce((sum, face) => sum + occt.GetFaceTriangulation(face).NbTriangles(), 0);

        afterEach(() => {
            occt.SetMeshRetention(0);
        });

        it("should leave no mesh on the document's shapes without a retention budget, and keep them with one", () => {
            // Arrange
            const plain = brickDocument();
            const kept = brickDocument();

            // Act
            glbOf(plain);
            const left = [meshedTriangles(plain), occt.KeptMeshFaces()];
            occt.SetMeshRetention(1000);
            glbOf(kept);

            // Assert
            expect(left).toEqual([0, 0]);
            expect(meshedTriangles(kept)).toBe(12);
            expect([occt.KeptMeshFaces(), occt.KeptMeshTriangles()]).toEqual([6, 12]);
        });
    });

    describe("loadStepToDoc", () => {
        const stepTextOfBrick = (): string => {
            const source = brickDocument();
            const step = manager.exportDocumentToStep({ document: source, fileName: "brick.step", author: "", organization: "", compress: false, tryDownload: false });
            source.delete();
            return new TextDecoder().decode(step);
        };

        it("should load a STEP file handed over as its text", () => {
            // Arrange
            const text = stepTextOfBrick();

            // Act
            const document = manager.loadStepToDoc({ stepData: text });

            // Assert
            expect(boundsOf(onlyPartShape(document))).toEqual({ min: [0, 0, 0], max: [10, 20, 30] });
            document.delete();
        });

        it("should load a STEP file handed over as an ArrayBuffer", () => {
            // Arrange
            const bytes = new TextEncoder().encode(stepTextOfBrick());

            // Act
            const document = manager.loadStepToDoc({ stepData: bytes.slice().buffer });

            // Assert
            expect(boundsOf(onlyPartShape(document))).toEqual({ min: [0, 0, 0], max: [10, 20, 30] });
            document.delete();
        });
    });

    describe("loadGltfToDoc", () => {
        it("should read a binary glTF back into a document holding the part where it was written", () => {
            // Arrange
            const source = brickDocument();
            const glb = glbOf(source);

            // Act
            const document = manager.loadGltfToDoc({ gltfData: glb });

            // Assert
            expect(query.getDocumentParts({ document }).filter(part => part.type === "part").map(part => part.name)).toEqual(["Brick"]);
            expect(boundsOf(onlyPartShape(document))).toEqual({ min: [0, 0, 0], max: [10, 20, 30] });
            source.delete();
            document.delete();
        });

        it("should tell a glTF text with its buffers embedded from a binary one by its header", () => {
            // Arrange
            const source = brickDocument();
            const text = gltfTextOf(uncompressedGlbOf(source));

            // Act
            const document = manager.loadGltfToDoc({ gltfData: text });

            // Assert
            expect(boundsOf(onlyPartShape(document))).toEqual({ min: [0, 0, 0], max: [10, 20, 30] });
            source.delete();
            document.delete();
        });

        it("should read a binary glTF handed over as an ArrayBuffer", () => {
            // Arrange
            const source = brickDocument();
            const glb = glbOf(source);

            // Act
            const document = manager.loadGltfToDoc({ gltfData: glb.slice().buffer });

            // Assert
            expect(boundsOf(onlyPartShape(document))).toEqual({ min: [0, 0, 0], max: [10, 20, 30] });
            source.delete();
            document.delete();
        });

        it("should refuse text that is not glTF, as the kernel names it", () => {
            // Act
            const message = kernelMessageOf(() => manager.loadGltfToDoc({ gltfData: "hello" }));

            // Assert
            expect(message).toBe("Standard_DomainError: ReadGltfToDoc: the file could not be read");
        });

        it("should refuse a Blob, which only the worker layer reads", () => {
            // Act
            const act = (): unknown => manager.loadGltfToDoc({ gltfData: new Blob(["{}"]) });

            // Assert
            expect(act).toThrow(new InputError("`gltfData` is not text or bytes: a File or Blob is read by the worker layer before the call reaches the kernel.", "gltfData"));
        });
    });

    describe("loadObjToDoc", () => {
        it("should read an OBJ tetrahedron into one part whose face carries its four triangles, coordinates as they are", () => {
            // Act
            const document = manager.loadObjToDoc({ objData: TETRAHEDRON_OBJ });

            // Assert
            const shape = onlyPartShape(document);
            expect(boundsOf(shape)).toEqual({ min: [0, 0, 0], max: [1, 1, 1] });
            expect(occt.GetFaceTriangulation(occHelper.shapeGettersService.getFaces({ shape })[0]!).NbTriangles()).toBe(4);
            document.delete();
        });

        it("should read an OBJ handed over as bytes", () => {
            // Act
            const document = manager.loadObjToDoc({ objData: new TextEncoder().encode(TETRAHEDRON_OBJ) });

            // Assert
            expect(boundsOf(onlyPartShape(document))).toEqual({ min: [0, 0, 0], max: [1, 1, 1] });
            document.delete();
        });

        it("should refuse a file that holds no mesh, as the kernel names it", () => {
            // Act
            const message = kernelMessageOf(() => manager.loadObjToDoc({ objData: "hello" }));

            // Assert
            expect(message).toBe("Standard_DomainError: ReadObjToDoc: the file holds no mesh");
        });
    });

    describe("exportDocumentToObj", () => {
        it("should write the corners of a brick without a material library when its part has no color", () => {
            // Arrange
            const document = brickDocument();

            // Act
            const files = manager.exportDocumentToObj({ document, meshDeflection: 0.1, fileName: "brick.obj" });

            // Assert
            expect(files.obj.split("\n").filter(line => line.startsWith("v "))).toHaveLength(24);
            expect(files.obj).not.toMatch(/^mtllib /m);
            expect(files.mtl).toBe("");
            document.delete();
        });

        it("should name the material library after the file and define the red of a red part in it", () => {
            // Arrange
            const document = brickDocument(RED);

            // Act
            const files = manager.exportDocumentToObj({ document, fileName: "brick.obj" });

            // Assert
            expect(files.obj).toMatch(/^mtllib brick\.mtl$/m);
            const used = /^usemtl (\S+)$/m.exec(files.obj)?.[1];
            expect(files.mtl).toMatch(new RegExp(`^newmtl ${used}$`, "m"));
            expect(files.mtl).toMatch(/^Kd 1\.000000 0\.000000 0\.000000$/m);
            document.delete();
        });

        it("should refuse a file name with a space before the kernel sees it", () => {
            // Arrange
            const document = brickDocument();

            // Act
            const act = (): unknown => manager.exportDocumentToObj({ document, fileName: "my brick.obj" });

            // Assert
            expect(act).toThrow(new InputError("`fileName` must be a file name without spaces or slashes, since the OBJ file names its material library after it; it is \"my brick.obj\".", "fileName"));
            document.delete();
        });

        it("should refuse a deflection below the smallest the mesher takes", () => {
            // Arrange
            const document = brickDocument();

            // Act
            const act = (): unknown => manager.exportDocumentToObj({ document, meshDeflection: 0 });

            // Assert
            expect(act).toThrow(new InputError("`meshDeflection` must be a finite number 1e-7 or more; it is 0.", "meshDeflection"));
            document.delete();
        });

        it("should refuse a document that is missing", () => {
            // Act
            const act = (): unknown => manager.exportDocumentToObj({ document: MISSING as Handle_TDocStd_Document });

            // Assert
            expect(act).toThrow(new InputError("`document` is missing or empty, as a load or a build that failed can leave it.", "document"));
        });
    });

    describe("exportDocumentToPly", () => {
        it("should write an ASCII PLY of a brick, four corners per face and two triangles per face, inside the brick", () => {
            // Arrange
            const document = brickDocument();

            // Act
            const ply = manager.exportDocumentToPly({ document, meshDeflection: 0.1, fileName: "brick.ply" });

            // Assert
            const lines = ply.split("\n");
            const start = lines.indexOf("end_header") + 1;
            const corners = lines.slice(start, start + 24).map(line => line.trim().split(/\s+/).slice(0, 3).map(Number));
            expect(lines.slice(0, 2)).toEqual(["ply", "format ascii 1.0"]);
            expect(ply).toMatch(/^element vertex 24$/m);
            expect(ply).toMatch(/^element face 12$/m);
            expect(corners.every(([x, y, z]) => x! >= 0 && x! <= 10 && y! >= 0 && y! <= 20 && z! >= 0 && z! <= 30)).toBe(true);
            document.delete();
        });

        it("should write the red of a red part on every corner, by the default deflection", () => {
            // Arrange
            const document = brickDocument(RED);

            // Act
            const ply = manager.exportDocumentToPly({ document });

            // Assert
            const lines = ply.split("\n");
            const start = lines.indexOf("end_header") + 1;
            expect(ply).toMatch(/^property uchar red$/m);
            expect(lines.slice(start, start + 24).every(line => line.trim().endsWith("255 0 0"))).toBe(true);
            document.delete();
        });

        it("should refuse a deflection below the smallest the mesher takes", () => {
            // Arrange
            const document = brickDocument();

            // Act
            const act = (): unknown => manager.exportDocumentToPly({ document, meshDeflection: 1e-8 });

            // Assert
            expect(act).toThrow(new InputError("`meshDeflection` must be a finite number 1e-7 or more; it is 1e-8.", "meshDeflection"));
            document.delete();
        });

        it("should refuse a document that is missing", () => {
            // Act
            const act = (): unknown => manager.exportDocumentToPly({ document: MISSING as Handle_TDocStd_Document });

            // Assert
            expect(act).toThrow(new InputError("`document` is missing or empty, as a load or a build that failed can leave it.", "document"));
        });
    });

    describe("units, up axes and colours on export", () => {
        const GREY: Inputs.Base.ColorRGBA = { r: 0x80 / 255, g: 0x80 / 255, b: 0x80 / 255, a: 1 };
        const linear = (channel: number): number => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

        const gltfJsonOf = (glb: Uint8Array): { materials?: { pbrMetallicRoughness?: { baseColorFactor?: number[] } }[] } => {
            const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
            const jsonLength = view.getUint32(GLB_HEADER_BYTES, true);
            const jsonStart = GLB_HEADER_BYTES + GLB_CHUNK_HEADER_BYTES;
            return JSON.parse(new TextDecoder().decode(glb.subarray(jsonStart, jsonStart + jsonLength))) as { materials?: { pbrMetallicRoughness?: { baseColorFactor?: number[] } }[] };
        };

        it("should write a y-up document to glTF as it stands, where a z-up one is turned", () => {
            // Arrange
            const source = brickDocument();

            // Act
            const zUp = manager.loadGltfToDoc({ gltfData: manager.exportDocumentToGltf({ document: source, meshDeflection: 0.1 }) });
            const yUp = manager.loadGltfToDoc({ gltfData: manager.exportDocumentToGltf({ document: source, meshDeflection: 0.1, up: Inputs.OCCT.upAxisEnum.y }) });
            const yUpDraco = manager.loadGltfToDoc({ gltfData: manager.exportDocumentToGltfWithDraco({ document: source, meshDeflection: 0.1, useDraco: false, up: Inputs.OCCT.upAxisEnum.y }) });

            // Assert
            expect(boundsOf(onlyPartShape(zUp))).toEqual({ min: [0, 0, 0], max: [10, 20, 30] });
            expect(boundsOf(onlyPartShape(yUp))).toEqual({ min: [0, -30, 0], max: [10, 0, 20] });
            expect(boundsOf(onlyPartShape(yUpDraco))).toEqual({ min: [0, -30, 0], max: [10, 0, 20] });
            [source, zUp, yUp, yUpDraco].forEach(document => document.delete());
        });

        it("should refuse a y-up export on a kernel that writes every document as z-up, and pass a z-up one", () => {
            // Arrange
            const source = brickDocument();
            const received: number[] = [];
            const original = occt.ExportDocumentToGltf.bind(occt) as (...args: unknown[]) => Uint8Array;
            const older = Object.defineProperty((...args: unknown[]): Uint8Array => {
                received.push(args.length);
                return original(...args, false);
            }, "length", { value: 7 });
            const kept: unknown = Reflect.get(occt, "ExportDocumentToGltf");
            Reflect.set(occt, "ExportDocumentToGltf", older);

            // Act
            let refusal: unknown;
            try {
                manager.exportDocumentToGltf({ document: source, meshDeflection: 0.1, up: Inputs.OCCT.upAxisEnum.y });
            } catch (thrown) {
                refusal = thrown;
            }
            const zUp = manager.exportDocumentToGltf({ document: source, meshDeflection: 0.1 });
            Reflect.set(occt, "ExportDocumentToGltf", kept);

            // Assert
            expect(refusal).toEqual(new InputError("this kernel writes every document as z-up; a newer kernel writes a y-up one", "up"));
            expect(received).toEqual([7]);
            expect(zUp.length).toBeGreaterThan(GLB_HEADER_BYTES);
            source.delete();
        });

        it("should write the length unit a structure states into STEP, so a reader in millimetres scales it", () => {
            // Arrange
            const brick = solid.createBox({ width: 10, height: 20, length: 30, center: [5, 10, 15] });
            const part = manager.createPart({ id: "brick", shape: brick, name: "Brick" });
            const structure = manager.combineStructure({ parts: [part], nodes: [], clearDocument: false });
            const inCentimetres = manager.buildAssemblyDocument({ structure: { ...structure, lengthUnit: "cm" } });
            const unstated = manager.buildAssemblyDocument({ structure });

            // Act
            const stepOf = (document: Handle_TDocStd_Document): string => new TextDecoder().decode(manager.exportDocumentToStep({ document, fileName: "brick.step", author: "", organization: "", compress: false, tryDownload: false }));
            const readCentimetres = manager.loadStepToDoc({ stepData: stepOf(inCentimetres) });
            const readUnstated = manager.loadStepToDoc({ stepData: stepOf(unstated) });

            // Assert
            expect(boundsOf(onlyPartShape(readCentimetres))).toEqual({ min: [0, 0, 0], max: [100, 200, 300] });
            expect(boundsOf(onlyPartShape(readUnstated))).toEqual({ min: [0, 0, 0], max: [10, 20, 30] });
            [inCentimetres, unstated, readCentimetres, readUnstated].forEach(document => document.delete());
        });

        it("should write a colour into STEP as it is given and into glTF in linear light, and read either back as given", () => {
            // Arrange
            const source = brickDocument(GREY);

            // Act
            const step = new TextDecoder().decode(manager.exportDocumentToStep({ document: source, fileName: "brick.step", author: "", organization: "", compress: false, tryDownload: false }));
            const fromStep = manager.loadStepToDoc({ stepData: step });
            const glb = manager.exportDocumentToGltf({ document: source, meshDeflection: 0.1 });
            const fromGltf = manager.loadGltfToDoc({ gltfData: glb });
            const service = new OCCTService(occt, occHelper);
            const coloursOf = (document: Handle_TDocStd_Document): string[] => Object.keys(service.docToMesh({ document, precision: 1 }).colorGroups ?? {});

            // Assert
            const stepChannels = [...step.matchAll(/COLOUR_RGB\('[^']*',([^,]+),([^,]+),([^)]+)\)/g)].map(match => [match[1], match[2], match[3]].map(Number));
            expect(stepChannels.length).toBeGreaterThan(0);
            stepChannels.flat().forEach(channel => expect(channel).toBeCloseTo(0x80 / 255, 5));
            const baseColor = gltfJsonOf(glb).materials![0]!.pbrMetallicRoughness!.baseColorFactor!;
            baseColor.slice(0, 3).forEach(channel => expect(channel).toBeCloseTo(linear(0x80 / 255), 5));
            expect(coloursOf(source)).toEqual(["#808080ff"]);
            expect(coloursOf(fromStep)).toEqual(["#808080ff"]);
            expect(coloursOf(fromGltf)).toEqual(["#808080ff"]);
            [source, fromStep, fromGltf].forEach(document => document.delete());
        });
    });
});
