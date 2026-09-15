import * as Inputs from "../inputs";

/**
 * Reading, building and reshaping plain arrays of any kind of item. Positions are 0-based: index 0
 * is the first item. Most methods take a `clone` option, on by default, that deep-copies the list
 * first so the input is never changed; switched off, the modifying methods work on the list in
 * place, which is faster for large data. `removeAllItems` always empties the list it is given.
 */
export class Lists {
    /**
     * Reads the item at a position in the list, counting from 0.
     *
     * An index outside the list throws an error.
     * Example: [10, 20, 30, 40] at index 2 -> 30
     * @param inputs - The list, the index and whether to copy the item
     * @returns The item at that index
     * @group get
     * @shortname item by index
     * @drawable false
     * @example
     * ```typescript
     * const third = bitbybit.lists.getItem({ list: [10, 20, 30, 40], index: 2, clone: true });
     * ```
     */
    getItem<T>(inputs: Inputs.Lists.ListItemDto<T>): T {
        if (inputs.index < 0 || inputs.index >= inputs.list.length) {
            throw new Error("Index out of bounds");
        }
        let result;
        if (inputs.clone) {
            result = structuredClone(inputs.list[inputs.index]!);
        } else {
            result = inputs.list[inputs.index]!;
        }
        return result;
    }

    /**
     * Reads the first item of the list.
     *
     * Example: [10, 20, 30, 40] -> 10
     * @param inputs - The list and whether to copy the item
     * @returns The first item
     * @group get
     * @shortname first item
     * @drawable false
     */
    getFirstItem<T>(inputs: Inputs.Lists.ListCloneDto<T>): T {
        if (inputs.list.length === 0) {
            throw new Error("List is empty");
        }
        let result;
        if (inputs.clone) {
            result = structuredClone(inputs.list[0]!);
        } else {
            result = inputs.list[0]!;
        }
        return result;
    }

    /**
     * Reads the last item of the list.
     *
     * Example: [10, 20, 30, 40] -> 40
     * @param inputs - The list and whether to copy the item
     * @returns The last item
     * @group get
     * @shortname last item
     * @drawable false
     */
    getLastItem<T>(inputs: Inputs.Lists.ListCloneDto<T>): T {
        if (inputs.list.length === 0) {
            throw new Error("List is empty");
        }
        let result;
        if (inputs.clone) {
            result = structuredClone(inputs.list[inputs.list.length - 1]!);
        } else {
            result = inputs.list[inputs.list.length - 1]!;
        }
        return result;
    }


    /**
     * Keeps each item of the list with a given probability and drops the rest, so the result
     * differs on every call.
     *
     * Example: [1, 2, 3, 4, 5] with threshold 0.5 -> perhaps [1, 3, 5]
     * @param inputs - The list, the probability of keeping an item from 0 to 1, and whether to copy
     * @returns The items that were kept, in their original order
     * @group get
     * @shortname random get threshold
     * @drawable false
     * @example
     * ```typescript
     * const some = bitbybit.lists.randomGetThreshold({ list: [1, 2, 3, 4, 5], threshold: 0.5, clone: true });
     * ```
     */
    randomGetThreshold<T>(inputs: Inputs.Lists.RandomThresholdDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        const newList = [];
        for (let i = 0; i < inputs.list.length; i++) {
            if (Math.random() < inputs.threshold) {
                newList.push(res[i]!);
            }
        }
        return newList;
    }

    /**
     * Cuts out the items from a start index up to, but not including, an end index.
     *
     * Example: [10, 20, 30, 40, 50] from 1 to 4 -> [20, 30, 40]
     * @param inputs - The list, the start and end indexes, and whether to copy
     * @returns The items in that range
     * @group get
     * @shortname sublist
     * @drawable false
     * @example
     * ```typescript
     * const middle = bitbybit.lists.getSubList({ list: [10, 20, 30, 40, 50], indexStart: 1, indexEnd: 4, clone: true });
     * ```
     */
    getSubList<T>(inputs: Inputs.Lists.SubListDto<T>): T[] {
        let result;
        if (inputs.clone) {
            result = structuredClone(inputs.list.slice(inputs.indexStart, inputs.indexEnd));
        } else {
            result = inputs.list.slice(inputs.indexStart, inputs.indexEnd);
        }
        return result;
    }

