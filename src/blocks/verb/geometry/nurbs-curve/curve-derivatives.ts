import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveDerivativesBlock() {

    Blocks['verb_geometry_nurbs_curve_derivatives'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Derivatives of the curve");
            this.appendValueInput("Parameter")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("at parameter");            
            this.appendValueInput("NumDerivatives")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("and number of derivatives");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Gets the derivatives of the curve at parameter in specified amount.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_geometry_nurbs_curve_derivatives'] = function (block) {
        let value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);
        let value_parameter = JavaScript.valueToCode(block, 'Parameter', JavaScript.ORDER_ATOMIC);
        let value_num_derivatives = JavaScript.valueToCode(block, 'NumDerivatives', JavaScript.ORDER_ATOMIC);

        let code = `
(() => ${value_curve}.derivatives(${value_parameter}, ${value_num_derivatives}))()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}