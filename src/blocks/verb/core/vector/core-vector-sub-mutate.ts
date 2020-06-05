import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorSubMutateBlock() {

    Blocks['verb_core_vector_sub_mutate'] = {
        init: function () {
            this.appendValueInput("First")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Mutate a list");
            this.appendValueInput("Second")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("by subtracting elements from a list");
            this.setColour("#fff");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip("Mutates the elements in a first list by subtracting elements from the second list. Lists must be of same length.");
            this.setHelpUrl("https://github.com/pboyer/verb/blob/master/src/verb/core/Vec.hx/#L172");
        }
    };

    JavaScript['verb_core_vector_sub_mutate'] = function (block) {
        let value_first = JavaScript.valueToCode(block, 'First', JavaScript.ORDER_ATOMIC);
        let value_second = JavaScript.valueToCode(block, 'Second', JavaScript.ORDER_ATOMIC);

        let code = `verb.core.Vec.subMutate(${value_first}, ${value_second});`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}