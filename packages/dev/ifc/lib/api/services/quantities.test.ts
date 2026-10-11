import { WORLD_AXES } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { describe, expect, it } from "vitest";
import type { Fixture } from "../../__test__/fixture-types";
import { addRightWall, errorFrom, expressIdOf, groundFloor, oneWall, writingInto } from "../../__test__/build-setup";
import { handMadeSlab, wallWithNiche } from "../../__test__/hand-made";
import { bodyContext } from "../../build/contexts";
import { AGGREGATION, CONTAINMENT } from "../../build/constants";
import { appendToRelationship } from "../../build/relationships";
import { enumValue, ref, textValue } from "../../step/values";
import { countOf, relatedBy } from "../../__test__/build-geometry";
import { modelOf } from "./service-support";
import { OTHER_TOOL_FILE, WALL_A } from "../../__test__/other-tool-file";
import type { IfcModel } from "../../model/model-types";
import { IFCService } from "../ifc-service";
import * as Inputs from "../inputs";

function measured(ifc: IFCService, model: IfcModel, element: string): Record<string, number> {
    const sets = ifc.quantities.get({ model, element });
    expect(sets).toHaveLength(1);
    return Object.fromEntries(Object.entries(sets[0]!.quantities).map(([name, value]) => [name, Math.round(value * 1e6) / 1e6]));
}

describe("IFCQuantities.compute for walls", () => {
    it("should measure a wall's length, width, height, areas and volumes, net of an opening, in the model's units", () => {
        // Arrange
        const { ifc, model: wall } = oneWall();
        const model = ifc.openings.add({ model: wall, wall: "south", offset: 2000, sill: 0, width: 1000, height: 2000 });

        // Act
        const changed = ifc.quantities.compute({ model, elements: ["south"] });

        // Assert
        expect(ifc.quantities.get({ model: changed, element: "south" })[0]!.name).toBe("Qto_WallBaseQuantities");
        expect(measured(ifc, changed, "south")).toEqual({
            Length: 10000,
            Width: 200,
            Height: 3000,
            GrossFootprintArea: 2,
            NetFootprintArea: 1.8,
            GrossSideArea: 30,
            NetSideArea: 28,
            GrossVolume: 6,
            NetVolume: 5.6,
        });
    });

    it("should measure a wall under a gable by its triangle", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.roofs.add({ model: ground, storey: "ground", id: "roof", outline: [[0, 0], [10000, 0], [10000, 8000], [0, 8000]], pitch: 45, baseOffset: 3000 });
        model = ifc.walls.add({ model, storey: "ground", id: "west", start: [0, 8000], end: [0, 0], height: 7500, thickness: 200, alignment: Inputs.IFC.wallAlignmentEnum.left });
        model = ifc.walls.clipByRoof({ model, wall: "west", roof: "roof" });

        // Act
        const changed = ifc.quantities.compute({ model, elements: ["west"] });

        // Assert
        const quantities = measured(ifc, changed, "west");
        expect([quantities["GrossSideArea"], quantities["GrossVolume"]]).toEqual([40, 8]);
    });

    it("should measure a wall's mitred footprint and the volume over it", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = addRightWall(ifc, ground, "south", [0, 0], [10000, 0]);
        model = addRightWall(ifc, model, "east", [10000, 0], [10000, 8000]);
        model = ifc.walls.connect({ model, wall: "south", other: "east" });

        // Act
        const changed = ifc.quantities.compute({ model, elements: ["south"] });

        // Assert
        const quantities = measured(ifc, changed, "south");
        expect([quantities["GrossFootprintArea"], quantities["GrossVolume"]]).toEqual([2.02, 6.06]);
    });

    it("should measure a centred wall's side along its middle line when a plane slopes across its thickness", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.walls.add({ model: ground, storey: "ground", id: "centre", start: [0, 0], end: [10000, 0], height: 4000, thickness: 200, alignment: Inputs.IFC.wallAlignmentEnum.center });
        model = ifc.walls.clipByPlane({ model, wall: "centre", origin: [0, 0, 3000], normal: [0, -1, 1] });

        // Act
        const changed = ifc.quantities.compute({ model, elements: ["centre"] });

        // Assert
        const quantities = measured(ifc, changed, "centre");
        expect([quantities["Height"], quantities["GrossSideArea"], quantities["GrossVolume"]]).toEqual([4000, 30, 6]);
    });

    it("should measure a raised wall's side and volume up from its base to where a plane clips it", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.walls.add({ model: ground, storey: "ground", id: "raised", start: [0, 0], end: [10000, 0], height: 3000, thickness: 200, baseOffset: 500 });
        model = ifc.walls.clipByPlane({ model, wall: "raised", origin: [0, 0, 3000], normal: [0, 0, 1] });

        // Act
        const changed = ifc.quantities.compute({ model, elements: ["raised"] });

        // Assert
        const quantities = measured(ifc, changed, "raised");
        expect([quantities["Height"], quantities["GrossSideArea"], quantities["GrossVolume"]]).toEqual([3000, 25, 5]);
    });

    it("should leave a niche, which stops inside the wall, in the wall's net side area and volume", () => {
        // Arrange
        const { ifc, model } = wallWithNiche();

        // Act
        const changed = ifc.quantities.compute({ model, elements: ["south"] });

        // Assert
        const quantities = measured(ifc, changed, "south");
        expect([quantities["NetSideArea"], quantities["NetVolume"]]).toEqual([30, 6]);
    });

    it("should write areas in the area unit a file declares", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: OTHER_TOOL_FILE.replace("#3=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);", "#3=IFCSIUNIT(*,.AREAUNIT.,.MILLI.,.SQUARE_METRE.);") });

        // Act
        const changed = ifc.quantities.compute({ model, elements: [WALL_A] });

        // Assert
        const quantities = measured(ifc, changed, WALL_A);
        expect([quantities["Length"], quantities["GrossFootprintArea"], quantities["GrossVolume"]]).toEqual([6, 1800000, 5.4]);
    });
});

