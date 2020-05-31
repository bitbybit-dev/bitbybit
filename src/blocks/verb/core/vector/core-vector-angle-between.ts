import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorAngleBetweenBlock() {

    Blocks['verb_core_vector_angle_between'] = {
        init: function () {
            this.appendValueInput("First")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("Angle between first vector");
            this.appendValueInput("Second")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("and a second vector");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Measures an angle between two vectors.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_vector_angle_between'] = function (block) {
        var value_first = JavaScript.valueToCode(block, 'First', JavaScript.ORDER_ATOMIC);
        var value_second = JavaScript.valueToCode(block, 'Second', JavaScript.ORDER_ATOMIC);
        
        var code = `(() => verb.core.Vec.angleBetween(${value_first}, ${value_second}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}