import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorSubBlock() {

    Blocks['verb_core_vector_sub'] = {
        init: function () {
            this.appendValueInput("First")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Subtract vector");
            this.appendValueInput("Second")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("by vector");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Subtracts two vectors together.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_vector_sub'] = function (block) {
        let value_first = JavaScript.valueToCode(block, 'First', JavaScript.ORDER_ATOMIC);
        let value_second = JavaScript.valueToCode(block, 'Second', JavaScript.ORDER_ATOMIC);

        let code = `(() => verb.core.Vec.sub(${value_first}, ${value_second}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}