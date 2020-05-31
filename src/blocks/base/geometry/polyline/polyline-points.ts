import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createPolylinePointsBlock() {

    Blocks['base_geometry_polyline_points'] = {
        init: function () {
            this.appendValueInput("Polyline")
                .setCheck("Polyline")
                .setAlign(ALIGN_RIGHT)
                .appendField("Points of the polyline");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Gets the points of the polyline.");
            this.setHelpUrl("");
        }
    };

    JavaScript['base_geometry_polyline_points'] = function (block) {
        var value_polyline = JavaScript.valueToCode(block, 'Polyline', JavaScript.ORDER_ATOMIC);

        var code = `${value_polyline}.points`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}