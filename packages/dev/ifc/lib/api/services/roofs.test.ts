import { WORLD_AXES, composeAxes, pointToWorld, vectorToWorld } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { describe, expect, it } from "vitest";
import type { Fixture } from "../../__test__/fixture-types";
import { modelOf } from "./service-support";
import { errorFrom, expressIdOf, groundFloor, writingInto } from "../../__test__/build-setup";
import { OTHER_TOOL_FILE, WALL_A } from "../../__test__/other-tool-file";
import { bodySolidOf, countOf, enumOf, extrusionOf, layerThicknessesOf, materialOf, outerCurveOf, refOf, relatedBy, round, sweptAreaOf, unwrapBody } from "../../__test__/build-geometry";
import { bodyContext } from "../../build/contexts";
import { relate } from "../../build/relationships";
import { AGGREGATION } from "../../build/constants";
import { directionOf } from "../../build/placement";
import { absoluteFrame, axisPlacementFrame } from "../../build/placement";
import { enumValue, ref } from "../../step/values";
import type { IfcModel } from "../../model/model-types";
import { IFCService } from "../ifc-service";
import * as Inputs from "../inputs";

const HOUSE: Inputs.Base.Point2[] = [[0, 0], [10000, 0], [10000, 8000], [0, 8000]];
const SQUARE: Inputs.Base.Point2[] = [[0, 0], [8000, 0], [8000, 8000], [0, 8000]];
const PITCH = 45;

function partsOf(model: IfcModel, roof: string): number[] {
    return relatedBy(model, "IfcRelAggregates", "RelatingObject", "RelatedObjects", expressIdOf(model, roof));
}

function undersideCorners(model: IfcModel, part: number): number[][] {
    const snapshot = modelOf(model);
    const solid = bodySolidOf(model, part);
    const frame = composeAxes(absoluteFrame(snapshot, refOf(snapshot.attribute(part, "ObjectPlacement"))), axisPlacementFrame(snapshot, refOf(snapshot.attribute(solid, "Position"))));
    return outerCurveOf(model, sweptAreaOf(model, part)).map((point) => pointToWorld(frame, [point[0]!, point[1]!, 0]).map(round));
}

function allCorners(model: IfcModel, roof: string): string[] {
    return [...new Set(partsOf(model, roof).flatMap((part) => undersideCorners(model, part)).map((point) => point.join(",")))].sort();
}

function upwardOf(model: IfcModel, part: number): number {
    const snapshot = modelOf(model);
    const solid = bodySolidOf(model, part);
    const frame = composeAxes(absoluteFrame(snapshot, refOf(snapshot.attribute(part, "ObjectPlacement"))), axisPlacementFrame(snapshot, refOf(snapshot.attribute(solid, "Position"))));
    return vectorToWorld(frame, directionOf(snapshot, snapshot.attribute(solid, "ExtrudedDirection"), [0, 0, 1]))[2];
}

function lowestClipAt(model: IfcModel, wall: string, point: Inputs.Base.Point2): number {
    const snapshot = modelOf(model);
    const frame = absoluteFrame(snapshot, refOf(snapshot.attribute(expressIdOf(model, wall), "ObjectPlacement")));
    return Math.min(...unwrapBody(model, expressIdOf(model, wall)).halfSpaces.map((halfSpace) => {
        const plane = composeAxes(frame, axisPlacementFrame(snapshot, refOf(snapshot.attribute(refOf(snapshot.attribute(halfSpace, "BaseSurface")), "Position"))));
        const [x, y, z] = plane.z;
        return plane.origin[2] - ((point[0] - plane.origin[0]) * x + (point[1] - plane.origin[1]) * y) / z;
    }));
}

function roofOver(outline: Inputs.Base.Point2[], kind: Inputs.IFC.roofKindEnum, overhang = 0): Fixture {
    const { ifc, model } = groundFloor();
    return { ifc, model: ifc.roofs.add({ model, storey: "ground", id: "roof", outline, kind, pitch: PITCH, baseOffset: 3000, overhang }) };
}

