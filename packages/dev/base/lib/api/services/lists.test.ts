import { Lists } from "./lists";
import * as Inputs from "../inputs";

describe("Lists unit tests", () => {
    let lists: Lists;

    beforeEach(() => {
        lists = new Lists();
    });

    it("should get item from the list", () => {
        const result = lists.getItem({ list: [0, 1, 2], index: 1 });
        expect(result).toEqual(1);
    });

    it("should get item from the list and clone it", () => {
        const result = lists.getItem({ list: [0, 1, 2], index: 1, clone: true });
        expect(result).toEqual(1);
    });

    it("should get random items with threshold", () => {
        const result = lists.randomGetThreshold({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], threshold: 0.5, clone: false });
        expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should get random items with threshold and clone", () => {
        const result = lists.randomGetThreshold({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], threshold: 0.5, clone: true });
        expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should random remove items with threshold", () => {
        const result = lists.randomRemoveThreshold({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], threshold: 0.5, clone: false });
        expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should random remove items with threshold and clone", () => {
        const result = lists.randomRemoveThreshold({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], threshold: 0.5, clone: true });
        expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should get a sub list", () => {
        const result = lists.getSubList({ list: [0, 1, 2, 3, 4], indexStart: 1, indexEnd: 3 });
        expect(result).toEqual([1, 2]);
    });

    it("should get a sub list and clone", () => {
        const result = lists.getSubList({ list: [0, 1, 2, 3, 4], indexStart: 1, indexEnd: 3, clone: true });
        expect(result).toEqual([1, 2]);
    });

    it("should get a sub list with negative indexes", () => {
        const result = lists.getSubList({ list: [0, 1, 2, 3, 4], indexStart: -3, indexEnd: -1 });
        expect(result).toEqual([2, 3]);
    });

    it("should get out of bound error when getting item from the list", () => {
        expect(() => lists.getItem({ list: [0, 1, 2], index: 3 })).toThrowError("Index out of bounds");
    });

    it("should get sublist from the list", () => {
        const result = lists.getSubList({ list: [0, 1, 2, 3, 4], indexStart: 1, indexEnd: 3 });
        expect(result).toEqual([1, 2]);
    });

    it("should get nth item from the list", () => {
        const result = lists.getNthItem({ list: [0, 1, 2, 3, 4], nth: 2, offset: 0 });
        expect(result).toEqual([0, 2, 4]);
    });

    it("should get nth item from the list with offset 1", () => {
        const result = lists.getNthItem({ list: [0, 1, 2, 3, 4], nth: 2, offset: 1 });
        expect(result).toEqual([1, 3]);
    });

    it("should get nth item from the list with offset 2", () => {
        const result = lists.getNthItem({ list: [0, 1, 2, 3, 4], nth: 2, offset: 2 });
        expect(result).toEqual([0, 2, 4]);
    });

    it("should get nth item from the list when nth is 3", () => {
        const result = lists.getNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: 3, offset: 0 });
        expect(result).toEqual([0, 3, 6, 9]);
    });

    it("should get nth item from the list when nth is 3 and clone", () => {
        const result = lists.getNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: 3, offset: 0, clone: true });
        expect(result).toEqual([0, 3, 6, 9]);
    });

    it("should get all items from the list when nth is 1", () => {
        const result = lists.getNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: 1, offset: 0 });
        expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("should get no items from the list when nth is 0", () => {
        const result = lists.getNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: 0, offset: 0 });
        expect(result).toEqual([]);
    });

    it("should get all items from the list when nth is -1", () => {
        const result = lists.getNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: -1, offset: 0 });
        expect(result).toEqual([
            0, 1, 2, 3, 4,
            5, 6, 7, 8, 9,
            10
        ]);
    });


    it("should remove nth item from the list", () => {
        const result = lists.removeNthItem({ list: [0, 1, 2, 3, 4], nth: 2, offset: 2 });
        expect(result).toEqual([1, 3]);
    });

    it("should remove nth item from the list with offset 1", () => {
        const result = lists.removeNthItem({ list: [0, 1, 2, 3, 4], nth: 2, offset: 1 });
        expect(result).toEqual([0, 2, 4]);
    });

    it("should remove nth item from the list with offset 1 and clone", () => {
        const result = lists.removeNthItem({ list: [0, 1, 2, 3, 4], nth: 2, offset: 1, clone: true });
        expect(result).toEqual([0, 2, 4]);
    });

    it("should remove nth item from the list with offset 2", () => {
        const result = lists.removeNthItem({ list: [0, 1, 2, 3, 4], nth: 2, offset: 2 });
        expect(result).toEqual([1, 3]);
    });

    it("should remove nth item from the list when nth is 3", () => {
        const result = lists.removeNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: 3, offset: 0 });
        expect(result).toEqual([1, 2, 4, 5, 7, 8, 10]);
    });

    it("should remove nth item from the list when nth is 3 with 1 offset", () => {
        const result = lists.removeNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: 3, offset: 1 });
        expect(result).toEqual([0, 1, 3, 4,
            6, 7, 9, 10]);
    });

    it("should remove all items from the list when nth is 1", () => {
        const result = lists.removeNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: 1, offset: 0 });
        expect(result).toEqual([]);
    });

    it("should remove no items from the list when nth is 0", () => {
        const result = lists.removeNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: 0, offset: 0 });
        expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("should remove all items from the list when nth is -1", () => {
        const result = lists.removeNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nth: -1, offset: 0 });
        expect(result).toEqual([
        ]);
    });

    it("should reverse the list", () => {
        const result = lists.reverse({ list: [0, 1, 2] });
        expect(result).toEqual([2, 1, 0]);
    });

    it("should reverse the list and clone", () => {
        const result = lists.reverse({ list: [0, 1, 2], clone: true });
        expect(result).toEqual([2, 1, 0]);
    });

    it("should flip the list", () => {
        const result = lists.flipLists({ list: [[0, 1, 2], [3, 4, 5]] });
        expect(result).toEqual([[0, 3], [1, 4], [2, 5]]);
    });

    it("should flip the list", () => {
        const result = lists.flipLists({ list: [[0, 1, 2], [3, 4, 5]] });
        expect(result).toEqual([[0, 3], [1, 4], [2, 5]]);
    });

    it("should flip the list", () => {
        const result = lists.flipLists({ list: [[[0, 1, 2], [3, 4, 5], [12, 3, 4]], [[3, 2, 2], [33, 3, 4], [12, 2, 3]]] });
        expect(result).toEqual([
            [[0, 1, 2], [3, 2, 2]],
            [[3, 4, 5], [33, 3, 4]],
            [[12, 3, 4], [12, 2, 3]]
        ]);
    });

    it("should throw when flipping the list with different lengths", () => {
        expect(() => lists.flipLists({ list: [[0, 1, 2], [3, 4]] })).toThrowError("Lists are not of the same length");
    });

    it("should multiply the item", () => {
        const result = lists.repeat({ item: 1, times: 3 });
        expect(result).toEqual([1, 1, 1]);
    });

    it("should multiply the item 0 times", () => {
        const result = lists.repeat({ item: 1, times: 0 });
        expect(result).toEqual([]);
    });

    it("should multiply the item -1 times", () => {
        const result = lists.repeat({ item: 1, times: -1 });
        expect(result).toEqual([]);
    });

    it("should not flip empty list", () => {
        expect(() => lists.flipLists({ list: [] })).toThrowError("List is empty");
    });

    it("should add item to the beginning of the list", () => {
        const result = lists.addItemFirstLast({ list: [0, 1, 2], item: 3, position: Inputs.Lists.firstLastEnum.first });
        expect(result).toEqual([3, 0, 1, 2]);
    });

    it("should add item to the beginning of the list and clone", () => {
        const result = lists.addItemFirstLast({ list: [0, 1, 2], item: 3, position: Inputs.Lists.firstLastEnum.first, clone: true });
        expect(result).toEqual([3, 0, 1, 2]);
    });

    it("should add item to the endof the list", () => {
        const result = lists.addItemFirstLast({ list: [0, 1, 2], item: 3, position: Inputs.Lists.firstLastEnum.last });
        expect(result).toEqual([0, 1, 2, 3]);
    });

    it("should add item to list at index", () => {
        const result = lists.addItemAtIndex({ list: [0, 1, 2], index: 1, item: 3 });
        expect(result).toEqual([0, 3, 1, 2]);
    });

    it("should add item to list at index and clone", () => {
        const result = lists.addItemAtIndex({ list: [0, 1, 2], index: 1, item: 3, clone: true });
        expect(result).toEqual([0, 3, 1, 2]);
    });


    it("should add item to list at index 0", () => {
        const result = lists.addItemAtIndex({ list: [0, 1, 2], index: 0, item: 3 });
        expect(result).toEqual([3, 0, 1, 2]);
    });

    it("should add item to list at index 3", () => {
        const result = lists.addItemAtIndex({ list: [0, 1, 2], index: 3, item: 3 });
        expect(result).toEqual([0, 1, 2, 3]);
    });

    it("should not add item to list at index 6", () => {
        const result = lists.addItemAtIndex({ list: [0, 1, 2], index: 6, item: 3 });
        expect(result).toEqual([0, 1, 2]);
    });

    it("should add item to provided indexes", () => {
        const result = lists.addItemAtIndexes({ list: [0, 1, 2], indexes: [1, 2], item: 3 });
        expect(result).toEqual([0, 3, 1, 3, 2]);
    });

    it("should add item to provided indexes on list edges", () => {
        const result = lists.addItemAtIndexes({ list: [0, 1, 2], indexes: [0, 3], item: 3 });
        expect(result).toEqual([3, 0, 1, 2, 3]);
    });

    it("should add item to provided indexes on list edges and clone", () => {
        const result = lists.addItemAtIndexes({ list: [0, 1, 2], indexes: [0, 3], item: 3, clone: true });
        expect(result).toEqual([3, 0, 1, 2, 3]);
    });

    it("should add item to provided indexes on list edges and index order should not matter", () => {
        const result = lists.addItemAtIndexes({ list: [0, 1, 2], indexes: [3, 0], item: 3 });
        expect(result).toEqual([3, 0, 1, 2, 3]);
    });

    it("should add item to provided indexes on list edges", () => {
        const result = lists.addItemAtIndexes({ list: [0, 1, 2, 4, 5, 6], indexes: [0, 3, 5], item: 22 });
        expect(result).toEqual([
            22, 0, 1, 2, 22,
            4, 5, 22, 6
        ]);
    });

    it("should not add item to provided indexes on out of bound index", () => {
        const result = lists.addItemAtIndexes({ list: [0, 1, 2, 4, 5, 6], indexes: [0, 3, 44], item: 22 });
        expect(result).toEqual([
            22, 0, 1, 2, 22,
            4, 5, 6
        ]);
    });

    it("should not add item to provided indexes on out of bound index -2", () => {
        const result = lists.addItemAtIndexes({ list: [0, 1, 2, 4, 5, 6], indexes: [0, 3, -4], item: 22 });
        expect(result).toEqual([
            22, 0, 1, 2, 22,
            4, 5, 6
        ]);
    });

    it("should not add item to list at index -1", () => {
        const result = lists.addItemAtIndex({ list: [0, 1, 2], index: -1, item: 3 });
        expect(result).toEqual([0, 1, 2]);
    });

    it("should add items to list at indexes", () => {
        const result = lists.addItemsAtIndexes({ list: [0, 1, 2], indexes: [1, 2], items: [3, 4] });
        expect(result).toEqual([0, 3, 1, 4, 2]);
    });

    it("should add items to list at indexes and clone", () => {
        const result = lists.addItemsAtIndexes({ list: [0, 1, 2], indexes: [1, 2], items: [3, 4], clone: true });
        expect(result).toEqual([0, 3, 1, 4, 2]);
    });

    it("should add items to list at indexes", () => {
        const result = lists.addItemsAtIndexes({ list: [0, 1, 2], indexes: [0, 3], items: [3, 4] });
        expect(result).toEqual([3, 0, 1, 2, 4]);
    });

    it("should not add items to list at indexes if the number of items is not the same as indexes", () => {
        expect(() => lists.addItemsAtIndexes({ list: [0, 1, 2], indexes: [0, 3], items: [3, 4, 5] })).toThrowError("Items and indexes must have the same length");
    });

    it("should not add items to list at indexes if the indexes are not in ascending order", () => {
        expect(() => lists.addItemsAtIndexes({ list: [0, 1, 2], indexes: [3, 0], items: [3, 4] })).toThrowError("Indexes must be in ascending order");
    });

    it("should remove item from list at index", () => {
        const result = lists.removeItemAtIndex({ list: [0, 1, 2], index: 1 });
        expect(result).toEqual([0, 2]);
    });

    it("should remove item from list at index and clone", () => {
        const result = lists.removeItemAtIndex({ list: [0, 1, 2], index: 1, clone: true });
        expect(result).toEqual([0, 2]);
    });

    it("should not remove item from list at out of bounds index", () => {
        const reuslt = lists.removeItemAtIndex({ list: [0, 1, 2], index: 3 });
        expect(reuslt).toEqual([0, 1, 2]);
    });

    it("should not remove item from list at out of bounds index -1", () => {
        const result = lists.removeItemAtIndex({ list: [0, 1, 2], index: -1 });
        expect(result).toEqual([0, 1, 2]);
    });

    it("should remove item from list at index 0", () => {
        const result = lists.removeItemAtIndex({ list: [0, 1, 2], index: 0 });
        expect(result).toEqual([1, 2]);
    });

    it("should remove items at indexes", () => {
        const result = lists.removeItemsAtIndexes({ list: [0, 1, 2, 3, 4], indexes: [1, 3] });
        expect(result).toEqual([0, 2, 4]);
    });

    it("should remove items at indexes and clone", () => {
        const result = lists.removeItemsAtIndexes({ list: [0, 1, 2, 3, 4], indexes: [1, 3], clone: true });
        expect(result).toEqual([0, 2, 4]);
    });

    it("should remove all items", () => {
        const result = lists.removeAllItems({ list: [0, 1, 2, 3, 4] });
        expect(result).toEqual([]);
    });

    it("should create empty list", () => {
        const result = lists.createEmptyList();
        expect(result).toEqual([]);
    });

    it("should merge elements of lists", () => {
        const result = lists.mergeElementsOfLists({ lists: [[0, 1, 2], [3, 4, 5]], level: 0 });
        expect(result).toEqual([[0, 3], [1, 4], [2, 5]]);
    });

    it("should merge elements of lists if level does not exist - highest level will be used and additional levels will be created in result", () => {
        const result = lists.mergeElementsOfLists({ lists: [[0, 1, 2], [3, 4, 5]], level: 2 });
        expect(result).toEqual([[[[0, 3], [1, 4], [2, 5]]]]);
    });

    it("should merge elements of lists to a new structure even if pair is not available in second branch", () => {
        const result = lists.mergeElementsOfLists({ lists: [[0, 1, 2], [3, 4]], level: 0 });
        expect(result).toEqual([[0, 3], [1, 4], [2]]);
    });

    it("should merge elements of lists to a new structure even if pair is not available in first branch", () => {
        const result = lists.mergeElementsOfLists({ lists: [[0, 2], [3, 4, 5]], level: 0 });
        expect(result).toEqual([[0, 3], [2, 4], [5]]);
    });

    it("should merge elements of lists to a new structure even if elements do not exist in first branch", () => {
        const result = lists.mergeElementsOfLists({ lists: [[], [3, 4, 5]], level: 0 });
        expect(result).toEqual([[3], [4], [5]]);
    });

    it("should merge elements of lists on deeper levels by keeping the structure", () => {
        const result = lists.mergeElementsOfLists({ lists: [[[0, 1, 2]], [[3, 4, 5]]], level: 1 });
        expect(result).toEqual([[[0, 3], [1, 4], [2, 5]]]);
    });

    it("should merge elements of lists on deeper levels by keeping the structure in branches", () => {
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

    it("should merge elements of lists on deeper levels by keeping the structure in branches on lower level", () => {
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

    it("should merge elements of lists on deeper levels by keeping the structure on second level", () => {
        const result = lists.mergeElementsOfLists({ lists: [[[[0, 1, 2]]], [[[3, 4, 5]]]], level: 2 });
        expect(result).toEqual([[[[0, 3], [1, 4], [2, 5]]]]);
    });

    it("should get longest list length", () => {
        const result = lists.getLongestListLength({ lists: [[0, 1, 2], [3, 4, 5], [2, 2], [1], [3, 3, 3, 4, 5]] });
        expect(result).toEqual(5);
    });

    it("should get longest list length", () => {
        const result = lists.getLongestListLength({ lists: undefined });
        expect(result).toEqual(undefined);
    });

    it("should group nth and skip remainder", () => {
        const result = lists.groupNth({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nrElements: 3, keepRemainder: false });
        expect(result).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
    });

    it("should group nth and keep remainder", () => {
        const result = lists.groupNth({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], nrElements: 3, keepRemainder: true });
        expect(result).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10]]);
    });

    // TODO this still needs to be implemented
    // it.only('should group nth and keep remainder on certain level', () => {
    //     const result = lists.groupNth({ list: [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9, 10]], nrElements: 2, keepRemainder: true });
    //     console.log(result);
    //     expect(result).toEqual([[[0, 1], [2, 3], [4]], [[5, 6], [7, 8], [9, 10]]]);
    // });

    it("should find the depth of the deepest level count in the list with one level", () => {
        const result = lists.getListDepth({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } as Inputs.Lists.ListCloneDto<any>);
        expect(result).toBe(1);
    });

    it("should find the depth of the deepest level count in the empty list with many levels", () => {
        const result = lists.getListDepth({ list: [[], [[]], [[[[[]]]]]] } as Inputs.Lists.ListCloneDto<[]>);
        expect(result).toBe(6);
    });

    it("should find the depth of the deepest level count in the list", () => {
        const result = lists.getListDepth({ list: [0, 1, 2, [3, 4], 5, 6, 7, 8, 9, 10] } as Inputs.Lists.ListCloneDto<any>);
        expect(result).toBe(2);
    });

    it("should find the depth of the deepest level count in the list", () => {
        const result = lists.getListDepth({ list: [0, 1, 2, [3, [2], 4], 5, 6, 7, 8, 9, 10] } as Inputs.Lists.ListCloneDto<any>);
        expect(result).toBe(3);
    });

    it("should get the elements by following the pattern true true false", () => {
        const result = lists.getByPattern({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], pattern: [true, true, false] });
        expect(result).toEqual([0, 1, 3, 4, 6, 7, 9, 10]);
    });

    it("should get the elements by following the pattern true true false false", () => {
        const result = lists.getByPattern({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], pattern: [true, true, false, false] });
        expect(result).toEqual([0, 1, 4, 5, 8, 9]);
    });

    it("should get the elements by following the pattern false true true true", () => {
        const result = lists.getByPattern({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], pattern: [false, true, true, true] });
        expect(result).toEqual([1, 2, 3, 5, 6, 7, 9, 10]);
    });

    it("should get the elements by following the pattern false true true true when list is shorter than pattern", () => {
        const result = lists.getByPattern({ list: [0, 1, 2], pattern: [false, true, true, true] });
        expect(result).toEqual([1, 2]);
    });

    it("should get the empty list by following the pattern containing single false element", () => {
        const result = lists.getByPattern({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], pattern: [false] });
        expect(result).toEqual([]);
    });

    it("should not get the elements by following the empty pattern", () => {
        expect(() => lists.getByPattern({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], pattern: [] })).toThrowError("Pattern is empty or does not exist");
    });

    it("should not get the elements by following the empty pattern", () => {
        expect(() => lists.getByPattern({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], pattern: undefined })).toThrowError("Pattern is empty or does not exist");
    });

    it("should get list length", () => {
        const result = lists.listLength({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] });
        expect(result).toBe(11);
    });

    it("should remove duplicate numbers from the list", () => {
        const result = lists.removeDuplicateNumbers({ list: [1, 2, 3, 2, 4, 3, 5, 6, 7, 7, 8, 9, 10] });
        expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("should remove duplicate numbers from the list and clone", () => {
        const result = lists.removeDuplicateNumbers({ list: [1, 2, 3, 2, 4, 3, 5, 6, 7, 7, 8, 9, 10], clone: true });
        expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("should remove duplicate numbers from the list with tolerance", () => {
        const result = lists.removeDuplicateNumbersTolerance({ list: [1, 2.00001, 2, 2.01, 3, 2, 4, 3, 5, 6, 7, 7, 8, 9, 10], tolerance: 0.0001, clone: false });
        expect(result).toEqual([1, 2.00001, 2.01, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("should remove duplicate numbers from the list with tolerance and clone", () => {
        const result = lists.removeDuplicateNumbersTolerance({ list: [1, 2.00001, 2, 2.01, 3, 2, 4, 3, 5, 6, 7, 7, 8, 9, 10], tolerance: 0.0001, clone: true });
        expect(result).toEqual([1, 2.00001, 2.01, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("should add item to the list", () => {
        const result = lists.addItem({ list: [0, 1, 2], item: 3 });
        expect(result).toEqual([0, 1, 2, 3]);
    });

    it("should add item to the list and clone", () => {
        const result = lists.addItem({ list: [0, 1, 2], item: 3, clone: true });
        expect(result).toEqual([0, 1, 2, 3]);
    });

    it("should prepend item to the list", () => {
        const result = lists.prependItem({ list: [0, 1, 2], item: 3 });
        expect(result).toEqual([3, 0, 1, 2]);
    });

    it("should prepend item to the list and clone", () => {
        const result = lists.prependItem({ list: [0, 1, 2], item: 3, clone: true });
        expect(result).toEqual([3, 0, 1, 2]);
    });

    it("should repeat in pattern", () => {
        const result = lists.repeatInPattern({ list: [0, 1, 2], lengthLimit: 7 });
        expect(result.length).toBe(7);
        expect(result).toEqual([0, 1, 2, 0, 1, 2, 0]);
    });

    it("should repeat in pattern and clone", () => {
        const result = lists.repeatInPattern({ list: [0, 1, 2], lengthLimit: 7, clone: true });
        expect(result.length).toBe(7);
        expect(result).toEqual([0, 1, 2, 0, 1, 2, 0]);
    });

    it("should sort the numbers in the list ascending", () => {
        const result = lists.sortNumber({ list: [1, 2, 3, 2, 4, 3, 5, 6, 7, 7, 8, 9, 10], orderAsc: true });
        expect(result).toEqual([1, 2, 2, 3, 3, 4, 5, 6, 7, 7, 8, 9, 10]);
    });

    it("should sort the numbers in the list ascending and clone", () => {
        const result = lists.sortNumber({ list: [1, 2, 3, 2, 4, 3, 5, 6, 7, 7, 8, 9, 10], orderAsc: true, clone: true });
        expect(result).toEqual([1, 2, 2, 3, 3, 4, 5, 6, 7, 7, 8, 9, 10]);
    });

    it("should sort the numbers in the list descending", () => {
        const result = lists.sortNumber({ list: [1, 2, 3, 2, 4, 3, 5, 6, 7, 7, 8, 9, 10], orderAsc: false });
        expect(result).toEqual([10, 9, 8, 7, 7, 6, 5, 4, 3, 3, 2, 2, 1]);
    });

    it("should sort the texts in the list ascending", () => {
        const result = lists.sortTexts({ list: ["a", "b", "c", "a", "d", "c", "e", "f", "g", "g", "h", "i", "j"], orderAsc: true });
        expect(result).toEqual(["a", "a", "b", "c", "c", "d", "e", "f", "g", "g", "h", "i", "j"]);
    });

    it("should sort the texts in the list ascending and clone", () => {
        const result = lists.sortTexts({ list: ["a", "b", "c", "a", "d", "c", "e", "f", "g", "g", "h", "i", "j"], orderAsc: true, clone: true });
        expect(result).toEqual(["a", "a", "b", "c", "c", "d", "e", "f", "g", "g", "h", "i", "j"]);
    });

    it("should sort the texts in the list descending", () => {
        const result = lists.sortTexts({ list: ["a", "b", "c", "a", "d", "c", "e", "f", "g", "g", "h", "i", "j"], orderAsc: false });
        expect(result).toEqual(["j", "i", "h", "g", "g", "f", "e", "d", "c", "c", "b", "a", "a"]);
    });

    it("should sort by prop value ascending", () => {
        const result = lists.sortByPropValue({ list: [{ prop: 1 }, { prop: 3 }, { prop: 2 }], property: "prop", orderAsc: true });
        expect(result).toEqual([{ prop: 1 }, { prop: 2 }, { prop: 3 }]);
    });

    it("should sort by prop value ascending and clone", () => {
        const result = lists.sortByPropValue({ list: [{ prop: 1 }, { prop: 3 }, { prop: 2 }], property: "prop", orderAsc: true, clone: true });
        expect(result).toEqual([{ prop: 1 }, { prop: 2 }, { prop: 3 }]);
    });

    it("should sort by prop value descending", () => {
        const result = lists.sortByPropValue({ list: [{ prop: 1 }, { prop: 3 }, { prop: 2 }], property: "prop", orderAsc: false });
        expect(result).toEqual([{ prop: 3 }, { prop: 2 }, { prop: 1 }]);
    });

    it("should get first item from the list", () => {
        const result = lists.getFirstItem({ list: [0, 1, 2, 3, 4] });
        expect(result).toEqual(0);
    });

    it("should get first item from the list and clone", () => {
        const result = lists.getFirstItem({ list: [0, 1, 2, 3, 4], clone: true });
        expect(result).toEqual(0);
    });

    it("should throw error when getting first item from empty list", () => {
        expect(() => lists.getFirstItem({ list: [] })).toThrowError("List is empty");
    });

    it("should get last item from the list", () => {
        const result = lists.getLastItem({ list: [0, 1, 2, 3, 4] });
        expect(result).toEqual(4);
    });

    it("should get last item from the list and clone", () => {
        const result = lists.getLastItem({ list: [0, 1, 2, 3, 4], clone: true });
        expect(result).toEqual(4);
    });

    it("should throw error when getting last item from empty list", () => {
        expect(() => lists.getLastItem({ list: [] })).toThrowError("List is empty");
    });

    it("should remove first item from the list", () => {
        const result = lists.removeFirstItem({ list: [0, 1, 2, 3, 4] });
        expect(result).toEqual([1, 2, 3, 4]);
    });

    it("should remove first item from the list and clone", () => {
        const result = lists.removeFirstItem({ list: [0, 1, 2, 3, 4], clone: true });
        expect(result).toEqual([1, 2, 3, 4]);
    });

    it("should not remove first item from empty list", () => {
        const result = lists.removeFirstItem({ list: [] });
        expect(result).toEqual([]);
    });

    it("should remove last item from the list", () => {
        const result = lists.removeLastItem({ list: [0, 1, 2, 3, 4] });
        expect(result).toEqual([0, 1, 2, 3]);
    });

    it("should remove last item from the list and clone", () => {
        const result = lists.removeLastItem({ list: [0, 1, 2, 3, 4], clone: true });
        expect(result).toEqual([0, 1, 2, 3]);
    });

    it("should not remove last item from empty list", () => {
        const result = lists.removeLastItem({ list: [] });
        expect(result).toEqual([]);
    });

    it("should remove item at index from end (0 means last)", () => {
        const result = lists.removeItemAtIndexFromEnd({ list: [0, 1, 2, 3, 4], index: 0 });
        expect(result).toEqual([0, 1, 2, 3]);
    });

    it("should remove item at index from end (1 means second to last)", () => {
        const result = lists.removeItemAtIndexFromEnd({ list: [0, 1, 2, 3, 4], index: 1 });
        expect(result).toEqual([0, 1, 2, 4]);
    });

    it("should remove item at index from end (4 means first)", () => {
        const result = lists.removeItemAtIndexFromEnd({ list: [0, 1, 2, 3, 4], index: 4 });
        expect(result).toEqual([1, 2, 3, 4]);
    });

    it("should remove item at index from end and clone", () => {
        const result = lists.removeItemAtIndexFromEnd({ list: [0, 1, 2, 3, 4], index: 2, clone: true });
        expect(result).toEqual([0, 1, 3, 4]);
    });

    it("should not remove item at out of bounds index from end", () => {
        const result = lists.removeItemAtIndexFromEnd({ list: [0, 1, 2, 3, 4], index: 5 });
        expect(result).toEqual([0, 1, 2, 3, 4]);
    });

    it("should not remove item at negative index from end", () => {
        const result = lists.removeItemAtIndexFromEnd({ list: [0, 1, 2, 3, 4], index: -1 });
        expect(result).toEqual([0, 1, 2, 3, 4]);
    });

    it("should shuffle the list", () => {
        const result = lists.shuffle({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] });
        expect(result.length).toBe(10);
        expect(result).toContain(0);
        expect(result).toContain(9);
    });

    it("should shuffle the list and clone", () => {
        const result = lists.shuffle({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], clone: true });
        expect(result.length).toBe(10);
        expect(result).toContain(0);
        expect(result).toContain(9);
    });

    it("should shuffle empty list", () => {
        const result = lists.shuffle({ list: [] });
        expect(result).toEqual([]);
    });

    it("should remove duplicates from generic list", () => {
        const result = lists.removeDuplicates({ list: ["a", "b", "c", "a", "d", "b", "e"] });
        expect(result).toEqual(["a", "b", "c", "d", "e"]);
    });

    it("should remove duplicates from generic list and clone", () => {
        const result = lists.removeDuplicates({ list: ["a", "b", "c", "a", "d", "b", "e"], clone: true });
        expect(result).toEqual(["a", "b", "c", "d", "e"]);
    });

    it("should remove duplicates from number list", () => {
        const result = lists.removeDuplicates({ list: [1, 2, 3, 1, 4, 2, 5] });
        expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it("should concatenate multiple lists", () => {
        const result = lists.concatenate({ lists: [[0, 1, 2], [3, 4, 5], [6, 7, 8]] });
        expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it("should concatenate multiple lists and clone", () => {
        const result = lists.concatenate({ lists: [[0, 1, 2], [3, 4, 5], [6, 7, 8]], clone: true });
        expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it("should concatenate empty lists", () => {
        const result = lists.concatenate({ lists: [[], [], []] });
        expect(result).toEqual([]);
    });

    it("should concatenate single list", () => {
        const result = lists.concatenate({ lists: [[0, 1, 2]] });
        expect(result).toEqual([0, 1, 2]);
    });

    it("should check if list includes an item", () => {
        const result = lists.includes({ list: [0, 1, 2, 3, 4], item: 2 });
        expect(result).toBe(true);
    });

    it("should check if list does not include an item", () => {
        const result = lists.includes({ list: [0, 1, 2, 3, 4], item: 5 });
        expect(result).toBe(false);
    });

    it("should check if list includes string item", () => {
        const result = lists.includes({ list: ["a", "b", "c"], item: "b" });
        expect(result).toBe(true);
    });

    it("should find index of an item in the list", () => {
        const result = lists.findIndex({ list: [0, 1, 2, 3, 4], item: 2 });
        expect(result).toBe(2);
    });

    it("should return -1 when item is not found", () => {
        const result = lists.findIndex({ list: [0, 1, 2, 3, 4], item: 5 });
        expect(result).toBe(-1);
    });

    it("should find index of first occurrence", () => {
        const result = lists.findIndex({ list: [0, 1, 2, 3, 2, 4], item: 2 });
        expect(result).toBe(2);
    });

    it("should find index of string item", () => {
        const result = lists.findIndex({ list: ["a", "b", "c"], item: "c" });
        expect(result).toBe(2);
    });

    it("should interleave two lists", () => {
        const result = lists.interleave({ lists: [[0, 1, 2], [3, 4, 5]] });
        expect(result).toEqual([0, 3, 1, 4, 2, 5]);
    });

    it("should interleave two lists and clone", () => {
        const result = lists.interleave({ lists: [[0, 1, 2], [3, 4, 5]], clone: true });
        expect(result).toEqual([0, 3, 1, 4, 2, 5]);
    });

    it("should interleave three lists", () => {
        const result = lists.interleave({ lists: [[0, 1], [2, 3], [4, 5]] });
        expect(result).toEqual([0, 2, 4, 1, 3, 5]);
    });

    it("should interleave lists with different lengths", () => {
        const result = lists.interleave({ lists: [[0, 1, 2], [3, 4]] });
        expect(result).toEqual([0, 3, 1, 4, 2]);
    });

    it("should interleave lists with different lengths (first shorter)", () => {
        const result = lists.interleave({ lists: [[0, 1], [2, 3, 4, 5]] });
        expect(result).toEqual([0, 2, 1, 3, 4, 5]);
    });

    it("should interleave single list", () => {
        const result = lists.interleave({ lists: [[0, 1, 2]] });
        expect(result).toEqual([0, 1, 2]);
    });

    it("should interleave empty lists", () => {
        const result = lists.interleave({ lists: [[], []] });
        expect(result).toEqual([]);
    });

    it("should throw error when interleaving with no lists", () => {
        expect(() => lists.interleave({ lists: [] })).toThrowError("Lists array is empty or does not exist");
    });

    it("should interleave string lists", () => {
        const result = lists.interleave({ lists: [["a", "b"], ["c", "d"]] });
        expect(result).toEqual(["a", "c", "b", "d"]);
    });

});

