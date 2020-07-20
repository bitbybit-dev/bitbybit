import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';

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
            this.setOutput(true, 'Any');
            this.setColour('#fff');
            this.setHelpUrl('https://www.npmjs.com/package/jsonpath');
            this.setTooltip(resources.block_base_io_json_set_path_value_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            json: JavaScript.valueToCode(block, 'JSON', JavaScript.ORDER_ATOMIC),
            path: JavaScript.valueToCode(block, 'Path', JavaScript.ORDER_ATOMIC),
            value: JavaScript.valueToCode(block, 'Value', JavaScript.ORDER_ATOMIC),
        };

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const clonedJson = {...inputs.json};
            BitByBitBlocklyHelperService.jsonpath.value(clonedJson, inputs.path, inputs.value);
            return clonedJson;
            `);
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
