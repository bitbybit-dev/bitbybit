import { WORLD_AXES } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { describe, expect, it } from "vitest";
import { addRightWall, expressIdOf, groundFloor, writingInto } from "../__test__/build-setup";
import type { Fixture } from "../__test__/fixture-types";
import { bodyItemOf, extrusionOf, footprintOf, refOf, representationNamed, unwrapBody } from "../__test__/build-geometry";
import type { IfcModel } from "../model/model-types";
import type { IfcTransaction } from "../model/transaction";
import { enumValue, isReference, ref } from "../step/values";
import { BODY_CONTEXT, AXIS_CONTEXT, findContext } from "./contexts";
import type { EntityWriter } from "./entity-writer";
import { connectWalls } from "./walls";
import { modelOf } from "../api/services/service-support";

const TOLERANCE = 1e-3;
const PARALLEL = 1e-9;
const CONNECTION = "IfcRelConnectsPathElements";

function edited(model: IfcModel, change: (tx: IfcTransaction, writer: EntityWriter) => void): IfcModel {
    const { tx, writer } = writingInto(model);
    change(tx, writer);
    return tx.commit();
}

function connected(model: IfcModel, first: string, second: string): IfcModel {
    return edited(model, (tx, writer) => connectWalls(tx, writer, expressIdOf(model, first), expressIdOf(model, second), TOLERANCE, PARALLEL));
}

function threeWalls(): Fixture {
    const { ifc, model: ground } = groundFloor();
    let model = addRightWall(ifc, ground, "south", [0, 0], [10000, 0]);
    model = addRightWall(ifc, model, "east", [10000, 0], [10000, 8000]);
    model = addRightWall(ifc, model, "far", [10000, 0], [20000, 0]);
    return { ifc, model };
}

describe("connectWalls on bodies it does not edit", () => {
    it("should refuse a wall whose body is extruded across the wall, before changing anything", () => {
        // Arrange
        const { model: plain } = threeWalls();
        const south = expressIdOf(plain, "south");
        const solid = unwrapBody(plain, south).solid;
        const model = edited(plain, (tx, writer) => tx.update(solid, { ExtrudedDirection: ref(writer.direction([0, 1, 0])) }));

        // Act & Assert
        expect(() => connected(model, "south", "east")).toThrow("its extrusion does not rise straight up from a plan outline");
    });

    it("should refuse a wall whose body is not an extrusion at all", () => {
        // Arrange
        const { model: plain } = threeWalls();
        const south = expressIdOf(plain, "south");
        const body = representationNamed(plain, south, "Body");
        const model = edited(plain, (tx, writer) => {
            const block = writer.create("IfcBlock", { Position: ref(writer.placement3(WORLD_AXES)), XLength: 10000, YLength: 200, ZLength: 3000 });
            tx.update(body, { Items: [ref(block)] });
        });

        // Act & Assert
        expect(() => connected(model, "south", "east")).toThrow("an IfcBlock, where a plan outline extruded upwards is expected");
    });
});

describe("connectWalls and the walls already joined", () => {
    it("should refuse to join an end that is already joined to another wall", () => {
        // Arrange
        const { model: plain } = threeWalls();
        const model = connected(plain, "south", "east");

        // Act & Assert
        expect(() => connected(model, "south", "far")).toThrow("is already joined to");
    });

    it("should join the same two walls again in place of their earlier join", () => {
        // Arrange
        const { model: plain } = threeWalls();
        const model = connected(plain, "south", "east");

        // Act
        const again = connected(model, "east", "south");

        // Assert
        expect(again.byType(CONNECTION)).toHaveLength(1);
        expect(footprintOf(again, expressIdOf(again, "south"))).toEqual(footprintOf(model, expressIdOf(model, "south")));
    });

    it("should leave aside a join of a connection type it does not know", () => {
        // Arrange
        const { model: plain } = threeWalls();
        const joined = connected(plain, "south", "east");
        const relationship = joined.byType(CONNECTION)[0]!.id;
        const model = edited(joined, (tx) => tx.update(relationship, { RelatingConnectionType: enumValue("NOTDEFINED"), RelatedConnectionType: enumValue("NOTDEFINED") }));

        // Act
        const changed = connected(model, "south", "far");

        // Assert
        expect(changed.byType(CONNECTION)).toHaveLength(2);
    });

    it("should refuse to join two parallel walls side by side as if one ended on the other", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = addRightWall(ifc, ground, "south", [0, 0], [10000, 0]);
        model = addRightWall(ifc, model, "lining", [2000, -100], [8000, -100]);

        // Act & Assert
        expect(() => connected(model, "lining", "south")).toThrow("The walls do not meet");
    });
});

describe("walls in a model whose contexts another tool laid out", () => {
    it("should put a new wall's axis in an Axis context under the Model context when the plan has none", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const snapshot = modelOf(ground);
        const axis = findContext(snapshot, AXIS_CONTEXT)!;
        const modelContext = snapshot.attribute(findContext(snapshot, BODY_CONTEXT)!, "ParentContext");
        const model = edited(ground, (tx) => tx.update(axis, { ParentContext: modelContext, ContextType: "Model" }));

        // Act
        const changed = addRightWall(ifc, model, "south", [0, 0], [4000, 0]);

        // Assert
        const context = refOf(changed.attribute(representationNamed(changed, expressIdOf(changed, "south"), "Axis"), "ContextOfItems"));
        expect(changed.attribute(context, "ContextIdentifier")).toBe("Axis");
        expect(changed.attribute(refOf(changed.attribute(context, "ParentContext")), "ContextType")).toBe("Model");
    });

    it("should add the Axis context a model lacks rather than refuse the wall", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const axis = findContext(modelOf(ground), AXIS_CONTEXT)!;
        const model = edited(ground, (tx) => tx.delete(axis));

        // Act
        const changed = addRightWall(ifc, model, "south", [0, 0], [4000, 0]);

        // Assert
        const context = refOf(changed.attribute(representationNamed(changed, expressIdOf(changed, "south"), "Axis"), "ContextOfItems"));
        expect(changed.attribute(context, "ContextIdentifier")).toBe("Axis");
        expect(isReference(changed.attribute(context, "ParentContext"))).toBe(true);
    });
});

describe("walls of a type", () => {
    it("should leave a typed wall's predefined type to its type", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.materials.addLayerSet({ model: ground, name: "Brick", layers: [{ thickness: 250 }] });
        model = ifc.walls.addType({ model, id: "brick", name: "Brick wall", layerSet: "Brick" });

        // Act
        const changed = ifc.walls.add({ model, storey: "ground", id: "typed", start: [0, 0], end: [4000, 0], wallType: "brick" });

        // Assert
        expect(changed.attribute(expressIdOf(changed, "typed"), "PredefinedType")).toBeNull();
        expect(extrusionOf(changed, expressIdOf(changed, "typed")).depth).toBe(3000);
        expect(bodyItemOf(changed, expressIdOf(changed, "typed"))).toBeGreaterThan(0);
    });
});
