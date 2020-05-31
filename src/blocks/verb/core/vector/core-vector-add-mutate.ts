import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorAddMutateBlock() {

    Blocks['verb_core_vector_add_mutate'] = {
        init: function () {
            this.appendValueInput("First")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Mutate a list");
            this.appendValueInput("Second")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("by adding elements from a list");
            this.setColour("#fff");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip("Mutates the elements in a first list by adding elements from the second list. Lists must be of same length.");
            this.setHelpUrl("https://github.com/pboyer/verb/blob/master/src/verb/core/Vec.hx/#L167");
        }
    };

    JavaScript['verb_core_vector_add_mutate'] = function (block) {
        var value_first = JavaScript.valueToCode(block, 'First', JavaScript.ORDER_ATOMIC);
        var value_second = JavaScript.valueToCode(block, 'Second', JavaScript.ORDER_ATOMIC);

        var code = `verb.core.Vec.addMutate(${value_first}, ${value_second});`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}