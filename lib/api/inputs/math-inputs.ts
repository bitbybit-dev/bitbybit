

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
        floor='floor',
        ceil='ceil',
        sqrt='sqrt',
        sin='sin',
        cos='cos',
        tan='tan',
        asin='asin',
        acos='acos',
        atan='atan',
        log='log',
        exp='exp',
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
        action: MathTwoNrOperatorEnum;
    }
    export class ActionOnOneNumberDto {
        /**
         * First number
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        nr: number = 1;
        /**
         * Point
         * @default absolute
         */
        action: MathOneNrOperatorEnum;
    }
}
