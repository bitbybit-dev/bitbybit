import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { vectorConstants } from './vector-constants';

export function createCoreVectorMulBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_core_vector_mul';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Vector')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_core_vector_mul_input_vector);
            this.appendValueInput('Scalar')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_core_vector_mul_input_scalar.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_core_vector_mul_description);
            this.setHelpUrl(environment.docsUrl + vectorConstants.helpUrl + '#' + 'mul');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            vector: (JavaScript as any).valueToCode(block, 'Vector', (JavaScript as any).ORDER_ATOMIC),
            scalar: (JavaScript as any).valueToCode(block, 'Scalar', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_vector, resources.block_scalar
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.vector.mul(inputs);`);

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
            getRequired(resources, resources.block_vector),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_scalar),
        ]
    }];
}
