import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createPolylineGetPointsCountBlock() {

    Blocks['functions_polyline_get_points_count'] = {
        init: function () {
            this.appendValueInput("Polyline")
                .setCheck("Polyline")
                .setAlign(ALIGN_RIGHT)
                .appendField("Point count of the polyline");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Gets the point count of the polyline.");
            this.setHelpUrl("");
        }
    };

    JavaScript['functions_polyline_get_points_count'] = function (block) {
        var value_polyline = JavaScript.valueToCode(block, 'Polyline', JavaScript.ORDER_ATOMIC);

        var code = `${value_polyline}.points.length`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}