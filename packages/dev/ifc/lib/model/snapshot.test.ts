import { describe, expect, it } from "vitest";
import { PLACED_WALL_IDS, PLACED_WALL_ROWS, PROJECT_GLOBAL_ID, WALL_GLOBAL_ID, emptyIfc4Model, ifcFile, placedWallModel } from "../__test__/model-fixtures";
import { schemaNamed } from "../schema/registry";
import { errorThrownBy } from "../__test__/thrown";
import { StepSyntaxError } from "../step/errors";
import { indexStep } from "../step/file-index";
import type { IfcEntity } from "../step/step-types";
import { ref } from "../step/values";
import { IdMap } from "./id-map";
import { ModelSnapshot } from "./snapshot";
import { IfcSource } from "./source";
import { readModel } from "./io";

const UNKNOWN_TYPE_ROW = "#7=IFCNOTATHING((1.));";
const COMPLEX_INSTANCE_ROW = "#8=(IFCNAMEDUNIT(*,.LENGTHUNIT.)IFCSIUNIT(.MILLI.,.METRE.));";
const OTHER_GLOBAL_ID = "3$$$$$$$$$$$$$$$$$$$$$";

type OverlayEntry = readonly [number, IfcEntity | null];

function sourceOf(rows: readonly string[]): IfcSource {
    return new IfcSource(indexStep(new TextEncoder().encode(ifcFile(rows))), schemaNamed("IFC4"));
}

function withChanges(base: ModelSnapshot, entries: readonly OverlayEntry[], nextId: number = base.nextId): ModelSnapshot {
    return new ModelSnapshot({ ...base.parts, overlay: IdMap.empty<IfcEntity | null>().withChanges(entries), nextId });
}

function point(id: number, coordinates: readonly number[]): IfcEntity {
    return { id, type: "IfcCartesianPoint", args: [coordinates] };
}

function wall(id: number, globalId: string): IfcEntity {
    return { id, type: "IfcWall", args: [globalId, null, "Another wall", null, null, null, null, null, null] };
}

function idsOf(entities: readonly IfcEntity[]): number[] {
    return entities.map((entity) => entity.id);
}

