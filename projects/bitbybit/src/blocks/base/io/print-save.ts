import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';

export function createPrintSaveBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_io_print_save';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Text')
                .setCheck('String')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_io_print_save_input_text);
            this.setColour('#fff');
            this.setOutput(false);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_base_io_print_save_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            text: (JavaScript as any).valueToCode(block, 'Text', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_text
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;
        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `BitByBitBlocklyHelperService.promptPrintSave({text: inputs.text});`);
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_text),
        ]
    }];
}
