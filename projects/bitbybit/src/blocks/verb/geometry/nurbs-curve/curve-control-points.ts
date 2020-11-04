import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveControlPointsBlock() {

    Blocks['verb_geometry_nurbs_curve_control_points'] = {
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

    JavaScript['verb_geometry_nurbs_curve_control_points'] = function (block) {
        let value_curve = (JavaScript as any).valueToCode(block, 'Curve', (JavaScript as any).ORDER_ATOMIC);

        let code = `
(() => ${value_curve}.controlPoints())()
`;
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}