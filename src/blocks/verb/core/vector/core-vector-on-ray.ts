import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorOnRayBlock() {

    Blocks['verb_core_vector_on_ray'] = {
        init: function () {
            this.appendValueInput("Point")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("Move point");
            this.appendValueInput("Vector")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("along direction vector");
            this.appendValueInput("Distance")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("by distance");
            this.setOutput(true, "Vector3");
            this.setColour("#fff");
            this.setTooltip("Moves point along vector by distance.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_vector_on_ray'] = function (block) {
        var value_point = JavaScript.valueToCode(block, 'Point', JavaScript.ORDER_ATOMIC);
        var value_vector = JavaScript.valueToCode(block, 'Vector', JavaScript.ORDER_ATOMIC);
        var value_distance = JavaScript.valueToCode(block, 'Distance', JavaScript.ORDER_ATOMIC);

        var code = `(() => verb.core.Vec.onRay(${value_point}, ${value_vector}, ${value_distance}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}