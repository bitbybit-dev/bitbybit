import * as Inputs from "../inputs";

/**
 * Arithmetic, rounding, ranges, random numbers and the trigonometric functions on plain numbers.
 * The trigonometric functions take and give angles in radians; `degToRad` and `radToDeg` convert at
 * the boundary, because almost every angle a user types is in degrees. The interpolation helpers
 * (`lerp`, `remap`, `ease`, `smoothstep`, `pingPong`) are the building blocks of animation and
 * parametric variation.
 */
export class MathBitByBit {

    /**
     * Passes a number through unchanged, so a value can be given a name and reused.
     *
     * Example: 42 -> 42
     * @param inputs - The number
     * @returns The same number
     * @group create
     * @shortname number
     * @drawable false
     */
    number(inputs: Inputs.Math.NumberDto): number {
        return inputs.number;
    }

    /**
     * Applies one arithmetic operation to two numbers: add, subtract, multiply, divide, power or
     * modulus.
     *
     * The operation reads `first` then `second`: subtract gives first minus second, power gives
     * first to the power of second.
     * Example: 5 add 3 -> 8, 10 modulus 3 -> 1, 2 power 3 -> 8
     * @param inputs - The two numbers and the operation
     * @returns The result of the operation
     * @group operations
     * @shortname two numbers
     * @drawable false
     * @example
     * ```typescript
     * const result = bitbybit.math.twoNrOperation({ first: 2, second: 3, operation: Bit.Inputs.Math.mathTwoNrOperatorEnum.power });
     * ```
     */
    twoNrOperation(inputs: Inputs.Math.ActionOnTwoNumbersDto): number {
        let result!: number;
        switch (inputs.operation) {
            case Inputs.Math.mathTwoNrOperatorEnum.add:
                result = inputs.first + inputs.second;
                break;
            case Inputs.Math.mathTwoNrOperatorEnum.subtract:
                result = inputs.first - inputs.second;
                break;
            case Inputs.Math.mathTwoNrOperatorEnum.multiply:
                result = inputs.first * inputs.second;
                break;
            case Inputs.Math.mathTwoNrOperatorEnum.divide:
                result = inputs.first / inputs.second;
                break;
            case Inputs.Math.mathTwoNrOperatorEnum.power:
                result = Math.pow(inputs.first, inputs.second);
                break;
            case Inputs.Math.mathTwoNrOperatorEnum.modulus:
                result = inputs.first % inputs.second;
                break;
            default:
                break;
        }
        return result;
    }

    /**
     * Finds the remainder after dividing one number by another.
     *
     * The sign follows the first number, as it does in JavaScript.
     * Example: 10 modulus 3 -> 1, 17 modulus 5 -> 2
     * @param inputs - The number to divide and the number to divide by
     * @returns The remainder
     * @group operations
     * @shortname modulus
     * @drawable false
     * @example
     * ```typescript
     * const remainder = bitbybit.math.modulus({ number: 17, modulus: 5 });
     * ```
     */
    modulus(inputs: Inputs.Math.ModulusDto): number {
        return this.twoNrOperation({ first: inputs.number, second: inputs.modulus, operation: Inputs.Math.mathTwoNrOperatorEnum.modulus });
    }

    /**
     * Rounds a number to a given number of decimal places.
     *
     * Example: 1.32156 to 3 places -> 1.322
     * @param inputs - The number and how many decimal places to keep
     * @returns The rounded number
     * @group operations
     * @shortname round to decimals
     * @drawable false
     * @example
     * ```typescript
     * const rounded = bitbybit.math.roundToDecimals({ number: 1.32156, decimalPlaces: 3 });
     * ```
     */
    roundToDecimals(inputs: Inputs.Math.RoundToDecimalsDto): number {
        return Math.round(inputs.number * Math.pow(10, inputs.decimalPlaces)) / Math.pow(10, inputs.decimalPlaces);
    }

    /**
     * Rounds a number to a given number of decimal places and drops the zeros at the end.
     *
     * As a number the result cannot carry trailing zeros anyway; the difference from
     * `roundToDecimals` is that floating-point noise such as 1.320000001 is cleaned to 1.32.
     * Example: 1.32156 to 3 places -> 1.322, 1.320000001 -> 1.32, 1.000 -> 1
     * @param inputs - The number and how many decimal places to keep
     * @returns The rounded number
     * @group operations
     * @shortname round trim zeros
     * @drawable false
     * @example
     * ```typescript
     * const clean = bitbybit.math.roundAndRemoveTrailingZeros({ number: 1.320000001, decimalPlaces: 3 });
     * ```
     */
    roundAndRemoveTrailingZeros(inputs: Inputs.Math.RoundToDecimalsDto): number {
        const rounded = Math.round(inputs.number * Math.pow(10, inputs.decimalPlaces)) / Math.pow(10, inputs.decimalPlaces);
        return parseFloat(rounded.toFixed(inputs.decimalPlaces));
    }