    /**
     * Keeps every nth item, starting from an offset.
     *
     * Example: [0, 1, 2, 3, 4, 5, 6, 7, 8] with nth 3 and offset 0 -> [0, 3, 6]; with nth 2 and
     * offset 1 -> [1, 3, 5, 7]
     * @param inputs - The list, the step, the offset to start from, and whether to copy
     * @returns Every nth item, in order
     * @group get
     * @shortname every n-th
     * @drawable false
     * @example
     * ```typescript
     * const everyThird = bitbybit.lists.getNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8], nth: 3, offset: 0, clone: true });
     * ```
     */
    getNthItem<T>(inputs: Inputs.Lists.GetNthItemDto<T>): T[] {
        let cloned = inputs.list;
        if (inputs.clone) {
            cloned = structuredClone(inputs.list);
        }
        const result = [];
        for (let i = 0; i < cloned.length; i++) {
            if ((i + inputs.offset) % inputs.nth === 0) {
                result.push(cloned[i]!);
            }
        }
        return result;
    }
    /**
     * Keeps the items where a repeating true/false pattern says true and drops the others.
     *
     * The pattern starts over when it runs out.
     * Example: [0, 1, 2, 3, 4, 5] with pattern [true, true, false] -> [0, 1, 3, 4]
     * @param inputs - The list and the pattern
     * @returns The items the pattern kept, in order
     * @group get
     * @shortname by pattern
     * @drawable false
     * @example
     * ```typescript
     * const kept = bitbybit.lists.getByPattern({ list: [0, 1, 2, 3, 4, 5], pattern: [true, true, false] });
     * ```
     */
    getByPattern<T>(inputs: Inputs.Lists.GetByPatternDto<T>): T[] {
        const { list, pattern } = inputs;
        if (!pattern || pattern.length === 0) {
            throw new Error("Pattern is empty or does not exist");
        }
        const patternLength = pattern.length;
        const listLength = list.length;
        const result: T[] = [];
        if (patternLength >= listLength) {
            list.forEach((item, index) => {
                if (pattern[index] === true) {
                    result.push(item);
                }
            });
        }
        else {
            const repeatedPattern: boolean[] = [];
            const repeatPatternTimes = Math.ceil(listLength / patternLength);
            for (let i = 0; i < repeatPatternTimes; i++) {
                repeatedPattern.push(...pattern);
            }
            list.forEach((item, index) => {
                if (repeatedPattern[index] === true) {
                    result.push(item);
                }
            });
        }
        return result;
    }

    /**
     * Regroups nested lists by position: the first items of every list go together, then the second
     * items, and so on.
     *
     * `level` says how many levels of nesting to flatten inside each list first; 0 regroups them as
     * they are.
     * Example: [[0, 1, 2], [3, 4, 5]] at level 0 -> [[0, 3], [1, 4], [2, 5]]
     * @param inputs - The lists and the depth at which to regroup
     * @returns The regrouped lists
     * @group get
     * @shortname merge levels
     * @drawable false
     * @example
     * ```typescript
     * const columns = bitbybit.lists.mergeElementsOfLists({ lists: [[0, 1, 2], [3, 4, 5]], level: 0 });
     * ```
     */
    mergeElementsOfLists<T>(inputs: Inputs.Lists.MergeElementsOfLists<T[]>): T[] {
        const lists = inputs.lists;
        const level = inputs.level;

        const elToMerge: unknown[][] = [];
        const result: unknown[][] = [];
        lists.forEach(list => {
            const elementsToMerge = list.flat(level);
            elToMerge.push(elementsToMerge);
        });

        const lengthMerge = this.getLongestListLength({ lists: elToMerge });
        for (let i = 0; i < lengthMerge; i++) {
            const temp: unknown[] = [];
            for (let j = 0; j < elToMerge.length; j++) {
                const element = elToMerge[j]![i];
                if (element !== undefined) {
                    temp.push(element);
                }
            }
            if (temp.length > 0) {
                result.push(temp);
            }
        }

        let final: unknown[][] = [];
        if (level > 0) {
            for (let i = 0; i < level; i++) {
                if (i === level - 1 && i !== 0) {
                    final[i - 1]!.push(result);
                } else if (i === level - 1) {
                    final.push(result);
                } else {
                    final.push([]);
                }
            }
        } else {
            final = result;
        }
        return final as T[];
    }

