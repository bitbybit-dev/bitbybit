import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../../validations';

export function createPoint2dBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_point_2d';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('X')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_coordinate_short_x);
            this.appendValueInput('Z')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_coordinate_short_z);
            this.setInputsInline(true);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_point_2d_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            x: JavaScript.valueToCode(block, 'X', JavaScript.ORDER_ATOMIC),
            z: JavaScript.valueToCode(block, 'Z', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_coordinate_x, resources.block_coordinate_y
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return [inputs.x, 0, inputs.z];`
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
