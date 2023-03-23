

// tslint:disable-next-line: no-namespace
export namespace Math {
    
    export enum MathActionEnum {
        add = 'add',
        subtract = 'subtract',
        multiply = 'multiply',
        divide = 'divide',
        power = 'power',
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
        action: MathActionEnum;
    }
}
