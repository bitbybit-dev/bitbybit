import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BlockValidationService } from '../../../validations';

export function createCoreIntervalGetMaxBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_core_interval_get_max';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Interval')
                .setCheck('Interval')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_core_interval_get_max);
            this.setOutput(true, 'Number');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_core_interval_get_max_description);
        }
    };

    JavaScript[blockSelector] =  (block: Block) => {
        const inputs = {
            interval: JavaScript.valueToCode(block, 'Interval', JavaScript.ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings

        BlockValidationService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_interval
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return inputs.interval.max;`);
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
