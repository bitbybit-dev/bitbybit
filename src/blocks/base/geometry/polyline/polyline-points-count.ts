import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BlockValidationService } from '../../../validations';

export function createPolylineGetPointsCountBlock() {

    const resources = ResourcesService.getResourcesForSelectedLanguage();
    const blockSelector = 'base_geometry_polyline_points_count';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Polyline')
                .setCheck('Polyline')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_polyline_points_count);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_polyline_points_count_description);
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
            `return inputs.polyline.points.length;`);
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
