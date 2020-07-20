import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';

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
            this.setOutput(true, 'Any');
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

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const clonedJson = {...inputs.json};
            inputs.pathsValues.forEach(pv => {
                BitByBitBlocklyHelperService.jsonpath.value(clonedJson, pv.path, pv.value);
            });
            return clonedJson;
            `);
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
