import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../../validations';

export function createPolylinePointsBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_polyline_points';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Polyline')
                .setCheck('Polyline')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_polyline_points);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_polyline_points_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            polyline: (JavaScript as any).valueToCode(block, 'Polyline', (JavaScript as any).ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings

        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_polyline
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return inputs.polyline.points;`);
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
