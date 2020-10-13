import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createCoreVectorAngleBetweenNormalized2dBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_core_vector_angle_between_normalized_2d';

    Blocks[blockSelector] = {
        init () {
            this.appendValueInput('First')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_core_vector_angle_between_normalized_2d_input_first);
            this.appendValueInput('Second')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_core_vector_angle_between_normalized_2d_input_second.toLowerCase());
            this.setOutput(true, 'Number');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_core_vector_angle_between_normalized_2d_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            first: JavaScript.valueToCode(block, 'First', JavaScript.ORDER_ATOMIC),
            second: JavaScript.valueToCode(block, 'Second', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_vector, resources.block_vector
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return BitByBit.verb.core.Vec.angleBetweenNormalized2d(inputs.first, inputs.second);`);

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
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_vector),
        ]
    }];
}
