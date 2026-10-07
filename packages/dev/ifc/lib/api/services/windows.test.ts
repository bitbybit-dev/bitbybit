import { describe, expect, it } from "vitest";
import type { Fixture } from "../../__test__/fixture-types";
import { addCentredWall, expressIdOf, groundFloor, notAModel, oneWall } from "../../__test__/build-setup";
import { bodyItemOf, boxOf, countOf, enumOf, firstOf, mapItemsOf, placementOf, refOf, relatedBy, relatingOf, representationMapOf, sweptAreaOf } from "../../__test__/build-geometry";
import type { IfcModel } from "../../model/model-types";

function withWindowType(): Fixture {
    const { ifc, model } = oneWall();
    return { ifc, model: ifc.windows.addType({ model, id: "window", name: "Window 1200", width: 1200, height: 1400 }) };
}

function openingFilledBy(model: IfcModel, filling: number): number {
    return firstOf(relatingOf(model, "IfcRelFillsElement", "RelatingOpeningElement", "RelatedBuildingElement", filling));
}

describe("IFCWindows.addType", () => {
    it("should add a window type with a frame of four members around one pane of glass", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.windows.addType({ model, id: "window", width: 1200, height: 1200, frameThickness: 60, frameDepth: 80, glassThickness: 24 });

        // Assert
        expect(mapItemsOf(changed, expressIdOf(changed, "window")).map((item) => boxOf(changed, item))).toEqual([
            [[0, 0, 0], [60, 80, 1200]],
            [[1140, 0, 0], [1200, 80, 1200]],
            [[60, 0, 0], [1140, 80, 60]],
            [[60, 0, 1140], [1140, 80, 1200]],
            [[60, 28, 60], [1140, 52, 1140]],
        ]);
    });

    it("should name the type and mark it a single panel window", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.windows.addType({ model, id: "window", name: "Casement" });

        // Assert
        const type = expressIdOf(changed, "window");
        expect(changed.typeOf(type)).toBe("IfcWindowType");
        expect(changed.attribute(type, "Name")).toBe("Casement");
        expect(enumOf(changed.attribute(type, "PredefinedType"))).toBe("WINDOW");
        expect(enumOf(changed.attribute(type, "PartitioningType"))).toBe("SINGLE_PANEL");
    });

    it("should name a window type Window by default", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.windows.addType({ model, id: "window" });

        // Assert
        expect(changed.attribute(expressIdOf(changed, "window"), "Name")).toBe("Window");
    });

    it("should refuse a frame whose two members are as wide as the window", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.windows.addType({ model, width: 120, frameThickness: 60 })).toThrow("The window's frame and glass do not fit inside its width, height and depth");
    });

    it("should refuse a frame whose two members are as high as the window", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.windows.addType({ model, height: 100, frameThickness: 60 })).toThrow("do not fit");
    });

    it("should refuse glass thicker than the frame is deep", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.windows.addType({ model, frameDepth: 80, glassThickness: 81 })).toThrow("do not fit");
    });

    it.each([
        ["width", { width: 0 }],
        ["height", { height: -1200 }],
        ["frame thickness", { frameThickness: 0 }],
        ["frame depth", { frameDepth: Number.NaN }],
        ["glass thickness", { glassThickness: -24 }],
    ])("should refuse a %s that is not more than zero", (what, sizes) => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.windows.addType({ model, ...sizes })).toThrow(`The ${what} must be more than zero`);
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const { ifc } = groundFloor();

        // Act & Assert
        expect(() => ifc.windows.addType({ model: notAModel() })).toThrow(TypeError);
    });
});

