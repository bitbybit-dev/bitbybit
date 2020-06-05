import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveWeightsBlock() {

    Blocks['verb_geometry_nurbs_curve_weights'] = {
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

    JavaScript['verb_geometry_nurbs_curve_weights'] = function (block) {
        let value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);

        let code = `
(() => ${value_curve}.weights())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}