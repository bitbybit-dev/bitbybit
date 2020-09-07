import { Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';

export function createRandomBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_math_random';

    Blocks[blockSelector] = {
        init() {
            this.appendDummyInput('Random')
                .appendField(resources.block_base_math_random_input_random);
            this.setColour('#fff');
            this.setOutput(true, 'Number');
            this.setTooltip(resources.block_base_math_random_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
        };

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
`
        return Math.random();
`
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
