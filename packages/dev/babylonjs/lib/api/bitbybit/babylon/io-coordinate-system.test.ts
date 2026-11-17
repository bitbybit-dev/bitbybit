import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as BABYLON from "@babylonjs/core";
import * as SERIALIZERS from "@babylonjs/serializers";
import { BaseBitByBit, Inputs as BaseInputs } from "@bitbybit-dev/base";
import type { HeadlessScene } from "../../__test__/headless";
import { createHeadlessScene } from "../../__test__/headless";
import { BabylonIO } from "./io";
import * as Inputs from "../../inputs";
import { markAsBackFace } from "../../back-faces";

const { leftHanded, rightHanded } = BaseInputs.Base.coordinateSystemEnum;

type System = BaseInputs.Base.coordinateSystemEnum;
type Point = Inputs.Base.Point3;
type Triangle = [Point, Point, Point];
type Spans = [number, number][];

const SCENES: [string, boolean, System][] = [["a left-handed scene", false, leftHanded], ["a right-handed scene", true, rightHanded]];
const SCENE_KINDS: [string, boolean][] = [["a left-handed scene", false], ["a right-handed scene", true]];

const TETRAHEDRON_CORNERS: Point[] = [[0, 0, 0], [1, 0, 0], [0, 2, 0], [0, 0, 3]];
const TETRAHEDRON_FACETS = [[0, 2, 1], [0, 1, 3], [0, 3, 2], [1, 2, 3]];
const TETRAHEDRON_STL = [
    "solid part",
    ...TETRAHEDRON_FACETS.map(facet => `facet normal 0 0 0\nouter loop\n${facet.map(corner => `vertex ${TETRAHEDRON_CORNERS[corner]!.join(" ")}`).join("\n")}\nendloop\nendfacet`),
    "endsolid part",
].join("\n");
const TETRAHEDRON_OBJ = ["o part", ...TETRAHEDRON_CORNERS.map(corner => `v ${corner.join(" ")}`), ...TETRAHEDRON_FACETS.map(facet => `f ${facet.map(corner => corner + 1).join(" ")}`)].join("\n");

