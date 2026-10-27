import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlobalCDNProvider } from "@bitbybit-dev/base";
import { IFCService } from "../api/ifc-service";
import { modelOf } from "../api/services/service-support";
import { OTHER_TOOL_FILE, WALL_A, WALL_B } from "../__test__/other-tool-file";
import { OWNER_ROWS, ownedFile } from "../__test__/owned-file";
import { isEnumeration, isReference, ref } from "../step/values";
import type { ModelSnapshot } from "./snapshot";
import { IfcTransaction } from "./transaction";

const ifc = new IFCService();
const NOW = 1_800_000_000;
const ORIGINAL = 1_700_000_000;

function historyOf(model: ModelSnapshot, globalId: string): number {
    const owner = model.attribute(model.byGlobalId(globalId)!, "OwnerHistory");
    if (!isReference(owner)) {
        throw new Error(`${globalId} has no owner history`);
    }
    return owner.ref;
}

function actionOf(model: ModelSnapshot, history: number): string | undefined {
    const action = model.attribute(history, "ChangeAction");
    return isEnumeration(action) ? action.enum : undefined;
}

function referenced(model: ModelSnapshot, id: number, name: string): number | undefined {
    const value = model.attribute(id, name);
    return isReference(value) ? value.ref : undefined;
}

function ourApplications(model: ModelSnapshot): number[] {
    return model.byType("IfcApplication").filter((application) => model.valueOf(application, "ApplicationIdentifier") === "@bitbybit-dev/ifc").map((application) => application.id);
}

