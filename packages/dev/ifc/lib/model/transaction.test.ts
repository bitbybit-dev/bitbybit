import { describe, expect, it } from "vitest";
import { PLACED_WALL_IDS, PROJECT_GLOBAL_ID, WALL_GLOBAL_ID, emptyIfc4Model, ifcFile, placedWallModel } from "../__test__/model-fixtures";
import { IfcValueError } from "../step/errors";
import type { IfcEntity } from "../step/step-types";
import { DERIVED, enumValue, ref } from "../step/values";
import { automaticGlobalId, isGlobalId, keyGlobalId } from "./guid";
import { ModelSnapshot } from "./snapshot";
import { readModel } from "./io";
import { IfcTransaction } from "./transaction";
import type { ExtrudedWall } from "../__test__/fixture-types";

const SEED = "test-seed";

function overlayIds(model: ModelSnapshot): number[] {
    const ids: number[] = [];
    model.overlay.forEach((_, id) => ids.push(id));
    return ids;
}

function extrudedWall(): ExtrudedWall {
    const tx = new IfcTransaction(emptyIfc4Model(), SEED);
    const contextOrigin = tx.create("IfcCartesianPoint", { Coordinates: [0, 0, 0] });
    const contextAxes = tx.create("IfcAxis2Placement3D", { Location: ref(contextOrigin) });
    const context = tx.create("IfcGeometricRepresentationContext", { ContextType: "Model", CoordinateSpaceDimension: 3, Precision: 1e-5, WorldCoordinateSystem: ref(contextAxes) });
    const profile = tx.create("IfcRectangleProfileDef", { ProfileType: "AREA", XDim: 4, YDim: 0.2 });
    const up = tx.create("IfcDirection", { DirectionRatios: [0, 0, 1] });
    const solid = tx.create("IfcExtrudedAreaSolid", { SweptArea: ref(profile), ExtrudedDirection: ref(up), Depth: 3 });
    const body = tx.create("IfcShapeRepresentation", { ContextOfItems: ref(context), RepresentationIdentifier: "Body", RepresentationType: "SweptSolid", Items: [ref(solid)] });
    const shape = tx.create("IfcProductDefinitionShape", { Representations: [ref(body)] });
    const origin = tx.create("IfcCartesianPoint", { Coordinates: [0, 0, 0] });
    const axes = tx.create("IfcAxis2Placement3D", { Location: ref(origin) });
    const placement = tx.create("IfcLocalPlacement", { RelativePlacement: ref(axes) });
    const wall = tx.create("IfcWall", { GlobalId: tx.globalId("wall"), ObjectPlacement: ref(placement), Representation: ref(shape) });
    return { model: tx.commit(), context, shape, placement, wall };
}

function contextWithSubContext(tx: IfcTransaction): number {
    const origin = tx.create("IfcCartesianPoint", { Coordinates: [0, 0, 0] });
    const axes = tx.create("IfcAxis2Placement3D", { Location: ref(origin) });
    const context = tx.create("IfcGeometricRepresentationContext", { ContextType: "Model", CoordinateSpaceDimension: 3, WorldCoordinateSystem: ref(axes) });
    return tx.create("IfcGeometricRepresentationSubContext", { ContextIdentifier: "Body", ContextType: "Model", ParentContext: ref(context), TargetView: "MODEL_VIEW" });
}

function idsOf(entities: readonly IfcEntity[]): number[] {
    return entities.map((entity) => entity.id);
}

