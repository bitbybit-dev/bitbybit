import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { makeRequiredValidationModelForInputs, BlockValidationService, ValidationEntityInterface } from '../../validations';

export function createScaleCenterXYZBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_transformation_scale_center_xyz';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('ScaleXYZ')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_transformation_scale_center_xyz);
            this.appendValueInput('Center')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_transformation_scale_center);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_babylon_transformation_scale_center_xyz_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            scaleXyz: JavaScript.valueToCode(block, 'ScaleXYZ', JavaScript.ORDER_ATOMIC),
            center: JavaScript.valueToCode(block, 'Center', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BlockValidationService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_scale, resources.block_center
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
`
        return [
            new BABYLON.Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]),
            new BABYLON.Matrix.Scaling(inputs.scaleXyz[0], inputs.scaleXyz[1], inputs.scaleXyz[2]),
            new BABYLON.Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]),
        ];
`);
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
