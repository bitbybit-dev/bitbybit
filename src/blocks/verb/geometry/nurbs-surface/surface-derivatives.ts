import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceDerivativesBlock() {

    Blocks['verb_geometry_nurbs_surface_derivatives'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("Derivatives on the surface");
            this.appendValueInput("U")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("at u");
            this.appendValueInput("V")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("at v");
            this.appendValueInput("NumDerivatives")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("number of derivatives");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Get the normal on the surface at uv coordinate.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_derivatives'] = function (block) {
        var value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);
        var value_u = JavaScript.valueToCode(block, 'U', JavaScript.ORDER_ATOMIC);
        var value_v = JavaScript.valueToCode(block, 'V', JavaScript.ORDER_ATOMIC);
        var value_num_derivatives = JavaScript.valueToCode(block, 'NumDerivatives', JavaScript.ORDER_ATOMIC);

        var code = `
(() => ${value_surface}.derivatives(${value_u}, ${value_v}, ${value_num_derivatives}))()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}