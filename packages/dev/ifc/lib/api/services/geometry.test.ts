import type { Base } from "@bitbybit-dev/base";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { modelRecipe } from "../../geometry/elements";
import { IFCService } from "../ifc-service";
import * as Inputs from "../inputs";
import type { IfcModel } from "../../model/model-types";
import { oneWall, TIME_STAMP } from "../../__test__/build-setup";
import { OTHER_TOOL_FILE, WALL_A, WALL_B } from "../../__test__/other-tool-file";
import { Recipes } from "@bitbybit-dev/base";

const RECIPES = new Recipes();

vi.mock("../../geometry/elements", async () => {
    const actual = await vi.importActual<typeof import("../../geometry/elements")>("../../geometry/elements");
    return { ...actual, modelRecipe: vi.fn(actual.modelRecipe) };
});

const ifc = new IFCService();

function house(): IfcModel {
    let model = ifc.model.create({ name: "House", seed: "geometry" });
    model = ifc.spatial.addStorey({ model, id: "ground", elevation: 0 });
    model = ifc.materials.add({ model, name: "Brick", color: "#ff8000", transparency: 0.25 });
    model = ifc.materials.addLayerSet({ model, name: "Brick wall", layers: [{ material: "Brick", thickness: 200 }] });
    model = ifc.walls.add({ model, storey: "ground", id: "south", name: "South", start: [0, 0], end: [6000, 0], height: 3000, layerSet: "Brick wall", alignment: Inputs.IFC.wallAlignmentEnum.right });
    model = ifc.walls.add({ model, storey: "ground", id: "east", start: [6000, 0], end: [6000, 4000], height: 3000, thickness: 200, alignment: Inputs.IFC.wallAlignmentEnum.right });
    model = ifc.walls.connect({ model, wall: "south", other: "east" });
    model = ifc.doors.addType({ model, id: "door", width: 900, height: 2100 });
    model = ifc.doors.add({ model, wall: "south", doorType: "door", id: "door-1", offset: 1000 });
    model = ifc.doors.add({ model, wall: "south", doorType: "door", id: "door-2", offset: 3000 });
    model = ifc.slabs.add({ model, storey: "ground", id: "slab", outline: [[0, 0], [6000, 0], [6000, 4000], [0, 4000]], thickness: 200 });
    model = ifc.columns.add({ model, storey: "ground", id: "round", position: [3000, 2000], height: 2500, profile: Inputs.IFC.profileKindEnum.circle, radius: 150 });
    return ifc.walls.clipByPlane({ model, wall: "east", origin: [0, 0, 2500], normal: [0, 0, 1] });
}

function rootOf(recipe: Base.Recipe, model: IfcModel, id: string): Base.RecipeRoot {
    const globalId = ifc.model.globalIdOf({ model, id });
    const root = recipe.roots.find((candidate) => candidate.tag["globalId"] === globalId);
    if (!root) {
        throw new Error(`no root for ${id}`);
    }
    return root;
}

function nodesUnder(recipe: Base.Recipe, index: number, into: Set<number> = new Set()): Set<number> {
    into.add(index);
    const node = recipe.nodes[index]!;
    const children = node.op === "extrude" ? [node.profile]
        : node.op === "difference" ? [node.of, ...node.tools]
            : node.op === "transform" ? [node.of]
                : node.op === "voids" ? [node.host, ...node.openings]
                    : node.op === "compound" ? node.of
                        : [];
    children.forEach((child) => nodesUnder(recipe, child, into));
    return into;
}

