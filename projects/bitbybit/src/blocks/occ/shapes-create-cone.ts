import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createDummyPromiseIndicator, createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { occConstants } from './occ-constants';
import { OCC } from 'projects/bitbybit-core/src/lib/api/inputs/occ-inputs';

export function createConeBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'occ_shapes_create_cone';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('RadiusOne')
                .setCheck('Number')
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_shapes_create_cone_input_radius_one);
            this.appendValueInput('RadiusTwo')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_shapes_create_cone_input_radius_two);
            this.appendValueInput('Height')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_shapes_create_cone_input_height.toLowerCase());
            this.setOutput(true, 'OccShape');
            this.setColour('#fff');
            this.setTooltip(resources.block_occ_shapes_create_cone_description);
            this.setHelpUrl(environment.docsUrl + occConstants.occHelpUrl + '#' + 'createcone');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: OCC.ConeDto = {
            radius1: (JavaScript as any).valueToCode(block, 'RadiusOne', (JavaScript as any).ORDER_ATOMIC),
            radius2: (JavaScript as any).valueToCode(block, 'RadiusTwo', (JavaScript as any).ORDER_ATOMIC),
            height: (JavaScript as any).valueToCode(block, 'Height', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_occ_shapes_create_cone_input_radius_one,
            resources.block_occ_shapes_create_cone_input_radius_two,
            resources.block_occ_shapes_create_cone_input_height,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `bitbybit.occ.createCone(inputs)`, true
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
            getRequired(resources, resources.block_occ_shapes_create_cone_input_radius_one),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_occ_shapes_create_cone_input_radius_two),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_occ_shapes_create_cone_input_height),
        ]
    }
    ];
}


