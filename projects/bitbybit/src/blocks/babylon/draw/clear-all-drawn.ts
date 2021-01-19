import { Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { sceneConstants } from '../scene/scene-constants';

export function createClearAllDrawnBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_clear_all_drawn';

    Blocks[blockSelector] = {
        init(): void {
            this.appendDummyInput('ClearAllDrawn')
                .appendField(resources.block_base_clear_all_drawn_input_clear_all_drawn);
            this.setColour('#fff');
            this.setOutput(false);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_base_clear_all_drawn_description);
            this.setHelpUrl(environment.docsUrl + sceneConstants.helpUrl + '#' + 'clearalldrawn');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
        };

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `bitbybit.scene.clearAllDrawn();`
        );
    };
}
