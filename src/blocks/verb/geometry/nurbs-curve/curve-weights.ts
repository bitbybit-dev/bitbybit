import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveWeightsBlock() {

    Blocks['functions_curve_weights'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Weights of the curve");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Get weights of the curve.");
            this.setHelpUrl("");
        }
    };

    JavaScript['functions_curve_weights'] = function (block) {
        var value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);

        var code = `
(() => ${value_curve}.weights())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}