import { describe, it, expect } from "vitest";
import type * as Models from "../../api/models";
import { carryNames, copyNameOf, copyNames, facesCopied, facesNamed, give, nameOf, nameParts } from "./names";

const historyOf = (faces: number[][]): Models.OCCT.ShapeHistory => ({
    faces,
    edges: [],
    facesFromFaces: [],
    edgesFromFaces: [],
    facesFromEdges: [],
    facesFromVertices: [],
    edgesFromVertices: [],
    firstFaces: [],
    lastFaces: [],
});

describe("design face names", () => {
    it("should name by feature and role, with the sketch command and the copy when there are any", () => {
        // Act
        const names = [nameOf("plate", "end"), nameOf("plate", "side", "base.left"), copyNameOf(nameOf("plate", "end"), "row", 2)];

        // Assert
        expect(names).toEqual(["plate:end", "plate:side:base.left", "plate:end@row#2"]);
    });

    it("should carry each source face's names to every face it became, add the given names and sort them", () => {
        // Arrange
        const first = { names: [["b:end"], ["b:side"], ["b:start"]], history: historyOf([[1], [0, 2], []]) };
        const second = { names: [["t:side"]], history: historyOf([[2]]) };
        const given = new Map<number, string[]>();
        give(given, [0, 3], "f:round");
        give(given, [0], "f:extra");

        // Act
        const names = carryNames(4, [first, second], given);

        // Assert
        expect(names).toEqual([["b:side", "f:extra", "f:round"], ["b:end"], ["b:side", "t:side"], ["f:round"]]);
    });

    it("should give the unnamed name only to faces nothing else named", () => {
        // Arrange
        const source = { names: [["b:end"]], history: historyOf([[0]]) };

        // Act
        const names = carryNames(3, [source], new Map(), "u:new");

        // Assert
        expect(names).toEqual([["b:end"], ["u:new"], ["u:new"]]);
    });

    it("should ignore history entries past the result's faces and source faces with no history", () => {
        // Arrange
        const source = { names: [["b:end"], ["b:side"]], history: historyOf([[5]]) };
        const given = new Map<number, string[]>([[7, ["f:round"]]]);

        // Act
        const names = carryNames(1, [source], given);

        // Assert
        expect(names).toEqual([[]]);
    });

    it("should find the faces holding a name and rename every name as a copy", () => {
        // Arrange
        const names = [["a:end", "a:side"], ["a:side"], ["a:start"]];

        // Act
        const sides = facesNamed(names, "a:side");
        const copied = copyNames(names, "m", 1);

        // Assert
        expect(sides).toEqual([0, 1]);
        expect(copied).toEqual([["a:end@m#1", "a:side@m#1"], ["a:side@m#1"], ["a:start@m#1"]]);
        expect(names[0]).toEqual(["a:end", "a:side"]);
    });

    it("should take a name apart into its base and the copy each copier made of it", () => {
        // Act
        const plain = nameParts("block:side:base.front");
        const copied = nameParts("block:end@rowX#2@gridY#1");

        // Assert
        expect([plain.base, [...plain.copies]]).toEqual(["block:side:base.front", []]);
        expect([copied.base, [...copied.copies]]).toEqual(["block:end", [["rowX", 2], ["gridY", 1]]]);
    });

    it("should find copies level by level, the original where a level is not listed, every copy and the original for all", () => {
        // Arrange
        const names = [["block:end"], ["block:end@rowX#1"], ["block:end@gridY#1"], ["block:end@rowX#1@gridY#1"], ["block:side"]];

        // Act
        const original = facesCopied(names, "block:end", []);
        const rowOnly = facesCopied(names, "block:end", [{ of: "rowX", index: 1 }]);
        const gridOnly = facesCopied(names, "block:end", [{ of: "gridY", index: 1 }]);
        const both = facesCopied(names, "block:end", [{ of: "gridY", index: 1 }, { of: "rowX", index: 1 }]);
        const wholeRow = facesCopied(names, "block:end", [{ of: "rowX", index: "all" }, { of: "gridY", index: 1 }]);
        const everything = facesCopied(names, "block:end", [{ of: "rowX", index: "all" }, { of: "gridY", index: "all" }]);

        // Assert
        expect([original, rowOnly, gridOnly, both, wholeRow, everything]).toEqual([[0], [1], [2], [3], [2, 3], [0, 1, 2, 3]]);
    });
});