    /**
     * Measures the longest list among several.
     *
     * Example: [[1, 2], [3, 4, 5, 6], [7]] -> 4
     * @param inputs - The lists to measure
     * @returns The length of the longest one
     * @group get
     * @shortname longest list length
     * @drawable false
     * @example
     * ```typescript
     * const longest = bitbybit.lists.getLongestListLength({ lists: [[1, 2], [3, 4, 5, 6], [7]] });
     * ```
     */
    getLongestListLength<T>(inputs: Inputs.Lists.GetLongestListLength<T[]>): number {
        let longestSoFar = 0;
        if (inputs.lists) {
            inputs.lists.forEach(l => {
                if (l.length > longestSoFar) {
                    longestSoFar = l.length;
                }
            });
        }
        return longestSoFar;
    }

    /**
     * Reverses the order of the items.
     *
     * Example: [1, 2, 3, 4, 5] -> [5, 4, 3, 2, 1]
     * @param inputs - The list and whether to copy it first
     * @returns The reversed list
     * @group edit
     * @shortname reverse
     * @drawable false
     */
    reverse<T>(inputs: Inputs.Lists.ListCloneDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        return res.reverse();
    }

    /**
     * Puts the items in a random order, different on every call.
     *
     * Example: [1, 2, 3, 4, 5] -> perhaps [3, 1, 5, 2, 4]
     * @param inputs - The list and whether to copy it first
     * @returns The shuffled list
     * @group edit
     * @shortname shuffle
     * @drawable false
     */
    shuffle<T>(inputs: Inputs.Lists.ListCloneDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        for (let i = res.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [res[i], res[j]] = [res[j]!, res[i]!];
        }
        return res;
    }

    /**
     * Turns a list of lists on its side: rows become columns and columns become rows.
     *
     * All the inner lists must have the same length.
     * Example: [[0, 1, 2], [3, 4, 5]] -> [[0, 3], [1, 4], [2, 5]]
     * @param inputs - The list of lists and whether to copy it first
     * @returns The transposed list of lists
     * @group edit
     * @shortname flip lists
     * @drawable false
     * @example
     * ```typescript
     * const columns = bitbybit.lists.flipLists({ list: [[0, 1, 2], [3, 4, 5]], clone: true });
     * ```
     */
    flipLists<T>(inputs: Inputs.Lists.ListCloneDto<T[]>): T[][] {
        if (inputs.list.length > 0) {
            const lengthOfFirstList = inputs.list[0]!.length;
            let allListsSameLength = true;
            inputs.list.forEach(l => {
                if (l.length !== lengthOfFirstList) {
                    allListsSameLength = false;
                }
            });
            if (allListsSameLength) {
                const result: T[][] = [];
                for (let i = 0; i < lengthOfFirstList; i++) {
                    const newList: T[] = [];
                    inputs.list.forEach(l => {
                        newList.push(l[i]!);
                    });
                    result.push(newList);
                }
                return result;
            } else {
                throw new Error("Lists are not of the same length");
            }
        } else {
            throw new Error("List is empty");
        }
    }

    /**
     * Splits the list into groups of n items.
     *
     * Items left over at the end are dropped unless `keepRemainder` is on, which adds them as a
     * shorter last group.
     * Example: [0, 1, 2, 3, 4, 5, 6, 7, 8] in groups of 3 -> [[0, 1, 2], [3, 4, 5], [6, 7, 8]]
     * @param inputs - The list, the group size and whether to keep a partial last group
     * @returns The groups, in order
     * @group edit
     * @shortname group elements
     * @drawable false
     * @example
     * ```typescript
     * const pairs = bitbybit.lists.groupNth({ list: [0, 1, 2, 3, 4], nrElements: 2, keepRemainder: true });
     * ```
     */
    groupNth<T>(inputs: Inputs.Lists.GroupListDto<T>): T[][] {
        const groupElements = (inputs: Inputs.Lists.GroupListDto<T>) => {
            const { nrElements, list, keepRemainder } = inputs;
            const nrElementsInGroup = nrElements;
            const result: T[][] = [];
            let currentGroup: T[] = [];
            list.forEach((item, index) => {
                currentGroup.push(item);
                if ((index + 1) % nrElementsInGroup === 0) {
                    result.push(currentGroup);
                    currentGroup = [];
                }
                if (currentGroup.length > 0 && keepRemainder && index === list.length - 1) {
                    result.push(currentGroup);
                }
            });
            return result;
        };
        return groupElements(inputs);
    }

