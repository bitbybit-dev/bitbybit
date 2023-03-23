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
     * Does basic math operations
     * @link https://docs.bitbybit.dev/classes/bitbybit_math.Math.html#twoNrOperation
     * @param inputs two numbers and operator
     * @returns Result of math operation
     * @group operations
     * @shortname two number
     * @drawable false
     */
    twoNrOperation(inputs: Inputs.Math.ActionOnTwoNumbersDto): number {
        if (inputs.action == Inputs.Math.MathActionEnum.add) {
            return inputs.first + inputs.second;
        }
        if (inputs.action == Inputs.Math.MathActionEnum.subtract) {
            return inputs.first - inputs.second;
        }
        if (inputs.action == Inputs.Math.MathActionEnum.multiply) {
            return inputs.first * inputs.second;
        }
        if (inputs.action == Inputs.Math.MathActionEnum.divide) {
            return inputs.first / inputs.second;
        }
        if (inputs.action == Inputs.Math.MathActionEnum.power) {
            return Math.pow(inputs.first, inputs.second);
        }

    }

}