describe("owner histories of a file that keeps them", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW * 1000);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should mark what a change adds as added, by the file's own user and this library, at the time of the change", () => {
        // Arrange
        const model = ifc.model.read({ data: ownedFile() });

        // Act
        const changed = modelOf(ifc.doors.add({ model: ifc.doors.addType({ model, id: "door", width: 0.9, height: 2.1 }), wall: WALL_A, doorType: "door", id: "entrance", offset: 1 }));

        // Assert
        const door = changed.byType("IfcDoor")[0]!;
        const history = referenced(changed, door.id, "OwnerHistory")!;
        expect(actionOf(changed, history)).toBe("ADDED");
        expect(changed.attribute(history, "CreationDate")).toBe(NOW);
        expect(changed.attribute(history, "LastModifiedDate")).toBe(NOW);
        expect(referenced(changed, history, "OwningUser")).toBe(902);
        expect(referenced(changed, history, "LastModifyingUser")).toBe(902);
        const application = referenced(changed, history, "OwningApplication")!;
        expect(ourApplications(changed)).toEqual([application]);
        expect(changed.attribute(application, "Version")).toBe(GlobalCDNProvider.BITBYBIT_CDN_URL.split("/v").pop());
        expect(changed.attribute(referenced(changed, application, "ApplicationDeveloper")!, "Name")).toBe("Bit By Bit Developers");
        const opening = changed.byType("IfcOpeningElement")[0]!;
        expect(referenced(changed, opening.id, "OwnerHistory")).toBe(history);
    });

    it("should mark what a change rewrites as modified, keeping who made it and when, in one history for everything it rewrote", () => {
        // Arrange
        const model = ifc.model.read({ data: ownedFile() });

        // Act
        const joined = modelOf(ifc.walls.connect({ model, wall: WALL_A, other: WALL_B }));

        // Assert
        const history = historyOf(joined, WALL_A);
        expect(historyOf(joined, WALL_B)).toBe(history);
        expect(history).not.toBe(906);
        expect(actionOf(joined, history)).toBe("MODIFIED");
        expect(joined.attribute(history, "CreationDate")).toBe(ORIGINAL);
        expect(joined.attribute(history, "LastModifiedDate")).toBe(NOW);
        expect(referenced(joined, history, "OwningUser")).toBe(902);
        expect(referenced(joined, history, "OwningApplication")).toBe(904);
        expect(ourApplications(joined)).toEqual([referenced(joined, history, "LastModifyingApplication")]);
        expect(actionOf(joined, 906)).toBe("NOCHANGE");
        expect(historyOf(joined, "0StoreyGlobalId0000003")).toBe(906);
    });

    it("should mark an element modified when what it is made of changes, but not what is only placed on it", () => {
        // Arrange
        const withDoor = ifc.doors.add({ model: ifc.doors.addType({ model: ifc.model.read({ data: ownedFile() }), id: "door", width: 0.9, height: 2.1 }), wall: WALL_A, doorType: "door", id: "entrance", offset: 1 });
        const added = historyOf(modelOf(withDoor), WALL_A);
        const door = modelOf(withDoor).byType("IfcDoor")[0]!.id;
        const doorHistory = referenced(modelOf(withDoor), door, "OwnerHistory");

        // Act
        const moved = modelOf(ifc.model.move({ model: withDoor, element: WALL_A, translation: [0, 1, 0] }));

        // Assert
        const history = historyOf(moved, WALL_A);
        expect(history).not.toBe(added);
        expect(actionOf(moved, history)).toBe("MODIFIED");
        expect(referenced(moved, door, "OwnerHistory")).toBe(doorHistory);
        expect(historyOf(moved, WALL_B)).toBe(906);
    });

    it("should mark a property set modified when one of its values changes, and leave its element as it was", () => {
        // Arrange
        const model = ifc.properties.addSet({ model: ifc.model.read({ data: ownedFile() }), elements: [WALL_A], name: "Pset_WallCommon", properties: [{ name: "FireRating", value: "REI 30" }] });
        const set = modelOf(model).byType("IfcPropertySet")[0]!.id;
        const wall = historyOf(modelOf(model), WALL_A);

        // Act
        const changed = modelOf(ifc.properties.setValues({ model, element: WALL_A, name: "Pset_WallCommon", properties: [{ name: "FireRating", value: "REI 60" }] }));

        // Assert
        const history = referenced(changed, set, "OwnerHistory")!;
        expect(actionOf(changed, history)).toBe("MODIFIED");
        expect(historyOf(changed, WALL_A)).toBe(wall);
    });

    it("should keep to one application of this library across changes, and give an element that had no history one", () => {
        // Arrange
        const unowned = ownedFile().replace(`'${WALL_B}',#906,`, `'${WALL_B}',$,`);
        const model = ifc.model.read({ data: unowned });

        // Act
        const first = ifc.model.setAttribute({ model, element: WALL_A, value: "Wall A1" });
        const second = modelOf(ifc.model.setAttribute({ model: first, element: WALL_B, value: "Wall B1" }));

        // Assert
        expect(ourApplications(second)).toHaveLength(1);
        const history = historyOf(second, WALL_B);
        expect(actionOf(second, history)).toBe("MODIFIED");
        expect(second.attribute(history, "CreationDate")).toBe(NOW);
        expect(referenced(second, history, "OwningUser")).toBe(902);
        expect(referenced(second, history, "OwningApplication")).toBe(ourApplications(second)[0]);
    });

    it("should leave a history a change sets itself as it set it", () => {
        // Arrange
        const model = modelOf(ifc.model.read({ data: ownedFile() }));
        const tx = new IfcTransaction(model);
        const wall = model.byGlobalId(WALL_A)!;

        // Act
        tx.update(wall, { Name: "Renamed", OwnerHistory: null });
        const changed = tx.commit();

        // Assert
        expect(changed.attribute(wall, "OwnerHistory")).toBeNull();
        expect(changed.byType("IfcOwnerHistory")).toHaveLength(1);
    });

    it("should leave a history a change gives what it adds as it gave it", () => {
        // Arrange
        const model = modelOf(ifc.model.read({ data: ownedFile() }));
        const tx = new IfcTransaction(model);

        // Act
        const proxy = tx.create("IfcBuildingElementProxy", { GlobalId: tx.globalId("proxy"), OwnerHistory: ref(906) });
        const changed = tx.commit();

        // Assert
        expect(changed.attribute(proxy, "OwnerHistory")).toEqual(ref(906));
        expect(changed.byType("IfcOwnerHistory")).toHaveLength(1);
    });

    it("should keep who made a history when another user changes what it records", () => {
        // Arrange
        const rows = [...OWNER_ROWS.filter((row) => !row.startsWith("#906=")), "#907=IFCPERSON($,'Roe','Richard',$,$,$,$,$);", "#905=IFCPERSONANDORGANIZATION(#907,#901,$);", "#906=IFCOWNERHISTORY(#905,#904,$,.NOCHANGE.,$,$,$,1700000000);"];
        const model = ifc.model.read({ data: ownedFile(rows) });

        // Act
        const renamed = modelOf(ifc.model.setAttribute({ model, element: WALL_A, value: "Wall A1" }));

        // Assert
        const history = historyOf(renamed, WALL_A);
        expect([referenced(renamed, history, "OwningUser"), referenced(renamed, history, "LastModifyingUser")]).toEqual([905, 902]);
    });

    it("should mark an element modified when a row two steps below it changes", () => {
        // Arrange
        const model = modelOf(ifc.model.read({ data: ownedFile() }));
        const tx = new IfcTransaction(model);

        // Act
        tx.update(39, { RepresentationIdentifier: "Body" });
        const changed = tx.commit();

        // Assert
        expect(actionOf(changed, historyOf(changed, WALL_A))).toBe("MODIFIED");
        expect(historyOf(changed, WALL_B)).toBe(906);
    });

    it("should write nothing for a file that names people but keeps no histories", () => {
        // Arrange
        const people = ifc.model.read({ data: OTHER_TOOL_FILE.replace("DATA;", `DATA;\r\n${OWNER_ROWS.slice(0, 3).join("\r\n")}`) });

        // Act
        const renamed = modelOf(ifc.model.setAttribute({ model: people, element: WALL_A, value: "Wall A1" }));

        // Assert
        expect(renamed.byType("IfcOwnerHistory")).toHaveLength(0);
        expect(renamed.attribute(renamed.byGlobalId(WALL_A)!, "OwnerHistory")).toBeNull();
    });

    it("should write nothing for a file that keeps no histories, or keeps them with no user to name", () => {
        // Arrange
        const ours = ifc.spatial.addStorey({ model: ifc.model.create({ name: "Ours", seed: "ours" }), id: "ground", elevation: 0 });
        const userless = ifc.model.read({ data: ownedFile(OWNER_ROWS.filter((row) => !row.includes("IFCPERSONANDORGANIZATION"))).replace("#906=IFCOWNERHISTORY(#902,", "#906=IFCOWNERHISTORY(#904,") });

        // Act
        const added = modelOf(ifc.walls.add({ model: ours, storey: "ground", start: [0, 0], end: [4000, 0], height: 3000, thickness: 200 }));
        const renamed = modelOf(ifc.model.setAttribute({ model: userless, element: WALL_A, value: "Wall A1" }));

        // Assert
        expect(added.byType("IfcOwnerHistory")).toHaveLength(0);
        expect(historyOf(renamed, WALL_A)).toBe(906);
    });
});
