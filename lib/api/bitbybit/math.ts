import * as Inputs from "../inputs/inputs";

/**
 * Contains various math methods.
 * <div>
 *  <img src="../assets/images/blockly-images/math/math.svg" alt="Blockly Image"/>
 * </div>
 */
export class MathBitByBit {

    constructor() { }
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
}
