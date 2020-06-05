import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorMulBlock() {

    Blocks['verb_core_vector_mul'] = {
        init: function () {
            this.appendValueInput("Vector")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Multiply vector");
            this.appendValueInput("Scalar")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("with scalar");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Multiplies the vector with a scalar.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_vector_mul'] = function (block) {
        let value_vector = JavaScript.valueToCode(block, 'Vector', JavaScript.ORDER_ATOMIC);
        let value_scalar = JavaScript.valueToCode(block, 'Scalar', JavaScript.ORDER_ATOMIC);

        let code = `(() => verb.core.Vec.mul(${value_scalar}, ${value_vector}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}