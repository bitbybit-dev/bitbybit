import { describe, expect, it } from "vitest";
import { addCentredWall, addRightWall, expressIdOf, missingModel, notAModel, TIME_STAMP } from "../__test__/build-setup";
import { countOf, footprintOf, unwrapBody } from "../__test__/build-geometry";
import type { IfcModel } from "../model/model-types";
import { IFCService } from "./ifc-service";
import { IFCBeams, IFCColumns, IFCDoors, IFCMaterials, IFCModels, IFCOpenings, IFCProperties, IFCSlabs, IFCSpatial, IFCWalls, IFCWindows } from "./services";
import type { Base } from "@bitbybit-dev/base";

const STOREYS = ["ground", "first"];
const SIDES = ["south", "east", "north", "west"];
const LENGTH_ALONG_X = 10000;
const LENGTH_ALONG_Y = 8000;
const CORNERS: Base.Point2[] = [[0, 0], [LENGTH_ALONG_X, 0], [LENGTH_ALONG_X, LENGTH_ALONG_Y], [0, LENGTH_ALONG_Y]];
const EXTERIOR = STOREYS.flatMap((storey) => SIDES.map((side) => `${storey}-${side}`));

function storeyOfWalls(ifc: IFCService, start: IfcModel, storey: string): IfcModel {
    let model = start;
    SIDES.forEach((side, index) => {
        const from = CORNERS[index] ?? [0, 0];
        const to = CORNERS[(index + 1) % CORNERS.length] ?? [0, 0];
        model = addRightWall(ifc, model, `${storey}-${side}`, from, to, storey);
    });
    model = addCentredWall(ifc, model, `${storey}-partition`, [5000, 0], [5000, LENGTH_ALONG_Y], 100, storey);
    SIDES.forEach((side, index) => {
        model = ifc.walls.connect({ model, wall: `${storey}-${side}`, other: `${storey}-${SIDES[(index + 1) % SIDES.length] ?? ""}` });
    });
    model = ifc.walls.connect({ model, wall: `${storey}-partition`, other: `${storey}-south` });
    return ifc.walls.connect({ model, wall: `${storey}-partition`, other: `${storey}-north` });
}

function twoStoreyHouse(ifc: IFCService): IfcModel {
    let model = ifc.model.create({ name: "House", seed: "two-storey-house", author: "Tests" });
    model = ifc.spatial.addStorey({ model, id: "ground", name: "Ground floor", elevation: 0 });
    model = ifc.spatial.addStorey({ model, id: "first", name: "First floor", elevation: 3000 });
    model = ifc.materials.add({ model, name: "Concrete", category: "concrete", color: "#a0a0a0" });
    model = ifc.materials.add({ model, name: "Steel", category: "steel", color: "#5a6470" });
    model = STOREYS.reduce((house, storey) => storeyOfWalls(ifc, house, storey), model);
    model = ifc.doors.addType({ model, id: "door", name: "Door 900", width: 900, height: 2100 });
    model = ifc.windows.addType({ model, id: "window", name: "Window 1200", width: 1200, height: 1400 });
    model = ifc.doors.add({ model, wall: "ground-south", doorType: "door", id: "front-door", offset: 2000 });
    model = ifc.doors.add({ model, wall: "ground-north", doorType: "door", id: "back-door", offset: 6000 });
    model = ifc.doors.add({ model, wall: "ground-partition", doorType: "door", id: "inner-door", offset: 3000 });
    model = ifc.windows.add({ model, wall: "ground-east", windowType: "window", id: "kitchen", offset: 3000 });
    model = ifc.windows.add({ model, wall: "first-south", windowType: "window", id: "bedroom-1", offset: 1500 });
    model = ifc.windows.add({ model, wall: "first-south", windowType: "window", id: "bedroom-2", offset: 6500 });
    model = ifc.windows.add({ model, wall: "first-north", windowType: "window", id: "landing", offset: 4000, sill: 1000 });
    model = ifc.slabs.add({ model, storey: "first", id: "first-floor", outline: CORNERS, holes: [[[6000, 6000], [6000, 7500], [8000, 7500], [8000, 6000]]], thickness: 200 });
    model = ifc.columns.add({ model, storey: "ground", id: "column", position: [2500, 4000], height: 2800, material: "Concrete" });
    model = ifc.beams.add({ model, storey: "ground", id: "beam", start: [0, 4000, 2650], end: [5000, 4000, 2650], width: 150, depth: 300, material: "Steel" });
    model = ifc.properties.addSet({
        model,
        elements: EXTERIOR,
        name: "Pset_WallCommon",
        properties: [{ name: "IsExternal", value: true }, { name: "LoadBearing", value: true }, { name: "FireRating", value: "REI 60" }],
    });
    return ifc.walls.clipByPlane({ model, wall: "first-north", origin: [0, LENGTH_ALONG_Y, 2400], normal: [0, 1, 1] });
}

