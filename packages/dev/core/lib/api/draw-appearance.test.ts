import { describe, it, expect } from "vitest";
import { contrastColor, defaultEdgeColor, designMeshKeyOf, designSignatureOf, edgeColorsOf, edgeSegmentsOf, lookGroupsOf, lookGroupsOfColors, lookMeshesOf, partPlacementsOf, samePlacements, type DesignLookOptions, type PartPlacement } from "./draw-appearance";

const square = (faceIndex: number, z: number) => ({
    faceIndex,
    vertexCoord: [0, 0, z, 1, 0, z, 1, 1, z, 0, 1, z],
    normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    triIndexes: [0, 1, 2, 0, 2, 3],
});

describe("the looks the faces of a shape wear", () => {
    it("should give every face the fallback color when there is no appearance", () => {
        // Act
        const groups = lookGroupsOf(undefined, [0, 1, 2], "#FF0000");

        // Assert
        expect(groups).toEqual([{ key: "#ff0000|||1||", look: { color: "#ff0000", opacity: 1 }, faces: [0, 1, 2] }]);
    });

    it("should put the base look first and give listed faces their entry's values over it", () => {
        // Arrange
        const appearance = { color: "#ffffff", metallic: 0.2, roughness: 0.4, faces: [{ indexes: [1], color: "#000000" }] };

        // Act
        const groups = lookGroupsOf(appearance, [0, 1, 2], "#ff0000");

        // Assert
        expect(groups.map(group => group.faces)).toEqual([[0, 2], [1]]);
        expect(groups[1]!.look).toEqual({ color: "#000000", metallic: 0.2, roughness: 0.4, opacity: 1 });
    });

    it("should let the last entry that lists a face decide its look", () => {
        // Arrange
        const appearance = { faces: [{ indexes: [0, 1], color: "#00ff00" }, { indexes: [1], color: "#0000ff" }] };

        // Act
        const groups = lookGroupsOf(appearance, [0, 1], "#ff0000");

        // Assert
        expect(groups.map(group => [group.look.color, group.faces])).toEqual([["#00ff00", [0]], ["#0000ff", [1]]]);
    });

    it("should merge entries that give the same look into one group", () => {
        // Arrange
        const appearance = { faces: [{ indexes: [0], color: "#00FF00" }, { indexes: [2], color: "#00ff00" }] };

        // Act
        const groups = lookGroupsOf(appearance, [0, 1, 2], "#ff0000");

        // Assert
        expect(groups.map(group => group.faces)).toEqual([[1], [0, 2]]);
    });

    it("should leave out faces the mesh does not have and looks no face wears", () => {
        // Arrange
        const appearance = { faces: [{ indexes: [0, 1], color: "#00ff00" }, { indexes: [9], color: "#0000ff" }] };

        // Act
        const groups = lookGroupsOf(appearance, [0, 1], "#ff0000");

        // Assert
        expect(groups).toHaveLength(1);
        expect(groups[0]!.faces).toEqual([0, 1]);
    });
});

describe("the glow of the faces of a shape", () => {
    it("should give a look the glow of its entry over the base's, and part looks that differ only in glow", () => {
        // Arrange
        const appearance = { color: "#ffffff", emissive: "#3CF2FF", emissiveStrength: 2, faces: [{ indexes: [1], emissiveStrength: 4 }, { indexes: [2], emissive: "#ff0000" }] };

        // Act
        const groups = lookGroupsOf(appearance, [0, 1, 2], "#808080");

        // Assert
        expect(groups.map(group => [group.faces, group.look.emissive, group.look.emissiveStrength])).toEqual([
            [[0], "#3cf2ff", 2],
            [[1], "#3cf2ff", 4],
            [[2], "#ff0000", 2],
        ]);
    });

    it("should give a look no glow when nothing gives it one", () => {
        // Act
        const [group] = lookGroupsOf({ color: "#ffffff", faces: [] }, [0], "#808080");

        // Assert
        expect(group!.look).toEqual({ color: "#ffffff", opacity: 1 });
    });
});

