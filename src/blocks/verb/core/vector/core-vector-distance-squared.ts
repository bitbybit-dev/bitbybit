import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorDistanceSquaredBlock() {

    Blocks['verb_core_vector_distance_squared'] = {
        init: function () {
            this.appendValueInput("First")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("Squared distance between vector");
            this.appendValueInput("Second")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("and a vector");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Measures a squared distance between two vectors.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_vector_distance_squared'] = function (block) {
        var value_first = JavaScript.valueToCode(block, 'First', JavaScript.ORDER_ATOMIC);
        var value_second = JavaScript.valueToCode(block, 'Second', JavaScript.ORDER_ATOMIC);
        
        var code = `(() => verb.core.Vec.distSquared(${value_first}, ${value_second}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}