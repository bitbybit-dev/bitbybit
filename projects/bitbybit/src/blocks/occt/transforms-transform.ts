import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createDummyPromiseIndicator, createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { occConstants } from './occ-constants';
import { OCC } from 'projects/bitbybit-core/src/lib/api/inputs/occ-inputs';

export function createTransformTransformBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'occt_transforms_transform';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('OccShape')
                .setCheck('OccShape')
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_transform_input_shape);
            this.appendValueInput('Translation')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_transform_input_translation.toLowerCase());
            this.appendValueInput('RotationAxis')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_transform_input_rotation_axis.toLowerCase());
            this.appendValueInput('RotationAngle')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_transform_input_rotation_angle.toLowerCase());
            this.appendValueInput('ScaleFactor')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_transform_input_scale_factor.toLowerCase());
            this.setOutput(true, 'OccShape');
            this.setColour('#fff');
            this.setTooltip(resources.block_occ_transform_description);
            this.setHelpUrl(environment.docsUrl + occConstants.occHelpUrl + '#' + 'transform');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: OCC.TransformDto = {
            shape: (JavaScript as any).valueToCode(block, 'OccShape', (JavaScript as any).ORDER_ATOMIC),
            translation: (JavaScript as any).valueToCode(block, 'Translation', (JavaScript as any).ORDER_ATOMIC),
            rotationAxis: (JavaScript as any).valueToCode(block, 'RotationAxis', (JavaScript as any).ORDER_ATOMIC),
            rotationAngle: (JavaScript as any).valueToCode(block, 'RotationAngle', (JavaScript as any).ORDER_ATOMIC),
            scaleFactor: (JavaScript as any).valueToCode(block, 'ScaleFactor', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_occ_transform_input_shape,
            resources.block_occ_transform_input_translation,
            resources.block_occ_transform_input_rotation_axis,
            resources.block_occ_transform_input_rotation_angle,
            resources.block_occ_transform_input_scale_factor
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `bitbybit.occt.transforms.transform(inputs)`, true
        );
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_occ_transform_input_shape),
        ]
    },
    {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_occ_transform_input_translation),
        ]
    },
    {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_occ_transform_input_rotation_axis),
        ]
    },
    {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_occ_transform_input_rotation_angle),
        ]
    },
    {
        entity: keys[4],
        validations: [
            getRequired(resources, resources.block_occ_transform_input_scale_factor),
        ]
    }
    ];
}