describe("IFCService", () => {
    it("should build a two-storey house with every kind of element it authors", () => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const model = twoStoreyHouse(ifc);

        // Assert
        const summary = ifc.model.summary({ model });
        expect(summary.schema).toBe("IFC4");
        expect(summary.project).toBe("House");
        expect(summary.elementCounts).toEqual({ IfcWall: 10, IfcDoor: 3, IfcWindow: 4, IfcOpeningElement: 7, IfcSlab: 1, IfcColumn: 1, IfcBeam: 1 });
        expect(summary.storeys.map((storey) => [storey.name, storey.elevation])).toEqual([["Ground floor", 0], ["First floor", 3000]]);
    });

    it("should write the house the same twice, and the same again from its own file", () => {
        // Arrange
        const ifc = new IFCService();
        const model = twoStoreyHouse(ifc);

        // Act
        const first = ifc.model.write({ model, fileName: "house.ifc", timeStamp: TIME_STAMP });
        const second = ifc.model.write({ model, fileName: "house.ifc", timeStamp: TIME_STAMP });
        const rebuilt = ifc.model.write({ model: twoStoreyHouse(new IFCService()), fileName: "house.ifc", timeStamp: TIME_STAMP });
        const reread = ifc.model.write({ model: ifc.model.read({ data: first }), fileName: "house.ifc", timeStamp: TIME_STAMP });

        // Assert
        expect(second).toBe(first);
        expect(rebuilt).toBe(first);
        expect(reread).toBe(first);
    });

    it("should mitre every exterior corner of the house and keep the partitions between the inner faces", () => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const model = twoStoreyHouse(ifc);

        // Assert
        for (const storey of STOREYS) {
            for (const side of SIDES) {
                const length = side === "south" || side === "north" ? LENGTH_ALONG_X : LENGTH_ALONG_Y;
                expect(footprintOf(model, expressIdOf(model, `${storey}-${side}`))).toEqual([[-200, -200], [length + 200, -200], [length, 0], [0, 0]]);
            }
            expect(footprintOf(model, expressIdOf(model, `${storey}-partition`))).toEqual([[0, -50], [LENGTH_ALONG_Y, -50], [LENGTH_ALONG_Y, 50], [0, 50]]);
        }
        expect(countOf(model, "IfcRelConnectsPathElements")).toBe(12);
    });

    it("should keep only the geometry the house shows, however often its walls were rebuilt", () => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const model = twoStoreyHouse(ifc);

        // Assert
        expect(countOf(model, "IfcShapeRepresentation")).toBe(39);
        expect(countOf(model, "IfcExtrudedAreaSolid")).toBe(29);
        expect(countOf(model, "IfcRepresentationMap")).toBe(2);
        expect(unwrapBody(model, expressIdOf(model, "first-north")).clippings).toHaveLength(1);
        expect(countOf(model, "IfcBooleanClippingResult")).toBe(1);
    });

    it("should hold each element on its storey", () => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const model = twoStoreyHouse(ifc);

        // Assert
        const ground = ifc.model.elements({ model, storey: "ground" }).map((element) => element.type);
        const first = ifc.model.elements({ model, storey: "first" }).map((element) => element.type);
        expect(ground.sort()).toEqual(["IfcBeam", "IfcColumn", "IfcDoor", "IfcDoor", "IfcDoor", "IfcWall", "IfcWall", "IfcWall", "IfcWall", "IfcWall", "IfcWindow"]);
        expect(first.sort()).toEqual(["IfcSlab", "IfcWall", "IfcWall", "IfcWall", "IfcWall", "IfcWall", "IfcWindow", "IfcWindow", "IfcWindow"]);
    });

    it("should describe every exterior wall by one shared property set", () => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const model = twoStoreyHouse(ifc);

        // Assert
        expect(countOf(model, "IfcPropertySet")).toBe(1);
        for (const wall of EXTERIOR) {
            expect(ifc.properties.getSets({ model, element: wall })).toEqual([{ name: "Pset_WallCommon", properties: { IsExternal: true, LoadBearing: true, FireRating: "REI 60" } }]);
        }
        expect(ifc.properties.getSets({ model, element: "ground-partition" })).toEqual([]);
    });

    it("should give each of its services as a member", () => {
        // Act
        const ifc = new IFCService();

        // Assert
        expect([ifc.model, ifc.spatial, ifc.materials, ifc.walls, ifc.openings, ifc.doors, ifc.windows, ifc.slabs, ifc.columns, ifc.beams, ifc.properties].map((service) => service.constructor))
            .toEqual([IFCModels, IFCSpatial, IFCMaterials, IFCWalls, IFCOpenings, IFCDoors, IFCWindows, IFCSlabs, IFCColumns, IFCBeams, IFCProperties]);
    });
});

