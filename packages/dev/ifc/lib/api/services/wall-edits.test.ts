import { WORLD_AXES, composeAxes, relativeAxes } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { dot3 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import { describe, expect, it } from "vitest";
import type { Fixture } from "../../__test__/fixture-types";
import { modelOf } from "./service-support";
import { addCentredWall, addRightWall, errorFrom, expressIdOf, groundFloor, oneWall, writingInto } from "../../__test__/build-setup";
import { countOf, extrusionOf, footprintOf, objectPlacementOf, onlyOf, refOf, round, unwrapBody } from "../../__test__/build-geometry";
import { rehungDoor, wallClippedBy, wallWithOpening } from "../../__test__/hand-made";
import { OTHER_TOOL_FILE, WALL_A, WALL_B, WALL_B_AXIS_ALONG_ITS_PLACEMENT_Y, WALL_B_PLACED_APART_FROM_ITS_AXIS } from "../../__test__/other-tool-file";
import { bodyContext } from "../../build/contexts";
import { enumValue, ref } from "../../step/values";
import { absoluteFrame, axisPlacementFrame } from "../../build/placement";
import type { Frame3 } from "../../build/build-types";
import type { IfcModel } from "../../model/model-types";
import { IFCService } from "../ifc-service";
import * as Inputs from "../inputs";

function worldFrame(model: IfcModel, id: string): Frame3 {
    const snapshot = modelOf(model);
    return absoluteFrame(snapshot, refOf(snapshot.attribute(expressIdOf(model, id), "ObjectPlacement")));
}

function roundedFrame(frame: Frame3): number[][] {
    return [frame.origin, frame.x, frame.z].map((vector) => vector.map(round));
}

function doorAndOpeningFrames(model: IfcModel): number[][][] {
    const opening = absoluteFrame(modelOf(model), objectPlacementOf(model, onlyOf(model, "IfcOpeningElement")));
    return [roundedFrame(worldFrame(model, "front")), roundedFrame(opening)];
}

function withBackDoor(ifc: IFCService, data: string): IfcModel {
    const model = ifc.doors.addType({ model: ifc.model.read({ data }), id: "door", width: 0.9, height: 2.1 });
    return ifc.doors.add({ model, wall: WALL_B, doorType: "door", id: "back", offset: 1 });
}

function withRoundHole(ifc: IFCService, data: string): IfcModel {
    const model = ifc.model.read({ data });
    const { tx, writer } = writingInto(model);
    const wall = expressIdOf(model, WALL_B);
    const parent = refOf(tx.attribute(wall, "ObjectPlacement"));
    const hole = writer.extrusion(writer.create("IfcCircleProfileDef", { ProfileType: enumValue("AREA"), Radius: 0.3 }), { origin: [0, 0, 0], x: [0, 1, 0], y: [0, 0, 1], z: [1, 0, 0] }, 0.6);
    const body = writer.shapeRepresentation(bodyContext(tx, writer), "Body", "SweptSolid", [hole]);
    const placement = writer.localPlacement(parent, relativeAxes(absoluteFrame(tx, parent), { ...WORLD_AXES, origin: [5.85, 2, 1.5] }));
    const opening = writer.create("IfcOpeningElement", { GlobalId: tx.globalId("hole"), ObjectPlacement: ref(placement), Representation: ref(writer.productShape([body])) });
    writer.create("IfcRelVoidsElement", { GlobalId: tx.globalId(undefined), RelatingBuildingElement: ref(wall), RelatedOpeningElement: ref(opening) });
    return tx.commit();
}

function planOf(ifc: IFCService, model: IfcModel): number[] {
    const wall = ifc.walls.parameters({ model, wall: WALL_B });
    return [...wall.start, ...wall.end, wall.height, wall.baseOffset, wall.thickness, wall.offset].map(round);
}

function footprintOfWall(model: IfcModel, id: string): number[][] {
    return footprintOf(model, expressIdOf(model, id));
}

function clippingPlanes(model: IfcModel, id: string): number[][] {
    const snapshot = modelOf(model);
    const wall = worldFrame(model, id);
    const inBuilding = (placement: number): Frame3 => composeAxes(wall, axisPlacementFrame(snapshot, placement));
    return unwrapBody(model, expressIdOf(model, id)).halfSpaces.map((halfSpace) => {
        const plane = inBuilding(refOf(snapshot.attribute(refOf(snapshot.attribute(halfSpace, "BaseSurface")), "Position")));
        const bounded = snapshot.typeOf(halfSpace) === "IfcPolygonalBoundedHalfSpace" ? roundedFrame(inBuilding(refOf(snapshot.attribute(halfSpace, "Position")))).flat() : [];
        return [...plane.z, dot3(plane.origin, plane.z)].map(round).concat(bounded);
    });
}

function otherToolFileWith(row: string, replacement: string): string {
    if (!OTHER_TOOL_FILE.includes(row)) {
        throw new Error(`The file has no row ${row}`);
    }
    return OTHER_TOOL_FILE.replace(row, replacement);
}

function corner(): Fixture {
    const { ifc, model: ground } = groundFloor();
    let model = addRightWall(ifc, ground, "south", [0, 0], [10000, 0]);
    model = addRightWall(ifc, model, "east", [10000, 0], [10000, 8000]);
    return { ifc, model: ifc.walls.connect({ model, wall: "south", other: "east" }) };
}

function tee(): Fixture {
    const { ifc, model: ground } = groundFloor();
    let model = addCentredWall(ifc, ground, "main", [0, 0], [10000, 0], 200);
    model = addCentredWall(ifc, model, "partition", [5000, 4000], [5000, 0], 100);
    return { ifc, model: ifc.walls.connect({ model, wall: "partition", other: "main" }) };
}

function withDoor(thickness: number): Fixture {
    const { ifc, model: ground } = groundFloor();
    let model = addRightWall(ifc, ground, "south", [0, 0], [10000, 0]);
    if (thickness !== 200) {
        model = ifc.walls.edit({ model, wall: "south", thickness });
    }
    model = ifc.doors.addType({ model, id: "door", width: 900, height: 2100 });
    return { ifc, model: ifc.doors.add({ model, wall: "south", doorType: "door", id: "front", offset: 3000 }) };
}

describe("IFCWalls.parameters", () => {
    it.each([
        Inputs.IFC.wallAlignmentEnum.center,
        Inputs.IFC.wallAlignmentEnum.left,
        Inputs.IFC.wallAlignmentEnum.right,
    ])("should read back a wall aligned %s as aligned so", (alignment) => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.walls.add({ model: ground, storey: "ground", id: "south", start: [0, 0], end: [5000, 0], alignment });

        // Act
        const parameters = ifc.walls.parameters({ model, wall: "south" });

        // Assert
        expect(parameters.alignment).toBe(alignment);
    });

    it("should name a wall's type by its GlobalId", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.materials.addLayerSet({ model: ground, name: "Typed", layers: [{ thickness: 200 }] });
        model = ifc.walls.addType({ model, id: "type", layerSet: "Typed" });
        model = ifc.walls.add({ model, storey: "ground", id: "south", start: [0, 0], end: [5000, 0], wallType: "type" });

        // Act
        const parameters = ifc.walls.parameters({ model, wall: "south" });

        // Assert
        expect([parameters.wallType, parameters.layerSet]).toEqual([ifc.model.globalIdOf({ model, id: "type" }), "Typed"]);
    });

    it("should give a wall without a body no height and no clippings", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: otherToolFileWith("#40=IFCPRODUCTDEFINITIONSHAPE($,$,(#33,#39));", "#40=IFCPRODUCTDEFINITIONSHAPE($,$,(#33));") });

        // Act
        const parameters = ifc.walls.parameters({ model, wall: WALL_A });

        // Assert
        expect([parameters.height, parameters.clippings]).toEqual([0, 0]);
    });

    it("should give a wall no storey contains its axis in the building's coordinates", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: otherToolFileWith("#61=IFCRELCONTAINEDINSPATIALSTRUCTURE('0Contains0000000000001',$,$,$,(#42,#56),#24);", "") });

        // Act
        const parameters = ifc.walls.parameters({ model, wall: WALL_B });

        // Assert
        expect([parameters.storey, parameters.start, parameters.end]).toEqual(["", [6, 0], [6, 4]]);
    });

    it("should name the entity when a wall's layer set usage names no layer set", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: otherToolFileWith("#45=IFCMATERIALLAYERSETUSAGE(#44,.AXIS2.,.NEGATIVE.,0.,$);", "#45=IFCMATERIALLAYERSETUSAGE($,.AXIS2.,.NEGATIVE.,0.,$);") });

        // Act
        const error = errorFrom(() => ifc.walls.parameters({ model, wall: WALL_A }));

        // Assert
        expect(error.message).toBe("#45 has no ForLayerSet");
    });

    it("should read back the axis, height, base, thickness, alignment and layers a wall was added with", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.materials.add({ model: ground, name: "Block" });
        model = ifc.materials.addLayerSet({ model, name: "Block 250", layers: [{ material: "Block", thickness: 250 }] });
        model = ifc.walls.add({ model, storey: "ground", id: "south", name: "South", start: [1000, 500], end: [5000, 500], height: 2700, baseOffset: 100, layerSet: "Block 250", alignment: Inputs.IFC.wallAlignmentEnum.right });

        // Act
        const parameters = ifc.walls.parameters({ model, wall: "south" });

        // Assert
        expect(parameters).toEqual({
            globalId: ifc.model.globalIdOf({ model, id: "south" }),
            name: "South",
            storey: ifc.model.globalIdOf({ model, id: "ground" }),
            start: [1000, 500],
            end: [5000, 500],
            height: 2700,
            baseOffset: 100,
            thickness: 250,
            offset: -250,
            alignment: Inputs.IFC.wallAlignmentEnum.right,
            layerSet: "Block 250",
            wallType: "",
            joins: [],
            openings: [],
            clippings: 0,
        });
    });

    it("should give the axis in the plan of the wall's storey and the base above that storey's floor", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.spatial.addStorey({ model: ground, id: "first", elevation: 3000 });
        model = ifc.walls.add({ model, storey: "first", id: "upper", start: [0, 2000], end: [3000, 2000], baseOffset: 50 });

        // Act
        const parameters = ifc.walls.parameters({ model, wall: "upper" });

        // Assert
        expect([parameters.start, parameters.end, parameters.baseOffset]).toEqual([[0, 2000], [3000, 2000], 50]);
    });

    it("should list the walls a wall is joined to, and where on each", () => {
        // Arrange
        const { ifc, model } = tee();

        // Act
        const main = ifc.walls.parameters({ model, wall: "main" });
        const partition = ifc.walls.parameters({ model, wall: "partition" });

        // Assert
        expect(main.joins).toEqual([{ other: ifc.model.globalIdOf({ model, id: "partition" }), at: Inputs.IFC.wallEndEnum.along, otherAt: Inputs.IFC.wallEndEnum.end }]);
        expect(partition.joins).toEqual([{ other: ifc.model.globalIdOf({ model, id: "main" }), at: Inputs.IFC.wallEndEnum.end, otherAt: Inputs.IFC.wallEndEnum.along }]);
    });

    it("should list a wall's openings and count the planes that clip it", () => {
        // Arrange
        const { ifc, model: wall } = oneWall();
        let model = ifc.openings.add({ model: wall, wall: "south", id: "hatch", offset: 500, width: 600, height: 600 });
        model = ifc.walls.clipByPlane({ model, wall: "south", origin: [0, 0, 2500], normal: [0, -0.5, 1] });

        // Act
        const parameters = ifc.walls.parameters({ model, wall: "south" });

        // Assert
        expect([parameters.openings, parameters.clippings]).toEqual([[ifc.model.globalIdOf({ model, id: "hatch" })], 1]);
    });

    it("should read a wall another tool wrote with its layers on the negative side of its axis", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: OTHER_TOOL_FILE });

        // Act
        const parameters = ifc.walls.parameters({ model, wall: WALL_B });

        // Assert
        expect({ ...parameters, joins: undefined }).toEqual({
            globalId: WALL_B,
            name: "Wall B",
            storey: "0StoreyGlobalId0000003",
            start: [6, 0],
            end: [6, 4],
            height: 3,
            baseOffset: 0,
            thickness: 0.3,
            offset: -0.3,
            alignment: Inputs.IFC.wallAlignmentEnum.right,
            layerSet: "Wall 300",
            wallType: "",
            joins: undefined,
            openings: [],
            clippings: 0,
        });
    });

    it("should give no alignment for layers at an offset none of the alignments describe", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: OTHER_TOOL_FILE.replace("IFCMATERIALLAYERSETUSAGE(#44,.AXIS2.,.NEGATIVE.,0.,$)", "IFCMATERIALLAYERSETUSAGE(#44,.AXIS2.,.NEGATIVE.,0.1,$)") });

        // Act
        const parameters = ifc.walls.parameters({ model, wall: WALL_A });

        // Assert
        expect([parameters.alignment, round(parameters.offset)]).toEqual(["", -0.2]);
    });
});

