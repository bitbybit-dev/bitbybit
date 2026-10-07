import { describe, expect, it } from "vitest";
import { expressIdOf, groundFloor, oneWall, writingInto } from "../../__test__/build-setup";
import { countOf, extrusionOf, layerThicknessesOf, materialOf, placementOf, refsOf } from "../../__test__/build-geometry";
import { bodyContext } from "../../build/contexts";
import type { IfcModel } from "../../model/model-types";
import { enumValue, ref } from "../../step/values";
import { IFCService } from "../ifc-service";
import * as Inputs from "../inputs";

function withCentredDoorType(boxFirst: boolean): IfcModel {
    const { model } = oneWall();
    const { tx, writer } = writingInto(model);
    const context = bodyContext(tx, writer);
    const profile = writer.create("IfcRectangleProfileDef", { ProfileType: enumValue("AREA"), XDim: 900, YDim: 2100 });
    const panel = writer.extrusion(profile, { origin: [0, -25, 1050], z: [0, 1, 0], x: [1, 0, 0], y: [0, 0, -1] }, 50);
    const body = writer.shapeRepresentation(context, "Body", "SweptSolid", [panel]);
    const bodyMap = writer.create("IfcRepresentationMap", { MappingOrigin: ref(writer.placement3({ origin: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] })), MappedRepresentation: ref(body) });
    const boxProfile = writer.create("IfcRectangleProfileDef", { ProfileType: enumValue("AREA"), XDim: 5000, YDim: 5000 });
    const box = writer.shapeRepresentation(context, "Box", "SweptSolid", [writer.extrusion(boxProfile, { origin: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }, 5000)]);
    const boxMap = writer.create("IfcRepresentationMap", { MappingOrigin: ref(writer.placement3({ origin: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] })), MappedRepresentation: ref(box) });
    writer.create("IfcDoorType", {
        GlobalId: tx.globalId("centred"),
        Name: "Centred door",
        RepresentationMaps: (boxFirst ? [boxMap, bodyMap] : [bodyMap]).map(ref),
        PredefinedType: enumValue("DOOR"),
        OperationType: enumValue("SINGLE_SWING_LEFT"),
    });
    return tx.commit();
}

describe("doors of a type another tool drew", () => {
    it("should size the door from its type's geometry through every placement and set it inside its opening", () => {
        // Arrange
        const model = withCentredDoorType(false);
        const ifc = new IFCService();

        // Act
        const changed = ifc.doors.add({ model, wall: "south", doorType: "centred", id: "front", offset: 1000 });

        // Assert
        const door = expressIdOf(changed, "front");
        expect([changed.attribute(door, "OverallWidth"), changed.attribute(door, "OverallHeight")]).toEqual([900, 2100]);
        expect(placementOf(changed, door).location[0]).toBe(450);
        expect(placementOf(changed, door).location[2]).toBe(0);
    });

    it("should size the door from its type's Body map when the type has other maps first", () => {
        // Arrange
        const model = withCentredDoorType(true);
        const ifc = new IFCService();

        // Act
        const changed = ifc.doors.add({ model, wall: "south", doorType: "centred", id: "front", offset: 1000 });

        // Assert
        expect(changed.attribute(expressIdOf(changed, "front"), "OverallWidth")).toBe(900);
    });
});

describe("property sets on types", () => {
    it("should attach a set to a type through its own HasPropertySets and read it back", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.materials.addLayerSet({ model: ground, name: "Brick", layers: [{ thickness: 250 }] });
        model = ifc.walls.addType({ model, id: "brick", name: "Brick wall", layerSet: "Brick" });

        // Act
        const changed = ifc.properties.addSet({ model, elements: ["brick"], name: "Pset_WallCommon", properties: [{ name: "IsExternal", value: true }] });

        // Assert
        const type = expressIdOf(changed, "brick");
        expect(refsOf(changed.attribute(type, "HasPropertySets"))).toHaveLength(1);
        expect(countOf(changed, "IfcRelDefinesByProperties")).toBe(0);
        expect(ifc.properties.getSets({ model: changed, element: "brick" })).toEqual([{ name: "Pset_WallCommon", properties: { IsExternal: true } }]);
    });
});

describe("defaults in a model written in metres", () => {
    it("should give a wall its default height and thickness in metres", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.spatial.addStorey({ model: ifc.model.create({ seed: "metres", lengthUnit: Inputs.IFC.lengthUnitEnum.metre }), id: "ground" });

        // Act
        const changed = ifc.walls.add({ model, storey: "ground", id: "south", start: [0, 0], end: [10, 0] });

        // Assert
        const wall = expressIdOf(changed, "south");
        expect(extrusionOf(changed, wall).depth).toBe(3);
        expect(layerThicknessesOf(changed, refsOf([changed.attribute(materialOf(changed, wall), "ForLayerSet")])[0]!)).toEqual([0.2]);
    });

    it("should make a door type of default sizes in metres that fits together", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.create({ seed: "metres", lengthUnit: Inputs.IFC.lengthUnitEnum.metre });

        // Act
        const changed = ifc.doors.addType({ model, id: "door" });

        // Assert
        expect(countOf(changed, "IfcDoorType")).toBe(1);
    });
});

describe("slab outlines", () => {
    it("should take an outline whose last point repeats its first", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.slabs.add({ model, storey: "ground", id: "floor", outline: [[0, 0], [4000, 0], [4000, 3000], [0, 3000], [0, 0]] });

        // Assert
        expect(countOf(changed, "IfcSlab")).toBe(1);
    });

    it("should refuse an outline that repeats a point and a hole that reaches outside", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.slabs.add({ model, storey: "ground", outline: [[0, 0], [4000, 0], [4000, 0], [4000, 3000], [0, 3000]] })).toThrow("repeats its point 1 at 2");
        expect(() => ifc.slabs.add({ model, storey: "ground", outline: [[0, 0], [4000, 0], [4000, 3000], [0, 3000]], holes: [[[3000, 1000], [5000, 1000], [5000, 2000], [3000, 2000]]] })).toThrow("Hole 0 reaches outside the slab's outline");
    });
});

describe("IFCModels.getAttribute and read", () => {
    it("should read back an attribute that was set, and the name by default", () => {
        // Arrange
        const { ifc, model: plain } = oneWall();
        const model = ifc.model.setAttribute({ model: ifc.model.setAttribute({ model: plain, element: "south", value: "South wall" }), element: "south", attribute: "Description", value: "Load bearing" });

        // Act
        const values = [ifc.model.getAttribute({ model, element: "south", attribute: "Description" }), ifc.model.getAttribute({ model, element: "south" })];

        // Assert
        expect(values).toEqual(["Load bearing", "South wall"]);
    });

    it("should read a file handed over as an ArrayBuffer", () => {
        // Arrange
        const { ifc, model } = oneWall();
        const buffer = new TextEncoder().encode(ifc.model.write({ model, timeStamp: "2026-10-07T12:00:00" })).buffer;

        // Act
        const back = ifc.model.read({ data: buffer });

        // Assert
        expect(ifc.model.summary({ model: back }).elementCounts).toEqual({ IfcWall: 1 });
    });
});
