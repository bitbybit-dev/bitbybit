import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';

export function createRemapNumberBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_math_remap_number';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('NumberToRemap')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_math_remap_number_input_number_to_remap);
            this.appendValueInput('SourceInterval')
                .setCheck('Interval')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_math_remap_number_input_source_interval.toLowerCase());
            this.appendValueInput('TargetInterval')
                .setCheck('Interval')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_math_remap_number_input_target_interval.toLowerCase());
            this.setOutput(true, 'Number');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_math_remap_number_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            numberToRemap: JavaScript.valueToCode(block, 'NumberToRemap', JavaScript.ORDER_ATOMIC),
            sourceInterval: JavaScript.valueToCode(block, 'SourceInterval', JavaScript.ORDER_ATOMIC),
            targetInterval: JavaScript.valueToCode(block, 'TargetInterval', JavaScript.ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_number_to_remap, resources.block_source_interval, resources.block_target_interval
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
const value = inputs.numberToRemap;
const from1 = inputs.sourceInterval.min;
const to1 = inputs.sourceInterval.max;
const from2 = inputs.targetInterval.min;
const to2 = inputs.targetInterval.max;

return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
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
            getRequired(resources, resources.block_number_to_remap),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_source_interval),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_target_interval),
        ]
    }];
}
