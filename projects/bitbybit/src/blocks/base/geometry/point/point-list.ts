import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../../validations';

export function createPointListBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_point_list';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Point')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_point_list_input_point);
            this.appendValueInput('AmountOfPoints')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_point_list_input_amount_of_points.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_point_list_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            point: (JavaScript as any).valueToCode(block, 'Point', (JavaScript as any).ORDER_ATOMIC),
            amountOfPoints: (JavaScript as any).valueToCode(block, 'AmountOfPoints', (JavaScript as any).ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_coordinate_x, resources.block_coordinate_y, resources.block_coordinate_z
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
`
            const points = [];
            for(let i = 0; i < inputs.amountOfPoints; i++){
                points.push([inputs.point[0], inputs.point[1], inputs.point[2]]);
            }
            return points;
`
        );
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
