import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../validations';

export function createRotationYawPitchRollBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_transformation_rotation_yaw_pitch_roll';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Yaw')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_transformation_rotation_yaw_pitch_roll_input_yaw);
            this.appendValueInput('Pitch')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_transformation_rotation_yaw_pitch_roll_input_pitch.toLowerCase());
            this.appendValueInput('Roll')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_transformation_rotation_yaw_pitch_roll_input_roll.toLowerCase());
            this.appendValueInput('Center')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_center.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_babylon_transformation_rotation_yaw_pitch_roll_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            yaw: JavaScript.valueToCode(block, 'Yaw', JavaScript.ORDER_ATOMIC),
            pitch: JavaScript.valueToCode(block, 'Pitch', JavaScript.ORDER_ATOMIC),
            roll: JavaScript.valueToCode(block, 'Roll', JavaScript.ORDER_ATOMIC),
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
            new BitByBit.BABYLON.Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]),
            new BitByBit.BABYLON.Matrix.RotationYawPitchRoll(BitByBit.BABYLON.Angle.FromDegrees(inputs.yaw).radians(), BitByBit.BABYLON.Angle.FromDegrees(inputs.pitch).radians(), BitByBit.BABYLON.Angle.FromDegrees(inputs.roll).radians()),
            new BitByBit.BABYLON.Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]),
        ];
`);
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
