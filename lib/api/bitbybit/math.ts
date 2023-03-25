import * as Inputs from '../inputs/inputs';

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
       * @link https://docs.bitbybit.dev/classes/bitbybit_math.Math.html#number
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
     * @link https://docs.bitbybit.dev/classes/bitbybit_math.Math.html#twoNrOperation
     * @param inputs two numbers and operator
     * @returns Result of math operation action
     * @group operations
     * @shortname two numbers
     * @drawable false
     */
    twoNrOperation(inputs: Inputs.Math.ActionOnTwoNumbersDto): number {
        let result;
        switch (inputs.operation) {
            case Inputs.Math.MathTwoNrOperatorEnum.add:
                result = inputs.first + inputs.second;
                break;
            case Inputs.Math.MathTwoNrOperatorEnum.subtract:
                result = inputs.first - inputs.second;
                break;
            case Inputs.Math.MathTwoNrOperatorEnum.multiply:
                result = inputs.first * inputs.second;
                break;
            case Inputs.Math.MathTwoNrOperatorEnum.divide:
                result = inputs.first / inputs.second;
                break;
            case Inputs.Math.MathTwoNrOperatorEnum.power:
                result = Math.pow(inputs.first, inputs.second);
                break;
            case Inputs.Math.MathTwoNrOperatorEnum.modulus:
                result = inputs.first % inputs.second;
                break;
            default:
                break;
        }
        return result;
    }

    /**
        * Does basic math operations on one number
        * @link https://docs.bitbybit.dev/classes/bitbybit_math.Math.html#oneNrOperation
        * @param inputs one number and operator action
        * @returns Result of math operation
        * @group operations
        * @shortname one number
        * @drawable false
        */
    oneNrOperation(inputs: Inputs.Math.ActionOnOneNumberDto): number {
        let result;
        switch (inputs.operation) {
            case Inputs.Math.MathOneNrOperatorEnum.absolute:
                result = Math.abs(inputs.nr);
                break;
            case Inputs.Math.MathOneNrOperatorEnum.negate:
                result = -inputs.nr;
                break;
            case Inputs.Math.MathOneNrOperatorEnum.ln:
                result = Math.log(inputs.nr);
                break;
            case Inputs.Math.MathOneNrOperatorEnum.log10:
                result = Math.log10(inputs.nr);
                break;
            case Inputs.Math.MathOneNrOperatorEnum.tenPow:
                result = Math.pow(10, inputs.nr);
                break;
            case Inputs.Math.MathOneNrOperatorEnum.round:
                result = Math.round(inputs.nr);
                break;
            case Inputs.Math.MathOneNrOperatorEnum.floor:
                result = Math.floor(inputs.nr);
                break;
            case Inputs.Math.MathOneNrOperatorEnum.ceil:
                result = Math.ceil(inputs.nr);
                break;
            case Inputs.Math.MathOneNrOperatorEnum.sqrt:
                result = Math.sqrt(inputs.nr);
                break;
            case Inputs.Math.MathOneNrOperatorEnum.sin:
                result = Math.sin(inputs.nr);
                break;
            case Inputs.Math.MathOneNrOperatorEnum.cos:
                result = Math.cos(inputs.nr);
                break;
            case Inputs.Math.MathOneNrOperatorEnum.tan:
                result = Math.tan(inputs.nr);
                break;
            case Inputs.Math.MathOneNrOperatorEnum.asin:
                result = Math.asin(inputs.nr);
                break;
            case Inputs.Math.MathOneNrOperatorEnum.acos:
                result = Math.acos(inputs.nr);
                break;
            case Inputs.Math.MathOneNrOperatorEnum.atan:
                result = Math.atan(inputs.nr);
                break;
            case Inputs.Math.MathOneNrOperatorEnum.log:
                result = Math.log(inputs.nr);
                break;
            case Inputs.Math.MathOneNrOperatorEnum.exp:
                result = Math.exp(inputs.nr);
                break;
            default:
                break;
        }
        return result;
    }
}
