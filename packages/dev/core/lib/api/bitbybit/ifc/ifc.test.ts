import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import createBitbybitOcct from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { OCCTWorkerMock } from "@bitbybit-dev/occt-worker/lib/occ-worker/occ-worker-mock";
import { IFC } from "@bitbybit-dev/ifc";
import { IFCWorkerManager, IFCWorkerMock } from "@bitbybit-dev/ifc-worker";
import { ContextBase } from "../../context";
import type * as Inputs from "../../inputs";
import { OCCTW } from "../occt/occt";
import { IFCW } from "./ifc";

const WALL_HEIGHT = 3000;
const WALL_THICKNESS = 200;
const CORNERS: [number, number][] = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];

async function loadKernel(): ReturnType<typeof createBitbybitOcct> {
    const folder = join(dirname(createRequire(join(process.cwd(), "package.json")).resolve("@bitbybit-dev/occt/package.json")), "bitbybit-dev-occt");
    const wasm = readdirSync(folder).find((file) => file.endsWith(".wasm"))!;
    return createBitbybitOcct({ locateFile: (file: string): string => join(folder, file.endsWith(".wasm") ? wasm : file) });
}

async function houseIn(ifc: IFCW): Promise<Inputs.IFC.IfcModelPointer> {
    let model = await ifc.model.create({ name: "Room", seed: "to-shapes" });
    model = await ifc.spatial.addStorey({ model, id: "ground", elevation: 0 });
    for (let i = 0; i < CORNERS.length; i++) {
        model = await ifc.walls.add({ model, storey: "ground", id: `wall-${i}`, start: CORNERS[i]!, end: CORNERS[(i + 1) % CORNERS.length]!, height: WALL_HEIGHT, thickness: WALL_THICKNESS, alignment: IFC.wallAlignmentEnum.right });
    }
    for (let i = 0; i < CORNERS.length; i++) {
        model = await ifc.walls.connect({ model, wall: `wall-${i}`, other: `wall-${(i + 1) % CORNERS.length}` });
    }
    model = await ifc.doors.addType({ model, id: "door", width: 900, height: 2100 });
    model = await ifc.doors.add({ model, wall: "wall-0", doorType: "door", id: "door-1", offset: 1000 });
    return ifc.slabs.add({ model, storey: "ground", id: "floor", outline: CORNERS, thickness: 200 });
}