    /**
     * Applies one operation to a single number: absolute, negate, square root, rounding,
     * logarithms, the trigonometric functions and their inverses, exponential, or a conversion
     * between radians and degrees.
     *
     * The trigonometric functions work in radians.
     * Example: sqrt of 5 -> 2.236, absolute of -3 -> 3
     * @param inputs - The number and the operation
     * @returns The result of the operation
     * @group operations
     * @shortname one number
     * @drawable false
     * @example
     * ```typescript
     * const root = bitbybit.math.oneNrOperation({ number: 5, operation: Bit.Inputs.Math.mathOneNrOperatorEnum.sqrt });
     * ```
     */
    oneNrOperation(inputs: Inputs.Math.ActionOnOneNumberDto): number {
        let result!: number;
        switch (inputs.operation) {
            case Inputs.Math.mathOneNrOperatorEnum.absolute:
                result = Math.abs(inputs.number);
                break;
            case Inputs.Math.mathOneNrOperatorEnum.negate:
                result = -inputs.number;
                break;
            case Inputs.Math.mathOneNrOperatorEnum.ln:
                result = Math.log(inputs.number);
                break;
            case Inputs.Math.mathOneNrOperatorEnum.log10:
                result = Math.log10(inputs.number);
                break;
            case Inputs.Math.mathOneNrOperatorEnum.tenPow:
                result = Math.pow(10, inputs.number);
                break;
            case Inputs.Math.mathOneNrOperatorEnum.round:
                result = Math.round(inputs.number);
                break;
            case Inputs.Math.mathOneNrOperatorEnum.floor:
                result = Math.floor(inputs.number);
                break;
            case Inputs.Math.mathOneNrOperatorEnum.ceil:
                result = Math.ceil(inputs.number);
                break;
            case Inputs.Math.mathOneNrOperatorEnum.sqrt:
                result = Math.sqrt(inputs.number);
                break;
            case Inputs.Math.mathOneNrOperatorEnum.sin:
                result = Math.sin(inputs.number);
                break;
            case Inputs.Math.mathOneNrOperatorEnum.cos:
                result = Math.cos(inputs.number);
                break;
            case Inputs.Math.mathOneNrOperatorEnum.tan:
                result = Math.tan(inputs.number);
                break;
            case Inputs.Math.mathOneNrOperatorEnum.asin:
                result = Math.asin(inputs.number);
                break;
            case Inputs.Math.mathOneNrOperatorEnum.acos:
                result = Math.acos(inputs.number);
                break;
            case Inputs.Math.mathOneNrOperatorEnum.atan:
                result = Math.atan(inputs.number);
                break;
            case Inputs.Math.mathOneNrOperatorEnum.log:
                result = Math.log(inputs.number);
                break;
            case Inputs.Math.mathOneNrOperatorEnum.exp:
                result = Math.exp(inputs.number);
                break;
            case Inputs.Math.mathOneNrOperatorEnum.degToRad:
                result = inputs.number * Math.PI / 180;
                break;
            case Inputs.Math.mathOneNrOperatorEnum.radToDeg:
                result = inputs.number * 180 / Math.PI;
                break;
            default:
                break;
        }
        return result;
    }

    /**
     * Maps a number from one range onto another, keeping its relative position.
     *
     * A number outside the source range maps proportionally beyond the target range.
     * Example: 5 from [0,10] to [0,100] -> 50, 0.5 from [0,1] to [-10,10] -> 0
     * @param inputs - The number, the range it is in and the range to map it to
     * @returns The number at the same relative position in the target range
     * @group operations
     * @shortname remap
     * @drawable false
     * @example
     * ```typescript
     * const percent = bitbybit.math.remap({ number: 5, fromLow: 0, fromHigh: 10, toLow: 0, toHigh: 100 });
     * ```
     */
    remap(inputs: Inputs.Math.RemapNumberDto): number {
        return (inputs.number - inputs.fromLow) * (inputs.toHigh - inputs.toLow) / (inputs.fromHigh - inputs.fromLow) + inputs.toLow;
    }

