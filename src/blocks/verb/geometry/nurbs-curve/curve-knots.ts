import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveKnotsBlock() {

    Blocks['verb_geometry_nurbs_curve_knots'] = {
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

    JavaScript['verb_geometry_nurbs_curve_knots'] = function (block) {
        let value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);

        let code = `
(() => ${value_curve}.knots())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}