describe("IfcTransaction.create", () => {
    it("should give created entities the next free ids after the file's", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act
        const ids = [tx.create("IfcCartesianPoint", { Coordinates: [1, 1, 0] }), tx.create("IfcDirection", { DirectionRatios: [1, 0, 0] })];

        // Assert
        expect(ids).toEqual([31, 32]);
    });

    it("should start at one in an empty model", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);

        // Act
        const id = tx.create("IfcCartesianPoint", { Coordinates: [0, 0, 0] });

        // Assert
        expect(id).toBe(1);
    });

    it("should hold the values in schema order with the attributes left out unset", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act
        const id = tx.create("IfcAxis2Placement3D", { RefDirection: ref(2), Location: ref(5) });

        // Assert
        expect(tx.entity(id)).toEqual({ id: 31, type: "IfcAxis2Placement3D", args: [ref(5), null, ref(2)] });
    });

    it("should spell the type as the schema does", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);

        // Act
        const id = tx.create("ifccartesianpoint", { Coordinates: [0, 0, 0] });

        // Assert
        expect(tx.entity(id).type).toBe("IfcCartesianPoint");
    });

    it("should fill in the attributes a subtype derives", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);

        // Act
        const subContext = contextWithSubContext(tx);

        // Assert
        expect(tx.entity(subContext).args).toEqual(["Body", "Model", DERIVED, DERIVED, DERIVED, DERIVED, ref(3), null, { enum: "MODEL_VIEW" }, null]);
    });

    it("should refuse an attribute the type does not have", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);

        // Act & Assert
        expect(() => tx.create("IfcCartesianPoint", { Coordinates: [0, 0, 0], Radius: 1, Colour: "red" })).toThrow("IfcCartesianPoint has no attribute Radius, Colour");
    });

    it("should refuse a type the schema does not define", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);

        // Act & Assert
        expect(() => tx.create("IfcNothing", {})).toThrow("IFC4 has no entity named IfcNothing");
    });

    it("should refuse an abstract type", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);

        // Act & Assert
        expect(() => tx.create("IfcRoot", { GlobalId: PROJECT_GLOBAL_ID })).toThrow("#1: IfcRoot is abstract and cannot be written");
    });

    it("should refuse a value of the wrong type at once, naming where it sits", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);

        // Act & Assert
        expect(() => tx.create("IfcCartesianPoint", { Coordinates: ["one", 0, 0] })).toThrow(IfcValueError);
        expect(() => tx.create("IfcCartesianPoint", { Coordinates: ["one", 0, 0] })).toThrow("#1 IfcCartesianPoint.Coordinates[0]: expected a finite real number, got a text");
    });

    it("should refuse a required attribute left out", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);

        // Act & Assert
        expect(() => tx.create("IfcCartesianPoint")).toThrow("#1 IfcCartesianPoint.Coordinates: the attribute is required");
    });

    it("should refuse a list longer than the schema allows", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);

        // Act & Assert
        expect(() => tx.create("IfcCartesianPoint", { Coordinates: [0, 0, 0, 0] })).toThrow("#1 IfcCartesianPoint.Coordinates: a LIST of 1 to 3 values, got 4");
    });

    it("should refuse a member an enumeration does not have", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);

        // Act & Assert
        expect(() => tx.create("IfcWall", { GlobalId: WALL_GLOBAL_ID, PredefinedType: "CURVED" })).toThrow("IfcWall.PredefinedType: expected one of");
    });

    it("should leave nothing behind when a create is refused", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);
        const refusedCreate = (): number => tx.create("IfcCartesianPoint", { Coordinates: ["one"] });

        // Act & Assert
        expect(refusedCreate).toThrow(IfcValueError);
        expect(tx.byType("IfcCartesianPoint")).toEqual([]);
        expect(tx.commit().size).toBe(0);
    });

    it("should check what a reference points at only at commit", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);

        // Act
        const id = tx.create("IfcLocalPlacement", { RelativePlacement: ref(99) });

        // Assert
        expect(id).toBe(1);
        expect(() => tx.commit()).toThrow("#1 IfcLocalPlacement.RelativePlacement refers to #99, which the model does not hold");
    });

    it("should refuse at commit a reference to an entity of the wrong type", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act
        tx.create("IfcLocalPlacement", { RelativePlacement: ref(5) });

        // Assert
        expect(() => tx.commit()).toThrow("#31 IfcLocalPlacement.RelativePlacement refers to #5, an IfcCartesianPoint, where IfcAxis2Placement is expected");
    });
});

