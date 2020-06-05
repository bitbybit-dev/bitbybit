import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorFiniteBlock() {

    Blocks['verb_core_vector_finite'] = {
        init: function () {
            this.appendValueInput("Vector")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Check elements for infinity in list");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Creates collection of booleans that identify if elements in the list are finite or not.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_vector_finite'] = function (block) {
        let value_vector = JavaScript.valueToCode(block, 'Vector', JavaScript.ORDER_ATOMIC);

        let code = `(() => verb.core.Vec.finite(${value_vector}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}