import { describe, expect, it } from "vitest";
import { signedVolumeOf } from "@bitbybit-dev/base/lib/api/services/helpers/mesh-measures";
import type { Fixture } from "../../__test__/fixture-types";
import { expressIdOf, groundFloor, notAModel } from "../../__test__/build-setup";
import { constituentsOf, enumOf, extrusionOf, innerCurvesOf, outerCurveOf, refOf, refsOf, relatedBy, relatingOf, styleNamesOf, sweptAreaOf } from "../../__test__/build-geometry";
import { modelOf } from "./service-support";
import { absoluteFrame } from "../../build/placement";
import type { IfcModel } from "../../model/model-types";
import type * as Inputs from "../inputs";

const PLOT: Inputs.Base.Point2[] = [[-20000, -20000], [30000, -20000], [30000, 25000], [-20000, 25000]];
const FOOTPRINT: Inputs.Base.Point2[] = [[0, 0], [10000, 0], [10000, 8000], [0, 8000]];

function withPlanting(): Fixture {
    const { ifc, model } = groundFloor();
    const lawn = ifc.materials.add({ model, name: "Lawn", color: "#8fa877" });
    const foliage = ifc.materials.add({ model: lawn, name: "Foliage", color: "#6d8a5a" });
    return { ifc, model: ifc.materials.add({ model: foliage, name: "Bark", color: "#5b4a3c" }) };
}

function siteOf(model: IfcModel): number {
    return model.byType("IfcSite")[0]!.id;
}

function triangleSetsOf(model: IfcModel, element: number): number[] {
    const shape = refOf(model.attribute(element, "Representation"));
    const body = refsOf(model.attribute(shape, "Representations"))[0]!;
    expect(model.attribute(body, "RepresentationType")).toBe("Tessellation");
    return refsOf(model.attribute(body, "Items"));
}

function meshOf(model: IfcModel, faceSet: number): { positions: number[]; indices: number[] } {
    const list = refOf(model.attribute(faceSet, "Coordinates"));
    const points = model.attribute(list, "CoordList") as number[][];
    const triangles = model.attribute(faceSet, "CoordIndex") as number[][];
    return { positions: points.flat(), indices: triangles.flat().map((index) => index - 1) };
}

describe("IFCSite.addTerrain", () => {
    it("should add the ground as terrain of the site, its top at the elevation and reaching the depth down", () => {
        // Arrange
        const { ifc, model } = withPlanting();

        // Act
        const changed = ifc.site.addTerrain({ model, id: "terrain", outline: PLOT, depth: 600, elevation: -50 });

        // Assert
        const terrain = expressIdOf(changed, "terrain");
        const extrusion = extrusionOf(changed, terrain);
        expect([changed.typeOf(terrain), enumOf(changed.attribute(terrain, "PredefinedType")), changed.attribute(terrain, "Name")]).toEqual(["IfcGeographicElement", "TERRAIN", "Terrain"]);
        expect(relatedBy(changed, "IfcRelContainedInSpatialStructure", "RelatingStructure", "RelatedElements", siteOf(changed))).toContain(terrain);
        expect([extrusion.direction, extrusion.depth]).toEqual([[0, 0, -1], 600]);
        expect(absoluteFrame(modelOf(changed), refOf(changed.attribute(terrain, "ObjectPlacement"))).origin).toEqual([0, 0, -50]);
    });

    it("should leave holes in the ground and give it its material", () => {
        // Arrange
        const { ifc, model } = withPlanting();

        // Act
        const changed = ifc.site.addTerrain({ model, id: "terrain", outline: PLOT, holes: [FOOTPRINT], material: "Lawn" });

        // Assert
        const terrain = expressIdOf(changed, "terrain");
        const recipe = ifc.geometry.recipe({ model: changed });
        expect(recipe.nodes.find((node) => node.op === "polygon")).toEqual(expect.objectContaining({ holes: [expect.any(Array)] }));
        expect(recipe.roots[0]!.tag["rgba"]).toEqual([expect.closeTo(0x8f / 255, 9), expect.closeTo(0xa8 / 255, 9), expect.closeTo(0x77 / 255, 9), 1]);
        expect(changed.attribute(relatingOf(changed, "IfcRelAssociatesMaterial", "RelatingMaterial", "RelatedObjects", terrain)[0]!, "Name")).toBe("Lawn");
    });

    it("should wind the outline counter-clockwise and every hole clockwise, whichever way they were given", () => {
        // Arrange
        const { ifc, model } = withPlanting();

        // Act
        const changed = ifc.site.addTerrain({ model, id: "terrain", outline: [...PLOT].reverse(), holes: [FOOTPRINT] });

        // Assert
        const profile = sweptAreaOf(changed, expressIdOf(changed, "terrain"));
        expect(outerCurveOf(changed, profile)).toEqual(PLOT);
        expect(innerCurvesOf(changed, profile)).toEqual([[[0, 8000], [10000, 8000], [10000, 0], [0, 0]]]);
    });

    it("should take a metre of ground when no depth is given, in the model's unit", () => {
        // Arrange
        const { ifc, model } = withPlanting();

        // Act
        const changed = ifc.site.addTerrain({ model, id: "terrain", outline: PLOT });

        // Assert
        expect(extrusionOf(changed, expressIdOf(changed, "terrain")).depth).toBe(1000);
    });

    it("should refuse a hole outside the outline, a depth of zero and a material the model does not hold", () => {
        // Arrange
        const { ifc, model } = withPlanting();
        const outside: Inputs.Base.Point2[] = [[40000, 0], [45000, 0], [45000, 5000]];

        // Act & Assert
        expect(() => ifc.site.addTerrain({ model, outline: PLOT, holes: [outside] })).toThrow("Hole 0 reaches outside the terrain's outline");
        expect(() => ifc.site.addTerrain({ model, outline: PLOT, depth: 0 })).toThrow("The terrain's depth must be more than zero, got 0");
        expect(() => ifc.site.addTerrain({ model, outline: PLOT, material: "Moss" })).toThrow("The model has no material named 'Moss'");
        expect(() => ifc.site.addTerrain({ model: notAModel(), outline: PLOT })).toThrow(TypeError);
    });
});

