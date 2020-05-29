import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveClosestPointBlock() {

    Blocks['functions_curve_closest_point'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Curve");
            this.appendValueInput("Point")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("closest point");
            this.setOutput(true, "Vector3");
            this.setColour("#fff");
            this.setTooltip("Find the closest point on curve.");
            this.setHelpUrl("");
        }
    };

    JavaScript['functions_curve_closest_point'] = function (block) {
        var value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);
        var value_point = JavaScript.valueToCode(block, 'Point', JavaScript.ORDER_ATOMIC);

        var code = `
(() => {
    var crv = ${value_curve};
    return crv.closestPoint(${value_point});
})()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}