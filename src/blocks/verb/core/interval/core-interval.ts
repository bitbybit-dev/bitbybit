import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, getSmallerOrEqualThan, makeRequiredValidationModelForInputs, BlockValidationService, ValidationEntityInterface } from '../../../validations';

export function createCoreIntervalBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_core_interval';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Min')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_core_interval_input_min);
            this.appendValueInput('Max')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_core_interval_input_max);
            this.setOutput(true, 'Interval');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_core_interval_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            min: JavaScript.valueToCode(block, 'Min', JavaScript.ORDER_ATOMIC),
            max: JavaScript.valueToCode(block, 'Max', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BlockValidationService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_min, resources.block_max
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return {min: ${inputs.min}, max: ${inputs.max}};`);
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
            getRequired(resources, resources.block_min),
            getSmallerOrEqualThan(resources, resources.block_min, 'max', resources.block_max)
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_max),
        ]
    }];
}
