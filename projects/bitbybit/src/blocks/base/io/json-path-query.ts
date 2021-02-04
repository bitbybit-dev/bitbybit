import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../validations';

export function createJsonPathQueryBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_io_json_path_query';
    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('JSON')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_json_path_query_input_json);
            this.appendValueInput('Query')
                .setCheck('String')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_json_path_query_input_query.toLowerCase());
            this.setOutput(true);
            this.setColour('#fff');
            this.setHelpUrl('https://www.npmjs.com/package/jsonpath');
            this.setTooltip(resources.block_base_io_json_path_query_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            json: (JavaScript as any).valueToCode(block, 'JSON', (JavaScript as any).ORDER_ATOMIC),
            query: (JavaScript as any).valueToCode(block, 'Query', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_json, resources.block_query
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;
        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return BitByBit.BitByBitBlocklyHelperService.jsonpath.query(inputs.json, inputs.query);`);
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
            getRequired(resources, resources.block_json),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_query),
        ]
    }];
}