describe("BabylonIO in a coordinate system", () => {
    let headless: HeadlessScene;
    let io: BabylonIO;
    let downloads: { blob: Blob, name: string }[];
    const base = new BaseBitByBit();

    beforeEach(() => {
        headless = createHeadlessScene();
        io = new BabylonIO(headless.context);
        downloads = [];
        vi.spyOn(BABYLON.Tools, "Download").mockImplementation((blob: Blob, name: string) => { downloads.push({ blob, name }); });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        headless.dispose();
    });

    const inScene = (rightHandedScene: boolean, system?: System): void => {
        headless.scene.useRightHandedSystem = rightHandedScene;
        headless.context.settings = system === undefined ? {} : { coordinateSystem: system };
    };
    const rounded = (value: number): number => Math.round(value * 1e3) / 1e3 + 0;
    const bytesOf = (blob: Blob): Promise<Uint8Array> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (): void => { resolve(new Uint8Array(reader.result as ArrayBuffer)); };
        reader.onerror = (): void => { reject(new Error("the download could not be read")); };
        reader.readAsArrayBuffer(blob);
    });
    const trianglesOf = (file: Uint8Array): Triangle[] => {
        const view = new DataView(file.buffer, file.byteOffset, file.byteLength);
        const point = (at: number): Point => [view.getFloat32(at, true), view.getFloat32(at + 4, true), view.getFloat32(at + 8, true)];
        return Array.from({ length: view.getUint32(80, true) }, (_triangle, at): Triangle => {
            const first = 84 + at * 50 + 12;
            return [point(first), point(first + 12), point(first + 24)];
        });
    };
    const spansOfPoints = (points: Point[]): Spans => [0, 1, 2].map((axis): [number, number] => [
        rounded(Math.min(...points.map(point => point[axis]!))),
        rounded(Math.max(...points.map(point => point[axis]!))),
    ]);
    const spansOf = (triangles: Triangle[]): Spans => spansOfPoints(triangles.flat());
    const volumeOf = (triangles: Triangle[]): number => rounded(base.mesh.signedVolume({ mesh: triangles }));
    const downloaded = async (): Promise<Triangle[]> => trianglesOf(await bytesOf(downloads[downloads.length - 1]!.blob));
    const exported = async (mesh: BABYLON.Mesh): Promise<Triangle[]> => {
        await io.exportMeshToStl(new Inputs.BabylonIO.ExportMeshToStlDto(mesh, "part"));
        return downloaded();
    };
    const shelf = (): BABYLON.Mesh => {
        const box = BABYLON.MeshBuilder.CreateBox("shelf", { width: 1, height: 2, depth: 3 }, headless.scene);
        box.position = new BABYLON.Vector3(10, 20, 30);
        return box;
    };
    const otherFacingThan = (mesh: BABYLON.Mesh): number => (mesh.sideOrientation === BABYLON.Material.ClockWiseSideOrientation
        ? BABYLON.Material.CounterClockWiseSideOrientation
        : BABYLON.Material.ClockWiseSideOrientation);
    const stlFile = (name = "part.stl"): File => new File([TETRAHEDRON_STL], name, { type: "model/stl" });
    const objFile = (): File => new File([TETRAHEDRON_OBJ], "part.obj", { type: "model/obj" });
    const placeOf = (container: BABYLON.Mesh): Spans => spansOfPoints(container.getChildMeshes().flatMap((mesh) => {
        mesh.computeWorldMatrix(true);
        const box = mesh.getBoundingInfo().boundingBox;
        return [box.minimumWorld.asArray(), box.maximumWorld.asArray()];
    }));

    describe("an STL download", () => {
        it.each([
            ["a left-handed scene", false, leftHanded, [[9.5, 10.5], [28.5, 31.5], [19, 21]]],
            ["a right-handed scene", true, rightHanded, [[9.5, 10.5], [-31.5, -28.5], [19, 21]]],
        ] as [string, boolean, System, Spans][])("should stand a box of %s where it stands there, z up, its facets facing outward", async (_name, rightHandedScene, system, spans) => {
            // Arrange
            inScene(rightHandedScene, system);

            // Act
            const file = await exported(shelf());

            // Assert
            expect(spansOf(file)).toEqual(spans);
            expect(volumeOf(file)).toBe(6);
            expect(file).toHaveLength(12);
        });

        it.each(SCENES)("should face a mesh of %s outward when its material turns its fronts the other way", async (_name, rightHandedScene, system) => {
            // Arrange
            inScene(rightHandedScene, system);
            const box = shelf();
            box.flipFaces(false);
            box.material = new BABYLON.StandardMaterial("turned", headless.scene);
            box.material.sideOrientation = otherFacingThan(box);

            // Act
            const file = await exported(box);

            // Assert
            expect(volumeOf(file)).toBe(6);
        });

        it.each(SCENES)("should face a mesh of %s outward when it wears a material that leaves the facing to the mesh, as every drawn shape does", async (_name, rightHandedScene, system) => {
            // Arrange
            inScene(rightHandedScene, system);
            const box = shelf();
            const material = new BABYLON.PBRMetallicRoughnessMaterial("drawn", headless.scene);
            material.sideOrientation = null;
            box.material = material;

            // Act
            const file = await exported(box);

            // Assert
            expect(volumeOf(file)).toBe(6);
        });

        it.each(SCENES)("should write a mesh of %s with no material whose own facing is turned inside out, as it shows", async (_name, rightHandedScene, system) => {
            // Arrange
            inScene(rightHandedScene, system);
            const box = shelf();
            box.sideOrientation = otherFacingThan(box);

            // Act
            const file = await exported(box);

            // Assert
            expect(volumeOf(file)).toBe(-6);
        });

        it.each(SCENES)("should write a mesh of %s that shows its inside as inside out as it shows", async (_name, rightHandedScene, system) => {
            // Arrange
            inScene(rightHandedScene, system);
            const box = shelf();
            box.flipFaces(false);

            // Act
            const file = await exported(box);

            // Assert
            expect(volumeOf(file)).toBe(-6);
        });

        it.each([
            ["a left-handed scene", false, leftHanded, [[-10.5, -9.5], [28.5, 31.5], [19, 21]]],
            ["a right-handed scene", true, rightHanded, [[-10.5, -9.5], [-31.5, -28.5], [19, 21]]],
        ] as [string, boolean, System, Spans][])("should write a mesh of %s under a mirroring parent where it shows, facing outward", async (_name, rightHandedScene, system, spans) => {
            // Arrange
            inScene(rightHandedScene, system);
            const mirror = new BABYLON.TransformNode("mirror", headless.scene);
            mirror.scaling = new BABYLON.Vector3(-1, 1, 1);
            const box = shelf();
            box.parent = mirror;

            // Act
            const file = await exported(box);

            // Assert
            expect(spansOf(file)).toEqual(spans);
            expect(volumeOf(file)).toBe(6);
        });

        it.each([
            ["a left-handed scene", false, leftHanded, [[-0.5, 0.5], [-1.5, 1.5], [49, 51]]],
            ["a right-handed scene", true, rightHanded, [[-0.5, 0.5], [-1.5, 1.5], [49, 51]]],
        ] as [string, boolean, System, Spans][])("should write an instance of %s where the instance stands", async (_name, rightHandedScene, system, spans) => {
            // Arrange
            inScene(rightHandedScene, system);
            const instance = shelf().createInstance("copy");
            instance.position = new BABYLON.Vector3(0, 50, 0);

            // Act
            await io.exportMeshesToStl(new Inputs.BabylonIO.ExportMeshesToStlDto([instance as BABYLON.AbstractMesh as BABYLON.Mesh], "part"));
            const file = await downloaded();

            // Assert
            expect(spansOf(file)).toEqual(spans);
            expect(volumeOf(file)).toBe(6);
        });

        it.each(SCENES)("should write several meshes of %s and their children into one file", async (_name, rightHandedScene, system) => {
            // Arrange
            inScene(rightHandedScene, system);
            const first = shelf();
            const child = shelf();
            child.parent = first;
            const second = shelf();

            // Act
            await io.exportMeshesToStl(new Inputs.BabylonIO.ExportMeshesToStlDto([first, second], "parts"));
            const file = await downloaded();

            // Assert
            expect(file).toHaveLength(36);
            expect(volumeOf(file)).toBe(18);
            expect(downloads.map(download => download.name)).toEqual(["parts.stl"]);
        });

        it.each(SCENES)("should write a shape of %s drawn two-sided once, leaving its back face out", async (_name, rightHandedScene, system) => {
            // Arrange
            inScene(rightHandedScene, system);
            const front = shelf();
            const back = BABYLON.MeshBuilder.CreateBox("back", { width: 1, height: 2, depth: 3 }, headless.scene);
            back.flipFaces(false);
            back.parent = front;
            markAsBackFace(back);

            // Act
            const alone = await exported(front);
            await io.exportMeshesToStl(new Inputs.BabylonIO.ExportMeshesToStlDto([front, back], "parts"));
            const listed = await downloaded();

            // Assert
            expect([alone.length, volumeOf(alone)]).toEqual([12, 6]);
            expect([listed.length, volumeOf(listed)]).toEqual([12, 6]);
        });

        it.each(SCENES)("should leave a mesh of %s as it was", async (_name, rightHandedScene, system) => {
            // Arrange
            inScene(rightHandedScene, system);
            const box = shelf();
            const before = [Array.from(box.getVerticesData(BABYLON.VertexBuffer.PositionKind)!), Array.from(box.getIndices()!), box.position.asArray()];

            // Act
            await exported(box);

            // Assert
            expect([Array.from(box.getVerticesData(BABYLON.VertexBuffer.PositionKind)!), Array.from(box.getIndices()!), box.position.asArray()]).toEqual(before);
        });

        it.each(SCENE_KINDS)("should write as the engine's own exporter does in %s when no coordinate system is set", async (_name, rightHandedScene) => {
            // Arrange
            inScene(rightHandedScene);
            const asked: unknown[][] = [];
            vi.spyOn(SERIALIZERS.STLExport, "CreateSTL").mockImplementation(((...given: unknown[]) => {
                asked.push(given);
                return "";
            }) as never);
            const box = shelf();

            // Act
            await io.exportMeshToStl(new Inputs.BabylonIO.ExportMeshToStlDto(box, "part"));
            await io.exportMeshesToStl(new Inputs.BabylonIO.ExportMeshesToStlDto([box], "parts"));

            // Assert
            expect(asked).toEqual([[[box], true, "part", true, true, true], [[box], true, "parts", true, true, true]]);
            expect(downloads).toEqual([]);
        });
    });

    describe("an STL model coming in", () => {
        it.each([
            ["a left-handed scene with no coordinate system set", false, undefined, [[0, 1], [0, 3], [0, 2]]],
            ["a right-handed scene with no coordinate system set", true, undefined, [[0, 1], [0, 3], [0, 2]]],
            ["a left-handed scene", false, leftHanded, [[0, 1], [0, 3], [0, 2]]],
            ["a right-handed scene", true, rightHanded, [[0, 1], [0, 3], [-2, 0]]],
        ] as [string, boolean, System | undefined, Spans][])("should stand in %s with its z up", async (_name, rightHandedScene, system, spans) => {
            // Arrange
            inScene(rightHandedScene, system);

            // Act
            const container = await io.loadAssetIntoScene(new Inputs.Asset.AssetFileDto(stlFile(), false));

            // Assert
            expect(placeOf(container)).toEqual(spans);
        });

        it.each(SCENES)("should go out of %s again as the file it came in as", async (_name, rightHandedScene, system) => {
            // Arrange
            inScene(rightHandedScene, system);
            const container = await io.loadAssetIntoScene(new Inputs.Asset.AssetFileDto(stlFile(), false));

            // Act
            const file = await exported(container);

            // Assert
            expect(spansOf(file)).toEqual([[0, 1], [0, 2], [0, 3]]);
            expect(volumeOf(file)).toBe(1);
        });

        it("should turn a file whose name ends in capitals as any other", async () => {
            // Arrange
            inScene(true, rightHanded);

            // Act
            const container = await io.loadAssetIntoScene(new Inputs.Asset.AssetFileDto(stlFile("PART.STL"), false));

            // Assert
            expect(placeOf(container)).toEqual([[0, 1], [0, 3], [-2, 0]]);
        });

        it("should leave an OBJ model where the engine's loader put it", async () => {
            // Arrange
            inScene(true);
            const before = placeOf(await io.loadAssetIntoScene(new Inputs.Asset.AssetFileDto(objFile(), false)));
            inScene(true, rightHanded);

            // Act
            const container = await io.loadAssetIntoScene(new Inputs.Asset.AssetFileDto(objFile(), false));

            // Assert
            expect(placeOf(container)).toEqual(before);
        });
    });
});
