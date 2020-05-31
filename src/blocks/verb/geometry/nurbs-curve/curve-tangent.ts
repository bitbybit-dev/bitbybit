import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveTangentBlock() {

    Blocks['verb_curve_tangent'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Tanget of the curve");
            this.appendValueInput("Parameter")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("at parameter");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Get tangent vector of the curve at a given parameter.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_curve_tangent'] = function (block) {
        var value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);
        var value_parameter = JavaScript.valueToCode(block, 'Parameter', JavaScript.ORDER_ATOMIC);

        var code = `
(() => ${value_curve}.tangent(${value_parameter}))()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}