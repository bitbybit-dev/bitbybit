import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createPointGetYBlock() {

    Blocks['function_point_get_y'] = {
        init: function () {
            this.appendValueInput("Point")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("Y coordinate of the point");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Gets Y coordinate of the point.");
            this.setHelpUrl("");
        }
    };

    JavaScript['function_point_get_y'] = function (block) {
        var value_point = JavaScript.valueToCode(block, 'Point', JavaScript.ORDER_ATOMIC);
        
        var code = `${value_point}[1]`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}