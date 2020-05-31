import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorNormBlock() {

    Blocks['verb_core_vector_norm'] = {
        init: function () {
            this.appendValueInput("Vector")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Norm of the vector");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Computes the norm of the vector.");
            this.setHelpUrl("https://en.wikipedia.org/wiki/Norm_(mathematics)");
        }
    };

    JavaScript['verb_core_vector_norm'] = function (block) {
        var value_vector = JavaScript.valueToCode(block, 'Vector', JavaScript.ORDER_ATOMIC);

        var code = `(() => verb.core.Vec.norm(${value_vector}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}