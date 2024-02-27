/* eslint-disable @typescript-eslint/no-namespace */


// tslint:disable-next-line: no-namespace
export namespace Logic {

    export enum BooleanOperatorsEnum {
        less = "<",
        lessOrEqual = "<=",
        greater = ">",
        greaterOrEqual = ">=",
        tripleEqual = "===",
        tripleNotEqual = "!==",
        equal = "==",
        notEqual = "!=",
    }
    export class ComparisonDto<T> {
        constructor(first?: T, second?: T, operator?: BooleanOperatorsEnum) {
            if (first !== undefined) { this.first = first; }
            if (second !== undefined) { this.second = second; }
            if (operator !== undefined) { this.operator = operator; }
        }
        /**
         * First item
         * @default undefined
         */
        first: T;
        /**
         * Second item
         * @default undefined
         */
        second: T;
        /**
         * Operator
         * @default less
         */
        operator: BooleanOperatorsEnum;
    }
    export class BooleanDto {
        constructor(boolean?: boolean) {
            if (boolean !== undefined) { this.boolean = boolean; }
        }
        /**
         * Boolean value
         * @default false
         */
        boolean = false;
    }
    export class ValueGateDto<T> {
        constructor(value?: T, boolean?: boolean) {
            if (value !== undefined) { this.value = value; }
            if (boolean !== undefined) { this.boolean = boolean; }
        }
        /**
         * Value to transmit when gate will be released. When value is not released we will transmit undefined value
         * @default undefined
         */
        value: T;
        /**
         * Boolean value to release the gate
         * @default false
         */
        boolean = false;
    }
}
