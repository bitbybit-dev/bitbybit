import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../validations';

export function createDateCreateUtcBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_date_create_utc';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Year')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_date_create_utc_input_year);
            this.appendValueInput('Month')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_date_create_utc_input_month);
            this.appendValueInput('Day')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_date_create_utc_input_day);
            this.appendValueInput('Hour')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_date_create_utc_input_hour);
            this.appendValueInput('Minute')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_date_create_utc_input_minute);
            this.appendValueInput('Second')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_date_create_utc_input_second);
            this.setOutput(true, 'Date');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_date_create_utc_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            year: (JavaScript as any).valueToCode(block, 'Year', (JavaScript as any).ORDER_ATOMIC),
            month: (JavaScript as any).valueToCode(block, 'Month', (JavaScript as any).ORDER_ATOMIC),
            day: (JavaScript as any).valueToCode(block, 'Day', (JavaScript as any).ORDER_ATOMIC),
            hour: (JavaScript as any).valueToCode(block, 'Hour', (JavaScript as any).ORDER_ATOMIC),
            minute: (JavaScript as any).valueToCode(block, 'Minute', (JavaScript as any).ORDER_ATOMIC),
            second: (JavaScript as any).valueToCode(block, 'Second', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_year, resources.block_month, resources.block_day,
            resources.block_hour, resources.block_minute, resources.block_second,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
return new Date(Date.UTC(inputs.year, inputs.month - 1, inputs.day, inputs.hour, inputs.minute, inputs.second));
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
            getRequired(resources, resources.block_year),
        ]
    },{
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_month),
        ]
    },{
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_day),
        ]
    },{
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_hour),
        ]
    },{
        entity: keys[4],
        validations: [
            getRequired(resources, resources.block_minute),
        ]
    },{
        entity: keys[5],
        validations: [
            getRequired(resources, resources.block_second),
        ]
    }];
}