describe("IFCWalls.edit", () => {
    it("should give a wall a new height and leave the model it was given as it was", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.walls.edit({ model, wall: "south", height: 3500 });

        // Assert
        expect([extrusionOf(changed, expressIdOf(changed, "south")).depth, extrusionOf(model, expressIdOf(model, "south")).depth]).toEqual([3500, 3000]);
    });

    it("should keep a wall on its side of the axis as its thickness changes", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.walls.edit({ model, wall: "south", thickness: 300 });

        // Assert
        const parameters = ifc.walls.parameters({ model: changed, wall: "south" });
        expect(footprintOfWall(changed, "south")).toEqual([[0, -300], [10000, -300], [10000, 0], [0, 0]]);
        expect([parameters.alignment, parameters.offset, parameters.thickness]).toEqual([Inputs.IFC.wallAlignmentEnum.right, -300, 300]);
    });

    it("should move a wall's layers to the side it is given", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.walls.edit({ model, wall: "south", alignment: Inputs.IFC.wallAlignmentEnum.center });

        // Assert
        expect(footprintOfWall(changed, "south")).toEqual([[0, -100], [10000, -100], [10000, 100], [0, 100]]);
    });

    it("should make a wall of a layer set it is given", () => {
        // Arrange
        const { ifc, model: wall } = oneWall();
        let model = ifc.materials.add({ model: wall, name: "Brick" });
        model = ifc.materials.addLayerSet({ model, name: "Brick 115", layers: [{ material: "Brick", thickness: 115 }] });

        // Act
        const changed = ifc.walls.edit({ model, wall: "south", layerSet: "Brick 115" });

        // Assert
        const parameters = ifc.walls.parameters({ model: changed, wall: "south" });
        expect([parameters.layerSet, parameters.thickness, parameters.offset]).toEqual(["Brick 115", 115, -115]);
    });

    it("should leave behind no layer set usage the wall no longer uses", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.walls.edit({ model, wall: "south", thickness: 300 });

        // Assert
        expect(countOf(changed, "IfcMaterialLayerSetUsage")).toBe(1);
    });

    it("should lengthen a wall from its free end and trim it at its joined end as a wall built that long is", () => {
        // Arrange
        const { ifc, model } = corner();
        const { model: built } = ((): { model: IfcModel } => {
            const { ifc: other, model: ground } = groundFloor();
            let longer = addRightWall(other, ground, "south", [-2000, 0], [10000, 0]);
            longer = addRightWall(other, longer, "east", [10000, 0], [10000, 8000]);
            return { model: other.walls.connect({ model: longer, wall: "south", other: "east" }) };
        })();

        // Act
        const changed = ifc.walls.edit({ model, wall: "south", start: [-2000, 0] });

        // Assert
        expect(footprintOfWall(changed, "south")).toEqual(footprintOfWall(built, "south"));
        expect(footprintOfWall(changed, "east")).toEqual(footprintOfWall(built, "east"));
        expect(roundedFrame(worldFrame(changed, "south"))).toEqual(roundedFrame(worldFrame(built, "south")));
    });

    it("should trim a T's stem again against the new face of the wall it ends on", () => {
        // Arrange
        const { ifc, model } = tee();
        const { ifc: other, model: ground } = groundFloor();
        let built = addCentredWall(other, ground, "main", [0, 0], [10000, 0], 400);
        built = addCentredWall(other, built, "partition", [5000, 4000], [5000, 0], 100);
        built = other.walls.connect({ model: built, wall: "partition", other: "main" });

        // Act
        const changed = ifc.walls.edit({ model, wall: "main", thickness: 400 });

        // Assert
        expect(footprintOfWall(changed, "partition")).toEqual(footprintOfWall(built, "partition"));
        expect(footprintOfWall(changed, "main")).toEqual(footprintOfWall(built, "main"));
    });

    it("should rebuild a T's stem at a new height and keep it trimmed against the wall it ends on", () => {
        // Arrange
        const { ifc, model } = tee();

        // Act
        const changed = ifc.walls.edit({ model, wall: "partition", height: 2400 });

        // Assert
        expect(footprintOfWall(changed, "partition")).toEqual(footprintOfWall(model, "partition"));
        expect(extrusionOf(changed, expressIdOf(changed, "partition")).depth).toBe(2400);
    });

    it("should refuse a base that lifts a wall clear of a wall it is joined to", () => {
        // Arrange
        const { ifc, model } = corner();

        // Act
        const error = errorFrom(() => ifc.walls.edit({ model, wall: "east", baseOffset: 3000 }));

        // Assert
        expect(error.message).toContain("which it is joined to; disconnect them first with walls.disconnect");
    });

    it.each([
        ["the stem's end away from the wall it ends on", "partition", { end: [5000, 1000] as Inputs.Base.Point2 }],
        ["the wall a stem ends on short of the stem", "main", { end: [4000, 0] as Inputs.Base.Point2 }],
    ] as const)("should refuse a change that takes %s", (_case, wall, change) => {
        // Arrange
        const { ifc, model } = tee();

        // Act
        const error = errorFrom(() => ifc.walls.edit({ model, wall, ...change }));

        // Assert
        expect(error.message).toContain("which it is joined to; disconnect them first with walls.disconnect");
    });

    it("should refuse a change that takes a wall away from a wall it is joined to", () => {
        // Arrange
        const { ifc, model } = corner();

        // Act
        const error = errorFrom(() => ifc.walls.edit({ model, wall: "east", start: [10000, 3000] }));

        // Assert
        expect(error.message).toContain("which it is joined to; disconnect them first with walls.disconnect");
    });

    it("should carry an opening with a wall whose start moves, keeping its offset from the start", () => {
        // Arrange
        const { ifc, model: wall } = oneWall();
        const model = ifc.openings.add({ model: wall, wall: "south", id: "hatch", offset: 2000, width: 900, height: 900 });

        // Act
        const changed = ifc.walls.edit({ model, wall: "south", start: [-1000, 0] });

        // Assert
        expect(worldFrame(changed, "hatch").origin[0]).toBe(1000);
    });

    it("should cut a door's opening through a thicker wall and keep the door centred in it, as in a wall built that thick", () => {
        // Arrange
        const { ifc, model } = withDoor(200);
        const { model: built } = withDoor(300);

        // Act
        const changed = ifc.walls.edit({ model, wall: "south", thickness: 300 });

        // Assert
        const openingOf = (of: IfcModel): number => refOf(modelOf(of).attribute(modelOf(of).byType("IfcRelFillsElement")[0]!.id, "RelatingOpeningElement"));
        expect(roundedFrame(worldFrame(changed, "front"))).toEqual(roundedFrame(worldFrame(built, "front")));
        expect(extrusionOf(changed, openingOf(changed)).depth).toBe(extrusionOf(built, openingOf(built)).depth);
    });

    it("should refuse a change that leaves an opening off the wall's end", () => {
        // Arrange
        const { ifc, model: wall } = oneWall();
        const model = ifc.openings.add({ model: wall, wall: "south", id: "hatch", offset: 8000, width: 1000, height: 900 });

        // Act
        const error = errorFrom(() => ifc.walls.edit({ model, wall: "south", end: [8500, 0] }));

        // Assert
        expect(error.message).toContain("would not fit on a wall 8500 long");
    });

    it("should keep a clipping plane where it was in the building when the wall moves", () => {
        // Arrange
        const { ifc, model: wall } = oneWall();
        const model = ifc.walls.clipByPlane({ model: wall, wall: "south", origin: [5000, 0, 2500], normal: [0.2, -0.3, 1] });

        // Act
        const changed = ifc.walls.edit({ model, wall: "south", start: [-1000, 1000], end: [9000, 2000], baseOffset: 300 });

        // Assert
        expect(clippingPlanes(changed, "south")).toEqual(clippingPlanes(model, "south"));
    });

    it("should raise a wall's base and its openings with it", () => {
        // Arrange
        const { ifc, model: wall } = oneWall();
        const model = ifc.openings.add({ model: wall, wall: "south", id: "hatch", offset: 2000, sill: 900, width: 900, height: 900 });

        // Act
        const changed = ifc.walls.edit({ model, wall: "south", baseOffset: 500 });

        // Assert
        expect([worldFrame(changed, "south").origin[2], worldFrame(changed, "hatch").origin[2]]).toEqual([500, 1400]);
    });

    it("should refuse a layer set of its own for a wall of a type", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.materials.addLayerSet({ model: ground, name: "Typed", layers: [{ thickness: 200 }] });
        model = ifc.walls.addType({ model, id: "type", layerSet: "Typed" });
        model = ifc.walls.add({ model, storey: "ground", id: "south", start: [0, 0], end: [5000, 0], wallType: "type" });

        // Act
        const error = errorFrom(() => ifc.walls.edit({ model, wall: "south", thickness: 300 }));

        // Assert
        expect(error.message).toContain("takes its layers from the IfcWallType 'Wall type'");
    });

    it("should edit a wall another tool wrote and keep its join", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.walls.connect({ model: ifc.model.read({ data: OTHER_TOOL_FILE }), wall: WALL_A, other: WALL_B });

        // Act
        const changed = ifc.walls.edit({ model, wall: WALL_A, height: 3.5 });

        // Assert
        const parameters = ifc.walls.parameters({ model: changed, wall: WALL_A });
        expect([parameters.height, parameters.joins.length]).toEqual([3.5, 1]);
    });
});