describe("IfcSource", () => {
    it("should list the ids in file order and know the highest", () => {
        // Act
        const source = sourceOf(PLACED_WALL_ROWS);

        // Assert
        expect(Array.from(source.index.ids)).toEqual(PLACED_WALL_IDS);
        expect(source.maxId).toBe(30);
    });

    it("should know the highest id of a file without entities as zero", () => {
        // Act
        const source = sourceOf([]);

        // Assert
        expect(source.maxId).toBe(0);
        expect(Array.from(source.index.ids)).toEqual([]);
    });

    it("should list the ids of each type in file order without decoding a row", () => {
        // Arrange
        const source = sourceOf(PLACED_WALL_ROWS);

        // Act
        const points = source.idsOfType("IfcCartesianPoint");

        // Assert
        expect(points).toEqual([5, 6]);
        expect(source.idsOfType("IfcWallType")).toEqual([]);
    });

    it("should find the owners of a GlobalId and the users of an entity from the file's bytes", () => {
        // Arrange
        const source = sourceOf(PLACED_WALL_ROWS);

        // Act
        const owners = source.ownersOfGlobalId(WALL_GLOBAL_ID);
        const users = source.usersOf(5);

        // Assert
        expect(owners).toEqual([20]);
        expect(users).toEqual([3, 30]);
        expect(source.usersOf(4)).toEqual([]);
    });

    it("should find every owner of a GlobalId the file gives several objects, in the file's order", () => {
        // Arrange
        const shared = "3SharedGlobalId0000001";
        const source = sourceOf([`#8=IFCWALL('${shared}',$,$,$,$,$,$,$,$);`, `#3=IFCSLAB('${shared}',$,$,$,$,$,$,$,$);`, `#5=IFCDOOR('${shared}',$,$,$,$,$,$,$,$,$,$,$,$);`]);

        // Act
        const owners = source.ownersOfGlobalId(shared);

        // Assert
        expect(owners).toEqual([8, 3, 5]);
    });

    it("should find an owner by its GlobalId when the file writes it with an escape", () => {
        // Arrange
        const source = sourceOf(["#4=IFCWALL('\\X2\\0033\\X0\\EscapedGlobalId00001',$,$,$,$,$,$,$,$);"]);

        // Act
        const owners = source.ownersOfGlobalId("3EscapedGlobalId00001");

        // Assert
        expect(owners).toEqual([4]);
    });

    it("should not count a reference written inside a comment or a string", () => {
        // Arrange
        const source = sourceOf(["#1=IFCCARTESIANPOINT((0.,0.,0.));", "#2=(IFCA(/* #1 isn't */ 3) IFCB('#1'));"]);

        // Act
        const users = source.usersOf(1);

        // Assert
        expect(users).toEqual([]);
    });

    it("should list a row that refers to an entity twice once, leave out ids the file lacks, and keep the file's order", () => {
        // Arrange
        const source = sourceOf(["#9=IFCCARTESIANPOINT((0.,0.,0.));", "#4=IFCPOLYLINE((#9,#9,#77));", "#2=IFCPOLYLINE((#9,#4));"]);

        // Act
        const users = [source.usersOf(9), source.usersOf(4), source.usersOf(77)];

        // Assert
        expect(users).toEqual([[4, 2], [2], []]);
    });

    it("should name each row's type in the schema's spelling", () => {
        // Arrange
        const source = sourceOf(PLACED_WALL_ROWS);

        // Act
        const types = [source.typeOf(20), source.typeOf(3), source.typeOf(4)];

        // Assert
        expect(types).toEqual(["IfcWall", "IfcAxis2Placement3D", undefined]);
    });

    it("should decode an entity once and give back the same object every time", () => {
        // Arrange
        const source = sourceOf(PLACED_WALL_ROWS);

        // Act
        const first = source.get(3);
        const second = source.get(3);

        // Assert
        expect(first).toEqual({ id: 3, type: "IfcAxis2Placement3D", args: [ref(5), ref(2), null] });
        expect(second).toBe(first);
    });

    it("should peek at an entity without keeping it, and hand back the kept one once it is decoded", () => {
        // Arrange
        const source = sourceOf(PLACED_WALL_ROWS);

        // Act
        const peeked = source.peek(3);
        const peekedAgain = source.peek(3);
        const kept = source.get(3);
        const peekedAfter = source.peek(3);

        // Assert
        expect(peeked).toEqual({ id: 3, type: "IfcAxis2Placement3D", args: [ref(5), ref(2), null] });
        expect(peekedAgain).not.toBe(peeked);
        expect(kept).not.toBe(peeked);
        expect(peekedAfter).toBe(kept);
        expect(source.peek(4)).toBeUndefined();
    });

    it("should read a row that holds only a list of references without decoding it, and nothing for any other row", () => {
        // Arrange
        const source = sourceOf([...PLACED_WALL_ROWS, "#40=IFCPOLYLOOP((#5,#6,#5));"]);

        // Act
        const loop = source.referenceList(40);
        const placement = source.referenceList(3);
        const missing = source.referenceList(4);

        // Assert
        expect(loop).toEqual([5, 6, 5]);
        expect(placement).toBeUndefined();
        expect(missing).toBeUndefined();
    });

    it("should give nothing for an id the file does not hold", () => {
        // Arrange
        const source = sourceOf(PLACED_WALL_ROWS);

        // Act
        const entity = source.get(4);

        // Assert
        expect(entity).toBeUndefined();
        expect(source.has(4)).toBe(false);
    });

    it("should refuse a file that holds an id twice, at the second row", () => {
        // Arrange
        const rows = ["#1=IFCCARTESIANPOINT((0.,0.,0.));", "#1=IFCDIRECTION((1.,0.,0.));"];
        const at = ifcFile(rows).indexOf(rows[1]!);

        // Act
        const error = errorThrownBy(StepSyntaxError, () => sourceOf(rows));

        // Assert
        expect([error.message, error.offset]).toEqual([`The file holds entity #1 twice at byte ${at}`, at]);
    });

    it("should index a row whose type the schema does not know and refuse it only when it is decoded, at the row", () => {
        // Arrange
        const rows = [...PLACED_WALL_ROWS, UNKNOWN_TYPE_ROW];
        const source = sourceOf(rows);
        const at = ifcFile(rows).indexOf(UNKNOWN_TYPE_ROW);

        // Act
        const error = errorThrownBy(StepSyntaxError, () => source.get(7));

        // Assert
        expect([source.has(7), source.typeOf(7), source.get(5)]).toEqual([true, undefined, point(5, [0, 0, 0])]);
        expect([error.message, error.offset]).toEqual([`Entity #7 is a IFCNOTATHING, which IFC4 does not define at byte ${at}`, at]);
    });

    it("should name a complex instance as such when it is decoded, at the row", () => {
        // Arrange
        const source = sourceOf([COMPLEX_INSTANCE_ROW]);
        const at = ifcFile([COMPLEX_INSTANCE_ROW]).indexOf(COMPLEX_INSTANCE_ROW);

        // Act
        const error = errorThrownBy(StepSyntaxError, () => source.get(8));

        // Assert
        expect([source.has(8), error.message, error.offset]).toEqual([true, `Entity #8 is a complex instance, which IFC4 does not define at byte ${at}`, at]);
    });
});

