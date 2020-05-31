import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorAngleBetweenNormalized2dBlock() {

    Blocks['verb_core_vector_angle_between_normalized_2d'] = {
        init: function () {
            this.appendValueInput("First")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Normalized 2d angle between first vector");
            this.appendValueInput("Second")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("and a second vector");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Measures normalized 2d angle between two vectors.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_vector_angle_between_normalized_2d'] = function (block) {
        var value_first = JavaScript.valueToCode(block, 'First', JavaScript.ORDER_ATOMIC);
        var value_second = JavaScript.valueToCode(block, 'Second', JavaScript.ORDER_ATOMIC);
        
        var code = `(() => verb.core.Vec.angleBetweenNormalized2d(${value_first}, ${value_second}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}