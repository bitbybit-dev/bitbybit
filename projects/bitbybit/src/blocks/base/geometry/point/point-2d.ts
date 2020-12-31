import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { pointConstants } from './point-constants';

export function createPoint2dBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_point_2d';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('X')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_coordinate_short_x);
            this.appendValueInput('Y')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_coordinate_short_y);
            this.setInputsInline(true);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_point_2d_description);
            this.setHelpUrl(environment.docsUrl + pointConstants.helpUrl);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            x: (JavaScript as any).valueToCode(block, 'X', (JavaScript as any).ORDER_ATOMIC),
            y: (JavaScript as any).valueToCode(block, 'Y', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_coordinate_x, resources.block_coordinate_y
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return [inputs.x, inputs.y, 0];`
        );
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
