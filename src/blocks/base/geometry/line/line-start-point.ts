import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createLineStartPointBlock() {

    Blocks['base_geometry_line_start_point'] = {
        init: function () {
            this.appendValueInput("Line")
                .setCheck("Line")
                .setAlign(ALIGN_RIGHT)
                .appendField("Start point of the line");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Gets the start point of the line.");
            this.setHelpUrl("");
        }
    };

    JavaScript['base_geometry_line_start_point'] = function (block) {
        let value_line = JavaScript.valueToCode(block, 'Line', JavaScript.ORDER_ATOMIC);

        let code = `${value_line}.start`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}