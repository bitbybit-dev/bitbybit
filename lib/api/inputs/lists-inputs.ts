

// tslint:disable-next-line: no-namespace
export namespace Lists {

    export enum FirstLastEnum {
        first = 'first',
        last = 'last',
    }

    export class ListItemDto {
        /**
         * The list to interrogate
         * @default undefined
         */
        list: any[];
        /**
         * Index of the item in the list - 0 means first.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        index: number = 0;
    }
    export class SubListDto {
        /**
         * The list to split into a sublist
         * @default undefined
         */
        list: any[];
        /**
         * Index from which to start the sublist - 0 means first.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        indexStart: number = 0;
        /**
         * Index to which to end the sublist - 0 means first.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        indexEnd: number = 1;
    }
    export class ListDto {
        /**
         * The list to interrogate
         * @default undefined
         */
        list: any[];
    }  
    export class MultiplyItemDto {
        /**
         * The item to multiply
         * @default undefined
         */
        item: any;
        /**
         * Times to multiply
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        times: number;
    }
    export class AddItemToListAtIndexDto {
        /**
         * The list to which item needs to be added
         * @default undefined
         */
        list: any[];
        /**
         * The item to add
         * @default undefined
         */
        item: any;
        /**
         * The index to add the item at
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        index: number = 0;
    }

    export class AddItemToListFirstLastDto {
        /**
         * The list to which item needs to be added
         * @default undefined
         */
        list: any[];
        /**
         * The item to add
         * @default undefined
         */
        item: any;
        /**
         * The option if the item needs to be added at the beginning or the end of the list
         * @default last
         */
        position: FirstLastEnum = FirstLastEnum.last;
    }
}
