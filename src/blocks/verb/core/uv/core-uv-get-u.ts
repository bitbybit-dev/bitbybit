import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../../validations';

export function createCoreUVGetUBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_core_uv_get_u';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('UV')
                .setCheck('UV')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_core_uv_get_u);
            this.setOutput(true, 'Number');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_core_uv_get_u_description);
        }
    };

    JavaScript[blockSelector] =  (block: Block) => {
        const inputs = {
            uv: JavaScript.valueToCode(block, 'UV', JavaScript.ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings

        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_uv
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return inputs.uv.u;`);
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
