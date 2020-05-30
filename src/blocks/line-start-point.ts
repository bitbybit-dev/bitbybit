import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createLineGetStartPointBlock() {

    Blocks['functions_line_get_start_point'] = {
        init: function () {
            this.appendValueInput("Line")
                .setCheck("Line")
                .setAlign(ALIGN_RIGHT)
                .appendField("Start point of the line");
            this.setOutput(true, "Vector3");
            this.setColour("#fff");
            this.setTooltip("Gets the start point of the line.");
            this.setHelpUrl("");
        }
    };

    JavaScript['functions_line_get_start_point'] = function (block) {
        var value_line = JavaScript.valueToCode(block, 'Line', JavaScript.ORDER_ATOMIC);

        var code = `${value_line}.start`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}