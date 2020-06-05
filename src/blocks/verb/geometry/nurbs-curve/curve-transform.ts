import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveTransformBlock() {

    Blocks['verb_geometry_nurbs_curve_transform'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Transform the curve");
            this.appendValueInput("Matrix")
                .setCheck("Matrix")
                .setAlign(ALIGN_RIGHT)
                .appendField("with matrix");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Transforms the curve by transformation matrix (translation, rotation, scale...).");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_geometry_nurbs_curve_transform'] = function (block) {
        let value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);
        let value_matrix = JavaScript.valueToCode(block, 'Matrix', JavaScript.ORDER_ATOMIC);

        let code = `
(() => ${value_curve}.transform(${value_matrix}))()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}