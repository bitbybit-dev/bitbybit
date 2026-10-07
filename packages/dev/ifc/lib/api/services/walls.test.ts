import { describe, expect, it } from "vitest";
import type { Fixture } from "../../__test__/fixture-types";
import { modelOf } from "./service-support";
import { addCentredWall, addRightWall, errorFrom, expressIdOf, groundFloor, notAModel, oneWall, TIME_STAMP } from "../../__test__/build-setup";
import {
    axisPointsOf, bodyOf, countOf, enumOf, extrusionOf, footprintOf, layerThicknessesOf, materialOf, objectPlacementOf, onlyOf,
    placementOf, refOf, relatedBy, rounded, unwrapBody, axisPlacementOf,
} from "../../__test__/build-geometry";
import { findLayerSet } from "../../build/materials";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";

const SQUARE_ROOT_HALF = Math.SQRT1_2;

function layerSetNamed(model: IfcModel, name: string): number {
    const layerSet = findLayerSet(modelOf(model), name);
    if (layerSet === undefined) {
        throw new Error(`No layer set named ${name}`);
    }
    return layerSet;
}

function lCorner(): Fixture {
    const { ifc, model: ground } = groundFloor();
    let model = addRightWall(ifc, ground, "south", [0, 0], [10000, 0]);
    model = addRightWall(ifc, model, "east", [10000, 0], [10000, 8000]);
    return { ifc, model };
}

function tee(): Fixture {
    const { ifc, model: ground } = groundFloor();
    let model = addCentredWall(ifc, ground, "main", [0, 0], [10000, 0], 200);
    model = addCentredWall(ifc, model, "partition", [5000, 4000], [5000, 0], 100);
    return { ifc, model };
}

function footprintOfWall(model: IfcModel, id: string): number[][] {
    return footprintOf(model, expressIdOf(model, id));
}

function connections(model: IfcModel): (string | number)[][] {
    return model.byType("IfcRelConnectsPathElements").map((rel) => [
        refOf(model.attribute(rel.id, "RelatingElement")),
        enumOf(model.attribute(rel.id, "RelatingConnectionType")),
        refOf(model.attribute(rel.id, "RelatedElement")),
        enumOf(model.attribute(rel.id, "RelatedConnectionType")),
    ]);
}

