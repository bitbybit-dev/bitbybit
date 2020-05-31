import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveControlPointsBlock() {

    Blocks['verb_curve_control_points'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Control points of the curve");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Get control points of the curve.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_curve_control_points'] = function (block) {
        var value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);

        var code = `
(() => ${value_curve}.controlPoints())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}