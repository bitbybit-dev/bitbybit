import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createDummyPromiseIndicator, createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { occConstants } from './occ-constants';
import { OCC } from 'projects/bitbybit-core/src/lib/api/inputs/occ-inputs';

export function createRevolveBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'occt_operations_revolve';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('OccShape')
                .setCheck('OccShape')
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_operations_revolve_input_shape);
            this.appendValueInput('Angle')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_operations_revolve_input_angle.toLowerCase());
            this.appendValueInput('Direction')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_operations_revolve_input_direction.toLowerCase());
            this.appendValueInput('Copy')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_operations_revolve_input_copy.toLowerCase());
            this.setOutput(true, 'OccShape');
            this.setColour('#fff');
            this.setTooltip(resources.block_occt_operations_revolve_description);
            this.setHelpUrl(environment.docsUrl + occConstants.occHelpUrl + '#' + 'revolve');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: OCC.RevolveDto = {
            shape: (JavaScript as any).valueToCode(block, 'OccShape', (JavaScript as any).ORDER_ATOMIC),
            angle: (JavaScript as any).valueToCode(block, 'Angle', (JavaScript as any).ORDER_ATOMIC),
            direction: (JavaScript as any).valueToCode(block, 'Direction', (JavaScript as any).ORDER_ATOMIC),
            copy: (JavaScript as any).valueToCode(block, 'Copy', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_occt_operations_revolve_input_shape,
            resources.block_occt_operations_revolve_input_angle,
            resources.block_occt_operations_revolve_input_direction,
            resources.block_occt_operations_revolve_input_copy,

        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `bitbybit.occt.operations.revolve(inputs)`, true
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
            getRequired(resources, resources.block_occt_operations_revolve_input_shape),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_occt_operations_revolve_input_angle),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_occt_operations_revolve_input_direction),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_occt_operations_revolve_input_copy),
        ]
    }];
}


