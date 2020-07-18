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
            headers: JavaScript.valueToCode(block, 'Headers', JavaScript.ORDER_ATOMIC),
            params: JavaScript.valueToCode(block, 'Params', JavaScript.ORDER_ATOMIC),
            withCredentials: JavaScript.valueToCode(block, 'WithCredentials', JavaScript.ORDER_ATOMIC),
        };

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
`
let headers;
if(inputs.headers && inputs.headers.length > 0){
    headers = new BitByBitBlocklyHelperService.angular.HttpHeaders();
    console.log(inputs.headers);
    inputs.headers.forEach(header => {
        headers = headers.append(header.name, header.value);
    });
}
let params;
if(inputs.params && inputs.params.length > 0){
    params = new BitByBitBlocklyHelperService.angular.HttpParams();
    console.log(inputs.params);
    inputs.params.forEach(param => {
        params = params.append(param.param, param.value);
    });
}
const options = {
    ${inputs.headers ? 'headers,' : ''}
    ${inputs.params ? 'params,' : ''}
    ${inputs.withCredentials ? 'withCredentials: inputs.withCredentials,' : ''}
};
return options;
`
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
