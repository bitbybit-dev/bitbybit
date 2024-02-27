/* eslint-disable @typescript-eslint/no-namespace */


// tslint:disable-next-line: no-namespace
export namespace Lists {

    export enum firstLastEnum {
        first = "first",
        last = "last",
    }

    export class ListItemDto<T> {
        constructor(list?: T[], index?: number, clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (index !== undefined) { this.index = index; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to interrogate
         * @default undefined
         */
        list: T[];
        /**
         * Index of the item in the list - 0 means first.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        index = 0;
        /**
         * Tries to make structured clone of the incoming list data in the component, sometimes it may not be possible due to circular structures or other types of error
         * @default true
         */
        clone? = true;
    }
    export class SubListDto<T> {
        constructor(list?: T[], indexStart?: number, indexEnd?: number, clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (indexStart !== undefined) { this.indexStart = indexStart; }
            if (indexEnd !== undefined) { this.indexEnd = indexEnd; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to split into a sublist
         * @default undefined
         */
        list: T[];
        /**
         * Index from which to start the sublist - 0 means first.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        indexStart = 0;
        /**
         * Index to which to end the sublist - 0 means first.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        indexEnd = 1;
        /**
         * Tries to clone the data in the component, sometimes it may not be possible if structure is circular
         * @default true
         */
        clone? = true;
    }
    export class ListDto<T> {
        constructor(list?: T[], clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to interrogate
         * @default undefined
         */
        list: T[];
        /**
         * Tries to make structured clone of the incoming list data in the component, sometimes it may not be possible due to circular structures or other types of error
         * @default true
         */
        clone? = true;
    }
    export class GroupListDto<T> {
        constructor(list?: T[], nrElements?: number, keepRemainder?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (nrElements !== undefined) { this.nrElements = nrElements; }
            if (keepRemainder !== undefined) { this.keepRemainder = keepRemainder; }
        }
        /**
         * The list of elements to group together
         * @default undefined
         */
        list: T[];
        /**
         * The number of elements in each group
         * @default 2
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrElements = 2;
        /**
         * If true, the remainder of the list will be added as a separate group
         * @default false
         */
        keepRemainder = false;
    }
    export class MultiplyItemDto<T> {
        constructor(item?: T, times?: number) {
            if (item !== undefined) { this.item = item; }
            if (times !== undefined) { this.times = times; }
        }
        /**
         * The item to multiply
         * @default undefined
         */
        item: T;
        /**
         * Times to multiply
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        times: number;
    }
    export class AddItemAtIndexDto<T> {
        constructor(list?: T[], item?: T, index?: number, clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (item !== undefined) { this.item = item; }
            if (index !== undefined) { this.index = index; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to which item needs to be added
         * @default undefined
         */
        list: T[];
        /**
         * The item to add
         * @default undefined
         */
        item: T;
        /**
         * The index to add the item at
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        index = 0;
        /**
         * Tries to make structured clone of the incoming list data in the component, sometimes it may not be possible due to circular structures or other types of error
         * @default true
         */
        clone? = true;
    }
    export class AddItemAtIndexesDto<T> {
        constructor(list?: T[], item?: T, indexes?: number[], clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (item !== undefined) { this.item = item; }
            if (indexes !== undefined) { this.indexes = indexes; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to which item needs to be added
         * @default undefined
         */
        list: T[];
        /**
         * The item to add
         * @default undefined
         */
        item: T;
        /**
         * The index to add the item at
         * @default [0]
         */
        indexes: number[] = [0];
        /**
         * Tries to make structured clone of the incoming list data in the component, sometimes it may not be possible due to circular structures or other types of error
         * @default true
         */
        clone? = true;
    }

    export class AddItemsAtIndexesDto<T> {
        constructor(list?: T[], items?: T[], indexes?: number[], clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (items !== undefined) { this.items = items; }
            if (indexes !== undefined) { this.indexes = indexes; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to which item needs to be added
         * @default undefined
         */
        list: T[];
        /**
         * The item to add
         * @default undefined
         */
        items: T[];
        /**
         * The index to add the item at
         * @default [0]
         */
        indexes: number[] = [0];
        /**
         * Tries to make structured clone of the incoming list data in the component, sometimes it may not be possible due to circular structures or other types of error
         * @default true
         */
        clone? = true;
    }
    export class RemoveItemAtIndexDto<T> {
        constructor(list?: T[], index?: number, clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (index !== undefined) { this.index = index; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
        * The list from which item needs to be removed
        * @default undefined
        */
        list: T[];
        /**
         * The index to on which remove item
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        index = 0;
        /**
         * Tries to make structured clone of the incoming list data in the component, sometimes it may not be possible due to circular structures or other types of error
         * @default true
         */
        clone? = true;
    }
    export class RemoveNthItemDto<T> {
        constructor(list?: T[], nth?: number, offset?: number, clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (nth !== undefined) { this.nth = nth; }
            if (offset !== undefined) { this.offset = offset; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
        * The list from which item needs to be removed
        * @default undefined
        */
        list: T[];
        /**
         * The nth item to remove
         * @default 2
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nth = 2;
        /**
         * The offset from which to start counting
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        offset = 0;
        /**
         * Tries to make structured clone of the incoming list data in the component, sometimes it may not be possible due to circular structures or other types of error
         * @default true
         */
        clone? = true;
    }
    export class GetByPatternDto<T> {
        constructor(list?: T[], pattern?: boolean[]) {
            if (list !== undefined) { this.list = list; }
            if (pattern !== undefined) { this.pattern = pattern; }
        }
        /**
        * The list from which we need to get an item
        * @default undefined
        */
        list: T[];
        /**
         * The list of booleans to be used as a pattern (true means get, false means skip)
         * @default [true, true, false]
         */
        pattern: boolean[] = [true, true, false];
    }
    export class GetNthItemDto<T> {
        constructor(list?: T[], nth?: number, offset?: number, clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (nth !== undefined) { this.nth = nth; }
            if (offset !== undefined) { this.offset = offset; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
        * The list from which we need to get an item
        * @default undefined
        */
        list: T[];
        /**
         * The nth item to get
         * @default 2
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nth = 2;
        /**
         * The offset from which to start counting
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        offset = 0;
        /**
         * Tries to make structured clone of the incoming list data in the component, sometimes it may not be possible due to circular structures or other types of error
         * @default true
         */
        clone? = true;
    }
    export class GetLongestListLength<T> {
        constructor(lists?: T[]) {
            if (lists !== undefined) { this.lists = lists; }
        }
        /**
         * The list from which we need to get an item
         * @default undefined
         */
        lists: T[];
    }
    export class MergeElementsOfLists<T> {
        constructor(lists?: T[], level?: number) {
            if (lists !== undefined) { this.lists = lists; }
            if (level !== undefined) { this.level = level; }
        }
        /**
        * The list from which we need to get an item
        * @default undefined
        */
        lists: T[];
        /**
         * The level on which to merge the elements. 0 means first level
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        level = 0;
    }
    export class AddItemFirstLastDto<T> {
        constructor(list?: T[], item?: T, position?: firstLastEnum, clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (item !== undefined) { this.item = item; }
            if (position !== undefined) { this.position = position; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to which item needs to be added
         * @default undefined
         */
        list: T[];
        /**
         * The item to add
         * @default undefined
         */
        item: T;
        /**
         * The option if the item needs to be added at the beginning or the end of the list
         * @default last
         */
        position: firstLastEnum = firstLastEnum.last;
        /**
         * Tries to make structured clone of the incoming list data in the component, sometimes it may not be possible due to circular structures or other types of error
         * @default true
         */
        clone? = true;
    }
}
