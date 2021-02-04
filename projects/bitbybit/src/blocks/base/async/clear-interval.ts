import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../validations';

export function createClearIntervalBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_time_clear_interval';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('IntervalHandler')
                .setCheck('IntervalHandler')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_time_clear_interval_input_interval_handler);
            this.setOutput(false);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_base_time_clear_interval_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            intervalHandler: (JavaScript as any).valueToCode(block, 'IntervalHandler', (JavaScript as any).ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_interval_handler
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;
        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `clearInterval(inputs.intervalHandler);
            BitByBit.BitByBitBlocklyHelperService.intervalBag = BitByBit.BitByBitBlocklyHelperService.intervalBag.filter(t => t !== inputs.intervalHandler);
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
            getRequired(resources, resources.block_interval_handler),
        ]
    }];
}
