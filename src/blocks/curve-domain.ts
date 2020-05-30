import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveDomainBlock() {

    Blocks['functions_curve_domain'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Domain of the curve");
            this.setOutput(true, "Interval");
            this.setColour("#fff");
            this.setTooltip("Get domain of the curve.");
            this.setHelpUrl("");
        }
    };

    JavaScript['functions_curve_domain'] = function (block) {
        var value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);

        var code = `
(() => ${value_curve}.domain())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}