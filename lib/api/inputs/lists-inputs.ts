/* eslint-disable @typescript-eslint/no-namespace */


// tslint:disable-next-line: no-namespace
export namespace Lists {

    export enum FirstLastEnum {
        first = "first",
        last = "last",
    }

    export class ListItemDto<T> {
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
    }
    export class SubListDto<T> {
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
    }
    export class ListDto<T> {
        /**
         * The list to interrogate
         * @default undefined
         */
        list: T[];
    }
    export class GroupListDto<T> {
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
    }
    export class AddItemAtIndexesDto<T> {
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
    }

    export class AddItemsAtIndexesDto<T> {
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
    }
    export class RemoveItemAtIndexDto<T> {
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
    }
    export class RemoveNthItemDto<T> {
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
    }
    export class GetByPatternDto<T> {
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
    }
    export class GetLongestListLength<T> {
        /**
         * The list from which we need to get an item
         * @default undefined
         */
        lists: T[];
    }
    export class MergeElementsOfLists<T> {
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
        position: FirstLastEnum = FirstLastEnum.last;
    }
}
