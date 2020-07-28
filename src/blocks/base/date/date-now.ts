import { Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';

export function createDateNowBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_date_now';

    Blocks[blockSelector] = {
        init() {
            this.appendDummyInput('Date')
                .appendField(resources.block_base_date_now_input_date);
            this.setColour('#fff');
            this.setOutput(true, 'Date');
            this.setTooltip(resources.block_base_date_now_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
        };

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
`
        return new Date(Date.now());
`
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
