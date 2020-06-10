import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BlockValidationService } from '../../../validations';

export function createPolylineReverseBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_polyline_reverse';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Polyline')
                .setCheck('Polyline')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_polyline_reverse);
            this.setOutput(true, 'Polyline');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_polyline_reverse_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            polyline: JavaScript.valueToCode(block, 'Polyline', JavaScript.ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings

        BlockValidationService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_polyline
        ]));
        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
       `return {points: inputs.polyline.points.reverse()};`);
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
