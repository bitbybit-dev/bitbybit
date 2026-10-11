import { describe, expect, it } from "vitest";
import { IndexReader } from "./index-reader.js";
import { renderMember, renderType } from "./render.js";
import type { IndexMember } from "./index-types.js";
import { fixtureIndex } from "./__fixtures__/load.js";

function member(overrides: Partial<IndexMember>): IndexMember {
    return {
        path: "occt.shapes.solid.createBox",
        kind: "method",
        name: "createBox",
        className: "OCCTSolid",
        signature: "createBox(inputs: BoxDto): Promise<TopoDSShapePointer>",
        async: true,
        params: [],
        returns: "TopoDSShapePointer",
        summary: "Creates a box",
        doc: "",
        docUrl: null,
        engines: ["babylonjs", "threejs", "playcanvas"],
        tier: "oss",
        onApi3d: true,
        weight: 2,
        examples: [],
        ...overrides,
    };
}

describe("renderMember", () => {
    it("lists the signature of every engine when they differ, naming an engine without one", () => {
        // Arrange
        const differing = member({ engineSignatures: { babylonjs: "drawModel(inputs: BabylonDto): Mesh", threejs: "drawModel(inputs: ThreeDto): Group", playcanvas: null } });

        // Act
        const text = renderMember(differing, "9.9.9", []);

        // Assert
        expect(text).toContain("Signature by engine:");
        expect(text).toContain("- babylonjs: `drawModel(inputs: BabylonDto): Mesh`");
        expect(text).toContain("- threejs: `drawModel(inputs: ThreeDto): Group`");
        expect(text).toContain("- playcanvas: `none`");
    });

    it("renders a field's options, range, step and default on its line", () => {
        // Arrange
        const withFields = member({
            params: [{
                name: "inputs",
                type: "BoxDto",
                optional: false,
                fields: [
                    { name: "axis", type: "ordinateAxisEnum", optional: false, doc: "Which axis", default: "x", options: [{ value: "x", label: "x" }, { value: "y", label: "y" }] },
                    { name: "width", type: "number", optional: true, doc: "", default: 1, min: 0, max: 10, step: 0.5 },
                ],
            }],
        });

        // Act
        const text = renderMember(withFields, "9.9.9", []);

        // Assert
        expect(text).toContain("- axis: ordinateAxisEnum; default \"x\"; one of x, y - Which axis");
        expect(text).toContain("- width?: number; default 1; range 0 to 10; step 0.5");
    });

    it("names an option by the key a caller writes and the value it stands for, when the two differ", () => {
        // Arrange
        const withEnum = member({
            params: [{
                name: "inputs",
                type: "AddWallDto",
                optional: false,
                fields: [
                    { name: "predefinedType", type: "wallPredefinedTypeEnum", optional: true, doc: "", default: "standard", options: [{ value: "STANDARD", label: "standard" }, { value: "SOLIDWALL", label: "solidWall" }] },
                ],
            }],
        });

        // Act
        const text = renderMember(withEnum, "9.9.9", []);

        // Assert
        expect(text).toContain("- predefinedType?: wallPredefinedTypeEnum; default \"standard\"; one of standard = \"STANDARD\", solidWall = \"SOLIDWALL\"");
    });
});

