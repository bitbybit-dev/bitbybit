import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceWeightsBlock() {

    Blocks['verb_geometry_nurbs_surface_weights'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("Weights of the surface");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Get the two dimensional array of weights for surface.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_weights'] = function (block) {
        let value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);

        let code = `
(() => ${value_surface}.weights())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}