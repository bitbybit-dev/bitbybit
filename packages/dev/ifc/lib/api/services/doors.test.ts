import { describe, expect, it } from "vitest";
import type { Fixture } from "../../__test__/fixture-types";
import { expressIdOf, groundFloor, notAModel, oneWall, oneWallWithMaterials } from "../../__test__/build-setup";
import {
    bodyItemOf, bodyOf, boxOf, constituentsOf, countOf, enumOf, firstOf, mapItemsOf, onlyOf, placementOf, refOf, relatedBy, relatingOf, representationMapOf, styleNamesOf, sweptAreaOf,
} from "../../__test__/build-geometry";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";

function withDoorType(): Fixture {
    const { ifc, model } = oneWall();
    return { ifc, model: ifc.doors.addType({ model, id: "door", name: "Door 1000", width: 1000, height: 2200 }) };
}

function openingFilledBy(model: IfcModel, filling: number): number {
    return firstOf(relatingOf(model, "IfcRelFillsElement", "RelatingOpeningElement", "RelatedBuildingElement", filling));
}

describe("IFCDoors.addType", () => {
    it("should add a door type with a lining of two sides and a head around one panel", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.doors.addType({ model, id: "door", width: 900, height: 2100, liningThickness: 50, liningDepth: 100, panelThickness: 40 });

        // Assert
        const type = expressIdOf(changed, "door");
        expect(mapItemsOf(changed, type).map((item) => boxOf(changed, item))).toEqual([
            [[0, 0, 0], [50, 100, 2100]],
            [[850, 0, 0], [900, 100, 2100]],
            [[50, 0, 2050], [850, 100, 2100]],
            [[50, 30, 0], [850, 70, 2050]],
        ]);
    });

    it("should name the type, mark it a door and record how it opens", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.doors.addType({ model, id: "door", name: "Front door", operation: Inputs.IFC.doorOperationEnum.doubleSwingRight });

        // Assert
        const type = expressIdOf(changed, "door");
        expect(changed.typeOf(type)).toBe("IfcDoorType");
        expect(changed.attribute(type, "Name")).toBe("Front door");
        expect(enumOf(changed.attribute(type, "PredefinedType"))).toBe("DOOR");
        expect(enumOf(changed.attribute(type, "OperationType"))).toBe("DOUBLE_SWING_RIGHT");
    });

    it("should name a door type Door, swinging left, by default", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.doors.addType({ model, id: "door" });

        // Assert
        const type = expressIdOf(changed, "door");
        expect(changed.attribute(type, "Name")).toBe("Door");
        expect(enumOf(changed.attribute(type, "OperationType"))).toBe("SINGLE_SWING_LEFT");
    });

    it("should map the type's geometry from the origin and declare the type in the project", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.doors.addType({ model, id: "door" });

        // Assert
        const type = expressIdOf(changed, "door");
        const map = representationMapOf(changed, type);
        const origin = refOf(changed.attribute(map, "MappingOrigin"));
        expect(changed.attribute(refOf(changed.attribute(origin, "Location")), "Coordinates")).toEqual([0, 0, 0]);
        expect(changed.attribute(refOf(changed.attribute(map, "MappedRepresentation")), "RepresentationType")).toBe("SweptSolid");
        expect(relatedBy(changed, "IfcRelDeclares", "RelatingContext", "RelatedDefinitions", onlyOf(changed, "IfcProject"))).toEqual([type]);
    });

    it("should style the lining and the panel with their materials' colours, and give the type both materials as lining and panel", () => {
        // Arrange
        const { ifc, model } = oneWallWithMaterials();

        // Act
        const changed = ifc.doors.addType({ model, id: "door", liningMaterial: "Aluminium", panelMaterial: "Glass" });

        // Assert
        const type = expressIdOf(changed, "door");
        expect(styleNamesOf(changed, mapItemsOf(changed, type))).toEqual(["Aluminium", "Aluminium", "Aluminium", "Glass"]);
        expect(constituentsOf(changed, type)).toEqual([["Lining", "Aluminium"], ["Panel", "Glass"]]);
    });

    it("should give a door only the panel's material when no lining material is named", () => {
        // Arrange
        const { ifc, model } = oneWallWithMaterials();

        // Act
        const changed = ifc.doors.addType({ model, id: "door", panelMaterial: "Oak" });

        // Assert
        const type = expressIdOf(changed, "door");
        expect(styleNamesOf(changed, mapItemsOf(changed, type))).toEqual([undefined, undefined, undefined, undefined]);
        expect(constituentsOf(changed, type)).toEqual([["Panel", "Oak"]]);
    });

    it("should put a lever handle on both faces near the edge away from the hinges, at hand height", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const left = ifc.doors.addType({ model, id: "left", width: 900, height: 2100, liningThickness: 50, liningDepth: 100, panelThickness: 40, handle: Inputs.IFC.doorHandleEnum.lever });
        const right = ifc.doors.addType({ model: left, id: "right", width: 900, height: 2100, liningThickness: 50, liningDepth: 100, panelThickness: 40, handle: Inputs.IFC.doorHandleEnum.lever, operation: Inputs.IFC.doorOperationEnum.singleSwingRight });

        // Assert
        expect(mapItemsOf(right, expressIdOf(right, "left")).slice(4).map((item) => boxOf(right, item))).toEqual([
            [[765, -15, 1040], [785, 30, 1060]],
            [[645, -35, 1040], [785, -15, 1060]],
            [[765, 70, 1040], [785, 115, 1060]],
            [[645, 115, 1040], [785, 135, 1060]],
        ]);
        expect(mapItemsOf(right, expressIdOf(right, "right")).slice(4).map((item) => boxOf(right, item)[0]![0])).toEqual([115, 115, 115, 115]);
    });

    it("should put a pull bar on standoff posts on both faces, as long as the door allows", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.doors.addType({ model, id: "door", width: 1300, height: 2700, liningThickness: 60, liningDepth: 120, panelThickness: 50, handle: Inputs.IFC.doorHandleEnum.pullBar });

        // Assert
        const hardware = mapItemsOf(changed, expressIdOf(changed, "door")).slice(4).map((item) => boxOf(changed, item));
        expect(hardware).toHaveLength(6);
        expect(hardware[2]).toEqual([[1150, -45, 500], [1180, -15, 1700]]);
        expect(hardware[5]).toEqual([[1150, 135, 500], [1180, 165, 1700]]);
    });

    it("should lower a lever on a door too low for hand height, keeping it under the head", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.doors.addType({ model, id: "hatch", width: 600, height: 1000, liningThickness: 50, liningDepth: 100, panelThickness: 40, handle: Inputs.IFC.doorHandleEnum.lever });

        // Assert
        const heights = mapItemsOf(changed, expressIdOf(changed, "hatch")).slice(4).map((item) => [boxOf(changed, item)[0]![2], boxOf(changed, item)[1]![2]]);
        expect(heights).toEqual([[920, 940], [920, 940], [920, 940], [920, 940]]);
    });

    it("should shorten a pull bar on a low door and centre it on the door", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.doors.addType({ model, id: "door", width: 900, height: 2000, liningThickness: 60, liningDepth: 120, panelThickness: 50, handle: Inputs.IFC.doorHandleEnum.pullBar });

        // Assert
        const bar = boxOf(changed, mapItemsOf(changed, expressIdOf(changed, "door"))[6]!);
        expect([bar[0]![2], bar[1]![2]]).toEqual([550, 1450]);
    });

    it("should keep a door's opening as wide and high as its type when its handles stand off the panel", () => {
        // Arrange
        const { ifc, model } = oneWall();
        const typed = ifc.doors.addType({ model, id: "door", width: 1000, height: 2200, handle: Inputs.IFC.doorHandleEnum.pullBar });

        // Act
        const changed = ifc.doors.add({ model: typed, wall: "south", doorType: "door", id: "entrance", offset: 2000 });

        // Assert
        const door = expressIdOf(changed, "entrance");
        expect([changed.attribute(door, "OverallWidth"), changed.attribute(door, "OverallHeight")]).toEqual([1000, 2200]);
    });

    it("should give the handle its material as hardware", () => {
        // Arrange
        const { ifc, model } = oneWallWithMaterials();

        // Act
        const changed = ifc.doors.addType({ model, id: "door", handle: Inputs.IFC.doorHandleEnum.lever, handleMaterial: "Aluminium", panelMaterial: "Oak" });

        // Assert
        const type = expressIdOf(changed, "door");
        expect(styleNamesOf(changed, mapItemsOf(changed, type)).slice(4)).toEqual(["Aluminium", "Aluminium", "Aluminium", "Aluminium"]);
        expect(constituentsOf(changed, type)).toEqual([["Panel", "Oak"], ["Hardware", "Aluminium"]]);
    });

    it("should refuse a lining material the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = oneWallWithMaterials();

        // Act & Assert
        expect(() => ifc.doors.addType({ model, liningMaterial: "Bronze" })).toThrow("The model has no material named 'Bronze'");
    });

    it("should refuse a lining whose two sides are as wide as the door", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.doors.addType({ model, width: 900, liningThickness: 450 })).toThrow("The door's lining and panel do not fit inside its width, height and depth");
    });

    it("should refuse a lining head as high as the door", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.doors.addType({ model, height: 50, liningThickness: 50 })).toThrow("do not fit");
    });

    it("should refuse a panel thicker than the lining is deep", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.doors.addType({ model, liningDepth: 100, panelThickness: 120 })).toThrow("do not fit");
    });

    it("should accept a panel exactly as thick as the lining is deep", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.doors.addType({ model, id: "flush", liningDepth: 100, panelThickness: 100 });

        // Assert
        expect(countOf(changed, "IfcDoorType")).toBe(1);
    });

    it.each([
        ["width", { width: 0 }],
        ["height", { height: -1 }],
        ["lining thickness", { liningThickness: 0 }],
        ["lining depth", { liningDepth: Number.NaN }],
        ["panel thickness", { panelThickness: Infinity }],
    ])("should refuse a %s that is not more than zero", (what, sizes) => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.doors.addType({ model, ...sizes })).toThrow(`The ${what} must be more than zero`);
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const { ifc } = groundFloor();

        // Act & Assert
        expect(() => ifc.doors.addType({ model: notAModel() })).toThrow(TypeError);
    });
});