describe("ModelSnapshot read from a file", () => {
    it("should know which ids it holds", () => {
        // Arrange
        const model = placedWallModel();

        // Act
        const held = [5, 4, 30, 31].map((id) => model.has(id));

        // Assert
        expect(held).toEqual([true, false, true, false]);
    });

    it("should decode an entity with its values in schema order", () => {
        // Arrange
        const model = placedWallModel();

        // Act
        const polyline = model.get(30);

        // Assert
        expect(polyline).toEqual({ id: 30, type: "IfcPolyline", args: [[ref(5), ref(6), ref(5)]] });
    });

    it("should give nothing for an id it does not hold", () => {
        // Arrange
        const model = placedWallModel();

        // Act
        const entity = model.get(4);

        // Assert
        expect(entity).toBeUndefined();
    });

    it("should refuse to hand out an entity it does not hold", () => {
        // Arrange
        const model = placedWallModel();

        // Act & Assert
        expect(() => model.entity(4)).toThrow("The model has no entity #4");
    });

    it("should name an entity's type in the schema's spelling", () => {
        // Arrange
        const model = placedWallModel();

        // Act
        const types = [model.typeOf(20), model.typeOf(10), model.typeOf(4)];

        // Assert
        expect(types).toEqual(["IfcWall", "IfcLocalPlacement", undefined]);
    });

    it("should read attributes by name", () => {
        // Arrange
        const model = placedWallModel();

        // Act
        const values = ["GlobalId", "Name", "ObjectPlacement", "Tag", "PredefinedType"].map((name) => model.attribute(20, name));

        // Assert
        expect(values).toEqual([WALL_GLOBAL_ID, "Wall", ref(10), null, { enum: "STANDARD" }]);
    });

    it("should refuse an attribute the entity's type does not have", () => {
        // Arrange
        const model = placedWallModel();

        // Act & Assert
        expect(() => model.attribute(20, "Height")).toThrow("IfcWall has no attribute Height");
    });

    it("should refuse an attribute of an entity it does not hold", () => {
        // Arrange
        const model = placedWallModel();

        // Act & Assert
        expect(() => model.attribute(4, "Name")).toThrow("The model has no entity #4");
    });

    it("should list the ids in file order and count them", () => {
        // Arrange
        const model = placedWallModel();

        // Act
        const ids = model.ids();

        // Assert
        expect(ids).toEqual(PLACED_WALL_IDS);
        expect(model.size).toBe(8);
    });

    it("should continue ids after the highest id of the file and hold no changes", () => {
        // Act
        const model = placedWallModel();

        // Assert
        expect(model.nextId).toBe(31);
        expect(model.overlay.size).toBe(0);
        expect(model.source).toBeInstanceOf(IfcSource);
        expect(model.seededIds).toBe(false);
    });
});

