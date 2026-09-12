import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */


// tslint:disable-next-line: no-namespace
/**
 * Parameters for boolean logic and control flow: the operands of comparisons and and/or/not, the
 * branches of a conditional selection, and the gate values that visual scripts use where code would
 * use an if statement.
 */
export namespace Logic {

    /**
     * The comparison used between two values: less than, less or equal, greater, greater or equal,
     * strict equality and inequality, and their loose equivalents. The strict forms compare type as
     * well as value and are the safer default; the loose forms coerce, which is occasionally what you
     * want when comparing a number against text a user typed.
     */
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
    /**
     * Two values and an operator for `logic.compare`.
     */
    export class ComparisonDto<T> {
        constructor(first?: T, second?: T, operator?: BooleanOperatorsEnum) {
            if (first !== undefined) { this.first = first; }
            if (second !== undefined) { this.second = second; }
            if (operator !== undefined) { this.operator = operator; }
        }
        /**
         * The value on the left of the operator.
         * @default undefined
         */
        first!: T;
        /**
         * The value on the right of the operator.
         * @default undefined
         */
        second!: T;
        /**
         * The comparison: `<`, `<=`, `>`, `>=`, `==`, `!=`, or the strict `===` and `!==`, which do
         * not convert types.
         * @default less
         */
        operator: BooleanOperatorsEnum = BooleanOperatorsEnum.less;
    }
    /**
     * One boolean for `logic.boolean` and `logic.not`, which pass it through or flip it.
     */
    export class BooleanDto {
        constructor(boolean?: boolean) {
            if (boolean !== undefined) { this.boolean = boolean; }
        }
        /**
         * The boolean value.
         * @default false
         */
        boolean = false;
    }
    /**
     * A list of booleans for `logic.notList`, which flips every one of them.
     */
    export class BooleanListDto {
        constructor(booleans?: boolean[]) {
            if (booleans !== undefined) { this.booleans = booleans; }
        }
        /**
         * The booleans, in order.
         * @default undefined
         */
        booleans!: boolean[];
    }
    /**
     * A value and a condition for `logic.valueGate`.
     */
    export class ValueGateDto<T> {
        constructor(value?: T, boolean?: boolean) {
            if (value !== undefined) { this.value = value; }
            if (boolean !== undefined) { this.boolean = boolean; }
        }
        /**
         * The value that passes through when the gate is open.
         * @default undefined
         */
        value!: T;
        /**
         * When true the gate is open and the value passes; when false the result is undefined.
         * @default false
         */
        boolean = false;
    }
    /**
     * A preferred value and a fallback for `logic.firstDefinedValueGate`.
     */
    export class TwoValueGateDto<T, U> {
        constructor(value1?: T, value2?: U) {
            if (value1 !== undefined) { this.value1 = value1; }
            if (value2 !== undefined) { this.value2 = value2; }
        }
        /**
         * The value used when it is defined.
         * @default undefined
         * @optional true
         */
        value1?: T | undefined;
        /**
         * The value used when the first is undefined.
         * @default undefined
         * @optional true
         */
        value2?: U | undefined;
    }
    /**
     * A length and a probability for `logic.randomBooleans`.
     */
    export class RandomBooleansDto {
        constructor(length?: number) {
            if (length !== undefined) { this.length = length; }
        }
        /**
         * How many booleans to draw.
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        length = 10;
        /**
         * The chance of each boolean being true, from 0 (never) to 1 (always).
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        trueThreshold = 0.5;
    }
    /**
     * Numbers, two thresholds and a step count for `logic.twoThresholdRandomGradient`.
     */
    export class TwoThresholdRandomGradientDto {
        /**
         * The numbers to turn into booleans, one each.
         * @default undefined
         */
        numbers!: number[];
        /**
         * Numbers below this are always true.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        thresholdTotalTrue: number = 1;
        /**
         * Numbers above this are always false; between the two thresholds the chance of true fades
         * from certain to none.
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        thresholdTotalFalse: number = 2;
        /**
         * How many steps the fade between the thresholds has; more steps make it smoother.
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        nrLevels: number = 10;
    }
    /**
     * Numbers and a threshold for `logic.thresholdBooleanList`, which turns them into booleans.
     */
    export class ThresholdBooleanListDto {
        /**
         * The numbers to turn into booleans, one each.
         * @default undefined
         */
        numbers!: number[];
        /**
         * Numbers below this become true and the rest false, unless `inverse` flips them.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        threshold: number = 1;
        /**
         * When true, every result is flipped: true becomes false and false becomes true.
         * @default false
         */
        inverse: boolean = false;
    }
    /**
     * Numbers and ranges for `logic.thresholdGapsBooleanList`, which marks the numbers inside any
     * range.
     */
    export class ThresholdGapsBooleanListDto {
        /**
         * The numbers to turn into booleans, one each.
         * @default undefined
         */
        numbers!: number[];
        /**
         * The ranges, each `[min, max]` with both ends included; a number inside any of them
         * becomes true.
         * @default undefined
         */
        gapThresholds!: Base.Vector2[];
        /**
         * When true, every result is flipped: true becomes false and false becomes true.
         * @default false
         */
        inverse: boolean = false;
    }
}
