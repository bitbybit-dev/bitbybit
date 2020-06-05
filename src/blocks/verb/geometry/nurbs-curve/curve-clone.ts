import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveCloneBlock() {

    Blocks['verb_geometry_nurbs_curve_clone'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Clone the curve");
            this.setOutput(true, "NurbsCurve");
            this.setColour("#fff");
            this.setTooltip("Clone the curve.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_geometry_nurbs_curve_clone'] = function (block) {
        let value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);

        let code = `
(() => ${value_curve}.clone())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}