describe("IfcTransaction.update", () => {
    it("should change the named attributes and keep the others", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act
        tx.update(20, { Name: "Renamed", Description: "Outer" });

        // Assert
        expect(tx.entity(20).args).toEqual([WALL_GLOBAL_ID, null, "Renamed", "Outer", null, ref(10), null, null, enumValue("STANDARD")]);
    });

    it("should unset an attribute given undefined", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act
        tx.update(20, { Name: undefined });

        // Assert
        expect(tx.attribute(20, "Name")).toBeNull();
    });

    it("should update an entity created in the same transaction", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);
        const id = tx.create("IfcCartesianPoint", { Coordinates: [0, 0, 0] });

        // Act
        tx.update(id, { Coordinates: [1, 2, 3] });

        // Assert
        expect(tx.entity(id)).toEqual({ id: 1, type: "IfcCartesianPoint", args: [[1, 2, 3]] });
    });

    it("should refuse an attribute the type does not have", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act & Assert
        expect(() => tx.update(20, { Height: 3 })).toThrow("IfcWall has no attribute Height");
    });

    it("should refuse a value for a derived attribute", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);
        const subContext = contextWithSubContext(tx);

        // Act & Assert
        expect(() => tx.update(subContext, { Precision: 1e-5 })).toThrow("IfcGeometricRepresentationSubContext.Precision is derived and takes no value");
    });

    it("should refuse a value of the wrong type and keep the entity as it was", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act & Assert
        expect(() => tx.update(20, { PredefinedType: "CURVED" })).toThrow(IfcValueError);
        expect(tx.attribute(20, "PredefinedType")).toEqual(enumValue("STANDARD"));
    });

    it("should refuse to unset a required attribute", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act & Assert
        expect(() => tx.update(5, { Coordinates: null })).toThrow("#5 IfcCartesianPoint.Coordinates: the attribute is required");
    });

    it("should refuse an entity the model does not hold", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act & Assert
        expect(() => tx.update(4, { Name: "Nothing" })).toThrow("The model has no entity #4");
    });
});

describe("IfcTransaction.delete", () => {
    it("should hide the entity from the transaction at once", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act
        tx.delete(30);

        // Assert
        expect(tx.get(30)).toBeUndefined();
        expect(() => tx.entity(30)).toThrow("The model has no entity #30");
    });

    it("should refuse an entity the model does not hold", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act & Assert
        expect(() => tx.delete(4)).toThrow("The model has no entity #4");
    });

    it("should refuse to delete an entity twice", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);
        tx.delete(30);

        // Act & Assert
        expect(() => tx.delete(30)).toThrow("The model has no entity #30");
    });

    it("should fail at commit when an entity that is still referred to is deleted", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act
        tx.delete(5);

        // Assert
        expect(() => tx.commit()).toThrow("#5 cannot be deleted while #3, #30 still refer to it");
    });

    it("should accept deleting an entity together with every entity that refers to it", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act
        tx.delete(30);
        tx.delete(6);
        const committed = tx.commit();

        // Assert
        expect(committed.ids()).toEqual([5, 2, 3, 10, 1, 20]);
        expect(committed.overlay.get(30)).toBeNull();
        expect(committed.overlay.get(6)).toBeNull();
    });

    it("should leave no trace of an entity created and deleted in the same transaction", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);
        const id = tx.create("IfcCartesianPoint", { Coordinates: [1, 1, 0] });

        // Act
        tx.delete(id);
        const committed = tx.commit();

        // Assert
        expect(committed.overlay.has(id)).toBe(false);
        expect(committed.has(id)).toBe(false);
        expect(committed.ids()).toEqual(PLACED_WALL_IDS);
    });

    it("should drop an entity an earlier commit created from the changes when it is deleted", () => {
        // Arrange
        const first = new IfcTransaction(placedWallModel(), SEED);
        const id = first.create("IfcCartesianPoint", { Coordinates: [1, 1, 0] });
        const created = first.commit();
        const second = new IfcTransaction(created, SEED);

        // Act
        second.delete(id);
        const committed = second.commit();

        // Assert
        expect(committed.overlay.has(id)).toBe(false);
        expect(committed.ids()).toEqual(PLACED_WALL_IDS);
        expect(created.has(id)).toBe(true);
    });
});

