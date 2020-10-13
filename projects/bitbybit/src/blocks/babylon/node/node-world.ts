import { Block, Blocks, ALIGN_RIGHT } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';

export function createNodeWorldBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_node_world';

    Blocks[blockSelector] = {
        init() {
            this.appendDummyInput('WorldNode')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_node_world_input_world);
            this.setOutput(true, 'Node');
            this.setColour('#fff');
            this.setTooltip(resources.block_babylon_node_world_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
        };

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const tnode = new BitByBit.BABYLON.TransformNode("root${Math.random()}");
            tnode.parent = BitByBit.scene.getTransformNodeById('root');
            return tnode;
`
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
