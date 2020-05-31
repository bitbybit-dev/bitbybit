import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorAllBlock() {

    Blocks['core_vector_all'] = {
        init: function () {
            this.appendValueInput("Vector")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Check all bools");
            this.setOutput(true, "Boolean");
            this.setColour("#fff");
            this.setTooltip("If at least one false in array returns false.");
            this.setHelpUrl("");
        }
    };

    JavaScript['core_vector_all'] = function (block) {
        var value_vector = JavaScript.valueToCode(block, 'Vector', JavaScript.ORDER_ATOMIC);

        var code = `(() => verb.core.Vec.all(${value_vector}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}