describe("the looks of a mesh made from an assembly document", () => {
    it("should read the last two hex digits of a color group as its opacity", () => {
        // Act
        const groups = lookGroupsOfColors({ "#ff000080": [0], "#00ff00ff": [1] }, [0, 1, 2], "#808080");

        // Assert
        expect(groups.map(group => [group.look.color, group.look.opacity, group.faces])).toEqual([
            ["#808080", 1, [2]],
            ["#ff0000", 128 / 255, [0]],
            ["#00ff00", 1, [1]],
        ]);
    });

    it("should take a six digit color as it is, fully opaque", () => {
        // Act
        const groups = lookGroupsOfColors({ "#123456": [0] }, [0], "#808080");

        // Assert
        expect(groups).toHaveLength(1);
        expect(groups[0]!.look).toEqual({ color: "#123456", opacity: 1 });
    });
});

describe("the colors of the edges of a shape", () => {
    it("should give every edge the fallback color when there is no appearance", () => {
        // Act
        const colors = edgeColorsOf(undefined, [0, 1, 2], "#FFFFFF");

        // Assert
        expect(colors).toEqual(["#ffffff", "#ffffff", "#ffffff"]);
    });

    it("should give the appearance's edge color over the fallback and listed edges their entry's color", () => {
        // Arrange
        const appearance = { color: "#000000", edgeColor: "#333333", faces: [], edges: [{ indexes: [1, 3], color: "#FF0000" }] };

        // Act
        const colors = edgeColorsOf(appearance, [0, 1, 2, 3], "#ffffff");

        // Assert
        expect(colors).toEqual(["#333333", "#ff0000", "#333333", "#ff0000"]);
    });

    it("should let the last entry that lists an edge decide it, an entry without a color giving the edge color", () => {
        // Arrange
        const appearance = { faces: [], edges: [{ indexes: [0, 1], color: "#00ff00" }, { indexes: [1, 2], color: "#0000ff" }, { indexes: [0] }] };

        // Act
        const colors = edgeColorsOf(appearance, [0, 1, 2], "#ffffff");

        // Assert
        expect(colors).toEqual(["#ffffff", "#0000ff", "#0000ff"]);
    });

    it("should color only the edges the mesh has, in the order it has them", () => {
        // Arrange
        const appearance = { faces: [], edges: [{ indexes: [9, 4], color: "#00ff00" }] };

        // Act
        const colors = edgeColorsOf(appearance, [4, 2], "#ffffff");

        // Assert
        expect(colors).toEqual(["#00ff00", "#ffffff"]);
    });
});

describe("an edge color that stands out from the faces", () => {
    it("should move a light color toward black and a dark one toward white", () => {
        // Act
        const onWhite = contrastColor("#ffffff", 0.4);
        const onBlack = contrastColor("#000000", 0.4);
        const onRed = contrastColor("#ff0000", 0.5);

        // Assert
        expect(onWhite).toBe("#999999");
        expect(onBlack).toBe("#666666");
        expect(onRed).toBe("#ff8080");
    });

    it("should keep the color at no contrast and reach black or white at full contrast, clamping beyond", () => {
        // Act
        const none = contrastColor("#8A8E95", 0);
        const full = contrastColor("#e0e0e0", 1);
        const beyond = contrastColor("#202020", 3);
        const below = contrastColor("#202020", -1);

        // Assert
        expect(none).toBe("#8a8e95");
        expect(full).toBe("#000000");
        expect(beyond).toBe("#ffffff");
        expect(below).toBe("#202020");
    });

    it("should read three and eight digit colors and refuse what is not a hex color", () => {
        // Act
        const short = contrastColor("#fff", 1);
        const withAlpha = contrastColor("#00000080", 1);
        const named = (): string => contrastColor("red", 0.5);

        // Assert
        expect(short).toBe("#000000");
        expect(withAlpha).toBe("#ffffff");
        expect(named).toThrow("The color red is not a hex color");
    });

    it("should give the options' edge color unless a contrast is given", () => {
        // Act
        const plain = defaultEdgeColor("#ffffff", "#123456", undefined);
        const contrasted = defaultEdgeColor("#ffffff", "#123456", 0.4);

        // Assert
        expect(plain).toBe("#123456");
        expect(contrasted).toBe("#999999");
    });
});

