import { Block, Blocks, FieldVariable, Variables, VARIABLE_CATEGORY_NAME } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createDummyAsyncLoadingIndicator, createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';

export function createCatchBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_time_catch';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Promise')
                    .setCheck(null)
                    .appendField(resources.block_base_time_catch_input_promise_one)
                    .appendField(new FieldVariable(resources.block_base_time_catch_var_error), 'Error')
                    .appendField(resources.block_base_time_catch_input_promise_two);
            this.appendStatementInput('Catch')
                    .setCheck(null)
                    .appendField(resources.block_base_time_catch_statement_catch.toLowerCase());
            createDummyAsyncLoadingIndicator(this, resources);
            this.setColour('#fff');
            this.setOutput(false);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_base_time_catch_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            error: JavaScript.variableDB_.getName(block.getFieldValue('Error'), VARIABLE_CATEGORY_NAME),
            promise: JavaScript.valueToCode(block, 'Promise', JavaScript.ORDER_ATOMIC),
            statement_catch: JavaScript.statementToCode(block, 'Catch'),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, [{
            entity: inputs.promise,
            validations: [
                getRequired(resources, resources.block_promise)
            ]
        }]);

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;
        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
            const block = blocklyWorkspace.getBlockById('${block.id}');
            inputs.promise.catch((err) => {
                inputs.error = err;
                ${JavaScript.variableDB_.getName(block.getFieldValue('Error'), VARIABLE_CATEGORY_NAME)} = err;
                return inputs.statement_catch();
            });
`);
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_promise),
        ]
    }];
}

