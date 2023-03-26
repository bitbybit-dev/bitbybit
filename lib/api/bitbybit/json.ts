import * as Inputs from '../inputs/inputs';

/**
 * Contains various json path methods.
 * <div>
 *  <img src="../assets/images/blockly-images/math/math.svg" alt="Blockly Image"/>
 * </div>
 */
export class JSONBitByBit {

    constructor() { }

    /**
     * Stringifies the input value
     * @link https://docs.bitbybit.dev/classes/bitbybit_json.JSON.html#stringify
     * @param inputs a value to be stringified
     * @returns string
     * @group transform
     * @shortname stringify
     * @drawable false
     */
    stringify(inputs: Inputs.JSON.StringifyDto): string {
        return JSON.stringify(inputs.value);
    }

}