    /**
     * Gives a random number from 0 up to, but not including, 1.
     *
     * Example: 0.342, 0.891 or any other value in that range
     * @returns A random number between 0 and 1
     * @group generate
     * @shortname random 0 - 1
     * @drawable false
     */
    random(): number {
        return Math.random();
    }

    /**
     * Gives a random number between `low` and `high`.
     *
     * Example: low 0, high 10 -> 3.7, 8.2 or any other value between them
     * @param inputs - The low and high ends of the range
     * @returns A random number in the range
     * @group generate
     * @shortname random number
     * @drawable false
     * @example
     * ```typescript
     * const value = bitbybit.math.randomNumber({ low: 0, high: 10 });
     * ```
     */
    randomNumber(inputs: Inputs.Math.RandomNumberDto): number {
        return Math.random() * (inputs.high - inputs.low) + inputs.low;
    }

    /**
     * Gives a list of random numbers between `low` and `high`.
     *
     * Example: low 0, high 10, count 3 -> [2.5, 7.1, 4.8]
     * @param inputs - The low and high ends of the range and how many numbers to make
     * @returns The random numbers
     * @group generate
     * @shortname random numbers
     * @drawable false
     * @example
     * ```typescript
     * const values = bitbybit.math.randomNumbers({ low: 0, high: 10, count: 3 });
     * ```
     */
    randomNumbers(inputs: Inputs.Math.RandomNumbersDto): number[] {
        const result = [];
        for (let i = 0; i < inputs.count; i++) {
            result.push(this.randomNumber(inputs));
        }
        return result;
    }

    /**
     * Gives the constant pi, the ratio of a circle's circumference to its diameter.
     *
     * Example: 3.141592653589793
     * @returns The number pi
     * @group generate
     * @shortname π
     * @drawable false
     */
    pi(): number {
        return Math.PI;
    }

    /**
     * Formats a number as text with a fixed number of decimal places, keeping trailing zeros.
     *
     * Example: 3.14159 with 2 places -> '3.14', 5 with 3 places -> '5.000'
     * @param inputs - The number and how many decimal places to show
     * @returns The formatted text
     * @group operations
     * @shortname to fixed
     * @drawable false
     * @example
     * ```typescript
     * const label = bitbybit.math.toFixed({ number: 3.14159, decimalPlaces: 2 });
     * ```
     */
    toFixed(inputs: Inputs.Math.ToFixedDto): string {
        return inputs.number.toFixed(inputs.decimalPlaces);
    }

    /**
     * Adds two numbers.
     *
     * Example: 5 and 3 -> 8, -2 and 7 -> 5
     * @param inputs - The two numbers
     * @returns Their sum
     * @group basics
     * @shortname add
     * @drawable false
     * @example
     * ```typescript
     * const sum = bitbybit.math.add({ first: 5, second: 3 });
     * ```
     */
    add(inputs: Inputs.Math.TwoNumbersDto): number {
        return inputs.first + inputs.second;
    }

    /**
     * Subtracts the second number from the first.
     *
     * Example: 10 and 3 -> 7, 5 and 8 -> -3
     * @param inputs - The number to subtract from and the number to subtract
     * @returns Their difference
     * @group basics
     * @shortname subtract
     * @drawable false
     * @example
     * ```typescript
     * const difference = bitbybit.math.subtract({ first: 10, second: 3 });
     * ```
     */
    subtract(inputs: Inputs.Math.TwoNumbersDto): number {
        return inputs.first - inputs.second;
    }

    /**
     * Multiplies two numbers.
     *
     * Example: 5 and 3 -> 15, -2 and 4 -> -8
     * @param inputs - The two numbers
     * @returns Their product
     * @group basics
     * @shortname multiply
     * @drawable false
     * @example
     * ```typescript
     * const product = bitbybit.math.multiply({ first: 5, second: 3 });
     * ```
     */
    multiply(inputs: Inputs.Math.TwoNumbersDto): number {
        return inputs.first * inputs.second;
    }

