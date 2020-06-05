import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceReverseBlock() {

    Blocks['verb_geometry_nurbs_surface_reverse'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("Reverse the curve parametrization on surface");
            this.appendValueInput("UseV")
                .setCheck("Boolean")
                .setAlign(ALIGN_RIGHT)
                .appendField("and use v");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Reverse the parametrization of the surface curve.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_reverse'] = function (block) {
        let value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);
        let value_use_v = JavaScript.valueToCode(block, 'UseV', JavaScript.ORDER_ATOMIC);

        let code = `
(() => ${value_surface}.reverse(${value_use_v}))()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}