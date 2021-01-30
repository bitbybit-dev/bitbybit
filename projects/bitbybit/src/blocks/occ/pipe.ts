import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createDummyPromiseIndicator, createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { occConstants } from './occ-constants';
import { OCC } from 'projects/bitbybit-core/src/lib/api/inputs/occ-inputs';

export function createPipeBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'occ_pipe';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('OccShape')
                .setCheck('OccShape')
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_pipe_input_shape);
            this.appendValueInput('OccShapes')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_pipe_input_shapes.toLowerCase());
            this.setOutput(true, 'OccShape');
            this.setColour('#fff');
            this.setTooltip(resources.block_occ_pipe_description);
            this.setHelpUrl(environment.docsUrl + occConstants.occHelpUrl + '#' + 'pipe');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: OCC.PipeDto = {
            shape: (JavaScript as any).valueToCode(block, 'OccShape', (JavaScript as any).ORDER_ATOMIC),
            shapes: (JavaScript as any).valueToCode(block, 'OccShapes', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_occ_pipe_input_shape,
            resources.block_occ_pipe_input_shapes,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `bitbybit.occ.pipe(inputs)`, true
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
            getRequired(resources, resources.block_occ_pipe_input_shape),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_occ_pipe_input_shapes),
        ]
    }];
}


