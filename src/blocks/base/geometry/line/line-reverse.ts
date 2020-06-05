import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createLineReverseBlock() {

    Blocks['base_geometry_line_reverse'] = {
        init: function () {
            this.appendValueInput("Line")
                .setCheck("Line")
                .setAlign(ALIGN_RIGHT)
                .appendField("Reverse the line");
            this.setOutput(true, "Line");
            this.setColour("#fff");
            this.setTooltip("Reverses the line direction.");
            this.setHelpUrl("");
        }
    };

    JavaScript['base_geometry_line_reverse'] = function (block) {
        let value_line = JavaScript.valueToCode(block, 'Line', JavaScript.ORDER_ATOMIC);

        let code = `{start: ${value_line}.end, end: ${value_line}.start}`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}