import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createPointXBlock() {

    Blocks['base_geometry_point_x'] = {
        init: function () {
            this.appendValueInput("Point")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("X coordinate of the point");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Gets X coordinate of the point.");
            this.setHelpUrl("");
        }
    };

    JavaScript['base_geometry_point_x'] = function (block) {
        var value_point = JavaScript.valueToCode(block, 'Point', JavaScript.ORDER_ATOMIC);
        
        var code = `${value_point}[0]`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}