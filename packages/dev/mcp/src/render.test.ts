import { describe, expect, it } from "vitest";
import { IndexReader } from "./index-reader.js";
import { renderMember } from "./render.js";
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
});
