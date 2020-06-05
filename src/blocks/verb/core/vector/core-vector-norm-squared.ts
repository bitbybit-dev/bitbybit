import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorNormSquaredBlock() {

    Blocks['verb_core_vector_norm_squared'] = {
        init: function () {
            this.appendValueInput("Vector")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Norm squared for the vector");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Computes the squared norm of the vector.");
            this.setHelpUrl("https://en.wikipedia.org/wiki/Norm_(mathematics)");
        }
    };

    JavaScript['verb_core_vector_norm_squared'] = function (block) {
        let value_vector = JavaScript.valueToCode(block, 'Vector', JavaScript.ORDER_ATOMIC);

        let code = `(() => verb.core.Vec.normSquared(${value_vector}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}