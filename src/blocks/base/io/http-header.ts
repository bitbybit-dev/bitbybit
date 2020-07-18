import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';

export function createHttpHeaderBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_io_http_header';
    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Name')
                .setCheck('String')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_http_header_input_name);
            this.appendValueInput('Value')
                .setCheck('String')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_http_header_input_value.toLowerCase());
            this.setOutput(true, 'HttpHeader');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_io_http_header_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            name: JavaScript.valueToCode(block, 'Name', JavaScript.ORDER_ATOMIC),
            value: JavaScript.valueToCode(block, 'Value', JavaScript.ORDER_ATOMIC),
        };

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
return {name: inputs.name, value: inputs.value};
`
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