describe("IndexReader", () => {
    it("lists every member of the index and finds one by its path", () => {
        // Arrange
        const index = fixtureIndex();
        const reader = new IndexReader(index);

        // Act
        const all = reader.all();

        // Assert
        expect(all).toHaveLength(index.members.length);
        expect(all.map((entry) => entry.path)).toEqual(index.members.map((entry) => entry.path));
        expect(reader.get(index.members[0]?.path ?? "")).toBe(index.members[0]);
    });

    it("finds a type by its full name, by its name under Inputs, or by a name only one type has, array or not", () => {
        // Arrange
        const reader = new IndexReader(fixtureIndex());

        // Act
        const names = ["Inputs.IFC.ModelSummaryDto", "IFC.ModelSummaryDto", "ModelSummaryDto", "Bit.Inputs.IFC.ModelSummaryDto[]"].map((name) => reader.type(name)?.key);

        // Assert
        expect(names).toEqual(["Inputs.IFC.ModelSummaryDto", "Inputs.IFC.ModelSummaryDto", "Inputs.IFC.ModelSummaryDto", "Inputs.IFC.ModelSummaryDto"]);
        expect(reader.type("Inputs.IFC.IfcModelPointer")).toBeUndefined();
        expect(reader.type("string")).toBeUndefined();
    });

    it("resolves a name two types share only within the namespace that refers to it, and names both", () => {
        // Arrange
        const reader = new IndexReader(fixtureIndex());

        // Act
        const bare = reader.type("DecomposedManifoldMeshDto");
        const near = reader.type("DecomposedManifoldMeshDto", "Inputs.Manifold");

        // Assert
        expect(bare).toBeUndefined();
        expect(near?.key).toBe("Inputs.Manifold.DecomposedManifoldMeshDto");
        expect(reader.typeKeysNamed("DecomposedManifoldMeshDto[]")).toEqual(["Inputs.OCCT.DecomposedManifoldMeshDto", "Inputs.Manifold.DecomposedManifoldMeshDto"]);
    });

    it("lists the types a member returns and the types its inputs' fields take, read in the inputs' namespace, each once", () => {
        // Arrange
        const reader = new IndexReader(fixtureIndex());
        const summary = reader.get("ifc.model.summary");
        const taking = member({
            returns: "Inputs.IFC.ModelSummaryDto",
            params: [{
                name: "inputs",
                type: "Inputs.Manifold.MeshDto<Inputs.Manifold.ManifoldPointer>",
                optional: false,
                fields: [
                    { name: "mesh", type: "DecomposedManifoldMeshDto", optional: false, doc: "" },
                    { name: "summaries", type: "Inputs.IFC.ModelSummaryDto[]", optional: false, doc: "" },
                ],
            }],
        });

        // Act
        const returned = summary ? reader.typesUsedBy(summary) : [];
        const taken = reader.typesUsedBy(taking);

        // Assert
        expect(returned.map((used) => used.key)).toEqual(["Inputs.IFC.ModelSummaryDto"]);
        expect(taken.map((used) => used.key)).toEqual(["Inputs.IFC.ModelSummaryDto", "Inputs.Manifold.DecomposedManifoldMeshDto"]);
    });

    it("lists the types a type's fields name, in the type's own namespace, leaving the type itself out", () => {
        // Arrange
        const reader = new IndexReader(fixtureIndex());
        const named = reader.type("Inputs.IFC.ModelSummaryDto");

        // Act
        const used = named ? reader.typesUsedByType(named) : [];

        // Assert
        expect(used.map((entry) => entry.key)).toEqual(["Inputs.IFC.StoreyInfoDto"]);
    });

    it("reads a type's bare field types in its own namespace and leaves out a field naming the type itself", () => {
        // Arrange
        const index = fixtureIndex();
        const node = { name: "MeshTreeDto", summary: "", doc: "", fields: [
            { name: "mesh", type: "DecomposedManifoldMeshDto", optional: false, doc: "" },
            { name: "children", type: "MeshTreeDto[]", optional: false, doc: "" },
        ] };
        const reader = new IndexReader({ ...index, types: { ...index.types, "Inputs.Manifold.MeshTreeDto": node } });

        // Act
        const used = reader.typesUsedByType({ key: "Inputs.Manifold.MeshTreeDto", type: node });

        // Assert
        expect(used.map((entry) => entry.key)).toEqual(["Inputs.Manifold.DecomposedManifoldMeshDto"]);
    });
});

describe("renderType", () => {
    it("renders a type's name, version, doc and every field, then the types its fields name", () => {
        // Arrange
        const reader = new IndexReader(fixtureIndex());
        const named = reader.type("Inputs.IFC.ModelSummaryDto");
        if (!named) {
            throw new Error("the fixture lacks Inputs.IFC.ModelSummaryDto");
        }

        // Act
        const text = renderType(named, "9.9.9", reader.typesUsedByType(named));

        // Assert
        expect(text.startsWith("# Inputs.IFC.ModelSummaryDto\n\n- kind: type\n- version: 9.9.9\n\nWhat a model holds, as `model.summary` describes it.\n\n## Fields\n")).toBe(true);
        expect(text).toContain("- storeys: StoreyInfoDto[]; default [] - The storeys, lowest first.");
        expect(text).toContain("- editable: boolean; default true - Whether the model can be changed: false for an `IFC2X3` file, which is read through `IFC4` to be shown and queried.");
        expect(text).toContain("## Types\n\nDescribe one by its name for its fields:\n- `Inputs.IFC.StoreyInfoDto`: A storey as `spatial.storeys` and `model.summary` list it: its GlobalId, name and elevation.\n");
    });

    it("renders a type no field of which names another without a Types section", () => {
        // Arrange
        const reader = new IndexReader(fixtureIndex());
        const named = reader.type("StoreyInfoDto");
        if (!named) {
            throw new Error("the fixture lacks Inputs.IFC.StoreyInfoDto");
        }

        // Act
        const text = renderType(named, "9.9.9", reader.typesUsedByType(named));

        // Assert
        expect(text).not.toContain("## Types");
        expect(text.endsWith("- elevation: number; default 0 - How high its floor is above the building's origin, in the model's length unit.\n")).toBe(true);
    });

    it("puts a member's Types section after its parameters and before its examples", () => {
        // Arrange
        const reader = new IndexReader(fixtureIndex());
        const named = reader.type("StoreyInfoDto");
        const example = { path: "occt.shapes.solid.createBox", code: "const box = 1;" };

        // Act
        const text = renderMember(member({}), "9.9.9", [example], named ? [named] : []);

        // Assert
        expect(text.indexOf("## Types")).toBeGreaterThan(0);
        expect(text.indexOf("## Types")).toBeLessThan(text.indexOf("## Examples"));
        expect(text).toContain("- `Inputs.IFC.StoreyInfoDto`: A storey as");
    });
});
