import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';

export function createModulusBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_math_modulus';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Number')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_math_modulus_input_number);
            this.appendValueInput('Modulus')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_math_modulus_input_modulus.toLowerCase());
            this.setOutput(true, 'Number');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_math_modulus_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            number: JavaScript.valueToCode(block, 'Number', JavaScript.ORDER_ATOMIC),
            modulus: JavaScript.valueToCode(block, 'Modulus', JavaScript.ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_number, resources.block_modulus,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
return inputs.number % inputs.modulus;
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
            getRequired(resources, resources.block_number),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_modulus),
        ]
    }];
}
