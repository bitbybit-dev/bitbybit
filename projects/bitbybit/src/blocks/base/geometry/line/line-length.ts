import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../../validations';

export function createLineLengthBlock() {

    const resources = ResourcesService.getResources();
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
            line: (JavaScript as any).valueToCode(block, 'Line', (JavaScript as any).ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_line
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return BitByBit.verb.core.Vec.dist(inputs.line.start, inputs.line.end);`
        );
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