describe("IFCWalls.edit refusals", () => {
    it("should refuse a start and end that meet", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const error = errorFrom(() => ifc.walls.edit({ model, wall: "south", end: [0, 0] }));

        // Assert
        expect(error.message).toBe("A wall's start and end must be apart");
    });

    it("should refuse a height of zero", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const error = errorFrom(() => ifc.walls.edit({ model, wall: "south", height: 0 }));

        // Assert
        expect(error.message).toBe("A wall's height must be more than zero, got 0");
    });

    it("should refuse layers that add up to no thickness", () => {
        // Arrange
        const { ifc, model: wall } = oneWall();
        const model = ifc.materials.addLayerSet({ model: wall, name: "Nothing", layers: [{ thickness: 0 }] });

        // Act
        const error = errorFrom(() => ifc.walls.edit({ model, wall: "south", layerSet: "Nothing" }));

        // Assert
        expect(error.message).toBe("A wall's layers must add up to more than zero thickness");
    });

    it("should refuse a wall without a body", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: otherToolFileWith("#40=IFCPRODUCTDEFINITIONSHAPE($,$,(#33,#39));", "#40=IFCPRODUCTDEFINITIONSHAPE($,$,(#33));") });

        // Act
        const error = errorFrom(() => ifc.walls.edit({ model, wall: WALL_A, height: 4 }));

        // Assert
        expect(error.message).toBe("the IfcWallStandardCase 'Wall A' has no Body representation, so this library cannot rebuild it");
    });
});

