import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveClosestParamsBlock() {

    Blocks['verb_geometry_nurbs_curve_closest_params'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Curve");
            this.appendValueInput("Points")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("closest parameters to points");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Find closest parameters on curve for the list of points.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_geometry_nurbs_curve_closest_params'] = function (block) {
        let value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);
        let value_points = JavaScript.valueToCode(block, 'Points', JavaScript.ORDER_ATOMIC);

        let code = `
(() => {
    let crv = ${value_curve};
    return ${value_points}.map(p => crv.closestParam(p)) ;
})()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}