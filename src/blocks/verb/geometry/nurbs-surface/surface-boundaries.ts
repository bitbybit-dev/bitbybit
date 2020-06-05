import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceBoundariesBlock() {

    Blocks['verb_geometry_nurbs_surface_boundaries'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("Boundaries of the surface");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("4 Boundary curves of the surface.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_boundaries'] = function (block) {
        let value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);

        let code = `
(() => ${value_surface}.boundaries())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}