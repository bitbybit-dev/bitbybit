import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createInterpolatedCurveBlock() {

    Blocks['geometry_interpolated_curve'] = {
        init: function () {
            this.appendValueInput("Points")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Curve through points");
            this.appendValueInput("Degree")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("of degree");
            this.setOutput(true, "NurbsCurve");
            this.setColour("#fff");
            this.setTooltip("Interpolates a curve through points");
            this.setHelpUrl("");
        }
    };

    JavaScript['geometry_interpolated_curve'] = function (block) {
        var value_points = JavaScript.valueToCode(block, 'Points', JavaScript.ORDER_ATOMIC);
        var value_degree = JavaScript.valueToCode(block, 'Degree', JavaScript.ORDER_ATOMIC);

        var code = `(() => verb.geom.NurbsCurve.byPoints( ${value_points}, ${value_degree} ))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}