import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';

export function createHttpOptionsBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_io_http_options';
    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Headers')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_http_options_input_headers);
            this.appendValueInput('Params')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_http_options_input_params.toLowerCase());
            this.appendValueInput('WithCredentials')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_http_options_input_with_credentials.toLowerCase());
            this.setOutput(true, 'HttpOptions');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_io_http_options_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            headers: JavaScript.valueToCode(block, 'Url', JavaScript.ORDER_ATOMIC),
            params: JavaScript.valueToCode(block, 'Body', JavaScript.ORDER_ATOMIC),
            withCredentials: JavaScript.valueToCode(block, 'HttpOptions', JavaScript.ORDER_ATOMIC),
        };

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
return {
    ${inputs.headers ? 'headers: inputs.headers,' : ''}
    ${inputs.params ? 'params: inputs.params,' : ''}
    ${inputs.withCredentials ? 'withCredentials: inputs.withCredentials,' : ''}
};
`
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
