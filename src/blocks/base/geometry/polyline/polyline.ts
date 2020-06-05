import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createPolylineBlock() {

    Blocks['base_geometry_polyline'] = {
        init: function () {
            this.appendValueInput("points")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Polyline with points");
            this.setOutput(true, "Polyline");
            this.setColour("#fff");
            this.setTooltip("Constructs a Polyline object from points");
            this.setHelpUrl("");
        }
    };

    JavaScript['base_geometry_polyline'] = function (block) {
        let value_points = JavaScript.valueToCode(block, 'points', JavaScript.ORDER_ATOMIC);

        let code = `{points: ${value_points}}`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}