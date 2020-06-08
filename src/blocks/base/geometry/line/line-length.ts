import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';

export function createLineLengthBlock() {

    const resources = ResourcesService.getResourcesForSelectedLanguage();
    const blockSelector = 'base_geometry_line_length';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Line')
                .setCheck('Line')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_line_length);
            this.setOutput(true, 'Number');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_line_length_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            line: JavaScript.valueToCode(block, 'Line', JavaScript.ORDER_ATOMIC)
        }
        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return verb.core.Vec.dist(inputs.line.start, inputs.line.end)`
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}