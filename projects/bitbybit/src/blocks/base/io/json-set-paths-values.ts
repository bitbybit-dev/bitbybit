import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';

export function createJsonSetPathsValuesBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_io_json_set_paths_values';
    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('JSON')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_json_set_paths_values_input_json);
            this.appendValueInput('PathsValues')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_json_set_paths_values_input_paths_values.toLowerCase());
            this.setOutput(true);
            this.setColour('#fff');
            this.setHelpUrl('https://www.npmjs.com/package/jsonpath');
            this.setTooltip(resources.block_base_io_json_set_paths_values_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            json: JavaScript.valueToCode(block, 'JSON', JavaScript.ORDER_ATOMIC),
            pathsValues: JavaScript.valueToCode(block, 'PathsValues', JavaScript.ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_json, resources.block_paths_values
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;
        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const clonedJson = {...inputs.json};
            inputs.pathsValues.forEach(pv => {
                BitByBit.BitByBitBlocklyHelperService.jsonpath.value(clonedJson, pv.path, pv.value);
            });
            return clonedJson;
            `);
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
            getRequired(resources, resources.block_json),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_paths_values),
        ]
    }];
}
