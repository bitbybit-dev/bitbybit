import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveReverseBlock() {

    Blocks['verb_geometry_nurbs_curve_reverse'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Reverse the curve");
            this.setOutput(true, "NurbsCurve");
            this.setColour("#fff");
            this.setTooltip("Reverses the curve direction.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_geometry_nurbs_curve_reverse'] = function (block) {
        var value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);

        var code = `
(() => ${value_curve}.reverse())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}