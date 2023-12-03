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

    export class NumberDto {
        /**
         * First number
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number = 0;
    }
    export class ActionOnTwoNumbersDto {
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
    export class ActionOnOneNumberDto {
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
}