    /**
     * Tells whether an item is in the list.
     *
     * Items are compared by identity, so an object is found only if the very same object is in the
     * list.
     * Example: [10, 20, 30, 40] includes 30 -> true, includes 50 -> false
     * @param inputs - The list and the item to look for
     * @returns True when the item is in the list
     * @group get
     * @shortname contains item
     * @drawable false
     * @example
     * ```typescript
     * const found = bitbybit.lists.includes({ list: [10, 20, 30, 40], item: 30 });
     * ```
     */
    includes<T>(inputs: Inputs.Lists.IncludesDto<T>): boolean {
        return inputs.list.includes(inputs.item);
    }

    /**
     * Finds the position of the first occurrence of an item, or -1 when it is not in the list.
     *
     * Example: [10, 20, 30, 20, 40] finding 20 -> 1, finding 50 -> -1
     * @param inputs - The list and the item to look for
     * @returns The 0-based index, or -1
     * @group get
     * @shortname find index
     * @drawable false
     * @example
     * ```typescript
     * const where = bitbybit.lists.findIndex({ list: [10, 20, 30, 20, 40], item: 20 });
     * ```
     */
    findIndex<T>(inputs: Inputs.Lists.IncludesDto<T>): number {
        return inputs.list.indexOf(inputs.item);
    }

    /**
     * Measures how deeply lists are nested inside the list.
     *
     * Example: [1, 2, 3] -> 1, [[1, 2], [3, 4]] -> 2, [[[1]]] -> 3
     * @param inputs - The list
     * @returns The number of nesting levels
     * @group get
     * @shortname max list depth
     * @drawable false
     */
    getListDepth(inputs: Inputs.Lists.ListCloneDto<[]>): number {
        let levels = 0;
        let deeperLevelsExist = true;
        let flatRes = inputs.list;
        while (deeperLevelsExist) {
            let foundArray = false;
            for (let i = 0; i < flatRes.length; i++) {
                if (Array.isArray(flatRes[i])) {
                    foundArray = true;
                }
            }
            flatRes = flatRes.flat();
            if (foundArray) {
                levels++;
            } else {
                levels++;
                deeperLevelsExist = false;
            }
        }
        return levels;
    }

    /**
     * Counts the items in the list.
     *
     * Example: [10, 20, 30, 40, 50] -> 5, [] -> 0
     * @param inputs - The list
     * @returns The number of items
     * @group get
     * @shortname list length
     * @drawable false
     */
    listLength<T>(inputs: Inputs.Lists.ListCloneDto<T>): number {
        return inputs.list.length;
    }

    /**
     * Inserts an item at a position; the items from that position on shift up by one.
     *
     * Example: [10, 20, 30, 40] with 99 at index 2 -> [10, 20, 99, 30, 40]
     * @param inputs - The list, the item, the index and whether to copy
     * @returns The list with the item inserted
     * @group add
     * @shortname add item
     * @drawable false
     * @example
     * ```typescript
     * const longer = bitbybit.lists.addItemAtIndex({ list: [10, 20, 30, 40], item: 99, index: 2, clone: true });
     * ```
     */
    addItemAtIndex<T>(inputs: Inputs.Lists.AddItemAtIndexDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        if (inputs.index >= 0 && inputs.index <= res.length) {
            res.splice(inputs.index, 0, inputs.item);
        }
        return res;
    }

    /**
     * Inserts the same item at several positions of the original list.
     *
     * Example: [10, 20, 30] with 99 at indexes [0, 2] -> [99, 10, 20, 99, 30]
     * @param inputs - The list, the item, the indexes and whether to copy
     * @returns The list with the item inserted at each index
     * @group add
     * @shortname add item at indexes
     * @drawable false
     * @example
     * ```typescript
     * const marked = bitbybit.lists.addItemAtIndexes({ list: [10, 20, 30], item: 99, indexes: [0, 2], clone: true });
     * ```
     */
    addItemAtIndexes<T>(inputs: Inputs.Lists.AddItemAtIndexesDto<T>): T[] {
        let cloned = inputs.list;
        if (inputs.clone) {
            cloned = structuredClone(inputs.list);
        }
        let cloneIndexes = [...inputs.indexes];
        cloneIndexes = cloneIndexes.filter(index => index >= 0 && index <= cloned.length);
        cloneIndexes.sort((a, b) => a - b);
        cloneIndexes.forEach((index, i) => {
            if (index >= 0 && index + i <= cloned.length) {
                cloned.splice(index + i, 0, inputs.item);
            }
        }
        );
        return cloned;
    }

