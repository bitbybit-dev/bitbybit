import { describe, expect, it } from "vitest";
import { addRightWall, expressIdOf, groundFloor, oneWall } from "../__test__/build-setup";
import { unwrapBody } from "../__test__/build-geometry";
import type { IfcModel } from "../model/model-types";

const REGISTRY = "BBIM_Boolean";

function listed(sets: readonly { name: string; properties: Record<string, unknown> }[]): string | undefined {
    const data = sets.find((set) => set.name === REGISTRY)?.properties["Data"];
    return typeof data === "string" ? data : undefined;
}

function appliedClippings(model: IfcModel, wall: string): number[] {
    return [...unwrapBody(model, expressIdOf(model, wall)).clippings].reverse();
}

describe("the clipping registry Bonsai reads", () => {
    it("should list a clipping in the order it was applied, in the set Bonsai keeps its own in", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const once = ifc.walls.clipByPlane({ model, wall: "south", origin: [0, 0, 2600], normal: [0, -0.5, 1] });
        const twice = ifc.walls.clipByPlane({ model: once, wall: "south", origin: [4000, 0, 0], normal: [1, 0, 0] });

        // Assert
        expect(listed(ifc.properties.getSets({ model: twice, element: "south" }))).toBe(`[${appliedClippings(twice, "south").join(", ")}]`);
        expect(appliedClippings(twice, "south")).toHaveLength(2);
        expect(twice.byType("IfcPropertySet").filter((set) => set.args[2] === REGISTRY)).toHaveLength(1);
    });

    it("should follow the clippings when an edit or a join rebuilds the body, and drop the rows that went", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = addRightWall(ifc, ground, "south", [0, 0], [10000, 0]);
        model = addRightWall(ifc, model, "east", [10000, 0], [10000, 8000]);
        const clipped = ifc.walls.clipByPlane({ model, wall: "south", origin: [0, 0, 2600] });
        const before = appliedClippings(clipped, "south");

        // Act
        const edited = ifc.walls.edit({ model: ifc.walls.connect({ model: clipped, wall: "south", other: "east" }), wall: "south", thickness: 300 });

        // Assert
        const now = appliedClippings(edited, "south");
        expect(now).toHaveLength(1);
        expect(now[0]).not.toBe(before[0]);
        expect(edited.typeOf(before[0]!)).toBeUndefined();
        expect(listed(ifc.properties.getSets({ model: edited, element: "south" }))).toBe(`[${now[0]}]`);
        expect(ifc.properties.getSets({ model: edited, element: "east" }).map((set) => set.name)).not.toContain(REGISTRY);
    });

    it("should leave a clipping the file never listed unlisted, and list only the ones added since", () => {
        // Arrange
        const { ifc, model } = oneWall();
        const unlisted = ifc.properties.removeSet({ model: ifc.walls.clipByPlane({ model, wall: "south", origin: [0, 0, 2600] }), element: "south", name: REGISTRY });

        // Act
        const edited = ifc.walls.edit({ model: unlisted, wall: "south", height: 3200 });
        const clippedAgain = ifc.walls.clipByPlane({ model: edited, wall: "south", origin: [4000, 0, 0], normal: [1, 0, 0] });

        // Assert
        expect(ifc.properties.getSets({ model: edited, element: "south" }).map((set) => set.name)).not.toContain(REGISTRY);
        const applied = appliedClippings(clippedAgain, "south");
        expect(listed(ifc.properties.getSets({ model: clippedAgain, element: "south" }))).toBe(`[${applied[1]}]`);
    });

    it("should keep a listed boolean outside the body's clippings while it exists, and forget one that is gone", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = addRightWall(ifc, ground, "south", [0, 0], [10000, 0]);
        model = addRightWall(ifc, model, "north", [0, 8000], [10000, 8000]);
        model = ifc.walls.clipByPlane({ model, wall: "north", origin: [0, 0, 2600] });
        const elsewhere = appliedClippings(model, "north")[0]!;
        model = ifc.properties.setValues({ model, element: "south", name: REGISTRY, properties: [{ name: "Data", value: `[${elsewhere}, 999999]` }] });

        // Act
        const clipped = ifc.walls.clipByPlane({ model, wall: "south", origin: [0, 0, 2400] });

        // Assert
        expect(listed(ifc.properties.getSets({ model: clipped, element: "south" }))).toBe(`[${elsewhere}, ${appliedClippings(clipped, "south")[0]}]`);
    });

    it("should write no set for a wall that has never been clipped", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const edited = ifc.walls.edit({ model, wall: "south", height: 3200 });

        // Assert
        expect(edited.byType("IfcPropertySet").filter((set) => set.args[2] === REGISTRY)).toHaveLength(0);
    });

    it("should leave a list that does not change as it was, and empty one whose booleans have all gone", () => {
        // Arrange
        const { ifc, model } = oneWall();
        const kept = ifc.properties.setValues({ model, element: "south", name: REGISTRY, properties: [{ name: "Data", value: "[]" }] });
        const gone = ifc.properties.setValues({ model, element: "south", name: REGISTRY, properties: [{ name: "Data", value: "[999999]" }] });
        const property = (current: IfcModel): number => current.byType("IfcPropertySingleValue").find((row) => row.args[0] === "Data")!.id;

        // Act
        const unchanged = ifc.walls.edit({ model: kept, wall: "south", height: 3200 });
        const emptied = ifc.walls.edit({ model: gone, wall: "south", height: 3200 });

        // Assert
        expect(property(unchanged)).toBe(property(kept));
        expect(listed(ifc.properties.getSets({ model: emptied, element: "south" }))).toBe("[]");
    });
});
