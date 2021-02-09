import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createDummyPromiseIndicator, createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { occtConstants } from './occt-constants';
import { OCC } from 'projects/bitbybit-core/src/lib/api/inputs/occ-inputs';

export function createLoftBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'occt_operations_loft';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('OccShapes')
                .setCheck('Array')
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_operations_loft_input_shapes);
            this.appendValueInput('MakeSolid')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_operations_loft_input_make_solid.toLowerCase());
            this.setOutput(true, 'OccShape');
            this.setColour('#fff');
            this.setTooltip(resources.block_occt_operations_loft_description);
            this.setHelpUrl(environment.docsUrl + occtConstants.occtOperationsHelpUrl + '#' + 'loft');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: OCC.LoftDto = {
            shapes: (JavaScript as any).valueToCode(block, 'OccShapes', (JavaScript as any).ORDER_ATOMIC),
            makeSolid: (JavaScript as any).valueToCode(block, 'MakeSolid', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_occt_operations_loft_input_shapes,
            resources.block_occt_operations_loft_input_make_solid,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `bitbybit.occt.operations.loft(inputs)`, true
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
            getRequired(resources, resources.block_occt_operations_loft_input_shapes),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_occt_operations_loft_input_make_solid),
        ]
    }];
}


