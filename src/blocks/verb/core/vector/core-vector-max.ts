import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorMaxBlock() {

    Blocks['verb_core_vector_max'] = {
        init: function () {
            this.appendValueInput("Vector")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Maximum value in the vector");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Finds maximum value in the vector.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_vector_max'] = function (block) {
        let value_vector = JavaScript.valueToCode(block, 'Vector', JavaScript.ORDER_ATOMIC);
        
        let code = `(() => verb.core.Vec.max(${value_vector}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}