    /**
     * Divides the first number by the second.
     *
     * Dividing by 0 gives Infinity, as in JavaScript.
     * Example: 10 and 2 -> 5, 7 and 2 -> 3.5
     * @param inputs - The number to divide and the number to divide by
     * @returns Their quotient
     * @group basics
     * @shortname divide
     * @drawable false
     * @example
     * ```typescript
     * const quotient = bitbybit.math.divide({ first: 7, second: 2 });
     * ```
     */
    divide(inputs: Inputs.Math.TwoNumbersDto): number {
        return inputs.first / inputs.second;
    }

    /**
     * Raises the first number to the power of the second.
     *
     * Example: 2 to the 3 -> 8, 5 to the 2 -> 25, 10 to the -1 -> 0.1
     * @param inputs - The base and the exponent
     * @returns The power
     * @group basics
     * @shortname power
     * @drawable false
     * @example
     * ```typescript
     * const cube = bitbybit.math.power({ first: 2, second: 3 });
     * ```
     */
    power(inputs: Inputs.Math.TwoNumbersDto): number {
        return Math.pow(inputs.first, inputs.second);
    }

    /**
     * Finds the square root of a number.
     *
     * A negative number gives NaN.
     * Example: 9 -> 3, 2 -> 1.414
     * @param inputs - The number
     * @returns The square root
     * @group basics
     * @shortname sqrt
     * @drawable false
     */
    sqrt(inputs: Inputs.Math.NumberDto): number {
        return Math.sqrt(inputs.number);
    }

    /**
     * Drops the sign of a number, so the result is never negative.
     *
     * Example: -5 -> 5, 3 -> 3, 0 -> 0
     * @param inputs - The number
     * @returns The absolute value
     * @group basics
     * @shortname abs
     * @drawable false
     */
    abs(inputs: Inputs.Math.NumberDto): number {
        return Math.abs(inputs.number);
    }

    /**
     * Rounds a number to the nearest whole number; halves round up.
     *
     * Example: 3.7 -> 4, 2.3 -> 2, 5.5 -> 6
     * @param inputs - The number
     * @returns The nearest whole number
     * @group basics
     * @shortname round
     * @drawable false
     */
    round(inputs: Inputs.Math.NumberDto): number {
        return Math.round(inputs.number);
    }

    /**
     * Rounds a number down to the whole number below it.
     *
     * Example: 3.7 -> 3, -2.3 -> -3, 5 -> 5
     * @param inputs - The number
     * @returns The whole number below
     * @group basics
     * @shortname floor
     * @drawable false
     */
    floor(inputs: Inputs.Math.NumberDto): number {
        return Math.floor(inputs.number);
    }

    /**
     * Rounds a number up to the whole number above it.
     *
     * Example: 3.2 -> 4, -2.8 -> -2, 5 -> 5
     * @param inputs - The number
     * @returns The whole number above
     * @group basics
     * @shortname ceil
     * @drawable false
     */
    ceil(inputs: Inputs.Math.NumberDto): number {
        return Math.ceil(inputs.number);
    }

    /**
     * Flips the sign of a number.
     *
     * Example: 5 -> -5, -3 -> 3, 0 -> 0
     * @param inputs - The number
     * @returns The number with the opposite sign
     * @group basics
     * @shortname negate
     * @drawable false
     */
    negate(inputs: Inputs.Math.NumberDto): number {
        return -inputs.number;
    }

    /**
     * Finds the natural logarithm of a number: the power e must be raised to for that number.
     *
     * Example: 2.718 -> about 1, 1 -> 0
     * @param inputs - The number, greater than 0
     * @returns The natural logarithm
     * @group basics
     * @shortname ln
     * @drawable false
     */
    ln(inputs: Inputs.Math.NumberDto): number {
        return Math.log(inputs.number);
    }

    /**
     * Finds the base-10 logarithm of a number: the power 10 must be raised to for that number.
     *
     * Example: 100 -> 2, 1000 -> 3, 10 -> 1
     * @param inputs - The number, greater than 0
     * @returns The base-10 logarithm
     * @group basics
     * @shortname log10
     * @drawable false
     */
    log10(inputs: Inputs.Math.NumberDto): number {
        return Math.log10(inputs.number);
    }

    /**
     * Raises 10 to the power of a number.
     *
     * Example: 2 -> 100, 3 -> 1000, -1 -> 0.1
     * @param inputs - The exponent
     * @returns 10 to that power
     * @group basics
     * @shortname ten pow
     * @drawable false
     */
    tenPow(inputs: Inputs.Math.NumberDto): number {
        return Math.pow(10, inputs.number);
    }

