import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { pointConstants } from './point-constants';

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
            this.setHelpUrl(environment.docsUrl + pointConstants.helpUrl + '#' + 'multiplypoint');
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

        const code = createStandardContextIIFE(block, blockSelector, inputs, true, `return bitbybit.point.multiplyPoint(inputs);`);
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