    /**
     * Inserts several items, the first at the first index, the second at the second, and so on, all
     * counted on the original list.
     *
     * The indexes must be in ascending order and there must be one per item, or an error is thrown.
     * Example: [10, 20, 30] with items [88, 99] at indexes [1, 2] -> [10, 88, 20, 99, 30]
     * @param inputs - The list, the items, one index per item and whether to copy
     * @returns The list with the items inserted
     * @group add
     * @shortname add items
     * @drawable false
     * @example
     * ```typescript
     * const merged = bitbybit.lists.addItemsAtIndexes({ list: [10, 20, 30], items: [88, 99], indexes: [1, 2], clone: true });
     * ```
     */
    addItemsAtIndexes<T>(inputs: Inputs.Lists.AddItemsAtIndexesDto<T>): T[] {
        if (inputs.items.length !== inputs.indexes.length) {
            throw new Error("Items and indexes must have the same length");
        }
        for (let i = 0; i < inputs.indexes.length; i++) {
            if (i > 0) {
                const prev = inputs.indexes[i - 1]!;
                if (prev > inputs.indexes[i]!) {
                    throw new Error("Indexes must be in ascending order");
                }
            }
        }
        let cloned = inputs.list;
        if (inputs.clone) {
            cloned = structuredClone(inputs.list);
        }
        const cloneIndexes = [...inputs.indexes];
        cloneIndexes.forEach((index, i) => {
            if (index >= 0 && index + i <= cloned.length) {
                cloned.splice(index + i, 0, inputs.items[i]!);
            }
        });
        return cloned;
    }

    /**
     * Removes the item at a position.
     *
     * Example: [10, 20, 30, 40, 50] removing index 2 -> [10, 20, 40, 50]
     * @param inputs - The list, the index and whether to copy
     * @returns The list without that item
     * @group remove
     * @shortname remove item
     * @drawable false
     * @example
     * ```typescript
     * const shorter = bitbybit.lists.removeItemAtIndex({ list: [10, 20, 30, 40, 50], index: 2, clone: true });
     * ```
     */
    removeItemAtIndex<T>(inputs: Inputs.Lists.RemoveItemAtIndexDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        if (inputs.index >= 0 && inputs.index <= res.length) {
            res.splice(inputs.index, 1);
        }
        return res;
    }

    /**
     * Removes the first item.
     *
     * Example: [10, 20, 30, 40] -> [20, 30, 40]
     * @param inputs - The list and whether to copy it first
     * @returns The list without its first item
     * @group remove
     * @shortname remove first item
     * @drawable false
     */
    removeFirstItem<T>(inputs: Inputs.Lists.ListCloneDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        if (res.length > 0) {
            res.shift();
        }
        return res;
    }

    /**
     * Removes the last item.
     *
     * Example: [10, 20, 30, 40] -> [10, 20, 30]
     * @param inputs - The list and whether to copy it first
     * @returns The list without its last item
     * @group remove
     * @shortname remove last item
     * @drawable false
     */
    removeLastItem<T>(inputs: Inputs.Lists.ListCloneDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        if (res.length > 0) {
            res.pop();
        }
        return res;
    }

    /**
     * Removes an item counted from the end: index 0 is the last item, 1 the one before it.
     *
     * Example: [10, 20, 30, 40, 50] removing index 1 from the end -> [10, 20, 30, 50]
     * @param inputs - The list, the index from the end and whether to copy
     * @returns The list without that item
     * @group remove
     * @shortname remove item from end
     * @drawable false
     * @example
     * ```typescript
     * const shorter = bitbybit.lists.removeItemAtIndexFromEnd({ list: [10, 20, 30, 40, 50], index: 1, clone: true });
     * ```
     */
    removeItemAtIndexFromEnd<T>(inputs: Inputs.Lists.RemoveItemAtIndexDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        if (inputs.index >= 0 && inputs.index < res.length) {
            const actualIndex = res.length - 1 - inputs.index;
            res.splice(actualIndex, 1);
        }
        return res;
    }

