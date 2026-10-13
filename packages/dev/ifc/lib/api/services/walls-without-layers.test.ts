import { describe, expect, it } from "vitest";
import { errorFrom, expressIdOf } from "../../__test__/build-setup";
import { extrusionOf, footprintOf } from "../../__test__/build-geometry";
import { OTHER_TOOL_FILE, WALL_A, WALL_B, WALLS_WITHOUT_LAYER_USAGE as WITHOUT_USAGE } from "../../__test__/other-tool-file";
import { IFCService } from "../ifc-service";

const WALL_A_PROFILE = "#36=IFCRECTANGLEPROFILEDEF(.AREA.,$,#34,6.,0.3);";

function withWallAOutline(points: readonly (readonly [number, number])[], holes = ""): string {
    const rows = points.map(([x, y], at) => `#${900 + at}=IFCCARTESIANPOINT((${x.toFixed(1)},${y.toFixed(1)}));`);
    const loop = [...points.keys(), 0].map((at) => `#${900 + at}`).join(",");
    const profile = holes === "" ? `#36=IFCARBITRARYCLOSEDPROFILEDEF(.AREA.,$,#920);` : `#36=IFCARBITRARYPROFILEDEFWITHVOIDS(.AREA.,$,#920,(${holes}));`;
    return WITHOUT_USAGE.replace(WALL_A_PROFILE, [...rows, `#920=IFCPOLYLINE((${loop}));`, profile].join("\r\n"));
}

function materialsOf(ifc: IFCService, data: string, edit: (model: ReturnType<IFCService["model"]["read"]>) => ReturnType<IFCService["model"]["read"]>): { usages: number; materials: number } {
    const changed = edit(ifc.model.read({ data }));
    return { usages: changed.byType("IfcMaterialLayerSetUsage").length, materials: changed.byType("IfcMaterial").length };
}

