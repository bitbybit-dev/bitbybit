import * as Inputs from "../inputs";

/**
 * Contains various math methods.
 */
export class MathBitByBit {

    /**
     * Creates and returns a number value (pass-through for number input).
     * Example: Input 42 → 42, Input 3.14 → 3.14
     * @param inputs a number to be created
     * @returns number
     * @group create
     * @shortname number
     * @drawable false
     */
    number(inputs: Inputs.Math.NumberDto): number {
        return inputs.number;
    }

    /**
     * Performs basic arithmetic operations on two numbers (add, subtract, multiply, divide, power, modulus).
     * Example: 5 + 3 → 8, 10 % 3 → 1, 2 ^ 3 → 8
     * @param inputs two numbers and operator
     * @returns Result of math operation action
     * @group operations
     * @shortname two numbers
     * @drawable false
     */
    twoNrOperation(inputs: Inputs.Math.ActionOnTwoNumbersDto): number {
        let result;
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
     * Calculates the remainder after division (modulus operation).
     * Example: 10 % 3 → 1, 17 % 5 → 2
     * @param inputs two numbers and operator
     * @returns Result of modulus operation
     * @group operations
     * @shortname modulus
     * @drawable false
     */
    modulus(inputs: Inputs.Math.ModulusDto): number {
        return this.twoNrOperation({ first: inputs.number, second: inputs.modulus, operation: Inputs.Math.mathTwoNrOperatorEnum.modulus });
    }

    /**
     * Rounds a number to specified decimal places.
     * Example: 1.32156 with 3 decimals returns 1.322
     * @param inputs a number and decimal places
     * @returns Result of rounding
     * @group operations
     * @shortname round to decimals
     * @drawable false
     */
    roundToDecimals(inputs: Inputs.Math.RoundToDecimalsDto): number {
        return Math.round(inputs.number * Math.pow(10, inputs.decimalPlaces)) / Math.pow(10, inputs.decimalPlaces);
    }

    /**
     * Rounds a number to specified decimal places and removes trailing zeros.
     * Example: 1.32156 with 3 decimals returns 1.322, but 1.320000001 returns 1.32, and 1.000 returns 1
     * @param inputs a number and decimal places
     * @returns Result of rounding as a number without trailing zeros
     * @group operations
     * @shortname round trim zeros
     * @drawable false
     */
    roundAndRemoveTrailingZeros(inputs: Inputs.Math.RoundToDecimalsDto): number {
        const rounded = Math.round(inputs.number * Math.pow(10, inputs.decimalPlaces)) / Math.pow(10, inputs.decimalPlaces);
        return parseFloat(rounded.toFixed(inputs.decimalPlaces));
    }

    /**
     * Performs mathematical operations on a single number (absolute, negate, sqrt, trig functions, logarithms, etc.).
     * Example: sqrt(5) → 2.236, abs(-3) → 3, sin(π/2) → 1
     * @param inputs one number and operator action
     * @returns Result of math operation
     * @group operations
     * @shortname one number
     * @drawable false
     */
    oneNrOperation(inputs: Inputs.Math.ActionOnOneNumberDto): number {
        let result;
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
    * Maps a number from one range to another range proportionally.
    * Example: 5 from [0,10] to [0,100] → 50, 0.5 from [0,1] to [-10,10] → 0
    * @param inputs one number and operator action
    * @returns Result of mapping
    * @group operations
    * @shortname remap
    * @drawable false
    */
    remap(inputs: Inputs.Math.RemapNumberDto): number {
        return (inputs.number - inputs.fromLow) * (inputs.toHigh - inputs.toLow) / (inputs.fromHigh - inputs.fromLow) + inputs.toLow;
    }

    /**
    * Generates a random decimal number between 0 (inclusive) and 1 (exclusive).
    * Example: Outputs like 0.342, 0.891, or any value in [0, 1)
    * @returns A random number between 0 and 1
    * @group generate
    * @shortname random 0 - 1
    * @drawable false
    */
    random(): number {
        return Math.random();
    }

    /**
    * Generates a random number within a specified range (low to high).
    * Example: Range [0, 10] → outputs like 3.7, 8.2, or any value between 0 and 10
    * @param inputs low and high numbers
    * @returns A random number
    * @group generate
    * @shortname random number
    * @drawable false
    */
    randomNumber(inputs: Inputs.Math.RandomNumberDto): number {
        return Math.random() * (inputs.high - inputs.low) + inputs.low;
    }

    /**
    * Generates multiple random numbers within a specified range.
    * Example: Range [0, 10] with 3 items → [2.5, 7.1, 4.8]
    * @param inputs low and high numbers
    * @returns A list of random numbers
    * @group generate
    * @shortname random numbers
    * @drawable false
    */
    randomNumbers(inputs: Inputs.Math.RandomNumbersDto): number[] {
        const result = [];
        for (let i = 0; i < inputs.count; i++) {
            result.push(this.randomNumber(inputs));
        }
        return result;
    }

    /**
    * Returns the mathematical constant π (pi) ≈ 3.14159.
    * Example: Outputs 3.141592653589793
    * @returns A number PI
    * @group generate
    * @shortname π
    * @drawable false
    */
    pi(): number {
        return Math.PI;
    }

    /**
     * Formats a number as a string with a fixed number of decimal places (always shows trailing zeros).
     * Example: 3.14159 with 2 decimals → "3.14", 5 with 3 decimals → "5.000"
     * @param inputs a number to be rounded to decimal places
     * @returns number
     * @group operations
     * @shortname to fixed
     * @drawable false
     */
    toFixed(inputs: Inputs.Math.ToFixedDto): string {
        return inputs.number.toFixed(inputs.decimalPlaces);
    }

    /**
     * Adds two numbers together.
     * Example: 5 + 3 → 8, -2 + 7 → 5
     * @param inputs two numbers
     * @returns number
     * @group basics
     * @shortname add
     * @drawable false
     */
    add(inputs: Inputs.Math.TwoNumbersDto): number {
        return inputs.first + inputs.second;
    }

    /**
     * Subtracts the second number from the first.
     * Example: 10 - 3 → 7, 5 - 8 → -3
     * @param inputs two numbers
     * @returns number
     * @group basics
     * @shortname subtract
     * @drawable false
     */
    subtract(inputs: Inputs.Math.TwoNumbersDto): number {
        return inputs.first - inputs.second;
    }

    /**
     * Multiplies two numbers together.
     * Example: 5 × 3 → 15, -2 × 4 → -8
     * @param inputs two numbers
     * @returns number
     * @group basics
     * @shortname multiply
     * @drawable false
     */
    multiply(inputs: Inputs.Math.TwoNumbersDto): number {
        return inputs.first * inputs.second;
    }

    /**
     * Divides the first number by the second.
     * Example: 10 ÷ 2 → 5, 7 ÷ 2 → 3.5
     * @param inputs two numbers
     * @returns number
     * @group basics
     * @shortname divide
     * @drawable false
     */
    divide(inputs: Inputs.Math.TwoNumbersDto): number {
        return inputs.first / inputs.second;
    }

    /**
     * Raises the first number to the power of the second (exponentiation).
     * Example: 2³ → 8, 5² → 25, 10⁻¹ → 0.1
     * @param inputs two numbers
     * @returns number
     * @group basics
     * @shortname power
     * @drawable false
     */
    power(inputs: Inputs.Math.TwoNumbersDto): number {
        return Math.pow(inputs.first, inputs.second);
    }

    /**
     * Calculates the square root of a number.
     * Example: √9 → 3, √2 → 1.414, √16 → 4
     * @param inputs a number
     * @returns number
     * @group basics
     * @shortname sqrt
     * @drawable false
     */
    sqrt(inputs: Inputs.Math.NumberDto): number {
        return Math.sqrt(inputs.number);
    }

    /**
     * Returns the absolute value (removes negative sign, always positive or zero).
     * Example: |-5| → 5, |3| → 3, |0| → 0
     * @param inputs a number
     * @returns number
     * @group basics
     * @shortname abs
     * @drawable false
     */
    abs(inputs: Inputs.Math.NumberDto): number {
        return Math.abs(inputs.number);
    }

    /**
     * Rounds a number to the nearest integer.
     * Example: 3.7 → 4, 2.3 → 2, 5.5 → 6
     * @param inputs a number
     * @returns number
     * @group basics
     * @shortname round
     * @drawable false
     */
    round(inputs: Inputs.Math.NumberDto): number {
        return Math.round(inputs.number);
    }

    /**
     * Rounds a number down to the nearest integer (toward negative infinity).
     * Example: 3.7 → 3, -2.3 → -3, 5 → 5
     * @param inputs a number
     * @returns number
     * @group basics
     * @shortname floor
     * @drawable false
     */
    floor(inputs: Inputs.Math.NumberDto): number {
        return Math.floor(inputs.number);
    }

    /**
     * Rounds a number up to the nearest integer (toward positive infinity).
     * Example: 3.2 → 4, -2.8 → -2, 5 → 5
     * @param inputs a number
     * @returns number
     * @group basics
     * @shortname ceil
     * @drawable false
     */
    ceil(inputs: Inputs.Math.NumberDto): number {
        return Math.ceil(inputs.number);
    }

    /**
     * Negates a number (flips its sign: positive becomes negative, negative becomes positive).
     * Example: 5 → -5, -3 → 3, 0 → 0
     * @param inputs a number
     * @returns number
     * @group basics
     * @shortname negate
     * @drawable false
     */
    negate(inputs: Inputs.Math.NumberDto): number {
        return -inputs.number;
    }

    /**
     * Calculates the natural logarithm (base e) of a number.
     * Example: ln(2.718) → ~1, ln(7.389) → ~2, ln(1) → 0
     * @param inputs a number
     * @returns number
     * @group basics
     * @shortname ln
     * @drawable false
     */
    ln(inputs: Inputs.Math.NumberDto): number {
        return Math.log(inputs.number);
    }

    /**
     * Calculates the base 10 logarithm of a number.
     * Example: log₁₀(100) → 2, log₁₀(1000) → 3, log₁₀(10) → 1
     * @param inputs a number
     * @returns number
     * @group basics
     * @shortname log10
     * @drawable false
     */
    log10(inputs: Inputs.Math.NumberDto): number {
        return Math.log10(inputs.number);
    }

    /**
     * Raises 10 to the power of the input number.
     * Example: 10² → 100, 10³ → 1000, 10⁻¹ → 0.1
     * @param inputs a number
     * @returns number
     * @group basics
     * @shortname ten pow
     * @drawable false
     */
    tenPow(inputs: Inputs.Math.NumberDto): number {
        return Math.pow(10, inputs.number);
    }

    /**
     * Calculates the sine of an angle in radians.
     * Example: sin(0) → 0, sin(π/2) → 1, sin(π) → ~0
     * @param inputs a number
     * @returns number
     * @group basics
     * @shortname sin
     * @drawable false
     */
    sin(inputs: Inputs.Math.NumberDto): number {
        return Math.sin(inputs.number);
    }

    /**
     * Calculates the cosine of an angle in radians.
     * Example: cos(0) → 1, cos(π/2) → ~0, cos(π) → -1
     * @param inputs a number
     * @returns number
     * @group basics
     * @shortname cos
     * @drawable false
     */
    cos(inputs: Inputs.Math.NumberDto): number {
        return Math.cos(inputs.number);
    }

    /**
     * Calculates the tangent of an angle in radians.
     * Example: tan(0) → 0, tan(π/4) → ~1, tan(π/2) → infinity
     * @param inputs a number
     * @returns number
     * @group basics
     * @shortname tan
     * @drawable false
     */
    tan(inputs: Inputs.Math.NumberDto): number {
        return Math.tan(inputs.number);
    }

    /**
     * Calculates the arcsine (inverse sine) in radians, returns angle whose sine is the input.
     * Example: asin(0) → 0, asin(1) → π/2 (~1.57), asin(0.5) → π/6 (~0.524)
     * @param inputs a number
     * @returns number
     * @group basics
     * @shortname asin
     * @drawable false
     */
    asin(inputs: Inputs.Math.NumberDto): number {
        return Math.asin(inputs.number);
    }

    /**
     * Calculates the arccosine (inverse cosine) in radians, returns angle whose cosine is the input.
     * Example: acos(1) → 0, acos(0) → π/2 (~1.57), acos(-1) → π (~3.14)
     * @param inputs a number
     * @returns number
     * @group basics
     * @shortname acos
     * @drawable false
     */
    acos(inputs: Inputs.Math.NumberDto): number {
        return Math.acos(inputs.number);
    }

    /**
     * Calculates the arctangent (inverse tangent) in radians, returns angle whose tangent is the input.
     * Example: atan(0) → 0, atan(1) → π/4 (~0.785), atan(-1) → -π/4
     * @param inputs a number
     * @returns number
     * @group basics
     * @shortname atan
     * @drawable false
     */
    atan(inputs: Inputs.Math.NumberDto): number {
        return Math.atan(inputs.number);
    }

    /**
     * Calculates e raised to the power of the input (exponential function).
     * Example: e⁰ → 1, e¹ → ~2.718, e² → ~7.389
     * @param inputs a number
     * @returns number
     * @group basics
     * @shortname exp
     * @drawable false
     */
    exp(inputs: Inputs.Math.NumberDto): number {
        return Math.exp(inputs.number);
    }

    /**
     * Converts an angle from degrees to radians.
     * Example: 180° → π (~3.14159), 90° → π/2 (~1.5708), 360° → 2π
     * @param inputs a number in degrees
     * @returns number
     * @group basics
     * @shortname deg to rad
     * @drawable false
     */
    degToRad(inputs: Inputs.Math.NumberDto): number {
        return inputs.number * Math.PI / 180;
    }

    /**
     * Converts an angle from radians to degrees.
     * Example: π → 180°, π/2 → 90°, 2π → 360°
     * @param inputs a number in radians
     * @returns number
     * @group basics
     * @shortname rad to deg
     * @drawable false
     */
    radToDeg(inputs: Inputs.Math.NumberDto): number {
        return inputs.number * 180 / Math.PI;
    }

    /**
     * Applies an easing function to interpolate smoothly between min and max values.
     * Example: x=0.5 from [0,100] with easeInQuad → applies quadratic acceleration curve
     * Useful for smooth animations with various acceleration/deceleration curves.
     * @param inputs a number, min and max values, and ease type
     * @returns number
     * @group operations
     * @shortname ease
     * @drawable false
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
     * Constrains a value between a minimum and maximum value.
     * Example: clamp(5, 0, 3) returns 3, clamp(-1, 0, 3) returns 0, clamp(1.5, 0, 3) returns 1.5
     * @param inputs a number, min and max values
     * @returns number clamped between min and max
     * @group operations
     * @shortname clamp
     * @drawable false
     */
    clamp(inputs: Inputs.Math.ClampDto): number {
        return Math.max(inputs.min, Math.min(inputs.max, inputs.number));
    }

    /**
     * Linear interpolation between two values using parameter t (0 to 1).
     * Example: From 0 to 100 at t=0.5 → 50, From 10 to 20 at t=0.25 → 12.5
     * When t=0 returns start, when t=1 returns end. Useful for smooth transitions.
     * @param inputs start value, end value, and interpolation parameter t
     * @returns interpolated value
     * @group operations
     * @shortname lerp
     * @drawable false
     */
    lerp(inputs: Inputs.Math.LerpDto): number {
        return inputs.start + (inputs.end - inputs.start) * inputs.t;
    }

    /**
     * Calculates the interpolation parameter t for a value between start and end (reverse of lerp).
     * Example: Value 5 in range [0,10] → t=0.5, Value 2.5 in range [0,10] → t=0.25
     * Returns what t value would produce the given value in a lerp. Useful for finding relative position.
     * @param inputs start value, end value, and the value to find t for
     * @returns interpolation parameter (typically 0-1)
     * @group operations
     * @shortname inverse lerp
     * @drawable false
     */
    inverseLerp(inputs: Inputs.Math.InverseLerpDto): number {
        if (inputs.start === inputs.end) {
            return 0;
        }
        return (inputs.value - inputs.start) / (inputs.end - inputs.start);
    }

    /**
     * Hermite interpolation with smooth acceleration and deceleration (smoother than linear lerp).
     * Example: x=0 → 0, x=0.5 → 0.5, x=1 → 1 (but with smooth S-curve in between)
     * Input is automatically clamped to [0,1]. Output eases in and out smoothly. Great for animations.
     * @param inputs a number between 0 and 1
     * @returns smoothly interpolated value
     * @group operations
     * @shortname smoothstep
     * @drawable false
     */
    smoothstep(inputs: Inputs.Math.NumberDto): number {
        const t = Math.max(0, Math.min(1, inputs.number));
        return t * t * (3 - 2 * t);
    }

    /**
     * Returns the sign of a number: -1 for negative, 0 for zero, 1 for positive.
     * Example: -5 → -1, 0 → 0, 3.14 → 1
     * Useful for determining direction or polarity.
     * @param inputs a number
     * @returns -1, 0, or 1
     * @group operations
     * @shortname sign
     * @drawable false
     */
    sign(inputs: Inputs.Math.NumberDto): number {
        return Math.sign(inputs.number);
    }

    /**
     * Returns the fractional part of a number (removes integer part, keeps decimals).
     * Example: 3.14 → 0.14, 5.9 → 0.9, -2.3 → 0.7
     * Useful for wrapping values and creating repeating patterns.
     * @param inputs a number
     * @returns fractional part (always positive)
     * @group operations
     * @shortname fract
     * @drawable false
     */
    fract(inputs: Inputs.Math.NumberDto): number {
        return inputs.number - Math.floor(inputs.number);
    }

    /**
     * Wraps a number within a specified range (creates repeating cycle).
     * Example: 1.5 in range [0,1) → 0.5, -0.3 in range [0,1) → 0.7, 370° in range [0,360) → 10°
     * Useful for angles, UVs, or any repeating domain. Like modulo but handles negatives properly.
     * @param inputs a number, min and max values
     * @returns wrapped value within range
     * @group operations
     * @shortname wrap
     * @drawable false
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
     * Creates a ping-pong (back-and-forth) effect that bounces a value between 0 and length.
     * The value goes from 0→length, then back length→0, repeating this cycle.
     * Example: With length=1: t=0→0, t=0.5→0.5, t=1→1 (peak), t=1.5→0.5, t=2→0, t=2.5→0.5 (repeats)
     * Useful for creating bouncing animations like a ball or oscillating motion.
     * @param inputs time value t and length
     * @returns value bouncing between 0 and length
     * @group operations
     * @shortname ping pong
     * @drawable false
     */
    pingPong(inputs: Inputs.Math.PingPongDto): number {
        const t = Math.abs(inputs.t) % (inputs.length * 2);
        return t > inputs.length ? inputs.length * 2 - t : t;
    }

    /**
     * Moves a value toward a target by a maximum delta amount (never overshooting).
     * Example: From 0 toward 10 by max 3 → 3, From 8 toward 10 by max 3 → 10 (reached)
     * Useful for smooth movement with maximum speed limits.
     * @param inputs current value, target value, and maximum delta
     * @returns new value moved toward target
     * @group operations
     * @shortname move towards
     * @drawable false
     */
    moveTowards(inputs: Inputs.Math.MoveTowardsDto): number {
        const delta = inputs.target - inputs.current;
        if (Math.abs(delta) <= inputs.maxDelta) {
            return inputs.target;
        }
        return inputs.current + Math.sign(delta) * inputs.maxDelta;
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
