import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';

export function createJsonPathQueryBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_io_json_path_query';
    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('JSON')
                .setCheck('Any')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_json_path_query_input_json);
            this.appendValueInput('Query')
                .setCheck('String')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_json_path_query_input_query.toLowerCase());
            this.setOutput(true, 'Any');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_io_json_path_query_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            json: JavaScript.valueToCode(block, 'JSON', JavaScript.ORDER_ATOMIC),
            query: JavaScript.valueToCode(block, 'Query', JavaScript.ORDER_ATOMIC),
        };

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
`
return BitByBitBlocklyHelperService.jsonpath.query(inputs.json, inputs.query);
`
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