describe("walls another tool wrote without a material layer set usage", () => {
    it("should read the thickness and offset from the body's outline, and name no layer set", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: WITHOUT_USAGE });

        // Act
        const wall = ifc.walls.parameters({ model, wall: WALL_A });

        // Assert
        expect([wall.thickness, wall.offset, wall.alignment, wall.layerSet]).toEqual([0.3, -0.3, "right", ""]);
    });

    it("should read a mitred outline, as Revit writes one, by its two sides along the axis", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: withWallAOutline([[0, -0.3], [6.3, -0.3], [6, 0], [0, 0]]) });

        // Act
        const wall = ifc.walls.parameters({ model, wall: WALL_A });

        // Assert
        expect([Math.round(wall.thickness * 1e9) / 1e9, Math.round(wall.offset * 1e9) / 1e9]).toEqual([0.3, -0.3]);
    });

    it("should measure the sides from the axis, wherever the axis runs within the outline", () => {
        // Arrange
        const ifc = new IFCService();
        const centred = WITHOUT_USAGE.replace("#30=IFCCARTESIANPOINT((0.,0.));\r\n#31=IFCCARTESIANPOINT((6.,0.));", "#30=IFCCARTESIANPOINT((0.,-0.15));\r\n#31=IFCCARTESIANPOINT((6.,-0.15));");
        const model = ifc.model.read({ data: centred });

        // Act
        const wall = ifc.walls.parameters({ model, wall: WALL_A });

        // Assert
        expect([wall.thickness, Math.round(wall.offset * 1e9) / 1e9, wall.alignment]).toEqual([0.3, -0.15, "center"]);
    });

    it("should place the outline by the extrusion's position before reading its sides", () => {
        // Arrange
        const ifc = new IFCService();
        const placed = WITHOUT_USAGE
            .replace("#35=IFCCARTESIANPOINT((3.,-0.15));", "#35=IFCCARTESIANPOINT((3.,0.15));")
            .replace("#38=IFCEXTRUDEDAREASOLID(#36,#12,#37,3.);", "#931=IFCCARTESIANPOINT((0.,-0.3,0.));\r\n#932=IFCAXIS2PLACEMENT3D(#931,$,$);\r\n#38=IFCEXTRUDEDAREASOLID(#36,#932,#37,3.);");
        const model = ifc.model.read({ data: placed });

        // Act
        const wall = ifc.walls.parameters({ model, wall: WALL_A });

        // Assert
        expect([wall.thickness, Math.round(wall.offset * 1e9) / 1e9]).toEqual([0.3, -0.3]);
    });

    it("should rebuild a raised or thicker wall from its body alone and keep the material it had", () => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const raised = ifc.walls.edit({ model: ifc.model.read({ data: WITHOUT_USAGE }), wall: WALL_A, height: 3.2 });
        const thicker = ifc.walls.edit({ model: ifc.model.read({ data: WITHOUT_USAGE }), wall: WALL_A, thickness: 0.4 });

        // Assert
        expect(extrusionOf(raised, expressIdOf(raised, WALL_A)).depth).toBe(3.2);
        expect(footprintOf(thicker, expressIdOf(thicker, WALL_A))).toEqual([[0, -0.4], [6, -0.4], [6, 0], [0, 0]]);
        expect(ifc.walls.parameters({ model: thicker, wall: WALL_A }).thickness).toBeCloseTo(0.4, 12);
        expect([raised, thicker].map((model) => [model.byType("IfcMaterialLayerSetUsage").length, model.byType("IfcMaterial").length])).toEqual([[0, 1], [0, 1]]);
    });

    it("should join two such walls into the corner the same walls make with a layer set usage", () => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const without = ifc.walls.connect({ model: ifc.model.read({ data: WITHOUT_USAGE }), wall: WALL_A, other: WALL_B });
        const withUsage = ifc.walls.connect({ model: ifc.model.read({ data: OTHER_TOOL_FILE }), wall: WALL_A, other: WALL_B });

        // Assert
        expect([WALL_A, WALL_B].map((wall) => footprintOf(without, expressIdOf(without, wall)))).toEqual([WALL_A, WALL_B].map((wall) => footprintOf(withUsage, expressIdOf(withUsage, wall))));
        expect(materialsOf(ifc, WITHOUT_USAGE, (model) => ifc.walls.connect({ model, wall: WALL_A, other: WALL_B }))).toEqual({ usages: 0, materials: 1 });
    });

    it("should give such a wall the layer set it is asked for", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.materials.addLayerSet({ model: ifc.model.read({ data: WITHOUT_USAGE }), name: "Block 250", layers: [{ material: "Concrete", thickness: 0.25 }] });

        // Act
        const layered = ifc.walls.edit({ model, wall: WALL_A, layerSet: "Block 250" });

        // Assert
        const wall = ifc.walls.parameters({ model: layered, wall: WALL_A });
        expect([wall.thickness, wall.layerSet]).toEqual([0.25, "Block 250"]);
    });

    it("should refuse a wall whose body is an elevation extruded through its thickness, as Revit writes one with doors to the floor, for what it is", () => {
        // Arrange
        const ifc = new IFCService();
        const elevation = ["#933=IFCDIRECTION((0.,-1.,0.));", "#934=IFCDIRECTION((1.,0.,0.));", "#935=IFCAXIS2PLACEMENT3D(#10,#933,#934);", "#38=IFCEXTRUDEDAREASOLID(#36,#935,#37,0.3);"];
        const sideways = WITHOUT_USAGE.replace("#38=IFCEXTRUDEDAREASOLID(#36,#12,#37,3.);", elevation.join("\r\n"));
        const model = ifc.model.read({ data: sideways });

        // Act
        const error = errorFrom(() => ifc.walls.parameters({ model, wall: WALL_A }));

        // Assert
        expect(error.message).toBe("the IfcWall 'Wall A' has a body this library does not edit as a wall: its extrusion does not rise straight up from a plan outline");
    });

    it.each([
        ["an outline that is not a strip along the axis", withWallAOutline([[0, -0.3], [6, -0.3], [6, 0], [3, 0], [3, 0.5], [0, 0.5]]), "its outline is not a strip between two sides along its axis"],
        ["an outline without width", withWallAOutline([[0, 0], [6, 0], [3, 0], [1, 0]]), "its outline is not a strip between two sides along its axis"],
        ["an outline with a hole", withWallAOutline([[0, -0.3], [6, -0.3], [6, 0], [0, 0]], "#920"), "it is not a plan outline without holes extruded upwards"],
        ["no body", WITHOUT_USAGE.replace("#40=IFCPRODUCTDEFINITIONSHAPE($,$,(#33,#39));", "#40=IFCPRODUCTDEFINITIONSHAPE($,$,(#33));"), "it has none"],
    ])("should refuse a wall without a layer set usage and with %s", (_case, data, reason) => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data });

        // Act
        const error = errorFrom(() => ifc.walls.parameters({ model, wall: WALL_A }));

        // Assert
        expect(error.message).toBe(`the IfcWall 'Wall A' has no material layer set usage, so its thickness is read from its body, and ${reason}`);
    });
});