    /**
     * Removes the items at several positions, all counted on the original list.
     *
     * Example: [10, 20, 30, 40, 50] removing indexes [1, 3] -> [10, 30, 50]
     * @param inputs - The list, the indexes and whether to copy
     * @returns The list without those items
     * @group remove
     * @shortname remove items
     * @drawable false
     * @example
     * ```typescript
     * const kept = bitbybit.lists.removeItemsAtIndexes({ list: [10, 20, 30, 40, 50], indexes: [1, 3], clone: true });
     * ```
     */
    removeItemsAtIndexes<T>(inputs: Inputs.Lists.RemoveItemsAtIndexesDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        const cloneIndexes = [...inputs.indexes];
        cloneIndexes.sort((a, b) => b - a);
        cloneIndexes.forEach(index => {
            if (index >= 0 && index < res.length) {
                res.splice(index, 1);
            }
        });
        return res;
    }

    /**
     * Empties the list it is given, in place: the same array comes back with no items in it.
     *
     * Example: [10, 20, 30, 40] -> []
     * @param inputs - The list to empty
     * @returns The same list, now empty
     * @group remove
     * @shortname remove all items
     * @drawable false
     */
    removeAllItems<T>(inputs: Inputs.Lists.ListDto<T>): T[] {
        inputs.list.length = 0;
        return inputs.list;
    }

    /**
     * Removes every nth item, starting from an offset.
     *
     * Example: [0, 1, 2, 3, 4, 5, 6, 7, 8] with nth 3 and offset 0 -> [1, 2, 4, 5, 7, 8]
     * @param inputs - The list, the step, the offset to start from and whether to copy
     * @returns The list without every nth item
     * @group remove
     * @shortname every n-th
     * @drawable false
     * @example
     * ```typescript
     * const thinned = bitbybit.lists.removeNthItem({ list: [0, 1, 2, 3, 4, 5, 6, 7, 8], nth: 3, offset: 0, clone: true });
     * ```
     */
    removeNthItem<T>(inputs: Inputs.Lists.RemoveNthItemDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        const result = [];
        for (let i = 0; i < res.length; i++) {
            if ((i + inputs.offset) % inputs.nth !== 0) {
                result.push(res[i]!);
            }
        }
        return result;
    }

    /**
     * Drops each item of the list with a given probability and keeps the rest, so the result
     * differs on every call.
     *
     * Example: [1, 2, 3, 4, 5] with threshold 0.5 -> perhaps [2, 4]
     * @param inputs - The list, the probability of dropping an item from 0 to 1, and whether to copy
     * @returns The items that survived, in their original order
     * @group remove
     * @shortname random remove threshold
     * @drawable false
     * @example
     * ```typescript
     * const some = bitbybit.lists.randomRemoveThreshold({ list: [1, 2, 3, 4, 5], threshold: 0.5, clone: true });
     * ```
     */
    randomRemoveThreshold<T>(inputs: Inputs.Lists.RandomThresholdDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        const newList = [];
        for (let i = 0; i < inputs.list.length; i++) {
            if (Math.random() > inputs.threshold) {
                newList.push(res[i]!);
            }
        }
        return newList;
    }

    /**
     * Removes repeated numbers, keeping the first occurrence of each.
     *
     * Example: [1, 2, 3, 2, 4, 3, 5] -> [1, 2, 3, 4, 5]
     * @param inputs - The numbers and whether to copy
     * @returns The numbers without repeats, in their original order
     * @group remove
     * @shortname remove duplicate numbers
     * @drawable false
     */
    removeDuplicateNumbers(inputs: Inputs.Lists.RemoveDuplicatesDto<number>): number[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        return res.filter((value, index, self) => self.indexOf(value) === index);
    }

    /**
     * Removes numbers that are within a tolerance of one already kept, so values that differ only
     * by floating-point noise count as the same.
     *
     * Example: [1.0, 1.001, 2.0, 2.002, 3.0] with tolerance 0.01 -> [1.0, 2.0, 3.0]
     * @param inputs - The numbers, the tolerance and whether to copy
     * @returns The numbers without near-repeats, in their original order
     * @group remove
     * @shortname remove duplicates tol
     * @drawable false
     * @example
     * ```typescript
     * const distinct = bitbybit.lists.removeDuplicateNumbersTolerance({ list: [1.0, 1.001, 2.0], tolerance: 0.01, clone: true });
     * ```
     */
    removeDuplicateNumbersTolerance(inputs: Inputs.Lists.RemoveDuplicatesToleranceDto<number>): number[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        return res.filter((value, index, self) => self.findIndex(s => Math.abs(s - value) < inputs.tolerance) === index);
    }

