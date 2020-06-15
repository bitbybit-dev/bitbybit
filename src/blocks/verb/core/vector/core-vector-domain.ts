import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BlockValidationService, ValidationEntityInterface } from '../../../validations';

export function createCoreVectorDomainBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_core_vector_domain';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Vector')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_core_vector_domain_input_vector);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_core_vector_domain_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            vector: JavaScript.valueToCode(block, 'Vector', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BlockValidationService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_vector
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return verb.core.Vec.domain(inputs.vector);`);

        return [code, JavaScript.ORDER_ATOMIC];
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_vector),
        ]
    }];
}
