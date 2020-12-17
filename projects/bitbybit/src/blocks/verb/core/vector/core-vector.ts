import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../../validations';

export function createCoreVector3Block() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_core_vector';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('X')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_coordinate_short_x);
            this.appendValueInput('Y')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_coordinate_short_y);
            this.appendValueInput('Z')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_coordinate_short_z);
            this.setInputsInline(true);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_core_vector_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            x: (JavaScript as any).valueToCode(block, 'X', (JavaScript as any).ORDER_ATOMIC),
            y: (JavaScript as any).valueToCode(block, 'Y', (JavaScript as any).ORDER_ATOMIC),
            z: (JavaScript as any).valueToCode(block, 'Z', (JavaScript as any).ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_coordinate_x, resources.block_coordinate_y, resources.block_coordinate_z
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return [inputs.x, inputs.y, inputs.z];`
        );
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
