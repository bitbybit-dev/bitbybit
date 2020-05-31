import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveLengthAtParamBlock() {

    Blocks['functions_curve_length_at_param'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Length of the curve");
            this.appendValueInput("Number")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("at parameter");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Length of the curve at parameter.");
            this.setHelpUrl("");
        }
    };

    JavaScript['functions_curve_length_at_param'] = function (block) {
        var value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);
        var value_param = JavaScript.valueToCode(block, 'Number', JavaScript.ORDER_ATOMIC);

        var code = `
(() => {
    return ${value_curve}.lengthAtParam(${value_param});
})()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}