    /**
     * Removes repeated items of any kind, keeping the first occurrence of each.
     *
     * Items are compared by identity, so two equal-looking objects both stay.
     * Example: ['a', 'b', 'c', 'a', 'd', 'b'] -> ['a', 'b', 'c', 'd']
     * @param inputs - The list and whether to copy
     * @returns The list without repeats, in its original order
     * @group remove
     * @shortname remove duplicates
     * @drawable false
     */
    removeDuplicates<T>(inputs: Inputs.Lists.RemoveDuplicatesDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        return res.filter((value, index, self) => self.indexOf(value) === index);
    }

    /**
     * Adds an item at the end of the list.
     *
     * Example: [10, 20, 30] adding 40 -> [10, 20, 30, 40]
     * @param inputs - The list, the item and whether to copy
     * @returns The list with the item at its end
     * @group add
     * @shortname add item to list
     * @drawable false
     * @example
     * ```typescript
     * const longer = bitbybit.lists.addItem({ list: [10, 20, 30], item: 40, clone: true });
     * ```
     */
    addItem<T>(inputs: Inputs.Lists.AddItemDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        res.push(inputs.item);
        return res;
    }

    /**
     * Adds an item at the start of the list.
     *
     * Example: [10, 20, 30] prepending 5 -> [5, 10, 20, 30]
     * @param inputs - The list, the item and whether to copy
     * @returns The list with the item at its start
     * @group add
     * @shortname prepend item to list
     * @drawable false
     * @example
     * ```typescript
     * const longer = bitbybit.lists.prependItem({ list: [10, 20, 30], item: 5, clone: true });
     * ```
     */
    prependItem<T>(inputs: Inputs.Lists.AddItemDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        res.unshift(inputs.item);
        return res;
    }

    /**
     * Adds an item at the start or at the end of the list, as chosen.
     *
     * Example: [10, 20, 30] adding 5 first -> [5, 10, 20, 30]; last -> [10, 20, 30, 5]
     * @param inputs - The list, the item, the position and whether to copy
     * @returns The list with the item added
     * @group add
     * @shortname item at first or last
     * @drawable false
     * @example
     * ```typescript
     * const longer = bitbybit.lists.addItemFirstLast({ list: [10, 20, 30], item: 5, position: Bit.Inputs.Lists.firstLastEnum.first, clone: true });
     * ```
     */
    addItemFirstLast<T>(inputs: Inputs.Lists.AddItemFirstLastDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        if (inputs.position === Inputs.Lists.firstLastEnum.first) {
            res.unshift(inputs.item);
        } else {
            res.push(inputs.item);
        }
        return res;
    }

    /**
     * Joins several lists into one, end to end.
     *
     * Example: [[1, 2], [3, 4], [5, 6]] -> [1, 2, 3, 4, 5, 6]
     * @param inputs - The lists to join and whether to copy
     * @returns One list with all the items
     * @group add
     * @shortname concatenate lists
     * @drawable false
     * @example
     * ```typescript
     * const all = bitbybit.lists.concatenate({ lists: [[1, 2], [3, 4], [5, 6]], clone: true });
     * ```
     */
    concatenate<T>(inputs: Inputs.Lists.ConcatenateDto<T>): T[] {
        let result: T[] = [];
        if (inputs.clone) {
            inputs.lists.forEach(list => {
                result = result.concat(structuredClone(list));
            });
        } else {
            inputs.lists.forEach(list => {
                result = result.concat(list);
            });
        }
        return result;
    }

    /**
     * Makes a new list with nothing in it.
     *
     * Example: -> []
     * @returns An empty list
     * @group create
     * @shortname empty list
     * @drawable false
     */
    createEmptyList(): [] {
        return [];
    }

    /**
     * Makes a list that holds the same item a number of times.
     *
     * Example: 5 three times -> [5, 5, 5]
     * @param inputs - The item and how many times to repeat it
     * @returns The list of repeats
     * @group create
     * @shortname repeat
     * @drawable false
     * @example
     * ```typescript
     * const fives = bitbybit.lists.repeat({ item: 5, times: 3 });
     * ```
     */
    repeat<T>(inputs: Inputs.Lists.MultiplyItemDto<T>): T[] {
        const result = [];
        for (let i = 0; i < inputs.times; i++) {
            result.push(inputs.item);
        }
        return result;
    }

