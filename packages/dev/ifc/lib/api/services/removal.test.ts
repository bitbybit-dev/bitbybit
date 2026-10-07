import { describe, expect, it } from "vitest";
import type { Fixture } from "../../__test__/fixture-types";
import { addCentredWall, addRightWall, errorFrom, expressIdOf, groundFloor, oneWall, writingInto } from "../../__test__/build-setup";
import { bodySolidOf, countOf, footprintOf, refsOf, relatedBy, representationNamed, representationsOf } from "../../__test__/build-geometry";
import { MATERIAL_ASSOCIATION } from "../../build/constants";
import { detach } from "../../build/relationships";
import { enumValue, ref, textValue } from "../../step/values";
import { OTHER_TOOL_FILE, WALL_A, WALL_B } from "../../__test__/other-tool-file";
import type { IfcModel } from "../../model/model-types";
import { IFCService } from "../ifc-service";

const CONTEXTS = new Set(["IfcGeometricRepresentationContext", "IfcGeometricRepresentationSubContext"]);

function typeCounts(model: IfcModel): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const id of model.ids()) {
        const type = model.typeOf(id) ?? "";
        if (!CONTEXTS.has(type)) {
            counts[type] = (counts[type] ?? 0) + 1;
        }
    }
    return counts;
}

function keptLayerSet(ifc: IFCService, model: IfcModel): IfcModel {
    return ifc.materials.addLayerSet({ model, name: "Wall 200", layers: [{ thickness: 200 }] });
}

function withTypes(): Fixture {
    const { ifc, model: ground } = groundFloor();
    let model = ifc.doors.addType({ model: ground, id: "door", width: 900, height: 2100 });
    model = ifc.windows.addType({ model, id: "window", width: 1200, height: 1400 });
    return { ifc, model };
}

function wallWithDoorAndWindow(): Fixture {
    const { ifc, model: typed } = withTypes();
    let model = addRightWall(ifc, typed, "south", [0, 0], [10000, 0]);
    model = ifc.doors.add({ model, wall: "south", doorType: "door", id: "front", offset: 1000 });
    model = ifc.windows.add({ model, wall: "south", windowType: "window", id: "kitchen", offset: 5000, sill: 900 });
    return { ifc, model: ifc.openings.add({ model, wall: "south", id: "hatch", offset: 8000, width: 600, height: 600 }) };
}

function corner(): Fixture {
    const { ifc, model: ground } = groundFloor();
    let model = addRightWall(ifc, ground, "south", [0, 0], [10000, 0]);
    model = addRightWall(ifc, model, "east", [10000, 0], [10000, 8000]);
    return { ifc, model: ifc.walls.connect({ model, wall: "south", other: "east" }) };
}

