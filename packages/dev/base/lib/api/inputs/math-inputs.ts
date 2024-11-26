/* eslint-disable @typescript-eslint/no-namespace */


// tslint:disable-next-line: no-namespace
export namespace Math {

    export enum mathTwoNrOperatorEnum {
        add = "add",
        subtract = "subtract",
        multiply = "multiply",
        divide = "divide",
        power = "power",
        modulus = "modulus",
    }

    export enum mathOneNrOperatorEnum {
        absolute = "absolute",
        negate = "negate",
        ln = "ln",
        log10 = "log10",
        tenPow = "tenPow",
        round = "round",
        floor = "floor",
        ceil = "ceil",
        sqrt = "sqrt",
        sin = "sin",
        cos = "cos",
        tan = "tan",
        asin = "asin",
        acos = "acos",
        atan = "atan",
        log = "log",
        exp = "exp",
        radToDeg = "radToDeg",
        degToRad = "degToRad",
    }
    export enum easeEnum {
        easeInSine = "easeInSine",
        easeOutSine = "easeOutSine",
        easeInOutSine = "easeInOutSine",
        easeInQuad = "easeInQuad",
        easeOutQuad = "easeOutQuad",
        easeInOutQuad = "easeInOutQuad",
        easeInCubic = "easeInCubic",
        easeOutCubic = "easeOutCubic",
        easeInOutCubic = "easeInOutCubic",
        easeInQuart = "easeInQuart",
        easeOutQuart = "easeOutQuart",
        easeInOutQuart = "easeInOutQuart",
        easeInQuint = "easeInQuint",
        easeOutQuint = "easeOutQuint",
        easeInOutQuint = "easeInOutQuint",
        easeInExpo = "easeInExpo",
        easeOutExpo = "easeOutExpo",
        easeInOutExpo = "easeInOutExpo",
        easeInCirc = "easeInCirc",
        easeOutCirc = "easeOutCirc",
        easeInOutCirc = "easeInOutCirc",
        easeInElastic = "easeInElastic",
        easeOutElastic = "easeOutElastic",
        easeInOutElastic = "easeInOutElastic",
        easeInBack = "easeInBack",
        easeOutBack = "easeOutBack",
        easeInOutBack = "easeInOutBack",
        easeInBounce = "easeInBounce",
        easeOutBounce = "easeOutBounce",
        easeInOutBounce = "easeInOutBounce",
    }
    export class ModulusDto {
        constructor(number?: number, modulus?: number) {
            if (number !== undefined) { this.number = number; }
            if (modulus !== undefined) { this.modulus = modulus; }
        }
        /**
         * Number
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number = 1;
        /**
         * Modulus
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        modulus = 2;
    }
    export class NumberDto {
        constructor(number?: number) {
            if (number !== undefined) { this.number = number; }
        }
        /**
         * Number
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number = 1;
    }
    export class EaseDto {
        constructor(x?: number) {
            if (x !== undefined) { this.x = x; }
        }
        /**
         * X value param between 0-1
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        x = 0.5;
        /**
         * Minimum value
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        min = 0;
        /**
         * Maximum value
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        max = 1;
        /**
         * Ease function
         * @default easeInSine
         */
        ease: easeEnum;
    }
    export class RoundToDecimalsDto {
        constructor(number?: number, decimalPlaces?: number) {
            if (number !== undefined) { this.number = number; }
            if (decimalPlaces !== undefined) { this.decimalPlaces = decimalPlaces; }
        }
        /**
         * Number to round
         * @default 1.123456
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number = 1.123456;
        /**
         * Number of decimal places
         * @default 2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        decimalPlaces = 2;
    }
    export class ActionOnTwoNumbersDto {
        constructor(first?: number, second?: number, operation?: mathTwoNrOperatorEnum) {
            if (first !== undefined) { this.first = first; }
            if (second !== undefined) { this.second = second; }
            if (operation !== undefined) { this.operation = operation; }
        }
        /**
         * First number
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        first = 1;
        /**
         * Second number
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        second = 1;
        /**
         * Point
         * @default add
         */
        operation: mathTwoNrOperatorEnum;
    }
    export class TwoNumbersDto {
        constructor(first?: number, second?: number) {
            if (first !== undefined) { this.first = first; }
            if (second !== undefined) { this.second = second; }
        }
        /**
         * First number
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        first = 1;
        /**
         * Second number
         * @default 2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        second = 2;
    }
    export class ActionOnOneNumberDto {
        constructor(number?: number, operation?: mathOneNrOperatorEnum) {
            if (number !== undefined) { this.number = number; }
            if (operation !== undefined) { this.operation = operation; }
        }
        /**
         * First number
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number = 1;
        /**
         * Point
         * @default absolute
         */
        operation: mathOneNrOperatorEnum;
    }
    export class RemapNumberDto {
        constructor(number?: number, fromLow?: number, fromHigh?: number, toLow?: number, toHigh?: number) {
            if (number !== undefined) { this.number = number; }
            if (fromLow !== undefined) { this.fromLow = fromLow; }
            if (fromHigh !== undefined) { this.fromHigh = fromHigh; }
            if (toLow !== undefined) { this.toLow = toLow; }
            if (toHigh !== undefined) { this.toHigh = toHigh; }
        }
        /**
         * Number to remap
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number = 0.5;
        /**
         * First number range min
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        fromLow = 0;
        /**
        * Map to range min
        * @default 1
        * @minimum -Infinity
        * @maximum Infinity
        * @step 0.1
        */
        fromHigh = 1;
        /**
         * First number range max
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        toLow = 1;
        /**
         * Map to range max
         * @default 2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        toHigh = 2;
    }
    export class RandomNumberDto {
        constructor(low?: number, high?: number) {
            if (low !== undefined) { this.low = low; }
            if (high !== undefined) { this.high = high; }
        }
        /**
         * Low range of random value
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        low = 0;
        /**
         * High range of random value
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        high = 1;
    }

    export class RandomNumbersDto {
        constructor(low?: number, high?: number, count?: number) {
            if (low !== undefined) { this.low = low; }
            if (high !== undefined) { this.high = high; }
            if (count !== undefined) { this.count = count; }
        }
        /**
         * Low range of random value
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        low = 0;
        /**
         * High range of random value
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        high = 1;
        /**
         * Number of produced random values
         * @default 10
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        count = 10;
    }

    export class ToFixedDto {
        constructor(number?: number, decimalPlaces?: number) {
            if (number !== undefined) { this.number = number; }
            if (decimalPlaces !== undefined) { this.decimalPlaces = decimalPlaces; }
        }
        /**
         * Number to round
         * @default undefined
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number: number;
        /**
         * Number of decimal places
         * @default 2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        decimalPlaces = 2;
    }
}
