import { WORLD_AXES } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { describe, expect, it } from "vitest";
import type { Fixture } from "../../__test__/fixture-types";
import { modelOf } from "./service-support";
import { addRightWall, errorFrom, expressIdOf, groundFloor, writingInto } from "../../__test__/build-setup";
import { countOf, enumOf, extrusionOf, objectPlacementOf, refOf, relatedBy } from "../../__test__/build-geometry";
import { bodyContext } from "../../build/contexts";
import type { EntityWriter } from "../../build/entity-writer";
import { OTHER_TOOL_FILE, STOREY_ROW, WALL_A } from "../../__test__/other-tool-file";
import { AGGREGATION } from "../../build/constants";
import { absoluteFrame } from "../../build/placement";
import { appendToRelationship } from "../../build/relationships";
import type { IfcModel } from "../../model/model-types";
import { enumValue, ref } from "../../step/values";
import { IFCService } from "../ifc-service";
import * as Inputs from "../inputs";

const KITCHEN: Inputs.Base.Point2[] = [[0, 0], [4000, 0], [4000, 3000], [0, 3000]];

function heightOf(model: IfcModel, id: string): number {
    const snapshot = modelOf(model);
    return absoluteFrame(snapshot, refOf(snapshot.attribute(expressIdOf(model, id), "ObjectPlacement"))).origin[2];
}

function facetedBrep(writer: EntityWriter): number {
    const corners: Inputs.Base.Point3[] = [[0, 0, 0], [4000, 0, 0], [4000, 3000, 0]];
    const loop = writer.create("IfcPolyLoop", { Polygon: corners.map((corner) => ref(writer.point(corner))) });
    const face = writer.create("IfcFace", { Bounds: [ref(writer.create("IfcFaceOuterBound", { Bound: ref(loop), Orientation: true }))] });
    return writer.create("IfcFacetedBrep", { Outer: ref(writer.create("IfcClosedShell", { CfsFaces: [ref(face)] })) });
}

function twoStoreys(): Fixture {
    const { ifc, model: ground } = groundFloor();
    let model = ifc.spatial.addStorey({ model: ground, id: "first", name: "First", elevation: 3000 });
    model = addRightWall(ifc, model, "upper", [0, 0], [5000, 0], "first");
    return { ifc, model: addRightWall(ifc, model, "lower", [0, 0], [5000, 0]) };
}

describe("IFCSpatial.setElevation", () => {
    it("should raise a storey with everything on it and leave the other storeys where they were", () => {
        // Arrange
        const { ifc, model } = twoStoreys();

        // Act
        const changed = ifc.spatial.setElevation({ model, storey: "first", elevation: 3500 });

        // Assert
        expect(ifc.spatial.storeys({ model: changed }).map((storey) => storey.elevation)).toEqual([0, 3500]);
        expect([heightOf(changed, "upper"), heightOf(changed, "lower"), heightOf(model, "upper")]).toEqual([3500, 0, 3000]);
    });

    it("should move a storey another tool placed by the change in its elevation", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: OTHER_TOOL_FILE });

        // Act
        const changed = ifc.spatial.setElevation({ model, storey: "0StoreyGlobalId0000003", elevation: 2.5 });

        // Assert
        expect(heightOf(changed, WALL_A)).toBe(2.5);
    });

    it("should take a storey without a recorded elevation to the elevation it is given", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: OTHER_TOOL_FILE.replace(STOREY_ROW, STOREY_ROW.replace(",.ELEMENT.,0.);", ",.ELEMENT.,$);")) });

        // Act
        const changed = ifc.spatial.setElevation({ model, storey: "0StoreyGlobalId0000003", elevation: 4 });

        // Assert
        expect([heightOf(changed, WALL_A), ifc.spatial.storeys({ model: changed })[0]!.elevation]).toEqual([4, 4]);
    });

    it("should move a storey by the change from the elevation it records, not to it, when its placement says otherwise", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: OTHER_TOOL_FILE.replace(STOREY_ROW, STOREY_ROW.replace(",.ELEMENT.,0.);", ",.ELEMENT.,3.);")) });

        // Act
        const changed = ifc.spatial.setElevation({ model, storey: "0StoreyGlobalId0000003", elevation: 4 });

        // Assert
        expect([heightOf(changed, WALL_A), ifc.spatial.storeys({ model: changed })[0]!.elevation]).toEqual([1, 4]);
    });

    it("should refuse a storey whose placement another product is placed by, as it cannot move on its own", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: OTHER_TOOL_FILE.replace(`'Wall A',$,$,#41,#40,`, `'Wall A',$,$,#25,#40,`) });

        // Act
        const error = errorFrom(() => ifc.spatial.setElevation({ model, storey: "0StoreyGlobalId0000003", elevation: 4 }));

        // Assert
        expect(error.message).toBe("the IfcBuildingStorey 'Level 1' shares its placement with the IfcWallStandardCase 'Wall A', so it cannot move on its own");
    });

    it("should refuse an elevation that is not a finite number", () => {
        // Arrange
        const { ifc, model } = twoStoreys();

        // Act
        const error = errorFrom(() => ifc.spatial.setElevation({ model, storey: "first", elevation: Number.NaN }));

        // Assert
        expect(error.message).toBe("The storey's elevation must be a finite number, got NaN");
    });
});

