import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';

export function createHttpParamBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_io_http_param';
    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Param')
                .setCheck('String')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_http_param_input_name);
            this.appendValueInput('Value')
                .setCheck('String')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_http_param_input_value.toLowerCase());
            this.setOutput(true, 'HttpParam');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_io_http_param_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            param: JavaScript.valueToCode(block, 'Param', JavaScript.ORDER_ATOMIC),
            value: JavaScript.valueToCode(block, 'Value', JavaScript.ORDER_ATOMIC),
        };

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
`
return {param: inputs.param, value: inputs.value};
`
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