describe("IFCSite.addTree", () => {
    it("should add a tree of the site with its species as its object type, a crown and a trunk in their materials", () => {
        // Arrange
        const { ifc, model } = withPlanting();

        // Act
        const changed = ifc.site.addTree({ model, id: "birch", species: "Silver birch", position: [-6000, -8000], height: 9000, crownRadius: 2200, crownMaterial: "Foliage", trunkMaterial: "Bark" });

        // Assert
        const tree = expressIdOf(changed, "birch");
        expect([changed.typeOf(tree), enumOf(changed.attribute(tree, "PredefinedType")), changed.attribute(tree, "ObjectType")]).toEqual(["IfcGeographicElement", "USERDEFINED", "Silver birch"]);
        expect(relatedBy(changed, "IfcRelContainedInSpatialStructure", "RelatingStructure", "RelatedElements", siteOf(changed))).toContain(tree);
        expect(absoluteFrame(modelOf(changed), refOf(changed.attribute(tree, "ObjectPlacement"))).origin).toEqual([-6000, -8000, 0]);
        expect(styleNamesOf(changed, triangleSetsOf(changed, tree))).toEqual(["Foliage", "Bark"]);
        expect(constituentsOf(changed, tree)).toEqual([["Foliage", "Foliage"], ["Trunk", "Bark"]]);
    });

    it("should close both parts and face them outwards, the crown reaching the tree's height and the trunk standing on the ground", () => {
        // Arrange
        const { ifc, model } = withPlanting();

        // Act
        const changed = ifc.site.addTree({ model, id: "oak", height: 9000, crownRadius: 2500, trunkRadius: 200 });

        // Assert
        const [crown, trunk] = triangleSetsOf(changed, expressIdOf(changed, "oak")).map((faceSet) => meshOf(changed, faceSet)) as [{ positions: number[]; indices: number[] }, { positions: number[]; indices: number[] }];
        const heights = (mesh: { positions: number[] }): number[] => mesh.positions.filter((_, at) => at % 3 === 2);
        expect([changed.attribute(triangleSetsOf(changed, expressIdOf(changed, "oak"))[0]!, "Closed")]).toEqual([true]);
        expect(signedVolumeOf(crown.positions, crown.indices)).toBeGreaterThan(0);
        expect(signedVolumeOf(trunk.positions, trunk.indices)).toBeGreaterThan(0);
        expect(Math.max(...heights(crown))).toBeLessThanOrEqual(9000 + 1e-6);
        expect(Math.max(...heights(crown))).toBeGreaterThan(8500);
        expect(Math.min(...heights(trunk))).toBe(0);
        const crownMiddle = (Math.max(...heights(crown)) + Math.min(...heights(crown))) / 2;
        expect(Math.max(...heights(trunk))).toBeGreaterThan(crownMiddle);
        expect(Math.max(...heights(trunk))).toBeLessThan(Math.max(...heights(crown)));
    });

    it("should show a tree as two parts in their colours", () => {
        // Arrange
        const { ifc, model } = withPlanting();
        const changed = ifc.site.addTree({ model, crownMaterial: "Foliage", trunkMaterial: "Bark" });

        // Act
        const recipe = ifc.geometry.recipe({ model: changed });

        // Assert
        expect(recipe.roots.map((root) => [root.tag["type"], (root.tag["rgba"] as number[])[0]])).toEqual([
            ["IfcGeographicElement", expect.closeTo(0x6d / 255, 9)],
            ["IfcGeographicElement", expect.closeTo(0x5b / 255, 9)],
        ]);
    });

    it("should refuse a trunk as wide as its crown, a size that is not more than zero and a position that is not finite", () => {
        // Arrange
        const { ifc, model } = withPlanting();

        // Act & Assert
        expect(() => ifc.site.addTree({ model, crownRadius: 300, trunkRadius: 300 })).toThrow("A tree's trunk must be narrower than its crown");
        expect(() => ifc.site.addTree({ model, height: 0 })).toThrow("The tree's height must be more than zero, got 0");
        expect(() => ifc.site.addTree({ model, position: [Number.NaN, 0] })).toThrow("The position's x must be a finite number, got NaN");
    });
});
