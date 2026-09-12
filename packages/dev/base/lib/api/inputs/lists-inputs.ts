/* eslint-disable @typescript-eslint/no-namespace */


// tslint:disable-next-line: no-namespace
/**
 * Parameters for array handling: the list to act on plus the index, count, depth, comparison or
 * grouping key an operation needs. Geometry calls take and return lists constantly, so these turn up
 * between almost every pair of geometry operations.
 */
export namespace Lists {

    /**
     * Which end of a list to act on: the first item or the last.
     */
    export enum firstLastEnum {
        first = "first",
        last = "last",
    }

    /**
     * A list and a position for `lists.getItem`.
     */
    export class ListItemDto<T> {
        constructor(list?: T[], index?: number, clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (index !== undefined) { this.index = index; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to read from.
         * @default undefined
         */
        list!: T[];
        /**
         * Position of the item, counting from 0; outside the list it throws.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        index = 0;
        /**
         * When true, the item is deep-copied so the caller cannot change the list through it; an
         * item that cannot be copied, such as one with circular references, throws.
         * @default true
         */
        clone?: boolean | undefined = true;
    }
    /**
     * A list and a range of positions for `lists.getSubList`.
     */
    export class SubListDto<T> {
        constructor(list?: T[], indexStart?: number, indexEnd?: number, clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (indexStart !== undefined) { this.indexStart = indexStart; }
            if (indexEnd !== undefined) { this.indexEnd = indexEnd; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to cut from.
         * @default undefined
         */
        list!: T[];
        /**
         * Position of the first item to take, counting from 0.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        indexStart = 0;
        /**
         * Position just after the last item to take; it is not included.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        indexEnd = 1;
        /**
         * When true, the items are deep-copied so the caller cannot change the list through them;
         * an item that cannot be copied throws.
         * @default true
         */
        clone?: boolean | undefined = true;
    }
    /**
     * A list for the methods that read or reshape it whole: `lists.reverse`, `lists.shuffle`,
     * `lists.flipLists`, `lists.getFirstItem` and the others.
     */
    export class ListCloneDto<T> {
        constructor(list?: T[], clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to work on.
         * @default undefined
         */
        list!: T[];
        /**
         * When true, the list is deep-copied first so the input is never changed; when false the
         * modifying methods work in place. Circular data cannot be copied and throws.
         * @default true
         */
        clone?: boolean | undefined = true;
    }
    /**
     * A pattern and a length for `lists.repeatInPattern`, which repeats the pattern until the list
     * is that long.
     */
    export class RepeatInPatternDto<T> {
        constructor(list?: T[]) {
            if (list !== undefined) { this.list = list; }
        }
        /**
         * The items to repeat, in order.
         * @default undefined
         */
        list!: T[];
        /**
         * When true, the pattern is deep-copied first so the input is never changed. Data with
         * circular references cannot be copied and throws.
         * @default true
         */
        clone?: boolean | undefined = true;
        /**
         * The length of the result; the pattern is cut off there.
         * @default 100
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        lengthLimit = 100;
    }
    /**
     * A list and a direction for `lists.sortNumber` and `lists.sortTexts`.
     */
    export class SortDto<T> {
        constructor(list?: T[], clone?: boolean, orderAsc?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (clone !== undefined) { this.clone = clone; }
            if (orderAsc !== undefined) { this.orderAsc = orderAsc; }
        }
        /**
         * The numbers or texts to sort.
         * @default undefined
         */
        list!: T[];
        /**
         * When true, the list is deep-copied first so the input stays in its old order; when false
         * it is sorted in place.
         * @default true
         */
        clone?: boolean | undefined = true;
        /**
         * When true, the smallest or alphabetically first item comes first; when false the order is
         * reversed.
         * @default true
         */
        orderAsc = true;
    }
    /**
     * Objects, the property to compare and a direction for `lists.sortByPropValue`.
     */
    export class SortJsonDto<T> {
        constructor(list?: T[], clone?: boolean, orderAsc?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (clone !== undefined) { this.clone = clone; }
            if (orderAsc !== undefined) { this.orderAsc = orderAsc; }
        }
        /**
         * The objects to sort; each should carry the property.
         * @default undefined
         */
        list!: T[];
        /**
         * When true, the list is deep-copied first so the input stays in its old order; when false
         * it is sorted in place.
         * @default true
         */
        clone?: boolean | undefined = true;
        /**
         * When true, the object with the smallest value comes first; when false the largest.
         * @default true
         */
        orderAsc = true;
        /**
         * Name of the property whose numeric value decides the order.
         * @default propName
         */
        property = "propName";
    }
    /**
     * A list for `lists.removeAllItems`, which empties it in place.
     */
    export class ListDto<T> {
        constructor(list?: T[]) {
            if (list !== undefined) { this.list = list; }
        }
        /**
         * The list to empty.
         * @default undefined
         */
        list!: T[];
    }
    /**
     * A list and a group size for `lists.groupNth`.
     */
    export class GroupListDto<T> {
        constructor(list?: T[], nrElements?: number, keepRemainder?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (nrElements !== undefined) { this.nrElements = nrElements; }
            if (keepRemainder !== undefined) { this.keepRemainder = keepRemainder; }
        }
        /**
         * The items to split into groups, in order.
         * @default undefined
         */
        list!: T[];
        /**
         * How many items go in each group.
         * @default 2
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrElements = 2;
        /**
         * When true, the items left over at the end form a shorter last group; when false they are
         * dropped.
         * @default false
         */
        keepRemainder = false;
    }
    /**
     * An item and a count for `lists.repeat`.
     */
    export class MultiplyItemDto<T> {
        constructor(item?: T, times?: number) {
            if (item !== undefined) { this.item = item; }
            if (times !== undefined) { this.times = times; }
        }
        /**
         * The item to repeat; every entry of the result is this same item.
         * @default undefined
         */
        item!: T;
        /**
         * How many entries the result has.
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        times: number = 10;
    }
    /**
     * A list, an item and a position for `lists.addItemAtIndex`.
     */
    export class AddItemAtIndexDto<T> {
        constructor(list?: T[], item?: T, index?: number, clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (item !== undefined) { this.item = item; }
            if (index !== undefined) { this.index = index; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to insert into.
         * @default undefined
         */
        list!: T[];
        /**
         * The item to insert.
         * @default undefined
         */
        item!: T;
        /**
         * The position the item takes, counting from 0; the item there and everything after it
         * shift up by one.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        index = 0;
        /**
         * When true, the list is deep-copied first so the input is never changed; when false the
         * item is inserted in place.
         * @default true
         */
        clone?: boolean | undefined = true;
    }
    /**
     * A list, an item and several positions for `lists.addItemAtIndexes`.
     */
    export class AddItemAtIndexesDto<T> {
        constructor(list?: T[], item?: T, indexes?: number[], clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (item !== undefined) { this.item = item; }
            if (indexes !== undefined) { this.indexes = indexes; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to insert into.
         * @default undefined
         */
        list!: T[];
        /**
         * The item to insert at every position.
         * @default undefined
         */
        item!: T;
        /**
         * The positions, counted on the list as it was before any insertion; positions outside the
         * list are ignored.
         * @default [0]
         */
        indexes: number[] = [0];
        /**
         * When true, the list is deep-copied first so the input is never changed; when false the
         * items are inserted in place.
         * @default true
         */
        clone?: boolean | undefined = true;
    }

    /**
     * A list, several items and one position per item for `lists.addItemsAtIndexes`.
     */
    export class AddItemsAtIndexesDto<T> {
        constructor(list?: T[], items?: T[], indexes?: number[], clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (items !== undefined) { this.items = items; }
            if (indexes !== undefined) { this.indexes = indexes; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to insert into.
         * @default undefined
         */
        list!: T[];
        /**
         * The items to insert, one per index, in the same order.
         * @default undefined
         */
        items!: T[];
        /**
         * One position per item, in ascending order, counted on the list as it was before any
         * insertion; a wrong count or order throws.
         * @default [0]
         */
        indexes: number[] = [0];
        /**
         * When true, the list is deep-copied first so the input is never changed; when false the
         * items are inserted in place.
         * @default true
         */
        clone?: boolean | undefined = true;
    }
    /**
     * A list and a position for `lists.removeItemAtIndex` and `lists.removeItemAtIndexFromEnd`.
     */
    export class RemoveItemAtIndexDto<T> {
        constructor(list?: T[], index?: number, clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (index !== undefined) { this.index = index; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to take the item out of.
         * @default undefined
         */
        list!: T[];
        /**
         * The position to remove, counting from 0 at the start, or from 0 at the end for the
         * from-end method; outside the list nothing is removed.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        index = 0;
        /**
         * When true, the list is deep-copied first so the input is never changed; when false the
         * item is removed in place.
         * @default true
         */
        clone?: boolean | undefined = true;
    }
    /**
     * A list and several positions for `lists.removeItemsAtIndexes`.
     */
    export class RemoveItemsAtIndexesDto<T> {
        constructor(list?: T[], indexes?: number[], clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (indexes !== undefined) { this.indexes = indexes; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to take the items out of.
         * @default undefined
         */
        list!: T[];
        /**
         * The positions to remove, counted on the list as it was before any removal; positions
         * outside the list are ignored.
         * @default undefined
         */
        indexes!: number[];
        /**
         * When true, the list is deep-copied first so the input is never changed; when false the
         * items are removed in place.
         * @default true
         */
        clone?: boolean | undefined = true;
    }
    /**
     * A list, a step and an offset for `lists.removeNthItem`.
     */
    export class RemoveNthItemDto<T> {
        constructor(list?: T[], nth?: number, offset?: number, clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (nth !== undefined) { this.nth = nth; }
            if (offset !== undefined) { this.offset = offset; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to thin out.
         * @default undefined
         */
        list!: T[];
        /**
         * The step: every nth item, counted from the offset, is removed.
         * @default 2
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nth = 2;
        /**
         * Position of the first item to remove, counting from 0.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        offset = 0;
        /**
         * When true, the list is deep-copied first so the input is never changed; when false the
         * items are removed in place.
         * @default true
         */
        clone?: boolean | undefined = true;
    }
    /**
     * A list and a probability for `lists.randomGetThreshold` and `lists.randomRemoveThreshold`.
     */
    export class RandomThresholdDto<T> {
        constructor(list?: T[], threshold?: number, clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (threshold !== undefined) { this.threshold = threshold; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to pick from.
         * @default undefined
         */
        list!: T[];
        /**
         * The probability, from 0 to 1, that any one item is kept by the get method or dropped by
         * the remove method.
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 1
         */
        threshold = 1;
        /**
         * When true, the list is deep-copied first so the input is never changed.
         * @default true
         */
        clone?: boolean | undefined = true;
    }
    /**
     * A list for `lists.removeDuplicates` and `lists.removeDuplicateNumbers`, which drop repeated
     * items.
     */
    export class RemoveDuplicatesDto<T> {
        constructor(list?: T[], clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to remove repeats from; the first occurrence of each item stays.
         * @default undefined
         */
        list!: T[];
        /**
         * When true, the list is deep-copied first so the input is never changed.
         * @default true
         */
        clone?: boolean | undefined = true;
    }
    /**
     * Numbers and a tolerance for `lists.removeDuplicateNumbersTolerance`, which drops
     * near-repeats.
     */
    export class RemoveDuplicatesToleranceDto<T> {
        constructor(list?: T[], clone?: boolean, tolerance?: number) {
            if (list !== undefined) { this.list = list; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The numbers to remove near-repeats from; the first of each group stays.
         * @default undefined
         */
        list!: T[];
        /**
         * Numbers closer together than this count as the same.
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         * @step 1e-7
         */
        tolerance = 1e-7;
        /**
         * When true, the list is deep-copied first so the input is never changed.
         * @default true
         */
        clone?: boolean | undefined = true;
    }
    /**
     * A list and a repeating pattern for `lists.getByPattern`.
     */
    export class GetByPatternDto<T> {
        constructor(list?: T[], pattern?: boolean[]) {
            if (list !== undefined) { this.list = list; }
            if (pattern !== undefined) { this.pattern = pattern; }
        }
        /**
         * The list to filter.
         * @default undefined
         */
        list!: T[];
        /**
         * The pattern of `true` (keep) and `false` (skip) applied item by item and repeated until
         * the list ends.
         * @default [true, true, false]
         */
        pattern: boolean[] = [true, true, false];
    }
    /**
     * A list, a step and an offset for `lists.getNthItem`.
     */
    export class GetNthItemDto<T> {
        constructor(list?: T[], nth?: number, offset?: number, clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (nth !== undefined) { this.nth = nth; }
            if (offset !== undefined) { this.offset = offset; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list to pick from.
         * @default undefined
         */
        list!: T[];
        /**
         * The step: every nth item, counted from the offset, is kept.
         * @default 2
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nth = 2;
        /**
         * Position of the first item to keep, counting from 0.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        offset = 0;
        /**
         * When true, the items are deep-copied so the caller cannot change the list through them.
         * @default true
         */
        clone?: boolean | undefined = true;
    }
    /**
     * Several lists for `lists.getLongestListLength`, which measures the longest of them.
     */
    export class GetLongestListLength<T> {
        constructor(lists?: T[]) {
            if (lists !== undefined) { this.lists = lists; }
        }
        /**
         * The lists to measure.
         * @default undefined
         */
        lists!: T[];
    }
    /**
     * Nested lists and a depth for `lists.mergeElementsOfLists`, which regroups items by position.
     */
    export class MergeElementsOfLists<T> {
        constructor(lists?: T[], level?: number) {
            if (lists !== undefined) { this.lists = lists; }
            if (level !== undefined) { this.level = level; }
        }
        /**
         * The lists whose items are regrouped by position.
         * @default undefined
         */
        lists!: T[];
        /**
         * How many levels of nesting to flatten inside each list before regrouping; 0 regroups the
         * lists as they are.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        level = 0;
    }
    /**
     * A list and an item for `lists.addItem` and `lists.prependItem`.
     */
    export class AddItemDto<T> {
        constructor(list?: T[], item?: T, clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (item !== undefined) { this.item = item; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list that receives the item.
         * @default undefined
         */
        list!: T[];
        /**
         * The item to add at the end or the start.
         * @default undefined
         */
        item!: T;
        /**
         * When true, the list is deep-copied first so the input is never changed; when false the
         * item is added in place.
         * @default true
         */
        clone?: boolean | undefined = true;
    }
    /**
     * A list, an item and an end for `lists.addItemFirstLast`.
     */
    export class AddItemFirstLastDto<T> {
        constructor(list?: T[], item?: T, position?: firstLastEnum, clone?: boolean) {
            if (list !== undefined) { this.list = list; }
            if (item !== undefined) { this.item = item; }
            if (position !== undefined) { this.position = position; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The list that receives the item.
         * @default undefined
         */
        list!: T[];
        /**
         * The item that goes at the chosen end.
         * @default undefined
         */
        item!: T;
        /**
         * Whether the item goes at the start (`first`) or the end (`last`).
         * @default last
         */
        position: firstLastEnum = firstLastEnum.last;
        /**
         * When true, the list is deep-copied first so the input is never changed; when false the
         * item is added in place.
         * @default true
         */
        clone?: boolean | undefined = true;
    }
    /**
     * Several lists for `lists.concatenate`, joined end to end.
     */
    export class ConcatenateDto<T> {
        constructor(lists?: T[][], clone?: boolean) {
            if (lists !== undefined) { this.lists = lists; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The lists to join, in the order they should appear.
         * @default undefined
         */
        lists!: T[][];
        /**
         * When true, the lists are deep-copied first so the inputs are never changed.
         * @default true
         */
        clone?: boolean | undefined = true;
    }
    /**
     * A list and an item for `lists.includes` and `lists.findIndex`.
     */
    export class IncludesDto<T> {
        constructor(list?: T[], item?: T) {
            if (list !== undefined) { this.list = list; }
            if (item !== undefined) { this.item = item; }
        }
        /**
         * The list to search.
         * @default undefined
         */
        list!: T[];
        /**
         * The item to look for; it must be the very same value or object, not just an equal-looking
         * one.
         * @default undefined
         */
        item!: T;
    }
    /**
     * Several lists for `lists.interleave`, which weaves them together item by item.
     */
    export class InterleaveDto<T> {
        constructor(lists?: T[][], clone?: boolean) {
            if (lists !== undefined) { this.lists = lists; }
            if (clone !== undefined) { this.clone = clone; }
        }
        /**
         * The lists to weave; the first item of each comes first, then the second of each, and so
         * on.
         * @default undefined
         */
        lists!: T[][];
        /**
         * When true, the lists are deep-copied first so the inputs are never changed.
         * @default true
         */
        clone?: boolean | undefined = true;
    }
}
