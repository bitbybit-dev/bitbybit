import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createDummyPromiseIndicator, createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { occConstants } from './occ-constants';
import { OCC } from 'projects/bitbybit-core/src/lib/api/inputs/occ-inputs';

export function createBooleanDifferenceBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'occ_boolean_difference';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('OccShape')
                .setCheck('OccShape')
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_boolean_difference_input_shape);
            this.appendValueInput('OccShapes')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_boolean_difference_input_shapes.toLowerCase());
            this.appendValueInput('KeepEdges')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_boolean_difference_input_keep_edges.toLowerCase());
            this.setOutput(true, 'OccShape');
            this.setColour('#fff');
            this.setTooltip(resources.block_occ_boolean_difference_description);
            this.setHelpUrl(environment.docsUrl + occConstants.occHelpUrl + '#' + 'difference');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: OCC.DifferenceDto = {
            shape: (JavaScript as any).valueToCode(block, 'OccShape', (JavaScript as any).ORDER_ATOMIC),
            shapes: (JavaScript as any).valueToCode(block, 'OccShapes', (JavaScript as any).ORDER_ATOMIC),
            keepEdges: (JavaScript as any).valueToCode(block, 'KeepEdges', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_occ_boolean_difference_input_shape,
            resources.block_occ_boolean_difference_input_shapes,
            resources.block_occ_boolean_difference_input_keep_edges,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `bitbybit.occ.difference(inputs)`, true
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
            getRequired(resources, resources.block_occ_boolean_difference_input_shape),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_occ_boolean_difference_input_shapes),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_occ_boolean_difference_input_keep_edges),
        ]
    }];
}


