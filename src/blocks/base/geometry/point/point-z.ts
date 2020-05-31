import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createPointZBlock() {

    Blocks['base_geometry_point_z'] = {
        init: function () {
            this.appendValueInput("Point")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Z coordinate of the point");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Gets Z coordinate of the point.");
            this.setHelpUrl("");
        }
    };

    JavaScript['base_geometry_point_z'] = function (block) {
        var value_point = JavaScript.valueToCode(block, 'Point', JavaScript.ORDER_ATOMIC);
        
        var code = `${value_point}[2]`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}