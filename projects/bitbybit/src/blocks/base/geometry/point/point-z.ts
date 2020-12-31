import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../../validations';

export function createPointZBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_point_z';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Point')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_point_z);
            this.setOutput(true, 'Number');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_point_z_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            point: (JavaScript as any).valueToCode(block, 'Point', (JavaScript as any).ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings

        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_point
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true, `return bitbybit.point.getZ(inputs);`);
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
