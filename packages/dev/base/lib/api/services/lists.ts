import * as Inputs from "../inputs";

/**
 * Contains various list methods.
 * <div>
 *  <img src="../assets/images/blockly-images/math/math.svg" alt="Blockly Image"/>
 * </div>
 */
export class Lists {
    /**
     * Gets an item from the list at a specific position using zero-based indexing.
     * Example: From [10, 20, 30, 40], getting index 2 returns 30
     * @param inputs a list and an index
     * @returns item
     * @group get
     * @shortname item by index
     * @drawable false
     */
    getItem<T>(inputs: Inputs.Lists.ListItemDto<T>): T {
        if (inputs.index < 0 || inputs.index >= inputs.list.length) {
            throw new Error("Index out of bounds");
        }
        let result;
        if (inputs.clone) {
            result = structuredClone(inputs.list[inputs.index]);
        } else {
            result = inputs.list[inputs.index];
        }
        return result;
    }

    /**
     * Gets the first item from the list.
     * Example: From [10, 20, 30, 40], returns 10
     * @param inputs a list
     * @returns first item
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
            result = structuredClone(inputs.list[0]);
        } else {
            result = inputs.list[0];
        }
        return result;
    }

    /**
     * Gets the last item from the list.
     * Example: From [10, 20, 30, 40], returns 40
     * @param inputs a list
     * @returns last item
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
            result = structuredClone(inputs.list[inputs.list.length - 1]);
        } else {
            result = inputs.list[inputs.list.length - 1];
        }
        return result;
    }


    /**
     * Randomly keeps items from the list based on a probability threshold (0 to 1).
     * Example: From [1, 2, 3, 4, 5] with threshold 0.5, might return [1, 3, 5] (50% chance for each item)
     * @param inputs a list and a threshold for randomization of items to remove
     * @returns list with remaining items
     * @group get
     * @shortname random get threshold
     * @drawable false
     */
    randomGetThreshold<T>(inputs: Inputs.Lists.RandomThresholdDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        const newList = [];
        for (let i = 0; i < inputs.list.length; i++) {
            if (Math.random() < inputs.threshold) {
                newList.push(res[i]);
            }
        }
        return newList;
    }

