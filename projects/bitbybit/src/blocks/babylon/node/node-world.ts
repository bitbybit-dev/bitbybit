import { Block, Blocks, ALIGN_RIGHT } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { nodeConstants } from './node-constants';

export function createNodeWorldBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_node_world';

    Blocks[blockSelector] = {
        init(): void {
            this.appendDummyInput('WorldNode')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_node_world_input_world);
            this.setOutput(true, 'Node');
            this.setColour('#fff');
            this.setTooltip(resources.block_babylon_node_world_description);
            this.setHelpUrl(environment.docsUrl + nodeConstants.helpUrl + '#' + 'createworldnode');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
        };

        const code = createStandardContextIIFE(block, blockSelector, inputs, true, `return bitbybit.node.createWorldNode()`);
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
