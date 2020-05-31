import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveSplitBlock() {

    Blocks['verb_geometry_nurbs_curve_split'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Split the curve");
            this.appendValueInput("Number")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("at parameter");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Split the curve into two parts.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_geometry_nurbs_curve_split'] = function (block) {
        var value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);
        var value_param = JavaScript.valueToCode(block, 'Number', JavaScript.ORDER_ATOMIC);

        var code = `
(() => {
    var crv = ${value_curve};
    return crv.split(${value_param});
})()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}