describe("IfcTransaction reading its own changes", () => {
    it("should read created, updated and deleted entities as the transaction left them", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act
        const created = tx.create("IfcCartesianPoint", { Coordinates: [1, 1, 0] });
        tx.update(20, { Name: "Renamed" });
        tx.delete(30);

        // Assert
        expect(tx.get(created)).toEqual({ id: 31, type: "IfcCartesianPoint", args: [[1, 1, 0]] });
        expect(tx.attribute(20, "Name")).toBe("Renamed");
        expect(tx.get(30)).toBeUndefined();
        expect(tx.get(4)).toBeUndefined();
    });

    it("should refuse an attribute the entity's type does not have", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act & Assert
        expect(() => tx.attribute(20, "Height")).toThrow("IfcWall has no attribute Height");
    });

    it("should list by type with created and updated entities in and deleted ones out, in id order", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act
        const created = tx.create("IfcCartesianPoint", { Coordinates: [1, 1, 0] });
        tx.update(6, { Coordinates: [2, 0, 0] });
        tx.delete(30);
        tx.delete(5);
        const points = tx.byType("IfcCartesianPoint");

        // Assert
        expect(points).toEqual([{ id: 6, type: "IfcCartesianPoint", args: [[2, 0, 0]] }, { id: created, type: "IfcCartesianPoint", args: [[1, 1, 0]] }]);
    });

    it("should list created entities under their supertypes", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act
        const created = tx.create("IfcDirection", { DirectionRatios: [1, 0, 0] });
        const items = tx.byType("IfcRepresentationItem");

        // Assert
        expect(idsOf(items)).toEqual([2, 3, 5, 6, 30, created]);
    });
});

describe("IfcTransaction.globalId", () => {
    it("should derive automatic GlobalIds from the seed of a model it made, each one new", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);

        // Act
        const first = tx.globalId(undefined);
        const second = tx.globalId(undefined);

        // Assert
        expect(first).toBe(automaticGlobalId(SEED, "1.0"));
        expect(second).toBe(automaticGlobalId(SEED, "1.1"));
    });

    it("should make automatic GlobalIds random in a model read from a file, so two edits of one file never share one", () => {
        // Arrange
        const base = placedWallModel();

        // Act
        const first = new IfcTransaction(base).globalId(undefined);
        const second = new IfcTransaction(base).globalId(undefined);

        // Assert
        expect(isGlobalId(first)).toBe(true);
        expect(second).not.toBe(first);
    });

    it("should derive a GlobalId from a key and the seed, even a key that looks like a GlobalId", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);

        // Act
        const globalIds = [tx.globalId("door-1"), tx.globalId(WALL_GLOBAL_ID)];

        // Assert
        expect(globalIds).toEqual([keyGlobalId(SEED, "door-1"), keyGlobalId(SEED, WALL_GLOBAL_ID)]);
    });

    it("should take a given GlobalId as it is, and refuse one the model already holds", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act
        const given = tx.givenGlobalId("3$$$$$$$$$$$$$$$$$$$$$");

        // Assert
        expect(given).toBe("3$$$$$$$$$$$$$$$$$$$$$");
        expect(() => tx.givenGlobalId(PROJECT_GLOBAL_ID)).toThrow(`The model already holds an object with the GlobalId ${PROJECT_GLOBAL_ID}`);
        expect(() => tx.givenGlobalId("3$$$$$$$$$$$$$$$$$$$$$")).toThrow("The model already holds an object with the GlobalId 3$$$$$$$$$$$$$$$$$$$$$");
    });

    it("should refuse a key whose GlobalId an earlier commit gave an object", () => {
        // Arrange
        const first = new IfcTransaction(emptyIfc4Model(), SEED);
        first.create("IfcWall", { GlobalId: first.globalId("door-1") });
        const second = new IfcTransaction(first.commit(), SEED);

        // Act & Assert
        expect(() => second.globalId("door-1")).toThrow("The model already holds an object with the id 'door-1'");
    });

    it("should refuse a key used earlier in the same transaction", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);
        tx.globalId("door-1");

        // Act & Assert
        expect(() => tx.globalId("door-1")).toThrow("The model already holds an object with the id 'door-1'");
    });

    it("should keep the library's own structure ids apart from a caller's keys", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);

        // Act
        const site = tx.structureGlobalId("site");
        const key = tx.globalId("site");

        // Assert
        expect(key).not.toBe(site);
    });

    it("should give the same GlobalIds to the same edits over the same model it made", () => {
        // Arrange
        const base = emptyIfc4Model();
        const first = new IfcTransaction(base, SEED);
        const second = new IfcTransaction(base, SEED);

        // Act
        const firstIds = [first.globalId(undefined), first.globalId("door-1")];
        const secondIds = [second.globalId(undefined), second.globalId("door-1")];

        // Assert
        expect(secondIds).toEqual(firstIds);
    });
});

