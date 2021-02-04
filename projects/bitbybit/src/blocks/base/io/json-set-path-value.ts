import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../validations';

export function createJsonSetPathValueBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_io_json_set_path_value';
    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('JSON')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_json_set_path_value_input_json);
            this.appendValueInput('Value')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_json_set_path_value_input_value.toLowerCase());
            this.appendValueInput('Path')
                .setCheck('String')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_json_set_path_value_input_path.toLowerCase());
            this.setOutput(true);
            this.setColour('#fff');
            this.setHelpUrl('https://www.npmjs.com/package/jsonpath');
            this.setTooltip(resources.block_base_io_json_set_path_value_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            json: (JavaScript as any).valueToCode(block, 'JSON', (JavaScript as any).ORDER_ATOMIC),
            path: (JavaScript as any).valueToCode(block, 'Path', (JavaScript as any).ORDER_ATOMIC),
            value: (JavaScript as any).valueToCode(block, 'Value', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_json, resources.block_value, resources.block_path
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;
        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const clonedJson = {...inputs.json};
            BitByBit.BitByBitBlocklyHelperService.jsonpath.value(clonedJson, inputs.path, inputs.value);
            return clonedJson;
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
            getRequired(resources, resources.block_json),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_value),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_path),
        ]
    }];
}