describe("IFCWalls.add", () => {
    it.each([
        [Inputs.IFC.wallAlignmentEnum.center, [[0, -100], [10000, -100], [10000, 100], [0, 100]], -100],
        [Inputs.IFC.wallAlignmentEnum.left, [[0, 0], [10000, 0], [10000, 200], [0, 200]], 0],
        [Inputs.IFC.wallAlignmentEnum.right, [[0, -200], [10000, -200], [10000, 0], [0, 0]], -200],
    ])("should lay the footprint of a wall aligned %s on its side of the axis", (alignment, footprint, offset) => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.walls.add({ model, storey: "ground", id: "south", start: [0, 0], end: [10000, 0], thickness: 200, alignment });

        // Assert
        const wall = expressIdOf(changed, "south");
        const usage = materialOf(changed, wall);
        expect(footprintOf(changed, wall)).toEqual(footprint);
        expect(changed.attribute(usage, "OffsetFromReferenceLine")).toBe(offset);
    });

    it("should centre a wall on its axis by default", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.walls.add({ model, storey: "ground", id: "south", start: [0, 0], end: [4000, 0] });

        // Assert
        expect(footprintOfWall(changed, "south")).toEqual([[0, -100], [4000, -100], [4000, 100], [0, 100]]);
        expect(extrusionOf(changed, expressIdOf(changed, "south")).depth).toBe(3000);
    });

    it("should lay the layers along the wall's second axis from the reference line", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = addRightWall(ifc, model, "south", [0, 0], [10000, 0]);

        // Assert
        const usage = materialOf(changed, expressIdOf(changed, "south"));
        expect(changed.typeOf(usage)).toBe("IfcMaterialLayerSetUsage");
        expect(enumOf(changed.attribute(usage, "LayerSetDirection"))).toBe("AXIS2");
        expect(enumOf(changed.attribute(usage, "DirectionSense"))).toBe("POSITIVE");
    });

    it("should draw the axis from the start to the end, as long as the wall", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = addRightWall(ifc, model, "diagonal", [1000, 2000], [4000, 6000]);

        // Assert
        expect(axisPointsOf(changed, expressIdOf(changed, "diagonal"))).toEqual([[0, 0], [5000, 0]]);
        expect(footprintOfWall(changed, "diagonal")).toEqual([[0, -200], [5000, -200], [5000, 0], [0, 0]]);
    });

    it("should place the wall at its start, along its axis, relative to its storey", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = addRightWall(ifc, model, "diagonal", [1000, 2000], [4000, 6000]);

        // Assert
        const placement = placementOf(changed, expressIdOf(changed, "diagonal"));
        expect(placement.relativeTo).toBe(objectPlacementOf(changed, expressIdOf(changed, "ground")));
        expect(placement.location).toEqual([1000, 2000, 0]);
        expect(placement.axis).toEqual([0, 0, 1]);
        expect(rounded([placement.refDirection ?? []])).toEqual([[0.6, 0.8, 0]]);
    });

    it("should write a wall along the X axis with the standard axes", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = addRightWall(ifc, model, "south", [500, 700], [10000, 700]);

        // Assert
        expect(placementOf(changed, expressIdOf(changed, "south"))).toEqual({
            relativeTo: objectPlacementOf(changed, expressIdOf(changed, "ground")),
            location: [500, 700, 0],
            axis: null,
            refDirection: null,
        });
    });

    it("should start the wall its base offset above the storey's floor", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.walls.add({ model, storey: "ground", id: "parapet", start: [0, 0], end: [3000, 0], height: 900, baseOffset: 2700 });

        // Assert
        const wall = expressIdOf(changed, "parapet");
        expect(placementOf(changed, wall).location).toEqual([0, 0, 2700]);
        expect(extrusionOf(changed, wall)).toEqual({ position: { location: [0, 0, 0], axis: null, refDirection: null }, direction: [0, 0, 1], depth: 900 });
    });

    it("should contain the wall in its storey", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.spatial.addStorey({ model: ground, id: "first", elevation: 3000 });

        // Act
        const changed = addRightWall(ifc, model, "upper", [0, 0], [10000, 0], "first");

        // Assert
        expect(ifc.model.element({ model: changed, element: "upper" }).storey).toBe(ifc.model.globalIdOf({ model, id: "first" }));
        expect(placementOf(changed, expressIdOf(changed, "upper")).relativeTo).toBe(objectPlacementOf(changed, expressIdOf(changed, "first")));
    });

    it("should mark a wall standard unless told otherwise", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        let changed = addRightWall(ifc, model, "south", [0, 0], [10000, 0]);
        changed = ifc.walls.add({ model: changed, storey: "ground", id: "core", start: [0, 3000], end: [5000, 3000], predefinedType: Inputs.IFC.wallPredefinedTypeEnum.shear });

        // Assert
        expect(enumOf(changed.attribute(expressIdOf(changed, "south"), "PredefinedType"))).toBe("STANDARD");
        expect(enumOf(changed.attribute(expressIdOf(changed, "core"), "PredefinedType"))).toBe("SHEAR");
    });

    it("should name the wall when given a name and leave it unnamed otherwise", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        let changed = ifc.walls.add({ model, storey: "ground", id: "named", name: "South", start: [0, 0], end: [1000, 0] });
        changed = ifc.walls.add({ model: changed, storey: "ground", id: "unnamed", start: [0, 1000], end: [1000, 1000] });

        // Assert
        expect(changed.attribute(expressIdOf(changed, "named"), "Name")).toBe("South");
        expect(changed.attribute(expressIdOf(changed, "unnamed"), "Name")).toBe(null);
    });

    it("should share one layer set named after the thickness between walls of that thickness", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        let changed = addRightWall(ifc, model, "south", [0, 0], [10000, 0]);
        changed = addRightWall(ifc, changed, "east", [10000, 0], [10000, 8000]);
        changed = addCentredWall(ifc, changed, "partition", [5000, 0], [5000, 8000], 100);

        // Assert
        const sets = changed.byType("IfcMaterialLayerSet").map((set) => changed.attribute(set.id, "LayerSetName"));
        expect(sets).toEqual(["Wall 200", "Wall 100"]);
        expect(layerThicknessesOf(changed, layerSetNamed(changed, "Wall 200"))).toEqual([200]);
        expect(["south", "east"].map((id) => refOf(changed.attribute(materialOf(changed, expressIdOf(changed, id)), "ForLayerSet"))))
            .toEqual([layerSetNamed(changed, "Wall 200"), layerSetNamed(changed, "Wall 200")]);
    });

    it("should make a wall given only a thickness that thick even when a layer set already has the name it would use", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.materials.addLayerSet({ model: ground, name: "Wall 200", layers: [{ thickness: 300 }] });

        // Act
        const changed = ifc.walls.add({ model, storey: "ground", id: "south", start: [0, 0], end: [1000, 0], thickness: 200, alignment: Inputs.IFC.wallAlignmentEnum.left });

        // Assert
        const named = layerSetNamed(changed, "Wall 200");
        const used = refOf(changed.attribute(materialOf(changed, expressIdOf(changed, "south")), "ForLayerSet"));
        expect(footprintOfWall(changed, "south")).toEqual([[0, 0], [1000, 0], [1000, 200], [0, 200]]);
        expect(used).not.toBe(named);
        expect(layerThicknessesOf(changed, named)).toEqual([300]);
        expect(layerThicknessesOf(changed, used)).toEqual([200]);
    });

    it("should make a wall of a named layer set instead of its thickness", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.materials.addLayerSet({ model: ground, name: "Thick", layers: [{ thickness: 150 }, { thickness: 150 }] });

        // Act
        const changed = ifc.walls.add({ model, storey: "ground", id: "south", start: [0, 0], end: [1000, 0], thickness: 200, layerSet: "Thick", alignment: Inputs.IFC.wallAlignmentEnum.left });

        // Assert
        expect(footprintOfWall(changed, "south")).toEqual([[0, 0], [1000, 0], [1000, 300], [0, 300]]);
        expect(countOf(changed, "IfcMaterialLayerSet")).toBe(1);
    });

    it("should make a wall of its type's layer set, preferring it to a layer set or thickness given", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.materials.addLayerSet({ model: ground, name: "Exterior", layers: [{ thickness: 115 }, { thickness: 100 }] });
        model = ifc.materials.addLayerSet({ model, name: "Thin", layers: [{ thickness: 50 }] });
        model = ifc.walls.addType({ model, id: "exterior", layerSet: "Exterior" });

        // Act
        const changed = ifc.walls.add({ model, storey: "ground", id: "south", start: [0, 0], end: [1000, 0], thickness: 200, layerSet: "Thin", wallType: "exterior", alignment: Inputs.IFC.wallAlignmentEnum.left });

        // Assert
        const wall = expressIdOf(changed, "south");
        expect(footprintOf(changed, wall)).toEqual([[0, 0], [1000, 0], [1000, 215], [0, 215]]);
        expect(refOf(changed.attribute(materialOf(changed, wall), "ForLayerSet"))).toBe(layerSetNamed(changed, "Exterior"));
    });

    it("should define a wall of a type by that type", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.materials.addLayerSet({ model: ground, name: "Exterior", layers: [{ thickness: 250 }] });
        model = ifc.walls.addType({ model, id: "exterior", layerSet: "Exterior" });

        // Act
        let changed = ifc.walls.add({ model, storey: "ground", id: "south", start: [0, 0], end: [1000, 0], wallType: "exterior" });
        changed = ifc.walls.add({ model: changed, storey: "ground", id: "north", start: [0, 5000], end: [1000, 5000], wallType: "exterior" });

        // Assert
        expect(relatedBy(changed, "IfcRelDefinesByType", "RelatingType", "RelatedObjects", expressIdOf(changed, "exterior")))
            .toEqual([expressIdOf(changed, "south"), expressIdOf(changed, "north")]);
    });

    it("should leave the model it was given as it was", () => {
        // Arrange
        const { ifc, model } = groundFloor();
        const size = model.size;

        // Act
        addRightWall(ifc, model, "south", [0, 0], [10000, 0]);

        // Assert
        expect(model.size).toBe(size);
        expect(countOf(model, "IfcWall")).toBe(0);
    });

    it("should refuse an alignment it does not know rather than centre the wall", () => {
        // Arrange
        const { ifc, model } = groundFloor();
        const lowerCase: unknown = "RIGHT";

        // Act & Assert
        expect(() => ifc.walls.add({ model, storey: "ground", start: [0, 0], end: [1000, 0], alignment: lowerCase as Inputs.IFC.wallAlignmentEnum })).toThrow("RIGHT");
    });

    it("should refuse a wall whose start and end are the same point", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => addRightWall(ifc, model, "dot", [100, 100], [100, 100])).toThrow("A wall's start and end must be apart");
    });

    it("should refuse a start that is not two finite numbers with a TypeError", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => addRightWall(ifc, model, "odd", [Number.NaN, 0], [100, 0])).toThrow(TypeError);
        expect(() => addRightWall(ifc, model, "odd", [0, 0], [100, Infinity])).toThrow(TypeError);
    });

    it.each([0, -200, Number.NaN])("should refuse a thickness of %s", (thickness) => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.walls.add({ model, storey: "ground", start: [0, 0], end: [1000, 0], thickness })).toThrow(RangeError);
    });

    it.each([0, -3000])("should refuse a height of %s", (height) => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.walls.add({ model, storey: "ground", start: [0, 0], end: [1000, 0], height })).toThrow("A wall's height must be more than zero");
    });

    it("should refuse a layer set of no thickness", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.materials.addLayerSet({ model: ground, name: "Membrane", layers: [{ thickness: 0 }] });

        // Act & Assert
        expect(() => ifc.walls.add({ model, storey: "ground", start: [0, 0], end: [1000, 0], layerSet: "Membrane" })).toThrow("more than zero thickness");
    });

    it("should refuse a storey the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => addRightWall(ifc, model, "south", [0, 0], [1000, 0], "attic")).toThrow("The model has no storey 'attic'");
    });

    it("should refuse a storey id that names another kind of object", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => addRightWall(ifc, model, "north", [0, 5000], [1000, 5000], "south")).toThrow("'south' is an IfcWall, not a storey");
    });

    it("should refuse a layer set the model does not have, naming it", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.walls.add({ model, storey: "ground", start: [0, 0], end: [1000, 0], layerSet: "Granite" })).toThrow("The model has no layer set named 'Granite'");
    });

    it("should refuse a wall type the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.walls.add({ model, storey: "ground", start: [0, 0], end: [1000, 0], wallType: "curtain" })).toThrow("The model has no wall type 'curtain'");
    });

    it("should refuse a second wall with the same id", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => addRightWall(ifc, model, "south", [0, 5000], [1000, 5000])).toThrow("the id 'south'");
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const { ifc } = groundFloor();

        // Act & Assert
        expect(() => addRightWall(ifc, notAModel(), "south", [0, 0], [1000, 0])).toThrow(TypeError);
    });
});

