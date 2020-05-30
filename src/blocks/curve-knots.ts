import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveKnotsBlock() {

    Blocks['functions_curve_knots'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Knots of the curve");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Get knots of the curve.");
            this.setHelpUrl("");
        }
    };

    JavaScript['functions_curve_knots'] = function (block) {
        var value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);

        var code = `
(() => ${value_curve}.knots())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}