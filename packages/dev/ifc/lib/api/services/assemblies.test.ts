import { describe, expect, it } from "vitest";
import type { Fixture } from "../../__test__/fixture-types";
import { errorFrom, expressIdOf, groundFloor } from "../../__test__/build-setup";
import { enumOf, refOf, relatedBy, round } from "../../__test__/build-geometry";
import { absoluteFrame } from "../../build/placement";
import { modelOf } from "./service-support";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";
import { OTHER_TOOL_FILE, WALL_B } from "../../__test__/other-tool-file";

const CLADDING = Inputs.IFC.elementAssemblyPredefinedTypeEnum.userDefined;

function boards(): Fixture {
    const { ifc, model: ground } = groundFloor();
    let model = ifc.spatial.addStorey({ model: ground, id: "first", name: "First", elevation: 3000 });
    for (let index = 0; index < 3; index++) {
        model = ifc.members.add({ model, storey: "ground", id: `board-${index}`, name: "Cladding board", start: [index * 200, 0, 0], end: [index * 200, 0, 2400], width: 150, depth: 20 });
    }
    model = ifc.members.add({ model, storey: "first", id: "upstairs", start: [0, 0, 0], end: [0, 0, 2400], width: 150, depth: 20 });
    return { ifc, model };
}

function containedIn(model: IfcModel, storey: string): number[] {
    return relatedBy(model, "IfcRelContainedInSpatialStructure", "RelatingStructure", "RelatedElements", expressIdOf(model, storey));
}

