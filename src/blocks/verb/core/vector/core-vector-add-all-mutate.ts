import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorAddAllMutateBlock() {

    Blocks['verb_core_vector_add_all_mutate'] = {
        init: function () {
            this.appendValueInput("Vector")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Mutate by adding elements in lists");
            this.setColour("#fff");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip("Mutates the elemnts in a list by adding first list to all other lists elements.");
            this.setHelpUrl("https://github.com/pboyer/verb/blob/master/src/verb/core/Vec.hx/#L151");
        }
    };

    JavaScript['verb_core_vector_add_all_mutate'] = function (block) {
        let value_vector = JavaScript.valueToCode(block, 'Vector', JavaScript.ORDER_ATOMIC);

        let code = `verb.core.Vec.addAllMutate(${value_vector});`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}