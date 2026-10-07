import { IFC, IFCService } from "@bitbybit-dev/ifc";
import type { IfcModel } from "@bitbybit-dev/ifc";
import { ManifoldService } from "@bitbybit-dev/manifold";
import Module from "manifold-3d";
import { beforeAll, describe, expect, it } from "vitest";

const ifc = new IFCService();

function house(): IfcModel {
    let model = ifc.model.create({ name: "Room", seed: "display" });
    model = ifc.spatial.addStorey({ model, id: "ground", elevation: 0 });
    const corners: [number, number][] = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
    for (let i = 0; i < 4; i++) {
        model = ifc.walls.add({ model, storey: "ground", id: `wall-${i}`, start: corners[i]!, end: corners[(i + 1) % 4]!, height: 3000, thickness: 200, alignment: IFC.wallAlignmentEnum.right });
    }
    for (let i = 0; i < 4; i++) {
        model = ifc.walls.connect({ model, wall: `wall-${i}`, other: `wall-${(i + 1) % 4}` });
    }
    model = ifc.doors.addType({ model, id: "door", width: 900, height: 2100 });
    model = ifc.doors.add({ model, wall: "wall-0", doorType: "door", id: "door-1", offset: 1000 });
    return ifc.slabs.add({ model, storey: "ground", id: "floor", outline: corners, thickness: 200 });
}

describe("an IFC model drawn through Manifold", () => {
    let manifold: ManifoldService;

    beforeAll(async () => {
        const wasm = await Module();
        wasm.setup();
        manifold = new ManifoldService(wasm);
    });

    it("should build every element of the model as a solid of the volume it holds", () => {
        // Arrange
        const recipe = ifc.geometry.recipe({ model: house() });

        // Act
        const solids = manifold.recipes.build({ recipe });
        const volumes = solids.map((solid) => solid.volume() / 1e9);
        solids.forEach((solid) => solid.delete());

        // Assert
        expect(recipe.roots.map((root) => root.tag["type"])).toEqual(["IfcWall", "IfcWall", "IfcWall", "IfcWall", "IfcDoor", "IfcSlab"]);
        expect(volumes[0]).toBeCloseTo((6000 + 6400) / 2 * 200 * 3000 / 1e9 - 0.9 * 2.1 * 0.2, 9);
        expect(volumes[1]).toBeCloseTo((4000 + 4400) / 2 * 200 * 3000 / 1e9, 9);
        expect(volumes[5]).toBeCloseTo(6 * 4 * 0.2, 9);
    });

    it("should stand the building up along Y when its Z is turned into Y", () => {
        // Arrange
        const recipe = ifc.geometry.recipe({ model: house(), elements: ["wall-1"] });

        // Act
        const [wall] = manifold.recipes.build({ recipe, adjustZtoY: true });
        const box = wall!.boundingBox();
        wall!.delete();

        // Assert
        expect(box.min[1]).toBeCloseTo(0, 9);
        expect(box.max[1]).toBeCloseTo(3000, 9);
        expect(box.min[0]).toBeCloseTo(6000, 9);
        expect(box.max[0]).toBeCloseTo(6200, 9);
        expect(box.min[2]).toBeCloseTo(-4200, 9);
        expect(box.max[2]).toBeCloseTo(200, 9);
    });
});