describe("IFCWalls.edit with what other tools write", () => {
    it("should give a wall that shared its layer set usage one of its own and leave the other wall's alone", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: OTHER_TOOL_FILE });

        // Act
        const changed = ifc.walls.edit({ model, wall: WALL_A, thickness: 0.4 });

        // Assert
        expect([ifc.walls.parameters({ model: changed, wall: WALL_A }).thickness, ifc.walls.parameters({ model: changed, wall: WALL_B }).thickness]).toEqual([0.4, 0.3]);
    });

    it("should carry an opening it cannot read with a wall that only moves, when the opening is placed on the wall", () => {
        // Arrange
        const { ifc, model } = wallWithOpening("circle", "wall");

        // Act
        const changed = ifc.walls.edit({ model, wall: "south", start: [-1000, 0] });

        // Assert
        expect(worldFrame(changed, "odd").origin).toEqual([1000, 200, 500]);
    });

    it("should refuse a new thickness for a wall with an opening it cannot read", () => {
        // Arrange
        const { ifc, model } = wallWithOpening("circle", "wall");

        // Act
        const error = errorFrom(() => ifc.walls.edit({ model, wall: "south", thickness: 300 }));

        // Assert
        expect(error.message).toContain("is not an opening this library can carry with the wall");
    });

    it("should refuse to move a wall with an opening placed elsewhere, and still change its height", () => {
        // Arrange
        const { ifc, model } = wallWithOpening("rectangle", "storey");

        // Act
        const error = errorFrom(() => ifc.walls.edit({ model, wall: "south", start: [-1000, 0] }));
        const taller = ifc.walls.edit({ model, wall: "south", height: 3500 });

        // Assert
        expect(error.message).toContain("is not an opening this library can carry with the wall");
        expect(worldFrame(taller, "odd").origin).toEqual([2000, 200, 500]);
    });

    it("should keep a bounded half-space where it was in the building when the wall moves", () => {
        // Arrange
        const { ifc, model } = wallClippedBy("bounded");

        // Act
        const changed = ifc.walls.edit({ model, wall: "south", start: [-1000, 1000], end: [9000, 2000] });

        // Assert
        expect(clippingPlanes(changed, "south")).toEqual(clippingPlanes(model, "south"));
    });

    it("should refuse to move a wall a boxed half-space clips, and still change its height", () => {
        // Arrange
        const { ifc, model } = wallClippedBy("boxed");

        // Act
        const error = errorFrom(() => ifc.walls.edit({ model, wall: "south", start: [-1000, 0] }));
        const taller = ifc.walls.edit({ model, wall: "south", height: 3500 });

        // Assert
        expect(error.message).toBe("The wall is clipped by an IfcBoxedHalfSpace this library does not move with a wall");
        expect(ifc.walls.parameters({ model: taller, wall: "south" }).clippings).toBe(1);
    });

    it("should put a door in a wall placed apart from its axis, with its body raised, where it puts one in the same wall placed at its axis' start", () => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const [apart, atStart] = [WALL_B_PLACED_APART_FROM_ITS_AXIS, OTHER_TOOL_FILE].map((data) => withBackDoor(ifc, data));

        // Assert
        expect(roundedFrame(worldFrame(apart!, "back"))).toEqual(roundedFrame(worldFrame(atStart!, "back")));
        expect(planOf(ifc, apart!)).toEqual(planOf(ifc, atStart!));
    });

    it("should move and thicken a wall placed apart from its axis, and its door with it, as it does the same wall placed at its axis' start", () => {
        // Arrange
        const ifc = new IFCService();
        const models = [WALL_B_PLACED_APART_FROM_ITS_AXIS, OTHER_TOOL_FILE].map((data) => withBackDoor(ifc, data));

        // Act
        const [apart, atStart] = models.map((model) => ifc.walls.edit({ model, wall: WALL_B, start: [7, 0], end: [7, 5], thickness: 0.4 }));

        // Assert
        expect(roundedFrame(worldFrame(apart!, "back"))).toEqual(roundedFrame(worldFrame(atStart!, "back")));
        expect(planOf(ifc, apart!)).toEqual([7, 0, 7, 5, 3, 0, 0.4, -0.4]);
        expect(planOf(ifc, atStart!)).toEqual([7, 0, 7, 5, 3, 0, 0.4, -0.4]);
    });

    it("should carry an opening it cannot read with a wall placed apart from its axis as it carries one with the same wall placed at its axis' start", () => {
        // Arrange
        const ifc = new IFCService();
        const models = [WALL_B_PLACED_APART_FROM_ITS_AXIS, OTHER_TOOL_FILE].map((data) => withRoundHole(ifc, data));

        // Act
        const [apart, atStart] = models.map((model) => ifc.walls.edit({ model, wall: WALL_B, start: [7, 1], end: [7, 5] }));

        // Assert
        expect(roundedFrame(worldFrame(apart!, "hole"))).toEqual(roundedFrame(worldFrame(atStart!, "hole")));
        expect(worldFrame(apart!, "hole").origin.map(round)).toEqual([6.85, 3, 1.5]);
    });

    it("should refuse a wall whose axis does not run along its placement's X axis, as IFC offsets a wall's layers along the placement's Y axis", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: WALL_B_AXIS_ALONG_ITS_PLACEMENT_Y });

        // Act
        const error = errorFrom(() => ifc.walls.parameters({ model, wall: WALL_B }));

        // Assert
        expect(error.message).toBe("the IfcWallStandardCase 'Wall B' has an axis that does not run along its placement's X axis, so the layers IFC offsets along that placement's Y axis do not lie across it");
    });

    it("should keep a door hung on its wall's placement, and one in an opening another tool framed otherwise, centred in a thicker wall", () => {
        // Arrange
        const expected = doorAndOpeningFrames(withDoor(300).model);
        const fixtures = [rehungDoor("wall", 3000), rehungDoor("reframed opening", 3000)];

        // Act
        const changed = fixtures.map(({ ifc, model }) => ifc.walls.edit({ model, wall: "south", thickness: 300 }));

        // Assert
        expect(changed.map(doorAndOpeningFrames)).toEqual([expected, expected]);
    });

    it("should refuse to move or thicken a wall whose door hangs on its storey, and still change its height", () => {
        // Arrange
        const { ifc, model } = rehungDoor("storey", 3000);

        // Act
        const moved = errorFrom(() => ifc.walls.edit({ model, wall: "south", start: [-1000, 0] }));
        const thickened = errorFrom(() => ifc.walls.edit({ model, wall: "south", thickness: 300 }));
        const taller = ifc.walls.edit({ model, wall: "south", height: 3500 });

        // Assert
        expect([moved, thickened].every((error) => error.message.endsWith("is not an opening this library can carry with the wall, so the wall cannot change this way"))).toBe(true);
        expect(doorAndOpeningFrames(taller)).toEqual(doorAndOpeningFrames(model));
    });
});

