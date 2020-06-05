import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createPolylineGetPointsCountBlock() {

    Blocks['base_geometry_polyline_points_count'] = {
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

    JavaScript['base_geometry_polyline_points_count'] = function (block) {
        let value_polyline = JavaScript.valueToCode(block, 'Polyline', JavaScript.ORDER_ATOMIC);

        let code = `${value_polyline}.points.length`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}