describe("IFCDoors.add", () => {
    it("should give the door its type's width and height", () => {
        // Arrange
        const { ifc, model } = withDoorType();

        // Act
        const changed = ifc.doors.add({ model, wall: "south", doorType: "door", id: "front", offset: 2000 });

        // Assert
        const door = expressIdOf(changed, "front");
        expect(changed.typeOf(door)).toBe("IfcDoor");
        expect(changed.attribute(door, "OverallWidth")).toBe(1000);
        expect(changed.attribute(door, "OverallHeight")).toBe(2200);
        expect(changed.attribute(door, "PredefinedType")).toBeNull();
        expect(changed.attribute(door, "OperationType")).toBeNull();
    });

    it("should show the door through a mapped item of its type's representation map", () => {
        // Arrange
        const { ifc, model } = withDoorType();

        // Act
        const changed = ifc.doors.add({ model, wall: "south", doorType: "door", id: "front", offset: 2000 });

        // Assert
        const door = expressIdOf(changed, "front");
        const item = bodyItemOf(changed, door);
        const target = refOf(changed.attribute(item, "MappingTarget"));
        expect(changed.typeOf(item)).toBe("IfcMappedItem");
        expect(refOf(changed.attribute(item, "MappingSource"))).toBe(representationMapOf(changed, expressIdOf(changed, "door")));
        expect(changed.attribute(bodyOf(changed, door), "RepresentationType")).toBe("MappedRepresentation");
        expect(changed.typeOf(target)).toBe("IfcCartesianTransformationOperator3D");
    });

    it("should cut an opening as wide and high as the type where the door goes", () => {
        // Arrange
        const { ifc, model } = withDoorType();

        // Act
        const changed = ifc.doors.add({ model, wall: "south", doorType: "door", id: "front", offset: 2000, sill: 150 });

        // Assert
        const opening = openingFilledBy(changed, expressIdOf(changed, "front"));
        const profile = sweptAreaOf(changed, opening);
        expect(changed.typeOf(opening)).toBe("IfcOpeningElement");
        expect([changed.attribute(profile, "XDim"), changed.attribute(profile, "YDim")]).toEqual([1000, 2200]);
        expect(placementOf(changed, opening).location).toEqual([2000, 50, 150]);
    });

    it("should fill the opening with the door and void the wall with the opening", () => {
        // Arrange
        const { ifc, model } = withDoorType();

        // Act
        const changed = ifc.doors.add({ model, wall: "south", doorType: "door", id: "front", offset: 2000 });

        // Assert
        const opening = openingFilledBy(changed, expressIdOf(changed, "front"));
        expect(relatedBy(changed, "IfcRelFillsElement", "RelatingOpeningElement", "RelatedBuildingElement", opening)).toEqual([expressIdOf(changed, "front")]);
        expect(relatedBy(changed, "IfcRelVoidsElement", "RelatingBuildingElement", "RelatedOpeningElement", expressIdOf(changed, "south"))).toEqual([opening]);
    });

    it("should centre the door in the wall's thickness, placed relative to its opening", () => {
        // Arrange
        const { ifc, model } = withDoorType();

        // Act
        const changed = ifc.doors.add({ model, wall: "south", doorType: "door", id: "front", offset: 2000 });

        // Assert
        const door = expressIdOf(changed, "front");
        const opening = openingFilledBy(changed, door);
        expect(placementOf(changed, door)).toEqual({
            relativeTo: refOf(changed.attribute(opening, "ObjectPlacement")),
            location: [0, -200, 0],
            axis: null,
            refDirection: null,
        });
    });

    it("should put the door in the storey of its wall", () => {
        // Arrange
        const { ifc, model } = withDoorType();

        // Act
        const changed = ifc.doors.add({ model, wall: "south", doorType: "door", id: "front", offset: 2000 });

        // Assert
        expect(ifc.model.element({ model: changed, element: "front" }).storey).toBe(ifc.model.globalIdOf({ model, id: "ground" }));
    });

    it("should share one representation map between two doors of one type", () => {
        // Arrange
        const { ifc, model } = withDoorType();

        // Act
        let changed = ifc.doors.add({ model, wall: "south", doorType: "door", id: "front", offset: 2000 });
        changed = ifc.doors.add({ model: changed, wall: "south", doorType: "door", id: "back", offset: 6000 });

        // Assert
        const map = representationMapOf(changed, expressIdOf(changed, "door"));
        expect(countOf(changed, "IfcRepresentationMap")).toBe(1);
        expect(["front", "back"].map((id) => refOf(changed.attribute(bodyItemOf(changed, expressIdOf(changed, id)), "MappingSource")))).toEqual([map, map]);
        expect(countOf(changed, "IfcOpeningElement")).toBe(2);
    });

    it("should define every door of a type by that type", () => {
        // Arrange
        const { ifc, model } = withDoorType();

        // Act
        let changed = ifc.doors.add({ model, wall: "south", doorType: "door", id: "front", offset: 2000 });
        changed = ifc.doors.add({ model: changed, wall: "south", doorType: "door", id: "back", offset: 6000 });

        // Assert
        expect(relatedBy(changed, "IfcRelDefinesByType", "RelatingType", "RelatedObjects", expressIdOf(changed, "door")))
            .toEqual([expressIdOf(changed, "front"), expressIdOf(changed, "back")]);
    });

    it("should place a door 1000 from the wall's start at its base by default", () => {
        // Arrange
        const { ifc, model } = withDoorType();

        // Act
        const changed = ifc.doors.add({ model, wall: "south", doorType: "door", id: "front" });

        // Assert
        expect(placementOf(changed, openingFilledBy(changed, expressIdOf(changed, "front"))).location).toEqual([1000, 50, 0]);
    });

    it("should refuse a door that does not fit along the wall", () => {
        // Arrange
        const { ifc, model } = withDoorType();

        // Act & Assert
        expect(() => ifc.doors.add({ model, wall: "south", doorType: "door", offset: 9500 })).toThrow("does not fit along the wall");
    });

    it("should leave the model it was given as it was", () => {
        // Arrange
        const { ifc, model } = withDoorType();

        // Act
        ifc.doors.add({ model, wall: "south", doorType: "door", id: "front" });

        // Assert
        expect(countOf(model, "IfcDoor")).toBe(0);
        expect(countOf(model, "IfcOpeningElement")).toBe(0);
    });

    it("should refuse a window type in place of a door type", () => {
        // Arrange
        const { ifc, model: withDoor } = withDoorType();
        const model = ifc.windows.addType({ model: withDoor, id: "window" });

        // Act & Assert
        expect(() => ifc.doors.add({ model, wall: "south", doorType: "window" })).toThrow("'window' is an IfcWindowType, not a door type");
    });

    it("should refuse a door type the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = withDoorType();

        // Act & Assert
        expect(() => ifc.doors.add({ model, wall: "south", doorType: "barn" })).toThrow("The model has no door type 'barn'");
    });

    it("should refuse a wall the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = withDoorType();

        // Act & Assert
        expect(() => ifc.doors.add({ model, wall: "garden", doorType: "door" })).toThrow("The model has no wall 'garden'");
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const { ifc } = groundFloor();

        // Act & Assert
        expect(() => ifc.doors.add({ model: notAModel(), wall: "south", doorType: "door" })).toThrow(TypeError);
    });
});
