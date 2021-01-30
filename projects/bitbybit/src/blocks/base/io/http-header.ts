import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../validations';

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
            name: (JavaScript as any).valueToCode(block, 'Name', (JavaScript as any).ORDER_ATOMIC),
            value: (JavaScript as any).valueToCode(block, 'Value', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_name, resources.block_value
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;
        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
return {name: inputs.name, value: inputs.value};
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
            getRequired(resources, resources.block_name),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_value),
        ]
    }];
}
