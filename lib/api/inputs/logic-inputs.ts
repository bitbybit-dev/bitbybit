

// tslint:disable-next-line: no-namespace
export namespace Logic {

    export enum BooleanOperatorsEnum {
        less = '<',
        lessOrEqual = '<=',
        greater = '>',
        greaterOrEqual = '>=',
        tripleEqual = '===',
        tripleNotEqual = '!==',
        equal = '==',
        notEqual = '!=',
    }
    export class ComparisonDto {
        /**
         * First item
         * @default undefined
         */
        first: any;
        /**
         * Second item
         * @default undefined
         */
        second: any;
        /**
         * Operator
         * @default less
         */
        operator: BooleanOperatorsEnum;
    }
    export class BooleanDto {
        /**
         * Boolean value
         * @default false
         */
        boolean: boolean = false;
    }
    export class ValueGateDto {
        /**
         * Value to transmit when gate will be released. When value is not released we will transmit undefined value
         * @default undefined
         */
        value: any;
        /**
         * Boolean value to release the gate
         * @default false
         */
        boolean: boolean = false;
    }
}