describe("IFCWalls.disconnect", () => {
    it("should square both ends an L join trimmed", () => {
        // Arrange
        const { ifc, model } = corner();
        const { ifc: other, model: ground } = groundFloor();
        let apart = addRightWall(other, ground, "south", [0, 0], [10000, 0]);
        apart = addRightWall(other, apart, "east", [10000, 0], [10000, 8000]);

        // Act
        const changed = ifc.walls.disconnect({ model, wall: "east", other: "south" });

        // Assert
        expect([footprintOfWall(changed, "south"), footprintOfWall(changed, "east")]).toEqual([footprintOfWall(apart, "south"), footprintOfWall(apart, "east")]);
        expect(countOf(changed, "IfcRelConnectsPathElements")).toBe(0);
    });

    it("should rebuild only the stem of a T and leave the wall it ended on as it was", () => {
        // Arrange
        const { ifc, model } = tee();
        const mainBody = unwrapBody(model, expressIdOf(model, "main")).solid;

        // Act
        const changed = ifc.walls.disconnect({ model, wall: "main", other: "partition" });

        // Assert
        expect(footprintOfWall(changed, "partition")).toEqual([[0, -50], [4000, -50], [4000, 50], [0, 50]]);
        expect(unwrapBody(changed, expressIdOf(changed, "main")).solid).toBe(mainBody);
    });

    it("should refuse two walls that are not joined", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = addRightWall(ifc, ground, "south", [0, 0], [10000, 0]);
        model = addRightWall(ifc, model, "north", [0, 8000], [10000, 8000]);

        // Act
        const error = errorFrom(() => ifc.walls.disconnect({ model, wall: "south", other: "north" }));

        // Assert
        expect(error.message).toMatch(/^the IfcWall \S+ and the IfcWall \S+ are not joined$/);
    });
});