describe("IFCWalls.addType", () => {
    it("should add a wall type made of a layer set, declared in the project", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.materials.addLayerSet({ model: ground, name: "Exterior", layers: [{ thickness: 250 }] });

        // Act
        const changed = ifc.walls.addType({ model, id: "exterior", name: "Exterior 250", layerSet: "Exterior", predefinedType: Inputs.IFC.wallPredefinedTypeEnum.solidWall });

        // Assert
        const type = expressIdOf(changed, "exterior");
        expect(changed.typeOf(type)).toBe("IfcWallType");
        expect(changed.attribute(type, "Name")).toBe("Exterior 250");
        expect(enumOf(changed.attribute(type, "PredefinedType"))).toBe("SOLIDWALL");
        expect(materialOf(changed, type)).toBe(layerSetNamed(changed, "Exterior"));
        expect(relatedBy(changed, "IfcRelDeclares", "RelatingContext", "RelatedDefinitions", onlyOf(changed, "IfcProject"))).toEqual([type]);
    });

    it("should name a wall type Wall type and mark it standard by default", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.materials.addLayerSet({ model: ground, name: "Exterior", layers: [{ thickness: 250 }] });

        // Act
        const changed = ifc.walls.addType({ model, id: "exterior", layerSet: "Exterior" });

        // Assert
        const type = expressIdOf(changed, "exterior");
        expect(changed.attribute(type, "Name")).toBe("Wall type");
        expect(enumOf(changed.attribute(type, "PredefinedType"))).toBe("STANDARD");
    });

    it("should refuse a layer set the model does not have, naming it", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.walls.addType({ model, id: "exterior", layerSet: "Granite" })).toThrow("The model has no layer set named 'Granite'");
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const { ifc } = groundFloor();

        // Act & Assert
        expect(() => ifc.walls.addType({ model: notAModel(), layerSet: "Exterior" })).toThrow(TypeError);
    });
});