    /**
     * Finds the sine of an angle given in radians.
     *
     * Example: 0 -> 0, pi/2 -> 1
     * @param inputs - The angle in radians
     * @returns The sine, between -1 and 1
     * @group basics
     * @shortname sin
     * @drawable false
     */
    sin(inputs: Inputs.Math.NumberDto): number {
        return Math.sin(inputs.number);
    }

    /**
     * Finds the cosine of an angle given in radians.
     *
     * Example: 0 -> 1, pi -> -1
     * @param inputs - The angle in radians
     * @returns The cosine, between -1 and 1
     * @group basics
     * @shortname cos
     * @drawable false
     */
    cos(inputs: Inputs.Math.NumberDto): number {
        return Math.cos(inputs.number);
    }

    /**
     * Finds the tangent of an angle given in radians.
     *
     * Example: 0 -> 0, pi/4 -> about 1
     * @param inputs - The angle in radians
     * @returns The tangent
     * @group basics
     * @shortname tan
     * @drawable false
     */
    tan(inputs: Inputs.Math.NumberDto): number {
        return Math.tan(inputs.number);
    }

    /**
     * Finds the angle, in radians, whose sine is the given number.
     *
     * Example: 0 -> 0, 1 -> pi/2 (about 1.57)
     * @param inputs - A number between -1 and 1
     * @returns The angle in radians
     * @group basics
     * @shortname asin
     * @drawable false
     */
    asin(inputs: Inputs.Math.NumberDto): number {
        return Math.asin(inputs.number);
    }

    /**
     * Finds the angle, in radians, whose cosine is the given number.
     *
     * Example: 1 -> 0, -1 -> pi (about 3.14)
     * @param inputs - A number between -1 and 1
     * @returns The angle in radians
     * @group basics
     * @shortname acos
     * @drawable false
     */
    acos(inputs: Inputs.Math.NumberDto): number {
        return Math.acos(inputs.number);
    }

    /**
     * Finds the angle, in radians, whose tangent is the given number.
     *
     * Example: 0 -> 0, 1 -> pi/4 (about 0.785)
     * @param inputs - The number
     * @returns The angle in radians, between -pi/2 and pi/2
     * @group basics
     * @shortname atan
     * @drawable false
     */
    atan(inputs: Inputs.Math.NumberDto): number {
        return Math.atan(inputs.number);
    }

    /**
     * Raises e, the base of the natural logarithm, to the power of a number.
     *
     * Example: 0 -> 1, 1 -> about 2.718, 2 -> about 7.389
     * @param inputs - The exponent
     * @returns e to that power
     * @group basics
     * @shortname exp
     * @drawable false
     */
    exp(inputs: Inputs.Math.NumberDto): number {
        return Math.exp(inputs.number);
    }

    /**
     * Converts an angle from degrees to radians.
     *
     * Example: 180 -> pi (about 3.14159), 90 -> pi/2
     * @param inputs - The angle in degrees
     * @returns The angle in radians
     * @group basics
     * @shortname deg to rad
     * @drawable false
     */
    degToRad(inputs: Inputs.Math.NumberDto): number {
        return inputs.number * Math.PI / 180;
    }

    /**
     * Converts an angle from radians to degrees.
     *
     * Example: pi -> 180, pi/2 -> 90
     * @param inputs - The angle in radians
     * @returns The angle in degrees
     * @group basics
     * @shortname rad to deg
     * @drawable false
     */
    radToDeg(inputs: Inputs.Math.NumberDto): number {
        return inputs.number * 180 / Math.PI;
    }

    /**
     * Maps a value from 0 to 1 onto the range `min` to `max` along an easing curve, so the result
     * speeds up or slows down instead of changing evenly.
     *
     * An `easeIn` curve starts slowly, an `easeOut` curve ends slowly, an `easeInOut` curve does
     * both.
     * Example: 0.5 from [0,100] with easeInQuad -> 25
     * @param inputs - The value between 0 and 1, the target range and the easing curve
     * @returns The eased value in the target range
     * @group operations
     * @shortname ease
     * @drawable false
     * @example
     * ```typescript
     * const eased = bitbybit.math.ease({ x: 0.5, min: 0, max: 100, ease: Bit.Inputs.Math.easeEnum.easeInQuad });
     * ```
     */
    ease(inputs: Inputs.Math.EaseDto) {
        const x = inputs.x;
        const min = inputs.min;
        const max = inputs.max;

        const y = this[inputs.ease](x);
        const res = this.remap({ number: y, fromLow: 0, fromHigh: 1, toLow: min, toHigh: max });
        return res;
    }