describe("IFCModels.remove", () => {
    it("should leave a model as though the wall had never been added, but for its layer set, and the model it was given as it was", () => {
        // Arrange
        const { ifc, model } = wallWithDoorAndWindow();
        const { ifc: other, model: typed } = withTypes();
        const never = keptLayerSet(other, typed);

        // Act
        const changed = ifc.model.remove({ model, element: "south" });

        // Assert
        expect(typeCounts(changed)).toEqual(typeCounts(never));
        expect(countOf(model, "IfcWall")).toBe(1);
    });

    it("should trim the wall a removed wall was joined to square again", () => {
        // Arrange
        const { ifc, model } = corner();
        const { model: alone } = oneWall();

        // Act
        const changed = ifc.model.remove({ model, element: "east" });

        // Assert
        expect(footprintOf(changed, expressIdOf(changed, "south"))).toEqual(footprintOf(alone, expressIdOf(alone, "south")));
        expect(countOf(changed, "IfcRelConnectsPathElements")).toBe(0);
    });

    it("should square a T's stem when the wall it ended on goes, and leave the wall a stem goes from as it was", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = addCentredWall(ifc, ground, "main", [0, 0], [10000, 0], 200);
        model = addCentredWall(ifc, model, "partition", [5000, 4000], [5000, 0], 100);
        model = ifc.walls.connect({ model, wall: "partition", other: "main" });
        const mainShape = representationsOf(model, expressIdOf(model, "main"));

        // Act
        const withoutMain = ifc.model.remove({ model, element: "main" });
        const withoutStem = ifc.model.remove({ model, element: "partition" });

        // Assert
        expect(footprintOf(withoutMain, expressIdOf(withoutMain, "partition"))).toEqual([[0, -50], [4000, -50], [4000, 50], [0, 50]]);
        expect(representationsOf(withoutStem, expressIdOf(withoutStem, "main"))).toEqual(mainShape);
    });

    it("should remove a door and leave its opening in the wall", () => {
        // Arrange
        const { ifc, model } = wallWithDoorAndWindow();

        // Act
        const changed = ifc.model.remove({ model, element: "front" });

        // Assert
        expect([countOf(changed, "IfcDoor"), countOf(changed, "IfcOpeningElement"), countOf(changed, "IfcRelFillsElement"), countOf(changed, "IfcDoorType")]).toEqual([0, 3, 1, 1]);
    });

    it("should remove an opening with the window in it", () => {
        // Arrange
        const { ifc, model } = wallWithDoorAndWindow();
        const opening = relatedBy(model, "IfcRelFillsElement", "RelatedBuildingElement", "RelatingOpeningElement", expressIdOf(model, "kitchen"))[0]!;

        // Act
        const changed = ifc.model.remove({ model, element: textValue(model.attribute(opening, "GlobalId")) ?? "" });

        // Assert
        expect([countOf(changed, "IfcWindow"), countOf(changed, "IfcOpeningElement"), countOf(changed, "IfcRelVoidsElement")]).toEqual([0, 2, 2]);
    });

    it("should remove an empty storey and refuse one that holds elements", () => {
        // Arrange
        const { ifc, model: wall } = oneWall();
        const model = ifc.spatial.addStorey({ model: wall, id: "first", elevation: 3000 });

        // Act
        const changed = ifc.model.remove({ model, element: "first" });
        const error = errorFrom(() => ifc.model.remove({ model, element: "ground" }));

        // Assert
        expect(ifc.spatial.storeys({ model: changed }).map((storey) => storey.name)).toEqual(["Ground"]);
        expect(error.message).toBe("the IfcBuildingStorey 'Ground' still holds 1 object; remove them first");
    });

    it("should remove a type nothing is of and refuse one that elements are of", () => {
        // Arrange
        const { ifc, model } = wallWithDoorAndWindow();
        const { ifc: other, model: ground } = groundFloor();
        const never = keptLayerSet(other, ground);
        const bare = ifc.model.remove({ model, element: "south" });

        // Act
        const withoutTypes = ifc.model.remove({ model: ifc.model.remove({ model: bare, element: "door" }), element: "window" });
        const error = errorFrom(() => ifc.model.remove({ model, element: "door" }));

        // Assert
        expect(typeCounts(withoutTypes)).toEqual(typeCounts(never));
        expect(error.message).toBe("the IfcDoorType 'Door' is the type of 1 element; remove them first");
    });

    it("should refuse the project, the site and the building", () => {
        // Arrange
        const { ifc, model } = groundFloor();
        const structure = ["IfcProject", "IfcSite", "IfcBuilding"].map((type) => textValue(model.attribute(model.byType(type)[0]!.id, "GlobalId")) ?? "");

        // Act
        const messages = structure.map((globalId) => errorFrom(() => ifc.model.remove({ model, element: globalId })).message);

        // Assert
        expect(messages.every((message) => message.endsWith("is part of the model's structure and is not removed"))).toBe(true);
    });

    it("should drop a property set only the removed wall had, and keep one it shared", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = addRightWall(ifc, ground, "south", [0, 0], [10000, 0]);
        model = addRightWall(ifc, model, "north", [0, 8000], [10000, 8000]);
        model = ifc.properties.addSet({ model, elements: ["south"], name: "Own", properties: [{ name: "A", value: 1 }] });
        model = ifc.properties.addSet({ model, elements: ["south", "north"], name: "Shared", properties: [{ name: "B", value: 2 }] });

        // Act
        const changed = ifc.model.remove({ model, element: "south" });

        // Assert
        expect(ifc.properties.getSets({ model: changed, element: "north" }).map((set) => set.name)).toEqual(["Shared"]);
        expect([countOf(changed, "IfcPropertySet"), countOf(changed, "IfcPropertySingleValue")]).toEqual([1, 1]);
    });

    it("should take a removed wall's geometry out of the styles and presentation layers that held it, keeping a layer another wall is in", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = addRightWall(ifc, ground, "south", [0, 0], [10000, 0]);
        model = addRightWall(ifc, model, "north", [0, 8000], [10000, 8000]);
        const { tx, writer } = writingInto(model);
        const bodyOf = (id: string): number => representationNamed(model, expressIdOf(model, id), "Body");
        const shading = writer.create("IfcSurfaceStyleShading", { SurfaceColour: ref(writer.create("IfcColourRgb", { Red: 0.6, Green: 0.3, Blue: 0.2 })) });
        const style = writer.create("IfcSurfaceStyle", { Side: enumValue("BOTH"), Styles: [ref(shading)] });
        writer.create("IfcStyledItem", { Item: ref(bodySolidOf(model, expressIdOf(model, "south"))), Styles: [ref(style)] });
        writer.create("IfcPresentationLayerAssignment", { Name: "Walls", AssignedItems: [ref(bodyOf("south")), ref(bodyOf("north"))] });
        writer.create("IfcPresentationLayerAssignment", { Name: "South", AssignedItems: [ref(bodyOf("south"))] });
        model = tx.commit();

        // Act
        const changed = ifc.model.remove({ model, element: "south" });

        // Assert
        const layers = changed.byType("IfcPresentationLayerAssignment").map((layer) => [changed.attribute(layer.id, "Name"), refsOf(changed.attribute(layer.id, "AssignedItems"))]);
        expect([countOf(changed, "IfcStyledItem"), countOf(changed, "IfcExtrudedAreaSolid"), layers]).toEqual([0, 1, [["Walls", [bodyOf("north")]]]]);
    });

    it("should take a wall another tool wrote out of the material association it shared", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.walls.connect({ model: ifc.model.read({ data: OTHER_TOOL_FILE }), wall: WALL_A, other: WALL_B });

        // Act
        const changed = ifc.model.remove({ model, element: WALL_A });

        // Assert
        expect(ifc.walls.parameters({ model: changed, wall: WALL_B }).thickness).toBe(0.3);
        expect(countOf(changed, "IfcRelAssociatesMaterial")).toBe(1);
        expect(ifc.model.write({ model: changed, timeStamp: "2026-10-07T12:00:00" })).not.toContain(WALL_A);
    });

    it("should remove parts aggregated in a loop once each", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.columns.add({ model: ground, storey: "ground", id: "a", position: [0, 0] });
        model = ifc.columns.add({ model, storey: "ground", id: "b", position: [1000, 0] });
        const { tx, writer } = writingInto(model);
        const [a, b] = [expressIdOf(model, "a"), expressIdOf(model, "b")];
        writer.create("IfcRelAggregates", { GlobalId: tx.globalId(undefined), RelatingObject: ref(a), RelatedObjects: [ref(b)] });
        writer.create("IfcRelAggregates", { GlobalId: tx.globalId(undefined), RelatingObject: ref(b), RelatedObjects: [ref(a)] });
        const looped = tx.commit();

        // Act
        const changed = ifc.model.remove({ model: looped, element: "a" });

        // Assert
        expect([countOf(changed, "IfcColumn"), countOf(changed, "IfcRelAggregates")]).toEqual([0, countOf(ground, "IfcRelAggregates")]);
    });

    it("should refuse an object that something other than a relationship refers to", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const { tx, writer } = writingInto(ground);
        const group = writer.create("IfcStructuralLoadGroup", { GlobalId: tx.globalId("loads"), PredefinedType: enumValue("LOAD_CASE"), ActionType: enumValue("PERMANENT_G"), ActionSource: enumValue("DEAD_LOAD_G") });
        const analysis = writer.create("IfcStructuralAnalysisModel", { GlobalId: tx.globalId("analysis"), PredefinedType: enumValue("LOADING_3D"), LoadedBy: [ref(group)] });
        const model = tx.commit();

        // Act
        const error = errorFrom(() => ifc.model.remove({ model, element: "loads" }));

        // Assert
        expect(error.message).toBe(`#${group} cannot be deleted while #${analysis} still refer to it`);
    });

    it("should leave a wall it cannot read as it was when a wall joined to it goes", () => {
        // Arrange
        const ifc = new IFCService();
        const joined = ifc.walls.connect({ model: ifc.model.read({ data: OTHER_TOOL_FILE }), wall: WALL_A, other: WALL_B });
        const { tx } = writingInto(joined);
        detach(tx, MATERIAL_ASSOCIATION, expressIdOf(joined, WALL_B));
        const model = tx.commit();
        const shape = representationsOf(model, expressIdOf(model, WALL_B));

        // Act
        const changed = ifc.model.remove({ model, element: WALL_A });

        // Assert
        expect(representationsOf(changed, expressIdOf(changed, WALL_B))).toEqual(shape);
    });
});