describe("IfcTransaction.commit", () => {
    it("should give a new model and leave the one it started from unchanged", () => {
        // Arrange
        const base = placedWallModel();
        const tx = new IfcTransaction(base, SEED);
        const created = tx.create("IfcCartesianPoint", { Coordinates: [1, 1, 0] });
        tx.update(20, { Name: "Renamed" });
        tx.delete(30);

        // Act
        const committed = tx.commit();

        // Assert
        expect(committed).not.toBe(base);
        expect(committed.ids()).toEqual([5, 2, 6, 3, 10, 1, 20, created]);
        expect(committed.attribute(20, "Name")).toBe("Renamed");
        expect(base.has(created)).toBe(false);
        expect(base.has(30)).toBe(true);
        expect(base.attribute(20, "Name")).toBe("Wall");
        expect(base.ids()).toEqual(PLACED_WALL_IDS);
        expect(base.overlay.size).toBe(0);
        expect(base.nextId).toBe(31);
    });

    it("should carry the schema, the header, the file and the next free id", () => {
        // Arrange
        const base = placedWallModel();
        const tx = new IfcTransaction(base, SEED);
        tx.create("IfcCartesianPoint", { Coordinates: [1, 1, 0] });

        // Act
        const committed = tx.commit();

        // Assert
        expect(committed.schema).toBe(base.schema);
        expect(committed.header).toBe(base.header);
        expect(committed.source).toBe(base.source);
        expect(committed.nextId).toBe(32);
    });

    it("should keep two transactions over one model apart", () => {
        // Arrange
        const base = placedWallModel();
        const first = new IfcTransaction(base, SEED);
        const second = new IfcTransaction(base, SEED);

        // Act
        first.create("IfcCartesianPoint", { Coordinates: [1, 1, 0] });
        second.create("IfcDirection", { DirectionRatios: [1, 0, 0] });
        const fromFirst = first.commit();
        const fromSecond = second.commit();

        // Assert
        expect(fromFirst.typeOf(31)).toBe("IfcCartesianPoint");
        expect(fromSecond.typeOf(31)).toBe("IfcDirection");
    });

    it("should leave a model committed earlier unchanged by a later transaction over it", () => {
        // Arrange
        const earlier = new IfcTransaction(placedWallModel(), SEED).commit();
        const later = new IfcTransaction(earlier, SEED);

        // Act
        later.update(20, { Name: "Renamed" });
        later.delete(30);
        later.commit();

        // Assert
        expect(earlier.attribute(20, "Name")).toBe("Wall");
        expect(earlier.has(30)).toBe(true);
    });
});

