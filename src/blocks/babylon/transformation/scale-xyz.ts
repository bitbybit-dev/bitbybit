import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';

export function createScaleXYZBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_transformation_scale_xyz';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('ScaleXYZ')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_transformation_scale_xyz);
            this.setOutput(true, 'Matrix');
            this.setColour('#fff');
            this.setTooltip(resources.block_babylon_transformation_scale_xyz_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            scaleXyz: JavaScript.valueToCode(block, 'ScaleXYZ', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_vector
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
`
        return new BABYLON.Matrix.Scaling(inputs.scaleXyz[0], inputs.scaleXyz[1], inputs.scaleXyz[2]);
`);
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
