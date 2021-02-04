import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createDummyAsyncLoadingIndicator, createStandardContextIIFE } from '../../_shared';
import { getRequired, HS, ValidationEntityInterface } from '../../validations';

export function createExecuteAtIntervalBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_time_execute_at_interval';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Interval')
                .setCheck('Number')
                .appendField(resources.block_base_time_execute_at_interval_input_interval);
            this.appendDummyInput('Unit')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_time_execute_at_interval_input_unit.toLowerCase());
            this.appendStatementInput('Then')
                .setCheck(null)
                .appendField(resources.block_base_time_execute_at_interval_statement_then.toLowerCase());
            createDummyAsyncLoadingIndicator(this, resources);
            this.setColour('#fff');
            this.setInputsInline(true);
            this.setOutput(false);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_base_time_execute_at_interval_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            interval: (JavaScript as any).valueToCode(block, 'Interval', (JavaScript as any).ORDER_ATOMIC),
            statement_then: (JavaScript as any).statementToCode(block, 'Then'),
        };
        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, [{
            entity: inputs.interval,
            validations: [
                getRequired(resources, resources.block_interval)
            ]
        }]);

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;
        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
const interval = setInterval(() => {
    inputs.statement_then();
}, inputs.interval * 1000);
BitByBitBlocklyHelperService.intervalBag.push(interval);
`);
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_interval),
        ]
    }];
}

