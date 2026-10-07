import { describe, expect, it } from "vitest";
import { IdMap } from "./id-map";

const entriesOf = (map: IdMap<string>): [number, string][] => {
    const entries: [number, string][] = [];
    map.forEach((value, id) => entries.push([id, value]));
    return entries;
};

describe("IdMap", () => {
    it("should hold what it is given and count it", () => {
        // Act
        const map = IdMap.empty<string>().withChanges([[3, "c"], [1, "a"], [2_147_483_647, "z"]]);

        // Assert
        expect([map.get(1), map.get(3), map.get(2_147_483_647), map.get(2)]).toEqual(["a", "c", "z", undefined]);
        expect(map.size).toBe(3);
        expect(map.has(3)).toBe(true);
    });

    it("should visit its entries in ascending order of id", () => {
        // Act
        const map = IdMap.empty<string>().withChanges([[70, "x"], [5, "y"], [33, "w"]]);

        // Assert
        expect(entriesOf(map)).toEqual([[5, "y"], [33, "w"], [70, "x"]]);
    });

    it("should leave the map it was changed from as it was", () => {
        // Arrange
        const first = IdMap.empty<string>().withChanges([[1, "a"], [2, "b"]]);

        // Act
        const second = first.withChanges([[1, "A"], [2, undefined], [9, "i"]]);

        // Assert
        expect(entriesOf(first)).toEqual([[1, "a"], [2, "b"]]);
        expect(entriesOf(second)).toEqual([[1, "A"], [9, "i"]]);
        expect(second.size).toBe(2);
    });

    it("should give back itself when nothing changes", () => {
        // Arrange
        const map = IdMap.empty<string>().withChanges([[1, "a"]]);

        // Act
        const same = map.withChanges([[4, undefined]]);

        // Assert
        expect(same).toBe(map);
    });

    it("should apply a later change of a batch over an earlier one of the same id", () => {
        // Act
        const map = IdMap.empty<string>().withChanges([[1, "a"], [1, undefined], [2, "b"], [2, "B"]]);

        // Assert
        expect(entriesOf(map)).toEqual([[2, "B"]]);
        expect(map.size).toBe(1);
    });
});