describe("ModelSnapshot changes over a file", () => {
    it("should read a replaced entity from its changes", () => {
        // Arrange
        const moved = point(5, [1, 2, 3]);

        // Act
        const model = withChanges(placedWallModel(), [[5, moved]]);

        // Assert
        expect(model.get(5)).toBe(moved);
        expect(model.attribute(5, "Coordinates")).toEqual([1, 2, 3]);
        expect(model.ids()).toEqual(PLACED_WALL_IDS);
    });

    it("should peek at a changed entity in its changes, at the file's own in the file, and refuse a deleted one", () => {
        // Arrange
        const moved = point(5, [1, 2, 3]);
        const model = withChanges(placedWallModel(), [[5, moved], [2, null]]);

        // Act
        const changed = model.peek(5);
        const own = model.peek(3);

        // Assert
        expect(changed).toBe(moved);
        expect(own).toEqual({ id: 3, type: "IfcAxis2Placement3D", args: [ref(5), ref(2), null] });
        expect(model.valueOf(changed, "Coordinates")).toEqual([1, 2, 3]);
        expect(() => model.peek(2)).toThrow("The model has no entity #2");
        expect(() => model.peek(999)).toThrow("The model has no entity #999");
    });

    it("should leave a changed or deleted entity's references to the full reader", () => {
        // Arrange
        const base = readModel(ifcFile([...PLACED_WALL_ROWS, "#40=IFCPOLYLOOP((#5,#6,#5));", "#41=IFCPOLYLOOP((#5,#6,#5));"]));
        const model = withChanges(base, [[40, { id: 40, type: "IfcPolyLoop", args: [[ref(6), ref(5), ref(6)]] }], [41, null]]);

        // Act
        const lists = [model.referenceList(40), model.referenceList(41), base.referenceList(40)];

        // Assert
        expect(lists).toEqual([undefined, undefined, [5, 6, 5]]);
    });

    it("should hide a deleted entity", () => {
        // Act
        const model = withChanges(placedWallModel(), [[30, null]]);

        // Assert
        expect(model.has(30)).toBe(false);
        expect(model.get(30)).toBeUndefined();
        expect(model.typeOf(30)).toBeUndefined();
        expect(model.ids()).toEqual([5, 2, 6, 3, 10, 1, 20]);
        expect(model.size).toBe(7);
    });

    it("should list created entities after the file's own, in ascending id order", () => {
        // Act
        const model = withChanges(placedWallModel(), [[32, point(32, [2, 0, 0])], [31, point(31, [1, 1, 0])]], 33);

        // Assert
        expect(model.ids()).toEqual([...PLACED_WALL_IDS, 31, 32]);
        expect(model.size).toBe(10);
    });

    it("should not list an id the changes mark deleted when the file never held it", () => {
        // Act
        const model = withChanges(placedWallModel(), [[31, null]], 32);

        // Assert
        expect(model.has(31)).toBe(false);
        expect(model.ids()).toEqual(PLACED_WALL_IDS);
    });

    it("should leave the model it was made from unchanged", () => {
        // Arrange
        const base = placedWallModel();

        // Act
        withChanges(base, [[30, null], [31, point(31, [1, 1, 0])]], 32);

        // Assert
        expect(base.has(30)).toBe(true);
        expect(base.has(31)).toBe(false);
        expect(base.ids()).toEqual(PLACED_WALL_IDS);
    });
});

describe("ModelSnapshot.byType", () => {
    it("should list a type and its subtypes in ascending id order whatever the file order", () => {
        // Arrange
        const model = placedWallModel();

        // Act
        const items = model.byType("IfcRepresentationItem");

        // Assert
        expect(idsOf(items)).toEqual([2, 3, 5, 6, 30]);
    });

    it("should list an abstract type's instances through its subtypes", () => {
        // Arrange
        const model = placedWallModel();

        // Act
        const found = [idsOf(model.byType("IfcPoint")), idsOf(model.byType("IfcBuildingElement"))];

        // Assert
        expect(found).toEqual([[5, 6], [20]]);
    });

    it("should list only the type itself when subtypes are left out", () => {
        // Arrange
        const model = placedWallModel();

        // Act
        const found = [idsOf(model.byType("IfcCartesianPoint", false)), idsOf(model.byType("IfcPoint", false))];

        // Assert
        expect(found).toEqual([[5, 6], []]);
    });

    it("should match a type name written in any case", () => {
        // Arrange
        const model = placedWallModel();

        // Act
        const walls = model.byType("IFCWALL", false);

        // Assert
        expect(walls).toEqual([model.entity(20)]);
    });

    it("should list nothing for a type the schema does not define", () => {
        // Arrange
        const model = placedWallModel();

        // Act
        const found = [model.byType("IfcNothing"), model.byType("IfcNothing", false)];

        // Assert
        expect(found).toEqual([[], []]);
    });

    it("should include created entities and leave out deleted ones", () => {
        // Arrange
        const created = point(31, [1, 1, 0]);

        // Act
        const model = withChanges(placedWallModel(), [[6, null], [31, created]], 32);

        // Assert
        expect(model.byType("IfcCartesianPoint")).toEqual([model.entity(5), created]);
    });

    it("should skip a row whose type the schema does not know", () => {
        // Arrange
        const model = readModel(ifcFile([...PLACED_WALL_ROWS, UNKNOWN_TYPE_ROW]));

        // Act
        const roots = model.byType("IfcRoot");

        // Assert
        expect(idsOf(roots)).toEqual([1, 20]);
        expect(model.ids()).toEqual([...PLACED_WALL_IDS, 7]);
    });
});

