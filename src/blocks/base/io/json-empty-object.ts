import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';

export function createJsonEmptyObjectBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_io_json_empty_object';
    Blocks[blockSelector] = {
        init() {
            this.appendDummyInput('JSON')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_json_empty_object_input_json);
            this.setOutput(true, 'Any');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_io_json_empty_object_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {};

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return {};`);
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
