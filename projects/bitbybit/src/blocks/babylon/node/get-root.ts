import { Block, Blocks, ALIGN_RIGHT } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';

export function createNodeGetRootBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_node_get_root';

    Blocks[blockSelector] = {
        init() {
            this.appendDummyInput('RootNode')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_node_get_root_input_root);
            this.setOutput(true, 'Node');
            this.setColour('#fff');
            this.setTooltip(resources.block_babylon_node_get_root_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
        };

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            return BitByBit.scene.getTransformNodeByID('root');
`
        );
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
