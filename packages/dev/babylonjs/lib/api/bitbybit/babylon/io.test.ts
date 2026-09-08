import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as BABYLON from "@babylonjs/core";
import * as SERIALIZERS from "@babylonjs/serializers";
import { createHeadlessScene, addShadowGenerator, HeadlessScene } from "../../__test__/headless";
import { BabylonIO } from "./io";
import * as Inputs from "../../inputs";

const EMPTY_GLTF = JSON.stringify({
    asset: { version: "2.0" },
    scenes: [{ nodes: [] }],
    scene: 0,
    nodes: [],
    meshes: [],
});

const gltfFile = (name = "part.gltf"): File => new File([EMPTY_GLTF], name, { type: "model/gltf+json" });

type AnchorRecord = { href: string; target: string; download: string; clicked: number; removed: number };

describe("BabylonIO", () => {
    let headless: HeadlessScene;
    let io: BabylonIO;
    let anchors: AnchorRecord[];
    let revokedUrls: string[];

    const recordDownloads = (): void => {
        anchors = [];
        const realCreateElement = document.createElement.bind(document);
        vi.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
            if (tagName !== "a") {
                return realCreateElement(tagName);
            }
            const anchor: AnchorRecord = { href: "", target: "", download: "", clicked: 0, removed: 0 };
            anchors.push(anchor);
            return Object.assign(anchor, {
                click: () => { anchor.clicked += 1; },
                remove: () => { anchor.removed += 1; },
            });
        }) as typeof document.createElement);
        vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:babylon/00000000");
        revokedUrls = [];
        vi.spyOn(URL, "revokeObjectURL").mockImplementation((url: string) => { revokedUrls.push(url); });
        vi.stubGlobal("webkitURL", { createObjectURL: (blob: Blob): string => URL.createObjectURL(blob) });
    };

    beforeEach(() => {
        headless = createHeadlessScene();
        io = new BabylonIO(headless.context);
        recordDownloads();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        headless.dispose();
    });

    describe("exportBabylon", () => {
        it("should download the scene under the name it was given", () => {
            // Act
            io.exportBabylon(new Inputs.BabylonIO.ExportSceneDto("workshop.babylon"));

            // Assert
            expect(anchors[0]!.download).toBe("workshop.babylon");
            expect(anchors[0]).toMatchObject({ clicked: 1, removed: 1, target: "_self" });
        });

        it("should give the file the babylon extension when the name lacks one", () => {
            // Act
            io.exportBabylon(new Inputs.BabylonIO.ExportSceneDto("workshop"));

            // Assert
            expect(anchors[0]!.download).toBe("workshop.babylon");
        });

        it("should give a name that is only the extension one of its own as well", () => {
            // Act
            io.exportBabylon(new Inputs.BabylonIO.ExportSceneDto(".babylon"));

            // Assert
            expect(anchors[0]!.download).toBe(".babylon.babylon");
        });

        it("should put the scene's metadata back after serialising without it", () => {
            // Arrange
            const metadata = headless.scene.metadata;

            // Act
            io.exportBabylon(new Inputs.BabylonIO.ExportSceneDto("workshop"));

            expect(headless.scene.metadata).toBe(metadata);
        });

        it("should put the metadata back even when serialising fails", () => {
            // Arrange
            const metadata = headless.scene.metadata;
            vi.spyOn(BABYLON.SceneSerializer, "Serialize").mockImplementation(() => { throw new Error("cannot serialise"); });

            // Act & Assert
            expect(() => io.exportBabylon(new Inputs.BabylonIO.ExportSceneDto("workshop"))).toThrow("cannot serialise");
            expect(headless.scene.metadata).toBe(metadata);
        });

        it("should release the url of the file it wrote last time", () => {
            // Act
            io.exportBabylon(new Inputs.BabylonIO.ExportSceneDto("first"));
            io.exportBabylon(new Inputs.BabylonIO.ExportSceneDto("second"));

            // Assert
            expect(revokedUrls).toContain("blob:babylon/00000000");
        });
    });

    describe("exportGLB", () => {
        it("should ask the serialiser for the scene under the name it was given", async () => {
            // Arrange
            const asked: { fileName: string; options: SERIALIZERS.IExportOptions }[] = [];
            vi.spyOn(SERIALIZERS.GLTF2Export, "GLBAsync").mockImplementation(((_scene: BABYLON.Scene, fileName: string, options: SERIALIZERS.IExportOptions) => {
                asked.push({ fileName, options });
                return Promise.resolve({ downloadFiles: () => undefined });
            }) as never);

            // Act
            io.exportGLB(new Inputs.BabylonIO.ExportSceneGlbDto("workshop", false));
            await Promise.resolve();

            // Assert
            expect(asked[0]!.fileName).toBe("workshop");
            expect(typeof asked[0]!.options.shouldExportNode).toBe("undefined");
        });

        it("should leave the skybox and the ground out when asked to", async () => {
            // Arrange
            const asked: SERIALIZERS.IExportOptions[] = [];
            vi.spyOn(SERIALIZERS.GLTF2Export, "GLBAsync").mockImplementation(((_scene: BABYLON.Scene, _fileName: string, options: SERIALIZERS.IExportOptions) => {
                asked.push(options);
                return Promise.resolve({ downloadFiles: () => undefined });
            }) as never);
            const skybox = new BABYLON.Mesh("bitbybit-hdrSkyBox", headless.scene);
            const ground = new BABYLON.Mesh("bitbybit-ground-1", headless.scene);
            const part = new BABYLON.Mesh("part", headless.scene);

            // Act
            io.exportGLB(new Inputs.BabylonIO.ExportSceneGlbDto("workshop", true));
            await Promise.resolve();

            // Assert
            const shouldExport = (mesh: BABYLON.AbstractMesh): boolean => asked[0]!.shouldExportNode!(mesh);
            expect(shouldExport(skybox)).toBe(false);
            expect(shouldExport(ground)).toBe(false);
            expect(shouldExport(part)).toBe(true);
        });

        it("should read the extras a node carries for glTF and nothing else", async () => {
            // Arrange
            const asked: SERIALIZERS.IExportOptions[] = [];
            vi.spyOn(SERIALIZERS.GLTF2Export, "GLBAsync").mockImplementation(((_scene: BABYLON.Scene, _fileName: string, options: SERIALIZERS.IExportOptions) => {
                asked.push(options);
                return Promise.resolve({ downloadFiles: () => undefined });
            }) as never);

            // Act
            io.exportGLB(new Inputs.BabylonIO.ExportSceneGlbDto("workshop", false));
            await Promise.resolve();

            // Assert
            const select = (node: unknown): unknown => asked[0]!.metadataSelector!(node);
            expect(select({ gltf: { extras: { partId: 7 } } })).toEqual({ partId: 7 });
            expect(select(undefined)).toBeUndefined();
        });

        it("should report a failed export rather than leave the promise unhandled", async () => {
            // Arrange
            const reported: unknown[] = [];
            vi.spyOn(console, "error").mockImplementation((message: unknown) => { reported.push(message); });
            vi.spyOn(SERIALIZERS.GLTF2Export, "GLBAsync").mockRejectedValue(new Error("no gpu"));

            // Act
            io.exportGLB(new Inputs.BabylonIO.ExportSceneGlbDto("workshop", false));
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Assert
            expect(reported[0]).toContain("Failed to export the scene to workshop");
        });
    });

    describe("exportMeshToStl", () => {
        it("should write the mesh and its children", async () => {
            // Arrange
            const written: BABYLON.Mesh[][] = [];
            vi.spyOn(SERIALIZERS.STLExport, "CreateSTL").mockImplementation(((meshes: BABYLON.Mesh[]) => {
                written.push(meshes);
                return "";
            }) as never);
            const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, headless.scene);
            const child = BABYLON.MeshBuilder.CreateBox("child", { size: 1 }, headless.scene);
            child.parent = box;

            // Act
            await io.exportMeshToStl(new Inputs.BabylonIO.ExportMeshToStlDto(box, "part"));

            // Assert
            expect(written[0]).toEqual([box, child]);
        });

        it("should leave out the lines, which an stl cannot hold", async () => {
            // Arrange
            const written: BABYLON.Mesh[][] = [];
            vi.spyOn(SERIALIZERS.STLExport, "CreateSTL").mockImplementation(((meshes: BABYLON.Mesh[]) => {
                written.push(meshes);
                return "";
            }) as never);
            const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, headless.scene);
            const lines = BABYLON.MeshBuilder.CreateLines("lines", { points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(1, 0, 0)] }, headless.scene);
            lines.parent = box;

            // Act
            await io.exportMeshToStl(new Inputs.BabylonIO.ExportMeshToStlDto(box, "part"));

            // Assert
            expect(written[0]).toEqual([box]);
        });

        it("should leave out a mesh that is not visible", async () => {
            // Arrange
            const written: BABYLON.Mesh[][] = [];
            vi.spyOn(SERIALIZERS.STLExport, "CreateSTL").mockImplementation(((meshes: BABYLON.Mesh[]) => {
                written.push(meshes);
                return "";
            }) as never);
            const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, headless.scene);
            const hidden = BABYLON.MeshBuilder.CreateBox("hidden", { size: 1 }, headless.scene);
            hidden.parent = box;
            hidden.isVisible = false;

            // Act
            await io.exportMeshToStl(new Inputs.BabylonIO.ExportMeshToStlDto(box, "part"));

            // Assert
            expect(written[0]).toEqual([box]);
        });

        it("should write a mesh that has no children at all", async () => {
            // Arrange
            const written: BABYLON.Mesh[][] = [];
            vi.spyOn(SERIALIZERS.STLExport, "CreateSTL").mockImplementation(((meshes: BABYLON.Mesh[]) => {
                written.push(meshes);
                return "";
            }) as never);
            const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, headless.scene);

            // Act
            await io.exportMeshToStl(new Inputs.BabylonIO.ExportMeshToStlDto(box, "part"));

            // Assert
            expect(written[0]).toEqual([box]);
        });
    });

    describe("exportMeshesToStl", () => {
        it("should write every mesh it was given, with the children of each", async () => {
            // Arrange
            const written: BABYLON.Mesh[][] = [];
            vi.spyOn(SERIALIZERS.STLExport, "CreateSTL").mockImplementation(((meshes: BABYLON.Mesh[]) => {
                written.push(meshes);
                return "";
            }) as never);
            const first = BABYLON.MeshBuilder.CreateBox("first", { size: 1 }, headless.scene);
            const child = BABYLON.MeshBuilder.CreateBox("child", { size: 1 }, headless.scene);
            child.parent = first;
            const second = BABYLON.MeshBuilder.CreateBox("second", { size: 1 }, headless.scene);

            // Act
            await io.exportMeshesToStl(new Inputs.BabylonIO.ExportMeshesToStlDto([first, second], "parts"));

            // Assert
            expect(written[0]).toEqual([first, child, second]);
        });

        it("should leave the lines of a child out", async () => {
            // Arrange
            const written: BABYLON.Mesh[][] = [];
            vi.spyOn(SERIALIZERS.STLExport, "CreateSTL").mockImplementation(((meshes: BABYLON.Mesh[]) => {
                written.push(meshes);
                return "";
            }) as never);
            const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, headless.scene);
            const lines = BABYLON.MeshBuilder.CreateLines("lines", { points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(1, 0, 0)] }, headless.scene);
            lines.parent = box;

            // Act
            await io.exportMeshesToStl(new Inputs.BabylonIO.ExportMeshesToStlDto([box], "parts"));

            // Assert
            expect(written[0]).toEqual([box]);
        });
    });

    describe("loadAssetIntoScene", () => {
        it("should refuse a file of a kind it cannot read", async () => {
            // Act & Assert
            await expect(io.loadAssetIntoScene(new Inputs.Asset.AssetFileDto(new File([""], "part.dwg"), false)))
                .rejects.toThrow("Unsupported file format detected: dwg");
        });

        it("should read a glTF file into the scene", async () => {
            // Act
            const container = await io.loadAssetIntoScene(new Inputs.Asset.AssetFileDto(gltfFile(), false));

            // Assert
            expect(container.name).toContain("ImportedMeshContainer");
            expect(headless.scene.meshes).toContain(container);
        });

        it("should say what went wrong when the file cannot be read", async () => {
            await expect(io.loadAssetIntoScene(new Inputs.Asset.AssetFileDto(new File(["not a model"], "part.gltf"), false)))
                .rejects.toThrow();
        });
    });

    describe("loadAssetIntoSceneNoReturn", () => {
        it("should read the file without handing the container back", async () => {
            // Act
            const result = await io.loadAssetIntoSceneNoReturn(new Inputs.Asset.AssetFileDto(gltfFile(), false));

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe("what a loaded asset is set up with", () => {
        const ONE_NODE_GLTF = JSON.stringify({
            asset: { version: "2.0" },
            scene: 0,
            scenes: [{ nodes: [0] }],
            nodes: [{ name: "part" }],
            meshes: [],
        });
        const oneNodeFile = (): File => new File([ONE_NODE_GLTF], "part.gltf", { type: "model/gltf+json" });

        it("should leave what it loaded out of picking", async () => {
            // Arrange
            addShadowGenerator(headless.scene);

            // Act
            const container = await io.loadAssetIntoScene(new Inputs.Asset.AssetFileDto(oneNodeFile(), false));

            // Assert
            expect(container.getChildMeshes().every(m => m.isPickable === false)).toBe(true);
        });

        it("should hide what it loaded when it was asked to", async () => {
            // Arrange
            addShadowGenerator(headless.scene);

            // Act
            const container = await io.loadAssetIntoScene(new Inputs.Asset.AssetFileDto(oneNodeFile(), true));

            // Assert
            expect(container.getChildMeshes().every(m => m.isVisible === false)).toBe(true);
        });

        it("should sign what it loaded up to the shadow generators the scene carries", async () => {
            // Arrange
            const generator = addShadowGenerator(headless.scene);

            // Act
            const container = await io.loadAssetIntoScene(new Inputs.Asset.AssetFileDto(oneNodeFile(), false));

            // Assert
            const casters = generator.getShadowMap()!.renderList ?? [];
            expect(container.getChildMeshes().some(m => casters.includes(m))).toBe(true);
        });

        it("should hand back a container even where the scene casts no shadows at all", async () => {
            // Act
            const container = await io.loadAssetIntoScene(new Inputs.Asset.AssetFileDto(oneNodeFile(), false));

            // Assert
            expect(container).toBeInstanceOf(BABYLON.Mesh);
            expect(container.getChildMeshes().length).toBeGreaterThan(0);
        });
    });

    describe("loadAssetIntoSceneFromRootUrl", () => {
        it("should refuse a file of a kind it cannot read", async () => {
            // Act & Assert
            await expect(io.loadAssetIntoSceneFromRootUrl(new Inputs.Asset.AssetFileByUrlDto("part.dwg", "https://example.test/", false)))
                .rejects.toThrow("Unsupported file format detected: dwg");
        });

        it("should pass on what went wrong where nothing could be read from the url", async () => {
            // Act
            const act = io.loadAssetIntoSceneFromRootUrl(
                new Inputs.Asset.AssetFileByUrlDto("part.gltf", "http://127.0.0.1:0/", false));

            // Assert
            await expect(act).rejects.toThrow();
        });
    });

    describe("loadAssetIntoSceneFromRootUrlNoReturn", () => {
        it("should pass the same failure on to a script that wanted nothing back", async () => {
            // Act
            const act = io.loadAssetIntoSceneFromRootUrlNoReturn(
                new Inputs.Asset.AssetFileByUrlDto("part.gltf", "http://127.0.0.1:0/", false));

            // Assert
            await expect(act).rejects.toThrow();
        });
    });

    describe("loadGlbFromArrayBuffer", () => {
        it("should read the bytes it was given as a glTF document", async () => {
            // Arrange
            const bytes = new TextEncoder().encode(EMPTY_GLTF);

            // Act
            const container = await io.loadGlbFromArrayBuffer(new Inputs.Asset.AssetGlbDataDto(bytes, "part.gltf", false));

            // Assert
            expect(container.name).toContain("ImportedMeshContainer");
        });
    });

    describe("loadGlbFromArrayBufferNoReturn", () => {
        it("should read the bytes without handing the container back", async () => {
            // Arrange
            const bytes = new TextEncoder().encode(EMPTY_GLTF);

            // Act
            const result = await io.loadGlbFromArrayBufferNoReturn(new Inputs.Asset.AssetGlbDataDto(bytes, "part.gltf", false));

            // Assert
            expect(result).toBeUndefined();
        });
    });
});
