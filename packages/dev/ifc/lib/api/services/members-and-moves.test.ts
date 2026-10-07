import { describe, expect, it } from "vitest";
import type { Fixture } from "../../__test__/fixture-types";
import { modelOf } from "./service-support";
import { addRightWall, errorFrom, expressIdOf, groundFloor, oneWall, writingInto } from "../../__test__/build-setup";
import { enumOf, extrusionOf, materialOf, refOf, relatedBy, round } from "../../__test__/build-geometry";
import { absoluteFrame } from "../../build/placement";
import type { Frame3 } from "../../build/build-types";
import type { IfcModel } from "../../model/model-types";
import { ref } from "../../step/values";
import { IFCService } from "../ifc-service";
import { OTHER_TOOL_FILE, WALL_A } from "../../__test__/other-tool-file";
import * as Inputs from "../inputs";

function worldFrame(model: IfcModel, id: string): Frame3 {
    const snapshot = modelOf(model);
    return absoluteFrame(snapshot, refOf(snapshot.attribute(expressIdOf(model, id), "ObjectPlacement")));
}

function rounded(frame: Frame3): number[][] {
    return [frame.origin, frame.x, frame.z].map((vector) => vector.map(round));
}

function withColumn(): Fixture {
    const { ifc, model } = groundFloor();
    return { ifc, model: ifc.columns.add({ model, storey: "ground", id: "column", position: [1000, 2000], height: 3000 }) };
}

describe("IFCMembers.add", () => {
    it("should add a member of the kind it is told, swept from start to end and contained in its storey", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.materials.add({ model: ground, name: "Timber" });

        // Act
        const changed = ifc.members.add({ model, storey: "ground", id: "rafter", start: [0, 0, 2400], end: [3000, 0, 4000], width: 80, depth: 200, material: "Timber", predefinedType: Inputs.IFC.memberPredefinedTypeEnum.rafter });

        // Assert
        const member = expressIdOf(changed, "rafter");
        expect([changed.typeOf(member), enumOf(changed.attribute(member, "PredefinedType")), round(Number(extrusionOf(changed, member).depth))]).toEqual(["IfcMember", "RAFTER", 3400]);
        expect(rounded(worldFrame(changed, "rafter"))[0]).toEqual([0, 0, 2400]);
        expect(relatedBy(changed, "IfcRelContainedInSpatialStructure", "RelatingStructure", "RelatedElements", expressIdOf(changed, "ground"))).toContain(member);
        expect(changed.attribute(materialOf(changed, member), "Name")).toBe("Timber");
    });

    it("should add a member of no more particular kind by default", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.members.add({ model, storey: "ground", id: "post", start: [0, 0, 0], end: [0, 0, 1000] });

        // Assert
        expect(enumOf(changed.attribute(expressIdOf(changed, "post"), "PredefinedType"))).toBe("MEMBER");
    });

    it("should refuse a kind of member IFC does not have", () => {
        // Arrange
        const { ifc, model } = groundFloor();
        const kind: unknown = "GIRDER";

        // Act
        const error = errorFrom(() => ifc.members.add({ model, storey: "ground", start: [0, 0, 0], end: [0, 0, 1000], predefinedType: kind as Inputs.IFC.memberPredefinedTypeEnum }));

        // Assert
        expect(error.message).toContain("The predefined type 'GIRDER' is not one of");
    });
});

