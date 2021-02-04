import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, HS } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { intervalConstants } from './interval-constants';

export function createCoreIntervalGetMaxBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_core_interval_get_max';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Interval')
                .setCheck('Interval')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_core_interval_get_max);
            this.setOutput(true, 'Number');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_core_interval_get_max_description);
            this.setHelpUrl(environment.docsUrl + intervalConstants.helpUrl + '#' + 'max');
        }
    };

    JavaScript[blockSelector] =  (block: Block) => {
        const inputs = {
            interval: (JavaScript as any).valueToCode(block, 'Interval', (JavaScript as any).ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings

        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_interval
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return inputs.interval.max;`);
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