describe("IFCWalls.connect", () => {
    it("should mitre two right-aligned walls into a corner where one ends and the other starts", () => {
        // Arrange
        const { ifc, model } = lCorner();

        // Act
        const changed = ifc.walls.connect({ model, wall: "south", other: "east" });

        // Assert
        expect(footprintOfWall(changed, "south")).toEqual([[0, -200], [10200, -200], [10000, 0], [0, 0]]);
        expect(footprintOfWall(changed, "east")).toEqual([[-200, -200], [8000, -200], [8000, 0], [0, 0]]);
    });

    it("should record the corner as a path connection from the end of one wall to the start of the other", () => {
        // Arrange
        const { ifc, model } = lCorner();

        // Act
        const changed = ifc.walls.connect({ model, wall: "south", other: "east" });

        // Assert
        expect(connections(changed)).toEqual([[expressIdOf(changed, "south"), "ATEND", expressIdOf(changed, "east"), "ATSTART"]]);
    });

    it("should mitre the corner the same whichever wall is named first", () => {
        // Arrange
        const { ifc, model } = lCorner();

        // Act
        const changed = ifc.walls.connect({ model, wall: "east", other: "south" });

        // Assert
        expect(footprintOfWall(changed, "south")).toEqual([[0, -200], [10200, -200], [10000, 0], [0, 0]]);
        expect(footprintOfWall(changed, "east")).toEqual([[-200, -200], [8000, -200], [8000, 0], [0, 0]]);
    });

    it("should mitre two centred walls that start at the same corner", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = addCentredWall(ifc, ground, "south", [0, 0], [10000, 0], 200);
        model = addCentredWall(ifc, model, "west", [0, 0], [0, 8000], 200);

        // Act
        const changed = ifc.walls.connect({ model, wall: "south", other: "west" });

        // Assert
        expect(footprintOfWall(changed, "south")).toEqual([[-100, -100], [10000, -100], [10000, 100], [100, 100]]);
        expect(footprintOfWall(changed, "west")).toEqual([[100, -100], [8000, -100], [8000, 100], [-100, 100]]);
        expect(connections(changed)).toEqual([[expressIdOf(changed, "south"), "ATSTART", expressIdOf(changed, "west"), "ATSTART"]]);
    });

    it("should mitre a corner of walls on a raised storey as on the ground", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.spatial.addStorey({ model: ground, id: "first", elevation: 3000 });
        model = addRightWall(ifc, model, "south", [0, 0], [10000, 0], "first");
        model = addRightWall(ifc, model, "east", [10000, 0], [10000, 8000], "first");

        // Act
        const changed = ifc.walls.connect({ model, wall: "south", other: "east" });

        // Assert
        expect(footprintOfWall(changed, "south")).toEqual([[0, -200], [10200, -200], [10000, 0], [0, 0]]);
        expect(footprintOfWall(changed, "east")).toEqual([[-200, -200], [8000, -200], [8000, 0], [0, 0]]);
    });

    it("should cut a centred partition ending on another wall's axis back to that wall's near face", () => {
        // Arrange
        const { ifc, model } = tee();

        // Act
        const changed = ifc.walls.connect({ model, wall: "partition", other: "main" });

        // Assert
        expect(footprintOfWall(changed, "partition")).toEqual([[0, -50], [3900, -50], [3900, 50], [0, 50]]);
        expect(footprintOfWall(changed, "main")).toEqual([[0, -100], [10000, -100], [10000, 100], [0, 100]]);
    });

    it("should record a tee as a path connection from the partition's end to a point along the other wall", () => {
        // Arrange
        const { ifc, model } = tee();

        // Act
        const changed = ifc.walls.connect({ model, wall: "main", other: "partition" });

        // Assert
        expect(connections(changed)).toEqual([[expressIdOf(changed, "partition"), "ATEND", expressIdOf(changed, "main"), "ATPATH"]]);
        expect(footprintOfWall(changed, "partition")).toEqual([[0, -50], [3900, -50], [3900, 50], [0, 50]]);
    });

    it("should cut a partition that starts on another wall back to that wall's face on its side", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = addCentredWall(ifc, ground, "main", [0, 0], [10000, 0], 200);
        model = addCentredWall(ifc, model, "partition", [5000, 0], [5000, 4000], 100);

        // Act
        const changed = ifc.walls.connect({ model, wall: "partition", other: "main" });

        // Assert
        expect(footprintOfWall(changed, "partition")).toEqual([[100, -50], [4000, -50], [4000, 50], [100, 50]]);
    });

    it("should replace the connection when the same two walls are joined again", () => {
        // Arrange
        const { ifc, model } = lCorner();
        const joined = ifc.walls.connect({ model, wall: "south", other: "east" });

        // Act
        const again = ifc.walls.connect({ model: joined, wall: "south", other: "east" });
        const reversed = ifc.walls.connect({ model: again, wall: "east", other: "south" });

        // Assert
        expect(countOf(again, "IfcRelConnectsPathElements")).toBe(1);
        expect(countOf(reversed, "IfcRelConnectsPathElements")).toBe(1);
        expect(footprintOfWall(reversed, "south")).toEqual([[0, -200], [10200, -200], [10000, 0], [0, 0]]);
    });

    it("should drop the bodies a join replaces, so joining again does not grow the model", () => {
        // Arrange
        const { ifc, model } = lCorner();
        const joined = ifc.walls.connect({ model, wall: "south", other: "east" });

        // Act
        const again = ifc.walls.connect({ model: joined, wall: "south", other: "east" });
        const thrice = ifc.walls.connect({ model: again, wall: "east", other: "south" });

        // Assert
        expect(countOf(joined, "IfcShapeRepresentation")).toBe(countOf(model, "IfcShapeRepresentation"));
        expect(countOf(again, "IfcShapeRepresentation")).toBe(countOf(joined, "IfcShapeRepresentation"));
        expect(countOf(thrice, "IfcExtrudedAreaSolid")).toBe(2);
        expect(again.size).toBe(joined.size);
        expect(thrice.size).toBe(joined.size);
    });

    it("should keep every wall's own body in its shape after a join", () => {
        // Arrange
        const { ifc, model } = lCorner();

        // Act
        const changed = ifc.walls.connect({ model, wall: "south", other: "east" });

        // Assert
        for (const id of ["south", "east"]) {
            const wall = expressIdOf(changed, id);
            expect(changed.typeOf(bodyOf(changed, wall))).toBe("IfcShapeRepresentation");
            expect(axisPointsOf(changed, wall)[0]).toEqual([0, 0]);
        }
    });

    it("should join walls of a model read back from its file as it joins them in memory", () => {
        // Arrange
        const { ifc, model } = lCorner();
        const back = ifc.model.read({ data: ifc.model.write({ model, timeStamp: TIME_STAMP }) });

        // Act
        const joinedBack = ifc.walls.connect({ model: back, wall: "south", other: "east" });
        const joined = ifc.walls.connect({ model, wall: "south", other: "east" });

        // Assert
        expect(footprintOfWall(joinedBack, "south")).toEqual([[0, -200], [10200, -200], [10000, 0], [0, 0]]);
        const newGlobalIds = (text: string): string => text.replace(/IFCRELCONNECTSPATHELEMENTS\('[0-9A-Za-z_$]{22}'/g, "IFCRELCONNECTSPATHELEMENTS('new'");
        expect(newGlobalIds(ifc.model.write({ model: joinedBack, timeStamp: TIME_STAMP }))).toBe(newGlobalIds(ifc.model.write({ model: joined, timeStamp: TIME_STAMP })));
    });

    it("should leave the model it was given as it was", () => {
        // Arrange
        const { ifc, model } = lCorner();

        // Act
        ifc.walls.connect({ model, wall: "south", other: "east" });

        // Assert
        expect(footprintOfWall(model, "south")).toEqual([[0, -200], [10000, -200], [10000, 0], [0, 0]]);
        expect(countOf(model, "IfcRelConnectsPathElements")).toBe(0);
    });

    it("should refuse to join walls that do not meet", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = addRightWall(ifc, ground, "south", [0, 0], [5000, 0]);
        model = addRightWall(ifc, model, "north", [0, 3000], [5000, 3000]);

        // Act & Assert
        expect(() => ifc.walls.connect({ model, wall: "south", other: "north" })).toThrow("The walls do not meet");
    });

    it("should refuse to join walls that meet in plan but stand on storeys at different heights", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.spatial.addStorey({ model: ground, id: "upper", elevation: 4000 });
        model = addRightWall(ifc, model, "south", [0, 0], [10000, 0]);
        model = addRightWall(ifc, model, "east", [10000, 0], [10000, 8000], "upper");

        // Act & Assert
        expect(() => ifc.walls.connect({ model, wall: "south", other: "east" })).toThrow("The walls do not meet");
    });

    it.each([
        ["ends beyond the other wall's end", [10500, 4000], [10500, 0]],
        ["stops short of the other wall by more than the thicker wall's thickness", [5000, 4000], [5000, 500]],
    ] as const)("should refuse a partition that %s, as it makes no T", (_case, start, end) => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = addCentredWall(ifc, ground, "main", [0, 0], [10000, 0], 200);
        model = addCentredWall(ifc, model, "partition", [start[0], start[1]], [end[0], end[1]], 100);

        // Act
        const error = errorFrom(() => ifc.walls.connect({ model, wall: "partition", other: "main" }));

        // Assert
        expect(error.message).toBe("The walls do not meet: neither ends at the other's end or along its length");
    });

    it("should refuse to join a partition's end to a wall's length when that end already makes a corner", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = addCentredWall(ifc, ground, "main", [0, 0], [10000, 0], 200);
        model = addCentredWall(ifc, model, "partition", [5000, 4000], [5000, 0], 100);
        model = addCentredWall(ifc, model, "return", [5000, 0], [7000, 0], 100);
        model = ifc.walls.connect({ model, wall: "partition", other: "return" });

        // Act
        const error = errorFrom(() => ifc.walls.connect({ model, wall: "partition", other: "main" }));

        // Assert
        expect(error.message).toMatch(/^The end of the IfcWall \S+ is already joined to the IfcWall \S+; a wall end joins one other wall$/);
    });

    it("should refuse to join a wall to itself", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.walls.connect({ model, wall: "south", other: "south" })).toThrow("A wall cannot be joined to itself");
    });

    it("should refuse a join that leaves a wall no length on its inner face", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const left = Inputs.IFC.wallAlignmentEnum.left;
        let model = ifc.walls.add({ model: ground, storey: "ground", id: "short", start: [0, 0], end: [300, 0], thickness: 200, alignment: left });
        model = ifc.walls.add({ model, storey: "ground", id: "east", start: [300, 0], end: [300, 5000], thickness: 200, alignment: left });
        model = ifc.walls.add({ model, storey: "ground", id: "west", start: [0, 5000], end: [0, 0], thickness: 200, alignment: left });
        model = ifc.walls.connect({ model, wall: "short", other: "east" });

        // Act
        const error = errorFrom(() => ifc.walls.connect({ model, wall: "west", other: "short" }));

        // Assert
        expect(error.message).toContain("too short for the walls it meets");
    });

    it("should refuse a wall the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.walls.connect({ model, wall: "south", other: "garden" })).toThrow("The model has no wall 'garden'");
        expect(() => ifc.walls.connect({ model, wall: "garden", other: "south" })).toThrow("The model has no wall 'garden'");
    });

    it("should refuse an id that names something other than a wall", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.walls.connect({ model, wall: "south", other: "ground" })).toThrow("'ground' is an IfcBuildingStorey, not a wall");
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const { ifc } = groundFloor();

        // Act & Assert
        expect(() => ifc.walls.connect({ model: notAModel(), wall: "south", other: "east" })).toThrow(TypeError);
    });
});