describe("IfcTransaction.dropIfUnused", () => {
    it("should prune a deleted wall's representation and placement down to its points and keep the context", () => {
        // Arrange
        const { model, context, shape, placement, wall } = extrudedWall();
        const tx = new IfcTransaction(model, SEED);

        // Act
        tx.delete(wall);
        tx.dropIfUnused([shape, placement]);
        const pruned = tx.commit();

        // Assert
        expect(pruned.ids()).toEqual([1, 2, context]);
        expect(overlayIds(pruned)).toEqual([1, 2, context]);
    });

    it("should leave what it is not asked to drop", () => {
        // Arrange
        const { model, placement, wall } = extrudedWall();
        const tx = new IfcTransaction(model, SEED);

        // Act
        tx.delete(wall);
        tx.dropIfUnused([placement]);
        const pruned = tx.commit();

        // Assert
        expect(pruned.ids()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it("should keep an entity something still refers to", () => {
        // Arrange
        const { model, shape, placement } = extrudedWall();
        const tx = new IfcTransaction(model, SEED);

        // Act
        tx.dropIfUnused([shape, placement]);
        const pruned = tx.commit();

        // Assert
        expect(pruned.ids()).toEqual(model.ids());
    });

    it("should keep a point another entity still uses while pruning the rest", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act
        tx.delete(20);
        tx.dropIfUnused([10]);
        const pruned = tx.commit();

        // Assert
        expect(pruned.ids()).toEqual([5, 6, 1, 30]);
        expect([10, 3, 2].map((id) => pruned.overlay.get(id))).toEqual([null, null, null]);
    });

    it("should keep a context it is asked to drop even when nothing refers to it", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);
        const origin = tx.create("IfcCartesianPoint", { Coordinates: [0, 0, 0] });
        const axes = tx.create("IfcAxis2Placement3D", { Location: ref(origin) });
        const context = tx.create("IfcGeometricRepresentationContext", { ContextType: "Model", CoordinateSpaceDimension: 3, WorldCoordinateSystem: ref(axes) });

        // Act
        tx.dropIfUnused([context]);
        const committed = tx.commit();

        // Assert
        expect(committed.ids()).toEqual([origin, axes, context]);
    });

    it("should keep an object it is asked to drop even when nothing refers to it", () => {
        // Arrange
        const { model, wall } = extrudedWall();
        const tx = new IfcTransaction(model, SEED);

        // Act
        tx.dropIfUnused([wall]);
        const committed = tx.commit();

        // Assert
        expect(committed.ids()).toEqual(model.ids());
    });

    it("should skip an id the model does not hold", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);

        // Act
        tx.dropIfUnused([4, 99]);
        const committed = tx.commit();

        // Assert
        expect(committed.ids()).toEqual(PLACED_WALL_IDS);
    });
});

function errorOf(action: () => unknown): unknown {
    try {
        action();
    } catch (error) {
        return error;
    }
    return undefined;
}

describe("IfcTransaction guarding the models it commits", () => {
    it("should refuse to be used again after it has committed, so the committed model cannot change", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);
        tx.create("IfcCartesianPoint", { Coordinates: [0, 0, 0] });
        const committed = tx.commit();

        // Act & Assert
        expect(() => tx.create("IfcCartesianPoint", { Coordinates: [1, 0, 0] })).toThrow("The transaction has been committed");
        expect(() => tx.commit()).toThrow("The transaction has been committed");
        expect(committed.size).toBe(1);
    });

    it("should refuse a value for a derived attribute when creating, as when updating", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);
        const parent = contextWithSubContext(tx);

        // Act & Assert
        expect(() => tx.create("IfcGeometricRepresentationSubContext", { ContextIdentifier: "Axis", ContextType: "Model", ParentContext: ref(parent), TargetView: "GRAPH_VIEW", Precision: 0.5 })).toThrow("IfcGeometricRepresentationSubContext.Precision is derived and takes no value");
    });

    it("should keep the next id free when a create is refused", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);

        // Act
        const refused = (): number => tx.create("IfcCartesianPoint", { Coordinates: "not a list" });
        const firstError = errorOf(refused);
        const id = tx.create("IfcCartesianPoint", { Coordinates: [0, 0, 0] });

        // Assert
        expect(firstError).toBeInstanceOf(IfcValueError);
        expect(id).toBe(1);
    });

    it("should refuse at commit two objects given the same GlobalId directly", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);
        const globalId = keyGlobalId(SEED, "twice");
        tx.create("IfcWall", { GlobalId: globalId });
        tx.create("IfcSlab", { GlobalId: globalId });

        // Act & Assert
        expect(() => tx.commit()).toThrow(`#1 and #2 have the same GlobalId ${globalId}`);
    });
});

