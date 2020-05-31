import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveDivideByEqualArcLengthParamsBlock() {

    Blocks['functions_curve_divide_by_equal_arc_length_params'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Divide the curve to params");
            this.appendValueInput("Subdivision")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("by equal arc length");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Divide curve by equal arc length to parameters.");
            this.setHelpUrl("");
        }
    };

    JavaScript['functions_curve_divide_by_equal_arc_length_params'] = function (block) {
        var value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);
        var value_subdivision = JavaScript.valueToCode(block, 'Subdivision', JavaScript.ORDER_ATOMIC);

        var code = `
(() => {
    var crv = ${value_curve};
    var segments = crv.divideByEqualArcLength(${value_subdivision});
    var points = [];
    segments.forEach(s => {
        points.push(crv.point( s.u ));
    });
    return points;
})()
        `;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}