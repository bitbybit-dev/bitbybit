import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, HS } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { uvConstants } from './uv-constants';

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
            this.setHelpUrl(environment.docsUrl + uvConstants.helpUrl + '#' + 'u');
        }
    };

    JavaScript[blockSelector] =  (block: Block) => {
        const inputs = {
            uv: (JavaScript as any).valueToCode(block, 'UV', (JavaScript as any).ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings

        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_uv
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return inputs.uv.u;`);
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
