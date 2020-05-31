import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createPointDistanceBlock() {

    Blocks['base_geometry_point_distance'] = {
        init: function () {
            this.appendValueInput("start_point")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Distance between first point");
            this.appendValueInput("end_point")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("and second point");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Measures a distance between two points.");
            this.setHelpUrl("");
        }
    };

    JavaScript['base_geometry_point_distance'] = function (block) {
        var value_start_point = JavaScript.valueToCode(block, 'start_point', JavaScript.ORDER_ATOMIC);
        var value_end_point = JavaScript.valueToCode(block, 'end_point', JavaScript.ORDER_ATOMIC);
        
        var code = `(() => verb.core.Vec.dist(${value_start_point}, ${value_end_point}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}