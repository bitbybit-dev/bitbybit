import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceIsocurveBlock() {

    Blocks['verb_geometry_nurbs_surface_isocurve'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("Isocurve on the surface");
            this.appendValueInput("Param")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("at parameter");
            this.appendValueInput("UseV")
                .setCheck("Boolean")
                .setAlign(ALIGN_RIGHT)
                .appendField("interpret parameter as v");
            this.setOutput(true, "NurbsCurve");
            this.setColour("#fff");
            this.setTooltip("Isocurve on the surface at parameter U or V, depending on the users choice.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_isocurve'] = function (block) {
        let value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);
        let value_param = JavaScript.valueToCode(block, 'Param', JavaScript.ORDER_ATOMIC);
        let value_use_v = JavaScript.valueToCode(block, 'UseV', JavaScript.ORDER_ATOMIC);

        let code = `
(() => ${value_surface}.isocurve(${value_param}, ${value_use_v}))()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}