import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';

export function createLineStartPointBlock() {

    const resources = ResourcesService.getResourcesForSelectedLanguage();
    const blockSelector = 'base_geometry_line_start_point';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Line')
                .setCheck('Line')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_line_start_point);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_line_start_point_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const valueLine = JavaScript.valueToCode(block, 'Line', JavaScript.ORDER_ATOMIC);

        // for information getters we do not validate if line is correct because it is already done in line component

        const code = `${valueLine}.start /* Component: "${blockSelector}", Block ID: "${block.id}" */`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}