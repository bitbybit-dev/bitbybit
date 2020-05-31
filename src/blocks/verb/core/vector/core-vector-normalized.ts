import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorNormalizedBlock() {

    Blocks['core_vector_normalized'] = {
        init: function () {
            this.appendValueInput("Vector")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("Normalize vector");
            this.setOutput(true, "Vector3");
            this.setColour("#fff");
            this.setTooltip("Normalizes vector to unit vector that has length equal to 1.");
            this.setHelpUrl("");
        }
    };

    JavaScript['core_vector_normalized'] = function (block) {
        var value_vector = JavaScript.valueToCode(block, 'Vector', JavaScript.ORDER_ATOMIC);

        var code = `(() => verb.core.Vec.normalized(${value_vector}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}