describe("IFCRoofs.add", () => {
    it("should write a gable roof as an IfcRoof on its storey whose two slabs meet at a ridge over the middle", () => {
        // Act
        const { model } = roofOver(HOUSE, Inputs.IFC.roofKindEnum.gable);

        // Assert
        const roof = expressIdOf(model, "roof");
        const parts = partsOf(model, "roof");
        expect([enumOf(model.attribute(roof, "PredefinedType")), parts.length, ...parts.map((part) => enumOf(model.attribute(part, "PredefinedType")))]).toEqual(["GABLE_ROOF", 2, "ROOF", "ROOF"]);
        expect(relatedBy(model, "IfcRelContainedInSpatialStructure", "RelatingStructure", "RelatedElements", expressIdOf(model, "ground"))).toContain(roof);
        expect(allCorners(model, "roof")).toEqual(["0,0,3000", "0,4000,7000", "0,8000,3000", "10000,0,3000", "10000,4000,7000", "10000,8000,3000"]);
    });

    it("should lower the eaves along the slope by the overhang and keep the ridge where it was", () => {
        // Act
        const { model } = roofOver(HOUSE, Inputs.IFC.roofKindEnum.gable, 500);

        // Assert
        expect(allCorners(model, "roof")).toEqual(["-500,-500,2500", "-500,4000,7000", "-500,8500,2500", "10500,-500,2500", "10500,4000,7000", "10500,8500,2500"]);
    });

    it("should slope a mono-pitch roof up from the outline's first side", () => {
        // Act
        const { model } = roofOver(HOUSE, Inputs.IFC.roofKindEnum.monoPitch);

        // Assert
        expect(allCorners(model, "roof")).toEqual(["0,0,3000", "0,8000,11000", "10000,0,3000", "10000,8000,11000"]);
    });

    it("should hip a roof on all four sides, its ridge along the longer sides", () => {
        // Act
        const { model } = roofOver(HOUSE, Inputs.IFC.roofKindEnum.hip);

        // Assert
        expect([partsOf(model, "roof").length, ...allCorners(model, "roof")]).toEqual([4, "0,0,3000", "0,8000,3000", "10000,0,3000", "10000,8000,3000", "4000,4000,7000", "6000,4000,7000"]);
    });

    it("should hip a roof whose first side is the shorter one along its longer sides", () => {
        // Act
        const { model } = roofOver([[0, 0], [0, -8000], [10000, -8000], [10000, 0]], Inputs.IFC.roofKindEnum.hip);

        // Assert
        expect(allCorners(model, "roof")).toContain("4000,-4000,7000");
    });

    it("should bring a hip roof over a square to a point", () => {
        // Act
        const { model } = roofOver(SQUARE, Inputs.IFC.roofKindEnum.hip);

        // Assert
        expect([partsOf(model, "roof").map((part) => undersideCorners(model, part).length), allCorners(model, "roof")]).toEqual([[3, 3, 3, 3], ["0,0,3000", "0,8000,3000", "4000,4000,7000", "8000,0,3000", "8000,8000,3000"]]);
    });

    it("should lay a flat roof level at its base, as far out as its overhang", () => {
        // Act
        const { model } = roofOver(HOUSE, Inputs.IFC.roofKindEnum.flat, 300);

        // Assert
        expect([enumOf(model.attribute(expressIdOf(model, "roof"), "PredefinedType")), ...allCorners(model, "roof")]).toEqual(["FLAT_ROOF", "-300,-300,3000", "-300,8300,3000", "10300,-300,3000", "10300,8300,3000"]);
    });

    it("should slope a gable over a clockwise outline as over the same rectangle anticlockwise, each part rising from its underside", () => {
        // Act
        const { model } = roofOver([[0, 0], [10000, 0], [10000, -8000], [0, -8000]], Inputs.IFC.roofKindEnum.gable);

        // Assert
        expect(allCorners(model, "roof")).toEqual(["0,-4000,7000", "0,-8000,3000", "0,0,3000", "10000,-4000,7000", "10000,-8000,3000", "10000,0,3000"]);
        expect(partsOf(model, "roof").map((part) => round(upwardOf(model, part)))).toEqual([round(Math.SQRT1_2), round(Math.SQRT1_2)]);
    });

    it("should extrude every part square to its slope through the roof's layers, laid up from the underside, a single layer as thick as a slab by default", () => {
        // Act
        const { model } = roofOver(HOUSE, Inputs.IFC.roofKindEnum.hip);

        // Assert
        const parts = partsOf(model, "roof");
        const usage = materialOf(model, parts[0]!);
        expect(parts.map((part) => [extrusionOf(model, part).depth, round(upwardOf(model, part)), materialOf(model, part)])).toEqual(Array(4).fill([200, round(Math.SQRT1_2), usage]));
        expect([enumOf(model.attribute(usage, "LayerSetDirection")), enumOf(model.attribute(usage, "DirectionSense")), model.attribute(usage, "OffsetFromReferenceLine")]).toEqual(["AXIS3", "POSITIVE", 0]);
        expect(layerThicknessesOf(model, refOf(model.attribute(usage, "ForLayerSet")))).toEqual([200]);
    });

    it.each([
        [[[0, 0], [10000, 0], [10000, 8000], [5000, 9000], [0, 8000]], "A roof's outline is a rectangle of 4 corners, got 5"],
        [[[0, 0], [10000, 0], [11000, 8000], [0, 8000]], "A roof's outline is a rectangle, and its corner 1 is not a right angle"],
    ] as const)("should refuse the outline %j", (outline, message) => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const error = errorFrom(() => ifc.roofs.add({ model, storey: "ground", outline: outline.map((point): Inputs.Base.Point2 => [point[0], point[1]]) }));

        // Assert
        expect(error.message).toBe(message);
    });

    it.each([
        [{ pitch: 0 }, "A sloped roof's pitch is more than 0 and at most 89 degrees, got 0"],
        [{ pitch: 90 }, "A sloped roof's pitch is more than 0 and at most 89 degrees, got 90"],
        [{ overhang: -100 }, "A roof's overhang is zero or more, got -100"],
    ])("should refuse %j", (change, message) => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const error = errorFrom(() => ifc.roofs.add({ model, storey: "ground", outline: HOUSE, ...change }));

        // Assert
        expect(error.message).toBe(message);
    });

    it("should refuse layers that add up to no thickness", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.materials.addLayerSet({ model: ground, name: "Nothing", layers: [{ thickness: 0 }] });

        // Act
        const error = errorFrom(() => ifc.roofs.add({ model, storey: "ground", outline: HOUSE, layerSet: "Nothing" }));

        // Assert
        expect(error.message).toBe("A roof's layers must add up to more than zero thickness");
    });

    it("should take its parts with it when the roof is removed or moved", () => {
        // Arrange
        const { ifc, model } = roofOver(HOUSE, Inputs.IFC.roofKindEnum.gable);

        // Act
        const removed = ifc.model.remove({ model, element: "roof" });
        const moved = ifc.model.move({ model, element: "roof", translation: [0, 0, 1000] });

        // Assert
        expect([countOf(removed, "IfcRoof"), countOf(removed, "IfcSlab")]).toEqual([0, 0]);
        expect(allCorners(moved, "roof")).toContain("0,4000,8000");
    });
});

