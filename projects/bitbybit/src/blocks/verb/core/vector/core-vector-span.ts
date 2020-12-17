import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createCoreVectorSpanBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_core_vector_span';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Min')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_core_vector_span_input_min);
            this.appendValueInput('Max')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_core_vector_span_input_max.toLowerCase());
            this.appendValueInput('Step')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_core_vector_span_input_step.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_core_vector_span_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            min: (JavaScript as any).valueToCode(block, 'Min', (JavaScript as any).ORDER_ATOMIC),
            max: (JavaScript as any).valueToCode(block, 'Max', (JavaScript as any).ORDER_ATOMIC),
            step: (JavaScript as any).valueToCode(block, 'Step', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_min, resources.block_max, resources.block_step
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return BitByBit.verb.core.Vec.span(inputs.min, inputs.max, inputs.step);`);
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
            getRequired(resources, resources.block_min),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_max),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_step),
        ]
    }];
}
