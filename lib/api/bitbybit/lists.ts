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
        const nrElementsInGroup = inputs.nrElements;
        const result = [];
        let currentGroup = [];
        inputs.list.forEach((item, index) => {
            currentGroup.push(item);
            if ((index + 1) % nrElementsInGroup === 0) {
                result.push(currentGroup);
                currentGroup = [];
            }
            if(inputs.keepRemainder && index === inputs.list.length - 1) {
                result.push(currentGroup);
            }
        });
        return result;
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
            if (i % inputs.nth !== 0) {
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
