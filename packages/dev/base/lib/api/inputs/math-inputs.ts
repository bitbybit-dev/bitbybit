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
    /**
     * A number and a divisor for `math.modulus`, which gives the remainder of the division.
     */
    export class ModulusDto {
        constructor(number?: number, modulus?: number) {
            if (number !== undefined) { this.number = number; }
            if (modulus !== undefined) { this.modulus = modulus; }
        }
        /**
         * The number to divide.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number = 1;
        /**
         * The number to divide by; the remainder is smaller than it.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        modulus = 2;
    }
    /**
     * One number for the single-number methods of `math`: `sqrt`, `abs`, `sin`, `degToRad` and the
     * rest.
     */
    export class NumberDto {
        constructor(number?: number) {
            if (number !== undefined) { this.number = number; }
        }
        /**
         * The number the method works on; for the trigonometric methods an angle in radians.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number = 1;
    }
    /**
     * A value between 0 and 1, a target range and an easing curve for `math.ease`.
     */
    export class EaseDto {
        constructor(x?: number) {
            if (x !== undefined) { this.x = x; }
        }
        /**
         * The position along the curve, from 0 at `min` to 1 at `max`.
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        x = 0.5;
        /**
         * The value at the start of the curve.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        min = 0;
        /**
         * The value at the end of the curve.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        max = 1;
        /**
         * The easing curve: `easeIn` starts slowly, `easeOut` ends slowly, `easeInOut` does both,
         * in sine, quadratic, cubic and other strengths.
         * @default easeInSine
         */
        ease: easeEnum = easeEnum.easeInSine;
    }
    /**
     * A number and a precision for `math.roundToDecimals` and `math.roundAndRemoveTrailingZeros`.
     */
    export class RoundToDecimalsDto {
        constructor(number?: number, decimalPlaces?: number) {
            if (number !== undefined) { this.number = number; }
            if (decimalPlaces !== undefined) { this.decimalPlaces = decimalPlaces; }
        }
        /**
         * The number to round; it is not changed, a rounded copy is returned.
         * @default 1.123456
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number = 1.123456;
        /**
         * How many digits to keep after the decimal point; 0 rounds to a whole number.
         * @default 2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        decimalPlaces = 2;
    }
    /**
     * Two numbers and the arithmetic operation `math.twoNrOperation` applies to them.
     */
    export class ActionOnTwoNumbersDto {
        constructor(first?: number, second?: number, operation?: mathTwoNrOperatorEnum) {
            if (first !== undefined) { this.first = first; }
            if (second !== undefined) { this.second = second; }
            if (operation !== undefined) { this.operation = operation; }
        }
        /**
         * The first operand: the number subtracted from, divided, or raised to a power.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        first = 1;
        /**
         * The second operand: the number subtracted, divided by, or used as the exponent.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        second = 1;
        /**
         * The operation to apply to `first` and `second`, in that order
         * @default add
         */
        operation: mathTwoNrOperatorEnum = mathTwoNrOperatorEnum.add;
    }
    /**
     * Two numbers for `math.add`, `math.subtract`, `math.multiply`, `math.divide` and `math.power`.
     */
    export class TwoNumbersDto {
        constructor(first?: number, second?: number) {
            if (first !== undefined) { this.first = first; }
            if (second !== undefined) { this.second = second; }
        }
        /**
         * The first operand: the number subtracted from, divided, or raised to a power.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        first = 1;
        /**
         * The second operand: the number subtracted, divided by, or used as the exponent.
         * @default 2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        second = 2;
    }
    /**
     * One number and the operation `math.oneNrOperation` applies to it.
     */
    export class ActionOnOneNumberDto {
        constructor(number?: number, operation?: mathOneNrOperatorEnum) {
            if (number !== undefined) { this.number = number; }
            if (operation !== undefined) { this.operation = operation; }
        }
        /**
         * The number the operation works on; for the trigonometric operations an angle in radians.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number = 1;
        /**
         * The operation to apply to `number`
         * @default absolute
         */
        operation: mathOneNrOperatorEnum = mathOneNrOperatorEnum.absolute;
    }
    /**
     * A number, the range it is in and the range `math.remap` maps it to.
     */
    export class RemapNumberDto {
        constructor(number?: number, fromLow?: number, fromHigh?: number, toLow?: number, toHigh?: number) {
            if (number !== undefined) { this.number = number; }
            if (fromLow !== undefined) { this.fromLow = fromLow; }
            if (fromHigh !== undefined) { this.fromHigh = fromHigh; }
            if (toLow !== undefined) { this.toLow = toLow; }
            if (toHigh !== undefined) { this.toHigh = toHigh; }
        }
        /**
         * The number to map.
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number = 0.5;
        /**
         * The low end of the range the number is in.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        fromLow = 0;
        /**
         * The high end of the range the number is in.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        fromHigh = 1;
        /**
         * The low end of the range to map to; `fromLow` lands here.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        toLow = 1;
        /**
         * The high end of the range to map to; `fromHigh` lands here.
         * @default 2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        toHigh = 2;
    }
    /**
     * The range `math.randomNumber` picks a value from; `low` can be picked, `high` is never quite
     * reached.
     */
    export class RandomNumberDto {
        constructor(low?: number, high?: number) {
            if (low !== undefined) { this.low = low; }
            if (high !== undefined) { this.high = high; }
        }
        /**
         * The smallest value that can be picked.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        low = 0;
        /**
         * The top of the range; values get close to it but never reach it.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        high = 1;
    }

    /**
     * The range and the count for `math.randomNumbers`; `low` can be picked, `high` is never quite
     * reached.
     */
    export class RandomNumbersDto {
        constructor(low?: number, high?: number, count?: number) {
            if (low !== undefined) { this.low = low; }
            if (high !== undefined) { this.high = high; }
            if (count !== undefined) { this.count = count; }
        }
        /**
         * The smallest value that can be picked.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        low = 0;
        /**
         * The top of the range; values get close to it but never reach it.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        high = 1;
        /**
         * How many random numbers to produce.
         * @default 10
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        count = 10;
    }

    /**
     * A number and a precision for `math.toFixed`, which formats it as text.
     */
    export class ToFixedDto {
        constructor(number?: number, decimalPlaces?: number) {
            if (number !== undefined) { this.number = number; }
            if (decimalPlaces !== undefined) { this.decimalPlaces = decimalPlaces; }
        }
        /**
         * The number to format.
         * @default undefined
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number!: number;
        /**
         * How many digits to show after the decimal point, padding with zeros.
         * @default 2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        decimalPlaces = 2;
    }
    /**
     * A number and the range `math.clamp` keeps it within.
     */
    export class ClampDto {
        constructor(number?: number, min?: number, max?: number) {
            if (number !== undefined) { this.number = number; }
            if (min !== undefined) { this.min = min; }
            if (max !== undefined) { this.max = max; }
        }
        /**
         * The number to limit.
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number = 0.5;
        /**
         * The lowest value allowed; anything below becomes this.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        min = 0;
        /**
         * The highest value allowed; anything above becomes this.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        max = 1;
    }
    /**
     * A start, an end and a fraction for `math.lerp`, which blends between them.
     */
    export class LerpDto {
        constructor(start?: number, end?: number, t?: number) {
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
            if (t !== undefined) { this.t = t; }
        }
        /**
         * The value at fraction 0.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        start = 0;
        /**
         * The value at fraction 1.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        end = 1;
        /**
         * How far from start to end, from 0 to 1; values outside that range extrapolate.
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.01
         */
        t = 0.5;
    }
    /**
     * A start, an end and a value for `math.inverseLerp`, which finds the value's fraction between
     * them.
     */
    export class InverseLerpDto {
        constructor(start?: number, end?: number, value?: number) {
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
            if (value !== undefined) { this.value = value; }
        }
        /**
         * The value that counts as fraction 0.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        start = 0;
        /**
         * The value that counts as fraction 1.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        end = 1;
        /**
         * The value to locate between start and end.
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        value = 0.5;
    }
    /**
     * A number and the range `math.wrap` cycles it into.
     */
    export class WrapDto {
        constructor(number?: number, min?: number, max?: number) {
            if (number !== undefined) { this.number = number; }
            if (min !== undefined) { this.min = min; }
            if (max !== undefined) { this.max = max; }
        }
        /**
         * The number to wrap; it may be far outside the range.
         * @default 1.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number = 1.5;
        /**
         * The start of the range, included in the result.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        min = 0;
        /**
         * The end of the range, not included: a number reaching it comes back in at `min`.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        max = 1;
    }
    /**
     * A running value and a length for `math.pingPong`, which bounces the value between 0 and the
     * length.
     */
    export class PingPongDto {
        constructor(t?: number, length?: number) {
            if (t !== undefined) { this.t = t; }
            if (length !== undefined) { this.length = length; }
        }
        /**
         * The running value, such as elapsed time; it may grow without limit.
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        t = 0.5;
        /**
         * The turning point: the result rises to it, then falls back to 0.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        length = 1;
    }
    /**
     * A current value, a target and a step limit for `math.moveTowards`.
     */
    export class MoveTowardsDto {
        constructor(current?: number, target?: number, maxDelta?: number) {
            if (current !== undefined) { this.current = current; }
            if (target !== undefined) { this.target = target; }
            if (maxDelta !== undefined) { this.maxDelta = maxDelta; }
        }
        /**
         * The value to move.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        current = 0;
        /**
         * The value to move toward; it is never overshot.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        target = 1;
        /**
         * The largest change allowed in one step.
         * @default 0.1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.01
         */
        maxDelta = 0.1;
    }
    /**
     * An expression written as text for `math.evalArithmetic`.
     */
    export class EvalArithmeticDto {
        constructor(expression?: string) {
            if (expression !== undefined) { this.expression = expression; }
        }
        /**
         * The expression: numbers, `+`, `-`, the multiplication sign, `/`, parentheses and spaces,
         * such as `(3 + 2) / 4`.
         * @default 1+1
         */
        expression = "1+1";
    }
}
