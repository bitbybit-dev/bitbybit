/* eslint-disable @typescript-eslint/no-namespace */


// tslint:disable-next-line: no-namespace
/**
 * Parameters for numeric helpers: the operands of arithmetic and trigonometry, the source and target
 * ranges for remapping a value, rounding and clamping bounds, interpolation factors, and the seed for
 * reproducible randomness. Remapping is the one that appears in nearly every parametric model, because
 * it turns a user-facing slider range into the range the geometry needs.
 */
export namespace Math {

    /**
     * The arithmetic operation applied to two numbers: add, subtract, multiply, divide, power or
     * modulus. Exists so a visual script can choose the operation at runtime instead of wiring a
     * different node for each one.
     */
    export enum mathTwoNrOperatorEnum {
        add = "add",
        subtract = "subtract",
        multiply = "multiply",
        divide = "divide",
        power = "power",
        modulus = "modulus",
    }

    /**
     * The operation applied to a single number: absolute, negate, natural and base-10 logarithms,
     * powers of ten, rounding up, down or to nearest, square root, the trigonometric functions and
     * their inverses, exponential, and conversion between radians and degrees. Note that the
     * trigonometric functions work in radians - use radToDeg and degToRad at the boundary, because
     * almost every angle a user types is in degrees.
     */
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
    /**
     * The easing curve applied when interpolating between two values, in the usual in/out/inOut
     * families - sine, quadratic, cubic, quartic, quintic, exponential and the rest. Governs how an
     * animated or blended value accelerates: easeInOut starts and ends gently, easeIn only starts
     * gently, easeOut only ends gently. Linear interpolation, with no easing, is what makes animation
     * look mechanical.
     */
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
    export class ClampDto {
        constructor(number?: number, min?: number, max?: number) {
            if (number !== undefined) { this.number = number; }
            if (min !== undefined) { this.min = min; }
            if (max !== undefined) { this.max = max; }
        }
        /**
         * Number to clamp
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number = 0.5;
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
    }
    export class LerpDto {
        constructor(start?: number, end?: number, t?: number) {
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
            if (t !== undefined) { this.t = t; }
        }
        /**
         * Start value
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        start = 0;
        /**
         * End value
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        end = 1;
        /**
         * Interpolation value (0-1)
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.01
         */
        t = 0.5;
    }
    export class InverseLerpDto {
        constructor(start?: number, end?: number, value?: number) {
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
            if (value !== undefined) { this.value = value; }
        }
        /**
         * Start value
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        start = 0;
        /**
         * End value
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        end = 1;
        /**
         * Value to find t for
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        value = 0.5;
    }
    export class WrapDto {
        constructor(number?: number, min?: number, max?: number) {
            if (number !== undefined) { this.number = number; }
            if (min !== undefined) { this.min = min; }
            if (max !== undefined) { this.max = max; }
        }
        /**
         * Number to wrap
         * @default 1.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number = 1.5;
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
    }
    export class PingPongDto {
        constructor(t?: number, length?: number) {
            if (t !== undefined) { this.t = t; }
            if (length !== undefined) { this.length = length; }
        }
        /**
         * Time value
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        t = 0.5;
        /**
         * Length of ping pong
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        length = 1;
    }
    export class MoveTowardsDto {
        constructor(current?: number, target?: number, maxDelta?: number) {
            if (current !== undefined) { this.current = current; }
            if (target !== undefined) { this.target = target; }
            if (maxDelta !== undefined) { this.maxDelta = maxDelta; }
        }
        /**
         * Current value
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        current = 0;
        /**
         * Target value
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        target = 1;
        /**
         * Maximum change amount
         * @default 0.1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.01
         */
        maxDelta = 0.1;
    }
    export class EvalArithmeticDto {
        constructor(expression?: string) {
            if (expression !== undefined) { this.expression = expression; }
        }
        /**
         * Arithmetic expression containing numbers, +, -, *, /, and parentheses
         * @default 1+1
         */
        expression = "1+1";
    }
}