describe("IFCWalls.clipByRoof", () => {
    function houseUnderGable(): Fixture {
        const { ifc, model: roofed } = roofOver(HOUSE, Inputs.IFC.roofKindEnum.gable);
        let model = ifc.walls.add({ model: roofed, storey: "ground", id: "south", start: [0, 0], end: [10000, 0], height: 3000, thickness: 200, alignment: Inputs.IFC.wallAlignmentEnum.left });
        model = ifc.walls.add({ model, storey: "ground", id: "west", start: [0, 8000], end: [0, 0], height: 7500, thickness: 200, alignment: Inputs.IFC.wallAlignmentEnum.left });
        return { ifc, model };
    }

    it("should cut a wall under a gable to the gable's triangle by both slopes", () => {
        // Arrange
        const { ifc, model } = houseUnderGable();

        // Act
        const changed = ifc.walls.clipByRoof({ model, wall: "west", roof: "roof" });

        // Assert
        expect(unwrapBody(changed, expressIdOf(changed, "west")).halfSpaces).toHaveLength(2);
    });

    it("should clip a gable wall to the lower slope at every point, the two meeting at the ridge's height over the middle", () => {
        // Arrange
        const { ifc, model } = houseUnderGable();

        // Act
        const changed = ifc.walls.clipByRoof({ model, wall: "west", roof: "roof" });

        // Assert
        expect([0, 2000, 4000, 6000, 8000].map((y) => round(lowestClipAt(changed, "west", [100, y])))).toEqual([3000, 5000, 7000, 5000, 3000]);
    });

    it("should clip a wall once by two parts that lie in the same plane", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.roofs.add({ model: ground, storey: "ground", id: "roof", outline: HOUSE, kind: Inputs.IFC.roofKindEnum.flat, baseOffset: 2500 });
        model = ifc.walls.add({ model, storey: "ground", id: "wall", start: [0, 0], end: [10000, 0], height: 3000 });
        const { tx, writer } = writingInto(model);
        const part = partsOf(model, "roof")[0]!;
        const twin = writer.create("IfcSlab", { GlobalId: tx.globalId("twin"), ObjectPlacement: model.attribute(part, "ObjectPlacement"), Representation: model.attribute(part, "Representation"), PredefinedType: enumValue("ROOF") });
        relate(tx, writer, AGGREGATION, expressIdOf(model, "roof"), [twin]);
        model = tx.commit();

        // Act
        const changed = ifc.walls.clipByRoof({ model, wall: "wall", roof: "roof" });

        // Assert
        expect([partsOf(changed, "roof").length, unwrapBody(changed, expressIdOf(changed, "wall")).halfSpaces.length]).toEqual([2, 1]);
    });

    it("should refuse a roof whose underside is below the wall's bottom at every corner, as clipping by it would leave nothing", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.roofs.add({ model: ground, storey: "ground", id: "roof", outline: HOUSE, kind: Inputs.IFC.roofKindEnum.flat, baseOffset: 0 });
        model = ifc.walls.add({ model, storey: "ground", id: "wall", start: [0, 0], end: [10000, 0], baseOffset: 500 });

        // Act
        const error = errorFrom(() => ifc.walls.clipByRoof({ model, wall: "wall", roof: "roof" }));

        // Assert
        expect(error.message).toMatch(/^The underside of the IfcSlab \S+ is below the bottom of the IfcWall \S+, so clipping by it would leave nothing of the wall$/);
    });

    it("should leave a wall under the eaves alone when no slope cuts it", () => {
        // Arrange
        const { ifc, model } = houseUnderGable();

        // Act
        const changed = ifc.walls.clipByRoof({ model, wall: "south", roof: "roof" });

        // Assert
        expect(unwrapBody(changed, expressIdOf(changed, "south")).halfSpaces).toHaveLength(0);
    });

    it("should change nothing when a wall is clipped under the same roof again", () => {
        // Arrange
        const { ifc, model: house } = houseUnderGable();
        const model = ifc.walls.clipByRoof({ model: house, wall: "west", roof: "roof" });

        // Act
        const again = ifc.walls.clipByRoof({ model, wall: "west", roof: "roof" });

        // Assert
        expect(unwrapBody(again, expressIdOf(again, "west")).halfSpaces).toEqual(unwrapBody(model, expressIdOf(model, "west")).halfSpaces);
    });

    it("should cut a wall along a mono-pitch roof's slope", () => {
        // Arrange
        const { ifc, model: roofed } = roofOver(HOUSE, Inputs.IFC.roofKindEnum.monoPitch);
        const model = ifc.walls.add({ model: roofed, storey: "ground", id: "west", start: [0, 8000], end: [0, 0], height: 12000, thickness: 200, alignment: Inputs.IFC.wallAlignmentEnum.right });

        // Act
        const changed = ifc.walls.clipByRoof({ model, wall: "west", roof: "roof" });

        // Assert
        expect(ifc.walls.parameters({ model: changed, wall: "west" }).clippings).toBe(1);
    });

    function handMadeRoof(part: "none" | "block" | "upright"): Fixture {
        const { ifc, model: ground } = groundFloor();
        let model = ifc.walls.add({ model: ground, storey: "ground", id: "wall", start: [0, 0], end: [5000, 0], height: 6000 });
        const { tx, writer } = writingInto(model);
        const roof = writer.create("IfcRoof", { GlobalId: tx.globalId("roof"), ObjectPlacement: ref(writer.localPlacement(undefined, WORLD_AXES)) });
        if (part !== "none") {
            const item = part === "block"
                ? writer.create("IfcBlock", { Position: ref(writer.placement3(WORLD_AXES)), XLength: 5000, YLength: 1000, ZLength: 200 })
                : writer.extrusion(writer.profile({ outer: [[0, 0], [5000, 0], [5000, 1000], [0, 1000]], holes: [] }), { origin: [0, 0, 0], x: [1, 0, 0], y: [0, 0, 1], z: [0, -1, 0] }, 200);
            const body = writer.shapeRepresentation(bodyContext(tx, writer), "Body", part === "block" ? "CSG" : "SweptSolid", [item]);
            const slab = writer.create("IfcSlab", { GlobalId: tx.globalId("part"), ObjectPlacement: ref(writer.localPlacement(undefined, WORLD_AXES)), Representation: ref(writer.productShape([body])), PredefinedType: enumValue("ROOF") });
            relate(tx, writer, AGGREGATION, roof, [slab]);
        }
        model = tx.commit();
        return { ifc, model };
    }

    it.each([
        ["none", "has no parts to clip a wall with"],
        ["block", "has no body this library clips with"],
        ["upright", "stands upright, so it is no roof plane to clip with"],
    ] as const)("should refuse a roof whose parts are %s", (part, message) => {
        // Arrange
        const { ifc, model } = handMadeRoof(part);

        // Act
        const error = errorFrom(() => ifc.walls.clipByRoof({ model, wall: "wall", roof: "roof" }));

        // Assert
        expect(error.message).toContain(message);
    });

    it("should refuse a wall without a body", () => {
        // Arrange
        const ifc = new IFCService();
        const read = ifc.model.read({ data: OTHER_TOOL_FILE.replace("#40=IFCPRODUCTDEFINITIONSHAPE($,$,(#33,#39));", "#40=IFCPRODUCTDEFINITIONSHAPE($,$,(#33));") });
        const model = ifc.roofs.add({ model: read, storey: "0StoreyGlobalId0000003", id: "roof", outline: [[0, -0.3], [6, -0.3], [6, 4], [0, 4]], baseOffset: 3 });

        // Act
        const error = errorFrom(() => ifc.walls.clipByRoof({ model, wall: WALL_A, roof: "roof" }));

        // Assert
        expect(error.message).toBe("the IfcWallStandardCase 'Wall A' has no body to clip");
    });
});
