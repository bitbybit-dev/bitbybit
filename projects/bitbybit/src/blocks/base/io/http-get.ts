import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { getRequired, HS, ValidationEntityInterface } from '../../validations';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createDummyPromiseIndicator, createStandardContextIIFE } from '../../_shared';

export function createHttpGetBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_io_http_get';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Url')
                .setCheck('String')
                .setAlign(ALIGN_RIGHT)
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .appendField(resources.block_base_io_http_get_input_url);
            this.appendValueInput('HttpOptions')
                .setCheck('HttpOptions')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_http_get_input_options.toLowerCase());
            this.setOutput(true, 'Promise');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_io_http_get_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            url: (JavaScript as any).valueToCode(block, 'Url', (JavaScript as any).ORDER_ATOMIC),
            httpOptions: (JavaScript as any).valueToCode(block, 'HttpOptions', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, [{
            entity: inputs.url,
            validations: [
                getRequired(resources, resources.block_url)
            ]
        }]);

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;
        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            return BitByBit.BitByBitBlocklyHelperService.angular.httpClient.get(inputs.url, inputs.httpOptions).toPromise();
`
        );
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
            getRequired(resources, resources.block_url),
        ]
    }];
}
