import { describe, expect, it } from "vitest";
import { OTHER_TOOL_FILE, STOREY_ROW, WALL_A, WALL_B } from "../__test__/other-tool-file";
import { footprintOf, rounded } from "../__test__/build-geometry";
import type { IfcModel } from "../model/model-types";
import { IFCService } from "./ifc-service";

function edited(ifc: IFCService): IfcModel {
    let model = ifc.model.read({ data: OTHER_TOOL_FILE });
    model = ifc.walls.connect({ model, wall: WALL_A, other: WALL_B });
    model = ifc.doors.addType({ model, id: "door", width: 0.9, height: 2.1 });
    model = ifc.doors.add({ model, wall: WALL_A, doorType: "door", id: "entrance", offset: 1 });
    return ifc.model.setAttribute({ model, element: WALL_B, attribute: "Description", value: "Load bearing" });
}

describe("a file another tool wrote, in metres", () => {
    it("should join its walls, which lay their layers in the negative sense, at a mitred corner", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: OTHER_TOOL_FILE });

        // Act
        const joined = ifc.walls.connect({ model, wall: WALL_A, other: WALL_B });

        // Assert
        expect(rounded(footprintOf(joined, joined.byGlobalId(WALL_A)!))).toEqual([[0, -0.3], [6.3, -0.3], [6, 0], [0, 0]]);
        expect(rounded(footprintOf(joined, joined.byGlobalId(WALL_B)!))).toEqual([[-0.3, -0.3], [4, -0.3], [4, 0], [0, 0]]);
    });

    it("should take a door, a property and an attribute and write every row it did not touch as the file wrote it", () => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const written = ifc.model.write({ model: edited(ifc), timeStamp: "2026-10-07T12:00:00" });

        // Assert
        expect(written).toContain(STOREY_ROW);
        expect(written).toContain("#28=IFCRELAGGREGATES('0Aggregates00000000003',$,$,$,#22,(#24));\r\n/* a wall along X");
        const back = ifc.model.read({ data: written });
        expect(ifc.model.summary({ model: back }).elementCounts).toEqual({ IfcDoor: 1, IfcOpeningElement: 1, IfcWallStandardCase: 2 });
        expect(ifc.model.getAttribute({ model: back, element: WALL_B, attribute: "Description" })).toBe("Load bearing");
    });

    it("should describe the edited model's walls and door as solids in millimetres", () => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const recipe = ifc.geometry.recipe({ model: edited(ifc) });

        // Assert
        expect(recipe.millimetresPerUnit).toBe(1000);
        expect(recipe.roots.map((root) => root.tag["type"]).sort()).toEqual(["IfcDoor", "IfcWallStandardCase", "IfcWallStandardCase"]);
    });
});
