import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createPointXBlock() {

    Blocks['base_geometry_point_x'] = {
        init: function () {
            this.appendValueInput("Point")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("X coordinate of the point");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Gets X coordinate of the point.");
            this.setHelpUrl("");
        }
    };

    JavaScript['base_geometry_point_x'] = function (block) {
        let value_point = JavaScript.valueToCode(block, 'Point', JavaScript.ORDER_ATOMIC);
        
        let code = `${value_point}[0]`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}