    /**
     * Keeps a number within a range: below `min` becomes `min`, above `max` becomes `max`.
     *
     * Example: 5 in [0,3] -> 3, -1 in [0,3] -> 0, 1.5 in [0,3] -> 1.5
     * @param inputs - The number and the range to keep it in
     * @returns The number, limited to the range
     * @group operations
     * @shortname clamp
     * @drawable false
     * @example
     * ```typescript
     * const limited = bitbybit.math.clamp({ number: 5, min: 0, max: 3 });
     * ```
     */
    clamp(inputs: Inputs.Math.ClampDto): number {
        return Math.max(inputs.min, Math.min(inputs.max, inputs.number));
    }

    /**
     * Blends from a start value to an end value by a fraction `t`: 0 gives the start, 1 the end,
     * 0.5 the midpoint.
     *
     * A `t` outside 0 to 1 extrapolates past the ends.
     * Example: 0 to 100 at 0.5 -> 50, 10 to 20 at 0.25 -> 12.5
     * @param inputs - The start value, the end value and the fraction
     * @returns The blended value
     * @group operations
     * @shortname lerp
     * @drawable false
     * @example
     * ```typescript
     * const mid = bitbybit.math.lerp({ start: 10, end: 20, t: 0.25 });
     * ```
     */
    lerp(inputs: Inputs.Math.LerpDto): number {
        return inputs.start + (inputs.end - inputs.start) * inputs.t;
    }

    /**
     * Finds where a value sits between a start and an end, as a fraction: the `t` that `lerp` would
     * need to produce it.
     *
     * Example: 5 in [0,10] -> 0.5, 2.5 in [0,10] -> 0.25
     * @param inputs - The start value, the end value and the value to locate
     * @returns The fraction from start to end
     * @group operations
     * @shortname inverse lerp
     * @drawable false
     * @example
     * ```typescript
     * const fraction = bitbybit.math.inverseLerp({ start: 0, end: 10, value: 2.5 });
     * ```
     */
    inverseLerp(inputs: Inputs.Math.InverseLerpDto): number {
        if (inputs.start === inputs.end) {
            return 0;
        }
        return (inputs.value - inputs.start) / (inputs.end - inputs.start);
    }

    /**
     * Turns a value from 0 to 1 into a smooth S-curve that starts and ends gently; the value is
     * clamped to that range first.
     *
     * Example: 0 -> 0, 0.5 -> 0.5, 0.25 -> 0.156
     * @param inputs - The value between 0 and 1
     * @returns The smoothed value between 0 and 1
     * @group operations
     * @shortname smoothstep
     * @drawable false
     */
    smoothstep(inputs: Inputs.Math.NumberDto): number {
        const t = Math.max(0, Math.min(1, inputs.number));
        return t * t * (3 - 2 * t);
    }

    /**
     * Tells the sign of a number: -1 when negative, 0 when zero, 1 when positive.
     *
     * Example: -5 -> -1, 0 -> 0, 3.14 -> 1
     * @param inputs - The number
     * @returns -1, 0 or 1
     * @group operations
     * @shortname sign
     * @drawable false
     */
    sign(inputs: Inputs.Math.NumberDto): number {
        return Math.sign(inputs.number);
    }

    /**
     * Keeps the part of a number after the decimal point, measured up from the whole number below
     * it, so the result is always from 0 up to 1.
     *
     * Example: 3.14 -> 0.14, -2.3 -> 0.7
     * @param inputs - The number
     * @returns The fractional part, from 0 up to 1
     * @group operations
     * @shortname fract
     * @drawable false
     */
    fract(inputs: Inputs.Math.NumberDto): number {
        return inputs.number - Math.floor(inputs.number);
    }

    /**
     * Wraps a number into a range so it cycles round: past `max` it comes back in at `min`, and
     * below `min` it comes back in at `max`.
     *
     * Useful for angles and repeating patterns; unlike a plain modulus it handles negative numbers.
     * Example: 1.5 in [0,1) -> 0.5, -0.3 in [0,1) -> 0.7, 370 in [0,360) -> 10
     * @param inputs - The number and the range to wrap it into
     * @returns The wrapped number, from min up to max
     * @group operations
     * @shortname wrap
     * @drawable false
     * @example
     * ```typescript
     * const angle = bitbybit.math.wrap({ number: 370, min: 0, max: 360 });
     * ```
     */
    wrap(inputs: Inputs.Math.WrapDto): number {
        const range = inputs.max - inputs.min;
        if (range === 0) {
            return inputs.min;
        }
        const normalized = (inputs.number - inputs.min) % range;
        return normalized < 0 ? normalized + inputs.max : normalized + inputs.min;
    }

