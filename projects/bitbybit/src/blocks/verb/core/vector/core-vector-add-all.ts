import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { vectorConstants } from './vector-constants';

export function createCoreVectorAddAllBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_core_vector_add_all';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Vectors')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_core_vector_add_all_input_vectors);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_core_vector_add_all_description);
            this.setHelpUrl(environment.docsUrl + vectorConstants.helpUrl + '#' + 'addall');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            vectors: (JavaScript as any).valueToCode(block, 'Vectors', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_vectors
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true, `return bitbybit.vector.addAll(inputs);`);

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
            getRequired(resources, resources.block_vectors),
        ]
    }];
}
