import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorAddAllBlock() {

    Blocks['verb_core_vector_add_all'] = {
        init: function () {
            this.appendValueInput("Vector")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Add elements in lists");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Adds all elements in multiple lists and returns a list with results.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_vector_add_all'] = function (block) {
        let value_vector = JavaScript.valueToCode(block, 'Vector', JavaScript.ORDER_ATOMIC);

        let code = `(() => verb.core.Vec.addAll(${value_vector}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}