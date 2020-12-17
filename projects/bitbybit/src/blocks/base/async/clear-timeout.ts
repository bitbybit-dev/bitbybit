import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';

export function createClearTimeoutBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_time_clear_timeout';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('TimeoutHandler')
                .setCheck('TimeoutHandler')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_time_clear_timeout_input_timeout_handler);
            this.setOutput(false);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_base_time_clear_timeout_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            timeoutHandler: (JavaScript as any).valueToCode(block, 'TimeoutHandler', (JavaScript as any).ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_timeout_handler
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;
        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
            clearTimeout(inputs.timeoutHandler);
            BitByBit.BitByBitBlocklyHelperService.timeoutBag = BitByBit.BitByBitBlocklyHelperService.timeoutBag.filter(t => t !== inputs.timeoutHandler);
            `
        );
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_timeout_handler),
        ]
    }];
}
