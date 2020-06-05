import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorDivBlock() {

    Blocks['verb_core_vector_div'] = {
        init: function () {
            this.appendValueInput("Vector")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Divide vector");
            this.appendValueInput("Scalar")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("by a scalar");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Divides a vector by a scalar.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_vector_div'] = function (block) {
        let value_vector = JavaScript.valueToCode(block, 'Vector', JavaScript.ORDER_ATOMIC);
        let value_scalar = JavaScript.valueToCode(block, 'Scalar', JavaScript.ORDER_ATOMIC);

        let code = `(() => verb.core.Vec.div(${value_vector}, ${value_scalar}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}