describe("IFCQuantities.compute for other elements", () => {
    function building(): Fixture {
        const { ifc, model: wall } = oneWall();
        let model = ifc.slabs.add({ model: wall, storey: "ground", id: "floor", outline: [[0, 0], [10000, 0], [10000, 8000], [0, 8000]], holes: [[[1000, 1000], [2000, 1000], [2000, 2000], [1000, 2000]]], thickness: 250 });
        model = ifc.openings.addInSlab({ model, slab: "floor", id: "stair", outline: [[5000, 5000], [7000, 5000], [7000, 6000], [5000, 6000]] });
        model = ifc.columns.add({ model, storey: "ground", id: "column", position: [3000, 3000], height: 3000, width: 300, depth: 300 });
        model = ifc.beams.add({ model, storey: "ground", id: "beam", start: [0, 4000, 3000], end: [4000, 4000, 3000], profile: Inputs.IFC.profileKindEnum.iShape, width: 200, depth: 400, webThickness: 10, flangeThickness: 20 });
        model = ifc.members.add({ model, storey: "ground", id: "post", start: [0, 0, 0], end: [0, 0, 1000], profile: Inputs.IFC.profileKindEnum.circle, radius: 50 });
        model = ifc.doors.addType({ model, id: "door", width: 900, height: 2100 });
        model = ifc.doors.add({ model, wall: "south", doorType: "door", id: "front", offset: 1000 });
        model = ifc.windows.addType({ model, id: "window", width: 1200, height: 1500 });
        model = ifc.windows.add({ model, wall: "south", windowType: "window", id: "kitchen", offset: 5000 });
        model = ifc.spaces.add({ model, storey: "ground", id: "room", outline: [[0, 0], [4000, 0], [4000, 5000], [0, 5000]], height: 2500 });
        model = ifc.roofs.add({ model, storey: "ground", id: "roof", outline: [[0, 0], [10000, 0], [10000, 8000], [0, 8000]], kind: Inputs.IFC.roofKindEnum.flat, baseOffset: 3000, thickness: 300 });
        return { ifc, model: ifc.quantities.compute({ model }) };
    }

    it("should measure a slab net of its openings, its holes being part of its outline", () => {
        // Arrange
        const { ifc, model } = building();

        // Assert
        expect(measured(ifc, model, "floor")).toEqual({ Width: 250, Perimeter: 36000, GrossArea: 79, NetArea: 77, GrossVolume: 19.75, NetVolume: 19.25 });
    });

    it("should measure columns, beams and members by their section along their length", () => {
        // Arrange
        const { ifc, model } = building();

        // Assert
        expect(measured(ifc, model, "column")).toEqual({ Length: 3000, CrossSectionArea: 0.09, OuterSurfaceArea: 3.6, GrossVolume: 0.27, NetVolume: 0.27 });
        expect(measured(ifc, model, "beam")["CrossSectionArea"]).toBe(0.0116);
        expect(measured(ifc, model, "post")["CrossSectionArea"]).toBe(Math.round(Math.PI * 0.0025 * 1e6) / 1e6);
    });

    it("should measure doors, windows and wall openings by their size, an opening as deep as its wall", () => {
        // Arrange
        const { ifc, model } = building();
        const fills = (opening: number): number[] => relatedBy(model, "IfcRelFillsElement", "RelatingOpeningElement", "RelatedBuildingElement", opening);
        const doorway = model.byType("IfcOpeningElement").find((opening) => fills(opening.id).includes(expressIdOf(model, "front")))!;

        // Assert
        expect(measured(ifc, model, "front")).toEqual({ Width: 900, Height: 2100, Perimeter: 6000, Area: 1.89 });
        expect(measured(ifc, model, "kitchen")).toEqual({ Width: 1200, Height: 1500, Perimeter: 5400, Area: 1.8 });
        expect(ifc.quantities.get({ model, element: "kitchen" })[0]!.name).toBe("Qto_WindowBaseQuantities");
        expect(measured(ifc, model, textValue(model.attribute(doorway.id, "GlobalId"))!)).toEqual({ Width: 900, Height: 2100, Depth: 200 });
    });

    it("should take a door's opening off its wall's footprint, and a window's above the floor only off its side", () => {
        // Arrange
        const { ifc, model } = building();

        // Assert
        const quantities = measured(ifc, model, "south");
        expect([quantities["NetFootprintArea"], quantities["NetSideArea"], quantities["NetVolume"]]).toEqual([1.82, 26.31, 5.262]);
    });

    it("should measure a pitched roof's slopes as they lie and their projection on the plan", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.roofs.add({ model: ground, storey: "ground", id: "roof", outline: [[0, 0], [10000, 0], [10000, 8000], [0, 8000]], kind: Inputs.IFC.roofKindEnum.gable, pitch: 45, baseOffset: 3000 });

        // Act
        const changed = ifc.quantities.compute({ model, elements: ["roof"] });

        // Assert
        const sloped = Math.round(80 * Math.SQRT2 * 1e6) / 1e6;
        expect(measured(ifc, changed, "roof")).toEqual({ GrossArea: sloped, NetArea: sloped, ProjectedArea: 80 });
    });

    it("should measure a space's floor area and volume and a roof's areas", () => {
        // Arrange
        const { ifc, model } = building();

        // Assert
        expect(measured(ifc, model, "room")).toEqual({ Height: 2500, GrossPerimeter: 18000, GrossFloorArea: 20, NetFloorArea: 20, GrossVolume: 50, NetVolume: 50 });
        expect(measured(ifc, model, "roof")).toEqual({ GrossArea: 80, NetArea: 80, ProjectedArea: 80 });
    });

    it("should leave out a slab opening, which its slab's net area accounts for", () => {
        // Arrange
        const { ifc, model } = building();

        // Assert
        expect(ifc.quantities.get({ model, element: "stair" })).toEqual([]);
    });
});

