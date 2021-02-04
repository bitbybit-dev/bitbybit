import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    makeRequiredValidationModelForInputs,
    HS,
    ValidationEntityInterface,
    getRequired,
} from '../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { sceneConstants } from './scene-constants';
import { Scene } from 'projects/bitbybit-core/src/lib/api/inputs/scene-inputs';
export function createSceneAdjustActiveArcRotateBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_scene_adjust_active_arc_rotate_camera';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Position')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_scene_adjust_active_arc_rotate_camera_input_position);
            this.appendValueInput('MaxZ')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_scene_adjust_active_arc_rotate_camera_input_max_z.toLowerCase());
            this.appendValueInput('PanningSensibility')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_scene_adjust_active_arc_rotate_camera_input_panning_sensibility.toLowerCase());
            this.appendValueInput('WheelPrecision')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_scene_adjust_active_arc_rotate_camera_input_wheel_precision.toLowerCase());
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#fff');
            this.setTooltip(resources.block_scene_adjust_active_arc_rotate_camera_description.toLowerCase());
            this.setHelpUrl(environment.docsUrl + sceneConstants.helpUrl + '#' + 'adjustactivearcrotatecamera');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: Scene.CameraConfigurationDto = {
            position: (JavaScript as any).valueToCode(block, 'Position', (JavaScript as any).ORDER_ATOMIC),
            maxZ: (JavaScript as any).valueToCode(block, 'MaxZ', (JavaScript as any).ORDER_ATOMIC),
            panningSensibility: (JavaScript as any).valueToCode(block, 'PanningSensibility', (JavaScript as any).ORDER_ATOMIC),
            wheelPrecision: (JavaScript as any).valueToCode(block, 'WheelPrecision', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_scene_adjust_active_arc_rotate_camera_input_position,
            resources.block_scene_adjust_active_arc_rotate_camera_input_max_z,
            resources.block_scene_adjust_active_arc_rotate_camera_input_panning_sensibility,
            resources.block_scene_adjust_active_arc_rotate_camera_input_wheel_precision,
        ]));
        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false, `bitbybit.scene.adjustActiveArcRotateCamera(inputs);`);
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {
    return [
        {
            entity: keys[0],
            validations: [
                getRequired(resources, resources.block_scene_adjust_active_arc_rotate_camera_input_position),
            ]
        }, {
            entity: keys[1],
            validations: [
                getRequired(resources, resources.block_scene_adjust_active_arc_rotate_camera_input_max_z),
            ]
        }, {
            entity: keys[2],
            validations: [
                getRequired(resources, resources.block_scene_adjust_active_arc_rotate_camera_input_panning_sensibility),
            ]
        }, {
            entity: keys[3],
            validations: [
                getRequired(resources, resources.block_scene_adjust_active_arc_rotate_camera_input_wheel_precision),
            ]
        }
    ];
}
