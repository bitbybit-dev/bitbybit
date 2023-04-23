import * as Inputs from '../inputs/inputs';

/**
 * Contains various list methods.
 * <div>
 *  <img src="../assets/images/blockly-images/math/math.svg" alt="Blockly Image"/>
 * </div>
 */
export class Lists {

    constructor() { }
    /**
     * Gets an item from the list by using a 0 based index
     * @param inputs a list and an index
     * @returns item
     * @group get
     * @shortname item by index
     * @drawable false
     */
    getItem(inputs: Inputs.Lists.ListItemDto): any {
        if (inputs.index < 0 || inputs.index >= inputs.list.length) {
            throw new Error('Index out of bounds');
        }
        return structuredClone(inputs.list[inputs.index]);
    }

    /**
       * Gets a sub list between start and end indexes
       * @param inputs a list and start and end indexes
       * @returns sub list
       * @group get
       * @shortname sublist
       * @drawable false
       */
    getSubList(inputs: Inputs.Lists.SubListDto): any {
        return structuredClone(inputs.list.slice(inputs.indexStart, inputs.indexEnd));
    }

    /**
     * Gets nth item in the list
     * @param inputs a list and index
     * @returns list with removed item
     * @group get
     * @shortname every n-th
     * @drawable false
     */
    getNthItem(inputs: Inputs.Lists.GetNthItemDto): any {
        const cloned = structuredClone(inputs.list);
        let result = [];
        for (let i = 0; i < cloned.length; i++) {
            if ((i + inputs.offset) % inputs.nth === 0) {
                result.push(cloned[i]);
            }
        }
        return result;
    }
    /**
     * Gets elements by pattern
     * @param inputs a list and index
     * @returns list with removed item
     * @group get
     * @shortname by pattern
     * @drawable false
     */
    getByPattern(inputs: Inputs.Lists.GetByPatternDto): any {
        const { list, pattern } = inputs;
        if(!pattern || pattern.length === 0) {
            throw new Error('Pattern is empty or does not exist');
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
            let repeatedPattern = [];
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
     * Merge elements of lists on a given level and flatten output if needed
     * @param inputs lists, level and flatten data
     * @returns list with merged lists and flattened lists
     * @group get
     * @shortname merge levels
     * @drawable false
     */
    mergeElementsOfLists(inputs: Inputs.Lists.MergeElementsOfLists): any {
        let lists = inputs.lists;
        let level = inputs.level;
        let flattenLevels = inputs.flattenLevels;

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
        if (level > 0 && inputs.flattenLevels >= 0) {
            for (let i = 0; i < level; i++) {
                if (i === level - 1 && i !== 0) {
                    final[i - 1].push(result);
                } else if (i === level - 1) {
                    final.push(result);
                } else {
                    final.push([]);
                }
            }
            for (let j = 0; j < flattenLevels; j++) {
                final = final.flat();
            }
        } else {
            final = result;
            for (let j = 0; j < flattenLevels; j++) {
                final = final.flat();
            }
        }
        return final;
    }

    /**
     * Gets the longest list length from the list of lists
     * @param inputs a list of lists
     * @returns number of max length
     * @group get
     * @shortname longest list length
     * @drawable false
     */
    getLongestListLength(inputs: Inputs.Lists.GetLongestListLength): number {
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
     * Reverse the list
     * @param inputs a list and an index
     * @returns item
     * @group edit
     * @shortname reverse
     * @drawable false
     */
    reverse(inputs: Inputs.Lists.ListDto): any {
        const cloned = structuredClone(inputs.list);
        return cloned.reverse();
    }

    /**
     * Flip 2d lists - every nth element of each list will form a separate list
     * @param inputs a list of lists to flip
     * @returns item
     * @group edit
     * @shortname flip lists
     * @drawable false
     */
    flipLists(inputs: Inputs.Lists.ListDto): any {
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
                throw new Error('Lists are not of the same length');
            }
        } else {
            throw new Error('List is empty');
        }
    }

    /**
     * Group in lists of n elements
     * @param inputs a list
     * @returns items grouped in lists of n elements
     * @group edit
     * @shortname group elements
     * @drawable false
     */
    groupNth(inputs: Inputs.Lists.GroupListDto): any {
        const groupElements = (inputs: Inputs.Lists.GroupListDto) => {
            const { nrElements, list, keepRemainder } = inputs;
            const nrElementsInGroup = nrElements;
            const result = [];
            let currentGroup = [];
            list.forEach((item, index) => {
                currentGroup.push(item);
                if ((index + 1) % nrElementsInGroup === 0) {
                    result.push(currentGroup);
                    currentGroup = [];
                }
                if (keepRemainder && index === list.length - 1) {
                    result.push(currentGroup);
                }
            });
            return result;
        }
        // TODO make this work on any level
        return groupElements(inputs);
    }

    /**
     * Get the depth of the list
     * @param inputs a list
     * @returns number of depth
     * @group get
     * @shortname max list depth
     * @drawable false
     */
    getListDepth(inputs: Inputs.Lists.ListDto): number {
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
     * Gets the length of the list
     * @param inputs a length list
     * @returns a number
     * @group get
     * @shortname list length
     * @drawable false
     */
    listLength(inputs: Inputs.Lists.ListDto): number {
        return inputs.list.length
    }

    /**
     * Add item to the list
     * @param inputs a list, item and an index
     * @returns list with added item
     * @group add
     * @shortname item at index
     * @drawable false
     */
    addItemAtIndex(inputs: Inputs.Lists.AddItemAtIndexDto): any {
        const cloned = structuredClone(inputs.list);
        if (inputs.index >= 0 && inputs.index <= cloned.length) {
            cloned.splice(inputs.index, 0, inputs.item);
        }
        return cloned;
    }

    /**
     * Adds item to the list of provided indexes
     * @param inputs a list, item and an indexes
     * @returns list with added item
     * @group add
     * @shortname item at indexes
     * @drawable false
     */
    addItemAtIndexes(inputs: Inputs.Lists.AddItemAtIndexesDto): any {
        const cloned = structuredClone(inputs.list);
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
     * Adds items to the list of provided indexes matching 1:1, first item will go to first index provided, etc.
     * @param inputs a list, items and an indexes
     * @returns list with added items
     * @group add
     * @shortname items at indexes
     * @drawable false
     */
    addItemsAtIndexes(inputs: Inputs.Lists.AddItemsAtIndexesDto): any {
        if (inputs.items.length !== inputs.indexes.length) {
            throw new Error('Items and indexes must have the same length');
        }
        for (let i = 0; i < inputs.indexes.length; i++) {
            if (i > 0) {
                let prev = inputs.indexes[i - 1];
                if (prev > inputs.indexes[i]) {
                    throw new Error('Indexes must be in ascending order');
                }
            }
        }
        const cloned = structuredClone(inputs.list);
        let cloneIndexes = [...inputs.indexes];
        cloneIndexes.forEach((index, i) => {
            if (index >= 0 && index + i <= cloned.length) {
                cloned.splice(index + i, 0, inputs.items[i]);
            }
        });
        return cloned;
    }

    /**
     * Remove item from the list
     * @param inputs a list and index
     * @returns list with removed item
     * @group remove
     * @shortname item at index
     * @drawable false
     */
    removeItemAtIndex(inputs: Inputs.Lists.RemoveItemAtIndexDto): any {
        const cloned = structuredClone(inputs.list);
        if (inputs.index >= 0 && inputs.index <= cloned.length) {
            cloned.splice(inputs.index, 1);
        }
        return cloned;
    }

    /**
     * Remove item from the list
     * @param inputs a list and index
     * @returns list with removed item
     * @group remove
     * @shortname every n-th
     * @drawable false
     */
    removeNthItem(inputs: Inputs.Lists.RemoveNthItemDto): any {
        const cloned = structuredClone(inputs.list);
        let result = [];
        for (let i = 0; i < cloned.length; i++) {
            if ((i + inputs.offset) % inputs.nth !== 0) {
                result.push(cloned[i]);
            }
        }
        return result;
    }

    /**
     * Add item to the beginning or the end of the list
     * @param inputs a list, item and an option for first or last position
     * @returns list with added item
     * @group add
     * @shortname item at first or last
     * @drawable false
     */
    addItemFirstLast(inputs: Inputs.Lists.AddItemFirstLastDto): any {
        const cloned = structuredClone(inputs.list);
        if (inputs.position === Inputs.Lists.FirstLastEnum.first) {
            cloned.unshift(inputs.item);
        } else {
            cloned.push(inputs.item);
        }
        return cloned;
    }

    /**
     * Creates an empty list
     * @returns an empty array list
     * @group create
     * @shortname empty list
     * @drawable false
     */
    createEmptyList(): [] {
        return [];
    }

    /**
     * Repeat the item and add it in the new list
     * @param inputs an item to multiply
     * @returns list
     * @group create
     * @shortname repeat
     * @drawable false
     */
    repeat(inputs: Inputs.Lists.MultiplyItemDto): any {
        let result = [];
        for (let i = 0; i < inputs.times; i++) {
            result.push(inputs.item);
        }
        return result;
    }
}