describe("IFCQuantities.compute and get", () => {
    it("should replace the set it wrote before, leaving nothing of the old one", () => {
        // Arrange
        const { ifc, model: wall } = oneWall();
        const model = ifc.quantities.compute({ model: wall });

        // Act
        const again = ifc.quantities.compute({ model: ifc.walls.edit({ model, wall: "south", height: 3500 }) });

        // Assert
        expect([countOf(again, "IfcElementQuantity"), countOf(again, "IfcQuantityLength"), measured(ifc, again, "south")["Height"]]).toEqual([1, 3, 3500]);
    });

    it("should take an element out of a set it shares with another and give it one of its own, leaving the other's as it was", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = addRightWall(ifc, ground, "south", [0, 0], [10000, 0]);
        model = ifc.quantities.compute({ model: addRightWall(ifc, model, "north", [10000, 8000], [0, 8000]) });
        const definitionOf = (id: string): number => modelOf(model).referencesTo(expressIdOf(model, id)).find((user) => model.typeOf(user) === "IfcRelDefinesByProperties")!;
        const { tx } = writingInto(model);
        tx.delete(definitionOf("north"));
        tx.update(definitionOf("south"), { RelatedObjects: [ref(expressIdOf(model, "south")), ref(expressIdOf(model, "north"))] });
        const shared = ifc.walls.edit({ model: tx.commit(), wall: "south", height: 3500 });

        // Act
        const changed = ifc.quantities.compute({ model: shared, elements: ["south"] });

        // Assert
        expect([measured(ifc, changed, "south")["Height"], measured(ifc, changed, "north")["Height"]]).toEqual([3500, 3000]);
    });

    it("should refuse an element it does not measure when it is named", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const error = errorFrom(() => ifc.quantities.compute({ model, elements: ["ground"] }));

        // Assert
        expect(error.message).toBe("the IfcBuildingStorey 'Ground' is not an element whose base quantities this library measures");
    });

    it("should refuse elements that are not a list", () => {
        // Arrange
        const { ifc, model } = oneWall();
        const notAList: unknown = "south";

        // Act
        const error = errorFrom(() => ifc.quantities.compute({ model, elements: notAList as string[] }));

        // Assert
        expect(error.message).toBe("Expected the elements as a list");
    });

    it("should read no quantity sets from an element that has none", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Assert
        expect(ifc.quantities.get({ model, element: "south" })).toEqual([]);
    });

    it("should skip what it cannot measure when measuring every element, and refuse each when it is named", () => {
        // Arrange
        const { ifc, model: slab } = handMadeSlab("block");
        const { tx, writer } = writingInto(slab);
        const storey = expressIdOf(slab, "ground");
        const place = (): number => writer.localPlacement(undefined, WORLD_AXES);
        const door = writer.create("IfcDoor", { GlobalId: tx.globalId("door"), ObjectPlacement: ref(place()) });
        const roof = writer.create("IfcRoof", { GlobalId: tx.globalId("roof"), ObjectPlacement: ref(place()) });
        const ellipse = writer.create("IfcEllipseProfileDef", { ProfileType: enumValue("AREA"), SemiAxis1: 200, SemiAxis2: 100 });
        const body = writer.shapeRepresentation(bodyContext(tx, writer), "Body", "SweptSolid", [writer.extrusion(ellipse, WORLD_AXES, 3000)]);
        const column = writer.create("IfcColumn", { GlobalId: tx.globalId("column"), ObjectPlacement: ref(place()), Representation: ref(writer.productShape([body])) });
        const space = writer.create("IfcSpace", { GlobalId: tx.globalId("space"), CompositionType: enumValue("ELEMENT") });
        appendToRelationship(tx, writer, CONTAINMENT, storey, [door, roof, column]);
        appendToRelationship(tx, writer, AGGREGATION, storey, [space]);
        const model = tx.commit();

        // Act
        const measuredAll = ifc.quantities.compute({ model });
        const refusals = ["slab", "door", "roof", "column", "space"].map((element) => errorFrom(() => ifc.quantities.compute({ model, elements: [element] })).message);

        // Assert
        expect(countOf(measuredAll, "IfcElementQuantity")).toBe(0);
        expect(refusals.every((message) => message.endsWith("is not an element whose base quantities this library measures"))).toBe(true);
    });
});
