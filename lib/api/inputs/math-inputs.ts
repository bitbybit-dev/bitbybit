

// tslint:disable-next-line: no-namespace
export namespace Math {

    export enum MathTwoNrOperatorEnum {
        add = 'add',
        subtract = 'subtract',
        multiply = 'multiply',
        divide = 'divide',
        power = 'power',
        modulus = 'modulus',
    }

    export enum MathOneNrOperatorEnum {
        absolute = 'absolute',
        negate = 'negate',
        ln = 'ln',
        log10 = 'log10',
        tenPow = 'tenPow',
        round = 'round',
        floor = 'floor',
        ceil = 'ceil',
        sqrt = 'sqrt',
        sin = 'sin',
        cos = 'cos',
        tan = 'tan',
        asin = 'asin',
        acos = 'acos',
        atan = 'atan',
        log = 'log',
        exp = 'exp',
    }

    export class NumberDto {
        /**
         * First number
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number: number = 0;
    }
    export class ActionOnTwoNumbersDto {
        /**
         * First number
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        first: number = 1;
        /**
         * Second number
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        second: number = 1;
        /**
         * Point
         * @default add
         */
        operation: MathTwoNrOperatorEnum;
    }
    export class ActionOnOneNumberDto {
        /**
         * First number
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number: number = 1;
        /**
         * Point
         * @default absolute
         */
        operation: MathOneNrOperatorEnum;
    }
    export class RemapNumberDto {
        /**
         * Number to remap
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number: number = 0.5;
        /**
         * First number range min
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        fromLow: number = 0;
        /**
        * Map to range min
        * @default 1
        * @minimum -Infinity
        * @maximum Infinity
        * @step 0.1
        */
        fromHigh: number = 1;
        /**
         * First number range max
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        toLow: number = 1;
        /**
         * Map to range max
         * @default 2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        toHigh: number = 2;
    }
}
