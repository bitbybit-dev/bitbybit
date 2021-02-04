import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createDummyAsyncLoadingIndicator, createStandardContextIIFE } from '../../_shared';
import { getRequired, HS, ValidationEntityInterface } from '../../validations';

export function createExecuteAtIntervalWithHandlerBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_time_execute_at_interval_with_handler';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Interval')
                .setCheck('Number')
                .appendField(resources.block_base_time_execute_at_interval_with_handler_input_interval);
            this.appendDummyInput('Unit')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_time_execute_at_interval_with_handler_input_unit.toLowerCase());
            this.appendStatementInput('Then')
                .setCheck(null)
                .appendField(resources.block_base_time_execute_at_interval_with_handler_statement_then.toLowerCase());
            createDummyAsyncLoadingIndicator(this, resources);
            this.setColour('#fff');
            this.setInputsInline(true);
            this.setOutput(true, 'IntervalHandler');
            this.setTooltip(resources.block_base_time_execute_at_interval_with_handler_description);
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
        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const interval = setInterval(() => {
                inputs.statement_then();
            }, inputs.interval * 1000);
            BitByBit.BitByBitBlocklyHelperService.intervalBag.push(interval);
            return interval;
`);
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
            getRequired(resources, resources.block_interval),
        ]
    }];
}