describe("IFCService methods given no model", () => {
    const ifc = new IFCService();
    const calls: [string, (model: IfcModel) => unknown][] = [
        ["model.write", (model) => ifc.model.write({ model })],
        ["model.summary", (model) => ifc.model.summary({ model })],
        ["model.elements", (model) => ifc.model.elements({ model })],
        ["model.element", (model) => ifc.model.element({ model, element: "south" })],
        ["model.setAttribute", (model) => ifc.model.setAttribute({ model, element: "south", value: "South" })],
        ["model.globalIdOf", (model) => ifc.model.globalIdOf({ model, id: "south" })],
        ["spatial.addStorey", (model) => ifc.spatial.addStorey({ model, id: "ground" })],
        ["spatial.storeys", (model) => ifc.spatial.storeys({ model })],
        ["materials.add", (model) => ifc.materials.add({ model, name: "Brick" })],
        ["materials.addLayerSet", (model) => ifc.materials.addLayerSet({ model, layers: [{ thickness: 100 }] })],
        ["walls.add", (model) => ifc.walls.add({ model, storey: "ground", start: [0, 0], end: [1000, 0] })],
        ["walls.connect", (model) => ifc.walls.connect({ model, wall: "south", other: "east" })],
        ["walls.clipByPlane", (model) => ifc.walls.clipByPlane({ model, wall: "south", origin: [0, 0, 2600] })],
        ["walls.addType", (model) => ifc.walls.addType({ model, layerSet: "Exterior" })],
        ["openings.add", (model) => ifc.openings.add({ model, wall: "south" })],
        ["doors.addType", (model) => ifc.doors.addType({ model })],
        ["doors.add", (model) => ifc.doors.add({ model, wall: "south", doorType: "door" })],
        ["windows.addType", (model) => ifc.windows.addType({ model })],
        ["windows.add", (model) => ifc.windows.add({ model, wall: "south", windowType: "window" })],
        ["slabs.add", (model) => ifc.slabs.add({ model, storey: "ground", outline: CORNERS })],
        ["columns.add", (model) => ifc.columns.add({ model, storey: "ground" })],
        ["beams.add", (model) => ifc.beams.add({ model, storey: "ground", start: [0, 0, 0], end: [1000, 0, 0] })],
        ["properties.addSet", (model) => ifc.properties.addSet({ model, elements: ["south"], properties: [{ name: "IsExternal", value: true }] })],
        ["properties.getSets", (model) => ifc.properties.getSets({ model, element: "south" })],
    ];

    it.each(calls)("should refuse %s without a model with a TypeError", (_name, call) => {
        // Act & Assert
        expect(() => call(missingModel())).toThrow(TypeError);
    });

    it.each(calls)("should refuse %s a model pointer that is not a model with a TypeError", (_name, call) => {
        // Act & Assert
        expect(() => call(notAModel())).toThrow("Expected an IFC model, as `model.create` or `model.read` return");
    });
});
