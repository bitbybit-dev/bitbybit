import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../../validations';

export function createLineStartPointBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_line_start_point';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Line')
                .setCheck('Line')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_line_start_point);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_line_start_point_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            line: (JavaScript as any).valueToCode(block, 'Line', (JavaScript as any).ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings

        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_line
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return inputs.line.start;`);
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
