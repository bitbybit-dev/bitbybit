import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorDotBlock() {

    Blocks['verb_core_vector_dot'] = {
        init: function () {
            this.appendValueInput("First")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Dot product between vector");
            this.appendValueInput("Second")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("and vector");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Computes the dot product between two vectors.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_vector_dot'] = function (block) {
        var value_first = JavaScript.valueToCode(block, 'First', JavaScript.ORDER_ATOMIC);
        var value_second = JavaScript.valueToCode(block, 'Second', JavaScript.ORDER_ATOMIC);

        var code = `(() => verb.core.Vec.dot(${value_first}, ${value_second}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}