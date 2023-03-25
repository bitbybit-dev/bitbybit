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
     * @link https://docs.bitbybit.dev/classes/bitbybit_lists.Lists.html#getItem
     * @param inputs a list and an index
     * @returns item
     * @group get
     * @shortname item by index
     * @drawable false
     */
    getItem(inputs: Inputs.Lists.ListItemDto): any {
        return structuredClone(inputs.list[inputs.index]);
    }

    /**
       * Gets a sub list between start and end indexes
       * @link https://docs.bitbybit.dev/classes/bitbybit_lists.Lists.html#getSubList
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
     * @link https://docs.bitbybit.dev/classes/bitbybit_lists.Lists.html#reverse
     * @param inputs a list and an index
     * @returns item
     * @group get
     * @shortname reverse
     * @drawable false
     */
    reverse(inputs: Inputs.Lists.ListDto): any {
        const cloned = structuredClone(inputs.list);
        return cloned.reverse();
    }

    /**
     * Add item to the list
     * @link https://docs.bitbybit.dev/classes/bitbybit_lists.Lists.html#addItemToListAtIndex
     * @param inputs a list, item and an index
     * @returns list with added item
     * @group add
     * @shortname item at index
     * @drawable false
     */
    addItemToListAtIndex(inputs: Inputs.Lists.AddItemToListAtIndexDto): any {
        const cloned = structuredClone(inputs.list);
        if (inputs.index < 0 || inputs.index > cloned.length) {
            throw new Error('Index out of range');
        } else {
            cloned.splice(inputs.index, 0, inputs.item);
        }
        return cloned;
    }

    /**
     * Add item to the beginning or the end of the list
     * @link https://docs.bitbybit.dev/classes/bitbybit_lists.Lists.html#addItemToListFirstLast
     * @param inputs a list, item and an option for first or last position
     * @returns list with added item
     * @group add
     * @shortname item at first or last
     * @drawable false
     */
    addItemToListFirstLast(inputs: Inputs.Lists.AddItemToListFirstLastDto): any {
        const cloned = structuredClone(inputs.list);
        if (inputs.position === Inputs.Lists.FirstLastEnum.first) {
            cloned.unshift(inputs.item);
        } else {
            cloned.push(inputs.item);
        }
        return cloned;
    }

    /**
     * Gets the length of the list
     * @link https://docs.bitbybit.dev/classes/bitbybit_lists.Lists.html#listLength
     * @param inputs a length list
     * @returns a number
     * @group get
     * @shortname list length
     * @drawable false
     */
    listLength(inputs: Inputs.Lists.ListDto): number {
        return inputs.list.length
    }

}
