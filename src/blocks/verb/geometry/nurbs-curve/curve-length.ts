import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveLengthBlock() {

    Blocks['verb_geometry_nurbs_curve_length'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Length of curve");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Get length of the curve.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_geometry_nurbs_curve_length'] = function (block) {
        let value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);

        let code = `
(() => ${value_curve}.length())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}