describe("IfcTransaction over a file with defects of its own", () => {
    it("should rename an object whose GlobalId another object of the file shares", () => {
        // Arrange
        const rows = [`#1=IFCWALL('${WALL_GLOBAL_ID}',$,'A',$,$,$,$,$,$);`, `#2=IFCWALL('${WALL_GLOBAL_ID}',$,'B',$,$,$,$,$,$);`];
        const tx = new IfcTransaction(readModel(ifcFile(rows)), SEED);

        // Act
        tx.update(2, { Name: "B2" });
        const committed = tx.commit();

        // Assert
        expect(committed.attribute(2, "Name")).toBe("B2");
    });

    it("should change one attribute of an entity whose other attributes its schema would refuse", () => {
        // Arrange
        const rows = ["#1=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3.5,$,#2,$);", "#2=IFCAXIS2PLACEMENT3D(#3,$,$);", "#3=IFCCARTESIANPOINT((0.,0.,0.));"];
        const tx = new IfcTransaction(readModel(ifcFile(rows)), SEED);

        // Act
        tx.update(1, { ContextIdentifier: "Body" });

        // Assert
        expect(tx.commit().attribute(1, "ContextIdentifier")).toBe("Body");
    });

    it("should refuse a GlobalId that is not 22 characters of the GlobalId alphabet", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);

        // Act & Assert
        expect(() => tx.create("IfcWall", { GlobalId: "not a guid" })).toThrow("#1 IfcWall.GlobalId: a GlobalId is 22 characters of 0-9, A-Z, a-z, _ and $, the first from 0 to 3");
    });

    it("should refuse to create an entity once the express ids run out", () => {
        // Arrange
        const base = emptyIfc4Model();
        const tx = new IfcTransaction(new ModelSnapshot({ ...base.parts, nextId: 2_147_483_648 }), SEED);

        // Act & Assert
        expect(() => tx.create("IfcCartesianPoint", { Coordinates: [0, 0, 0] })).toThrow("The model has no express id left below 2147483647");
    });
});

describe("IfcTransaction and the indexes of the model it starts from", () => {
    it("should hand its model's indexes to the model it commits and leave the old model able to answer", () => {
        // Arrange
        const base = placedWallModel();
        const before = base.byType("IfcCartesianPoint").map((entity) => entity.id);
        const tx = new IfcTransaction(base, SEED);
        tx.delete(30);
        tx.delete(6);
        const created = tx.create("IfcCartesianPoint", { Coordinates: [2, 0, 0] });

        // Act
        const committed = tx.commit();

        // Assert
        expect(committed.byType("IfcCartesianPoint").map((entity) => entity.id)).toEqual([5, created]);
        expect(base.byType("IfcCartesianPoint").map((entity) => entity.id)).toEqual(before);
        expect(committed.referencesTo(5)).toEqual([3]);
        expect(base.referencesTo(5)).toEqual([3, 30]);
    });
});

describe("IfcTransaction at its limits", () => {
    it("should give out the last express id there is and refuse one more", () => {
        // Arrange
        const model = readModel(ifcFile(["#2147483646=IFCCARTESIANPOINT((0.,0.,0.));"]));
        const tx = new IfcTransaction(model, SEED);

        // Act
        const last = tx.create("IfcCartesianPoint", { Coordinates: [1, 2, 3] });

        // Assert
        expect(last).toBe(2147483647);
        expect(() => tx.create("IfcCartesianPoint", { Coordinates: [1, 2, 3] })).toThrow("The model has no express id left below 2147483647");
    });

    it("should set an attribute to zero, false or an empty text rather than leave it unset", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);
        const layer = tx.create("IfcMaterialLayer", { LayerThickness: 100, IsVentilated: true, Name: "Brick" });

        // Act
        tx.update(layer, { LayerThickness: 0, IsVentilated: false, Name: "" });

        // Assert
        expect(tx.get(layer)?.args.slice(0, 4)).toEqual([null, 0, false, ""]);
    });
});