describe("IFCWalls.clipByPlane", () => {
    it("should wrap the body in a clipping that subtracts a half space on the normal's side", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.walls.clipByPlane({ model, wall: "south", origin: [0, 0, 2600], normal: [0, -0.5, 1] });

        // Assert
        const wall = expressIdOf(changed, "south");
        const { solid, clippings, halfSpaces } = unwrapBody(changed, wall);
        const [clipping] = clippings;
        const [halfSpace] = halfSpaces;
        expect(clippings).toHaveLength(1);
        expect(changed.typeOf(solid)).toBe("IfcExtrudedAreaSolid");
        expect(enumOf(changed.attribute(clipping ?? 0, "Operator"))).toBe("DIFFERENCE");
        expect(changed.typeOf(halfSpace ?? 0)).toBe("IfcHalfSpaceSolid");
        expect(changed.attribute(halfSpace ?? 0, "AgreementFlag")).toBe(false);
        expect(changed.attribute(bodyOf(changed, wall), "RepresentationType")).toBe("Clipping");
    });

    it("should put the plane through the origin, given in the storey, in the wall's own coordinates", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.spatial.addStorey({ model: ground, id: "first", elevation: 3000 });
        model = addRightWall(ifc, model, "gable", [2000, 1000], [2000, 6000], "first");

        // Act
        const changed = ifc.walls.clipByPlane({ model, wall: "gable", origin: [2000, 1000, 2600], normal: [1, 0, 1] });

        // Assert
        const [halfSpace] = unwrapBody(changed, expressIdOf(changed, "gable")).halfSpaces;
        const plane = refOf(changed.attribute(halfSpace ?? 0, "BaseSurface"));
        const position = axisPlacementOf(changed, refOf(changed.attribute(plane, "Position")));
        expect(changed.typeOf(plane)).toBe("IfcPlane");
        expect(rounded([position.location])).toEqual([[0, 0, 2600]]);
        expect(rounded([position.axis ?? []])).toEqual(rounded([[0, -SQUARE_ROOT_HALF, SQUARE_ROOT_HALF]]));
    });

    it("should cut the top off level with the default normal", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.walls.clipByPlane({ model, wall: "south", origin: [0, 0, 2600] });

        // Assert
        const [halfSpace] = unwrapBody(changed, expressIdOf(changed, "south")).halfSpaces;
        const plane = refOf(changed.attribute(halfSpace ?? 0, "BaseSurface"));
        expect(axisPlacementOf(changed, refOf(changed.attribute(plane, "Position")))).toEqual({ location: [0, 0, 2600], axis: null, refDirection: null });
    });

    it("should keep the wall's full height and footprint inside the clipping", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.walls.clipByPlane({ model, wall: "south", origin: [0, 0, 2600] });

        // Assert
        const wall = expressIdOf(changed, "south");
        expect(extrusionOf(changed, wall).depth).toBe(3000);
        expect(footprintOf(changed, wall)).toEqual([[0, -200], [10000, -200], [10000, 0], [0, 0]]);
    });

    it("should nest a second clipping around the first", () => {
        // Arrange
        const { ifc, model } = oneWall();
        const once = ifc.walls.clipByPlane({ model, wall: "south", origin: [0, 0, 2600], normal: [-1, 0, 1] });
        const [first] = unwrapBody(once, expressIdOf(once, "south")).halfSpaces;

        // Act
        const twice = ifc.walls.clipByPlane({ model: once, wall: "south", origin: [10000, 0, 2600], normal: [1, 0, 1] });

        // Assert
        const { solid, clippings, halfSpaces } = unwrapBody(twice, expressIdOf(twice, "south"));
        expect(clippings).toHaveLength(2);
        expect(halfSpaces).toHaveLength(2);
        expect(halfSpaces[0]).toBe(first);
        expect(twice.typeOf(solid)).toBe("IfcExtrudedAreaSolid");
    });

    it("should drop the body a clipping replaces", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.walls.clipByPlane({ model, wall: "south", origin: [0, 0, 2600] });

        // Assert
        expect(countOf(changed, "IfcShapeRepresentation")).toBe(countOf(model, "IfcShapeRepresentation"));
        expect(countOf(changed, "IfcExtrudedAreaSolid")).toBe(1);
    });

    it("should keep the clippings when the wall is joined afterwards", () => {
        // Arrange
        const { ifc, model } = lCorner();
        let clipped = ifc.walls.clipByPlane({ model, wall: "south", origin: [0, 0, 2600], normal: [0, -1, 1] });
        clipped = ifc.walls.clipByPlane({ model: clipped, wall: "south", origin: [0, 0, 2800] });
        const halfSpaces = unwrapBody(clipped, expressIdOf(clipped, "south")).halfSpaces;

        // Act
        const joined = ifc.walls.connect({ model: clipped, wall: "south", other: "east" });

        // Assert
        const wall = expressIdOf(joined, "south");
        expect(unwrapBody(joined, wall).halfSpaces).toEqual(halfSpaces);
        expect(joined.attribute(bodyOf(joined, wall), "RepresentationType")).toBe("Clipping");
        expect(footprintOf(joined, wall)).toEqual([[0, -200], [10200, -200], [10000, 0], [0, 0]]);
        expect(countOf(joined, "IfcBooleanClippingResult")).toBe(2);
    });

    it("should leave the model it was given as it was", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        ifc.walls.clipByPlane({ model, wall: "south", origin: [0, 0, 2600] });

        // Assert
        expect(unwrapBody(model, expressIdOf(model, "south")).clippings).toEqual([]);
    });

    it("should refuse a normal of no length", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.walls.clipByPlane({ model, wall: "south", origin: [0, 0, 2600], normal: [0, 0, 0] })).toThrow("A clipping plane needs a normal of some length");
    });

    it("should refuse an origin that is not three finite numbers with a TypeError", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.walls.clipByPlane({ model, wall: "south", origin: [0, Number.NaN, 2600] })).toThrow(TypeError);
    });

    it("should refuse a wall the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.walls.clipByPlane({ model, wall: "garden", origin: [0, 0, 2600] })).toThrow("The model has no wall 'garden'");
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const { ifc } = groundFloor();

        // Act & Assert
        expect(() => ifc.walls.clipByPlane({ model: notAModel(), wall: "south", origin: [0, 0, 2600] })).toThrow(TypeError);
    });
});