describe("IFCGeometry.recipe", () => {
    it("should describe every element with a body as one valid root, leaving openings out", () => {
        // Arrange
        const model = house();

        // Act
        const recipe = ifc.geometry.recipe({ model });

        // Assert
        expect(RECIPES.check({ recipe })).toEqual([]);
        expect(recipe.roots.map((root) => root.tag["type"])).toEqual(["IfcWall", "IfcWall", "IfcDoor", "IfcDoor", "IfcSlab", "IfcColumn"]);
        expect(recipe.millimetresPerUnit).toBe(1);
        expect(recipe.tolerance).toBe(0.01);
    });

    it("should group each root by the site, building and storey it stands in, then by its IFC class there", () => {
        // Arrange
        const model = house();

        // Act
        const recipe = ifc.geometry.recipe({ model });

        // Assert
        expect(RECIPES.check({ recipe })).toEqual([]);
        expect(recipe.groups!.map((group) => [group.name, group.parent, group.tag["type"]])).toEqual([
            ["Site", undefined, "IfcSite"],
            ["Building", 0, "IfcBuilding"],
            ["Storey", 1, "IfcBuildingStorey"],
            ["Walls", 2, "IfcWall"],
            ["Doors", 2, "IfcDoor"],
            ["Slabs", 2, "IfcSlab"],
            ["Columns", 2, "IfcColumn"],
        ]);
        expect(recipe.groups![2]!.tag["globalId"]).toBe(ifc.model.globalIdOf({ model, id: "ground" }));
        expect(recipe.roots.map((root) => recipe.groups![root.group!]!.name)).toEqual(["Walls", "Walls", "Doors", "Doors", "Slabs", "Columns"]);
    });

    it("should gather the parts of an aggregate in a group named after it, under its own class", () => {
        // Arrange
        const roofed = ifc.roofs.add({ model: house(), storey: "ground", id: "roof", name: "Main roof", outline: [[0, 0], [6000, 0], [6000, 4000], [0, 4000]], kind: Inputs.IFC.roofKindEnum.gable, pitch: 30, baseOffset: 3000 });

        // Act
        const recipe = ifc.geometry.recipe({ model: roofed });

        // Assert
        const slabs = recipe.roots.filter((root) => root.tag["type"] === "IfcSlab" && root.tag["globalId"] !== ifc.model.globalIdOf({ model: roofed, id: "slab" }));
        expect(slabs).toHaveLength(2);
        const roof = recipe.groups![slabs[0]!.group!]!;
        expect(slabs.every((slab) => slab.group === slabs[0]!.group)).toBe(true);
        expect(roof).toEqual({ name: "Main roof", parent: recipe.groups!.findIndex((group) => group.name === "Roofs"), tag: { globalId: ifc.model.globalIdOf({ model: roofed, id: "roof" }), type: "IfcRoof", name: "Main roof" } });
        expect(recipe.groups![roof.parent!]!.parent).toBe(2);
    });

    it("should describe one model with and without class groups when asked for both", () => {
        // Arrange
        const model = house();

        // Act
        const grouped = ifc.geometry.recipe({ model });
        const ungrouped = ifc.geometry.recipe({ model, groupByClass: false });

        // Assert
        expect(grouped.groups).toHaveLength(7);
        expect(ungrouped.groups!.map((group) => group.name)).toEqual(["Site", "Building", "Storey"]);
    });

    it("should group an element another tool aggregated straight into a storey with the elements the storey contains", () => {
        // Arrange
        const model = ifc.model.read({ data: OTHER_TOOL_FILE.replace("(#42,#56),#24);", "(#42),#24);\r\n#99=IFCRELAGGREGATES('0Aggregates000000000001',$,$,$,#24,(#56));") });

        // Act
        const recipe = ifc.geometry.recipe({ model });

        // Assert
        const [first, second] = [WALL_A, WALL_B].map((wall) => recipe.roots.find((root) => root.tag["globalId"] === wall)!.group);
        expect(second).toBe(first);
        expect(recipe.groups!.filter((group) => group.tag["type"] === "IfcBuildingStorey")).toHaveLength(1);
    });

    it("should leave the classes out when asked not to group by them, an aggregate's parts still gathered under it", () => {
        // Arrange
        const roofed = ifc.roofs.add({ model: house(), storey: "ground", id: "roof", name: "Main roof", outline: [[0, 0], [6000, 0], [6000, 4000], [0, 4000]], kind: Inputs.IFC.roofKindEnum.gable, pitch: 30, baseOffset: 3000 });

        // Act
        const recipe = ifc.geometry.recipe({ model: roofed, groupByClass: false });

        // Assert
        expect(recipe.groups!.map((group) => [group.name, group.parent])).toEqual([["Site", undefined], ["Building", 0], ["Storey", 1], ["Main roof", 2]]);
        expect(recipe.roots.map((root) => root.group)).toEqual([2, 2, 2, 2, 2, 2, 3, 3]);
    });

    it("should tag each root with its element's GlobalId, name and material colour", () => {
        // Arrange
        const model = house();

        // Act
        const root = rootOf(ifc.geometry.recipe({ model }), model, "south");

        // Assert
        expect(root.tag["name"]).toBe("South");
        expect(root.tag["rgba"]).toEqual([1, 128 / 255, 0, 0.75]);
    });

    it("should add an element's property set values to its roots' tags only when asked, describing the model again for each", () => {
        // Arrange
        const model = ifc.properties.addSet({ model: house(), elements: ["south"], name: "Pset_WallCommon", properties: [{ name: "IsExternal", value: true }, { name: "FireRating", value: "REI 60" }] });

        // Act
        const plain = rootOf(ifc.geometry.recipe({ model }), model, "south");
        const withSets = rootOf(ifc.geometry.recipe({ model, propertySets: true }), model, "south");
        const east = rootOf(ifc.geometry.recipe({ model, propertySets: true }), model, "east");

        // Assert
        expect(Object.keys(plain.tag).some((key) => key.startsWith("Pset_"))).toBe(false);
        expect(withSets.tag).toMatchObject({ "Pset_WallCommon.IsExternal": true, "Pset_WallCommon.FireRating": "REI 60", name: "South" });
        expect(Object.keys(east.tag).some((key) => key.startsWith("Pset_"))).toBe(false);
    });

    it("should leave the colour out of an element whose material has none", () => {
        // Arrange
        const model = house();

        // Act
        const root = rootOf(ifc.geometry.recipe({ model }), model, "east");

        // Assert
        expect(root.tag["rgba"]).toBeUndefined();
    });

    it("should place a root at its element's placement, in model units", () => {
        // Arrange
        const model = house();

        // Act
        const root = rootOf(ifc.geometry.recipe({ model }), model, "east");

        // Assert
        expect(root.matrix).toEqual([0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 6000, 0, 0, 1]);
    });

    it("should cut a wall's doors out of it with one voids node holding an opening per door", () => {
        // Arrange
        const model = house();

        // Act
        const recipe = ifc.geometry.recipe({ model });
        const node = recipe.nodes[rootOf(recipe, model, "south").node]!;

        // Assert
        expect(node.op).toBe("voids");
        expect(node.op === "voids" ? node.openings.length : 0).toBe(2);
    });

    it("should describe a door type once however many doors are placed from it", () => {
        // Arrange
        const model = house();

        // Act
        const recipe = ifc.geometry.recipe({ model });
        const first = rootOf(recipe, model, "door-1");
        const second = rootOf(recipe, model, "door-2");

        // Assert
        expect(first.node).toBe(second.node);
        expect(recipe.nodes[first.node]!.op).toBe("compound");
        expect(first.matrix).not.toEqual(second.matrix);
    });

    it("should describe a clipped wall as a difference with a half-space in the wall's own frame, its normal pointing into the part removed", () => {
        // Arrange
        const model = house();

        // Act
        const recipe = ifc.geometry.recipe({ model });
        const node = recipe.nodes[rootOf(recipe, model, "east").node]!;
        const tool = node.op === "difference" ? recipe.nodes[node.tools[0]!] : undefined;

        // Assert
        expect(node.op).toBe("difference");
        expect(tool).toEqual({ op: "halfSpace", origin: [0, 6000, 2500], normal: [0, 0, 1] });
    });

    it("should describe a slab as its outline extruded down from the storey's floor", () => {
        // Arrange
        const model = house();

        // Act
        const recipe = ifc.geometry.recipe({ model });
        const extrusion = recipe.nodes[rootOf(recipe, model, "slab").node]!;
        const polygon = extrusion.op === "extrude" ? recipe.nodes[extrusion.profile] : undefined;
        const points = polygon?.op === "polygon" ? Array.from(recipe.buffers.f64.subarray(polygon.points[0], polygon.points[0] + polygon.points[1])) : [];

        // Assert
        expect(extrusion).toMatchObject({ op: "extrude", direction: [0, 0, -1], depth: 200 });
        expect(points).toEqual([0, 0, 6000, 0, 6000, 4000, 0, 4000]);
    });

    it("should describe a circular column as an extruded circle", () => {
        // Arrange
        const model = house();

        // Act
        const recipe = ifc.geometry.recipe({ model });
        const used = nodesUnder(recipe, rootOf(recipe, model, "round").node);

        // Assert
        expect([...used].map((index) => recipe.nodes[index]!.op).sort()).toEqual(["circle", "extrude"]);
        expect([...used].map((index) => recipe.nodes[index]!).find((node) => node.op === "circle")).toEqual({ op: "circle", center: [0, 0], radius: 150 });
    });

    it("should describe only the elements asked for, by id or GlobalId", () => {
        // Arrange
        const model = house();
        const slab = ifc.model.globalIdOf({ model, id: "slab" });

        // Act
        const recipe = ifc.geometry.recipe({ model, elements: ["south", slab] });

        // Assert
        expect(recipe.roots.map((root) => root.tag["type"])).toEqual(["IfcWall", "IfcSlab"]);
    });

    it("should cut a wall asked for alone by its doors' openings, as it does when every element is described", () => {
        // Arrange
        const model = house();
        const whole = ifc.geometry.recipe({ model });

        // Act
        const alone = ifc.geometry.recipe({ model, elements: ["south"] });

        // Assert
        const node = alone.nodes[alone.roots[0]!.node]!;
        expect([alone.roots.length, node.op, node.op === "voids" ? node.openings.length : 0]).toEqual([1, "voids", 2]);
        expect(nodesUnder(alone, alone.roots[0]!.node).size).toBe(nodesUnder(whole, rootOf(whole, model, "south").node).size);
    });

    it("should refuse elements that are not a list and an id the model does not hold", () => {
        // Arrange
        const model = house();

        // Act & Assert
        const notAList: unknown = "south";
        expect(() => ifc.geometry.recipe({ model, elements: notAList as string[] })).toThrow(TypeError);
        expect(() => ifc.geometry.recipe({ model, elements: ["missing"] })).toThrow("The model has no element 'missing'");
    });

    it("should build every element that shares a GlobalId the file gives to more than one, when asked for it", () => {
        // Arrange
        const { ifc, model } = oneWall();
        const text = ifc.model.write({ model, timeStamp: TIME_STAMP });
        const wallRow = text.split("\n").find((row) => /^#\d+=IFCWALL\(/.test(row))!;
        const globalId = /^#\d+=IFCWALL\('([^']+)'/.exec(wallRow)![1]!;
        const shared = ifc.model.read({ data: text.replace(wallRow, `${wallRow}\n${wallRow.replace(/^#\d+=/, "#9999=")}`) });

        // Act
        const recipe = ifc.geometry.recipe({ model: shared, elements: [globalId] });

        // Assert
        expect(recipe.roots.map((root) => root.tag["globalId"])).toEqual([globalId, globalId]);
    });

    it("should refuse something that is not a model", () => {
        // Act & Assert
        expect(() => ifc.geometry.recipe({ model: {} as IfcModel })).toThrow(TypeError);
    });
});

describe("IFCGeometry.unsupported", () => {
    it("should list nothing for a model this library wrote", () => {
        // Act
        const problems = ifc.geometry.unsupported({ model: house() });

        // Assert
        expect(problems).toEqual([]);
    });

    it("should list an element asked for that has no body to describe, such as a storey", () => {
        // Arrange
        const model = house();

        // Act
        const problems = ifc.geometry.unsupported({ model, elements: ["ground", "south"] });

        // Assert
        expect(problems).toEqual([{ globalId: ifc.model.globalIdOf({ model, id: "ground" }), type: "IfcBuildingStorey", message: "An IfcBuildingStorey is a spatial element, which a recipe does not describe" }]);
    });
});

describe("IFCGeometry with a file whose rows refer to entities it does not hold", () => {
    it.each([
        ["its body", [["#40=IFCPRODUCTDEFINITIONSHAPE($,$,(#33,#39));", "#40=IFCPRODUCTDEFINITIONSHAPE($,$,(#33,#99));"]], "#99"],
        ["its material's colour", [
            ["#43=IFCMATERIALLAYER($,0.3,$,$,$,$,$);", "#43=IFCMATERIALLAYER(#70,0.3,$,$,$,$,$);\r\n#70=IFCMATERIAL('Brick',$,$);\r\n#71=IFCMATERIALDEFINITIONREPRESENTATION($,$,(#72),#70);\r\n#72=IFCSTYLEDREPRESENTATION(#11,$,$,(#98));"],
            ["(#42,#56),#45);", "(#42),#45);"],
        ], "#98"],
    ] as const)("should report the wall whose %s it cannot read and describe the other", (_part, rows, missing) => {
        // Arrange
        const model = ifc.model.read({ data: rows.reduce((text, [row, replacement]) => text.replace(row, replacement), OTHER_TOOL_FILE) });

        // Act
        const recipe = ifc.geometry.recipe({ model });
        const problems = ifc.geometry.unsupported({ model });

        // Assert
        expect(recipe.roots.map((root) => root.tag["globalId"])).toEqual([WALL_B]);
        expect(problems).toEqual([{ globalId: WALL_A, type: "IfcWallStandardCase", message: `The model has no entity ${missing}` }]);
    });
});

describe("IFCGeometry description sharing", () => {
    beforeEach(() => {
        vi.mocked(modelRecipe).mockClear();
    });

    it("should describe a model once for recipe and unsupported called with the same model and elements", () => {
        // Arrange
        const model = house();

        // Act
        const first = ifc.geometry.recipe({ model, elements: ["south"] });
        ifc.geometry.unsupported({ model, elements: ["south"] });
        const again = ifc.geometry.recipe({ model, elements: ["south"] });

        // Assert
        expect(modelRecipe).toHaveBeenCalledTimes(1);
        expect(again).toBe(first);
    });

    it("should keep only a model's last description, describing it again when other elements are asked for", () => {
        // Arrange
        const model = house();

        // Act
        ifc.geometry.recipe({ model });
        const south = ifc.geometry.recipe({ model, elements: ["south"] });
        ifc.geometry.recipe({ model });

        // Assert
        expect(south.roots.map((root) => root.tag["type"])).toEqual(["IfcWall"]);
        expect(modelRecipe).toHaveBeenCalledTimes(3);
    });

    it("should describe two models apart even when they are asked for the same elements", () => {
        // Arrange
        const model = house();
        const wider = ifc.walls.add({ model, storey: "ground", id: "west", start: [0, 0], end: [0, 4000], height: 3000, thickness: 200, alignment: Inputs.IFC.wallAlignmentEnum.left });

        // Act
        const before = ifc.geometry.recipe({ model });
        const after = ifc.geometry.recipe({ model: wider });

        // Assert
        expect(after.roots.length).toBe(before.roots.length + 1);
    });
});
