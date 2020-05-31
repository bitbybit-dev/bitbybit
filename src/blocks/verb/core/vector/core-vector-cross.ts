import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorCrossBlock() {

    Blocks['verb_core_vector_cross'] = {
        init: function () {
            this.appendValueInput("First")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("Cross vector");
            this.appendValueInput("Second")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("with vector");
            this.setOutput(true, "Vector3");
            this.setColour("#fff");
            this.setTooltip("Crosses two vectors.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_vector_cross'] = function (block) {
        var value_first = JavaScript.valueToCode(block, 'First', JavaScript.ORDER_ATOMIC);
        var value_second = JavaScript.valueToCode(block, 'Second', JavaScript.ORDER_ATOMIC);

        var code = `(() => verb.core.Vec.cross(${value_first}, ${value_second}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}