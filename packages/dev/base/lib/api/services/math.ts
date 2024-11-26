import * as Inputs from "../inputs/inputs";

/**
 * Contains various math methods.
 */
export class MathBitByBit {

    /**
     * Creates a number
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
     * Does basic math operations
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
     * Does modulus operation
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
     * Does rounding to decimals
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
     * Does basic math operations on one number
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
    * Remaps a number from one range to another
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
    * Creates a random number between 0 and 1
    * @returns A random number between 0 and 1
    * @group generate
    * @shortname random 0 - 1
    * @drawable false
    */
    random(): number {
        return Math.random();
    }

    /**
    * Creates a random number between low and high value
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
    * Creates random numbers between low and high values
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
    * Creates a PI number
    * @returns A number PI
    * @group generate
    * @shortname π
    * @drawable false
    */
    pi(): number {
        return Math.PI;
    }

    /**
     * Rounds the number to decimal places
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
     * Adds two numbers
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
     * Subtracts two numbers
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
     * Multiplies two numbers
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
     * Divides two numbers
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
     * Powers a number
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
     * Gets the square root of a number
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
     * Gets the absolute value of a number
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
     * Rounds a number
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
     * Floors a number
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
     * Ceils a number
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
     * Negates a number
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
     * Gets the natural logarithm of a number
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
     * Gets the base 10 logarithm of a number
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
     * Raises 10 to the power of a number
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
     * Gets the sine of a number
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
     * Gets the cosine of a number
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
     * Gets the tangent of a number
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
     * Gets the arcsine of a number
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
     * Gets the arccosine of a number
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
     * Gets the arctangent of a number
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
     * Gets the natural exponent of a number
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
     * Converts degrees to radians
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
     * Converts radians to degrees
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
     * Eases a number by providing x parameter 0-1 and a range of output values
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
