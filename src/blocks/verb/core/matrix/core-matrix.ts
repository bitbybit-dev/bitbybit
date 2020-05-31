import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreMatrixBlock() {

    Blocks['verb_core_matrix'] = {
        init: function () {
            this.appendValueInput("Matrix")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("List of lists of numbers.");
            this.setOutput(true, "Matrix");
            this.setColour("#fff");
            this.setTooltip("Constructs a matrix object by providing a list of lists containing numbers.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_matrix'] = function (block) {
        var value_matrix = JavaScript.valueToCode(block, 'Matrix', JavaScript.ORDER_ATOMIC);
        
        var code = `${value_matrix}`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}