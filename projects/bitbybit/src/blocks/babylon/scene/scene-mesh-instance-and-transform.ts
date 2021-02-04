import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createDummyPromiseIndicator, createStandardContextIIFE } from '../../_shared';
import {
    makeRequiredValidationModelForInputs,
    HS,
    ValidationEntityInterface,
    getRequired,
} from '../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { sceneConstants } from './scene-constants';
import { Scene } from 'projects/bitbybit-core/src/lib/api/inputs/scene-inputs';
export function createMeshInstanceAndTransformBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'scene_mesh_instance_and_transform';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('BabylonMesh')
                .setCheck('BabylonMesh')
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_scene_mesh_instance_and_transform_input_babylon_mesh);
            this.appendValueInput('Position')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_scene_mesh_instance_and_transform_input_position.toLowerCase());
            this.appendValueInput('Rotation')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_scene_mesh_instance_and_transform_input_rotation.toLowerCase());
            this.appendValueInput('Scaling')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_scene_mesh_instance_and_transform_input_scaling.toLowerCase());
            this.setOutput(false);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_scene_mesh_instance_and_transform_description);
            this.setHelpUrl(environment.docsUrl + sceneConstants.helpUrl + '#' + 'createmeshinstanceandtransform');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: Scene.MeshInstanceAndTransformDto = {
            mesh: (JavaScript as any).valueToCode(block, 'BabylonMesh', (JavaScript as any).ORDER_ATOMIC),
            position: (JavaScript as any).valueToCode(block, 'Position', (JavaScript as any).ORDER_ATOMIC),
            rotation: (JavaScript as any).valueToCode(block, 'Rotation', (JavaScript as any).ORDER_ATOMIC),
            scaling: (JavaScript as any).valueToCode(block, 'Scaling', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_scene_mesh_instance_and_transform_input_babylon_mesh,
            resources.block_scene_mesh_instance_and_transform_input_position,
            resources.block_scene_mesh_instance_and_transform_input_rotation,
            resources.block_scene_mesh_instance_and_transform_input_scaling,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `bitbybit.scene.createMeshInstanceAndTransform(inputs)`, true
        );
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
                getRequired(resources, resources.block_scene_mesh_instance_and_transform_input_babylon_mesh),
            ]
        }, {
            entity: keys[1],
            validations: [
                getRequired(resources, resources.block_scene_mesh_instance_and_transform_input_position),
            ]
        }, {
            entity: keys[2],
            validations: [
                getRequired(resources, resources.block_scene_mesh_instance_and_transform_input_rotation),
            ]
        }, {
            entity: keys[3],
            validations: [
                getRequired(resources, resources.block_scene_mesh_instance_and_transform_input_scaling),
            ]
        }
    ];
}
