import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createPolylineReverseBlock() {

    Blocks['base_geometry_polyline_reverse'] = {
        init: function () {
            this.appendValueInput("Polyline")
                .setCheck("Polyline")
                .setAlign(ALIGN_RIGHT)
                .appendField("Reverse the polyline");
            this.setOutput(true, "Polyline");
            this.setColour("#fff");
            this.setTooltip("Reverses the polyline.");
            this.setHelpUrl("");
        }
    };

    JavaScript['base_geometry_polyline_reverse'] = function (block) {
        let value_polyline = JavaScript.valueToCode(block, 'Polyline', JavaScript.ORDER_ATOMIC);

        let code = `{points: ${value_polyline}.points.reverse()}`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}