describe("ModelSnapshot.referencesTo", () => {
    it("should list each entity that refers to an entity once, in model order", () => {
        // Arrange
        const model = placedWallModel();

        // Act
        const users = [model.referencesTo(5), model.referencesTo(3), model.referencesTo(10)];

        // Assert
        expect(users).toEqual([[3, 30], [10], [20]]);
    });

    it("should list nothing for an entity nothing refers to", () => {
        // Arrange
        const model = placedWallModel();

        // Act
        const users = [model.referencesTo(20), model.referencesTo(1), model.referencesTo(99)];

        // Assert
        expect(users).toEqual([[], [], []]);
    });

    it("should count references from created entities and not from deleted ones", () => {
        // Arrange
        const createdPolyline: IfcEntity = { id: 31, type: "IfcPolyline", args: [[ref(6), ref(5)]] };

        // Act
        const model = withChanges(placedWallModel(), [[30, null], [31, createdPolyline]], 32);

        // Assert
        expect(model.referencesTo(5)).toEqual([3, 31]);
        expect(model.referencesTo(6)).toEqual([31]);
    });

    it("should find the references in a file that also holds a row whose type the schema does not know", () => {
        // Arrange
        const model = readModel(ifcFile([...PLACED_WALL_ROWS, UNKNOWN_TYPE_ROW]));

        // Act
        const users = model.referencesTo(5);

        // Assert
        expect(users).toEqual([3, 30]);
    });
});

describe("ModelSnapshot.byGlobalId", () => {
    it("should find objects by their GlobalId", () => {
        // Arrange
        const model = placedWallModel();

        // Act
        const ids = [model.byGlobalId(PROJECT_GLOBAL_ID), model.byGlobalId(WALL_GLOBAL_ID)];

        // Assert
        expect(ids).toEqual([1, 20]);
    });

    it("should find nothing for a GlobalId no object carries", () => {
        // Arrange
        const model = placedWallModel();

        // Act
        const id = model.byGlobalId(OTHER_GLOBAL_ID);

        // Assert
        expect(id).toBeUndefined();
    });

    it("should look only at objects that carry a GlobalId", () => {
        // Arrange
        const model = readModel(ifcFile([...PLACED_WALL_ROWS, `#40=IFCMATERIAL('${OTHER_GLOBAL_ID}',$,$);`]));

        // Act
        const id = model.byGlobalId(OTHER_GLOBAL_ID);

        // Assert
        expect(id).toBeUndefined();
    });

    it("should find an object created over the file", () => {
        // Arrange
        const model = withChanges(placedWallModel(), [[31, wall(31, OTHER_GLOBAL_ID)]], 32);

        // Act
        const id = model.byGlobalId(OTHER_GLOBAL_ID);

        // Assert
        expect(id).toBe(31);
    });
});

describe("ModelSnapshot.keySeed", () => {
    it("should be the project's GlobalId", () => {
        // Act
        const seed = placedWallModel().keySeed;

        // Assert
        expect(seed).toBe(PROJECT_GLOBAL_ID);
    });

    it("should be empty for a model without a project", () => {
        // Act
        const seeds = [emptyIfc4Model().keySeed, readModel(ifcFile(["#5=IFCCARTESIANPOINT((0.,0.,0.));"])).keySeed];

        // Assert
        expect(seeds).toEqual(["", ""]);
    });
});
