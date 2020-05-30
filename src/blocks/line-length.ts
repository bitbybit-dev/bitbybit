import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createLineLengthBlock() {

    Blocks['functions_line_length'] = {
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

    JavaScript['functions_line_length'] = function (block) {
        var value_line = JavaScript.valueToCode(block, 'Line', JavaScript.ORDER_ATOMIC);

        var code = `
(() => {
    var line = ${value_line};
    return verb.core.Vec.dist(line.start, line.end);
})()
        `;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}