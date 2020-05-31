import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createLineEndPointBlock() {

    Blocks['base_geometry_line_end_point'] = {
        init: function () {
            this.appendValueInput("Line")
                .setCheck("Line")
                .setAlign(ALIGN_RIGHT)
                .appendField("End point of the line");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Gets the end point of the line.");
            this.setHelpUrl("");
        }
    };

    JavaScript['base_geometry_line_end_point'] = function (block) {
        var value_line = JavaScript.valueToCode(block, 'Line', JavaScript.ORDER_ATOMIC);

        var code = `${value_line}.end`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}