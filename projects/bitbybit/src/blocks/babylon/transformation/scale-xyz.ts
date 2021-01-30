import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { transformationConstants } from './transformation-constants';

export function createScaleXYZBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_transformation_scale_xyz';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('ScaleXYZ')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_transformation_scale_xyz);
            this.setOutput(true, 'Matrix');
            this.setColour('#fff');
            this.setTooltip(resources.block_babylon_transformation_scale_xyz_description);
            this.setHelpUrl(environment.docsUrl + transformationConstants.helpUrl + '#' + 'scalexyz');   
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            scaleXyz: (JavaScript as any).valueToCode(block, 'ScaleXYZ', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_vector
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true, `return bitbybit.transforms.scaleXYZ(inputs);`);
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
