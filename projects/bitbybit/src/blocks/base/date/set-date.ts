import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';

export function createDateSetDateBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_date_set_date';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Date')
                .setCheck('Date')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_date_set_date_input_date);
            this.appendValueInput('Day')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_date_set_date_input_day.toLowerCase());
            this.setOutput(true, 'Number');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_date_set_date_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            date: (JavaScript as any).valueToCode(block, 'Date', (JavaScript as any).ORDER_ATOMIC),
            day: (JavaScript as any).valueToCode(block, 'Day', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_date, resources.block_day
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
return new Date(inputs.date.setDate(inputs.day));
`
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
            getRequired(resources, resources.block_date),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_day),
        ]
    }];
}
