import { Lists } from './lists';

describe('Lists unit tests', () => {
    let lists: Lists;

    beforeAll(async () => {
        lists = new Lists();
    });

    it('should get item from the list', async () => {
        const result = lists.getItem({ list: [0, 1, 2], index: 1 });
        expect(result).toEqual(1);
    });

    it('should get out of bound error when getting item from the list', async () => {
        expect(() => lists.getItem({ list: [0, 1, 2], index: 3 })).toThrowError('Index out of bounds');
    });

    it('should get sublist from the list', async () => {
        const result = lists.getSubList({ list: [0, 1, 2, 3, 4], indexStart: 1, indexEnd: 3 });
        expect(result).toEqual([1, 2]);
    });

    it('should reverse the list', async () => {
        const result = lists.reverse({ list: [0, 1, 2] });
        expect(result).toEqual([2, 1, 0]);
    });

    it('should flip the list', async () => {
        const result = lists.flipLists({ list: [[0, 1, 2], [3, 4, 5]] });
        expect(result).toEqual([[0, 3], [1, 4], [2, 5]]);
    });

    it('should flip the list', async () => {
        const result = lists.flipLists({ list: [[0, 1, 2], [3, 4, 5]] });
        expect(result).toEqual([[0, 3], [1, 4], [2, 5]]);
    });

    it('should flip the list', async () => {
        const result = lists.flipLists({ list: [[[0, 1, 2], [3, 4, 5], [12, 3, 4]], [[3, 2, 2], [33, 3, 4], [12, 2, 3]]] });
        console.log(result);
        expect(result).toEqual([
            [[0, 1, 2], [3, 2, 2]],
            [[3, 4, 5], [33, 3, 4]],
            [[12, 3, 4], [12, 2, 3]]
        ]);
    });

    it('should throw when flipping the list with different lengths', async () => {
        expect(() => lists.flipLists({ list: [[0, 1, 2], [3, 4]] })).toThrowError('Lists are not of the same length');
    });

    it('should multiply the item', async () => {
        const result = lists.repeat({ item: 1, times: 3 });
        expect(result).toEqual([1, 1, 1]);
    });

    it('should multiply the item 0 times', async () => {
        const result = lists.repeat({ item: 1, times: 0 });
        expect(result).toEqual([]);
    });

    it('should multiply the item -1 times', async () => {
        const result = lists.repeat({ item: 1, times: -1 });
        expect(result).toEqual([]);
    });

    it('should not flip empty list', async () => {
        expect(() => lists.flipLists({ list: [] })).toThrowError('List is empty');
    });

    it('should add item to list at index', async () => {
        const result = lists.addItemAtIndex({ list: [0, 1, 2], index: 1, item: 3 });
        expect(result).toEqual([0, 3, 1, 2]);
    });

    it('should add item to list at index 0', async () => {
        const result = lists.addItemAtIndex({ list: [0, 1, 2], index: 0, item: 3 });
        expect(result).toEqual([3, 0, 1, 2]);
    });

    it('should add item to list at index 3', async () => {
        const result = lists.addItemAtIndex({ list: [0, 1, 2], index: 3, item: 3 });
        expect(result).toEqual([0, 1, 2, 3]);
    });

    it('should not add item to list at index 6', async () => {
        expect(() => lists.addItemAtIndex({ list: [0, 1, 2], index: 6, item: 3 })).toThrowError('Index out of range');
    });

    it('should not add item to list at index -1', async () => {
        expect(() => lists.addItemAtIndex({ list: [0, 1, 2], index: -1, item: 3 })).toThrowError('Index out of range');
    });

    it('should remove item from list at index', async () => {
        const result = lists.removeItemAtIndex({ list: [0, 1, 2], index: 1 });
        expect(result).toEqual([0, 2]);
    });

    it('should not remove item from list at out of bounds index', async () => {
        expect(() => lists.removeItemAtIndex({ list: [0, 1, 2], index: 3 })).toThrowError('Index out of range');
    });

    it('should not remove item from list at out of bounds index -1', async () => {
        expect(() => lists.removeItemAtIndex({ list: [0, 1, 2], index: -1 })).toThrowError('Index out of range');
    });

    it('should remove item from list at index 0', async () => {
        const result = lists.removeItemAtIndex({ list: [0, 1, 2], index: 0 });
        expect(result).toEqual([1, 2]);
    });

    it('should create empty list', async () => {
        const result = lists.createEmptyList();
        expect(result).toEqual([]);
    });

});