describe("IFC geometry built with OpenCascade", () => {
    let occt: OCCTW;
    let ifc: IFCW;
    let model: Inputs.IFC.IfcModelPointer;

    beforeAll(async () => {
        const occtWorker = new OCCTWorkerMock();
        const occtManager = new OCCTWorkerManager();
        occtManager.setOccWorker(occtWorker);
        occtWorker.initializationComplete(await loadKernel(), undefined, true);
        const ifcWorker = new IFCWorkerMock();
        const ifcManager = new IFCWorkerManager();
        ifcManager.setIfcWorker(ifcWorker);
        ifcWorker.initializationComplete(true);
        occt = new OCCTW(new ContextBase(), occtManager);
        ifc = new IFCW(ifcManager, occt);
        model = await houseIn(ifc);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    async function volumeOf(shape: Inputs.OCCT.TopoDSShapePointer): Promise<number> {
        return occt.shapes.solid.getSolidVolume({ shape });
    }

    describe("toShapes", () => {
        it("should build every element as a shape of the volume it holds, standing up along Y", async () => {
            // Act
            const shapes = await ifc.geometry.toShapes({ model });
            const wallBox = await occt.operations.boundingBoxOfShape({ shape: shapes[1]! });

            // Assert
            expect(shapes).toHaveLength(6);
            expect(await volumeOf(shapes[0]!) / 1e9).toBeCloseTo((6000 + 6400) / 2 * 0.2 * 3 / 1e3 - 0.9 * 2.1 * 0.2, 9);
            expect(await volumeOf(shapes[5]!) / 1e9).toBeCloseTo(6 * 4 * 0.2, 9);
            expect(wallBox.min[1]).toBeCloseTo(0, 6);
            expect(wallBox.max[1]).toBeCloseTo(WALL_HEIGHT, 6);
        });

        it("should keep the model's Z up when asked, and build only the elements named", async () => {
            // Act
            const shapes = await ifc.geometry.toShapes({ model, elements: ["wall-1"], adjustZtoY: false });
            const box = await occt.operations.boundingBoxOfShape({ shape: shapes[0]! });

            // Assert
            expect(shapes).toHaveLength(1);
            expect(box.max[2]).toBeCloseTo(WALL_HEIGHT, 6);
            expect(box.min[0]).toBeCloseTo(6000, 6);
        });

        it("should hand the kernel the recipe of the model with the build options as given or defaulted", async () => {
            // Arrange
            const build = vi.spyOn(occt.recipes, "build");

            // Act
            await ifc.geometry.toShapes({ model, elements: ["floor"], facetedMeshes: true, maxTriangles: 7 });

            // Assert
            const call = build.mock.calls[0]![0];
            expect(call.recipe.roots.map((root) => root.tag["type"])).toEqual(["IfcSlab"]);
            expect({ ...call, recipe: undefined }).toEqual({ recipe: undefined, adjustZtoY: true, emptyWhenFailed: true, facetedMeshes: true, maxTriangles: 7 });
        });
    });

    describe("toDocument", () => {
        it("should build a document under the name given, a product per element in the site, building, storey and class it belongs to", async () => {
            // Act
            const document = await ifc.geometry.toDocument({ model, name: "Room" });
            const hierarchy = await occt.assembly.query.getAssemblyHierarchy({ document });
            await occt.assembly.manager.deleteDocument({ document });

            // Assert
            const atDepth = (depth: number): string[] => hierarchy.nodes.filter((node) => node.depth === depth).map((node) => node.name);
            expect([0, 1, 2, 3].map(atDepth)).toEqual([["Room"], ["Site"], ["Building"], ["Storey"]]);
            expect(atDepth(4)).toEqual(["Walls", "Doors", "Slabs"]);
            expect(atDepth(5)).toEqual(["IfcWall", "IfcWall", "IfcWall", "IfcWall", "IfcDoor", "IfcSlab"]);
        });

        it("should put the products straight into their storey when not grouping by class", async () => {
            // Act
            const document = await ifc.geometry.toDocument({ model, name: "Room", groupByClass: false });
            const hierarchy = await occt.assembly.query.getAssemblyHierarchy({ document });
            await occt.assembly.manager.deleteDocument({ document });

            // Assert
            expect(hierarchy.nodes.filter((node) => node.depth === 4).map((node) => node.name)).toEqual(["IfcWall", "IfcWall", "IfcWall", "IfcWall", "IfcDoor", "IfcSlab"]);
        });

        it("should describe the model for a STEP file with the class groups as asked", async () => {
            // Arrange
            const recipe = vi.spyOn(ifc.geometry, "recipe");
            const document: Inputs.OCCT.TDocStdDocumentPointer = { hash: 1, type: "occ-entity" };
            vi.spyOn(occt.recipes, "buildDocument").mockResolvedValue(document);
            vi.spyOn(occt.assembly.manager, "exportDocumentToStep").mockResolvedValue(new Uint8Array([1]));
            vi.spyOn(occt.assembly.manager, "deleteDocument").mockResolvedValue();

            // Act
            await ifc.geometry.toStep({ model, elements: ["floor"], groupByClass: false });

            // Assert
            expect(recipe.mock.calls[0]![0]).toEqual({ model, elements: ["floor"], groupByClass: false, propertySets: true });
        });

        it("should give each product its element's property set values, unless asked not to", async () => {
            // Arrange
            const withSet = await ifc.properties.addSet({ model, elements: ["floor"], name: "Pset_SlabCommon", properties: [{ name: "IsExternal", value: false }, { name: "Reference", value: "S-1" }] });
            const document: Inputs.OCCT.TDocStdDocumentPointer = { hash: 1, type: "occ-entity" };
            const buildDocument = vi.spyOn(occt.recipes, "buildDocument").mockResolvedValue(document);

            // Act
            await ifc.geometry.toDocument({ model: withSet, elements: ["floor"] });
            await ifc.geometry.toDocument({ model: withSet, elements: ["floor"], propertySets: false });

            // Assert
            const [withValues, without] = buildDocument.mock.calls.map((call) => call[0].recipe.roots[0]!.tag);
            expect(withValues).toMatchObject({ "Pset_SlabCommon.IsExternal": false, "Pset_SlabCommon.Reference": "S-1", type: "IfcSlab" });
            expect(Object.keys(without!).some((key) => key.startsWith("Pset_"))).toBe(false);
        });

        it("should hand the kernel the document options as given or defaulted", async () => {
            // Arrange
            const document: Inputs.OCCT.TDocStdDocumentPointer = { hash: 1, type: "occ-entity" };
            const buildDocument = vi.spyOn(occt.recipes, "buildDocument").mockResolvedValue(document);

            // Act
            await ifc.geometry.toDocument({ model, elements: ["floor"], emptyWhenFailed: false });

            // Assert
            const call = buildDocument.mock.calls[0]![0];
            expect({ ...call, recipe: undefined }).toEqual({ recipe: undefined, name: "Model", emptyWhenFailed: false, facetedMeshes: false, maxTriangles: 100000 });
        });
    });

    describe("toStep", () => {
        it("should write the model's elements as a STEP file and let go of the document it built", async () => {
            // Arrange
            const deleteDocument = vi.spyOn(occt.assembly.manager, "deleteDocument");

            const wall = await ifc.model.globalIdOf({ model, id: "wall-0" });

            // Act
            const step = await ifc.geometry.toStep({ model, name: "Room", fileName: "room.step" });
            const text = new TextDecoder().decode(step);

            // Assert
            expect(text.startsWith("ISO-10303-21;")).toBe(true);
            expect(text).toContain("'room.step'");
            expect(text).toContain("PRODUCT('Room'");
            expect(text).toContain(`'${wall}'`);
            expect(deleteDocument).toHaveBeenCalledTimes(1);
        });

        it("should write an element's property set values into the STEP file as its product's properties", async () => {
            // Arrange
            const withSet = await ifc.properties.addSet({ model, elements: ["floor"], name: "Pset_SlabCommon", properties: [{ name: "Reference", value: "Slab S-1" }] });

            // Act
            const step = await ifc.geometry.toStep({ model: withSet, elements: ["floor"], name: "Room", fileName: "room.step" });
            const text = new TextDecoder().decode(step);

            // Assert
            expect(text).toContain("'Pset_SlabCommon.Reference'");
            expect(text).toContain("'Slab S-1'");
        });

        it("should let go of the document when the export fails, and pass the failure on", async () => {
            // Arrange
            const deleteDocument = vi.spyOn(occt.assembly.manager, "deleteDocument");
            const exportDocumentToStep = vi.spyOn(occt.assembly.manager, "exportDocumentToStep").mockRejectedValue(new Error("disk full"));

            // Act
            const act = ifc.geometry.toStep({ model, elements: ["floor"], compress: true, tryDownload: true });

            // Assert
            await expect(act).rejects.toThrow("disk full");
            expect(exportDocumentToStep.mock.calls[0]![0]).toEqual(expect.objectContaining({ fileName: "model.step", compress: true, tryDownload: true }));
            expect(deleteDocument).toHaveBeenCalledTimes(1);
        });
    });
});