describe("the faces of each look merged into flat arrays", () => {
    it("should offset each face's indices by the vertices before it and record where its triangles are", () => {
        // Arrange
        const mesh = { faceList: [square(0, 0), square(1, 5), square(2, 9)] };
        const groups = lookGroupsOf({ faces: [{ indexes: [2], color: "#000000" }] }, [0, 1, 2], "#ffffff");

        // Act
        const [white, black] = lookMeshesOf(mesh, groups);

        // Assert
        expect(Array.from(white!.indices)).toEqual([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]);
        expect(white!.positions[14]).toBe(5);
        expect(white!.faceRanges).toEqual([{ face: 0, start: 0, count: 6 }, { face: 1, start: 6, count: 6 }]);
        expect(Array.from(black!.indices)).toEqual([0, 1, 2, 0, 2, 3]);
        expect(black!.positions[2]).toBe(9);
        expect(black!.faceRanges).toEqual([{ face: 2, start: 0, count: 6 }]);
    });

    it("should give an empty mesh to a look whose faces the mesh does not have", () => {
        // Arrange
        const groups = [{ key: "k", look: { color: "#ffffff", opacity: 1 }, faces: [4] }];

        // Act
        const [look] = lookMeshesOf({ faceList: [square(0, 0)] }, groups);

        // Assert
        expect(look!.indices).toHaveLength(0);
        expect(look!.positions).toHaveLength(0);
        expect(look!.faceRanges).toEqual([]);
    });

    it("should not change the mesh it was given", () => {
        // Arrange
        const face = square(0, 0);
        const groups = lookGroupsOf(undefined, [0], "#ffffff");

        // Act
        lookMeshesOf({ faceList: [face] }, groups);
        lookMeshesOf({ faceList: [face] }, groups);

        // Assert
        expect(face.triIndexes).toEqual([0, 1, 2, 0, 2, 3]);
    });
});

describe("the edges of a mesh as segments", () => {
    it("should cut each edge into segments between consecutive points and record where they are", () => {
        // Arrange
        const mesh = { edgeList: [
            { edgeIndex: 0, vertexCoord: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] },
            { edgeIndex: 1, vertexCoord: [[2, 2, 2], [3, 3, 3]] },
        ] };

        // Act
        const segments = edgeSegmentsOf(mesh);

        // Assert
        expect(Array.from(segments.positions)).toEqual([0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 2, 2, 2, 3, 3, 3]);
        expect(segments.edgeRanges).toEqual([{ edge: 0, start: 0, count: 2 }, { edge: 1, start: 2, count: 1 }]);
    });

    it("should skip a missing point and give a one-point edge no segment", () => {
        // Arrange
        const mesh = { edgeList: [
            { edgeIndex: 0, vertexCoord: [[0, 0, 0], undefined, [1, 0, 0]] },
            { edgeIndex: 1, vertexCoord: [[5, 5, 5]] },
        ] };

        // Act
        const segments = edgeSegmentsOf(mesh);

        // Assert
        expect(Array.from(segments.positions)).toEqual([0, 0, 0, 1, 0, 0]);
        expect(segments.edgeRanges).toEqual([{ edge: 0, start: 0, count: 1 }, { edge: 1, start: 1, count: 0 }]);
    });
});

