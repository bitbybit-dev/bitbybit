import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createLineConvertToNurbsCurveBlock() {

    Blocks['base_geometry_line_convert_to_nurbs_curve'] = {
        init: function () {
            this.appendValueInput("Line")
                .setCheck("Line")
                .setAlign(ALIGN_RIGHT)
                .appendField("Convert to nurbs curve the line");
            this.setOutput(true, "NurbsCurve");
            this.setColour("#fff");
            this.setTooltip("Converts the line to nurbs curve.");
        }
    };

    JavaScript['base_geometry_line_convert_to_nurbs_curve'] = function (block) {
        let value_line = JavaScript.valueToCode(block, 'Line', JavaScript.ORDER_ATOMIC);

        let code = `(() => new verb.geom.Line(${value_line}.start, ${value_line}.end))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}