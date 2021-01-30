import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { transformationConstants } from './transformation-constants';

export function createScaleUniformBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_transformation_scale_uniform';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Scale')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_transformation_scale_uniform);
            this.setOutput(true, 'Matrix');
            this.setColour('#fff');
            this.setTooltip(resources.block_babylon_transformation_scale_uniform_description);
            this.setHelpUrl(environment.docsUrl + transformationConstants.helpUrl + '#' + 'uniformscale');   
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            scale: (JavaScript as any).valueToCode(block, 'Scale', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_scale
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true, `return bitbybit.transforms.uniformScale(inputs);`);
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
