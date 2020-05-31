import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveDegreeBlock() {

    Blocks['verb_curve_degree'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Degree of the curve");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Get degree of the curve.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_curve_degree'] = function (block) {
        var value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);

        var code = `
(() => ${value_curve}.degree())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}