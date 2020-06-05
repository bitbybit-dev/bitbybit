import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createLineLengthBlock() {

    Blocks['base_geometry_line_length'] = {
        init: function () {
            this.appendValueInput("Line")
                .setCheck("Line")
                .setAlign(ALIGN_RIGHT)
                .appendField("Length of the line");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Calculates the line length.");
            this.setHelpUrl("");
        }
    };

    JavaScript['base_geometry_line_length'] = function (block) {
        let value_line = JavaScript.valueToCode(block, 'Line', JavaScript.ORDER_ATOMIC);

        let code = `(() => verb.core.Vec.dist(${value_line}.start, ${value_line}.end))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}