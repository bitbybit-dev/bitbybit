import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BlockValidationService } from '../../../validations';

export function createPointBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_point';

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
            this.setTooltip(resources.block_base_geometry_point_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            x: JavaScript.valueToCode(block, 'X', JavaScript.ORDER_ATOMIC),
            y: JavaScript.valueToCode(block, 'Y', JavaScript.ORDER_ATOMIC),
            z: JavaScript.valueToCode(block, 'Z', JavaScript.ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        BlockValidationService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_coordinate_x, resources.block_coordinate_y, resources.block_coordinate_z
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return [inputs.x, inputs.y, inputs.z];`
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
