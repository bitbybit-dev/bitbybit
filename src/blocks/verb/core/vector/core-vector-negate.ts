import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorNegateBlock() {

    Blocks['verb_core_vector_negate'] = {
        init: function () {
            this.appendValueInput("Vector")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("Negate the vector");
            this.setOutput(true, "Vector3");
            this.setColour("#fff");
            this.setTooltip("Negates the vector.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_vector_negate'] = function (block) {
        var value_vector = JavaScript.valueToCode(block, 'Vector', JavaScript.ORDER_ATOMIC);
        
        var code = `(() => verb.core.Vec.neg(${value_vector}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}