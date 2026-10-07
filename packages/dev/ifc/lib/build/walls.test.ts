import { describe, expect, it } from "vitest";
import { addRightWall, expressIdOf, groundFloor, writingInto } from "../__test__/build-setup";
import type { Fixture } from "../__test__/fixture-types";
import { firstOf, footprintOf, materialOf, objectPlacementOf, refOf, refsOf, representationNamed, representationsOf } from "../__test__/build-geometry";
import type { IfcModel } from "../model/model-types";
import { enumValue, ref } from "../step/values";
import type { EntityWriter } from "./entity-writer";
import type { IfcTransaction } from "../model/transaction";
import { layerSetFor } from "./materials";
import { clipWall, connectWalls } from "./walls";
import { readWall } from "./wall-geometry";

const TOLERANCE = 1e-3;
const PARALLEL = 1e-9;
const MITRED_SOUTH = [[0, -200], [10200, -200], [10000, 0], [0, 0]];

function corner(): Fixture {
    const { ifc, model: ground } = groundFloor();
    let model = addRightWall(ifc, ground, "south", [0, 0], [10000, 0]);
    model = addRightWall(ifc, model, "east", [10000, 0], [10000, 8000]);
    return { ifc, model };
}

function edited(model: IfcModel, change: (tx: IfcTransaction, writer: EntityWriter) => void): IfcModel {
    const { tx, writer } = writingInto(model);
    change(tx, writer);
    return tx.commit();
}

function joined(model: IfcModel): IfcModel {
    return edited(model, (tx, writer) => connectWalls(tx, writer, expressIdOf(model, "south"), expressIdOf(model, "east"), TOLERANCE, PARALLEL));
}

function withoutRepresentation(model: IfcModel, wall: number, identifier: string): IfcModel {
    return edited(model, (tx) => {
        const shape = refOf(tx.attribute(wall, "Representation"));
        const kept = representationsOf(model, wall).filter((representation) => model.attribute(representation, "RepresentationIdentifier") !== identifier);
        tx.update(shape, { Representations: kept.map(ref) });
    });
}

describe("connectWalls on walls other tools wrote", () => {
    it("should join a wall whose axis is a polyline of points", () => {
        // Arrange
        const { model: plain } = corner();
        const south = expressIdOf(plain, "south");
        const model = edited(plain, (tx, writer) => {
            const axis = representationNamed(plain, south, "Axis");
            const polyline = writer.create("IfcPolyline", { Points: [ref(writer.point([0, 0])), ref(writer.point([10000, 0]))] });
            tx.update(axis, { Items: [ref(polyline)] });
        });

        // Act
        const changed = joined(model);

        // Assert
        expect(footprintOf(changed, south)).toEqual(MITRED_SOUTH);
    });

    it("should read layers laid in the negative sense from the reference line", () => {
        // Arrange
        const { model: plain } = corner();
        const south = expressIdOf(plain, "south");
        const model = edited(plain, (tx) => {
            tx.update(materialOf(plain, south), { DirectionSense: enumValue("NEGATIVE"), OffsetFromReferenceLine: 0 });
        });

        // Act
        const geometry = readWall(writingInto(model).tx, south);

        // Assert
        expect([geometry.low, geometry.high]).toEqual([-200, 0]);
        expect(footprintOf(joined(model), south)).toEqual(MITRED_SOUTH);
    });

    it("should refuse to join a wall without an Axis representation", () => {
        // Arrange
        const { model: plain } = corner();
        const south = expressIdOf(plain, "south");
        const model = withoutRepresentation(plain, south, "Axis");

        // Act & Assert
        expect(() => joined(model)).toThrow(`has no Axis representation, so it is not a wall this library can edit`);
    });

    it("should refuse to join a wall that is not upright", () => {
        // Arrange
        const { model: plain } = corner();
        const south = expressIdOf(plain, "south");
        const model = edited(plain, (tx, writer) => {
            const relative = refOf(tx.attribute(objectPlacementOf(plain, south), "RelativePlacement"));
            tx.update(relative, { Axis: ref(writer.direction([0, -1, 0])), RefDirection: ref(writer.direction([1, 0, 0])) });
        });

        // Act & Assert
        expect(() => joined(model)).toThrow(`is not upright, so it is not a wall this library can edit`);
    });

    it("should refuse to join a wall made of a plain material instead of layers", () => {
        // Arrange
        const { ifc, model: plain } = corner();
        const south = expressIdOf(plain, "south");
        const withMaterial = ifc.materials.add({ model: plain, name: "Concrete" });
        const model = edited(withMaterial, (tx) => {
            const material = withMaterial.byType("IfcMaterial")[0]?.id ?? 0;
            const rel = withMaterial.byType("IfcRelAssociatesMaterial").find((entity) => refsOf(withMaterial.attribute(entity.id, "RelatedObjects")).includes(south));
            tx.update(rel?.id ?? 0, { RelatingMaterial: ref(material) });
        });

        // Act & Assert
        expect(() => joined(model)).toThrow(`has no material layer set usage, so its thickness is unknown`);
    });
});

describe("clipWall", () => {
    it("should refuse to clip a wall without a body", () => {
        // Arrange
        const { model: plain } = corner();
        const south = expressIdOf(plain, "south");
        const model = withoutRepresentation(plain, south, "Body");

        // Act & Assert
        expect(() => edited(model, (tx, writer) => clipWall(tx, writer, south, [0, 0, 2000], [0, 0, 1]))).toThrow("has no body to clip");
    });

});

describe("connectWalls on a wall without a body", () => {
    it("should refuse the join, since the wall's height is unknown, rather than write a solid of no height", () => {
        // Arrange
        const { model: plain } = corner();
        const south = expressIdOf(plain, "south");
        const model = withoutRepresentation(plain, south, "Body");

        // Act & Assert
        expect(() => joined(model)).toThrow("has no Body representation, so its height is unknown");
        expect(representationsOf(model, south).map((representation) => model.attribute(representation, "RepresentationIdentifier"))).toEqual(["Axis"]);
    });
});

describe("layerSetFor", () => {
    it("should reuse the layer set it made for a thickness", () => {
        // Arrange
        const { model } = groundFloor();
        const { tx, writer } = writingInto(model);

        // Act
        const first = layerSetFor(tx, writer, undefined, 250, "Wall");
        const second = layerSetFor(tx, writer, undefined, 250, "Wall");
        const other = layerSetFor(tx, writer, undefined, 300, "Wall");

        // Assert
        expect(second).toBe(first);
        expect(other).not.toBe(first);
        expect(tx.attribute(first, "LayerSetName")).toBe("Wall 250");
        expect(tx.attribute(firstOf(refsOf(tx.attribute(first, "MaterialLayers"))), "Material")).toBe(null);
    });

    it("should not reuse a layer set of the name it would use made of other layers", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const withMaterial = ifc.materials.add({ model: ground, name: "Brick" });
        const model = ifc.materials.addLayerSet({ model: withMaterial, name: "Wall 250", layers: [{ material: "Brick", thickness: 250 }] });
        const { tx, writer } = writingInto(model);

        // Act
        const made = layerSetFor(tx, writer, undefined, 250, "Wall");
        const again = layerSetFor(tx, writer, undefined, 250, "Wall");

        // Assert
        expect(made).not.toBe(model.byType("IfcMaterialLayerSet")[0]?.id);
        expect(again).toBe(made);
    });
});