describe("IFCSpaces.add", () => {
    it("should make a space part of its storey, its outline extruded up to its height", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.spaces.add({ model, storey: "ground", id: "kitchen", name: "0.01", longName: "Kitchen", outline: KITCHEN, height: 2700, baseOffset: 50 });

        // Assert
        const space = expressIdOf(changed, "kitchen");
        expect(relatedBy(changed, "IfcRelAggregates", "RelatingObject", "RelatedObjects", expressIdOf(changed, "ground"))).toContain(space);
        expect(relatedBy(changed, "IfcRelContainedInSpatialStructure", "RelatingStructure", "RelatedElements", expressIdOf(changed, "ground"))).not.toContain(space);
        expect([extrusionOf(changed, space).depth, heightOf(changed, "kitchen"), enumOf(changed.attribute(space, "PredefinedType"))]).toEqual([2700, 50, "SPACE"]);
    });

    it("should make a space 3 m high in the model's length unit when no height is given", () => {
        // Arrange
        const ifc = new IFCService();
        let model = ifc.model.create({ lengthUnit: Inputs.IFC.lengthUnitEnum.metre, seed: "metres" });
        model = ifc.spatial.addStorey({ model, id: "ground", elevation: 0 });

        // Act
        const changed = ifc.spaces.add({ model, storey: "ground", id: "hall", outline: [[0, 0], [2, 0], [2, 2], [0, 2]] });

        // Assert
        expect(ifc.spaces.list({ model: changed })[0]!.height).toBe(3);
    });

    it("should give a space the kind it is told", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.spaces.add({ model, storey: "ground", id: "terrace", outline: KITCHEN, predefinedType: Inputs.IFC.spacePredefinedTypeEnum.external });

        // Assert
        expect(enumOf(changed.attribute(expressIdOf(changed, "terrace"), "PredefinedType"))).toBe("EXTERNAL");
    });

    it("should refuse a space of no height", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const error = errorFrom(() => ifc.spaces.add({ model, storey: "ground", outline: KITCHEN, height: 0 }));

        // Assert
        expect(error.message).toBe("A space's height must be more than zero, got 0");
    });

    it("should keep a storey that holds a space from being removed until the space is", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.spaces.add({ model: ground, storey: "ground", id: "kitchen", outline: KITCHEN });

        // Act
        const refused = errorFrom(() => ifc.model.remove({ model, element: "ground" }));
        const emptied = ifc.model.remove({ model: ifc.model.remove({ model, element: "kitchen" }), element: "ground" });

        // Assert
        expect(refused.message).toBe("the IfcBuildingStorey 'Ground' still holds 1 object; remove them first");
        expect([countOf(emptied, "IfcSpace"), countOf(emptied, "IfcBuildingStorey")]).toEqual([0, 0]);
    });
});

describe("IFCSpaces.list", () => {
    it("should list every space with its number, name, storey, area and height, or one storey's", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.spatial.addStorey({ model: ground, id: "first", elevation: 3000 });
        model = ifc.spaces.add({ model, storey: "ground", id: "kitchen", name: "0.01", longName: "Kitchen", outline: KITCHEN, height: 2700 });
        model = ifc.spaces.add({ model, storey: "first", id: "bedroom", outline: [[0, 0], [3000, 0], [3000, 3000]], height: 2500 });

        // Act
        const all = ifc.spaces.list({ model });
        const upstairs = ifc.spaces.list({ model, storey: "first" });

        // Assert
        expect(all).toEqual([
            { globalId: ifc.model.globalIdOf({ model, id: "kitchen" }), name: "0.01", longName: "Kitchen", storey: ifc.model.globalIdOf({ model, id: "ground" }), area: 12000000, height: 2700 },
            { globalId: ifc.model.globalIdOf({ model, id: "bedroom" }), name: "", longName: "", storey: ifc.model.globalIdOf({ model, id: "first" }), area: 4500000, height: 2500 },
        ]);
        expect(upstairs.map((space) => space.globalId)).toEqual([ifc.model.globalIdOf({ model, id: "bedroom" })]);
    });

    it.each([
        ["a rectangle extruded up", [12000000, 2700]],
        ["a faceted brep", [0, 0]],
    ] as const)("should read a space whose body another tool wrote as %s", (body, extent) => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const { tx, writer } = writingInto(ground);
        const item = body === "a faceted brep"
            ? facetedBrep(writer)
            : writer.extrusion(writer.create("IfcRectangleProfileDef", { ProfileType: enumValue("AREA"), Position: ref(writer.placement2([2000, 1500])), XDim: 4000, YDim: 3000 }), WORLD_AXES, 2700);
        const representation = writer.shapeRepresentation(bodyContext(tx, writer), "Body", body === "a faceted brep" ? "Brep" : "SweptSolid", [item]);
        const space = writer.create("IfcSpace", { GlobalId: tx.globalId("room"), ObjectPlacement: ref(writer.localPlacement(objectPlacementOf(ground, expressIdOf(ground, "ground")), WORLD_AXES)), Representation: ref(writer.productShape([representation])), CompositionType: enumValue("ELEMENT") });
        appendToRelationship(tx, writer, AGGREGATION, expressIdOf(ground, "ground"), [space]);
        const model = tx.commit();

        // Act
        const listed = ifc.spaces.list({ model });

        // Assert
        expect(listed.map((info) => [info.area, info.height])).toEqual([extent]);
    });

    it("should give a space whose body it cannot read no area and no height", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const { tx, writer } = writingInto(ground);
        const space = writer.create("IfcSpace", { GlobalId: tx.globalId("bare"), CompositionType: enumValue("ELEMENT") });
        appendToRelationship(tx, writer, AGGREGATION, expressIdOf(ground, "ground"), [space]);
        const model = tx.commit();

        // Act
        const listed = ifc.spaces.list({ model });

        // Assert
        expect(listed.map((info) => [info.area, info.height])).toEqual([[0, 0]]);
    });
});
