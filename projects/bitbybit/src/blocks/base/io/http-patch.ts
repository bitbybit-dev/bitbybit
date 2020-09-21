import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { getRequired, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createDummyPromiseIndicator, createStandardContextIIFE } from '../../_shared';

export function createHttpPatchBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_io_http_patch';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Url')
                .setCheck('String')
                .setAlign(ALIGN_RIGHT)
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .appendField(resources.block_base_io_http_patch_input_url);
            this.appendValueInput('Body')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_http_patch_input_body.toLowerCase());
            this.appendValueInput('HttpOptions')
                .setCheck('HttpOptions')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_http_patch_input_options.toLowerCase());
            this.setOutput(true, 'Promise');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_io_http_patch_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            url: JavaScript.valueToCode(block, 'Url', JavaScript.ORDER_ATOMIC),
            body: JavaScript.valueToCode(block, 'Body', JavaScript.ORDER_ATOMIC),
            httpOptions: JavaScript.valueToCode(block, 'HttpOptions', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, [{
            entity: inputs.url,
            validations: [
                getRequired(resources, resources.block_url)
            ]
        }, {
            entity: inputs.body,
            validations: [
                getRequired(resources, resources.block_body)
            ]
        }]);

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;
        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            return BitByBit.BitByBitBlocklyHelperService.angular.httpClient.patch(inputs.url, inputs.body, inputs.options).toPromise();
`
        );
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
            getRequired(resources, resources.block_url),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_body),
        ]
    }];
}
