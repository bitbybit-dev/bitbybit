import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';

export function createDateCreateUnixTimestampBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_date_create_unix_timestamp';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('UnixTimestamp')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_date_create_unix_timestamp_input_unix_timestamp);
            this.setOutput(true, 'Date');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_date_create_unix_timestamp_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            unixTimestamp: JavaScript.valueToCode(block, 'UnixTimestamp', JavaScript.ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_unix_timestamp
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
return new Date(inputs.unixTimestamp);
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
            getRequired(resources, resources.block_unix_timestamp),
        ]
    }];
}