describe("IFCWindows.add", () => {
    it("should give the window its type's width and height", () => {
        // Arrange
        const { ifc, model } = withWindowType();

        // Act
        const changed = ifc.windows.add({ model, wall: "south", windowType: "window", id: "kitchen", offset: 3000 });

        // Assert
        const window = expressIdOf(changed, "kitchen");
        expect(changed.typeOf(window)).toBe("IfcWindow");
        expect(changed.attribute(window, "OverallWidth")).toBe(1200);
        expect(changed.attribute(window, "OverallHeight")).toBe(1400);
        expect(changed.attribute(window, "PartitioningType")).toBeNull();
    });

    it("should cut its opening 900 above the wall's base by default", () => {
        // Arrange
        const { ifc, model } = withWindowType();

        // Act
        const changed = ifc.windows.add({ model, wall: "south", windowType: "window", id: "kitchen", offset: 3000 });

        // Assert
        const opening = openingFilledBy(changed, expressIdOf(changed, "kitchen"));
        const profile = sweptAreaOf(changed, opening);
        expect(placementOf(changed, opening).location).toEqual([3000, 50, 900]);
        expect([changed.attribute(profile, "XDim"), changed.attribute(profile, "YDim")]).toEqual([1200, 1400]);
    });

    it("should cut its opening at the sill it is given", () => {
        // Arrange
        const { ifc, model } = withWindowType();

        // Act
        const changed = ifc.windows.add({ model, wall: "south", windowType: "window", id: "high", offset: 3000, sill: 1500 });

        // Assert
        expect(placementOf(changed, openingFilledBy(changed, expressIdOf(changed, "high"))).location).toEqual([3000, 50, 1500]);
    });

    it("should centre the window's frame in the wall's thickness", () => {
        // Arrange
        const { ifc, model } = withWindowType();

        // Act
        const changed = ifc.windows.add({ model, wall: "south", windowType: "window", id: "kitchen", offset: 3000 });

        // Assert
        const window = expressIdOf(changed, "kitchen");
        expect(placementOf(changed, window)).toEqual({
            relativeTo: refOf(changed.attribute(openingFilledBy(changed, window), "ObjectPlacement")),
            location: [0, -190, 0],
            axis: null,
            refDirection: null,
        });
    });

    it("should centre the frame in a thinner wall too", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = addCentredWall(ifc, ground, "inner", [0, 0], [6000, 0], 100);
        model = ifc.windows.addType({ model, id: "window" });

        // Act
        const changed = ifc.windows.add({ model, wall: "inner", windowType: "window", id: "borrowed" });

        // Assert
        const window = expressIdOf(changed, "borrowed");
        expect(placementOf(changed, openingFilledBy(changed, window)).location).toEqual([1000, 75, 900]);
        expect(placementOf(changed, window).location).toEqual([0, -115, 0]);
    });

    it("should show the window through its type's representation map, filling an opening in the wall", () => {
        // Arrange
        const { ifc, model } = withWindowType();

        // Act
        const changed = ifc.windows.add({ model, wall: "south", windowType: "window", id: "kitchen", offset: 3000 });

        // Assert
        const window = expressIdOf(changed, "kitchen");
        const opening = openingFilledBy(changed, window);
        expect(refOf(changed.attribute(bodyItemOf(changed, window), "MappingSource"))).toBe(representationMapOf(changed, expressIdOf(changed, "window")));
        expect(relatedBy(changed, "IfcRelVoidsElement", "RelatingBuildingElement", "RelatedOpeningElement", expressIdOf(changed, "south"))).toEqual([opening]);
        expect(relatedBy(changed, "IfcRelDefinesByType", "RelatingType", "RelatedObjects", expressIdOf(changed, "window"))).toEqual([window]);
    });

    it("should put the window in the storey of its wall", () => {
        // Arrange
        const { ifc, model } = withWindowType();

        // Act
        const changed = ifc.windows.add({ model, wall: "south", windowType: "window", id: "kitchen", offset: 3000 });

        // Assert
        expect(ifc.model.element({ model: changed, element: "kitchen" }).storey).toBe(ifc.model.globalIdOf({ model, id: "ground" }));
    });

    it("should share one representation map between windows of one type", () => {
        // Arrange
        const { ifc, model } = withWindowType();

        // Act
        let changed = ifc.windows.add({ model, wall: "south", windowType: "window", id: "a", offset: 1000 });
        changed = ifc.windows.add({ model: changed, wall: "south", windowType: "window", id: "b", offset: 4000 });
        changed = ifc.windows.add({ model: changed, wall: "south", windowType: "window", id: "c", offset: 7000 });

        // Assert
        expect(countOf(changed, "IfcRepresentationMap")).toBe(1);
        expect(countOf(changed, "IfcMappedItem")).toBe(3);
    });

    it("should refuse a window that does not fit along the wall", () => {
        // Arrange
        const { ifc, model } = withWindowType();

        // Act & Assert
        expect(() => ifc.windows.add({ model, wall: "south", windowType: "window", offset: 9000 })).toThrow("does not fit along the wall");
    });

    it("should refuse a door type in place of a window type", () => {
        // Arrange
        const { ifc, model: withWindow } = withWindowType();
        const model = ifc.doors.addType({ model: withWindow, id: "door" });

        // Act & Assert
        expect(() => ifc.windows.add({ model, wall: "south", windowType: "door" })).toThrow("'door' is an IfcDoorType, not a window type");
    });

    it("should refuse a window type the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = withWindowType();

        // Act & Assert
        expect(() => ifc.windows.add({ model, wall: "south", windowType: "skylight" })).toThrow("The model has no window type 'skylight'");
    });

    it("should refuse a wall the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = withWindowType();

        // Act & Assert
        expect(() => ifc.windows.add({ model, wall: "garden", windowType: "window" })).toThrow("The model has no wall 'garden'");
    });

    it("should leave the model it was given as it was", () => {
        // Arrange
        const { ifc, model } = withWindowType();

        // Act
        ifc.windows.add({ model, wall: "south", windowType: "window", id: "kitchen" });

        // Assert
        expect(countOf(model, "IfcWindow")).toBe(0);
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const { ifc } = groundFloor();

        // Act & Assert
        expect(() => ifc.windows.add({ model: notAModel(), wall: "south", windowType: "window" })).toThrow(TypeError);
    });
});
