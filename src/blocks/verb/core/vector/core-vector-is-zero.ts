import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorIsZeroBlock() {

    Blocks['verb_core_vector_is_zero'] = {
        init: function () {
            this.appendValueInput("Vector")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Is zero vector");
            this.setOutput(true, "Boolean");
            this.setColour("#fff");
            this.setTooltip("Checks if vector is zero vector.");
            this.setHelpUrl("https://en.wikipedia.org/wiki/Norm_(mathematics)");
        }
    };

    JavaScript['verb_core_vector_is_zero'] = function (block) {
        let value_vector = JavaScript.valueToCode(block, 'Vector', JavaScript.ORDER_ATOMIC);

        let code = `(() => verb.core.Vec.isZero(${value_vector}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}