describe("where each built part is placed", () => {
    const moved = (x: number): number[] => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 0, 0, 1];

    it("should group the placements of each part in the order of the components and skip sub-assemblies", () => {
        // Arrange
        const source = {
            parts: [{ id: "bolt" }, { id: "plate" }],
            components: [
                { path: "bolt0", part: "bolt", world: moved(1) },
                { path: "frame", world: moved(0) },
                { path: "plate", part: "plate", world: moved(0) },
                { path: "frame/bolt1", part: "bolt", world: moved(2) },
            ],
        };

        // Act
        const placements = partPlacementsOf(source);

        // Assert
        expect([...placements.keys()]).toEqual(["bolt", "plate"]);
        expect(placements.get("bolt")!.map(placement => [placement.path, placement.world[12]])).toEqual([["bolt0", 1], ["frame/bolt1", 2]]);
    });

    it("should place every part of a build without components once, at the origin", () => {
        // Act
        const placements = partPlacementsOf({ parts: [{ id: "a" }, { id: "b" }] });

        // Assert
        expect(placements.get("a")).toEqual([{ path: "a", world: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }]);
        expect(placements.get("b")).toHaveLength(1);
    });

    it("should call placements the same when only their matrices differ", () => {
        // Arrange
        const first = new Map<string, PartPlacement[]>([["bolt", [{ path: "bolt0", world: moved(1) }]]]);
        const movedOnly = new Map<string, PartPlacement[]>([["bolt", [{ path: "bolt0", world: moved(7) }]]]);
        const otherPath = new Map<string, PartPlacement[]>([["bolt", [{ path: "bolt1", world: moved(1) }]]]);
        const otherPart = new Map<string, PartPlacement[]>([["nut", [{ path: "bolt0", world: moved(1) }]]]);
        const more = new Map<string, PartPlacement[]>([["bolt", [{ path: "bolt0", world: moved(1) }, { path: "bolt1", world: moved(1) }]]]);

        // Act
        const results = [movedOnly, otherPath, otherPart, more].map(second => samePlacements(first, second));

        // Assert
        expect(results).toEqual([true, false, false, false]);
    });
});

describe("what decides how a design build looks", () => {
    const options: DesignLookOptions = { drawFaces: true, drawEdges: true, faceColour: "#ff0000", faceOpacity: 1, edgeColour: "#ffffff", edgeWidth: 2, edgeOpacity: 1 };
    const parts = new Map([["a", { appearance: { color: "#123456", faces: [] } }], ["b", {}]]);

    it("should stay the same for the same looks and options and change with either", () => {
        // Act
        const first = designSignatureOf(parts, ["a", "b"], options);
        const again = designSignatureOf(new Map(parts), ["a", "b"], { ...options });
        const otherLook = designSignatureOf(new Map([["a", { appearance: { color: "#654321", faces: [] } }], ["b", {}]]), ["a", "b"], options);
        const otherOptions = (["drawFaces", "drawEdges", "faceColour", "faceOpacity", "edgeColour", "edgeContrast", "edgeWidth", "edgeOpacity"] as const)
            .map(key => designSignatureOf(parts, ["a", "b"], { ...options, [key]: key === "edgeContrast" ? 0.5 : typeof options[key] === "boolean" ? !options[key] : typeof options[key] === "number" ? 0.25 : "#000000" }));

        // Assert
        expect(again).toBe(first);
        expect(otherLook).not.toBe(first);
        expect(new Set([first, ...otherOptions]).size).toBe(otherOptions.length + 1);
    });

    it("should change when a part's shape does, and key its mesh by its shape hash or, without one, its handle", () => {
        // Act
        const first = designSignatureOf(new Map([["a", { shapeHash: "one" }]]), ["a"], options);
        const edited = designSignatureOf(new Map([["a", { shapeHash: "two" }]]), ["a"], options);
        const keys = [designMeshKeyOf({ shapeHash: "one", shape: { hash: 7 } }), designMeshKeyOf({ shape: { hash: 7 } }), designMeshKeyOf({})];

        // Assert
        expect(edited).not.toBe(first);
        expect(keys).toEqual(["one", "handle:7", "handle:undefined"]);
    });

    it("should follow the parts in the order they are placed", () => {
        // Act
        const forward = designSignatureOf(parts, ["a", "b"], options);
        const backward = designSignatureOf(parts, ["b", "a"], options);

        // Assert
        expect(backward).not.toBe(forward);
    });
});
