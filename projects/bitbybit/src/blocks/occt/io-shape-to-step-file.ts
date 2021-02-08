import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createDummyPromiseIndicator, createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { occConstants } from './occ-constants';
import { OCC } from 'projects/bitbybit-core/src/lib/api/inputs/occ-inputs';

export function createIOShapeToStepFileBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'occt_io_shape_to_step_file';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('OccShape')
                .setCheck('OccShape')
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_io_shape_to_file_input_shape);
            this.appendValueInput('FileName')
                .setCheck('String')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_io_shape_to_file_input_file_name.toLowerCase());
            this.setOutput(false);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_occ_io_shape_to_file_description);
            this.setHelpUrl(environment.docsUrl + occConstants.occHelpUrl + '#' + 'saveshapestep');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: OCC.SaveStepDto = {
            shape: (JavaScript as any).valueToCode(block, 'OccShape', (JavaScript as any).ORDER_ATOMIC),
            filename: (JavaScript as any).valueToCode(block, 'FileName', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_occ_io_shape_to_file_input_shape,
            resources.block_occ_io_shape_to_file_input_file_name,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `bitbybit.occt.io.saveShapeSTEP(inputs)`, true
        );
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_occ_io_shape_to_file_input_shape),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_occ_io_shape_to_file_input_file_name),
        ]
    }];
}


