import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveParamAtLengthBlock() {

    Blocks['verb_geometry_nurbs_curve_param_at_length'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Param of the curve");
            this.appendValueInput("Length")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("at length");
            this.appendValueInput("Tolerance")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("with tolerance");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Length of the curve at parameter.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_geometry_nurbs_curve_param_at_length'] = function (block) {
        var value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);
        var value_length = JavaScript.valueToCode(block, 'Length', JavaScript.ORDER_ATOMIC);
        var value_tolerance = JavaScript.valueToCode(block, 'Tolerance', JavaScript.ORDER_ATOMIC);

        var code = `
(() => {
    return ${value_curve}.paramAtLength(${value_length}, ${value_tolerance});
})()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}