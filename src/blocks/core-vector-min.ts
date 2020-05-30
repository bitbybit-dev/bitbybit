import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorMinBlock() {

    Blocks['core_vector_min'] = {
        init: function () {
            this.appendValueInput("Vector")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Minimum value in the vector");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Finds minimum value in the vector.");
            this.setHelpUrl("");
        }
    };

    JavaScript['core_vector_min'] = function (block) {
        var value_vector = JavaScript.valueToCode(block, 'Vector', JavaScript.ORDER_ATOMIC);
        
        var code = `(() => verb.core.Vec.min(${value_vector}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}