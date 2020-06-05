import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorAddBlock() {

    Blocks['verb_core_vector_add'] = {
        init: function () {
            this.appendValueInput("First")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Add vector");
            this.appendValueInput("Second")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("with vector");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Adds two vectors together.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_vector_add'] = function (block) {
        let value_first = JavaScript.valueToCode(block, 'First', JavaScript.ORDER_ATOMIC);
        let value_second = JavaScript.valueToCode(block, 'Second', JavaScript.ORDER_ATOMIC);

        let code = `(() => verb.core.Vec.add(${value_first}, ${value_second}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}