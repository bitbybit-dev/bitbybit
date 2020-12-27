import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createCoreVectorRangeBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_core_vector_range';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Max')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_core_vector_range_input_max);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_core_vector_range_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            max: (JavaScript as any).valueToCode(block, 'Max', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_integer
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.vector.range(inputs);`);

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
            getRequired(resources, resources.block_integer),
        ]
    }];
}
