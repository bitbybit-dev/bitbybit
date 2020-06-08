import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';

export function createLineEndPointBlock() {

    const resources = ResourcesService.getResourcesForSelectedLanguage();
    const blockSelector = 'base_geometry_line_end_point';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Line')
                .setCheck('Line')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_line_end_point);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_line_end_point_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const valueLine = JavaScript.valueToCode(block, 'Line', JavaScript.ORDER_ATOMIC);

        const code = `${valueLine}.end /* Component: "${blockSelector}", Block ID: "${block.id}" */`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}