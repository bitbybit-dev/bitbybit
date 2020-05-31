import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveDivideByEqualArcLengthPointsBlock() {

    Blocks['verb_geometry_nurbs_curve_divide_by_equal_arc_length_points'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Divide the curve to points");
            this.appendValueInput("Subdivision")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("by equal arc length");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Divide curve by equal arc length to points.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_geometry_nurbs_curve_divide_by_equal_arc_length_points'] = function (block) {
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