describe("IFCAssemblies.add", () => {
    it("should make elements the parts of an assembly that stands in their storey in their place", () => {
        // Arrange
        const { ifc, model } = boards();

        // Act
        const changed = ifc.assemblies.add({ model, parts: ["board-0", "board-1", "board-2"], id: "cladding", name: "South cladding", predefinedType: CLADDING, objectType: "Cladding" });

        // Assert
        const assembly = expressIdOf(changed, "cladding");
        const parts = ["board-0", "board-1", "board-2"].map((board) => expressIdOf(changed, board));
        expect([changed.typeOf(assembly), changed.attribute(assembly, "Name"), changed.attribute(assembly, "ObjectType"), enumOf(changed.attribute(assembly, "PredefinedType"))]).toEqual(["IfcElementAssembly", "South cladding", "Cladding", "USERDEFINED"]);
        expect(relatedBy(changed, "IfcRelAggregates", "RelatingObject", "RelatedObjects", assembly)).toEqual(parts);
        expect(containedIn(changed, "ground")).toEqual([assembly]);
        expect(containedIn(model, "ground")).toEqual(parts);
    });

    it("should list the parts in the storey their assembly stands in, and the assembly with them", () => {
        // Arrange
        const { ifc, model } = boards();
        const changed = ifc.assemblies.add({ model, parts: ["board-0", "board-1"], id: "cladding" });

        // Act
        const listed = ifc.model.elements({ model: changed, type: "IfcElement", storey: "ground" }).map((element) => element.globalId);
        const part = ifc.model.element({ model: changed, element: "board-0" });

        // Assert
        expect(listed).toEqual(["board-0", "board-1", "board-2", "cladding"].map((id) => ifc.model.globalIdOf({ model: changed, id })));
        expect(part.storey).toBe(ifc.model.globalIdOf({ model: changed, id: "ground" }));
    });

    it("should be of no particular kind unless told, and leave the original model as it was", () => {
        // Arrange
        const { ifc, model } = boards();

        // Act
        const changed = ifc.assemblies.add({ model, parts: ["board-0"], id: "cladding" });

        // Assert
        expect(enumOf(changed.attribute(expressIdOf(changed, "cladding"), "PredefinedType"))).toBe("NOTDEFINED");
        expect(changed.attribute(expressIdOf(changed, "cladding"), "ObjectType")).toBeNull();
        expect(() => expressIdOf(model, "cladding")).toThrow();
    });

    it("should place the assembly at the origin of the storey it stands in", () => {
        // Arrange
        const { ifc, model } = boards();

        // Act
        const changed = ifc.assemblies.add({ model, parts: ["board-0"], id: "cladding" });

        // Assert
        const placementOf = (id: string): number => refOf(changed.attribute(expressIdOf(changed, id), "ObjectPlacement"));
        expect(refOf(changed.attribute(placementOf("cladding"), "PlacementRelTo"))).toBe(placementOf("ground"));
        expect(round(absoluteFrame(modelOf(changed), placementOf("cladding")).origin[2])).toBe(0);
    });

    it("should give a part of an assembly inside another assembly the storey the outer one stands in", () => {
        // Arrange
        const { ifc, model } = boards();
        const inner = ifc.assemblies.add({ model, parts: ["board-0", "board-1"], id: "inner" });

        // Act
        const outer = ifc.assemblies.add({ model: inner, parts: ["inner", "board-2"], id: "outer" });

        // Assert
        const ground = ifc.model.globalIdOf({ model: outer, id: "ground" });
        expect(ifc.model.element({ model: outer, element: "board-0" }).storey).toBe(ground);
        expect(ifc.model.elements({ model: outer, type: "IfcMember", storey: "ground" }).map((element) => element.globalId)).toEqual(["board-0", "board-1", "board-2"].map((id) => ifc.model.globalIdOf({ model: outer, id })));
        expect(containedIn(outer, "ground")).toEqual([expressIdOf(outer, "outer")]);
    });

    it("should gather the parts in a group of the assembly in the model's recipe, under its storey's element assemblies", () => {
        // Arrange
        const { ifc, model } = boards();
        const changed = ifc.assemblies.add({ model, parts: ["board-0", "board-1", "board-2"], id: "cladding", name: "South cladding", predefinedType: CLADDING, objectType: "Cladding" });

        // Act
        const recipe = ifc.geometry.recipe({ model: changed });

        // Assert
        const groupOf = (index: number | undefined): Inputs.Base.RecipeGroup => recipe.groups![index!]!;
        const cladding = recipe.roots.filter((root) => root.tag["name"] === "Cladding board").map((root) => root.group);
        expect(new Set(cladding).size).toBe(1);
        const assembly = groupOf(cladding[0]);
        expect([assembly.name, assembly.tag["type"], groupOf(assembly.parent).name, groupOf(groupOf(assembly.parent).parent).name]).toEqual(["South cladding", "IfcElementAssembly", "Element assemblies", "Ground"]);
        const membersOf = (id: string): Inputs.Base.RecipeGroup => groupOf(recipe.roots.find((root) => root.tag["globalId"] === ifc.model.globalIdOf({ model: changed, id }))!.group);
        expect([membersOf("upstairs").name, groupOf(membersOf("upstairs").parent).name]).toEqual(["Members", "First"]);
    });

    it("should name the group of an assembly without a name after its class, and keep the class groups of each storey apart", () => {
        // Arrange
        const { ifc, model } = boards();
        const changed = ifc.assemblies.add({ model, parts: ["board-0", "board-1"] });

        // Act
        const recipe = ifc.geometry.recipe({ model: changed });

        // Assert
        const groupOf = (id: string): Inputs.Base.RecipeGroup => recipe.groups![recipe.roots.find((root) => root.tag["globalId"] === ifc.model.globalIdOf({ model: changed, id }))!.group!]!;
        const parentOf = (group: Inputs.Base.RecipeGroup): Inputs.Base.RecipeGroup => recipe.groups![group.parent!]!;
        expect(groupOf("board-0").name).toBe("Element assembly");
        expect([groupOf("board-2").name, parentOf(groupOf("board-2")).name, groupOf("upstairs").name, parentOf(groupOf("upstairs")).name]).toEqual(["Members", "Ground", "Members", "First"]);
        expect(groupOf("board-2")).not.toBe(groupOf("upstairs"));
    });

    it("should take its parts with it when it is removed", () => {
        // Arrange
        const { ifc, model } = boards();
        const changed = ifc.assemblies.add({ model, parts: ["board-0", "board-1"], id: "cladding" });

        // Act
        const removed = ifc.model.remove({ model: changed, element: "cladding" });

        // Assert
        expect(ifc.model.elements({ model: removed, type: "IfcMember" }).map((element) => element.globalId)).toEqual(["board-2", "upstairs"].map((id) => ifc.model.globalIdOf({ model: removed, id })));
        expect(removed.byType("IfcRelAggregates").filter((rel) => removed.attribute(rel.id, "RelatingObject") !== null && removed.typeOf((removed.attribute(rel.id, "RelatingObject") as { ref: number }).ref) === "IfcElementAssembly")).toEqual([]);
    });

    it("should write a file that reads back with the assembly and its parts", () => {
        // Arrange
        const { ifc, model } = boards();
        const changed = ifc.assemblies.add({ model, parts: ["board-0", "board-1"], id: "cladding", name: "South cladding", predefinedType: CLADDING, objectType: "Cladding" });

        // Act
        const read = ifc.model.read({ data: ifc.model.write({ model: changed, fileName: "assembly.ifc", timeStamp: "2026-10-08T12:00:00" }) });

        // Assert
        const assembly = read.byGlobalId(ifc.model.globalIdOf({ model: changed, id: "cladding" }))!;
        expect(relatedBy(read, "IfcRelAggregates", "RelatingObject", "RelatedObjects", assembly).map((part) => read.attribute(part, "GlobalId"))).toEqual(["board-0", "board-1"].map((id) => ifc.model.globalIdOf({ model: changed, id })));
    });

    it.each<[string, (fixture: Fixture) => unknown, string]>([
        ["no parts", ({ ifc, model }) => ifc.assemblies.add({ model, parts: [] }), "Expected the parts as a list of at least one element's GlobalId or id"],
        ["a part named twice", ({ ifc, model }) => ifc.assemblies.add({ model, parts: ["board-0", "board-0"] }), "The parts name one element more than once"],
        ["parts in two storeys", ({ ifc, model }) => ifc.assemblies.add({ model, parts: ["board-0", "upstairs"] }), "The parts stand in 2 parts of the structure; an assembly stands in one"],
        ["a userDefined kind without words for it", ({ ifc, model }) => ifc.assemblies.add({ model, parts: ["board-0"], predefinedType: CLADDING, objectType: " " }), "A userDefined assembly needs an objectType that says what kind it is, such as Cladding"],
    ])("should refuse %s", (_what, call, message) => {
        // Arrange
        const fixture = boards();

        // Act
        const error = errorFrom(() => call(fixture));

        // Assert
        expect(error.message).toBe(message);
    });

    it("should refuse a part another tool left standing in no storey", () => {
        // Arrange
        const { ifc } = boards();
        const model = ifc.model.read({ data: OTHER_TOOL_FILE.replace("(#42,#56),#24);", "(#42),#24);") });

        // Act
        const error = errorFrom(() => ifc.assemblies.add({ model, parts: [WALL_B] }));

        // Assert
        expect(error.message).toMatch(/stands in no storey or other part of the structure, so an assembly of it has nowhere to stand$/);
    });

    it("should refuse a part that already belongs to an assembly, a storey, and an opening", () => {
        // Arrange
        const { ifc, model } = boards();
        const assembled = ifc.assemblies.add({ model, parts: ["board-0"], id: "cladding" });
        const walled = ifc.walls.add({ model, storey: "ground", id: "wall", start: [0, 0], end: [4000, 0], height: 3000, thickness: 200 });
        const opened = ifc.openings.add({ model: walled, wall: "wall", id: "hole", offset: 1000, width: 800, height: 1200 });

        // Act
        const twice = errorFrom(() => ifc.assemblies.add({ model: assembled, parts: ["board-0"] }));
        const storey = errorFrom(() => ifc.assemblies.add({ model, parts: ["ground"] }));
        const opening = errorFrom(() => ifc.assemblies.add({ model: opened, parts: ["hole"] }));

        // Assert
        expect(twice.message).toMatch(/is already part of .*IfcElementAssembly/);
        expect(storey.message).toBe("'ground' is an IfcBuildingStorey, not a part");
        expect(opening.message).toMatch(/cuts or adds to another element, so it cannot be part of an assembly$/);
    });
});
