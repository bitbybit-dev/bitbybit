import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorSumBlock() {

    Blocks['verb_core_vector_sum'] = {
        init: function () {
            this.appendValueInput("Vector")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Sum all numbers of the vector");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Sums all elements of the vector.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_vector_sum'] = function (block) {
        var value_vector = JavaScript.valueToCode(block, 'Vector', JavaScript.ORDER_ATOMIC);

        var code = `(() => verb.core.Vec.sum(${value_vector}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}