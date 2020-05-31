import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveTesselateBlock() {

    Blocks['verb_geometry_nurbs_curve_tesselate'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Tesselate the curve");
            this.appendValueInput("Tolerance")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("with tolerance");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Tesselates the curve at a given tolerance to an array of points.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_geometry_nurbs_curve_tesselate'] = function (block) {
        var value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);
        var value_tolerance = JavaScript.valueToCode(block, 'Tolerance', JavaScript.ORDER_ATOMIC);

        var code = `
(() => ${value_curve}.tesselate(${value_tolerance}))()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}