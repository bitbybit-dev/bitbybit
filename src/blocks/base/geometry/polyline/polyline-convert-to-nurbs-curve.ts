import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createPolylineConvertToNurbsCurveBlock() {

    Blocks['base_geometry_polyline_convert_to_nurbs_curve'] = {
        init: function () {
            this.appendValueInput("Polyline")
                .setCheck("Polyline")
                .setAlign(ALIGN_RIGHT)
                .appendField("Convert to nurbs curve the polyline");
            this.setOutput(true, "NurbsCurve");
            this.setColour("#fff");
            this.setTooltip("Gets the points of the polyline.");
            this.setHelpUrl("");
        }
    };

    JavaScript['base_geometry_polyline_convert_to_nurbs_curve'] = function (block) {
        let value_polyline = JavaScript.valueToCode(block, 'Polyline', JavaScript.ORDER_ATOMIC);

        let code = `(() => verb.geom.NurbsCurve.byPoints( ${value_polyline}.points, 1 ))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}