    /**
     * Repeats a pattern of items over and over until the list reaches a given length.
     *
     * Example: [1, 2, 3] to length 7 -> [1, 2, 3, 1, 2, 3, 1]
     * @param inputs - The pattern, the length to reach and whether to copy
     * @returns The repeated pattern, cut to the length
     * @group create
     * @shortname repeat in pattern
     * @drawable false
     * @example
     * ```typescript
     * const cycle = bitbybit.lists.repeatInPattern({ list: [1, 2, 3], lengthLimit: 7, clone: true });
     * ```
     */
    repeatInPattern<T>(inputs: Inputs.Lists.RepeatInPatternDto<T>): T[] {
        let inpList = inputs.list;
        if (inputs.clone) {
            inpList = structuredClone(inputs.list);
        }
        const res = [];
        let counter = 0;
        let index = 0;
        while (counter < inputs.lengthLimit) {
            res.push(inpList[index]!);
            index++;
            if (index === inpList.length) {
                index = 0;
            }
            counter++;
        }
        return res;
    }

    /**
     * Sorts numbers from lowest to highest, or from highest to lowest.
     *
     * Example: [5, 2, 8, 1, 9] ascending -> [1, 2, 5, 8, 9]; descending -> [9, 8, 5, 2, 1]
     * @param inputs - The numbers, the direction and whether to copy
     * @returns The sorted numbers
     * @group sorting
     * @shortname sort numbers
     * @drawable false
     * @example
     * ```typescript
     * const sorted = bitbybit.lists.sortNumber({ list: [5, 2, 8, 1, 9], orderAsc: true, clone: true });
     * ```
     */
    sortNumber(inputs: Inputs.Lists.SortDto<number>): number[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        if (inputs.orderAsc) {
            return res.sort((a, b) => a - b);
        } else {
            return res.sort((a, b) => b - a);
        }
    }

    /**
     * Sorts texts alphabetically, from A to Z or from Z to A.
     *
     * Example: ['dog', 'apple', 'cat'] ascending -> ['apple', 'cat', 'dog']
     * @param inputs - The texts, the direction and whether to copy
     * @returns The sorted texts
     * @group sorting
     * @shortname sort texts
     * @drawable false
     * @example
     * ```typescript
     * const sorted = bitbybit.lists.sortTexts({ list: ["dog", "apple", "cat"], orderAsc: true, clone: true });
     * ```
     */
    sortTexts(inputs: Inputs.Lists.SortDto<string>): string[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        if (inputs.orderAsc) {
            return res.sort();
        } else {
            return res.sort().reverse();
        }
    }

    /**
     * Sorts objects by the number held in one of their properties.
     *
     * Example: [{age: 30}, {age: 20}, {age: 25}] by 'age' ascending -> [{age: 20}, {age: 25}, {age:
     * 30}]
     * @param inputs - The objects, the property to sort by, the direction and whether to copy
     * @returns The sorted objects
     * @group sorting
     * @shortname sort json objects
     * @drawable false
     * @example
     * ```typescript
     * const byAge = bitbybit.lists.sortByPropValue({ list: [{ age: 30 }, { age: 20 }], property: "age", orderAsc: true, clone: true });
     * ```
     */
    sortByPropValue(inputs: Inputs.Lists.SortJsonDto<any>): any[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        if (inputs.orderAsc) {
            return res.sort((a, b) => a[inputs.property] - b[inputs.property]);
        } else {
            return res.sort((a, b) => b[inputs.property] - a[inputs.property]);
        }
    }

    /**
     * Weaves several lists into one by taking the first item of each in turn, then the second of
     * each, and so on.
     *
     * A shorter list simply drops out once it runs dry. An empty list of lists throws an error.
     * Example: [[0, 1, 2], [3, 4, 5]] -> [0, 3, 1, 4, 2, 5]
     * @param inputs - The lists to weave together and whether to copy
     * @returns One list with the items alternating
     * @group transform
     * @shortname interleave lists
     * @drawable false
     * @example
     * ```typescript
     * const woven = bitbybit.lists.interleave({ lists: [[0, 1, 2], [3, 4, 5]], clone: true });
     * ```
     */
    interleave<T>(inputs: Inputs.Lists.InterleaveDto<T>): T[] {
        const lists = inputs.clone ? structuredClone(inputs.lists) : inputs.lists;
        
        if (!lists || lists.length === 0) {
            throw new Error("Lists array is empty or does not exist");
        }
        
        const result: T[] = [];
        const maxLength = Math.max(...lists.map(list => list.length));
        
        for (let i = 0; i < maxLength; i++) {
            for (const list of lists) {
                if (i < list.length) {
                    result.push(list[i]!);
                }
            }
        }
        
        return result;
    }

}
