import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    makeRequiredValidationModelForInputs,
    BitByBitBlockHandlerService,
    ValidationEntityInterface,
    getRequired,
} from '../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { sceneConstants } from './scene-constants';
import { Scene } from 'projects/bitbybit-core/src/lib/api/inputs/scene-inputs';
export function createScenePointLightBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_scene_point_light';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Position')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_scene_point_light_input_position);
            this.appendValueInput('Diffuse')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_scene_point_light_input_diffuse.toLowerCase());
            this.appendValueInput('Specular')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_scene_point_light_input_specular.toLowerCase());
            this.appendValueInput('Intensity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_scene_point_light_input_intensity.toLowerCase());
            this.appendValueInput('Radius')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_scene_point_light_input_radius.toLowerCase());
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#fff');
            this.setTooltip(resources.block_scene_point_light_description.toLowerCase());
            this.setHelpUrl(environment.docsUrl + sceneConstants.helpUrl + '#' + 'drawpointlight');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: Scene.PointLightDto = {
            position: (JavaScript as any).valueToCode(block, 'Position', (JavaScript as any).ORDER_ATOMIC),
            diffuse: (JavaScript as any).valueToCode(block, 'Diffuse', (JavaScript as any).ORDER_ATOMIC),
            specular: (JavaScript as any).valueToCode(block, 'Specular', (JavaScript as any).ORDER_ATOMIC),
            intensity: (JavaScript as any).valueToCode(block, 'Intensity', (JavaScript as any).ORDER_ATOMIC),
            radius: (JavaScript as any).valueToCode(block, 'Radius', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_scene_point_light_input_position,
            resources.block_scene_point_light_input_diffuse,
            resources.block_scene_point_light_input_specular,
            resources.block_scene_point_light_input_intensity,
            resources.block_scene_point_light_input_radius,
        ]));
        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false, `bitbybit.scene.drawPointLight(inputs);`);
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
                getRequired(resources, resources.block_scene_point_light_input_position),
            ]
        }, {
            entity: keys[1],
            validations: [
                getRequired(resources, resources.block_scene_point_light_input_diffuse),
            ]
        }, {
            entity: keys[2],
            validations: [
                getRequired(resources, resources.block_scene_point_light_input_specular),
            ]
        }, {
            entity: keys[3],
            validations: [
                getRequired(resources, resources.block_scene_point_light_input_intensity),
            ]
        }, {
            entity: keys[4],
            validations: [
                getRequired(resources, resources.block_scene_point_light_input_radius),
            ]
        }
    ];
}
