import { Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';

export function createClearAllDrawnBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_clear_all_drawn';

    Blocks[blockSelector] = {
        init() {
            this.appendDummyInput('ClearAllDrawn')
                .appendField(resources.block_base_clear_all_drawn_input_clear_all_drawn);
            this.setColour('#fff');
            this.setOutput(false);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_base_clear_all_drawn_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
        };

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `bitbybit.scene.clearAllDrawnObjects();`
        );
    };
}
