import { Lists } from "./lists";
import * as Inputs from "../inputs/inputs";

describe("Lists unit tests", () => {
    let lists: Lists;

    beforeEach(async () => {
        lists = new Lists();
    });

    it("should get item from the list", async () => {
        const result = lists.getItem({ list: [0, 1, 2], index: 1 });
        expect(result).toEqual(1);
    });

    it("should get out of bound error when getting item from the list", async () => {
        expect(() => lists.getItem({ list: [0, 1, 2], index: 3 })).toThrowError("Index out of bounds");
    });

    it("should get sublist from the list", async () => {
        const result = lists.getSubList({ list: [0, 1, 2, 3, 4], indexStart: 1, indexEnd: 3 });
        expect(result).toEqual([1, 2]);
    });

    it("should get nth item from the list", async () => {
        const result = lists.getNthItem({ list: [0, 1, 2, 3, 4], nth: 2, offset: 0 });
        expect(result).toEqual([0, 2, 4]);
    });

    it("should get nth item from the list with offset 1", async () => {
        const result = lists.getNthItem({ list: [0, 1, 2, 3, 4], nth: 2, offset: 1 });
        expect(result).toEqual([1, 3]);
    });

    it("should get nth item from the list with offset 2", async () => {
        const result = lists.getNthItem({ list: [0, 1, 2, 3, 4], nth: 2, offset: 2 });
        expect(result).toEqual([0, 2, 4]);
    });

    it("should get nth item from the list when nth is 3", async () => {
        const result = lists.getNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: 3, offset: 0 });
        expect(result).toEqual([0, 3, 6, 9]);
    });

    it("should get all items from the list when nth is 1", async () => {
        const result = lists.getNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: 1, offset: 0 });
        expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("should get no items from the list when nth is 0", async () => {
        const result = lists.getNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: 0, offset: 0 });
        expect(result).toEqual([]);
    });

    it("should get all items from the list when nth is -1", async () => {
        const result = lists.getNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: -1, offset: 0 });
        expect(result).toEqual([
            0, 1, 2, 3, 4,
            5, 6, 7, 8, 9,
            10
        ]);
    });


    it("should remove nth item from the list", async () => {
        const result = lists.removeNthItem({ list: [0, 1, 2, 3, 4], nth: 2, offset: 2 });
        expect(result).toEqual([1, 3]);
    });

    it("should remove nth item from the list with offset 1", async () => {
        const result = lists.removeNthItem({ list: [0, 1, 2, 3, 4], nth: 2, offset: 1 });
        expect(result).toEqual([0, 2, 4]);
    });

    it("should remove nth item from the list with offset 2", async () => {
        const result = lists.removeNthItem({ list: [0, 1, 2, 3, 4], nth: 2, offset: 2 });
        expect(result).toEqual([1, 3]);
    });

    it("should remove nth item from the list when nth is 3", async () => {
        const result = lists.removeNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: 3, offset: 0 });
        expect(result).toEqual([1, 2, 4, 5, 7, 8, 10]);
    });

    it("should remove nth item from the list when nth is 3 with 1 offset", async () => {
        const result = lists.removeNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: 3, offset: 1 });
        expect(result).toEqual([0, 1, 3, 4,
            6, 7, 9, 10]);
    });

    it("should remove all items from the list when nth is 1", async () => {
        const result = lists.removeNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: 1, offset: 0 });
        expect(result).toEqual([]);
    });

    it("should remove no items from the list when nth is 0", async () => {
        const result = lists.removeNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: 0, offset: 0 });
        expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("should remove all items from the list when nth is -1", async () => {
        const result = lists.removeNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: -1, offset: 0 });
        expect(result).toEqual([
        ]);
    });

    it("should reverse the list", async () => {
        const result = lists.reverse({ list: [0, 1, 2] });
        expect(result).toEqual([2, 1, 0]);
    });

    it("should flip the list", async () => {
        const result = lists.flipLists({ list: [[0, 1, 2], [3, 4, 5]] });
        expect(result).toEqual([[0, 3], [1, 4], [2, 5]]);
    });

    it("should flip the list", async () => {
        const result = lists.flipLists({ list: [[0, 1, 2], [3, 4, 5]] });
        expect(result).toEqual([[0, 3], [1, 4], [2, 5]]);
    });

    it("should flip the list", async () => {
        const result = lists.flipLists({ list: [[[0, 1, 2], [3, 4, 5], [12, 3, 4]], [[3, 2, 2], [33, 3, 4], [12, 2, 3]]] });
        expect(result).toEqual([
            [[0, 1, 2], [3, 2, 2]],
            [[3, 4, 5], [33, 3, 4]],
            [[12, 3, 4], [12, 2, 3]]
        ]);
    });

    it("should throw when flipping the list with different lengths", async () => {
        expect(() => lists.flipLists({ list: [[0, 1, 2], [3, 4]] })).toThrowError("Lists are not of the same length");
    });

    it("should multiply the item", async () => {
        const result = lists.repeat({ item: 1, times: 3 });
        expect(result).toEqual([1, 1, 1]);
    });

    it("should multiply the item 0 times", async () => {
        const result = lists.repeat({ item: 1, times: 0 });
        expect(result).toEqual([]);
    });

    it("should multiply the item -1 times", async () => {
        const result = lists.repeat({ item: 1, times: -1 });
        expect(result).toEqual([]);
    });

    it("should not flip empty list", async () => {
        expect(() => lists.flipLists({ list: [] })).toThrowError("List is empty");
    });

    it("should add item to the beginning of the list", async () => {
        const result = lists.addItemFirstLast({ list: [0, 1, 2], item: 3, position: Inputs.Lists.FirstLastEnum.first });
        expect(result).toEqual([3, 0, 1, 2]);
    });

    it("should add item to the endof the list", async () => {
        const result = lists.addItemFirstLast({ list: [0, 1, 2], item: 3, position: Inputs.Lists.FirstLastEnum.last });
        expect(result).toEqual([0, 1, 2, 3]);
    });

    it("should add item to list at index", async () => {
        const result = lists.addItemAtIndex({ list: [0, 1, 2], index: 1, item: 3 });
        expect(result).toEqual([0, 3, 1, 2]);
    });

    it("should add item to list at index 0", async () => {
        const result = lists.addItemAtIndex({ list: [0, 1, 2], index: 0, item: 3 });
        expect(result).toEqual([3, 0, 1, 2]);
    });

    it("should add item to list at index 3", async () => {
        const result = lists.addItemAtIndex({ list: [0, 1, 2], index: 3, item: 3 });
        expect(result).toEqual([0, 1, 2, 3]);
    });

    it("should not add item to list at index 6", async () => {
        const result = lists.addItemAtIndex({ list: [0, 1, 2], index: 6, item: 3 });
        expect(result).toEqual([0, 1, 2]);
    });

    it("should add item to provided indexes", async () => {
        const result = lists.addItemAtIndexes({ list: [0, 1, 2], indexes: [1, 2], item: 3 });
        expect(result).toEqual([0, 3, 1, 3, 2]);
    });

    it("should add item to provided indexes on list edges", async () => {
        const result = lists.addItemAtIndexes({ list: [0, 1, 2], indexes: [0, 3], item: 3 });
        expect(result).toEqual([3, 0, 1, 2, 3]);
    });


    it("should add item to provided indexes on list edges and index order should not matter", async () => {
        const result = lists.addItemAtIndexes({ list: [0, 1, 2], indexes: [3, 0], item: 3 });
        expect(result).toEqual([3, 0, 1, 2, 3]);
    });

    it("should add item to provided indexes on list edges", async () => {
        const result = lists.addItemAtIndexes({ list: [0, 1, 2, 4, 5, 6], indexes: [0, 3, 5], item: 22 });
        expect(result).toEqual([
            22, 0, 1, 2, 22,
            4, 5, 22, 6
        ]);
    });

    it("should not add item to provided indexes on out of bound index", async () => {
        const result = lists.addItemAtIndexes({ list: [0, 1, 2, 4, 5, 6], indexes: [0, 3, 44], item: 22 });
        expect(result).toEqual([
            22, 0, 1, 2, 22,
            4, 5, 6
        ]);
    });

    it("should not add item to provided indexes on out of bound index -2", async () => {
        const result = lists.addItemAtIndexes({ list: [0, 1, 2, 4, 5, 6], indexes: [0, 3, -4], item: 22 });
        expect(result).toEqual([
            22, 0, 1, 2, 22,
            4, 5, 6
        ]);
    });

    it("should not add item to list at index -1", async () => {
        const result = lists.addItemAtIndex({ list: [0, 1, 2], index: -1, item: 3 });
        expect(result).toEqual([0, 1, 2]);
    });

    it("should add items to list at indexes", async () => {
        const result = lists.addItemsAtIndexes({ list: [0, 1, 2], indexes: [1, 2], items: [3, 4] });
        expect(result).toEqual([0, 3, 1, 4, 2]);
    });

    it("should add items to list at indexes", async () => {
        const result = lists.addItemsAtIndexes({ list: [0, 1, 2], indexes: [0, 3], items: [3, 4] });
        expect(result).toEqual([3, 0, 1, 2, 4]);
    });

    it("should not add items to list at indexes if the number of items is not the same as indexes", async () => {
        expect(() => lists.addItemsAtIndexes({ list: [0, 1, 2], indexes: [0, 3], items: [3, 4, 5] })).toThrowError("Items and indexes must have the same length");
    });

    it("should not add items to list at indexes if the indexes are not in ascending order", async () => {
        expect(() => lists.addItemsAtIndexes({ list: [0, 1, 2], indexes: [3, 0], items: [3, 4] })).toThrowError("Indexes must be in ascending order");
    });

    it("should remove item from list at index", async () => {
        const result = lists.removeItemAtIndex({ list: [0, 1, 2], index: 1 });
        expect(result).toEqual([0, 2]);
    });

    it("should not remove item from list at out of bounds index", async () => {
        const reuslt = lists.removeItemAtIndex({ list: [0, 1, 2], index: 3 });
        expect(reuslt).toEqual([0, 1, 2]);
    });

    it("should not remove item from list at out of bounds index -1", async () => {
        const result = lists.removeItemAtIndex({ list: [0, 1, 2], index: -1 });
        expect(result).toEqual([0, 1, 2]);
    });

    it("should remove item from list at index 0", () => {
        const result = lists.removeItemAtIndex({ list: [0, 1, 2], index: 0 });
        expect(result).toEqual([1, 2]);
    });

    it("should create empty list", async () => {
        const result = lists.createEmptyList();
        expect(result).toEqual([]);
    });

    it("should merge elements of lists", async () => {
        const result = lists.mergeElementsOfLists({ lists: [[0, 1, 2], [3, 4, 5]], level: 0});
        expect(result).toEqual([[0, 3], [1, 4], [2, 5]]);
    });

    it("should merge elements of lists if level does not exist - highest level will be used and additional levels will be created in result", async () => {
        const result = lists.mergeElementsOfLists({ lists: [[0, 1, 2], [3, 4, 5]], level: 2 });
        expect(result).toEqual([[[[0, 3], [1, 4], [2, 5]]]]);
    });

    it("should merge elements of lists to a new structure even if pair is not available in second branch", async () => {
        const result = lists.mergeElementsOfLists({ lists: [[0, 1, 2], [3, 4]], level: 0 });
        expect(result).toEqual([[0, 3], [1, 4], [2]]);
    });

    it("should merge elements of lists to a new structure even if pair is not available in first branch", async () => {
        const result = lists.mergeElementsOfLists({ lists: [[0, 2], [3, 4, 5]], level: 0});
        expect(result).toEqual([[0, 3], [2, 4], [5]]);
    });

    it("should merge elements of lists to a new structure even if elements do not exist in first branch", async () => {
        const result = lists.mergeElementsOfLists({ lists: [[], [3, 4, 5]], level: 0 });
        expect(result).toEqual([[3], [4], [5]]);
    });

    it("should merge elements of lists on deeper levels by keeping the structure", async () => {
        const result = lists.mergeElementsOfLists({ lists: [[[0, 1, 2]], [[3, 4, 5]]], level: 1 });
        expect(result).toEqual([[[0, 3], [1, 4], [2, 5]]]);
    });

    it("should merge elements of lists on deeper levels by keeping the structure in branches", async () => {
        const result = lists.mergeElementsOfLists({ lists: [[[0, 1, 2], ["a", "b", "c"]], [[3, 4, 5], ["d", "e", "f"]], [[6, 7, 8], ["g", "h", "l"]]], level: 1 });
        expect(result).toEqual([
            [
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],
                ["a", "d", "g"],
                ["b", "e", "h"],
                ["c", "f", "l"]
            ]
        ]);
    });

    it("should merge elements of lists on deeper levels by keeping the structure in branches on lower level", async () => {
        const result = lists.mergeElementsOfLists({ lists: [[[0, 1, 2], ["a", "b", "c"]], [[3, 4, 5], ["d", "e", "f"]], [[6, 7, 8], ["g", "h", "l"]]], level: 0 });
        expect(result).toEqual(
            [
                [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8]
                ], [
                    ["a", "b", "c"], ["d", "e", "f"], ["g", "h", "l"]
                ]
            ]
        );
    });

    it("should merge elements of lists on deeper levels by keeping the structure on second level", async () => {
        const result = lists.mergeElementsOfLists({ lists: [[[[0, 1, 2]]], [[[3, 4, 5]]]], level: 2});
        expect(result).toEqual([[[[0, 3], [1, 4], [2, 5]]]]);
    });

    it("should get longest list length", async () => {
        const result = lists.getLongestListLength({ lists: [[0, 1, 2], [3, 4, 5], [2, 2], [1], [3, 3, 3, 4, 5]] });
        expect(result).toEqual(5);
    });

    it("should get longest list length", async () => {
        const result = lists.getLongestListLength({ lists: undefined });
        expect(result).toEqual(undefined);
    });

    it("should group nth and skip remainder", async () => {
        const result = lists.groupNth({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nrElements: 3, keepRemainder: false });
        expect(result).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
    });

    it("should group nth and keep remainder", async () => {
        const result = lists.groupNth({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nrElements: 3, keepRemainder: true });
        expect(result).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10]]);
    });

    // TODO this still needs to be implemented
    // it.only('should group nth and keep remainder on certain level', async () => {
    //     const result = lists.groupNth({ list: [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9, 10]], nrElements: 2, keepRemainder: true });
    //     console.log(result);
    //     expect(result).toEqual([[[0, 1], [2, 3], [4]], [[5, 6], [7, 8], [9, 10]]]);
    // });

    it("should find the depth of the deepest level count in the list with one level", async () => {
        const result = lists.getListDepth({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] });
        expect(result).toBe(1);
    });

    it("should find the depth of the deepest level count in the empty list with many levels", async () => {
        const result = lists.getListDepth({ list: [[], [[]], [[[[[]]]]]] });
        expect(result).toBe(6);
    });

    it("should find the depth of the deepest level count in the list", async () => {
        const result = lists.getListDepth({ list: [0, 1, 2, [3, 4], 5, 6, 7, 8, 9, 10] });
        expect(result).toBe(2);
    });

    it("should find the depth of the deepest level count in the list", async () => {
        const result = lists.getListDepth({ list: [0, 1, 2, [3, [2], 4], 5, 6, 7, 8, 9, 10] });
        expect(result).toBe(3);
    });

    it("should get the elements by following the pattern true true false", async () => {
        const result = lists.getByPattern({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], pattern: [true, true, false] });
        expect(result).toEqual([0, 1, 3, 4, 6, 7, 9, 10]);
    });

    it("should get the elements by following the pattern true true false false", async () => {
        const result = lists.getByPattern({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], pattern: [true, true, false, false] });
        expect(result).toEqual([0, 1, 4, 5, 8, 9]);
    });

    it("should get the elements by following the pattern false true true true", async () => {
        const result = lists.getByPattern({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], pattern: [false, true, true, true] });
        expect(result).toEqual([1, 2, 3, 5, 6, 7, 9, 10]);
    });

    it("should get the elements by following the pattern false true true true when list is shorter than pattern", async () => {
        const result = lists.getByPattern({ list: [0, 1, 2], pattern: [false, true, true, true] });
        expect(result).toEqual([1, 2]);
    });

    it("should get the empty list by following the pattern containing single false element", async () => {
        const result = lists.getByPattern({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], pattern: [false] });
        expect(result).toEqual([]);
    });

    it("should not get the elements by following the empty pattern", async () => {
        expect(() => lists.getByPattern({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], pattern: [] })).toThrowError("Pattern is empty or does not exist");
    });

    it("should not get the elements by following the empty pattern", async () => {
        expect(() => lists.getByPattern({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], pattern: undefined })).toThrowError("Pattern is empty or does not exist");
    });

    it("should get list length", async () => {
        const result = lists.listLength({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] });
        expect(result).toBe(11);
    });

});

