import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../validations';

export function createCancelIntervalBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_async_cancel_interval';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('IntervalHandler')
                .setCheck('IntervalHandler')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_async_cancel_interval_input_interval_handler);
            this.setOutput(false);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_base_async_cancel_interval_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            intervalHandler: JavaScript.valueToCode(block, 'IntervalHandler', JavaScript.ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_interval_handler
        ]));

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `clearInterval(inputs.intervalHandler);`
        );
    };
}
