import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveClosestParamBlock() {

    Blocks['verb_geometry_nurbs_curve_closest_param'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Curve");
            this.appendValueInput("Point")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("closest parameter to point");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Find the closest parameter on curve.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_geometry_nurbs_curve_closest_param'] = function (block) {
        let value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);
        let value_point = JavaScript.valueToCode(block, 'Point', JavaScript.ORDER_ATOMIC);

        let code = `
(() => {
    let crv = ${value_curve};
    return crv.closestParam(${value_point});
})()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}