    /**
     * Bounces a value back and forth between 0 and `length` as `t` grows: up to `length`, back down
     * to 0, and again.
     *
     * Example: length 1 at t 0.5 -> 0.5, t 1 -> 1, t 1.5 -> 0.5, t 2 -> 0
     * @param inputs - The running value and the length to bounce within
     * @returns The bounced value between 0 and length
     * @group operations
     * @shortname ping pong
     * @drawable false
     * @example
     * ```typescript
     * const bounce = bitbybit.math.pingPong({ t: 1.5, length: 1 });
     * ```
     */
    pingPong(inputs: Inputs.Math.PingPongDto): number {
        const t = Math.abs(inputs.t) % (inputs.length * 2);
        return t > inputs.length ? inputs.length * 2 - t : t;
    }

    /**
     * Moves a value toward a target by at most `maxDelta`, without overshooting it.
     *
     * Example: 0 toward 10 by 3 -> 3, 8 toward 10 by 3 -> 10
     * @param inputs - The current value, the target and the largest step allowed
     * @returns The value after one step
     * @group operations
     * @shortname move towards
     * @drawable false
     * @example
     * ```typescript
     * const next = bitbybit.math.moveTowards({ current: 8, target: 10, maxDelta: 3 });
     * ```
     */
    moveTowards(inputs: Inputs.Math.MoveTowardsDto): number {
        const delta = inputs.target - inputs.current;
        if (Math.abs(delta) <= inputs.maxDelta) {
            return inputs.target;
        }
        return inputs.current + Math.sign(delta) * inputs.maxDelta;
    }

    /**
     * Works out a simple arithmetic expression written as text: numbers, +, -, the multiplication
     * sign, /, parentheses and spaces.
     *
     * The expression is parsed and computed by the library itself, never handed to the JavaScript
     * engine to run, so it is safe with text a user typed.
     * Example: '(3+2) times 4' written with the sign -> 20, '10/3' -> 3.3333
     * @param inputs - The expression text
     * @returns The computed value
     * @group operations
     * @shortname eval arithmetic
     * @drawable false
     * @example
     * ```typescript
     * const value = bitbybit.math.evalArithmetic({ expression: "(3 + 2) * 4" });
     * ```
     */
    evalArithmetic(inputs: Inputs.Math.EvalArithmeticDto): number {
        const expr = inputs.expression;
        const tokens: string[] = [];
        let i = 0;
        while (i < expr.length) {
            const ch = expr[i]!;
            if (ch === " ") { i++; continue; }
            if (ch === "(" || ch === ")") { tokens.push(ch); i++; continue; }
            if (ch === "+" || ch === "*" || ch === "/") { tokens.push(ch); i++; continue; }
            if (ch === "-") {
                const prev = tokens.length > 0 ? tokens[tokens.length - 1] : undefined;
                if (prev === undefined || prev === "(" || prev === "+" || prev === "-" || prev === "*" || prev === "/") {
                    let num = "-";
                    i++;
                    while (i < expr.length && (expr[i]! >= "0" && expr[i]! <= "9" || expr[i] === ".")) {
                        num += expr[i]; i++;
                    }
                    if (num === "-") { throw new Error("Invalid expression"); }
                    tokens.push(num);
                    continue;
                }
                tokens.push(ch); i++; continue;
            }
            if ((ch >= "0" && ch <= "9") || ch === ".") {
                let num = "";
                while (i < expr.length && (expr[i]! >= "0" && expr[i]! <= "9" || expr[i] === ".")) {
                    num += expr[i]; i++;
                }
                tokens.push(num);
                continue;
            }
            throw new Error("Invalid character in expression");
        }

        const output: number[] = [];
        const ops: string[] = [];
        const prec: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };

        const applyOp = () => {
            const op = ops.pop()!;
            const b = output.pop()!;
            const a = output.pop()!;
            switch (op) {
                case "+": output.push(a + b); break;
                case "-": output.push(a - b); break;
                case "*": output.push(a * b); break;
                case "/": output.push(a / b); break;
            }
        };