    /**
       * Extracts a portion of the list between start and end positions (end is exclusive).
       * Example: From [10, 20, 30, 40, 50] with start=1 and end=4, returns [20, 30, 40]
       * @param inputs a list and start and end indexes
       * @returns sub list
       * @group get
       * @shortname sublist
       * @drawable false
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
     * Gets every nth item from the list, starting from an optional offset position.
     * Example: From [0, 1, 2, 3, 4, 5, 6, 7, 8] with nth=3 and offset=0, returns [0, 3, 6]
     * Example: From [0, 1, 2, 3, 4, 5, 6, 7, 8] with nth=2 and offset=1, returns [1, 3, 5, 7]
     * @param inputs a list and index
     * @returns list with filtered items
     * @group get
     * @shortname every n-th
     * @drawable false
     */
    getNthItem<T>(inputs: Inputs.Lists.GetNthItemDto<T>): T[] {
        let cloned = inputs.list;
        if (inputs.clone) {
            cloned = structuredClone(inputs.list);
        }
        const result = [];
        for (let i = 0; i < cloned.length; i++) {
            if ((i + inputs.offset) % inputs.nth === 0) {
                result.push(cloned[i]);
            }
        }
        return result;
    }
    /**
     * Filters items from the list using a repeating true/false pattern.
     * Example: From [0, 1, 2, 3, 4, 5] with pattern [true, true, false], returns [0, 1, 3, 4] (keeps items where pattern is true)
     * @param inputs a list and index
     * @returns list with filtered items
     * @group get
     * @shortname by pattern
     * @drawable false
     */
    getByPattern<T>(inputs: Inputs.Lists.GetByPatternDto<T>): T[] {
        const { list, pattern } = inputs;
        if (!pattern || pattern.length === 0) {
            throw new Error("Pattern is empty or does not exist");
        }
        const patternLength = pattern.length;
        const listLength = list.length;
        const result = [];
        if (patternLength >= listLength) {
            list.forEach((item, index) => {
                if (pattern[index] === true) {
                    result.push(item);
                }
            });
        }
        else {
            const repeatedPattern = [];
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
     * Merges elements from multiple lists at a specific nesting level, grouping elements by position.
     * Example: From [[0, 1, 2], [3, 4, 5]] at level 0, returns [[0, 3], [1, 4], [2, 5]]
     * @param inputs lists, level and flatten data
     * @returns list with merged lists and flattened lists
     * @group get
     * @shortname merge levels
     * @drawable false
     */
    mergeElementsOfLists<T>(inputs: Inputs.Lists.MergeElementsOfLists<T[]>): T[] {
        const lists = inputs.lists;
        const level = inputs.level;

        const elToMerge = [];
        const result = [];
        lists.forEach(list => {
            // flatten to certain level;
            const elementsToMerge = list.flat(level);
            elToMerge.push(elementsToMerge);
        });

        const lengthMerge = this.getLongestListLength({ lists: elToMerge });
        for (let i = 0; i < lengthMerge; i++) {
            const temp = [];
            for (let j = 0; j < elToMerge.length; j++) {
                const element = elToMerge[j][i];
                if (element !== undefined) {
                    temp.push(element);
                }
            }
            if (temp.length > 0) {
                result.push(temp);
            }
        }

        let final = [];
        if (level > 0) {
            for (let i = 0; i < level; i++) {
                if (i === level - 1 && i !== 0) {
                    final[i - 1].push(result);
                } else if (i === level - 1) {
                    final.push(result);
                } else {
                    final.push([]);
                }
            }
        } else {
            final = result;
        }
        return final;
    }

    /**
     * Finds the length of the longest list among multiple lists.
     * Example: From [[1, 2], [3, 4, 5, 6], [7]], returns 4 (length of [3, 4, 5, 6])
     * @param inputs a list of lists
     * @returns number of max length
     * @group get
     * @shortname longest list length
     * @drawable false
     */
    getLongestListLength<T>(inputs: Inputs.Lists.GetLongestListLength<T[]>): number {
        let longestSoFar = 0;
        if (inputs.lists) {

            inputs.lists.forEach(l => {
                if (l.length > longestSoFar) {
                    longestSoFar = l.length;
                }
            });
            return longestSoFar;
        } else {
            return undefined;
        }
    }

    /**
     * Reverses the order of items in the list.
     * Example: From [1, 2, 3, 4, 5], returns [5, 4, 3, 2, 1]
     * @param inputs a list and an index
     * @returns item
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
     * Randomly rearranges all items in the list (using Fisher-Yates algorithm).
     * Example: From [1, 2, 3, 4, 5], might return [3, 1, 5, 2, 4] (order varies each time)
     * @param inputs a list
     * @returns shuffled list
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
            [res[i], res[j]] = [res[j], res[i]];
        }
        return res;
    }

    /**
     * Transposes a 2D list by swapping rows and columns (all sublists must be equal length).
     * Example: From [[0, 1, 2], [3, 4, 5]], returns [[0, 3], [1, 4], [2, 5]]
     * @param inputs a list of lists to flip
     * @returns item
     * @group edit
     * @shortname flip lists
     * @drawable false
     */
    flipLists<T>(inputs: Inputs.Lists.ListCloneDto<T[]>): T[][] {
        if (inputs.list.length > 0) {
            const lengthOfFirstList = inputs.list[0].length;
            let allListsSameLength = true;
            inputs.list.forEach(l => {
                if (l.length !== lengthOfFirstList) {
                    allListsSameLength = false;
                }
            });
            if (allListsSameLength) {
                const result = [];
                for (let i = 0; i < lengthOfFirstList; i++) {
                    const newList = [];
                    inputs.list.forEach(l => {
                        newList.push(l[i]);
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
     * Splits the list into smaller lists of n elements each.
     * Example: From [0, 1, 2, 3, 4, 5, 6, 7, 8] with n=3, returns [[0, 1, 2], [3, 4, 5], [6, 7, 8]]
     * Example: From [0, 1, 2, 3, 4] with n=2 and keepRemainder=true, returns [[0, 1], [2, 3], [4]]
     * @param inputs a list
     * @returns items grouped in lists of n elements
     * @group edit
     * @shortname group elements
     * @drawable false
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
     * Checks whether the list contains a specific item.
     * Example: List [10, 20, 30, 40] with item 30 returns true, with item 50 returns false
     * @param inputs a list and an item
     * @returns true if item is in list
     * @group get
     * @shortname contains item
     * @drawable false
     */
    includes<T>(inputs: Inputs.Lists.IncludesDto<T>): boolean {
        return inputs.list.includes(inputs.item);
    }

    /**
     * Finds the position (index) of the first occurrence of an item in the list.
     * Example: In [10, 20, 30, 20, 40], finding 20 returns 1 (first occurrence), finding 50 returns -1 (not found)
     * @param inputs a list and an item
     * @returns index of the item or -1 if not found
     * @group get
     * @shortname find index
     * @drawable false
     */
    findIndex<T>(inputs: Inputs.Lists.IncludesDto<T>): number {
        return inputs.list.indexOf(inputs.item);
    }

    /**
     * Determines the maximum nesting level (depth) of a list structure.
     * Example: [1, 2, 3] has depth 1, [[1, 2], [3, 4]] has depth 2, [[[1]]] has depth 3
     * @param inputs a list
     * @returns number of depth
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
     * Returns the number of items in the list.
     * Example: [10, 20, 30, 40, 50] returns 5, [] returns 0
     * @param inputs a length list
     * @returns a number
     * @group get
     * @shortname list length
     * @drawable false
     */
    listLength<T>(inputs: Inputs.Lists.ListCloneDto<T>): number {
        return inputs.list.length;
    }

    /**
     * Inserts an item at a specific position in the list.
     * Example: In [10, 20, 30, 40], adding 99 at index 2 gives [10, 20, 99, 30, 40]
     * @param inputs a list, item and an index
     * @returns list with added item
     * @group add
     * @shortname add item
     * @drawable false
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
     * Inserts the same item at multiple specified positions in the list.
     * Example: In [10, 20, 30], adding 99 at indexes [0, 2] gives [99, 10, 20, 99, 30]
     * @param inputs a list, item and an indexes
     * @returns list with added item
     * @group add
     * @shortname add item at indexes
     * @drawable false
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
     * Inserts multiple items at corresponding positions (first item at first index, second item at second index, etc.).
     * Example: In [10, 20, 30], adding items [88, 99] at indexes [1, 2] gives [10, 88, 20, 99, 30]
     * @param inputs a list, items and an indexes
     * @returns list with added items
     * @group add
     * @shortname add items
     * @drawable false
     */
    addItemsAtIndexes<T>(inputs: Inputs.Lists.AddItemsAtIndexesDto<T>): T[] {
        if (inputs.items.length !== inputs.indexes.length) {
            throw new Error("Items and indexes must have the same length");
        }
        for (let i = 0; i < inputs.indexes.length; i++) {
            if (i > 0) {
                const prev = inputs.indexes[i - 1];
                if (prev > inputs.indexes[i]) {
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
                cloned.splice(index + i, 0, inputs.items[i]);
            }
        });
        return cloned;
    }

    /**
     * Removes the item at a specific position in the list.
     * Example: From [10, 20, 30, 40, 50], removing index 2 gives [10, 20, 40, 50]
     * @param inputs a list and index
     * @returns list with removed item
     * @group remove
     * @shortname remove item
     * @drawable false
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
     * Removes the first item from the list.
     * Example: From [10, 20, 30, 40], returns [20, 30, 40]
     * @param inputs a list
     * @returns list with first item removed
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
     * Removes the last item from the list.
     * Example: From [10, 20, 30, 40], returns [10, 20, 30]
     * @param inputs a list
     * @returns list with last item removed
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
     * Removes an item counting from the end of the list (index 0 = last item, 1 = second-to-last, etc.).
     * Example: From [10, 20, 30, 40, 50], removing index 1 from end gives [10, 20, 30, 50] (removes 40)
     * @param inputs a list and index from end
     * @returns list with removed item
     * @group remove
     * @shortname remove item from end
     * @drawable false
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
     * Removes items at multiple specified positions from the list.
     * Example: From [10, 20, 30, 40, 50], removing indexes [1, 3] gives [10, 30, 50]
     * @param inputs a list and indexes
     * @returns list with removed items
     * @group remove
     * @shortname remove items
     * @drawable false
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
     * Clears all items from the list, resulting in an empty list.
     * Example: From [10, 20, 30, 40], returns []
     * @param inputs a list
     * @returns The length is set to 0 and same array memory object is returned
     * @group remove
     * @shortname remove all items
     * @drawable false
     */
    removeAllItems<T>(inputs: Inputs.Lists.ListDto<T>): T[] {
        inputs.list.length = 0;
        return inputs.list;
    }

    /**
     * Removes every nth item from the list, starting from an optional offset position.
     * Example: From [0, 1, 2, 3, 4, 5, 6, 7, 8] with nth=3 and offset=0, returns [1, 2, 4, 5, 7, 8] (removes 0, 3, 6)
     * @param inputs a list and index
     * @returns list with removed item
     * @group remove
     * @shortname every n-th
     * @drawable false
     */
    removeNthItem<T>(inputs: Inputs.Lists.RemoveNthItemDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        const result = [];
        for (let i = 0; i < res.length; i++) {
            if ((i + inputs.offset) % inputs.nth !== 0) {
                result.push(res[i]);
            }
        }
        return result;
    }

    /**
     * Randomly removes items from the list based on a probability threshold (0 to 1).
     * Example: From [1, 2, 3, 4, 5] with threshold 0.5, might return [2, 4] (50% chance to remove each item)
     * @param inputs a list and a threshold for randomization of items to remove
     * @returns list with removed items
     * @group remove
     * @shortname random remove threshold
     * @drawable false
     */
    randomRemoveThreshold<T>(inputs: Inputs.Lists.RandomThresholdDto<T>): T[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        const newList = [];
        for (let i = 0; i < inputs.list.length; i++) {
            if (Math.random() > inputs.threshold) {
                newList.push(res[i]);
            }
        }
        return newList;
    }

    /**
     * Removes duplicate numbers from the list, keeping only the first occurrence of each value.
     * Example: From [1, 2, 3, 2, 4, 3, 5], returns [1, 2, 3, 4, 5]
     * @param inputs a list of numbers
     * @returns list with unique numbers
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
     * Removes duplicate numbers that are within a specified tolerance range of each other.
     * Example: From [1.0, 1.001, 2.0, 2.002, 3.0] with tolerance 0.01, returns [1.0, 2.0, 3.0]
     * @param inputs a list of numbers and the tolerance
     * @returns list with unique numbers
     * @group remove
     * @shortname remove duplicates tol
     * @drawable false
     */
    removeDuplicateNumbersTolerance(inputs: Inputs.Lists.RemoveDuplicatesToleranceDto<number>): number[] {
        let res = inputs.list;
        if (inputs.clone) {
            res = structuredClone(inputs.list);
        }
        return res.filter((value, index, self) => self.findIndex(s => Math.abs(s - value) < inputs.tolerance) === index);
    }

    /**
     * Removes duplicate items from the list using strict equality comparison (works with any type).
     * Example: From ['a', 'b', 'c', 'a', 'd', 'b'], returns ['a', 'b', 'c', 'd']
     * @param inputs a list
     * @returns list with unique items
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
     * Appends an item to the end of the list.
     * Example: To [10, 20, 30], adding 40 gives [10, 20, 30, 40]
     * @param inputs a list and an item
     * @returns list with added item
     * @group add
     * @shortname add item to list
     * @drawable false
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
     * Adds an item to the beginning of the list.
     * Example: To [10, 20, 30], prepending 5 gives [5, 10, 20, 30]
     * @param inputs a list and an item
     * @returns list with added item
     * @group add
     * @shortname prepend item to list
     * @drawable false
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
     * Adds an item either at the beginning or end of the list based on the position parameter.
     * Example: To [10, 20, 30], adding 5 at 'first' gives [5, 10, 20, 30], at 'last' gives [10, 20, 30, 5]
     * @param inputs a list, item and an option for first or last position
     * @returns list with added item
     * @group add
     * @shortname item at first or last
     * @drawable false
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
     * Combines multiple lists into a single list by joining them end-to-end.
     * Example: From [[1, 2], [3, 4], [5, 6]], returns [1, 2, 3, 4, 5, 6]
     * @param inputs lists to concatenate
     * @returns concatenated list
     * @group add
     * @shortname concatenate lists
     * @drawable false
     */
    concatenate<T>(inputs: Inputs.Lists.ConcatenateDto<T>): T[] {
        let result = [];
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
     * Creates a new empty list with no items.
     * Example: Returns []
     * @returns an empty array list
     * @group create
     * @shortname empty list
     * @drawable false
     */
    createEmptyList(): [] {
        return [];
    }

    /**
     * Creates a new list by repeating an item a specified number of times.
     * Example: Repeating 5 three times returns [5, 5, 5]
     * @param inputs an item to multiply
     * @returns list
     * @group create
     * @shortname repeat
     * @drawable false
     */
    repeat<T>(inputs: Inputs.Lists.MultiplyItemDto<T>): T[] {
        const result = [];
        for (let i = 0; i < inputs.times; i++) {
            result.push(inputs.item);
        }
        return result;
    }

    /**
     * Repeats a pattern of items cyclically until reaching a target list length.
     * Example: Pattern [1, 2, 3] with length 7 returns [1, 2, 3, 1, 2, 3, 1]
     * @param inputs a list to multiply and a length limit
     * @returns list
     * @group create
     * @shortname repeat in pattern
     * @drawable false
     */
    repeatInPattern<T>(inputs: Inputs.Lists.RepeatInPatternDto<T>): T[] {
        // will repeat the items provided in the patten till the certain length of the list is reached
        let inpList = inputs.list;
        if (inputs.clone) {
            inpList = structuredClone(inputs.list);
        }
        const res = [];
        let counter = 0;
        let index = 0;
        while (counter < inputs.lengthLimit) {
            res.push(inpList[index]);
            index++;
            if (index === inpList.length) {
                index = 0;
            }
            counter++;
        }
        return res;
    }

    /**
     * Sorts numbers in ascending (lowest to highest) or descending (highest to lowest) order.
     * Example: [5, 2, 8, 1, 9] ascending returns [1, 2, 5, 8, 9], descending returns [9, 8, 5, 2, 1]
     * @param inputs a list of numbers to sort and an option for ascending or descending order
     * @returns list
     * @group sorting
     * @shortname sort numbers
     * @drawable false
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
     * Sorts text strings alphabetically in ascending (A to Z) or descending (Z to A) order.
     * Example: ['dog', 'apple', 'cat', 'banana'] ascending returns ['apple', 'banana', 'cat', 'dog']
     * @param inputs a list of texts to sort and an option for ascending or descending order
     * @returns list
     * @group sorting
     * @shortname sort texts
     * @drawable false
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
     * Sorts objects by comparing numeric values of a specified property.
     * Example: [{age: 30}, {age: 20}, {age: 25}] sorted by 'age' ascending returns [{age: 20}, {age: 25}, {age: 30}]
     * @param inputs a list to sort, a property to sort by and an option for ascending or descending order
     * @returns list
     * @group sorting
     * @shortname sort json objects
     * @drawable false
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
     * Combines multiple lists by alternating elements from each list (first from list1, first from list2, second from list1, etc.).
     * Example: From [[0, 1, 2], [3, 4, 5]], returns [0, 3, 1, 4, 2, 5]
     * @param inputs Lists to interleave
     * @returns Flattened interleaved list
     * @group transform
     * @shortname interleave lists
     * @drawable false
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
                    result.push(list[i]);
                }
            }
        }
        
        return result;
    }

}
