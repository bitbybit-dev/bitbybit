import { describe, expect, it } from "vitest";
import { classLabelOf } from "./groups";

describe("classLabelOf", () => {
    it.each([
        ["IfcWall", "Walls"],
        ["IfcElementAssembly", "Element assemblies"],
        ["IfcBuildingElementProxy", "Building element proxies"],
        ["IfcStairFlight", "Stair flights"],
        ["IfcGeographicElement", "Geographic elements"],
        ["IfcChimney", "Chimneys"],
        ["IfcFurniture", "Furniture"],
        ["IfcSwitchingDevice", "Switching devices"],
        ["IfcBeam", "Beams"],
        ["IfcSwitch", "Switches"],
    ])("should list %s as %s", (type, label) => {
        // Act
        const listed = classLabelOf(type);

        // Assert
        expect(listed).toBe(label);
    });
});
