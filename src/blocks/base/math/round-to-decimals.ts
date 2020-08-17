import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';

export function createRoundToDecimalsBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_math_round_to_decimals';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('NumberToRound')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_math_round_to_decimals_input_number_to_round);
            this.appendValueInput('DecimalPlaces')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_math_round_to_decimals_input_decimal_places.toLowerCase());
            this.setOutput(true, 'String');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_math_round_to_decimals_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            numberToRound: JavaScript.valueToCode(block, 'NumberToRound', JavaScript.ORDER_ATOMIC),
            decimalPlaces: JavaScript.valueToCode(block, 'DecimalPlaces', JavaScript.ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_number_to_round, resources.block_decimal_places,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
return inputs.numberToRound.toFixed(inputs.decimalPlaces);
`
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_number_to_round),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_decimal_places),
        ]
    }];
}
