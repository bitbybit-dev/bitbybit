import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../validations';

export function createRotationCenterAxisBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_transformation_rotation_center_axis';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Angle')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_transformation_rotation_center_angle);
            this.appendValueInput('Axis')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_transformation_rotation_center_axis.toLowerCase());
            this.appendValueInput('Center')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_center);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_babylon_transformation_rotation_center_z_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            angle: JavaScript.valueToCode(block, 'Angle', JavaScript.ORDER_ATOMIC),
            axis: JavaScript.valueToCode(block, 'Axis', JavaScript.ORDER_ATOMIC),
            center: JavaScript.valueToCode(block, 'Center', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_angle, resources.block_axis, resources.block_center
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
        return [
            new BABYLON.Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]),
            new BABYLON.Matrix.RotationAxis(new BABYLON.Vector3(inputs.axis[0], inputs.axis[1], inputs.axis[2]), BABYLON.Angle.FromDegrees(inputs.angle).radians()),
            new BABYLON.Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]),
        ];
`);
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
