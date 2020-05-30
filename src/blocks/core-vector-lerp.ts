import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorLerpBlock() {

    Blocks['core_vector_lerp'] = {
        init: function () {
            this.appendValueInput("Fraction")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("Point at parameter");
            this.appendValueInput("First")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("in between vector");
            this.appendValueInput("Second")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("and vector");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Find point that is between two vectors.");
            this.setHelpUrl("");
        }
    };

    JavaScript['core_vector_lerp'] = function (block) {
        var value_fraction = JavaScript.valueToCode(block, 'Fraction', JavaScript.ORDER_ATOMIC);
        var value_first = JavaScript.valueToCode(block, 'First', JavaScript.ORDER_ATOMIC);
        var value_second = JavaScript.valueToCode(block, 'Second', JavaScript.ORDER_ATOMIC);

        var code = `(() => verb.core.Vec.lerp(${value_fraction}, ${value_first}, ${value_second}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}