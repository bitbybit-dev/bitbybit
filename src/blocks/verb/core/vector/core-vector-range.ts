import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorRangeBlock() {

    Blocks['core_vector_range'] = {
        init: function () {
            this.appendValueInput("Max")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("Max integer bound of the range");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Populates array of numbers between 0 and maximum provided integer bound.");
            this.setHelpUrl("");
        }
    };

    JavaScript['core_vector_range'] = function (block) {
        var value_max = JavaScript.valueToCode(block, 'Max', JavaScript.ORDER_ATOMIC);
        
        var code = `(() => verb.core.Vec.range(${value_max}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}