describe("IFCModels.move", () => {
    it("should move an element and leave the model it was given as it was", () => {
        // Arrange
        const { ifc, model } = withColumn();

        // Act
        const changed = ifc.model.move({ model, element: "column", translation: [500, -200, 100] });

        // Assert
        expect([worldFrame(changed, "column").origin, worldFrame(model, "column").origin]).toEqual([[1500, 1800, 100], [1000, 2000, 0]]);
    });

    it("should turn an element about the vertical through its own origin before it moves", () => {
        // Arrange
        const { ifc, model } = withColumn();

        // Act
        const changed = ifc.model.move({ model, element: "column", translation: [100, 0, 0], rotation: 90 });

        // Assert
        expect(rounded(worldFrame(changed, "column"))).toEqual([[1100, 2000, 0], [0, 1, 0], [0, 0, 1]]);
    });

    it("should move an unjoined wall with its openings", () => {
        // Arrange
        const { ifc, model: wall } = oneWall();
        const model = ifc.openings.add({ model: wall, wall: "south", id: "hatch", offset: 2000, width: 600, height: 600 });
        const before = worldFrame(model, "hatch").origin;

        // Act
        const changed = ifc.model.move({ model, element: "south", translation: [0, 1000, 0] });

        // Assert
        expect(worldFrame(changed, "hatch").origin).toEqual([before[0], before[1] + 1000, before[2]]);
    });

    it("should move a space, measured in the plan of the storey it belongs to", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.spatial.addStorey({ model: ground, id: "first", elevation: 3000 });
        model = ifc.spaces.add({ model, storey: "first", id: "room", outline: [[0, 0], [3000, 0], [3000, 3000], [0, 3000]] });

        // Act
        const changed = ifc.model.move({ model, element: "room", translation: [1000, 0, 0] });

        // Assert
        expect(worldFrame(changed, "room").origin).toEqual([1000, 0, 3000]);
    });

    it.each([
        ["a joined wall", "is joined to other walls; move it with walls.edit, which keeps its joins"],
        ["an opening", "moves with its wall: use openings.edit"],
        ["a door", "moves with its wall: use openings.edit"],
        ["a storey", "is part of the model's structure; a storey moves with spatial.setElevation"],
    ] as const)("should refuse %s", (what, message) => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = addRightWall(ifc, ground, "south", [0, 0], [10000, 0]);
        model = addRightWall(ifc, model, "east", [10000, 0], [10000, 8000]);
        model = ifc.walls.connect({ model, wall: "south", other: "east" });
        model = ifc.doors.addType({ model, id: "door", width: 900, height: 2100 });
        model = ifc.doors.add({ model, wall: "south", doorType: "door", id: "front", offset: 1000 });
        const targets: Record<typeof what, string> = {
            "a joined wall": "south",
            "an opening": ifc.model.elements({ model, type: "IfcOpeningElement" })[0]!.globalId,
            "a door": "front",
            "a storey": "ground",
        };

        // Act
        const error = errorFrom(() => ifc.model.move({ model, element: targets[what], translation: [100, 0, 0] }));

        // Assert
        expect(error.message).toContain(message);
    });

    it("should move an element by a translation in the plan of a storey turned in the building", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: OTHER_TOOL_FILE.replace("#25=IFCLOCALPLACEMENT(#23,#12);", "#65=IFCAXIS2PLACEMENT3D(#10,#37,#59);\r\n#25=IFCLOCALPLACEMENT(#23,#65);") });

        // Act
        const changed = ifc.model.move({ model, element: WALL_A, translation: [1, 0, 0] });

        // Assert
        expect([worldFrame(changed, WALL_A).origin.map(round), ifc.walls.parameters({ model: changed, wall: WALL_A }).start.map(round)]).toEqual([[0, 1, 0], [1, 0]]);
    });

    it("should refuse a clipped wall, whose clippings walls.edit keeps where they are", () => {
        // Arrange
        const { ifc, model: wall } = oneWall();
        const model = ifc.walls.clipByPlane({ model: wall, wall: "south", origin: [0, 0, 2500], normal: [0, 0, 1] });

        // Act
        const error = errorFrom(() => ifc.model.move({ model, element: "south", translation: [0, 1000, 0] }));

        // Assert
        expect(error.message).toContain("is clipped; move it with walls.edit, which keeps its clippings where they are");
    });

    it("should refuse an element that shares its placement with another", () => {
        // Arrange
        const { ifc, model: column } = withColumn();
        let model = ifc.columns.add({ model: column, storey: "ground", id: "twin", position: [0, 0] });
        const { tx } = writingInto(model);
        tx.update(expressIdOf(model, "twin"), { ObjectPlacement: ref(refOf(model.attribute(expressIdOf(model, "column"), "ObjectPlacement"))) });
        model = tx.commit();

        // Act
        const error = errorFrom(() => ifc.model.move({ model, element: "column", translation: [100, 0, 0] }));

        // Assert
        expect(error.message).toContain("shares its placement with the IfcColumn");
    });

    it("should refuse an element placed on another element", () => {
        // Arrange
        const { ifc, model: column } = withColumn();
        let model = ifc.columns.add({ model: column, storey: "ground", id: "rider", position: [0, 0] });
        const { tx, writer } = writingInto(model);
        const placement = writer.localPlacement(refOf(model.attribute(expressIdOf(model, "column"), "ObjectPlacement")), { origin: [0, 0, 3000], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] });
        tx.update(expressIdOf(model, "rider"), { ObjectPlacement: ref(placement) });
        model = tx.commit();

        // Act
        const error = errorFrom(() => ifc.model.move({ model, element: "rider", translation: [100, 0, 0] }));

        // Assert
        expect(error.message).toContain("is placed on the IfcColumn");
    });

    it("should refuse a translation that is not three finite numbers and a turn that is not finite", () => {
        // Arrange
        const { ifc, model } = withColumn();
        const short: unknown = [1, 2];

        // Act
        const translation = errorFrom(() => ifc.model.move({ model, element: "column", translation: short as Inputs.Base.Vector3 }));
        const rotation = errorFrom(() => ifc.model.move({ model, element: "column", rotation: Number.POSITIVE_INFINITY }));

        // Assert
        expect([translation.message, rotation.message]).toEqual(["The translation must be three finite numbers", "The rotation in degrees must be a finite number, got Infinity"]);
    });
});
