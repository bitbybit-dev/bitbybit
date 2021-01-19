import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { transformationConstants } from './transformation-constants';

export function createRotationCenterYBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_transformation_rotation_center_y';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Angle')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_transformation_rotation_center_y);
            this.appendValueInput('Center')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_center.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_babylon_transformation_rotation_center_y_description);
            this.setHelpUrl(environment.docsUrl + transformationConstants.helpUrl + '#' + 'rotationcentery');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            angle: (JavaScript as any).valueToCode(block, 'Angle', (JavaScript as any).ORDER_ATOMIC),
            center: (JavaScript as any).valueToCode(block, 'Center', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_angle, resources.block_center
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true, `return bitbybit.transforms.rotationCenterY(inputs);`);
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
