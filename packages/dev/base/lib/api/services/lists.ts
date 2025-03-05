import * as Inputs from "../inputs";

/**
 * Contains various list methods.
 * <div>
 *  <img src="../assets/images/blockly-images/math/math.svg" alt="Blockly Image"/>
 * </div>
 */
export class Lists {
    /**
     * Gets an item from the list by using a 0 based index
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
     * Gets items randomly by using a threshold
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
       * Gets a sub list between start and end indexes
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
     * Gets nth item in the list
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
     * Gets elements by pattern
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
     * Merge elements of lists on a given level and flatten output if needed
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
     * Gets the longest list length from the list of lists
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
     * Reverse the list
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
     * Flip 2d lists - every nth element of each list will form a separate list
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
     * Group in lists of n elements
     * @param inputs a list
     * @returns items grouped in lists of n elements
     * @group edit
     * @shortname group elements
     * @drawable false
     */
    groupNth<T>(inputs: Inputs.Lists.GroupListDto<T>): T[] {
        const groupElements = (inputs: Inputs.Lists.GroupListDto<T>) => {
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
        };
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
     * Gets the length of the list
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
     * Add item to the list
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
     * Adds item to the list of provided indexes
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
     * Adds items to the list of provided indexes matching 1:1, first item will go to first index provided, etc.
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
     * Remove item from the list
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
     * Remove items from the list of provided indexes
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
     * Remove all items from the list
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
     * Remove item from the list
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
     * Removes items randomly by using a threshold
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
     * remove duplicate numbers from the list
     * @param inputs a list of numbers
     * @returns list with unique numbers
     * @group remove
     * @shortname remove duplicates
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
     * remove duplicate numbers from the list with tolerance
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
     * Add item to the end of the list
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
     * Add item to the beginning of the list
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
     * Add item to the beginning or the end of the list
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
    repeat<T>(inputs: Inputs.Lists.MultiplyItemDto<T>): T[] {
        const result = [];
        for (let i = 0; i < inputs.times; i++) {
            result.push(inputs.item);
        }
        return result;
    }

    /**
     * Repeat the list items by adding them in the new list till the certain length of the list is reached
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
     * Sort the list of numbers in ascending or descending order
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
     * Sort the list of texts in ascending or descending order alphabetically
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
     * Sort by numeric JSON property value
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

}