        for (const tok of tokens) {
            if (tok === "(") {
                ops.push(tok);
            } else if (tok === ")") {
                while (ops.length > 0 && ops[ops.length - 1] !== "(") { applyOp(); }
                if (ops.length === 0) { throw new Error("Mismatched parentheses"); }
                ops.pop();
            } else if (tok in prec) {
                while (ops.length > 0 && ops[ops.length - 1] !== "(" && (prec[ops[ops.length - 1]!] ?? 0) >= prec[tok]!) {
                    applyOp();
                }
                ops.push(tok);
            } else {
                const n = parseFloat(tok);
                if (isNaN(n)) { throw new Error("Invalid number"); }
                output.push(n);
            }
        }
        while (ops.length > 0) {
            if (ops[ops.length - 1] === "(") { throw new Error("Mismatched parentheses"); }
            applyOp();
        }
        if (output.length !== 1) { throw new Error("Invalid expression"); }
        return output[0]!;
    }

    private easeInSine(x: number): number {
        return 1 - Math.cos((x * Math.PI) / 2);
    }

    private easeOutSine(x: number): number {
        return Math.sin((x * Math.PI) / 2);
    }

    private easeInOutSine(x: number): number {
        return -(Math.cos(Math.PI * x) - 1) / 2;
    }

    private easeInQuad(x: number): number {
        return x * x;
    }

    private easeOutQuad(x: number): number {
        return 1 - (1 - x) * (1 - x);
    }

    private easeInOutQuad(x: number): number {
        return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    }

    private easeInCubic(x: number): number {
        return x * x * x;
    }

    private easeOutCubic(x: number): number {
        return 1 - Math.pow(1 - x, 3);
    }

    private easeInOutCubic(x: number): number {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    private easeInQuart(x: number): number {
        return x * x * x * x;
    }

    private easeOutQuart(x: number): number {
        return 1 - Math.pow(1 - x, 4);
    }

    private easeInOutQuart(x: number): number {
        return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
    }

    private easeInQuint(x: number): number {
        return x * x * x * x * x;
    }

    private easeOutQuint(x: number): number {
        return 1 - Math.pow(1 - x, 5);
    }

    private easeInOutQuint(x: number): number {
        return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
    }

    private easeInExpo(x: number): number {
        return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
    }

    private easeOutExpo(x: number): number {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    }

    private easeInOutExpo(x: number): number {
        return x === 0
            ? 0
            : x === 1
                ? 1
                : x < 0.5
                    ? Math.pow(2, 20 * x - 10) / 2
                    : (2 - Math.pow(2, -20 * x + 10)) / 2;
    }

    private easeInCirc(x: number): number {
        return 1 - Math.sqrt(1 - x * x);
    }

    private easeOutCirc(x: number): number {
        return Math.sqrt(1 - Math.pow(x - 1, 2));
    }

    private easeInOutCirc(x: number): number {
        return x < 0.5
            ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
            : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
    }

    private easeInBack(x: number): number {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return c3 * x * x * x - c1 * x * x;
    }

    private easeOutBack(x: number): number {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    private easeInOutBack(x: number): number {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        return x < 0.5
            ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
            : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
    }

    private easeInElastic(x: number): number {
        const c4 = (2 * Math.PI) / 3;
        return x === 0
            ? 0
            : x === 1
                ? 1
                : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
    }

    private easeOutElastic(x: number): number {
        const c4 = (2 * Math.PI) / 3;
        return x === 0
            ? 0
            : x === 1
                ? 1
                : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    }

    private easeInOutElastic(x: number): number {
        const c5 = (2 * Math.PI) / 4.5;
        return x === 0
            ? 0
            : x === 1
                ? 1
                : x < 0.5
                    ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
                    : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
    }

    private easeInBounce(x: number): number {
        return 1 - this.easeOutBounce(1 - x);
    }

    private easeOutBounce(x: number): number {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (x < 1 / d1) {
            return n1 * x * x;
        } else if (x < 2 / d1) {
            return n1 * (x -= 1.5 / d1) * x + 0.75;
        } else if (x < 2.5 / d1) {
            return n1 * (x -= 2.25 / d1) * x + 0.9375;
        } else {
            return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
    }

    private easeInOutBounce(x: number): number {
        return x < 0.5
            ? (1 - this.easeOutBounce(1 - 2 * x)) / 2
            : (1 + this.easeOutBounce(2 * x - 1)) / 2;
    }

}
